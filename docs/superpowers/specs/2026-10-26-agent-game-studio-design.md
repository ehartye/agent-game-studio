# agent-game-studio — design

Status: draft for owner review. Date: 2026-10-26.

Revision note (0.2.0): the five gates became advisory checkpoints (Brief approved, Vertical slice, Scope lock, Content lock, Ship). They no longer block work; the agent reports standing, records it, and the owner decides when to move on. Where this spec says "gate", read "checkpoint".

## 1. Purpose

agent-game-studio is a technology-agnostic process plugin for building a game with an AI agent. When a person talks to an agent about a game project, the agent should know which phase the project is in, what the next step is, who decides each kind of question, what must be true before work moves on, and where each fact is recorded. The plugin supplies that as skills and references. It has no runtime.

It serves two starting points equally: a new project, and an existing project that needs the framework adopted in place.

### Principles

1. **Process, sequence and no ambiguity** are the product. Every request class has one owner and one procedure. Every artifact has one canonical location and one writer. "Unknown" is a defined state with a defined action.
2. **Structure and verification, not persona.** A role's value comes from what it may decide, read and write, and the evidence its work must produce. There are no subagents and no persona prompts in this plugin.
3. **Reference, don't duplicate.** Engine, testing, asset, writing and launch guidance belongs to the plugins that own it. This plugin says what must be decided and what evidence proves it. The other plugin says how.
4. **Host-neutral.** The method is written without naming any agent host's tools. Host specifics live in optional adapters.
5. **Evidence over opinion at gates.** A gate passes on observed results, never on an agent's assessment alone. The owner is the final gate.
6. **Proportionate rigor.** Three tiers (minimal, standard, full) scale the document set. Heavier process is opt-in by phase and project size.

### Non-goals

- A runtime, CLI, daemon or hook. Contracts are data; checks are procedures or wiki-tooling enhancements (section 13).
- Subagent or persona machinery.
- Engine-, language- or tool-specific guidance (it is referenced, section 9).
- Replacing the guidance of the asset, test, writing or marketing plugins.
- Changing the owner's global agent configuration.
- Being the project's store. The project's wiki is the store.

## 2. Dependencies

- **Hard:** wiki-master, for the project wiki, document layout, validation, the roadmap generator and the operation workflow.
- **Soft** (used if installed, with a stated fallback if not): the plugins in the plugin map (section 9) and a clean-context review or second-opinion skill for high-stakes gates.

## 3. Core mechanisms

### 3.1 State page

Path: `wiki/authored/<project>/reference/studio-state.md`. Canonical in the wiki. Every session starts by reading it. Required fields:

| Field | Content |
|---|---|
| Phase | One of the phase names in section 4 |
| Rigor tier | `minimal`, `standard` or `full` |
| Next step | One line. Always present |
| Blocked by | Item and reason, or `nothing` |
| Current sprint | Backlog items in scope, or `none` |
| Artifact registry | Table: artifact, path, owner, status, last verified |
| Open questions | Table: question, owner, must be answered by (gate), status |
| Last gate result | Gate, result, evidence link |

The project's agent instruction file carries a short block, owned by the architect (section 6.2): read the state page before acting on any project request; follow the routing table; do not pass a gate without evidence. That block is how the process reaches an agent with no other setup.

### 3.2 Decision routing

`references/decision-routing.md` maps every request class to one owner, one document to read first, and one required output. A request that matches no row is recorded as an open question and put to the owner. The initial table is in section 5.

### 3.3 Work loop

Every unit of work follows these steps in order. The agent may not skip a step; a missing precondition means stop and name it.

1. **Intake.** State the request and match it to a routing row.
2. **Fit check** (game-master). Verdict: `fits`, `does-not-fit` or `needs-pillar-change`, recorded in the backlog item.
3. **Design readiness.** Every artifact the work needs is present and `ready`, or the gap is raised.
4. **Sprint selection** (game-pm). Items are chosen so their dependencies are met.
5. **Build.**
6. **Verify** (game-quality). Observed evidence is recorded against the item and the gate it supports.
7. **Accept.** game-master accepts against the pillars; the owner accepts at gates.
8. **Update.** State page, backlog and registry are updated in the same wiki operation as the work.

