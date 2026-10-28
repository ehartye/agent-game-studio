/** @lane merge */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { ROOT, anchorLinks, existsExact, frontmatter, headingSlugs, links, posix, readRel, section, tables, walk } from './lib/md.mjs';

const ROLES = ['game-master', 'game-architect', 'game-pm', 'game-quality', 'game-writer', 'game-artist', 'game-designer'];
const EXPECTED_SKILLS = ['game-architect', 'game-master', 'game-pm', 'game-quality', 'studio-start'];
const CHECKPOINTS = { 'brief-approved': 'Brief approved', 'vertical-slice': 'Vertical slice', 'scope-lock': 'Scope lock', 'content-lock': 'Content lock', ship: 'Ship' };
const SLUGS = Object.keys(CHECKPOINTS);
const LEGACY_FIXTURES = new Set(['legacy-codes']); // the one fixture that keeps the old page shape, to test the alias
const REFERENCES = ['adoption', 'artifact-catalog', 'decision-routing', 'tooling-audit', 'vocabulary', 'planning', 'plugin-map', 'process', 'instruction-files', 'entry'];
const SKILL_BUDGET_BYTES = 6500;
const REVIEW_OWNER = "the checkpoint's first-named review owner";
const SETS = {
  'Artifact status': ['ready', 'draft', 'absent', 'reconstructed', 'conflicting'],
  'Backlog status': ['planned', 'in-progress', 'shipped', 'blocked', 'dropped'],
  'Art stage': ['brief', 'reference-approved', 'draft', 'craft-review', 'isolated-signoff', 'integrated', 'in-context-signoff', 'locked', 'not-applicable'],
  'Fit verdict': ['fits', 'does-not-fit', 'needs-pillar-change'],
  Checkpoint: [...SLUGS, 'none'],
  'Criterion status': ['met', 'not-met', 'not-assessed'],
  'Checkpoint standing': ['open', 'reviewed', 'reviewed-with-concessions'],
  'Blind review': ['done', 'declined', 'not-run'],
  'Constraint status': ['not-yet-measured', 'at-risk', 'met', 'conceded', 'unmet'],
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
  'Quality evidence', 'Agent instructions block', 'Tooling audit record', 'Constraints', 'Checkpoint review',
];
const TEMPLATE_KIND = {
  'state-page.md': 'reference',
  'game-brief.md': 'overview',
  'decision-record.md': 'decision',
  'architecture.md': 'architecture',
  'backlog-item.md': 'backlog-item',
  'quality-evidence.md': 'note',
  'tooling-audit.md': 'note',
  'constraints.md': 'reference',
  'checkpoint-review.md': 'reference',
};
const WIKI_KEYS = ['type', 'created', 'updated', 'reviewed', 'status', 'sources', 'ai-generated', 'project', 'kind'];
const STATE_FIELDS = ['Phase', 'Rigor tier', 'Next step', 'Blocked by', 'Current sprint', 'Artifact registry', 'Open questions', 'Last checkpoint review', 'Decision to proceed'];
const CHECKPOINT_REVIEW_KEYS = ['checkpoint', 'standing', 'tip', 'review-date', 'blind-review', 'owner-acceptance'];
const CHECKPOINT_REVIEW_SECTIONS = ['Criteria', 'Constraints at this checkpoint', 'Concessions and decisions to proceed', 'Claims the evidence does not support', 'Independent review', 'Open items'];
const CONSTRAINT_COLUMNS = ['Constraint', 'Source', 'Conditions', 'How checked', 'Matters at', 'Status', 'Evidence', 'Concession'];

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

test('the plugin ships exactly the five expected skills', () => {
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
    assert.ok(!section(text, 'Stop rules'), `${name}: the Stop rules section is gone`);
    const rules = section(text, 'Rules that hold');
    assert.ok(rules, `${name}: has a Rules that hold section`);
    assert.equal((rules.match(/^(?:[0-9]+[.]|-) /gm) ?? []).length, 3, `${name}: exactly three rules`);
    assert.match(rules, /`met` is written only with `observed` evidence/, `${name}: the evidence rule`);
    assert.match(rules, /`proposed, owner review pending`/, `${name}: the owner-words rule`);
    assert.match(rules, /(?:never renamed, overwritten or deleted|Never rename, overwrite or delete)/, `${name}: the existing-file rule`);
    const next = section(text, 'Where to go next');
    assert.ok(next, `${name}: has a Where to go next section`);
    assert.ok(links(next).some((l) => l.target.endsWith('references/plugin-map.md#where-to-go-next')), `${name}: Where to go next points to the plugin map`);
    assert.ok(Buffer.byteLength(text) <= SKILL_BUDGET_BYTES, `${name}: ${Buffer.byteLength(text)} bytes`);
  }
});

