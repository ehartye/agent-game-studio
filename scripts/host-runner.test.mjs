/** @lane merge @risk standard */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runHost } from './run-scenarios.mjs';

test('post-spawn process errors retain ownership and keep the run pending until close', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'studio-host-lifecycle-'));
  const active = new Set();
  let child;
  let run;
  try {
    run = runHost(process.execPath, { args: ['-e', 'setInterval(() => {}, 1000)'], env: process.env }, dir, join(dir, 'transcript.jsonl'), join(dir, 'stderr.txt'), 10000, active);
    [child] = active;
    await once(child, 'spawn');
    let settled = false;
    run.then(() => { settled = true; });
    child.emit('error', Object.assign(new Error('synthetic failed termination request'), { code: 'EPERM' }));
    await new Promise(setImmediate);
    assert.equal(settled, false, 'a process error is not a process exit');
    assert.equal(active.has(child), true, 'the runner still owns the live process');
    assert.equal(child.exitCode, null);
    assert.equal(child.signalCode, null);
    assert.equal(child.kill('SIGKILL'), true);
    const result = await run;
    assert.equal(active.has(child), false);
    assert.equal(result.timedOut, false);
    assert.equal(result.spawnError, undefined, 'post-spawn errors are not spawn failures');
    assert.ok(child.exitCode !== null || child.signalCode !== null);
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      const closed = once(child, 'close');
      child.kill('SIGKILL');
      await closed;
    }
    if (run) await run;
    rmSync(dir, { recursive: true, force: true });
  }
});
