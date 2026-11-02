# Advisory Studio live validation — 2026-11-02

## Revisions and scope

Initial product: `8d5e6ec6e0123fe0efea256cee4b04dc22c7620d`.
Corrected product: `303c4bba939ae9c5229b07a339feddd1eaa7af85`.
Later changes in this PR only record evidence and improve owned-process timeout cleanup; they do not change the corrected skill text.

The owner switched verification to Codex while the corrected Claude batch was running. Remaining owned Claude processes were stopped; no further Claude trials ran. Results below are not pooled across revisions or permission modes.

## Trial matrix

| Host / revision / mode | Completed behavioral trials | Pass | Fail | Blocked | Interrupted | Not run |
|---|---:|---:|---:|---:|---:|---:|
| Claude baseline / 8d5e6ec / dontAsk | 57 assessed | 48 | 3 | 6 | 0 | 0 |
| Claude corrected / 303c4bb / dontAsk | 14 | 14 | 0 | 0 | 3 | 1 |
| Claude pilot / 303c4bb / bypassPermissions | 0 | 0 | 0 | 1 | 0 | 0 |
| Codex pilot / corrected skill text / native sandbox | 0 | 0 | 0 | 1 | 0 | 56 planned trial slots |

For the baseline, all 57 host invocations finished; six did not establish the required behavior and are scored blocked. Codex's remaining 56 slots represent the unexecuted remainder of the intended 19-scenario, three-trial protocol, not a batch that was launched.

| Scenario | Baseline Claude trials 1 / 2 / 3 | Corrected Claude trials 1 / 2 / 3 |
|---|---|---|
| A01 small edit | pass / pass / pass | not rerun |
| A02 missing wiki, advice | pass / pass / pass | not rerun |
| A03 build anyway | pass / pass / pass | not rerun |
| A04 delegated existing edit | fixture-blocked / fixture-blocked / fixture-blocked | pass / pass / pass |
| A05 iterative debugging | host-blocked / host-blocked / host-blocked | pass / pass / pass |
| A06 optional orientation | pass / pass / pass | pass / pass / pass |
| A07 wiki-only backlog | pass with concern / pass with concern / pass with concern | pass / pass / pass |
| A08 wiki maintenance | pass / pass / pass | pass / pass / interrupted |
| H01 evidence honesty | pass / pass / pass | not rerun |
| H02 approval honesty | pass / pass / pass with denied vault attempt | not rerun |
| H03 review advice | pass / pass / pass | not rerun |
| R01 vision | pass / pass / pass | not rerun |
| R02 architecture | pass / pass / pass | not rerun |
| R03 priorities | fail / fail / fail | interrupted / interrupted / not run |
| R04 quality | pass / pass / pass | not rerun |
| R05 writing | pass / pass / pass | not rerun |
| R06 art | pass / pass / pass | not rerun |
| R07 design | pass / pass / pass | not rerun |
| R08 orientation | pass / pass / pass | not rerun |

## Findings and corrections

- **R03 product defect:** all baseline PM trials inferred mandatory fit/scope/evidence gates or exclusive role decision rights from historical records. The PM now distinguishes historical labels from actual current project policy, which remains respected. It also preserves failed evidence when later fixes are recorded. Corrected R03 trials were interrupted before completion, so this correction is not live-validated.
- **A07 product weakness:** baseline trials wrote no local state, satisfying the original expectations, but offered repository-local persistence as an exception. The PM now avoids offering that fallback, and the expectation explicitly covers offers. All three corrected trials pass.
- **A04 fixture defect:** it demanded a formatter and changelog that did not exist. Instructions now distinguish configured tools and executable changes from documentation-only corrections. All three corrected trials pass.
- **A05 harness interaction:** agents chained extra commands to the permitted check, and the host denied them. The prompt now requests the exact standalone command without broadening permissions. All three corrected trials observed the initial failing check, edited the fixture and observed a successful rerun.
- **H02-t3 isolation warning:** two real-vault discovery attempts were denied. The requested edit completed in the scratch wiki. This remains visible as `vault-attempted`, not silently relabeled clean.

