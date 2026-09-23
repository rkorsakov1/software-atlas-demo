"use client";

import { scaleLinear } from "d3-scale";
import { area, line, stack, stackOffsetNone, stackOrderNone, type SeriesPoint } from "d3-shape";
import { useCallback, useMemo, useState } from "react";

import {
  MIN_NAMED_FOR_CONCENTRATION,
  OTHER_SHARE_KEY,
  OTHER_SHARE_NOTE,
  isSparseShareSeries,
  orderedShareKeys,
  shareBandConfidence,
  shareStackRows,
  worstConfidence,
  type ShareStackRow,
} from "@/components/charts/primitives/atlasChartMath";
import { Axis, type AxisTick } from "@/components/charts/primitives/Axis";
import { ChartFrame } from "@/components/charts/primitives/ChartFrame";
import { ChartTooltip, type TooltipRow } from "@/components/charts/primitives/ChartTooltip";
import { DataTable, type DataTableColumn } from "@/components/charts/primitives/DataTable";
import { EmptyState } from "@/components/charts/primitives/EmptyState";
import { eventTypeColor } from "@/components/charts/primitives/eventStyles";
import { HatchDefs, lineStyleFor } from "@/components/charts/primitives/HatchDefs";
import { Legend, type LegendItem } from "@/components/charts/primitives/Legend";
import { isNarrow, useChartSize } from "@/components/charts/primitives/useChartSize";
import { useKeyboardNav } from "@/components/charts/primitives/useKeyboardNav";
import type { Confidence, CompetitiveEvent } from "@/data/types";
import { eventTypeLabel, formatPercent, humanizeId } from "@/lib/format";
import {
  HHI_HIGHLY_CONCENTRATED,
  HHI_METHOD_NOTE,
  concentrationLabel,
  concentrationBand,
} from "@/lib/hhi";
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

const MARGIN = { top: 12, right: 62, bottom: 58, left: 46 };
const NARROW_MARGIN = { top: 12, right: 12, bottom: 34, left: 38 };
const PLOT_HEIGHT = 300;
const NARROW_PLOT_HEIGHT = 230;
const EVENT_MARKER_OFFSET = 22;

const BAND_COLORS: readonly string[] = [
  "var(--cat-infrastructure)",
  "var(--cat-horizontal)",
  "var(--cat-vertical)",
  "var(--cat-consumer)",
  "var(--cat-emerging)",
  "color-mix(in oklab, var(--cat-infrastructure) 60%, var(--foreground))",
  "color-mix(in oklab, var(--cat-horizontal) 60%, var(--foreground))",
  "color-mix(in oklab, var(--cat-vertical) 60%, var(--foreground))",
];

const OTHER_COLOR = "var(--muted-foreground)";
const HHI_COLOR = "var(--cat-emerging)";
const TOP3_COLOR = "var(--foreground)";

const bandColor = (key: string, index: number): string => {
  if (key === OTHER_SHARE_KEY) return OTHER_COLOR;
  return BAND_COLORS[index % BAND_COLORS.length] ?? OTHER_COLOR;
};

/**
 * Solid fills keep the stack legible; confidence is carried by opacity (reported
 * reads strongest) and stated in the legend, tooltip and table. The residual
 * band is a pale neutral so it never competes with the named vendors.
 */
const bandOpacity = (key: string, confidence: Confidence): number => {
  if (key === OTHER_SHARE_KEY) return 0.14;
  return confidence === "reported" ? 0.9 : 0.6;
};

/** The residual band is derived here, so it never borrows a company's name. */
const OTHER_LABEL = "Other / not separately reported";

type RenderRow = ShareStackRow & { plotYear: number };

/**
 * Chart 3. Stacked published shares with an explicit residual band, the modeled
 * HHI on the right axis and the top-three share on the left, annotated with the
 * events that moved them. Markets without a public share series are the normal
 * case and get an empty state that says so rather than a reconstructed stack.
 */
