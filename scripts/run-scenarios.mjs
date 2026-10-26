// Runs the scenarios in tests/scenarios/scenarios.json against a real, non-interactive host with this
// plugin loaded, and captures what happened. It never scores. Dependency-free.
//
//   node scripts/run-scenarios.mjs --out <dir> [--plugin <path>] [--ids R01,S01] [--kind routing,stop]
//        [--trials N] [--concurrency N] [--model <name>] [--max-budget-usd N] [--timeout-min N] [--dry-run]
import { spawn, spawnSync } from 'node:child_process';
import { cpSync, createWriteStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { GENERIC_REPLY, assertOutsideRepo, buildRun, isSecretName, maskSecrets, parseArgs, parseTranscript, renderSummary, replyFor, selectScenarios } from './lib/runner.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const FILE_CAP = 20 * 1024;

function resolveHost() {
  const names = process.platform === 'win32' ? ['claude.exe', 'claude'] : ['claude'];
  for (const dir of (process.env.PATH ?? '').split(delimiter).filter(Boolean)) {
    for (const name of names) {
      const p = join(dir, name);
      if (existsSync(p) && statSync(p).isFile()) return p;
    }
  }
  throw new Error('cannot find the host executable (claude) on PATH');
}

function git(cwd, ...args) {
  const r = spawnSync('git', ['-c', 'core.quotepath=false', ...args], { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && args[0] !== 'diff') throw new Error(`git ${args.join(' ')} failed in ${cwd}: ${r.stderr}`);
  return r.stdout;
}

function prepareProject(dir, fixture) {
  mkdirSync(dir, { recursive: true });
  cpSync(join(ROOT, 'tests', 'fixtures', fixture), dir, { recursive: true });
  git(dir, 'init', '-q');
  git(dir, 'config', 'user.name', 'scenario-runner');
  git(dir, 'config', 'user.email', 'scenario-runner@example.invalid');
  git(dir, 'config', 'core.autocrlf', 'false');
  git(dir, 'config', 'commit.gpgsign', 'false');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'baseline');
}

function killTree(child) {
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  else child.kill('SIGKILL');
}

// Runs the host once. Resolves with { exitCode, timedOut, spawnError }.
function runHost(exe, { args, env }, cwd, transcriptPath, stderrPath, timeoutMs) {
  return new Promise((done) => {
    const out = createWriteStream(transcriptPath);
    const err = createWriteStream(stderrPath);
    let timedOut = false;
    let child;
    try {
      child = spawn(exe, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    } catch (e) {
      out.end(); err.end();
      return done({ exitCode: null, timedOut: false, spawnError: String(e) });
    }
    child.stdout.pipe(out);
    child.stderr.pipe(err);
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, timeoutMs);
    child.on('error', (e) => { clearTimeout(timer); out.end(); err.end(); done({ exitCode: null, timedOut, spawnError: String(e) }); });
    child.on('close', (code) => {
      clearTimeout(timer);
      let pending = 2;
      const fin = () => { if (--pending === 0) done({ exitCode: code, timedOut }); };
      out.end(fin); err.end(fin);
    });
  });
}

function capture(project) {
  const parts = ['# git status --short', git(project, 'status', '--short'), '# git diff', git(project, 'diff')];
  const untracked = git(project, 'ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean);
  for (const rel of untracked) {
    parts.push(`# untracked: ${rel}`);
    const file = join(project, rel);
    if (isSecretName(rel.split('/').pop())) { parts.push('[withheld: the file name looks like a secret]'); continue; }
    const buf = readFileSync(file);
    if (buf.includes(0)) { parts.push(`[binary file, ${buf.length} bytes]`); continue; }
    let body = buf.toString('utf8');
    if (body.length > FILE_CAP) body = `${body.slice(0, FILE_CAP)}\n[truncated at ${FILE_CAP} characters of ${body.length}]`;
    parts.push(body);
  }
  return maskSecrets(parts.join('\n'));
}

const readIfExists = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

async function runOne(ctx, scenario, trial) {
  const { opts, plugin, cacheDir, exe, outDir } = ctx;
  const name = `${scenario.id}-t${trial}`;
  const dir = join(outDir, name);
  const project = join(dir, 'project');
  const paths = { dir, project, transcript: join(dir, 'transcript.jsonl'), transcript2: join(dir, 'transcript-2.jsonl'), stderr: join(dir, 'stderr.txt'), diff: join(dir, 'diff.txt'), summary: join(dir, 'summary.md') };
  const started = Date.now();
  const entry = { id: scenario.id, trial, status: 'pending', exitCode: null, durationMs: null, paths: {} };
  try {
    prepareProject(project, scenario.fixture);
    const base = { plugin, cacheDir, projectDir: project, maxBudgetUsd: opts.maxBudgetUsd, model: opts.model, extraAllowed: ctx.extraAllowed };
    const timeoutMs = opts.timeoutMin * 60_000;
    const turns = [];
    let first = await runHost(exe, buildRun({ ...base, prompt: scenario.prompt }), project, paths.transcript, paths.stderr, timeoutMs);
    turns.push(parseTranscript(readIfExists(paths.transcript)));
    let last = first;
    const reply = replyFor(scenario);
    let status = first.spawnError ? 'spawn-failed' : first.timedOut ? 'timeout' : first.exitCode !== 0 || turns[0].isError ? 'error' : 'completed';
    if (reply && turns[0].sessionId && !first.spawnError && !first.timedOut) {
      const elapsed = Date.now() - started;
      last = await runHost(exe, buildRun({ ...base, prompt: reply, resume: turns[0].sessionId }), project, paths.transcript2, join(dir, 'stderr-2.txt'), Math.max(60_000, timeoutMs - elapsed));
      turns.push(parseTranscript(readIfExists(paths.transcript2)));
      if (last.timedOut) status = 'timeout';
      else if (last.spawnError) status = 'spawn-failed';
      else if (last.exitCode !== 0 || turns[1].isError) status = 'error';
    }
    entry.status = status;
    entry.exitCode = last.exitCode;
    entry.durationMs = Date.now() - started;
    writeFileSync(paths.diff, capture(project));
    writeFileSync(paths.summary, renderSummary({ scenario, reply: reply && turns.length > 1 ? reply : null, status, exitCode: last.exitCode, durationMs: entry.durationMs, turns }));
    entry.costUsd = turns.some((t) => t.costUsd != null) ? turns.reduce((n, t) => n + (t.costUsd ?? 0), 0) : null;
    entry.sessionId = turns[0].sessionId;
  } catch (e) {
    entry.status = 'runner-error';
    entry.error = String(e?.stack ?? e);
    entry.durationMs = Date.now() - started;
  }
  entry.paths = Object.fromEntries(Object.entries(paths).filter(([, p]) => existsSync(p)));
  return entry;
}

async function pool(items, size, work) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) await work(items[next++]);
  }));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const outDir = resolve(opts.out);
  assertOutsideRepo(outDir, ROOT);
  const plugin = resolve(opts.plugin ?? ROOT);
  if (!existsSync(join(plugin, 'skills'))) throw new Error(`--plugin ${plugin} has no skills folder`);
  const scenarios = selectScenarios(JSON.parse(readFileSync(join(ROOT, 'tests', 'scenarios', 'scenarios.json'), 'utf8')), opts);
  if (!scenarios.length) throw new Error('no scenarios selected');
  const cacheDir = join(homedir(), '.claude', 'plugins', 'cache');
  const jobs = scenarios.flatMap((s) => Array.from({ length: opts.trials }, (_, i) => ({ s, trial: i + 1 })));

  if (opts.dryRun) {
    console.log(`Would run ${jobs.length} run(s) into ${outDir} with plugin ${plugin}`);
    for (const { s, trial } of jobs) console.log(`  ${s.id}-t${trial}  fixture=${s.fixture}  reply=${replyFor(s) ? JSON.stringify(replyFor(s)) : 'none'}`);
    const { args } = buildRun({ prompt: '<prompt>', plugin, cacheDir, projectDir: '<project>', maxBudgetUsd: opts.maxBudgetUsd, model: opts.model });
    console.log(`  claude ${args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`);
    return;
  }

  const exe = resolveHost();
  mkdirSync(outDir, { recursive: true });
  const ctx = { opts, plugin, cacheDir, exe, outDir, extraAllowed: [] };
  const runs = [];
  const writeIndex = () => writeFileSync(join(outDir, 'index.json'), `${JSON.stringify({ plugin, model: opts.model, genericReply: GENERIC_REPLY, startedAt, runs }, null, 2)}\n`);
  const startedAt = new Date().toISOString();
  await pool(jobs, opts.concurrency, async ({ s, trial }) => {
    console.log(`start ${s.id}-t${trial}`);
    const entry = await runOne(ctx, s, trial);
    runs.push(entry);
    runs.sort((a, b) => a.id.localeCompare(b.id) || a.trial - b.trial);
    writeIndex();
    console.log(`done  ${s.id}-t${trial}  ${entry.status}  ${(entry.durationMs / 1000).toFixed(0)} s${entry.costUsd != null ? `  $${entry.costUsd.toFixed(2)}` : ''}`);
  });
  writeIndex();
  console.log(`index: ${join(outDir, 'index.json')}`);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
