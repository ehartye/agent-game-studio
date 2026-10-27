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

## Testing rules (agent-tests)

- `.testing/risk.yml` says which areas are critical, standard or low. Read it before adding or changing tests.
- One owner per invariant. Before adding a test, search for an existing test of the same behavior and extend it.
- Test behavior at seams (public functions, inputs, persistence, transfers), not implementation details. Do not
  assert on mocks alone, snapshot everything, or assert a value against itself.
- Add old-format compatibility tests only for declared obligations. Current missing/invalid-input handling is
  ordinary behavior and can need coverage even with no legacy consumers. The risk map decides.
- Tests must not depend on the checkout: no fixed ports (use port 0), no fixed temp paths (use mkdtemp), no
  absolute paths, no reading `.git` directly, no writes under the home directory.
- Declare the lane in the file's first comment, before any import: `/** @lane merge */` (edit, merge, scheduled or
  release). Tags are read only from that leading comment. If the test reaches code only through a subprocess or the
  network, add `@subject <path>` for that code, as a path from the project root (`src/cli.ts`, not an import-style
  `../src/cli.ts`, which is dropped). A test with no code subject gets `@risk <critical|standard|low>`.
- For a bug fix, write the failing test first and watch it fail for the reported reason. For any new test, check that
  it fails when the behavior it covers is broken.
- While editing, run only the tests for the files you changed. Run the project's merge script before pushing. Do
  not run the full suite after every change.
