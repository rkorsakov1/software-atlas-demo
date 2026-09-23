"use client";

import { useCallback, useId, useMemo, useState } from "react";

import { AtlasMarkTooltip, type AtlasMarkTooltipRow } from "@/components/charts/primitives/AtlasMarkTooltip";
import {
  DEFAULT_LINEAGE_TICKS,
  computeLineageLayout,
  type LineageLayoutEdge,
  type LineageLayoutNode,
} from "@/components/charts/primitives/atlasForceLayout";
import {
  placedLabelsById,
  type OutsideLabelMark,
  type PlacedLabel,
} from "@/components/charts/primitives/atlasLabelPlacement";
import { ChartFrame } from "@/components/charts/primitives/ChartFrame";
import { DataTable, type DataTableColumn } from "@/components/charts/primitives/DataTable";
import { EmptyState } from "@/components/charts/primitives/EmptyState";
import { Legend, type LegendItem } from "@/components/charts/primitives/Legend";
import { eventTypeColor } from "@/components/charts/primitives/eventStyles";
import { isNarrow, useChartSize } from "@/components/charts/primitives/useChartSize";
import { useKeyboardNav } from "@/components/charts/primitives/useKeyboardNav";
import { useNarrowViewport } from "@/components/charts/primitives/useNarrowViewport";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/cn";
import { archetypeLabel, formatUsdBillions } from "@/lib/format";
import { ARCHETYPE_ORDER, archetypeColor } from "@/lib/scales";
import { neighborIds, type LineageGraphData } from "@/lib/selectors";

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
  /**
   * Part of the frozen signature in docs/CONTRACTS.md §3. `LineageLink` carries no
   * `sourceId`, so this chart has no id to resolve and never calls it: an edge
   * cites its deal through the event it opens, not through an invented source.
   */
  sourceTitleFor: (sourceId: string) => string;
  highlightedCompanyId?: string | null;
  onHoverCompany?: (companyId: string | null) => void;
};

const EARLIEST_YEAR = 1975;
const DEAL_THRESHOLDS: readonly number[] = [0, 0.5, 1, 2.5, 5, 10, 25];
const LABEL_DEGREE_FLOOR = 3;
/** §10.4: the floor for a force layout, applied to the hook and to the drawn SVG. */
const MIN_PLOT_HEIGHT = 520;
const LABEL_FONT_PX = 11;
const LABEL_GAP_PX = 8;
const LABEL_OFFSET_PX = 4;

const TOOLTIP_FOOTNOTE_NODE =
  "Node area is the number of deals this company is on either side of. Position comes from a force layout and carries no meaning on its own.";

const TOOLTIP_FOOTNOTE_EDGE =
  "The arrow runs from acquirer to target. Deal values are as announced in the event record; undisclosed deals are drawn at the thinnest stroke. Open the event for its sources.";

type LineageTableRow = {
  id: string;
  year: number;
  acquirer: string;
  target: string;
  type: "acquisition" | "spin-off";
  dealValue: string;
  event: string;
};

const edgeColor = (type: "acquisition" | "spin-off"): string =>
  type === "spin-off" ? eventTypeColor("spin-off") : eventTypeColor("acquisition");

const thresholdIndex = (value: number): number => {
  const exact = DEAL_THRESHOLDS.indexOf(value);
  if (exact !== -1) return exact;
  let index = 0;
  for (let position = 0; position < DEAL_THRESHOLDS.length; position += 1) {
    const threshold = DEAL_THRESHOLDS[position];
    if (threshold !== undefined && threshold <= value) index = position;
  }
  return index;
};

const thresholdLabel = (value: number): string =>
  value <= 0 ? "every deal, disclosed or not" : `${formatUsdBillions(value)} and above`;

/**
 * Chart 5. Acquirer-to-target lineage for acquisitions and spin-offs.
 *
 * The force simulation is stepped to rest inside a `useMemo` and rendered as
 * static geometry — never animated per tick (CLAUDE.md §6) — and it runs from a
 * seeded random source, so the same graph settles into the same picture on every
 * render and the reader can re-find a company after changing a filter.
 */
