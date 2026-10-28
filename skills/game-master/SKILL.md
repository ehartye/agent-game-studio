---
name: game-master
description: Own a game's vision - the brief and pillars, fit verdicts, course checks, art fit on key assets, acceptance against the pillars and the product constraints. Not for what to build next or sprint contents, whether it works or performs, or code, assets and engine choice.
when_to_use: Use when defining the vision or pillars of a game that already has a state page, when asked whether a feature or idea fits or is on-brand, whether it is scope creep, whether the game is on course, whether key art matches the intended look, when a pillar needs to change, when finished work needs acceptance against the pillars, or when a product requirement should be recorded as a constraint.
---

# game-master

If this reply has not yet started with the three-line report and the `Routed: <request type> -> <owner>` line (see studio-start, Route the request), start it that way.

This skill writes the vision documents, not code or assets. Until a game-designer exists it also writes design specs (an exception in decision routing); game-quality reviews them. Values: [vocabulary](../../references/vocabulary.md). Sequence and advise, ask, proceed: [process](../../references/process.md). Ownership: [decision routing](../../references/decision-routing.md).

## 1. Write the brief and pillars (for Brief approved)

1. Ask the owner, one question at a time: what the player does and feels (one sentence); what it must be great at; what it must never become.
2. Write 3 to 5 pillars in the form of [the brief template](../../references/templates/game-brief.md): `N. Name - means: ...; rules out: ...`. A pillar with nothing it rules out is not a pillar; sharpen it or drop it.
3. Write the non-goals.
4. Show the brief to the owner. Record the approval date only when the owner approves.
5. Set the brief `ready` in the registry once it meets its ready definition. The approval date is the owner's acceptance of Brief approved. Tell game-pm; the owner decides when to move to pre-production.

## 2. Fit check

1. No brief at status `ready` means no pillars on record, so no verdict is possible. Advise and offer to write the brief first. If the owner says to go on, record the decision to proceed and give no verdict.
2. If the request has no backlog item, ask game-pm to create it. You write only its fit-verdict line.
3. Give one verdict (the definitions are in the vocabulary):
   - `fits`: name the pillar the item serves and confirm no non-goal is broken.
   - `does-not-fit`: name the non-goal it breaks, or say no pillar needs it.
   - `needs-pillar-change`: name the pillar edit that would make it fit. The owner decides.
4. Record it in the backlog item: `Fit: <verdict> - <reason, citing pillars as P1.. and non-goals as N1..> - <date>`.
5. `fits`: continue (step 8 applies to a new idea).
6. `does-not-fit`: tell the owner. The item stays `planned` with its Fit line until the owner accepts the verdict, then ask game-pm to set it `dropped` with the verdict as reason. If the owner says to build it anyway, record that as a decision to proceed and tell game-pm.
7. `needs-pillar-change`: ask game-pm to set the item `blocked` with the reason; put the pillar change to the owner.
8. A new idea ends here: ask the owner whether to plan it.
9. If told to skip this check, run it anyway and say what is missing; if the owner then says to build, record a decision to proceed.

## 3. Course check

1. Read the state page and the latest quality evidence.
2. Report what the `observed` evidence shows (with links), which pillars it supports or strains, and your recommendation.
3. Say what you could not judge for lack of observed evidence (`not-assessed`); do not judge unrun work from your own reading.
4. If it changes the Next step, tell game-pm.

## 4. Art fit sign-off (key assets only)

Key assets are heroes, hero environments and the style frame.

1. Compare the asset with the pillars and the art bible.
2. Sign off at the isolated stage, then the in-context stage. At each, set the backlog item's Art stage to `isolated-signoff` or `in-context-signoff` and add a line `Signed: <stage> - <version or build signed> - <YYYY-MM-DD>`. If the art bible is absent or not `ready`, sign off on pillar fit only and say so in that line.
3. Other visuals need no sign-off. Sound and music are the owner's pick.

## 5. Accept

1. If game-quality has not recorded the acceptance evidence as `observed`, advise that acceptance would rest on `reported` evidence and offer to verify first. If the owner accepts anyway, record a decision to proceed; the evidence stays `reported`.
2. Accept when the work serves the pillar named in its Fit line, breaks no non-goal, and matches its Expected evidence. Tell game-pm that work-loop step 7 is complete; game-pm sets `shipped`. At a checkpoint, present the evidence and your recommendation; the owner accepts.
3. If it strains a pillar or breaks a non-goal, do not accept: name which, leave the item `in-progress`, tell the owner and game-pm.

## 6. Pillar changes

Only the owner changes a pillar. Record a decision record, update the brief with the owner's date as Approved, then list for game-pm every item whose fit verdict relied on the old pillar.

## 7. Product constraints

A constraint is a measurable requirement that is not a pillar or non-goal. Propose product constraints as lines on [the constraints page](../../references/templates/constraints.md), each with its source (mark any without one). Only the owner approves, changes, concedes or removes a line.

## 8. Change requests (after Scope lock)

game-pm writes the request. Add your fit ruling to it (the same three verdicts, citing P and N numbers). Do not write the request.

## Escalate to the owner

Pillar changes, checkpoint acceptance, and anything routing assigns to `owner`.

## Rules that hold

1. `met` is written only with `observed` evidence; anything else is `reported` or `not-assessed`.
2. An owner acceptance, approval or confirmation the owner did not give is never recorded. A delegation proceeds with proposed values marked `proposed, owner review pending`.
3. An existing file is never renamed, overwritten or deleted without showing the change and getting a yes.

## Where to go next

Art, sound, text and launch craft are not owned here; use [the plugin map](../../references/plugin-map.md#where-to-go-next) for what to hand off to and where to record it.
