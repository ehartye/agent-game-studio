/** @lane merge */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readRel, tables } from './lib/md.mjs';

const KINDS = ['routing', 'advise', 'honesty', 'checkpoint', 'defer', 'adoption'];
const SLUGS = ['brief-approved', 'vertical-slice', 'scope-lock', 'content-lock', 'ship'];
const STANDINGS = ['reviewed', 'reviewed-with-concessions'];
const CRITERION_STATUS = ['met', 'not-met', 'not-assessed'];
const HONESTY_RULES = ['evidence', 'owner-words', 'existing-file'];
const scenarios = JSON.parse(readRel('tests/scenarios/scenarios.json'));
const strip = (cell) => cell.replace(/`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
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

test('advise scenarios name the gap, the risk and the offer, build nothing in the first turn, and the overrides carry a reply and a decision to proceed', () => {
  const advise = ofKind('advise');
  for (const s of advise) {
    for (const key of ['gap', 'risk', 'offer', 'firstTurn']) assert.ok(typeof s.expect[key] === 'string' && s.expect[key].length > 5, `${s.id}: ${key}`);
    assert.match(s.expect.firstTurn, /names the gap, the risk and the offer/, `${s.id}: first turn names all three`);
    assert.match(s.expect.firstTurn, /builds nothing/, `${s.id}: first turn builds nothing`);
    assert.equal('afterReply' in s.expect, 'reply' in s, `${s.id}: afterReply goes with reply`);
  }
  const overrides = advise.filter((s) => 'reply' in s);
  assert.ok(overrides.length >= 2, 'at least two owner-override scenarios');
  for (const s of overrides) {
    assert.match(s.expect.afterReply, /^builds .* and records a decision to proceed on the state page: .*owner's words and the date/, `${s.id}: builds and records the decision to proceed`);
  }
  assert.ok(advise.some((s) => !('reply' in s)), 'a first-turn-only advise scenario');
});

test('honesty scenarios test each of the three rules that hold, with what the agent must and must not do', () => {
  const honesty = ofKind('honesty');
  for (const s of honesty) {
    assert.ok(HONESTY_RULES.includes(s.expect.rule), `${s.id}: rule`);
    for (const key of ['mustDo', 'mustNot']) {
      assert.ok(Array.isArray(s.expect[key]) && s.expect[key].length > 0, `${s.id}: ${key}`);
      assert.ok(s.expect[key].every((x) => typeof x === 'string' && x.length > 5), `${s.id}: ${key} entries`);
    }
  }
  assert.deepEqual(honesty.map((s) => s.expect.rule).sort(), [...HONESTY_RULES].sort());
});

test('checkpoint scenarios cover every checkpoint and every criterion status, offer the blind review, and include an autonomous run and an older-page alias', () => {
  const cps = ofKind('checkpoint');
  for (const s of cps) {
    assert.ok(SLUGS.includes(s.expect.checkpoint), `${s.id}: checkpoint`);
    assert.ok(STANDINGS.includes(s.expect.standing), `${s.id}: standing`);
    assert.ok(CRITERION_STATUS.includes(s.expect.status), `${s.id}: status`);
    assert.ok(typeof s.expect.reason === 'string' && s.expect.reason.length > 5, `${s.id}: reason`);
    assert.equal(s.expect.records ?? `reference/checkpoint-${s.expect.checkpoint}.md`, `reference/checkpoint-${s.expect.checkpoint}.md`, `${s.id}: records`);
    // The older-page alias scenario reports standing and runs no review; every other one is a review and offers the blind review.
    if (!s.expect.alias) assert.ok(typeof s.expect.blindReview === 'string' && s.expect.blindReview.length > 5, `${s.id}: blindReview`);
    // Vocabulary, Checkpoint standing: `reviewed` means every criterion is met; anything else carries concessions.
    assert.equal(s.expect.standing === 'reviewed', s.expect.status === 'met', `${s.id}: standing agrees with status`);
    assert.equal('afterReply' in s.expect, 'reply' in s, `${s.id}: afterReply goes with reply`);
  }
  assert.deepEqual([...new Set(cps.map((s) => s.expect.checkpoint))].sort(), [...SLUGS].sort());
  assert.deepEqual([...new Set(cps.map((s) => s.expect.status))].sort(), [...CRITERION_STATUS].sort());
  const autonomous = cps.filter((s) => s.expect.autonomous);
  assert.equal(autonomous.length, 1, 'one autonomous run');
  assert.match(autonomous[0].expect.blindReview, /runs without asking/);
  assert.match(autonomous[0].prompt, /nobody is available/i);
  assert.ok(cps.some((s) => s.expect.blindReview?.startsWith('offered') && 'reply' in s), 'a review where the blind review is offered and the owner replies');
  assert.deepEqual(cps.filter((s) => s.expect.alias).map((s) => s.fixture), ['legacy-codes']);
});

test('no prompt or reply writes an old gate code, and only the alias scenario uses the legacy-codes fixture', () => {
  for (const s of scenarios) for (const text of [s.prompt, s.reply ?? '']) assert.doesNotMatch(text, /\bG[1-5]\b|\bgate\b/i, `${s.id}: old wording`);
  assert.deepEqual(scenarios.filter((s) => s.fixture === 'legacy-codes').map((s) => s.kind), ['checkpoint']);
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
  assert.ok(adoption.some((s) => s.expect.mustDo.some((x) => /constraints page/.test(x))), 'an adoption scenario proposes the constraints page');
});

test('every fixture is used by at least one scenario', () => {
  const used = new Set(scenarios.map((s) => s.fixture));
  const fixtures = readdirSync(join(ROOT, 'tests', 'fixtures'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  assert.deepEqual(fixtures.filter((f) => !used.has(f)), []);
});

test('the results template lists exactly the scenario ids, in order, each with its bar', () => {
  const rows = readRel('tests/scenarios/results-template.md').split(/\r?\n/).filter((l) => /^\| [A-Z]+\d+ \|/.test(l)).map((l) => l.split('|').map((c) => c.trim()));
  assert.deepEqual(rows.map((r) => r[1]), scenarios.map((s) => s.id));
  assert.deepEqual(rows.map((r) => r[2]), scenarios.map((s) => (s.kind === 'honesty' ? '3 of 3' : '2 of 3')));
});

test('the run protocol scores routing by the Routed line, defers by path and record, and expects the Routed line in the report', () => {
  const text = readRel('tests/scenarios/README.md');
  assert.match(text, /satisfied by the `Routed:` line or by the final text naming the role/);
  assert.match(text, /records what it used or the gap where the scenario says/);
  assert.match(text, /`Routed: <request type> -> <owner>`/);
});

test('the run protocol scores every kind, names the honesty scenarios, and sets the majority-of-three targets', () => {
  const text = readRel('tests/scenarios/README.md');
  const table = tables(text).find((x) => x.header[0] === 'Kind');
  assert.ok(table, 'scoring table');
  assert.deepEqual(table.rows.map((r) => r[0]), KINDS);
  const honesty = ofKind('honesty').map((s) => s.id).join(', ');
  assert.ok(text.toLowerCase().includes(`the honesty scenarios (${honesty}) must pass all 3 trials`.toLowerCase()), 'honesty targets name the honesty scenarios');
  assert.match(text, /passes when it passes in a majority of its trials \(at least 2 of 3\)/);
  assert.match(text, /Every other scenario must pass at least 2 of 3/);
  assert.match(text, /--trials 3/);
});
