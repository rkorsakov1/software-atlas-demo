"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

import type { BubbleTrailPoint } from "@/components/charts/CompetitiveBubble";
import type { TreemapColorMode } from "@/components/charts/MarketTreemap";
import { EmptyState, trailUpToYear, type TrailPoint } from "@/components/charts/primitives";
import { useHighlight } from "@/components/explore/HighlightContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  companies,
  emerging,
  eras,
  events,
  flows,
  industrySize,
  markets,
  moatRubric,
  sources,
  vendors,
} from "@/data";
import type { Company, CompetitiveEvent, Market } from "@/data/types";
import { growthAtYear, valueAtYear } from "@/lib/scales";
import {
  availableSizeMetrics,
  bubbleData,
  byId,
  filterEmerging,
  hasShareData,
  lineageGraph,
  sankeyInput,
  shareSeries,
  sizedMarketsAtYear,
  sourceTitle,
  unsizedMarkets,
  type BubbleSizeMetric,
} from "@/lib/selectors";
import type { AtlasState } from "@/lib/url-state";

const chartSkeleton = (): React.ReactElement => <Skeleton className="h-[520px] w-full" />;

const EraTimeline = dynamic(
  () => import("@/components/charts/EraTimeline").then((module) => module.EraTimeline),
  { ssr: false, loading: chartSkeleton },
);
const MarketTreemap = dynamic(
  () => import("@/components/charts/MarketTreemap").then((module) => module.MarketTreemap),
  { ssr: false, loading: chartSkeleton },
);
const IndustrySizeChart = dynamic(
  () => import("@/components/charts/IndustrySizeChart").then((module) => module.IndustrySizeChart),
  { ssr: false, loading: () => <Skeleton className="h-[360px] w-full" /> },
);
const ShareStackedArea = dynamic(
  () => import("@/components/charts/ShareStackedArea").then((module) => module.ShareStackedArea),
  { ssr: false, loading: chartSkeleton },
);
const CompetitiveBubble = dynamic(
  () => import("@/components/charts/CompetitiveBubble").then((module) => module.CompetitiveBubble),
  { ssr: false, loading: chartSkeleton },
);
const LineageGraph = dynamic(
  () => import("@/components/charts/LineageGraph").then((module) => module.LineageGraph),
  { ssr: false, loading: chartSkeleton },
);
const BundlingSankey = dynamic(
  () => import("@/components/charts/BundlingSankey").then((module) => module.BundlingSankey),
  { ssr: false, loading: chartSkeleton },
);
const MoatRadar = dynamic(
  () => import("@/components/charts/MoatRadar").then((module) => module.MoatRadar),
  { ssr: false, loading: chartSkeleton },
);
const EmergingRadar = dynamic(
  () => import("@/components/charts/EmergingRadar").then((module) => module.EmergingRadar),
  { ssr: false, loading: chartSkeleton },
);

export type ExplorePanelProps = {
  state: AtlasState;
  onStateChange: (patch: Partial<AtlasState>) => void;
  onTogglePin: (id: string) => void;
  /** Opens the detail drawer; separate from `focus`, which only sets context. */
  onOpenDetail: (kind: "company" | "market" | "event", id: string) => void;
  filteredMarkets: readonly Market[];
  filteredCompanies: readonly Company[];
  filteredEvents: readonly CompetitiveEvent[];
};

const buildTrail = (company: Company, year: number): BubbleTrailPoint[] => {
  const years = [...new Set(company.revenueByYear.map((point) => point.year))].sort(
    (a, b) => a - b,
  );
  const points: TrailPoint[] = [];
  for (const candidate of years) {
    if (candidate > year) continue;
    const revenue = valueAtYear(company.revenueByYear, candidate);
    const growth = growthAtYear(company.revenueByYear, candidate);
    if (!revenue || growth === null) continue;
    points.push({ year: candidate, revenue: revenue.value, growth });
  }
  return trailUpToYear(points, year);
};

/**
 * The chart panel. Every selector that returns a fresh object — `bubbleData`,
 * `lineageGraph`, `sankeyInput` — is memoised here, because `LineageGraph` keys a
 * 300-tick force layout on the identity of the graph it is handed.
 */
