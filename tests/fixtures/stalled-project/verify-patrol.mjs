import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
assert.equal(readFileSync(new URL('./patrol.txt', import.meta.url), 'utf8').trim(), 'enabled', 'patrol must be enabled');
console.log('Patrol check passed.');
