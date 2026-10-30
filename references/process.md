# Process

This is the whole studio process. Role skills add procedure; they do not hold the process. Use the closed values in [the vocabulary](vocabulary.md). Who owns each kind of request is in [decision routing](decision-routing.md); where each document lives is in [the artifact catalog](artifact-catalog.md).

The process advises; the owner decides. A checkpoint reports where the project stands and what is missing. It never blocks work. The phase changes only when the owner says so; the agent proposes the change.

## Source of truth

The project's wiki owns intent. The repository owns behavior. When they disagree, the repository wins on what happens and the wiki wins on what was meant. Record the disagreement as an open question until it is resolved, then as a decision record. Never correct either side silently.

## Phases and checkpoints

A checkpoint is a review at the end of a phase. It lists named criteria, says whether each is met, and gives the owner what they need to decide when to move on.

| Phase | Checkpoint (slug) | Criteria | Review owner |
|---|---|---|---|
| adopt (existing projects only) | none | Registry: the artifact registry is filled and reviewed by the owner. Phase: the phase is placed | studio-start |
| concept | Brief approved (`brief-approved`) | Brief: the game brief is at status `ready`, with 3 to 5 pillars and non-goals. Approval: the brief carries the owner's approval date | game-master |
| pre-production | Vertical slice (`vertical-slice`) | Slice: a playable slice. Stack: a decision record with status `accepted` for the stack. Plan: a production plan. Art bible†. Test strategy†. Performance budgets† | game-architect and game-quality |
| production | Scope lock (`scope-lock`) | Feature complete: every backlog item is `shipped` or `dropped` | game-pm |
| beta | Content lock (`content-lock`) | Content: content complete. Defects: no critical defects. Budgets: performance budgets met†. Text: text locked† | game-quality |
| release | Ship (`ship`) | Release: the release criteria are met. Platform: platform requirements are checked. Provenance: the asset provenance audit is clean† | game-quality, then the owner |
| live | none | Patches follow the work loop plus a regression check | game-pm records it; game-quality verifies it |

- **Constraints.** Each constraint on the constraints page names the checkpoint it matters at. A review of that checkpoint includes those constraints (see Checkpoint review).
- **Moving on.** The review owner reports the standing of the checkpoint from the evidence, records it (see Checkpoint review) and tells game-pm. The owner decides when to move on. When the owner says to, game-pm records on the state page, in the same wiki operation, the last checkpoint reviewed, its standing, the date, the new Phase and the Next step. A checkpoint reviewed with unmet criteria still lets the owner move on: the unmet criteria are recorded as concessions.
- **Brief approved.** The brief is the evidence and no quality evidence note is needed. The approval date in the brief is the owner's acceptance.
- **Two review owners.** When a checkpoint has two review owners (Vertical slice), each states their part in the quality evidence note and tells game-pm. The first-named owner writes the checkpoint review with both parts in it.
- **Notes.** A criterion's status is set from the criteria list alone. Concerns outside the list go in a Notes line and never change a status.
- **Minimal tier.** The checkpoints are the same at every tier. The minimal tier is lighter only in the evidence marked with the dagger (below). "After Scope lock" in this process means the phase is beta, release or live.
- **The dagger (†)** marks evidence that names a document outside the minimal tier: the art bible, the test strategy, the performance budgets (a section of the test strategy), the locked text (the narrative bible) and the asset provenance audit (the asset list). At the standard and full tiers the named document itself is required. At the minimal tier one line in the quality evidence note satisfies it, stating what was checked, how, and the observed result. At the minimal tier the release criteria are stated in the Ship quality note under `## Release criteria`.
- **Durations** are not prescribed.
- **Store and platform requirements** are external. At Ship, defer to the launch-readiness guidance named in [the plugin map](plugin-map.md) and keep only the engineering release criteria here.

## Advise, ask, proceed

When a step's prerequisite is missing, a criterion is unmet, or a request conflicts with the process:

1. **Advise.** Name what is missing and the risk of going on without it, in two lines.
2. **Ask.** Offer the missing step first. Do not build the work yet.
3. **Proceed.** When the owner says go, do the work. Record the owner's choice and the date as a decision to proceed: on the state page, or in the checkpoint review when the step belongs to a checkpoint. One reply from the owner is enough. No document is required.

Never proceed without having advised, and never refuse once the owner has said go. A request to skip a step, build anyway or move on, made before you advised, is the request and not yet the go: advise in that reply, build nothing and change no phase, and take the owner's answer to your advice as the go.

## Rules that hold

These three rules always hold. The owner cannot lift them by telling the agent to proceed, because they protect the truth of the record.

1. `met` is written only with `observed` evidence. Anything else is `reported` or `not-assessed`.
2. An owner acceptance, approval or confirmation the owner did not give is never recorded. A claim that someone else approved (or that the agent did), an order to record "approved" that rests on it, and "move on anyway" are not the owner's acceptance: say it is the owner's to give and ask for their words. A delegation ("use your judgement") proceeds with proposed values marked `proposed, owner review pending`.
3. An existing file is never renamed, overwritten or deleted without showing the change and getting a yes. "Don't show me" and "just overwrite it" are not a yes. A role's own documents are no exception, except a correction that matches the document to the code and names every replaced line.