test('the plugin text never uses the words gate, waiver or not cleared, and writes the old codes G1 to G5 once, in the alias line in the vocabulary', () => {
  const files = [...walk(join(ROOT, 'skills'), ['.md']), ...walk(join(ROOT, 'references'), ['.md']), join(ROOT, 'README.md')];
  const words = [];
  const codes = [];
  for (const file of files) {
    const rel = posix(file.slice(ROOT.length + 1));
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
      if (/\bgates?\b|\bwaive[dr]?\b|\bwaivers?\b|not cleared/i.test(line)) words.push(`${rel}:${i + 1}`);
      if (/\bG[1-5]\b/.test(line)) codes.push(`${rel}:${i + 1}`);
    });
  }
  assert.deepEqual(words, []);
  assert.equal(codes.length, 1, `the codes appear ${codes.length} times: ${codes.join(', ')}`);
  assert.match(codes[0], /^references\/vocabulary\.md:/);
  const alias = readRel('references/vocabulary.md').split(/\r?\n/).find((l) => /\bG[1-5]\b/.test(l));
  assert.match(alias, /An older page may name them G1 to G5; read those as brief-approved, vertical-slice, scope-lock, content-lock and ship, in that order\. Never write the codes\./);
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

test('process.md defines the phases, the five checkpoints, advise-ask-proceed, the three rules, the checkpoint review, the blind review and the eight-step work loop', () => {
  const text = readRel('references/process.md');
  const phases = tableWith('references/process.md', 'Phase');
  assert.deepEqual(phases.rows.map((r) => r[0].split(' ')[0]), SETS.Phase);
  assert.deepEqual(phases.rows.map((r) => strip(r[1]).match(/\(([a-z-]+)\)$/)?.[1] ?? 'none'), ['none', ...SLUGS, 'none']);
  for (const [slug, name] of Object.entries(CHECKPOINTS)) assert.ok(phases.rows.some((r) => r[1] === `${name} (\`${slug}\`)`), `checkpoint ${name} (${slug})`);
  for (const heading of ['Source of truth', 'Phases and checkpoints', 'Advise, ask, proceed', 'Rules that hold', 'Checkpoint review', 'Blind review', 'Work loop', 'Session rules', 'Evidence rules', 'Change control', 'Before a role skill exists']) {
    assert.ok(section(text, heading), `section ${heading}`);
  }
  assert.ok(!section(text, 'Waivers') && !section(text, 'Phases and gates'), 'the old gate sections are gone');
  assert.equal((section(text, 'Work loop').match(/^\d+\. \*\*/gm) ?? []).length, 8);
  assert.match(text, /A checkpoint reports where the project stands and what is missing\. It never blocks work\. The phase changes only when the owner says so; the agent proposes the change\./);
  assert.match(section(text, 'Phases and checkpoints'), /A criterion's status is set from the criteria list alone\. Concerns outside the list go in a Notes line and never change a status\./);
  assert.match(section(text, 'Phases and checkpoints'), /A checkpoint reviewed with unmet criteria still lets the owner move on: the unmet criteria are recorded as concessions\./);
  const advise = section(text, 'Advise, ask, proceed');
  assert.deepEqual((advise.match(/^\d+\. \*\*([A-Za-z]+)\.\*\*/gm) ?? []).map((l) => l.replace(/^\d+\. \*\*|\.\*\*$/g, '')), ['Advise', 'Ask', 'Proceed']);
  assert.match(advise, /in two lines/);
  assert.match(advise, /Do not build the work yet\./);
  assert.match(advise, /One reply from the owner is enough\. No document is required\./);
  assert.match(advise, /Never proceed without having advised, and never refuse once the owner has said go\./);
  const rules = section(text, 'Rules that hold');
  assert.equal((rules.match(/^\d+\. /gm) ?? []).length, 3, 'exactly three rules');
  assert.match(rules, /The owner cannot lift them by telling the agent to proceed/);
  assert.match(section(text, 'Work loop'), /in a single-agent session the agent performs each role's step/i);
});

test('the checkpoint review has six steps, writes the record at reference/checkpoint-<slug>.md with the fixed keys and sections, and never lets an agent fill owner-acceptance', () => {
  const review = section(readRel('references/process.md'), 'Checkpoint review');
  assert.deepEqual((review.match(/^\d+\. \*\*([A-Za-z ]+)\.\*\*/gm) ?? []).map((l) => l.replace(/^\d+\. \*\*|\.\*\*$/g, '')), ['Collect', 'Assess', 'Present', 'Record', 'Offer the blind review', 'Hand over']);
  assert.ok(review.includes('`reference/checkpoint-<slug>.md`'));
  for (const key of CHECKPOINT_REVIEW_KEYS) assert.ok(review.includes(`\`${key}\``), `key ${key}`);
  for (const heading of CHECKPOINT_REVIEW_SECTIONS) assert.ok(review.includes(heading), `section ${heading}`);
  assert.match(review, /A criterion nobody measured is `not-assessed`\. It never counts as met\./);
  assert.match(review, /an agent never fills it/);
  assert.match(review, /do not record a decision for them/);
});

test('the blind review is read-only, never the author, given only criteria, constraints and raw evidence, and run unasked in an autonomous run', () => {
  const blind = section(readRel('references/process.md'), 'Blind review');
  assert.match(blind, /read-only and never the author/);
  assert.match(blind, /never given the author's conclusions/);
  assert.match(blind, /a verdict for each criterion, what it could not verify and anything that looks inconsistent/);
  assert.match(blind, /In an autonomous run it runs without asking\./);
  assert.match(blind, /`blind-review: not-run` with the reason/);
  assert.match(blind, /`reported` evidence/);
});

test('decision-routing.md has a valid roles table and a valid routing table', () => {
  const roles = tableWith('references/decision-routing.md', 'Role');
  assert.deepEqual(roles.rows.map((r) => r[0].replace(/ \(.*\)$/, '')), ROLES);
  const routing = tableWith('references/decision-routing.md', 'Request');
  assert.deepEqual(routing.header, ['Request', 'Owner', 'Then', 'Read first', 'Required output']);
  assert.equal(routing.rows.length, 17);
  assert.ok(routing.rows.some((r) => r[0] === 'What must this game satisfy, or is X a constraint' && strip(r[1]) === 'game-master' && strip(r[2]) === 'owner'), 'the constraints row');
  assert.ok(routing.rows.some((r) => r[0] === 'Scope change after Scope lock'), 'the scope change row is named for the checkpoint');
  for (const owner of ['game-pm', 'game-quality']) assert.ok(routing.rows.some((r) => strip(r[1]) === owner), `${owner} owns a row`);  for (const [request, owner, then, readFirst, output] of routing.rows) {
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
    assert.ok([...ROLES, 'decider', REVIEW_OWNER].includes(strip(owner)), `${artifact}: owner "${owner}"`);
    assert.equal(strip(owner) === REVIEW_OWNER, artifact === 'Checkpoint review', `${artifact}: only the checkpoint review is owned by the review owner`);
    assert.ok(strip(path).length > 0, `${artifact}: path`);
    assert.ok(ready.length > 10, `${artifact}: ready definition`);
    const tpl = strip(template);
    if (tpl !== 'later' && tpl !== 'generated') {
      assert.ok(existsExact(join(ROOT, 'references', 'templates', tpl)), `${artifact}: template ${tpl}`);
      used.add(tpl);
    }
  }
  assert.deepEqual(t.rows.filter((r) => r[1] === 'minimal').map((r) => r[0]), MINIMAL_ARTIFACTS);
  const row = (name) => t.rows.find((r) => r[0] === name);
  assert.deepEqual([strip(row('Constraints')[2]), strip(row('Constraints')[3]), strip(row('Constraints')[4])], ['reference/constraints.md', 'game-master', 'constraints.md']);
  assert.deepEqual([strip(row('Checkpoint review')[2]).split(' ')[0], strip(row('Checkpoint review')[4])], ['reference/checkpoint-<slug>.md', 'checkpoint-review.md']);
  assert.match(row('Backlog item')[5], /Fit line and Target checkpoint recorded/);
  for (const key of CHECKPOINT_REVIEW_KEYS) assert.ok(row('Checkpoint review')[5].includes(`\`${key}\``), `ready means names ${key}`);
  for (const heading of CHECKPOINT_REVIEW_SECTIONS.slice(1, 4)) assert.ok(row('Checkpoint review')[5].includes(heading), `ready means names ${heading}`);
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

test('the checkpoint review and constraints templates carry their keys, sections and columns, and the backlog template carries the checkpoint fields', () => {
  const review = readRel('references/templates/checkpoint-review.md');
  const fm = frontmatter(review).data;
  for (const key of CHECKPOINT_REVIEW_KEYS) assert.ok(key in fm, `checkpoint-review.md: key ${key}`);
  assert.equal(fm.standing, 'open', 'a new review starts open');
  assert.equal(fm['owner-acceptance'], '', 'owner-acceptance is empty in the template');
  for (const heading of CHECKPOINT_REVIEW_SECTIONS) assert.ok(section(review, heading), `checkpoint-review.md: section ${heading}`);
  assert.deepEqual(tableWith('references/templates/checkpoint-review.md', 'Criterion').header, ['Criterion', 'How it is met', 'Status', 'Evidence', 'Link']);
  assert.deepEqual(tableWith('references/templates/checkpoint-review.md', 'Constraint').header, ['Constraint', 'Status', 'Evidence', 'Concession']);
  assert.match(review, /`met` needs `observed` evidence\. A criterion that was not measured is `not-assessed` and never counts as met\./);
  assert.match(review, /An agent never fills it\./);
  assert.match(section(review, 'Independent review'), /no independent review ran/);
  assert.match(section(review, 'Independent review'), /never the author/);

  const constraints = tableWith('references/templates/constraints.md', 'Constraint');
  assert.deepEqual(constraints.header, CONSTRAINT_COLUMNS);
  assert.equal(constraints.rows.length, 1, 'one worked example');
  assert.deepEqual(constraints.rows[0].slice(4, 6), ['content-lock', 'not-yet-measured']);
  assert.match(constraints.rows[0][0], /^60 fps average at 1080p on the target laptop at the default quality setting$/);
  assert.match(readRel('references/templates/constraints.md'), /Only the owner approves, changes, concedes or removes a line\./);

  const backlog = readRel('references/templates/backlog-item.md');
  assert.match(backlog, /^Target checkpoint: <brief-approved \| vertical-slice \| scope-lock \| content-lock \| ship, or none>$/m);
  assert.match(backlog, /^- constraints touched: /m);
  assert.doesNotMatch(backlog, /Target gate/);
});

test('the instruction block names the state page, the routing table, the advisory rules and studio-start', () => {
  const text = readRel('references/templates/instruction-block.md');
  assert.match(text, /state page/i);
  assert.match(text, /routing/i);
  assert.match(text, /observed evidence/i);
  assert.match(text, /studio-start/);
  assert.ok(text.includes('Routed: <request type> -> <owner>'), 'the Routed line');
  assert.match(text, /If a prerequisite is missing, name it and the risk in two lines, offer the missing step first, and do the work once the owner says go, recording their choice and the date as a decision to proceed/);
  assert.match(text, /A checkpoint review reports each criterion from the evidence list alone; concerns beyond it go in a Notes line\./);
  assert.match(text, /Never record an acceptance or confirmation the owner did not give\./);
  assert.match(text, /anything else is `reported` or `not-assessed`/);
  assert.doesNotMatch(text, /\bgates?\b|waive|Stop and name/i);
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
  for (const h of ['Find the wiki', 'Look up guidance', 'Review a checkpoint', 'Scope change after Scope lock']) assert.ok(section(text, h), `section ${h}`);
  const wiki = section(text, 'Find the wiki');
  assert.match(wiki, /wiki\/authored\/<slug>\//);
  assert.match(wiki, /project folder name/);
  assert.match(wiki, /ask the owner where to store the pages/);
  assert.match(wiki, /Never hand-create wiki pages outside/);
  assert.match(section(text, 'Look up guidance'), /BEFORE composing the answer/);
  assert.match(section(text, 'Scope change after Scope lock'), /ask the owner to name the cut and to approve/i);
  assert.match(section(text, 'Scope change after Scope lock'), /or says to proceed anyway, which is recorded as a decision to proceed/);
  const review = section(text, 'Review a checkpoint');
  assert.match(review, /Follow Checkpoint review in \[the process\]/);
  assert.match(review, /a criterion nobody measured is `not-assessed`/);
  assert.match(review, /offer the blind review/);
  assert.match(review, /The owner decides when to move on; propose the move, do not make it\./);
  assert.match(readRel('references/plugin-map.md'), /WIKI_MASTER_VAULT/);
});

test('the process makes the scope-change request a decision record and says to record output without the wiki scripts', () => {
  const text = readRel('references/process.md');
  assert.match(section(text, 'Change control'), /decision record that names the cut \(or `none` with the owner's reason\)/);
  assert.match(section(text, 'Work loop'), /exact-path file edits/);
  assert.match(section(text, 'Work loop'), /validation was not run/);
  assert.match(section(text, 'Work loop'), /never decline to record/i);
  assert.match(text, /`Blocked by:` names any blocker/);
  assert.match(readRel('references/decision-routing.md'), /\| Scope change after Scope lock \|[^\n]*decision record[^\n]*(?:naming|names?) the cut/);
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

test('plugin-map.md has a Where to go next table keyed by situation, and the fallback chain says to include the gap text in the answer', () => {
  const map = readRel('references/plugin-map.md');
  const t = tableWith('references/plugin-map.md', 'Situation');
  assert.deepEqual(t.header, ['Situation', 'Hand off to', 'Bring', 'Record the result']);
  assert.ok(t.rows.every((r) => r.every((c) => c.trim().length > 0)), 'every cell is filled');
  const situations = t.rows.map((r) => r[0]);
  for (const s of ['Choosing an engine or web stack', 'Measuring performance, or checking a constraint', 'Deciding a testing strategy, or auditing the tests', 'Writing or validating project documents']) assert.ok(situations.includes(s), `situation ${s}`);
  assert.ok(t.rows.filter((r) => /constraints page/.test(r[2])).length >= 3, 'the constraints page is brought where it applies');
  assert.ok(t.rows.some((r) => /Status and Evidence link/.test(r[3])), 'measured results go back to the constraint row');
  assert.ok(section(map, 'Where to go next'), 'section');
  assert.match(section(map, 'Fallback chain'), /Include the gap text in the answer; never offer to write it later\./);
});

test('adoption.md has nine numbered steps, the last proposing the constraints page in one pass, and the never-rename rule', () => {
  const text = readRel('references/adoption.md');
  const steps = section(text, 'Steps');
  assert.equal((steps.match(/^\d+\. \*\*/gm) ?? []).length, 9);
  const last = steps.split(/\r?\n/).find((l) => l.startsWith('9. **Constraints.**'));
  assert.ok(last, 'step 9 is Constraints');
  assert.match(last, /Propose the whole constraints page in one pass, as a new file at `reference\/constraints\.md`/);
  assert.match(last, /mark any row with no source/);
  assert.match(last, /Only the owner approves, changes, concedes or removes a row/);
  assert.match(text, /never rename/i);
  const rules = section(text, 'Rules that hold');
  assert.equal((rules.match(/^\d+\. \*\*/gm) ?? []).length, 3, 'adoption repeats the three rules');
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
  assert.match(section(text, 'Planning pass'), /including each constraint on the constraints page .* that the feature touches\. Only the owner adds or changes a constraint\./);
  assert.match(section(text, 'Planning pass'), /set each item's Target checkpoint/);
  assert.equal((section(text, 'Ordering defaults').match(/^\d+\. /gm) ?? []).length, 6);
  assert.equal((section(text, 'Art stages and sign-off').match(/^\d+\. /gm) ?? []).length, 8);
});

test('every host adapter follows the adapter contract headings', () => {
  const dir = join(ROOT, 'references', 'hosts');
  assert.ok(existsSync(join(dir, 'README.md')), 'hosts/README.md');
  const adapters = readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md').sort();
  assert.deepEqual(adapters, ['claude-code.md', 'generic.md']);
  const CONTRACT = ['Instruction files', 'Where the audit categories live', 'Checking skill availability', 'Install', 'Blind review', 'Limits'];
  const contract = readFileSync(join(dir, 'README.md'), 'utf8');
  assert.match(contract, /An adapter is a short file with these six headings:/);
  assert.deepEqual([...contract.matchAll(/^- `## ([^`]+)`/gm)].map((m) => m[1]), CONTRACT, 'the contract lists the six headings in order');
  for (const file of adapters) {
    const text = readFileSync(join(dir, file), 'utf8');
    for (const heading of CONTRACT) assert.ok(section(text, heading), `${file}: section ${heading}`);
    assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), CONTRACT, `${file}: headings in contract order`);
  }
  const blind = (file) => section(readFileSync(join(dir, file), 'utf8'), 'Blind review');
  assert.match(blind('claude-code.md'), /read-only subagent/);
  assert.match(blind('claude-code.md'), /Give it file paths only, never pasted text and never your own conclusions/);
  assert.match(blind('claude-code.md'), /`blind-review: done`/);
  assert.match(blind('generic.md'), /`blind-review: not-run`/);
  assert.match(blind('generic.md'), /no independent review ran/);
  assert.match(blind('generic.md'), /Do not review your own work and call it independent\./);
  for (const file of adapters) assert.match(blind(file), /`blind-review: declined`/, `${file}: declined`);
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
        if (!new RegExp(`^Target checkpoint: (?:${SLUGS.join('|')}|none)$`, 'm').test(text)) bad.push(`${where}: Target checkpoint line`);
        for (const key of ['art', 'sound', 'writing', 'architecture', 'quality', 'constraints touched']) {
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
    if (!existsSync(file) || LEGACY_FIXTURES.has(fx)) continue;
    const text = readFileSync(file, 'utf8');
    if (section(text, 'Rigor tier')?.trim() !== 'minimal') continue;
    const registry = tables(text).find((t) => t.header[0] === 'Artifact');
    const have = new Set((registry?.rows ?? []).map((r) => r[0]));
    for (const artifact of MINIMAL_ARTIFACTS) if (!have.has(artifact)) bad.push(`${fx}: no registry row for ${artifact}`);
  }
  assert.deepEqual(bad, []);
});

test('a fixture state page that has left concept records the previous checkpoint as reviewed with the owner accepting it, except the deliberately impossible one; every current page has a Decision to proceed section', () => {
  const previous = { 'pre-production': 'brief-approved', production: 'vertical-slice', beta: 'scope-lock', release: 'content-lock' };
  const IMPOSSIBLE = new Set(['stalled-project']);
  const bad = [];
  const fixtures = readdirSync(join(ROOT, 'tests', 'fixtures'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const fx of fixtures) {
    const wiki = join(ROOT, 'tests', 'fixtures', fx, 'wiki', 'authored', 'demo-game');
    const file = join(wiki, 'reference', 'studio-state.md');
    if (!existsSync(file) || LEGACY_FIXTURES.has(fx)) continue;
    const text = readFileSync(file, 'utf8');
    if (!section(text, 'Decision to proceed')) bad.push(`${fx}: no Decision to proceed section`);
    if (section(text, 'Last gate result') !== null) bad.push(`${fx}: still has a Last gate result section`);
    if (IMPOSSIBLE.has(fx)) continue;
    const slug = previous[section(text, 'Phase')?.trim()];
    if (!slug) continue;
    const m = new RegExp(`^${slug} (reviewed|reviewed-with-concessions) - owner accepted [0-9]{4}-[0-9]{2}-[0-9]{2} - (\\S+)$`, 'm').exec(section(text, 'Last checkpoint review') ?? '');
    if (!m) bad.push(`${fx}: Phase ${section(text, 'Phase').trim()} without ${slug} reviewed in Last checkpoint review`);
    else if (!existsSync(join(wiki, m[2]))) bad.push(`${fx}: Last checkpoint review links ${m[2]}, which does not exist`);
  }
  assert.deepEqual(bad, []);
});

test('the old codes G1 to G5 and the word gate appear in no fixture except the legacy-codes one, which keeps an older page to test the alias', () => {
  const bad = [];
  for (const file of walk(join(ROOT, 'tests', 'fixtures'), ['.md', '.txt'])) {
    const rel = posix(file.slice(ROOT.length + 1));
    if (rel.startsWith('tests/fixtures/legacy-codes/')) continue;
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => { if (/\bG[1-5]\b|\bgates?\b|\bwaive/i.test(line) || /\bg[1-5]-/.test(line)) bad.push(`${rel}:${i + 1}`); });
  }
  assert.deepEqual(bad, []);
  const old = join(ROOT, 'tests', 'fixtures', 'legacy-codes', 'wiki', 'authored', 'demo-game');
  const state = readFileSync(join(old, 'reference', 'studio-state.md'), 'utf8');
  assert.match(section(state, 'Last gate result'), /^G2 met - owner accepted 2026-01-02 - notes\/quality-g2\.md$/m, 'the older page names the last result by its code');
  assert.equal(section(state, 'Phase').trim(), 'production');
  assert.ok(existsSync(join(old, 'notes', 'quality-g2.md')), 'the older note keeps its coded name');
  assert.match(readFileSync(join(old, 'notes', 'quality-g2.md'), 'utf8'), /^Supports: G2$/m);
});

test('fixture checkpoint reviews and constraints pages follow their templates and agree with themselves', () => {
  const bad = [];
  const fixtures = readdirSync(join(ROOT, 'tests', 'fixtures'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  let reviews = 0;
  let constraintPages = 0;
  for (const fx of fixtures) {
    const dir = join(ROOT, 'tests', 'fixtures', fx, 'wiki', 'authored', 'demo-game', 'reference');
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((n) => /^checkpoint-.*\.md$/.test(n))) {
      reviews++;
      const text = readFileSync(join(dir, f), 'utf8');
      const where = `${fx}/reference/${f}`;
      const fm = frontmatter(text)?.data ?? {};
      for (const key of CHECKPOINT_REVIEW_KEYS) if (!(key in fm)) bad.push(`${where}: key ${key}`);
      if (`checkpoint-${fm.checkpoint}.md` !== f || !SLUGS.includes(fm.checkpoint)) bad.push(`${where}: checkpoint key does not match the file name`);
      if (!SETS['Checkpoint standing'].includes(fm.standing)) bad.push(`${where}: standing`);
      if (!SETS['Blind review'].includes(fm['blind-review'])) bad.push(`${where}: blind-review`);
      for (const h of CHECKPOINT_REVIEW_SECTIONS) if (!section(text, h)) bad.push(`${where}: section ${h}`);
      const criteria = tables(text).find((t) => t.header[0] === 'Criterion');
      if (!criteria || criteria.header.join('|') !== 'Criterion|How it is met|Status|Evidence|Link') { bad.push(`${where}: Criteria columns`); continue; }
      for (const [criterion, , status, evidence] of criteria.rows) {
        if (!SETS['Criterion status'].includes(status)) bad.push(`${where}: status of ${criterion}`);
        if (!SETS.Evidence.includes(evidence)) bad.push(`${where}: evidence of ${criterion}`);
        if (status === 'met' && evidence !== 'observed') bad.push(`${where}: ${criterion} is met without observed evidence`);
      }
      const allMet = criteria.rows.every((r) => r[2] === 'met');
      if (fm.standing === 'reviewed' && !allMet) bad.push(`${where}: reviewed with a criterion that is not met`);
      if (fm.standing === 'reviewed-with-concessions' && allMet && section(text, 'Concessions and decisions to proceed').trim() === 'none') bad.push(`${where}: reviewed-with-concessions with nothing conceded`);
      if (fm['blind-review'] !== 'done' && !/no independent review ran/.test(section(text, 'Independent review'))) bad.push(`${where}: blind review not done without the honest label`);
      if (fm['blind-review'] === 'done' && /no independent review ran/.test(section(text, 'Independent review'))) bad.push(`${where}: blind review done with the not-run label`);
    }
    const cfile = join(dir, 'constraints.md');
    if (existsSync(cfile)) {
      constraintPages++;
      const t = tables(readFileSync(cfile, 'utf8')).find((x) => x.header[0] === 'Constraint');
      if (!t || t.header.join('|') !== CONSTRAINT_COLUMNS.join('|')) { bad.push(`${fx}/constraints.md: columns`); continue; }
      for (const [constraint, source, conditions, checked, matters, status, evidence, concession] of t.rows) {
        const w = `${fx}/constraints.md: ${constraint}`;
        if (![constraint, source, conditions, checked].every((c) => c.length > 3)) bad.push(`${w}: an empty cell`);
        if (!SLUGS.includes(matters)) bad.push(`${w}: Matters at`);
        if (!SETS['Constraint status'].includes(status)) bad.push(`${w}: Status`);
        if (status === 'met' && evidence === '-') bad.push(`${w}: met without an evidence link`);
        if (status === 'conceded' && concession === '-') bad.push(`${w}: conceded without a concession link`);
        for (const link of [evidence, concession]) if (link !== '-' && !existsSync(join(dir, '..', link)) && !existsSync(join(dir, link))) bad.push(`${w}: ${link} does not exist`);
      }
    }
  }
  assert.ok(reviews >= 1 && constraintPages >= 1, 'the demo project carries a checkpoint review and a constraints page');
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
  assert.ok(section(readFileSync(join(ROOT, 'tests', 'fixtures', 'release-ready', 'wiki', 'authored', 'demo-game', 'notes', 'quality-ship.md'), 'utf8'), 'Release criteria'), 'fixture section');
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
  for (const name of ['game-master', 'game-architect', 'game-pm', 'game-quality']) {
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

test('lookup answers point to the guidance, and an adopted rule becomes a recorded decision', () => {
  for (const text of [section(readRel('references/entry.md'), 'Look up guidance'), readRel('references/plugin-map.md')]) {
    assert.match(text, /skill and reference (?:that )?hold the details/i);
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

test('a delegation never approves an edit to an existing file; Last verified needs a real check; a checkpoint review ignores concerns beyond the criteria', () => {
  const RULE = /a delegation such as "use your judgement" never approves an edit to an existing file or the removal of anything/i;
  const adoption = readRel('references/adoption.md');
  assert.match(section(adoption, 'Steps'), RULE);
  assert.match(readRel('references/instruction-files.md'), RULE);
  assert.match(readRel('references/instruction-files.md'), /until then show the diff and wait/);
  assert.match(adoption, /only after the owner says which lines \(or "all"\) in words/);
  assert.match(adoption, /NEW pages \(state page, backlog items, audit note\) only/);
  for (const name of ['studio-start', 'game-architect']) {
    const rules = section(readRel(`skills/${name}/SKILL.md`), 'Rules that hold');
    assert.match(rules, /A delegation such as "use your judgement" never approves an edit to an existing file or (?:the removal of anything|a removal)/, `${name}: rule 3`);
    assert.match(rules, /references\/(adoption|instruction-files)\.md/, `${name}: rule 3 links the detail`);
  }
  const LV = /set Last verified only when you actually ran or inspected the artifact's subject/i;
  assert.match(readRel('references/artifact-catalog.md'), LV);
  assert.match(readRel('references/templates/state-page.md'), LV);
  assert.match(readRel('references/artifact-catalog.md'), /reading the page to answer a question does not count/i);
  const NOTES = 'A checkpoint review reports each criterion from the evidence list alone; concerns beyond it go in a Notes line.';
  assert.ok(readRel('references/templates/instruction-block.md').includes(NOTES), 'instruction block');
  assert.match(section(readRel('references/entry.md'), 'Review a checkpoint'), /Concerns beyond the criteria go in a Notes line and never change a status\./);
  assert.match(frontmatter(readRel('skills/studio-start/SKILL.md')).data.when_to_use, /are we ready to ship.*has the checkpoint been reached.*is it done/i);
});

test('the session brief is mapped, used to find the wiki when no instruction file names the project, named in the instruction block and bound at adoption', () => {
  assert.match(readRel('references/plugin-map.md'), /\| Project state brief \| any \|[^\n]*session-brief[^\n]*0\.73\.0/);
  assert.match(section(readRel('references/entry.md'), 'Find the wiki'), /session brief/i);
  assert.match(readRel('references/templates/instruction-block.md'), /session brief/i);
  // The brief is for finding the project when its page path is not known; it must not be mandated when the block already names the page.
  assert.match(readRel('references/templates/instruction-block.md'), /not at that path|do not know which wiki project/i);
  assert.doesNotMatch(readRel('references/templates/instruction-block.md'), /session brief command, run it from this repository first/);
  assert.match(section(readRel('references/entry.md'), 'Find the wiki'), /no instruction file (names|gives)/i);
  assert.match(readRel('references/adoption.md'), /`repo:`/);
  assert.match(readRel('references/plugin-map.md'), /does not make the state page stale/);
});

test('the architect corrects its own documents and names every replaced line, while approval still guards instruction files', () => {
  const text = readRel('skills/game-architect/SKILL.md');
  assert.match(text, /architecture page and the decision records you draft/);
  assert.match(text, /name every replaced line/i);
  assert.match(readRel('references/instruction-files.md'), /No owner approval: no change to instruction files, skills or tooling/);
  assert.match(text, /A delegation such as "use your judgement" never approves an edit to an existing file/);
});

test('adoption lets a project with a long recorded history get its whole brief proposed in one pass', () => {
  const text = readRel('references/adoption.md');
  assert.match(text, /long history/i);
  assert.match(text, /one pass/i);
});

test('the routing table makes the required output a same-turn product, never an offer or a wait', () => {
  const routing = readRel('references/decision-routing.md');
  assert.match(routing, /Produce the Required output in the same turn/);
  assert.match(routing, /write it as `proposed` and put the question to the owner/);
  assert.match(readRel('skills/game-architect/SKILL.md'), /an open question for the owner is a reason for `proposed`, never for writing no record/);
});

test('the README tells a reader how to install the plugin from its marketplace, and the version is the same everywhere', () => {
  const readme = readRel('README.md');
  assert.match(readme, /\/plugin marketplace add ehartye\/hartye-claude-plugins/);
  assert.match(readme, /\/plugin install agent-game-studio@hartye-plugins/);
  const manifest = JSON.parse(readRel('.claude-plugin/plugin.json'));
  const pkg = JSON.parse(readRel('package.json'));
  assert.equal(pkg.version, manifest.version, 'package.json and plugin.json versions agree');
  assert.ok(readme.includes(`Early (${manifest.version})`), 'README states the current version');
});

test('evidence rules: versions are named from a reading, warm-up runs are declared in advance, and the minimal tier says who classes a defect', () => {
  const template = readRel('references/templates/quality-evidence.md');
  assert.match(template, /name each version from a reading/);
  assert.match(template, /a version taken from a label or an unchecked file is reported/);
  const process = section(readRel('references/process.md'), 'Evidence rules');
  assert.match(process, /warm-up run may precede the evidence run only when it is declared before it starts/);
  assert.match(process, /a failure in it stays a failure/);
  assert.match(process, /no further run happens without the owner's decision/);
  const vocabulary = readRel('references/vocabulary.md');
  assert.match(vocabulary, /At the minimal tier game-quality proposes the class and the owner can change it/);
  assert.match(vocabulary, /a failing step of the project's declared delivery checks is `critical` until the owner says otherwise/);
});
