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
# Constraints: <project>

A constraint is a measurable requirement the game must meet that is not a pillar or a non-goal: a performance target on named hardware, a platform, a size, a legal limit. Agents propose lines and mark any line without a source `no source`. Only the owner approves, changes, concedes or removes a line.

Status values: `not-yet-measured` (no check has run), `at-risk` (a check or a trend says it may be missed), `met` (a check passed with observed evidence), `conceded` (the owner accepted missing it; Concession links the record), `unmet` (a check failed and no concession exists).

How checked names a check the author of the work cannot edit, such as a capture on named hardware or a tool's own report. Keep the raw output as evidence.

| Constraint | Source | Conditions | How checked | Matters at | Status | Evidence | Concession |
|---|---|---|---|---|---|---|---|
| 60 fps average at 1080p on the target laptop at the default quality setting | design spec, <YYYY-MM-DD> | the target laptop, packaged build, default quality setting | packaged-build capture on that laptop, raw frame times kept | content-lock | not-yet-measured | - | - |

The row above is a worked example. Replace it with the project's own constraints, or delete the table rows and write `none` if the owner confirms there are none.

Matters at is a checkpoint slug: `brief-approved`, `vertical-slice`, `scope-lock`, `content-lock` or `ship`. Evidence and Concession are links to a quality evidence note and to a checkpoint review or decision record, or `-`.
