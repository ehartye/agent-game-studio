# Adoption

Use this when a project already exists: it has code, documents, a roadmap or agent tooling, and no state page. Never rename, overwrite or delete anything while adopting. Adoption records what exists; it does not tidy it. The only edit allowed to an existing file is the owner-approved lines of the instruction-file diff (step 7). Everything else you write is a new file. Existing project instructions still apply while adopting: if one conflicts with a step (for example, a folder it says not to touch), skip that step and record an open question. Values are in [the vocabulary](vocabulary.md); documents are in [the artifact catalog](artifact-catalog.md).

## Steps

1. **Inventory.** List what exists: the repository layout, the wiki pages for the project, the roadmap or task list, the tests, and the agent configuration (instruction files, project skills, plugins, tool servers, automation, permissions; where each lives for the host is in [the host adapters](hosts/README.md)). Read each document that might serve as a catalog artifact. Do not change anything. Do not copy secret values into any note.
2. **Tier and state page.** Propose a rigor tier (offer `minimal`); the owner confirms it. Create the state page from [its template](templates/state-page.md) as a new file, with phase `adopt`. You write this first version on game-pm's behalf.
3. **Map.** For each artifact in the confirmed tier, set its status to `ready`, `draft`, `absent`, `reconstructed` or `conflicting`, and record its existing path in the registry (a path outside the wiki folder is written from the project root). Adopt existing files in place, whatever they are called. A document that serves a catalog artifact but lives elsewhere keeps its location; the registry records the path. An existing file that does not meet its ready definition is `draft`, not `reconstructed`.
4. **Reconstruct.** A reconstructed document is a new file at its catalog path. Never add the label to, or otherwise change, an existing file. Put the label from the artifact catalog on the first line after its title heading, and name the existing files it draws from. Only a document you wrote is `reconstructed`. Reconstruct only content that comes from code, history or existing documents and that the next gate or the owner's request needs; every other gap goes to step 6. For intent that cannot be recovered (the pillars, the player experience, the reasons for past choices) ask the owner. Never fill a gap with plausible text.
5. **Place.** Propose a phase from the evidence in the table below. Placement passes no gate. Present the registry, the phase and the tier to the owner. The phase leaves `adopt` only when the owner confirms them; then set Last gate result to `none - registry reviewed by the owner <YYYY-MM-DD>`. Never record an owner review, confirmation or acceptance the owner did not give. A delegation ("use your judgement") lets you proceed with the proposed values for new pages, recorded as `proposed, owner review pending`; the Phase stays `adopt` until the owner confirms. A delegation such as "use your judgement" never approves an edit to an existing file or the removal of anything; instruction-file lines are applied only after the owner says which lines (or "all") in words, and until then show the diff and wait. A delegation lets you proceed with proposed values for NEW pages (state page, backlog items, audit note) only.
6. **Gaps.** Turn each missing or draft artifact the next gate needs into a backlog item whose Fit line reads `fits - process document for <gate>`, and make the first one the state page's Next step. Import tasks from an existing tracker only when the owner asks.
7. **Instruction block.** Propose the process block from [its template](templates/instruction-block.md) as a diff against the project's agent instruction file(s). Show it in full: show the diff itself in the reply; a summary of what would be added does not count. Apply only the lines the owner approves, and only after the owner says which lines (or "all") in words: a delegation such as "use your judgement" never approves an edit to an existing file or the removal of anything (step 5). If several instruction files exist, say where they disagree. Where an existing instruction contradicts the process (for example, a separate task tracker), report it here; do not edit it.
8. **Tooling audit.** Run [the tooling audit](tooling-audit.md) as a proposal only. Applying an approved audit is a separate task after adoption ends.

## Phase placement

| Evidence | Propose |
|---|---|
| No approved brief and nothing playable | concept |
| Something playable, no approved brief | concept (G1 is unmet) |
| An approved brief, nothing playable yet | pre-production |
| A playable slice exists and features are still being built | production |
| Nothing new is being planned and content is being finished | beta |
| A release candidate exists | release |
| It has shipped and is receiving patches | live |

Playable means you ran it or the owner showed it; a statement alone is `reported`. The owner confirms the phase regardless. When the evidence points two ways, propose the earlier phase and say why.

## Rules

- **No renames, overwrites or deletions.** If something is in the way, record it as an open question.
- **Label reconstructed work.** The first line after the title heading of a reconstructed document says it was reconstructed and from what. An existing file is never labelled.
- **Record conflicts.** When two sources disagree, set `conflicting` and record an open question; when it is resolved, record a decision record.
- **Finish by updating the state page** with the phase, tier, registry, open questions and next step.
