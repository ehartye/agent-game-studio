/** @lane merge @risk standard */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { ROOT, anchorLinks, existsExact, frontmatter, headingSlugs, links, posix, readRel, walk } from './lib/md.mjs';

const SKILLS = ['game-architect', 'game-artist', 'game-designer', 'game-master', 'game-pm', 'game-quality', 'game-writer', 'studio-start'];

test('wiki integration uses the current public role interface', () => {
  const map = readRel('references/plugin-map.md');
  assert.doesNotMatch(map, /wiki-master:wiki-(?:author|health|user|init)\b/);
  for (const role of ['search', 'project', 'setup']) {
    assert.ok(map.includes(`wiki-master:wiki-${role}`), `missing ${role} routing`);
  }
  assert.match(map, /Wiki tooling remains optional for advice and source work/);
});
const productFiles = () => [...walk(join(ROOT, 'skills'), ['.md']), ...walk(join(ROOT, 'references'), ['.md']), join(ROOT, 'README.md')];

// These are regressions for concrete directives removed in the advisory redesign, not a
// natural-language policy engine. Human scenario review remains necessary for paraphrases.
const removedDirectives = [
  /never rename, overwrite or delete an existing file without/i,
  /a delegation such as [^\n]+never approves an edit/i,
  /no further run happens without the owner's decision/i,
  /do nothing else until it finishes/i,
  /the reply begins with the three-line report/i,
  /a request to skip a step or build anyway[^\n]+is not yet the go/i,
  /produce the required output in the same turn/i,
  /before acting on (?:the first|any) request/i,
];
const violations = (text) => removedDirectives.filter((rule) => rule.test(text));

test('manifest, package and README identify the same plugin version', () => {
  const manifest = JSON.parse(readRel('.claude-plugin/plugin.json'));
  assert.equal(manifest.name, 'agent-game-studio');
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.license, 'MIT');
  assert.equal(manifest.repository, 'https://github.com/ehartye/agent-game-studio');
  assert.equal(JSON.parse(readRel('package.json')).version, manifest.version);
  assert.ok(readRel('README.md').includes(manifest.version));
});

