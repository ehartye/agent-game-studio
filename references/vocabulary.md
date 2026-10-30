# Vocabulary

Closed value sets. Use these values exactly, in this spelling. A value that is not listed here is wrong: record an open question instead of inventing one.

Checkpoints are named by their slugs. An older page may name them G1 to G5; read those as brief-approved, vertical-slice, scope-lock, content-lock and ship, in that order. Never write the codes. That holds in an answer and in any page or file you write, including when quoting the older page (say "the older page's last result"); cite an existing file's path as it is and do not rename it.

## Sets

| Set | Values | Used by |
|---|---|---|
| Artifact status | ready, draft, absent, reconstructed, conflicting | Artifact registry on the state page |
| Backlog status | planned, in-progress, shipped, blocked, dropped | Backlog items |
| Art stage | brief, reference-approved, draft, craft-review, isolated-signoff, integrated, in-context-signoff, locked, not-applicable | Backlog items (Art stage section) |
| Fit verdict | fits, does-not-fit, needs-pillar-change, pending | Backlog items |
| Checkpoint | brief-approved, vertical-slice, scope-lock, content-lock, ship, none | Open questions ("Must be answered by"), last checkpoint reviewed, backlog items (Target checkpoint), constraints ("Matters at") |
| Criterion status | met, not-met, not-assessed | Checkpoint reviews |
| Checkpoint standing | open, reviewed, reviewed-with-concessions | State page, checkpoint reviews |
| Blind review | done, declined, not-run | Checkpoint reviews |
| Constraint status | not-yet-measured, at-risk, met, conceded, unmet | Constraints page |
| Evidence | observed, reported, none | Checkpoint reviews, quality evidence |
| Rigor tier | minimal, standard, full | State page |
| Phase | adopt, concept, pre-production, production, beta, release, live | State page |
| Decision status | proposed, accepted, superseded, deprecated | Decision records |
| Open question status | open, answered, dropped | State page |
| Audit outcome | remove, replace-with-reference, merge, convert, ask-owner | Tooling audit candidates |
| Claim basis | tested here, documented, general knowledge | Decision records (Evidence section) |
| Defect severity | critical, other | Quality evidence (Defects open) |
| Audit owner decision | approved, approved with changes, declined | Tooling audit records |

## Definitions

**Artifact status**
- `ready`: the artifact meets the "Ready means" definition for its row in [the artifact catalog](artifact-catalog.md), its Last verified date is set, and nothing recorded since conflicts with it.
- `draft`: the artifact exists but does not yet meet its ready definition.
- `absent`: the artifact does not exist.
- `reconstructed`: the artifact was written after the fact from code, history or the owner's account. The first line after its title heading says so. It becomes `ready` only when the owner confirms it.
- `conflicting`: two sources disagree about the artifact's content. Record an open question until the disagreement is resolved, then a decision record.

**Backlog status**
- `planned`: not yet chosen for a sprint.
- `in-progress`: chosen for a sprint and being built.
- `shipped`: steps 6 and 7 of the work loop are complete for the item.
- `blocked`: stopped for a reason other than `depends-on`. The item records the reason. For a `needs-pillar-change` verdict the reason is the pillar change awaiting the owner. Anyone may set it by recording the reason.
- `dropped`: abandoned by a decision, or by a `does-not-fit` verdict the owner has accepted. Until then the item stays `planned`. The item says why.
- An unmet `depends-on` entry never changes the status; it only prevents sprint selection. A prerequisite is met when it is `shipped` or `dropped`.

**Art stage.** The eight stages listed in [the planning reference](planning.md), written exactly as in the table above. `not-applicable` is for an item with no art.

**Fit verdict**
- `fits`: the item serves at least one pillar and breaks no non-goal. An item that only produces a document from the artifact catalog that the next checkpoint requires is `fits` without a pillar (process, work loop step 2).
- `does-not-fit`: the item breaks a non-goal, or no pillar needs it. This is the default for any conflict.
- `needs-pillar-change`: use it only when you can name the specific pillar or non-goal edit that would make the item fit. The edit is the owner's decision.
- `pending`: game-master has not yet given a verdict. game-pm writes it as `Fit: pending - <why there is no verdict yet> - <YYYY-MM-DD>` when it creates an item, and game-master replaces it. It is not a verdict and never counts as `fits` (see [the backlog item rules](backlog-items.md)).

**Checkpoint.** A review at the end of a phase, with named criteria (see Phases and checkpoints in [the process](process.md)). It advises; it never blocks work. `none` means no checkpoint applies.

