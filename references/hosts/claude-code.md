# Claude Code adapter

## Instruction files

- Project instructions: `CLAUDE.md` in the project root or `.claude/CLAUDE.md`, and in subfolders. `CLAUDE.local.md` is personal (untracked) and counts as a `CLAUDE.md`.
- `@path` imports work inside these files, relative to the importing file, up to four hops.
- `.claude/rules/**/*.md` are modular project rules; optional `paths:` frontmatter scopes them.
- `AGENTS.md`: host versions 2.1.277 and later read it natively, but only when no `CLAUDE.md` or `CLAUDE.local.md` exists in the working directory or above; older versions and some sessions do not. This point is version-sensitive. If the project has only an `AGENTS.md`, check the host version before adding a `CLAUDE.md`. If it has both, the owner picks one authoritative file and the other holds only an import line (`CLAUDE.md` can import with `@AGENTS.md`). A lone `CLAUDE.local.md` silently disables the native `AGENTS.md` read.
- User-level instruction files are outside the project and out of scope for the audit.

## Where the audit categories live

| Category | Location in a project |
|---|---|
| 1. Instruction files | `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`, `.claude/rules/**/*.md`; any `AGENTS.md` kept for other hosts |
| 2. Project skills, commands and prompts | `.claude/skills/<name>/SKILL.md`; `.claude/commands/<name>.md`; `.claude/agents/**/*.md` (subagent definitions) |
| 3. Plugins | `enabledPlugins` in `.claude/settings.json` |
| 4. Tool servers | `.mcp.json` at the project root (project tool servers; the host asks for approval in interactive sessions) |
| 5. Automation | `hooks` in `.claude/settings.json` or `.claude/settings.local.json` (user and managed settings are out of scope), or a plugin's hooks file; scripts under `.claude/hooks/` are a convention called from those settings, not auto-discovered |
| 6. Permissions | `permissions` (allow, ask, deny) in `.claude/settings.json` and `.claude/settings.local.json` |
| 7. Residue | Untracked files and folders: scratch files, caches, logs, tool-created profile folders; stale worktrees |
| 8. Duplicated instructions | Compare the category 1 text with the wiki and with the plugins in use |

`.claude/settings.local.json` and `CLAUDE.local.md` hold personal settings and are normally untracked; report them, do not edit them without the owner's approval.

## Checking skill availability

The session lists its available skills. Confirm a mapped skill's name appears in that list before loading it.

## Install

- From a marketplace that lists the plugin: add the marketplace with `/plugin marketplace add <source>`, then run `/plugin install agent-game-studio@<marketplace>`. The same operations exist as `claude plugin` shell commands.
- For development: start `claude` with `--plugin-dir <path to a checkout>` to load the plugin for one session.
- Install the wiki tooling the same way and initialise its vault before the first session.

## Blind review

Start the reviewer as a read-only subagent: a subagent whose tools are limited to reading and searching files (no editing, no shell, no network). Give it file paths only, never pasted text and never your own conclusions:

- the path of the checkpoint review page, with its Criteria and Constraints sections as written before any verdict;
- the path of the constraints page;
- the paths of the raw evidence (logs, captures, test output, the built artifact).

Ask it for a verdict per criterion (`met`, `not-met` or `not-assessed`), what it could not verify, and anything inconsistent. The main agent is the author, so the subagent is the reviewer. Copy its answer into the review page's Independent review section unchanged, and set `blind-review: done`. If the subagent cannot read a path, record that as something it could not verify. If the owner declines the offer, set `blind-review: declined`.

## Limits

Project-scoped locations only. Rows and install forms were checked against the host's documentation on 2026-10-26; re-check when the host version changes. This adapter does not cover other hosts or user-level configuration.
