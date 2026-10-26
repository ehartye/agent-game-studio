# Scenario run protocol

The files in this folder describe how an agent should behave. The automated checks (`node scripts/check.mjs`) confirm only that `scenarios.json` is well formed and covers every routing row, every gate, the stop rules, deferral and adoption. Scoring the behavior is a manual run.

## Setup

1. Install the plugin in a fresh agent session on a host you support. For the deferral scenarios (D01 to D04) also install the engine plugins named in the plugin map, and read the engine plugin's profile for the fixture's stack first, so you know what it does and does not cover.
2. For each scenario, copy its fixture folder (`tests/fixtures/<fixture>/`) to a scratch folder outside this repository. In the copy run `git init`, add everything and make one commit, so you can inspect `git status` and `git diff` afterwards. Open a new session there with no prior context. Only the fixtures active-project and stalled-project carry the process block in their AGENTS.md; in the others the agent finds the process through the plugin's skill descriptions.
3. Do not add hints to the prompt.

## Run

Paste the scenario's `prompt` exactly. Let the agent answer. Do not correct it mid-run. If it asks a clarifying question, give the scenario's `reply` if there is one; otherwise answer "use your best judgement and state your assumption".

## Scoring

Read the scenario's `expect` and its `note` (if any). Reading the state page first and reporting phase, next step and blockers (three lines, then the line `Routed: <request type> -> <owner>`) is expected for every scenario and is not scored. Noting that a document the scenario mentions is absent from the fixture is acceptable unless the scenario says otherwise.

| Kind | Pass when |
|---|---|
| routing | The agent names the expected owner (satisfied by the `Routed:` line or by the final text naming the role), reads the expected document before producing the output, produces the expected output, and brings in the `then` party where one is named |
| stop | The agent does not do the work, and names the missing precondition in `missing`. Do not score on step numbers |
| gate | The agent reports the expected result and the expected reason, citing evidence. Additional valid reasons are fine. For G5 it also asks the owner for the final sign-off |
| defer | The agent follows the expected path (mapped, fallback, gap), records what it used or the gap where the scenario says, and does not restate engine guidance itself. `restates` means copying procedures, commands, thresholds or lists into a project document or listing them in chat; a one-line standard that cites the guidance is allowed |
| adoption | The agent does every `mustDo` item and none of the `mustNot` items |

## Recording

Copy `results-template.md` to `results/<date>-<host>.md`, fill one row per scenario (pass, and the failed criterion if it did not pass), and commit it.

Targets: all 11 stop and gate scenarios (S01 to S06, GT1 to GT5) pass, and at least 21 of the 23 routing, deferral and adoption scenarios (R01 to R16, D01 to D04, A01 to A03) pass, which is 90 percent. A failure is a finding about the skill or reference wording: fix the wording, not the scenario, unless the scenario is wrong.
