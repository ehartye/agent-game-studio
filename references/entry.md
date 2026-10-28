# Entry

Detail for the studio-start skill: where the wiki is, how to answer a how-to question, how a checkpoint review and a scope change after Scope lock start. Values are in [the vocabulary](vocabulary.md); the sequence is in [the process](process.md).

## Find the wiki

Find the project's slug and its state page path in the agent instruction file. When no instruction file names the project, run the wiki tooling's session brief from the project's repository, as [the plugin map](plugin-map.md#finding-the-wiki-vault) says: when it names the project, use that slug and folder, and its three lines are the report. When it says no project is bound, or the tooling has no session brief, use the project folder name. When the owner says to use your judgement, state the assumption (slug = the project folder name) and continue; do not ask again. Then look in this order:

1. `wiki/authored/<slug>/` in the project root.
2. The vault of the wiki tooling named in [the plugin map](plugin-map.md), found as the plugin map says. If the vault has no folder for the project, bootstrap or adoption creates it there.
3. No wiki tooling at all: still do every step that needs no wiki (the inventory, the registry and state page content as a chat proposal, the instruction-file diff, the tooling audit proposal, the hand-over to game-master) and ask the owner where to store the pages.

Never hand-create wiki pages outside the wiki found by 1 or 2.

## The Routed line

The request type is the routing row's exact Request text and the owner is that row's Owner; never invent a row name. If no row fits, print `Routed: Anything else -> none`. Two cases of starting a project, fixed here:

- Adopting a repo that already has code, documents or agent setup: `Routed: Joining an existing project -> studio-start`.
- Bootstrapping an empty folder: `Routed: Anything else -> none`, then run Case B (bootstrap) in place of the row's open question.

## Look up guidance

A question about how to build, run, verify, structure or measure the project, or which tool to use, needs the lookup in [the plugin map](plugin-map.md) even if it does not mention architecture. The record comes first:

1. Do the lookup. If it names no usable guidance, use the fallback chain there.
2. Write the record BEFORE composing the answer, even when nothing has been run: the "Engine guidance used" entry on the architecture page for structure and build questions; the quality evidence note for verification, run and measurement questions, with every claim `evidence: none` and its Guidance used line filled.
3. Answer in a few sentences: the conclusion for this project and the next action. In chat, give the conclusion and cite the skill and reference that hold the details. At most ONE rule may be adopted, in a sentence that cites the guidance; if adopted, write it into the architecture page's review standard in the same operation, so it is a decision and not chatter.

## Review a checkpoint

Follow Checkpoint review in [the process](process.md). Each criterion is `met` only when its evidence is `observed`; a criterion nobody measured is `not-assessed`. Present the criteria, how each is met, the constraints due and every concession to the owner, record the review, and offer the blind review. The owner decides when to move on; propose the move, do not make it. Concerns beyond the criteria go in a Notes line and never change a status.

## Scope change after Scope lock

1. game-pm writes the change request as a decision record that names the cut, or `none` with the owner's reason.
2. game-master adds the fit ruling.
3. Ask the owner to name the cut and to approve. Nothing is built until the owner approves, or says to proceed anyway, which is recorded as a decision to proceed.

## Refresh a stale page

1. Record the contradiction as an open question.
2. Confirm Next step and Blocked by with the owner; update only those.
3. Set the question answered.
4. Report.

Change Phase only when the owner says to, after a checkpoint review or an adoption placement; if Phase itself is contradicted, ask the owner whether to re-place it (adoption step 5).
