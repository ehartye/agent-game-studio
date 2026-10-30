---
type: authored
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
reviewed:
status: draft
sources: []
ai-generated: true
project: <project>
kind: reference
---
# Studio state: <project>

Record a version, a count or a pull request state where its source lives (the installed plugin, the folder listing, the pull request). Elsewhere on this page link the source or say how to read it. If a copy is kept, it carries the date and how it was read.

## Phase
<adopt | concept | pre-production | production | beta | release | live>

## Rigor tier
<minimal | standard | full>

## Next step
<one line>

## Blocked by
<the item and the reason, or: nothing>

## Current sprint
<backlog item slugs, or: none>

## Artifact registry
| Artifact | Path | Owner | Status | Last verified |
|---|---|---|---|---|
| State page | reference/studio-state.md | game-pm | draft | <YYYY-MM-DD> |
| Game brief | overview.md | game-master | absent | - |
| Decision record | decisions/ | decider | absent | - |
| Architecture | architecture.md | game-architect | absent | - |
| Backlog item | backlog/ | game-pm | absent | - |
| Roadmap | roadmap.md | game-pm | absent | - |
| Quality evidence | notes/quality-*.md | game-quality | absent | - |
| Agent instructions block | <instruction file name(s)> | game-architect | absent | - |
| Tooling audit record | notes/tooling-audit-*.md | game-architect | absent | - |
| Constraints | reference/constraints.md | game-master | absent | - |
| Checkpoint review | reference/checkpoint-*.md | review owner | absent | - |

At the standard and full tiers add one row per artifact of that tier from the artifact catalog. Delete this line. Set Last verified only when you actually ran or inspected the artifact's subject (for a document: re-read it against the code or the owner's statement and found it true); reading the page to answer a question does not count.

## Open questions
<If there are none, write: No open questions. Otherwise use this table.>

| Question | Owner | Must be answered by | Status |
|---|---|---|---|
| <question> | <role or owner> | <checkpoint slug, or none> | open |

## Last checkpoint review
<none | <checkpoint slug> <open | reviewed | reviewed-with-concessions> - owner accepted <YYYY-MM-DD, or: not yet> - <link to the checkpoint review>>

Before any checkpoint has been reviewed write `none`. For the adopt phase write `none - proposed, owner review pending` until the owner confirms the registry, phase and tier, then `none - registry reviewed by the owner <YYYY-MM-DD>`. Never record a review the owner did not give.

## Decision to proceed
<none | <what was missing> - <the risk stated to the owner> - owner said: "<their words>" - <YYYY-MM-DD>>

Write `none` when work has not gone ahead without a missing prerequisite. Record each decision to proceed on its own line, newest last. The owner's reply to the offer of the missing step is enough; no document is required.
