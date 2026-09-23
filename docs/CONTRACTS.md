# Integration contracts — The Software Atlas

Owner: **orchestrator**. Nobody else edits this file. If you need a change, say so in
your report and the orchestrator will make it once and notify everyone affected.

These signatures are frozen so that chart work, simulator work and app work can run
in parallel. Build against them even if the other side has not landed yet.

---

## 1. Rules that apply to every chart

- Chart components are **pure presentational**. They receive already-filtered,
  already-typed data plus callbacks. They **never import from `data/*.ts` data files**.
  Importing `import type { … } from "@/data/types"` is allowed and expected — that is
  the shared vocabulary, not the dataset.
- They may import types and pure helpers from `@/lib/selectors`, `@/lib/scales`,
  `@/lib/format`, `@/lib/hhi`, `@/lib/cn`.
- Every chart is wrapped in `ChartFrame` and passes a `table` node built with
  `DataTable`.
- Every chart takes `sourceTitleFor: (sourceId: string) => string` when it shows
  tooltips, and uses it to fill `TooltipRow.source`. The app supplies it from
  `sourceTitle(sources, id)` in `@/lib/selectors`.
- Hover/selection callbacks are optional (`?`) so a chart can be dropped into a Story
  chapter with no interaction wiring; they are always supplied in Explore.
- Cross-highlighting uses `highlightedCompanyId` / `highlightedMarketId` props plus
  `onHoverCompany` / `onHoverMarket` callbacks. The app owns the shared context.

Shared prop fragment used below:

```ts
export type ChartInteractionProps = {
  sourceTitleFor: (sourceId: string) => string;
  highlightedCompanyId?: string | null;
  highlightedMarketId?: string | null;
  onHoverCompany?: (companyId: string | null) => void;
  onHoverMarket?: (marketId: string | null) => void;
};
```

Each chart file declares its own props type and re-declares these fields inline;
there is no shared props base class to keep the signatures readable.

---

## 2. Chart props (chart-engineer C1 — charts 1–4)

### `components/charts/EraTimeline.tsx`

```ts
export type EraTimelineProps = {
  eras: readonly Era[];
  events: readonly CompetitiveEvent[];
  fromYear: number;
  toYear: number;
  focusEventId?: string | null;
  onSelectEvent?: (eventId: string) => void;
  onSelectEra?: (eraId: string) => void;
  sourceTitleFor: (sourceId: string) => string;
  highlightedCompanyId?: string | null;
  onHoverCompany?: (companyId: string | null) => void;
};
export const EraTimeline: (props: EraTimelineProps) => React.ReactElement;
```

### `components/charts/MarketTreemap.tsx`

```ts
import type { MarketSizeAtYear } from "@/lib/selectors";

export type TreemapColorMode = "growth" | "maturity";

export type MarketTreemapProps = {
  sized: readonly MarketSizeAtYear[];
  /** Markets with no size data at this year; listed beneath, never faked. */
  unsized: readonly Market[];
  year: number;
  minYear: number;
  maxYear: number;
  colorBy: TreemapColorMode;
  onColorByChange?: (mode: TreemapColorMode) => void;
  onYearChange?: (year: number) => void;
  onSelectMarket?: (marketId: string) => void;
  sourceTitleFor: (sourceId: string) => string;
  highlightedMarketId?: string | null;
  onHoverMarket?: (marketId: string | null) => void;
};
```

### `components/charts/ShareStackedArea.tsx`

```ts
import type { ShareSeriesPoint } from "@/lib/selectors";

export type ShareStackedAreaProps = {
  marketName: string;
  series: readonly ShareSeriesPoint[];
  /** companyId -> display name, for legend, tooltip and table. */
  companyNames: Readonly<Record<string, string>>;
  /** Annotated on the x axis; already filtered to this market. */
  events: readonly CompetitiveEvent[];
  sourceTitleFor: (sourceId: string) => string;
  onSelectEvent?: (eventId: string) => void;
  highlightedCompanyId?: string | null;
  onHoverCompany?: (companyId: string | null) => void;
};
```

Empty `series` must render `EmptyState` with the title
**"No reliable public share data"** and a description naming the market.

### `components/charts/CompetitiveBubble.tsx`

```ts
import type { BubbleDatum } from "@/lib/selectors";

export type BubbleSizeMetric = "marketCap" | "grossMargin";

export type BubbleTrailPoint = { year: number; revenue: number; growth: number };

export type CompetitiveBubbleProps = {
  data: readonly BubbleDatum[];
  year: number;
  minYear: number;
  maxYear: number;
  sizeMetric: BubbleSizeMetric;
  onSizeMetricChange?: (metric: BubbleSizeMetric) => void;
  onYearChange?: (year: number) => void;
  pinnedIds: readonly string[];
  /** companyId -> its path up to `year`; supplied only for pinned companies. */
  trails: Readonly<Record<string, readonly BubbleTrailPoint[]>>;
  onTogglePin?: (companyId: string) => void;
  onSelectCompany?: (companyId: string) => void;
  sourceTitleFor: (sourceId: string) => string;
  highlightedCompanyId?: string | null;
  onHoverCompany?: (companyId: string | null) => void;
};
```

---

## 3. Chart props (chart-engineer C2 — charts 5–8)

### `components/charts/LineageGraph.tsx`

