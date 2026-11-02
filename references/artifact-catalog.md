# Optional wiki records

Studio-maintained project state lives exclusively in the project's wiki: one canonical home, no repository-local state, sidecar trackers or duplicate progress. Roles are typical stewards, not exclusive writers. A consultation may require no records.

Example paths below are relative to the project's wiki folder. Use established wiki paths and formats; templates are optional. Existing project-owned documents are not automatically Studio state. Link them without automatically relocating, deleting or replacing their content.

| Artifact | Useful for | Typical maintainer | Example wiki path | Template |
|---|---|---|---|---|
| State page | Orientation and record links | game-pm / studio-start | reference/studio-state.md | [state-page.md](templates/state-page.md) |
| Game brief | Experience, pillars and tradeoffs | game-master | overview.md | [game-brief.md](templates/game-brief.md) |
| Architecture | Structure and technical direction | game-architect | architecture.md | [architecture.md](templates/architecture.md) |
| Decision record | Rationale and consequences | Relevant role | decisions/<slug>-adr.md | [decision-record.md](templates/decision-record.md) |
| Backlog item | Outcome, dependencies and verification | game-pm | backlog/<slug>.md | [backlog-item.md](templates/backlog-item.md) |
| Roadmap | Priorities and status | game-pm | roadmap.md | Existing wiki format or generator |
| Quality evidence | Results and limits | game-quality | notes/quality-<item>.md | [quality-evidence.md](templates/quality-evidence.md) |
| Constraints | Sourced requirements and measurements | Relevant role | reference/constraints.md | [constraints.md](templates/constraints.md) |
| Checkpoint review | Requested milestone assessment | Relevant role | reference/checkpoint-<slug>.md | [checkpoint-review.md](templates/checkpoint-review.md) |
| Art bible | Visual and audio direction | game-artist | reference/art-bible.md | [art-bible.md](templates/art-bible.md) |
| Asset list | Status, provenance and licence | game-artist | reference/asset-list.md | [asset-list.md](templates/asset-list.md) |
| Narrative bible and glossary | Canon, voices and terminology | game-writer | reference/narrative-bible.md | [narrative-bible.md](templates/narrative-bible.md) |
| Design spec | Rules, balance and experiments | game-designer | reference/design-<system>.md | [design-spec.md](templates/design-spec.md) |
| Test strategy | Risks and checks | game-quality | reference/test-strategy.md | Project testing guidance |
| Localization plan | Languages and handoff | game-writer | reference/localization-plan.md | Project format |
| Tooling review | Requested configuration assessment | game-architect | notes/tooling-audit-<date>.md | [tooling-audit.md](templates/tooling-audit.md) |

## Maintenance

Distinguish implemented facts, proposals, estimates and decisions. Cite reconstructed content's sources. Verification dates mean the subject was checked then; reading a page alone does not reverify a build.

Keep only useful registry entries. No tier, acceptance field or instruction block is compulsory. [Instruction files](instruction-files.md) may contain an optional static pointer, never a second state home.

If wiki access is unavailable, continue advice and source work; report pending wiki writes without creating a substitute elsewhere. Implementation assets and raw test outputs remain where project tooling puts them and are linked from wiki records.

See [vocabulary](vocabulary.md) and [the plugin map](plugin-map.md).