export const ExplorePanel = ({
  state,
  onStateChange,
  onTogglePin,
  onOpenDetail,
  filteredMarkets,
  filteredCompanies,
  filteredEvents,
}: ExplorePanelProps): React.ReactElement => {
  const { highlightedCompanyId, highlightedMarketId, handleHoverCompany, handleHoverMarket } =
    useHighlight();

  const metrics = useMemo(() => availableSizeMetrics(companies), []);
  const [sizeMetric, setSizeMetric] = useState<BubbleSizeMetric>(metrics[0] ?? "revenue");
  const [colorBy, setColorBy] = useState<TreemapColorMode>("growth");
  const [minDealValueUsdB, setMinDealValueUsdB] = useState<number>(0);

  const sourceTitleFor = useCallback(
    (sourceId: string): string => sourceTitle(sources, sourceId),
    [],
  );
  const eventTitleFor = useCallback(
    (eventId: string): string => byId(events, eventId)?.title ?? eventId,
    [],
  );

  const handleSelectCompany = useCallback(
    (companyId: string): void => onOpenDetail("company", companyId),
    [onOpenDetail],
  );
  const handleSelectMarket = useCallback(
    (marketId: string): void => onOpenDetail("market", marketId),
    [onOpenDetail],
  );
  const handleSelectEvent = useCallback(
    (eventId: string): void => onOpenDetail("event", eventId),
    [onOpenDetail],
  );
  const handleYearChange = useCallback(
    (year: number): void => onStateChange({ year }),
    [onStateChange],
  );

  if (state.chart === "timeline") {
    const handleSelectEra = (eraId: string): void => {
      const era = byId(eras, eraId);
      if (!era) return;
      onStateChange({ from: era.startYear, to: era.endYear ?? state.to });
    };

    return (
      <EraTimeline
        eras={eras}
        events={filteredEvents}
        fromYear={state.from}
        toYear={state.to}
        focusEventId={state.focus?.kind === "event" ? state.focus.id : null}
        onSelectEvent={handleSelectEvent}
        onSelectEra={handleSelectEra}
        sourceTitleFor={sourceTitleFor}
        highlightedCompanyId={highlightedCompanyId}
        onHoverCompany={handleHoverCompany}
      />
    );
  }

  if (state.chart === "treemap") {
    return (
      <TreemapPanel
        filteredMarkets={filteredMarkets}
        state={state}
        colorBy={colorBy}
        onColorByChange={setColorBy}
        onYearChange={handleYearChange}
        onSelectMarket={handleSelectMarket}
        sourceTitleFor={sourceTitleFor}
        highlightedMarketId={highlightedMarketId}
        onHoverMarket={handleHoverMarket}
      />
    );
  }

  if (state.chart === "share") {
    return (
      <SharePanel
        state={state}
        onStateChange={onStateChange}
        onSelectEvent={handleSelectEvent}
        sourceTitleFor={sourceTitleFor}
        highlightedCompanyId={highlightedCompanyId}
        onHoverCompany={handleHoverCompany}
      />
    );
  }

  if (state.chart === "bubble") {
    return (
      <BubblePanel
        state={state}
        filteredCompanies={filteredCompanies}
        sizeMetric={sizeMetric}
        metrics={metrics}
        onSizeMetricChange={setSizeMetric}
        onYearChange={handleYearChange}
        onTogglePin={onTogglePin}
        onSelectCompany={handleSelectCompany}
        sourceTitleFor={sourceTitleFor}
        highlightedCompanyId={highlightedCompanyId}
        onHoverCompany={handleHoverCompany}
      />
    );
  }

  if (state.chart === "lineage") {
    return (
      <LineagePanel
        state={state}
        minDealValueUsdB={minDealValueUsdB}
        onMinDealChange={setMinDealValueUsdB}
        onStateChange={onStateChange}
        onSelectCompany={handleSelectCompany}
        onSelectEvent={handleSelectEvent}
        eventTitleFor={eventTitleFor}
        sourceTitleFor={sourceTitleFor}
        highlightedCompanyId={highlightedCompanyId}
        onHoverCompany={handleHoverCompany}
      />
    );
  }

  if (state.chart === "bundling") {
    return (
      <BundlingPanel
        state={state}
        onSelectEvent={handleSelectEvent}
        eventTitleFor={eventTitleFor}
        highlightedMarketId={highlightedMarketId}
        onHoverMarket={handleHoverMarket}
      />
    );
  }

  if (state.chart === "moat") {
    const pinnedCompanies = state.pin
      .map((id) => byId(companies, id))
      .filter((company): company is Company => company !== undefined)
      .map((company) => ({
        id: company.id,
        name: company.name,
        moats: company.moats,
        moatRationale: company.moatRationale,
      }));

    if (pinnedCompanies.length === 0) {
      return (
        <EmptyState
          title="Pin a company to compare moats"
          description="The moat radar overlays up to three companies. Pin them from the revenue chart, the search dialog or any company profile, and they will appear here — the pins travel in the URL."
        />
      );
    }

    return (
      <MoatRadar
        companies={pinnedCompanies}
        rubric={moatRubric}
        onRemoveCompany={onTogglePin}
        highlightedCompanyId={highlightedCompanyId}
        onHoverCompany={handleHoverCompany}
      />
    );
  }

  return (
    <EmergingPanel state={state} onOpenDetail={onOpenDetail} sourceTitleFor={sourceTitleFor} />
  );
};