```ts
import type { LineageGraphData } from "@/lib/selectors";

export type LineageFilters = {
  fromYear: number;
  toYear: number;
  minDealValueUsdB: number;
};

export type LineageGraphProps = {
  graph: LineageGraphData;
  filters: LineageFilters;
  onFiltersChange?: (filters: LineageFilters) => void;
  focusCompanyId?: string | null;
  onSelectCompany?: (companyId: string) => void;
  onSelectEvent?: (eventId: string) => void;
  eventTitleFor: (eventId: string) => string;
  sourceTitleFor: (sourceId: string) => string;
  highlightedCompanyId?: string | null;
  onHoverCompany?: (companyId: string | null) => void;
};
```

The force layout runs ~300 ticks inside `useMemo` keyed on the graph and filters; it
is never animated tick by tick.

### `components/charts/BundlingSankey.tsx`

```ts
import type { SankeyInput } from "@/lib/selectors";

export type BundlingSankeyProps = {
  input: SankeyInput;
  fromYear: number;
  toYear: number;
  onSelectEvent?: (eventId: string) => void;
  eventTitleFor: (eventId: string) => string;
  highlightedMarketId?: string | null;
  onHoverMarket?: (marketId: string | null) => void;
};
```

Node ids are prefixed (`market:<id>`, `company-suite:<id>`); strip the prefix before
calling `onHoverMarket`.

### `components/charts/MoatRadar.tsx`

```ts
export type MoatRadarCompany = {
  id: string;
  name: string;
  moats: Record<MoatKey, MoatScore>;
  moatRationale: string;
};

export type MoatRadarProps = {
  /** Up to three; the app enforces the cap through the comparison tray. */
  companies: readonly MoatRadarCompany[];
  rubric: MoatRubric;
  onRemoveCompany?: (companyId: string) => void;
  highlightedCompanyId?: string | null;
  onHoverCompany?: (companyId: string | null) => void;
};
```

Every moat score is `modeled`; the chart carries a permanent "Modeled" label and the
rubric level text appears on hover and focus.

### `components/charts/EmergingRadar.tsx`

```ts
export type EmergingRadarProps = {
  markets: readonly EmergingMarket[];
  selectedId?: string | null;
  onSelectMarket?: (marketId: string) => void;
  sourceTitleFor: (sourceId: string) => string;
};
```

Rings are `horizon` (`0-2y` innermost), **sectors** are `category`, dot area is the sum
of `signal.strength`, and the angle inside a sector comes from `angleFromId(id)` in
`@/lib/scales` so it is stable across renders.

---

## 4. Simulator (simulator-engineer C3)

`lib/simulation.ts` exports:

```ts
export type SimulationParams = {
  networkStrength: number;   // 0-1
  switchingCost: number;     // 0-1
  entrantsPerTick: number;   // 0-3
  shiftProb: number;         // 0-0.2
  ticks: number;
  seed: number;
};

export type SimulationSeriesPoint = { tick: number; value: number };

export type SimulationShareSeries = {
  /** "firm-3" for a surviving firm, "other" for the pooled tail. */
  id: string;
  label: string;
  values: readonly number[];   // one entry per tick, share as a fraction 0-1
};

export type SimulationResult = {
  hhiSeries: readonly SimulationSeriesPoint[];
  top3Series: readonly SimulationSeriesPoint[];
  shareSeries: readonly SimulationShareSeries[];   // top 8 plus "other"
  shiftTicks: readonly number[];
};

export const runSimulation: (params: SimulationParams) => SimulationResult;
export const SIMULATION_PRESETS: readonly {
  id: string;
  label: string;
  description: string;
  params: SimulationParams;
}[];
```

`components/charts/SimulatorChart.tsx` exports **two** components:

```ts
/** Pure: draws the three series. Used inside SimulatorPanel and by Story. */
export type SimulatorChartProps = {
  result: SimulationResult;
  params: SimulationParams;
};
export const SimulatorChart: (props: SimulatorChartProps) => React.ReactElement;

/** Self-contained: sliders + seed + presets + chart. Used by /simulator and Story. */
export type SimulatorPanelProps = {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  /** Story mode passes true: fewer controls, no page-level heading. */
  compact?: boolean;
};
export const SimulatorPanel: (props: SimulatorPanelProps) => React.ReactElement;
```

URL keys for the simulator are already defined in `lib/url-state.ts`:
`net` (networkStrength), `sw` (switchingCost), `ent` (entrantsPerTick),
`shift` (shiftProb), `ticks`, `seed`. Use `parseAtlasState` / `serializeAtlasState`;
do not invent new keys.

---

## 5. App integration (app-engineer C4)

- All URL state goes through `@/lib/url-state`. Keys: `mode, chart, year, from, to,
  cat, arch, mat, q, focus, pin, net, sw, ent, shift, ticks, seed`. Lists serialise
  comma-joined; defaults are omitted from the query string.
- `exploreHrefFromGraphicState(chapter.graphicState)` builds the "Explore this view"
  link for a Story chapter. Chapter `graphicState` keys must be a subset of the URL
  keys above.
- `chapter.graphic === "simulator"` renders `<SimulatorPanel compact />`.
- Charts are lazy-loaded with `next/dynamic` and `ssr: false`.
- Any component reading `useSearchParams` sits inside `<Suspense>`.
- `generateStaticParams` is required on `app/markets/[id]` and `app/companies/[id]`.
- The app shell (`app/layout.tsx`, `components/layout/SiteHeader.tsx`,
  `SiteFooter.tsx`, `ThemeToggle.tsx`, `AtlasProviders.tsx`) was written in Phase A
  and is handed over to app-engineer; extend it rather than replacing it.

