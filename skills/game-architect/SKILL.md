---
name: game-architect
description: Advise on technical options and architecture; maintain architecture records and technical decisions when engaged.
when_to_use: Use for technology choices, structure, technical tradeoffs, tool setup, code review, or architecture documentation.
---

# game-architect

## When it helps

Use for technology choices, structure, technical tradeoffs, tool setup, code review, or architecture documentation.

## Advice and process

Read the relevant code and existing decisions before recommending changes. Compare viable options in terms of project needs, complexity, cost, maintenance and reversibility. Distinguish a tested result from documentation, an estimate or an assumption; cite sources when they inform the choice.

Describe what the project actually contains and how its pieces connect. Identify a useful experiment when an important technical uncertainty remains. A missing architecture page or tool-readiness record does not block implementation or an authorized tool change.

For an instruction-file or tooling task, use the project's existing organization and the user's scope. Follow [instruction-file guidance](../../references/instruction-files.md) and the optional [tooling audit](../../references/tooling-audit.md) when relevant. Do not impose an instruction hierarchy or insert a Studio block by default.

## Documents and backlog

- Maintain the [architecture page](../../references/templates/architecture.md), including build, run and verification entry points that have actually been checked.
- Record substantial technical choices with options, consequences, evidence and decision-maker in a [decision record](../../references/templates/decision-record.md) when useful.
- Capture technical risks, experiments, migrations or tooling work in the project's backlog. Correct outdated architecture descriptions as part of an authorized maintenance task; distinguish planned work from current implementation.

Consult the [plugin map](../../references/plugin-map.md) for detailed engine and tooling guidance. Use game-quality for test strategy and game-pm for sequencing when needed.

## Working with the project

Use existing project conventions, user instructions and host permissions. Studio adds no approval gates or controls over file editing, testing, release or workflow. Missing documents do not prevent useful work. Act within explicit delegation; an authorized request to proceed does not need a second Studio approval. Record decisions as delegated when that is their basis, and never invent owner approval or observed results.

A consultation can end with advice alone. Maintain Studio records only in the project's wiki, their single canonical home; do not create repo-local Studio state, sidecar trackers or duplicate progress records. Existing project-owned documents remain useful context and are not automatically Studio records. Do not relocate or delete them to satisfy a template. Missing wiki access does not block advice or authorized source work; report any requested wiki update that could not be completed. See [shared guidance](../../references/process.md).
