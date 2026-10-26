# AGENTS.md

Instructions for agents that change this repository. They are not for agents that use the plugin.

## Separation of concerns

When adding content to agent-game-studio's skills, do not re-create the content of skills in our other agent-* plugins (engine, unreal, sprites, meshes, draw, beeps, prose, tests, marketing and the rest). When a skill needs that content, reference the plugin instead.

- This plugin owns process: phases, gates, routing, the state page, the work loop and the document formats. Technology and craft guidance belongs to the other plugins.
- References to other plugins live in `references/plugin-map.md`. Skills and other references point to the map; the hygiene test enforces it.
- If another plugin lacks something this one needs, raise it as an enhancement for that plugin. Do not fill the gap here.

## Keeping the repository public-safe

- No machine paths, hardware names or names of private projects in any file. That material belongs in the wiki.
- Test fixtures use the neutral demo project.

## Working rules

- Run `node scripts/check.mjs` before committing; it must pass.
- Skill files stay under 6500 bytes. Move detail into `references/`.
- Never commit to `main`; use a branch or worktree and squash-merge.
