# Scenario run protocol

The files in this folder describe how an agent should behave. The automated checks (`node scripts/check.mjs`) confirm only that `scenarios.json` is well formed and covers every routing row, every gate, the stop rules, deferral and adoption. Scoring the behavior is a manual run.

## Setup

1. Install the plugin in a fresh agent session on a host you support. For the deferral scenarios (D01 to D04) also install the engine plugins named in the plugin map, and read the engine plugin's profile for the fixture's stack first, so you know what it does and does not cover.
2. For each scenario, copy its fixture folder (`tests/fixtures/<fixture>/`) to a scratch folder outside this repository. In the copy run `git init`, add everything and make one commit, so you can inspect `git status` and `git diff` afterwards. Open a new session there with no prior context. Only the fixtures active-project and stalled-project carry the process block in their AGENTS.md; in the others the agent finds the process through the plugin's skill descriptions.
3. Do not add hints to the prompt.

## Run

Paste the scenario's `prompt` exactly. Let the agent answer. Do not correct it mid-run. If it asks a clarifying question, give the scenario's `reply` if there is one; otherwise answer "use your best judgement and state your assumption".

## Scoring

Read the scenario's `expect` and its `note` (if any). Reading the state page first and reporting phase, next step and blockers is expected for every scenario and is not scored. Noting that a document the scenario mentions is absent from the fixture is acceptable unless the scenario says otherwise.

| Kind | Pass when |
|---|---|
| routing | The agent names the expected owner, reads the expected document before producing the output, produces the expected output, and brings in the `then` party where one is named |
| stop | The agent does not do the work, and names the missing precondition in `missing`. Do not score on step numbers |
| gate | The agent reports the expected result and the expected reason, citing evidence. Additional valid reasons are fine. For G5 it also asks the owner for the final sign-off |
| defer | The agent follows the expected path (mapped, fallback, gap), records what it used or the gap where the scenario says, and does not restate engine guidance itself |
| adoption | The agent does every `mustDo` item and none of the `mustNot` items |

## Recording

Copy `results-template.md` to `results/<date>-<host>.md`, fill one row per scenario (pass, and the failed criterion if it did not pass), and commit it.

Targets: all 11 stop and gate scenarios (S01 to S06, GT1 to GT5) pass, and at least 21 of the 23 routing, deferral and adoption scenarios (R01 to R16, D01 to D04, A01 to A03) pass, which is 90 percent. A failure is a finding about the skill or reference wording: fix the wording, not the scenario, unless the scenario is wrong.

## Automated host run

`scripts/run-scenarios.mjs` runs scenarios against a real, non-interactive host with this plugin loaded and captures what happened. It does not score: scoring stays manual, using the table above. It supports the host described in [Claude Code](../../references/hosts/claude-code.md) and needs its command line on the path.

```
node scripts/run-scenarios.mjs --out <folder outside the repository> [--ids R01,S01] [--kind routing,stop] [--trials N] [--concurrency N] [--model <name>] [--max-budget-usd N] [--timeout-min N] [--plugin <path>] [--vault <path>] [--dry-run]
```

Defaults: one trial, three runs at a time, a budget of 6 per run, a 15 minute timeout, the repository itself as the plugin, and `~/.wiki-master-vault` as the real vault to guard. `--out` must be outside the repository or the runner refuses. `--dry-run` lists the runs and the command line without starting the host. Each run spends real tokens.

For each scenario and trial the runner copies the fixture to `<out>/<id>-t<n>/project`, commits it as `baseline`, and runs the host there with the scenario's prompt. Scenarios with a `reply`, and every adoption scenario (generic reply: "Use your best judgement and state your assumption."), get a second turn in the same session. The host runs in a restricted permission mode with a fixed allow-list: read and search tools, write and edit tools scoped to the scratch project folder, skills, `git`, and the wiki tooling. Each run folder holds:

| File | Content |
|---|---|
| `transcript.jsonl`, `transcript-2.jsonl` | The host's raw event stream for each turn |
| `stderr.txt` | Standard error |
| `diff.txt` | `git status`, `git diff` and the untracked files (each capped at 20 KB); values of keys named token, secret, password or key are masked, and files with secret-looking names are withheld |
| `summary.md` | Prompt, reply, status, turns, cost, skills loaded, files read, searches, files written, commands, denied tool calls, the session's skill catalogue, and the final text of each turn |

`<out>/index.json` lists every run with its status (`completed`, `error`, `timeout`, `spawn-failed`, `runner-error`, `vault-changed`, `skipped`), paths and duration.

Vault isolation has three layers. First, the runner sets the wiki vault variable to the scratch project folder, so wiki tooling writes into the copy. Second, write and edit are allowed only below the scratch project folder, and explicitly denied, along with shell commands that mention it, for the real vault folder. Third, the runner records the real vault's HEAD and `git status --short` at the start (`--vault` names the folder) and compares them after every run: any difference marks the run `vault-changed`, stops the batch (running hosts are killed and the remaining runs are `skipped`), prints a message and exits with code 2. It never reverts anything; inspect the vault by hand. Because runs execute concurrently, the check cannot say which run caused a change.

The session also sees the other plugins you have installed, so the skill catalogue in `summary.md` is larger than this plugin's own.
