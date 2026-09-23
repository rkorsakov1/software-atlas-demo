import type {
  Archetype,
  BundlingFlow,
  Category,
  Company,
  CompetitiveEvent,
  Confidence,
  DataPoint,
  EmergingMarket,
  Era,
  Market,
  Source,
  Vendor,
} from "@/data/types";
import { computeHhi, computeTop3Share } from "@/lib/hhi";
import { growthAtYear, valueAtYear } from "@/lib/scales";
import type { AtlasState } from "@/lib/url-state";

export type AtlasCollections = {
  sources: readonly Source[];
  eras: readonly Era[];
  markets: readonly Market[];
  companies: readonly Company[];
  events: readonly CompetitiveEvent[];
  emerging: readonly EmergingMarket[];
  flows: readonly BundlingFlow[];
  /** Vendors named only in share series; optional so older callers still type-check. */
  vendors?: readonly Vendor[];
};

export type AtlasFilters = Pick<AtlasState, "from" | "to" | "cat" | "arch" | "mat" | "q">;

const matchesQuery = (haystack: readonly string[], query: string): boolean => {
  if (query.length === 0) return true;
  const needle = query.toLowerCase();
  return haystack.some((value) => value.toLowerCase().includes(needle));
};

export const indexById = <TItem extends { id: string }>(
  items: readonly TItem[],
): Map<string, TItem> => new Map(items.map((item) => [item.id, item]));

export const byId = <TItem extends { id: string }>(
  items: readonly TItem[],
  id: string,
): TItem | undefined => items.find((item) => item.id === id);

export const sourceTitle = (sources: readonly Source[], sourceId: string): string => {
  const source = byId(sources, sourceId);
  return source ? `${source.title} — ${source.publisher}` : `Unknown source (${sourceId})`;
};

export const sourcesFor = (
  sources: readonly Source[],
  sourceIds: readonly string[],
): Source[] => {
  const seen = new Set<string>();
  const result: Source[] = [];
  for (const sourceId of sourceIds) {
    if (seen.has(sourceId)) continue;
    seen.add(sourceId);
    const source = byId(sources, sourceId);
    if (source) result.push(source);
  }
  return result;
};

export const collectSourceIds = (points: readonly (DataPoint | undefined)[]): string[] => {
  const seen = new Set<string>();
  for (const point of points) {
    if (point) seen.add(point.sourceId);
  }
  return [...seen];
};

// --- markets -----------------------------------------------------------------

export const filterMarkets = (
  markets: readonly Market[],
  filters: AtlasFilters,
): Market[] =>
  markets.filter((market) => {
    if (filters.cat.length > 0 && !filters.cat.includes(market.category)) return false;
    if (filters.mat.length > 0 && !filters.mat.includes(market.maturity)) return false;
    if (market.originYear > filters.to) return false;
    return matchesQuery([market.name, market.description, market.definition], filters.q);
  });

export const marketChildren = (markets: readonly Market[], parentId: string): Market[] =>
  markets.filter((market) => market.parentId === parentId);

export const marketAncestors = (markets: readonly Market[], marketId: string): Market[] => {
  const index = indexById(markets);
  const chain: Market[] = [];
  let current = index.get(marketId)?.parentId ?? null;
  const guard = new Set<string>([marketId]);
  while (current !== null && !guard.has(current)) {
    guard.add(current);
    const parent = index.get(current);
    if (!parent) break;
    chain.unshift(parent);
    current = parent.parentId;
  }
  return chain;
};

export const marketsByCategory = (
  markets: readonly Market[],
): Map<Category, Market[]> => {
  const grouped = new Map<Category, Market[]>();
  for (const market of markets) {
    const bucket = grouped.get(market.category);
    if (bucket) {
      bucket.push(market);
      continue;
    }
    grouped.set(market.category, [market]);
  }
  return grouped;
};

export type MarketSizeAtYear = {
  market: Market;
  value: number;
  interpolated: boolean;
  basis: DataPoint;
};

/** How far past its last data point a market size may be carried forward. */
export const SIZE_CARRY_FORWARD_YEARS = 2;

/**
 * A market's size at `year`, or null when the Atlas has no basis for one. A size
 * is never drawn before the market existed or before its first data point, and
 * is carried forward only briefly past its last one: stretching a 2025 estimate
 * back to 1965 would show markets that did not exist yet.
 */