---

## 6. Data contract notes for data-engineer

- `data/rubric.ts` was written in Phase A with a complete seven-moat, six-level
  rubric. Refine the wording if you disagree with a level, but keep the shape.
- `lib/hhi.ts` exports `HHI_METHOD_NOTE`; use it (or a more specific sentence) as the
  `note` on every modeled `hhi` data point.
- `graphicState` keys must match §5 above, and values must be `string | number |
  string[]`.
- `flows[].toKind === "company-suite"` means `toId` is a **company** id;
  `"market"` means `toId` is a **market** id. The validator enforces this.

---

## 7. Running commands while others are working

The whole team shares one working tree. **Do not run `npm run build`** while other
agents are active — concurrent Turbopack builds fight over `.next/`. Use:

```
npm run typecheck
npm run lint
npm run test
npm run validate-data
```

The orchestrator runs `npm run build` at each gate.

---

## 8. Orchestrator rulings (added after the simulator landed)

### 8.1 Route pattern for pages that read URL state — applies to every route

`output: "export"` plus `useSearchParams` plus per-page `<title>` pull in three
directions. The settled pattern, which **every** route must follow:

- `app/<route>/page.tsx` is a **server component**. It exports `metadata` and renders
  a `<Suspense>` boundary around a client component.
- The client component holds `useSearchParams`, `useRouter` and all URL-state logic.
- The client component lives in the folder owned by whoever owns that route's UI.

```tsx
// app/explore/page.tsx  — server component
import { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreRoute } from "@/components/explore/ExploreRoute";

export const metadata: Metadata = { title: "Explore" };

const ExplorePage = (): React.ReactElement => (
  <Suspense fallback={<ExploreSkeleton />}>
    <ExploreRoute />
  </Suspense>
);

export default ExplorePage;
```

Without this, the page cannot export `metadata` and every tab falls back to the
layout default title.

### 8.2 Accepted deviations — simulator (do not re-flag these in QA)

1. `lib/simulation.ts` additionally exports `normalizeParams`, `OTHER_SERIES_ID` and
   `SIMULATOR_DISCLAIMER`. The frozen signatures in §4 are unchanged. **Accepted.**
2. Units, which §4 left open and are now fixed: `hhiSeries[].value` is HHI points
   (0–10,000); `top3Series[].value` is **percentage points (0–100)**;
   `shareSeries[].values` are fractions (0–1). Both line series carry one point per
   tick, numbered 1…ticks, with no tick 0. **Accepted.**
3. "Top 8" means top 8 **by peak share across the run**, not by final share, so a firm
   that led and then collapsed after a platform shift stays visible instead of
   vanishing into "other". **Accepted** — it is the more honest reading.
4. `SimulatorChart` does **not** use `ChartTooltip`. Its props are frozen to
   `{ result, params }` with no `sourceTitleFor`, and the model has no year and no
   source to cite. The always-visible `aria-live` readout strip plus the permanent
   `modeled` confidence badge in the table view cover the §5 intent. **Accepted —
   qa-reviewer must not record this as a missing tooltip.**

### 8.3 `ATLAS_DEFAULTS.ent` changed from 1 to 0

With any entrant flow, the §7 softmax spreads new demand almost uniformly across a
growing firm population, so every market fragments regardless of `networkStrength`
(mean final HHI ≈ 189 at `net=1,sw=1,ent=1` versus ≈ 164 at `net=0,sw=0,ent=1`). At
`ent=0` the dial works as the narrative needs (≈ 2,525 versus ≈ 2,020). The default is
now `ent: 0` so the unparameterised `/simulator/` view demonstrates the model rather
than flattening it. The model itself is untouched — this is a default, not a change to
§7.

### 8.4 Required content for `/methodology#simulator` (app-engineer)

The anchor `#simulator` **must exist** — the simulator UI links to it twice. It has to
carry:

- The five equations from `CLAUDE.md` §7 stated in words, with the constants.
- That **ticks are not years and firms are not companies**.
- The HHI definition and the 1,800 threshold, attributed to the US DOJ/FTC 2023
  Merger Guidelines.
- The limitation that **entrant flow dominates concentration in this model**: with
  `entrantsPerTick ≥ 1` the softmax flattens outcomes (numbers in §8.3 above), which
  is a property of the specified model, not a bug, and is why the default is 0.
- The "Illustrative toy model — not a prediction of any real market" disclaimer.

### 8.5 Bubble-chart size metric — `marketCap` is not backed by data

Verification (Phase B1) found **no citable market-cap series**: share price is not in
SEC XBRL, and no source was reachable that would let one be built without
fabrication. `marketCapByYear` therefore ships **empty for every company**.

Rulings:

- `BubbleSizeMetric` in `lib/selectors.ts` is now
  **`"marketCap" | "grossMargin" | "revenue"`** — `"revenue"` is a first-class choice,
  not only the silent fallback. `docs/CONTRACTS.md` §2 `CompetitiveBubbleProps` is
  amended accordingly; this is the only contract change, and it is additive.
