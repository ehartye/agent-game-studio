// Pure helpers for scripts/run-scenarios.mjs. No I/O except realpath lookups in assertOutsideRepo.
import { existsSync, realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

export const GENERIC_REPLY = 'Use your best judgement and state your assumption.';

export const ALLOWED_TOOLS = ['Read', 'Glob', 'Grep', 'Write', 'Edit', 'Skill', 'Bash(git *)', 'Bash(node *wiki-master*)'];
export const GAME_STUDIO_SKILLS = ['game-master', 'studio-start', 'game-architect'];
const DEFAULTS = { trials: 1, concurrency: 3, maxBudgetUsd: 6, timeoutMin: 15 };

// The second turn: scenarios with a reply, and every adoption scenario.
export function replyFor(scenario) {
  if (scenario.reply) return scenario.reply;
  return scenario.kind === 'adoption' ? GENERIC_REPLY : null;
}

// --- paths -----------------------------------------------------------------

function real(p) {
  const r = resolve(p);
  try { return existsSync(r) ? realpathSync(r) : r; } catch { return r; }
}

const within = (parent, child) => {
  const rel = relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
};

// Refuses an output folder that is, or sits inside, the repository (or contains it).
export function assertOutsideRepo(out, repoRoot) {
  const o = real(out);
  const r = real(repoRoot);
  if (within(r, o)) throw new Error(`--out must be outside the repository: ${o} is inside the repository ${r}`);
  if (within(o, r)) throw new Error(`--out must be outside the repository: ${o} contains the repository ${r}`);
}

// --- secrets ---------------------------------------------------------------

const SECRET_WORDS = new Set(['token', 'tokens', 'secret', 'secrets', 'password', 'passwords', 'passwd', 'key', 'keys', 'apikey', 'credential', 'credentials', 'rsa', 'pem']);

function nameWords(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function secretWord(w) {
  return SECRET_WORDS.has(w) || (w.length > 6 && /(token|secret|password)s?$/.test(w));
}

// True for a key name or a file name that looks like it holds a secret.
export function isSecretName(name) {
  if (/^\.env(\.|$)/i.test(name)) return true;
  return nameWords(name).some(secretWord);
}

// Masks the value of any key whose name looks secret, in JSON, env and yaml notations.
export function maskSecrets(text) {
  const pair = /(["']?)([A-Za-z0-9_.-]+)\1(\s*[:=]\s*)("(?:[^"\\\n]|\\.)*"|'[^'\n]*'|[^\s{["',}'][^\n,}]*)/g;
  return text.replace(pair, (whole, q, name, sep, value) => {
    if (!isSecretName(name)) return whole;
    const quote = value[0] === '"' || value[0] === "'" ? value[0] : '';
    return `${q}${name}${q}${sep}${quote}***${quote}`;
  });
}

// --- run construction ------------------------------------------------------

// Argument array and environment for one host invocation. Never goes through a shell.
export function buildRun({ prompt, plugin, cacheDir, projectDir, maxBudgetUsd, model, resume, extraAllowed = [] }, baseEnv = process.env) {
  const args = ['-p', prompt];
  if (resume) args.push('--resume', resume);
  args.push(
    '--plugin-dir', plugin,
    '--output-format', 'stream-json',
    '--verbose',
    '--permission-mode', 'dontAsk',
    '--allowedTools', ...ALLOWED_TOOLS, ...extraAllowed,
    '--add-dir', plugin, '--add-dir', cacheDir,
    '--max-budget-usd', String(maxBudgetUsd),
  );
  if (model) args.push('--model', model);
  return { args, env: { ...baseEnv, WIKI_MASTER_VAULT: projectDir } };
}

// --- command line ----------------------------------------------------------

export function parseArgs(argv) {
  const o = { out: null, plugin: null, ids: null, kinds: null, trials: DEFAULTS.trials, concurrency: DEFAULTS.concurrency, model: null, maxBudgetUsd: DEFAULTS.maxBudgetUsd, timeoutMin: DEFAULTS.timeoutMin, dryRun: false };
  const list = (v) => v.split(',').map((s) => s.trim()).filter(Boolean);
  const num = (flag, v, { integer = true } = {}) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0 || (integer && !Number.isInteger(n))) throw new Error(`${flag} needs a positive ${integer ? 'integer' : 'number'}, got "${v}"`);
    return n;
  };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--dry-run') { o.dryRun = true; continue; }
    const known = ['--out', '--plugin', '--ids', '--kind', '--trials', '--concurrency', '--model', '--max-budget-usd', '--timeout-min'];
    if (!known.includes(flag)) throw new Error(`unknown option ${flag}`);
    const v = argv[++i];
    if (v === undefined || v.startsWith('--')) throw new Error(`${flag} needs a value`);
    if (flag === '--out') o.out = v;
    else if (flag === '--plugin') o.plugin = v;
    else if (flag === '--ids') o.ids = list(v);
    else if (flag === '--kind') o.kinds = list(v);
    else if (flag === '--model') o.model = v;
    else if (flag === '--trials') o.trials = num(flag, v);
    else if (flag === '--concurrency') o.concurrency = num(flag, v);
    else if (flag === '--max-budget-usd') o.maxBudgetUsd = num(flag, v, { integer: false });
    else if (flag === '--timeout-min') o.timeoutMin = num(flag, v, { integer: false });
  }
  if (!o.out) throw new Error('--out is required');
  return o;
}

export function selectScenarios(all, { ids, kinds }) {
  if (ids) for (const id of ids) if (!all.some((s) => s.id === id)) throw new Error(`unknown scenario id ${id}`);
  return all.filter((s) => (!ids || ids.includes(s.id)) && (!kinds || kinds.includes(s.kind)));
}

// --- transcript parsing ----------------------------------------------------

const summarizeInput = (name, input = {}) => {
  if (name === 'Bash') return input.command ?? '';
  if (name === 'Skill') return input.skill ?? input.name ?? '';
  return input.file_path ?? input.path ?? input.pattern ?? input.command ?? '';
};

const resultText = (content) => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((c) => (typeof c === 'string' ? c : c?.text ?? '')).join('');
  return '';
};

