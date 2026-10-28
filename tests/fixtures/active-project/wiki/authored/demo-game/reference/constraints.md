---
type: authored
created: 2026-01-02
updated: 2026-01-02
reviewed:
status: draft
sources: []
ai-generated: true
project: demo-game
kind: reference
---
# Constraints: demo-game

A constraint is a measurable requirement the game must meet that is not a pillar or a non-goal: a performance target on named hardware, a platform, a size, a legal limit. Agents propose lines and mark any line without a source `no source`. Only the owner approves, changes, concedes or removes a line.

| Constraint | Source | Conditions | How checked | Matters at | Status | Evidence | Concession |
|---|---|---|---|---|---|---|---|
| Frame time p95 at or under 16 ms in the arena at the default quality setting | owner brief, 2026-01-01 | the reference desktop (discrete graphics card), slice build, default quality setting | recorded slice replay with raw frame times kept | vertical-slice | met | notes/vertical-slice-run-log.txt | - |
| Runs in a current desktop browser with no plugin | decisions/engine-choice-adr.md, 2026-01-01 | latest release of the two most used desktop browsers | play the packaged build in each browser, console log kept | ship | not-yet-measured | - | - |