- `lib/selectors.ts` exports **`availableSizeMetrics(companies)`**, returning only the
  metrics the loaded dataset can support. **The app must offer only those** in the
  toggle, and must not render a `marketCap` option that silently draws revenue.
  Where market cap is unavailable, say so in one line near the control rather than
  hiding it.
- `grossMarginByYear` is being back-filled as **`modeled`** data, derived as
  `1 − cost of revenue ÷ revenue` from SEC XBRL — the exact method `CLAUDE.md` §1.1
  rule 3 names as its worked example. Every such point carries that sentence as its
  `note`. Until it lands, `availableSizeMetrics` will simply not offer it.

### 8.6 SAP revenue is reported in EUR and will not ship as a revenue series

The `Unit` enum has no `EUR_B` member, and converting EUR to USD without a verified
period-matched FX rate would be fabrication. **SAP ships with an empty
`revenueByYear`** and remains a full participant everywhere else — market membership,
archetype, moats, events and the lineage graph. Extending `Unit` was considered and
rejected: mixing currencies on one revenue axis would make the bubble chart and the
treemap quietly wrong, which is worse than an absent series.

### 8.7 Source ID blocks — final allocation

| Block | Owner | Status |
|---|---|---|
| S01–S27 | `research.md` bibliography | fixed; **S10 and S19 retired, never reuse** |
| S28–S39 | data-verifier, Phase B1 | used |
| S40–S59 | data-engineer | in use |
| **S60–S79** | **data-verifier**, deal-table sources drafted in verification-log §7.1 | **confirmed** |
| S80+ | data-engineer, if S40–S59 runs out | free |
| B01–B10 | books / papers / legal | fixed; `verified: false`, no URL |

### 8.8 Accepted deviations — simulator, second pass

`components/charts/SimulatorChart.tsx` exports four things: `SimulatorChart`,
`SimulatorPanel`, `SimulatorRoute` and `SimulatorDisclaimer`. The two frozen §4
signatures are untouched. **Accepted.** The disclaimer renders once in the route
shell (server-rendered, outside the Suspense boundary) and once inside
`SimulatorPanel` when `compact`, so a Story embed is never unlabelled and the route
never shows two stacked banners; the `ChartFrame` footnote carries the sentence
unconditionally as a safety net. **Accepted.**

### 8.9 Gross margin landed — 236 company-years, 23 companies

The second verification pass derived `grossMarginByYear` for 23 companies
(verification-log §9). Consequences:

- `availableSizeMetrics(companies)` now returns `["grossMargin", "revenue"]`.
  `"marketCap"` is never offered, per §8.5.
- Every gross-margin point is `confidence: "modeled"` with the note
  `"Modeled: 1 − cost of revenue ÷ revenue, both as filed."` (extended where a tag
  fallback was used). **None may ship as `reported`**, even though both inputs are
  filed — the ratio is our derivation. No `low`/`high`: the inputs are exact.
- Dropped for lack of a clean total-cost-of-revenue tag: Oracle, Workday, Intuit,
  VMware, Cadence. IBM FY2019–20 are skipped for a Kyndryl spin-off basis mismatch;
  the rest of IBM's series ships. AWS has no segment-level margin — use consolidated
  Amazon margin, labelled as such.
- **Chart design constraint for `CompetitiveBubble`:** gross margin spans only
  ~35–91%, and 65–85% for most companies. A radius scale over that domain makes every
  bubble identical. Anchor the radius domain near zero, or set a visible minimum
  radius with an explicit legend — otherwise the channel carries no information.

### 8.10 SAP, closed

SAP's XBRL record holds exactly **one** USD convenience-translation figure (FY2017
revenue $28.205B, from a Form 20-F). One point yields no year-over-year growth, so it
cannot place SAP on the bubble chart. **Ruling §8.6 stands**: SAP ships with an empty
`revenueByYear`. The FY2017 figure is citable in narrative copy if wanted.

### 8.11 Accepted deviations — charts 4, 5, 6

1. **`availableSizeMetrics?: readonly BubbleSizeMetric[]` added to
   `CompetitiveBubbleProps`** (additive, optional). The metric toggle is built from
   it, never from a hard-coded list. **Accepted** — the app must pass
   `availableSizeMetrics(companies)` from `lib/selectors.ts`.
2. **Bubble radius rule.** Extensive metrics (revenue, market cap) use radius ∝ √value
   over `[0, max]`, so area carries magnitude. Gross margin uses radius ∝ value
   linearly over the full `[0%, 100%]` domain, anchored at zero, with a 3px minimum
   and a legend of sized reference circles stating the rule in words. **Accepted** —
   this is the right answer to the §8.9 dynamic-range problem.
3. **Mixed-metric marks.** When `sizeMetric` is `grossMargin`, companies with no
   margin figure are drawn as small dashed rings at a fixed radius, counted in the
   source line and named in their `aria-label`, rather than silently sized by a
   revenue fallback on a percentage scale. **Accepted.**
4. **`LineageGraph` accepts `sourceTitleFor` but never calls it**, because
   `LineageLink` carries no `sourceId`. Each edge cites its deal through the event it
   opens and the footnote says so. **Accepted for now.** Adding `sourceIds` to
   `LineageLink` in `lib/selectors.ts` would make the prop meaningful; logged as a P3
   improvement, not a blocker.
5. **Sankey node rectangles are hover targets, not tab stops**; the ribbons are the
   focusable marks and each `aria-label` names both endpoints, year, weight and event.
   `LineageGraph` runs two roving groups (companies, deals) because they activate
   different things. **Accepted** — a tab stop that activates nothing is worse.
