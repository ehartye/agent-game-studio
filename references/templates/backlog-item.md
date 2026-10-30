---
type: authored
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
reviewed:
status: draft
sources: []
ai-generated: true
project: <project>
kind: backlog-item
backlog-status: planned
depends-on: []
---
<!-- depends-on: quoted wikilinks to backlog items in this project, for example ["[[other-slug]]"], or []. Delete this comment. -->
<!-- A new item has no verdict yet: write `Fit: pending - <why there is no verdict yet> - <YYYY-MM-DD>`; game-master replaces it. Delete this comment. -->
<!-- In an adopted project, write a new item to this template and the vocabulary, not to the shape of older items, and do not rewrite older items unless the owner asks. Delete this comment. -->
# <Item title>

Fit: <fits | does-not-fit | needs-pillar-change | pending> - <P and N numbers (P2 is pillar 2, N1 is non-goal 1) and the reason; for needs-pillar-change the exact edit; for pending why there is no verdict yet, for example waiting for game-master's fit check; for a process document the next checkpoint reviews: process document for <checkpoint name>> - <YYYY-MM-DD>
Target checkpoint: <brief-approved | vertical-slice | scope-lock | content-lock | ship, or none>

## Implications
- art: <animations, effects, environment pieces, interface art; or: none>
- sound: <cues and music; or: none>
- writing: <text and localization; or: none>
- architecture: <tools, formats, performance risk; or: none>
- quality: <test instrumentation, evidence, budget impact; or: none>
- constraints touched: <each constraint from the constraints page this item can affect, as a link, with how it is affected and how it will be checked; or: none>

## Design artifacts
<each artifact the work needs, as a link, or: none required. The registry holds its status.>

## Acceptance evidence
Expected: <what observed evidence will show the item is done>
Recorded in: <quality evidence note path, or: not yet>

## Art stage
<one of the Art stage values in the vocabulary; not-applicable if the item has no art>
Signed: <stage - version or build signed - YYYY-MM-DD, one per line; or: none>

## Status reason
<required when backlog-status is blocked or dropped: why; otherwise: none>
