import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { ROOT, posix, walk } from './lib/md.mjs';
import { rulesFor, scanText } from './lib/hygiene.mjs';

const SELF = new Set(['scripts/lib/hygiene.mjs', 'scripts/lib/hygiene.test.mjs', 'scripts/hygiene.test.mjs']);
const TEXT_EXTENSIONS = ['.md', '.json', '.mjs', '.js', '.yml', '.yaml', '.txt', '.html', '.css', '.sh', '.ps1', '.toml'];

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
