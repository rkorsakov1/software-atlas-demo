"use client";

import { useCallback, useMemo, useState } from "react";

import { AtlasMarkTooltip } from "@/components/charts/primitives/AtlasMarkTooltip";
import {
  UPPERCASE_WIDTH_FACTOR,
  fitLabel,
} from "@/components/charts/primitives/atlasLabelFit";
import {
  ALL_PERIODS_ID,
  computeSankeyLayout,
  decadeIdFor,
  defaultPeriodId,
  filterInputToPeriod,
  flowPeriods,
  isMarketNodeId,
  labelledNodeIds,
  sankeyColumnCounts,
  sankeyHeightFor,
  stripNodePrefix,
  type SankeyLayoutLink,
} from "@/components/charts/primitives/atlasSankeyMath";
import { ChartFrame } from "@/components/charts/primitives/ChartFrame";
import { DataTable, type DataTableColumn } from "@/components/charts/primitives/DataTable";
import { EmptyState } from "@/components/charts/primitives/EmptyState";
import { Legend, type LegendItem } from "@/components/charts/primitives/Legend";
import { isNarrow, useChartSize } from "@/components/charts/primitives/useChartSize";
import { useKeyboardNav } from "@/components/charts/primitives/useKeyboardNav";
import { useNarrowViewport } from "@/components/charts/primitives/useNarrowViewport";
import { eventTypeColor } from "@/components/charts/primitives/eventStyles";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { FlowDirection } from "@/data/types";
import { cn } from "@/lib/cn";
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

const HEADER_HEIGHT = 26;
const BOTTOM_PAD = 10;
const NODE_WIDTH = 12;
const LABEL_FONT = 12;
const NARROW_LABEL_FONT = 11;
const LABEL_INSET = 8;
const HEADER_FONT = 11;
const MIN_RIBBON_WIDTH = 140;

const WEIGHT_NOTE =
  "Modeled: flow weight is a 1-3 editorial judgment of how much of the market the move absorbed. It is not a measured share, and it has no unit.";

const TOOLTIP_FOOTNOTE =
  "Each ribbon is one sourced competitive event; its thickness is a modeled 1-3 weight, not a measured share. Select the ribbon to open the event.";

const SPLIT_NOTE =
  "The diagram reads left to right: the market a move took capability out of, and where that capability landed. A market that both absorbed another and was itself absorbed appears once on each side.";

const directionColor: Record<FlowDirection, string> = {
  bundle: eventTypeColor("bundling"),
  unbundle: eventTypeColor("unbundling"),
};

const directionLabel: Record<FlowDirection, string> = {
  bundle: "Bundled into a suite",
  unbundle: "Unbundled into a market",
};

type SankeyTableRow = {
  id: string;
  year: number;
  from: string;
  direction: FlowDirection;
  to: string;
  weight: number;
  event: string;
  drawn: boolean;
};

/**
 * Chart 6. Markets flowing into suites and back out into markets again, laid out
 * by `d3-sankey` as two columns with a reserved label gutter on each side. A
 * bundle ribbon is solid and an unbundle ribbon is dashed in the second accent,
 * so the two directions never rely on colour alone.
 *
 * Density is handled the way CONTRACTS §10.6 asks: the height scales to the
 * tallest column rather than compressing nodes into a fixed box, and when the
 * whole window would not fit legibly the chart opens on its most recent decade
 * with every other decade one click away and every flow in the table.
 *
 * The node rectangles are labels, not controls: every ribbon names both of its
 * endpoints in its `aria-label`, so a keyboard reader gets the whole diagram from
 * the ribbons without a second tab stop that activates nothing.
 */
