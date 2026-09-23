# The Software Atlas — Project Instructions for Claude Code

You are the **orchestrator** for this project. Your job is to finish The Software Atlas using the research in `research.md` and the subagents in `.claude/agents/`. Read this whole file before doing anything.

## 0. Inputs

| File | Role |
|---|---|
| `research.md` | Phase 1 research (done). The single source of truth for facts, figures, sources and analysis. |
| `docs/BRIEF.md` | The original project brief, if present. If absent, this file contains everything you need. |
| `CLAUDE.md` | This file: specs, contracts, orchestration plan, definition of done. |
| `.claude/agents/*.md` | Subagents: `data-verifier`, `data-engineer`, `chart-engineer`, `simulator-engineer`, `app-engineer`, `qa-reviewer`. |

**Product:** an interactive, editorial data product about how software markets form, grow, consolidate, get disrupted and spawn new markets. Audience: founders, investors, product leaders, engineers. Two modes: **Story** (scrollytelling, 8–10 chapters) and **Explore** (free exploration, filters, cross-highlighting).

---

## 1. Non-negotiable rules

### 1.1 Research integrity (applies to every agent)
1. Every quantitative data point has `value`, `year`, `unit`, `sourceId`, `confidence` (`reported` | `estimated` | `modeled`).
2. **Never invent sources, URLs or precise figures.** A URL may only enter `data/sources.ts` if it was actually fetched or returned by a search in this project. If a number cannot be verified, use a `low`/`high` range and `estimated` or `modeled`, or omit it.
3. `modeled` points must include a `note` stating the method (e.g., "1 − cost of revenue ÷ revenue").
4. `research.md` marks figures ✓ (verified) or ◇ (from filings, not re-verified). A ◇ figure may ship as `reported` only after `data-verifier` confirms it and logs it in `docs/verification-log.md`. Otherwise ship it as `estimated` with a range, or drop it.
5. Market share by year is only shipped where public data exists (cloud infrastructure via Synergy is the flagship series). Empty `sharesByYear` is correct and the UI must render an explicit "No reliable public share data" state.
6. Keep fact / interpretation / analysis distinctions from `research.md` in any narrative copy (Story chapters, methodology page).
7. Anthropic (the maker of Claude) is a market participant. Treat it exactly like competitors, use third-party figures only, and keep the disclosure on the methodology page.

### 1.2 Code conventions (owner's preferences — follow exactly)
- TypeScript **strict**. Zero `any`, zero `@ts-ignore`, zero TODOs, placeholders or "add more data here" comments.
- **Early returns** wherever possible.
- **Tailwind classes only** for styling. No CSS files except `app/globals.css` (Tailwind layers, theme tokens) and where D3 strictly needs it.
- Conditional classes: use `cn()` (clsx + tailwind-merge) with **object syntax**, e.g. `cn("base", { "opacity-40": isDimmed })`. Avoid ternaries inside `className`.
- **Const arrow functions with explicit types**: `const toggleTheme = (): void => {}`. Define types for props and return values.
- Descriptive names. Event handlers prefixed with `handle`: `handleYearChange`, `handleKeyDown`.
- **Accessibility:** every interactive SVG element gets `tabIndex={0}`, `role`, `aria-label`, `onClick` **and** `onKeyDown` (Enter/Space activate; arrow keys move within a chart). Every chart has a "View as table" toggle. Respect `prefers-reduced-motion`. WCAG AA contrast in both themes.
- DRY: all charts use the shared primitives in `components/charts/primitives/`.
- Readability over cleverness. Performance only where specified (§6).

---

## 2. Stack

- Next.js (App Router) with `output: "export"` (fully static, no backend), TypeScript strict, TailwindCSS, shadcn/ui + Radix, D3 modules for scales and layouts (`d3-scale`, `d3-shape`, `d3-array`, `d3-hierarchy`, `d3-force`, `d3-zoom`, `d3-sankey`, `d3-interpolate`), rendering via React (D3 computes, React renders), Motion/Framer Motion for transitions, Zod for data validation, `next-themes` for dark/light, Vitest for unit tests.
- Use current stable versions and **pin exact versions** in `package.json`. Before using any library API you are unsure about, check its current docs (WebFetch) — do not guess APIs.
- Static export constraints: dynamic routes need `generateStaticParams`; any component reading `useSearchParams` must sit inside `<Suspense>`; `images.unoptimized: true`.

