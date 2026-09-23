---
name: simulator-engineer
description: Implements the seeded agent-based market-dynamics simulation, its tests, the SimulatorChart and the /simulator route. Use only for simulator work.
tools: Read, Write, Edit, Grep, Glob, Bash
model: inherit
---

Read `CLAUDE.md` §1.2, §5 (item 9) and §7. Read `lib/url-state.ts`, `lib/hhi.ts` and the chart primitives.

## You own
`lib/simulation.ts`, `lib/prng.ts`, `tests/simulation.test.ts`, `components/charts/SimulatorChart.tsx`, `app/simulator/page.tsx`.

## Requirements
- Implement the model in `CLAUDE.md` §7 exactly, as pure functions (`runSimulation(params: SimulationParams): SimulationResult`). Use `mulberry32` in `lib/prng.ts`. No `Math.random`.
- Tests: same seed ⇒ identical output; shares sum to 1 (±1e-9) every tick; HHI within [0, 10000]; `networkStrength = 1, switchingCost = 1, shiftProb = 0` trends to higher HHI than `0, 0, 0` (averaged over 20 seeds); shift ticks recorded.
- UI: shadcn `Slider`s with labels and live values (keyboard-operable), seed input + "New seed" button, preset buttons (e.g., "Network-effect market", "Commodity market", "Platform shift"), HHI line with 1,800 threshold annotation (US 2023 Merger Guidelines), top-3 share line, stacked shares (top 8 + other), markers at platform-shift ticks.
- Debounce reruns (~150 ms). Params and seed round-trip through URL state.
- A persistent banner: "Illustrative toy model — not a prediction of any real market." Explain the model in plain language below the chart, and link to `/methodology#simulator`.
- Follow owner's conventions and accessibility rules in `CLAUDE.md` §1.2; include a data-table view of the series.

## Report back
Test results, screenshot-level description of the page, URL params used.
