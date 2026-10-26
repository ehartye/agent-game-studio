# Pilot on an existing project

Date: 2026-10-26
Host and version: Claude Code 2.1.311, non-interactive sessions with the plugin loaded from a checkout and the host's other plugins enabled (about 190 skills in the catalogue)
Plugin version: 0.1.0 (commit 183a0ac)
Companion plugins used: wiki-master 0.75.0, agent-unreal 0.17.0, agent-engine 0.22.0

## The project

A native Unreal Engine 5.8 game, built over about 22 phases by agents under its own process: a repository instruction file with working rules, a feature ledger, a test-risk file, about a thousand tracked files, and an existing wiki project with design, architecture, roadmap, 21 backlog items and 11 decision records. It had no brief with pillars and no studio state page. The owner drove: the owner's answers were relayed to the sessions word for word, and the owner approved or declined each outward step.

## Method

- **Isolation.** Every session ran in a git worktree of the project on a throwaway branch that was never committed, with the default branch of the main checkout untouched. Git was limited to read-only commands, and any command that pushes, commits, switches branches or changes remotes was denied. The real wiki was denied for read and write. Sessions wrote to a throwaway copy of the project's wiki folder.
- **Promotion.** The assistant that ran the pilot, not the session under test, copied reviewed pages into the real wiki through the wiki operation workflow (open, validate, refresh catalogs, log, commit with a scoped ledger, sync), only after the owner approved.
- **Checks.** After every turn the real wiki's commit and status, the main checkout's commit and status, the branch list and the worktree's commit were compared with their values before the turn. All were unchanged. One unrelated commit appeared in the real wiki between turns from another session; it touched none of the pilot's paths.
- **Sessions.** Adoption (one session, five turns), the first sprint (one fresh session, two turns) and the first work item (one fresh session, one turn). About 12 minutes of session time and about $9 at API rates; the owner's usage is on a subscription.

## What the adoption path did to existing files

| Check | Result |
|---|---|
| Existing files renamed, overwritten or deleted during adoption | none |
| Pages written in adoption | three new: the state page, one backlog item, one tooling audit proposal |
| Existing wiki pages mapped in place in the registry | yes (the brief row first pointed at the project's as-built overview; the owner chose a new brief page instead) |
| Reconstructed pages | none; the session declined to infer the pillars and asked |
| Instruction file | the full process block was shown as a diff and applied (14 added lines, no existing line changed) only after the owner said all lines; a later one-line path fix was applied only after the owner approved that exact change |
| Tooling audit | a proposal with three ask-owner items; nothing removed or changed |
| Existing page edited later | the architecture page, in a work item the owner chose, after the owner approved promoting the result (80 lines added, 12 stale lines replaced) |

## Skills that triggered

| Session | Skills loaded |
|---|---|
| Adoption | studio-start, game-master |
| First sprint | studio-start |
| First work item | studio-start, game-architect, then the Unreal architecture, native build and engine selection skills, then the wiki authoring skill |

The mapped Unreal rows were used for the first time on the work item. The planning sprint used the routing rows for roles without a skill of their own.

## Measures

| Measure | Result |
|---|---|
| Owner questions asked | 18 answers in 7 batches, plus one interrupted prompt that was asked again as options with trade-offs |
| Bypasses | 0 |
| Wrong gate decisions | 1 minor: the adoption session left the adopt phase on the owner's phase and tier answers before the owner had reviewed the registry. It recorded the review as pending, and the owner confirmed the registry the next turn. The brief gate was recorded as met on the owner's approval date, which is the plugin's rule for that gate |
| Fresh-session state | 2 of 2 fresh sessions found the state page from the instruction block alone; the first reported the phase, tier, next step and blocker exactly as the page held them, the second continued from the page's next step |
| State-page drift after three sessions | not measured: only two sessions started fresh from the page |
| Gate overhead | not separable from the work. The work item took 8.6 minutes of session time, most of it the verification the item was for |
| Project drift found by the process | three: a wiki overview and an architecture page that disagreed with the repository (12 stale lines on the architecture page, a test count off by 13), and a wrong path in the project's instruction file |

## Findings for the plugin

1. **Late-stage projects start at concept.** The placement table puts a playable game with no approved brief at concept because playable must be observed, and the session did not run the game. A project 22 phases in then needs a brief conversation before anything else. The owner accepted it, and the brief took three rounds. A retrospective-brief path, or a way to observe the existing capture evidence, may fit late projects better.
2. **The architect's edit rule reads two ways.** One rule lets the architect correct an architecture page to match the code; another says a delegation never approves an edit to an existing file. The session followed the first. State which applies to the architect's own documents.
3. **A plain status request drew a question.** "Where are we?" produced a correct report and then a question the page's next step already answered.
4. **One denied command ended shell use.** In sessions where a single shell command was denied, the session concluded the shell was unavailable and skipped the wiki validation and catalog steps, though the wiki scripts were allowed. It said so honestly, as the process requires. A fresh session with the shell permitted ran the whole workflow. Whether the plugin should say to try each wiki script on its own needs a real-host check.
5. **No standard way to find the wiki in a fresh session.** Sessions that could not read the environment variable searched the disk and timed out. The instruction block says to ask the wiki tooling; sessions did not always manage it.

## Limits

One project, one host, one owner. Sessions were automated, with the owner's answers relayed. No game was built or run, so no tool was signed off and the playable-slice evidence is still unobserved. The art and audio roles, the second-opinion step and the later phases were not exercised. The drift measure rests on two fresh sessions.
