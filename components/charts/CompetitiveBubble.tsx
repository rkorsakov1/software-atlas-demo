"use client";

import { line } from "d3-shape";
import { Pause, Pin, PinOff, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  UNSIZED_BUBBLE_RADIUS,
  bubbleGrowthDomain,
  bubblePaintOrder,
  bubbleRadiusScaleFor,
  bubbleReadingOrder,
  bubbleRevenueDomain,
  isSizedByMetric,
  sizeMetricLabel,
} from "@/components/charts/primitives/atlasBubbleMath";
import { stepYear, trailUpToYear } from "@/components/charts/primitives/atlasChartMath";
import {
  placedLabelsById,
  type OutsideLabelMark,
} from "@/components/charts/primitives/atlasLabelPlacement";
import { Axis, ticksFrom } from "@/components/charts/primitives/Axis";
import { ChartFrame } from "@/components/charts/primitives/ChartFrame";
import { ChartTooltip, type TooltipRow } from "@/components/charts/primitives/ChartTooltip";
import { DataTable, type DataTableColumn } from "@/components/charts/primitives/DataTable";
import { EmptyState } from "@/components/charts/primitives/EmptyState";
import { HatchDefs, markStyleFor } from "@/components/charts/primitives/HatchDefs";
import { Legend, type LegendItem } from "@/components/charts/primitives/Legend";
import { isNarrow, useChartSize } from "@/components/charts/primitives/useChartSize";
import { useKeyboardNav } from "@/components/charts/primitives/useKeyboardNav";
import { useNarrowViewport } from "@/components/charts/primitives/useNarrowViewport";
import { useReducedMotion } from "@/components/charts/primitives/useReducedMotion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Archetype, Confidence } from "@/data/types";
import { cn } from "@/lib/cn";
import {
  archetypeLabel,
  formatSignedPercent,
  formatUsdBillions,
  formatValue,
} from "@/lib/format";
import { ARCHETYPE_ORDER, archetypeColor, niceLinearScale, revenueLogScale } from "@/lib/scales";
import {
  INTERPOLATED_BUBBLE_NOTE,
  bubbleDatumConfidence,
  type BubbleDatum,
  type BubbleSizeMetric,
} from "@/lib/selectors";

export type { BubbleSizeMetric };

export type BubbleTrailPoint = { year: number; revenue: number; growth: number };

