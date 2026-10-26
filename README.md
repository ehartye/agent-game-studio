# agent-game-studio

Process skills and references that tell an AI agent which phase a game project is in, what comes next, who decides each question, and what evidence passes each gate. It is technology-agnostic and works for new projects and for adopting one that already exists. The shipped plugin is Markdown and JSON with no runtime; `scripts/` holds the repository's own tests and is not used at runtime.

Early (0.1.0). Three skills.

## What it gives the agent

- **A state page** in the project's wiki that every session reads first: phase, next step, blockers, the artifact registry, open questions.
- **Decision routing:** every kind of request has one owner, one document to read first and one required output.
- **A work loop with stop rules:** intake, fit check, design readiness, sprint selection, build, verify, accept, update. A missing precondition stops the loop and is named.
- **Phase gates** that pass on observed evidence, with you as the final gate.
- **A planning pass** that asks each discipline what a feature implies before work starts.
- **Adoption** of an existing project in place: no renames, no overwrites, no deletions.
- **A tooling audit** of the project's agent configuration, by proposal and with your approval.

## Skills

| Skill | Use it for |
|---|---|
| `studio-start` | Orienting at the start of a session; bootstrapping a new project; adopting an existing one |
| `game-master` | The brief and pillars; fit checks; course checks; art fit on key assets; acceptance |
| `game-architect` | Technology decisions; the architecture page; tool readiness; agent instruction files and tooling; the tooling audit |

The other roles (project manager, quality, writer, artist, designer) are followed directly from [decision routing](references/decision-routing.md) until their skills ship.

## References

[Process](references/process.md) · [Vocabulary](references/vocabulary.md) · [Decision routing](references/decision-routing.md) · [Artifact catalog](references/artifact-catalog.md) · [Planning](references/planning.md) · [Plugin map](references/plugin-map.md) · [Adoption](references/adoption.md) · [Tooling audit](references/tooling-audit.md) · [Instruction files](references/instruction-files.md) · [Host adapters](references/hosts/README.md)

## Install

Install the plugin with your agent host's plugin mechanism; the [host adapters](references/hosts/README.md) say how for each host ([Claude Code](references/hosts/claude-code.md), or [generic](references/hosts/generic.md) for any other).

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
