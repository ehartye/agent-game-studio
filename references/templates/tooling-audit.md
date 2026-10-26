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
# Tooling audit: <YYYY-MM-DD>

## Scope
The project directory and the project-scoped agent configuration; global configuration is out of scope.
Evidence window: <start date to end date; default the last 90 days or since the previous audit>
Form: <full | changed items only>

## Candidates
| Item | Category | Evidence of use | Outcome | Risk | Undo |
|---|---|---|---|---|---|
| <path or name> | <1 to 8> | <what shows it is used or unused> | <one of: remove, replace-with-reference, merge, convert, ask-owner> | <what could break; n/a for ask-owner> | <how to restore it; n/a for ask-owner> |

Category numbers are the numbered list in the tooling audit reference.

## Kept
<items checked and kept, with the reference that justifies each>

## Owner decision
<approved | approved with changes | declined> - <YYYY-MM-DD> - <notes>

## Result
<the change made, as one reversible change, with its commit or other undo reference, or: nothing changed>
Untracked items listed for the owner: <paths, or: none>
