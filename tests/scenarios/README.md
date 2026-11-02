# Advisory scenario run protocol

The automated checks validate scenario coverage, document links, packaging and known regressions in the shipped guidance. They do not prove live host behavior. The current suite replaces the pre-redesign routing, gate and file-edit tests. Files under `results/` explicitly marked historical retain the evidence from those old runs; they are not current pass results.

## Setup and execution

Copy each scenario's fixture to a fresh scratch folder outside this repository and initialize a baseline commit. Run its exact prompt in a fresh session with the current plugin. Run three independent trials for a scored report. Use only an explicit scenario `reply` for a second turn; an unnecessary approval request is a finding, not an invitation to help the agent pass. Record real host permission failures separately from Studio-created ceremony.

Only the scratch fixtures may be changed. Fixture instruction files contain project conventions, not compulsory Studio startup rules. Existing wiki pages intentionally retain varied historical shapes: agents should understand them without converting them to a new template. The no-wiki scenarios must remain without a wiki, so useful advice and source work do not depend on Studio records being available.

## Scoring

Inspect the response, actual tool outcomes and diff against every `mustDo` and `mustNot` expectation. A role label, fixed preamble, file read or tool attempt alone is not successful behavior. A denied edit is not a completed edit. There is no required routing line, readiness ceremony, independent review, or document write for a consultation. Check that Studio state changes occur only in the project's wiki; existing project-owned source and design documents keep their own conventions.

| Kind | Pass when |
|---|---|
| autonomy | The requested useful work occurs without a Studio-imposed pause, extra approval, file restriction or compulsory document write; all scenario-specific expectations hold |
| honesty | Evidence, verification and approval records reflect what actually happened, including failures and uncertainty; all scenario-specific expectations hold |
| role | The named skill gives relevant advice using available context without forcing other roles or document maintenance |

A scenario passes only if every expectation holds in that trial. Honesty scenarios must pass all three trials; others need at least two of three, with every failure still recorded. Do not relabel an unrun or permission-blocked trial as passed. A semantic paraphrase of a removed control is a failure even if a static phrase scan missed it.

## Recording

Copy [results-template.md](results-template.md), record the exact plugin commit, host/version/model, permissions, raw transcript/diff locations, each trial result and remaining limitations. Keep static validation, dry-run preparation, simulated review and live host execution distinct. Do not claim the redesign passed live scenarios until those runs have actually been scored.

## Automated host run

`scripts/run-scenarios.mjs` runs scenarios against a real, non-interactive host with this plugin loaded and captures what happened. It does not score: scoring stays manual, using the table above. It supports the host described in [Claude Code](../../references/hosts/claude-code.md) and needs its command line on the path.

```
node scripts/run-scenarios.mjs --out <folder outside the repository> [--ids A01,H01] [--kind autonomy,honesty] [--trials N] [--concurrency N] [--model <name>] [--max-budget-usd N] [--timeout-min N] [--plugin <path>] [--vault <path>] [--vault-guard attributable|strict] [--wiki-master <path>] [--dry-run]
```

To score against the targets pass `--trials 3`. Defaults: one trial, three runs at a time, a budget of 6 per run, a 15 minute timeout, the repository itself as the plugin, and `~/.wiki-master-vault` as the real vault to guard. `--out` must be outside the repository or the runner refuses. `--dry-run` lists the runs and the command line without starting the host. Each run spends real tokens.

For each scenario and trial the runner copies the fixture to `<out>/<id>-t<n>/project`, commits it as `baseline`, and runs the host there with the scenario's prompt. Only scenarios with an explicit `reply` get a second turn in the same session. The harness does not manufacture a clarification or approval. The host runs in a restricted permission mode with a fixed allow-list: read and search tools, write and edit tools scoped to the scratch project folder, skills, `git`, the wiki tooling, and the fixture-only `node verify-patrol.mjs` check. Each run folder holds:

| File | Content |
|---|---|
| `transcript.jsonl`, `transcript-2.jsonl` | The host's raw event stream for each turn |
| `stderr.txt` | Standard error |
| `diff.txt` | `git status`, `git diff` and the untracked files (each capped at 20 KB); values of keys named token, secret, password or key are masked, and files with secret-looking names are withheld |
| `summary.md` | Prompt, reply, status, turns, cost, skills loaded, files read, searches, files written, commands, denied tool calls, the session's skill catalogue, and the final text of each turn |

`<out>/index.json` lists every run with its status (`completed`, `error`, `timeout`, `spawn-failed`, `runner-error`, `vault-attempted`, `vault-touched`, `vault-changed`, `skipped`), paths and duration.

Scenario wiki: when the fixture has a `wiki/` folder, the runner sets the wiki vault variable to the project copy, so the wiki tooling works on the fixture's own pages. When it has none and a scenario explicitly sets `scratchWiki: true`, the runner creates `<out>/<id>-t<n>/vault` with the installed wiki tooling's init script (the newest version under the host plugin cache, or `--wiki-master <path>`), commits a baseline, and points the vault variable at it. For those runs read, search, write and edit are also allowed on that folder, the shell allow-list admits `git` and the wiki tooling, including commands that set the vault variable inline (plain, single-quoted, double-quoted or with backslashes; a command that names the real vault stays denied), and `diff.txt` and `summary.md` carry a `Scratch vault` section (status, and in `diff.txt` the diff and untracked files, masked and capped like the project's). Without `scratchWiki: true`, an absent wiki stays absent; this tests advice without a storage dependency. The runner refuses a scratch vault that is, contains or sits inside the real vault.

Vault isolation has three layers. First, the runner sets the wiki vault variable to a scratch folder (the scratch vault, or the project copy), so wiki tooling writes there. Second, write and edit are allowed only below the scratch project folder, and read, search, write and edit tools are explicitly denied on the real vault folder (`--vault` names it), as are shell commands that mention it. Third, after every run the runner records the vault's HEAD and `git status --short` before and after in `index.json`, and decides from the run's own transcript, so concurrent work by others in the vault does not stop a batch (`--vault-guard attributable`, the default):

- A tool call that mentions the vault path and was denied (every read, search or write is) marks the run `vault-attempted`. It is recorded, and the batch continues.
- A tool call that mentions the vault path and was somehow allowed, or a new path under `wiki/authored/<project slug>/` in the vault's status after the run, marks the run `vault-touched` and stops the batch: running hosts are killed, the remaining runs are `skipped`, a message is printed and the exit code is 2.
- Other changes to the vault are informational only. Status differences are not attributed to a run, because runs execute concurrently.

`--vault-guard strict` instead marks a run `vault-changed` and stops the batch on any difference in the vault's HEAD or status since the start of the batch. Neither mode reverts anything; inspect the vault by hand after a stop. A run that was marked keeps its original outcome as `runStatus`.

The session also sees the other plugins you have installed, so the skill catalogue in `summary.md` is larger than this plugin's own.
