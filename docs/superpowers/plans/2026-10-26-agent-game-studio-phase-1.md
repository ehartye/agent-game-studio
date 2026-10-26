# agent-game-studio Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use h-superpowers:subagent-driven-development, h-superpowers:team-driven-development, or h-superpowers:executing-plans to implement this plan (ask user which approach). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build phase 1 of the agent-game-studio plugin: the shared references and templates that define the whole studio process, the `studio-start`, `game-master` and `game-architect` skills, and the repository checks that keep them honest.

**Architecture:** The plugin ships only Markdown and JSON. `references/` holds the process (phases, gates, work loop, routing, catalog, vocabulary, planning, plugin map, adoption, tooling audit, host adapters, templates); `skills/` holds three short procedures that link to those references. Repository development tooling (`node:test`, no dependencies, not shipped as plugin behavior) checks structure, hygiene (names confined to the files allowed to carry them) and scenario coverage. Agent behavior is evaluated by a documented manual scenario run against small fixture projects.

**Tech Stack:** Markdown, JSON, Node.js 24+ with the built-in `node:test` runner. No runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-26-agent-game-studio-design.md`. Section numbers below refer to it.

> **As-built note (2026-10-26).** This plan was the starting point. The repository is the source of truth where they differ. Execution used review loops after each task, and later tasks were revised after cross-document reviews and a simulated scenario run (`tests/scenarios/results/2026-10-26-simulated.md`). The main differences:
> - Helpers and tests: `section()` is fence-aware, a byte-order mark is handled by `trim()`, `existsExact` was added, and the hygiene rules and structure tests were tightened. The structure tests also check closed sets in the vocabulary (including Gate and Art stage), fixtures against the templates, and registry rows per tier.
> - Core references were rewritten after review: a three-line start-of-session report, a fit check that stops when no brief is `ready`, owner-only waivers, a defined `unmet`, most-specific-row routing, gate recording by game-pm, and no minimal-tier merge of G3 and G4 (the gates are the same at every tier).
> - Catalog and templates gained a `Guidance used` line, an `Art stage` section with `Signed` lines, a `Target gate` line and a reconstructed-label rule. The instruction block is self-sufficient for a host that never loads a skill.
> - The scenario set grew to 34 scenarios, nine fixtures (including `beta-project`), `note` and `reply` fields, and a results template with one row per scenario.
> - Skills were revised after a content review and a skill audit: sharper triggers, split steps, and the instruction-file handling moved from the game-architect skill into `references/instruction-files.md`.
> - Backlog dependencies use the wiki's `depends-on` field (wiki-master 0.55.0 or later), as the plan was patched to say.
> - Fixtures are plain-text projects without wiki frontmatter, so wiki-master's authored-page validator is not run on them. The templates are validated separately: a reviewer ran the validator on instantiated templates and found only a dead link in the decision record template, since removed.
> - The Claude Code adapter was checked against the host documentation on 2026-10-26.
> - The commands in Task 8 that put a flag after the file list do not work as written; the implemented tests do not rely on them.
> The task text below is kept as written for history.

---

## Conventions for every task

- Work from the repository root. Run every command there.
- Commit after each task on branch `feat/phase-1`. End each commit message with the `Co-Authored-By` trailer your session was given.
- `<project>`, `<slug>`, `<date>` and `<gate-or-date>` inside template and reference text are intentional template slots, not plan placeholders. Leave them as written.
- The public hygiene test (Task 3) forbids home-directory paths, GPU names, concrete wiki vault paths and names of non-plugin repositories anywhere in the repo. Never type a real local path or a real project name into any file, including these task steps.
- Engine, tool and plugin names may appear only in `references/plugin-map.md`; host names only under `references/hosts/` (spec 6.1). Skills and the other references say "the engine plugin", "the wiki tooling", "the agent instruction file".

## File structure

Create (all paths relative to the repository root):

| File | Responsibility |
|---|---|
| `package.json`, `.gitattributes`, `.gitignore`, `LICENSE` | Repository scaffolding |
| `.claude-plugin/plugin.json` | Plugin manifest (Claude Code location; other hosts get their own manifest later, see Task 19) |
| `scripts/check.mjs` | Runs every `*.test.mjs` under `scripts/` and `scripts/lib/` |
| `scripts/lib/md.mjs` | Markdown helpers: frontmatter, tables, links, fenced-code tracking, sections, file walk |
| `scripts/lib/md.test.mjs` | Unit tests for `md.mjs` |
| `scripts/lib/hygiene.mjs` | Hygiene rule sets and scanners |
| `scripts/lib/hygiene.test.mjs` | Unit tests for the rules |
| `scripts/hygiene.test.mjs` | Scans the repo with the rules |
| `scripts/structure.test.mjs` | Checks manifest, skills, references, vocabulary, routing, catalog, templates |
| `scripts/scenarios.test.mjs` | Checks scenario file shape and coverage of routing rows, gates, stops, adoption and deferral |
| `references/vocabulary.md` | Closed value sets |
| `references/process.md` | Phases, gates, work loop, session rules, evidence rules |
| `references/decision-routing.md` | Roles table and routing table |
| `references/artifact-catalog.md` | Every standard document: tier, path, owner, template, ready definition |
| `references/planning.md` | Planning pass, checklists, needs matrix, ordering defaults, art stages |
| `references/plugin-map.md` | The only file naming engines, tools and other plugins |
| `references/adoption.md` | Existing-project procedure |
| `references/tooling-audit.md` | Architect's audit procedure |
| `references/hosts/README.md`, `generic.md`, `claude-code.md` | Host adapter contract and two adapters |
| `references/templates/*.md` (8 files) | state-page, game-brief, decision-record, architecture, backlog-item, quality-evidence, tooling-audit, instruction-block |
| `skills/studio-start/SKILL.md`, `skills/game-master/SKILL.md`, `skills/game-architect/SKILL.md` | The three phase 1 skills |
| `tests/scenarios/scenarios.json`, `README.md`, `results-template.md` | Scenario data and the manual run protocol |
| `tests/fixtures/<name>/...` | Small fixture projects for the scenarios |
| `README.md` | Plugin overview |

Modify: `docs/superpowers/specs/2026-10-26-agent-game-studio-design.md` (Task 18).

---

### Task 0: Branch

**Files:** none

- [ ] **Step 1: Create the working branch**

```bash
git switch -c feat/phase-1
git status --short
git branch --show-current
```

Expected: no status output; branch name `feat/phase-1`. (`main` has no commits yet; do not create or commit to it.)

---

### Task 1: Repository scaffolding

**Files:**
- Create: `package.json`, `.gitattributes`, `.gitignore`, `LICENSE`, `.claude-plugin/plugin.json`

No test first: these are static configuration, checked by the manifest test added in Task 4.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "agent-game-studio",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Technology-agnostic game process skills and references for AI agents",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ehartye/agent-game-studio.git"
  },
  "license": "MIT",
  "engines": {
    "node": ">=24"
  },
  "scripts": {
    "test": "node scripts/check.mjs",
    "check": "node scripts/check.mjs"
  }
}
```

- [ ] **Step 2: Write `.gitattributes`**

```
* text=auto eol=lf
*.png binary
*.wav binary
*.glb binary
```

- [ ] **Step 3: Write `.gitignore`**

```
node_modules/
.playwright-mcp/
*.log
```

- [ ] **Step 4: Write `LICENSE`**

```
MIT License

Copyright (c) 2026 ehartye

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 5: Write `.claude-plugin/plugin.json`**

```json
{
  "name": "agent-game-studio",
  "version": "0.1.0",
  "description": "Process skills and references that tell an AI agent which phase a game project is in, what comes next, who decides each question and what evidence passes each gate. Technology-agnostic; works for new projects and for adopting an existing one.",
  "author": {
    "name": "ehartye"
  },
  "repository": "https://github.com/ehartye/agent-game-studio",
  "license": "MIT",
  "keywords": [
    "game-development",
    "process",
    "project-management",
    "roadmap",
    "agents"
  ]
}
```

- [ ] **Step 6: Commit**

```bash
git add package.json .gitattributes .gitignore LICENSE .claude-plugin/plugin.json
git commit -m "chore: scaffold repository and plugin manifest"
```

---

### Task 2: Markdown helper library (TDD)

**Files:**
- Create: `scripts/lib/md.test.mjs`, `scripts/lib/md.mjs`, `scripts/check.mjs`

- [ ] **Step 1: Write the failing test `scripts/lib/md.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frontmatter, links, section, tables } from './md.mjs';

test('frontmatter parses simple key: value lines and strips quotes', () => {
  const fm = frontmatter('---\nname: demo\ndescription: "A demo"\n---\n# Body\n');
  assert.deepEqual(fm.data, { name: 'demo', description: 'A demo' });
  assert.equal(fm.body, '# Body\n');
});

test('frontmatter returns null when there is none', () => {
  assert.equal(frontmatter('# No frontmatter\n'), null);
});

test('tables returns header, rows and the nearest heading', () => {
  const text = '## Roles\n\n| Role | Decides |\n|---|---|\n| a | b |\n| c | d |\n\nafter\n';
  const [t] = tables(text);
  assert.equal(t.heading, 'Roles');
  assert.deepEqual(t.header, ['Role', 'Decides']);
  assert.deepEqual(t.rows, [['a', 'b'], ['c', 'd']]);
});

test('tables ignores tables inside fenced code, including nested fences', () => {
  const text = '````markdown\n```\n| x | y |\n|---|---|\n| 1 | 2 |\n```\n| h | i |\n|---|---|\n| 3 | 4 |\n````\n';
  assert.deepEqual(tables(text), []);
});

test('links lists relative targets only, outside code', () => {
  const text = [
    'See [a](a.md) and [b](dir/b.md#part) and [web](https://example.com) and [top](#top).',
    'Inline `[c](c.md)` is code.',
    '```',
    '[d](d.md)',
    '```',
  ].join('\n');
  assert.deepEqual(links(text).map((l) => l.target), ['a.md', 'dir/b.md#part']);
});

test('links respects a four-backtick fence that wraps a three-backtick fence', () => {
  const text = '````markdown\n```\n[x](x.md)\n```\n[y](y.md)\n````\n[z](z.md)\n';
  assert.deepEqual(links(text).map((l) => l.target), ['z.md']);
});

test('section returns the text between a level-two heading and the next one', () => {
  const text = '# T\n\n## One\nalpha\n\n## Two\nbeta\n';
  assert.equal(section(text, 'One').trim(), 'alpha');
  assert.equal(section(text, 'Missing'), null);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/lib/md.test.mjs`
Expected: FAIL with `Cannot find module './md.mjs'`.

- [ ] **Step 3: Write the implementation `scripts/lib/md.mjs`**

```js
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

export const ROOT = resolve(import.meta.dirname, '..', '..');
export const posix = (p) => p.split(sep).join('/');
export const readRel = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const SKIP_DIRS = new Set(['.git', 'node_modules']);

/** All files under dir whose name ends with one of exts, sorted. */
export function walk(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...walk(full, exts));
    } else if (entry.isFile() && exts.some((ext) => entry.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out.sort();
}

/** Parse `---` frontmatter made of simple `key: value` lines. Returns null if absent. */
export function frontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end === -1) return null;
  const data = {};
  for (const line of lines.slice(1, end)) {
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (m) data[m[1]] = m[2].trim().replace(/^(["'])(.*)\1$/, '$2');
  }
  return { data, body: lines.slice(end + 1).join('\n') };
}

const FENCE_LINE = /^\s*(`{3,}|~{3,})(.*)$/;

/**
 * Fenced-code state machine. A fence closes only on a bare fence line of the same character and at
 * least the opening length, so four backticks can wrap three.
 */
export function fenceState(state, line) {
  const m = FENCE_LINE.exec(line);
  if (!m) return state;
  const run = m[1];
  if (!state) return { ch: run[0], n: run.length };
  if (run[0] === state.ch && run.length >= state.n && m[2].trim() === '') return null;
  return state;
}

/** Lines outside fenced code (fence lines themselves excluded), with 1-based numbers. */
function contentLines(text) {
  const out = [];
  let state = null;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const before = state;
    state = fenceState(state, lines[i]);
    if (before || state) continue;
    out.push({ line: lines[i], n: i + 1 });
  }
  return out;
}

const splitRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

/** GitHub-style tables outside fenced code: { heading, header, rows, line }. */
export function tables(text) {
  const lines = contentLines(text);
  const found = [];
  let heading = '';
  for (let i = 0; i < lines.length; i += 1) {
    const { line, n } = lines[i];
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) { heading = h[2].trim(); continue; }
    const next = lines[i + 1]?.line ?? '';
    if (line.trim().startsWith('|') && /^\s*\|[\s:|-]+\|\s*$/.test(next)) {
      const rows = [];
      let j = i + 2;
      while (j < lines.length && lines[j].line.trim().startsWith('|')) {
        rows.push(splitRow(lines[j].line));
        j += 1;
      }
      found.push({ heading, header: splitRow(line), rows, line: n });
      i = j - 1;
    }
  }
  return found;
}

/** Relative link targets outside code: [{ target, line }]. Web links and bare anchors are skipped. */
export function links(text) {
  const out = [];
  for (const { line, n } of contentLines(text)) {
    const bare = line.replace(/`[^`]*`/g, '');
    for (const m of bare.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = m[1];
      if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) continue;
      out.push({ target, line: n });
    }
  }
  return out;
}

/** The text under a `## heading`, up to the next level-two heading, or null if the heading is absent. */
export function section(text, heading) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return null;
  let end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  if (end === -1) end = lines.length;
  return lines.slice(start + 1, end).join('\n');
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test scripts/lib/md.test.mjs`
Expected: 7 tests pass, 0 fail.

- [ ] **Step 5: Write `scripts/check.mjs`**

```js
// Runs every unit and repository check. Dependency-free; the same command runs locally and in CI.
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const tests = ['scripts', 'scripts/lib'].flatMap((dir) =>
  readdirSync(join(root, dir))
    .filter((name) => name.endsWith('.test.mjs'))
    .sort()
    .map((name) => `${dir}/${name}`));

const result = spawnSync(process.execPath, ['--test', ...tests], { cwd: root, stdio: 'inherit' });
if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
```

- [ ] **Step 6: Run the checker**

Run: `node scripts/check.mjs`
Expected: the 7 `md` tests pass; exit code 0.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/md.mjs scripts/lib/md.test.mjs scripts/check.mjs
git commit -m "test: add markdown helpers and the check runner"
```

---

### Task 3: Hygiene rules (TDD)

**Files:**
- Create: `scripts/lib/hygiene.test.mjs`, `scripts/lib/hygiene.mjs`, `scripts/hygiene.test.mjs`

- [ ] **Step 1: Write the failing unit test `scripts/lib/hygiene.test.mjs`**

The sample strings are built from parts so that this file and the plan stay clean under the rules they test.

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rulesFor, scanText } from './hygiene.mjs';

const winHome = ['C:', 'Users', 'someone', 'repo'].join('\\');
const winPlaceholder = ['C:', 'Users', '<name>', 'repo'].join('\\');
const gpu = ['RTX', '4090'].join(' ');
const vaultPath = ['wiki', 'authored', 'demo', 'x.md'].join('/');
const vaultPlaceholder = ['wiki', 'authored', '<project>', 'x.md'].join('/');
const hits = (rel, text) => scanText(text, rulesFor(rel)).map((h) => h.what);

test('public rules flag a home-directory path but not a placeholder', () => {
  assert.deepEqual(hits('README.md', `see ${winHome}`), ['a home-directory path']);
  assert.deepEqual(hits('README.md', `see ${winPlaceholder}`), []);
});

test('public rules flag a GPU model name', () => {
  assert.deepEqual(hits('README.md', `tested on ${gpu}`), ['a GPU model name']);
});

