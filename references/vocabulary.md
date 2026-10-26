# Vocabulary

Closed value sets. Use these values exactly, in this spelling. A value that is not listed here is wrong: record an open question instead of inventing one.

## Sets

| Set | Values | Used by |
|---|---|---|
| Artifact status | ready, draft, absent, reconstructed, conflicting | Artifact registry on the state page |
| Backlog status | planned, in-progress, shipped, blocked, dropped | Backlog items |
| Art stage | brief, reference-approved, draft, craft-review, isolated-signoff, integrated, in-context-signoff, locked, not-applicable | Backlog items (Art stage section) |
| Fit verdict | fits, does-not-fit, needs-pillar-change | Backlog items |
| Gate | G1, G2, G3, G4, G5, none | Open questions ("Must be answered by"), last gate result, backlog items (Target gate) |
| Gate result | met, unmet, waived | State page, gate checks |
| Evidence | observed, reported, none | Gate checks, quality evidence |
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
- `fits`: the item serves at least one pillar and breaks no non-goal. An item that only produces a document from the artifact catalog that the next gate requires is `fits` without a pillar (process, work loop step 2).
- `does-not-fit`: the item breaks a non-goal, or no pillar needs it. This is the default for any conflict.
- `needs-pillar-change`: use it only when you can name the specific pillar or non-goal edit that would make the item fit. The edit is the owner's decision.

**Gate result**
- `met`: every required evidence item is present and, for each behavioral claim, `observed`.
- `unmet`: at least one requirement is not satisfied. Its evidence is missing, is `reported` or `none` where `observed` is required, or shows the requirement failing (for example an open critical defect).
- `waived`: the owner chose to pass without one or more required evidence items. A decision record names who waived it and why.

**Evidence**
- `observed`: produced by running or inspecting the real thing (a run, a screenshot, test output, a build receipt) and linked.
- `reported`: stated by a person or an agent without a run.
- `none`: nothing was provided.
- A behavioral claim is any claim about what the running game does: it runs, plays through, stays within a frame budget, has no critical defect. A gate accepts only `observed` evidence for a behavioral claim. A claim about a document (the brief has non-goals) is satisfied by that document being `ready`, not by an observed run.

**Audit outcome.** The five outcomes are defined in [the tooling audit](tooling-audit.md).

**Audit owner decision.** `approved`: apply the proposal as written. `approved with changes`: apply it with the edits the owner's notes record. `declined`: change nothing.

**Claim basis.** How a claim in a decision record was established. `tested here` counts as `observed` evidence; `documented` (name the source) and `general knowledge` count as `reported`.

**Defect severity.** `critical` is a Critical defect (see Gate terms); `other` is any open defect that is not critical.

**Unknown.** "Unknown" is not a status. When something is not known, record an open question with an owner and the gate by which it must be answered (`none` if no gate depends on it). If the unknown is a precondition of the current step, stop. Otherwise continue only with work that does not depend on the answer.

**Verified this session.** The agent read the artifact in the current session and checked it against the repository or the owner's statement. Update the Last verified date only then.

**Stale.** A state page is stale when its phase, next step or blockers disagree with the repository or with what the owner says.

## Gate terms

- **Sprint:** the backlog items game-pm lists under Current sprint on the state page. game-pm chooses its size and closes it when each item is `shipped`, `blocked` or back to `planned`.
- **Feature complete:** every backlog item is `shipped` or `dropped`.
- **Critical defect:** a defect classed critical in the quality evidence note. At standard tier and above, classes come from the severity scale in the test strategy.
- **Production plan:** the roadmap and the backlog items for the next gate, produced by the planning pass.
- **Cut:** a named backlog item, or a named part of one, that is set `dropped` if the change is approved.
- **Stale sign-off:** a sign-off made against a contract or version that has since changed. Set the registry status to `draft` and re-check it.
- **Locked:** fixed by a gate or stage. After G3 (scope) or G4 (content) a change needs a change request. Before then a change is allowed but makes dependent sign-offs stale.
