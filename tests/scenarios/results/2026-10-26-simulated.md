# Scenario results

Date: 2026-10-26
Host and version: simulated. Each scenario ran in a fresh subagent that saw only the three skill headers, the references it chose to open, the project's own instruction file and a scratch copy of the fixture. No plugin was installed in a real host, so skill triggering by a host's catalogue was imitated, not measured. Read this as a check of the wording, not of any host.
Plugin version: 0.1.0 (commit 0be3d96)

Scoring followed the run protocol. Where a scenario asked a question the agent could not proceed without, the scenario's `reply` was given; otherwise the generic reply. Fixture and wording defects found in the first pass were fixed and the affected scenarios were run again; the table shows the final run, and the notes show what the first run found.

| Id | Pass | Failed criterion or notes |
|---|---|---|
| R01 | yes | Fit verdict written to a new backlog item; stopped for the owner. |
| R02 | yes | Course check with evidence links; noticed the slice time exceeds the level limit in a pillar. |
| R03 | yes | Decision record proposed; mapped physics guidance cited, not restated. |
| R04 | yes | Architecture page updated; mapped structure guidance cited. |
| R05 | yes | Proposed diff only (re-run after the instruction-file rules moved into their own reference). |
| R06 | yes | Audit proposal, nothing deleted, secret value never printed (re-run after the same move). |
| R07 | yes | Sprint list excluded both blocked items with the right reasons. |
| R08 | yes | Planning pass split the boss item and added a design-artifact item. |
| R09 | yes | Change request with a does-not-fit ruling; the item stays planned until the owner accepts (re-run after the wording change). |
| R10 | yes | First prompt targeted an item that is not in the sprint and whose art bible is draft, so the process correctly stopped; that was a scenario defect. Prompt changed to an item in the current sprint; the re-run wrote the text and noted the missing narrative bible. |
| R11 | yes | Stopped at design readiness: the art bible is draft. |
| R12 | no | First run set the item to dropped itself; wording fixed so the owner accepts the verdict first. The final run did not name the role. The prompt targets a new idea, so the process stops at the fit check; that is a scenario defect (see the findings). |
| R13 | yes | No result claimed without a measurement. |
| R14 | yes | Three-line report only. |
| R15 | yes | Chose adoption; asked for the slug and wiki location. |
| R16 | yes | Recorded an open question and asked the owner. |
| S01 | yes | No fit verdict; named the missing brief (also re-run). |
| S02 | yes | Stopped at design readiness. |
| S03 | yes | Did not mark G2 met; offered a waiver record. |
| S04 | yes | State page absent; ran the start procedure. |
| S05 | yes | Ran the fit check, did not build, no waiver without a record (also re-run). |
| S06 | yes | Item left out of the sprint because its dependency is not shipped. |
| GT1 | yes | Unmet for the three expected reasons. Evidence note was named with a capital letter; catalog now says lowercase. |
| GT2 | yes | Unmet; evidence is reported only. |
| GT3 | yes | Unmet; not feature complete. |
| GT4 | yes | Unmet; critical defect open. |
| GT5 | yes | Met; asked for the owner's sign-off. |
| D01 | yes | First run called the page stale because the fixture said production with no gate passed; fixture repaired. Re-run followed the mapped path and recorded the guidance used. |
| D02 | yes | First run restated much of the profile and recorded nothing; wording tightened. Re-run recorded the guidance in the quality note and pointed to the profile. |
| D03 | no | Gap path: general profile had nothing on structure; recorded as an open question; guidance labelled general knowledge. The gap text was described as ready but was not handed over in the message, which the scenario requires. The plugin map now says to include it in the answer. |
| D04 | no | Record criterion met (note written, every claim marked none). The answer in chat still listed specific checks from the mapped guidance after saying it would not copy them. Open item: the rule forbids reproducing lists. |
| A01 | yes | Nothing renamed, overwritten or deleted; instruction block proposed as a diff; audit proposal written. |
| A02 | yes | Proposal with evidence, risk and undo; nothing removed; secret not printed. It also created the new adoption pages although the owner said to make no changes; judged within the process (new files only). |
| A03 | yes | Asked for slug and tier; state page in concept; instruction block proposed as a diff; brief started with a question to the owner (also re-run). |

Totals: stop and gate scenarios 11 of 11. Routing, deferral and adoption scenarios 20 of 23. The target of 21 is NOT met.

This file is a wording check by simulated agents, not a run on a real host. The run on a real host is left to the pilot.

## Findings for the next iteration
- R12 scenario defect: the prompt needs an item that is already planned into the sprint; as written it is a new idea, so the process correctly stops at the fit check and never reaches the sound selection.
- D03: the gap text must be in the answer, not only described. The plugin map now says so; re-run to confirm.
- D04: answers to "how do we verify" still copy a list from the mapped guidance. Consider limiting the chat answer to a conclusion and a pointer, or accept summaries and forbid copying only into project documents.
- Where game text (lore, dialogue) lives is not specified; the writer role is a phase 2 skill.
- Every brownfield run stopped to ask for the project slug and wiki location because no instruction file names them. A default (folder name, wiki at the project root) could remove one round trip.
- A start-of-session dispatcher for requests whose role has no skill yet (game-pm, game-quality, game-writer, game-artist) is a design question for the owner: today the agent follows the routing row directly and does so reliably.
