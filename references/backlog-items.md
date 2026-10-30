# Backlog item rules

Rules for writing and keeping backlog items. The template is [the backlog item template](templates/backlog-item.md) and the values are in [the vocabulary](vocabulary.md).

## A new item has no verdict yet

game-pm creates the item with the Fit line `Fit: pending - <why there is no verdict yet> - <YYYY-MM-DD>`, for example "waiting for game-master's fit check". `pending` is not a verdict: it never counts as `fits`, so the item is not offered for a sprint and no work starts on it until the line is replaced.

- game-master gives the verdict when asked, replacing the whole Fit line with the verdict, the pillar and non-goal numbers and the date. game-pm never writes the verdict.
- At its next planning pass game-pm asks game-master for the verdict on every `pending` item. The planning answer lists the pending items, and the pass still plans them (Implications, `depends-on`, sequence); it does not refuse them because the verdict is missing.
- If the owner says to build a `pending` item before the verdict exists, that is a request to skip the fit check. Advise as game-pm does for any skipped step, offer the check first and record the owner's go as a decision to proceed.

## Items in an adopted project

In a project that was adopted, with older backlog items already on record, write each new item to [the backlog item template](templates/backlog-item.md) and to [the vocabulary](vocabulary.md), not to the shape of the older items. Do not copy an older item's line names or values (the Target line, the Fit values, the status words) into the new item, and do not copy their codes.

- Older items are not rewritten, renamed or migrated unless the owner asks. When the owner asks, show the change first and get a yes (game-pm, Rules that hold).
- Read an older value by the alias in the vocabulary and write the vocabulary's value in the new item. Where the older line has no counterpart, use the template's line and say nothing about the difference in the item.
- A new item sits beside older ones without either form being wrong; only a new item must conform.
