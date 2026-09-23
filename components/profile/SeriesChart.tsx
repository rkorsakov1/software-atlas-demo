"use client";

import { useCallback, useMemo, useState } from "react";

import {
  AtlasMarkTooltip,
  Axis,
  ChartFrame,
  DataTable,
  EmptyState,
  HatchDefs,
  isNarrow,
  markStyleFor,
  ticksFrom,
  useChartSize,
  useKeyboardNav,
} from "@/components/charts/primitives";
import { sources } from "@/data";
import type { DataPoint } from "@/data/types";
import { confidenceLabel, formatDataPoint, formatValue } from "@/lib/format";
import { niceLinearScale, yearScale } from "@/lib/scales";
import { sourceTitle } from "@/lib/selectors";

const profileSourceTitle = (sourceId: string): string => sourceTitle(sources, sourceId);

export type SeriesChartProps = {
  title: string;
  takeaway: string;
  source: string;
  /** Names the quantity on the y axis, e.g. "Revenue" or "Market size". */
  seriesLabel: string;
  points: readonly DataPoint[];
  sourceTitleFor: (sourceId: string) => string;
  color?: string;
  footnote?: string;
  emptyTitle: string;
  emptyDescription: string;
};

const MARGIN = { top: 16, right: 18, bottom: 34, left: 60 };
const NARROW_MARGIN = { top: 12, right: 12, bottom: 32, left: 46 };
const PLOT_HEIGHT = 250;
const NARROW_PLOT_HEIGHT = 200;
const MARK_RADIUS = 5;

type PlottedPoint = {
  id: string;
  point: DataPoint;
  x: number;
  y: number;
  yLow: number;
  yHigh: number;
};

/**
 * One dated series on a profile page: revenue for a company, size for a market.
 * It is not one of the ten Atlas visualisations, so it lives with the profile UI
 * rather than in `components/charts/` — but it draws confidence exactly the way
 * they do, through the shared `markStyleFor` helper.
 */
