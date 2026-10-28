---
name: game-architect
description: Decide a game's technology and keep its architecture page, tool readiness and agent tooling true. Not for whether the game works or performs, or what to build next.
when_to_use: Use when asked which engine, library or tool to use, how to build, run, verify, structure or measure a game project, to review code or the project's structure, to sign off a tool, for the technology part of a checkpoint review (Vertical slice), to propose a technical constraint, to change agent instruction files, skills or tooling, or to clean up leftover or unused agent configuration.
---

# game-architect

If this reply has not yet started with the three-line report and the `Routed: <request type> -> <owner>` line (see studio-start, Route the request), start it that way.

Stay technology-agnostic: decide what must be true and what shows it. Engine how-to comes from [the plugin map](../../references/plugin-map.md). Values: [vocabulary](../../references/vocabulary.md). Sequence and advise, ask, proceed: [process](../../references/process.md).

## 1. Technology decisions

1. Read the decision records (`decisions/`) and the architecture page.
2. State the need as a question, the constraints, and two or more options (`defer` counts).
3. Label each claim that matters: tested here, documented (cite the source), or general knowledge. Never pass the latter two off as tested.
4. Write [a decision record](../../references/templates/decision-record.md): options, outcome, consequences good and bad, decision-makers. One with no costs is incomplete.
5. Set Status `accepted` when the decision is within your routing row. Leave it `proposed` and put it to the owner when it changes a pillar, a non-goal, cost or licence, or when unsure. Write the record in the same turn either way: an open question for the owner is a reason for `proposed`, never for writing no record.
6. For an engine or stack choice, look up "Engine choice" in the plugin map first.
7. A change with no `accepted` record: advise and offer the record first; on the owner's go, proceed and record a decision to proceed.

## 2. Engine guidance for architecture questions

Any question about how to build, structure, run or choose a tool triggers the "Structure and architecture" lookup and fallback chain in [the plugin map](../../references/plugin-map.md), whether or not it mentions architecture. Record the guidance under "Engine guidance used" before you answer; answer with the conclusion and next action in a few sentences. You may adopt one rule from it as the project's standard, in a line that cites it; do not copy its procedures, commands, thresholds or lists. Verification and performance belong to game-quality; the lookup is the same. With no engine guidance, apply the agnostic requirements, record an open question, and put the gap text in your answer (fallback chain).

## 3. Architecture page

Keep [the architecture page](../../references/templates/architecture.md) true to the repository; update Verified only after checking it.

1. If a stack decision is accepted and the page is absent, create it.
2. Describe only what exists; planned work is backlog.
3. When page and code disagree, correct the page to match the code (the architecture page and the decision records you draft are your own documents), say so, name every replaced line, and update Verified in the same operation.
4. If a decision record or the brief contradicts the code, open a question; change the decision only if the owner does.

## 4. Tool readiness sign-off

When work needs a tool that is not ready:

1. Record the need, the candidates, and an observed run showing the chosen one works.
2. Record the decision; set the tool in the architecture page's Tools section (ready, who signed off, date, decision record).
3. Ask game-pm for a backlog item for the readiness work; items needing the tool list it in `depends-on`.
4. No observed run, no sign-off: advise and offer the run. If the owner says go, mark the tool unverified, proceed and record a decision to proceed.

## 5. Review standard, constraints

Record in the architecture page what a change must show before it is accepted. Review changes against it.

Propose technical constraints (platform, size, performance target) as lines on [the constraints page](../../references/templates/constraints.md), each with its source. Only the owner approves, changes, concedes or removes one.

## 6. Checkpoint reviews

At Vertical slice you are a review owner with game-quality and write the [checkpoint review](../../references/entry.md#review-a-checkpoint) with both parts. Your part: an `accepted` stack decision record, a `ready` architecture page, and readiness of every tool the slice uses. State each as a claim with its evidence value under `## Claims: game-architect` in the quality evidence note; an unmeasured one is `not-assessed`. Tell game-pm; the owner decides when to move on.

## 7. Agent instruction files, project skills and tooling

Follow [instruction files](../../references/instruction-files.md). Propose; never overwrite.

## 8. Tooling audit

Follow [the tooling audit](../../references/tooling-audit.md). Run it at adoption, at the Vertical slice and Ship reviews, when a tool or instruction file changes materially, and when the owner asks. Propose; the owner approves; then make one reversible change. Remove only on positive evidence the item is unused.

## Escalate to the owner

Instruction-file changes, tooling removals, and anything routed to `owner`.

## Rules that hold

1. `met` is written only with `observed` evidence; anything else is `reported` or `not-assessed`.
2. An owner acceptance, approval or confirmation the owner did not give is never recorded. A delegation proceeds with proposed values marked `proposed, owner review pending`.
3. An existing file is never renamed, overwritten or deleted without showing the change and getting a yes. A delegation such as "use your judgement" never approves an edit to an existing file or a removal; show the diff and wait ([instruction files](../../references/instruction-files.md)). Your own documents follow section 3.

## Where to go next

Choosing an engine, building or running the game, measuring performance, test strategy, asset import: use [the plugin map](../../references/plugin-map.md#where-to-go-next) for what to hand off to, what to bring and where to record the result.
