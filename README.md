# agent-game-studio

Process skills and references that tell an AI agent which phase a game project is in, what comes next, who decides each question, and what evidence a checkpoint review needs. It is technology-agnostic and works for new projects and for adopting one that already exists. The shipped plugin is Markdown and JSON with no runtime; `scripts/` holds the repository's own tests and is not used at runtime.

Early (0.3.1). Eight skills.

## What it gives the agent

- **A state page** in the project's wiki that every session reads first: phase, next step, blockers, the artifact registry, open questions.
- **Decision routing:** every kind of request has one owner, one document to read first and one required output.
- **A work loop with stop rules:** intake, fit check, design readiness, sprint selection, build, verify, accept, update. A missing precondition stops the loop and is named.
- **Advisory checkpoints** (Brief approved, Vertical slice, Scope lock, Content lock, Ship): the agent reviews standing against observed evidence, records it in a checkpoint review page and advises; you decide when to move on. A missing prerequisite is named with its risk, and the agent proceeds when you say go, recording your decision to proceed.
- **A constraints page** listing the measurable requirements the game must meet (a performance target on named hardware, a platform, a size, a legal limit), each with a source, a check the author cannot edit, and a status. The agent proposes lines; only you approve, change or concede them.
- **Blind review:** at a checkpoint review, an independent reviewer with no shared context reads only the criteria, the constraints and the raw evidence, and is never the author.
- **Hand-offs** to the plugins that own craft and technology, keyed by situation in the [plugin map](references/plugin-map.md), with what to bring and where to record what comes back.
- **A planning pass** that asks each discipline what a feature implies before work starts.
- **Adoption** of an existing project in place: no renames, no overwrites, no deletions.
- **A tooling audit** of the project's agent configuration, by proposal and with your approval.

## Skills

| Skill | Use it for |
|---|---|
| `studio-start` | Orienting at the start of a session; bootstrapping a new project; adopting an existing one |
| `game-master` | The brief and pillars; fit checks; course checks; art fit on key assets; acceptance; product constraints |
| `game-architect` | Technology decisions; the architecture page; tool readiness; agent instruction files and tooling; the tooling audit; technical constraints |
| `game-pm` | The backlog and generated roadmap; sprint selection as advice; the planning pass; the state page; change requests |
| `game-quality` | The testing strategy and risk profile; performance budgets; the measurements behind constraints; quality evidence notes; evidence for a checkpoint review |
| `game-writer` | Dialogue, item text, lore and barks; the narrative bible and glossary; the text lock; the localization plan |
| `game-artist` | The art bible and asset list; art stages; provenance and licence; sound and music options |
| `game-designer` | One design spec per system: economy, progression, mechanics, level layout and interface flow; rules, numbers and balance |

## References

[Process](references/process.md) · [Vocabulary](references/vocabulary.md) · [Decision routing](references/decision-routing.md) · [Artifact catalog](references/artifact-catalog.md) · [Planning](references/planning.md) · [Plugin map](references/plugin-map.md) · [Adoption](references/adoption.md) · [Tooling audit](references/tooling-audit.md) · [Instruction files](references/instruction-files.md) · [Host adapters](references/hosts/README.md)

## Install

Install the plugin with your agent host's plugin mechanism; the [host adapters](references/hosts/README.md) say how for each host ([Claude Code](references/hosts/claude-code.md), or [generic](references/hosts/generic.md) for any other).

On [Claude Code](references/hosts/claude-code.md): `/plugin marketplace add ehartye/hartye-claude-plugins`, then `/plugin install agent-game-studio@hartye-plugins`.

## Requires

The wiki tooling (`wiki-master`, version 0.55.0 or later) is a hard dependency: it must be installed and its vault initialised before the first session, because the state page, backlog, roadmap and decision records live in the project's wiki. Engine, testing, asset, writing and launch guidance comes from other plugins named in the [plugin map](references/plugin-map.md); the plugin works without them and records the gap.

## Development

```bash
node scripts/check.mjs
```

runs the structure, hygiene and scenario-coverage checks (Node 24+, no dependencies). Behavior is scored by the manual protocol in [tests/scenarios](tests/scenarios/README.md).

A hygiene failure on a word that happens to match an engine, tool or host name is fixed by rewording to a purpose; there is no per-line exemption.

## Design

See the [design spec](docs/superpowers/specs/2026-10-26-agent-game-studio-design.md).

## License

MIT
