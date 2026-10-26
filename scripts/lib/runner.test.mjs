import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  GENERIC_REPLY,
  assertOutsideRepo,
  buildRun,
  compareVault,
  evaluateVault,
  vaultAttempts,
  vaultDelta,
  vaultSnapshot,
  confineWrites,
  toRulePath,
  vaultGuards,
  isSecretName,
  maskSecrets,
  parseArgs,
  parseTranscript,
  renderSummary,
  replyFor,
  selectScenarios,
} from './runner.mjs';

// Synthetic transcript in the shape the host emits with --output-format stream-json --verbose.
const line = (o) => JSON.stringify(o);
const toolUse = (id, name, input) => ({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'tool_use', id, name, input }] }, session_id: 'sess-1' });
const text = (t) => ({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: t }] }, session_id: 'sess-1' });
const toolResult = (id, content, isError = false) => ({ type: 'user', message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content, is_error: isError }] }, session_id: 'sess-1' });

const transcript = [
  { type: 'system', subtype: 'hook_started', session_id: 'sess-1' },
  { type: 'system', subtype: 'init', session_id: 'sess-1', skills: ['x:one', 'agent-game-studio:game-master', 'agent-game-studio:studio-start', 'agent-game-studio:game-architect'], plugins: [{ name: 'agent-game-studio' }] },
  toolUse('t1', 'Skill', { skill: 'agent-game-studio:studio-start' }),
  toolResult('t1', 'Launching skill'),
  toolUse('t2', 'Read', { file_path: '/p/AGENTS.md' }),
  toolResult('t2', 'ok'),
  toolUse('t3', 'Glob', { pattern: 'wiki/**/*.md' }),
  toolUse('t4', 'Grep', { pattern: 'Phase', path: '/p/wiki' }),
  toolUse('t5', 'Skill', { skill: 'agent-game-studio:game-master', args: '' }),
  toolUse('t6', 'Edit', { file_path: '/p/wiki/state.md', old_string: 'a', new_string: 'b' }),
  toolUse('t7', 'Write', { file_path: '/p/new.md', content: 'x' }),
  toolUse('t8', 'Bash', { command: 'git status --short' }),
  toolResult('t8', "Permission to use Bash with command 'rm -rf x' has been denied.", true),
  { type: 'rate_limit_event' },
  text('Phase: concept\nNext step: x\nBlocked by: nothing'),
  { type: 'result', subtype: 'success', is_error: false, num_turns: 7, total_cost_usd: 0.42, duration_ms: 12345, session_id: 'sess-1', result: 'Phase: concept\nNext step: x\nBlocked by: nothing', permission_denials: [] },
].map(line).join('\n') + '\nnot json\n\n';

test('parseTranscript extracts the session, tool usage in order, final text, cost and turns', () => {
  const t = parseTranscript(transcript);
  assert.equal(t.sessionId, 'sess-1');
  assert.deepEqual(t.skills, ['agent-game-studio:studio-start', 'agent-game-studio:game-master']);
  assert.deepEqual(t.reads, ['/p/AGENTS.md']);
  assert.deepEqual(t.searches, ['Glob wiki/**/*.md', 'Grep Phase in /p/wiki']);
  assert.deepEqual(t.writes, ['Edit /p/wiki/state.md', 'Write /p/new.md']);
  assert.deepEqual(t.commands, ['git status --short']);
  assert.equal(t.finalText, 'Phase: concept\nNext step: x\nBlocked by: nothing');
  assert.equal(t.costUsd, 0.42);
  assert.equal(t.numTurns, 7);
  assert.equal(t.durationMs, 12345);
  assert.equal(t.subtype, 'success');
  assert.equal(t.isError, false);
});

test('parseTranscript reports the catalogue count and whether the three game-studio skills appear', () => {
  const t = parseTranscript(transcript);
  assert.equal(t.catalogue.count, 4);
  assert.deepEqual(t.catalogue.gameStudio, { 'game-master': true, 'studio-start': true, 'game-architect': true });
});

test('parseTranscript flags a missing game-studio skill and records denied tool results', () => {
  const t = parseTranscript([
    { type: 'system', subtype: 'init', session_id: 's', skills: ['a:b', 'game-master'] },
    toolUse('t1', 'Read', { file_path: '/x' }),
    toolResult('t1', 'denied by rule', true),
  ].map(line).join('\n'));
  assert.equal(t.catalogue.gameStudio['game-master'], true);
  assert.equal(t.catalogue.gameStudio['studio-start'], false);
  assert.deepEqual(t.toolErrors, [{ tool: 'Read', input: '/x', message: 'denied by rule' }]);
});

