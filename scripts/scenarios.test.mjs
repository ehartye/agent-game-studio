/** @lane merge @risk standard */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, readRel } from './lib/md.mjs';

const scenarios = JSON.parse(readRel('tests/scenarios/scenarios.json'));
const coverage = ['small-change', 'missing-docs', 'build-anyway', 'delegation', 'iterative-debugging', 'optional-boilerplate', 'wiki-state', 'wiki-maintenance', 'evidence', 'approval-records', 'review-advice'];

test('scenarios specify concrete actions and prohibited behavior in existing scratch fixtures', () => {
  const ids = new Set();
  for (const scenario of scenarios) {
    assert.match(scenario.id, /^[A-Z]+\d+$/);
    assert.ok(!ids.has(scenario.id), `duplicate ${scenario.id}`);
    ids.add(scenario.id);
    assert.ok(['autonomy', 'honesty', 'role'].includes(scenario.kind), scenario.id);
    assert.ok(scenario.prompt.length > 20, scenario.id);
    assert.ok(existsSync(join(ROOT, 'tests/fixtures', scenario.fixture)), scenario.id);
    for (const key of ['mustDo', 'mustNot']) {
      assert.ok(Array.isArray(scenario.expect[key]) && scenario.expect[key].length > 0, `${scenario.id}: ${key}`);
      assert.ok(scenario.expect[key].every((item) => typeof item === 'string' && item.length > 15), `${scenario.id}: concrete ${key}`);
    }
  }
});

test('regressions cover autonomy, optional instructions, wiki-only state and honest evidence', () => {
  assert.deepEqual(scenarios.filter((s) => s.coverage).map((s) => s.coverage).sort(), [...coverage].sort());
  for (const label of ['missing-docs', 'wiki-state']) {
    const scenario = scenarios.find((s) => s.coverage === label);
    assert.equal(scenario.fixture, 'greenfield-empty');
    assert.notEqual(scenario.scratchWiki, true, 'unavailable wiki scenarios must not receive a harness-created wiki');
    assert.ok(!existsSync(join(ROOT, 'tests/fixtures', scenario.fixture, 'wiki')));
  }
});

test('consultation scenarios cover all eight skills without requiring document writes', () => {
  const roles = scenarios.filter((s) => s.kind === 'role').map((s) => s.role).sort();
  assert.deepEqual(roles, readdirSync(join(ROOT, 'skills')).sort());
});

test('each fixture is exercised and the result template starts every current trial as not run', () => {
  const fixtures = readdirSync(join(ROOT, 'tests/fixtures'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  assert.deepEqual(fixtures.filter((fixture) => !scenarios.some((s) => s.fixture === fixture)), []);
  const rows = readRel('tests/scenarios/results-template.md').split(/\r?\n/).filter((line) => /^\| [A-Z]+\d+ \|/.test(line));
  assert.deepEqual(rows.map((row) => row.split('|')[1].trim()), scenarios.map((s) => s.id));
  assert.ok(rows.every((row) => row.split('|').slice(2, 5).every((cell) => cell.trim() === 'not run')));
});

// This checks the fixture, not an agent's ability to debug it.
test('iterative-debugging fixture fails initially and passes after the requested correction', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'studio-debug-fixture-'));
  try {
    cpSync(join(ROOT, 'tests/fixtures/stalled-project'), scratch, { recursive: true });
    const run = () => spawnSync(process.execPath, ['verify-patrol.mjs'], { cwd: scratch, encoding: 'utf8' });
    const before = run();
    assert.equal(before.status, 1);
    assert.match(before.stderr, /patrol must be enabled/);
    writeFileSync(join(scratch, 'patrol.txt'), 'enabled\n');
    const after = run();
    assert.equal(after.status, 0, after.stderr);
    assert.match(after.stdout, /Patrol check passed/);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