### 3.4 Session rules

- **Start:** read the state page and check it against the repository. If it is missing, stale or has an empty required field, say so and run `studio-start`, then take the original request to Intake (unless running `studio-start` was the request). Then report phase and tier, next step and blockers in exactly three lines (the format is in `references/process.md`).
- **End:** run step 8 of the work loop before the session closes.

### 3.5 Source of truth

The project's wiki owns intent. The repository owns behavior. When they disagree, the repository wins on what happens, the wiki wins on what was meant, and the disagreement is recorded as a decision or an open question. Nothing is silently corrected.

## 4. Phases and gates

| Phase | Exit gate | Required evidence | Check owner |
|---|---|---|---|
| 0. Adopt (existing projects only) | Registry filled, phase placed | Registry reviewed by the owner | studio-start |
| 1. Concept | **G1** Brief approved | Game brief, 3–5 pillars, non-goals | game-master |
| 2. Pre-production | **G2** Vertical slice | Playable slice, stack decision recorded, production plan, art bible†, test strategy†, performance budgets† | game-architect and game-quality |
| 3. Production | **G3** Scope lock | Feature complete; later work needs a change request and a cut | game-pm |
| 4. Beta | **G4** Content lock | Content complete, no critical defects, budgets met†, text locked† | game-quality |
| 5. Release | **G5** Ship | Release criteria met, platform requirements checked, asset provenance audit clean† | game-quality, then the owner |
| 6. Live | none | Patches follow the work loop plus a regression check | game-pm |

Rules:

- **Result values:** `met`, `unmet`, `waived`. A waiver requires a decision record naming who waived it and why.
- **How a gate is passed:** the check owner decides the result from the evidence, states it in the quality evidence note and tells game-pm. The owner then accepts. After acceptance game-pm records the gate result, the acceptance date, the new Phase and the Next step on the state page in the same wiki operation. For G1 the brief is the evidence and no quality note is needed. When a gate has two check owners (G2), each states their part and tells game-pm, who records the result once both are in.
- **Evidence values:** `observed` (a run, screenshot, test output, build receipt), `reported`, `none`. A gate requires `observed` evidence for every behavioral claim.
- **Minimal tier:** the gates are the same at every tier; only the document list shrinks (section 7). Evidence marked † names a document outside the minimal tier; at that tier it is satisfied by one line in the quality evidence note stating what was checked and how, with the observed result. (An earlier draft merged G3 and G4 at this tier; that was dropped because a recorded G3 result would then have covered G4.)
- **Change control after G3:** a change request names the cut that pays for it.
- **Durations:** none are prescribed. The public sources for typical durations are weak.
- **Platform and store gates** are external. G5 defers to the owning plugin for launch readiness (section 9) and keeps only engineering release criteria.

## 5. Roles and routing

Roles are decision and document owners. Each is a skill: a short procedure with the decision types it owns, the artifacts it reads and writes, entry and exit checks, and escalation to the owner. Each artifact has exactly one writer; the others review.

| Role | Decides | Writes |
|---|---|---|
| game-master | Fit against the pillars; "is the game on course?"; art fit on key assets; acceptance against the pillars | Brief and pillars; fit verdicts; course checks; design specs until game-designer exists |
| game-architect | Technology, engine features, project structure, tool readiness; code review standards; the agent instruction files, project skills and tooling | Architecture page; technology decision records; the instruction-file block; tooling audit records |
| game-pm | What to do next; sprint contents; scope changes; plan structure | State page; backlog and roadmap; risk register (full tier); postmortems (full tier) |
| game-quality | Whether it works and is ready; the quality bar, budgets and severity scale; release criteria | Test strategy; quality evidence; release criteria (full tier) |
| game-writer | Text, dialogue, canon and glossary; localization lock | Narrative bible and glossary; localization plan (full tier) |
| game-artist | Craft of art, animation, effects, sound and music; art bible compliance | Art bible; asset list (standard tier); asset entries (full tier) |
| game-designer (phase 3) | System, economy, level and interface design | Design specs |

Until game-designer exists, game-master owns design specs as a flagged exception and game-quality reviews them.

### Initial routing table

