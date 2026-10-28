# Planning

Planning happens when game-pm creates or revises the plan. It is meant to catch what a feature implies for every discipline before work starts, not to be rigid. Every default here can be struck by the owner; game-pm may strike an ordering default with a recorded reason. Process and checkpoints are in [the process](process.md); documents are in [the artifact catalog](artifact-catalog.md).

## Planning pass

For each feature:

1. **Expand.** Each discipline answers "what does this feature imply for me?" from its checklist below. Answers are proposals the owner may strike.
2. **Record.** Write the answers in the feature's backlog item under Implications, including each constraint on the constraints page (see [its template](templates/constraints.md)) that the feature touches. Only the owner adds or changes a constraint. Each piece of real work becomes its own backlog item whose `depends-on` entry names its prerequisites.
3. **Sequence.** Apply the ordering defaults.
4. **Group.** Fit the ordered items into sprints and checkpoints (set each item's Target checkpoint), confirming that the design artifacts each item needs are `ready`. If one is not, make producing it its own backlog item and add that item to the dependent item's `depends-on`.

After Brief approved, adding a feature or a change request reruns the pass for that feature only.

## Rolling wave

Plan in detail up to the next checkpoint and in outline beyond it. Re-plan at each checkpoint and on every change request. Do not detail work for checkpoints that are more than one checkpoint away.

## Discipline checklists

| Lens | Asks |
|---|---|
| game-artist | Animations, effects, sounds and music, environment pieces, interface art, using the needs matrix below |
| game-writer | Text, dialogue, item and interface copy, and when text locks for localization |
| game-architect | New tools or engine capabilities and whether they are ready; data formats; performance risk |
| game-quality | Test instrumentation and evidence needed; budget impact; regression risk; how each touched constraint will be measured |
| game-master | Fit against the pillars; whether a pillar must change |

## Needs matrix

Starting defaults. Tune them per project; strike what does not apply.

| Capability | Typically implies |
|---|---|
| Any character | Idle; each movement mode; hit reaction; defeat and spawn; timing and loop policy per action |
| Attacks | Wind-up, strike and recovery; a trail effect; an impact effect; swing and hit sounds |
| Moves over surfaces | Footsteps per material; dust or splash effects |
| Speaks | A voice or text set; expressions |
| Environment | Tile edges and transitions; a readability pass; an ambient bed; a music cue; hazard telegraphs, visual and audio |
| Effect | Intensity variants; a paired sound; a performance budget; a check that it does not hide gameplay |

## Ordering defaults

Defaults, not rules. Strike one with a recorded reason when the reason is not obvious.

1. Tool readiness before any feature work that needs the tool.
2. A scale-and-camera contract (stature, resolution or density, palette, camera angle), then a style frame. Changing the contract makes dependent sign-offs stale.
3. A hero asset of each type through the whole pipeline before batch production.
4. A greybox layout approved before level art.
5. Animation timing before the effects and sounds that depend on it.
6. Test instrumentation before the feature's verification.

## Art stages and sign-off

Stages, in order, written exactly as these values:

1. `brief`
2. `reference-approved`
3. `draft`
4. `craft-review`
5. `isolated-signoff`
6. `integrated`
7. `in-context-signoff`
8. `locked`

An item with no art is `not-applicable`. In the minimal tier, record the stage in the Art stage section of the backlog item, using the values in [the vocabulary](vocabulary.md). game-artist sets the stages up to `craft-review`, then `integrated` and `locked`; game-master sets `isolated-signoff` and `in-context-signoff` for key visuals; the owner's pick sets them for sound and music. Each sign-off adds a Signed line naming the version signed. A sign-off made against a contract or version that has since changed is stale: return the Art stage to `craft-review` and re-check it. Craft checklists belong to the asset plugins named in [the plugin map](plugin-map.md); do not restate them here.

| Asset class | Craft sign-off | Fit sign-off |
|---|---|---|
| Key visuals (heroes, hero environments, the style frame) | game-artist, using the asset plugin's checklist | game-master |
| Other visuals | game-artist, against the art bible | none |
| Sound and music | game-artist | the owner, by listening |
