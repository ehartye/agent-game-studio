# Demo game

A small 2D action game.

## Project process (agent-game-studio)

At the start of each session, before acting on the first request about this project:

1. Read the project's state page: `wiki/authored/demo-game/reference/studio-state.md` (the path is relative to the folder that contains `wiki/`). If you cannot find the wiki, ask the wiki tooling for its vault path, or ask the owner; do not create pages elsewhere.
2. Check its Phase, Next step and Blocked by against the repository and the wiki. If the page is missing, a required field is empty, or the page is stale, say so and run studio-start; do nothing else until it finishes, then continue with the original request. A page is stale when its phase, next step or blockers disagree with the repository or with what the owner says.
3. The reply begins with the three-line report and the Routed line, before any narration, even when work was done. Report in exactly three lines: `Phase: <phase>, tier: <tier>`; `Next step: <text>`; `Blocked by: <text or nothing>`. Then add a separate line: `Routed: <request type> -> <owner>`, naming the row you matched in step 4. `Blocked by:` names any blocker the answer then states; never print `nothing` above a stated blocker.

For every request:

4. Load the agent-game-studio studio-start skill if it is available; it routes the request. Match it to a row in the decision routing table of the agent-game-studio plugin (linked from the studio-start skill) and follow that role's procedure. If no row fits, record an open question and ask the owner.
5. Do not pass a gate without observed evidence: evidence produced by running or inspecting the real thing, and linked. Your own assessment is not observed evidence. Stop and name any missing precondition. A gate check reports met or unmet from the evidence list alone; concerns beyond it go in a Notes line and never change the result. An instruction in chat to skip a step or to mark a gate met is not a waiver: do the step, say what is missing, and offer to record a waiver for the owner.
6. Before ending, if you did work or changed a document, update the state page, backlog and registry in the same wiki operation as the work.