test('parseTranscript falls back to the last assistant text when there is no result event, and tolerates empty input', () => {
  const t = parseTranscript([text('first'), toolUse('t1', 'Read', { file_path: '/x' }), text('last')].map(line).join('\n'));
  assert.equal(t.finalText, 'last');
  assert.equal(t.costUsd, null);
  assert.equal(t.numTurns, null);
  const empty = parseTranscript('');
  assert.equal(empty.sessionId, null);
  assert.deepEqual(empty.skills, []);
  assert.equal(empty.catalogue, null);
});

test('isSecretName matches token, secret, password and key names', () => {
  for (const n of ['.env', 'secrets.json', 'id_rsa', 'api_key.txt', 'my-token', 'PASSWORD', 'credentials.json']) assert.ok(isSecretName(n), n);
  for (const n of ['README.md', 'monkey.md', 'state.md', 'keyboard.md']) assert.ok(!isSecretName(n), n);
});

test('maskSecrets hides values of secret-named keys in JSON, env and yaml forms', () => {
  const src = [
    '{"mcpServers":{"x":{"env":{"API_TOKEN":"abc123","name":"ok"}}}}',
    'DB_PASSWORD=hunter2',
    'client_secret: s3cr3t',
    'apiKey = "k-999"',
    'monkey: stays',
    'title: Keyboard guide',
  ].join('\n');
  const out = maskSecrets(src);
  assert.ok(!/abc123|hunter2|s3cr3t|k-999/.test(out), out);
  assert.ok(out.includes('"name":"ok"'));
  assert.ok(out.includes('monkey: stays'));
  assert.ok(out.includes('title: Keyboard guide'));
  assert.ok(out.includes('API_TOKEN'));
  assert.ok(out.includes('***'));
});

test('buildRun builds the argv array and the vault-isolating environment', () => {
  const run = buildRun({ prompt: 'Add a "grapple" hook.', plugin: '/plug', cacheDir: '/cache', projectDir: '/out/S01-t1/project', maxBudgetUsd: 6, vault: '/real/vault' }, { PATH: 'p', WIKI_MASTER_VAULT: '/real' });
  const a = run.args;
  assert.equal(a[0], '-p');
  assert.equal(a[1], 'Add a "grapple" hook.');
  assert.deepEqual(a.slice(a.indexOf('--plugin-dir'), a.indexOf('--plugin-dir') + 2), ['--plugin-dir', '/plug']);
  assert.equal(a[a.indexOf('--output-format') + 1], 'stream-json');
  assert.ok(a.includes('--verbose'));
  assert.equal(a[a.indexOf('--permission-mode') + 1], 'dontAsk');
  const at = a.indexOf('--allowedTools');
  assert.deepEqual(a.slice(at + 1, at + 9), ['Read', 'Glob', 'Grep', 'Write(//out/S01-t1/project/**)', 'Edit(//out/S01-t1/project/**)', 'Skill', 'Bash(git *)', 'Bash(node *wiki-master*)']);
  assert.ok(!a.includes('Write') && !a.includes('Edit'), 'no unscoped write rules');
  const dt = a.indexOf('--disallowedTools');
  assert.ok(dt > 0 && a.includes('Write(//real/vault/**)') && a.includes('Edit(//real/vault/**)') && a.includes('NotebookEdit(//real/vault/**)'));
  assert.deepEqual(a.filter((x, i) => a[i - 1] === '--add-dir'), ['/plug', '/cache']);
  assert.equal(a[a.indexOf('--max-budget-usd') + 1], '6');
  assert.ok(!a.includes('--model'));
  assert.ok(!a.includes('--resume'));
  assert.equal(run.env.WIKI_MASTER_VAULT, '/out/S01-t1/project');
  assert.equal(run.env.PATH, 'p');
});

test('buildRun adds --model and --resume when asked', () => {
  const run = buildRun({ prompt: 'r', plugin: '/p', cacheDir: '/c', projectDir: '/d', maxBudgetUsd: 2, model: 'opus', resume: 'sess-9' }, {});
  assert.equal(run.args[run.args.indexOf('--model') + 1], 'opus');
  assert.equal(run.args[run.args.indexOf('--resume') + 1], 'sess-9');
});