export const ShareStackedArea = ({
  marketName,
  series,
  companyNames,
  events,
  sourceTitleFor,
  onSelectEvent,
  highlightedCompanyId,
  onHoverCompany,
}: ShareStackedAreaProps): React.ReactElement => {
  const { ref: containerRef, size } = useChartSize({ initial: { width: 760, height: 420 } });
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const narrow = isNarrow(size.width);
  const margin = narrow ? NARROW_MARGIN : MARGIN;
  const plotHeight = narrow ? NARROW_PLOT_HEIGHT : PLOT_HEIGHT;
  const innerWidth = Math.max(60, size.width - margin.left - margin.right);
  const totalHeight = plotHeight + margin.top + margin.bottom;

  const sortedSeries = useMemo(() => [...series].sort((a, b) => a.year - b.year), [series]);

  const keys = useMemo(() => orderedShareKeys(sortedSeries), [sortedSeries]);
  const rows = useMemo(() => shareStackRows(sortedSeries, keys), [keys, sortedSeries]);
  const sparse = useMemo(() => isSparseShareSeries(sortedSeries), [sortedSeries]);
  /** HHI and top three only where enough vendors are named for them to mean anything. */
  const concentrationSeries = useMemo(
    () => sortedSeries.filter((point) => point.shares.length >= MIN_NAMED_FOR_CONCENTRATION),
    [sortedSeries],
  );
  const vendorKeys = useMemo(() => keys.filter((key) => key !== OTHER_SHARE_KEY), [keys]);

  const labelFor = useCallback(
    (key: string): string => {
      if (key === OTHER_SHARE_KEY) return OTHER_LABEL;
      return companyNames[key] ?? humanizeId(key);
    },
    [companyNames],
  );

  const yearExtent = useMemo<[number, number]>(() => {
    const first = rows[0]?.year ?? 0;
    const last = rows[rows.length - 1]?.year ?? first;
    if (rows.length < 2) return [first - 0.5, first + 0.5];
    return [first, last];
  }, [rows]);

  /** A single reported year still has to draw as a band, so it is widened, not faked. */
  const renderRows = useMemo<RenderRow[]>(() => {
    if (rows.length === 0) return [];
    if (rows.length === 1) {
      const only = rows[0];
      if (!only) return [];
      return [
        { ...only, plotYear: only.year - 0.5 },
        { ...only, plotYear: only.year + 0.5 },
      ];
    }
    return rows.map((row) => ({ ...row, plotYear: row.year }));
  }, [rows]);

  const xScale = useMemo(
    () => scaleLinear().domain(yearExtent).range([0, innerWidth]),
    [innerWidth, yearExtent],
  );

  const shareScale = useMemo(
    () => scaleLinear().domain([0, 100]).range([plotHeight, 0]),
    [plotHeight],
  );

  const hhiMax = useMemo(() => {
    const peak = sortedSeries.reduce((max, point) => Math.max(max, point.hhi), 0);
    return Math.min(10000, Math.max(2500, Math.ceil((peak * 1.15) / 500) * 500));
  }, [sortedSeries]);

  const hhiScale = useMemo(
    () => scaleLinear().domain([0, hhiMax]).range([plotHeight, 0]),
    [hhiMax, plotHeight],
  );

  const stacked = useMemo(() => {
    const generator = stack<RenderRow, string>()
      .keys(keys)
      .value((row, key) => row.values[key] ?? 0)
      .order(stackOrderNone)
      .offset(stackOffsetNone);
    return generator(renderRows);
  }, [keys, renderRows]);

  const areaPath = useMemo(
    () =>
      area<SeriesPoint<RenderRow>>()
        .x((point) => xScale(point.data.plotYear))
        .y0((point) => shareScale(point[0]))
        .y1((point) => shareScale(point[1])),
    [shareScale, xScale],
  );

  const hhiPath = useMemo(
    () =>
      line<ShareSeriesPoint>()
        .x((point) => xScale(point.year))
        .y((point) => hhiScale(point.hhi))(
        concentrationSeries.length < 2 ? [] : concentrationSeries,
      ) ?? "",
    [concentrationSeries, hhiScale, xScale],
  );

  const top3Path = useMemo(
    () =>
      line<ShareSeriesPoint>()
        .x((point) => xScale(point.year))
        .y((point) => shareScale(point.top3))(
        concentrationSeries.length < 2 ? [] : concentrationSeries,
      ) ?? "",
    [concentrationSeries, shareScale, xScale],
  );

  /** Sparse mode: one line per vendor through the years it is named; a gap stays a gap. */
  const vendorLinePath = useCallback(
    (key: string): string =>
      line<ShareStackRow>()
        .defined((row) => row.points[key] !== undefined)
        .x((row) => xScale(row.year))
        .y((row) => shareScale(row.values[key] ?? 0))(rows) ?? "",
    [rows, shareScale, xScale],
  );

  const xTicks = useMemo<AxisTick[]>(() => {
    const seen = new Set<number>();
    const ticks: AxisTick[] = [];
    for (const value of xScale.ticks(narrow ? 4 : 8)) {
      const year = Math.round(value);
      if (seen.has(year)) continue;
      seen.add(year);
      ticks.push({ value: year, label: String(year) });
    }
    if (ticks.length === 0 && rows[0]) {
      ticks.push({ value: rows[0].year, label: String(rows[0].year) });
    }
    return ticks;
  }, [narrow, rows, xScale]);

  const shareTicks = useMemo<AxisTick[]>(
    () => [0, 25, 50, 75, 100].map((value) => ({ value, label: `${value}%` })),
    [],
  );

  const hhiTicks = useMemo<AxisTick[]>(
    () =>
      hhiScale.ticks(4).map((value) => ({
        value,
        label: Math.round(value).toLocaleString("en-US"),
      })),
    [hhiScale],
  );

  const annotatedEvents = useMemo(
    () =>
      [...events]
        .filter((event) => event.year >= yearExtent[0] - 0.5 && event.year <= yearExtent[1] + 0.5)
        .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id)),
    [events, yearExtent],
  );

  const handleSelectEvent = useCallback(
    (event: CompetitiveEvent): void => {
      onSelectEvent?.(event.id);
    },
    [onSelectEvent],
  );

  const handleFocusRow = useCallback((row: ShareStackRow): void => {
    setHoveredYear(row.year);
  }, []);

  const handleLeaveRow = useCallback((): void => {
    setHoveredYear(null);
  }, []);

  const handleHoverBand = useCallback(
    (key: string | null): void => {
      if (key === null || key === OTHER_SHARE_KEY) {
        onHoverCompany?.(null);
        return;
      }
      onHoverCompany?.(key);
    },
    [onHoverCompany],
  );

  const describeRow = useCallback(
    (row: ShareStackRow): string => {
      const parts = keys
        .filter((key) => (row.values[key] ?? 0) > 0)
        .map((key) => `${labelFor(key)} ${formatPercent(row.values[key] ?? 0)}`);
      const point = sortedSeries.find((entry) => entry.year === row.year);
      const concentration = point
        ? `, HHI ${Math.round(point.hhi).toLocaleString("en-US")}, top three ${formatPercent(point.top3)}`
        : "";
      return `${row.year}: ${parts.join(", ")}${concentration}`;
    },
    [keys, labelFor, sortedSeries],
  );

  const yearNav = useKeyboardNav<ShareStackRow>({
    items: rows,
    getId: (row) => String(row.year),
    orientation: "horizontal",
    onActivate: handleFocusRow,
    onFocusChange: handleFocusRow,
  });

  const eventNav = useKeyboardNav<CompetitiveEvent>({
    items: annotatedEvents,
    getId: (event) => event.id,
    orientation: "horizontal",
    onActivate: handleSelectEvent,
  });

  const hoveredRow = useMemo(
    () => rows.find((row) => row.year === hoveredYear) ?? null,
    [hoveredYear, rows],
  );

  const hoveredPoint = useMemo(
    () => sortedSeries.find((point) => point.year === hoveredYear) ?? null,
    [hoveredYear, sortedSeries],
  );

  const tooltipRows = useMemo<TooltipRow[]>(() => {
    if (!hoveredRow || !hoveredPoint) return [];
    const companyRows: TooltipRow[] = keys
      .filter((key) => key !== OTHER_SHARE_KEY && (hoveredRow.values[key] ?? 0) > 0)
      .map((key, index) => {
        const point = hoveredRow.points[key];
        return {
          label: labelFor(key),
          value: hoveredRow.values[key] ?? 0,
          unit: "percent" as const,
          confidence: point?.confidence ?? "estimated",
          source: point ? sourceTitleFor(point.sourceId) : "No source recorded",
          note: point?.note,
          low: point?.low,
          high: point?.high,
          color: bandColor(key, index),
        };
      });

    const otherRow: TooltipRow = {
      label: OTHER_LABEL,
      value: hoveredRow.values[OTHER_SHARE_KEY] ?? 0,
      unit: "percent",
      confidence: "modeled",
      source: "Residual of the published shares",
      note: OTHER_SHARE_NOTE,
      color: OTHER_COLOR,
    };

    const hhiRow: TooltipRow = {
      label: "HHI",
      value: hoveredPoint.hhi,
      unit: "count",
      confidence: "modeled",
      source: "Derived from the published shares",
      note: HHI_METHOD_NOTE,
      color: HHI_COLOR,
    };

    const top3Row: TooltipRow = {
      label: "Top three combined",
      value: hoveredPoint.top3,
      unit: "percent",
      confidence: "modeled",
      source: "Derived from the published shares",
      note: "Modeled: the sum of the three largest published shares in that year.",
      color: TOP3_COLOR,
    };

    return [...companyRows, otherRow, hhiRow, top3Row];
  }, [hoveredPoint, hoveredRow, keys, labelFor, sourceTitleFor]);

  const legendItems = useMemo<LegendItem[]>(() => {
    const bands = keys.flatMap((key, index) => {
      if (sparse && key === OTHER_SHARE_KEY) return [];
      const confidence: Confidence =
        key === OTHER_SHARE_KEY ? "modeled" : shareBandConfidence(sortedSeries, key);
      return [
        {
          id: key,
          label:
            confidence === "reported" || key === OTHER_SHARE_KEY
              ? labelFor(key)
              : `${labelFor(key)} (est.)`,
          color: bandColor(key, index),
        },
      ];
    });
    if (narrow || concentrationSeries.length < 2) return bands;
    return [
      ...bands,
      { id: "hhi", label: "HHI (right axis, modeled)", color: HHI_COLOR, dashed: true },
      { id: "top3", label: "Top three share (modeled)", color: TOP3_COLOR, dashed: true },
    ];
  }, [concentrationSeries.length, keys, labelFor, narrow, sortedSeries, sparse]);

  const tableColumns = useMemo<DataTableColumn<ShareStackRow>[]>(() => {
    const shareColumns: DataTableColumn<ShareStackRow>[] = keys.map((key) => ({
      key,
      header: labelFor(key),
      align: "right",
      numeric: true,
      render: (row) => formatPercent(row.values[key] ?? 0),
    }));
    return [
      { key: "year", header: "Year", align: "right", numeric: true, render: (row) => row.year },
      ...shareColumns,
      {
        key: "hhi",
        header: "HHI (modeled)",
        align: "right",
        numeric: true,
        render: (row) => {
          const point = sortedSeries.find((entry) => entry.year === row.year);
          return point ? Math.round(point.hhi).toLocaleString("en-US") : "—";
        },
      },
      {
        key: "top3",
        header: "Top 3 (modeled)",
        align: "right",
        numeric: true,
        render: (row) => {
          const point = sortedSeries.find((entry) => entry.year === row.year);
          return point ? formatPercent(point.top3) : "—";
        },
      },
      {
        key: "source",
        header: "Source",
        render: (row) => {
          const first = keys.map((key) => row.points[key]).find((point) => point !== undefined);
          return first ? sourceTitleFor(first.sourceId) : "—";
        },
      },
    ];
  }, [keys, labelFor, sortedSeries, sourceTitleFor]);

  const latest = concentrationSeries[concentrationSeries.length - 1];

  const takeaway = useMemo(() => {
    if (!latest) {
      if (sortedSeries.length === 0) return `${marketName} has no published share series.`;
      return "Too few vendors are named in any year to measure concentration.";
    }
    const band = concentrationBand(latest.hhi);
    const label = concentrationLabel[band].replace(/\s*\(.*\)$/, "").toLowerCase();
    return `In ${latest.year} the top three held ${formatPercent(latest.top3)} of the market. HHI ${Math.round(latest.hhi).toLocaleString("en-US")}: ${label}.`;
  }, [latest, marketName, sortedSeries.length]);

  const sourceLine = useMemo(() => {
    const sourceIds = new Set(
      sortedSeries.flatMap((point) => point.shares.map((share) => share.point.sourceId)),
    );
    const titles = [...sourceIds].map((sourceId) => sourceTitleFor(sourceId));
    if (titles.length === 0) return "No published share series for this market.";
    const releases = titles.length === 1 ? "1 release" : `${titles.length} releases`;
    return `${releases}, each listed in the table. "Other", HHI and top three are calculated here.`;
  }, [sortedSeries, sourceTitleFor]);

  if (sortedSeries.length === 0) {
    return (
      <ChartFrame
        title={`Market share — ${marketName}`}
        takeaway={takeaway}
        source="The Software Atlas ships share-by-year data only where a public series exists."
      >
        <EmptyState
          title="No reliable public share data"
          description={`No public vendor-share series covers ${marketName}. Rather than reconstruct one from revenue mixes with incompatible definitions, the Atlas leaves it blank: this is the normal state for most software markets, where cloud infrastructure is the rare exception with a consistently published quarterly series.`}
        />
      </ChartFrame>
    );
  }

  const readout = hoveredRow
    ? describeRow(hoveredRow)
    : "Arrow keys step through the years; the event markers under the axis open the event that moved the share.";

  return (
    <ChartFrame
      title={`Market share — ${marketName}`}
      takeaway={takeaway}
      source={sourceLine}
      toolbar={<Legend items={legendItems} onHover={handleHoverBand} className="min-w-0 flex-1" />}
      table={
        <DataTable
          caption={`Published market shares for ${marketName} by year`}
          columns={tableColumns}
          rows={rows}
          getRowKey={(row) => String(row.year)}
          getConfidence={(row) => ({
            confidence: worstConfidence(
              ...keys.map((key) => row.points[key]?.confidence),
              "modeled",
            ),
            note: `${OTHER_SHARE_NOTE} ${HHI_METHOD_NOTE}`,
          })}
        />
      }
      footnote={
        narrow
          ? "Narrow layout: the HHI axis and event markers are hidden here; open the table for both."
          : sparse
            ? "Each line is one vendor's share in the years a source names it; hollow points are estimates. Gaps are years with no figure."
            : 'Lighter bands are estimates. "Other" is everything the source does not name.'
      }
    >
      <div ref={containerRef} className="relative w-full">
        <p
          aria-live="polite"
          className="mb-2 min-h-[2.5rem] text-pretty text-xs text-muted-foreground"
        >
          {readout}
        </p>

        <svg
          width={size.width}
          height={totalHeight}
          viewBox={`0 0 ${size.width} ${totalHeight}`}
          role="group"
          aria-label={`Stacked market share for ${marketName} from ${rows[0]?.year ?? ""} to ${rows[rows.length - 1]?.year ?? ""}`}
          className="w-full select-none"
        >
          <HatchDefs />

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {sparse
              ? vendorKeys.map((key) => {
                  const index = keys.indexOf(key);
                  const color = bandColor(key, index);
                  const dimmed =
                    typeof highlightedCompanyId === "string" &&
                    highlightedCompanyId.length > 0 &&
                    highlightedCompanyId !== key;
                  return (
                    <g
                      key={key}
                      opacity={dimmed ? 0.2 : 1}
                      aria-hidden="true"
                      onMouseEnter={() => handleHoverBand(key)}
                      onMouseLeave={() => handleHoverBand(null)}
                    >
                      <path d={vendorLinePath(key)} fill="none" stroke={color} strokeWidth={2} />
                      {rows.map((row) => {
                        const point = row.points[key];
                        if (!point) return null;
                        return (
                          <circle
                            key={row.year}
                            cx={xScale(row.year)}
                            cy={shareScale(row.values[key] ?? 0)}
                            r={3.5}
                            fill={point.confidence === "reported" ? color : "var(--background)"}
                            stroke={color}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </g>
                  );
                })
              : null}

            {sparse
              ? null
              : stacked.map((band, index) => {
                  const key = String(band.key);
                  const confidence: Confidence =
                    key === OTHER_SHARE_KEY ? "modeled" : shareBandConfidence(sortedSeries, key);
                  const color = bandColor(key, index);
                  const dimmed =
                    typeof highlightedCompanyId === "string" &&
                    highlightedCompanyId.length > 0 &&
                    highlightedCompanyId !== key;
                  const path = areaPath(band);
                  if (!path) return null;
                  return (
                    <path
                      key={key}
                      d={path}
                      fill={color}
                      fillOpacity={dimmed ? 0.12 : bandOpacity(key, confidence)}
                      stroke="var(--background)"
                      strokeWidth={1}
                      aria-hidden="true"
                      onMouseEnter={() => handleHoverBand(key)}
                      onMouseLeave={() => handleHoverBand(null)}
                    />
                  );
                })}

            {narrow || top3Path.length === 0 ? null : (
              <path
                d={top3Path}
                fill="none"
                aria-hidden="true"
                {...lineStyleFor(TOP3_COLOR, "modeled")}
              />
            )}

            {narrow || hhiPath.length === 0 ? null : (
              <>
                <line
                  aria-hidden="true"
                  x1={0}
                  x2={innerWidth}
                  y1={hhiScale(HHI_HIGHLY_CONCENTRATED)}
                  y2={hhiScale(HHI_HIGHLY_CONCENTRATED)}
                  stroke={HHI_COLOR}
                  strokeWidth={1}
                  strokeDasharray="2 4"
                  opacity={0.7}
                />
                <text
                  x={innerWidth - 4}
                  y={hhiScale(HHI_HIGHLY_CONCENTRATED) - 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[11px]"
                >
                  HHI 1,800 — highly concentrated
                </text>
                <path
                  d={hhiPath}
                  fill="none"
                  aria-hidden="true"
                  {...lineStyleFor(HHI_COLOR, "modeled")}
                />
              </>
            )}

            {rows.map((row) => {
              const centre = xScale(row.year);
              const width = Math.max(8, innerWidth / Math.max(1, rows.length));
              const focused = yearNav.activeId === String(row.year);
              return (
                <g key={`column-${row.year}`}>
                  {focused || hoveredYear === row.year ? (
                    <line
                      aria-hidden="true"
                      x1={centre}
                      x2={centre}
                      y1={0}
                      y2={plotHeight}
                      className="stroke-ring"
                      strokeWidth={1.2}
                      opacity={0.8}
                    />
                  ) : null}
                  <rect
                    ref={yearNav.registerMark(String(row.year))}
                    x={centre - width / 2}
                    y={0}
                    width={width}
                    height={plotHeight}
                    fill="transparent"
                    tabIndex={yearNav.getTabIndex(row)}
                    role="button"
                    aria-label={describeRow(row)}
                    className="cursor-crosshair outline-none focus-visible:fill-ring/10"
                    onClick={() => handleFocusRow(row)}
                    onKeyDown={(keyEvent) => yearNav.handleKeyDown(keyEvent, row)}
                    onFocus={() => {
                      yearNav.handleFocus(row);
                      handleFocusRow(row);
                    }}
                    onBlur={handleLeaveRow}
                    onMouseEnter={() => handleFocusRow(row)}
                    onMouseLeave={handleLeaveRow}
                  />
                </g>
              );
            })}

            <g transform={`translate(0, ${plotHeight})`}>
              <Axis
                orientation="bottom"
                ticks={xTicks}
                scale={(value) => xScale(value)}
                length={innerWidth}
              />
            </g>

            <Axis
              orientation="left"
              ticks={shareTicks}
              scale={(value) => shareScale(value)}
              length={plotHeight}
              showGrid
            />

            {narrow || concentrationSeries.length < 2 ? null : (
              <g transform={`translate(${innerWidth}, 0)`}>
                <Axis
                  orientation="right"
                  ticks={hhiTicks}
                  scale={(value) => hhiScale(value)}
                  length={plotHeight}
                />
              </g>
            )}

            {narrow
              ? null
              : annotatedEvents.map((event) => {
                  const x = xScale(event.year);
                  const y = plotHeight + EVENT_MARKER_OFFSET;
                  const selected = eventNav.activeId === event.id;
                  return (
                    <g key={event.id} transform={`translate(${x}, ${y})`}>
                      <path
                        ref={eventNav.registerMark(event.id)}
                        d="M 0 -6 L 5.5 4 L -5.5 4 Z"
                        fill={eventTypeColor(event.type)}
                        fillOpacity={selected ? 1 : 0.75}
                        stroke={eventTypeColor(event.type)}
                        strokeWidth={selected ? 2 : 1}
                        tabIndex={eventNav.getTabIndex(event)}
                        role="button"
                        aria-label={`${eventTypeLabel[event.type]}, ${event.year}: ${event.title}. ${event.impact}`}
                        className="cursor-pointer outline-none focus-visible:stroke-ring focus-visible:[stroke-width:2.5]"
                        onClick={() => handleSelectEvent(event)}
                        onKeyDown={(keyEvent) => eventNav.handleKeyDown(keyEvent, event)}
                        onFocus={() => eventNav.handleFocus(event)}
                      />
                    </g>
                  );
                })}
          </g>
        </svg>

        <ChartTooltip
          x={margin.left + (hoveredRow ? xScale(hoveredRow.year) : 0)}
          y={margin.top + plotHeight / 3}
          containerWidth={size.width}
          containerHeight={totalHeight}
          title={marketName}
          year={hoveredRow?.year ?? rows[0]?.year ?? 0}
          rows={tooltipRows}
          footnote="Shares are published figures; the residual, HHI and top-three lines are derived."
          visible={hoveredRow !== null}
        />
      </div>
    </ChartFrame>
  );
};
