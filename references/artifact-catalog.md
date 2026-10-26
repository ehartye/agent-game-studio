# Artifact catalog

Every standard document has one owner, one location, one template and a definition of ready. Paths are relative to `wiki/authored/<project>/` unless the Path column says otherwise. Authoring and validation of the documents follow the wiki tooling named in [the plugin map](plugin-map.md); this catalog gives only owner, path and ready definition. Status values are in [the vocabulary](vocabulary.md).

## Catalog

| Artifact | Tier | Path | Owner | Template | Ready means |
|---|---|---|---|---|---|
| State page | minimal | reference/studio-state.md | game-pm | state-page.md | Every field filled; Next step present; checked against the repository this session; an empty Open questions section reads "No open questions." |
| Game brief | minimal | overview.md | game-master | game-brief.md | One-sentence player experience; 3 to 5 pillars, each stating what it means and what it rules out; numbered non-goals; the owner's approval date |
| Decision record | minimal | decisions/<slug>-adr.md | decider | decision-record.md | Context, at least two options, Decision, consequences (good and bad), Decision-makers and Status filled; the frontmatter decision-status equals the Status section |
| Architecture | minimal | architecture.md | game-architect | architecture.md | Describes only what exists; matches the repository; Engine guidance used, Review standard and Tools sections filled; the Verified date equals the registry's Last verified |
| Backlog item | minimal | backlog/<slug>.md | game-pm | backlog-item.md | Fit line and Target gate recorded; all five Implications lines filled (none counts); Art stage filled (`not-applicable` counts); depends-on valid; Design artifacts lists what the work needs or says none required; expected acceptance evidence stated. Whether the listed artifacts are ready is checked at work-loop step 3, not here |
| Roadmap | minimal | roadmap.md | game-pm | generated | Generated from the backlog items and regenerated since the last backlog change; never edited by hand outside its generated region |
| Quality evidence | minimal | notes/quality-<gate-or-item-slug>.md (lowercase, for example `notes/quality-g2.md` or `notes/quality-enemy-patrol.md`) | game-quality | quality-evidence.md | Names the gate or item it supports; a Guidance used line (or none); each claim has what was run, how, the result, a link and its own evidence value; open defects listed |
| Agent instructions block | minimal | the project's agent instruction file(s) | game-architect | instruction-block.md | Contains the process block with <project> replaced by the project's wiki folder name and the three format slots left as written; each line approved by the owner (an approved diff, or the audit's Owner decision); the files agree with each other |
| Tooling audit record | minimal | notes/tooling-audit-<YYYY-MM-DD>.md | game-architect | tooling-audit.md | Every candidate has evidence, an outcome, a risk and an undo; the owner's decision is recorded |
| Art bible | standard | reference/art-bible.md | game-artist | later | Palette, silhouette and readability rules approved by game-master; a named tie-breaker; a list of named mistakes |
| Narrative bible and glossary | standard | reference/narrative-bible.md | game-writer | later | Canon, character voices, and glossary entries with one definition each; a Locked section with the lock date once G4 is checked |
| Test strategy | standard | reference/test-strategy.md | game-quality | later | Risk map, quality bar, performance budgets, severity scale, and the lanes the tests run in |
| Asset list | standard | reference/asset-list.md | game-artist | later | Every shipped asset with its stage, its provenance (human, AI-assisted or AI-generated) and its licence |
| Design spec | standard | reference/design-<system>.md | game-designer | later | Rules, numbers and edge cases for one system, linked to the pillar it serves |
| Risk register | full | reference/risk-register.md | game-pm | later | Each risk has an owner, a trigger and a response |
| Release criteria | full | reference/release-criteria.md | game-quality | later | Checkable criteria for G5, each with the evidence that satisfies it |
| Localization plan | full | reference/localization-plan.md | game-writer | later | Text lock date, languages, and the hand-off kit |
| Postmortem | full | notes/postmortem-<phase>.md | game-pm | later | What went right and wrong, including attempts that failed |
| Asset entry | full | reference/assets/<id>.md | game-artist | later | Capabilities, needs, stage, sign-offs with the version signed, and dependencies |

`Template` is `later` where the template ships in a later phase, and `generated` where the wiki tooling produces the document.

## Rules

- **One writer.** The Owner column names the only role that writes the document. Others review. The one exception: studio-start writes the first version of the state page on game-pm's behalf at bootstrap or adoption; nothing else changes owner. A gate's quality evidence note is written in sections by the gate's check owners (see How a gate is passed in the process), each writing only their own `## Claims: <role>` section. `decider` means the role whose routing row the decision falls under; when the owner decides (a waiver, a tier change, a conflict resolution), the agent in that session writes the record and names the owner in Decision-makers. Until game-designer exists, game-master writes design specs.
- **Tier.** Until the owner sets a tier, use `minimal`. The owner sets the tier at bootstrap or adoption and may raise it at design readiness or at a gate. A project may adopt a higher-tier document earlier when work needs it; once adopted it gets a registry row and its ready definition applies. Lowering the tier mid-phase needs a decision record.
- **Registry.** Every kind of document in the project's tier has one row on the state page: artifact, path, owner, status, last verified. A row whose path is a folder or a pattern covers every file it matches: `ready` only when every file is `ready`, `absent` when it matches none, otherwise `draft`; Last verified is the earliest date among them.
- **ADR suffix.** `-adr` in a decision record's file name stands for architecture decision record.
- **Template slots.** A document that still contains a `<...>` template slot or instruction is `draft`.
- **Page status.** The frontmatter `status` key is the wiki's page maturity. Never write an artifact status into it. Artifact status lives only in the state page registry.
- **Fit verdicts** live in the backlog item. A fit verdict becomes a decision record only when the owner overrides it, or accepts a `needs-pillar-change` by changing a pillar or non-goal.
- **Reconstructed documents** carry, on the first line after the title heading, `Reconstructed <YYYY-MM-DD> from <code, history or the owner's account>; not yet confirmed by the owner.` Their registry status is `reconstructed`. A reconstructed document is always a new file; an existing file is never relabelled. When the owner confirms, the line becomes `Reconstructed <YYYY-MM-DD> from <source>; confirmed by the owner <YYYY-MM-DD>.` and the status `ready`.
- **Outputs without a template of their own.** A change request is a decision record. A tool-readiness sign-off is the architecture page's Tools section plus the decision record. A course check is reported in the conversation and, if it changes the Next step, on the state page.