### Required `package.json` scripts
```
dev, build, start,
typecheck      → tsc --noEmit
lint           → next lint (or eslint .)
validate-data  → tsx scripts/validate-data.ts
test           → vitest run
prebuild       → npm run validate-data && npm run typecheck
```

---

## 3. Directory structure and file ownership

Ownership prevents parallel agents from editing the same files. **Only the owner edits a file.** Others request changes through the orchestrator.

```
software-atlas/
├─ research.md                         orchestrator (append-only changelog; verifier may correct figures)
├─ README.md                           orchestrator (Phase D)
├─ docs/verification-log.md            data-verifier
├─ docs/qa-report.md                   qa-reviewer
├─ app/
│  ├─ layout.tsx, globals.css          orchestrator (Phase A)
│  ├─ page.tsx                         app-engineer (Story)
│  ├─ explore/page.tsx                 app-engineer
│  ├─ markets/[id]/page.tsx            app-engineer
│  ├─ companies/[id]/page.tsx          app-engineer
│  ├─ emerging/page.tsx                app-engineer
│  ├─ simulator/page.tsx               simulator-engineer
│  └─ methodology/page.tsx             app-engineer
├─ components/
│  ├─ ui/                              orchestrator (shadcn generated)
│  ├─ charts/primitives/               orchestrator (Phase A); chart-engineer may ADD new primitives, never change existing signatures
│  ├─ charts/<ChartName>.tsx           chart-engineer (one file per chart)
│  ├─ charts/SimulatorChart.tsx        simulator-engineer
│  ├─ story/, explore/, profile/, layout/  app-engineer
├─ data/
│  ├─ types.ts, schemas.ts             orchestrator (Phase A) — the contract
│  ├─ sources.ts, eras.ts, markets.ts, companies.ts,
│  │  events.ts, emerging.ts, flows.ts, chapters.ts, rubric.ts   data-engineer
│  └─ index.ts                         orchestrator (Phase A)
├─ lib/
│  ├─ cn.ts, format.ts, scales.ts, selectors.ts, hhi.ts, url-state.ts   orchestrator (Phase A)
│  ├─ simulation.ts, prng.ts          simulator-engineer
├─ scripts/validate-data.ts            orchestrator (Phase A)
└─ tests/                              owner of the module under test
```

---

## 4. The data contract (`data/types.ts`)

Implement exactly this (extensions to the brief are marked `// ext`). `data/schemas.ts` mirrors it in Zod; `data/index.ts` parses every collection at import time and throws on failure.

