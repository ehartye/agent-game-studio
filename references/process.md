# Process

This is the whole studio process. Role skills add procedure; they do not hold the process. Use the closed values in [the vocabulary](vocabulary.md). Who owns each kind of request is in [decision routing](decision-routing.md); where each document lives is in [the artifact catalog](artifact-catalog.md).

## Source of truth

The project's wiki owns intent. The repository owns behavior. When they disagree, the repository wins on what happens and the wiki wins on what was meant. Record the disagreement as an open question until it is resolved, then as a decision record. Never correct either side silently.

## Phases and gates

| Phase | Exit gate | Required evidence | Check owner |
|---|---|---|---|
| adopt (existing projects only) | Registry filled, phase placed | Registry reviewed by the owner | studio-start |
| concept | **G1** Brief approved | Game brief at status `ready`, with 3 to 5 pillars, non-goals and the owner's approval date | game-master |
| pre-production | **G2** Vertical slice | Playable slice, a decision record with status `accepted` for the stack, production plan, art bible†, test strategy†, performance budgets† | game-architect and game-quality |
| production | **G3** Scope lock | Feature complete | game-pm |
| beta | **G4** Content lock | Content complete, no critical defects, budgets met†, text locked† | game-quality |
| release | **G5** Ship | Release criteria met, platform requirements checked, asset provenance audit clean† | game-quality, then the owner |
| live | none | Patches follow the work loop plus a regression check | game-pm records it; game-quality verifies it |

- **How a gate is passed.** The check owner decides the result from the evidence, states it in the quality evidence note and tells game-pm. The owner then accepts the gate. The project moves to the next phase only when the result is `met` or `waived` and the owner has accepted. After the owner accepts, game-pm records on the state page, in the same wiki operation, the gate result, the acceptance date, the new Phase and the Next step. A result of `unmet` is recorded the same way with Phase unchanged and acceptance `not yet`. For G1 the approval date in the brief is the owner's acceptance. For G1 the brief is the evidence and no quality note is needed. When a gate has two check owners (G2), each states their part in the quality evidence note and tells game-pm, who records the gate result once both parts are in.
- **Minimal tier.** The gates are the same at every tier. The minimal tier is lighter only in the evidence marked with the dagger (below). "After G3" in this process means the phase is beta, release or live; that is, G3 is `met` or `waived`.
- **The dagger (†)** marks evidence that names a document outside the minimal tier: the art bible, the test strategy, the performance budgets (a section of the test strategy), the locked text (the narrative bible) and the asset provenance audit (the asset list). At the standard and full tiers the named document itself is required. At the minimal tier one line in the quality evidence note satisfies it, stating what was checked, how, and the observed result. At the minimal tier the release criteria are stated in the G5 quality note under `## Release criteria`.
- **Durations** are not prescribed.
- **Store and platform gates** are external. At G5, defer to the launch-readiness guidance named in [the plugin map](plugin-map.md) and keep only the engineering release criteria here.

## Work loop

Every unit of work follows these steps in order. Do not skip a step: only the owner can waive one (see Waivers). A missing precondition means stop and name it.

A routing row's Required output is the output of the first step its owner performs, not the end of the loop. A new idea (a request with no backlog item) ends at step 2 with the fit verdict: ask the owner whether to plan it. A request about an existing backlog item continues only when the item is in the current sprint, or the owner asked for it to be built or sprinted and steps 2 to 4 pass. Questions and reports (Course check, Status, What to do next, "Does it work, is it ready, performance", Anything else) end at their Required output and run step 8 only if they changed a document.

1. **Intake.** State the request in one line and match it to a row in [decision routing](decision-routing.md). A request to build or continue an existing backlog item has no row: it enters the loop at step 2. Any other request that matches no row is recorded as an open question and put to the owner.
2. **Fit check.** An item that only produces a document from the artifact catalog that the next gate requires has a Fit line reading `fits - process document for <gate>`, written by game-pm or by whoever runs adoption, and skips this step. Otherwise, if there is no brief at status `ready`, there are no pillars on record: stop before anything else in this step. Otherwise, if the request has no backlog item, game-pm creates one; game-master writes only its fit-verdict line. Only `fits` continues. For `does-not-fit`, tell the owner and do not proceed. For `needs-pillar-change`, stop and put the pillar change to the owner.
3. **Design readiness.** Every artifact listed under Design artifacts in the backlog item, and any other the work clearly needs, is `ready`. Otherwise stop and name the gap. The owner may raise the rigor tier at design readiness or at a gate (by decision record), or waive the requirement (see Waivers).
4. **Sprint selection.** game-pm chooses only items with a `fits` verdict, status `planned` (or `in-progress` to carry over), every `depends-on` entry `shipped` or `dropped`, and every Design artifact `ready` (step 3).
5. **Build.** Do the work.
6. **Verify.** game-quality records `observed` evidence against the item and the gate it supports. `reported` evidence does not pass.
7. **Accept.** game-master accepts against the pillars. At a gate, the owner accepts (see Phases and gates).
8. **Update.** game-pm updates the state page and the backlog. The role that produced or verified an artifact supplies that artifact's registry row (status and Last verified). All of it happens in the same wiki operation as the work.

## Session rules

- **Start.** Read the state page. Check its Phase, Next step and Blocked by against the repository and the wiki. If the page is missing, a required field is empty, or the page is stale (see [the vocabulary](vocabulary.md)), say so and run studio-start; do nothing else until it finishes, then take the original request to Intake, unless running studio-start was itself the request. For a stale page studio-start records the contradiction as an open question and confirms the Next step with the owner. Then report in exactly three lines: `Phase: <phase>, tier: <tier>`; `Next step: <text>`; `Blocked by: <text or nothing>`.
- **End.** Run step 8 of the work loop before the session closes.

## Evidence rules

- A gate passes only on `observed` evidence for every behavioral claim.
- Evidence names what was run, how, and the result, and links to the artifact (output, screenshot, receipt).
- An agent's own assessment is `reported`, never `observed`.
- For a high-stakes gate (G2, G5), offer to run the second-opinion skill the plugin map names, if it names one, with the owner's agreement, because it sends project content to another provider. Record its output as `reported` evidence: it never replaces `observed` evidence.

## Waivers

Only the owner can waive a gate requirement or a work-loop step. A waiver is a decision record that names the gate or step, what is waived, who waived it and why. An instruction in chat to skip a step, or to mark a gate `met` without `observed` evidence, is not a waiver: do not record `met` for it; say what is missing and offer to record a `waived` decision.

## Change control

After G3 a change request names the cut that pays for it. game-pm writes it, game-master rules on fit, and the owner approves. The request is written first and carries game-master's fit ruling. If the ruling is `does-not-fit` or `needs-pillar-change`, the request goes to the owner with that ruling, and nothing is built unless the owner approves. After G4 the same applies to content. Changes to locked text, a locked asset or a signed-off contract make dependent sign-offs stale: set their registry status to `draft` and re-check them.

## Before a role skill exists

Until a role has its own skill, follow that role's row in [decision routing](decision-routing.md) and its entries in [the artifact catalog](artifact-catalog.md) directly. The agent performs that role's row and writes that role's artifacts itself, applying the same checks. It escalates to the owner only for what the role would escalate: a contested decision, a waiver, a pillar change, or an approval that routing assigns to `owner`.