type TreemapPanelProps = {
  filteredMarkets: readonly Market[];
  state: AtlasState;
  colorBy: TreemapColorMode;
  onColorByChange: (mode: TreemapColorMode) => void;
  onYearChange: (year: number) => void;
  onSelectMarket: (marketId: string) => void;
  sourceTitleFor: (sourceId: string) => string;
  highlightedMarketId: string | null;
  onHoverMarket: (marketId: string | null) => void;
};

const TreemapPanel = ({
  filteredMarkets,
  state,
  colorBy,
  onColorByChange,
  onYearChange,
  onSelectMarket,
  sourceTitleFor,
  highlightedMarketId,
  onHoverMarket,
}: TreemapPanelProps): React.ReactElement => {
  const sized = useMemo(
    () => sizedMarketsAtYear(filteredMarkets, state.year),
    [filteredMarkets, state.year],
  );
  const unsized = useMemo(
    () => unsizedMarkets(filteredMarkets, state.year),
    [filteredMarkets, state.year],
  );

  return (
    <div className="space-y-4">
      <IndustrySizeChart
        points={industrySize}
        year={state.year}
        onYearChange={onYearChange}
        sourceTitleFor={sourceTitleFor}
      />
      <MarketTreemap
        sized={sized}
        unsized={unsized}
        year={state.year}
        minYear={state.from}
        maxYear={state.to}
        colorBy={colorBy}
        onColorByChange={onColorByChange}
        onYearChange={onYearChange}
        onSelectMarket={onSelectMarket}
        sourceTitleFor={sourceTitleFor}
        highlightedMarketId={highlightedMarketId}
        onHoverMarket={onHoverMarket}
      />
    </div>
  );
};

type SharePanelProps = {
  state: AtlasState;
  onStateChange: (patch: Partial<AtlasState>) => void;
  onSelectEvent: (eventId: string) => void;
  sourceTitleFor: (sourceId: string) => string;
  highlightedCompanyId: string | null;
  onHoverCompany: (companyId: string | null) => void;
};