export type CompetitiveBubbleProps = {
  data: readonly BubbleDatum[];
  year: number;
  minYear: number;
  maxYear: number;
  sizeMetric: BubbleSizeMetric;
  /**
   * The metrics the loaded dataset can actually back, from
   * `availableSizeMetrics(companies)`. Omitted, the chart derives them from the
   * data it was given. Never hard-coded: market cap ships empty (CONTRACTS §8.5).
   */
  availableSizeMetrics?: readonly BubbleSizeMetric[];
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

const PLOT_HEIGHT = 440;
const NARROW_PLOT_HEIGHT = 340;
const MARGIN = { top: 18, right: 28, bottom: 54, left: 66 };
const NARROW_MARGIN = { top: 12, right: 14, bottom: 48, left: 48 };
const PLAY_INTERVAL_MS = 1100;
const LABELLED_BUBBLES = 6;
const LABEL_FONT_PX = 11;
const LABEL_GAP_PX = 8;
const LABEL_OFFSET_PX = 4;

const GROWTH_NOTE =
  "Modeled: year-over-year change in the company's own revenue series, against the previous year in that series.";

const METRIC_ORDER: readonly BubbleSizeMetric[] = ["marketCap", "grossMargin", "revenue"];

const MARKET_CAP_ABSENT =
  "Market capitalisation is not offered: no share-price series could be verified without reconstructing it, so the Atlas does not ship one.";

/** The note the table row carries under its confidence badge. */
const tableNoteFor = (datum: BubbleDatum, sized: boolean, interpolated: boolean): string => {
  if (interpolated) return INTERPOLATED_BUBBLE_NOTE;
  const sizeNote = datum.sizeBasis?.note;
  if (sized && sizeNote) return sizeNote;
  return GROWTH_NOTE;
};

type BubbleTableRow = {
  id: string;
  name: string;
  archetype: Archetype;
  revenue: string;
  growth: string;
  size: string;
  source: string;
  confidence: Confidence;
  note?: string;
  pinned: boolean;
};

/**
 * Chart 4. Revenue on a log x axis, year-over-year revenue growth on y, the
 * selected size metric as the radius and the archetype as the colour.
 *
 * Three honesty rules shape it. A company the selected metric cannot size is
 * drawn as a dashed ring at a fixed radius rather than quietly sized by revenue;
 * a mark whose radius is modeled while its position is reported takes the weaker
 * of the two confidences; and a mark whose revenue or size was interpolated
 * across a gap in the series is modeled however the neighbouring filing was
 * flagged, because no figure was filed for that year (CONTRACTS §11.2). All
 * three are decided by `bubbleDatumConfidence`.
 */
export const CompetitiveBubble = ({
  data,
  year,
  minYear,
  maxYear,
  sizeMetric,
  availableSizeMetrics,
  onSizeMetricChange,
  onYearChange,
  pinnedIds,
  trails,
  onTogglePin,
  onSelectCompany,
  sourceTitleFor,
  highlightedCompanyId,
  onHoverCompany,
}: CompetitiveBubbleProps): React.ReactElement => {
  const { ref: containerRef, size } = useChartSize({ initial: { width: 820, height: 480 } });
  const reducedMotion = useReducedMotion();
  const narrowViewport = useNarrowViewport();
  const [playing, setPlaying] = useState<boolean>(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const narrow = isNarrow(size.width);
  const margin = narrow ? NARROW_MARGIN : MARGIN;
  const plotHeight = narrow ? NARROW_PLOT_HEIGHT : PLOT_HEIGHT;
  const plotWidth = Math.max(220, size.width);
  const innerWidth = Math.max(60, plotWidth - margin.left - margin.right);
  const innerHeight = Math.max(80, plotHeight - margin.top - margin.bottom);

  const canPlay = onYearChange !== undefined && maxYear > minYear && !reducedMotion;

  useEffect(() => {
    if (!playing || !canPlay || !onYearChange) return;
    const timer = window.setTimeout(() => {
      onYearChange(stepYear(year, minYear, maxYear));
    }, PLAY_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [canPlay, maxYear, minYear, onYearChange, playing, year]);

  const metricOptions = useMemo<BubbleSizeMetric[]>(() => {
    if (availableSizeMetrics && availableSizeMetrics.length > 0) {
      return METRIC_ORDER.filter((metric) => availableSizeMetrics.includes(metric));
    }
    const present = new Set<BubbleSizeMetric>(data.map((datum) => datum.sizeMetric));
    present.add(sizeMetric);
    present.add("revenue");
    return METRIC_ORDER.filter((metric) => present.has(metric));
  }, [availableSizeMetrics, data, sizeMetric]);

  const sizedData = useMemo(
    () => data.filter((datum) => isSizedByMetric(datum, sizeMetric)),
    [data, sizeMetric],
  );

  const unsizedCount = data.length - sizedData.length;

  const maxRadius = useMemo(
    () => Math.min(narrow ? 20 : 34, Math.max(8, innerWidth / 9)),
    [innerWidth, narrow],
  );

  const radiusScale = useMemo(
    () => bubbleRadiusScaleFor(sizedData.map((datum) => datum.size), sizeMetric, maxRadius),
    [maxRadius, sizeMetric, sizedData],
  );

  const radiusOf = useCallback(
    (datum: BubbleDatum): number =>
      isSizedByMetric(datum, sizeMetric) ? radiusScale.radius(datum.size) : UNSIZED_BUBBLE_RADIUS,
    [radiusScale, sizeMetric],
  );

  const trailPoints = useMemo(() => {
    const result = new Map<string, BubbleTrailPoint[]>();
    for (const companyId of pinnedIds) {
      const points = trails[companyId];
      if (!points || points.length === 0) continue;
      const cut = trailUpToYear(points, year);
      if (cut.length === 0) continue;
      result.set(companyId, cut);
    }
    return result;
  }, [pinnedIds, trails, year]);

  const xScale = useMemo(() => {
    const revenues = [
      ...data.map((datum) => datum.revenue),
      ...[...trailPoints.values()].flatMap((points) => points.map((point) => point.revenue)),
    ];
    return revenueLogScale(bubbleRevenueDomain(revenues), [0, innerWidth]);
  }, [data, innerWidth, trailPoints]);

  const yScale = useMemo(() => {
    const growths = [
      ...data.map((datum) => datum.growth),
      ...[...trailPoints.values()].flatMap((points) => points.map((point) => point.growth)),
    ];
    return niceLinearScale(bubbleGrowthDomain(growths), [innerHeight, 0]);
  }, [data, innerHeight, trailPoints]);

  const xTicks = useMemo(
    () => ticksFrom(xScale, narrow ? 3 : 6, formatUsdBillions),
    [narrow, xScale],
  );

  const yTicks = useMemo(
    () => ticksFrom(yScale, narrow ? 4 : 6, (value) => formatSignedPercent(value, 0)),
    [narrow, yScale],
  );

  const paintOrder = useMemo(
    () => bubblePaintOrder(data, sizeMetric, radiusScale),
    [data, radiusScale, sizeMetric],
  );

  const readingOrder = useMemo(() => bubbleReadingOrder(data), [data]);

  /**
   * §10.1 and §10.6 together: the count cap picks which bubbles are worth a
   * caption — pinned companies first, then the largest — and the placement pass
   * then truncates or drops any caption that would run off the plot or collide
   * with one already drawn. The full name stays in the mark's `<title>`, its
   * `aria-label`, the tooltip and the table.
   */
  const labelsById = useMemo(() => {
    const byRadius = [...data].sort((a, b) => radiusOf(b) - radiusOf(a));
    const pinned = byRadius.filter((datum) => pinnedIds.includes(datum.company.id));
    const rest = byRadius
      .filter((datum) => !pinnedIds.includes(datum.company.id))
      .slice(0, narrow ? 3 : LABELLED_BUBBLES);
    const marks: OutsideLabelMark[] = [...pinned, ...rest].map((datum) => ({
      id: datum.company.id,
      text: datum.company.name,
      x: margin.left + xScale(datum.revenue),
      y: margin.top + yScale(datum.growth),
      radius: radiusOf(datum) + (pinnedIds.includes(datum.company.id) ? 4 : 0),
    }));
    return placedLabelsById(marks, {
      plotWidth,
      plotHeight,
      fontPx: LABEL_FONT_PX,
      gapPx: LABEL_GAP_PX,
      offsetPx: LABEL_OFFSET_PX,
    });
  }, [data, margin, narrow, pinnedIds, plotHeight, plotWidth, radiusOf, xScale, yScale]);

  const trailPath = useMemo(
    () =>
      line<BubbleTrailPoint>()
        .x((point) => xScale(point.revenue))
        .y((point) => yScale(point.growth)),
    [xScale, yScale],
  );

  /**
   * The confidence the mark is drawn and labelled with. Sized marks take the
   * weaker of position and radius; an unsized mark rests on revenue alone — and
   * either way an interpolated value demotes it to modeled.
   */
  const markConfidenceOf = useCallback(
    (datum: BubbleDatum): Confidence => {
      if (isSizedByMetric(datum, sizeMetric)) return bubbleDatumConfidence(datum);
      if (datum.revenueInterpolated) return "modeled";
      return datum.revenueBasis.confidence;
    },
    [sizeMetric],
  );

  const describe = useCallback(
    (datum: BubbleDatum): string => {
      const sized = isSizedByMetric(datum, sizeMetric);
      const sizeConfidenceText =
        datum.sizeInterpolated && sized ? "modeled, interpolated" : datum.sizeBasis?.confidence;
      const sizeText =
        sized && datum.sizeBasis
          ? `${sizeMetricLabel[sizeMetric].toLowerCase()} ${formatValue(datum.size, datum.sizeBasis.unit)} (${sizeConfidenceText})`
          : `no ${sizeMetricLabel[sizeMetric].toLowerCase()} figure, drawn at a fixed radius`;
      const revenueConfidenceText = datum.revenueInterpolated
        ? "modeled, interpolated"
        : datum.revenueBasis.confidence;
      const interpolationNote =
        datum.revenueInterpolated || (sized && datum.sizeInterpolated)
          ? ` No figure was filed for ${year}, so the value shown is interpolated between the two nearest reported years and the mark is drawn as modeled.`
          : "";
      const pinned = pinnedIds.includes(datum.company.id) ? " Pinned." : "";
      return `${datum.company.name}, ${archetypeLabel[datum.company.archetype]}, ${year}: revenue ${formatValue(datum.revenue, datum.revenueBasis.unit)} (${revenueConfidenceText}), growth ${formatSignedPercent(datum.growth)}, ${sizeText}.${interpolationNote}${pinned}`;
    },
    [pinnedIds, sizeMetric, year],
  );

  const handleHover = useCallback(
    (companyId: string | null): void => {
      setHoveredId(companyId);
      onHoverCompany?.(companyId);
    },
    [onHoverCompany],
  );

  const handleActivate = useCallback(
    (datum: BubbleDatum): void => {
      onSelectCompany?.(datum.company.id);
    },
    [onSelectCompany],
  );

  const handleFocusDatum = useCallback(
    (datum: BubbleDatum): void => {
      setFocusedId(datum.company.id);
      onHoverCompany?.(datum.company.id);
    },
    [onHoverCompany],
  );

  const nav = useKeyboardNav<BubbleDatum>({
    items: readingOrder,
    getId: (datum) => datum.company.id,
    orientation: "horizontal",
    onActivate: handleActivate,
    onFocusChange: handleFocusDatum,
  });

  const handleMarkKeyDown = useCallback(
    (event: React.KeyboardEvent<SVGCircleElement>, datum: BubbleDatum): void => {
      if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        onTogglePin?.(datum.company.id);
        return;
      }
      nav.handleKeyDown(event, datum);
    },
    [nav, onTogglePin],
  );

  const handleMarkClick = useCallback(
    (event: React.MouseEvent<SVGCircleElement>, datum: BubbleDatum): void => {
      if (event.shiftKey) {
        onTogglePin?.(datum.company.id);
        return;
      }
      handleActivate(datum);
    },
    [handleActivate, onTogglePin],
  );

  const handleTogglePlay = useCallback((): void => {
    setPlaying((current) => !current);
  }, []);

  const handleSliderChange = useCallback(
    (values: number[]): void => {
      const next = values[0];
      if (next === undefined) return;
      onYearChange?.(Math.round(next));
    },
    [onYearChange],
  );

  const handleMetricChange = useCallback(
    (value: string): void => {
      const next = METRIC_ORDER.find((metric) => metric === value);
      if (!next) return;
      onSizeMetricChange?.(next);
    },
    [onSizeMetricChange],
  );

  const activeDatum = useMemo(() => {
    const activeId = hoveredId ?? focusedId;
    if (!activeId) return null;
    return data.find((datum) => datum.company.id === activeId) ?? null;
  }, [data, focusedId, hoveredId]);

  const tooltipRows = useMemo<TooltipRow[]>(() => {
    if (!activeDatum) return [];
    const color = archetypeColor(activeDatum.company.archetype);
    const rows: TooltipRow[] = [
      {
        label: "Revenue",
        value: activeDatum.revenue,
        unit: activeDatum.revenueBasis.unit,
        confidence: activeDatum.revenueInterpolated
          ? "modeled"
          : activeDatum.revenueBasis.confidence,
        source: sourceTitleFor(activeDatum.revenueBasis.sourceId),
        note: activeDatum.revenueInterpolated
          ? INTERPOLATED_BUBBLE_NOTE
          : activeDatum.revenueBasis.note,
        low: activeDatum.revenueInterpolated ? undefined : activeDatum.revenueBasis.low,
        high: activeDatum.revenueInterpolated ? undefined : activeDatum.revenueBasis.high,
        color,
      },
      {
        label: "Year-over-year growth",
        value: activeDatum.growth,
        unit: "percent",
        confidence: "modeled",
        source: sourceTitleFor(activeDatum.revenueBasis.sourceId),
        note: GROWTH_NOTE,
      },
    ];
    if (isSizedByMetric(activeDatum, sizeMetric) && activeDatum.sizeBasis) {
      rows.push({
        label: `${sizeMetricLabel[sizeMetric]} (bubble size)`,
        value: activeDatum.size,
        unit: activeDatum.sizeBasis.unit,
        confidence: activeDatum.sizeInterpolated ? "modeled" : activeDatum.sizeBasis.confidence,
        source: sourceTitleFor(activeDatum.sizeBasis.sourceId),
        note: activeDatum.sizeInterpolated ? INTERPOLATED_BUBBLE_NOTE : activeDatum.sizeBasis.note,
        low: activeDatum.sizeInterpolated ? undefined : activeDatum.sizeBasis.low,
        high: activeDatum.sizeInterpolated ? undefined : activeDatum.sizeBasis.high,
      });
    }
    return rows;
  }, [activeDatum, sizeMetric, sourceTitleFor]);

  const tooltipFootnote = useMemo(() => {
    if (!activeDatum) return undefined;
    const sized = isSizedByMetric(activeDatum, sizeMetric);
    const interpolated =
      activeDatum.revenueInterpolated || (sized && activeDatum.sizeInterpolated);
    if (interpolated) {
      return `${INTERPOLATED_BUBBLE_NOTE} The mark is drawn as modeled for that reason, whatever the neighbouring years were filed as.`;
    }
    if (!sized) {
      return `No ${sizeMetricLabel[sizeMetric].toLowerCase()} figure for this company and year, so it is drawn as a dashed ring at a fixed radius rather than sized by another number.`;
    }
    return `Mark confidence: ${markConfidenceOf(activeDatum)} — the weaker of the figure that places the bubble and the figure that sizes it. ${radiusScale.description}`;
  }, [activeDatum, markConfidenceOf, radiusScale.description, sizeMetric]);

  const archetypesPresent = useMemo(
    () => ARCHETYPE_ORDER.filter((archetype) => data.some((datum) => datum.company.archetype === archetype)),
    [data],
  );

  const legendItems = useMemo<LegendItem[]>(
    () =>
      archetypesPresent.map((archetype) => ({
        id: archetype,
        label: archetypeLabel[archetype],
        color: archetypeColor(archetype),
        count: data.filter((datum) => datum.company.archetype === archetype).length,
      })),
    [archetypesPresent, data],
  );

  const tableRows = useMemo<BubbleTableRow[]>(
    () =>
      [...data]
        .sort((a, b) => b.revenue - a.revenue)
        .map((datum) => {
          const sized = isSizedByMetric(datum, sizeMetric);
          const sizeSource = sized && datum.sizeBasis ? sourceTitleFor(datum.sizeBasis.sourceId) : null;
          const interpolated = datum.revenueInterpolated || (sized && datum.sizeInterpolated);
          return {
            id: datum.company.id,
            name: datum.company.name,
            archetype: datum.company.archetype,
            revenue: formatValue(datum.revenue, datum.revenueBasis.unit),
            growth: formatSignedPercent(datum.growth),
            size:
              sized && datum.sizeBasis
                ? formatValue(datum.size, datum.sizeBasis.unit)
                : `No ${sizeMetricLabel[sizeMetric].toLowerCase()} figure`,
            source: sizeSource
              ? `${sourceTitleFor(datum.revenueBasis.sourceId)}; ${sizeSource}`
              : sourceTitleFor(datum.revenueBasis.sourceId),
            confidence: markConfidenceOf(datum),
            note: tableNoteFor(datum, sized, interpolated),
            pinned: pinnedIds.includes(datum.company.id),
          };
        }),
    [data, markConfidenceOf, pinnedIds, sizeMetric, sourceTitleFor],
  );

  const tableColumns = useMemo<DataTableColumn<BubbleTableRow>[]>(
    () => [
      { key: "name", header: "Company", render: (row) => row.name },
      { key: "archetype", header: "Archetype", render: (row) => archetypeLabel[row.archetype] },
      {
        key: "revenue",
        header: `Revenue ${year}`,
        align: "right",
        numeric: true,
        render: (row) => row.revenue,
      },
      { key: "growth", header: "YoY growth", align: "right", numeric: true, render: (row) => row.growth },
      {
        key: "size",
        header: sizeMetricLabel[sizeMetric],
        align: "right",
        numeric: true,
        render: (row) => row.size,
      },
      { key: "source", header: "Source", render: (row) => row.source },
    ],
    [sizeMetric, year],
  );

  const takeaway = useMemo(() => {
    if (data.length === 0) {
      return `No company in the current selection has a revenue series that reaches ${year} and the year before it, which is what the growth axis needs.`;
    }
    const fastest = data.reduce((best, datum) => (datum.growth > best.growth ? datum : best));
    const largest = data.reduce((best, datum) => (datum.revenue > best.revenue ? datum : best));
    return `${data.length} companies in ${year}: ${largest.company.name} is the largest at ${formatValue(largest.revenue, largest.revenueBasis.unit)}, ${fastest.company.name} the fastest growing at ${formatSignedPercent(fastest.growth)}. Scale and growth pull against each other.`;
  }, [data, year]);

  const sourceLine = useMemo(() => {
    const sourceIds = new Set(data.map((datum) => datum.revenueBasis.sourceId));
    if (sourceIds.size === 0) return "No revenue series in the current selection.";
    const sizeNote =
      unsizedCount > 0
        ? ` ${unsizedCount} of ${data.length} companies have no ${sizeMetricLabel[sizeMetric].toLowerCase()} figure and are drawn as dashed rings.`
        : "";
    return `${sourceIds.size} revenue sources, cited per bubble; growth is derived from those series.${sizeNote}`;
  }, [data, sizeMetric, unsizedCount]);

  const sizeLegend = useMemo(() => {
    if (radiusScale.legendValues.length === 0) return null;
    // Nothing on screen is sized by this metric, so a size key would be a fiction.
    if (radiusScale.observed === null) return null;
    const widest = radiusScale.maxRadius * 2 + 6;
    const gap = 10;
    const totalWidth =
      radiusScale.legendValues.length * widest + (radiusScale.legendValues.length - 1) * gap;
    return (
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Bubble size: {sizeMetricLabel[sizeMetric]}
        </p>
        <svg
          width={totalWidth}
          height={radiusScale.maxRadius * 2 + 20}
          role="img"
          aria-label={`Bubble size key for ${sizeMetricLabel[sizeMetric].toLowerCase()}: ${radiusScale.legendValues
            .map((value) => formatValue(value, radiusScale.unit))
            .join(", ")}`}
          className="overflow-visible"
        >
          {radiusScale.legendValues.map((value, index) => {
            const cx = index * (widest + gap) + widest / 2;
            return (
              <g key={value}>
                <circle
                  cx={cx}
                  cy={radiusScale.maxRadius + 2}
                  r={radiusScale.radius(value)}
                  fill="var(--muted-foreground)"
                  fillOpacity={0.18}
                  stroke="var(--muted-foreground)"
                  strokeWidth={1}
                />
                <text
                  x={cx}
                  y={radiusScale.maxRadius * 2 + 15}
                  textAnchor="middle"
                  className="fill-muted-foreground font-mono text-[11px]"
                >
                  {formatValue(value, radiusScale.unit)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }, [radiusScale, sizeMetric]);

  const toolbar = (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {metricOptions.length > 1 ? (
          <ToggleGroup
            type="single"
            value={sizeMetric}
            onValueChange={handleMetricChange}
            variant="outline"
            size="sm"
            aria-label="Size the bubbles by"
          >
            {metricOptions.map((metric) => (
              <ToggleGroupItem key={metric} value={metric}>
                {sizeMetricLabel[metric]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : null}

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

      {metricOptions.includes("marketCap") ? null : (
        <p className="text-xs text-muted-foreground">{MARKET_CAP_ABSENT}</p>
      )}

      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <Legend items={legendItems} title="Archetype" />
        {sizeLegend}
      </div>
    </div>
  );

  const pinnedTray =
    pinnedIds.length === 0 ? null : (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Pinned
        </span>
        {pinnedIds.map((companyId) => {
          const datum = data.find((candidate) => candidate.company.id === companyId);
          const label = datum?.company.name ?? companyId;
          return (
            <button
              key={companyId}
              type="button"
              onClick={() => onTogglePin?.(companyId)}
              onMouseEnter={() => handleHover(companyId)}
              onMouseLeave={() => handleHover(null)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <PinOff aria-hidden="true" className="size-3" />
              {label}
              <span className="sr-only">Unpin {label}</span>
            </button>
          );
        })}
      </div>
    );

  const table = (
    <DataTable<BubbleTableRow>
      caption={`Revenue, year-over-year growth and ${sizeMetricLabel[sizeMetric].toLowerCase()} for every company plotted in ${year}`}
      columns={tableColumns}
      rows={tableRows}
      getRowKey={(row) => row.id}
      getConfidence={(row) => ({ confidence: row.confidence, note: row.note })}
    />
  );

  if (data.length === 0) {
    return (
      <ChartFrame
        title="Scale against growth"
        takeaway={takeaway}
        source="No revenue series in the current selection."
      >
        <EmptyState
          title="No companies can be plotted for this year"
          description={`A bubble needs a revenue figure for ${year} and for ${year - 1}, because the vertical axis is the change between them. Move the year or clear a filter.`}
        />
      </ChartFrame>
    );
  }

  return (
    <ChartFrame
      key={narrowViewport ? "narrow" : "wide"}
      title="Scale against growth"
      takeaway={takeaway}
      source={sourceLine}
      toolbar={toolbar}
      table={table}
      defaultView={narrowViewport ? "table" : "chart"}
      footnote={`Colour is archetype, horizontal position is revenue on a log scale, vertical position is year-over-year revenue growth. ${radiusScale.description} Hatched bubbles are estimated, dashed bubbles are modeled — a modeled radius on a reported position makes the whole mark modeled, and so does a value interpolated across a year with no filed figure.`}
    >
      <div ref={containerRef} className="relative w-full">
        <svg
          width={plotWidth}
          height={plotHeight}
          viewBox={`0 0 ${plotWidth} ${plotHeight}`}
          role="group"
          aria-label={`Bubble chart of ${data.length} companies in ${year}: revenue against year-over-year growth, sized by ${sizeMetricLabel[sizeMetric].toLowerCase()}`}
          className="w-full select-none"
          onMouseLeave={() => handleHover(null)}
        >
          <HatchDefs />

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            <Axis
              orientation="left"
              ticks={yTicks}
              scale={(value) => yScale(value)}
              length={innerWidth}
              showGrid
              label={narrow ? undefined : "Revenue growth, year over year"}
            />
            <g transform={`translate(0, ${innerHeight})`}>
              <Axis
                orientation="bottom"
                ticks={xTicks}
                scale={(value) => xScale(value)}
                length={innerWidth}
                label={narrow ? undefined : "Revenue (log scale)"}
              />
            </g>

            <line
              x1={0}
              x2={innerWidth}
              y1={yScale(0)}
              y2={yScale(0)}
              className="stroke-rule"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            {narrow ? null : (
              <text
                x={4}
                y={yScale(0) - 5}
                className="fill-muted-foreground text-[11px] uppercase tracking-wider"
                aria-hidden="true"
              >
                No growth
              </text>
            )}

            {[...trailPoints.entries()].map(([companyId, points]) => {
              const datum = data.find((candidate) => candidate.company.id === companyId);
              const color = datum ? archetypeColor(datum.company.archetype) : "var(--muted-foreground)";
              const path = trailPath(points);
              if (!path) return null;
              return (
                <g key={`trail-${companyId}`} aria-hidden="true">
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    strokeOpacity={0.55}
                    strokeDasharray="4 3"
                  />
                  {points.map((point) => (
                    <circle
                      key={`${companyId}-${point.year}`}
                      cx={xScale(point.revenue)}
                      cy={yScale(point.growth)}
                      r={1.8}
                      fill={color}
                      fillOpacity={0.6}
                    />
                  ))}
                </g>
              );
            })}

            {paintOrder.map((datum) => {
              const company = datum.company;
              const sized = isSizedByMetric(datum, sizeMetric);
              const confidence = markConfidenceOf(datum);
              const color = archetypeColor(company.archetype);
              const style = markStyleFor(color, confidence);
              const radius = radiusOf(datum);
              const cx = xScale(datum.revenue);
              const cy = yScale(datum.growth);
              const pinned = pinnedIds.includes(company.id);
              const dimmed =
                typeof highlightedCompanyId === "string" &&
                highlightedCompanyId.length > 0 &&
                highlightedCompanyId !== company.id;
              const label = labelsById.get(company.id);

              return (
                <g key={company.id}>
                  {pinned ? (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius + 4}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      strokeOpacity={0.7}
                      aria-hidden="true"
                    />
                  ) : null}
                  <circle
                    ref={nav.registerMark(company.id)}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    style={{ color }}
                    fill={sized ? style.fill : "none"}
                    fillOpacity={dimmed ? 0.15 : style.fillOpacity}
                    stroke={style.stroke}
                    strokeWidth={sized ? style.strokeWidth : 1.4}
                    strokeDasharray={sized ? style.strokeDasharray : "3 2"}
                    strokeOpacity={dimmed ? 0.35 : 1}
                    tabIndex={nav.getTabIndex(datum)}
                    role="button"
                    aria-pressed={pinned}
                    aria-label={describe(datum)}
                    className="cursor-pointer outline-none focus-visible:stroke-ring focus-visible:[stroke-width:3]"
                    onClick={(event) => handleMarkClick(event, datum)}
                    onKeyDown={(event) => handleMarkKeyDown(event, datum)}
                    onFocus={() => {
                      nav.handleFocus(datum);
                      handleFocusDatum(datum);
                    }}
                    onBlur={() => {
                      setFocusedId(null);
                      onHoverCompany?.(null);
                    }}
                    onMouseEnter={() => handleHover(company.id)}
                  >
                    <title>{company.name}</title>
                  </circle>
                  {label ? (
                    <text
                      aria-hidden="true"
                      x={label.x - margin.left}
                      y={label.y - margin.top}
                      textAnchor="middle"
                      className={cn("pointer-events-none fill-foreground text-[11px] font-medium", {
                        "opacity-40": dimmed,
                      })}
                    >
                      {label.text}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
        </svg>

        <ChartTooltip
          x={activeDatum ? margin.left + xScale(activeDatum.revenue) : 0}
          y={activeDatum ? margin.top + yScale(activeDatum.growth) : 0}
          containerWidth={plotWidth}
          containerHeight={plotHeight}
          title={activeDatum?.company.name ?? ""}
          year={year}
          rows={tooltipRows}
          footnote={tooltipFootnote}
          visible={activeDatum !== null}
        />

        {pinnedTray}

        <p className="mt-2 flex min-h-[2.5rem] items-start gap-2 text-xs text-muted-foreground">
          <Pin aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
          <span aria-live="polite">
            {activeDatum
              ? describe(activeDatum)
              : "Arrow keys move along the revenue axis, Enter opens the company, P (or shift-click) pins it and draws its trail."}
          </span>
        </p>

        {unsizedCount === 0 ? null : (
          <p className="mt-1 text-xs text-muted-foreground">
            {unsizedCount} of {data.length} companies have no{" "}
            {sizeMetricLabel[sizeMetric].toLowerCase()} figure and are drawn as small dashed rings at
            a fixed radius, rather than sized by a different number.
          </p>
        )}
      </div>
    </ChartFrame>
  );
};
