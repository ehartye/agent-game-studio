import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { ROOT, anchorLinks, existsExact, frontmatter, headingSlugs, links, posix, readRel, section, tables, walk } from './lib/md.mjs';

const ROLES = ['game-master', 'game-architect', 'game-pm', 'game-quality', 'game-writer', 'game-artist', 'game-designer'];
const EXPECTED_SKILLS = ['game-architect', 'game-master', 'studio-start']; // phase 1; extend in later phases
const REFERENCES = ['adoption', 'artifact-catalog', 'decision-routing', 'tooling-audit', 'vocabulary', 'planning', 'plugin-map', 'process', 'instruction-files', 'entry'];
const SKILL_BUDGET_BYTES = 6500;
const SETS = {
  'Artifact status': ['ready', 'draft', 'absent', 'reconstructed', 'conflicting'],
  'Backlog status': ['planned', 'in-progress', 'shipped', 'blocked', 'dropped'],
  'Art stage': ['brief', 'reference-approved', 'draft', 'craft-review', 'isolated-signoff', 'integrated', 'in-context-signoff', 'locked', 'not-applicable'],
  'Fit verdict': ['fits', 'does-not-fit', 'needs-pillar-change'],
  Gate: ['G1', 'G2', 'G3', 'G4', 'G5', 'none'],
  'Gate result': ['met', 'unmet', 'waived'],
  Evidence: ['observed', 'reported', 'none'],
  'Rigor tier': ['minimal', 'standard', 'full'],
  Phase: ['adopt', 'concept', 'pre-production', 'production', 'beta', 'release', 'live'],
  'Decision status': ['proposed', 'accepted', 'superseded', 'deprecated'],
  'Open question status': ['open', 'answered', 'dropped'],
  'Audit outcome': ['remove', 'replace-with-reference', 'merge', 'convert', 'ask-owner'],
  'Claim basis': ['tested here', 'documented', 'general knowledge'],
  'Defect severity': ['critical', 'other'],
  'Audit owner decision': ['approved', 'approved with changes', 'declined'],
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
  .filter((d) => d.isDirectory() && existsExact(join(ROOT, 'skills', d.name, 'SKILL.md')))
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
    assert.ok(section(text, 'Stop rules'), `${name}: has a Stop rules section`);
    assert.ok(Buffer.byteLength(text) <= SKILL_BUDGET_BYTES, `${name}: ${Buffer.byteLength(text)} bytes`);
  }
});

test('every reference exists', () => {
  for (const ref of REFERENCES) assert.ok(existsExact(join(ROOT, 'references', `${ref}.md`)), `references/${ref}.md`);
});