The authoritative table is `references/decision-routing.md`; the table below is a copy as built (2026-10-26). It has a `Then` column: the party that must act on the owner's output before the work is complete.

| Request | Owner | Then | Read first | Required output |
|---|---|---|---|---|
| New idea or feature | game-master | - | Pillars, non-goals | Fit verdict in the backlog item |
| Course check | game-master | - | State page, latest quality evidence | Course check with evidence links |
| Engine, library or tool choice | game-architect | - | Decision records (`decisions/`) | Decision record; tool-readiness sign-off if a tool is involved |
| Project layout, code standards, code review | game-architect | - | Architecture page | Updated architecture page |
| Agent instruction files, project skills, tooling | game-architect | owner | The existing files | Proposed diff, never an overwrite |
| Tooling cleanup | game-architect | owner | Artifact registry, instruction files | Audit proposal |
| What to do next, or sprint contents | game-pm | - | Backlog, artifact registry | Sprint list with design artifacts confirmed ready |
| Plan creation or revision | game-pm | - | Brief, pillars, backlog | Plan from the planning pass |
| Scope change after G3 | game-pm | game-master | Backlog, pillars | Change request naming the cut |
| Dialogue, item text, lore | game-writer | - | Narrative bible | Text plus glossary and canon updates |
| Characters, levels, effects, marketing art | game-artist | game-master | Art bible | Asset plus provenance entry; game-master signs off fit on key assets |
| Sound or music selection | game-artist | owner | Art bible | The owner's recorded pick |
| Does it work, is it ready, performance | game-quality | - | Test strategy, budgets | Observed evidence recorded against the gate |
| Status | game-pm | - | State page | The three-line report |
| Joining an existing project | studio-start | - | The project | Adoption |
| Anything else | none | owner | State page | Recorded open question; ask the owner |

The built table has no design-spec row. Until game-designer exists, game-master owns design specs as the flagged exception noted under the roles table, and game-quality reviews them.

## 6. Plugin structure

```
plugin manifest(s)                one per supported host, in the location that host requires
skills/
  studio-start/                   orient; greenfield bootstrap; adoption
  game-master/  game-architect/  game-pm/  game-quality/  game-writer/  game-artist/
  (game-designer/ in phase 3)
references/
  process.md                      phases, gates, work loop, evidence rules
  decision-routing.md             the routing table
  artifact-catalog.md             every standard document: owner, path, format, ready definition
  vocabulary.md                   closed definitions of statuses and values
  planning.md                     planning pass, discipline checklists, ordering defaults
  plugin-map.md                   the only file that names other plugins, engines and tools
  adoption.md                     existing-project procedure
  tooling-audit.md                audit procedure
  instruction-files.md            rules for the project's agent instruction files, skills and tooling
  hosts/                          optional adapters; the only place host names appear
  templates/                      one template per artifact
docs/superpowers/specs/           this spec
```

Skill frontmatter follows the sibling plugins: `name`, `description`, `when_to_use`. Each skill is short, written in imperatives with the closed vocabulary, and links to references instead of restating them.

### 6.1 Naming and hygiene rules

- Engine, tool and other-plugin names appear only in `references/plugin-map.md`. Skills refer to purposes ("engine architecture guidance"), not names.
- Host product names appear only under `references/hosts/`. The exceptions are the plugin manifest(s), whose location each host dictates, and the README's install line, which links into `references/hosts/`.
- The public repository carries no project-specific or machine-specific language.
- A repository test fails on violations of the first two rules.

### 6.2 The architect's instruction-file block

The block is generic text from `references/templates/`, installed into the project's agent instruction file(s) as a proposed diff. When several instruction files exist, the architect checks that they agree and keeps host-specific content in clearly marked sections. The architect proposes entries; the owner approves each line. Research reports that agent-generated instruction files can reduce success and raise cost, so the default is to cut instructions, not add them. A line stays only if removing it would cause a mistake.

## 7. Documents

Paths are under `wiki/authored/<project>/`, using wiki-master's layout. Every document has one owner.

**Minimal tier**

