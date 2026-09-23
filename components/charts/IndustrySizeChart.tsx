"use client";

import { scaleLinear, scaleLog } from "d3-scale";
import { line } from "d3-shape";
import { useCallback, useMemo, useState } from "react";

import { Axis, type AxisTick } from "@/components/charts/primitives/Axis";
import { ChartFrame } from "@/components/charts/primitives/ChartFrame";
import { ChartTooltip, type TooltipRow } from "@/components/charts/primitives/ChartTooltip";
import { DataTable, type DataTableColumn } from "@/components/charts/primitives/DataTable";
import { EmptyState } from "@/components/charts/primitives/EmptyState";
import { Legend, type LegendItem } from "@/components/charts/primitives/Legend";
import { isNarrow, useChartSize } from "@/components/charts/primitives/useChartSize";
import { useKeyboardNav } from "@/components/charts/primitives/useKeyboardNav";
import type { IndustrySizePoint, SizeScope } from "@/data/types";
import { formatDataPoint, formatValue } from "@/lib/format";

export type IndustrySizeChartProps = {
  points: readonly IndustrySizePoint[];
  year: number;
  onYearChange?: (year: number) => void;
  sourceTitleFor: (sourceId: string) => string;
};

type Series = {
  key: string;
  scope: SizeScope;
  definition: string;
  points: IndustrySizePoint[];
};

type Mark = IndustrySizePoint & { id: string; seriesKey: string };

const HEIGHT = 260;
const MARGIN = { top: 12, right: 16, bottom: 28, left: 52 };
const SCOPE_LABEL: Record<SizeScope, string> = {
  world: "Worldwide",
  us: "US only",
};
const SERIES_COLORS: readonly string[] = [
  "var(--cat-infrastructure)",
  "var(--cat-horizontal)",
  "var(--cat-vertical)",
  "var(--cat-consumer)",
  "var(--cat-emerging)",
  "var(--muted-foreground)",
];

const seriesColor = (index: number): string =>
  SERIES_COLORS[index % SERIES_COLORS.length] ?? "var(--muted-foreground)";

/** One line per scope and definition: a new definition starts a new line, never a jump. */
const groupSeries = (points: readonly IndustrySizePoint[]): Series[] => {
  const groups = new Map<string, Series>();
  for (const entry of points) {
    const key = `${entry.scope}|${entry.definition}`;
    const group = groups.get(key);
    if (group) {
      group.points.push(entry);
      continue;
    }
    groups.set(key, {
      key,
      scope: entry.scope,
      definition: entry.definition,
      points: [entry],
    });
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      points: [...group.points].sort((a, b) => a.point.year - b.point.year),
    }))
    .sort((a, b) => (a.points[0]?.point.year ?? 0) - (b.points[0]?.point.year ?? 0));
};

const logTicks = (min: number, max: number): AxisTick[] => {
  const ticks: AxisTick[] = [];
  for (let power = Math.floor(Math.log10(min)); power <= Math.ceil(Math.log10(max)); power += 1) {
    const value = 10 ** power;
    if (value < min || value > max) continue;
    ticks.push({ value, label: formatValue(value, "USD_B") });
  }
  return ticks;
};

/**
 * The size of the whole software industry over time. No single publisher covers
 * 1970 to today, so each publisher's definition is drawn as its own line on a log
 * scale; where a definition changes, the line breaks instead of implying growth.
 */