export const marketSizeAtYear = (
  market: Market,
  year: number,
): { value: number; interpolated: boolean; basis: DataPoint } | null => {
  if (year < market.originYear) return null;
  const years = market.sizeByYear.map((point) => point.year);
  if (years.length === 0) return null;
  if (year < Math.min(...years)) return null;
  if (year > Math.max(...years) + SIZE_CARRY_FORWARD_YEARS) return null;
  const size = valueAtYear(market.sizeByYear, year);
  if (!size || size.value <= 0) return null;
  return size;
};

export const sizedMarketsAtYear = (
  markets: readonly Market[],
  year: number,
): MarketSizeAtYear[] => {
  const result: MarketSizeAtYear[] = [];
  for (const market of markets) {
    const size = marketSizeAtYear(market, year);
    if (!size) continue;
    result.push({ market, value: size.value, interpolated: size.interpolated, basis: size.basis });
  }
  return result.sort((a, b) => b.value - a.value);
};

/** Markets that existed at `year` but have no size for it. */
export const unsizedMarkets = (markets: readonly Market[], year: number): Market[] =>
  markets.filter((market) => market.originYear <= year && marketSizeAtYear(market, year) === null);

export type ShareSeriesPoint = {
  year: number;
  shares: { companyId: string; value: number; point: DataPoint }[];
  other: number;
  hhi: number;
  top3: number;
};

export const shareSeries = (market: Market): ShareSeriesPoint[] =>
  [...market.sharesByYear]
    .sort((a, b) => a.year - b.year)
    .map((entry) => {
      const shares = entry.shares.map((item) => ({
        companyId: item.companyId,
        value: item.share.value,
        point: item.share,
      }));
      const named = shares.reduce((sum, item) => sum + item.value, 0);
      return {
        year: entry.year,
        shares,
        other: Math.max(0, 100 - named),
        hhi: computeHhi(shares.map((item) => item.value)),
        top3: computeTop3Share(shares.map((item) => item.value)),
      };
    });

export const hasShareData = (market: Market): boolean => market.sharesByYear.length > 0;

// --- companies ---------------------------------------------------------------

export const filterCompanies = (
  companies: readonly Company[],
  markets: readonly Market[],
  filters: AtlasFilters,
): Company[] => {
  const categoryOf = new Map(markets.map((market) => [market.id, market.category]));
  return companies.filter((company) => {
    if (filters.arch.length > 0) {
      const archetypes: Archetype[] = [company.archetype, ...company.secondaryArchetypes];
      if (!archetypes.some((archetype) => filters.arch.includes(archetype))) return false;
    }
    if (filters.cat.length > 0) {
      const categories = company.marketIds
        .map((marketId) => categoryOf.get(marketId))
        .filter((category): category is Category => category !== undefined);
      if (!categories.some((category) => filters.cat.includes(category))) return false;
    }
    if (company.founded > filters.to) return false;
    if (company.acquiredYear !== undefined && company.acquiredYear < filters.from) return false;
    return matchesQuery([company.name, company.hq, company.moatRationale], filters.q);
  });
};

export const companiesInMarket = (
  companies: readonly Company[],
  marketId: string,
): Company[] => companies.filter((company) => company.marketIds.includes(marketId));

/**
 * "revenue" is a first-class choice, not only a fallback: verification found no
 * citable market-cap series, so the app offers only the metrics the dataset can
 * actually back. See docs/CONTRACTS.md §8.5.
 */
export type BubbleSizeMetric = "marketCap" | "grossMargin" | "revenue";

export type BubbleDatum = {
  company: Company;
  revenue: number;
  revenueBasis: DataPoint;
  growth: number;
  size: number;
  sizeBasis: DataPoint | null;
  sizeMetric: BubbleSizeMetric;
  /**
   * True when the plotted revenue was interpolated across a gap in the series
   * rather than read from a reported year. Three series have interior gaps the
   * verification log told us to drop (Oracle FY2010, Salesforce FY2010, VMware
   * FY2017), and without this the bubble would inherit the neighbouring point's
   * `reported` confidence and overstate what is known. The treemap already
   * demotes interpolated sizes to `modeled`; the bubble must do the same.
   */
  revenueInterpolated: boolean;
  sizeInterpolated: boolean;
};

