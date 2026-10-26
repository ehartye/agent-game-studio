// Runs every unit and repository check. Dependency-free.
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