| Artifact | Path | Owner | Ready means |
|---|---|---|---|
| State page | `reference/studio-state.md` | game-pm | Every field filled; next step present; verified this session |
| Game brief | `overview.md` | game-master | One-sentence player experience; 3–5 pillars, each stating what it means and what it rules out; non-goals; owner approval date |
| Decision log | `decisions/<slug>-adr.md`, one per decision | the decider per routing | Context, options, outcome, consequences (good and bad), decision-makers, status |
| Architecture | `architecture.md`, as-built only | game-architect | Matches the repository; has an "Engine guidance used" section; verified date |
| Roadmap | `roadmap.md` (generated) and `backlog/<slug>.md` | game-pm | Each item has a fit verdict, acceptance evidence, linked ready design artifacts, and its dependencies |
| Quality evidence | `notes/quality-<gate-or-item-slug>.md` (lowercase) | game-quality | Observed results linked to the item or gate they support |
| Agent instructions | in the repository | game-architect | Contains the state-page block; changed only through an approved diff |
| Tooling audit record | `notes/tooling-audit-<date>.md` | game-architect | Every candidate has evidence, an outcome, a risk and an undo; the owner's decision is recorded |

**Standard tier adds:** art bible (`reference/art-bible.md`, game-artist); narrative bible and glossary (`reference/narrative-bible.md`, game-writer); test strategy, quality bar, budgets and severity scale (`reference/test-strategy.md`, game-quality); asset list with provenance (`reference/asset-list.md`, game-artist; game-quality audits it at G5); design specs (`reference/design-<system>.md`, game-designer, or game-master until that role exists).

**Full tier adds:** risk register, release criteria, localization plan, a postmortem per phase, per-asset entries with sign-off history.

Rules:

- A fit verdict lives in its backlog item. Only significant verdicts become decision records.
- The rigor tier is set at bootstrap or adoption and may be raised at design readiness or at a gate. Lowering it mid-phase needs a decision record.
- Artifact status values are closed: `ready`, `draft`, `absent`, `reconstructed`, `conflicting`.
- Retrospective records are labelled `reconstructed`.

## 8. Planning

Planning is rolling-wave: detailed to the next gate, outlined beyond it. The plan is re-run at each gate and on every change request.

### 8.1 Planning pass

When game-pm creates or revises the plan, for each feature:

1. **Expand.** Each discipline answers "what does this feature imply for me?" from its checklist. Answers are proposals the owner may strike.
2. **Record.** Implications go in the feature's backlog item under "Implications". Real work becomes its own backlog item whose `depends-on` entry names its prerequisites (a validated frontmatter list in the wiki tooling, version 0.55.0 or later).
3. **Sequence.** Apply the ordering defaults.
4. **Group.** Fit the ordered items into sprints and gates, confirming design artifacts are ready.

### 8.2 Discipline checklists

| Lens | Asks |
|---|---|
| game-artist | Animations, effects, sounds and music, environment pieces, interface art, using the needs matrix below |
| game-writer | Text, dialogue, item and interface copy, localization lock timing |
| game-architect | New tools or engine capabilities and their readiness; data formats; performance risk |
| game-quality | Test hooks and evidence needed; budget impact; regression risk |
| game-master | Fit against the pillars; whether a pillar must change |

### 8.3 Needs matrix (starting defaults, to be tuned)

| Capability | Typically implies |
|---|---|
| Any character | Idle; each movement mode; hit reaction; defeat and spawn; timing and loop policy per action |
| Attacks | Wind-up, strike and recovery; trail effect; impact effect; swing and hit sounds |
| Moves over surfaces | Footsteps per material; dust or splash effects |
| Speaks | Voice or text set; expressions |
| Environment | Tile edges and transitions; readability pass; ambient bed; music cue; hazard telegraphs (visual and audio) |
| Effect | Intensity variants; a paired sound; performance budget; a check that it does not hide gameplay |

### 8.4 Ordering defaults

Defaults, not rules; strike one with a reason when the reason is not obvious.

1. Tool readiness before any feature work that needs the tool.
2. A scale-and-camera contract (stature, pixel density, palette, camera angle), then a style frame. Changing the contract makes dependent sign-offs stale.
3. A hero asset of each type through the whole pipeline before batch production.
4. A greybox layout approved before level art.
5. Animation timing before the effects and sounds that depend on it.
6. Test hooks before the feature's verification.