/** A mark drawn from an interpolated value is modeled, whatever its basis says. */
export const bubbleDatumConfidence = (datum: BubbleDatum): Confidence => {
  if (datum.revenueInterpolated || datum.sizeInterpolated) return "modeled";
  const basisConfidences: Confidence[] = [datum.revenueBasis.confidence];
  if (datum.sizeBasis) basisConfidences.push(datum.sizeBasis.confidence);
  if (basisConfidences.includes("modeled")) return "modeled";
  if (basisConfidences.includes("estimated")) return "estimated";
  return "reported";
};

export const INTERPOLATED_BUBBLE_NOTE =
  "Modeled: interpolated between the two nearest reported years, because this series has no figure filed for this year.";

/** Which size metrics the supplied companies can actually support at this year. */
export const availableSizeMetrics = (
  companies: readonly Company[],
): BubbleSizeMetric[] => {
  const metrics: BubbleSizeMetric[] = [];
  if (companies.some((company) => (company.marketCapByYear ?? []).length > 0)) {
    metrics.push("marketCap");
  }
  if (companies.some((company) => (company.grossMarginByYear ?? []).length > 0)) {
    metrics.push("grossMargin");
  }
  metrics.push("revenue");
  return metrics;
};

const preferredSeries = (
  company: Company,
  sizeMetric: BubbleSizeMetric,
): readonly DataPoint[] | undefined => {
  if (sizeMetric === "marketCap") return company.marketCapByYear;
  if (sizeMetric === "grossMargin") return company.grossMarginByYear;
  return company.revenueByYear;
};

export const bubbleData = (
  companies: readonly Company[],
  year: number,
  sizeMetric: BubbleSizeMetric,
): BubbleDatum[] => {
  const result: BubbleDatum[] = [];
  for (const company of companies) {
    const revenue = valueAtYear(company.revenueByYear, year);
    if (!revenue || revenue.value <= 0) continue;
    if (revenue.basis.year < year - 3) continue;
    const growth = growthAtYear(company.revenueByYear, year);
    if (growth === null) continue;

    const preferred = preferredSeries(company, sizeMetric);
    const sized = preferred ? valueAtYear(preferred, year) : null;
    if (sized && sized.value > 0) {
      result.push({
        company,
        revenue: revenue.value,
        revenueBasis: revenue.basis,
        growth,
        size: sized.value,
        sizeBasis: sized.basis,
        sizeMetric,
        revenueInterpolated: revenue.interpolated,
        sizeInterpolated: sized.interpolated,
      });
      continue;
    }
    result.push({
      company,
      revenue: revenue.value,
      revenueBasis: revenue.basis,
      growth,
      size: revenue.value,
      sizeBasis: revenue.basis,
      sizeMetric: "revenue",
      revenueInterpolated: revenue.interpolated,
      sizeInterpolated: revenue.interpolated,
    });
  }
  return result.sort((a, b) => b.size - a.size);
};

// --- events ------------------------------------------------------------------

export const filterEvents = (
  events: readonly CompetitiveEvent[],
  markets: readonly Market[],
  filters: AtlasFilters,
): CompetitiveEvent[] => {
  const categoryOf = new Map(markets.map((market) => [market.id, market.category]));
  return events
    .filter((event) => {
      if (event.year < filters.from || event.year > filters.to) return false;
      if (filters.cat.length > 0) {
        const categories = event.marketIds
          .map((marketId) => categoryOf.get(marketId))
          .filter((category): category is Category => category !== undefined);
        if (!categories.some((category) => filters.cat.includes(category))) return false;
      }
      return matchesQuery([event.title, event.impact], filters.q);
    })
    .sort((a, b) => a.year - b.year || (a.month ?? 0) - (b.month ?? 0));
};

export const eventsForCompany = (
  events: readonly CompetitiveEvent[],
  companyId: string,
): CompetitiveEvent[] =>
  events
    .filter(
      (event) =>
        event.companyIds.includes(companyId) ||
        event.acquirerId === companyId ||
        event.targetId === companyId,
    )
    .sort((a, b) => a.year - b.year || (a.month ?? 0) - (b.month ?? 0));