6. New primitives `atlasBubbleMath.ts`, `atlasForceLayout.ts`, `useNarrowViewport.ts`.
   `useNarrowViewport` exists because `ChartFrame` reads `defaultView` only in its
   `useState` initialiser, so the breakpoint must be known on the first client render;
   the frame is remounted via `key` when the breakpoint is crossed. **Accepted.**

### 8.12 Integration requirement for app-engineer — memoise the selectors

`lineageGraph(...)`, `sankeyInput(...)` and `bubbleData(...)` return new object
identities on every call, and `LineageGraph` keys its 300-tick force layout on the
`graph` object identity. **Wrap all three in `useMemo` in the route**, or the force
simulation re-runs on every render and Explore will crawl.

---

## 9. Deferred decisions — open, revisitable, not forgotten

Things deliberately **not** done, with enough detail to reverse cheaply. Nothing here
is a defect; each is a scope judgment that could reasonably go the other way.

### 9.1 Four view controls are local state, not URL state

**Raised by:** app-engineer, at the end of the route build.
**Decision:** leave them as local component state. **Status:** open.

These four controls do **not** round-trip through the URL:

| Control | Where | Current state |
|---|---|---|
| Treemap colour mode (growth / maturity) | `MarketTreemap` via `ExplorePanel` | local |
| Bubble size metric (grossMargin / revenue) | `CompetitiveBubble` via `ExplorePanel` | local |
| Lineage minimum deal value | `LineageGraph` via `ExplorePanel` | local |
| Emerging horizon filter | `EmergingRoute` | local |

Category and stage on `/emerging` **do** round-trip, as `cat` and `mat`.

