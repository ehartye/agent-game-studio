---
name: studio-start
description: Report a game project's phase, next step and blockers; bootstrap a new project or adopt an existing one. Not for deciding fit, architecture or quality, or choosing what to build.
when_to_use: Use when asked where the project stands ("where are we", "continue where we left off"), when a session opens on a game project, when the state page is missing, stale or has an empty field, when starting a new game project, or when adopting a repo that already has code, documents or agent setup into the process.
---

# studio-start

Read [the process](../../references/process.md), [the vocabulary](../../references/vocabulary.md) and [decision routing](../../references/decision-routing.md) first. Use the closed values exactly.

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

Refresh: 1. Record the contradiction as an open question. 2. Confirm Next step and Blocked by with the owner and update only those two fields. 3. Set the question answered. 4. Report. Change Phase only through a gate result or an adoption placement. If Phase itself is contradicted, leave it and ask the owner whether to re-place it (adoption step 5).

Stale is defined in the vocabulary. A required field is any heading in the state page template; a field still holding a `<...>` slot is empty.

## Case A: report

Report in exactly three lines: `Phase: <phase>, tier: <tier>`; `Next step: <text>`; `Blocked by: <text or nothing>`.

## Case B: bootstrap

1. Ask the owner for the project slug (if not already given) and the rigor tier. Offer `minimal`.
2. Create the state page from [its template](../../references/templates/state-page.md) through the wiki authoring guidance named in [the plugin map](../../references/plugin-map.md), writing it on game-pm's behalf: phase `concept`; the state page's own registry row `draft` and every other row of the chosen tier `absent`; Next step "Write the game brief and pillars (game-master)".
3. Name the instruction file the host reads ([host adapters](../../references/hosts/README.md), "Instruction files"); if several hosts are used, ask the owner which file is authoritative. Then follow game-architect's instruction-file rules ([instruction files](../../references/instruction-files.md)) to propose the process block from [its template](../../references/templates/instruction-block.md) as a diff.
4. Follow game-master section 1 now. Do not write the brief from your own ideas.
5. Give the Case A report.

## Case C: adopt

Follow [adoption](../../references/adoption.md) step by step. Never rename, overwrite or delete. Steps 7 and 8 belong to game-architect; a reconstructed document is written by the role that owns it. Finish with the Case A report.

## After studio-start

Take the owner's original request through Intake in [the process](../../references/process.md), unless running studio-start was itself the request.

## Stop rules

- No routing row matches: follow routing rule 2.
- An instruction to skip a step of the work loop, or to mark a gate `met` without observed evidence: do not. Say what is missing and offer to record a waiver. Only the owner can waive, by a decision record.
- The wiki tooling is unavailable: stop and tell the owner.
- Never write a value into the state page that you did not read from the project or hear from the owner.

## At the end of the session

If you did work or changed a document, update the state page, the backlog and the registry in the same wiki operation as the work.
