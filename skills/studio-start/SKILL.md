---
name: studio-start
description: Entry point for any request about a game project: report phase, next step and blockers, route the request to the role that owns it, and bootstrap or adopt a project. Not for the role work itself: the role skills take over once a request is routed to them.
when_to_use: Use at the start of any session or request about a game project, including "continue", "resume" or "where were we", and any work request in a folder that looks like a game project (code, design documents, assets, an engine project file) even when no process is set up yet. Also for status, scope, plans, quality, art, text, tooling, a new idea, and technical questions about how to build, run, verify, structure or measure the project or which tool to use; when the state page is missing, stale or has an empty field; when asked "are we ready to ship", "has the checkpoint been reached" or "is it done"; when starting a new game project; or when adopting a repo that already has code, documents or agent setup.
---

# studio-start

Read [the process](../../references/process.md) and [the vocabulary](../../references/vocabulary.md) first; use closed values exactly. The process advises; the owner decides.

## 1. Find the state page

Find the wiki and the project slug in the order in [entry](../../references/entry.md#find-the-wiki). Open the State page at the path [the artifact catalog](../../references/artifact-catalog.md) gives.

## 2. Choose the case

| Condition | Case |
|---|---|
| The page is present, every required field is filled, and it is not stale | A: report |
| The page is present and a required field is empty | A: ask the owner for the missing value, fill it, then report |
| The page is present and stale | A: [refresh it](../../references/entry.md#refresh-a-stale-page) |
| The page is present and Phase is `adopt` | C: resume at the first adoption step whose result is missing |
| The page is absent; no source code, no documents beyond a README or licence, no agent configuration | B: bootstrap |
| The page is absent; anything else exists | C: adopt |

Stale is defined in the vocabulary. A required field is any heading in the state page template; a `<...>` slot is empty.

## Case A: report

Report in exactly three lines: `Phase: <phase>, tier: <tier>`; `Next step: <text>`; `Blocked by: <text or nothing>`. Blocked by names any blocker your answer then states; never print `nothing` above a stated blocker.

## Case B: bootstrap

1. Get the project slug (see entry) and ask the owner for the rigor tier. Offer `minimal`.
2. Create the state page from [its template](../../references/templates/state-page.md) (wiki authoring guidance: [the plugin map](../../references/plugin-map.md)) on game-pm's behalf: phase `concept`; the state page's own registry row `draft` and every other row of the chosen tier `absent`; Next step "Write the game brief and pillars (game-master)".
3. Name the instruction file the host reads ([host adapters](../../references/hosts/README.md)); if several, ask which is authoritative. Propose its block ([template](../../references/templates/instruction-block.md)) as a diff ([instruction files](../../references/instruction-files.md)).
4. Load game-master and follow its section 1 now. Do not write the brief from your own ideas.
5. Give the Case A report.

## Case C: adopt

Follow [adoption](../../references/adoption.md) step by step. Steps 7 and 8 belong to game-architect; the owning role writes a reconstructed document. Finish with the Case A report.

## Route the request

Applies after the Case A report (and after bootstrap or adoption, if the request was something else). The reply to every game-project request BEGINS with the three-line report and the Routed line, before any narration, even when work was done.

1. Read [decision routing](../../references/decision-routing.md) and pick the most specific row (its rule 1).
2. After the three-line report, add a fourth, separate line: `Routed: <request type> -> <owner>`, using the row's exact Request text and its Owner (for a status question: `Routed: Status -> game-pm`); see [the Routed line](../../references/entry.md#the-routed-line).
3. If the owner has a skill (game-master, game-architect, game-pm, game-quality), load it and follow it. Otherwise follow the row and the work loop in [the process](../../references/process.md), acting as that role. When the row names a Then party, name it in your reply and say what it does next.
4. A how to build, run, verify, structure or measure question, or a which-tool question: do the lookup and write the record BEFORE composing the answer, then answer in a few sentences ([look up guidance](../../references/entry.md#look-up-guidance)).
5. A request to review a checkpoint or move to the next phase: [review a checkpoint](../../references/entry.md#review-a-checkpoint).
6. A scope change after Scope lock: [scope change](../../references/entry.md#scope-change-after-scope-lock).

## When something is missing

No routing row matches: follow routing rule 2. A step's prerequisite is missing, or the owner says to skip a step: advise, ask, proceed, and record the decision to proceed ([the process](../../references/process.md#advise-ask-proceed)). No wiki tooling: do every step that needs no wiki and ask where the pages go ([entry](../../references/entry.md#find-the-wiki)).

## Rules that hold

1. `met` is written only with `observed` evidence; anything else is `reported` or `not-assessed`.
2. An owner acceptance, approval or confirmation the owner did not give is never recorded. A delegation proceeds with proposed values marked `proposed, owner review pending`.
3. An existing file is never renamed, overwritten or deleted without showing the change and getting a yes. A delegation such as "use your judgement" never approves an edit to an existing file or the removal of anything ([adoption](../../references/adoption.md#steps)).

## Where to go next

For craft or technology this plugin does not own (choosing an engine, building or running the game, measuring performance, testing, art, sound, text, launch readiness, documents), use [the plugin map](../../references/plugin-map.md#where-to-go-next): what to hand off to, what to bring, where to record the result.

## At the end of the session

If you did work or changed a document, update the state page, backlog and registry in the same wiki operation.
