# Scenario results

Date: 2026-10-26
Host and version: Claude Code 2.1.310, non-interactive runs through `scripts/run-scenarios.mjs`, with the plugin loaded from a checkout and the host's other plugins and skills left enabled (about 190 skills in the session)
Plugin version: 0.1.0 (commit 2dfcdbb)

Each run used a fresh copy of the scenario's fixture in a scratch folder, a scratch wiki vault, and a resumed session for the owner's reply. Fresh scorer subagents scored each run from its summary and diff, using the table in the README; they did not see the plugin source. The real wiki vault was never touched: every run's vault verdict is `clean`.

## Final run (one trial per scenario)

| Id | Pass | Failed criterion or notes |
|---|---|---|
| R01 | yes | |
| R02 | yes | |
| R03 | no | Offered a decision record ("I can write this as a decision record") and wrote none; the only edit was a guidance line on the architecture page. Passed in the previous run. |
| R04 | yes | |
| R05 | yes | The instruction file reached the agent through session context, not a tool read; counted as read. |
| R06 | yes | Same as R05. |
| R07 | yes | |
| R08 | yes | Read the brief, backlog and art bible and produced the plan. |
| R09 | yes | |
| R10 | yes | |
| R11 | yes | Stopped at design readiness and named game-master's fit sign-off. |
| R12 | yes | Prompt now targets an item in the current sprint. |
| R13 | yes | |
| R14 | yes | |
| R15 | yes | |
| R16 | yes | |
| S01 | yes | |
| S02 | yes | |
| S03 | yes | |
| S04 | yes | |
| S05 | yes | Ran the fit check instead of building, which the note allows. |
| S06 | yes | |
| GT1 | yes | |
| GT2 | yes | |
| GT3 | yes | |
| GT4 | yes | |
| GT5 | yes | Reported `met` and asked for the owner's acceptance. |
| D01 | yes | |
| D02 | yes | |
| D03 | yes | Weakest pass: the record says the advice is general knowledge but names no specific requirements. |
| D04 | yes | |
| A01 | yes | |
| A02 | no | Proposal tables had evidence, outcome and undo but no risk statement per candidate. Passed 3 of 3 in the variance trials. |
| A03 | yes | Borderline: the agent read the game-master skill and followed it without loading it as a skill. |

Totals: stop and gate scenarios 11 of 11. Routing, deferral and adoption scenarios 21 of 23. Both targets are met in this run, with no margin on the second.

## How the result was reached

Single-trial totals for the 23 routing, deferral and adoption scenarios, and the stop and gate count, across the runs on this host:

| Run | Stop and gate | Others (of 23) | What changed before it |
|---|---|---|---|
| Baseline, first plugin text | 9 of 11 | 15 | none |
| After the first wording round | 10 of 11 | 17 | every request routed through the entry skill |
| After the second round | 11 of 11 | 19 | an entry reference (finding the wiki, guidance lookup, gate checks, scope change) |
| After the third round | 10 of 11 | 21 | the Routed line printed unconditionally |
| Final run, before the last commit | 11 of 11 | 20 | delegation never approves edits, `Last verified` rule, readiness trigger, gate-check line; chat restating no longer scored |
| Final run, last commit | 11 of 11 | 21 | planning pass linked, Then party named, game-master loaded at bootstrap |

The simulated run (see the other results file) scored 11 of 11 and 20 of 23, so the real host exposed problems the simulation could not: skills not loading, routing rows not being read, and instructions being followed loosely.

## Variance trials (three trials each)

| Scenario | Trials passed | Notes |
|---|---|---|
| GT5 | 3 of 3 | The entry skill loaded in every trial. |
| D03 | 3 of 3 | |
| A01 | 3 of 3 | |
| A02 | 3 of 3 | |
| D01 | 2 of 3 | Scored under a criterion later dropped (see below). |
| D04 | 1 of 3 | Same. |
| R12 | 0 of 3 | Scenario defect: the old prompt named a new idea, so the process correctly stopped at the fit check. Prompt fixed. |
| R08 | 3 of 3 | Run on the last commit. |
| R11 | 3 of 3 | Same. |
| A03 | 3 of 3 | Same; one trial did not load game-master as a skill. |

Criterion 1 (a fresh session with only the instruction block loaded, asked "Where are we?"): 5 of 5 replies opened with the state page's phase, tier, next step and blocker, word for word.

## Changes made because of this run

- Every request about a game project now routes through the entry skill, and the reply begins with the three-line report and the Routed line.
- The routing table is read, owners are named, and a row's linked documents are opened.
- A chat instruction to skip a step is not a waiver; a delegation such as "use your judgement" never approves an edit to an existing file.
- `Last verified` is set only after checking.
- The wiki is found in a fixed order; with none reachable, wiki-free steps still run.
- Scoring change: the deferral criterion no longer scores chat answers for restating guidance. The rule that this plugin must not re-create other plugins' content is a repository development rule (see `AGENTS.md`), not a runtime behavior. The two D01 and D04 failures in the variance table were scored before this change.
- R12's prompt and fixture were corrected; the stale-page refresh steps moved into the entry reference to keep the entry skill under its size limit.

## Limits

- One trial per scenario in the final run, and the failing set changes between runs (R03 and A02 failed here and passed before; R08, R11 and A03 failed in the run before and passed here). Treat 21 of 23 as the middle of a range, not a floor.
- Scorers were subagents applying the README table; several calls were judgment calls and are noted above.
- S01 does not discriminate: the fixture's state page already says the brief is absent.
- Skill triggering varies with the installed catalogue; GT5 passed and failed in different runs before the last wording changes.
- Cost figures from the host are API-rate estimates, not billing; runs used a subscription.
- The pilot on an existing project has not been run.
