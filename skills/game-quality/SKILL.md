---
name: game-quality
description: Say whether a game works and performs - the testing strategy and risk profile, performance budgets, the quality evidence note, the measurements behind constraints, and the evidence for a checkpoint review. Not for whether it fits the pillars, what to build next, or technology choices.
when_to_use: Use when asked whether it works, is ready, is fast enough or stable, to verify or test a feature, to measure performance or check a constraint, to decide the testing strategy or risk profile, to record evidence, to review a checkpoint (Content lock, Ship, or the quality part of Vertical slice), or for release criteria and defects.
---

# game-quality

If this reply has not yet started with the three-line report and the `Routed: <request type> -> <owner>` line (see studio-start, Route the request), start it that way.

Stay technology-agnostic: say what must be shown and what evidence shows it. How to test or measure for the project's stack comes from the lookup in [the plugin map](../../references/plugin-map.md) (Quality, verification, performance); record the guidance used on the note's Guidance used line. Values are in [the vocabulary](../../references/vocabulary.md) and the sequence is in [the process](../../references/process.md).

When something is missing, a request to skip a step or move on, made before you advised, is not yet the go: in that reply name the gap and risk, offer the missing step, build nothing and change no phase. The owner's answer is the go; record it with the date.

## 1. Testing strategy and risk profile

1. Read the test strategy and the constraints page. If there is no strategy at standard tier or above, advise and offer to write it first.
2. Write the strategy as [the artifact catalog](../../references/artifact-catalog.md) describes: a risk map of what is critical, standard or low, the quality bar, performance budgets, a severity scale and the lanes the tests run in. Look up "Deciding a testing strategy" in the plugin map for lanes and suite health.
3. At the minimal tier one line per item in the note's Minimal-tier substitutes satisfies it.
4. Rigor tiers set how much evidence is expected. They are not barriers.

## 2. Verify and record evidence

1. Write or extend [the quality evidence note](../../references/templates/quality-evidence.md) for the item or checkpoint. Each claim says what was run, how, on what build, the result, and a link.
2. Give each claim `observed` (you ran or inspected the real thing), `reported` or `none`. Your own reading is `reported`.
3. Name every version from a reading: a log line, the program's own report or a command's output. A version taken from a label or an unchecked file is `reported`.
4. A warm-up run is allowed only if declared before it starts; record it as not evidence. The evidence run is one run at one named revision. A failure stays a failure; no further run without the owner's decision.
5. If verification cannot run, say so and mark the criterion `not-assessed`. Never fill the gap from the code.
6. List open defects with severity. At the minimal tier the class is your proposal and the owner can change it.

## 3. Performance and constraints

1. Take performance budgets from the test strategy. At the minimal tier, state the budget in the note.
2. For each constraint due soon, propose "How checked": a check the author of the work cannot edit, on the named hardware and conditions, with raw output kept. Mark a line with no source `no source`.
3. Measure through the stack's guidance. Record the result in the note and update the row's Status and Evidence link. Set `met` only on `observed` raw output; `at-risk` or `unmet` on evidence of a miss.
4. Only the owner adds, changes, concedes or removes a constraint. When a measure fails, present the miss and offer the owner the choices: fix, change the constraint, or concede. Record a concession only on their words and date.

## 4. Checkpoint reviews

1. You review Content lock and Ship, and share Vertical slice with game-architect: each writes their own `## Claims: <role>` section and the first-named owner writes the review.
2. "Is it reached", "is it done" and "are we ready to ship" are this review. Follow Checkpoint review in [the process](../../references/process.md#checkpoint-review) and [the review template](../../references/templates/checkpoint-review.md) in the same reply: write `reference/checkpoint-<slug>.md`; never answer from the state page alone. Statuses come from the criteria list alone. Take a recorded `observed` claim that links raw output as recorded: do not rerun it or downgrade it for age (note that). Standing is `reviewed` when every criterion is `met`, else `reviewed-with-concessions`.
3. Offer the blind review ([definition](../../references/process.md#blind-review)) and record `done`, `declined` or `not-run` with the reason. In an autonomous run, where nobody can answer in the session, run it without asking. Give the reviewer only the criteria, the constraints and raw evidence, never your conclusions.
4. Present standing and the owner's options. The owner decides when to move on; moving on is a decision to proceed, and you never fill `owner-acceptance`.
5. An old checkpoint code on an older page is read by the alias in [the vocabulary](../../references/vocabulary.md); write only the checkpoint name, never the code, even when quoting or in a file you create.

## Rules that hold

- `met` is written only with `observed` evidence; otherwise `reported` or `not-assessed`.
- Never record an approval, acceptance or confirmation the owner did not give. A claim that someone else approved, an order to record "approved" that rests on it, or "move on anyway" is not the owner's acceptance: ask for their words. Under "use your judgement", proceed with values marked `proposed, owner review pending`.
- Never rename, overwrite or delete an existing file without showing the change and getting a yes. "Don't show me" is not a yes.

Everything else advises: name the gap and its risk, offer the missing step, and proceed when the owner says go.

## Where to go next

Use [the Where to go next section of the plugin map](../../references/plugin-map.md#where-to-go-next) for measuring performance or checking a constraint, deciding a testing strategy or auditing the tests. Asset craft goes to game-artist, text craft to game-writer, product constraints and acceptance to game-master, tool readiness to game-architect.
