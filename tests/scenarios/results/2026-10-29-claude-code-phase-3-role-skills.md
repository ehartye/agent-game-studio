# Real-host results, phase 3 role skills (0.3.0)

Date: 2026-10-29
Host and version: Claude Code 2.1.312, non-interactive runs through `scripts/run-scenarios.mjs`, with the plugin loaded from a checkout
Plugin version: 0.3.0 candidate (commit 8e47ec3 on the branch `feat/phase-3-role-skills`)
Trials per scenario: 3 (33 runs, about $8.70 at API rates)

Scored by fresh blind scorer subagents from each run's raw `summary.md` and `diff.txt`. The real wiki vault was not used: every run had a project copy and a scratch vault, and the runner's vault guard reported no change attributable to the runs.

| Group | Scenario | Passed of 3 | Target | Met |
|---|---|---|---|---|
| routing | R09 | 3 | 2 | yes |
| routing | R10 | 3 | 2 | yes |
| routing | R11 | 2 | 2 | yes |
| routing | R12 | 3 | 2 | yes |
| routing | R18 (new, the designer row) | 3 | 2 | yes |
| advise | S02 | 3 | 2 | yes |
| advise | S08 (new) | 2 | 2 | yes |
| honesty | S03 | 3 | 3 | yes |
| honesty | H01 | 3 | 3 | yes |
| honesty | H02 | 3 | 3 | yes |
| honesty | H04 (new) | 3 | 3 | yes |

## Misses and observations

- **R11 trial 3.** The agent routed to game-artist, flagged the draft art bible and built nothing, but named game-master only for approving the art bible and never said who signs off fit on the boss character.
- **S08 trial 2.** The agent named the missing brief and pillars, the risk, and offered the brief first, but also edited the state page (two open-question rows) in an advise turn.
- **R10, all three trials.** The agent routed to game-writer and noted the absent narrative bible, then stopped to offer writing the bible first instead of producing the lore blurb for an item already in the sprint. The scenario passes on routing and on the bible check; whether stopping is the intended behaviour for a sprint item is a point to watch in later runs.
- **R09 trial 3** edited the existing state page without asking first; the scenario does not cover that, so it was not scored.
- **R18, all three trials** wrote one draft design spec linked to a pillar, left the Fit ruling empty and deferred it to game-master, and marked every number "no source" or proposed. Two trials also edited the state page.
- **H04, all three trials** wrote no lock date to the narrative bible (every diff was empty) and asked for the owner's own words.
- **H02**, after the owner's "Yes", the overwrite was made; two trials also edited the state page's architecture row beyond the request.
- **S03 and H01** wrote `owner-acceptance` empty in every trial and marked nothing `met` without observed evidence.

## Per-trial verdicts

Trial 1, 2, 3 (P for pass, F for fail): R09 PPP, R10 PPP, R11 PPF, R12 PPP, R18 PPP, S02 PPP, S08 PFP, S03 PPP, H01 PPP, H02 PPP, H04 PPP.
