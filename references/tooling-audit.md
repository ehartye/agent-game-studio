# Tooling audit

The architect audits the project's agent tooling and proposes removing what is not used. The owner approves before anything changes. The record format is [the tooling audit template](templates/tooling-audit.md); values are in [the vocabulary](vocabulary.md). Where each category lives for a given host is in [the host adapters](hosts/README.md).

## Scope

The project directory and the project-scoped agent configuration. The owner's global configuration is out of scope: report it if it affects the project, and never change it. Never print, quote or copy the value of a secret or credential (a token, key or password in any file or setting) into a record, a proposal or a message, at any step. Name the file and the setting only.

## Categories

1. Agent instruction files.
2. Project skills, commands and prompt files.
3. Plugins or extensions enabled or vendored for the project.
4. Tool-server integrations.
5. Automation the agent triggers (event-triggered commands, scripts).
6. Permission allowlists.
7. Agent residue: scratch files, caches, logs, profile folders created by tools, stray plan files, stale worktrees.
8. Instruction content duplicated from the wiki or from a plugin's guidance.

## In use

An item is in use if any of these holds:

- the routing table, the plugin map or an instruction file references it (a reference from an instruction line counts only if that line is kept in procedure step 3);
- a script or CI step needs it;
- there is recorded use in the evidence window: by default the last 90 days of project history, or since the previous audit if that is more recent (the owner may change it);
- a role skill declares it as a dependency for a need.

Anything else is a candidate.

## Outcomes

Give every candidate exactly one outcome:

- `remove`: unused, with evidence.
- `replace-with-reference`: a project skill or note that duplicates a plugin's guidance; delete it and point at the plugin.
- `merge`: duplicated instructions; keep one copy.
- `convert`: a rule that must never be forgotten is only advice; make it an enforced check.
- `ask-owner`: evidence of use is unavailable or ambiguous.

## Procedure

1. **Inventory** every category above.
2. **Classify** each item as in use or a candidate, with the evidence you used.
3. **Check the instruction files.** For each line, ask whether removing it would cause a mistake; if not, it is a candidate. Check that all instruction files agree and that host-specific content sits in clearly marked sections.
4. **Propose.** Fill in the template: for each candidate, the item, the category, the evidence, the outcome, the risk and how to undo it.
5. The owner approves before anything changes. Record the decision.
6. **Apply** as one reversible change in version control; if the project is not under version control, ask the owner for another way to undo it. List untracked items for the owner; do not delete them (`remove` for an untracked item means the owner deletes it). Never print the contents of secrets or credentials.
7. **Record** the audit note and update the registry.

## Evidence of use is often unavailable

Hosts differ in what they log. When you cannot show use or non-use, the outcome is `ask-owner`. Never remove an item because nothing proves it is used.

## When

At adoption, when G2 is checked, before G5 is checked, whenever a tool or instruction file changes materially (a short audit of the changed items only), and when the owner asks. The audit is not gate evidence: if the owner declines it, no gate is blocked.
