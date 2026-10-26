# AGENTS.md

Instructions for agents that change this repository (not for agents that use the plugin).

## Separation of concerns

This plugin owns process: phases, gates, routing, the state page, the work loop and the document formats. It does not own technology or craft guidance. Engine, asset, sound, text, testing and launch guidance belongs to other plugins, which the plugin map points to.

- Do not re-create another plugin's guidance, checklists, commands or thresholds here. Point to it from the plugin map and stop.
- Name engines, tools and other plugins only in `references/plugin-map.md`. Name agent hosts only under `references/hosts/` (plus the manifest and the install line in the README). The hygiene test enforces both.
- If a process rule needs a technical answer, route to the owner of that answer and record where the answer lives. Do not paste it in.
- When another plugin lacks something this one needs, raise it as an enhancement for that plugin. Do not fill the gap here.

## Keeping the repository public-safe

- No machine paths, hardware names, or names of private projects in any file. That material belongs in the wiki.
- Test fixtures use the neutral demo project.

## Working rules

- Run `node scripts/check.mjs` before committing; it must pass.
- Skill files stay under 6500 bytes. Move detail into `references/`.
- Never commit to `main`; use a branch or worktree and squash-merge.
