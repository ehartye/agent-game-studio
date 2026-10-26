import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, anchorLinks, existsExact, frontmatter, headingSlugs, links, section, tables } from './md.mjs';

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

test('section ignores headings inside fenced code', () => {
  const text = '## One\nx\n```md\n## Inside\ny\n```\nz\n## Two\nq\n';
  assert.equal(section(text, 'One'), 'x\n```md\n## Inside\ny\n```\nz');
  assert.equal(section('```md\n## One\n```\n## Two\nq\n', 'One'), null);
});

test('frontmatter tolerates a byte-order mark and trailing spaces on the fences', () => {
  const bom = String.fromCharCode(0xfeff);
  const fm = frontmatter(bom + '--- \nname: demo\n---  \nbody\n');
  assert.deepEqual(fm.data, { name: 'demo' });
  assert.equal(fm.body, 'body\n');
});

test('existsExact is true for the exact letter case and false for another case or a missing file', () => {
  assert.equal(existsExact(join(ROOT, 'scripts', 'lib', 'md.mjs')), true);
  assert.equal(existsExact(join(ROOT, 'scripts', 'lib', 'MD.mjs')), false);
  assert.equal(existsExact(join(ROOT, 'scripts', 'lib', 'missing.mjs')), false);
});

test('headingSlugs gives GitHub-style slugs and ignores fenced code', () => {
  const text = '# Title\n\n## How a gate is passed\n\n### The dagger (`+`)\n```md\n## Hidden\n```\n';
  assert.deepEqual(headingSlugs(text), ['title', 'how-a-gate-is-passed', 'the-dagger-']);
});

test('anchorLinks lists relative links with a fragment and bare fragments, not web links', () => {
  const text = '[a](x.md#one) [b](#two) [c](https://example.com/#three) [d](y.md) `[e](z.md#four)`\n';
  assert.deepEqual(anchorLinks(text).map((l) => [l.path, l.fragment]), [['x.md', 'one'], ['', 'two']]);
});
