// Pure helpers for scripts/run-scenarios.mjs. No I/O except realpath lookups in assertOutsideRepo.
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

export const GENERIC_REPLY = 'Use your best judgement and state your assumption.';

export const READ_TOOLS = ['Read', 'Glob', 'Grep'];
export const OTHER_TOOLS = ['Skill', 'Bash(git *)', 'Bash(node *wiki-master*)'];
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

// --- permission rules ------------------------------------------------------

// Absolute path in the host's rule syntax: a double slash anchors at the filesystem root; a drive
// letter becomes a lowercase first segment (drive C, folder one -> //c/one).
export function toRulePath(p) {
  const fwd = p.replaceAll('\\', '/').replace(/\/+$/, '');
  const drive = /^([A-Za-z]):(\/|$)/.exec(fwd);
  return drive ? `//${drive[1].toLowerCase()}${fwd.slice(2)}` : `/${fwd}`;
}

// Write and Edit allowed only below the scratch project folder.
export function confineWrites(projectDir) {
  const scope = `${toRulePath(projectDir)}/**`;
  return [`Write(${scope})`, `Edit(${scope})`];
}

// Deny rules for the real vault folder: a second guard behind the environment variable.
export function vaultGuards(vault) {
  if (!vault) return [];
  const scope = `${toRulePath(vault)}/**`;
  const name = vault.replaceAll('\\', '/').replace(/\/+$/, '').split('/').pop();
  // The bare folder is needed too: Glob and Grep take a directory as their path, which the /** form does not match.
  const file = ['Write', 'Edit', 'NotebookEdit', 'Read', 'Glob', 'Grep'].flatMap((tool) => [`${tool}(${scope})`, `${tool}(${toRulePath(vault)})`]);
  return [...file, `Bash(*${name}*)`];
}

// Read, search, write and edit allowed on a scratch vault folder.
export function scratchVaultRules(dir) {
  const scope = `${toRulePath(dir)}/**`;
  return ['Read', 'Glob', 'Grep', 'Write', 'Edit'].map((tool) => `${tool}(${scope})`);
}

// The scratch vault must never be, contain or sit inside the real vault.
export function assertDistinctVaults(scratch, real) {
  const s = resolve(scratch);
  const r = resolve(real);
  if (within(r, s) || within(s, r)) throw new Error(`the scratch vault ${s} must be separate from the real vault ${r}`);
}

// Highest plain x.y.z folder name (temporary or foreign names are ignored), or null.
export function newestVersion(names) {
  const plain = names.filter((n) => /^\d+(\.\d+)*$/.test(n));
  plain.sort((a, b) => {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
    return 0;
  });
  return plain.length ? plain.at(-1) : null;
}

// Null when the vault is as it was; otherwise a sentence saying what changed.
export function compareVault(before, after) {
  const changes = [];
  if (before.head !== after.head) changes.push(`HEAD changed from ${before.head} to ${after.head}`);
  if (before.status !== after.status) changes.push(`status changed from [${before.status.trim()}] to [${after.status.trim()}]`);
  return changes.length ? changes.join('; ') : null;
}

// --- run construction ------------------------------------------------------

// Argument array and environment for one host invocation. Never goes through a shell.
export function buildRun({ prompt, plugin, cacheDir, projectDir, maxBudgetUsd, model, resume, vault = null, scratchVault = null, extraAllowed = [] }, baseEnv = process.env) {
  const args = ['-p', prompt];
  if (resume) args.push('--resume', resume);
  const guards = vaultGuards(vault);
  args.push(
    '--plugin-dir', plugin,
    '--output-format', 'stream-json',
    '--verbose',
    '--permission-mode', 'dontAsk',
    '--allowedTools', ...READ_TOOLS, ...confineWrites(projectDir), ...(scratchVault ? scratchVaultRules(scratchVault) : []), ...OTHER_TOOLS, ...extraAllowed,
    ...(guards.length ? ['--disallowedTools', ...guards] : []),
    '--add-dir', plugin, '--add-dir', cacheDir, ...(scratchVault ? ['--add-dir', scratchVault] : []),
    '--max-budget-usd', String(maxBudgetUsd),
  );
  if (model) args.push('--model', model);
  return { args, env: { ...baseEnv, WIKI_MASTER_VAULT: scratchVault ?? projectDir } };
}

// --- command line ----------------------------------------------------------

export function parseArgs(argv) {
  const o = { out: null, vault: null, wikiMaster: null, vaultGuard: 'attributable', plugin: null, ids: null, kinds: null, trials: DEFAULTS.trials, concurrency: DEFAULTS.concurrency, model: null, maxBudgetUsd: DEFAULTS.maxBudgetUsd, timeoutMin: DEFAULTS.timeoutMin, dryRun: false };
  const list = (v) => v.split(',').map((s) => s.trim()).filter(Boolean);
  const num = (flag, v, { integer = true } = {}) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0 || (integer && !Number.isInteger(n))) throw new Error(`${flag} needs a positive ${integer ? 'integer' : 'number'}, got "${v}"`);
    return n;
  };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--dry-run') { o.dryRun = true; continue; }
    const known = ['--out', '--vault', '--wiki-master', '--vault-guard', '--plugin', '--ids', '--kind', '--trials', '--concurrency', '--model', '--max-budget-usd', '--timeout-min'];
    if (!known.includes(flag)) throw new Error(`unknown option ${flag}`);
    const v = argv[++i];
    if (v === undefined || v.startsWith('--')) throw new Error(`${flag} needs a value`);
    if (flag === '--out') o.out = v;
    else if (flag === '--vault') o.vault = v;
    else if (flag === '--wiki-master') o.wikiMaster = v;
    else if (flag === '--vault-guard') {
      if (!['strict', 'attributable'].includes(v)) throw new Error(`--vault-guard must be strict or attributable, got "${v}"`);
      o.vaultGuard = v;
    }
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