export const SeriesChart = ({
  title,
  takeaway,
  source,
  seriesLabel,
  points,
  sourceTitleFor,
  color = "var(--cat-infrastructure)",
  footnote,
  emptyTitle,
  emptyDescription,
}: SeriesChartProps): React.ReactElement => {
  const { ref, size } = useChartSize({ initial: { width: 640, height: 300 } });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const narrow = isNarrow(size.width);
  const margin = narrow ? NARROW_MARGIN : MARGIN;
  const plotHeight = narrow ? NARROW_PLOT_HEIGHT : PLOT_HEIGHT;
  const innerWidth = Math.max(60, size.width - margin.left - margin.right);
  const innerHeight = Math.max(80, plotHeight - margin.top - margin.bottom);
  const totalHeight = plotHeight;

  const sorted = useMemo(
    () => [...points].sort((a, b) => a.year - b.year),
    [points],
  );

  const unit = sorted[0]?.unit ?? "USD_B";

  const xScale = useMemo(() => {
    const years = sorted.map((entry) => entry.year);
    const min = years.length > 0 ? Math.min(...years) : 0;
    const max = years.length > 0 ? Math.max(...years) : 1;
    const domain: [number, number] = min === max ? [min - 1, max + 1] : [min, max];
    return yearScale(domain, [0, innerWidth]);
  }, [innerWidth, sorted]);

  const yScale = useMemo(() => {
    const highs = sorted.map((entry) => entry.high ?? entry.value);
    const max = highs.length > 0 ? Math.max(...highs) : 1;
    return niceLinearScale([0, max === 0 ? 1 : max], [innerHeight, 0]);
  }, [innerHeight, sorted]);

  const plotted = useMemo<PlottedPoint[]>(
    () =>
      sorted.map((point) => ({
        id: String(point.year),
        point,
        x: xScale(point.year),
        y: yScale(point.value),
        yLow: yScale(point.low ?? point.value),
        yHigh: yScale(point.high ?? point.value),
      })),
    [sorted, xScale, yScale],
  );

  const linePath = useMemo(() => {
    if (plotted.length < 2) return "";
    return plotted
      .map((entry, index) => `${index === 0 ? "M" : "L"}${entry.x.toFixed(2)},${entry.y.toFixed(2)}`)
      .join(" ");
  }, [plotted]);

  const getId = useCallback((entry: PlottedPoint): string => entry.id, []);

  const keyboard = useKeyboardNav<PlottedPoint>({
    items: plotted,
    getId,
    orientation: "horizontal",
    onFocusChange: (entry) => setFocusedId(entry.id),
  });

  const activeId = hoveredId ?? focusedId;
  const active = plotted.find((entry) => entry.id === activeId);

  const table = (
    <DataTable<PlottedPoint>
      caption={`${title}: every point in the series with its source and confidence.`}
      rows={plotted}
      getRowKey={getId}
      getConfidence={(row) => ({ confidence: row.point.confidence, note: row.point.note })}
      columns={[
        { key: "year", header: "Year", render: (row) => String(row.point.year), numeric: true },
        {
          key: "value",
          header: seriesLabel,
          align: "right",
          numeric: true,
          render: (row) => formatDataPoint(row.point),
        },
        {
          key: "source",
          header: "Source",
          render: (row) => sourceTitleFor(row.point.sourceId),
        },
        {
          key: "note",
          header: "Method",
          render: (row) => row.point.note ?? "—",
        },
      ]}
    />
  );

  if (plotted.length === 0) {
    return (
      <ChartFrame title={title} takeaway={takeaway} source={source} footnote={footnote}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </ChartFrame>
    );
  }

  const yTicks = ticksFrom(yScale, 4, (value) => formatValue(value, unit));
  const xTicks = ticksFrom(xScale, narrow ? 4 : 6, (value) => String(Math.round(value)));

  return (
    <ChartFrame
      title={title}
      takeaway={takeaway}
      source={source}
      footnote={footnote}
      table={table}
      defaultView={narrow ? "table" : "chart"}
    >
      <div ref={ref} className="relative w-full" style={{ color }}>
        <svg
          width="100%"
          height={totalHeight}
          viewBox={`0 0 ${Math.max(size.width, 1)} ${totalHeight}`}
          role="group"
          aria-label={`${title}. ${plotted.length} points from ${plotted[0]?.point.year} to ${plotted[plotted.length - 1]?.point.year}.`}
        >
          <HatchDefs />
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            <g transform={`translate(0, ${innerHeight})`}>
              <Axis orientation="bottom" ticks={xTicks} scale={xScale} length={innerWidth} />
            </g>
            <Axis
              orientation="left"
              ticks={yTicks}
              scale={yScale}
              length={innerWidth}
              showGrid
              label={seriesLabel}
            />

            {linePath.length === 0 ? null : (
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={0.7}
              />
            )}

            {plotted.map((entry) => {
              const style = markStyleFor(color, entry.point.confidence);
              const hasRange = entry.point.low !== undefined && entry.point.high !== undefined;
              const isActive = entry.id === activeId;
              return (
                <g key={entry.id}>
                  {hasRange ? (
                    <line
                      x1={entry.x}
                      x2={entry.x}
                      y1={entry.yLow}
                      y2={entry.yHigh}
                      stroke={color}
                      strokeWidth={1.5}
                      strokeDasharray="3 2"
                      opacity={0.65}
                      aria-hidden="true"
                    />
                  ) : null}
                  <circle
                    ref={keyboard.registerMark(entry.id)}
                    cx={entry.x}
                    cy={entry.y}
                    r={isActive ? MARK_RADIUS + 2 : MARK_RADIUS}
                    fill={style.fill}
                    fillOpacity={style.fillOpacity}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth}
                    strokeDasharray={style.strokeDasharray}
                    tabIndex={keyboard.getTabIndex(entry)}
                    role="button"
                    aria-label={`${entry.point.year}: ${formatDataPoint(entry.point)}, ${confidenceLabel[entry.point.confidence].toLowerCase()}, source ${sourceTitleFor(entry.point.sourceId)}`}
                    className="cursor-default outline-none focus-visible:stroke-ring focus-visible:[stroke-width:3]"
                    onKeyDown={(event) => keyboard.handleKeyDown(event, entry)}
                    onFocus={() => {
                      keyboard.handleFocus(entry);
                      setFocusedId(entry.id);
                    }}
                    onBlur={() => setFocusedId(null)}
                    onMouseEnter={() => setHoveredId(entry.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {active === undefined ? null : (
          <AtlasMarkTooltip
            x={active.x + margin.left}
            y={active.y + margin.top}
            containerWidth={size.width}
            containerHeight={totalHeight}
            title={seriesLabel}
            year={active.point.year}
            visible
            rows={[
              {
                label: seriesLabel,
                value: formatDataPoint(active.point),
                confidence: active.point.confidence,
                note: active.point.note,
                source: sourceTitleFor(active.point.sourceId),
                color,
              },
            ]}
            footnote={
              active.point.low === undefined
                ? "A single figure as recorded; the badge states whether it was reported, estimated or derived here."
                : "The dashed whisker spans the recorded low and high. The midpoint is drawn so the line can be plotted; the range is the claim."
            }
          />
        )}
      </div>
    </ChartFrame>
  );
};

export type ProfileSeriesProps = Omit<SeriesChartProps, "sourceTitleFor">;

/**
 * Server components cannot hand a function across the boundary, so profiles
 * render this wrapper and it resolves source titles on the client.
 */
export const ProfileSeries = (props: ProfileSeriesProps): React.ReactElement => (
  <SeriesChart {...props} sourceTitleFor={profileSourceTitle} />
);
