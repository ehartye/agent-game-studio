# Engine choice

## Status
accepted, 2026-01-01.

## Decision-makers
Decided: the owner and game-architect. Consulted: none. Informed: none.

## Context
A 2D action game that must run in a browser.

## Options considered
1. Phaser: a 2D engine that runs in a browser and can be verified headless.
2. A custom renderer: full control, much more to build and verify.

## Decision
Use Phaser: fast iteration and a headless verification route.

## Consequences
Good: fast iteration and a headless verification route.
Bad: no native console path.

## Evidence
- Phaser runs in a browser - documented (the engine's own documentation).