// Turns one stream-json transcript (a single host invocation) into summary data.
export function parseTranscript(raw) {
  const t = {
    sessionId: null, skills: [], reads: [], searches: [], writes: [], commands: [], toolErrors: [],
    finalText: '', costUsd: null, numTurns: null, durationMs: null, subtype: null, isError: null,
    permissionDenials: [], catalogue: null,
  };
  const uses = new Map();
  let lastText = '';
  for (const rawLine of raw.split('\n')) {
    if (!rawLine.trim()) continue;
    let e;
    try { e = JSON.parse(rawLine); } catch { continue; }
    if (e.session_id && !t.sessionId) t.sessionId = e.session_id;
    if (e.type === 'system' && e.subtype === 'init') {
      const names = Array.isArray(e.skills) ? e.skills : [];
      const base = names.map((n) => String(n).split(':').pop());
      t.catalogue = { count: names.length, gameStudio: Object.fromEntries(GAME_STUDIO_SKILLS.map((s) => [s, base.includes(s)])) };
    } else if (e.type === 'assistant') {
      for (const c of e.message?.content ?? []) {
        if (c.type === 'text' && c.text) lastText = c.text;
        if (c.type !== 'tool_use') continue;
        const input = c.input ?? {};
        uses.set(c.id, { name: c.name, input: summarizeInput(c.name, input) });
        if (c.name === 'Skill') t.skills.push(summarizeInput('Skill', input));
        else if (c.name === 'Read') t.reads.push(input.file_path);
        else if (c.name === 'Glob') t.searches.push(`Glob ${input.pattern}${input.path ? ` in ${input.path}` : ''}`);
        else if (c.name === 'Grep') t.searches.push(`Grep ${input.pattern}${input.path ? ` in ${input.path}` : ''}`);
        else if (c.name === 'Write' || c.name === 'Edit') t.writes.push(`${c.name} ${input.file_path}`);
        else if (c.name === 'Bash') t.commands.push(input.command);
      }
    } else if (e.type === 'user') {
      for (const c of Array.isArray(e.message?.content) ? e.message.content : []) {
        if (c.type !== 'tool_result' || !c.is_error) continue;
        const use = uses.get(c.tool_use_id) ?? { name: '?', input: '' };
        t.toolErrors.push({ tool: use.name, input: use.input, message: resultText(c.content).slice(0, 500) });
      }
    } else if (e.type === 'result') {
      t.subtype = e.subtype ?? null;
      t.isError = e.is_error ?? null;
      t.numTurns = e.num_turns ?? null;
      t.costUsd = e.total_cost_usd ?? null;
      t.durationMs = e.duration_ms ?? null;
      t.permissionDenials = e.permission_denials ?? [];
      if (typeof e.result === 'string' && e.result) t.finalText = e.result;
    }
  }
  if (!t.finalText) t.finalText = lastText;
  return t;
}

// --- summary ---------------------------------------------------------------

const bullets = (items) => (items.length ? items.map((i) => `- \`${i}\``).join('\n') : '- none');
const fence = (s) => {
  const ticks = '`'.repeat(Math.max(3, ...[...s.matchAll(/`+/g)].map((m) => m[0].length + 1)));
  return `${ticks}text\n${s}\n${ticks}`;
};

export function renderSummary({ scenario, reply = null, status, exitCode, durationMs, turns }) {
  const first = turns[0] ?? parseTranscript('');
  const all = (key) => turns.flatMap((t) => t[key]);
  const cost = turns.some((t) => t.costUsd != null) ? turns.reduce((n, t) => n + (t.costUsd ?? 0), 0).toFixed(4) : 'not reported';
  const cat = first.catalogue;
  const lines = [
    `# ${scenario.id} (${scenario.kind})`,
    '',
    `- Status: ${status}`,
    `- Exit status: ${exitCode ?? 'none'}`,
    `- Duration: ${durationMs == null ? 'unknown' : `${(durationMs / 1000).toFixed(1)} s`}`,
    `- Turns (host-reported, per invocation): ${turns.map((t) => t.numTurns ?? '?').join(' + ') || 'none'}`,
    `- Cost (USD): ${cost}`,
    `- Session: ${first.sessionId ?? 'unknown'}`,
    cat
      ? `- Catalogue seen by the session: ${cat.count} skills; game-studio skills present: ${Object.entries(cat.gameStudio).map(([k, v]) => `${k} ${v ? 'yes' : 'no'}`).join(', ')}`
      : '- Catalogue seen by the session: not in transcript',
    '',
    '## Prompt',
    '',
    fence(scenario.prompt),
    '',
  ];
  if (reply) lines.push('## Reply', '', fence(reply), '');
  lines.push(
    '## Skills loaded, in order', '', bullets(all('skills')), '',
    '## Files read, in order', '', bullets(all('reads')), '',
    '## Searches', '', bullets(all('searches')), '',
    '## Files written', '', bullets(all('writes')), '',
    '## Bash commands', '', bullets(all('commands')), '',
    '## Denied or failed tool calls', '', all('toolErrors').length ? all('toolErrors').map((x) => `- ${x.tool} \`${x.input}\`: ${x.message.replace(/\s+/g, ' ')}`).join('\n') : '- none', '',
  );
  turns.forEach((t, i) => lines.push(`## Final text, turn ${i + 1}`, '', fence(t.finalText || '(empty)'), ''));
  return lines.join('\n');
}