**Why it was left.** `CLAUDE.md` §5 "Cross-cutting UX" specifies the URL-state key set
exactly: `mode, year, from, to, cat[], arch[], mat[], q, focus, pin[], chart` (plus the
simulator's own keys). None of these four is on that list, so local state is compliant
with the brief as written, and the round-trip test in `tests/url-state.test.ts` passes
over the specified set. Widening the contract after Gate C, purely to gold-plate,
risked destabilising a green build for no requirement.

**Why it might still be worth doing.** A reader who lands on the bubble chart sized by
gross margin and sends someone the link hands them a chart sized by whatever the
default is. That is a genuine sharing defect, just not one the brief asked us to fix.
It matters most for the bubble metric and the treemap colour mode, least for the
lineage threshold.

**How to reverse (about an hour, one agent):**
1. `lib/url-state.ts` — add keys to `AtlasState`, `ATLAS_DEFAULTS` and
   `SERIALIZE_ORDER`; parse each with a `.catch(default)` like the existing simulator
   params. Suggested short keys: `color` (`growth` | `maturity`), `size`
   (`grossMargin` | `revenue`), `deal` (number, USD_B), `hor` (`0-2y` | `2-5y` | `5y+`).
2. `tests/url-state.test.ts` — extend the round-trip fixtures; the existing
   `serialize(parse(x))` fixed-point test then covers them automatically.
3. `components/explore/useAtlasState.ts` — surface the new fields.
4. `ExplorePanel` / `EmergingRoute` — replace the `useState` calls with state+setter
   from `useAtlasState`.
5. Optionally let `data/chapters.ts` `graphicState` use the new keys, so a Story
   chapter can pin a specific colour mode or size metric.

Nothing else depends on these being local, and no chart signature changes — every
affected chart already takes the value plus an `on*Change` callback as props.

### 9.2 `LineageLink` carries no `sourceIds`

**Raised by:** chart-engineer (charts 4–6). **Status:** open, logged as P3 in §8.11.4.

`LineageGraph` accepts `sourceTitleFor` but never calls it, because `LineageLink` in
`lib/selectors.ts` has no source ids to resolve. Each edge cites its deal through the
event it opens, and the tooltip footnote says so, which satisfies traceability. To
close it: add `sourceIds: string[]` to `LineageLink`, populate it from
`event.sourceIds` in `lineageGraph(...)`, and render them in the edge tooltip.

### 9.3 `verified: true` on the paywalled Bloomberg source (S78)

**Status:** open, referred to `qa-reviewer`.

`S78` (OpenAI $40B run rate) was confirmed from a **search-result headline**; the
article body is paywalled and was not read. `CLAUDE.md` §1.1 rule 2 permits a URL that
was "returned by a search", and the downstream data point ships as `estimated` with a
range, so nothing is overstated numerically. What is arguable is whether `verified:
true` — defined in `data/types.ts` as "checked in this project" — is the right flag for
a source whose body nobody read. Left as-is pending the QA audit rather than changed
unilaterally, because the same question applies to any search-confirmed source and
should be answered once, consistently.

---

## 10. Chart legibility standard (binding on every chart)

Added after the owner's first visual review. Screenshots showed era-band labels
overlapping each other, treemap tile labels colliding with category headings, Sankey
node labels sitting on top of ribbons, and a radar tooltip so tall it covered the
chart it described. The cause is the same everywhere: **labels are drawn without
asking whether there is room for them.** These rules are binding on all ten
visualizations, and `qa-reviewer` checks them.

### 10.1 Never draw a label that does not fit

Before rendering any text inside a shape (era band, treemap tile, Sankey node, radar
sector), measure the space and choose one of three outcomes:

1. **Fits** — draw it.
2. **Nearly fits** — truncate to the available width with a trailing ellipsis, and put
   the full string in a `<title>` and in the mark's `aria-label`.
3. **Does not fit** — draw nothing. The tooltip, the table view and the `aria-label`
   still carry the full text, so nothing is lost.

Use a shared helper for this rather than one per chart. Estimate width with an
em-based approximation (roughly `0.55em` per character for the body sans at the sizes
we use) — do not call `getComputedTextLength` during render.

**Minimums:** never draw a label in a box narrower than ~48px or shorter than ~14px.
Era bands, treemap tiles and Sankey nodes all currently violate this.

### 10.2 Type scale — minimum sizes

| Role | Size | Notes |
|---|---|---|
| Axis tick labels | 11px | already the `Axis` primitive default |
| In-mark labels (tile, band, node) | 12px | never below 11px |
| Value labels under an in-mark label | 11px | |
| Legend and toolbar text | 12px | |
| Tooltip body | 12px | title 13px |

Nothing in a chart may render below **11px**. If a label would need to be smaller to
fit, apply §10.1 and drop it instead.

### 10.3 Tooltips must not swallow the chart

- **Max width 300px, max height 320px**, then scroll internally (`overflow-y-auto`).
- **At most 4 rows**, then a "+N more" line. The table view is where exhaustive detail
  belongs, not a hover card.
- Must flip on **both** axes to stay inside the chart container, never overflow the
  `ChartFrame` card.
- Long prose (an emerging-market thesis, a signal's evidence sentence) is clamped to
  **3 lines** in a tooltip. Full text belongs in the drawer or table.

### 10.4 Give each chart room to breathe

- Minimum plot height **420px**; the Sankey and lineage graph need **520px**.
- The Sankey scales its height to node count (roughly `28px × max(nodes per column)`,
  clamped to 520–900px) instead of compressing every node into a fixed box.
- Charts never exceed their `ChartFrame`; if content needs more room, the frame grows
  or the content is reduced by §10.1, never clipped.

### 10.5 Category and structural labels sit outside the data area

Treemap category headings and radar sector labels must not overlap data marks.
Either reserve a gutter for them or render them in the frame's header region. A
watermark-style heading behind tiles (as the treemap does now) is not acceptable —
it reads as a rendering fault.

### 10.6 Dense-by-default charts choose a readable default view

Where the full dataset cannot be drawn legibly at the default size — the Sankey with
44 flows, the timeline with 108 events across 11 lanes — the chart must either
aggregate, paginate by era/decade, or open on the table view. Drawing everything at
an illegible density is not an option.

### 10.7 Shared label-fitting helper — use it, do not duplicate it

`components/charts/primitives/atlasLabelFit.ts` is the single implementation of
§10.1, exported from `primitives/index.ts`:

```ts
fitLabel(text, availablePx, fontPx = 11): { text; truncated; full } | null
fitMarkLabel(text, availablePx, fontPx)   // full -> abbreviation+ellipsis -> truncation -> null
fitLabelInBox(text, { width, height }, fontPx, paddingPx)
abbreviateLabel(text)                     // "Mainframes and bundled software" -> "Mainframes"
hasLabelRoom(width, height, fontPx)
measureTextWidth / maxCharsFor
MIN_LABEL_BOX { width: 48, height: 14 } / MIN_LABEL_FONT_PX 11
CHAR_WIDTH_RATIO 0.55 / UPPERCASE_WIDTH_FACTOR 1.25
```

Measure uppercase or letter-spaced headings at `fontPx * UPPERCASE_WIDTH_FACTOR`.
No chart may ship its own truncation logic.

### 10.8 Accepted changes to shared primitives

- **`ChartTooltip`** was brought to §10.2/§10.3 in place: max height 320px with
  internal scroll, flips on both axes and clamps to its container, caps at 4 rows then
  "+N more in the table view", footnote clamped to 3 lines, sub-text raised 10px to
  11px, title 13px. **Props and exported types unchanged**, so `ShareStackedArea` and
  `CompetitiveBubble` inherit the fix. **Accepted.**
- **`AtlasMarkTooltip`** must reach the same standard; assigned to the engineer who
  owns it. Signature unchanged.

### 10.9 Density strategies chosen (for QA's reference)

These are the §10.6 answers actually implemented, so QA reads them as design, not
defects:

- **EraTimeline**: at the full 1950–2026 view most era bands are too narrow for any
  name, so each band carries a **number badge** and a numbered era key sits under the
  chart; names appear on zoom. Event dots within 14px in a lane **pool into a count
  badge** that fans its members out on hover or focus and inserts them into the
  roving-nav order, so keyboard users step through the group.
- **MarketTreemap**: per category, markets under 1800px² (or beyond 12 tiles) pool
  into one **"Other (N markets)"** tile; activating it opens that category alone at
  full size with pooling off. The largest market always keeps its own tile. The table
  always lists every market, pooled and unsized alike.
- Category headings render **last**, into an opaque band in the 26px gutter — never
  behind a tile.

### 10.10 Open, deliberately not fixed

The treemap's "opened category" is local state, the same class as the four controls in
§9.1. Making it shareable needs a URL key; deferred with them, not forgotten.
`MIN_TILE_AREA` (1800px²) and the 14px cluster gap are the two legibility/density
dials, both unit-tested constants, cheap to retune after a visual review.

---

## 11. Phase D rulings

### 11.1 What `verified: true` means (final, applies to every source)

> `verified: true` means the cited URL was retrieved **in this project** and the
> figure was seen in retrieved content — page body, filing, API response, or a
> search engine's verbatim extract of that page. A source whose substance sits
> behind a paywall or login that was never passed is `verified: false`, with its
> URL kept.

**A 403 on a later re-check does not retroactively unverify a source.** Bot
protection on a free page is not a paywall, and the question the flag answers is
"was the figure ever seen in this project", not "does an automated re-fetch succeed
today". Sources read during Phase 1 research or Phase B1 verification, whose hosts
now bot-block automated requests (S02, S13 and the other 403 hosts QA found), stay
`verified: true`. The §12 audit table records `403 on re-check; content read in
<phase>` so the provenance is legible.

A source is downgraded only when **nobody in this project ever read its substance**.
That is why S78 was downgraded — a search-result headline is a claim *about* an
article, not its evidence, and it carries neither period nor basis.

### 11.2 Interpolated bubble marks are modeled

Found by the data-engineer during the Kyndryl fix; QA had not raised it.
`valueAtYear` interpolates across interior gaps in a series, and `bubbleData` was
dropping that fact, so Oracle FY2010, Salesforce FY2010 and VMware FY2017 plotted
interpolated values wearing the neighbouring point's `reported` badge.

`BubbleDatum` now carries `revenueInterpolated` and `sizeInterpolated`, and
`lib/selectors.ts` exports `bubbleDatumConfidence(datum)` and
`INTERPOLATED_BUBBLE_NOTE`. **`CompetitiveBubble` must use them**: an interpolated
mark is `modeled`, drawn with the modeled style, and its tooltip says the value was
interpolated because no figure was filed that year. The treemap already did this;
the bubble was the inconsistency.

### 11.3 Basis-break annotations

IBM's Kyndryl spin-off (FY2020 $73.620B pre-spin, FY2021 $57.350B post-spin, IBM's
own pro forma restating FY2020 to $57.870B) is annotated on all 19 revenue points and
carries its own `spin-off` event citing IBM's 8-K pro forma exhibit and completion
release. The pre-restatement side of the ASC 606 adoptions (Microsoft FY2008–15,
Oracle FY2009–16, Salesforce FY2009–16) is annotated the same way — Microsoft's is
material, since FY2016 reads −2.6% as shipped against −8.8% as originally filed.

Adobe FY2009 (−17.7%) and Splunk FY2021 (−5.5%) are **genuine declines** and are
deliberately left unannotated; the chart is telling the truth there.

### 11.4 `npm run validate-data --strict` does not pass the flag

npm swallows it. Use `npm run validate-data:strict`, or `npm run validate-data --
--strict`. The README must document the former.

### 11.5 The verification log matches the registry by URL, never by id

Source ids are **allocation state owned by `data/sources.ts`**. They are not stable
identifiers across documents. The §7.1 "suggested ids" block in
`docs/verification-log.md` drifted from what shipped: of the twenty ids it proposed,
only S78 kept both its id and its URL. Shipped `S65` is the Teams rollout while the
log's `S65` is the LinkedIn announcement (shipped as `S46`); likewise S69→S40,
S70→S44, S72→S43, S74→S76. Two entries changed page entirely — the log cleared
Cisco's and IBM's own releases, while the registry ships SiliconANGLE and TechCrunch
at those ids.

**This is the mechanism behind QA finding Q-01.** Anyone auditing coverage by
grepping the log for an id got hits that referred to different pages, which is why
the gap looked like 32 sources when it was closer to sixty. QA matched on ids and
under-counted.

Rule, in force from now: **log entries match registry entries by URL.** Any future
id-block suggestion lists URLs only. `scripts/list-company-refs.ts` is the model —
resolve by content, not by label.

### 11.6 Citation–content mismatch is a first-order defect

A figure cited to a page that does not state it is not a citation, whatever the URL
resolves to. It is worse than an unlogged source, because the audit trail looks
complete. The §12.3 cases found in Phase D are being repaired, and the rule stands:
**the cited source must contain the cited figure**, or the figure ships `estimated`
with a range and a note naming the derivation, or it is dropped.

### 11.7 Interpretation is not a signal — the schema stays as it is

The data-engineer found three `emerging.ts` signals citing S25 decoratively for
claims S25 does not make (real-time speech as an agent surface; vector search
absorbed into mainstream databases; security spend outgrowing software spend), and
asked whether to relax `schemas.ts` so an interpretation-type signal could ship with
an empty `sourceIds`.

**Refused.** `sourceIds: z.array(...).min(1)` is load-bearing. Relaxing it would make
it possible to ship an unsourced claim anywhere in the emerging set, and the
constraint is what forces exactly the honesty that surfaced this problem.

The contract already has the right home for an unsourced reading. `EmergingMarket`
carries `thesis` and `risks` — prose fields the methodology page frames as the
Atlas's own argument. A `signal` is evidence, with a type, a strength and sources; an
interpretation with no evidence behind it is not a weak signal, it is a different kind
of claim, and it belongs in the thesis.

Resolution order for each of the three:

1. Find a real source that states the claim, and cite it.
2. Failing that, fold the reading into the market's `thesis` (or `risks`) and delete
   the signal — provided the market still has at least one sourced signal, which the
   schema also requires.
3. Never invent a citation, and never weaken the schema to let one through.

### 11.8 The emerging radar has five sectors, not four quadrants

`CLAUDE.md` §5 chart 8 says "quadrants = category", but there are **five** categories,
so `categorySector` divides the circle by `CATEGORY_ORDER.length` = 5. The chart draws
one divider and one label per category and its own footnote reads "sector = category".

The spec's wording was wrong and it propagated — into the QA brief, into this file,
and into the README — before the app-engineer caught it while writing the methodology
copy. Corrected everywhere. **Say "sector", and derive the count from
`CATEGORY_ORDER` rather than hard-coding it.** Two of the five (consumer, emerging)
are empty because no candidate market sits in those categories; that is a property of
the candidate set, not a rendering fault, and the methodology page now says so.

### 11.9 S86 upgraded to `verified: true` — the line between "blocked" and "unread"

Reversing an earlier call. §11.1 already permits "a search engine's verbatim extract
of that page" as retrieved content, and the verifier confirmed S86's body that way
($2.59tn, 47%, "over 45%" infrastructure, with attribution), while QA read the same
page with a browser UA. That is the identical standard under which S02, S25, S16,
S21, S42, S43, S51, S67 and S75 ship `verified: true`. Leaving S86 false was
inconsistent with nine other rows.

The distinction that matters, stated once:

- **Blocked to one fetcher, body seen some other way → `verified: true`.** The flag
  describes whether the figure was ever seen in this project, not whether one HTTP
  client succeeded.
- **Only a title or headline ever returned → `verified: false`.** S17 and S78 are the
  whole of this class. A headline is a claim *about* an article, not its content: it
  carries neither period nor basis, so it cannot tell you what the number means.

### 11.10 Quotation marks are a literal promise

`data/emerging.ts` was found stitching three fragments from three different sentences
of one Cloudflare page into a single quoted phrase. The substance was sound and the
source was real, which is exactly why it is worth naming: a quotation mark asserts
that those words appeared in that order on that page.

Rule: **quote one contiguous passage verbatim, or drop the quotation marks and
paraphrase in the Atlas's own voice with the figure attributed.** Never assemble a
quotation from fragments. This is the same family as §11.6 — a citation that presents
itself as more precise than it is.

### 11.11 Live pages are as-of-fetch

`S94` (`fin.ai/pricing`) is a live pricing page, not a dated publication. Its figure
is true as of retrieval and cannot be re-verified retrospectively, because the page
changes under the URL. Such sources keep `verified: true` but the methodology page
must say that a figure drawn from a live page is as-of-fetch.

---

## 12. Handoff state — 23 September 2026

### Gates, all passing
```
npm run typecheck            clean
npm run lint                 clean
npm run test                 25 files, 322 tests
npm run validate-data:strict 14/14 checks
npm run build                static export, 190 pages
```

### Dataset
11 eras · 55 markets · 128 companies · 109 events · **18 emerging markets** ·
44 flows · 10 chapters · **121 sources (110 verified)** · 585 data points
(266 reported / 45 estimated / 274 modeled). 99 of 128 companies carry no revenue
series and 1 of 55 markets has share data — both deliberate.

Emerging signal types after the rebalance: platform-shift 14 · leading-indicator 12 ·
**regulation 12** (was 2) · cost-curve 7 · **unbundling 6** (was 3) · new-interface 5.

### Closed this phase
All QA P0/P1: Q-01 (audit trail, §12 rebuilt by URL), Q-02 and Q-19 (dead URLs,
including the S28 endpoint behind 253 reported points), Q-03 (S78/S17 downgrades),
Q-17 (registry drift), Q-18 (the methodology page's false "no URL" claim). Plus the
six citation–content mismatches, the IBM/Kyndryl and ASC 606 basis breaks, the §10
legibility standard across all ten charts, and the emerging-market rebalance.

### Open, and why
| Item | Priority | Note |
|---|---|---|
| Human visual pass: both themes, 375px, keyboard | — | **The one real gap.** Everything was verified by tests, exported HTML and code review; nobody has clicked through the built site. Start at `/explore/?chart=moat` (its default view changed) and the emerging radar, which now places 18 dots across 5 sectors. |
| `emerging` category sector empty | P2 | Honest: nothing found belonged there. §11.8 explanation stands for that one category. |
| Q-14 orphan sources (S09, S15b) | P3 | Real, read, simply uncited. |
| Q-22 archetype hues under deuteranopia | P3 | Three dark-theme pairs collapse. Not a 1.4.1 failure — archetype is also text in `aria-label`, tooltip, legend and table. |
| Q-26 outline button uses `--border` in light theme | P3 | Dark theme correctly overrides to `border-input`. |
| S94 (`fin.ai/pricing`) as-of-fetch note | P3 | §11.11 ruled; one line still to add to `/methodology`. |
| §13.7 accessibility candidate | — | Fully sourced but thin, held deliberately. In the log if wanted. |
| `CLAUDE.md` §5 says "quadrants" | — | Spec text left as written; §11.8 records the correction. |

### If you pick this up
Read `docs/CONTRACTS.md` §8–§11 before touching data or charts — they are rulings
with reasons, and several look like defects until you read why. `docs/qa-report.md`
is the last independent audit. The dev server needs `localhost`, not the LAN address,
unless yours is in `allowedDevOrigins`.
