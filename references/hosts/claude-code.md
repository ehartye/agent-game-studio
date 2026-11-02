# Claude Code

Use the session's advertised skills. Project instructions may live in CLAUDE.md or .claude/CLAUDE.md; settings, commands and skills may live under .claude/. Inspect relevant files and follow actual host precedence and permissions.

Studio does not choose an authoritative instruction file, move content between files or add a block by default. An optional [static pointer](../instruction-files.md) can link the project's wiki; it holds no Studio state.

## Install

Use the plugin mechanism: `/plugin marketplace add <source>`, then `/plugin install agent-game-studio@<marketplace>`. Development can use `claude --plugin-dir <path to a checkout>`. These forms were checked on 2026-10-26; consult host documentation if they differ.

## Optional review

Use a separate reviewer when useful and authorized. Give it the relevant task, criteria and evidence. Blind review is one possible approach, not a requirement. Preserve actual findings and limits.
