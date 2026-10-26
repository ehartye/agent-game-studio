import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readRel, tables } from './lib/md.mjs';

const KINDS = ['routing', 'stop', 'gate', 'defer', 'adoption'];
const scenarios = JSON.parse(readRel('tests/scenarios/scenarios.json'));
const strip = (cell) => cell.replace(/`/g, '');
const routingRows = () => tables(readRel('references/decision-routing.md')).find((t) => t.header[0] === 'Request').rows;
const ofKind = (kind) => scenarios.filter((s) => s.kind === kind);

test('every scenario has an id, a known kind, a prompt, an existing fixture and an expectation', () => {
  const ids = new Set();
  for (const s of scenarios) {
    assert.equal(typeof s.id, 'string');
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`);
    ids.add(s.id);
    assert.ok(KINDS.includes(s.kind), `${s.id}: kind`);
    assert.ok(typeof s.prompt === 'string' && s.prompt.length > 5, `${s.id}: prompt`);
    assert.ok(existsSync(join(ROOT, 'tests', 'fixtures', s.fixture)), `${s.id}: fixture ${s.fixture}`);
    assert.ok(s.expect && typeof s.expect === 'object', `${s.id}: expect`);
    for (const key of ['note', 'reply']) if (key in s) assert.ok(typeof s[key] === 'string' && s[key].length > 5, `${s.id}: ${key}`);
  }
});

test('routing scenarios agree with the routing table and cover every row', () => {
  const rows = routingRows();
  const covered = new Set();
  for (const s of ofKind('routing')) {
    const row = rows.find((r) => r[0] === s.expect.request);
    assert.ok(row, `${s.id}: no routing row "${s.expect.request}"`);
    assert.equal(s.expect.owner, strip(row[1]), `${s.id}: owner`);
    assert.equal(s.expect.then, strip(row[2]), `${s.id}: then`);
    assert.equal(s.expect.readFirst.toLowerCase(), strip(row[3]).toLowerCase(), `${s.id}: readFirst`);
    assert.equal(s.expect.output.toLowerCase(), strip(row[4]).toLowerCase(), `${s.id}: output`);
    covered.add(row[0]);
  }
  assert.deepEqual(rows.map((r) => r[0]).filter((r) => !covered.has(r)), [], 'rows without a scenario');
});

test('stop scenarios name the step and the missing precondition, and cover start, steps 2, 3, 4 and 6', () => {
  const stops = ofKind('stop');
  for (const s of stops) {
    assert.ok(['start', 1, 2, 3, 4, 5, 6, 7, 8].includes(s.expect.stopsAt), `${s.id}: stopsAt`);
    assert.ok(typeof s.expect.missing === 'string' && s.expect.missing.length > 5, `${s.id}: missing`);
  }
  const steps = new Set(stops.map((s) => s.expect.stopsAt));
  for (const need of ['start', 2, 3, 4, 6]) assert.ok(steps.has(need), `a stop scenario at ${need}`);
});

test('gate scenarios cover G1 to G5 and include a gate that is met', () => {
  const gates = ofKind('gate');
  for (const s of gates) {
    assert.ok(['G1', 'G2', 'G3', 'G4', 'G5'].includes(s.expect.gate), `${s.id}: gate`);
    assert.ok(['met', 'unmet'].includes(s.expect.result), `${s.id}: result`);
    assert.ok(typeof s.expect.reason === 'string' && s.expect.reason.length > 5, `${s.id}: reason`);
  }
  assert.deepEqual([...new Set(gates.map((s) => s.expect.gate))].sort(), ['G1', 'G2', 'G3', 'G4', 'G5']);
  assert.ok(gates.some((s) => s.expect.result === 'met'), 'a met gate');
});

test('defer scenarios cover the mapped, fallback and gap paths', () => {
  const defers = ofKind('defer');
  for (const s of defers) {
    assert.ok(['mapped', 'fallback', 'gap'].includes(s.expect.path), `${s.id}: path`);
    assert.ok(s.expect.consult && s.expect.record, `${s.id}: consult and record`);
  }
  assert.deepEqual([...new Set(defers.map((s) => s.expect.path))].sort(), ['fallback', 'gap', 'mapped']);
});

test('adoption scenarios list what the agent must and must not do', () => {
  const adoption = ofKind('adoption');
  assert.ok(adoption.length >= 3, 'at least three adoption scenarios');
  for (const s of adoption) {
    for (const key of ['mustDo', 'mustNot']) {
      assert.ok(Array.isArray(s.expect[key]) && s.expect[key].length > 0, `${s.id}: ${key}`);
      assert.ok(s.expect[key].every((x) => typeof x === 'string' && x.length > 5), `${s.id}: ${key} entries`);
    }
  }
});

test('every fixture is used by at least one scenario', () => {
  const used = new Set(scenarios.map((s) => s.fixture));
  const fixtures = readdirSync(join(ROOT, 'tests', 'fixtures'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  assert.deepEqual(fixtures.filter((f) => !used.has(f)), []);
});

test('the results template lists exactly the scenario ids, in order', () => {
  const rows = readRel('tests/scenarios/results-template.md').split(/\r?\n/).filter((l) => /^\| [A-Z]+\d+ \|/.test(l)).map((l) => l.split('|')[1].trim());
  assert.deepEqual(rows, scenarios.map((s) => s.id));
});

test('the run protocol scores routing by the Routed line, defers by copied guidance, and expects the Routed line in the report', () => {
  const text = readRel('tests/scenarios/README.md');
  assert.match(text, /satisfied by the `Routed:` line or by the final text naming the role/);
  assert.match(text, /copying procedures, commands, thresholds or lists into a project document/);
  assert.match(text, /one-line standard that cites the guidance is allowed/);
  assert.match(text, /`Routed: <request type> -> <owner>`/);
});
