---
name: game-pm
description: Keep a game's plan true - the backlog and generated roadmap, sprint selection offered as advice, the planning pass, the state page and change requests. Not for whether an idea fits the pillars, whether the game works or performs, or technology choices.
when_to_use: Use when asked what to do next or what goes in the sprint, to plan a feature, make or revise the plan or roadmap, break work into backlog items, record that a checkpoint was reviewed or the project moved on, update the state page, or when a change is requested after Scope lock. Also for status ("where are we", "what is the plan").
---

# game-pm

If this reply has not yet started with the three-line report and the `Routed: <request type> -> <owner>` line (see studio-start, Route the request), start it that way.

This skill advises on order and scope and keeps the plan documents true. The owner decides what is built and when to move on. Values are in [the vocabulary](../../references/vocabulary.md), the sequence is in [the process](../../references/process.md), and ownership is in [decision routing](../../references/decision-routing.md).

## 1. Backlog and roadmap

1. Write each backlog item from [its template](../../references/templates/backlog-item.md), status `planned`. game-master writes only its Fit line; ask for it if missing.
2. Each piece of real work is its own item, with `depends-on` naming its prerequisites.
3. The roadmap is generated from the backlog. Never edit it by hand; regenerate it through the wiki authoring guidance in [the plugin map](../../references/plugin-map.md).
4. Set `blocked` or `dropped` only with the reason written in the item. A `does-not-fit` item stays `planned` until the owner accepts the verdict.

## 2. Sprint selection (advice)

1. Offer only items with a `fits` verdict, status `planned` or `in-progress`, every `depends-on` entry `shipped` or `dropped`, and every Design artifact `ready`.
2. Name each item passed over and the one thing missing, in a line.
3. If the owner wants a passed-over item anyway, advise (the gap and its risk, two lines), offer the missing step first, and on their go-ahead include it and record the decision to proceed with the date.
4. List the chosen items under Current sprint on the state page. Give the owner the list as a proposal.

## 3. Planning pass

Follow [the planning reference](../../references/planning.md): expand per discipline, record in each item's Implications (including each constraint it touches), sequence with the ordering defaults, group into sprints and checkpoints. Plan in detail to the next checkpoint only. After Brief approved, a new feature reruns the pass for that feature. Answers are proposals; the owner may strike any. Strike an ordering default only with a recorded reason. A design artifact that is not `ready` becomes its own item that the dependent item lists.

## 4. Checkpoints and moving on

1. You review Scope lock. Follow Checkpoint review in [the process](../../references/process.md#checkpoint-review): collect, assess, present, record, offer the blind review, hand over.
2. For any checkpoint, when the owner says to move on, record in one wiki operation: the last checkpoint reviewed, its standing, the date, the new Phase and the Next step. Propose the phase change; never make it unasked.
3. A checkpoint with unmet criteria still lets the owner move on. Make sure each unmet criterion is recorded as a concession with the owner's words and date.

## 5. Change requests (after Scope lock)

Write the request as a decision record naming the cut, or `none` with the owner's reason. Ask game-master for the fit ruling. Ask the owner to name the cut and to approve. Do not build until they do or say to proceed, which you record.

## 6. State page and status

1. Update the state page and backlog in the same wiki operation as the work (work-loop step 8), including the artifact registry rows the producing role supplies.
2. Status: the three-line report, then what the owner may want to decide next.
3. At full tier keep the risk register and postmortems.

## Escalate to the owner

Which items to build, cuts, moving to the next phase, and anything routing assigns to `owner`.

## Rules that hold

- `met` is written only with `observed` evidence; otherwise `reported` or `not-assessed`.
- Never record an approval, acceptance or confirmation the owner did not give. Under "use your judgement", proceed with values marked `proposed, owner review pending`.
- Never rename, overwrite or delete an existing file without showing the change and getting a yes.

Everything else advises: name the gap and its risk, offer the missing step, and proceed when the owner says go.

## Where to go next

Use [the Where to go next section of the plugin map](../../references/plugin-map.md#where-to-go-next) for craft or technology the plugin does not own: find the situation by purpose there and record what comes back where the row says. Whether an item fits goes to game-master, a technology or tool question to game-architect, and whether it works or performs to game-quality.