test('every relative link in every Markdown file resolves', () => {
  const bad = [];
  for (const file of walk(ROOT, ['.md'])) {
    for (const { target, line } of links(readFileSync(file, 'utf8'))) {
      const path = target.split('#')[0];
      if (path && !existsExact(resolve(dirname(file), path))) bad.push(`${posix(file.slice(ROOT.length + 1))}:${line} -> ${target}`);
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
  const phases = tableWith('references/process.md', 'Phase');
  assert.deepEqual(phases.rows.map((r) => r[0].split(' ')[0]), SETS.Phase);
  for (const gate of ['G1', 'G2', 'G3', 'G4', 'G5']) assert.match(text, new RegExp(`\\*\\*${gate}\\*\\*`), gate);
  for (const heading of ['Source of truth', 'Phases and gates', 'Work loop', 'Session rules', 'Evidence rules', 'Change control', 'Waivers', 'Before a role skill exists']) {
    assert.ok(section(text, heading), `section ${heading}`);
  }
  assert.equal((section(text, 'Work loop').match(/^\d+\. \*\*/gm) ?? []).length, 8);
  assert.match(section(text, 'Phases and gates'), /A gate is met when every required evidence item is observed; report met and ask the owner to accept\./);
  assert.match(section(text, 'Phases and gates'), /Concerns outside the gate's evidence list go in a Notes line and never change the result\./);
  assert.match(section(text, 'Work loop'), /in a single-agent session the agent performs each role's step/i);
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
      assert.ok(existsExact(join(ROOT, 'references', 'templates', tpl)), `${artifact}: template ${tpl}`);
      used.add(tpl);
    }
  }
  assert.deepEqual(t.rows.filter((r) => r[1] === 'minimal').map((r) => r[0]), MINIMAL_ARTIFACTS);
  assert.deepEqual([...used].sort(), readdirSync(join(ROOT, 'references', 'templates')).filter((f) => f.endsWith('.md')).sort());
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
  assert.ok(text.includes('Routed: <request type> -> <owner>'), 'the Routed line');
  assert.match(text, /not a waiver: do the step, say what is missing, and offer to record a waiver/);
  assert.match(text, /Load the agent-game-studio studio-start skill if it is available/);
  assert.match(text, /`Blocked by:` names any blocker/);
});

test('studio-start is the entry point for every request: it has a Route the request section with the Routed line', () => {
  const text = readRel('skills/studio-start/SKILL.md');
  const route = section(text, 'Route the request');
  assert.ok(route, 'has a Route the request section');
  assert.ok(route.includes('Routed: <request type> -> <owner>'), 'Routed line');
  assert.match(route, /decision-routing\.md/);
  assert.ok(!section(text, 'After studio-start'), 'the old After studio-start section is gone');
  assert.ok(links(text).some((l) => l.target.includes('references/entry.md')), 'links to references/entry.md');
  const fm = frontmatter(text).data;
  assert.match(fm.when_to_use, /continue|resume|where we left off/i, 'resume phrasing');
  assert.match(fm.when_to_use, /looks like a game project/i, 'a folder that looks like a game project, even with no process set up');
  assert.match(fm.when_to_use, /how to build, run, verify, structure or measure/i, 'technical how-to questions');
  assert.match(fm.description, /^Entry point for any request about a game project/);
  assert.match(fm.description, /Not for /, 'description keeps a Not for clause');
});

test('game-architect when_to_use selects it for how-to technical questions', () => {
  assert.match(frontmatter(readRel('skills/game-architect/SKILL.md')).data.when_to_use, /how to build, run, verify, structure or measure/i);
});

test('entry.md holds the wiki location order, the record-first lookup rule and the scope-change handling', () => {
  const text = readRel('references/entry.md');
  for (const h of ['Find the wiki', 'Look up guidance', 'Scope change after G3']) assert.ok(section(text, h), `section ${h}`);
  const wiki = section(text, 'Find the wiki');
  assert.match(wiki, /wiki\/authored\/<slug>\//);
  assert.match(wiki, /project folder name/);
  assert.match(wiki, /ask the owner where to store the pages/);
  assert.match(wiki, /Never hand-create wiki pages outside/);
  assert.match(section(text, 'Look up guidance'), /BEFORE composing the answer/);
  assert.match(section(text, 'Scope change after G3'), /ask the owner to name the cut and to approve/i);
  assert.match(readRel('references/plugin-map.md'), /WIKI_MASTER_VAULT/);
});

test('the process makes the scope-change request a decision record and says to record output without the wiki scripts', () => {
  const text = readRel('references/process.md');
  assert.match(section(text, 'Change control'), /decision record that names the cut \(or `none` with the owner's reason\)/);
  assert.match(section(text, 'Work loop'), /exact-path file edits/);
  assert.match(section(text, 'Work loop'), /validation was not run/);
  assert.match(section(text, 'Work loop'), /never decline to record/i);
  assert.match(text, /`Blocked by:` names any blocker/);
  assert.match(readRel('references/decision-routing.md'), /\| Scope change after G3 \|[^\n]*decision record[^\n]*names? the cut/);
});

test('plugin-map.md has a purpose/stack/defer table covering every purpose and stack, and the fallback chain', () => {
  const t = tableWith('references/plugin-map.md', 'Purpose');
  assert.deepEqual(t.header, ['Purpose', 'Stack', 'Defer to']);
  assert.ok(t.rows.every((r) => r[2].trim().length > 0), 'every row has a Defer to entry');
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

test('adoption.md has eight numbered steps and the never-rename rule', () => {
  const text = readRel('references/adoption.md');
  assert.equal((section(text, 'Steps').match(/^\d+\. \*\*/gm) ?? []).length, 8);
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
  const adapters = readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md').sort();
  assert.deepEqual(adapters, ['claude-code.md', 'generic.md']);
  for (const file of adapters) {
    const text = readFileSync(join(dir, file), 'utf8');
    for (const heading of ['Instruction files', 'Where the audit categories live', 'Checking skill availability', 'Install', 'Limits']) {
      assert.ok(section(text, heading), `${file}: section ${heading}`);
    }
  }
});

test('fixtures conform to the templates they stand in for', () => {
  const bad = [];
  const fixtures = readdirSync(join(ROOT, 'tests', 'fixtures'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const fx of fixtures) {
    const wiki = join(ROOT, 'tests', 'fixtures', fx, 'wiki', 'authored', 'demo-game');
    if (!existsSync(wiki)) continue;
    const backlog = join(wiki, 'backlog');
    if (existsSync(backlog)) {
      for (const f of readdirSync(backlog).filter((n) => n.endsWith('.md'))) {
        const text = readFileSync(join(backlog, f), 'utf8');
        const where = `${fx}/backlog/${f}`;
        if (!/^Fit: (?:fits|does-not-fit|needs-pillar-change) - .+ - \d{4}-\d{2}-\d{2}$/m.test(text)) bad.push(`${where}: Fit line`);
        if (!/^Target gate: (?:G[1-5]|none)$/m.test(text)) bad.push(`${where}: Target gate line`);
        for (const key of ['art', 'sound', 'writing', 'architecture', 'quality']) {
          if (!new RegExp(`^- ${key}: .+$`, 'm').test(text)) bad.push(`${where}: Implications ${key}`);
        }
        const stage = /^## Art stage\r?\n(\S+)$/m.exec(text);
        if (!stage || !SETS['Art stage'].includes(stage[1])) bad.push(`${where}: Art stage value`);
        if (!/^## Status reason$/m.test(text)) bad.push(`${where}: Status reason section`);
      }
    }
    const statePath = join(wiki, 'reference', 'studio-state.md');
    if (existsSync(statePath)) {
      const text = readFileSync(statePath, 'utf8');
      if (/^\| none \|/m.test(text)) bad.push(`${fx}: state page open questions use a none row`);
    }
    const arch = join(wiki, 'architecture.md');
    if (existsSync(arch) && !/^## Tools$/m.test(readFileSync(arch, 'utf8'))) bad.push(`${fx}: architecture page has no Tools section`);
  }
  assert.deepEqual(bad, []);
});

test('every minimal-tier fixture registry has a row for every minimal-tier artifact', () => {
  const bad = [];
  const fixtures = readdirSync(join(ROOT, 'tests', 'fixtures'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const fx of fixtures) {
    const file = join(ROOT, 'tests', 'fixtures', fx, 'wiki', 'authored', 'demo-game', 'reference', 'studio-state.md');
    if (!existsSync(file)) continue;
    const text = readFileSync(file, 'utf8');
    if (section(text, 'Rigor tier')?.trim() !== 'minimal') continue;
    const registry = tables(text).find((t) => t.header[0] === 'Artifact');
    const have = new Set((registry?.rows ?? []).map((r) => r[0]));
    for (const artifact of MINIMAL_ARTIFACTS) if (!have.has(artifact)) bad.push(`${fx}: no registry row for ${artifact}`);
  }
  assert.deepEqual(bad, []);
});

test('a fixture state page that has left concept records the previous gate as met, except the deliberately impossible one', () => {
  const previous = { 'pre-production': 'G1', production: 'G2', beta: 'G3', release: 'G4' };
  const IMPOSSIBLE = new Set(['stalled-project']);
  const bad = [];
  const fixtures = readdirSync(join(ROOT, 'tests', 'fixtures'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const fx of fixtures) {
    const file = join(ROOT, 'tests', 'fixtures', fx, 'wiki', 'authored', 'demo-game', 'reference', 'studio-state.md');
    if (!existsSync(file) || IMPOSSIBLE.has(fx)) continue;
    const text = readFileSync(file, 'utf8');
    const gate = previous[section(text, 'Phase')?.trim()];
    if (gate && !new RegExp(`^${gate} (?:met|waived) - owner accepted [0-9]{4}-[0-9]{2}-[0-9]{2} - [^ ]+`, 'm').test(section(text, 'Last gate result') ?? '')) {
      bad.push(`${fx}: Phase ${section(text, 'Phase').trim()} without ${gate} met or waived in Last gate result`);
    }
  }
  assert.deepEqual(bad, []);
});

test('every fixture quality note carries the Guidance used line, and the catalog writes quality note names in lowercase', () => {
  const bad = [];
  const fixtures = readdirSync(join(ROOT, 'tests', 'fixtures'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const fx of fixtures) {
    const notes = join(ROOT, 'tests', 'fixtures', fx, 'wiki', 'authored', 'demo-game', 'notes');
    if (!existsSync(notes)) continue;
    for (const f of readdirSync(notes).filter((n) => /^quality-.*\.md$/.test(n))) {
      if (!/^Guidance used: .+$/m.test(readFileSync(join(notes, f), 'utf8'))) bad.push(`${fx}/notes/${f}: Guidance used line`);
    }
  }
  const row = tableWith('references/artifact-catalog.md', 'Artifact').rows.find((r) => r[0] === 'Quality evidence');
  assert.ok(!/[A-Z]/.test(strip(row[2]).replace(/<[^>]*>/g, '')), `catalog path ${row[2]} has uppercase`);
  assert.ok(readRel('references/templates/quality-evidence.md').includes('Guidance used:'), 'template has Guidance used');
  assert.deepEqual(bad, []);
});

test('every #anchor link matches a heading in its target', () => {
  const bad = [];
  for (const file of walk(ROOT, ['.md'])) {
    const text = readFileSync(file, 'utf8');
    for (const { path, fragment, line } of anchorLinks(text)) {
      const target = path ? resolve(dirname(file), path) : file;
      if (!existsSync(target) || !target.endsWith('.md')) continue;
      if (!headingSlugs(readFileSync(target, 'utf8')).includes(fragment.toLowerCase())) bad.push(`${posix(file.slice(ROOT.length + 1))}:${line} -> ${path}#${fragment}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('the process block in each fixture instruction file equals the template with the project name filled in', () => {
  const block = readRel('references/templates/instruction-block.md').replace('<project>', 'demo-game').trim();
  for (const fx of ['active-project', 'stalled-project']) {
    const file = readRel(`tests/fixtures/${fx}/AGENTS.md`);
    assert.ok(file.includes(block), `${fx}: AGENTS.md carries the template block unchanged`);
  }
});

test('fixture decision records follow the decision record template and agree with the registry', () => {
  const bad = [];
  const headings = ['Status', 'Decision-makers', 'Context', 'Options considered', 'Decision', 'Consequences', 'Evidence'];
  const fixtures = readdirSync(join(ROOT, 'tests', 'fixtures'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const fx of fixtures) {
    const wiki = join(ROOT, 'tests', 'fixtures', fx, 'wiki', 'authored', 'demo-game');
    const dir = join(wiki, 'decisions');
    const state = join(wiki, 'reference', 'studio-state.md');
    if (!existsSync(state)) continue;
    const registry = tables(readFileSync(state, 'utf8')).find((t) => t.header[0] === 'Artifact');
    const row = registry?.rows.find((r) => r[0] === 'Decision record');
    const files = existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith('.md')) : [];
    if (row && row[3] === 'ready' && files.length === 0) bad.push(`${fx}: registry says ready but there is no decision record`);
    if (row && row[3] === 'absent' && files.length > 0) bad.push(`${fx}: registry says absent but a decision record exists`);
    for (const f of files) {
      const text = readFileSync(join(dir, f), 'utf8');
      for (const h of headings) if (!new RegExp('^## ' + h + '$', 'm').test(text)) bad.push(`${fx}/decisions/${f}: section ${h}`);
      if (!/^## Options considered\s+1\. .+\s+2\. /m.test(text)) bad.push(`${fx}/decisions/${f}: at least two options`);
    }
  }
  assert.deepEqual(bad, []);
});

test('the quality evidence template has the optional Release criteria section and the release fixture uses it', () => {
  assert.ok(section(readRel('references/templates/quality-evidence.md'), 'Release criteria'), 'template section');
  assert.ok(section(readFileSync(join(ROOT, 'tests', 'fixtures', 'release-ready', 'wiki', 'authored', 'demo-game', 'notes', 'quality-g5.md'), 'utf8'), 'Release criteria'), 'fixture section');
});

test('the decision record template has no bracketed wikilink form', () => {
  assert.ok(!readRel('references/templates/decision-record.md').includes('[[<'), 'no [[<slug>]] form');
});

test('a backticked value after a status-like word belongs to a closed set', () => {
  const known = new Set(Object.values(SETS).flat());
  for (const extra of ['later', 'generated', 'any']) known.add(extra); // template column and stack values, not statuses
  const pattern = /(?:status|Status|verdict|stage|Phase|phase|tier|result|outcome|severity|set (?:the )?(?:item|question|brief|it)|mark(?:ed)?|is) `([a-z][a-z-]*)`/g;
  assert.ok([...'Phase is `adopt`'.matchAll(pattern)].length === 1, 'the pattern matches a sample');
  const files = [...walk(join(ROOT, 'skills'), ['.md']), ...walk(join(ROOT, 'references'), ['.md']), ...walk(join(ROOT, 'tests', 'fixtures'), ['.md'])];
  const bad = [];
  for (const file of files) {
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
      for (const m of line.matchAll(pattern)) if (!known.has(m[1])) bad.push(`${posix(file.slice(ROOT.length + 1))}:${i + 1}: \`${m[1]}\``);
    });
  }
  assert.deepEqual(bad, []);
});

test('the reply starts with the report and the Routed line, in the skills and the instruction block', () => {
  const FIRST = /If this reply has not yet started with the three-line report and the `Routed: <request type> -> <owner>` line \(see studio-start, Route the request\), start it that way\./;
  for (const name of ['game-master', 'game-architect']) {
    const body = readRel(`skills/${name}/SKILL.md`).split(/\r?\n/);
    const first = body[body.findIndex((l) => l.startsWith('# ')) + 2];
    assert.match(first, FIRST, `${name}: first line after the title`);
  }
  const route = section(readRel('skills/studio-start/SKILL.md'), 'Route the request');
  assert.match(route, /BEGINS with the three-line report and the Routed line, before any narration/);
  assert.match(route, /even when work was done/);
  assert.match(route, /exact Request text/);
  assert.match(readRel('references/templates/instruction-block.md'), /begins with the three-line report and the Routed line, before any narration/);
  const entry = readRel('references/entry.md');
  assert.match(section(entry, 'The Routed line'), /Anything else -> none/);
  assert.match(section(entry, 'The Routed line'), /Joining an existing project -> studio-start/);
  assert.match(section(entry, 'The Routed line'), /never invent a row name/i);
});

test('lookup answers never carry flags, commands, versions or timings, and an adopted rule becomes a recorded decision', () => {
  for (const text of [section(readRel('references/entry.md'), 'Look up guidance'), readRel('references/plugin-map.md')]) {
    assert.match(text, /never name flags, commands, version numbers or timings taken from the guidance/i);
    assert.match(text, /at most ONE rule/i);
    assert.match(text, /review standard in the same operation/);
  }
});

test('adoption shows the diff itself and never records an owner review the owner did not give', () => {
  const adoption = readRel('references/adoption.md');
  const rule = 'show the diff itself in the reply; a summary of what would be added does not count';
  assert.ok(adoption.includes(rule), 'adoption step 7');
  assert.ok(readRel('references/instruction-files.md').includes(rule), 'instruction files');
  for (const [name, text] of [['adoption', adoption], ['state page template', readRel('references/templates/state-page.md')], ['process', readRel('references/process.md')]]) {
    assert.match(text, /proposed, owner review pending/, name);
  }
  assert.match(adoption, /never record an owner review, confirmation or acceptance the owner did not give/i);
  assert.match(section(readRel('references/process.md'), 'Work loop'), /may create the backlog item as game-pm \(from the template, status `planned`, Fit line left to game-master's step\) and must not edit the roadmap by hand/);
});