test('extra allow rules can be appended to the allow-list', () => {
  const run = buildRun({ prompt: 'p', plugin: '/p', cacheDir: '/c', projectDir: '/d', maxBudgetUsd: 1, extraAllowed: ['Read(//x/**)'] }, {});
  assert.ok(run.args.includes('Read(//x/**)'));
});

test('replyFor uses the scenario reply, the generic reply for adoption, and nothing otherwise', () => {
  assert.equal(replyFor({ kind: 'routing', prompt: 'p' }), null);
  assert.equal(replyFor({ kind: 'routing', reply: 'use X' }), 'use X');
  assert.equal(replyFor({ kind: 'adoption' }), GENERIC_REPLY);
  assert.equal(replyFor({ kind: 'adoption', reply: 'demo-game, minimal' }), 'demo-game, minimal');
  assert.equal(GENERIC_REPLY, 'Use your best judgement and state your assumption.');
});

test('assertOutsideRepo refuses folders inside or equal to the repository, including relative and case variants', () => {
  const repo = join(process.cwd(), 'repo-root');
  assert.throws(() => assertOutsideRepo(repo, repo), /inside the repository/);
  assert.throws(() => assertOutsideRepo(join(repo, 'out'), repo), /inside the repository/);
  assert.throws(() => assertOutsideRepo(join(repo, 'a', '..', 'b'), repo), /inside the repository/);
  if (process.platform === 'win32') assert.throws(() => assertOutsideRepo(repo.toUpperCase(), repo), /inside the repository/);
  assert.throws(() => assertOutsideRepo(join(repo, '..'), repo), /contains the repository/);
  assert.doesNotThrow(() => assertOutsideRepo(join(process.cwd(), 'repo-root-other'), repo));
});

test('parseArgs applies defaults and parses lists and numbers', () => {
  const d = parseArgs(['--out', '/o']);
  assert.deepEqual(d, { out: '/o', vault: null, vaultGuard: 'attributable', plugin: null, ids: null, kinds: null, trials: 1, concurrency: 3, model: null, maxBudgetUsd: 6, timeoutMin: 15, dryRun: false });
  const p = parseArgs(['--out', '/o', '--vault', '/v', '--vault-guard', 'strict', '--plugin', '/p', '--ids', 'R01,S01', '--kind', 'routing,stop', '--trials', '2', '--concurrency', '4', '--model', 'opus', '--max-budget-usd', '3.5', '--timeout-min', '5', '--dry-run']);
  assert.deepEqual(p, { out: '/o', vault: '/v', vaultGuard: 'strict', plugin: '/p', ids: ['R01', 'S01'], kinds: ['routing', 'stop'], trials: 2, concurrency: 4, model: 'opus', maxBudgetUsd: 3.5, timeoutMin: 5, dryRun: true });
});

test('parseArgs rejects a missing --out, unknown flags and bad numbers', () => {
  assert.throws(() => parseArgs([]), /--out is required/);
  assert.throws(() => parseArgs(['--out', '/o', '--bogus']), /unknown option/);
  assert.throws(() => parseArgs(['--out', '/o', '--trials', '0']), /--trials/);
  assert.throws(() => parseArgs(['--out']), /needs a value/);
  assert.throws(() => parseArgs(['--out', '/o', '--vault-guard', 'loose']), /--vault-guard/);
});

test('selectScenarios filters by id and kind and rejects unknown ids', () => {
  const all = [{ id: 'R01', kind: 'routing' }, { id: 'S01', kind: 'stop' }, { id: 'S02', kind: 'stop' }];
  assert.deepEqual(selectScenarios(all, { ids: ['S01'], kinds: null }).map((s) => s.id), ['S01']);
  assert.deepEqual(selectScenarios(all, { ids: null, kinds: ['stop'] }).map((s) => s.id), ['S01', 'S02']);
  assert.equal(selectScenarios(all, { ids: null, kinds: null }).length, 3);
  assert.throws(() => selectScenarios(all, { ids: ['Z9'], kinds: null }), /unknown scenario id/);
});

test('renderSummary includes prompt, reply, status, tools, catalogue and each turn verbatim', () => {
  const t1 = parseTranscript(transcript);
  const md = renderSummary({ scenario: { id: 'S01', prompt: 'Add a grapple hook mechanic.', kind: 'stop' }, reply: 'ok then', status: 'completed', exitCode: 0, durationMs: 5000, turns: [t1] });
  for (const needle of ['S01', 'Add a grapple hook mechanic.', 'ok then', 'completed', '0.42', 'agent-game-studio:studio-start', '/p/AGENTS.md', 'Write /p/new.md', 'git status --short', 'Phase: concept\nNext step: x\nBlocked by: nothing', 'game-master', '4 skills']) {
    assert.ok(md.includes(needle), `missing ${needle}`);
  }
});