**Criterion status.** Set for each criterion of a checkpoint.
- `met`: the criterion's evidence is present and, for each behavioral claim, `observed`. A criterion about a document is `met` when that document is `ready`.
- `not-met`: the criterion was assessed and fails. Its document is absent, or `observed` evidence shows it failing (for example an open critical defect).
- `not-assessed`: nothing `observed` exists for it yet. It was not measured, or its only evidence is `reported` or `none`. It never counts as `met`.

**Checkpoint standing.** Set for the whole review.
- `open`: the review is not done, or the owner has not seen it. This is the default.
- `reviewed`: the review is recorded and shown to the owner, every criterion is `met`, and there is no concession.
- `reviewed-with-concessions`: the review is recorded and shown to the owner, and at least one criterion is `not-met` or `not-assessed`, or a concession is recorded.

**Concession.** Something weaker than required or skipped that the project goes on without: a criterion that is `not-met` or `not-assessed`, a constraint with status `conceded`, or a step the owner chose to skip. Record what, why, the owner's words, the date and when it is revisited. Only the owner concedes; an agent never records a concession as accepted on the owner's behalf.

**Decision to proceed.** The owner's reply, after the agent advised of a missing prerequisite and its risk, saying to do the work anyway. Record the choice and the date on the state page, or in the checkpoint review when the step belongs to a checkpoint. See Advise, ask, proceed in [the process](process.md).

**Blind review.** An independent, read-only check of a checkpoint by a reviewer with no shared context. Defined in [the process](process.md). `done`: it ran. `declined`: the owner declined it. `not-run`: it did not run, with the reason recorded.

**Constraint status.** A constraint is a measurable requirement that is not a pillar or non-goal. `not-yet-measured`: no check has run. `at-risk`: a check or other evidence suggests it may fail. `met`: the check ran and passed, with raw output kept as `observed` evidence. `conceded`: the owner accepted not meeting it, with a recorded concession. `unmet`: the check ran and failed, with no concession.

**Evidence**
- `observed`: produced by running or inspecting the real thing (a run, a screenshot, test output, a build receipt) and linked.
- `reported`: stated by a person or an agent without a run.
- `none`: nothing was provided.
- A behavioral claim is any claim about what the running game does: it runs, plays through, stays within a frame budget, has no critical defect. A criterion is `met` only on `observed` evidence for a behavioral claim. A claim about a document (the brief has non-goals) is satisfied by that document being `ready`, not by an observed run.

**Audit outcome.** The five outcomes are defined in [the tooling audit](tooling-audit.md).

**Audit owner decision.** `approved`: apply the proposal as written. `approved with changes`: apply it with the edits the owner's notes record. `declined`: change nothing.

**Claim basis.** How a claim in a decision record was established. `tested here` counts as `observed` evidence; `documented` (name the source) and `general knowledge` count as `reported`.

**Defect severity.** `critical` is a Critical defect (see Checkpoint terms); `other` is any open defect that is not critical.

**Unknown.** "Unknown" is not a status. When something is not known, record an open question with an owner and the checkpoint by which it should be answered (`none` if no checkpoint depends on it). If the unknown is a precondition of the current step, advise, ask, proceed (see [the process](process.md)). Otherwise continue with work that does not depend on the answer.

**Verified this session.** The agent read the artifact in the current session and checked it against the repository or the owner's statement. Update the Last verified date only then.

**Stale.** A state page is stale when its phase, next step or blockers disagree with the repository or with what the owner says.

## Checkpoint terms

- **Sprint:** the backlog items game-pm lists under Current sprint on the state page. game-pm chooses its size and closes it when each item is `shipped`, `blocked` or back to `planned`.
- **Feature complete:** every backlog item is `shipped` or `dropped`.
- **Critical defect:** a defect classed critical in the quality evidence note. At standard tier and above, classes come from the severity scale in the test strategy. At the minimal tier game-quality proposes the class and the owner can change it: a failing step of the project's declared delivery checks is `critical` until the owner says otherwise, and the note says the class is a proposal.
- **Production plan:** the roadmap and the backlog items for the next checkpoint, produced by the planning pass.
- **Cut:** a named backlog item, or a named part of one, that is set `dropped` if the change is approved.
- **Stale sign-off:** a sign-off made against a contract or version that has since changed. Set the registry status to `draft` and re-check it.
- **Locked:** fixed by a checkpoint or stage. After Scope lock (scope) or Content lock (content) a change needs a change request. Before then a change is allowed but makes dependent sign-offs stale.