test('eight discoverable skills have valid frontmatter, reference links and a bounded size', () => {
  assert.deepEqual(readdirSync(join(ROOT, 'skills')).sort(), SKILLS);
  for (const name of SKILLS) {
    const text = readRel(`skills/${name}/SKILL.md`);
    const fm = frontmatter(text);
    assert.equal(fm?.data.name, name, `${name}: name`);
    assert.ok(fm.data.description?.length >= 40, `${name}: useful description`);
    const lines = text.split(/\r?\n/);
    for (const line of lines.slice(1, lines.indexOf('---', 1))) {
      const value = line.replace(/^[A-Za-z_][\w-]*:\s*/, '');
      if (!/^["']/.test(value)) assert.ok(!/: | #/.test(value), `${name}: quote YAML values containing colon-space or comments`);
    }
    assert.ok(links(text).some((link) => link.target.includes('references/')), `${name}: reference link`);
    assert.ok(Buffer.byteLength(text) <= 6500, `${name}: skill budget`);
  }
});

test('relative links and heading anchors resolve with exact path case', () => {
  const bad = [];
  for (const file of walk(ROOT, ['.md'])) {
    const text = readFileSync(file, 'utf8');
    for (const { target, line } of links(text)) {
      const path = target.split('#')[0];
      if (path && !existsExact(resolve(dirname(file), path))) bad.push(`${posix(file.slice(ROOT.length + 1))}:${line} -> ${target}`);
    }
    for (const { path, fragment: anchor, line } of anchorLinks(text)) {
      const destination = path ? resolve(dirname(file), path) : file;
      if (existsExact(destination) && !headingSlugs(readFileSync(destination, 'utf8')).includes(anchor)) bad.push(`${posix(file.slice(ROOT.length + 1))}:${line} -> ${path}#${anchor}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('shipped guidance does not restore removed execution controls', () => {
  const bad = productFiles().flatMap((file) => violations(readFileSync(file, 'utf8')).map(String).map((rule) => `${posix(file.slice(ROOT.length + 1))}: ${rule}`));
  assert.deepEqual(bad, []);
});

test('directive regression checks reject representative mutations', () => {
  for (const mutation of [
    'Never rename, overwrite or delete an existing file without showing the change and getting a yes.',
    'A delegation such as "use your judgement" never approves an edit to an existing file.',
    "No further run happens without the owner's decision.",
    'If the state page is missing, do nothing else until it finishes.',
    'The reply begins with the three-line report.',
    'A request to skip a step or build anyway is not yet the go.',
    'Produce the Required output in the same turn.',
    'Run studio-start before acting on any request.',
  ]) assert.ok(violations(mutation).length, mutation);
  assert.deepEqual(violations('Use the relevant role when it helps. Follow project conventions and user instructions.'), []);
});

// A small contract check at the canonical guidance seam. It guards explicit boundaries,
// not every possible paraphrase; behavioral scenarios still need human scoring.
function assertRecordBoundaries({ catalog, instructions, pointer }) {
  assert.match(catalog, /Studio-maintained project state lives exclusively in the project's wiki/i);
  assert.match(catalog, /If wiki access is unavailable, continue advice and source work/i);
  assert.match(catalog, /without creating a substitute elsewhere/i);
  assert.match(instructions, /No Studio block is needed by default/i);
  assert.match(pointer, /optional game-development advice/i);
  assert.match(pointer, /actual existing wiki paths/i);
  assert.ok(Buffer.byteLength(pointer) <= 1000, 'optional pointer stays small');
  assert.doesNotMatch(pointer, /(?:create|write|use) a (?:local|repository-local) state file|always insert|must insert/i);
}
const recordBoundaries = () => ({
  catalog: readRel('references/artifact-catalog.md'),
  instructions: readRel('references/instruction-files.md'),
  pointer: readRel('references/templates/instruction-block.md'),
});

test('canonical records stay in the wiki and instruction boilerplate remains optional and static', () => {
  assertRecordBoundaries(recordBoundaries());
});

test('record boundary checks reject local-state fallback and compulsory boilerplate mutations', () => {
  const docs = recordBoundaries();
  assertRecordBoundaries(docs);
  assert.throws(() => assertRecordBoundaries({ ...docs, catalog: docs.catalog.replace('exclusively in the project\'s wiki', 'in the repository or wiki') }));
  assert.throws(() => assertRecordBoundaries({ ...docs, instructions: docs.instructions.replace('No Studio block is needed by default', 'A Studio block is required by default') }));
  assert.throws(() => assertRecordBoundaries({ ...docs, pointer: `${docs.pointer}\nWhen the wiki is unavailable, create a local state file.` }));
});

function assertBacklogMetadata(text) {
  const metadata = frontmatter(text)?.data;
  assert.equal(metadata?.kind, 'backlog-item', 'wiki tooling identifies backlog items by kind');
  assert.equal(metadata['backlog-status'], 'planned', 'new template items have an explicit initial status');
  assert.equal(metadata['depends-on'], '[]', 'new template items expose an empty dependency list');
}

test('optional backlog template keeps metadata consumed by wiki tooling', () => {
  assertBacklogMetadata(readRel('references/templates/backlog-item.md'));
});

test('backlog metadata check rejects a wrong kind or missing tooling fields', () => {
  const text = readRel('references/templates/backlog-item.md');
  assertBacklogMetadata(text);
  assert.throws(() => assertBacklogMetadata(text.replace('kind: backlog-item', 'kind: backlog')));
  for (const field of ['backlog-status', 'depends-on']) {
    assert.throws(() => assertBacklogMetadata(text.replace(new RegExp(`^${field}:.*\\r?\\n`, 'm'), '')));
  }
});
