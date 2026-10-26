// Public-repository hygiene: no machine- or project-specific language anywhere, and
// engine, plugin and host names confined to the files that are allowed to carry them (spec 6.1).

// The model names are assembled from parts so that this rule's own source never matches the rule.
const GPU_NAMES = ['Ge' + 'Force', 'RT' + 'X ?\\d{3,4}', 'Rade' + 'on(?: RX)?', 'Iris ' + 'Xe', 'UHD ' + 'Graphics'];

export const PUBLIC_RULES = [
  ['a home-directory path', /[A-Za-z]:[\\/]+(?:Users|users|USERS)[\\/]+(?!<|%)[^\\/\s"']+|\/Users\/(?!<)[\w.-]+(?=[\\/\s"'`)]|$)|\/home\/(?!runner(?=[\\/\s"'`)]|$)|<)[\w.-]+(?=[\\/\s"'`)]|$)/],
  ['a GPU model name', new RegExp(`\\b(?:${GPU_NAMES.join('|')})\\b`)],
  ['a link into a repository that is not a plugin', /github\.com[\/:]ehartye\/(?!agent-|hartye-|wiki-master\b|h-superpowers\b|academia-fetch\b)[\w.-]+/i],
  ['a concrete wiki vault path', /wiki\/(?:authored|sources|entities)\/(?!<)/],
];

export const ENGINE_NAMES = /\b(?:Phaser|Unity(?:3D|Engine)?|Unreal(?:Engine)?|UE[45]|UEFN|Godot|Babylon(?:\.js|JS)?|[Tt]hree\.js|threejs|PlayCanvas|React Three Fiber|R3F)\b/;
export const PLUGIN_NAMES = /\b(?:agent-(?:engine|unreal|tests|marketing|sprites|meshes|draw|beeps|prose|vids|workflow|stalker)|wiki-master|hartye-skills|h-superpowers|Obsidian)\b/;
export const HOST_NAMES = /\b(?:Claude(?: Code)?|Codex|Gemini|Copilot|Cursor)\b|\b(?:CLAUDE|GEMINI|AGENTS)\.md\b/;

/** Name-confinement rules for a repo-relative posix path. Only skills/ and references/ are confined. */
export function confinementRules(rel) {
  if (!/^(?:skills|references)\//.test(rel)) return [];
  const isMap = rel === 'references/plugin-map.md';
  const isHost = rel.startsWith('references/hosts/');
  const rules = [];
  if (!isMap) {
    rules.push(['an engine name outside the plugin map', ENGINE_NAMES]);
    rules.push(['a plugin or tool name outside the plugin map', PLUGIN_NAMES]);
  }
  if (!isHost) rules.push(['a host name outside references/hosts', HOST_NAMES]);
  return rules;
}

/**
 * Every rule that applies to a repo-relative posix path. Fixtures simulate a project, and plans quote
 * the fixtures, so both may hold the demo project's wiki paths.
 */
export function rulesFor(rel) {
  const quotesFixtures = rel.startsWith('tests/fixtures/') || rel.startsWith('docs/superpowers/plans/');
  const base = quotesFixtures
    ? PUBLIC_RULES.filter(([what]) => what !== 'a concrete wiki vault path')
    : PUBLIC_RULES;
  // The README may name a host only on a line that links into references/hosts/.
  const readme = rel === 'README.md'
    ? [['a host name outside references/hosts', new RegExp(`^(?!.*references/hosts/).*(?:${HOST_NAMES.source})`)]]
    : [];
  return [...base, ...confinementRules(rel), ...readme];
}

/** [{ line, what }] for each line that matches a rule. */
export function scanText(text, rules) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const [what, re] of rules) if (re.test(line)) hits.push({ line: i + 1, what });
  });
  return hits;
}