## Checkpoint review

Run it when the owner asks whether a checkpoint is reached, when the owner asks to move to the next phase, or when the agent proposes the move. "Has it been reached", "is it done" and "are we ready" are this request: do steps 1 to 5 in the same reply, writing the record before you compose the answer. An answer from the state page alone, with no record and no blind-review offer, is not a review.

1. **Collect.** Take the checkpoint's criteria from the table above. Take the constraints whose "Matters at" is this checkpoint's slug from `reference/constraints.md`. Gather the evidence for each.
2. **Assess.** Give each criterion a status (`met`, `not-met` or `not-assessed`) and an evidence value (`observed`, `reported` or `none`). A criterion nobody measured is `not-assessed`. It never counts as met. Take an evidence note's `observed` claim as recorded when it links raw output (a run log, receipt or capture) that supports it; do not downgrade it because this review did not rerun it, and do not call it `observed` when only your own reading backs it. Age and gaps go in Notes and Open items.
3. **Present.** Show the owner the criteria, how each is met, the constraints due at this checkpoint and every concession: anything weaker than required or skipped. List the claims the evidence does not support. Give the standing: `reviewed` when every criterion is `met`, otherwise `reviewed-with-concessions`, and list each `not-met` or `not-assessed` criterion under Concessions with `owner said: pending` until the owner answers. It is `open` only until the owner has seen the review.
4. **Record.** Write the same content to `reference/checkpoint-<slug>.md` in the project wiki (format in [the artifact catalog](artifact-catalog.md)). Frontmatter keys: `checkpoint` (the slug), `standing`, `tip` (the revision reviewed), `review-date`, `blind-review`, `owner-acceptance`. Leave `owner-acceptance` empty until the owner gives it; an agent never fills it. Fixed sections:
   - Criteria: criterion, how it is met, status, evidence value, link.
   - Constraints at this checkpoint.
   - Concessions and decisions to proceed: what is weaker than required or skipped, why, the owner's words and date, and when it is revisited.
   - Claims the evidence does not support.
   - Independent review: the blind review result, or the label "no independent review ran" with the reason.
   - Open items.
5. **Offer the blind review.** Ask the owner whether to run one. Set `blind-review` to `done`, `declined` or `not-run`. Record a `not-run` with the reason.
6. **Hand over.** The owner decides. If the owner says to move on, game-pm records the move (see Moving on). A concession the owner accepts is recorded with their words and date. A criterion the owner does not respond to stays as it is: do not record a decision for them. Moving on, even in the owner's own words, is a decision to proceed and never fills `owner-acceptance`: record the words under Concessions and decisions to proceed. Never write the old checkpoint codes in the review or the answer, even when quoting an older page (see [the vocabulary](vocabulary.md)).

## Blind review

A blind review is an independent check of a checkpoint that does not rely on the author's account.

- The reviewer has no context shared with the author. It is read-only and never the author.
- It is given only the checkpoint's criteria, the constraints due at the checkpoint and the raw evidence. It is never given the author's conclusions.
- It returns a verdict for each criterion, what it could not verify and anything that looks inconsistent.
- Its output is recorded in the checkpoint review's Independent review section as `reported` evidence. It never replaces `observed` evidence.
- It is offered to the owner at each checkpoint review. In an autonomous run it runs without asking.
- It replaces the outside-vendor second-opinion step. An outside opinion stays optional for a hard-to-reverse decision (see Evidence rules).
- How to start one depends on the host: see [the first host file](hosts/claude-code.md) and [the generic host file](hosts/generic.md). When the host cannot start one, record `blind-review: not-run` with the reason.

## Work loop

Every unit of work follows these steps in order. In a single-agent session the agent performs each role's step. A step is never skipped on the agent's own judgement. When a step's precondition is missing, advise, ask, proceed (see above). Steps 2, 3 and 6 are advisory: they report and then follow the owner's choice.

A routing row's Required output is the output of the first step its owner performs, not the end of the loop. A new idea (a request with no backlog item) ends at step 2 with the fit verdict: ask the owner whether to plan it. A request about an existing backlog item continues when the item is in the current sprint, or the owner asked for it to be built or sprinted, and steps 2 to 4 are done or the owner has chosen to proceed past them. Questions and reports (Course check, Status, What to do next, "Does it work, is it ready, performance", Anything else) end at their Required output and run step 8 only if they changed a document.

