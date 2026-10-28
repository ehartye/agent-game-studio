# Generic host

Use this when no adapter matches the host. Do not guess a host's conventions; ask the owner or inspect the project.

## Instruction files

Ask the owner which file(s) the host reads for project instructions. Look in the project root and its subfolders for files whose names suggest agent instructions. Ask the owner whether the host combines instruction files or lets one import another. If more than one exists, report where they disagree and ask which is authoritative.

## Where the audit categories live

Inspect the project directory by category, using version control to separate tracked from untracked files:

1. Instruction files: as above.
2. Project skills, commands and prompts: folders or files whose names contain "skill", "command" or "prompt", or that the owner names.
3. Plugins: ask the owner how the host enables them for a project, and read that configuration.
4. Tool servers: configuration files that name server commands or addresses.
5. Automation: configuration that names commands run on agent events, and scripts those commands call.
6. Permissions: configuration that lists allowed or denied commands or tools.
7. Residue: untracked files and folders created by tools, found with the version-control status including ignored files.
8. Duplicated instructions: compare instruction text against the wiki and against the guidance of the plugins in use.

Mark anything you could not locate as `ask-owner`.

## Checking skill availability

Use the skill list the current session advertises. If the host offers no list, ask the owner whether a named skill is installed.

## Install

Install the plugin and the wiki tooling with the host's own plugin or skill mechanism; see the host documentation. Do not guess a command.

## Blind review

Start a reviewer only if the host can run a second agent that has no shared context and cannot write. Give it file paths only: the checkpoint's criteria, the constraints page and the raw evidence, never the author's conclusions. If the host cannot, run no review and record it: set `blind-review: not-run` in the checkpoint review's frontmatter and write `no independent review ran - <the reason>` under Independent review. Do not review your own work and call it independent. If the owner declines the offer, set `blind-review: declined`.

## Limits

This file states no host facts. Nothing here has been checked against any host's documentation.