```ts
export type Confidence = "reported" | "estimated" | "modeled";
export type Unit = "USD_B" | "USD_M" | "percent" | "count";

export type Source = {                                   // ext: source registry
  id: string;                    // "S01", "B04", or new "S28"+ added by agents
  title: string;
  publisher: string;
  date: string;                  // ISO or "YYYY-MM"
  kind: "filing" | "company" | "analyst" | "press" | "academic" | "book" | "legal";
  url?: string;                  // only if actually fetched/returned by search
  verified: boolean;             // true only if checked in this project
  reliability: "primary" | "secondary" | "low";          // ext
};

export type DataPoint = {
  value: number;
  low?: number;
  high?: number;
  year: number;
  unit: Unit;
  sourceId: string;              // ext: replaces free-text `source`
  confidence: Confidence;
  note?: string;                 // required when confidence === "modeled"
};

export type Category = "infrastructure" | "horizontal" | "vertical" | "consumer" | "emerging";
export type Archetype =                                                   // ext
  | "platform-giant" | "suite-consolidator" | "best-of-breed" | "vertical"
  | "commercial-oss" | "plg-challenger" | "pe-rollup" | "marketplace"
  | "ai-native" | "si-channel";

export type Era = {
  id: string; name: string; startYear: number; endYear: number | null;
  enablingTech: string[]; businessModel: string; summary: string;
  definingCompanyIds: string[];
  survivors: string[]; casualties: string[];            // ext: company ids
};

export type Market = {
  id: string; name: string; parentId: string | null; category: Category;
  originYear: number;
  definition: string;                                    // ext: what is counted
  sizeByYear: DataPoint[];
  sizeBand?: "XS" | "S" | "M" | "L" | "XL";              // ext: from research §3
  growthRate?: DataPoint;                                // ext: optional (may be unknown)
  hhi?: DataPoint;                                       // always modeled, with note
  pricingModel: string;
  buyerPersona: string;                                  // ext
  maturity: "nascent" | "emerging" | "scaling" | "consolidating" | "mature" | "declining";
  sharesByYear: { year: number; shares: { companyId: string; share: DataPoint }[] }[];
  description: string;
};

export type MoatKey = "network" | "switching" | "scale" | "data" | "brand" | "ecosystem" | "regulatory";
export type MoatScore = 0 | 1 | 2 | 3 | 4 | 5;

export type Company = {
  id: string; name: string; founded: number;
  archetype: Archetype; secondaryArchetypes: Archetype[];   // ext
  hq: string;
  status: "public" | "private" | "acquired" | "defunct";
  acquiredById?: string; acquiredYear?: number;              // ext
  revenueByYear: DataPoint[];
  marketCapByYear?: DataPoint[];                             // ext: bubble size
  grossMarginByYear?: DataPoint[];                           // ext: bubble size fallback
  marketIds: string[];
  moats: Record<MoatKey, MoatScore>;                         // modeled; rubric on methodology page
  moatRationale: string;                                     // ext: one sentence per non-zero score
};

export type EventType =
  | "acquisition" | "bundling" | "unbundling" | "disruption" | "regulation"
  | "license-change" | "platform-shift" | "pricing-shift" | "launch" | "spin-off"; // ext: spin-off

export type CompetitiveEvent = {
  id: string; year: number; month?: number;                  // ext
  type: EventType; title: string;
  companyIds: string[]; marketIds: string[];
  acquirerId?: string; targetId?: string;                    // ext: directed lineage edges
  dealValue?: DataPoint;
  status?: "announced" | "completed" | "abandoned";          // ext
  impact: string;
  sourceIds: string[];                                       // ext: every event is sourced
};

export type EmergingMarket = {
  id: string; name: string; category: Category;              // ext: radar quadrant
  thesis: string;
  signals: { type: "platform-shift" | "cost-curve" | "new-interface" | "regulation" | "unbundling" | "leading-indicator";
             evidence: string; strength: 1 | 2 | 3; sourceIds: string[] }[];
  keyPlayerIds: string[]; risks: string[];
  stage: "nascent" | "emerging" | "scaling" | "consolidating";
  horizon: "0-2y" | "2-5y" | "5y+";
};

export type BundlingFlow = {                                 // ext: for the Sankey
  id: string; year: number;
  fromMarketId: string;
  toId: string; toKind: "company-suite" | "market";
  direction: "bundle" | "unbundle";
  weight: 1 | 2 | 3;
  eventId: string;
};

export type StoryChapter = {                                 // ext
  id: string; order: number; title: string; kicker: string;
  body: string[];                // paragraphs; [F]/[I]/[A] tags preserved as badges
  graphic: "timeline" | "treemap" | "share" | "bubble" | "lineage" | "bundling" | "moat" | "emerging" | "simulator";
  graphicState: Record<string, string | number | string[]>;  // serialisable, same keys as URL state
};
```

### Referential integrity (enforced in `scripts/validate-data.ts`)
All ids referenced anywhere resolve; `parentId` chains are acyclic; every `sourceId` exists; `modeled` ⇒ `note`; `low ≤ value ≤ high`; `verified: true` ⇒ `url` present; no duplicate ids; acquisitions have `acquirerId` and `targetId`.

### Minimum volume (quality beats volume)
11 eras · 40+ markets · 80+ companies · 100+ events · 12 emerging markets (from research §7) · 25+ bundling flows · 9–10 story chapters.

---

## 5. Visualizations (all interactive, all with data-table alternative)

Charts are **pure presentational components**: they receive typed, already-filtered data and callbacks via props and never import from `data/`. Selectors in `lib/selectors.ts` do the filtering. This is what lets chart work run in parallel with data work.