export const IndustrySizeChart = ({
  points,
  year,
  onYearChange,
  sourceTitleFor,
}: IndustrySizeChartProps): React.ReactElement => {
  const { ref: containerRef, size } = useChartSize({
    initial: { width: 880, height: HEIGHT },
  });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const narrow = isNarrow(size.width);
  const innerWidth = Math.max(60, size.width - MARGIN.left - MARGIN.right);
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const series = useMemo(() => groupSeries(points), [points]);

  const marks = useMemo<Mark[]>(
    () =>
      series
        .flatMap((group) =>
          group.points.map((entry) => ({
            ...entry,
            id: `${group.key}|${entry.point.year}`,
            seriesKey: group.key,
          })),
        )
        .sort((a, b) => a.point.year - b.point.year),
    [series],
  );

  const colorByKey = useMemo(
    () => new Map(series.map((group, index) => [group.key, seriesColor(index)])),
    [series],
  );

  const years = marks.map((mark) => mark.point.year);
  const values = marks.map((mark) => mark.point.value);
  const minYear = Math.min(...years, year);
  const maxYear = Math.max(...years, year);

  const xScale = useMemo(
    () => scaleLinear().domain([minYear, maxYear]).range([0, innerWidth]),
    [innerWidth, maxYear, minYear],
  );
  const yScale = useMemo(
    () =>
      scaleLog()
        .domain([Math.max(0.1, Math.min(...values) * 0.7), Math.max(...values) * 1.4])
        .range([innerHeight, 0]),
    [innerHeight, values],
  );

  const xTicks = useMemo<AxisTick[]>(
    () =>
      xScale.ticks(narrow ? 4 : 8).map((value) => ({ value, label: String(Math.round(value)) })),
    [narrow, xScale],
  );
  const [yMin, yMax] = yScale.domain() as [number, number];
  const yTicks = useMemo(() => logTicks(yMin, yMax), [yMax, yMin]);

  const pathFor = useCallback(
    (group: Series): string =>
      line<IndustrySizePoint>()
        .x((entry) => xScale(entry.point.year))
        .y((entry) => yScale(entry.point.value))(group.points) ?? "",
    [xScale, yScale],
  );

  const handleActivate = useCallback(
    (mark: Mark): void => {
      onYearChange?.(mark.point.year);
    },
    [onYearChange],
  );

  const handleFocusMark = useCallback((mark: Mark): void => {
    setHoveredId(mark.id);
  }, []);

  const handleLeave = (): void => setHoveredId(null);

  const nav = useKeyboardNav<Mark>({
    items: marks,
    getId: (mark) => mark.id,
    orientation: "horizontal",
    onActivate: handleActivate,
    onFocusChange: handleFocusMark,
  });

  const hovered = marks.find((mark) => mark.id === hoveredId) ?? null;

  const tooltipRows = useMemo<TooltipRow[]>(() => {
    if (!hovered) return [];
    return [
      {
        label: SCOPE_LABEL[hovered.scope],
        value: hovered.point.value,
        unit: hovered.point.unit,
        confidence: hovered.point.confidence,
        source: sourceTitleFor(hovered.point.sourceId),
        note: hovered.point.note,
        low: hovered.point.low,
        high: hovered.point.high,
        color: colorByKey.get(hovered.seriesKey),
      },
    ];
  }, [colorByKey, hovered, sourceTitleFor]);

  const legendItems = useMemo<LegendItem[]>(
    () =>
      series.map((group, index) => ({
        id: group.key,
        label: `${group.definition} · ${SCOPE_LABEL[group.scope]}`,
        color: seriesColor(index),
      })),
    [series],
  );

  const columns = useMemo<DataTableColumn<Mark>[]>(
    () => [
      {
        key: "year",
        header: "Year",
        align: "right",
        numeric: true,
        render: (mark) => mark.point.year,
      },
      {
        key: "value",
        header: "Size",
        align: "right",
        numeric: true,
        render: (mark) => formatDataPoint(mark.point),
      },
      {
        key: "scope",
        header: "Scope",
        render: (mark) => SCOPE_LABEL[mark.scope],
      },
      {
        key: "definition",
        header: "What is counted",
        render: (mark) => mark.definition,
      },
      {
        key: "source",
        header: "Source",
        render: (mark) => sourceTitleFor(mark.point.sourceId),
      },
    ],
    [sourceTitleFor],
  );

  const sourceLine = useMemo(() => {
    const ids = new Set(marks.map((mark) => mark.point.sourceId));
    return `${ids.size} sources across ${series.length} definitions; each is listed in the table.`;
  }, [marks, series.length]);

  if (marks.length === 0) {
    return (
      <ChartFrame
        title="The software industry"
        takeaway="No industry-wide figures in this build."
        source="—"
      >
        <EmptyState
          title="No industry size data"
          description="Add rows to data/series/industry-size.csv to draw this chart."
        />
      </ChartFrame>
    );
  }

  const first = marks[0];
  const last = marks[marks.length - 1];
  const takeaway =
    first && last
      ? `From ${formatValue(first.point.value, "USD_B")} in ${first.point.year} to ${formatValue(last.point.value, "USD_B")} in ${last.point.year}. Each line is one publisher's definition, so compare within a line, not across.`
      : "";

  const yearX = xScale(Math.min(Math.max(year, minYear), maxYear));

  return (
    <ChartFrame
      title="The software industry, 1970 to today"
      takeaway={takeaway}
      source={sourceLine}
      toolbar={<Legend items={legendItems} />}
      footnote="Log scale. Click a point to move the year."
      table={
        <DataTable
          caption="Size of the software industry by year and definition"
          columns={columns}
          rows={marks}
          getRowKey={(mark) => mark.id}
          getConfidence={(mark) => ({
            confidence: mark.point.confidence,
            note: mark.point.note,
          })}
        />
      }
    >
      <div ref={containerRef} className="relative w-full">
        <svg
          width={size.width}
          height={HEIGHT}
          viewBox={`0 0 ${size.width} ${HEIGHT}`}
          role="group"
          aria-label={`Size of the software industry from ${minYear} to ${maxYear}, log scale`}
          className="w-full select-none"
          onMouseLeave={handleLeave}
        >
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            <Axis
              orientation="left"
              ticks={yTicks}
              scale={(value) => yScale(value)}
              length={innerWidth}
              showGrid
            />
            <g transform={`translate(0, ${innerHeight})`}>
              <Axis
                orientation="bottom"
                ticks={xTicks}
                scale={(value) => xScale(value)}
                length={innerHeight}
              />
            </g>

            <line
              aria-hidden="true"
              x1={yearX}
              x2={yearX}
              y1={0}
              y2={innerHeight}
              stroke="var(--brand)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />

            {series.map((group) => (
              <path
                key={group.key}
                d={pathFor(group)}
                fill="none"
                stroke={colorByKey.get(group.key)}
                strokeWidth={2}
                aria-hidden="true"
              />
            ))}

            {marks.map((mark) => {
              const color = colorByKey.get(mark.seriesKey);
              const active = mark.id === hoveredId || mark.point.year === year;
              return (
                <circle
                  key={mark.id}
                  ref={nav.registerMark(mark.id)}
                  cx={xScale(mark.point.year)}
                  cy={yScale(mark.point.value)}
                  r={active ? 5.5 : 4}
                  fill={mark.point.confidence === "reported" ? color : "var(--background)"}
                  stroke={color}
                  strokeWidth={2}
                  tabIndex={nav.getTabIndex(mark)}
                  role="button"
                  aria-label={`${mark.point.year}: ${formatDataPoint(mark.point)}, ${SCOPE_LABEL[mark.scope]}, ${mark.definition}, ${mark.point.confidence}`}
                  className="cursor-pointer outline-none focus-visible:stroke-ring"
                  onClick={() => handleActivate(mark)}
                  onKeyDown={(event) => nav.handleKeyDown(event, mark)}
                  onFocus={() => {
                    nav.handleFocus(mark);
                    handleFocusMark(mark);
                  }}
                  onBlur={handleLeave}
                  onMouseEnter={() => handleFocusMark(mark)}
                />
              );
            })}
          </g>
        </svg>

        <ChartTooltip
          x={hovered ? MARGIN.left + xScale(hovered.point.year) : 0}
          y={hovered ? MARGIN.top + yScale(hovered.point.value) : 0}
          containerWidth={size.width}
          containerHeight={HEIGHT}
          title={hovered?.definition ?? ""}
          year={hovered?.point.year ?? year}
          rows={tooltipRows}
          visible={hovered !== null}
        />
      </div>
    </ChartFrame>
  );
};