const win = (p) => p.replaceAll('/', String.fromCharCode(92));

test('toRulePath turns absolute paths into the double-slash anchored form with forward slashes', () => {
  assert.equal(toRulePath(win('C:/work/scratch/S01-t1/project')), '//c/work/scratch/S01-t1/project');
  assert.equal(toRulePath('c:/work dir/My Game/project/'), '//c/work dir/My Game/project');
  assert.equal(toRulePath(win('D:/x')), '//d/x');
  assert.equal(toRulePath('/srv/out/project'), '//srv/out/project');
});

test('confineWrites scopes Write and Edit to the project folder only', () => {
  assert.deepEqual(confineWrites(win('C:/work dir/out/S01-t1/project')), [
    'Write(//c/work dir/out/S01-t1/project/**)',
    'Edit(//c/work dir/out/S01-t1/project/**)',
  ]);
});

test('vaultGuards deny file edits and shell access to the real vault folder', () => {
  assert.deepEqual(vaultGuards(win('C:/data/.wiki-master-vault')), [
    'Write(//c/data/.wiki-master-vault/**)',
    'Edit(//c/data/.wiki-master-vault/**)',
    'NotebookEdit(//c/data/.wiki-master-vault/**)',
    'Bash(*.wiki-master-vault*)',
  ]);
  assert.deepEqual(vaultGuards(null), []);
});

test('compareVault reports nothing for an identical snapshot and names what changed otherwise', () => {
  const a = { head: 'abc', status: '' };
  assert.equal(compareVault(a, { head: 'abc', status: '' }), null);
  assert.match(compareVault(a, { head: 'def', status: '' }), /HEAD changed from abc to def/);
  assert.match(compareVault(a, { head: 'abc', status: ' M wiki/x.md' }), /status changed[\s\S]*wiki.x.md/);
});

// --- vault attribution -------------------------------------------------------

const A = 'wiki' + '/authored';
const VAULT = 'C:/data/.wiki-master-vault';
const denied = (id, message = 'File is in a directory that is denied by your permission settings.') => ({
  type: 'user',
  message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content: message, is_error: true }] },
  tool_result_meta: [{ id, permission_decision: { decision: 'reject', source: 'config', reason_type: 'rule' } }],
});
const lines = (events) => events.map(line).join('\n');

test('vaultAttempts records a denied vault write as denied', () => {
  const raw = lines([toolUse('w1', 'Write', { file_path: VAULT + '/zz.md', content: 'x' }), denied('w1')]);
  assert.deepEqual(vaultAttempts(raw, VAULT), [{ tool: 'Write', input: VAULT + '/zz.md', denied: true }]);
});

test('vaultAttempts records an allowed vault read as not denied', () => {
  const raw = lines([toolUse('r1', 'Read', { file_path: VAULT + '/index.md' }), toolResult('r1', 'contents')]);
  assert.deepEqual(vaultAttempts(raw, VAULT), [{ tool: 'Read', input: VAULT + '/index.md', denied: false }]);
});

test('vaultAttempts finds nothing in a transcript that never mentions the vault', () => {
  assert.deepEqual(vaultAttempts(transcript, VAULT), []);
});

test('vaultAttempts matches case-insensitively, in either slash form, in commands and patterns', () => {
  const back = win(VAULT).toUpperCase();
  const raw = lines([
    toolUse('a', 'Read', { file_path: back + win('/index.md').toUpperCase() }), toolResult('a', 'ok'),
    toolUse('b', 'Bash', { command: 'git -C ' + VAULT.toLowerCase() + ' status' }), denied('b', 'Permission to use Bash has been denied.'),
    toolUse('c', 'Grep', { pattern: 'x', path: VAULT }), toolResult('c', 'ok'),
    toolUse('d', 'Glob', { pattern: VAULT + '/**/*.md' }), toolResult('d', 'ok'),
    toolUse('e', 'Read', { file_path: 'C:/work/project/AGENTS.md' }), toolResult('e', 'ok'),
  ]);
  const found = vaultAttempts(raw, win(VAULT));
  assert.deepEqual(found.map((f) => f.tool), ['Read', 'Bash', 'Grep', 'Glob']);
  assert.deepEqual(found.map((f) => f.denied), [false, true, false, false]);
});

