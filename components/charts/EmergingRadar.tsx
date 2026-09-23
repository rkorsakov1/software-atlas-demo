"use client";

import { useCallback, useMemo, useState } from "react";

import { AtlasMarkTooltip } from "@/components/charts/primitives/AtlasMarkTooltip";
import { fitLabel } from "@/components/charts/primitives/atlasLabelFit";
import {
  HORIZON_RINGS,
  RADAR_CATEGORIES,
  RING_LABEL_ANGLE,
  type EmergingDot,
  type RadarGeometry,
  type RadarTextAnchor,
  categorySector,
  emergingRadarDots,
  horizonRingBounds,
  polarPoint,
  radarTextAnchor,
  sectorLabelPoint,
} from "@/components/charts/primitives/atlasRadarMath";
import { ChartFrame } from "@/components/charts/primitives/ChartFrame";
import { ConfidenceBadge } from "@/components/charts/primitives/ConfidenceBadge";
import { DataTable, type DataTableColumn } from "@/components/charts/primitives/DataTable";
import { EmptyState } from "@/components/charts/primitives/EmptyState";
import { markStyleFor } from "@/components/charts/primitives/HatchDefs";
import { Legend, type LegendItem } from "@/components/charts/primitives/Legend";
import { isNarrow, useChartSize } from "@/components/charts/primitives/useChartSize";
import { useKeyboardNav } from "@/components/charts/primitives/useKeyboardNav";
import type { EmergingMarket, Horizon } from "@/data/types";
import { categoryLabel, horizonLabel, signalTypeLabel } from "@/lib/format";
import { CATEGORY_ORDER, categoryColorVar } from "@/lib/scales";
import { signalStrengthTotal } from "@/lib/selectors";

export type EmergingRadarProps = {
  markets: readonly EmergingMarket[];
  selectedId?: string | null;
  onSelectMarket?: (marketId: string) => void;
  sourceTitleFor: (sourceId: string) => string;
};

const STRENGTH_NOTE =
  "Modeled: signal strength is a 1-3 editorial judgment of how much weight the evidence carries. The dot's area is the sum of those judgments and has no year.";

const TOOLTIP_FOOTNOTE =
  "Ring = horizon, sector = category, dot area = summed signal strength (modeled, undated). Select the dot for every signal with its source.";

/** Short forms for the in-chart ring labels; the long forms stay in the header. */
const horizonShortLabel: Record<Horizon, string> = {
  "0-2y": "0–2y",
  "2-5y": "2–5y",
  "5y+": "5y+",
};

const RING_LABEL_PILL = { width: 38, height: 15 };
const SECTOR_LABEL_OFFSET = 15;
const SECTOR_LABEL_FONT = 12;

type EmergingTableRow = {
  id: string;
  name: string;
  category: string;
  horizon: string;
  stage: string;
  signalCount: number;
  strength: number;
  thesis: string;
};

const takeawayFor = (markets: readonly EmergingMarket[]): string => {
  if (markets.length === 0) {
    return "No emerging market matches the current filters.";
  }
  const strongest = markets.reduce((best, market) =>
    signalStrengthTotal(market) > signalStrengthTotal(best) ? market : best,
  );
  const near = markets.filter((market) => market.horizon === "0-2y").length;
  return `${strongest.name} carries the most evidence behind it (${signalStrengthTotal(strongest)} points of signal); ${near} of ${markets.length} candidate markets sit inside the two-year ring.`;
};

/**
 * Candidate markets placed by judgment, not by measurement: the ring is
 * the horizon, the sector is the category and the dot's area is the summed
 * strength of its signals. Angles come from a hash of the market id, relaxed only
 * as far as it takes to stop two dots covering each other, so a dot stays where
 * the eye left it across filters.
 *
 * Structural labels sit outside the data area (CONTRACTS §10.5): category names
 * go in a reserved gutter beyond the outer ring, or in the header legend when the
 * card is too narrow for them, and the ring labels run up one spoke — a sector
 * boundary that dot placement keeps clear — on a card-coloured halo.
 */
