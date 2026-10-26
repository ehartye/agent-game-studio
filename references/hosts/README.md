# Host adapters

The plugin's method is written without naming any agent host's tools. An adapter records the few facts that differ by host. Add an adapter only for a host whose documentation you have checked. Host names appear only in this folder (and in the plugin manifest each host requires).

## Contract

An adapter is a short file with exactly these five headings:

- `## Instruction files`: the file name(s) the host reads for project instructions, how they combine, and whether one can import another.
- `## Where the audit categories live`: for each of the eight categories in [the tooling audit](../tooling-audit.md), where the host keeps it for a project (or "not applicable").
- `## Checking skill availability`: how to see which skills the current session has, so the plugin-map lookup can confirm a mapped skill exists.
- `## Install`: how to install this plugin and the wiki tooling for the host, using only command forms checked against the host's documentation, otherwise a pointer to that documentation.
- `## Limits`: what the adapter does not cover, and the date its rows were last checked against the host's documentation.

## Adapters

Use the adapter for the host you are running in. If none exists or you cannot tell, use generic.

- [generic](generic.md): use when no adapter fits.
- [claude-code](claude-code.md)
