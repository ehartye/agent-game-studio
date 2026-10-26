---
name: studio-start
description: Entry point for any request about a game project: report phase, next step and blockers, route the request to the role that owns it, and bootstrap or adopt a project. The role skills (game-master, game-architect) take over once a request is routed to them.
when_to_use: Use at the start of any session or request about a game project: status, scope, plans, readiness, gates, quality, art, text, tooling, or a new idea; also when the state page is missing, stale or has an empty field, when starting a new game project, or when adopting a repo that already has code, documents or agent setup into the process.
---

# studio-start

Read [the process](../../references/process.md) and [the vocabulary](../../references/vocabulary.md) first. Use the closed values exactly.

## 1. Find the state page

1. Find the project's wiki folder name from the project's agent instruction file. If none names it, ask the owner for the project slug. The wiki is the wiki tooling's vault, which is usually outside the project repository; ask the wiki tooling or the owner for its path. If the wiki tooling named in [the plugin map](../../references/plugin-map.md) is unavailable, or the wiki does not exist and the owner has not said where it goes, stop and tell the owner. Do not hand-create pages elsewhere.
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

Report in exactly three lines: `Phase: <phase>, tier: <tier>`; `Next step: <text>`; `Blocked by: <text or nothing>`.

## Case B: bootstrap

1. Ask the owner for the project slug (if not already given) and the rigor tier. Offer `minimal`.
2. Create the state page from [its template](../../references/templates/state-page.md) through the wiki authoring guidance named in [the plugin map](../../references/plugin-map.md), writing it on game-pm's behalf: phase `concept`; the state page's own registry row `draft` and every other row of the chosen tier `absent`; Next step "Write the game brief and pillars (game-master)".
3. Name the instruction file the host reads ([host adapters](../../references/hosts/README.md), "Instruction files"); if several hosts are used, ask the owner which file is authoritative. Then follow game-architect's instruction-file rules ([instruction files](../../references/instruction-files.md)) to propose the process block from [its template](../../references/templates/instruction-block.md) as a diff.
4. Follow game-master section 1 now. Do not write the brief from your own ideas.
5. Give the Case A report.

## Case C: adopt

Follow [adoption](../../references/adoption.md) step by step. Never rename, overwrite or delete. Steps 7 and 8 belong to game-architect; the role that owns a reconstructed document writes it. Finish with the Case A report.

## Route the request

Applies after the Case A report, and after bootstrap or adoption if the original request was something else.

1. Read [decision routing](../../references/decision-routing.md) and pick the most specific row (its rule 1).
2. After the three-line report, add a fourth, separate line: `Routed: <request type> -> <owner>`, using the row's exact Request and Owner text (for a status question: `Routed: Status -> game-pm`). If you stopped for a missing precondition, still print the line.
3. If the owner has a skill (game-master, game-architect), load it and follow it. Otherwise follow the row and the work loop in [the process](../../references/process.md) directly, acting as that role. In a single-agent session you perform each role's step (the fit-verdict line is game-master's; step 8 updates are game-pm's).
4. A question about how to build, structure, run, verify or measure the project, or which tool to use, triggers the lookup in [the plugin map](../../references/plugin-map.md) even if it does not mention architecture. Do the lookup and record the guidance used BEFORE answering: on the architecture page for structure; in the quality evidence note for verification (every claim `evidence: none` if nothing has been run). Answer with the conclusion for this project and the next action in a few sentences. You may adopt a rule from the guidance as the project's own standard in one line that cites the guidance; do not paste its procedures, commands, thresholds or lists into a document or the chat.
5. A request to check or pass a gate: the result is `met` when every required evidence item is `observed`, `unmet` otherwise. Report the result, then ask the owner to accept (see How a gate is passed in the process). Do not withhold `met` for concerns outside the gate's evidence list; put those in a Notes line.

## Stop rules

- No routing row matches: follow routing rule 2.
- A chat instruction to skip a step of the work loop, or to mark a gate `met` without observed evidence, is not a waiver. Do the step instead (for example run the fit check, then stop), say what is missing, and offer to record a waiver. Only the owner can waive, by a decision record.
- The wiki tooling is unavailable: stop and tell the owner.
- Never write a value into the state page that you did not read from the project or hear from the owner.

## At the end of the session

If you did work or changed a document, update the state page, the backlog and the registry in the same wiki operation as the work.