export const eventsForMarket = (
  events: readonly CompetitiveEvent[],
  marketId: string,
): CompetitiveEvent[] =>
  events
    .filter((event) => event.marketIds.includes(marketId))
    .sort((a, b) => a.year - b.year || (a.month ?? 0) - (b.month ?? 0));

// --- lineage -----------------------------------------------------------------

export type LineageNode = { id: string; name: string; archetype: Archetype; founded: number };
export type LineageLink = {
  id: string;
  source: string;
  target: string;
  year: number;
  type: "acquisition" | "spin-off";
  dealValueUsdB: number | null;
  eventId: string;
};

export type LineageGraphData = { nodes: LineageNode[]; links: LineageLink[] };

const dealValueInBillions = (point: DataPoint | undefined): number | null => {
  if (!point) return null;
  if (point.unit === "USD_B") return point.value;
  if (point.unit === "USD_M") return point.value / 1000;
  return null;
};

export const lineageGraph = (
  events: readonly CompetitiveEvent[],
  companies: readonly Company[],
  options: { fromYear: number; toYear: number; minDealValueUsdB: number },
): LineageGraphData => {
  const companyIndex = indexById(companies);
  const links: LineageLink[] = [];
  const usedIds = new Set<string>();

  for (const event of events) {
    if (event.type !== "acquisition" && event.type !== "spin-off") continue;
    if (event.year < options.fromYear || event.year > options.toYear) continue;
    const { acquirerId, targetId } = event;
    if (!acquirerId || !targetId) continue;
    if (!companyIndex.has(acquirerId) || !companyIndex.has(targetId)) continue;
    const dealValueUsdB = dealValueInBillions(event.dealValue);
    if (options.minDealValueUsdB > 0 && (dealValueUsdB ?? 0) < options.minDealValueUsdB) continue;

    usedIds.add(acquirerId);
    usedIds.add(targetId);
    links.push({
      id: event.id,
      source: acquirerId,
      target: targetId,
      year: event.year,
      type: event.type,
      dealValueUsdB,
      eventId: event.id,
    });
  }

  const nodes: LineageNode[] = [...usedIds]
    .map((id) => companyIndex.get(id))
    .filter((company): company is Company => company !== undefined)
    .map((company) => ({
      id: company.id,
      name: company.name,
      archetype: company.archetype,
      founded: company.founded,
    }));

  return { nodes, links };
};

export const neighborIds = (graph: LineageGraphData, nodeId: string): Set<string> => {
  const neighbors = new Set<string>([nodeId]);
  for (const link of graph.links) {
    if (link.source === nodeId) neighbors.add(link.target);
    if (link.target === nodeId) neighbors.add(link.source);
  }
  return neighbors;
};

// --- bundling flows ----------------------------------------------------------

export type SankeyInput = {
  nodes: { id: string; label: string; kind: "market" | "company-suite" }[];
  links: {
    id: string;
    source: string;
    target: string;
    value: number;
    direction: "bundle" | "unbundle";
    eventId: string;
    year: number;
  }[];
};

export const sankeyInput = (
  flows: readonly BundlingFlow[],
  markets: readonly Market[],
  companies: readonly Company[],
  options: { fromYear: number; toYear: number },
): SankeyInput => {
  const marketIndex = indexById(markets);
  const companyIndex = indexById(companies);
  const nodes = new Map<string, { id: string; label: string; kind: "market" | "company-suite" }>();
  const links: SankeyInput["links"] = [];

  for (const flow of flows) {
    if (flow.year < options.fromYear || flow.year > options.toYear) continue;
    const from = marketIndex.get(flow.fromMarketId);
    if (!from) continue;
    const targetLabel =
      flow.toKind === "market"
        ? marketIndex.get(flow.toId)?.name
        : companyIndex.get(flow.toId)?.name;
    if (!targetLabel) continue;

    const sourceKey = `market:${from.id}`;
    const targetKey = `${flow.toKind}:${flow.toId}`;
    if (sourceKey === targetKey) continue;

    nodes.set(sourceKey, { id: sourceKey, label: from.name, kind: "market" });
    nodes.set(targetKey, { id: targetKey, label: targetLabel, kind: flow.toKind });
    links.push({
      id: flow.id,
      source: sourceKey,
      target: targetKey,
      value: flow.weight,
      direction: flow.direction,
      eventId: flow.eventId,
      year: flow.year,
    });
  }

  return { nodes: [...nodes.values()], links };
};