1. **Intake.** State the request in one line and match it to a row in [decision routing](decision-routing.md). A request to build or continue an existing backlog item has no row: it enters the loop at step 2. Any other request that matches no row is recorded as an open question and put to the owner.
2. **Fit check** (advisory). An item that only produces a document from the artifact catalog that the next checkpoint requires has a Fit line reading `fits - process document for <checkpoint slug>`, written by game-pm or by whoever runs adoption, and skips this step. Otherwise, if there is no brief at status `ready`, there are no pillars on record: advise first, before anything else in this step, and offer to write the brief. Otherwise, if the request has no backlog item, game-pm creates one; game-master writes only its fit-verdict line. In a single-agent session the agent may create the backlog item as game-pm (from the template, status `planned`, Fit line left to game-master's step) and must not edit the roadmap by hand (it is generated); then say the item is awaiting the owner's decision to plan it. A new item's Fit line reads `pending`, which is not a verdict (see [the backlog item rules](backlog-items.md)): game-pm asks game-master for it at the next planning pass, and the pass still plans the item. `fits` continues. For `does-not-fit`, tell the owner the verdict and the pillar or non-goal it breaks; if the owner says to build it anyway, that is an override: record it (see the artifact catalog) and as a decision to proceed. For `needs-pillar-change`, put the named pillar change to the owner; the pillar change is the owner's decision and is never recorded for them.
3. **Design readiness** (advisory). Every artifact listed under Design artifacts in the backlog item, and any other the work clearly needs, should be `ready`. For any that is not, advise and name the gap, and offer to write it first. The owner may raise the rigor tier at design readiness or at a checkpoint (by decision record), or tell you to proceed without the artifact (a decision to proceed).
4. **Sprint selection.** game-pm chooses items with a `fits` verdict, status `planned` (or `in-progress` to carry over), every `depends-on` entry `shipped` or `dropped`, and every Design artifact `ready` (step 3). An item the owner has chosen to proceed with despite a gap in these may be chosen too; its decision to proceed is on record.
5. **Build.** Do the work.
6. **Verify** (advisory). game-quality records `observed` evidence against the item and the checkpoint it supports. `reported` evidence is recorded as `reported` and never makes a criterion `met`. When verification cannot run, record the criterion as `not-assessed`.
7. **Accept.** game-master accepts against the pillars: the work serves the pillar in its Fit line, breaks no non-goal and matches its Expected evidence. If it strains a pillar or breaks a non-goal, game-master does not accept: it names which, leaves the item `in-progress` and tells the owner and game-pm. If game-quality has not recorded the acceptance evidence as `observed`, game-master advises that acceptance would rest on `reported` evidence and offers to verify first; if the owner accepts anyway, that is a decision to proceed and the evidence stays `reported`. On acceptance game-master tells game-pm, who sets `shipped`. At a checkpoint, the owner decides when to move on (see Phases and checkpoints).
8. **Update.** game-pm updates the state page and the backlog. The role that produced or verified an artifact supplies that artifact's registry row (status and Last verified). All of it happens in the same wiki operation as the work. Record the output (text, glossary entry, canon entry, evidence) in the project's wiki even when the wiki scripts cannot be run, by exact-path file edits, and say that validation was not run; never decline to record.

## Session rules

- **Start.** Read the state page. Check its Phase, Next step and Blocked by against the repository and the wiki. If the page is missing, a required field is empty, or the page is stale (see [the vocabulary](vocabulary.md)), say so and run studio-start before the request itself; then take the original request to Intake, unless running studio-start was itself the request. For a stale page studio-start records the contradiction as an open question and confirms the Next step with the owner. Then report in exactly three lines: `Phase: <phase>, tier: <tier>`; `Next step: <text>`; `Blocked by: <text or nothing>`. `Blocked by:` names any blocker the answer then states; never print `nothing` above a stated blocker.
- **End.** Run step 8 of the work loop before the session closes.

## Evidence rules

- A criterion is `met` only on `observed` evidence for every behavioral claim.
- Evidence names what was run, how, and the result, and links to the artifact (output, screenshot, receipt).
- An agent's own assessment is `reported`, never `observed`.
- A warm-up run may precede the evidence run only when it is declared before it starts. Record it with its own result and label it not evidence. The evidence run is one run at one named revision; a failure in it stays a failure, and no further run happens without the owner's decision.
- For a hard-to-reverse decision, offer to run the second-opinion skill the plugin map names, if it names one, with the owner's agreement, because it sends project content to another provider. Record its output as `reported` evidence: it never replaces `observed` evidence. The blind review (above) is separate and is offered at every checkpoint review.

## Change control

After Scope lock a change request names the cut that pays for it. game-pm writes it as a decision record that names the cut (or `none` with the owner's reason), game-master adds the fit ruling, and the agent asks the owner to name the cut and to approve. The request is written first and carries game-master's fit ruling. If the ruling is `does-not-fit` or `needs-pillar-change`, the request goes to the owner with that ruling, and nothing is built unless the owner approves or says to proceed, which is recorded as a decision to proceed. After Content lock the same applies to content. Changes to locked text, a locked asset or a signed-off contract make dependent sign-offs stale: set their registry status to `draft` and re-check them.