### 8.5 Art stages and sign-off

Stages: brief, reference approved, draft, craft review, isolated sign-off, integrated, in-context sign-off, locked. In the minimal tier this is one status line per backlog item.

| Asset class | Craft sign-off | Fit sign-off |
|---|---|---|
| Key visuals (heroes, hero environments, style frame) | game-artist, using the asset plugin's checklist | game-master |
| Other visuals | game-artist, against the art bible | none |
| Sound and music | game-artist | the owner, by audition |

Craft checklists belong to the asset plugins; this plugin does not restate them.

## 9. Referencing other plugins

**Rule: this plugin says what must be decided and what evidence proves it. The other plugin says how.** A question, criterion or evidence requirement stays here. Anything that names an engine, library or language belongs to the owning plugin.

### 9.1 Lookup procedure (architect and quality)

1. Read the stack from the architecture page or the decision records.
2. Find the purpose and stack in the plugin map. A row whose stack is `any` adds to the stack's row (or to the fallback chain) and never replaces it.
3. Confirm the named skill appears in the session's skill list. If it does, load it and follow it for the how. In the answer, name the skill, state the conclusion for this project, and cite where the details live; chat may discuss the guidance freely. Do not copy its procedures, commands, thresholds or lists into a project document. A stack with no row for a purpose uses the fallback chain.
4. Record the guidance used before answering, even when the answer is a question to the owner: on the architecture page under "Engine guidance used" for structure, on the "Guidance used" line of the quality evidence note for verification (written even if nothing has been run, with every claim marked `evidence: none`), in the backlog item's Implications for asset or text craft.

**Fallback chain** (used when the stack has no mapped skill for the purpose, the mapped skill is not available, or it has nothing on the question):

1. The engine-specific skill, if the map names one and it is available.
2. Otherwise the general engine plugin's selection skill and the stack's profile for how to drive and verify it, plus its asset-import, visual-polish and custom-shader skills where they apply.
3. If that has nothing on the question, apply the agnostic requirements (describe only what exists; label each claim as tested here, documented or general knowledge; say no engine-specific guidance was used; name the observed run that would confirm it), record an open question on the state page, and write the gap text and include it in the answer. The gap text goes to the general engine plugin's roadmap if reachable, otherwise to the owner to file; it never goes into the project's own backlog or roadmap.

For a purpose that is not engine structure, quality or assets, an unavailable mapped skill means applying the process's own checks, recording an open question, and handing the owner the gap text for the plugin the map names.

### 9.2 Plugin map (signed off by the owner)

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

Changed after sign-off on 2026-10-26: Structure and architecture for Unreal (C++) now names `unreal-architecture` (with `unreal-native` kept for build and packaging); Quality for Unreal (C++) now names `unreal-quality` (with `unreal-native` for builds, captures and profiles); the Custom, Unity and Godot rows start the fallback chain at item 2; the document authoring row names `wiki-author` and `wiki-health`; the asset craft, text craft and launch rows name specific skills instead of plugin families; new rows for wiki scaffolding, skill quality and the second opinion at a gate. Owner re-confirmation pending at merge. The no-duplication rule is a development rule for this repository (do not re-create the engine, asset and test plugins inside it), not a runtime rule about chat: agents may discuss this plugin's process and the other plugins' guidance together, so chat is not scored for it. It is recorded in the repository's AGENTS.md.

### 9.3 Overlaps this plugin must not duplicate

- **Test phases and lanes:** `agent-tests:test-strategy` defines dev, test and production phases and lanes. game-quality maps its gates onto them (concept through production roughly to dev; beta to test; ship and live to production) and defers.
- **Launch readiness:** `agent-marketing` models launch gates. G5 points to it and keeps only engineering release criteria.
- **Document formats and validation:** wiki-master. The artifact catalog gives owner, path and ready definition only.
- **Skill quality:** the skill-audit skill in `hartye-skills`.

## 10. Adoption (existing projects)

`studio-start` detects an existing project and runs adoption. It never renames, overwrites or deletes.

