---
name: studio-start
description: Entry point for any request about a game project: report phase, next step and blockers, route the request to the role that owns it, and bootstrap or adopt a project. Not for the role work itself: game-master and game-architect take over once a request is routed to them.
when_to_use: Use at the start of any session or request about a game project, including "continue", "resume" or "where were we", and any work request in a folder that looks like a game project (code, design documents, assets, an engine project file) even when no process is set up yet. Also for status, scope, plans, readiness, gates, quality, art, text, tooling, a new idea, and technical questions about how to build, run, verify, structure or measure the project or which tool to use; when the state page is missing, stale or has an empty field; when starting a new game project; or when adopting a repo that already has code, documents or agent setup.
---

# studio-start

Read [the process](../../references/process.md) and [the vocabulary](../../references/vocabulary.md) first. Use the closed values exactly.

## 1. Find the state page

1. Find the wiki and the project slug in the order in [entry](../../references/entry.md#find-the-wiki).
2. Open the State page at the path [the artifact catalog](../../references/artifact-catalog.md) gives, in the project's wiki folder.

## 2. Choose the case

| Condition | Case |
|---|---|
| The page is present, every required field is filled, and it is not stale | A: report |
| The page is present and a required field is empty | A: ask the owner for the missing value, fill it, then report |
| The page is present and stale | A: refresh the page (steps below) |
| The page is present and Phase is `adopt` | C: resume at the first adoption step whose result is missing |
| The page is absent; the project has no source code, no documents beyond a README or licence, and no agent configuration | B: bootstrap |
| The page is absent; anything else exists | C: adopt |

Refresh: 1. Record the contradiction as an open question. 2. Confirm Next step and Blocked by with the owner; update only those. 3. Set the question answered. 4. Report. Change Phase only through a gate result or an adoption placement. If Phase itself is contradicted, leave it and ask the owner whether to re-place it (adoption step 5).

Stale is defined in the vocabulary. A required field is any heading in the state page template; a field holding a `<...>` slot is empty.

## Case A: report

Report in exactly three lines: `Phase: <phase>, tier: <tier>`; `Next step: <text>`; `Blocked by: <text or nothing>`. Blocked by names any blocker your answer then states; never print `nothing` above a stated blocker.

## Case B: bootstrap

1. Get the project slug (see entry) and ask the owner for the rigor tier. Offer `minimal`.
2. Create the state page from [its template](../../references/templates/state-page.md) through the wiki authoring guidance in [the plugin map](../../references/plugin-map.md), writing it on game-pm's behalf: phase `concept`; the state page's own registry row `draft` and every other row of the chosen tier `absent`; Next step "Write the game brief and pillars (game-master)".
3. Name the instruction file the host reads ([host adapters](../../references/hosts/README.md), "Instruction files"); if several hosts are used, ask the owner which file is authoritative. Then follow game-architect's instruction-file rules ([instruction files](../../references/instruction-files.md)) to propose the process block from [its template](../../references/templates/instruction-block.md) as a diff.
4. Follow game-master section 1 now. Do not write the brief from your own ideas.
5. Give the Case A report.

## Case C: adopt

Follow [adoption](../../references/adoption.md) step by step. Never rename, overwrite or delete. Steps 7 and 8 belong to game-architect; the role that owns a reconstructed document writes it. Finish with the Case A report.

## Route the request

Applies after the Case A report, and after bootstrap or adoption if the original request was something else.

1. Read [decision routing](../../references/decision-routing.md) and pick the most specific row (its rule 1).
2. After the three-line report, add a fourth, separate line: `Routed: <request type> -> <owner>`, using the row's exact Request and Owner text (for a status question: `Routed: Status -> game-pm`). If you stopped for a missing precondition, still print the line.
3. If the owner has a skill (game-master, game-architect), load it and follow it. Otherwise follow the row and the work loop in [the process](../../references/process.md), acting as that role; in a single-agent session you perform each role's step (the fit-verdict line is game-master's; step 8 updates are game-pm's).
4. A how to build, run, verify, structure or measure question, or a which-tool question: do the lookup and write the record BEFORE composing the answer, then answer in a few sentences ([look up guidance](../../references/entry.md#look-up-guidance)).
5. A request to check or pass a gate: [check or pass a gate](../../references/entry.md#check-or-pass-a-gate).
6. A scope change after G3: [scope change](../../references/entry.md#scope-change-after-g3).

## Stop rules

- No routing row matches: follow routing rule 2.
- A chat instruction to skip a step of the work loop, or to mark a gate `met` without observed evidence, is not a waiver. Do the step instead (for example run the fit check, then stop), say what is missing, and offer to record a waiver. Only the owner can waive, by a decision record.
- No wiki tooling: do every step that needs no wiki and ask the owner where the pages go ([entry](../../references/entry.md#find-the-wiki)).
- Never write a value into the state page that you did not read from the project or hear from the owner.

## At the end of the session

If you did work or changed a document, update the state page, the backlog and the registry in the same wiki operation as the work.