const under = (p, root) => { const n = norm(String(p)); const r = norm(root).replace(/\/+$/, ''); return n === r || n.startsWith(`${r}/`); };
const pathOf = (item) => item.replace(/^(?:Write|Edit) /, '');

export function renderSummary({ scenario, reply = null, status, exitCode, durationMs, turns, scratchVault = null }) {
  const first = turns[0] ?? parseTranscript('');
  const inVault = (item) => scratchVault != null && under(pathOf(item), scratchVault.path);
  const all = (key) => turns.flatMap((t) => t[key]).filter((i) => typeof i !== 'string' || !inVault(i));
  const vaultOnly = (key) => turns.flatMap((t) => t[key]).filter((i) => typeof i === 'string' && inVault(i));
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
  if (scratchVault) {
    const mentions = turns.flatMap((t) => t.commands).filter((c) => norm(c).includes(norm(scratchVault.path)));
    lines.push(
      '## Scratch vault', '', `Folder: ${scratchVault.path}`, '',
      '### git status --short', '', fence(scratchVault.status.trim() || '(clean)'), '',
      '### Files read in it', '', bullets(vaultOnly('reads')), '',
      '### Files written in it', '', bullets(vaultOnly('writes')), '',
      '### Searches and commands that mention it', '', bullets([...vaultOnly('searches'), ...mentions]), '',
    );
  }
  return lines.join('\n');
}

// --- vault attribution -----------------------------------------------------

// State of the real vault. Untracked files are listed one by one. A missing or non-git folder reads as head null.
export function vaultSnapshot(vault) {
  const run = (...a) => spawnSync('git', ['-C', vault, ...a], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const head = run('rev-parse', 'HEAD');
  const status = run('status', '--short', '-uall');
  return { head: head.status === 0 ? head.stdout.trim() : null, status: status.status === 0 ? status.stdout : '' };
}

const norm = (s) => s.replaceAll('\\', '/').toLowerCase();

// Spellings of the vault path to look for: as given, the drive-less and shell-style forms, and ~/<name>.
function vaultNeedles(vault) {
  const full = norm(vault).replace(/\/+$/, '');
  const needles = new Set([full]);
  const drive = /^([a-z]):(\/.*)$/.exec(full);
  if (drive) { needles.add(`/${drive[1]}${drive[2]}`); needles.add(drive[2]); }
  const name = full.split('/').pop();
  if (name) needles.add(`~/${name}`);
  return [...needles];
}

const isDenial = (result, meta) => {
  const decided = (Array.isArray(meta) ? meta : []).filter((m) => !m.id || m.id === result.tool_use_id);
  if (decided.some((m) => m.permission_decision?.decision === 'reject')) return true;
  return result.is_error === true && /\bdenied\b/i.test(resultText(result.content));
};

// Every tool call whose file_path, path, pattern or command mentions the vault, with whether it was denied.
export function vaultAttempts(raw, vault) {
  const needles = vaultNeedles(vault);
  const calls = [];
  const byId = new Map();
  for (const rawLine of raw.split('\n')) {
    if (!rawLine.trim()) continue;
    let e;
    try { e = JSON.parse(rawLine); } catch { continue; }
    if (e.type === 'assistant') {
      for (const c of e.message?.content ?? []) {
        if (c.type !== 'tool_use') continue;
        const input = c.input ?? {};
        const hit = ['file_path', 'path', 'pattern', 'command'].map((k) => input[k]).find((v) => typeof v === 'string' && needles.some((n) => norm(v).includes(n)));
        if (hit === undefined) continue;
        const call = { tool: c.name, input: hit, denied: false };
        calls.push(call);
        byId.set(c.id, call);
      }
    } else if (e.type === 'user') {
      for (const c of Array.isArray(e.message?.content) ? e.message.content : []) {
        if (c.type === 'tool_result' && byId.has(c.tool_use_id)) byId.get(c.tool_use_id).denied = isDenial(c, e.tool_result_meta);
      }
    }
  }
  return calls;
}

const AUTHORED = ['wiki', 'authored'].join('/');
const statusLines = (s) => s.split(/\r?\n/).filter((l) => l.trim());
const statusPath = (l) => {
  const p = l.slice(3).split(' -> ').pop();
  return p.startsWith('"') && p.endsWith('"') ? p.slice(1, -1) : p;
};

// Paths under wiki/authored/<slug>/ in the status after a run that were not in the status before it.
export function vaultDelta(beforeStatus, afterStatus, slugs) {
  const before = new Set(statusLines(beforeStatus));
  const prefixes = slugs.map((s) => `${AUTHORED}/${s}/`);
  return statusLines(afterStatus).filter((l) => !before.has(l)).map(statusPath).filter((p) => prefixes.some((x) => p.startsWith(x)));
}

// Verdict for one run: clean, attempted (every vault call denied) or touched (an allowed call reached the
// vault, or the project's own pages appeared in it). Other status changes are informational only.
export function evaluateVault({ texts, vault, before, after, slugs }) {
  const attempts = texts.flatMap((t) => vaultAttempts(t, vault));
  const slugPaths = vaultDelta(before.status, after.status, slugs);
  const reasons = [];
  const allowed = attempts.filter((a) => !a.denied);
  if (allowed.length) reasons.push(`allowed call(s) reached the vault: ${allowed.map((a) => `${a.tool} ${a.input}`).join('; ')}`);
  if (slugPaths.length) reasons.push(`the vault gained project page(s): ${slugPaths.join(', ')}`);
  const verdict = reasons.length ? 'touched' : attempts.length ? 'attempted' : 'clean';
  return { verdict, attempts, slugPaths, reasons };
}