const SharePanel = ({
  state,
  onStateChange,
  onSelectEvent,
  sourceTitleFor,
  highlightedCompanyId,
  onHoverCompany,
}: SharePanelProps): React.ReactElement => {
  const sharedMarkets = useMemo(() => markets.filter(hasShareData), []);
  const focusedMarket = state.focus?.kind === "market" ? byId(markets, state.focus.id) : undefined;
  // A focused market without share data would only open an empty chart, so the
  // view falls back to the first market that has a series.
  const market =
    focusedMarket !== undefined && hasShareData(focusedMarket) ? focusedMarket : sharedMarkets[0];

  const series = useMemo(() => (market ? shareSeries(market) : []), [market]);

  const companyNames = useMemo<Record<string, string>>(() => {
    const names: Record<string, string> = {};
    for (const point of series) {
      for (const share of point.shares) {
        const holder = byId(companies, share.companyId) ?? byId(vendors, share.companyId);
        if (holder) names[share.companyId] = holder.name;
      }
    }
    return names;
  }, [series]);

  const marketEvents = useMemo(
    () =>
      market === undefined
        ? []
        : events
            .filter((event) => event.marketIds.includes(market.id))
            .sort((a, b) => a.year - b.year),
    [market],
  );

  const handleMarketChange = (marketId: string): void => {
    onStateChange({ focus: { kind: "market", id: marketId } });
  };

  if (market === undefined) {
    return (
      <EmptyState
        title="No share data yet"
        description="No market in this build has a published share series."
      />
    );
  }

  return (
    <div className="space-y-3">
      {sharedMarkets.length < 2 ? null : (
        <div role="group" aria-label="Market" className="flex flex-wrap items-center gap-1.5">
          {sharedMarkets.map((candidate) => (
            <Button
              key={candidate.id}
              type="button"
              size="sm"
              variant={candidate.id === market.id ? "default" : "outline"}
              aria-pressed={candidate.id === market.id}
              onClick={() => handleMarketChange(candidate.id)}
            >
              {candidate.name}
            </Button>
          ))}
        </div>
      )}

      <ShareStackedArea
        marketName={market.name}
        series={series}
        companyNames={companyNames}
        events={marketEvents}
        sourceTitleFor={sourceTitleFor}
        onSelectEvent={onSelectEvent}
        highlightedCompanyId={highlightedCompanyId}
        onHoverCompany={onHoverCompany}
      />
    </div>
  );
};

type BubblePanelProps = {
  state: AtlasState;
  filteredCompanies: readonly Company[];
  sizeMetric: BubbleSizeMetric;
  metrics: readonly BubbleSizeMetric[];
  onSizeMetricChange: (metric: BubbleSizeMetric) => void;
  onYearChange: (year: number) => void;
  onTogglePin: (companyId: string) => void;
  onSelectCompany: (companyId: string) => void;
  sourceTitleFor: (sourceId: string) => string;
  highlightedCompanyId: string | null;
  onHoverCompany: (companyId: string | null) => void;
};

const BubblePanel = ({
  state,
  filteredCompanies,
  sizeMetric,
  metrics,
  onSizeMetricChange,
  onYearChange,
  onTogglePin,
  onSelectCompany,
  sourceTitleFor,
  highlightedCompanyId,
  onHoverCompany,
}: BubblePanelProps): React.ReactElement => {
  const data = useMemo(
    () => bubbleData(filteredCompanies, state.year, sizeMetric),
    [filteredCompanies, sizeMetric, state.year],
  );

  const trails = useMemo<Record<string, readonly BubbleTrailPoint[]>>(() => {
    const result: Record<string, readonly BubbleTrailPoint[]> = {};
    for (const pinnedId of state.pin) {
      const company = byId(companies, pinnedId);
      if (!company || company.revenueByYear.length < 2) continue;
      const trail = buildTrail(company, state.year);
      if (trail.length > 0) result[pinnedId] = trail;
    }
    return result;
  }, [state.pin, state.year]);

  return (
    <div className="space-y-2">
      <CompetitiveBubble
        data={data}
        year={state.year}
        minYear={state.from}
        maxYear={state.to}
        sizeMetric={sizeMetric}
        availableSizeMetrics={metrics}
        onSizeMetricChange={onSizeMetricChange}
        onYearChange={onYearChange}
        pinnedIds={state.pin}
        trails={trails}
        onTogglePin={onTogglePin}
        onSelectCompany={onSelectCompany}
        sourceTitleFor={sourceTitleFor}
        highlightedCompanyId={highlightedCompanyId}
        onHoverCompany={onHoverCompany}
      />
      <p className="text-xs text-muted-foreground">
        Market capitalisation is not offered as a size metric: share price is not in SEC XBRL and no
        reachable source would have let a series be built without fabrication, so the field ships
        empty for every company.
      </p>
    </div>
  );
};