1. **Inventory** the repository, the wiki, instruction files, roadmap, tests and agent configuration. Change nothing and copy no secret values.
2. **Tier and state page.** The owner confirms a rigor tier; the first state page is written as a new file with phase `adopt`.
3. **Map** each artifact in the catalog to `ready`, `draft`, `absent`, `reconstructed` or `conflicting`. Existing files are adopted in place and recorded in the registry; an existing file that does not meet its ready definition is `draft`.
4. **Reconstruct** only what is needed, as a new file labelled `reconstructed`; an existing file is never relabelled. Ask the owner for intent that cannot be recovered. Never fill a gap with plausible text.
5. **Place the project** in a phase by evidence and present the registry, phase and tier to the owner. The phase leaves `adopt` only when the owner confirms. Placement passes no gate.
6. **Turn gaps into backlog items** whose Fit line reads `fits - process document for <gate>`.
7. **Propose** the instruction-file block as a diff; the owner approves each line.
8. **Run the tooling audit** (section 11) as a proposal only.

## 11. Tooling audit (game-architect)

Scope: the project directory and project-scoped agent configuration. The owner's global configuration is out of scope; it is reported if it affects the project and never changed.

**Inventory categories:** (1) agent instruction files; (2) project skills, commands and prompt files; (3) plugins or extensions enabled or vendored for the project; (4) tool-server integrations; (5) automation the agent triggers; (6) permission allowlists; (7) agent residue (scratch files, caches, logs, automation profiles, stray plan files, stale worktrees); (8) instruction content duplicated from the wiki or from a plugin's guidance.

**In use** means at least one of: referenced by the routing table, plugin map or an instruction file; needed by a script or CI step; recorded use in the evidence window (by default the last 90 days of project history, or since the previous audit if more recent; the owner may change it); a declared dependency of a role skill. Anything else is a candidate.

**Outcomes per candidate:** `remove`, `replace-with-reference`, `merge`, `convert` (a rule that must not be forgotten becomes an enforced check), `ask-owner`.

**Procedure:** inventory; classify with evidence; write a proposal (item, evidence, risk, how to undo); owner approves; the architect makes one reversible change in version control; untracked items are listed for the owner and not deleted; secrets are never printed; record `notes/tooling-audit-<date>.md` and update the registry.

**Evidence of use is often unavailable.** The default is to ask the owner, never to delete on silence.

**When:** at adoption, at G2, before G5, whenever a tool or instruction file changes materially (short form), and on request.

## 12. Validation

Shipped content is data and prose. Validation is repository development tooling and does not ship.

- **Routing scenarios:** a set of prompts against fixture projects, each asserting which owner, document and procedure the agent picks, including negative cases where a precondition is missing and the agent must stop.
- **Skill routing and wording audit** with the skill-audit skill.
- **Document format:** wiki-master's validator on instantiated templates. As built (2026-10-26), fixtures are plain-text projects without wiki frontmatter, so the validator is not run on them; a reviewer ran it on instantiated templates and found only a dead link in the decision record template, since removed.
- **Hygiene test:** engine, tool, plugin and host names appear only where section 6.1 allows; no project- or machine-specific language.
- **Adoption fixtures:** an existing-project fixture with partial docs; assert no file is renamed and every reconstructed item is labelled.

## 13. Wiki-master enhancements

Raised by the owner's direction: wiki-master's current state does not limit requirements. Filed as roadmap items in the wiki-master project and linked from the plan.

1. **Declarative document and gate contracts:** a plugin ships data describing its document types (required sections, fields, closed status values, owner, ready definition) and its gates; wiki-master validates pages against them.
2. **Gate-check command:** evaluates a gate definition against wiki pages and repository evidence and reports met or unmet per requirement.
3. **Session brief command:** resolves the wiki project from the repository and prints the state, stale artifacts, blocked items and next step.
4. **Backlog fields:** `sprint`, `gate` and a design-readiness flag, with generated views. The flag must be named so it cannot be confused with the wiki tooling's "Ready to start", which means prerequisites are met. Dependencies between items (`depends-on`) shipped in wiki tooling 0.55.0, and a startable listing in 0.56.0.

Optional, lower priority: a generated state page derived from per-item files; staleness against a repository commit; plugin template packs; typed relations with invalidation; sign-off bound to a content hash; a shared asset ID and receipt convention across asset plugins; a faster close for small edits.