export const EmergingRadar = ({
  markets,
  selectedId,
  onSelectMarket,
  sourceTitleFor,
}: EmergingRadarProps): React.ReactElement => {
  const { ref, size } = useChartSize({
    initial: { width: 620, height: 500 },
    aspectRatio: 1.16,
    minHeight: 420,
    maxHeight: 560,
  });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const narrow = isNarrow(size.width);
  const sideGutter = narrow ? 18 : 116;
  const verticalGutter = narrow ? 18 : 26;

  const geometry = useMemo<RadarGeometry>(() => {
    const cx = size.width / 2;
    const cy = size.height / 2;
    const radius = Math.max(60, Math.min(cx - sideGutter, cy - verticalGutter));
    return { cx, cy, radius };
  }, [sideGutter, size.height, size.width, verticalGutter]);

  const dots = useMemo(
    () => emergingRadarDots(markets, geometry, { maxDotRadius: narrow ? 9 : 13 }),
    [geometry, markets, narrow],
  );

  const dotById = useMemo(() => new Map(dots.map((dot) => [dot.id, dot])), [dots]);

  /** Bigger dots go down first so a small one is never hidden underneath. */
  const paintOrder = useMemo(() => [...dots].sort((a, b) => b.radius - a.radius), [dots]);

  const legendItems = useMemo<LegendItem[]>(
    () =>
      CATEGORY_ORDER.filter((category) =>
        markets.some((market) => market.category === category),
      ).map((category) => ({
        id: category,
        label: categoryLabel[category],
        color: categoryColorVar[category],
        dashed: true,
        count: markets.filter((market) => market.category === category).length,
      })),
    [markets],
  );

  const tableRows = useMemo<EmergingTableRow[]>(
    () =>
      [...markets]
        .sort((a, b) => signalStrengthTotal(b) - signalStrengthTotal(a))
        .map((market) => ({
          id: market.id,
          name: market.name,
          category: categoryLabel[market.category],
          horizon: horizonLabel[market.horizon],
          stage: market.stage,
          signalCount: market.signals.length,
          strength: signalStrengthTotal(market),
          thesis: market.thesis,
        })),
    [markets],
  );

  const handleActivate = useCallback(
    (dot: EmergingDot): void => {
      onSelectMarket?.(dot.id);
    },
    [onSelectMarket],
  );

  const handleFocusChange = useCallback((dot: EmergingDot): void => {
    setFocusedId(dot.id);
  }, []);

  const nav = useKeyboardNav<EmergingDot>({
    items: dots,
    getId: (dot) => dot.id,
    orientation: "horizontal",
    onActivate: handleActivate,
    onFocusChange: handleFocusChange,
  });

  const handleLeave = useCallback((): void => setHoveredId(null), []);

  /** Horizontal room a sector label has before it would leave the card. */
  const roomBeside = useCallback(
    (x: number, anchor: RadarTextAnchor): number => {
      if (anchor === "start") return size.width - x - 6;
      if (anchor === "end") return x - 6;
      return Math.max(0, Math.min(x, size.width - x) * 2 - 6);
    },
    [size.width],
  );

  const activeDot =
    (hoveredId ? dotById.get(hoveredId) : undefined) ??
    (focusedId ? dotById.get(focusedId) : undefined) ??
    null;

  /**
   * Strength first, then the signals in weight order. `AtlasMarkTooltip` caps the
   * card at four rows and counts the rest, so the hover card stays a summary and
   * the full case stays in the sheet the dot opens.
   */
  const tooltipRows = useMemo(() => {
    if (!activeDot) return [];
    const market = activeDot.market;
    // Two signals can share a type — a market can have two leading indicators —
    // so a repeated type is numbered rather than printed twice unexplained.
    const perType = market.signals.reduce<Record<string, number>>((counts, signal) => {
      counts[signal.type] = (counts[signal.type] ?? 0) + 1;
      return counts;
    }, {});
    const seen: Record<string, number> = {};
    const signals = [...market.signals]
      .sort((a, b) => b.strength - a.strength)
      .map((signal) => {
        const total = perType[signal.type] ?? 1;
        seen[signal.type] = (seen[signal.type] ?? 0) + 1;
        const ordinal = seen[signal.type] ?? 1;
        return {
          label:
            total > 1
              ? `${signalTypeLabel[signal.type]} ${ordinal} of ${total}`
              : signalTypeLabel[signal.type],
          value: `${signal.strength} / 3`,
          confidence: "modeled" as const,
          note: STRENGTH_NOTE,
          detail: signal.evidence,
          source: signal.sourceIds.map((sourceId) => sourceTitleFor(sourceId)).join("; "),
        };
      });
    return [
      {
        label: "Signal strength",
        value: `${activeDot.strength} across ${market.signals.length} signals`,
        confidence: "modeled" as const,
        note: STRENGTH_NOTE,
        color: categoryColorVar[market.category],
      },
      ...signals,
    ];
  }, [activeDot, sourceTitleFor]);

  const tableColumns: readonly DataTableColumn<EmergingTableRow>[] = [
    { key: "name", header: "Candidate market", render: (row) => row.name },
    { key: "category", header: "Category", render: (row) => row.category },
    { key: "horizon", header: "Horizon", render: (row) => row.horizon },
    { key: "stage", header: "Stage", render: (row) => row.stage },
    {
      key: "signals",
      header: "Signals",
      align: "right",
      numeric: true,
      render: (row) => String(row.signalCount),
    },
    {
      key: "strength",
      header: "Strength",
      align: "right",
      numeric: true,
      render: (row) => String(row.strength),
    },
    { key: "thesis", header: "Thesis", render: (row) => row.thesis },
  ];

  const table = (
    <DataTable<EmergingTableRow>
      caption="Candidate markets with their horizon, stage, signal count and summed signal strength."
      columns={tableColumns}
      rows={tableRows}
      getRowKey={(row) => row.id}
      getConfidence={() => ({ confidence: "modeled", note: STRENGTH_NOTE })}
    />
  );

  const toolbar = (
    <div className="flex w-full flex-col gap-2">
      <Legend items={legendItems} title="Sector" />
      <span className="flex items-center gap-1.5">
        <ConfidenceBadge confidence="modeled" note={STRENGTH_NOTE} />
        <span className="text-xs text-muted-foreground">
          Rings outward: {HORIZON_RINGS.map((horizon) => horizonLabel[horizon]).join(" · ")}
        </span>
      </span>
    </div>
  );

  return (
    <ChartFrame
      title="What might become a market"
      takeaway={takeawayFor(markets)}
      source="Signals and their evidence are sourced individually; placement and strength are modeled in this project."
      footnote="Ring = horizon, sector = category, dot area = summed signal strength. Strengths are 1-3 editorial judgments, so the radar shows weight of evidence, not probability."
      table={table}
      toolbar={toolbar}
    >
      <div ref={ref} className="relative w-full">
        {dots.length === 0 ? (
          <EmptyState
            title="No candidate markets in view"
            description="No emerging market matches the current category or search filter. Clear the filters to see every candidate the Atlas tracks."
          />
        ) : (
          <>
            <svg
              width={size.width}
              height={size.height}
              viewBox={`0 0 ${size.width} ${size.height}`}
              role="group"
              aria-label="Emerging market radar: rings are time horizon, sectors are category, dot area is summed signal strength"
              className="w-full select-none"
              onMouseLeave={handleLeave}
            >
              <g aria-hidden="true">
                {HORIZON_RINGS.map((horizon, index) => (
                  <circle
                    key={horizon}
                    cx={geometry.cx}
                    cy={geometry.cy}
                    r={geometry.radius * horizonRingBounds(index).outer}
                    fill="none"
                    className="stroke-rule"
                    strokeWidth={1}
                    opacity={index === HORIZON_RINGS.length - 1 ? 1 : 0.55}
                  />
                ))}
                {RADAR_CATEGORIES.map((category) => {
                  const start = polarPoint(
                    geometry,
                    geometry.radius,
                    categorySector(category).startAngle,
                  );
                  return (
                    <line
                      key={`divider-${category}`}
                      x1={geometry.cx}
                      y1={geometry.cy}
                      x2={start.x}
                      y2={start.y}
                      className="stroke-rule"
                      strokeWidth={1}
                      opacity={0.55}
                    />
                  );
                })}
              </g>

              {narrow
                ? null
                : RADAR_CATEGORIES.map((category) => {
                    const sector = categorySector(category);
                    const point = sectorLabelPoint(category, geometry, SECTOR_LABEL_OFFSET);
                    const anchor = radarTextAnchor(
                      Math.cos((sector.startAngle + sector.endAngle) / 2),
                    );
                    const room = roomBeside(point.x, anchor);
                    const fitted = fitLabel(categoryLabel[category], room, SECTOR_LABEL_FONT);
                    if (fitted === null) return null;
                    return (
                      <text
                        key={`sector-${category}`}
                        x={point.x}
                        y={point.y}
                        dy="0.32em"
                        textAnchor={anchor}
                        fontSize={SECTOR_LABEL_FONT}
                        stroke="var(--card)"
                        strokeWidth={4}
                        paintOrder="stroke"
                        className="font-medium"
                        style={{ fill: categoryColorVar[category] }}
                      >
                        {fitted.text}
                        <title>{categoryLabel[category]}</title>
                      </text>
                    );
                  })}

              {paintOrder.map((dot) => {
                const color = categoryColorVar[dot.market.category];
                const style = markStyleFor(color, "modeled");
                const selected = selectedId === dot.id;
                const active = activeDot?.id === dot.id;
                return (
                  <g key={dot.id}>
                    {selected || active ? (
                      <circle
                        cx={dot.point.x}
                        cy={dot.point.y}
                        r={dot.radius + 5}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        opacity={0.5}
                        aria-hidden="true"
                      />
                    ) : null}
                    <circle
                      ref={nav.registerMark(dot.id)}
                      cx={dot.point.x}
                      cy={dot.point.y}
                      r={dot.radius}
                      fill={style.fill}
                      fillOpacity={selected ? 0.62 : style.fillOpacity}
                      stroke={style.stroke}
                      strokeWidth={selected ? 2 : style.strokeWidth}
                      strokeDasharray={style.strokeDasharray}
                      tabIndex={nav.getTabIndex(dot)}
                      role="button"
                      aria-pressed={selected}
                      aria-label={`${dot.market.name}: ${categoryLabel[dot.market.category]}, horizon ${horizonLabel[dot.market.horizon]}, ${dot.market.signals.length} signals with combined strength ${dot.strength} (modeled)`}
                      className="cursor-pointer outline-offset-2"
                      onClick={() => handleActivate(dot)}
                      onKeyDown={(event) => nav.handleKeyDown(event, dot)}
                      onFocus={() => {
                        nav.handleFocus(dot);
                        handleFocusChange(dot);
                      }}
                      onBlur={() => setFocusedId(null)}
                      onMouseEnter={() => setHoveredId(dot.id)}
                    >
                    </circle>
                  </g>
                );
              })}

              <g aria-hidden="true">
                {HORIZON_RINGS.map((horizon, index) => {
                  const anchor = polarPoint(
                    geometry,
                    geometry.radius * horizonRingBounds(index).outer - RING_LABEL_PILL.height,
                    RING_LABEL_ANGLE,
                  );
                  return (
                    <g key={`ring-label-${horizon}`}>
                      <rect
                        x={anchor.x - RING_LABEL_PILL.width / 2}
                        y={anchor.y - RING_LABEL_PILL.height / 2}
                        width={RING_LABEL_PILL.width}
                        height={RING_LABEL_PILL.height}
                        rx={7}
                        className="fill-card stroke-rule"
                        strokeWidth={1}
                        opacity={0.95}
                      />
                      <text
                        x={anchor.x}
                        y={anchor.y}
                        dy="0.34em"
                        textAnchor="middle"
                        fontSize={11}
                        className="fill-muted-foreground font-mono"
                      >
                        {horizonShortLabel[horizon]}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {activeDot ? (
              <AtlasMarkTooltip
                x={activeDot.point.x}
                y={activeDot.point.y}
                containerWidth={size.width}
                containerHeight={size.height}
                title={activeDot.market.name}
                subtitle={activeDot.market.thesis}
                rows={tooltipRows}
                footnote={TOOLTIP_FOOTNOTE}
                visible
              />
            ) : null}
          </>
        )}

        <p className="mt-2 min-h-[2.5rem] text-xs text-muted-foreground" aria-live="polite">
          {activeDot
            ? `${activeDot.market.name} — ${horizonLabel[activeDot.market.horizon]}, ${categoryLabel[activeDot.market.category]}, signal strength ${activeDot.strength}. ${activeDot.market.thesis}`
            : "Hover or focus a dot for its thesis and signals; press Enter to open the full case."}
        </p>
      </div>
    </ChartFrame>
  );
};