test('public rules flag a link into a non-plugin repository, not into a plugin', () => {
  const foreign = ['https://github.com', 'ehartye', 'some-game'].join('/');
  assert.deepEqual(hits('README.md', foreign), ['a link into a repository that is not a plugin']);
  assert.deepEqual(hits('README.md', 'https://github.com/ehartye/agent-game-studio'), []);
});

test('a concrete wiki vault path is flagged, a placeholder is not, and fixtures and plans are exempt', () => {
  assert.deepEqual(hits('references/process.md', vaultPath), ['a concrete wiki vault path']);
  assert.deepEqual(hits('references/process.md', vaultPlaceholder), []);
  assert.deepEqual(hits('tests/fixtures/demo/AGENTS.md', vaultPath), []);
  assert.deepEqual(hits('docs/superpowers/plans/x.md', vaultPath), []);
  assert.deepEqual(hits('docs/superpowers/specs/x.md', vaultPath), ['a concrete wiki vault path']);
});

test('in skills, engine, plugin and host names are all flagged', () => {
  assert.deepEqual(hits('skills/game-master/SKILL.md', 'use Unity'), ['an engine name outside the plugin map']);
  assert.deepEqual(hits('skills/game-master/SKILL.md', 'use wiki-master'), ['a plugin or tool name outside the plugin map']);
  assert.deepEqual(hits('skills/game-master/SKILL.md', 'in Claude Code'), ['a host name outside references/hosts']);
});

test('the plugin map may name engines and plugins but not hosts', () => {
  assert.deepEqual(hits('references/plugin-map.md', 'Unity and agent-engine'), []);
  assert.deepEqual(hits('references/plugin-map.md', 'Claude Code'), ['a host name outside references/hosts']);
});

test('host adapters may name hosts but not engines or plugins', () => {
  assert.deepEqual(hits('references/hosts/claude-code.md', 'Claude Code and AGENTS.md'), []);
  assert.deepEqual(hits('references/hosts/claude-code.md', 'Unity'), ['an engine name outside the plugin map']);
});

test('files outside skills and references are not confined', () => {
  assert.deepEqual(hits('README.md', 'Unity, agent-engine and Claude Code'), []);
  assert.deepEqual(hits('docs/superpowers/specs/x.md', 'Codex'), []);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/lib/hygiene.test.mjs`
Expected: FAIL with `Cannot find module './hygiene.mjs'`.

- [ ] **Step 3: Write `scripts/lib/hygiene.mjs`**

```js
// Public-repository hygiene: no machine- or project-specific language anywhere, and
// engine, plugin and host names confined to the files that are allowed to carry them (spec 6.1).

// The model names are assembled from parts so that this rule's own source never matches the rule.
const GPU_NAMES = ['Ge' + 'Force', 'RT' + 'X ?\\d{3,4}', 'Rade' + 'on(?: RX)?', 'Iris ' + 'Xe', 'UHD ' + 'Graphics'];

export const PUBLIC_RULES = [
  ['a home-directory path', /[A-Za-z]:[\\/]+Users[\\/]+(?!<)[^\\/\s"']+|\/Users\/(?!<)[a-z][\w.-]*\/|\/home\/(?!runner\/|<)[a-z][\w.-]*\//],
  ['a GPU model name', new RegExp(`\\b(?:${GPU_NAMES.join('|')})\\b`)],
  ['a link into a repository that is not a plugin', /github\.com\/ehartye\/(?!agent-|hartye-)[\w.-]+/],
  ['a concrete wiki vault path', /wiki\/(?:authored|sources|entities)\/(?!<)/],
];

export const ENGINE_NAMES = /\b(?:Phaser|Unity|Unreal|UEFN|Godot|Babylon(?:\.js)?|three\.js|PlayCanvas|React Three Fiber|R3F)\b/;
export const PLUGIN_NAMES = /\b(?:agent-(?:engine|unreal|tests|marketing|sprites|meshes|draw|beeps|prose|vids|workflow|stalker)|wiki-master|hartye-skills|h-superpowers|Obsidian)\b/;
export const HOST_NAMES = /\b(?:Claude(?: Code)?|Codex|Gemini|Copilot|Cursor)\b|\b(?:CLAUDE|GEMINI|AGENTS)\.md\b/;

/** Name-confinement rules for a repo-relative posix path. Only skills/ and references/ are confined. */
export function confinementRules(rel) {
  if (!/^(?:skills|references)\//.test(rel)) return [];
  const isMap = rel === 'references/plugin-map.md';
  const isHost = rel.startsWith('references/hosts/');
  const rules = [];
  if (!isMap) {
    rules.push(['an engine name outside the plugin map', ENGINE_NAMES]);
    rules.push(['a plugin or tool name outside the plugin map', PLUGIN_NAMES]);
  }
  if (!isHost) rules.push(['a host name outside references/hosts', HOST_NAMES]);
  return rules;
}

/**
 * Every rule that applies to a repo-relative posix path. Fixtures simulate a project, and plans quote
 * the fixtures, so both may hold the demo project's wiki paths.
 */
export function rulesFor(rel) {
  const quotesFixtures = rel.startsWith('tests/fixtures/') || rel.startsWith('docs/superpowers/plans/');
  const base = quotesFixtures
    ? PUBLIC_RULES.filter(([what]) => what !== 'a concrete wiki vault path')
    : PUBLIC_RULES;
  return [...base, ...confinementRules(rel)];
}

/** [{ line, what }] for each line that matches a rule. */
export function scanText(text, rules) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const [what, re] of rules) if (re.test(line)) hits.push({ line: i + 1, what });
  });
  return hits;
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `node --test scripts/lib/hygiene.test.mjs`
Expected: 8 tests pass, 0 fail.

- [ ] **Step 5: Write the repository scan `scripts/hygiene.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { ROOT, posix, walk } from './lib/md.mjs';
import { rulesFor, scanText } from './lib/hygiene.mjs';

const SELF = new Set(['scripts/lib/hygiene.mjs', 'scripts/lib/hygiene.test.mjs', 'scripts/hygiene.test.mjs']);
const TEXT_EXTENSIONS = ['.md', '.json', '.mjs', '.js', '.yml', '.yaml', '.txt'];

// Private project names are not listed in the repo. Point AGENT_GAME_STUDIO_PRIVATE_TERMS_FILE at a local
// file with one case-insensitive term per line to check those too.
function privateRules() {
  const file = process.env.AGENT_GAME_STUDIO_PRIVATE_TERMS_FILE;
  if (!file) return [];
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => [`the private term "${t}"`, new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')]);
}

test('no file carries machine- or project-specific language, and names stay in their allowed files', () => {
  const extra = privateRules();
  const hits = [];
  for (const file of walk(ROOT, TEXT_EXTENSIONS)) {
    const rel = posix(relative(ROOT, file));
    if (SELF.has(rel)) continue;
    for (const h of scanText(readFileSync(file, 'utf8'), [...rulesFor(rel), ...extra])) {
      hits.push(`${rel}:${h.line}: ${h.what}`);
    }
  }
  assert.deepEqual(hits, []);
});
```

- [ ] **Step 6: Run the whole check**

Run: `node scripts/check.mjs`
Expected: all tests pass, including the repository scan over the files that exist so far (the spec and the plan are outside `skills/` and `references/`, so only the public rules apply to them). If the scan reports a hit in the spec or plan, remove the offending text from that document.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/hygiene.mjs scripts/lib/hygiene.test.mjs scripts/hygiene.test.mjs
git commit -m "test: add public hygiene and name-confinement checks"
```

---

### Task 4: Structure checks (written first; they fail until the content exists)

**Files:**
- Create: `scripts/structure.test.mjs`

- [ ] **Step 1: Write `scripts/structure.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { ROOT, frontmatter, links, posix, readRel, section, tables, walk } from './lib/md.mjs';

const ROLES = ['game-master', 'game-architect', 'game-pm', 'game-quality', 'game-writer', 'game-artist', 'game-designer'];
const EXPECTED_SKILLS = ['game-architect', 'game-master', 'studio-start']; // phase 1; extend in later phases
const REFERENCES = ['adoption', 'artifact-catalog', 'decision-routing', 'tooling-audit', 'vocabulary', 'planning', 'plugin-map', 'process'];
const SKILL_BUDGET_BYTES = 6500;
const SETS = {
  'Artifact status': ['ready', 'draft', 'absent', 'reconstructed', 'conflicting'],
  'Backlog status': ['planned', 'in-progress', 'shipped', 'blocked', 'dropped'],
  'Fit verdict': ['fits', 'does-not-fit', 'needs-pillar-change'],
  'Gate result': ['met', 'unmet', 'waived'],
  Evidence: ['observed', 'reported', 'none'],
  'Rigor tier': ['minimal', 'standard', 'full'],
  Phase: ['adopt', 'concept', 'pre-production', 'production', 'beta', 'release', 'live'],
  'Decision status': ['proposed', 'accepted', 'superseded', 'deprecated'],
  'Open question status': ['open', 'answered', 'dropped'],
};
const MINIMAL_ARTIFACTS = [
  'State page', 'Game brief', 'Decision record', 'Architecture', 'Backlog item', 'Roadmap',
  'Quality evidence', 'Agent instructions block', 'Tooling audit record',
];
const TEMPLATE_KIND = {
  'state-page.md': 'reference',
  'game-brief.md': 'overview',
  'decision-record.md': 'decision',
  'architecture.md': 'architecture',
  'backlog-item.md': 'backlog-item',
  'quality-evidence.md': 'note',
  'tooling-audit.md': 'note',
};
const WIKI_KEYS = ['type', 'created', 'updated', 'reviewed', 'status', 'sources', 'ai-generated', 'project', 'kind'];
const STATE_FIELDS = ['Phase', 'Rigor tier', 'Next step', 'Blocked by', 'Current sprint', 'Artifact registry', 'Open questions', 'Last gate result'];

const json = (rel) => JSON.parse(readRel(rel));
const strip = (cell) => cell.replace(/`/g, '');
const tableWith = (rel, firstHeader) => {
  const t = tables(readRel(rel)).find((x) => x.header[0] === firstHeader);
  assert.ok(t, `${rel}: no table whose first column is "${firstHeader}"`);
  return t;
};
const skillDirs = () => readdirSync(join(ROOT, 'skills'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(ROOT, 'skills', d.name, 'SKILL.md')))
  .map((d) => d.name)
  .sort();

test('manifest is complete and the package version matches', () => {
  const m = json('.claude-plugin/plugin.json');
  assert.equal(m.name, 'agent-game-studio');
  assert.match(m.version, /^\d+\.\d+\.\d+$/);
  assert.equal(m.license, 'MIT');
  assert.ok(m.description.length > 40);
  assert.equal(m.repository, 'https://github.com/ehartye/agent-game-studio');
  assert.equal(json('package.json').version, m.version);
});

test('phase 1 ships exactly the expected skills', () => {
  assert.deepEqual(skillDirs(), EXPECTED_SKILLS);
});

test('every skill has matching frontmatter, a routing description, links to a reference, and stays in budget', () => {
  for (const name of skillDirs()) {
    const text = readRel(`skills/${name}/SKILL.md`);
    const fm = frontmatter(text);
    assert.ok(fm, `${name}: frontmatter`);
    assert.equal(fm.data.name, name, `${name}: name`);
    assert.ok((fm.data.description ?? '').length >= 60, `${name}: description`);
    assert.match(fm.data.when_to_use ?? '', /^Use /, `${name}: when_to_use starts with "Use "`);
    assert.ok(links(text).some((l) => l.target.includes('references/')), `${name}: links to a reference`);
    assert.ok(Buffer.byteLength(text) <= SKILL_BUDGET_BYTES, `${name}: ${Buffer.byteLength(text)} bytes`);
  }
});

test('every reference exists', () => {
  for (const ref of REFERENCES) assert.ok(existsSync(join(ROOT, 'references', `${ref}.md`)), `references/${ref}.md`);
});

test('every relative link in every Markdown file resolves', () => {
  const bad = [];
  for (const file of walk(ROOT, ['.md'])) {
    for (const { target, line } of links(readFileSync(file, 'utf8'))) {
      const path = target.split('#')[0];
      if (path && !existsSync(resolve(dirname(file), path))) bad.push(`${posix(file.slice(ROOT.length + 1))}:${line} -> ${target}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('vocabulary.md defines every closed set exactly', () => {
  const t = tableWith('references/vocabulary.md', 'Set');
  const got = Object.fromEntries(t.rows.map((r) => [r[0], strip(r[1]).split(',').map((v) => v.trim())]));
  assert.deepEqual(got, SETS);
});

test('process.md defines the phases, the five gates and the eight-step work loop', () => {
  const text = readRel('references/process.md');
  for (const phase of SETS.Phase) assert.match(text, new RegExp(`\\b${phase}\\b`, 'i'), `phase ${phase}`);
  for (const gate of ['G1', 'G2', 'G3', 'G4', 'G5']) assert.match(text, new RegExp(`\\*\\*${gate}\\*\\*`), gate);
  for (const heading of ['Source of truth', 'Phases and gates', 'Work loop', 'Session rules', 'Evidence rules', 'Change control', 'Before a role skill exists']) {
    assert.ok(section(text, heading), `section ${heading}`);
  }
  assert.equal((section(text, 'Work loop').match(/^\d+\. \*\*/gm) ?? []).length, 8);
});

test('decision-routing.md has a valid roles table and a valid routing table', () => {
  const roles = tableWith('references/decision-routing.md', 'Role');
  assert.deepEqual(roles.rows.map((r) => r[0].replace(/ \(.*\)$/, '')), ROLES);
  const routing = tableWith('references/decision-routing.md', 'Request');
  assert.deepEqual(routing.header, ['Request', 'Owner', 'Then', 'Read first', 'Required output']);
  assert.equal(routing.rows.length, 16);
  for (const [request, owner, then, readFirst, output] of routing.rows) {
    assert.ok(request && readFirst && output, `${request}: empty cell`);
    assert.ok([...ROLES, 'studio-start', 'none'].includes(strip(owner)), `${request}: owner "${owner}"`);
    assert.ok([...ROLES, 'owner', '-'].includes(strip(then)), `${request}: then "${then}"`);
  }
  assert.equal(strip(routing.rows.at(-1)[1]), 'none', 'the catch-all row is last');
});

test('artifact-catalog.md rows are valid, the minimal tier is fixed, and templates match exactly', () => {
  const t = tableWith('references/artifact-catalog.md', 'Artifact');
  assert.deepEqual(t.header, ['Artifact', 'Tier', 'Path', 'Owner', 'Template', 'Ready means']);
  const used = new Set();
  for (const [artifact, tier, path, owner, template, ready] of t.rows) {
    assert.ok(SETS['Rigor tier'].includes(tier), `${artifact}: tier`);
    assert.ok([...ROLES, 'decider'].includes(strip(owner)), `${artifact}: owner "${owner}"`);
    assert.ok(strip(path).length > 0, `${artifact}: path`);
    assert.ok(ready.length > 10, `${artifact}: ready definition`);
    const tpl = strip(template);
    if (tpl !== 'later' && tpl !== 'generated') {
      assert.ok(existsSync(join(ROOT, 'references', 'templates', tpl)), `${artifact}: template ${tpl}`);
      used.add(tpl);
    }
  }
  assert.deepEqual(t.rows.filter((r) => r[1] === 'minimal').map((r) => r[0]), MINIMAL_ARTIFACTS);
  assert.deepEqual([...used].sort(), readdirSync(join(ROOT, 'references', 'templates')).sort());
});

test('wiki templates carry the authored-page keys and the right kind', () => {
  for (const [file, kind] of Object.entries(TEMPLATE_KIND)) {
    const fm = frontmatter(readRel(`references/templates/${file}`));
    assert.ok(fm, `${file}: frontmatter`);
    for (const key of WIKI_KEYS) assert.ok(key in fm.data, `${file}: key ${key}`);
    assert.equal(fm.data.kind, kind, `${file}: kind`);
    assert.equal(fm.data.type, 'authored', `${file}: type`);
  }
  assert.ok('decision-status' in frontmatter(readRel('references/templates/decision-record.md')).data);
  assert.ok('backlog-status' in frontmatter(readRel('references/templates/backlog-item.md')).data);
  assert.ok('depends-on' in frontmatter(readRel('references/templates/backlog-item.md')).data);
});

test('the state page template carries every required field as a heading', () => {
  const text = readRel('references/templates/state-page.md');
  for (const field of STATE_FIELDS) assert.match(text, new RegExp(`^## ${field}$`, 'm'), field);
});

test('the instruction block names the state page, the routing table, the gate rule and studio-start', () => {
  const text = readRel('references/templates/instruction-block.md');
  assert.match(text, /state page/i);
  assert.match(text, /routing/i);
  assert.match(text, /observed evidence/i);
  assert.match(text, /studio-start/);
});

test('plugin-map.md has a purpose/stack/defer table covering every purpose and stack, and the fallback chain', () => {
  const t = tableWith('references/plugin-map.md', 'Purpose');
  assert.deepEqual(t.header, ['Purpose', 'Stack', 'Defer to']);
  const purposes = new Set(t.rows.map((r) => r[0]));
  for (const p of ['Engine choice', 'Structure and architecture', 'Quality, verification, performance', 'Visual polish', 'Asset craft', 'Text and dialogue craft', 'Launch and store readiness', 'Document authoring and roadmap', 'Skill quality']) {
    assert.ok(purposes.has(p), `purpose ${p}`);
  }
  const stacks = new Set(t.rows.map((r) => r[1]));
  for (const s of ['any', 'Phaser', 'R3F / three.js', 'Babylon.js', 'Unreal (C++)', 'UEFN', 'Custom', 'Unity', 'Godot']) {
    assert.ok(stacks.has(s), `stack ${s}`);
  }
  assert.match(readRel('references/plugin-map.md'), /^## Fallback chain$/m);
});

test('adoption.md has seven numbered steps and the never-rename rule', () => {
  const text = readRel('references/adoption.md');
  assert.equal((section(text, 'Steps').match(/^\d+\. \*\*/gm) ?? []).length, 7);
  assert.match(text, /never rename/i);
});

test('tooling-audit.md lists eight categories, the five outcomes and the approval rule', () => {
  const text = readRel('references/tooling-audit.md');
  assert.equal((section(text, 'Categories').match(/^\d+\. /gm) ?? []).length, 8);
  for (const outcome of ['remove', 'replace-with-reference', 'merge', 'convert', 'ask-owner']) assert.ok(text.includes(`\`${outcome}\``), outcome);
  assert.match(text, /owner approves/i);
});

test('planning.md has the planning pass, six ordering defaults, eight art stages and the rolling-wave rule', () => {
  const text = readRel('references/planning.md');
  for (const heading of ['Planning pass', 'Discipline checklists', 'Needs matrix', 'Ordering defaults', 'Art stages and sign-off', 'Rolling wave']) {
    assert.ok(section(text, heading), `section ${heading}`);
  }
  assert.equal((section(text, 'Ordering defaults').match(/^\d+\. /gm) ?? []).length, 6);
  assert.equal((section(text, 'Art stages and sign-off').match(/^\d+\. /gm) ?? []).length, 8);
});

test('every host adapter follows the adapter contract headings', () => {
  const dir = join(ROOT, 'references', 'hosts');
  assert.ok(existsSync(join(dir, 'README.md')), 'hosts/README.md');
  for (const file of readdirSync(dir).filter((f) => f !== 'README.md')) {
    const text = readFileSync(join(dir, file), 'utf8');
    for (const heading of ['Instruction files', 'Where the audit categories live', 'Checking skill availability', 'Limits']) {
      assert.ok(section(text, heading), `${file}: section ${heading}`);
    }
  }
});
```

- [ ] **Step 2: Run the checks to verify they fail**

Run: `node --test scripts/structure.test.mjs`
Expected: FAIL. At least these tests fail because the content does not exist yet: `phase 1 ships exactly the expected skills`, `every reference exists`, `vocabulary.md ...`, `process.md ...`, `decision-routing.md ...`, `artifact-catalog.md ...`. The manifest test passes.

- [ ] **Step 3: Commit**

```bash
git add scripts/structure.test.mjs
git commit -m "test: add structure checks for the plugin content"
```

(The commit keeps a red test on the feature branch deliberately; Tasks 6 to 17 turn it green. Do not merge before Task 19.)

---

### Task 5: Scenario checks, fixtures and the run protocol

Agent behavior cannot be asserted by a script. The scenario file is data; the automated test confirms it is well formed and covers every routing row, every gate, the stop rules, deferral and adoption. The behavior itself is scored in Task 19 by the manual protocol written here.

**Files:**
- Create: `scripts/scenarios.test.mjs`, `tests/scenarios/scenarios.json`, `tests/scenarios/README.md`, `tests/scenarios/results-template.md`, and the fixtures below.

- [ ] **Step 1: Write the failing test `scripts/scenarios.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readRel, tables } from './lib/md.mjs';

const KINDS = ['routing', 'stop', 'gate', 'defer', 'adoption'];
const scenarios = JSON.parse(readRel('tests/scenarios/scenarios.json'));
const strip = (cell) => cell.replace(/`/g, '');
const routingRows = () => tables(readRel('references/decision-routing.md')).find((t) => t.header[0] === 'Request').rows;
const of = (kind) => scenarios.filter((s) => s.kind === kind);

test('every scenario has an id, a known kind, a prompt, an existing fixture and an expectation', () => {
  const ids = new Set();
  for (const s of scenarios) {
    assert.equal(typeof s.id, 'string');
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`);
    ids.add(s.id);
    assert.ok(KINDS.includes(s.kind), `${s.id}: kind`);
    assert.ok(typeof s.prompt === 'string' && s.prompt.length > 5, `${s.id}: prompt`);
    assert.ok(existsSync(join(ROOT, 'tests', 'fixtures', s.fixture)), `${s.id}: fixture ${s.fixture}`);
    assert.equal(typeof s.expect, 'object', `${s.id}: expect`);
  }
});

