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
checkpoint: <brief-approved | vertical-slice | scope-lock | content-lock | ship>
standing: open
tip: <the revision reviewed: commit, build or page version>
review-date: <YYYY-MM-DD>
blind-review: <done | declined | not-run>
owner-acceptance:
---
# Checkpoint review: <checkpoint name>

Path: `reference/checkpoint-<slug>.md`. Standing is `open` (review not finished), `reviewed` (every criterion `met`) or `reviewed-with-concessions` (at least one criterion is `not-met` or `not-assessed` and is listed under Concessions and decisions to proceed). `owner-acceptance` stays empty until the owner gives it, as a date and their words. An agent never fills it.

Present the criteria, how each is met and every concession to the owner, then record the same content here.

## Criteria
| Criterion | How it is met | Status | Evidence | Link |
|---|---|---|---|---|
| <criterion from the process reference> | <what shows it, in plain words> | <met \| not-met \| not-assessed> | <observed \| reported \| none> | <link or path> |

`met` needs `observed` evidence. A criterion that was not measured is `not-assessed` and never counts as met.

## Constraints at this checkpoint
| Constraint | Status | Evidence | Concession |
|---|---|---|---|
| <each constraint whose Matters at is this checkpoint, from the constraints page> | <status> | <link or: -> | <link or: -> |

If none matter here, write: none.

## Concessions and decisions to proceed
- <what is weaker than required or skipped> - why: <reason> - owner said: "<the owner's words>" on <YYYY-MM-DD> - revisit: <when, or at which checkpoint>

If there are none, write: none.

## Claims the evidence does not support
- <a claim made in the work or the conversation that no evidence above backs>

If there are none, write: none.

## Independent review
<the reviewer's verdict per criterion, what it could not verify, and anything inconsistent; or: no independent review ran - <reason: declined by the owner, or not run because the host cannot start one>>

The reviewer is never the author of the work.

## Open items
- <item> - <owner role> - <YYYY-MM-DD or: none>

If there are none, write: none.
