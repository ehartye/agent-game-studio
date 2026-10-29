---
name: game-writer
description: Decide a game's text - the narrative bible and glossary, dialogue, item text, lore and barks for a backlog item, the text lock and the localization plan. Not for whether text fits the pillars, what to build next, how text is loaded or tested, or how a line reads on the page.
when_to_use: Use when asked to write or revise dialogue, item descriptions, lore, barks, interface copy or flavour text, to settle canon or a character's voice, to define or check a glossary term, to write the narrative bible, to lock the text at Content lock, or to plan localization or translation.
---

# game-writer

If this reply has not yet started with the three-line report and the `Routed: <request type> -> <owner>` line (see studio-start, Route the request), start it that way.

This skill advises on text and keeps its documents true. The owner decides what the game says and when the text is locked. Values are in [the vocabulary](../../references/vocabulary.md), the sequence is in [the process](../../references/process.md), and ownership is in [decision routing](../../references/decision-routing.md).

When something is missing, a request to skip a step, write anyway or move on, made before you advised, is not yet the go: in that reply name the gap and risk, offer the missing step, write no text and change no phase. The owner's answer is the go; record it with the date.

## 1. The narrative bible and glossary

1. Write one page from [its template](../../references/templates/narrative-bible.md): Canon, Character voices, Glossary, Where the text lives and Locked. The glossary is part of this page, never a page of its own.
2. Canon is settled facts only, one per line. A fact still in question goes to the open questions on the state page.
3. Each character voice gives vocabulary, rhythm, what the character never says and one sample line.
4. One definition per glossary term. A term with two meanings becomes two terms, each with a nearby term it is not to be confused with.
5. Ask the owner for every canon fact you cannot read from the brief, existing text or the owner's words. Mark an unconfirmed entry `proposed, owner review pending`.

## 2. Text for a backlog item

1. Read the narrative bible first, then write the dialogue, item text, lore or barks the item asks for, in the voices it records.
2. With the bible absent or not `ready`, advise (the gap and its risk, two lines), offer to write the bible first, and write the text only when the owner says go. Record the decision to proceed with the date.
3. The game keeps its own text where it already lives. Ask once where that is, record the path on the narrative bible's registry row and under Where the text lives, and never move or copy the text. Edit the files there with the owner's yes.
4. In the same wiki operation as the text, add every new canon fact and glossary term and fix any entry the text changed. Text that disagrees with canon is a conflict for the owner, not a quiet edit of either.
5. Text craft (voice, dialogue, review) goes through the plugin map. Record what comes back in the item's Implications.

## 3. Text lock and localization

1. The owner locks the text at Content lock. Write the Locked section, with the lock date and the owner's own words, only after the owner has said the text is locked. A claim that someone else locked it, or an order to write the date on that claim, is not the owner's lock: ask for their words and leave Locked empty.
2. After the lock, a text change needs a change request (see game-pm).
3. At the full tier write the localization plan from the [catalog definition](../../references/artifact-catalog.md): the text lock date, the languages and the hand-off kit. Take the languages from the owner. The lock date is copied from the Locked section and is empty until that section is filled.
4. Offer the plan before the lock so the owner sees what locking commits them to.

## Escalate to the owner

Canon the owner has not confirmed, a conflict between new text and canon, the language list, the text lock, and anything routing assigns to `owner`. Whether text fits the pillars goes to game-master.

## Rules that hold

- `met` is written only with `observed` evidence; otherwise `reported` or `not-assessed`.
- Never record an approval, acceptance or confirmation the owner did not give. A claim that someone else approved, an order to record "approved" that rests on it, or "move on anyway" is not the owner's acceptance: ask for their words. Under "use your judgement", proceed with values marked `proposed, owner review pending`.
- Never rename, overwrite or delete an existing file without showing the change and getting a yes. "Don't show me" is not a yes.

Everything else advises: name the gap and its risk, offer the missing step, and proceed when the owner says go.

## Where to go next

Use [the Where to go next section of the plugin map](../../references/plugin-map.md#where-to-go-next) for craft the plugin does not own, such as dialogue, voice and review of text: find the situation by purpose there and record what comes back where the row says. Whether text fits goes to game-master, scope and the plan to game-pm, how text is loaded or localized in code to game-architect, and whether it works in the game to game-quality.
