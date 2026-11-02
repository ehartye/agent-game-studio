# Plugin map

Studio offers game-development advice and wiki document maintenance. Specialist plugins hold technology and craft guidance. This map centralizes their names so Studio need not duplicate their procedures. Consult relevant available guidance when it helps, without a mandatory lookup or record-writing ceremony.

## Map

| Purpose | Stack | Defer to |
|---|---|---|
| Engine choice | any | `agent-engine:engine-selection` |
| Structure and architecture | Phaser | `agent-phaser:engine-phaser`; for cross-game or tool coordination, `agent-phaser:phaser-architecture` |
| Structure and architecture | R3F / three.js | `agent-engine:engine-r3f` |
| Structure and architecture | Babylon.js | `agent-engine:engine-babylon` |
| Structure and architecture | Unreal (C++) | `agent-unreal:unreal-architecture` for project structure, module boundaries and where state belongs; `agent-unreal:unreal-gameplay`, `agent-unreal:unreal-rendering`, `agent-unreal:unreal-procedural` for system choices; `agent-unreal:unreal-native` for build and packaging |
| Structure and architecture | UEFN | `agent-unreal:uefn` |
| Structure and architecture | Custom | Available guidance or project documentation |
| Structure and architecture | Unity | Available guidance or project documentation |
| Structure and architecture | Godot | Available guidance or project documentation |
| Quality, verification, performance | Phaser | `agent-phaser:phaser-verification` |
| Quality, verification, performance | R3F / three.js | `agent-engine:engine-r3f` |
| Quality, verification, performance | Babylon.js | `agent-engine:engine-babylon` |
| Quality, verification, performance | Unreal (C++) | `agent-unreal:unreal-quality` for test and measurement practice; `agent-unreal:unreal-native` for running builds, captures and profiles |
| Quality, verification, performance | any | `agent-tests:test-strategy` and `agent-tests:test-audit` for test lanes and suite health |
| Visual polish | any | `agent-engine:engine-visual-polish` |
| Asset craft | sprites | `agent-sprites:sprite-craft`, `agent-sprites:sprite-review`, `agent-sprites:sprite-verification` |
| Asset craft | meshes | `agent-meshes:mesh-believable`, `agent-meshes:mesh-quality-review` |
| Asset craft | drawings | `agent-draw:draw-authoring` |
| Asset craft | sound and music | `agent-beeps:beeps-craft`; `agent-beeps:beeps-audition` for comparing options |
| Text and dialogue craft | any | `agent-prose:prose-dialog`, `agent-prose:prose-voice`, `agent-prose:prose-review` |
| Launch and store readiness | any | `agent-marketing:market-campaign` |
| Wiki retrieval | any | `wiki-master:wiki-search` for read-only page lookup and cited answers |
| Document authoring and roadmap | any | `wiki-master:wiki-project` for original documents, the generated roadmap and required validation of changed pages |
| Wiki checks and scaffolding | any | `wiki-master:wiki-setup` for validation-only requests, whole-vault reports, diagnostics and initialization |
| Skill quality | any | `hartye-skills:yoda` |
| Optional second opinion | any | `hartye-skills:rubber-duck`, subject to authorization for sending project content to another provider |

## Using the map

Find the relevant purpose and the project's actual stack. Confirm a named skill is available before relying on it, and load only guidance relevant to the task. Bring useful existing context, not a required packet of Studio documents. A missing mapped skill does not block ordinary work.

If no mapped guidance fits, use project documentation, available specialist guidance or authoritative technical documentation. Distinguish what was tested here, documented elsewhere and inferred. Explain a material guidance gap when useful; do not create an issue in another project's backlog automatically.

Useful general engine support includes `agent-engine:engine-selection`, `agent-engine:engine-asset-import`, `agent-engine:engine-visual-polish` and `agent-engine:engine-custom-shaders`. Choose only what applies. Game-system design can use Studio's optional [design template](templates/design-spec.md).

Cite guidance when it supports the answer. Consulting it does not require an architecture entry, quality note, state update or backlog item. When maintaining a record, keep only the useful project decision and link specialist details.

## Wiki records

The integration below targets wiki-master 0.89.0 or later and its six-role interface. Wiki tooling remains optional for advice and source work.

All Studio-maintained project state lives in the project's wiki, its single canonical home. `wiki-master:wiki-project` can maintain and validate changed records when available. Use `wiki-master:wiki-setup` for validation-only requests or a requested whole-vault report. Use the project's existing wiki tooling and schema; Studio does not require a particular plugin for advice or source work.

Do not write repository-local state, sidecar trackers or duplicate progress. Existing project-owned documents are not automatically Studio state: link them without relocating or deleting them. A requested transition to Studio maintenance should establish one canonical wiki record within scope.

## Finding the wiki vault

Use the wiki paths already established by the user or project instructions. For projects using `wiki-master`, its configured `WIKI_MASTER_VAULT` or its own vault-resolution helper identifies the vault. Its optional `scripts/session-brief.mjs` can locate a project through its existing repository binding; it is a discovery aid, not a startup requirement or response format.

Do not invent a binding, create a state directory in the repository or write elsewhere because discovery failed. Continue advice and authorized implementation, and report any requested wiki update that remains pending. Ask for the canonical destination only when a necessary write cannot otherwise be located.
