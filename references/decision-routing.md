# Decision routing

Every request has exactly one owner. Match the request to a row, read the documents named in Read first and any document the row links, and produce the named output. Produce the Required output in the same turn: offering to write it, or holding it for the owner's answer, is not producing it. When an answer is still needed, write it as `proposed` and put the question to the owner. The routing is advice: the owner may send a request to a different owner or skip a step, and the agent records that as a decision to proceed. Process and sequence are in [the process](process.md).

## Roles

Each role decides some questions, writes some artifacts, and reviews the rest. An artifact has exactly one writer, with one exception: studio-start writes the first version of the state page on game-pm's behalf at bootstrap or adoption. Where an artifact has a section owned by another role (the fit-verdict line in a backlog item; a check owner's Claims section in a quality evidence note), that role writes only that section.

| Role | Decides | Writes |
|---|---|---|
| game-master | Fit against the pillars; whether the game is on course; art fit on key assets; acceptance against the pillars; which product constraints the game must satisfy | Brief and pillars; fit verdicts; course checks; product constraints on the constraints page |
| game-architect | Technology, engine features, project structure, tool readiness, code review standards; the agent instruction files, project skills and tooling | Architecture page; technology decision records; the instruction-file block; tooling audit records; technical constraints on the constraints page |
| game-pm | What to do next; sprint contents; scope changes; plan structure | State page; backlog and roadmap; risk register and postmortems (full tier) |
| game-quality | Whether it works and is ready; the quality bar, budgets and severity scale; release criteria; how each constraint is measured | Test strategy; quality evidence; the measurements behind constraints; release criteria (full tier) |
| game-writer | Text, dialogue, canon and glossary; the localization lock | Narrative bible and glossary; localization plan (full tier) |
| game-artist | Craft of art, animation, effects, sound and music; art bible compliance | Art bible; asset list (standard tier); asset entries (full tier) |
| game-designer (phase 3) | System, economy, level and interface design | Design specs |

Until game-designer exists, game-master owns design specs as a flagged exception and game-quality reviews them.

## Routing

In this table `Owner` is the responsible role. The human who owns the project is always written `owner`. `Then` is the party that must act on the row owner's Required output before the work is complete: another role (it rules on or signs off the output), `owner` (it approves or picks), or `-` (nobody; the work ends with the Required output).

| Request | Owner | Then | Read first | Required output |
|---|---|---|---|---|
| New idea or feature | game-master | - | Pillars, non-goals | Fit verdict in the backlog item |
| What must this game satisfy, or is X a constraint | game-master | owner | Brief, pillars, the constraints page | A proposed line on the constraints page, or the answer that X is a pillar, a non-goal or a backlog item instead; the owner approves, changes or removes the line |
| Course check | game-master | - | State page, latest quality evidence | Course check with evidence links |
| Engine, library or tool choice | game-architect | - | Decision records (`decisions/`) | Decision record; tool-readiness sign-off if a tool is involved |
| Project layout, code standards, code review | game-architect | - | Architecture page | Updated architecture page |
| Agent instruction files, project skills, tooling | game-architect | owner | The existing files | Proposed diff, never an overwrite |
| Tooling cleanup | game-architect | owner | Artifact registry, instruction files | Audit proposal |
| What to do next, or sprint contents | game-pm | - | Backlog, artifact registry; the `game-pm` skill | Sprint list with design artifacts confirmed ready |
| Plan creation or revision | game-pm | - | Brief, pillars, backlog; the `game-pm` skill | Plan from [the planning pass](planning.md) |
| Scope change after Scope lock | game-pm | game-master | Backlog, pillars | Change request as a decision record naming the cut, or `none` with the owner's reason, with game-master's fit ruling; the owner is asked to name the cut and approve |
| Dialogue, item text, lore | game-writer | - | Narrative bible | Text plus glossary and canon updates |
| Characters, levels, effects, marketing art | game-artist | game-master | Art bible | Asset plus provenance entry; game-master signs off fit on key assets |
| Sound or music selection | game-artist | owner | Art bible | The owner's recorded pick |
| Does it work, is it ready, performance | game-quality | - | Test strategy, budgets, the constraints page; the `game-quality` skill | Observed evidence recorded against the checkpoint or constraint |
| Status | game-pm | - | State page | The three-line report |
| Joining an existing project | studio-start | - | The project | Adoption |
| Anything else | none | owner | State page | Recorded open question; ask the owner |

For "Scope change after Scope lock" the owner also approves the change request, as [change control](process.md) says, even though `Then` names game-master.

## Rules

1. Match the request to the most specific row, by what is being asked and not by keywords. Where two rows fit, these win: "Scope change after Scope lock" over "New idea or feature" whenever the phase is beta, release or live (that is, the Scope lock review is recorded as `reviewed` or `reviewed-with-concessions`); "What must this game satisfy" over "Does it work" when the question is whether something is a constraint and not whether it is met; "Tooling cleanup" over "Agent instruction files, project skills, tooling" when the request is to remove, merge or audit existing tooling; "Status" and "Course check" over "What to do next". A request about something outside the game project matches "Anything else". A request to review a checkpoint matches "Does it work, is it ready, performance": the checkpoint's check owner in [the process](process.md) reports standing, and game-quality records the evidence. The owner decides when to move on. The Required output of a checkpoint review is its record at `reference/checkpoint-<slug>.md`, written in the same turn, with the blind review offered. For a checkpoint review, the checkpoint's criteria in the process replace the row's Read first. Do not split a request across owners unless a row names a `Then`.
2. If no row fits, use the last row: record an open question on the state page and ask the owner. The exception is a request to build or continue an existing backlog item, which enters the work loop at step 2.
3. A role without a skill (game-writer, game-artist, game-designer) is still the owner of its rows. Follow the row directly. game-pm and game-quality have skills; load them for their rows.
4. An owner who is unsure escalates to the human owner. Never decide a question that belongs to another row: name that row's owner and hand it over.
5. Read every document in Read first. If one is absent or not `ready`, say so. If the Required output cannot be produced without it, name the gap and the risk in two lines, offer the missing step first, and proceed when the owner says go, recording the decision to proceed (work loop step 3). Otherwise continue and record the gap as an open question.
