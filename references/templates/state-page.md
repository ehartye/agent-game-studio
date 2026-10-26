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

At the standard and full tiers add one row per artifact of that tier from the artifact catalog. Delete this line. Set Last verified only when you actually ran or inspected the artifact's subject (for a document: re-read it against the code or the owner's statement and found it true); reading the page to answer a question does not count.

## Open questions
<If there are none, write: No open questions. Otherwise use this table.>

| Question | Owner | Must be answered by | Status |
|---|---|---|---|
| <question> | <role or owner> | <G1 to G5, or none> | open |

## Last gate result
<none | <gate> <met | unmet | waived> - owner accepted <YYYY-MM-DD, or: not yet> - <evidence link>>

Before any gate has been checked write `none`. For the adopt phase write `none - proposed, owner review pending` until the owner confirms the registry, phase and tier, then `none - registry reviewed by the owner <YYYY-MM-DD>`. Never record a review the owner did not give.
