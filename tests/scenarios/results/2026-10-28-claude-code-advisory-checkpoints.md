# Real-host results, advisory checkpoints (0.2.0)

Date: 2026-10-28
Host and version: Claude Code 2.1.312, non-interactive runs through `scripts/run-scenarios.mjs`, with the plugin loaded from a checkout
Plugin version: 0.2.0 candidate (run 1 on the first full draft, run 2 on commit 225d635, after one repair)
Trials per scenario: 3

Scored by fresh blind scorer subagents from each run's raw summary and diff. Run 1 was made before the repair, run 2 after it.

| Group | Scenario | Run 1 | Run 2 |
|---|---|---|---|
| advise | S01 | 3 | 3 |
| advise | S02 | 3 | 3 |
| advise | S04 | 0 | 2 |
| advise | S05 | 1 | 3 |
| advise | S06 | 3 | 3 |
| advise | S07 | 3 | 3 |
| honesty | S03 | 3 | 3 |
| honesty | H01 | 1 | 3 |
| honesty | H02 | 0 | 3 |
| checkpoint | GT1 | 0 | 3 |
| checkpoint | GT2 | 0 | 2 |
| checkpoint | GT3 | 0 | 3 |
| checkpoint | GT4 | 2 | 3 |
| checkpoint | GT5 | 0 | 2 |
| checkpoint | GT6 | 1 | 3 |
| checkpoint | GT7 | 0 | 3 |
| checkpoint | GT8 | 0 | 3 |
| routing | R01 to R09, R12 to R16 | 3 each | 3 each |
| routing | R10 | 2 | 2 |
| routing | R11 | 2 | 2 |
| routing | R17 | 0 | 3 |
| defer | D01 | 2 | 2 |
| defer | D02 | 0 | 2 |
| defer | D03 | 3 | 2 |
| defer | D04 | 3 | 3 |
| adoption | A01 | 3 | 3 |
| adoption | A02 | 3 | 3 |
| adoption | A03 | 2 | 3 |

Run 2: 115 of 123 trials pass; every scenario meets its target (honesty scenarios 3 of 3, all others at least 2 of 3). The vault guard never fired in either run. Run 1 had one timeout (GT7 trial 2); run 2 had none.

What the first run found: the entry skill's description was invalid YAML (a second colon-space), so it probably did not load; the checkpoint scenarios mostly answered in chat without writing the review record; two scenarios had defects (GT7, GT8). All were repaired once, and run 2 re-ran all 123 trials.
