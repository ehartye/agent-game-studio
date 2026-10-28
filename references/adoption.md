# Adoption

Use this when a project already exists: it has code, documents, a roadmap or agent tooling, and no state page. Never rename, overwrite or delete anything while adopting. Adoption records what exists; it does not tidy it. The only edit allowed to an existing file is the owner-approved lines of the instruction-file diff (step 7). Everything else you write is a new file. Existing project instructions still apply while adopting: if one conflicts with a step (for example, a folder it says not to touch), skip that step and record an open question. Values are in [the vocabulary](vocabulary.md); documents are in [the artifact catalog](artifact-catalog.md).

## Steps

1. **Inventory.** List what exists: the repository layout, the wiki pages for the project, the roadmap or task list, the tests, and the agent configuration (instruction files, project skills, plugins, tool servers, automation, permissions; where each lives for the host is in [the host adapters](hosts/README.md)). Read each document that might serve as a catalog artifact. Do not change anything. Do not copy secret values into any note.
2. **Tier and state page.** Propose a rigor tier (offer `minimal`); the owner confirms it. Create the state page from [its template](templates/state-page.md) as a new file, with phase `adopt`. You write this first version on game-pm's behalf.
3. **Map.** For each artifact in the confirmed tier, set its status to `ready`, `draft`, `absent`, `reconstructed` or `conflicting`, and record its existing path in the registry (a path outside the wiki folder is written from the project root). Adopt existing files in place, whatever they are called. A document that serves a catalog artifact but lives elsewhere keeps its location; the registry records the path. An existing file that does not meet its ready definition is `draft`, not `reconstructed`.
4. **Reconstruct.** A reconstructed document is a new file at its catalog path. Never add the label to, or otherwise change, an existing file. Put the label from the artifact catalog on the first line after its title heading, and name the existing files it draws from. Only a document you wrote is `reconstructed`. Reconstruct only content that comes from code, history or existing documents and that the next checkpoint or the owner's request needs; every other gap goes to step 6. For intent that cannot be recovered (the pillars, the player experience, the reasons for past choices) ask the owner. Never fill a gap with plausible text.
5. **Place.** Propose a phase from the evidence in the table below. Placement passes no checkpoint. Present the registry, the phase and the tier to the owner. The phase leaves `adopt` only when the owner confirms them; then set Last checkpoint result to `none - registry reviewed by the owner <YYYY-MM-DD>`. Never record an owner review, confirmation or acceptance the owner did not give. A delegation ("use your judgement") lets you proceed with the proposed values for new pages, recorded as `proposed, owner review pending`; the Phase stays `adopt` until the owner confirms. A delegation such as "use your judgement" never approves an edit to an existing file or the removal of anything; instruction-file lines are applied only after the owner says which lines (or "all") in words, and until then show the diff and wait. A delegation lets you proceed with proposed values for NEW pages (state page, backlog items, audit note) only.
6. **Gaps.** Turn each missing or draft artifact the next checkpoint needs into a backlog item whose Fit line reads `fits - process document for <checkpoint>`, and make the first one the state page's Next step. Import tasks from an existing tracker only when the owner asks.
7. **Instruction block.** Propose the process block from [its template](templates/instruction-block.md) as a diff against the project's agent instruction file(s). Show it in full: show the diff itself in the reply; a summary of what would be added does not count. Apply only the lines the owner approves, and only after the owner says which lines (or "all") in words: a delegation such as "use your judgement" never approves an edit to an existing file or the removal of anything (step 5). If several instruction files exist, say where they disagree. Where an existing instruction contradicts the process (for example, a separate task tracker), report it here; do not edit it. Also propose the project binding: a `repo:` line holding the repository's `origin` remote URL in the frontmatter of the project's wiki overview page, so the wiki tooling's session brief finds the project from the repository (see [the plugin map](plugin-map.md#finding-the-wiki-vault)). It edits an existing page: show the exact line and apply it only after the owner approves it in words.
8. **Tooling audit.** Run [the tooling audit](tooling-audit.md) as a proposal only. Applying an approved audit is a separate task after adoption ends.
9. **Constraints.** Find every constraint the project states anywhere: the brief, design documents, the roadmap, the README, store or platform notes, the owner's recorded words and the agent instruction files. A constraint is a measurable requirement the game must meet that is not a pillar or a non-goal: a performance target on named hardware, a platform, a size, a legal limit. Propose the whole constraints page in one pass, as a new file at `reference/constraints.md` from [its template](templates/constraints.md), with one row per constraint. Name the source (document and date) of every row and mark any row with no source. Set each Status to `not-yet-measured` unless the project already holds a check that you ran or saw run, and say how each would be checked. Ask the owner once for corrections. Only the owner approves, changes, concedes or removes a row; until the owner answers, the page is `proposed, owner review pending`.

## Phase placement

| Evidence | Propose |
|---|---|
| No approved brief and nothing playable | concept |
| Something playable, no approved brief | concept (Brief approved is open) |
| An approved brief, nothing playable yet | pre-production |
| A playable slice exists and features are still being built | production |
| Nothing new is being planned and content is being finished | beta |
| A release candidate exists | release |
| It has shipped and is receiving patches | live |

Playable means you ran it or the owner showed it; a statement alone is `reported`. The owner confirms the phase regardless. When the evidence points two ways, propose the earlier phase and say why.

## A project with a long history and no brief

A project with a long history (many finished phases, design pages, a feature ledger, rules the owner has written down) still starts at `concept` when it has no approved brief, because Brief approved is open. Do not draft the brief over several rounds of questions. Propose the whole brief in one pass, built only from the owner's recorded words and the project's own documents: the player experience in one sentence, three to five pillars each saying what it means and rules out, and numbered non-goals. Mark every line as a proposal, name its source, and mark any line with no source. Ask the owner once for corrections, then for the approval date. The owner's approval date is the owner acceptance of Brief approved.

## Rules that hold

1. **Evidence.** `met` is written only with `observed` evidence. Anything else is `reported` or `not-assessed`.
2. **Owner words.** An owner acceptance, approval or confirmation the owner did not give is never recorded. A delegation proceeds with proposed values marked `proposed, owner review pending`.
3. **Never rename, overwrite or delete.** An existing file is never renamed, overwritten or deleted without showing the change and getting a yes. If something is in the way, record it as an open question.

## Also

- **Label reconstructed work.** The first line after the title heading of a reconstructed document says it was reconstructed and from what. An existing file is never labelled.
- **Record conflicts.** When two sources disagree, set `conflicting` and record an open question; when it is resolved, record a decision record.
- **Finish by updating the state page** with the phase, tier, registry, constraints, open questions and next step.