| # | Component | Key behavior |
|---|---|---|
| 1 | `EraTimeline` | Horizontal, zoomable (d3-zoom); era bands, platform-shift markers, event dots in type lanes; click/Enter opens detail drawer; arrow keys step through events by year |
| 2 | `MarketTreemap` | Category → market; area = size at year (interpolate between points, flag interpolated as modeled); color toggle growth/maturity; hatched fill for estimated/modeled; year slider + play; unsized markets listed beneath ("not sized") rather than faked |
| 3 | `ShareStackedArea` | Per market; stacked shares + "Other"; HHI line (right axis) **and** top-3 share line; event annotations; empty state for markets without share data |
| 4 | `CompetitiveBubble` | x = revenue (log), y = YoY growth derived from revenue series, r = market cap or gross margin (toggle), color = archetype; play/pause across years; trails for pinned companies |
| 5 | `LineageGraph` | Force-directed acquisitions/spin-offs (acquirer → target); filter by decade and min deal size; pre-compute ~300 ticks in `useMemo`; focus highlights 1-hop neighborhood |
| 6 | `BundlingSankey` | d3-sankey; markets → suites/markets; bundle vs unbundle styling; click link → source event |
| 7 | `MoatRadar` | 7 axes, 0–5; up to 3 companies overlaid; "modeled" label; rationale on hover |
| 8 | `EmergingRadar` | Rings = horizon, quadrants = category, dot size = Σ signal strength, stable angle from id hash; click → sheet with thesis, signals + sources, risks |
| 9 | `SimulatorChart` + `/simulator` | Agent-based toy model (§7); persistent "Illustrative, not predictive" banner |
| 10 | Profiles | `/markets/[id]`, `/companies/[id]`: metrics grid, charts, event timeline, sources list |

### Shared primitives (Phase A, `components/charts/primitives/`)
`ChartFrame` (title, takeaway subtitle, source line, "View as table" toggle, reduced-motion aware) · `Axis` · `ChartTooltip` (value, year, source, `ConfidenceBadge` — always) · `Legend` · `ConfidenceBadge` · `HatchDefs` (SVG patterns: hatch = estimated, dashed stroke = modeled) · `DataTable` · `useChartSize` (ResizeObserver) · `useReducedMotion` · `useKeyboardNav` (roving focus for SVG marks) · `EmptyState`.

### Cross-cutting UX
- Global year scrubber syncs all Explore views.
- **URL state** (`lib/url-state.ts`): `mode, year, from, to, cat[], arch[], mat[], q, focus ("company:id" | "market:id" | "event:id"), pin[] (max 3), chart`. Zod-parsed with per-field defaults; `router.replace` with `scroll: false`. Unit test: `serialize(parse(x))` round-trips.
- Cross-highlighting: hovering a company in any view highlights it in all views (shared context).
- Comparison tray: pin up to 3 companies or markets; drives MoatRadar and profile comparison.
- Sources panel and `/methodology` page (confidence definitions, ✓/◇ explanation, sizing bands, HHI method, moat rubric, simulator model, known limitations, Anthropic disclosure).
- Search via shadcn `Command` (companies, markets, events).
- Mobile (≥ 375px): Bubble, Lineage and Sankey collapse to simplified lists/tables; Treemap and Timeline remain.

### Visual design
Editorial / data-journalism. Restrained neutral palette, one accent per category (5 accents, AA-contrast in both themes, defined as CSS variables mapped into Tailwind). Serif display headings + clean sans body. Generous whitespace. No default chart styling. Every chart: title, takeaway subtitle, source line.

---

## 6. Performance
Memoize selectors (`useMemo`) · lazy-load below-the-fold charts (`next/dynamic`, `ssr: false` for D3-heavy ones) · force layout precomputed, not animated per tick · smooth with 100+ nodes.

## 7. Simulator spec (`lib/simulation.ts`, pure and seeded)
```
params: networkStrength 0–1, switchingCost 0–1, entrantsPerTick 0–3, shiftProb 0–0.2, ticks 60, seed
init: 5 firms, equal share, quality ~ U(0.8, 1.2) via mulberry32(seed)
tick:
  attract_i = quality_i × (1 + 4 × networkStrength × share_i)
  churn_i   = share_i × 0.15 × (1 − effectiveSwitchingCost)
  pool      = Σ churn_i + 0.05 (new demand)
  share_i   = share_i − churn_i + pool × softmax(attract)_i
  add entrants (share 0.005, quality ~ U(0.7, 1.4))
  if rand < shiftProb: incumbents' quality × 0.6; spawn entrant quality 1.6;
                       effectiveSwitchingCost × 0.5 for 5 ticks
  prune share < 0.001; renormalize; record HHI (Σ (share×100)²) and top-3 share
output: { hhiSeries, top3Series, shareSeries (top 8 + other), shiftTicks }
```
Deterministic for a given seed (unit-tested). Params encoded in the URL.