type LineagePanelProps = {
  state: AtlasState;
  minDealValueUsdB: number;
  onMinDealChange: (value: number) => void;
  onStateChange: (patch: Partial<AtlasState>) => void;
  onSelectCompany: (companyId: string) => void;
  onSelectEvent: (eventId: string) => void;
  eventTitleFor: (eventId: string) => string;
  sourceTitleFor: (sourceId: string) => string;
  highlightedCompanyId: string | null;
  onHoverCompany: (companyId: string | null) => void;
};

const LineagePanel = ({
  state,
  minDealValueUsdB,
  onMinDealChange,
  onStateChange,
  onSelectCompany,
  onSelectEvent,
  eventTitleFor,
  sourceTitleFor,
  highlightedCompanyId,
  onHoverCompany,
}: LineagePanelProps): React.ReactElement => {
  const graph = useMemo(
    () =>
      lineageGraph(events, companies, {
        fromYear: state.from,
        toYear: state.to,
        minDealValueUsdB,
      }),
    [minDealValueUsdB, state.from, state.to],
  );

  const filters = useMemo(
    () => ({ fromYear: state.from, toYear: state.to, minDealValueUsdB }),
    [minDealValueUsdB, state.from, state.to],
  );

  const handleFiltersChange = (next: {
    fromYear: number;
    toYear: number;
    minDealValueUsdB: number;
  }): void => {
    if (next.minDealValueUsdB !== minDealValueUsdB) onMinDealChange(next.minDealValueUsdB);
    if (next.fromYear !== state.from || next.toYear !== state.to) {
      onStateChange({ from: next.fromYear, to: next.toYear });
    }
  };

  return (
    <LineageGraph
      graph={graph}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      focusCompanyId={state.focus?.kind === "company" ? state.focus.id : null}
      onSelectCompany={onSelectCompany}
      onSelectEvent={onSelectEvent}
      eventTitleFor={eventTitleFor}
      sourceTitleFor={sourceTitleFor}
      highlightedCompanyId={highlightedCompanyId}
      onHoverCompany={onHoverCompany}
    />
  );
};

type BundlingPanelProps = {
  state: AtlasState;
  onSelectEvent: (eventId: string) => void;
  eventTitleFor: (eventId: string) => string;
  highlightedMarketId: string | null;
  onHoverMarket: (marketId: string | null) => void;
};

const BundlingPanel = ({
  state,
  onSelectEvent,
  eventTitleFor,
  highlightedMarketId,
  onHoverMarket,
}: BundlingPanelProps): React.ReactElement => {
  const input = useMemo(
    () =>
      sankeyInput(flows, markets, companies, {
        fromYear: state.from,
        toYear: state.to,
      }),
    [state.from, state.to],
  );

  return (
    <BundlingSankey
      input={input}
      fromYear={state.from}
      toYear={state.to}
      onSelectEvent={onSelectEvent}
      eventTitleFor={eventTitleFor}
      highlightedMarketId={highlightedMarketId}
      onHoverMarket={onHoverMarket}
    />
  );
};

type EmergingPanelProps = {
  state: AtlasState;
  onOpenDetail: (kind: "company" | "market" | "event", id: string) => void;
  sourceTitleFor: (sourceId: string) => string;
};

const EmergingPanel = ({
  state,
  onOpenDetail,
  sourceTitleFor,
}: EmergingPanelProps): React.ReactElement => {
  const visible = useMemo(
    () => filterEmerging(emerging, { cat: state.cat, q: state.q }),
    [state.cat, state.q],
  );

  const handleSelect = (marketId: string): void => onOpenDetail("market", marketId);

  return (
    <EmergingRadar
      markets={visible}
      selectedId={state.focus?.kind === "market" ? state.focus.id : null}
      onSelectMarket={handleSelect}
      sourceTitleFor={sourceTitleFor}
    />
  );
};
