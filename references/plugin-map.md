# Plugin map

This plugin says what must be decided and what evidence proves it. Another plugin says how. This is the only file in the plugin that names engines, tools or other plugins. Skills refer to purposes ("engine architecture guidance"), then look the purpose up here.

## Map

| Purpose | Stack | Defer to |
|---|---|---|
| Engine choice | any | `agent-engine:engine-selection` |
| Structure and architecture | Phaser | `agent-engine:engine-phaser`; for cross-game or tool coordination, `agent-engine:phaser-architecture` |
| Structure and architecture | R3F / three.js | `agent-engine:engine-r3f` |
| Structure and architecture | Babylon.js | `agent-engine:engine-babylon` |
| Structure and architecture | Unreal (C++) | `agent-unreal:unreal-architecture` for project structure, module boundaries and where state belongs; `agent-unreal:unreal-gameplay`, `agent-unreal:unreal-rendering`, `agent-unreal:unreal-procedural` for system choices; `agent-unreal:unreal-native` for build and packaging |
| Structure and architecture | UEFN | `agent-unreal:uefn` |
| Structure and architecture | Custom | Fallback chain, item 2 onward |
| Structure and architecture | Unity | Fallback chain, item 2 onward |
| Structure and architecture | Godot | Fallback chain, item 2 onward |
| Quality, verification, performance | Phaser | `agent-engine:phaser-verification` |
| Quality, verification, performance | R3F / three.js | `agent-engine:engine-r3f` |
| Quality, verification, performance | Babylon.js | `agent-engine:engine-babylon` |
| Quality, verification, performance | Unreal (C++) | `agent-unreal:unreal-quality` for test and measurement practice; `agent-unreal:unreal-native` for running builds, captures and profiles |
| Quality, verification, performance | any | `agent-tests:test-strategy` and `agent-tests:test-audit` for test lanes and suite health |
| Visual polish | any | `agent-engine:engine-visual-polish` |
| Asset craft | sprites | `agent-sprites:sprite-craft`, `agent-sprites:sprite-review`, `agent-sprites:sprite-verification` |
| Asset craft | meshes | `agent-meshes:mesh-believable`, `agent-meshes:mesh-quality-review` |
| Asset craft | drawings | `agent-draw:draw-authoring` |
| Asset craft | sound and music | `agent-beeps:beeps-craft`; the owner picks by `agent-beeps:beeps-audition` |
| Text and dialogue craft | any | `agent-prose:prose-dialog`, `agent-prose:prose-voice`, `agent-prose:prose-review` |
| Launch and store readiness | any | `agent-marketing:market-campaign` |
| Document authoring and roadmap | any | `wiki-master:wiki-author` for documents and the generated roadmap; `wiki-master:wiki-health` for validation |
| Wiki scaffolding | any | `wiki-master:wiki-init` |
| Skill quality | any | `hartye-skills:yoda` |
| Second opinion at a gate | any | `hartye-skills:rubber-duck` |

## Lookup procedure

1. Read the stack from the architecture page or the decision records.
2. Find the purpose and stack in the map. A row whose stack is `any` adds to the stack's row (or to the fallback chain) and never replaces it.
3. The lookup is triggered by any question about how to build, structure, run, verify or measure the project, or which tool to use, whether or not it mentions architecture. Confirm the named skill appears in the session's list of available skills. If it does, load it and follow it for how; when a row names several skills, load only those the question touches. In your answer, name the skill, give the conclusion for this project and the next action in a few sentences, and cite where the details live. In chat, say which skill and reference hold the details and name the next action. At most ONE rule may be adopted, in a sentence that cites the guidance; if adopted, write it into the architecture page's review standard in the same operation, so it is a decision and not chatter. Do not copy its procedures, commands, thresholds or lists into a project document; the details stay in the guidance. A stack with no row for a purpose uses the fallback chain.
4. Record the guidance used BEFORE you answer, even when the answer is a question to the owner: which guidance, for what question, and the date. Structure and architecture guidance goes under "Engine guidance used" on the architecture page. Verification guidance goes on the "Guidance used" line of the quality evidence note; if nothing has been run yet, write the note anyway with every claim marked `evidence: none` and `Evidence: none`. Asset or text craft guidance goes in the backlog item's Implications.

## Fallback chain

Use this when the stack has no mapped skill for the purpose, the mapped skill is not available, or it is available but has nothing on the question.

1. The engine-specific skill, if the map names one and it is available.
2. Otherwise the general engine plugin: `agent-engine:engine-selection` and the stack's profile in it (how to install, drive and verify the stack, with limits), plus `agent-engine:engine-asset-import` for assets, `agent-engine:engine-visual-polish` for visuals and `agent-engine:engine-custom-shaders` for a custom renderer, where they apply.
3. If that has nothing on the question, apply the agnostic requirements: (a) describe only what exists in the repository, in the architecture page's Stack, Structure and Review standard; (b) label each claim that matters `tested here`, `documented` (cite the source) or `general knowledge`; (c) say in the answer that no engine-specific guidance was used; (d) name the observed run that would confirm it. Then record an open question on the state page (owner: game-architect, must be answered by: none), and write the gap text (purpose, stack, question, what was missing) and include it in your answer. File it as a roadmap item for the general engine plugin if you can reach that roadmap; otherwise hand the owner the text. Do not add it to the project's own backlog or roadmap. If an open question for the same purpose and stack already exists, add nothing.

For a purpose that is not engine structure, quality or assets (asset craft, text craft, launch readiness, second opinion), if the mapped skill is unavailable, apply the process's own checks, record an open question, and hand the owner the gap text for the plugin the map names for that purpose.

## Overlaps this plugin must not duplicate

- **Test phases and lanes:** `agent-tests:test-strategy` defines dev, test and production phases and lanes. game-quality maps its gates onto them (concept through production roughly to dev, beta to test, release and live to production) and defers to it.
- **Launch readiness:** `agent-marketing` models launch gates. G5 points to it and keeps only the engineering release criteria.
- **Document formats and validation:** the wiki tooling above. The artifact catalog gives owner, path and ready definition only.
- **Skill quality:** `hartye-skills:yoda`.

## Dependencies

The wiki tooling (`wiki-master`, version 0.55.0 or later, for the validated `depends-on` field on backlog items) is a hard dependency: the state page, backlog, roadmap and decision records live in the project's wiki. Everything else in this map is optional; when it is missing, use the fallback chain.

## Finding the wiki vault

The wiki tooling's vault is the folder named by the `WIKI_MASTER_VAULT` environment variable, or the folder the tooling's own resolution reports (ask the tooling for its vault path). The project's pages are in `<vault>/wiki/authored/<slug>/`. [Entry](entry.md#find-the-wiki) gives the order in which to look.
