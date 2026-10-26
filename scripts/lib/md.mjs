import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

export const ROOT = resolve(import.meta.dirname, '..', '..');
export const posix = (p) => p.split(sep).join('/');
export const readRel = (rel) => readFileSync(join(ROOT, rel), 'utf8');

/** True if the path exists with exactly this letter case. Windows and macOS file systems ignore case; Linux does not. */
export function existsExact(abs) {
  if (!existsSync(abs)) return false;
  const asked = posix(relative(ROOT, resolve(abs)));
  const real = posix(relative(realpathSync.native(ROOT), realpathSync.native(abs)));
  return asked === real;
}

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
  if (lines[0].trim() !== '---') return null;
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
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

/** The text under a `## heading` (headings inside fenced code are ignored), up to the next level-two heading, or null if absent. */
export function section(text, heading) {
  const lines = text.split(/\r?\n/);
  let state = null;
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i += 1) {
    const before = state;
    state = fenceState(state, lines[i]);
    if (before || state) continue;
    if (start === -1) {
      if (lines[i].trim() === `## ${heading}`) start = i;
    } else if (/^## /.test(lines[i])) {
      end = i;
      break;
    }
  }
  return start === -1 ? null : lines.slice(start + 1, end).join('\n');
}

/** GitHub-style slugs of the headings outside fenced code. */
export function headingSlugs(text) {
  const out = [];
  for (const { line } of contentLines(text)) {
    const h = /^#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
    if (!h) continue;
    out.push(h[1].toLowerCase().replace(/[`*_]/g, '').replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-'));
  }
  return out;
}

/** Relative links with a #fragment, and bare #fragment links, outside code: [{ path, fragment, line }]. */
export function anchorLinks(text) {
  const out = [];
  for (const { line, n } of contentLines(text)) {
    const bare = line.replace(/`[^`]*`/g, '');
    for (const m of bare.matchAll(/\[[^\]]*\]\(([^)\s]*)#([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(m[1])) continue;
      out.push({ path: m[1], fragment: m[2], line: n });
    }
  }
  return out;
}