**Interim behavior without them:** the references state each contract in prose and the agent self-checks against it; dependencies use the `depends-on` field (wiki tooling 0.55.0 or later, a requirement of this plugin); the session report is read from the state page. This is weaker, which is why the enhancements matter.

## 14. Phasing

| Phase | Delivers |
|---|---|
| 1 | The references (the whole process, routing, vocabulary, catalog, planning, plugin map, adoption, tooling audit), `studio-start`, `game-master`, `game-architect`, templates, the hygiene and routing tests, a generic host adapter and one verified host adapter. Manifests and adapters for further hosts follow once each host's conventions are verified |
| 2 | `game-pm`, `game-quality` |
| 3 | `game-writer`, `game-artist`, `game-designer` |

The whole loop is defined in the references from phase 1, so before phase 2 the agent performs loop steps 4 to 6 by following `references/process.md` directly. Role skills add procedure; they do not hold the process. Likewise, until a role skill exists, the agent follows that role's routing row and its catalog entries directly, and the owner is the arbiter for that role's decisions.

## 15. Pilot and failure criteria

Pilot on one existing project of the owner's, at the minimal tier. Initial targets, to be revised before the pilot starts:

1. A fresh session given only the instruction-file block reports phase, next step and blockers matching the state page in 5 of 5 trials.
2. The scenario set has 34 scenarios. All 11 stop and gate scenarios must pass, and at least 21 of the 23 routing, deferral and adoption scenarios must choose the specified owner, document and procedure.
3. Adoption renames no file, and every reconstructed item is labelled.
4. The tooling audit produces a proposal with evidence for every item, and no removal happens without approval.
5. Gate overhead is measured (time and number of added steps per work unit) and reported.

**Failure** is the owner bypassing the gates in practice. Count and record every bypass. Two or more bypasses in a phase mean the tier or the step is wrong and must be revisited, not enforced harder.

## 16. Evidence and confidence

Public sources behind the design, with what each supports and its limit:

- Multi-agent failure taxonomy, Cemri et al., "Why Do Multi-Agent LLM Systems Fail?" (2025): 1,642 traces across 7 frameworks; role disobedience was 1.5% of failures, step repetition 15.7%, not knowing when to stop 12.4%. Supports putting value in scope, termination and verification, not persona wording. Benchmark tasks, not game production.
- Google Research, "Towards a Science of Scaling Agent Systems" (2026): every multi-agent variant lost 39–70% on a sequential planning benchmark; a central orchestrator contained error amplification (4.4x against 17.2x). Supports few handoffs and one orchestrating session.
- Zheng et al., personas in system prompts (2024): no accuracy gain on factual questions. Not agentic work.
- Wynn et al. and Yao et al. (2025): agreement drift in multi-agent debate. Abstract-level evidence.
- Politowski et al. (2020): 200 postmortems, 927 problems, mostly people and management; unclear design vision and misaligned teams recur. Released games only, self-reported.
- Washburn et al. (2016) and Murphy-Hill et al. (2014): postmortem and interview studies of game development practice.
- Colby and Colby: how independent studios use design documents. Four interviews.
- Valve's published employee handbook: a flat, self-assigned structure with hiring as the control. A company describing itself.
- A published investigation of a large studio's troubled launch: missing single decision owner. Anonymous sources, disputed by the company.
- Steam release documentation and the Xbox Requirements (version 16.4): external gates. Console certification beyond these is not covered.
- Scrum Guide 2020 and MADR 4.0: definition of done; decision-record format.
- A community agent-studio template reports, in its own README, that a 30-document process ranked below a 1-document one. Self-reported, unreplicated; the closest comparable and the reason for rigor tiers.
- Reports of shipped AI-generated placeholder assets: the reason for the provenance check at G5.

**Known evidence gaps:** no study tests a role-split agent team on game production; no source covers retrofitting a process onto a running project; console certification rulebooks other than Xbox are not held. The pilot is the test of these.

## 17. Open questions for the owner

- Whether the instruction-file scope also includes project-level subagent definitions, which this plugin does not use.
- Whether any asset class beyond key visuals should require game-master fit sign-off.
- The initial thresholds in section 15, which are proposals.