test('vaultAttempts treats an ordinary tool error as reaching the vault, and a denial message as denied', () => {
  const raw = lines([
    toolUse('a', 'Read', { file_path: VAULT + '/missing.md' }), toolResult('a', 'File does not exist.', true),
    toolUse('b', 'Edit', { file_path: VAULT + '/x.md' }), toolResult('b', 'Permission to use Edit has been denied because of the mode.', true),
  ]);
  assert.deepEqual(vaultAttempts(raw, VAULT).map((f) => f.denied), [false, true]);
});

test('evaluateVault: clean, attempted (all denied) and touched (any allowed)', () => {
  const none = { head: 'h', status: '' };
  const base = { vault: VAULT, before: none, after: none, slugs: ['demo-game'] };
  assert.equal(evaluateVault({ ...base, texts: [transcript] }).verdict, 'clean');
  const attempted = lines([toolUse('w', 'Write', { file_path: VAULT + '/z.md' }), denied('w')]);
  const touched = lines([toolUse('r', 'Read', { file_path: VAULT + '/index.md' }), toolResult('r', 'ok')]);
  assert.equal(evaluateVault({ ...base, texts: [attempted] }).verdict, 'attempted');
  assert.equal(evaluateVault({ ...base, texts: [attempted, touched] }).verdict, 'touched');
  const t = evaluateVault({ ...base, texts: [touched] });
  assert.equal(t.verdict, 'touched');
  assert.equal(t.attempts.length, 1);
});

test('evaluateVault: a new path under wiki/authored/<slug>/ is touched, other changes are informational', () => {
  const before = { head: 'h', status: ' M notes/old.md\n' };
  const other = { head: 'h2', status: ' M notes/old.md\n?? ' + A + '/someone-else/a.md\n?? raw/x.md\n' };
  const mine = { head: 'h', status: ' M notes/old.md\n?? ' + A + '/demo-game/reference/studio-state.md\n' };
  const base = { vault: VAULT, texts: [transcript], before, slugs: ['demo-game'] };
  assert.equal(evaluateVault({ ...base, after: other }).verdict, 'clean');
  const t = evaluateVault({ ...base, after: mine });
  assert.equal(t.verdict, 'touched');
  assert.deepEqual(t.slugPaths, ['' + A + '/demo-game/reference/studio-state.md']);
});

test('vaultDelta lists only new lines under the given slugs, including renames, and ignores what was already there', () => {
  const before = '?? ' + A + '/demo-game/old.md\n';
  const after = '?? ' + A + '/demo-game/old.md\n M ' + A + '/demo-game/new.md\nR  a.md -> ' + A + '/demo-game/b.md\n?? ' + A + '/other/c.md\n';
  assert.deepEqual(vaultDelta(before, after, ['demo-game']), ['' + A + '/demo-game/new.md', '' + A + '/demo-game/b.md']);
  assert.deepEqual(vaultDelta('', after, []), []);
});

test('vaultSnapshot against a decoy repo sees new files individually, and a missing folder reads as empty', () => {
  const dir = mkdtempSync(join(tmpdir(), 'decoy-vault-'));
  try {
    const git = (...a) => execFileSync('git', ['-C', dir, '-c', 'user.name=t', '-c', 'user.email=t@example.invalid', ...a], { encoding: 'utf8' });
    git('init', '-q');
    git('commit', '-q', '--allow-empty', '-m', 'init');
    const before = vaultSnapshot(dir);
    assert.match(before.head, /^[0-9a-f]{40}$/);
    assert.equal(before.status, '');
    mkdirSync(join(dir, 'wiki', 'authored', 'demo-game'), { recursive: true });
    mkdirSync(join(dir, 'notes'), { recursive: true });
    writeFileSync(join(dir, 'wiki', 'authored', 'demo-game', 'state.md'), 'x');
    writeFileSync(join(dir, 'notes', 'n.md'), 'x');
    const after = vaultSnapshot(dir);
    assert.deepEqual(vaultDelta(before.status, after.status, ['demo-game']), ['' + A + '/demo-game/state.md']);
    assert.equal(evaluateVault({ vault: dir, texts: [transcript], before, after, slugs: ['demo-game'] }).verdict, 'touched');
    assert.deepEqual(vaultSnapshot(join(dir, 'nope')), { head: null, status: '' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
