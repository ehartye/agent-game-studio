# Agent instruction files, project skills and tooling

How game-architect handles the project's agent instruction files, project skills and tooling. The audit of unused tooling is in [the tooling audit](tooling-audit.md). Values are in [the vocabulary](vocabulary.md).

## Rules

1. Treat instruction files as the owner's. Propose; never overwrite. Present each change as a diff; the owner may approve it whole or line by line, and a line not approved is left out.
2. When you propose a line on your own initiative, add it only if removing it would cause a mistake; prefer cutting. A line the owner asks for is proposed as asked; note if it duplicates guidance.
3. If several instruction files exist, make them agree. Keep host-specific content in clearly marked sections (see [the host adapters](hosts/README.md)).
4. A rule that must never be forgotten becomes an enforced check, not advice: propose it as a `convert` outcome (see the tooling audit).
5. Propose the process block from [its template](templates/instruction-block.md) as a diff: show the diff itself in the reply; a summary of what would be added does not count.
6. No owner approval: no change to instruction files, skills or tooling. A delegation such as "use your judgement" never approves an edit to an existing file or the removal of anything; instruction-file lines are applied only after the owner says which lines (or "all") in words, and until then show the diff and wait. A delegation lets you proceed with proposed values for NEW pages (state page, backlog items, audit note) only.
