"use client";

import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from "d3-hierarchy";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  INTERPOLATION_NOTE,
  sizeConfidence,
  stepYear,
  treemapGrowthPercent,
  worstConfidence,
} from "@/components/charts/primitives/atlasChartMath";
import {
  UPPERCASE_WIDTH_FACTOR,
  fitLabel,
  fitLabelInBox,
} from "@/components/charts/primitives/atlasLabelFit";
import {
  pooledTileLabel,
  splitTreemapTail,
  sumValues,
} from "@/components/charts/primitives/atlasTreemapMath";
import { ChartFrame } from "@/components/charts/primitives/ChartFrame";
import { ChartTooltip, type TooltipRow } from "@/components/charts/primitives/ChartTooltip";
import { DataTable, type DataTableColumn } from "@/components/charts/primitives/DataTable";
import { EmptyState } from "@/components/charts/primitives/EmptyState";
import { HatchDefs, markStyleFor } from "@/components/charts/primitives/HatchDefs";
import { Legend, type LegendItem } from "@/components/charts/primitives/Legend";
import { isNarrow, useChartSize } from "@/components/charts/primitives/useChartSize";
import { useKeyboardNav } from "@/components/charts/primitives/useKeyboardNav";
import { useReducedMotion } from "@/components/charts/primitives/useReducedMotion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Category, Confidence, Market, Maturity } from "@/data/types";
import {
  categoryLabel,
  formatSignedPercent,
  formatValue,
  maturityLabel,
} from "@/lib/format";
import { CATEGORY_ORDER, MATURITY_ORDER, maturityColorScale } from "@/lib/scales";
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

/** §10.4: the treemap gets at least 420px of plot height. */
const PLOT_HEIGHT = 460;
const NARROW_PLOT_HEIGHT = 420;
/** Gutter reserved above each category's tiles; headings never sit on a tile. */
const CATEGORY_HEADER = 26;
const PLAY_INTERVAL_MS = 900;
const GROWTH_CLAMP_PERCENT = 40;
/** §10.2: tile names at 12px, the value line under them at 11px. */
const TILE_LABEL_FONT = 12;
const TILE_VALUE_FONT = 11;
const HEADER_FONT = 11;
const TILE_PADDING = 6;
const NAME_BASELINE = 16;
const VALUE_BASELINE = 30;
/** Room for a name line plus a value line, plus breathing space. */
const TWO_LINE_HEIGHT = 36;
const MAX_TOOLTIP_NAMES = 4;

type SizedLeaf = { kind: "market"; id: string; datum: MarketSizeAtYear };
type PooledLeaf = {
  kind: "pooled";
  id: string;
  category: Category;
  markets: MarketSizeAtYear[];
  value: number;
};
type TreemapLeaf = SizedLeaf | PooledLeaf;
type TreemapGroup = { kind: "category"; category: Category; children: TreemapLeaf[] };
type TreemapRoot = { kind: "root"; children: TreemapGroup[] };
type TreemapDatum = TreemapRoot | TreemapGroup | TreemapLeaf;

type LeafNode = HierarchyRectangularNode<TreemapDatum> & { data: TreemapLeaf };
type GroupNode = HierarchyRectangularNode<TreemapDatum> & { data: TreemapGroup };

type TableRow = {
  id: string;
  name: string;
  category: Category;
  maturity: Maturity;
  size: string;
  growth: string;
  source: string;
  confidence: Confidence;
  note?: string;
};

/** Diverging growth ramp built from theme tokens, so it re-reads in dark mode. */
const growthColor = (growth: number | null): string => {
  if (growth === null) return "var(--muted-foreground)";
  const magnitude = Math.min(1, Math.abs(growth) / GROWTH_CLAMP_PERCENT);
  const weight = Math.round(26 + magnitude * 64);
  const accent = growth >= 0 ? "var(--cat-infrastructure)" : "var(--cat-consumer)";
  return `color-mix(in oklab, ${accent} ${weight}%, var(--background))`;
};

const childrenOf = (node: TreemapDatum): readonly TreemapDatum[] | null =>
  node.kind === "market" || node.kind === "pooled" ? null : node.children;

const leafValue = (node: TreemapDatum): number => {
  if (node.kind === "market") return Math.max(0, node.datum.value);
  if (node.kind === "pooled") return Math.max(0, node.value);
  return 0;
};

