---
type: authored
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
reviewed:
status: draft
sources: []
ai-generated: true
project: <project>
kind: note
---
# Quality evidence: <checkpoint or item>

Supports: <brief-approved | vertical-slice | scope-lock | content-lock | ship, or the backlog item slug>
Check owner: <role; at vertical-slice list both check owners and write one Claims section per check owner, headed `## Claims: <role>`>

Guidance used: <the verification guidance consulted, for what question, and the date; name it, do not copy from it; or: none>

## Claims
- <claim> - evidence: <observed | reported | none> - <what was run, how, on what build, and the result; name each version from a reading (a log line, the program's own report or a command's output), because a version taken from a label or an unchecked file is reported> - <link or path>

## Minimal-tier substitutes
- <art bible | test strategy | performance budgets | locked text | asset provenance audit> - evidence: <observed | reported | none> - <what was checked, how, and the observed result>

Delete this section at the standard and full tiers, where the named document itself is required.

## Release criteria
Optional. At the minimal tier, at the ship checkpoint, list the checkable release criteria here, one per line: <criterion>. Delete this section otherwise.

## Defects open
- <defect> - severity: <critical | other> - <link>

If there are none, write: none.

Evidence: <the lowest value among the claims above; observed is the highest and none the lowest>