export const LineageGraph = (props: LineageGraphProps): React.ReactElement => {
  const {
    graph,
    filters,
    onFiltersChange,
    focusCompanyId,
    onSelectCompany,
    onSelectEvent,
    eventTitleFor,
    highlightedCompanyId,
    onHoverCompany,
  } = props;

  const { ref: containerRef, size } = useChartSize({
    initial: { width: 820, height: 520 },
    aspectRatio: 1.55,
    // §10.4: a force layout needs 520px before its nodes stop sitting on each
    // other. Narrower containers than that open on the table, not on a squeeze.
    minHeight: MIN_PLOT_HEIGHT,
    maxHeight: 620,
  });
  const narrowViewport = useNarrowViewport();
  const markerPrefix = useId();
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const narrow = isNarrow(size.width);
  const plotWidth = Math.max(240, size.width);
  const plotHeight = Math.max(MIN_PLOT_HEIGHT, size.height);

  const layout = useMemo(
    () =>
      computeLineageLayout(graph, {
        width: plotWidth,
        height: plotHeight,
        ticks: DEFAULT_LINEAGE_TICKS,
        padding: narrow ? 16 : 28,
      }),
    [graph, narrow, plotHeight, plotWidth],
  );

  const nodesByDegree = useMemo(
    () => [...layout.nodes].sort((a, b) => b.degree - a.degree || a.name.localeCompare(b.name)),
    [layout.nodes],
  );

  const orderedEdges = useMemo(
    () => [...layout.edges].sort((a, b) => a.year - b.year || a.id.localeCompare(b.id)),
    [layout.edges],
  );

  const nodeById = useMemo(
    () => new Map(layout.nodes.map((node) => [node.id, node])),
    [layout.nodes],
  );

  const edgeById = useMemo(
    () => new Map(layout.edges.map((edge) => [edge.id, edge])),
    [layout.edges],
  );

  const focusId = focusCompanyId ?? hoveredNodeId ?? null;

  const neighborhood = useMemo(() => {
    if (!focusId) return null;
    if (!nodeById.has(focusId)) return null;
    return neighborIds(graph, focusId);
  }, [focusId, graph, nodeById]);

  /**
   * §10.1 on top of the degree cap: the nodes worth naming are the well-connected
   * ones plus whatever is focused or cross-highlighted, and each caption is then
   * fitted to the room it actually has between its neighbours. A name that cannot
   * be truncated into that room is not drawn — it is still in the node's
   * `<title>`, its `aria-label`, the tooltip and the table.
   */
  const labelsById = useMemo<Map<string, PlacedLabel>>(() => {
    if (narrow) return new Map<string, PlacedLabel>();
    const isPriority = (node: LineageLayoutNode): boolean =>
      node.id === focusId || node.id === highlightedCompanyId;
    const candidates = nodesByDegree.filter(
      (node) => node.degree >= LABEL_DEGREE_FLOOR || isPriority(node),
    );
    const marks: OutsideLabelMark[] = [...candidates]
      .sort((a, b) => Number(isPriority(b)) - Number(isPriority(a)))
      .map((node) => ({
        id: node.id,
        text: node.name,
        x: node.x,
        y: node.y,
        radius: node.radius,
      }));
    return placedLabelsById(marks, {
      plotWidth,
      plotHeight,
      fontPx: LABEL_FONT_PX,
      gapPx: LABEL_GAP_PX,
      offsetPx: LABEL_OFFSET_PX,
    });
  }, [focusId, highlightedCompanyId, narrow, nodesByDegree, plotHeight, plotWidth]);

  const handleHoverCompany = useCallback(
    (companyId: string | null): void => {
      setHoveredNodeId(companyId);
      onHoverCompany?.(companyId);
    },
    [onHoverCompany],
  );

  const handleActivateNode = useCallback(
    (node: LineageLayoutNode): void => {
      onSelectCompany?.(node.id);
    },
    [onSelectCompany],
  );

  const handleActivateEdge = useCallback(
    (edge: LineageLayoutEdge): void => {
      onSelectEvent?.(edge.eventId);
    },
    [onSelectEvent],
  );

  const nodeNav = useKeyboardNav<LineageLayoutNode>({
    items: nodesByDegree,
    getId: (node) => node.id,
    orientation: "horizontal",
    onActivate: handleActivateNode,
    onFocusChange: (node) => handleHoverCompany(node.id),
  });

  const edgeNav = useKeyboardNav<LineageLayoutEdge>({
    items: orderedEdges,
    getId: (edge) => edge.id,
    orientation: "vertical",
    onActivate: handleActivateEdge,
    onFocusChange: (edge) => setHoveredEdgeId(edge.id),
  });

  const describeNode = useCallback(
    (node: LineageLayoutNode): string =>
      `${node.name}, ${archetypeLabel[node.archetype]}, founded ${node.founded}: ${node.acquisitions} acquisitions made, acquired or spun off ${node.timesAcquired} times, in the ${filters.fromYear}–${filters.toYear} window.`,
    [filters.fromYear, filters.toYear],
  );

  const describeEdge = useCallback(
    (edge: LineageLayoutEdge): string => {
      const acquirer = nodeById.get(edge.source)?.name ?? edge.source;
      const target = nodeById.get(edge.target)?.name ?? edge.target;
      const value =
        edge.dealValueUsdB === null
          ? "value not disclosed"
          : `${formatUsdBillions(edge.dealValueUsdB)} as announced`;
      const verb = edge.type === "spin-off" ? "spun off" : "acquired";
      return `${edge.year}: ${acquirer} ${verb} ${target}, ${value}. ${eventTitleFor(edge.eventId)}`;
    },
    [eventTitleFor, nodeById],
  );

  const activeNode = useMemo(() => {
    if (!hoveredNodeId) return null;
    return nodeById.get(hoveredNodeId) ?? null;
  }, [hoveredNodeId, nodeById]);

  const activeEdge = useMemo(() => {
    if (!hoveredEdgeId) return null;
    return edgeById.get(hoveredEdgeId) ?? null;
  }, [edgeById, hoveredEdgeId]);

  const nodeTooltipRows = useMemo<AtlasMarkTooltipRow[]>(() => {
    if (!activeNode) return [];
    return [
      {
        label: "Deals made",
        value: String(activeNode.acquisitions),
        color: archetypeColor(activeNode.archetype),
      },
      { label: "Acquired or spun off", value: String(activeNode.timesAcquired) },
      { label: "Founded", value: String(activeNode.founded) },
    ];
  }, [activeNode]);

  const edgeTooltipRows = useMemo<AtlasMarkTooltipRow[]>(() => {
    if (!activeEdge) return [];
    return [
      {
        label: activeEdge.type === "spin-off" ? "Spin-off" : "Acquisition",
        value:
          activeEdge.dealValueUsdB === null
            ? "Not disclosed"
            : formatUsdBillions(activeEdge.dealValueUsdB),
        confidence: activeEdge.dealValueUsdB === null ? undefined : "reported",
        detail: eventTitleFor(activeEdge.eventId),
        color: edgeColor(activeEdge.type),
      },
    ];
  }, [activeEdge, eventTitleFor]);

  const archetypesPresent = useMemo(
    () =>
      ARCHETYPE_ORDER.filter((archetype) =>
        layout.nodes.some((node) => node.archetype === archetype),
      ),
    [layout.nodes],
  );

  const legendItems = useMemo<LegendItem[]>(
    () => [
      ...archetypesPresent.map((archetype) => ({
        id: archetype,
        label: archetypeLabel[archetype],
        color: archetypeColor(archetype),
        count: layout.nodes.filter((node) => node.archetype === archetype).length,
      })),
    ],
    [archetypesPresent, layout.nodes],
  );

  const edgeLegendItems = useMemo<LegendItem[]>(
    () => [
      {
        id: "acquisition",
        label: "Acquisition",
        color: edgeColor("acquisition"),
        count: layout.edges.filter((edge) => edge.type === "acquisition").length,
      },
      {
        id: "spin-off",
        label: "Spin-off",
        color: edgeColor("spin-off"),
        dashed: true,
        count: layout.edges.filter((edge) => edge.type === "spin-off").length,
      },
    ],
    [layout.edges],
  );

  const tableRows = useMemo<LineageTableRow[]>(
    () =>
      orderedEdges.map((edge) => ({
        id: edge.id,
        year: edge.year,
        acquirer: nodeById.get(edge.source)?.name ?? edge.source,
        target: nodeById.get(edge.target)?.name ?? edge.target,
        type: edge.type,
        dealValue:
          edge.dealValueUsdB === null ? "Not disclosed" : formatUsdBillions(edge.dealValueUsdB),
        event: eventTitleFor(edge.eventId),
      })),
    [eventTitleFor, nodeById, orderedEdges],
  );

  const tableColumns = useMemo<DataTableColumn<LineageTableRow>[]>(
    () => [
      { key: "year", header: "Year", align: "right", numeric: true, render: (row) => String(row.year) },
      { key: "acquirer", header: "Acquirer", render: (row) => row.acquirer },
      { key: "target", header: "Target", render: (row) => row.target },
      {
        key: "type",
        header: "Type",
        render: (row) => (row.type === "spin-off" ? "Spin-off" : "Acquisition"),
      },
      {
        key: "dealValue",
        header: "Deal value",
        align: "right",
        numeric: true,
        render: (row) => row.dealValue,
      },
      { key: "event", header: "Event", render: (row) => row.event },
    ],
    [],
  );

  const yearBounds = useMemo<[number, number]>(() => {
    const years = graph.links.map((link) => link.year);
    const low = Math.min(EARLIEST_YEAR, filters.fromYear, ...years);
    const high = Math.max(filters.toYear, ...years);
    return [low, Math.max(high, low + 1)];
  }, [filters.fromYear, filters.toYear, graph.links]);

  const handleYearRangeChange = useCallback(
    (values: number[]): void => {
      const [low, high] = values;
      if (low === undefined || high === undefined) return;
      onFiltersChange?.({
        ...filters,
        fromYear: Math.round(Math.min(low, high)),
        toYear: Math.round(Math.max(low, high)),
      });
    },
    [filters, onFiltersChange],
  );

  const handleDealThresholdChange = useCallback(
    (values: number[]): void => {
      const index = values[0];
      if (index === undefined) return;
      const threshold = DEAL_THRESHOLDS[Math.round(index)];
      if (threshold === undefined) return;
      onFiltersChange?.({ ...filters, minDealValueUsdB: threshold });
    },
    [filters, onFiltersChange],
  );

  const takeaway = useMemo(() => {
    if (layout.edges.length === 0) {
      return `No acquisition or spin-off between ${filters.fromYear} and ${filters.toYear} clears the ${thresholdLabel(filters.minDealValueUsdB)} threshold.`;
    }
    const busiest = nodesByDegree[0];
    const busiestText = busiest
      ? `${busiest.name} sits at the centre of ${busiest.degree} of them`
      : "no single acquirer dominates";
    return `${layout.edges.length} deals between ${filters.fromYear} and ${filters.toYear} link ${layout.nodes.length} companies; ${busiestText}.`;
  }, [filters.fromYear, filters.minDealValueUsdB, filters.toYear, layout.edges.length, layout.nodes.length, nodesByDegree]);

  const footnote = useMemo(() => {
    const base =
      "Arrows run from acquirer to target; dashed arrows are spin-offs. Node area is the number of deals a company is on either side of, and stroke width is the announced deal value. Position is a force layout and means nothing on its own.";
    if (layout.undisclosedCount === 0) return base;
    return `${base} ${layout.undisclosedCount} deals have no disclosed value and are drawn at the thinnest stroke rather than given an estimated one.`;
  }, [layout.undisclosedCount]);

  const liveMessage = ((): string => {
    if (activeEdge) return describeEdge(activeEdge);
    if (activeNode) return describeNode(activeNode);
    return "Tab reaches the companies, then the deals. Arrow keys move within each group, Enter opens the company or the deal; focusing a company dims everything more than one deal away.";
  })();

  const toolbar = (
    <div className="flex w-full flex-col gap-3">
      {onFiltersChange === undefined ? null : (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div
            role="group"
            aria-label={`Deal years: ${filters.fromYear} to ${filters.toYear}`}
            className="flex min-w-[240px] flex-1 items-center gap-3"
          >
            <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Years
            </span>
            <Slider
              min={yearBounds[0]}
              max={yearBounds[1]}
              step={1}
              value={[filters.fromYear, filters.toYear]}
              onValueChange={handleYearRangeChange}
              aria-label={`Deal years: ${filters.fromYear} to ${filters.toYear}`}
              className="min-w-[120px] flex-1"
            />
            <span className="w-24 shrink-0 font-mono text-sm tabular-nums">
              {filters.fromYear}–{filters.toYear}
            </span>
          </div>

          <div
            role="group"
            aria-label={`Minimum deal value: ${thresholdLabel(filters.minDealValueUsdB)}`}
            className="flex min-w-[240px] flex-1 items-center gap-3"
          >
            <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Min deal
            </span>
            <Slider
              min={0}
              max={DEAL_THRESHOLDS.length - 1}
              step={1}
              value={[thresholdIndex(filters.minDealValueUsdB)]}
              onValueChange={handleDealThresholdChange}
              aria-label={`Minimum deal value: ${thresholdLabel(filters.minDealValueUsdB)}`}
              className="min-w-[100px] flex-1"
            />
            <span className="w-28 shrink-0 font-mono text-sm tabular-nums">
              {filters.minDealValueUsdB <= 0 ? "All" : formatUsdBillions(filters.minDealValueUsdB)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-start gap-x-8 gap-y-2">
        <Legend items={legendItems} title="Archetype" />
        <Legend items={edgeLegendItems} title="Edge" />
      </div>
    </div>
  );

  const table = (
    <DataTable<LineageTableRow>
      caption={`Every acquisition and spin-off between ${filters.fromYear} and ${filters.toYear} above ${thresholdLabel(filters.minDealValueUsdB)}`}
      columns={tableColumns}
      rows={tableRows}
      getRowKey={(row) => row.id}
    />
  );

  if (layout.nodes.length === 0) {
    return (
      <ChartFrame
        title="Who bought whom"
        takeaway={takeaway}
        source="Every edge is one sourced acquisition or spin-off event."
        toolbar={toolbar}
      >
        <EmptyState
          title="No deals match these filters"
          description={`Nothing between ${filters.fromYear} and ${filters.toYear} clears ${thresholdLabel(filters.minDealValueUsdB)}. Widen the years or lower the minimum deal value — most acquisitions in the Atlas have no disclosed price, and a minimum above zero excludes all of them.`}
        />
      </ChartFrame>
    );
  }

  return (
    <ChartFrame
      key={narrowViewport ? "narrow" : "wide"}
      title="Who bought whom"
      takeaway={takeaway}
      source="Every edge is one sourced acquisition or spin-off event; deal values are as announced."
      toolbar={toolbar}
      table={table}
      defaultView={narrowViewport ? "table" : "chart"}
      footnote={footnote}
    >
      <div ref={containerRef} className="relative w-full">
        <svg
          width={plotWidth}
          height={plotHeight}
          viewBox={`0 0 ${plotWidth} ${plotHeight}`}
          role="group"
          aria-label={`Lineage graph of ${layout.edges.length} deals between ${layout.nodes.length} companies, ${filters.fromYear} to ${filters.toYear}`}
          className="w-full select-none"
          onMouseLeave={() => {
            handleHoverCompany(null);
            setHoveredEdgeId(null);
          }}
        >
          <defs>
            <marker
              id={`${markerPrefix}-acquisition`}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L8 4 L0 8 z" fill={edgeColor("acquisition")} />
            </marker>
            <marker
              id={`${markerPrefix}-spin-off`}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L8 4 L0 8 z" fill={edgeColor("spin-off")} />
            </marker>
          </defs>

          <g>
            {orderedEdges.map((edge) => {
              const color = edgeColor(edge.type);
              const active = activeEdge?.id === edge.id;
              const outside =
                neighborhood !== null &&
                !(neighborhood.has(edge.source) && neighborhood.has(edge.target));

              return (
                <line
                  key={edge.id}
                  ref={edgeNav.registerMark(edge.id)}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke={color}
                  strokeWidth={active ? edge.strokeWidth + 1.2 : edge.strokeWidth}
                  strokeOpacity={active ? 0.95 : 0.55}
                  strokeDasharray={edge.type === "spin-off" ? "6 3" : undefined}
                  markerEnd={`url(#${markerPrefix}-${edge.type})`}
                  tabIndex={edgeNav.getTabIndex(edge)}
                  role="button"
                  aria-label={describeEdge(edge)}
                  className={cn("cursor-pointer outline-none focus-visible:stroke-ring", {
                    "opacity-15": outside,
                  })}
                  onClick={() => handleActivateEdge(edge)}
                  onKeyDown={(event) => edgeNav.handleKeyDown(event, edge)}
                  onFocus={() => {
                    edgeNav.handleFocus(edge);
                    setHoveredEdgeId(edge.id);
                  }}
                  onBlur={() => setHoveredEdgeId(null)}
                  onMouseEnter={() => setHoveredEdgeId(edge.id)}
                  onMouseLeave={() => setHoveredEdgeId(null)}
                />
              );
            })}
          </g>

          <g>
            {nodesByDegree.map((node) => {
              const color = archetypeColor(node.archetype);
              const outside = neighborhood !== null && !neighborhood.has(node.id);
              const isFocus = focusId === node.id;
              const crossHighlighted = highlightedCompanyId === node.id;
              const label = labelsById.get(node.id);

              return (
                <g key={node.id}>
                  {isFocus || crossHighlighted ? (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + 4}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      strokeOpacity={0.6}
                      aria-hidden="true"
                    />
                  ) : null}
                  <circle
                    ref={nodeNav.registerMark(node.id)}
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={color}
                    fillOpacity={0.85}
                    stroke={color}
                    strokeWidth={1}
                    tabIndex={nodeNav.getTabIndex(node)}
                    role="button"
                    aria-label={describeNode(node)}
                    className={cn(
                      "cursor-pointer outline-none focus-visible:stroke-ring focus-visible:[stroke-width:3]",
                      { "opacity-20": outside },
                    )}
                    onClick={() => handleActivateNode(node)}
                    onKeyDown={(event) => nodeNav.handleKeyDown(event, node)}
                    onFocus={() => {
                      nodeNav.handleFocus(node);
                      handleHoverCompany(node.id);
                    }}
                    onBlur={() => handleHoverCompany(null)}
                    onMouseEnter={() => handleHoverCompany(node.id)}
                  >
                  </circle>
                  {label ? (
                    <text
                      aria-hidden="true"
                      x={label.x}
                      y={label.y}
                      textAnchor="middle"
                      stroke="var(--background)"
                      strokeWidth={3}
                      paintOrder="stroke"
                      className={cn("pointer-events-none fill-foreground text-[11px] font-medium", {
                        "opacity-25": outside,
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

        {activeEdge ? (
          <AtlasMarkTooltip
            x={(activeEdge.x1 + activeEdge.x2) / 2}
            y={(activeEdge.y1 + activeEdge.y2) / 2}
            containerWidth={plotWidth}
            containerHeight={plotHeight}
            title={`${nodeById.get(activeEdge.source)?.name ?? activeEdge.source} → ${nodeById.get(activeEdge.target)?.name ?? activeEdge.target}`}
            year={activeEdge.year}
            rows={edgeTooltipRows}
            footnote={TOOLTIP_FOOTNOTE_EDGE}
            visible
          />
        ) : null}

        {activeNode && !activeEdge ? (
          <AtlasMarkTooltip
            x={activeNode.x}
            y={activeNode.y}
            containerWidth={plotWidth}
            containerHeight={plotHeight}
            title={activeNode.name}
            subtitle={`${archetypeLabel[activeNode.archetype]} · founded ${activeNode.founded}`}
            rows={nodeTooltipRows}
            footnote={TOOLTIP_FOOTNOTE_NODE}
            visible
          />
        ) : null}

        <p className="mt-2 min-h-[2.5rem] text-xs text-muted-foreground" aria-live="polite">
          {liveMessage}
        </p>
      </div>
    </ChartFrame>
  );
};