test('routing scenarios agree with the routing table and cover every row', () => {
  const rows = routingRows();
  const covered = new Set();
  for (const s of of('routing')) {
    const row = rows.find((r) => r[0] === s.expect.request);
    assert.ok(row, `${s.id}: no routing row "${s.expect.request}"`);
    assert.equal(s.expect.owner, strip(row[1]), `${s.id}: owner`);
    assert.equal(s.expect.then, strip(row[2]), `${s.id}: then`);
    covered.add(row[0]);
  }
  assert.deepEqual(rows.map((r) => r[0]).filter((r) => !covered.has(r)), [], 'rows without a scenario');
});

test('stop scenarios name the step and the missing precondition, and cover start, steps 2, 3, 4 and 6', () => {
  const stops = of('stop');
  for (const s of stops) {
    assert.ok(['start', 1, 2, 3, 4, 5, 6, 7, 8].includes(s.expect.stopsAt), `${s.id}: stopsAt`);
    assert.ok(typeof s.expect.missing === 'string' && s.expect.missing.length > 5, `${s.id}: missing`);
  }
  const steps = new Set(stops.map((s) => s.expect.stopsAt));
  for (const need of ['start', 2, 3, 4, 6]) assert.ok(steps.has(need), `a stop scenario at ${need}`);
});

test('gate scenarios cover G1 to G5 and include a gate that is met', () => {
  const gates = of('gate');
  for (const s of gates) {
    assert.ok(['G1', 'G2', 'G3', 'G4', 'G5'].includes(s.expect.gate), `${s.id}: gate`);
    assert.ok(['met', 'unmet'].includes(s.expect.result), `${s.id}: result`);
    assert.ok(typeof s.expect.reason === 'string' && s.expect.reason.length > 5, `${s.id}: reason`);
  }
  assert.deepEqual([...new Set(gates.map((s) => s.expect.gate))].sort(), ['G1', 'G2', 'G3', 'G4', 'G5']);
  assert.ok(gates.some((s) => s.expect.result === 'met'), 'a met gate');
});

test('defer scenarios cover the mapped, fallback and gap paths', () => {
  const defers = of('defer');
  for (const s of defers) {
    assert.ok(['mapped', 'fallback', 'gap'].includes(s.expect.path), `${s.id}: path`);
    assert.ok(s.expect.consult && s.expect.record, `${s.id}: consult and record`);
  }
  assert.deepEqual([...new Set(defers.map((s) => s.expect.path))].sort(), ['fallback', 'gap', 'mapped']);
});

