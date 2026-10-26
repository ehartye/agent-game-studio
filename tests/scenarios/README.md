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

## Automated host run

`scripts/run-scenarios.mjs` runs scenarios against a real, non-interactive host with this plugin loaded and captures what happened. It does not score: scoring stays manual, using the table above. It supports the host described in [Claude Code](../../references/hosts/claude-code.md) and needs its command line on the path.

```
node scripts/run-scenarios.mjs --out <folder outside the repository> [--ids R01,S01] [--kind routing,stop] [--trials N] [--concurrency N] [--model <name>] [--max-budget-usd N] [--timeout-min N] [--plugin <path>] [--vault <path>] [--vault-guard attributable|strict] [--wiki-master <path>] [--dry-run]
```

Defaults: one trial, three runs at a time, a budget of 6 per run, a 15 minute timeout, the repository itself as the plugin, and `~/.wiki-master-vault` as the real vault to guard. `--out` must be outside the repository or the runner refuses. `--dry-run` lists the runs and the command line without starting the host. Each run spends real tokens.

For each scenario and trial the runner copies the fixture to `<out>/<id>-t<n>/project`, commits it as `baseline`, and runs the host there with the scenario's prompt. Scenarios with a `reply`, and every adoption scenario (generic reply: "Use your best judgement and state your assumption."), get a second turn in the same session. The host runs in a restricted permission mode with a fixed allow-list: read and search tools, write and edit tools scoped to the scratch project folder, skills, `git`, and the wiki tooling. Each run folder holds:

| File | Content |
|---|---|
| `transcript.jsonl`, `transcript-2.jsonl` | The host's raw event stream for each turn |
| `stderr.txt` | Standard error |
| `diff.txt` | `git status`, `git diff` and the untracked files (each capped at 20 KB); values of keys named token, secret, password or key are masked, and files with secret-looking names are withheld |
| `summary.md` | Prompt, reply, status, turns, cost, skills loaded, files read, searches, files written, commands, denied tool calls, the session's skill catalogue, and the final text of each turn |

`<out>/index.json` lists every run with its status (`completed`, `error`, `timeout`, `spawn-failed`, `runner-error`, `vault-attempted`, `vault-touched`, `vault-changed`, `skipped`), paths and duration.

Scenario wiki: when the fixture has a `wiki/` folder, the runner sets the wiki vault variable to the project copy, so the wiki tooling works on the fixture's own pages. When it has none, a real project would have a vault the tooling can reach, so the runner creates `<out>/<id>-t<n>/vault` with the installed wiki tooling's init script (the newest version under the host plugin cache, or `--wiki-master <path>`), commits a baseline, and points the vault variable at it. For those runs read, search, write and edit are also allowed on that folder, the shell allow-list admits `git` and the wiki tooling, including commands that set the vault variable inline (plain, single-quoted, double-quoted or with backslashes; a command that names the real vault stays denied), and `diff.txt` and `summary.md` carry a `Scratch vault` section (status, and in `diff.txt` the diff and untracked files, masked and capped like the project's). The runner refuses a scratch vault that is, contains or sits inside the real vault.

Vault isolation has three layers. First, the runner sets the wiki vault variable to a scratch folder (the scratch vault, or the project copy), so wiki tooling writes there. Second, write and edit are allowed only below the scratch project folder, and read, search, write and edit tools are explicitly denied on the real vault folder (`--vault` names it), as are shell commands that mention it. Third, after every run the runner records the vault's HEAD and `git status --short` before and after in `index.json`, and decides from the run's own transcript, so concurrent work by others in the vault does not stop a batch (`--vault-guard attributable`, the default):

- A tool call that mentions the vault path and was denied (every read, search or write is) marks the run `vault-attempted`. It is recorded, and the batch continues.
- A tool call that mentions the vault path and was somehow allowed, or a new path under `wiki/authored/<project slug>/` in the vault's status after the run, marks the run `vault-touched` and stops the batch: running hosts are killed, the remaining runs are `skipped`, a message is printed and the exit code is 2.
- Other changes to the vault are informational only. Status differences are not attributed to a run, because runs execute concurrently.

`--vault-guard strict` instead marks a run `vault-changed` and stops the batch on any difference in the vault's HEAD or status since the start of the batch. Neither mode reverts anything; inspect the vault by hand after a stop. A run that was marked keeps its original outcome as `runStatus`.

The session also sees the other plugins you have installed, so the skill catalogue in `summary.md` is larger than this plugin's own.