---

## 8. Orchestration plan

Use the Task tool to launch subagents. Run independent tasks **in parallel** (multiple Task calls in one message). Never let two agents own the same file. After each phase, run the gate; do not advance until it passes.

### Phase A — Foundation (you, the orchestrator, sequentially)
1. Scaffold Next.js + TS strict + Tailwind + shadcn/ui + dependencies; configure static export, `next-themes`, fonts, theme tokens, `cn()`.
2. Write `data/types.ts`, `data/schemas.ts`, `data/index.ts`, `scripts/validate-data.ts`.
3. Write `lib/` foundation (`format`, `scales`, `selectors`, `hhi`, `url-state`) with tests.
4. Write all chart primitives and an app shell (header, nav, theme toggle, footer).
5. Create stub data files that export **empty typed arrays** so the project builds (these are replaced in Phase B; they are not placeholders in the final product).
**Gate A:** `npm run typecheck && npm run test && npm run build` pass.

### Phase B — Data (parallel)
- **B1 `data-verifier`**: work through `research.md` §9 verification backlog and every ◇ figure, highest-value first (revenue series used by the bubble chart). Output `docs/verification-log.md`. May extend Synergy cloud share series with more quarters/years if verifiable.
- **B2 `data-engineer`** (in parallel with B1): `sources.ts` (from research bibliography), `eras.ts`, `markets.ts`, `events.ts`, `emerging.ts`, `flows.ts`, `chapters.ts`, `rubric.ts`.
- **B3 `data-engineer`** (after B1 has logged the revenue series): `companies.ts` with revenue series, market caps where verifiable, moats + rationale.
**Gate B:** `npm run validate-data` passes; minimum volumes met; report counts by confidence level and by ✓ vs unverified.

### Phase C — Experience (parallel; can start as soon as Gate A passes, using stub/partial data)
- **C1 `chart-engineer`**: charts 1–4.
- **C2 `chart-engineer`** (second instance): charts 5–8.
- **C3 `simulator-engineer`**: simulation, tests, `SimulatorChart`, `/simulator`.
- **C4 `app-engineer`**: routes, Story mode, Explore mode (layout, filter bar, year scrubber, search, comparison tray, detail drawer, cross-highlighting), profiles, emerging, methodology.
**Gate C:** typecheck, tests, build pass; every chart renders with real data; URL state round-trips in the browser.

### Phase D — QA and finish
1. **`qa-reviewer`**: full audit against §9; writes `docs/qa-report.md` with prioritized findings.
2. Dispatch fixes to the owning agents; re-run `qa-reviewer` until no P0/P1 findings remain.
3. You write `README.md`: setup, scripts, data-update workflow (edit → validate → verify log), methodology summary, known data limitations (from `research.md` §0.4 and the verification log).

### Orchestrator rules
- Give each subagent a precise task: files it owns, inputs, acceptance criteria, and what to report back (files changed, commands run and results, open issues).
- Keep your own context lean: rely on agents' summaries; do not re-read files they own unless a gate fails.
- If an agent reports a contract change is needed (types, primitives), you decide, change the contract once, and notify affected agents.
- If network access to a source fails, do not substitute memory for verification. Log it as unverified.

---

## 9. Definition of done (verify every item before declaring completion)

- [ ] Every number has sourceId, year and confidence; no fabricated citations; all `verified: true` sources have fetched URLs
- [ ] 11 eras, taxonomy (40+ markets), archetypes, dynamics, 12 emerging markets and 8 case studies are represented in data and UI
- [ ] All 10 visualizations work, are interactive and cross-linked
- [ ] Story mode and Explore mode both work; URL state round-trips (tested)
- [ ] Keyboard navigation works in every view; every chart has a data-table alternative
- [ ] Estimated/modeled data visually distinct everywhere; tooltips always show value, year, source, confidence
- [ ] Dark and light modes work; AA contrast; responsive down to 375px
- [ ] `npm run build` produces a static export with zero TypeScript errors, zero lint errors, all tests passing
- [ ] No TODOs, placeholders or "add more data" comments (`grep -rniE "todo|fixme|placeholder|lorem" app components lib data` returns nothing relevant)
- [ ] README complete; `docs/verification-log.md` and `docs/qa-report.md` present

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