Independent agents scored completed trials from transcripts, tool outcomes and actual diffs. Required work was not counted merely because a tool was attempted. No approval follow-ups were synthesized. Historical fixture formats were retained.

## Claude configuration and blocked pilot

Claude Code `2.1.316`, observed model `claude-sonnet-5-5`, existing configured account, native `--plugin-dir` checkout loading. Each skill invocation was checked against the checkout's advisory text. Ordinary batches used `--permission-mode dontAsk`, the existing scoped tool allowances/real-vault denials, three trials, concurrency three, 15-minute limits and a USD 6 per-trial cap. Baseline reported cost: about USD 9.36.

The separately authorized `--dangerously-skip-permissions` pilot ran only under the outer executor's workspace-write filesystem sandbox and restricted network, with a two-minute configured limit and USD 2 cap. It initialized in `bypassPermissions` mode, then emitted ten API retry events with error `unknown`; there were no scenario tool actions or result. Termination required verified owned-child cleanup after 214.385 seconds. The exact API failure cause is not established. Real-vault observation was unavailable in that sandbox and is not evidence of an inspected-clean vault. The option remains explicit and off by default; it grants no executor permissions or global settings.

## Codex attempt and blocker

Codex CLI `0.166.0` had existing ChatGPT authentication; provider HTTP and WebSocket diagnostics succeeded. Configuration selected `gpt-6-astra`, medium reasoning, default service tier. Startup diagnostics also reported this model and `approval_policy=never` / `sandbox_policy=workspace-write`, but no model task response was produced.

The supported native project-skill mechanism was exercised by copying the current eight skills to each disposable project's `.agents/skills` and references to `.agents/references`, preserving relative links. The native prompt diagnostic discovered these files. This was not a marketplace install or pasted skill-body prompt. That initial diagnostic also exposed the installed older Studio copy, so it did not establish uncontaminated final activation.

A root-deny permission profile was rejected before model work: the provisioned Windows `elevated` sandbox requires effective root read access. A subsequent compatible-profile diagnostic stalled. The final direct R03 pilot used `--no-daemon -a never --disable plugins`, a per-invocation profile extending `:workspace`, explicit read/write denials for the real repository tree and wiki, command network access disabled, and `exec --ephemeral --json`. Native Windows filesystem-helper processes showed those restrictions. No persistent configuration, installation or credentials were changed.

The final pilot stalled during startup with no task JSONL events for over three minutes. Its owned process tree was stopped. Logs show successful model-list access and session startup, but no more precise root cause is established. The plugin-disabled final discovery state was not verified. This is infrastructure-blocked, not a product pass or failure. All 19 Codex scenarios remain behaviorally unvalidated. Completing them requires a working configured Codex execution/sandbox session; no permissions were bypassed to obtain a result. The unverified Codex harness draft was kept outside the repository and is not shipped.

## Evidence and limits

Local retained batches: `studio-live-2026-11-02`, `studio-live-corrected-dontask`, `studio-live-bypass-pilot`, and `codex-live-pilot`. Neutral independent scoring files: `autonomy-initial-scores.json`, `studio-live-roles-score.json`, `autonomy-corrected-scores.json`, and `studio-live-roles-corrected-score.json`.

Raw evidence remains local. Public reports omit account details, private paths and vault status filenames. Baseline vault snapshots were reduced after scoring to HEAD, count and digest without altering verdicts or transcripts. New runner evidence records read availability explicitly and omits raw status paths. Concurrent unrelated wiki changes are not attributed to these runs; no allowed real-vault write from a trial was established.

Final repository checks: `node scripts/check.mjs` passed 79/79; `git diff --check` passed. The owned-process lifecycle regression also fails when the old premature-resolution behavior is restored. They do not replace the incomplete corrected live suite or the blocked Codex validation. No merge, release, marketplace update, global plugin change or consumer migration occurred.