// --- eras and emerging -------------------------------------------------------

export const erasInRange = (eras: readonly Era[], fromYear: number, toYear: number): Era[] =>
  eras
    .filter((era) => era.startYear <= toYear && (era.endYear ?? toYear) >= fromYear)
    .sort((a, b) => a.startYear - b.startYear);

/** The most recently started era active at `year`; eras overlap from 1990 on. */
export const eraAtYear = (eras: readonly Era[], year: number): Era | undefined =>
  eras
    .filter((era) => era.startYear <= year && (era.endYear ?? Number.MAX_SAFE_INTEGER) >= year)
    .reduce<Era | undefined>(
      (latest, era) => (latest === undefined || era.startYear > latest.startYear ? era : latest),
      undefined,
    );

export const filterEmerging = (
  emerging: readonly EmergingMarket[],
  filters: Pick<AtlasFilters, "cat" | "q">,
): EmergingMarket[] =>
  emerging.filter((market) => {
    if (filters.cat.length > 0 && !filters.cat.includes(market.category)) return false;
    return matchesQuery([market.name, market.thesis], filters.q);
  });

export const signalStrengthTotal = (market: EmergingMarket): number =>
  market.signals.reduce((sum, signal) => sum + signal.strength, 0);

// --- search ------------------------------------------------------------------

export type SearchHit = {
  kind: "company" | "market" | "event";
  id: string;
  label: string;
  detail: string;
};

export const searchAtlas = (
  collections: Pick<AtlasCollections, "companies" | "markets" | "events">,
  query: string,
  limit = 20,
): SearchHit[] => {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) return [];
  const hits: SearchHit[] = [];

  for (const company of collections.companies) {
    if (!company.name.toLowerCase().includes(trimmed)) continue;
    hits.push({
      kind: "company",
      id: company.id,
      label: company.name,
      detail: `Founded ${company.founded} · ${company.hq}`,
    });
  }
  for (const market of collections.markets) {
    if (!market.name.toLowerCase().includes(trimmed)) continue;
    hits.push({
      kind: "market",
      id: market.id,
      label: market.name,
      detail: `Since ${market.originYear}`,
    });
  }
  for (const event of collections.events) {
    if (!event.title.toLowerCase().includes(trimmed)) continue;
    hits.push({ kind: "event", id: event.id, label: event.title, detail: String(event.year) });
  }

  return hits.slice(0, limit);
};

// --- referential integrity ---------------------------------------------------

export type IntegrityIssue = { collection: string; id: string; message: string };

const pushMissing = (
  issues: IntegrityIssue[],
  collection: string,
  id: string,
  label: string,
  candidate: string,
  known: ReadonlySet<string>,
): void => {
  if (known.has(candidate)) return;
  issues.push({ collection, id, message: `${label} "${candidate}" does not resolve` });
};