const isLeaf = (node: HierarchyRectangularNode<TreemapDatum>): node is LeafNode =>
  node.data.kind === "market" || node.data.kind === "pooled";

const isGroup = (node: HierarchyRectangularNode<TreemapDatum>): node is GroupNode =>
  node.data.kind === "category";

const pooledSourceIds = (leaf: PooledLeaf): Set<string> =>
  new Set(leaf.markets.map((entry) => entry.basis.sourceId));

const pooledConfidence = (leaf: PooledLeaf): Confidence =>
  worstConfidence(
    ...leaf.markets.map((entry) => sizeConfidence(entry.basis.confidence, entry.interpolated)),
  );

/**
 * Chart 2. Category to market, tile area is the market's size in the selected year.
 * A size that had to be interpolated between reported years is a modeled number and
 * is drawn and labelled as one; markets the Atlas cannot size are listed as text
 * beneath the treemap rather than given an invented area.
 *
 * Three legibility rules from `docs/CONTRACTS.md` §10 shape it: a tile is only
 * labelled when the label fits (§10.1), category headings live in their own gutter
 * above the tiles rather than behind them (§10.5), and the long tail of tiles too
 * small to read is pooled into one "Other" tile per category that opens that
 * category on its own (§10.6).
 */
export const MarketTreemap = ({
  sized,
  unsized,
  year,
  minYear,
  maxYear,
  colorBy,
  onColorByChange,
  onYearChange,
  onSelectMarket,
  sourceTitleFor,
  highlightedMarketId,
  onHoverMarket,
}: MarketTreemapProps): React.ReactElement => {
  const { ref: containerRef, size } = useChartSize({ initial: { width: 820, height: 480 } });
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState<boolean>(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [requestedCategory, setRequestedCategory] = useState<Category | null>(null);

  /**
   * The opened category is derived rather than stored: when a filter or a new year
   * empties the category the reader drilled into, the treemap falls straight back
   * to every category on the next render instead of through a second one.
   */
  const openCategory = useMemo<Category | null>(() => {
    if (requestedCategory === null) return null;
    return sized.some((datum) => datum.market.category === requestedCategory)
      ? requestedCategory
      : null;
  }, [requestedCategory, sized]);

  const narrow = isNarrow(size.width);
  const plotHeight = narrow ? NARROW_PLOT_HEIGHT : PLOT_HEIGHT;
  const plotWidth = Math.max(80, size.width);

  const canPlay = onYearChange !== undefined && maxYear > minYear && !reducedMotion;

  useEffect(() => {
    if (!playing || !canPlay || !onYearChange) return;
    const timer = window.setTimeout(() => {
      onYearChange(stepYear(year, minYear, maxYear));
    }, PLAY_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [canPlay, maxYear, minYear, onYearChange, playing, year]);

  const visible = useMemo(
    () => (openCategory === null ? sized : sized.filter((datum) => datum.market.category === openCategory)),
    [openCategory, sized],
  );

  const root = useMemo<TreemapRoot>(() => {
    const grouped = new Map<Category, MarketSizeAtYear[]>();
    for (const datum of visible) {
      if (datum.value <= 0) continue;
      const bucket = grouped.get(datum.market.category);
      if (bucket) {
        bucket.push(datum);
        continue;
      }
      grouped.set(datum.market.category, [datum]);
    }

    const categories = CATEGORY_ORDER.filter((category) => grouped.has(category));
    const totalValue = sumValues(visible, (datum) => datum.value);
    const plotArea = Math.max(
      1,
      plotWidth * Math.max(1, plotHeight - categories.length * CATEGORY_HEADER),
    );

    const children: TreemapGroup[] = categories.map((category) => {
      const markets = grouped.get(category) ?? [];
      // Inside an opened category every market gets its own tile: there is room.
      const split =
        openCategory === null
          ? splitTreemapTail(markets, (datum) => datum.value, { totalValue, plotArea })
          : { kept: [...markets].sort((a, b) => b.value - a.value), pooled: [] };

      const leaves: TreemapLeaf[] = split.kept.map((datum) => ({
        kind: "market",
        id: datum.market.id,
        datum,
      }));

      if (split.pooled.length > 0) {
        leaves.push({
          kind: "pooled",
          id: `pooled:${category}`,
          category,
          markets: split.pooled,
          value: sumValues(split.pooled, (datum) => datum.value),
        });
      }

      return { kind: "category", category, children: leaves };
    });

    return { kind: "root", children };
  }, [openCategory, plotHeight, plotWidth, visible]);

  const layout = useMemo(() => {
    if (root.children.length === 0) return null;
    const node = hierarchy<TreemapDatum>(root, childrenOf)
      .sum(leafValue)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return treemap<TreemapDatum>()
      .tile(treemapSquarify)
      .size([plotWidth, plotHeight])
      .paddingInner(3)
      // paddingOuter sets all four sides, so it must come before paddingTop or it
      // erases the gutter the category headings are drawn into.
      .paddingOuter(2)
      .paddingTop(CATEGORY_HEADER)
      .round(true)(node);
  }, [plotHeight, plotWidth, root]);

  const leaves = useMemo(() => (layout ? layout.leaves().filter(isLeaf) : []), [layout]);

  const groups = useMemo(
    () => (layout ? (layout.children ?? []).filter(isGroup) : []),
    [layout],
  );

  const growthById = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const datum of sized) {
      map.set(datum.market.id, treemapGrowthPercent(datum.market, year));
    }
    return map;
  }, [sized, year]);

  const colorForDatum = useCallback(
    (datum: MarketSizeAtYear): string => {
      if (colorBy === "maturity") return maturityColorScale(datum.market.maturity);
      return growthColor(growthById.get(datum.market.id) ?? null);
    },
    [colorBy, growthById],
  );

  const colorForLeaf = useCallback(
    (leaf: TreemapLeaf): string => {
      if (leaf.kind === "market") return colorForDatum(leaf.datum);
      return "var(--muted-foreground)";
    },
    [colorForDatum],
  );

  const describeDatum = useCallback(
    (datum: MarketSizeAtYear): string => {
      const confidence = sizeConfidence(datum.basis.confidence, datum.interpolated);
      const growth = growthById.get(datum.market.id) ?? null;
      const growthText =
        growth === null ? "growth not available" : `growth ${formatSignedPercent(growth)}`;
      return `${datum.market.name}, ${categoryLabel[datum.market.category]}, ${year}: ${formatValue(datum.value, datum.basis.unit)} (${confidence}), ${growthText}, ${maturityLabel[datum.market.maturity]}.`;
    },
    [growthById, year],
  );

  const describeLeaf = useCallback(
    (leaf: TreemapLeaf): string => {
      if (leaf.kind === "market") return describeDatum(leaf.datum);
      const unit = leaf.markets[0]?.basis.unit ?? "USD_B";
      const names = leaf.markets.map((entry) => entry.market.name).join(", ");
      return `${pooledTileLabel(leaf.markets.length)} in ${categoryLabel[leaf.category]}, ${year}: ${formatValue(leaf.value, unit)} combined. Opens the ${categoryLabel[leaf.category]} category on its own. Markets pooled here: ${names}.`;
    },
    [describeDatum, year],
  );

  const handleSelectMarket = useCallback(
    (marketId: string): void => {
      onSelectMarket?.(marketId);
    },
    [onSelectMarket],
  );

  const handleHoverLeaf = useCallback(
    (leafId: string | null, marketId: string | null): void => {
      setHoveredId(leafId);
      onHoverMarket?.(marketId);
    },
    [onHoverMarket],
  );

  const handleActivateLeaf = useCallback(
    (leaf: LeafNode): void => {
      if (leaf.data.kind === "pooled") {
        setRequestedCategory(leaf.data.category);
        return;
      }
      handleSelectMarket(leaf.data.datum.market.id);
    },
    [handleSelectMarket],
  );

  const handleFocusLeaf = useCallback(
    (leaf: LeafNode): void => {
      handleHoverLeaf(
        leaf.data.id,
        leaf.data.kind === "market" ? leaf.data.datum.market.id : null,
      );
    },
    [handleHoverLeaf],
  );

  const handleLeaveLeaf = useCallback((): void => {
    handleHoverLeaf(null, null);
  }, [handleHoverLeaf]);

  const nav = useKeyboardNav<LeafNode>({
    items: leaves,
    getId: (leaf) => leaf.data.id,
    orientation: "horizontal",
    onActivate: handleActivateLeaf,
    onFocusChange: handleFocusLeaf,
  });

  const handleTogglePlay = useCallback((): void => {
    setPlaying((current) => !current);
  }, []);

  const handleShowAllCategories = useCallback((): void => {
    setRequestedCategory(null);
  }, []);

  const handleSliderChange = useCallback(
    (values: number[]): void => {
      const next = values[0];
      if (next === undefined) return;
      onYearChange?.(Math.round(next));
    },
    [onYearChange],
  );

  const handleColorByChange = useCallback(
    (value: string): void => {
      if (value !== "growth" && value !== "maturity") return;
      onColorByChange?.(value);
    },
    [onColorByChange],
  );

  const hoveredLeaf = useMemo(
    () => leaves.find((leaf) => leaf.data.id === hoveredId) ?? null,
    [hoveredId, leaves],
  );

  const tooltipRows = useMemo<TooltipRow[]>(() => {
    if (!hoveredLeaf) return [];
    const leaf = hoveredLeaf.data;

    if (leaf.kind === "pooled") {
      const unit = leaf.markets[0]?.basis.unit ?? "USD_B";
      const sources = pooledSourceIds(leaf);
      const firstSource = [...sources][0];
      return [
        {
          label: `Combined size of ${leaf.markets.length} markets`,
          value: leaf.value,
          unit,
          confidence: pooledConfidence(leaf),
          source:
            sources.size === 1 && firstSource
              ? sourceTitleFor(firstSource)
              : `${sources.size} sizing sources, one per market, all listed in the table`,
          note: "The smallest markets in this category, pooled because their tiles would be too small to label.",
          color: "var(--muted-foreground)",
        },
      ];
    }

    const datum = leaf.datum;
    const confidence = sizeConfidence(datum.basis.confidence, datum.interpolated);
    const growth = growthById.get(datum.market.id) ?? null;
    const rows: TooltipRow[] = [
      {
        label: `Market size, ${year}`,
        value: datum.value,
        unit: datum.basis.unit,
        confidence,
        source: sourceTitleFor(datum.basis.sourceId),
        note: datum.interpolated ? INTERPOLATION_NOTE : datum.basis.note,
        low: datum.interpolated ? undefined : datum.basis.low,
        high: datum.interpolated ? undefined : datum.basis.high,
        color: colorForDatum(datum),
      },
    ];
    if (growth !== null) {
      rows.push({
        label: "Year-over-year growth",
        value: growth,
        unit: "percent",
        confidence: "modeled",
        source: sourceTitleFor(datum.basis.sourceId),
        note: "Modeled: change against the previous year in the same size series.",
        color: growthColor(growth),
      });
    }
    return rows;
  }, [colorForDatum, growthById, hoveredLeaf, sourceTitleFor, year]);

  const tooltipTitle = useMemo(() => {
    const leaf = hoveredLeaf?.data;
    if (!leaf) return "";
    if (leaf.kind === "market") return leaf.datum.market.name;
    return `${pooledTileLabel(leaf.markets.length)} — ${categoryLabel[leaf.category]}`;
  }, [hoveredLeaf]);

  const tooltipFootnote = useMemo(() => {
    const leaf = hoveredLeaf?.data;
    if (!leaf) return undefined;
    if (leaf.kind === "market") return leaf.datum.market.definition;
    const names = leaf.markets.slice(0, MAX_TOOLTIP_NAMES).map((entry) => entry.market.name);
    const hidden = leaf.markets.length - names.length;
    const more = hidden > 0 ? ` +${hidden} more.` : "";
    return `${names.join(", ")}.${more} Open this category to see each one, or read them all in the table.`;
  }, [hoveredLeaf]);

  const legendItems = useMemo<LegendItem[]>(() => {
    if (colorBy === "maturity") {
      return MATURITY_ORDER.map((maturity) => ({
        id: maturity,
        label: maturityLabel[maturity],
        color: maturityColorScale(maturity),
      }));
    }
    return [
      { id: "down", label: "Shrinking", color: growthColor(-GROWTH_CLAMP_PERCENT) },
      { id: "flat", label: "Flat", color: growthColor(0) },
      { id: "up", label: "Growing", color: growthColor(GROWTH_CLAMP_PERCENT) },
      { id: "fast", label: "Above 40% a year", color: growthColor(GROWTH_CLAMP_PERCENT * 2) },
      { id: "none", label: "No growth data", color: "var(--muted-foreground)", dashed: true },
    ];
  }, [colorBy]);

  const tableRows = useMemo<TableRow[]>(() => {
    const sizedRows: TableRow[] = sized.map((datum) => {
      const confidence = sizeConfidence(datum.basis.confidence, datum.interpolated);
      const growth = growthById.get(datum.market.id) ?? null;
      return {
        id: datum.market.id,
        name: datum.market.name,
        category: datum.market.category,
        maturity: datum.market.maturity,
        size: formatValue(datum.value, datum.basis.unit),
        growth: growth === null ? "—" : formatSignedPercent(growth),
        source: sourceTitleFor(datum.basis.sourceId),
        confidence,
        note: datum.interpolated ? INTERPOLATION_NOTE : datum.basis.note,
      };
    });
    const unsizedRows: TableRow[] = unsized.map((market) => ({
      id: market.id,
      name: market.name,
      category: market.category,
      maturity: market.maturity,
      size: "Not sized",
      growth: "—",
      source: "No size series the Atlas could verify",
      confidence: "estimated",
      note: "No published size figure for this market and year; it is deliberately left out of the treemap.",
    }));
    return [...sizedRows, ...unsizedRows];
  }, [growthById, sized, sourceTitleFor, unsized]);

  const tableColumns = useMemo<DataTableColumn<TableRow>[]>(
    () => [
      { key: "name", header: "Market", render: (row) => row.name },
      { key: "category", header: "Category", render: (row) => categoryLabel[row.category] },
      { key: "size", header: `Size ${year}`, align: "right", numeric: true, render: (row) => row.size },
      { key: "growth", header: "Growth", align: "right", numeric: true, render: (row) => row.growth },
      { key: "maturity", header: "Maturity", render: (row) => maturityLabel[row.maturity] },
      { key: "source", header: "Source", render: (row) => row.source },
    ],
    [year],
  );

  const totalSize = useMemo(() => sumValues(sized, (datum) => datum.value), [sized]);

  const interpolatedCount = useMemo(
    () => sized.filter((datum) => datum.interpolated).length,
    [sized],
  );

  const pooledLeafCount = useMemo(
    () =>
      leaves.reduce(
        (total, leaf) => (leaf.data.kind === "pooled" ? total + leaf.data.markets.length : total),
        0,
      ),
    [leaves],
  );

  const takeaway = useMemo(() => {
    if (sized.length === 0) {
      return `No market in the current selection has a size the Atlas can verify for ${year}.`;
    }
    const unit = sized[0]?.basis.unit ?? "USD_B";
    if (openCategory !== null) {
      return `${categoryLabel[openCategory]} on its own: ${visible.length} sized markets totalling ${formatValue(sumValues(visible, (datum) => datum.value), unit)} in ${year}.`;
    }
    return `${sized.length} markets totalling ${formatValue(totalSize, unit)} in ${year}; ${unsized.length} more are tracked but not sized, and are listed beneath rather than drawn.`;
  }, [openCategory, sized, totalSize, unsized.length, visible, year]);

  const sourceLine = useMemo(() => {
    const sourceIds = new Set(sized.map((datum) => datum.basis.sourceId));
    if (sourceIds.size === 0) return "No sized markets in the current selection.";
    const pooling =
      pooledLeafCount === 0
        ? ""
        : ` ${pooledLeafCount} of the smallest markets are pooled into "Other" tiles so the rest stay readable; open a tile or the table for each one.`;
    return `${sourceIds.size} sizing sources, cited per tile. ${interpolatedCount} tiles are interpolated between reported years and are therefore modeled.${pooling}`;
  }, [interpolatedCount, pooledLeafCount, sized]);

  const toolbar = (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {openCategory === null ? null : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            /* Opening a category removes the tile that was focused, so focus moves
               to the way back out rather than being dropped on the document. */
            autoFocus
            onClick={handleShowAllCategories}
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            All categories
          </Button>
        )}

        <ToggleGroup
          type="single"
          value={colorBy}
          onValueChange={handleColorByChange}
          variant="outline"
          size="sm"
          aria-label="Colour the treemap by"
        >
          <ToggleGroupItem value="growth">Growth</ToggleGroupItem>
          <ToggleGroupItem value="maturity">Maturity</ToggleGroupItem>
        </ToggleGroup>

        {onYearChange === undefined ? null : (
          <div className="flex min-w-[220px] flex-1 items-center gap-3">
            {canPlay ? (
              <Button type="button" variant="outline" size="icon-sm" onClick={handleTogglePlay}>
                {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                <span className="sr-only">
                  {playing ? "Pause the year playback" : "Play through the years"}
                </span>
              </Button>
            ) : null}
            <Slider
              min={minYear}
              max={maxYear}
              step={1}
              value={[year]}
              onValueChange={handleSliderChange}
              aria-label={`Year: ${year}`}
              className="min-w-[120px] flex-1"
            />
            <span className="w-12 shrink-0 font-mono text-sm tabular-nums">{year}</span>
          </div>
        )}
      </div>
      <Legend items={legendItems} />
    </div>
  );

  const unsizedInScope = useMemo(
    () =>
      openCategory === null
        ? unsized
        : unsized.filter((market) => market.category === openCategory),
    [openCategory, unsized],
  );

  const unsizedList =
    unsizedInScope.length === 0 ? null : (
      <div className="mt-4 border-t border-border pt-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Tracked but not sized in {year} ({unsizedInScope.length})
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          These markets have no size figure the Atlas could verify for this year, so they are named
          here rather than given an area.
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {unsizedInScope.map((market) => (
            <li key={market.id}>
              <button
                type="button"
                onClick={() => handleSelectMarket(market.id)}
                onMouseEnter={() => onHoverMarket?.(market.id)}
                onMouseLeave={() => onHoverMarket?.(null)}
                className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {market.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );

  if (sized.length === 0 && unsized.length === 0) {
    return (
      <ChartFrame
        title="Market sizes by category"
        takeaway={takeaway}
        source="No sized markets in the current selection."
      >
        <EmptyState
          title="No markets match this selection"
          description={`Nothing in the Atlas is sized or tracked for ${year} under the current filters. Clear a filter or move the year to see the taxonomy.`}
        />
      </ChartFrame>
    );
  }

  const renderLeaf = (leaf: LeafNode): React.ReactElement | null => {
    const width = Math.max(0, leaf.x1 - leaf.x0);
    const height = Math.max(0, leaf.y1 - leaf.y0);
    if (width <= 0 || height <= 0) return null;

    const data = leaf.data;
    const isPooled = data.kind === "pooled";
    const name = isPooled ? pooledTileLabel(data.markets.length) : data.datum.market.name;
    const unit = isPooled ? data.markets[0]?.basis.unit ?? "USD_B" : data.datum.basis.unit;
    const value = isPooled ? data.value : data.datum.value;
    const confidence = isPooled
      ? pooledConfidence(data)
      : sizeConfidence(data.datum.basis.confidence, data.datum.interpolated);
    const color = colorForLeaf(data);
    const style = markStyleFor(color, confidence);
    const dimmed =
      typeof highlightedMarketId === "string" &&
      highlightedMarketId.length > 0 &&
      !(data.kind === "market" && highlightedMarketId === data.datum.market.id);

    // §10.1: measure first. No room for the name means no text at all.
    const nameFit = fitLabelInBox(name, { width, height }, TILE_LABEL_FONT, TILE_PADDING);
    const valueText = formatValue(value, unit);
    const valueFit =
      nameFit && height >= TWO_LINE_HEIGHT
        ? fitLabel(valueText, width - TILE_PADDING * 2, TILE_VALUE_FONT)
        : null;
    const nameY = valueFit ? NAME_BASELINE : Math.min(NAME_BASELINE, height / 2 + 4);

    return (
      <g key={data.id} transform={`translate(${leaf.x0}, ${leaf.y0})`}>
        <rect
          ref={nav.registerMark(data.id)}
          width={width}
          height={height}
          rx={2}
          style={{ color }}
          fill={style.fill}
          fillOpacity={dimmed ? 0.2 : style.fillOpacity}
          stroke={style.stroke}
          strokeWidth={style.strokeWidth}
          strokeDasharray={style.strokeDasharray}
          tabIndex={nav.getTabIndex(leaf)}
          role="button"
          aria-label={describeLeaf(data)}
          className="cursor-pointer outline-none focus-visible:stroke-ring focus-visible:[stroke-width:3]"
          onClick={() => handleActivateLeaf(leaf)}
          onKeyDown={(keyEvent) => nav.handleKeyDown(keyEvent, leaf)}
          onFocus={() => {
            nav.handleFocus(leaf);
            handleFocusLeaf(leaf);
          }}
          onBlur={handleLeaveLeaf}
          onMouseEnter={() => handleFocusLeaf(leaf)}
          onMouseLeave={handleLeaveLeaf}
        >
        </rect>

        {nameFit ? (
          <text
            aria-hidden="true"
            x={TILE_PADDING}
            y={nameY}
            className="pointer-events-none fill-foreground stroke-card text-[12px] font-medium [paint-order:stroke] [stroke-linejoin:round] [stroke-width:4px]"
          >
            {nameFit.text}
          </text>
        ) : null}

        {valueFit ? (
          <text
            aria-hidden="true"
            x={TILE_PADDING}
            y={VALUE_BASELINE}
            className="pointer-events-none fill-muted-foreground stroke-card font-mono text-[11px] [paint-order:stroke] [stroke-linejoin:round] [stroke-width:4px]"
          >
            {valueFit.text}
          </text>
        ) : null}
      </g>
    );
  };

  return (
    <ChartFrame
      title="Market sizes by category"
      takeaway={takeaway}
      source={sourceLine}
      toolbar={toolbar}
      table={
        <DataTable
          caption={`Market sizes and growth in ${year}, including markets the Atlas cannot size`}
          columns={tableColumns}
          rows={tableRows}
          getRowKey={(row) => row.id}
          getConfidence={(row) => ({ confidence: row.confidence, note: row.note })}
        />
      }
      footnote='Tiles hatched with diagonal lines are estimates; tiles with a dashed outline are modeled, which includes every size interpolated between two reported years. A tile is only labelled when the label fits — the table names every market either way.'
    >
      <div ref={containerRef} className="relative w-full">
        {visible.length === 0 ? (
          <EmptyState
            title="No sized markets in this year"
            description={`Every market in the current selection is tracked but unsized for ${year}. They are listed below.`}
          />
        ) : (
          <svg
            width={plotWidth}
            height={plotHeight}
            viewBox={`0 0 ${plotWidth} ${plotHeight}`}
            role="group"
            aria-label={`Treemap of ${leaves.length} tiles covering ${visible.length} market sizes in ${year}, grouped by category`}
            className="w-full select-none"
          >
            <HatchDefs />

            {leaves.map(renderLeaf)}

            {/*
              §10.5: category headings are drawn last, into their own opaque gutter
              above each group, so they can never read as a watermark behind tiles.
            */}
            {groups.map((group) => {
              const width = Math.max(0, group.x1 - group.x0);
              const label = categoryLabel[group.data.category].toUpperCase();
              const count = group.data.children.reduce(
                (total, child) => total + (child.kind === "pooled" ? child.markets.length : 1),
                0,
              );
              // Uppercase and letter-spaced, so it is measured at a wider effective size.
              const headingFont = HEADER_FONT * UPPERCASE_WIDTH_FACTOR;
              const withCount = fitLabel(`${label} · ${count}`, width - 12, headingFont);
              const heading = withCount ?? fitLabel(label, width - 12, headingFont);
              // An unlabelled grey strip explains nothing, so draw neither.
              if (!heading) return null;

              return (
                <g key={`group-${group.data.category}`}>
                  <rect
                    aria-hidden="true"
                    x={group.x0}
                    y={group.y0}
                    width={width}
                    height={CATEGORY_HEADER - 4}
                    rx={3}
                    className="fill-secondary"
                  />
                  <text
                    aria-hidden="true"
                    x={group.x0 + 6}
                    y={group.y0 + CATEGORY_HEADER - 11}
                    className="pointer-events-none fill-foreground text-[11px] font-semibold uppercase tracking-wider"
                  >
                    {heading.text}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        <ChartTooltip
          x={hoveredLeaf ? hoveredLeaf.x0 + (hoveredLeaf.x1 - hoveredLeaf.x0) / 2 : 0}
          y={hoveredLeaf ? hoveredLeaf.y0 : 0}
          containerWidth={plotWidth}
          containerHeight={plotHeight}
          title={tooltipTitle}
          year={year}
          rows={tooltipRows}
          footnote={tooltipFootnote}
          visible={hoveredLeaf !== null}
        />

        {unsizedList}
      </div>
    </ChartFrame>
  );
};
