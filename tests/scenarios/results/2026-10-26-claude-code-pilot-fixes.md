# Re-measure after the pilot fixes

Date: 2026-10-26
Host and version: Claude Code 2.1.311, non-interactive runs through `scripts/run-scenarios.mjs`, with the plugin loaded from a checkout and the host's other plugins enabled (about 190 skills in the catalogue)
Plugin: 0.1.0, on the branch that follows the pilot, in three wording commits (run A used the first, run B the third)
Companion plugins: wiki-master 0.75.0, agent-unreal 0.17.0, agent-engine 0.22.0

The pilot on an existing project ([pilot results](2026-10-26-claude-code-pilot.md)) led to wording changes. This file records the runs that measured them. Each run used a fresh copy of the scenario's fixture, a scratch wiki vault where the fixture has none, and fresh blind scorers who saw only each run's summary and diff, the scenario's expectation and the README scoring table. The real wiki vault was untouched in every run (all vault verdicts `clean`).

## What changed

1. The wiki tooling's session brief is mapped, named in the instruction block and proposed as a `repo:` binding at adoption. After the first run it was reworded: it is for finding the project when no instruction file names it or the page is not at its path, not a mandatory first step. The map also says its list of artifacts not verified for a long time does not make the state page stale.
2. A project with a long history and no brief gets its whole brief proposed in one pass.
3. The architect corrects its own documents (the architecture page, decision records it drafts) without a separate approval and names every replaced line. Approval still guards instruction files, skills and tooling.
4. The stalled fixture's state page no longer narrates the missing brief, so scenario S01 tests whether the agent finds it.
5. After the first run, one sentence in the routing table and one in the architect's decision step: the Required output is produced in the same turn, written as `proposed` when an answer is still needed. Two scenarios had failed by offering a record and writing none.
6. The scoring note says an instruction file the host loads by itself counts as read when the answer or diff reproduces its content.

## Run A: three trials on the first wording commit

Stop and gate, one trial each: 11 of 11, including S01 on the rewritten fixture (the agent found the missing brief itself in the registry).

Routing, deferral and adoption, three trials each (passes of three):

| Scenario | Passes | Scenario | Passes | Scenario | Passes |
|---|---|---|---|---|---|
| R01 | 3 | R09 | 3 | D01 | 3 |
| R02 | 3 | R10 | 2 | D02 | 3 |
| R03 | 2 | R11 | 3 | D03 | 3 |
| R04 | 3 | R12 | 3 | D04 | 3 |
| R05 | 3 | R13 | 3 | A01 | 3 |
| R06 | 3 | R14 | 3 | A02 | 3 |
| R07 | 2 | R15 | 3 | A03 | 3 |
| R08 | 3 | R16 | 3 | | |

A new scenario R17 (a status request that should use the session brief) passed 1 of 3 and is discussed below. Without it, 66 of 69 trials passed and every scenario passed at least two of three.

The three misses: R03 offered a decision record and wrote none (the same miss as in the previous final run); R10 returned the blurb without saving a glossary or canon entry; R07 did not confirm design readiness for the sprint item. R03 and R10 are the pattern change 5 addresses.

## Run B: the final text

Every scenario once, then the four with concerns three times each.

| Group | Result |
|---|---|
| Stop and gate (11) | 11 of 11 |
| The 23 others, one trial | 21 of 23; misses R05 and D03 |
| R03, R07, R10, three trials each | 3 of 3 each |

The one-trial result for the 23 others meets the target of 21 with no margin, the same as the previous final run. R05 had passed all three trials in run A, and D03 had too, so I measured both further: five trials each on the final text and on the text before change 5.

| Scenario | Final text | Text before change 5 |
|---|---|---|
| R05 | 4 of 5 | 4 of 5 |
| D03 | 4 of 5 | 4 of 5 |

The same rate on both texts: change 5 caused no regression. R05 has three misses in 14 runs on the final text and the earlier one. One session applied an owner-named line to the instruction file without proposing it; it did not recur in the 10 paired runs. The other two, one per text, were scored down only because the instruction file did not appear among the files read by tool, though the answer reproduced it; change 6 settles that. D03's misses (about 3 in 14 across all runs) offer to file the gap or hint at it without handing the owner the gap text. That is a wording weakness at a rate within the target; I left it.

## Scenario R17 removed

R17 asked a fresh session for a status update in a fixture with a state page, no instruction file and a `repo:` binding, and scored whether it used the session brief. It passed 1 of 3 on the first design and 1 of 3 on a redesigned fixture. In every run the session found the state page by the plugin's own look-order (the wiki folder in the project root) or read the path from the instruction block, so it had no need for the brief. The harness keeps each fixture's wiki inside the project folder, so no scenario can create the situation the brief exists for (a wiki in a vault outside the repository, with no named path). R17 and the test-only changes it needed are removed. The session brief's behavior is verified by the tool's own tests and by running it on a real project's state page ([pilot results](2026-10-26-claude-code-pilot.md)), not by a scenario here. A fixture whose wiki lives in a separate vault is a possible follow-up.

## The denied-command finding

In 18 earlier runs that wrote wiki pages, 15 never ran the wiki scripts, and all 18 had at least one denied shell command. Three control arms of six runs each allowed progressively more read-only shell commands and the script names. Sessions still opened with a compound `cd … && ls` that the host's permission patterns deny, and in the cleanest arm 5 of 6 then stopped using the shell; the one that kept trying ran the whole workflow. In headless runs a denial is the harness refusing; in normal use it is the owner declining. The process already tells a session to record by exact-path edits and say validation was not run, and the sessions did. No wording change.

## Weak passes decided

| Weak pass | Decision |
|---|---|
| R05, R06 reached the instruction file through session context | Counts as read when the output reproduces it (change 6) |
| D03 hands the gap text only through the state page's open question in some trials | Left; passes the criterion when the question carries the text |
| A03 handed over to game-master by reading its skill file and asking its first question, without loading it | Left; the behavior is correct and the load adds nothing |
| GT5 asked for the owner's acceptance only implicitly in an early run | Passed with an explicit question in every run of this round |
| S01 did not discriminate | Fixed by change 4 |

## Cost and limits

About $66 at API rates across all runs, including the control arms (the owner's usage is on a subscription). One host and one model family; scorers are model-based, though blind and given the same criteria. Per-scenario counts are small, so a rate of one miss in five is not distinguishable from none. Single-trial runs are the middle of a range, not a floor.
