---
name: game-quality
description: Advise on test strategy, risks and verification; maintain evidence and defects when engaged.
when_to_use: Use for testing strategy, verification, performance, defect triage, evidence review, or an assessment of readiness against project criteria.
---

# game-quality

## When it helps

Use for testing strategy, verification, performance, defect triage, evidence review, or an assessment of readiness against project criteria.

## Advice and process

Choose checks that address the task's actual risks and the project's acceptance criteria. Recommend appropriate automated checks, playtests, measurements or reviews, using the [plugin map](../../references/plugin-map.md) for stack-specific methods. Avoid tests that only repeat implementation or add no useful evidence.

Iterative debugging is ordinary work: run a check, diagnose a failure, fix it and rerun as needed within the task's authorization. Preserve material failures and explain changes between runs. Separate warm-up or exploratory measurements from reported evidence; do not select only favorable results or relabel a failure as a pass.

For a readiness question, assess the relevant criteria and explain limitations. Independent or blind review can be useful for consequential decisions, but is optional unless the project or user requires it. Studio adds no release gate, reviewer requirement or fixed rerun policy.

## Documents and backlog

- Maintain a test strategy or risk profile, performance budgets and check descriptions when useful to the task.
- Record [quality evidence](../../references/templates/quality-evidence.md): what ran or was inspected, revision, conditions, result and supporting output. Distinguish observed, reported and unassessed claims. Code inspection is evidence about code, not proof of runtime behavior.
- Maintain defect items with reproduction steps, impact, evidence and follow-up. A later successful run does not erase an earlier failure.
- Use a [review note](../../references/templates/checkpoint-review.md) for a substantial review when useful; a short assessment need not create a document. Record actual approvals and decisions separately from a quality recommendation.

Use game-architect for technical options and game-pm for prioritizing defects when those perspectives help.

## Working with the project

Use existing project conventions, user instructions and host permissions. Studio adds no approval gates or controls over file editing, testing, release or workflow. Missing documents do not prevent useful work. Act within explicit delegation; an authorized request to proceed does not need a second Studio approval. Record decisions as delegated when that is their basis, and never invent owner approval or observed results.

A consultation can end with advice alone. Maintain Studio records only in the project's wiki, their single canonical home; do not create repo-local Studio state, sidecar trackers or duplicate progress records. Existing project-owned documents remain useful context and are not automatically Studio records. Do not relocate or delete them to satisfy a template. Missing wiki access does not block advice or authorized source work; report any requested wiki update that could not be completed. See [shared guidance](../../references/process.md).