export const BundlingSankey = ({
  input,
  fromYear,
  toYear,
  onSelectEvent,
  eventTitleFor,
  highlightedMarketId,
  onHoverMarket,
}: BundlingSankeyProps): React.ReactElement => {
  const { ref: containerRef, size } = useChartSize({ initial: { width: 820, height: 560 } });
  const narrowViewport = useNarrowViewport();
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
  const [focusedLinkId, setFocusedLinkId] = useState<string | null>(null);
  const [requestedPeriodId, setRequestedPeriodId] = useState<string | null>(null);

  const narrow = isNarrow(size.width);

  const periods = useMemo(() => flowPeriods(input.links), [input.links]);
  const fullColumns = useMemo(() => sankeyColumnCounts(input), [input]);

  const periodId = useMemo(() => {
    const fallback = defaultPeriodId(periods, fullColumns.tallest);
    if (requestedPeriodId === null) return fallback;
    if (requestedPeriodId === ALL_PERIODS_ID) return ALL_PERIODS_ID;
    return periods.some((period) => period.id === requestedPeriodId) ? requestedPeriodId : fallback;
  }, [fullColumns.tallest, periods, requestedPeriodId]);

  const shownInput = useMemo(() => filterInputToPeriod(input, periodId), [input, periodId]);
  const shownColumns = useMemo(() => sankeyColumnCounts(shownInput), [shownInput]);

  const plotWidth = Math.max(280, size.width);
  const gutter = Math.max(
    72,
    Math.min(narrow ? 108 : 210, Math.round(plotWidth * 0.26), (plotWidth - MIN_RIBBON_WIDTH) / 2),
  );
  const ribbonWidth = Math.max(80, plotWidth - gutter * 2);
  const plotHeight = sankeyHeightFor(shownColumns.tallest, narrow ? 24 : 28);
  const svgHeight = plotHeight + HEADER_HEIGHT + BOTTOM_PAD;
  const labelFont = narrow ? NARROW_LABEL_FONT : LABEL_FONT;
  const labelWidth = gutter - LABEL_INSET - 4;
  // Uppercase, letter-spaced headings run wider than their point size suggests.
  const headerWidth = HEADER_FONT * UPPERCASE_WIDTH_FACTOR;
  const sourceHeader = fitLabel("Market moved", labelWidth, headerWidth);
  const targetHeader = fitLabel("Into", labelWidth, headerWidth);

  const layout = useMemo(
    () =>
      computeSankeyLayout(shownInput, {
        width: ribbonWidth,
        height: plotHeight,
        nodeWidth: NODE_WIDTH,
        nodePadding: narrow ? 14 : 18,
      }),
    [narrow, plotHeight, ribbonWidth, shownInput],
  );

  const labelled = useMemo(() => labelledNodeIds(layout.nodes), [layout.nodes]);

  const orderedLinks = useMemo(
    () =>
      [...layout.links].sort(
        (a, b) => a.year - b.year || a.sourceLabel.localeCompare(b.sourceLabel),
      ),
    [layout.links],
  );

  const linkById = useMemo(
    () => new Map(layout.links.map((link) => [link.id, link])),
    [layout.links],
  );

  const nodeById = useMemo(
    () => new Map(layout.nodes.map((node) => [node.id, node])),
    [layout.nodes],
  );

  /** Middle of the ribbon, derived from its two node rectangles rather than the path string. */
  const anchorOf = useCallback(
    (link: SankeyLayoutLink): { x: number; y: number } => {
      const source = nodeById.get(link.sourceDrawId);
      const target = nodeById.get(link.targetDrawId);
      if (!source || !target) return { x: ribbonWidth / 2, y: plotHeight / 2 };
      return {
        x: (source.x1 + target.x0) / 2,
        y: ((source.y0 + source.y1) / 2 + (target.y0 + target.y1) / 2) / 2,
      };
    },
    [nodeById, plotHeight, ribbonWidth],
  );

  const handleHoverMarket = useCallback(
    (nodeId: string | null): void => {
      if (nodeId === null) {
        onHoverMarket?.(null);
        return;
      }
      if (!isMarketNodeId(nodeId)) return;
      onHoverMarket?.(stripNodePrefix(nodeId));
    },
    [onHoverMarket],
  );

  const handleHoverLink = useCallback(
    (link: SankeyLayoutLink | null): void => {
      setHoveredLinkId(link?.id ?? null);
      handleHoverMarket(link ? link.sourceId : null);
    },
    [handleHoverMarket],
  );

  const handleActivateLink = useCallback(
    (link: SankeyLayoutLink): void => {
      onSelectEvent?.(link.eventId);
    },
    [onSelectEvent],
  );

  const handleFocusLink = useCallback(
    (link: SankeyLayoutLink): void => {
      setFocusedLinkId(link.id);
      handleHoverMarket(link.sourceId);
    },
    [handleHoverMarket],
  );

  const handlePeriodChange = useCallback((value: string): void => {
    if (value.length === 0) return;
    setRequestedPeriodId(value);
  }, []);

  const nav = useKeyboardNav<SankeyLayoutLink>({
    items: orderedLinks,
    getId: (link) => link.id,
    orientation: "vertical",
    onActivate: handleActivateLink,
    onFocusChange: handleFocusLink,
  });

  const describeLink = useCallback(
    (link: SankeyLayoutLink): string =>
      `${link.direction === "bundle" ? "Bundle" : "Unbundle"}, ${link.year}: ${link.sourceLabel} into ${link.targetLabel}, weight ${link.value} of 3 (modeled). ${eventTitleFor(link.eventId)}`,
    [eventTitleFor],
  );

  const activeLink = useMemo(() => {
    const activeId = hoveredLinkId ?? focusedLinkId;
    if (!activeId) return null;
    return linkById.get(activeId) ?? null;
  }, [focusedLinkId, hoveredLinkId, linkById]);

  const tooltipRows = useMemo(() => {
    if (!activeLink) return [];
    return [
      {
        label: directionLabel[activeLink.direction],
        value: `${activeLink.value} of 3`,
        confidence: "modeled" as const,
        note: WEIGHT_NOTE,
        detail: `${activeLink.sourceLabel} → ${activeLink.targetLabel}`,
        color: directionColor[activeLink.direction],
      },
      {
        label: "Event",
        value: String(activeLink.year),
        detail: eventTitleFor(activeLink.eventId),
      },
    ];
  }, [activeLink, eventTitleFor]);

  const drawnIds = useMemo(() => new Set(layout.links.map((link) => link.id)), [layout.links]);

  const tableRows = useMemo<SankeyTableRow[]>(() => {
    const labelOf = new Map(input.nodes.map((node) => [node.id, node.label]));
    return [...input.links]
      .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id))
      .map((link) => ({
        id: link.id,
        year: link.year,
        from: labelOf.get(link.source) ?? stripNodePrefix(link.source),
        direction: link.direction,
        to: labelOf.get(link.target) ?? stripNodePrefix(link.target),
        weight: link.value,
        event: eventTitleFor(link.eventId),
        drawn: drawnIds.has(link.id),
      }));
  }, [drawnIds, eventTitleFor, input.links, input.nodes]);

  const tableColumns = useMemo<DataTableColumn<SankeyTableRow>[]>(
    () => [
      { key: "year", header: "Year", align: "right", numeric: true, render: (row) => String(row.year) },
      { key: "from", header: "From market", render: (row) => row.from },
      {
        key: "direction",
        header: "Direction",
        render: (row) => (row.direction === "bundle" ? "Bundled into" : "Unbundled into"),
      },
      { key: "to", header: "To", render: (row) => row.to },
      { key: "weight", header: "Weight", align: "right", numeric: true, render: (row) => `${row.weight} / 3` },
      { key: "event", header: "Event", render: (row) => row.event },
      {
        key: "drawn",
        header: "In diagram",
        render: (row) => (row.drawn ? "Yes" : `No — ${decadeIdFor(row.year)} is not the shown period`),
      },
    ],
    [],
  );

  const bundleCount = shownInput.links.filter((link) => link.direction === "bundle").length;
  const unbundleCount = shownInput.links.length - bundleCount;

  const legendItems = useMemo<LegendItem[]>(
    () => [
      {
        id: "bundle",
        label: "Bundled into a suite",
        color: directionColor.bundle,
        count: bundleCount,
      },
      {
        id: "unbundle",
        label: "Unbundled into its own market",
        color: directionColor.unbundle,
        dashed: true,
        count: unbundleCount,
      },
    ],
    [bundleCount, unbundleCount],
  );

  const periodLabel = periodId === ALL_PERIODS_ID ? `${fromYear}-${toYear}` : `the ${periodId}`;

  const takeaway = useMemo(() => {
    if (input.links.length === 0) {
      return `No bundling or unbundling move is recorded between ${fromYear} and ${toYear}.`;
    }
    if (shownInput.links.length === 0) {
      return `Nothing is recorded in ${periodLabel}; ${input.links.length} moves sit in the other periods.`;
    }
    const leaning = bundleCount >= unbundleCount ? "toward the suites" : "back out of the suites";
    const scope =
      periodId === ALL_PERIODS_ID
        ? `${shownInput.links.length} moves between ${fromYear} and ${toYear}`
        : `${shownInput.links.length} of ${input.links.length} moves, drawn for ${periodLabel}`;
    return `${scope}, ${bundleCount} bundling and ${unbundleCount} unbundling: the period leans ${leaning}.`;
  }, [
    bundleCount,
    fromYear,
    input.links.length,
    periodId,
    periodLabel,
    shownInput.links.length,
    toYear,
    unbundleCount,
  ]);

  const footnote = useMemo(() => {
    const base = `Ribbon thickness is a modeled 1-3 weight, not a measured share of the market. Solid ribbons bundle a market into a suite; dashed ribbons unbundle one back into a market of its own. ${SPLIT_NOTE}`;
    const hidden = input.links.length - shownInput.links.length;
    if (hidden <= 0) return base;
    return `${base} ${hidden} further flows fall outside ${periodLabel} and are in the table; switch period above to draw them.`;
  }, [input.links.length, periodLabel, shownInput.links.length]);

  const table = (
    <DataTable<SankeyTableRow>
      caption={`Every bundling and unbundling flow between ${fromYear} and ${toYear}, with its direction, weight and source event`}
      columns={tableColumns}
      rows={tableRows}
      getRowKey={(row) => row.id}
      getConfidence={() => ({ confidence: "modeled", note: WEIGHT_NOTE })}
    />
  );

  const toolbar = (
    <div className="flex w-full flex-col gap-3">
      {periods.length > 1 ? (
        <ToggleGroup
          type="single"
          value={periodId}
          onValueChange={handlePeriodChange}
          variant="outline"
          size="sm"
          aria-label="Period drawn in the diagram"
        >
          <ToggleGroupItem value={ALL_PERIODS_ID}>All ({input.links.length})</ToggleGroupItem>
          {periods.map((period) => (
            <ToggleGroupItem key={period.id} value={period.id}>
              {period.label} ({period.count})
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : null}
      <Legend items={legendItems} />
    </div>
  );

  if (input.links.length === 0) {
    return (
      <ChartFrame
        title="Bundling and unbundling"
        takeaway={takeaway}
        source="Every flow is tied to a sourced competitive event."
      >
        <EmptyState
          title="No bundling flows in this window"
          description={`The Atlas records no bundling or unbundling move between ${fromYear} and ${toYear}. Widen the year range to see how markets fold into suites and break back out.`}
        />
      </ChartFrame>
    );
  }

  return (
    <ChartFrame
      key={narrowViewport ? "narrow" : "wide"}
      title="Bundling and unbundling"
      takeaway={takeaway}
      source="Each ribbon is one sourced competitive event; the weight behind its thickness is modeled in this project."
      toolbar={toolbar}
      table={table}
      defaultView={narrowViewport ? "table" : "chart"}
      footnote={footnote}
    >
      <div ref={containerRef} className="relative w-full">
        {layout.links.length === 0 ? (
          <EmptyState
            title="Nothing to draw in this period"
            description="No flow in the selected period resolves to two known markets. Choose another period above, or read every flow in the table."
          />
        ) : (
          <svg
            width={plotWidth}
            height={svgHeight}
            viewBox={`0 0 ${plotWidth} ${svgHeight}`}
            role="group"
            aria-label={`Sankey diagram of ${layout.links.length} bundling and unbundling flows in ${periodLabel}`}
            className="w-full select-none"
            onMouseLeave={() => handleHoverLink(null)}
          >
            <g
              className="fill-muted-foreground font-medium uppercase tracking-wider"
              fontSize={HEADER_FONT}
            >
              {sourceHeader === null ? null : (
                <text x={gutter - LABEL_INSET} y={14} textAnchor="end">
                  {sourceHeader.text}
                </text>
              )}
              {targetHeader === null ? null : (
                <text x={gutter + ribbonWidth + LABEL_INSET} y={14} textAnchor="start">
                  {targetHeader.text}
                </text>
              )}
            </g>

            <g transform={`translate(${gutter}, ${HEADER_HEIGHT})`}>
              {orderedLinks.map((link) => {
                const color = directionColor[link.direction];
                const active = activeLink?.id === link.id;
                const dimmed =
                  typeof highlightedMarketId === "string" &&
                  highlightedMarketId.length > 0 &&
                  highlightedMarketId !== link.sourceEntityId &&
                  highlightedMarketId !== link.targetEntityId;

                return (
                  <path
                    key={link.id}
                    ref={nav.registerMark(link.id)}
                    d={link.path}
                    fill="none"
                    stroke={color}
                    strokeWidth={link.width}
                    strokeOpacity={active ? 0.8 : 0.4}
                    strokeDasharray={link.direction === "unbundle" ? "7 4" : undefined}
                    tabIndex={nav.getTabIndex(link)}
                    role="button"
                    aria-label={describeLink(link)}
                    className={cn(
                      "cursor-pointer outline-none focus-visible:stroke-ring focus-visible:[stroke-opacity:0.9]",
                      { "opacity-25": dimmed },
                    )}
                    onClick={() => handleActivateLink(link)}
                    onKeyDown={(event) => nav.handleKeyDown(event, link)}
                    onFocus={() => {
                      nav.handleFocus(link);
                      handleFocusLink(link);
                    }}
                    onBlur={() => {
                      setFocusedLinkId(null);
                      onHoverMarket?.(null);
                    }}
                    onMouseEnter={() => handleHoverLink(link)}
                  />
                );
              })}

              {layout.nodes.map((node) => {
                const highlighted =
                  typeof highlightedMarketId === "string" &&
                  highlightedMarketId.length > 0 &&
                  highlightedMarketId === node.entityId;
                const isMarket = node.kind === "market";
                const fitted = labelled.has(node.id)
                  ? fitLabel(node.label, labelWidth, labelFont)
                  : null;
                return (
                  <g key={node.id}>
                    <rect
                      x={node.x0}
                      y={node.y0}
                      width={Math.max(2, node.x1 - node.x0)}
                      height={Math.max(3, node.y1 - node.y0)}
                      rx={2}
                      className={cn("fill-foreground", { "fill-muted-foreground": !isMarket })}
                      fillOpacity={highlighted ? 1 : 0.7}
                      onMouseEnter={() => handleHoverMarket(node.nodeId)}
                      onMouseLeave={() => handleHoverMarket(null)}
                    >
                      <title>{node.label}</title>
                    </rect>
                    {fitted === null ? null : (
                      <text
                        x={node.labelOnRight ? node.x1 + LABEL_INSET : node.x0 - LABEL_INSET}
                        y={(node.y0 + node.y1) / 2}
                        dy="0.32em"
                        textAnchor={node.labelOnRight ? "start" : "end"}
                        fontSize={labelFont}
                        className={cn("pointer-events-none fill-foreground", {
                          "font-semibold": highlighted,
                          "fill-muted-foreground": !isMarket,
                        })}
                      >
                        {fitted.text}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        {activeLink ? (
          <AtlasMarkTooltip
            x={gutter + anchorOf(activeLink).x}
            y={HEADER_HEIGHT + anchorOf(activeLink).y}
            containerWidth={plotWidth}
            containerHeight={svgHeight}
            title={`${activeLink.sourceLabel} → ${activeLink.targetLabel}`}
            subtitle={directionLabel[activeLink.direction]}
            year={activeLink.year}
            rows={tooltipRows}
            footnote={TOOLTIP_FOOTNOTE}
            visible
          />
        ) : null}

        <p className="mt-2 min-h-[2.5rem] text-xs text-muted-foreground" aria-live="polite">
          {activeLink
            ? describeLink(activeLink)
            : "Arrow keys move through the ribbons in date order; Enter opens the event behind one."}
        </p>
      </div>
    </ChartFrame>
  );
};