/** Shared by `scripts/validate-data.ts` and the QA pass; returns [] when clean. */
export const checkReferentialIntegrity = (
  collections: AtlasCollections,
): IntegrityIssue[] => {
  const issues: IntegrityIssue[] = [];
  const sourceIds = new Set(collections.sources.map((source) => source.id));
  const marketIds = new Set(collections.markets.map((market) => market.id));
  const companyIds = new Set(collections.companies.map((company) => company.id));
  const shareHolderIds = new Set([
    ...companyIds,
    ...(collections.vendors ?? []).map((vendor) => vendor.id),
  ]);
  const eventIds = new Set(collections.events.map((event) => event.id));

  const checkDuplicates = <TItem extends { id: string }>(
    name: string,
    items: readonly TItem[],
  ): void => {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.id)) issues.push({ collection: name, id: item.id, message: "duplicate id" });
      seen.add(item.id);
    }
  };

  checkDuplicates("sources", collections.sources);
  checkDuplicates("eras", collections.eras);
  checkDuplicates("markets", collections.markets);
  checkDuplicates("companies", collections.companies);
  checkDuplicates("events", collections.events);
  checkDuplicates("emerging", collections.emerging);
  checkDuplicates("flows", collections.flows);

  const checkPoints = (
    collection: string,
    id: string,
    points: readonly DataPoint[],
    label: string,
  ): void => {
    for (const point of points) {
      pushMissing(issues, collection, id, `${label} sourceId`, point.sourceId, sourceIds);
    }
  };

  for (const era of collections.eras) {
    for (const companyId of [...era.definingCompanyIds, ...era.survivors, ...era.casualties]) {
      pushMissing(issues, "eras", era.id, "companyId", companyId, companyIds);
    }
  }

  for (const market of collections.markets) {
    if (market.parentId !== null) {
      pushMissing(issues, "markets", market.id, "parentId", market.parentId, marketIds);
    }
    checkPoints("markets", market.id, market.sizeByYear, "sizeByYear");
    if (market.growthRate) checkPoints("markets", market.id, [market.growthRate], "growthRate");
    if (market.hhi) checkPoints("markets", market.id, [market.hhi], "hhi");
    for (const entry of market.sharesByYear) {
      const total = entry.shares.reduce((sum, item) => sum + item.share.value, 0);
      if (total > 100.5) {
        issues.push({
          collection: "markets",
          id: market.id,
          message: `shares for ${entry.year} sum to ${total.toFixed(1)}%, above 100%`,
        });
      }
      for (const item of entry.shares) {
        pushMissing(issues, "markets", market.id, "share companyId", item.companyId, shareHolderIds);
        pushMissing(issues, "markets", market.id, "share sourceId", item.share.sourceId, sourceIds);
      }
    }
  }

  // parentId chains must be acyclic
  for (const market of collections.markets) {
    const seen = new Set<string>([market.id]);
    let cursor = market.parentId;
    while (cursor !== null) {
      if (seen.has(cursor)) {
        issues.push({ collection: "markets", id: market.id, message: "parentId chain is cyclic" });
        break;
      }
      seen.add(cursor);
      const parent = collections.markets.find((candidate) => candidate.id === cursor);
      if (!parent) break;
      cursor = parent.parentId;
    }
  }

  for (const company of collections.companies) {
    for (const marketId of company.marketIds) {
      pushMissing(issues, "companies", company.id, "marketId", marketId, marketIds);
    }
    if (company.acquiredById !== undefined) {
      pushMissing(issues, "companies", company.id, "acquiredById", company.acquiredById, companyIds);
    }
    checkPoints("companies", company.id, company.revenueByYear, "revenueByYear");
    checkPoints("companies", company.id, company.marketCapByYear ?? [], "marketCapByYear");
    checkPoints("companies", company.id, company.grossMarginByYear ?? [], "grossMarginByYear");
  }

  for (const event of collections.events) {
    for (const companyId of event.companyIds) {
      pushMissing(issues, "events", event.id, "companyId", companyId, companyIds);
    }
    for (const marketId of event.marketIds) {
      pushMissing(issues, "events", event.id, "marketId", marketId, marketIds);
    }
    if (event.acquirerId) {
      pushMissing(issues, "events", event.id, "acquirerId", event.acquirerId, companyIds);
    }
    if (event.targetId) {
      pushMissing(issues, "events", event.id, "targetId", event.targetId, companyIds);
    }
    for (const sourceId of event.sourceIds) {
      pushMissing(issues, "events", event.id, "sourceId", sourceId, sourceIds);
    }
    if (event.dealValue) checkPoints("events", event.id, [event.dealValue], "dealValue");
  }

  for (const market of collections.emerging) {
    for (const playerId of market.keyPlayerIds) {
      pushMissing(issues, "emerging", market.id, "keyPlayerId", playerId, companyIds);
    }
    for (const signal of market.signals) {
      for (const sourceId of signal.sourceIds) {
        pushMissing(issues, "emerging", market.id, "signal sourceId", sourceId, sourceIds);
      }
    }
  }

  for (const flow of collections.flows) {
    pushMissing(issues, "flows", flow.id, "fromMarketId", flow.fromMarketId, marketIds);
    pushMissing(issues, "flows", flow.id, "eventId", flow.eventId, eventIds);
    const known = flow.toKind === "market" ? marketIds : companyIds;
    pushMissing(issues, "flows", flow.id, "toId", flow.toId, known);
  }

  return issues;
};
