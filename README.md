# agent-game-studio

Eight optional skills for game-development advice and maintaining useful project documents and backlog items. Studio helps a project think and keep its records accurate; the project and its owner decide how work is executed, tested and accepted.

Early (0.3.1). The plugin ships Markdown and JSON, with no runtime. Repository scripts validate the plugin and provide a separate scenario harness.

## Skills

| Skill | Advice and documents it can help with |
|---|---|
| `studio-start` | Optional orientation and a map of existing project records |
| `game-master` | Vision, pillars, tradeoffs and the game brief |
| `game-architect` | Technical options, architecture and decision records |
| `game-pm` | Priorities, dependencies, backlog, roadmap and status |
| `game-quality` | Test strategy, risks, evidence and defects |
| `game-writer` | Narrative, glossary, game text and localization backlog |
| `game-artist` | Art and audio direction, asset inventory, provenance and asset backlog |
| `game-designer` | Systems, mechanics, balance, design specs and experiments |

Use a role directly when it helps. A small change or advice-only conversation needs no orientation pass, fixed response format, document creation or ceremony. Missing records can be identified without blocking authorized work. Roles can collaborate or delegate within the user's request and the host's capabilities.

## Project autonomy and records

Studio adds no permission layer over file edits, tooling, test reruns, workflow, release or acceptance. Existing project conventions, user instructions and genuine host permissions still apply. Recommendations, checklists and independent reviews are options to help a decision, not prerequisites imposed by Studio. Explicit instructions to proceed do not trigger another Studio approval request.

When engaged to maintain Studio project state, keep one canonical home in the project's wiki: briefs, status, decisions, backlog and evidence records. Do not create repository-local Studio trackers, sidecars or duplicate progress records. Existing project-owned documents remain useful sources; this does not relabel them as Studio state or authorize moving or deleting them. If no wiki is available, continue advice and authorized source work, and identify the wiki destination only when a maintained record is needed.

Record what actually happened. Advice is not approval; a planned check is not a passing result. Update the relevant wiki records when the task calls for maintenance, preserving existing content and formats instead of resetting documents to templates.

No instruction-file block is installed by default. The [host notes](references/hosts/README.md) explain the tiny optional AGENTS.md/CLAUDE.md pointer for projects that benefit from it. Studio does not reorganize host instructions or edit existing consumers automatically.

## References

[Working guidance](references/process.md) · [Vocabulary](references/vocabulary.md) · [Role selection](references/decision-routing.md) · [Artifact catalog](references/artifact-catalog.md) · [Planning](references/planning.md) · [Plugin map](references/plugin-map.md) · [Existing projects](references/adoption.md) · [Tooling advice](references/tooling-audit.md) · [Instruction pointers](references/instruction-files.md)

The artifact catalog and templates are starting points. Use the project's wiki structure and keep only the records that help. Specialist technology and craft guidance is linked from the plugin map; missing plugins do not prevent general advice. The wiki tooling in that map is useful for wiki maintenance, but no installation or wiki bootstrap is required for a consultation.

## Install

Use your agent host's plugin mechanism; see the [host notes](references/hosts/README.md). On [Claude Code](references/hosts/claude-code.md): `/plugin marketplace add ehartye/hartye-claude-plugins`, then `/plugin install agent-game-studio@hartye-plugins`.

## Development

```bash
node scripts/check.mjs
```

Node 24+, no dependencies. This runs structure, hygiene, unit and scenario-definition checks. It does not prove live agent behavior. The [scenario protocol](tests/scenarios/README.md) explains separate host trials and honest evidence reporting.

The [current design](docs/advisory-design.md) describes the advisory boundary. Older documents under `docs/superpowers/` and dated scenario results are historical evidence of the earlier product, not current instructions or proof of the redesigned behavior.

## License

MIT
