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

test('files outside skills and references are not confined, except that the README names a host only beside a link into references/hosts', () => {
  assert.deepEqual(hits('README.md', 'Unity and agent-engine'), []);
  assert.deepEqual(hits('docs/superpowers/specs/x.md', 'Codex'), []);
  assert.deepEqual(hits('README.md', 'Install in Claude Code'), ['a host name outside references/hosts']);
  assert.deepEqual(hits('README.md', 'Install: [Claude Code](references/hosts/claude-code.md)'), []);
});

test('the home-directory rule catches capitalised users, a path at the end of a line, and other forms', () => {
  assert.deepEqual(hits('README.md', `HOME=${['', 'Users', 'Bob'].join('/')}`), ['a home-directory path']);
  assert.deepEqual(hits('README.md', ['C:', 'USERS', 'BOB', 'x'].join('\\')), ['a home-directory path']);
  assert.deepEqual(hits('README.md', ['', 'home', 'bob', 'x'].join('/')), ['a home-directory path']);
  assert.deepEqual(hits('README.md', ['C:', 'Users', '%USERNAME%', 'x'].join('\\')), []);
  assert.deepEqual(hits('README.md', ['', 'home', 'runner', 'work'].join('/')), []);
  assert.deepEqual(hits('README.md', ['', 'home', 'runner'].join('/')), []);
  assert.deepEqual(hits('README.md', 'https://example.com/users/42'), []);
});

test('the repository-link rule allows first-party plugin repositories and catches the ssh form', () => {
  assert.deepEqual(hits('README.md', ['https://github.com', 'ehartye', 'wiki-master'].join('/')), []);
  assert.deepEqual(hits('README.md', ['https://github.com', 'ehartye', 'h-superpowers'].join('/')), []);
  assert.deepEqual(hits('README.md', 'git@github.com:' + ['ehartye', 'some-game'].join('/')), ['a link into a repository that is not a plugin']);
});

test('engine-name rule catches common spellings and ignores ordinary lowercase words', () => {
  for (const name of ['Three.js', 'three.js', 'threejs', 'UE5', 'UnityEngine', 'Unity3D', 'UnrealEngine']) {
    assert.deepEqual(hits('skills/x/SKILL.md', `use ${name} here`), ['an engine name outside the plugin map'], name);
  }
  assert.deepEqual(hits('skills/x/SKILL.md', 'a sense of unity across the team'), []);
  assert.deepEqual(hits('skills/x/SKILL.md', 'the agent-engines of change'), []);
});