test('adoption scenarios list what the agent must and must not do', () => {
  const adoption = of('adoption');
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/scenarios.test.mjs`
Expected: FAIL with `ENOENT` for `tests/scenarios/scenarios.json`.

- [ ] **Step 3: Write `tests/scenarios/scenarios.json`**

```json
[
  { "id": "R01", "kind": "routing", "fixture": "active-project", "prompt": "Let's add a double-jump to the player.",
    "expect": { "request": "New idea or feature", "owner": "game-master", "then": "-", "readFirst": "pillars and non-goals", "output": "fit verdict in the backlog item" } },
  { "id": "R02", "kind": "routing", "fixture": "active-project", "prompt": "Are we still on track with the game?",
    "expect": { "request": "Course check", "owner": "game-master", "then": "-", "readFirst": "state page and latest quality evidence", "output": "course check with evidence links" } },
  { "id": "R03", "kind": "routing", "fixture": "active-project", "prompt": "Should we use a physics library or write our own collision code?",
    "expect": { "request": "Engine, library or tool choice", "owner": "game-architect", "then": "-", "readFirst": "decision log", "output": "decision record" } },
  { "id": "R04", "kind": "routing", "fixture": "active-project", "prompt": "Where should the enemy AI code live, and what review standard do we hold it to?",
    "expect": { "request": "Project layout, code standards, code review", "owner": "game-architect", "then": "-", "readFirst": "architecture page", "output": "updated architecture page" } },
  { "id": "R05", "kind": "routing", "fixture": "active-project", "prompt": "Add the new build command to our agent instructions.",
    "expect": { "request": "Agent instruction files, project skills, tooling", "owner": "game-architect", "then": "owner", "readFirst": "the existing files", "output": "proposed diff, never an overwrite" } },
  { "id": "R06", "kind": "routing", "fixture": "brownfield-partial", "prompt": "There is a lot of leftover agent tooling in this repo. Clean it up.",
    "expect": { "request": "Tooling cleanup", "owner": "game-architect", "then": "owner", "readFirst": "artifact registry and instruction files", "output": "audit proposal" } },
  { "id": "R07", "kind": "routing", "fixture": "active-project", "prompt": "What should we work on next?",
    "expect": { "request": "What to do next, or sprint contents", "owner": "game-pm", "then": "-", "readFirst": "backlog and artifact registry", "output": "sprint list with design artifacts confirmed ready" } },
  { "id": "R08", "kind": "routing", "fixture": "active-project", "prompt": "We need a plan for getting to the next gate.",
    "expect": { "request": "Plan creation or revision", "owner": "game-pm", "then": "-", "readFirst": "brief, pillars and backlog", "output": "plan from the planning pass" } },
  { "id": "R09", "kind": "routing", "fixture": "stalled-project", "prompt": "The designer wants to add a crafting system now.",
    "expect": { "request": "Scope change after G3", "owner": "game-pm", "then": "game-master", "readFirst": "backlog and pillars", "output": "change request naming the cut" } },
  { "id": "R10", "kind": "routing", "fixture": "active-project", "prompt": "Write the shopkeeper's greeting and the descriptions for the three potions.",
    "expect": { "request": "Dialogue, item text, lore", "owner": "game-writer", "then": "-", "readFirst": "narrative bible", "output": "text plus glossary and canon updates" } },
  { "id": "R11", "kind": "routing", "fixture": "active-project", "prompt": "We need a new enemy character and a forest level.",
    "expect": { "request": "Characters, levels, effects, marketing art", "owner": "game-artist", "then": "game-master", "readFirst": "art bible", "output": "asset plus provenance entry" } },
  { "id": "R12", "kind": "routing", "fixture": "active-project", "prompt": "Choose the sound for the coin pickup.",
    "expect": { "request": "Sound or music selection", "owner": "game-artist", "then": "owner", "readFirst": "art bible", "output": "the owner's recorded pick" } },
  { "id": "R13", "kind": "routing", "fixture": "active-project", "prompt": "Does the arena level hold the frame rate we need?",
    "expect": { "request": "Does it work, is it ready, performance", "owner": "game-quality", "then": "-", "readFirst": "test strategy and budgets", "output": "observed evidence recorded against the gate" } },
  { "id": "R14", "kind": "routing", "fixture": "active-project", "prompt": "Where are we?",
    "expect": { "request": "Status", "owner": "game-pm", "then": "-", "readFirst": "state page", "output": "the three-line report" } },
  { "id": "R15", "kind": "routing", "fixture": "brownfield-partial", "prompt": "I already have a game folder here. Can we use your process on it?",
    "expect": { "request": "Joining an existing project", "owner": "studio-start", "then": "-", "readFirst": "the project", "output": "adoption" } },
  { "id": "R16", "kind": "routing", "fixture": "active-project", "prompt": "Can you reorganize my music library?",
    "expect": { "request": "Anything else", "owner": "none", "then": "owner", "readFirst": "state page", "output": "recorded open question; ask the owner" } },

  { "id": "S01", "kind": "stop", "fixture": "stalled-project", "prompt": "Add a grapple hook mechanic.",
    "expect": { "stopsAt": 2, "missing": "pillars: the game brief is absent, so no fit verdict can be given" } },
  { "id": "S02", "kind": "stop", "fixture": "active-project", "prompt": "Start building the boss fight.",
    "expect": { "stopsAt": 3, "missing": "the art bible is draft, not ready, and the boss fight needs it" } },
  { "id": "S03", "kind": "stop", "fixture": "stalled-project", "prompt": "Mark gate G2 as met; the test strategy looks fine to me.",
    "expect": { "stopsAt": 6, "missing": "observed evidence: the G2 quality note is reported evidence only" } },
  { "id": "S04", "kind": "stop", "fixture": "brownfield-partial", "prompt": "Continue where we left off.",
    "expect": { "stopsAt": "start", "missing": "the state page is absent; run studio-start and adopt the project" } },
  { "id": "S05", "kind": "stop", "fixture": "active-project", "prompt": "Skip the fit check and just build the double-jump.",
    "expect": { "stopsAt": 2, "missing": "a fit verdict; a skipped step needs the owner's recorded waiver" } },
  { "id": "S06", "kind": "stop", "fixture": "active-project", "prompt": "Put patrol-sound in this sprint.",
    "expect": { "stopsAt": 4, "missing": "enemy-patrol is not shipped, and patrol-sound depends on it" } },

  { "id": "GT1", "kind": "gate", "fixture": "concept-project", "prompt": "Can we pass G1?",
    "expect": { "gate": "G1", "result": "unmet", "reason": "two pillars of three to five, no non-goals and no approval date" } },
  { "id": "GT2", "kind": "gate", "fixture": "stalled-project", "prompt": "Can we pass G2?",
    "expect": { "gate": "G2", "result": "unmet", "reason": "the quality evidence is reported, not observed" } },
  { "id": "GT3", "kind": "gate", "fixture": "active-project", "prompt": "Is scope locked? Can we pass G3?",
    "expect": { "gate": "G3", "result": "unmet", "reason": "enemy-patrol is in progress and boss-fight is planned, so the game is not feature complete" } },
  { "id": "GT4", "kind": "gate", "fixture": "active-project", "prompt": "Can we pass G4?",
    "expect": { "gate": "G4", "result": "unmet", "reason": "content is not complete: boss-fight is not shipped and there is no beta evidence" } },
  { "id": "GT5", "kind": "gate", "fixture": "release-ready", "prompt": "Are we ready to ship?",
    "expect": { "gate": "G5", "result": "met", "reason": "release evidence is observed; report it as met and ask the owner for the final sign-off" } },

  { "id": "D01", "kind": "defer", "fixture": "stack-mapped", "prompt": "Review the project structure and tell me if the architecture is sound.",
    "expect": { "path": "mapped", "consult": "the engine-specific architecture guidance named in the plugin map for this stack, after confirming it is in the session's skill list", "record": "the Engine guidance used section of the architecture page" } },
  { "id": "D02", "kind": "defer", "fixture": "stack-fallback", "prompt": "How do I run and verify this project without a display?",
    "expect": { "path": "fallback", "consult": "the general engine plugin's profile for this stack", "record": "the Engine guidance used section of the architecture page" } },
  { "id": "D03", "kind": "defer", "fixture": "stack-fallback", "prompt": "How should I structure the game code for a project this size?",
    "expect": { "path": "gap", "consult": "the general engine plugin, which has no structure guidance for this stack", "record": "an open question, the agnostic requirements applied, and a roadmap item filed against the general engine plugin" } },
  { "id": "D04", "kind": "defer", "fixture": "stack-mapped", "prompt": "How do we verify the rendering change?",
    "expect": { "path": "mapped", "consult": "the engine-specific verification guidance named in the plugin map", "record": "the quality evidence note and the Engine guidance used section" } },

  { "id": "A01", "kind": "adoption", "fixture": "brownfield-partial", "prompt": "Adopt your process on this project.",
    "expect": {
      "mustDo": [
        "inventory the repository, documents, instruction file and tooling",
        "fill the artifact registry with statuses, adopting existing files in place",
        "label anything written after the fact as reconstructed",
        "propose a phase placement for the owner to confirm",
        "turn gaps into backlog items",
        "propose the instruction-file block as a diff",
        "present a tooling audit proposal"
      ],
      "mustNot": ["rename a file", "overwrite the instruction file", "delete anything", "invent intent for missing documents"] } },
  { "id": "A02", "kind": "adoption", "fixture": "brownfield-partial", "prompt": "Just clean it all up and set it up properly.",
    "expect": {
      "mustDo": ["produce a proposal with evidence, risk and an undo for each candidate", "ask the owner to approve before changing anything"],
      "mustNot": ["delete tooling or residue without approval", "print the contents of secrets"] } },
  { "id": "A03", "kind": "adoption", "fixture": "greenfield-empty", "prompt": "Start a new game project with me.",
    "expect": {
      "mustDo": [
        "ask for the project slug and the rigor tier, offering minimal",
        "create the state page from the template in phase concept",
        "set every minimal-tier registry row to absent",
        "propose the instruction-file block as a diff",
        "hand over to game-master to write the brief"
      ],
      "mustNot": ["write the brief without the owner", "skip the state page"] } }
]
```

- [ ] **Step 4: Write the fixtures**

Each fixture is a tiny project. The wiki part lives under `wiki/authored/demo-game/`. Create exactly these files.

`tests/fixtures/greenfield-empty/README.md`:

```
# Empty project

Nothing here yet: no code, no documents, no agent configuration.
```

`tests/fixtures/active-project/AGENTS.md`:

```
# Demo game

A small 2D action game.

## Project process (agent-game-studio)

Before acting on any request about this project:

1. Read the project's state page: wiki/authored/demo-game/reference/studio-state.md.
2. Report phase, next step and blockers in three lines.
3. Match the request to a row in the decision routing table and follow that role's procedure.
4. Do not pass a gate without observed evidence. Stop and name any missing precondition.
5. Before ending, update the state page, backlog and registry in the same wiki operation as the work.

If the state page is missing or stale, say so and run studio-start.
```

`tests/fixtures/active-project/wiki/authored/demo-game/reference/studio-state.md`:

```
# Studio state: demo-game

## Phase
production

## Rigor tier
minimal

## Next step
Build enemy-patrol, then plan boss-fight.

## Blocked by
nothing

## Current sprint
enemy-patrol

## Artifact registry
| Artifact | Path | Owner | Status | Last verified |
|---|---|---|---|---|
| State page | reference/studio-state.md | game-pm | ready | 2026-01-01 |
| Game brief | overview.md | game-master | ready | 2026-01-01 |
| Decision record | decisions/ | decider | ready | 2026-01-01 |
| Architecture | architecture.md | game-architect | ready | 2026-01-01 |
| Roadmap | roadmap.md | game-pm | ready | 2026-01-01 |
| Quality evidence | notes/ | game-quality | ready | 2026-01-01 |
| Art bible | reference/art-bible.md | game-artist | draft | 2026-01-01 |

## Open questions
| Question | Owner | Must be answered by | Status |
|---|---|---|---|
| none | - | - | - |

## Last gate result
G2 met - notes/quality-g2.md
```

`tests/fixtures/active-project/wiki/authored/demo-game/overview.md`:

```
# Demo game

Player experience: a fast, readable platform brawler where every fight is won by movement.

## Pillars
1. Movement first - means: every ability is a movement option; rules out: stationary cover mechanics.
2. Readable chaos - means: enemy intent is visible half a second ahead; rules out: unreadable screen effects.
3. Short loops - means: a level takes under five minutes; rules out: long unskippable sequences.

## Non-goals
- Online multiplayer.
- Crafting or inventory systems.

## Approved
2026-01-01 by the owner.
```

`tests/fixtures/active-project/wiki/authored/demo-game/architecture.md`:

```
# Architecture

## Stack
Phaser, version pinned in the lockfile.

## Structure
Scenes in src/scenes, systems in src/systems, data in src/data.

## Engine guidance used
None recorded.

## Review standard
Not yet written.

## Verified
2026-01-01
```

`tests/fixtures/active-project/wiki/authored/demo-game/decisions/engine-choice-adr.md`:

```
# Engine choice

Status: accepted. Decision-makers: the owner and game-architect.

Context: a 2D action game that must run in a browser.
Decision: use Phaser.
Consequences (good): fast iteration and a headless verification route. (Bad): no native console path.
```

`tests/fixtures/active-project/wiki/authored/demo-game/backlog/enemy-patrol.md`:

```
---
backlog-status: in-progress
depends-on: []
---
# Enemy patrol

Fit: fits - pillar 2, telegraphed patrol paths - 2026-01-01

## Implications
- art: reuse the existing enemy sprite
- sound: none
- architecture: none
- quality: a recorded patrol-loop replay

## Design artifacts
none required

## Acceptance evidence
Replay of one patrol loop recorded in the quality notes.
```

`tests/fixtures/active-project/wiki/authored/demo-game/backlog/boss-fight.md`:

```
---
backlog-status: planned
depends-on: ["[[enemy-patrol]]"]
---
# Boss fight

Fit: fits - pillars 1 and 2 - 2026-01-01

## Implications
- art: a boss character with six actions and an arena level; needs the art bible
- sound: a boss music cue and attack telegraph sounds
- quality: a performance budget for the arena effects

## Design artifacts
- art bible (registry status: draft)

## Acceptance evidence
A recorded run of the arena at the frame budget.
```

`tests/fixtures/active-project/wiki/authored/demo-game/backlog/patrol-sound.md`:

```
---
backlog-status: planned
depends-on: ["[[enemy-patrol]]"]
---
# Patrol sound

Fit: fits - pillar 2, audible alert cue - 2026-01-01

## Implications
- sound: footsteps and an alert cue
- art: none

## Design artifacts
none required

## Acceptance evidence
The owner's recorded pick of the alert cue.
```

`tests/fixtures/active-project/wiki/authored/demo-game/reference/art-bible.md`:

```
# Art bible (draft)

Palette and silhouette rules are not yet approved.
```

`tests/fixtures/active-project/wiki/authored/demo-game/notes/quality-g2.md`:

```
# Quality evidence: G2

Evidence: observed
Run: the vertical slice was played through, no crashes, frame time within budget; a screenshot is recorded.
```

`tests/fixtures/stalled-project/AGENTS.md`: the same file as `tests/fixtures/active-project/AGENTS.md`.

`tests/fixtures/stalled-project/wiki/authored/demo-game/reference/studio-state.md`:

```
# Studio state: demo-game

## Phase
beta

## Rigor tier
minimal

## Next step
Close the G2 evidence.

## Blocked by
G2 evidence is not observed

## Current sprint
none

## Artifact registry
| Artifact | Path | Owner | Status | Last verified |
|---|---|---|---|---|
| State page | reference/studio-state.md | game-pm | ready | 2026-01-01 |
| Game brief | overview.md | game-master | absent | - |
| Architecture | architecture.md | game-architect | draft | 2026-01-01 |
| Quality evidence | notes/ | game-quality | draft | 2026-01-01 |

## Open questions
| Question | Owner | Must be answered by | Status |
|---|---|---|---|
| Where is the game brief? | game-master | G1 | open |

## Last gate result
G2 unmet - notes/quality-g2.md
```

`tests/fixtures/stalled-project/wiki/authored/demo-game/notes/quality-g2.md`:

```
# Quality evidence: G2

Evidence: reported
The test strategy looks fine.
```

`tests/fixtures/concept-project/wiki/authored/demo-game/reference/studio-state.md`:

```
# Studio state: demo-game

## Phase
concept

## Rigor tier
minimal

## Next step
Finish the game brief and pillars.

## Blocked by
nothing

## Current sprint
none

## Artifact registry
| Artifact | Path | Owner | Status | Last verified |
|---|---|---|---|---|
| State page | reference/studio-state.md | game-pm | ready | 2026-01-01 |
| Game brief | overview.md | game-master | draft | 2026-01-01 |

## Open questions
| Question | Owner | Must be answered by | Status |
|---|---|---|---|
| none | - | - | - |

## Last gate result
none
```

`tests/fixtures/concept-project/wiki/authored/demo-game/overview.md`:

```
# Demo game

Player experience: a fast, readable platform brawler.

## Pillars
1. Movement first - means: every ability is a movement option; rules out: stationary cover.
2. Readable chaos - means: enemy intent is visible early; rules out: unreadable effects.
```

`tests/fixtures/release-ready/wiki/authored/demo-game/reference/studio-state.md`:

```
# Studio state: demo-game

## Phase
release

## Rigor tier
minimal

## Next step
Owner sign-off at G5.

## Blocked by
nothing

## Current sprint
none

## Artifact registry
| Artifact | Path | Owner | Status | Last verified |
|---|---|---|---|---|
| State page | reference/studio-state.md | game-pm | ready | 2026-02-01 |
| Game brief | overview.md | game-master | ready | 2026-01-01 |
| Architecture | architecture.md | game-architect | ready | 2026-02-01 |
| Quality evidence | notes/ | game-quality | ready | 2026-02-01 |

## Open questions
| Question | Owner | Must be answered by | Status |
|---|---|---|---|
| none | - | - | - |

## Last gate result
G4 met - notes/quality-g4.md
```

`tests/fixtures/release-ready/wiki/authored/demo-game/notes/quality-g5.md`:

```
# Quality evidence: G5

Evidence: observed
Release criteria checked: clean build installed and played through on the target platform, no critical defects open, frame time within budget, platform requirements checked, every shipped asset recorded as human-made or AI-assisted with no placeholders remaining. Build receipt and screenshots recorded.
```

`tests/fixtures/release-ready/wiki/authored/demo-game/backlog/final-polish.md`:

```
---
backlog-status: shipped
depends-on: []
---
# Final polish

Fit: fits - pillar 2 - 2026-01-15

## Implications
- quality: regression pass recorded

## Acceptance evidence
notes/quality-g5.md
```

`tests/fixtures/brownfield-partial/AGENTS.md`:

```
# Notes for agents

Build with `make assets` before every commit.
Never touch the legacy folder.
Use the old tracker for tasks.
Ask before adding dependencies.
Run the formatter.
The design document is docs/design.md.
Prefer small functions.
Write tests for everything.
Do not use the deprecated renderer.
Keep a changelog.
```

`tests/fixtures/brownfield-partial/docs/design.md`:

```
# Design (2023)

An old design document: core loop, a list of planned enemies, no pillars, no non-goals.
```

`tests/fixtures/brownfield-partial/src/main.txt`:

```
placeholder for the game's source
```

`tests/fixtures/brownfield-partial/.cache/tmp.txt`:

```
cache residue from an automation run
```

`tests/fixtures/brownfield-partial/scratch-plan.json`:

```json
{ "note": "stray plan file left by an earlier agent session", "phases": [] }
```

`tests/fixtures/brownfield-partial/.mcp.json`:

```json
{ "mcpServers": { "demo-docs": { "command": "demo-docs-server" } } }
```

`tests/fixtures/stack-mapped/wiki/authored/demo-game/architecture.md`:

```
# Architecture

## Stack
Phaser, version pinned in the lockfile.

## Engine guidance used
None recorded.
```

`tests/fixtures/stack-mapped/wiki/authored/demo-game/reference/studio-state.md`:

```
# Studio state: demo-game

## Phase
production

## Rigor tier
minimal

## Next step
Review the rendering change.

## Blocked by
nothing

## Current sprint
none

## Artifact registry
| Artifact | Path | Owner | Status | Last verified |
|---|---|---|---|---|
| State page | reference/studio-state.md | game-pm | ready | 2026-01-01 |
| Architecture | architecture.md | game-architect | ready | 2026-01-01 |

## Open questions
| Question | Owner | Must be answered by | Status |
|---|---|---|---|
| none | - | - | - |

## Last gate result
none
```

`tests/fixtures/stack-fallback/wiki/authored/demo-game/architecture.md`:

```
# Architecture

## Stack
Godot, headless export for automated runs.

## Engine guidance used
None recorded.
```

`tests/fixtures/stack-fallback/wiki/authored/demo-game/reference/studio-state.md`: the same as `tests/fixtures/stack-mapped/wiki/authored/demo-game/reference/studio-state.md`, with the Next step line changed to `Set up automated runs.`

- [ ] **Step 5: Write `tests/scenarios/README.md`**

````markdown
# Scenario run protocol

The files in this folder describe how an agent should behave. The automated checks (`node scripts/check.mjs`) confirm only that `scenarios.json` is well formed and covers every routing row, every gate, the stop rules, deferral and adoption. Scoring the behavior is a manual run.

## Setup

1. Install the plugin in a fresh agent session on a host you support.
2. For each scenario, copy its fixture folder (`tests/fixtures/<fixture>/`) to a scratch folder outside this repository, and open a new session there with no prior context. The fixture's agent instruction file (when present) already carries the process block.
3. Do not add hints to the prompt.

## Run

Paste the scenario's `prompt` exactly. Let the agent answer. Do not correct it mid-run.

## Scoring

| Kind | Pass when |
|---|---|
| routing | The agent names the expected owner, reads the expected document first, produces the expected output, and brings in the `then` party where one is named |
| stop | The agent stops at the expected step (or at the start of the session) and names the missing precondition without doing the work |
| gate | The agent reports the expected result with the expected reason, citing evidence, and for G5 asks the owner for the final sign-off |
| defer | The agent follows the expected path (mapped, fallback, gap), records what it used or the gap where the scenario says, and does not restate engine guidance itself |
| adoption | The agent does every `mustDo` item and none of the `mustNot` items |

## Recording

Copy `results-template.md` to `results/<date>-<host>.md`, fill one row per scenario, and commit it. Initial targets (spec section 15): at least 18 of the 20 routing-style scenarios pass, and every stop and gate scenario passes. A failure is a finding about the skill or reference wording: fix the wording, not the scenario, unless the scenario is wrong.
````

- [ ] **Step 6: Write `tests/scenarios/results-template.md`**

```markdown
# Scenario results

Date: <date>
Host and version: <host>
Plugin version: <version>

| Id | Pass | Notes |
|---|---|---|
| R01 | yes / no | |
```

(Add one row per scenario id from `scenarios.json`: R01 to R16, S01 to S06, GT1 to GT5, D01 to D04, A01 to A03.)

- [ ] **Step 7: Run the test to verify the scenario checks pass except for the routing table**

Run: `node --test scripts/scenarios.test.mjs`
Expected: `routing scenarios agree with the routing table and cover every row` FAILS (the routing table is written in Task 8) and all other scenario tests PASS. If the `every fixture is used` test fails, a fixture folder name is misspelled.

- [ ] **Step 8: Run the hygiene scan**

Run: `node --test scripts/hygiene.test.mjs`
Expected: PASS. Fixtures may hold wiki paths and engine names (only `skills/` and `references/` are confined).

- [ ] **Step 9: Commit**

```bash
git add scripts/scenarios.test.mjs tests/
git commit -m "test: add scenario data, fixtures, coverage checks and the run protocol"
```

---

### Task 6: Vocabulary reference

**Files:**
- Create: `references/vocabulary.md`

- [ ] **Step 1: Run the test to verify it fails**

Run: `node --test --test-name-pattern="vocabulary" scripts/structure.test.mjs`
Expected: FAIL (`references/vocabulary.md` does not exist).

- [ ] **Step 2: Write `references/vocabulary.md`**

````markdown
# Vocabulary

Closed value sets. Use these values exactly, in this spelling. A value that is not listed here is wrong: record an open question instead of inventing one.

## Sets

| Set | Values | Used by |
|---|---|---|
| Artifact status | ready, draft, absent, reconstructed, conflicting | Artifact registry on the state page |
| Backlog status | planned, in-progress, shipped, blocked, dropped | Backlog items |
| Fit verdict | fits, does-not-fit, needs-pillar-change | Backlog items |
| Gate result | met, unmet, waived | State page, gate checks |
| Evidence | observed, reported, none | Gate checks, quality evidence |
| Rigor tier | minimal, standard, full | State page |
| Phase | adopt, concept, pre-production, production, beta, release, live | State page |
| Decision status | proposed, accepted, superseded, deprecated | Decision records |
| Open question status | open, answered, dropped | State page |

## Definitions

**Artifact status**
- `ready`: the artifact meets the "Ready means" definition for its row in [the artifact catalog](artifact-catalog.md) and was verified during the current phase.
- `draft`: the artifact exists but does not yet meet its ready definition.
- `absent`: the artifact does not exist.
- `reconstructed`: the artifact was written after the fact from code, history or memory. Its first line says so. It becomes `ready` only when the owner confirms it.
- `conflicting`: two sources disagree about the artifact's content. The disagreement is recorded as a decision record or an open question.

**Backlog status.** `blocked` is set by a person and names what blocks the item. An item whose `depends-on` entries are not `shipped` or `dropped` cannot be chosen for a sprint, whatever its status.

**Fit verdict.** `fits`: the item serves at least one pillar and breaks no non-goal. `does-not-fit`: it breaks a non-goal or no pillar needs it. `needs-pillar-change`: it is wanted but only fits if a pillar changes; that change is a decision for the owner.

**Gate result.** `met`: every required evidence item is present and, for behavioral claims, `observed`. `unmet`: at least one is missing. `waived`: the owner chose to pass without it; a decision record names who waived it and why.

**Evidence.** `observed`: produced by running or inspecting the real thing (a run, a screenshot, test output, a build receipt) and linked. `reported`: stated by a person or an agent without a run. `none`: nothing was provided. A gate accepts only `observed` evidence for a behavioral claim.

**Unknown.** "Unknown" is not a status. When something is not known, record an open question with an owner and the gate by which it must be answered, then continue only with work that does not depend on the answer.

**Verified this session.** The agent read the artifact in the current session and confirmed it still matches the repository or the owner's statement. Update the "Last verified" date only then.
````

- [ ] **Step 3: Run the test to verify it passes**

Run: `node --test --test-name-pattern="vocabulary" scripts/structure.test.mjs`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add references/vocabulary.md
git commit -m "docs: add the closed vocabulary"
```

---

### Task 7: Process reference

**Files:**
- Create: `references/process.md`

- [ ] **Step 1: Run the test to verify it fails**

Run: `node --test --test-name-pattern="process.md" scripts/structure.test.mjs`
Expected: FAIL (file missing).

- [ ] **Step 2: Write `references/process.md`**

````markdown
# Process

This is the whole studio process. Role skills add procedure; they do not hold the process. Use the closed values in [the vocabulary](vocabulary.md). Who owns each kind of request is in [decision routing](decision-routing.md); where each document lives is in [the artifact catalog](artifact-catalog.md).

## Source of truth

The project's wiki owns intent. The repository owns behavior. When they disagree, the repository wins on what happens and the wiki wins on what was meant. Record the disagreement as a decision record or an open question. Never correct either side silently.

## Phases and gates

| Phase | Exit gate | Required evidence | Check owner |
|---|---|---|---|
| adopt (existing projects only) | Registry filled, phase placed | Registry reviewed by the owner | studio-start |
| concept | **G1** Brief approved | Game brief, 3 to 5 pillars, non-goals, the owner's approval date | game-master |
| pre-production | **G2** Vertical slice | Playable slice, stack decision recorded, production plan, art bible†, test strategy†, performance budgets† | game-architect and game-quality |
| production | **G3** Scope lock | Feature complete; later work needs a change request and a cut | game-pm |
| beta | **G4** Content lock | Content complete, no critical defects, budgets met†, text locked† | game-quality |
| release | **G5** Ship | Release criteria met, platform requirements checked, asset provenance audit clean† | game-quality, then the owner |
| live | none | Patches follow the work loop plus a regression check | game-pm |

- **Minimal tier:** G3 and G4 merge into one gate. Evidence marked † names a document outside the minimal tier; at that tier it is satisfied by one line in the quality evidence note stating what was checked, how, and the observed result.
- **Result values** are `met`, `unmet` and `waived`. A waiver needs a decision record naming who waived it and why.
- **Durations** are not prescribed.
- **Store and platform gates** are external. At G5, defer to the launch-readiness guidance named in [the plugin map](plugin-map.md) and keep only the engineering release criteria here.

## Work loop

Every unit of work follows these steps in order. Do not skip a step. A missing precondition means stop and name it.

1. **Intake.** State the request in one line and match it to a row in [decision routing](decision-routing.md). No match means record an open question and ask the owner.
2. **Fit check.** game-master records a fit verdict in the backlog item. No pillars on record means stop here.
3. **Design readiness.** Every artifact the work needs is present and `ready`. Otherwise stop and name the gap.
4. **Sprint selection.** game-pm chooses items whose dependencies are `shipped` or `dropped`.
5. **Build.** Do the work.
6. **Verify.** game-quality records `observed` evidence against the item and the gate it supports. `reported` evidence does not pass.
7. **Accept.** game-master accepts against the pillars. At a gate, the owner accepts.
8. **Update.** Update the state page, the backlog and the registry in the same wiki operation as the work.

## Session rules

- **Start:** read the state page. Report phase and rigor tier, next step, and blockers in exactly three lines. If the page is missing or not verified this session, say so and run studio-start.
- **End:** run step 8 of the work loop before the session closes.

## Evidence rules

- A gate passes only on `observed` evidence for every behavioral claim.
- Evidence names what was run, how, and the result, and links to the artifact (output, screenshot, receipt).
- An agent's own assessment is `reported`, never `observed`.
- For a high-stakes gate (G2, G5), ask for a clean-context second opinion if the plugin map names a skill for it.

## Change control

After G3 a change request names the cut that pays for it. game-pm writes it, game-master rules on fit, and the owner approves. Changes to a locked asset, locked text or a signed-off contract make dependent sign-offs stale: re-check them.

## Before a role skill exists

Until a role has its own skill, follow that role's row in [decision routing](decision-routing.md) and its entries in [the artifact catalog](artifact-catalog.md) directly. The owner is the arbiter for that role's decisions.
````

- [ ] **Step 3: Run the test to verify it passes**

Run: `node --test --test-name-pattern="process.md" scripts/structure.test.mjs`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add references/process.md
git commit -m "docs: add the process reference"
```

---

### Task 8: Decision routing reference

**Files:**
- Create: `references/decision-routing.md`

- [ ] **Step 1: Run the tests to verify they fail**

Run: `node --test --test-name-pattern="decision-routing|routing scenarios" scripts/structure.test.mjs scripts/scenarios.test.mjs`
Expected: FAIL (file missing).

- [ ] **Step 2: Write `references/decision-routing.md`**

````markdown
# Decision routing

Every request has exactly one owner. Match the request to a row, read the named document first, and produce the named output. Process and sequence are in [the process](process.md).

## Roles

Each role decides some questions, writes some artifacts, and reviews the rest. An artifact has exactly one writer.

| Role | Decides | Writes |
|---|---|---|
| game-master | Fit against the pillars; whether the game is on course; art fit on key assets; acceptance against the pillars | Brief and pillars; fit verdicts; course checks |
| game-architect | Technology, engine features, project structure, tool readiness, code review standards; the agent instruction files, project skills and tooling | Architecture page; technology decision records; the instruction-file block; tooling audit records |
| game-pm | What to do next; sprint contents; scope changes; plan structure | State page; backlog and roadmap; risk register and postmortems (full tier) |
| game-quality | Whether it works and is ready; the quality bar, budgets and severity scale; release criteria | Test strategy; quality evidence; release criteria (full tier) |
| game-writer | Text, dialogue, canon and glossary; the localization lock | Narrative bible and glossary; localization plan (full tier) |
| game-artist | Craft of art, animation, effects, sound and music; art bible compliance | Art bible; asset list (standard tier); asset entries (full tier) |
| game-designer (phase 3) | System, economy, level and interface design | Design specs |

Until game-designer exists, game-master owns design specs as a flagged exception and game-quality reviews them.

## Routing

`Then` is the party who must act after the owner: another role, `owner` (the human who owns the project) or `-` (nobody).

| Request | Owner | Then | Read first | Required output |
|---|---|---|---|---|
| New idea or feature | game-master | - | Pillars, non-goals | Fit verdict in the backlog item |
| Course check | game-master | - | State page, latest quality evidence | Course check with evidence links |
| Engine, library or tool choice | game-architect | - | Decision log | Decision record; tool-readiness sign-off if a tool is involved |
| Project layout, code standards, code review | game-architect | - | Architecture page | Updated architecture page |
| Agent instruction files, project skills, tooling | game-architect | owner | The existing files | Proposed diff, never an overwrite |
| Tooling cleanup | game-architect | owner | Artifact registry, instruction files | Audit proposal |
| What to do next, or sprint contents | game-pm | - | Backlog, artifact registry | Sprint list with design artifacts confirmed ready |
| Plan creation or revision | game-pm | - | Brief, pillars, backlog | Plan from the planning pass |
| Scope change after G3 | game-pm | game-master | Backlog, pillars | Change request naming the cut |
| Dialogue, item text, lore | game-writer | - | Narrative bible | Text plus glossary and canon updates |
| Characters, levels, effects, marketing art | game-artist | game-master | Art bible | Asset plus provenance entry; game-master signs off fit on key assets |
| Sound or music selection | game-artist | owner | Art bible | The owner's recorded pick |
| Does it work, is it ready, performance | game-quality | - | Test strategy, budgets | Observed evidence recorded against the gate |
| Status | game-pm | - | State page | The three-line report |
| Joining an existing project | studio-start | - | The project | Adoption |
| Anything else | none | owner | State page | Recorded open question; ask the owner |

## Rules

1. Match the request to the first row that fits. Do not split a request across owners unless a row names a `Then`.
2. If no row fits, use the last row: record an open question on the state page and ask the owner.
3. A role not yet implemented as a skill is still the owner of its rows. Follow the row directly.
4. An owner who is unsure escalates to the human owner. Never decide a question that belongs to another row.
````

- [ ] **Step 3: Run the tests to verify they pass**

Run: `node --test scripts/structure.test.mjs scripts/scenarios.test.mjs --test-name-pattern="decision-routing|routing scenarios"`
Expected: PASS for both.

- [ ] **Step 4: Commit**

```bash
git add references/decision-routing.md
git commit -m "docs: add decision routing"
```

---

### Task 9: Artifact catalog and templates

**Files:**
- Create: `references/artifact-catalog.md`, `references/templates/state-page.md`, `game-brief.md`, `decision-record.md`, `architecture.md`, `backlog-item.md`, `quality-evidence.md`, `tooling-audit.md`, `instruction-block.md`

- [ ] **Step 1: Run the tests to verify they fail**

Run: `node --test --test-name-pattern="artifact-catalog|wiki templates|state page template|instruction block" scripts/structure.test.mjs`
Expected: FAIL (files missing).

- [ ] **Step 2: Write `references/artifact-catalog.md`**

````markdown
# Artifact catalog

Every standard document has one owner, one location, one template and a definition of ready. Paths are relative to `wiki/authored/<project>/` unless the Path column says otherwise. Authoring and validation of the documents follow the wiki tooling named in [the plugin map](plugin-map.md); this catalog gives only owner, path and ready definition. Status values are in [the vocabulary](vocabulary.md).

## Catalog

| Artifact | Tier | Path | Owner | Template | Ready means |
|---|---|---|---|---|---|
| State page | minimal | reference/studio-state.md | game-pm | state-page.md | Every field filled; next step present; verified this session |
| Game brief | minimal | overview.md | game-master | game-brief.md | One-sentence player experience; 3 to 5 pillars, each stating what it means and what it rules out; non-goals; the owner's approval date |
| Decision record | minimal | decisions/<slug>-adr.md | decider | decision-record.md | Context, options, outcome, consequences (good and bad), decision-makers and status all filled |
| Architecture | minimal | architecture.md | game-architect | architecture.md | Describes only what exists; matches the repository; has an Engine guidance used section and a review standard; verified date |
| Backlog item | minimal | backlog/<slug>.md | game-pm | backlog-item.md | Fit verdict recorded; implications recorded; `depends-on` lists its prerequisites; design artifacts linked and ready; acceptance evidence defined |
| Roadmap | minimal | roadmap.md | game-pm | generated | Generated from the backlog items; never edited by hand outside its generated region |
| Quality evidence | minimal | notes/quality-<gate-or-date>.md | game-quality | quality-evidence.md | Names what was run, how, and the result; links the evidence; the evidence value is recorded |
| Agent instructions block | minimal | repository: the project's agent instruction file(s) | game-architect | instruction-block.md | Contains the process block; every line approved by the owner; the files agree with each other |
| Tooling audit record | minimal | notes/tooling-audit-<date>.md | game-architect | tooling-audit.md | Every candidate has evidence, an outcome, a risk and an undo; the owner's decision is recorded |
| Art bible | standard | reference/art-bible.md | game-artist | later | Palette, silhouette and readability rules approved by game-master; a named tie-breaker; a list of named mistakes |
| Narrative bible and glossary | standard | reference/narrative-bible.md | game-writer | later | Canon, character voices, and glossary entries with one definition each |
| Test strategy | standard | reference/test-strategy.md | game-quality | later | Risk map, quality bar, performance budgets, severity scale, and the lanes the tests run in |
| Asset list | standard | reference/asset-list.md | game-artist | later | Every shipped asset with its stage, its provenance (human, AI-assisted or AI-generated) and its licence |
| Design spec | standard | reference/design-<system>.md | game-designer | later | Rules, numbers and edge cases for one system, linked to the pillar it serves |
| Risk register | full | reference/risk-register.md | game-pm | later | Each risk has an owner, a trigger and a response |
| Release criteria | full | reference/release-criteria.md | game-quality | later | Checkable criteria for G5, each with the evidence that satisfies it |
| Localization plan | full | reference/localization-plan.md | game-writer | later | Text lock date, languages, and the hand-off kit |
| Postmortem | full | notes/postmortem-<phase>.md | game-pm | later | What went right and wrong, including attempts that failed |
| Asset entry | full | reference/assets/<id>.md | game-artist | later | Capabilities, needs, stage, sign-offs with the version signed, and dependencies |

`Template` is `later` where the template ships in a later phase, and `generated` where the wiki tooling produces the document.

## Rules

- **One writer.** The Owner column names the only role that writes the document. Others review. `decider` means the party who made the decision, per [decision routing](decision-routing.md).
- **Tier.** The owner sets the rigor tier at G1, or at adoption for an existing project. A project may adopt a higher-tier document earlier when work needs it. Lowering the tier mid-phase needs a decision record.
- **Fit verdicts** live in the backlog item. Only significant verdicts become decision records.
- **Reconstructed documents** say so in their first line and use the status `reconstructed` in the registry.
- **Registry.** Every document in the project's tier has a row on the state page: artifact, path, owner, status, last verified.
````

- [ ] **Step 3: Write `references/templates/state-page.md`**

````markdown
---
type: authored
created: <date>
updated: <date>
reviewed: <date>
status: draft
sources: []
ai-generated: true
project: <project>
kind: reference
---
# Studio state: <project>

## Phase
<adopt | concept | pre-production | production | beta | release | live>

## Rigor tier
<minimal | standard | full>

## Next step
<one line>

## Blocked by
<the item and the reason, or: nothing>

## Current sprint
<backlog item slugs, or: none>

## Artifact registry
| Artifact | Path | Owner | Status | Last verified |
|---|---|---|---|---|
| State page | reference/studio-state.md | game-pm | draft | <date> |
| Game brief | overview.md | game-master | absent | - |
| Decision record | decisions/ | decider | absent | - |
| Architecture | architecture.md | game-architect | absent | - |
| Backlog item | backlog/ | game-pm | absent | - |
| Roadmap | roadmap.md | game-pm | absent | - |
| Quality evidence | notes/ | game-quality | absent | - |
| Agent instructions block | repository | game-architect | absent | - |
| Tooling audit record | notes/ | game-architect | absent | - |

## Open questions
| Question | Owner | Must be answered by | Status |
|---|---|---|---|
| <question> | <role or owner> | <gate> | open |

## Last gate result
<gate> <met | unmet | waived> - <evidence link>
````

- [ ] **Step 4: Write `references/templates/game-brief.md`**

````markdown
---
type: authored
created: <date>
updated: <date>
reviewed: <date>
status: draft
sources: []
ai-generated: true
project: <project>
kind: overview
---
# <Game name>

Player experience: <one sentence: what the player does and feels>

## Pillars
<3 to 5 pillars. One line each, in this form:>
1. <Name> - means: <what it commits the game to>; rules out: <what it forbids>.

## Non-goals
- <What this game will not do.>

## Approved
<date> by the owner.
````

- [ ] **Step 5: Write `references/templates/decision-record.md`**

````markdown
---
type: authored
created: <date>
updated: <date>
reviewed: <date>
status: draft
sources: []
ai-generated: true
project: <project>
kind: decision
decision-status: proposed
---
# <Decision title>

## Status
<proposed | accepted | superseded | deprecated>, <date>.

## Decision-makers
<who decided; who was consulted; who was informed>

## Context
<the problem and the constraints, in a few sentences>

## Options considered
1. <Option>: <one line>
2. <Option>: <one line>

## Decision
<the chosen option and why>

## Consequences
Good: <what improves>
Bad: <what it costs or risks; a record with no costs is incomplete>

## Evidence
<for each claim that matters: tested here, documented (with the source), or general knowledge>
````

- [ ] **Step 6: Write `references/templates/architecture.md`**

````markdown
---
type: authored
created: <date>
updated: <date>
reviewed: <date>
status: draft
sources: []
ai-generated: true
project: <project>
kind: architecture
---
# Architecture: <project>

Describe only what exists now. Anything planned belongs in the backlog.

## Stack
<engine or framework, language, versions, and where they are pinned>

## Structure
<the main folders and what each holds>

## Engine guidance used
<for each piece of engine-specific guidance consulted: which guidance, for what question, and the date; or: none consulted>

## Review standard
<what a change must show before it is accepted>

## Verified
<date> against <commit or build>
````

- [ ] **Step 7: Write `references/templates/backlog-item.md`**

````markdown
---
type: authored
created: <date>
updated: <date>
reviewed: <date>
status: draft
sources: []
ai-generated: true
project: <project>
kind: backlog-item
backlog-status: planned
depends-on: []
---
# <Item title>

Fit: <fits | does-not-fit | needs-pillar-change> - <pillar number and reason> - <date>

## Implications
- art: <animations, effects, environment pieces, interface art; or: none>
- sound: <cues and music; or: none>
- writing: <text and localization; or: none>
- architecture: <tools, formats, performance risk; or: none>
- quality: <test hooks, evidence, budget impact; or: none>

## Design artifacts
<each artifact the work needs, with its registry status, or: none required>

## Acceptance evidence
<what observed evidence will show the item is done>

## Art status
<draft | isolated-approved | in-context-approved | not applicable>
````

- [ ] **Step 8: Write `references/templates/quality-evidence.md`**

````markdown
---
type: authored
created: <date>
updated: <date>
reviewed: <date>
status: draft
sources: []
ai-generated: true
project: <project>
kind: note
---
# Quality evidence: <gate or item>

Evidence: <observed | reported | none>

## Run
<what was run, how, on what build, and the result>

## Links
<output, screenshot, receipt or test report, each as a link or a path>

## Defects open
<each open defect with its severity, or: none>
````

- [ ] **Step 9: Write `references/templates/tooling-audit.md`**

````markdown
---
type: authored
created: <date>
updated: <date>
reviewed: <date>
status: draft
sources: []
ai-generated: true
project: <project>
kind: note
---
# Tooling audit: <date>

## Scope
<the project directory and the project-scoped agent configuration audited; global configuration is out of scope>

## Candidates
| Item | Category | Evidence of use | Outcome | Risk | Undo |
|---|---|---|---|---|---|
| <path or name> | <1 to 8> | <what shows it is used or unused> | <remove | replace-with-reference | merge | convert | ask-owner> | <what could break> | <how to restore it> |

## Kept
<items checked and kept, with the reference that justifies each>

## Owner decision
<approved | approved with changes | declined> - <date> - <notes>

## Result
<the change made, as one reversible change, or: nothing changed>
````

- [ ] **Step 10: Write `references/templates/instruction-block.md`**

````markdown
## Project process (agent-game-studio)

Before acting on any request about this project:

1. Read the project's state page: `wiki/authored/<project>/reference/studio-state.md`.
2. Report phase, next step and blockers in three lines.
3. Match the request to a row in the decision routing table and follow that role's procedure.
4. Do not pass a gate without observed evidence. Stop and name any missing precondition.
5. Before ending, update the state page, backlog and registry in the same wiki operation as the work.

If the state page is missing or stale, say so and run studio-start.
````

- [ ] **Step 11: Run the tests to verify they pass**

Run: `node --test --test-name-pattern="artifact-catalog|wiki templates|state page template|instruction block" scripts/structure.test.mjs`
Expected: PASS.

- [ ] **Step 12: Commit**

```bash
git add references/artifact-catalog.md references/templates
git commit -m "docs: add the artifact catalog and the first eight templates"
```

---

### Task 10: Planning reference

**Files:**
- Create: `references/planning.md`

- [ ] **Step 1: Run the test to verify it fails**

Run: `node --test --test-name-pattern="planning.md" scripts/structure.test.mjs`
Expected: FAIL (file missing).

- [ ] **Step 2: Write `references/planning.md`**

````markdown
# Planning

Planning happens when game-pm creates or revises the plan. It is meant to catch what a feature implies for every discipline before work starts, not to be rigid. Every default here can be struck by the owner. Process and gates are in [the process](process.md); documents are in [the artifact catalog](artifact-catalog.md).

## Planning pass

For each feature:

1. **Expand.** Each discipline answers "what does this feature imply for me?" from its checklist below. Answers are proposals the owner may strike.
2. **Record.** Write the answers in the feature's backlog item under Implications. Each piece of real work becomes its own backlog item whose `depends-on` entry names its prerequisites.
3. **Sequence.** Apply the ordering defaults.
4. **Group.** Fit the ordered items into sprints and gates, confirming that the design artifacts each item needs are `ready`.

Mid-production, adding a feature or a change request reruns the pass for that feature only.

## Rolling wave

Plan in detail up to the next gate and in outline beyond it. Re-plan at each gate and on every change request. Do not detail work for gates that are more than one gate away.

## Discipline checklists

| Lens | Asks |
|---|---|
| game-artist | Animations, effects, sounds and music, environment pieces, interface art, using the needs matrix below |
| game-writer | Text, dialogue, item and interface copy, and when text locks for localization |
| game-architect | New tools or engine capabilities and whether they are ready; data formats; performance risk |
| game-quality | Test hooks and evidence needed; budget impact; regression risk |
| game-master | Fit against the pillars; whether a pillar must change |

## Needs matrix

Starting defaults. Tune them per project; strike what does not apply.

| Capability | Typically implies |
|---|---|
| Any character | Idle; each movement mode; hit reaction; defeat and spawn; timing and loop policy per action |
| Attacks | Wind-up, strike and recovery; a trail effect; an impact effect; swing and hit sounds |
| Moves over surfaces | Footsteps per material; dust or splash effects |
| Speaks | A voice or text set; expressions |
| Environment | Tile edges and transitions; a readability pass; an ambient bed; a music cue; hazard telegraphs, visual and audio |
| Effect | Intensity variants; a paired sound; a performance budget; a check that it does not hide gameplay |

## Ordering defaults

Defaults, not rules. Strike one with a reason when the reason is not obvious.

1. Tool readiness before any feature work that needs the tool.
2. A scale-and-camera contract (stature, pixel density, palette, camera angle), then a style frame. Changing the contract makes dependent sign-offs stale.
3. A hero asset of each type through the whole pipeline before batch production.
4. A greybox layout approved before level art.
5. Animation timing before the effects and sounds that depend on it.
6. Test hooks before the feature's verification.

## Art stages and sign-off

Stages, in order:

1. brief
2. reference approved
3. draft
4. craft review
5. isolated sign-off
6. integrated
7. in-context sign-off
8. locked

In the minimal tier, record the stage as the Art status line of the backlog item. Craft checklists belong to the asset plugins named in [the plugin map](plugin-map.md); do not restate them here.

| Asset class | Craft sign-off | Fit sign-off |
|---|---|---|
| Key visuals (heroes, hero environments, the style frame) | game-artist, using the asset plugin's checklist | game-master |
| Other visuals | game-artist, against the art bible | none |
| Sound and music | game-artist | the owner, by audition |
````

- [ ] **Step 3: Run the test to verify it passes**

Run: `node --test --test-name-pattern="planning.md" scripts/structure.test.mjs`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add references/planning.md
git commit -m "docs: add the planning reference"
```

---

### Task 11: Plugin map

**Files:**
- Create: `references/plugin-map.md`

This is the only file in `skills/` and `references/` that may name engines, tools or other plugins (hygiene rule). The mapping was signed off by the owner.

- [ ] **Step 1: Check each mapped skill still exists**

Run (in a session that has the sibling plugins installed): list the session's available skills and confirm each name in the table of Step 3 appears. Remove or correct any row whose skill does not exist before writing the file. If the sibling plugins are not installed, record that the rows are unverified in the file's last line (Step 3 shows where).

Expected: every named skill is present.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test --test-name-pattern="plugin-map" scripts/structure.test.mjs`
Expected: FAIL (file missing).

- [ ] **Step 3: Write `references/plugin-map.md`**

````markdown
# Plugin map

This plugin says what must be decided and what evidence proves it. Another plugin says how. This is the only file in the plugin that names engines, tools or other plugins. Skills refer to purposes ("engine architecture guidance"), then look the purpose up here.

## Map

| Purpose | Stack | Defer to |
|---|---|---|
| Engine choice | any | `agent-engine:engine-selection` |
| Structure and architecture | Phaser | `agent-engine:engine-phaser`; for cross-game or tool coordination, `agent-engine:phaser-architecture` |
| Structure and architecture | R3F / three.js | `agent-engine:engine-r3f` |
| Structure and architecture | Babylon.js | `agent-engine:engine-babylon` |
| Structure and architecture | Unreal (C++) | `agent-unreal:unreal-native` for project structure; `agent-unreal:unreal-gameplay`, `agent-unreal:unreal-rendering`, `agent-unreal:unreal-procedural` for system choices |
| Structure and architecture | UEFN | `agent-unreal:uefn` |
| Structure and architecture | Custom | Fallback chain, step 2, then step 3 |
| Structure and architecture | Unity | Fallback chain, step 2, then step 3 |
| Structure and architecture | Godot | Fallback chain, step 2, then step 3 |
| Quality, verification, performance | Phaser | `agent-engine:phaser-verification` |
| Quality, verification, performance | R3F / three.js | `agent-engine:engine-r3f` |
| Quality, verification, performance | Babylon.js | `agent-engine:engine-babylon` |
| Quality, verification, performance | Unreal (C++) | `agent-unreal:unreal-native` |
| Quality, verification, performance | any | `agent-tests:test-strategy` and `agent-tests:test-audit` for test lanes and suite health |
| Visual polish | any | `agent-engine:engine-visual-polish` |
| Asset craft | sprites | `agent-sprites:sprite-craft`, `agent-sprites:sprite-review`, `agent-sprites:sprite-verification` |
| Asset craft | meshes | `agent-meshes:mesh-believable`, `agent-meshes:mesh-quality-review` |
| Asset craft | drawings | `agent-draw:draw-authoring` |
| Asset craft | sound and music | `agent-beeps:beeps-craft`; the owner picks by `agent-beeps:beeps-audition` |
| Text and dialogue craft | any | `agent-prose:prose-dialog`, `agent-prose:prose-voice`, `agent-prose:prose-review` |
| Launch and store readiness | any | `agent-marketing:market-campaign` |
| Document authoring and roadmap | any | `wiki-master:wiki-author` for documents and the generated roadmap; `wiki-master:wiki-health` for validation |
| Skill quality | any | `hartye-skills:yoda` |
| Second opinion at a gate | any | `hartye-skills:rubber-duck` |

## Lookup procedure

1. Read the stack from the architecture page or the decision log.
2. Find the purpose and stack in the map.
3. Confirm the named skill appears in the session's list of available skills. If it does, load it and follow it for how. Do not restate its content.
4. Record what you used under "Engine guidance used" on the architecture page (or in the quality evidence note for verification guidance): which guidance, for what question, and the date.

## Fallback chain

Use this when the stack has no mapped skill for the purpose, or the mapped skill is not available.

1. The engine-specific skill, if the map names one and it is available.
2. Otherwise the general engine plugin: `agent-engine:engine-selection` and the stack's profile in it (how to install, drive and verify the stack, with limits), plus `agent-engine:engine-asset-import` for assets, `agent-engine:engine-visual-polish` for visuals and `agent-engine:engine-custom-shaders` for a custom renderer, where they apply.
3. If that has nothing on the question, apply the agnostic requirements in this plugin, record an open question on the state page, and write a roadmap item for the general engine plugin describing the missing guidance (or hand the owner the text to file). Every such gap has this one destination.

## Overlaps this plugin must not duplicate

- **Test phases and lanes:** `agent-tests:test-strategy` defines dev, test and production phases and lanes. game-quality maps its gates onto them (concept through production roughly to dev, beta to test, release and live to production) and defers to it.
- **Launch readiness:** `agent-marketing` models launch gates. G5 points to it and keeps only the engineering release criteria.
- **Document formats and validation:** the wiki tooling above. The artifact catalog gives owner, path and ready definition only.
- **Skill quality:** `hartye-skills:yoda`.

## Dependencies

The wiki tooling (`wiki-master`, version 0.55.0 or later, for the validated `depends-on` field on backlog items) is a hard dependency: the state page, backlog, roadmap and decision records live in the project's wiki. Everything else in this map is optional; when it is missing, use the fallback chain.
````

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test --test-name-pattern="plugin-map" scripts/structure.test.mjs`
Expected: PASS.

- [ ] **Step 5: Run the hygiene scan**

Run: `node --test scripts/hygiene.test.mjs`
Expected: PASS (names are allowed in this file; no host names appear).

- [ ] **Step 6: Commit**

```bash
git add references/plugin-map.md
git commit -m "docs: add the plugin map with the fallback chain"
```

---

### Task 12: Adoption reference

**Files:**
- Create: `references/adoption.md`

- [ ] **Step 1: Run the test to verify it fails**

Run: `node --test --test-name-pattern="adoption.md" scripts/structure.test.mjs`
Expected: FAIL (file missing).

- [ ] **Step 2: Write `references/adoption.md`**

````markdown
# Adoption

Use this when a project already exists: it has code, documents, a roadmap or agent tooling, and no state page. Never rename, overwrite or delete anything while adopting. Adoption records what exists; it does not tidy it. Values are in [the vocabulary](vocabulary.md); documents are in [the artifact catalog](artifact-catalog.md).

## Steps

1. **Inventory.** List what exists: the repository layout, the wiki pages for the project, the roadmap or task list, the tests, and the agent configuration (instruction files, project skills, plugins, tool servers, automation, permissions). Read each document that might serve as a catalog artifact. Do not change anything.
2. **Map.** For each artifact in the project's tier, set its status to `ready`, `draft`, `absent`, `reconstructed` or `conflicting`, and record its existing path in the registry. Adopt existing files in place, whatever they are called. A document that serves a catalog artifact but lives elsewhere keeps its location; the registry records the path.
3. **Reconstruct.** Write only what the work needs next, and label it `reconstructed` in its first line. Take content from code, history and existing documents. For intent that cannot be recovered (the pillars, the player experience, the reasons for past choices) ask the owner. Never fill a gap with plausible text.
4. **Place.** Propose a phase from the evidence in the table below. The owner confirms it. Propose a rigor tier (offer `minimal`); the owner confirms it.
5. **Gaps.** Turn each missing or draft artifact the next gate needs into a backlog item.
6. **Instruction block.** Propose the process block from [its template](templates/instruction-block.md) as a diff against the project's agent instruction file(s). Do not apply it until the owner approves each line. If several instruction files exist, say where they disagree.
7. **Tooling audit.** Run [the tooling audit](tooling-audit.md) as a proposal only.

## Phase placement

| Evidence | Propose |
|---|---|
| No approved brief and nothing playable | concept |
| An approved brief, nothing playable yet | pre-production |
| A playable slice exists and features are still being built | production |
| Nothing new is being planned and content is being finished | beta |
| A release candidate exists | release |
| It has shipped and is receiving patches | live |

When the evidence points two ways, propose the earlier phase and say why.

## Rules

- **No renames, overwrites or deletions.** If something is in the way, record it as an open question.
- **Label reconstructed work.** The first line of a reconstructed document says it was reconstructed and from what.
- **Record conflicts.** When two sources disagree, set `conflicting` and add a decision record or an open question.
- **Finish by updating the state page** with the phase, tier, registry, open questions and next step.
````

- [ ] **Step 3: Run the test to verify it passes**

Run: `node --test --test-name-pattern="adoption.md" scripts/structure.test.mjs`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add references/adoption.md
git commit -m "docs: add the adoption procedure"
```

---

### Task 13: Tooling audit reference

**Files:**
- Create: `references/tooling-audit.md`

- [ ] **Step 1: Run the test to verify it fails**

Run: `node --test --test-name-pattern="tooling-audit.md" scripts/structure.test.mjs`
Expected: FAIL (file missing).

- [ ] **Step 2: Write `references/tooling-audit.md`**

````markdown
# Tooling audit

The architect audits the project's agent tooling and removes what is not used. The owner approves before anything changes. The record format is [the tooling audit template](templates/tooling-audit.md); values are in [the vocabulary](vocabulary.md). Where each category lives for a given host is in [the host adapters](hosts/README.md).

## Scope

The project directory and the project-scoped agent configuration. The owner's global configuration is out of scope: report it if it affects the project, and never change it.

## Categories

1. Agent instruction files.
2. Project skills, commands and prompt files.
3. Plugins or extensions enabled or vendored for the project.
4. Tool-server integrations.
5. Automation the agent triggers (hooks, scripts).
6. Permission allowlists.
7. Agent residue: scratch files, caches, logs, automation profiles, stray plan files, stale worktrees.
8. Instruction content duplicated from the wiki or from a plugin's guidance.

## In use

An item is in use if any of these holds:

- the routing table, the plugin map or an instruction file references it;
- a script or CI step needs it;
- there is recorded use in the evidence window: by default the last 90 days of project history, or since the previous audit if that is more recent (the owner may change it);
- a role skill declares it as a dependency for a need.

Anything else is a candidate.

## Outcomes

Give every candidate exactly one outcome:

- `remove`: unused, with evidence.
- `replace-with-reference`: a project skill or note that duplicates a plugin's guidance; delete it and point at the plugin.
- `merge`: duplicated instructions; keep one copy.
- `convert`: a rule that must never be forgotten is only advice; make it an enforced check.
- `ask-owner`: evidence of use is unavailable or ambiguous.

## Procedure

1. **Inventory** every category above.
2. **Classify** each item as in use or a candidate, with the evidence you used.
3. **Check the instruction files.** For each line, ask whether removing it would cause a mistake; if not, it is a candidate. Check that all instruction files agree and that host-specific content sits in clearly marked sections.
4. **Propose.** Fill in the template: for each candidate, the item, the category, the evidence, the outcome, the risk and how to undo it.
5. The owner approves before anything changes. Record the decision.
6. **Apply** as one reversible change in version control. List untracked items for the owner; do not delete them. Never print the contents of secrets or credentials.
7. **Record** the audit note and update the registry.

## Evidence of use is often unavailable

Hosts differ in what they log. When you cannot show use or non-use, the outcome is `ask-owner`. Never remove an item because nothing proves it is used.

## When

At adoption, at G2, before G5, whenever a tool or instruction file changes materially (a short audit of the changed items only), and when the owner asks.
````

- [ ] **Step 3: Run the test to verify it passes**

Run: `node --test --test-name-pattern="tooling-audit.md" scripts/structure.test.mjs`
Expected: PASS. (The whole-repo link check is a separate test; it passes once Task 14 creates `references/hosts/README.md`, which this file links to.)

- [ ] **Step 4: Commit**

```bash
git add references/tooling-audit.md
git commit -m "docs: add the tooling audit procedure"
```

---

### Task 14: Host adapters

**Files:**
- Create: `references/hosts/README.md`, `references/hosts/generic.md`, `references/hosts/claude-code.md`

Host names may appear only here. Engine and plugin names may not.

- [ ] **Step 1: Run the test to verify it fails**

Run: `node --test --test-name-pattern="host adapter" scripts/structure.test.mjs`
Expected: FAIL (`hosts/README.md` missing).

- [ ] **Step 2: Write `references/hosts/README.md`**

````markdown
# Host adapters

The plugin's method is written without naming any agent host's tools. An adapter records the few facts that differ by host. Add an adapter only for a host whose documentation you have checked. Host names appear only in this folder (and in the plugin manifest each host requires).

## Contract

An adapter is a short file with exactly these four headings:

- `## Instruction files`: the file name(s) the host reads for project instructions, how they combine, and whether one can import another.
- `## Where the audit categories live`: for each of the eight categories in [the tooling audit](../tooling-audit.md), where the host keeps it for a project (or "not applicable").
- `## Checking skill availability`: how to see which skills the current session has, so the plugin-map lookup can confirm a mapped skill exists.
- `## Limits`: what the adapter does not cover, and the date its rows were last checked against the host's documentation.

## Adapters

- [generic](generic.md): use when no adapter fits.
- [claude-code](claude-code.md)
````

- [ ] **Step 3: Write `references/hosts/generic.md`**

````markdown
# Generic host

Use this when no adapter matches the host. Do not guess a host's conventions; ask the owner or inspect the project.

## Instruction files

Ask the owner which file(s) the host reads for project instructions. Look in the project root and its subfolders for files whose names suggest agent instructions. If more than one exists, report where they disagree and ask which is authoritative.

## Where the audit categories live

Inspect the project directory by category, using version control to separate tracked from untracked files:

1. Instruction files: as above.
2. Project skills, commands and prompts: folders or files whose names contain "skill", "command" or "prompt", or that the owner names.
3. Plugins: ask the owner how the host enables them for a project, and read that configuration.
4. Tool servers: configuration files that name server commands or addresses.
5. Automation: configuration that names commands run on agent events, and scripts those commands call.
6. Permissions: configuration that lists allowed or denied commands or tools.
7. Residue: untracked files and folders created by tools, found with the version-control status including ignored files.
8. Duplicated instructions: compare instruction text against the wiki and against the guidance of the plugins in use.

Mark anything you could not locate as `ask-owner`.

## Checking skill availability

Use the skill list the current session advertises. If the host offers no list, ask the owner whether a named skill is installed.

## Limits

This file states no host facts. Nothing here has been checked against any host's documentation.
````

- [ ] **Step 4: Check the Claude Code facts against current documentation**

Before writing Step 5, check each row of its tables against the host's current documentation (search the wiki for the host's documentation pages first, then the web). Keep only rows you can confirm; replace any you cannot with "not confirmed" and ask the owner. Record the check date in the Limits section.

- [ ] **Step 5: Write `references/hosts/claude-code.md`**

````markdown
# Claude Code adapter

## Instruction files

- `CLAUDE.md` in the project root (committed) and in subfolders is read as project instructions.
- A `CLAUDE.md` can import another file with an `@path` line. When a project also keeps an `AGENTS.md` for other hosts, keep one authoritative file and import it from the other so the two cannot drift.
- User-level and personal instruction files are outside the project and out of scope for the audit.

## Where the audit categories live

| Category | Location in a project |
|---|---|
| 1. Instruction files | `CLAUDE.md` files; any `AGENTS.md` kept for other hosts |
| 2. Project skills, commands and prompts | `.claude/skills/<name>/SKILL.md`; `.claude/commands/<name>.md` |
| 3. Plugins | `enabledPlugins` in `.claude/settings.json` |
| 4. Tool servers | `.mcp.json` at the project root |
| 5. Automation | `hooks` in `.claude/settings.json`, and the scripts those hooks call |
| 6. Permissions | `permissions` (allow, ask, deny) in `.claude/settings.json` and `.claude/settings.local.json` |
| 7. Residue | Untracked files and folders: scratch files, caches, logs, tool-created profile folders; stale worktrees |
| 8. Duplicated instructions | Compare `CLAUDE.md` text with the wiki and with the plugins in use |

`.claude/settings.local.json` holds personal settings and is normally untracked; report it, do not edit it without the owner's approval.

## Checking skill availability

The session lists its available skills. Confirm a mapped skill's name appears in that list before loading it.

## Limits

Project-scoped locations only. Rows were checked against the host's documentation on <date of check>; re-check when the host version changes. This adapter does not cover other hosts or user-level configuration.
````

Replace `<date of check>` with the date you performed Step 4.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node scripts/check.mjs`
Expected: the structure tests for hosts, tooling-audit links and all references PASS. The remaining failures are only the skill tests (`phase 1 ships exactly the expected skills`, the skill frontmatter test) until Tasks 15 to 17.

- [ ] **Step 7: Commit**

```bash
git add references/hosts
git commit -m "docs: add the host adapter contract and two adapters"
```

---

### Task 15: studio-start skill

**Files:**
- Create: `skills/studio-start/SKILL.md`

- [ ] **Step 1: Run the tests to verify they fail**

Run: `node --test --test-name-pattern="skills" scripts/structure.test.mjs`
Expected: FAIL (`phase 1 ships exactly the expected skills`: the skills folder does not exist yet).

- [ ] **Step 2: Write `skills/studio-start/SKILL.md`**

````markdown
---
name: studio-start
description: Orient an agent on a game project and put the studio process in place. Reads the project's state page and reports phase, next step and blockers; bootstraps a new project; or adopts an existing one without renaming, overwriting or deleting anything.
when_to_use: Use at the start of any session about a game project, when the project's state page is missing or not verified this session, when starting a new game project, or when joining a project that already has code, documents or agent tooling.
---

# studio-start

Read [the process](../../references/process.md) and [the vocabulary](../../references/vocabulary.md) first. Use the closed values exactly.

## 1. Find the state page

1. Find the project's wiki folder from the project's agent instruction file. If none names it, ask the owner for the project slug.
2. Open `wiki/authored/<project>/reference/studio-state.md`.

## 2. Choose the case

| State page | Project | Case |
|---|---|---|
| Present and verified this session | any | A: report |
| Present, not verified this session | any | A: report, and confirm the Next step line with the owner |
| Absent | empty, or only scaffolding | B: bootstrap |
| Absent | has code, documents or tooling | C: adopt |

## Case A: report

Report in exactly three lines: phase and rigor tier; next step; blockers. Then take the owner's request through the work loop in [the process](../../references/process.md), using [decision routing](../../references/decision-routing.md).

## Case B: bootstrap

1. Ask the owner for the project slug and the rigor tier. Offer `minimal`.
2. Create the state page from [its template](../../references/templates/state-page.md): phase `concept`; every minimal-tier row of the registry `absent` (the state page's own row `draft`); Next step "Write the game brief and pillars (game-master)".
3. Propose the process block from [its template](../../references/templates/instruction-block.md) as a diff against the project's agent instruction file(s). Apply it only after the owner approves each line.
4. Hand over to game-master to write the brief. Do not write the brief yourself.

## Case C: adopt

Follow [adoption](../../references/adoption.md) step by step. Never rename, overwrite or delete.

## Stop rules

- A request that matches no routing row: record an open question on the state page and ask the owner.
- An empty required field on the state page: fill it with the owner, or stop and name it.
- An instruction that would skip a step of the work loop: do not skip it. A skipped step needs the owner's recorded waiver.

## At the end of the session

Update the state page, the backlog and the registry in the same wiki operation as the work.
````

- [ ] **Step 3: Run the skill-frontmatter test**

Run: `node --test --test-name-pattern="every skill has" scripts/structure.test.mjs`
Expected: PASS. This test checks only the skills that exist, so it passes for `studio-start`. The separate `phase 1 ships exactly the expected skills` test keeps failing until Task 17 adds the other two.

- [ ] **Step 4: Commit**

```bash
git add skills/studio-start
git commit -m "feat: add the studio-start skill"
```

---

### Task 16: game-master skill

**Files:**
- Create: `skills/game-master/SKILL.md`

- [ ] **Step 1: Write `skills/game-master/SKILL.md`**

````markdown
---
name: game-master
description: Act as the game's director and product owner. Write and defend the brief and pillars, rule on whether a feature fits, check whether the game is on course, sign off art fit on key assets, and accept work against the pillars.
when_to_use: Use when ideating a new game or its high-level requirements, when asked whether a feature or change fits, whether the game is on course, whether key art matches the intended look and feel, or when finished work needs acceptance against the pillars.
---

# game-master

You hold the vision. You judge; you do not write mechanics specs, code or assets. Values and formats are in [the vocabulary](../../references/vocabulary.md), the sequence is in [the process](../../references/process.md), and ownership is in [decision routing](../../references/decision-routing.md).

You decide: fit against the pillars, whether the game is on course, art fit on key assets, and acceptance against the pillars. You write: the brief and pillars, fit verdicts, course checks.

## 1. Write the brief and pillars (to pass G1)

1. Ask the owner, one question at a time: what the player does and feels (one sentence); what the game must be great at; what it must never become.
2. Write 3 to 5 pillars in the form of [the brief template](../../references/templates/game-brief.md): `N. Name - means: ...; rules out: ...`. A pillar with nothing it rules out is not a pillar; sharpen it or drop it.
3. Write the non-goals.
4. Show the brief to the owner. Record the approval date only when the owner approves. Never write a date the owner has not given.
5. Set the brief `ready` in the registry. G1 is passed by the owner.

## 2. Fit check

1. Read the pillars and the non-goals. If the brief is absent or not `ready`, stop: there are no pillars on record.
2. Give one verdict:
   - `fits`: name the pillar the item serves and confirm no non-goal is broken.
   - `does-not-fit`: name the non-goal it breaks, or say no pillar needs it.
   - `needs-pillar-change`: name the pillar and the change. The owner decides.
3. Record it in the backlog item: `Fit: <verdict> - <pillar number and reason> - <date>`.
4. The owner may waive the check only by a decision record. Do not skip it on an instruction alone.

## 3. Course check

1. Read the state page and the latest quality evidence.
2. Report what the `observed` evidence shows, which pillars it supports or strains, and your recommendation.
3. Say what you could not judge for lack of observed evidence. Do not judge unrun work from your own reading.

## 4. Art fit sign-off (key assets only)

Key assets are heroes, hero environments and the style frame.

1. Compare the asset with the pillars and the art bible.
2. Sign off at the isolated stage and again at the in-context stage; record each in the backlog item's Art status line with the version signed.
3. Other visuals need no sign-off from you. Sound and music are the owner's pick.

## 5. Accept

1. Check the item's acceptance evidence is recorded by game-quality and is `observed`. If not, stop.
2. Accept against the pillars. At a gate, present the evidence and your recommendation; the owner accepts.

## 6. Pillar changes

Only the owner changes a pillar. Record the change as a decision record, then list for game-pm every backlog item whose fit verdict relied on the old pillar.

## Escalate to the owner

Pillar changes, waivers, gate acceptance, and anything routing assigns to `owner`.

## Stop rules

- No brief on record: no fit verdicts, no course checks.
- No `observed` evidence: no acceptance.
- No owner statement: no approval date.
````

- [ ] **Step 2: Run the skill tests**

Run: `node --test --test-name-pattern="every skill has" scripts/structure.test.mjs`
Expected: PASS for the two skills present (`game-master`, `studio-start`).

- [ ] **Step 3: Commit**

```bash
git add skills/game-master
git commit -m "feat: add the game-master skill"
```

---

### Task 17: game-architect skill

**Files:**
- Create: `skills/game-architect/SKILL.md`

- [ ] **Step 1: Write `skills/game-architect/SKILL.md`**

````markdown
---
name: game-architect
description: Act as the game's technical lead. Choose and record technology, keep the architecture page true to the code, sign off tool readiness, set the review standard, own the project's agent instruction files, project skills and tooling, and audit that tooling for what is unused. Defers engine-specific how-to to the engine's own guidance.
when_to_use: Use when choosing an engine, library or tool, when structuring a project or reviewing code, when a tool or capability is needed before work can proceed, when changing the project's agent instructions, skills or tooling, or when cleaning up unused agent tooling.
---

# game-architect

You own technology and the project's agent tooling. This skill stays technology-agnostic: you decide what must be true and what evidence shows it. Engine-specific how-to comes from the guidance named in [the plugin map](../../references/plugin-map.md). Values are in [the vocabulary](../../references/vocabulary.md); the sequence is in [the process](../../references/process.md).

## 1. Technology decisions

1. Read the decision log and the architecture page.
2. State the need as a question, the constraints, and at least two options.
3. Label each claim that matters by how it was established: tested here, documented (cite the source), or general knowledge. Never present documented or general claims as tested.
4. Write [a decision record](../../references/templates/decision-record.md): options, outcome, consequences good and bad, decision-makers. A record with no costs is incomplete.
5. For an engine or stack choice, look up the engine-choice guidance in the plugin map first.

## 2. Engine guidance for architecture and quality questions

Follow the lookup procedure and the fallback chain in [the plugin map](../../references/plugin-map.md): mapped guidance, then the general engine plugin, then the agnostic requirements plus a recorded gap. Do not restate engine guidance here or in the architecture page; cite which guidance you used under "Engine guidance used".

## 3. Architecture page

Keep [the architecture page](../../references/templates/architecture.md) true to the repository. Describe only what exists; planned work goes in the backlog. Update the Verified line only after checking the repository. When the page and the code disagree, the code wins on behavior: record the disagreement as a decision record or an open question.

## 4. Tool readiness sign-off

When work needs a tool or capability that is not ready:

1. Record the need, the candidates, and the evidence that the chosen one works for the need. The evidence is an observed run, not a claim.
2. Record the decision. Mark each item that needs the tool as depending on this record.
3. Do not sign off a tool without an observed run.

## 5. Review standard

Record in the architecture page what a change must show before it is accepted (for example, which checks were run and where the evidence is recorded). Review changes against it.

## 6. Agent instruction files, project skills and tooling

1. Treat instruction files as the owner's. Propose; never overwrite. Present each change as a diff and get the owner's approval for each line.
2. Add a line only if removing it would cause a mistake. Prefer cutting. Do not generate instruction text the owner has not asked for.
3. If several instruction files exist, make them agree. Keep host-specific content in clearly marked sections (see [the host adapters](../../references/hosts/README.md)).
4. A rule that must never be forgotten becomes an enforced check, not advice.
5. Install the process block from [its template](../../references/templates/instruction-block.md) as a diff.

## 7. Tooling audit

Follow [the tooling audit](../../references/tooling-audit.md). Propose; the owner approves; then make one reversible change. Never remove an item because nothing proves it is used.

## Escalate to the owner

Instruction-file changes, tooling removals, waivers, and anything routing assigns to `owner`.

## Stop rules

- No decision record: no technology change.
- No observed run: no tool-readiness sign-off.
- No owner approval: no change to instruction files, skills or tooling.
- A question with no engine guidance available: apply the agnostic requirements, record an open question, and raise the gap as the fallback chain says.
````

- [ ] **Step 2: Run the full check**

Run: `node scripts/check.mjs`
Expected: PASS for every test, including `phase 1 ships exactly the expected skills` and the repository-wide link and hygiene scans. If a skill exceeds 6,500 bytes, shorten prose (not procedures) until `every skill has` passes. If a hygiene hit names a host, engine or plugin in a skill, rephrase it as a purpose.

- [ ] **Step 3: Commit**

```bash
git add skills/game-architect
git commit -m "feat: add the game-architect skill"
```

---

### Task 18: README and spec amendments

**Files:**
- Create: `README.md`
- Modify: `docs/superpowers/specs/2026-10-26-agent-game-studio-design.md`

- [ ] **Step 1: Write `README.md`**

````markdown
# agent-game-studio

Process skills and references that tell an AI agent which phase a game project is in, what comes next, who decides each question, and what evidence passes each gate. It is technology-agnostic and works for new projects and for adopting one that already exists. It ships Markdown and JSON only: no runtime.

Early (0.1.0). Three skills.

## What it gives the agent

- **A state page** in the project's wiki that every session reads first: phase, next step, blockers, the artifact registry, open questions.
- **Decision routing:** every kind of request has one owner, one document to read first and one required output.
- **A work loop with stop rules:** intake, fit check, design readiness, sprint selection, build, verify, accept, update. A missing precondition stops the loop and is named.
- **Phase gates** that pass on observed evidence, with you as the final gate.
- **A planning pass** that asks each discipline what a feature implies before work starts.
- **Adoption** of an existing project in place: no renames, no overwrites, no deletions.
- **A tooling audit** of the project's agent configuration, by proposal and with your approval.

## Skills

| Skill | Use it for |
|---|---|
| `studio-start` | Orienting at the start of a session; bootstrapping a new project; adopting an existing one |
| `game-master` | The brief and pillars; fit checks; course checks; art fit on key assets; acceptance |
| `game-architect` | Technology decisions; the architecture page; tool readiness; agent instruction files and tooling; the tooling audit |

The other roles (project manager, quality, writer, artist, designer) are followed directly from [decision routing](references/decision-routing.md) until their skills ship.

## References

[Process](references/process.md) · [Vocabulary](references/vocabulary.md) · [Decision routing](references/decision-routing.md) · [Artifact catalog](references/artifact-catalog.md) · [Planning](references/planning.md) · [Plugin map](references/plugin-map.md) · [Adoption](references/adoption.md) · [Tooling audit](references/tooling-audit.md) · [Host adapters](references/hosts/README.md)

## Requires

The wiki tooling (`wiki-master`, version 0.55.0 or later) is a hard dependency: the state page, backlog, roadmap and decision records live in the project's wiki. Engine, testing, asset, writing and launch guidance comes from other plugins named in the [plugin map](references/plugin-map.md); the plugin works without them and records the gap.

## Development

```bash
node scripts/check.mjs
```

runs the structure, hygiene and scenario-coverage checks (Node 24+, no dependencies). Behavior is scored by the manual protocol in [tests/scenarios](tests/scenarios/README.md).

## Design

See the [design spec](docs/superpowers/specs/2026-10-26-agent-game-studio-design.md).

## License

MIT
````

- [ ] **Step 2: Amend the spec: the routing table is authoritative in the reference**

Edit `docs/superpowers/specs/2026-10-26-agent-game-studio-design.md`. Replace the exact text

```
### Initial routing table

| Request | Owner | Read first | Required output |
```

with

```
### Initial routing table

The authoritative table is `references/decision-routing.md`. It adds a `Then` column and refines the wording; the table below is the initial version.

| Request | Owner | Read first | Required output |
```

- [ ] **Step 3: Amend the spec: add the tooling audit record to the minimal tier**

In section 7, after the row

```
| Agent instructions | in the repository | game-architect | Contains the state-page block; changed only through an approved diff |
```

add the row

```
| Tooling audit record | `notes/tooling-audit-<date>.md` | game-architect | Every candidate has evidence, an outcome, a risk and an undo; the owner's decision is recorded |
```

- [ ] **Step 4: Amend the spec: phase 1 adapters**

In section 14, replace

```
`studio-start`, `game-master`, `game-architect`, templates, the hygiene and routing tests |
```

with

```
`studio-start`, `game-master`, `game-architect`, templates, the hygiene and routing tests, a generic host adapter and one verified host adapter. Manifests and adapters for further hosts follow once each host's conventions are verified |
```

- [ ] **Step 5: Run the full check and commit**

Run: `node scripts/check.mjs`
Expected: PASS (the README links resolve; the spec edits keep the public hygiene scan clean).

```bash
git add README.md docs/superpowers/specs/2026-10-26-agent-game-studio-design.md
git commit -m "docs: add the README and align the spec with the references"
```

---

### Task 19: Verification and handoff

**Files:**
- Create: `tests/scenarios/results/<date>-<host>.md` (one per run)

- [ ] **Step 1: Run the whole check from a clean state**

Run: `node scripts/check.mjs`
Expected: every test passes; exit code 0.

- [ ] **Step 2: Check the private-term list**

Create a local file outside the repository that lists, one per line, the names of the owner's private projects and machines. Run:

```bash
AGENT_GAME_STUDIO_PRIVATE_TERMS_FILE=<path to that file> node --test scripts/hygiene.test.mjs
```

Expected: PASS. A hit means a private name leaked into the repo: remove it. Never commit the list.

- [ ] **Step 3: Audit the skills' wording**

Run the skill-audit skill named in the plugin map on `skills/studio-start`, `skills/game-master` and `skills/game-architect`. Fix every finding about routing description, ambiguity or unclear stop rules. Re-run `node scripts/check.mjs` after each fix.

Expected: no unresolved findings; check still passes.

- [ ] **Step 4: Run the scenarios by hand**

Follow `tests/scenarios/README.md`: for each of the 34 scenarios, copy the fixture to a scratch folder outside the repository, open a fresh session with the plugin installed, paste the prompt, and score it. Copy `tests/scenarios/results-template.md` to `tests/scenarios/results/<date>-<host>.md`, fill one row per scenario id, and commit it.

Expected: all 11 stop and gate scenarios (S01 to S06, GT1 to GT5) pass, and at least 21 of the 23 routing, deferral and adoption scenarios (R01 to R16, D01 to D04, A01 to A03) pass. That is the spec's 90 percent target. For each failure, fix the skill or reference wording (not the scenario, unless the scenario is wrong), rerun that scenario, and record both runs.

- [ ] **Step 5: Commit the results**

```bash
git add tests/scenarios/results
git commit -m "test: record the phase 1 scenario run"
```

- [ ] **Step 6: Hand off to the owner**

Report: the branch name and commit list (`git log --oneline`), the check output, the scenario results, and any scenario that needed wording changes. Then ask the owner, and do not decide for them:

1. How to create `main` (it has no commits): fast-forward it to `feat/phase-1` keeping history, or squash everything into one initial commit.
2. Whether and where to create a remote repository.
3. Whether to start phase 2 (`game-pm`, `game-quality`) or the pilot on an existing project first.

Out of scope for this plan, to be planned separately: registering the plugin in the marketplace and the release cycle; manifests and adapters for hosts other than the one verified in Task 14; phase 2 and phase 3 skills; the pilot on an existing project; filing further wiki tooling enhancements as they are needed.

---

## Spec coverage

| Spec section | Where it is implemented |
|---|---|
| 1 Purpose, principles, non-goals | `README.md`; the references; Task 3 (hygiene) enforces host-neutral and reference-don't-duplicate |
| 2 Dependencies | `references/plugin-map.md` (Dependencies), `README.md` |
| 3.1 State page | Task 9 (`state-page.md`), Task 7, Task 15 |
| 3.2 Decision routing | Task 8 |
| 3.3 Work loop, 3.4 Session rules, 3.5 Source of truth | Task 7 |
| 4 Phases and gates | Task 7 |
| 5 Roles and routing | Task 8; skills for game-master and game-architect (Tasks 16, 17) |
| 6 Plugin structure, 6.1 Hygiene | Tasks 1 to 5, 14 |
| 6.2 Instruction-file block | Task 9 (`instruction-block.md`), Task 17 |
| 7 Documents | Task 9 |
| 8 Planning | Task 10 |
| 9 Referencing other plugins | Task 11, Task 17 |
| 10 Adoption | Task 12, Task 15 |
| 11 Tooling audit | Tasks 13, 17 |
| 12 Validation | Tasks 2 to 5, 19 |
| 13 Wiki tooling enhancements | Already filed in the wiki; interim behavior is in the references (Depends on lines, self-check) |
| 14 Phasing | Task 18 (spec amendment), Task 19 (handoff) |
| 15 Pilot and failure criteria | Task 19 runs the scenario protocol; the pilot on an existing project follows separately |
| 16 Evidence, 17 Open questions | Spec only |
