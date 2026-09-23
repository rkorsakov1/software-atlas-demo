"use client";

import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  activeEventLanes,
  eventPosition,
} from "@/components/charts/primitives/atlasChartMath";
import {
  UPPERCASE_WIDTH_FACTOR,
  fitLabel,
  fitMarkLabel,
} from "@/components/charts/primitives/atlasLabelFit";
import {
  AtlasMarkTooltip,
  type AtlasMarkTooltipRow,
} from "@/components/charts/primitives/AtlasMarkTooltip";
import {
  CLUSTER_BADGE_WIDTH,
  clusterIdByEvent,
  clusterLaneEvents,
  packEraRows,
  pooledClusterCount,
  timelineMarks,
  weightedTimeStops,
  type TimelineCluster,
  type TimelineMark,
} from "@/components/charts/primitives/atlasTimelineMath";
import { Axis, type AxisTick } from "@/components/charts/primitives/Axis";
import { ChartFrame } from "@/components/charts/primitives/ChartFrame";
import { ChartTooltip, type TooltipRow } from "@/components/charts/primitives/ChartTooltip";
import { DataTable, type DataTableColumn } from "@/components/charts/primitives/DataTable";
import { EmptyState } from "@/components/charts/primitives/EmptyState";
import { eventTypeColor, isStructuralBreak } from "@/components/charts/primitives/eventStyles";
import { HatchDefs } from "@/components/charts/primitives/HatchDefs";
import { Legend, type LegendItem } from "@/components/charts/primitives/Legend";
import { isNarrow, useChartSize } from "@/components/charts/primitives/useChartSize";
import { useKeyboardNav } from "@/components/charts/primitives/useKeyboardNav";
import { Button } from "@/components/ui/button";
import type { CompetitiveEvent, Era, EventType } from "@/data/types";
import { cn } from "@/lib/cn";
import { eventTypeLabel, formatDataPoint, formatYearRange } from "@/lib/format";

export type EraTimelineProps = {
  eras: readonly Era[];
  events: readonly CompetitiveEvent[];
  fromYear: number;
  toYear: number;
  focusEventId?: string | null;
  onSelectEvent?: (eventId: string) => void;
  onSelectEra?: (eraId: string) => void;
  sourceTitleFor: (sourceId: string) => string;
  highlightedCompanyId?: string | null;
  onHoverCompany?: (companyId: string | null) => void;
};

const MARGIN = { top: 14, right: 20, bottom: 40, left: 126 };
const NARROW_MARGIN = { top: 14, right: 10, bottom: 40, left: 12 };
/** Height of one era row; concurrent eras stack into as many rows as they need. */
const ERA_ROW_HEIGHT = 26;
const ERA_ROW_GAP = 4;
const ERA_GAP = 16;
const LANE_HEIGHT = 30;
const NARROW_LANE_HEIGHT = 26;
const MAX_LANE_HEIGHT = 44;
/** §10.4: a chart this dense needs at least this much vertical room. */
const MIN_PLOT_HEIGHT = 420;
const DOT_RADIUS = 5;
const NARROW_DOT_RADIUS = 4;
const MAX_ZOOM = 32;
const ZOOM_STEP = 1.6;
const CLIP_ID = "atlas-timeline-clip";

/** §10.2: in-mark labels at 12px, secondary lines and axis labels at 11px. */
const ERA_LABEL_FONT = 12;
const LANE_LABEL_FONT = 11;
const ERA_BADGE_SPACE = 22;
const ERA_LABEL_PADDING = 8;
const BADGE_HEIGHT = 18;
const MAX_TOOLTIP_ROWS = 4;

const ERA_ACCENTS: readonly string[] = [
  "var(--cat-infrastructure)",
  "var(--cat-horizontal)",
  "var(--cat-vertical)",
  "var(--cat-consumer)",
  "var(--cat-emerging)",
];

const eraAccent = (index: number): string =>
  ERA_ACCENTS[index % ERA_ACCENTS.length] ?? "var(--muted-foreground)";

/** The company a timeline event should cross-highlight: the acquirer if there is one. */
const primaryCompanyId = (event: CompetitiveEvent): string | null =>
  event.acquirerId ?? event.companyIds[0] ?? null;

const involvesCompany = (event: CompetitiveEvent, companyId: string): boolean =>
  event.companyIds.includes(companyId) ||
  event.acquirerId === companyId ||
  event.targetId === companyId;

const describeEvent = (event: CompetitiveEvent): string => {
  const deal = event.dealValue ? `, ${formatDataPoint(event.dealValue)}` : "";
  return `${eventTypeLabel[event.type]}, ${event.year}${deal}: ${event.title}`;
};

const clusterSpan = (cluster: TimelineCluster): string =>
  cluster.fromYear === cluster.toYear
    ? `in ${cluster.fromYear}`
    : `between ${cluster.fromYear} and ${cluster.toYear}`;

const describeCluster = (cluster: TimelineCluster, expanded: boolean): string => {
  const action = expanded
    ? "Expanded: arrow keys step through each one, Enter closes the group."
    : "Enter expands them into separate dots; zooming in separates them too.";
  return `${cluster.events.length} ${eventTypeLabel[cluster.type].toLowerCase()} events ${clusterSpan(cluster)}. ${action}`;
};

/** Whole-year ticks only: at high zoom d3 offers fractional years, which read wrong. */
const yearTicks = (
  scale: { ticks: (count?: number) => number[] },
  count: number,
): AxisTick[] => {
  const seen = new Set<number>();
  const ticks: AxisTick[] = [];
  for (const value of scale.ticks(count)) {
    const year = Math.round(value);
    if (seen.has(year)) continue;
    seen.add(year);
    ticks.push({ value: year, label: String(year) });
  }
  return ticks;
};

/**
 * Chart 1. Eras as bands, platform shifts as full-height dashed rules and every
 * other competitive event as a dot in its own type lane. Pan and zoom come from
 * d3-zoom, the only place in the Atlas where d3 touches the DOM; all it produces is
 * a transform in React state, which React then renders.
 *
 * Two legibility rules shape the drawing. Era names are only painted when the band
 * is wide enough for them (§10.1) — otherwise the band carries a number and the key
 * beneath the chart carries the name. Dots that would land on top of each other in
 * the same lane are pooled into a count badge that opens on hover or focus (§10.6).
 */
export const EraTimeline = ({
  eras,
  events,
  fromYear,
  toYear,
  focusEventId,
  onSelectEvent,
  onSelectEra,
  sourceTitleFor,
  highlightedCompanyId,
  onHoverCompany,
}: EraTimelineProps): React.ReactElement => {
  const { ref: containerRef, size } = useChartSize({ initial: { width: 880, height: 420 } });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const focusedMarkRef = useRef<string | null>(null);
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [activeEraId, setActiveEraId] = useState<string | null>(null);

  const narrow = isNarrow(size.width);
  const margin = narrow ? NARROW_MARGIN : MARGIN;
  const dotRadius = narrow ? NARROW_DOT_RADIUS : DOT_RADIUS;
  const innerWidth = Math.max(60, size.width - margin.left - margin.right);

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => eventPosition(a) - eventPosition(b) || a.id.localeCompare(b.id),
      ),
    [events],
  );

  const sortedEras = useMemo(
    () => [...eras].sort((a, b) => a.startYear - b.startYear || a.id.localeCompare(b.id)),
    [eras],
  );

  const lanes = useMemo(() => activeEventLanes(sortedEvents), [sortedEvents]);

  // Pack only the eras that overlap the visible range, clipped to it: an era that
  // ends where the range begins would otherwise claim a row and push a later era
  // above an earlier one.
  const eraRows = useMemo(() => {
    const start = Math.min(fromYear, toYear);
    const end = Math.max(fromYear, toYear) + 1;
    const visible = sortedEras
      .filter((era) => era.startYear < end && (era.endYear ?? Number.POSITIVE_INFINITY) > start)
      .map((era) => ({ id: era.id, startYear: Math.max(era.startYear, start), endYear: era.endYear }));
    return packEraRows(visible);
  }, [fromYear, sortedEras, toYear]);
  const eraRowCount = eraRows.size === 0 ? 1 : Math.max(...eraRows.values()) + 1;
  const eraBandsHeight = eraRowCount * ERA_ROW_HEIGHT + (eraRowCount - 1) * ERA_ROW_GAP;
  const eraRowTop = (eraId: string): number =>
    margin.top + (eraRows.get(eraId) ?? 0) * (ERA_ROW_HEIGHT + ERA_ROW_GAP);

  const lanesTop = margin.top + eraBandsHeight + ERA_GAP;
  const laneHeight = useMemo(() => {
    const base = narrow ? NARROW_LANE_HEIGHT : LANE_HEIGHT;
    const chrome = margin.top + eraBandsHeight + ERA_GAP + margin.bottom;
    const fair = (MIN_PLOT_HEIGHT - chrome) / Math.max(1, lanes.length);
    return Math.round(Math.min(MAX_LANE_HEIGHT, Math.max(base, fair)));
  }, [eraBandsHeight, lanes.length, margin.bottom, margin.top, narrow]);

  const lanesHeight = Math.max(laneHeight, lanes.length * laneHeight);
  const plotBottom = lanesTop + lanesHeight;
  const totalHeight = plotBottom + margin.bottom;

  const domain = useMemo<[number, number]>(() => {
    const start = Math.min(fromYear, toYear);
    const end = Math.max(fromYear, toYear);
    return [start, end + 1];
  }, [fromYear, toYear]);

  const baseScale = useMemo(() => {
    const stops = weightedTimeStops(domain[0], domain[1], innerWidth);
    return scaleLinear().domain(stops.domain).range(stops.range);
  }, [domain, innerWidth]);

  const xScale = useMemo(() => transform.rescaleX(baseScale), [baseScale, transform]);

  const ticks = useMemo(() => yearTicks(xScale, narrow ? 4 : 9), [narrow, xScale]);

  const clusterGap = dotRadius * 2 + 4;
  const memberSpacing = dotRadius * 2 + 5;

  const clusters = useMemo(
    () =>
      clusterLaneEvents(
        sortedEvents,
        (event) => xScale(eventPosition(event)),
        lanes,
        clusterGap,
      ),
    [clusterGap, lanes, sortedEvents, xScale],
  );

  const clusterOf = useMemo(() => clusterIdByEvent(clusters), [clusters]);

  const marks = useMemo(
    () =>
      timelineMarks(clusters, {
        expandedClusterId,
        spacingPx: memberSpacing,
        badgeWidthPx: CLUSTER_BADGE_WIDTH,
        maxX: innerWidth,
      }),
    [clusters, expandedClusterId, innerWidth, memberSpacing],
  );

  const pooledCount = useMemo(() => pooledClusterCount(clusters), [clusters]);

  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;

    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_ZOOM])
      .extent([
        [0, 0],
        [innerWidth, totalHeight],
      ])
      .translateExtent([
        [0, 0],
        [innerWidth, totalHeight],
      ])
      .filter((zoomEvent: WheelEvent | MouseEvent | TouchEvent) => {
        const target = zoomEvent.target;
        // Never start a pan on a mark: that would swallow the click that selects it.
        if (target instanceof Element && target.closest("[data-atlas-mark]")) return false;
        // A plain wheel must keep scrolling the page; zooming needs a modifier.
        if (zoomEvent.type === "wheel") return zoomEvent.ctrlKey || zoomEvent.metaKey;
        if ("button" in zoomEvent) return zoomEvent.button === 0;
        return true;
      })
      .on("zoom", (zoomEvent: { transform: ZoomTransform }) => {
        setTransform(zoomEvent.transform);
      });

    const selection = select(node);
    selection.call(behavior);
    zoomRef.current = behavior;

    return () => {
      selection.on(".zoom", null);
      zoomRef.current = null;
    };
  }, [innerWidth, totalHeight]);

  const applyZoom = useCallback((factor: number): void => {
    const node = svgRef.current;
    const behavior = zoomRef.current;
    if (!node || !behavior) return;
    behavior.scaleBy(select(node), factor);
  }, []);

  const handleZoomIn = useCallback((): void => applyZoom(ZOOM_STEP), [applyZoom]);
  const handleZoomOut = useCallback((): void => applyZoom(1 / ZOOM_STEP), [applyZoom]);

  const handleZoomReset = useCallback((): void => {
    const node = svgRef.current;
    const behavior = zoomRef.current;
    if (!node || !behavior) return;
    behavior.transform(select(node), zoomIdentity);
  }, []);

  const handleActivateMark = useCallback(
    (mark: TimelineMark): void => {
      if (mark.kind === "cluster") {
        setExpandedClusterId((current) => (current === mark.id ? null : mark.id));
        return;
      }
      onSelectEvent?.(mark.event.id);
    },
    [onSelectEvent],
  );

  const handleFocusMark = useCallback(
    (mark: TimelineMark): void => {
      if (mark.kind === "cluster") {
        setHoveredClusterId(mark.id);
        setHoveredEventId(null);
        setExpandedClusterId(mark.id);
        onHoverCompany?.(null);
        return;
      }
      setHoveredClusterId(null);
      setHoveredEventId(mark.event.id);
      setExpandedClusterId(mark.fannedOut ? mark.clusterId : null);
      onHoverCompany?.(primaryCompanyId(mark.event));
    },
    [onHoverCompany],
  );

  const handleSelectEra = useCallback(
    (era: Era): void => {
      onSelectEra?.(era.id);
    },
    [onSelectEra],
  );

  const handleFocusEra = useCallback((era: Era): void => {
    setActiveEraId(era.id);
  }, []);

  const handleBlurMark = useCallback((): void => {
    focusedMarkRef.current = null;
    setHoveredEventId(null);
    setHoveredClusterId(null);
    onHoverCompany?.(null);
  }, [onHoverCompany]);

  /**
   * Leaving the plot with the mouse clears the hover state, but an open cluster
   * stays open while the keyboard is inside it: collapsing it would throw focus
   * back to the document body mid-navigation.
   */
  const handleLeavePlot = useCallback((): void => {
    setHoveredEventId(null);
    setHoveredClusterId(null);
    onHoverCompany?.(null);
    if (focusedMarkRef.current !== null) return;
    setExpandedClusterId(null);
  }, [onHoverCompany]);

  const handleLeaveEra = useCallback((): void => {
    setActiveEraId(null);
  }, []);

  const markNav = useKeyboardNav<TimelineMark>({
    items: marks,
    getId: (mark) => mark.id,
    orientation: "horizontal",
    onActivate: handleActivateMark,
    onFocusChange: handleFocusMark,
  });

  const visibleEras = useMemo(
    () => sortedEras.filter((era) => eraRows.has(era.id)),
    [eraRows, sortedEras],
  );

  const eraNav = useKeyboardNav<Era>({
    items: visibleEras,
    getId: (era) => era.id,
    orientation: "horizontal",
    onActivate: handleSelectEra,
    onFocusChange: handleFocusEra,
  });

  const { setActiveId: setActiveMarkId } = markNav;

  const focusClusterId = focusEventId ? clusterOf.get(focusEventId) ?? null : null;

  /**
   * Selection lives outside this chart (the drawer, the URL, another view), so the
   * roving tab stop is synchronised to it here rather than being owned locally. A
   * selected event whose dot is currently pooled has no mark of its own, so the tab
   * stop goes to the group badge that holds it and the badge is drawn as selected.
   */
  useEffect(() => {
    if (!focusEventId) return;
    const pooled =
      focusClusterId !== null &&
      focusClusterId !== expandedClusterId &&
      marks.some((mark) => mark.kind === "cluster" && mark.id === focusClusterId);
    setActiveMarkId(pooled && focusClusterId ? focusClusterId : focusEventId);
  }, [expandedClusterId, focusClusterId, focusEventId, marks, setActiveMarkId]);

  const hoveredEventMark = useMemo(
    () =>
      marks.find(
        (mark): mark is Extract<TimelineMark, { kind: "event" }> =>
          mark.kind === "event" && mark.id === hoveredEventId,
      ) ?? null,
    [hoveredEventId, marks],
  );

  const hoveredEvent = hoveredEventMark?.event ?? null;

  const hoveredClusterMark = useMemo(
    () =>
      marks.find(
        (mark): mark is Extract<TimelineMark, { kind: "cluster" }> =>
          mark.kind === "cluster" && mark.id === hoveredClusterId,
      ) ?? null,
    [hoveredClusterId, marks],
  );

  const tooltipRows = useMemo<TooltipRow[]>(() => {
    if (!hoveredEvent) return [];
    const sourceId = hoveredEvent.sourceIds[0];
    const source = sourceId ? sourceTitleFor(sourceId) : "No source recorded for this event";
    const deal = hoveredEvent.dealValue;
    if (deal) {
      return [
        {
          label: "Deal value",
          value: deal.value,
          unit: deal.unit,
          confidence: deal.confidence,
          source: sourceTitleFor(deal.sourceId),
          note: deal.note,
          low: deal.low,
          high: deal.high,
          color: eventTypeColor(hoveredEvent.type),
        },
      ];
    }
    return [
      {
        label: "Companies involved",
        value: hoveredEvent.companyIds.length,
        unit: "count",
        confidence: "reported",
        source,
        color: eventTypeColor(hoveredEvent.type),
      },
    ];
  }, [hoveredEvent, sourceTitleFor]);

  const clusterTooltipRows = useMemo<AtlasMarkTooltipRow[]>(() => {
    const cluster = hoveredClusterMark?.cluster;
    if (!cluster) return [];
    return cluster.events.slice(0, MAX_TOOLTIP_ROWS).map((event) => {
      const sourceId = event.sourceIds[0];
      return {
        label: event.title,
        value: String(event.year),
        confidence: event.dealValue?.confidence ?? "reported",
        note: event.dealValue?.note,
        source: sourceId ? sourceTitleFor(sourceId) : undefined,
        color: eventTypeColor(cluster.type),
      };
    });
  }, [hoveredClusterMark, sourceTitleFor]);

  const clusterTooltipFootnote = useMemo(() => {
    const cluster = hoveredClusterMark?.cluster;
    if (!cluster) return "";
    const hidden = cluster.events.length - MAX_TOOLTIP_ROWS;
    const more = hidden > 0 ? ` +${hidden} more in this group.` : "";
    return `${cluster.events.length} events pooled because their dots would overlap at this width.${more} Open the group or view the table for every one.`;
  }, [hoveredClusterMark]);

  const markCentre = useCallback(
    (laneIndex: number): number => lanesTop + laneIndex * laneHeight + laneHeight / 2,
    [laneHeight, lanesTop],
  );

  const eventTooltipPosition = useMemo(() => {
    if (!hoveredEventMark) return { x: 0, y: 0 };
    return {
      x: margin.left + hoveredEventMark.x,
      y: markCentre(hoveredEventMark.laneIndex),
    };
  }, [hoveredEventMark, margin.left, markCentre]);

  const clusterTooltipPosition = useMemo(() => {
    if (!hoveredClusterMark) return { x: 0, y: 0 };
    return {
      x: margin.left + hoveredClusterMark.x,
      y: markCentre(hoveredClusterMark.laneIndex),
    };
  }, [hoveredClusterMark, margin.left, markCentre]);

  const legendItems = useMemo<LegendItem[]>(
    () =>
      lanes.map((type) => ({
        id: type,
        label: eventTypeLabel[type],
        color: eventTypeColor(type),
        dashed: isStructuralBreak(type),
        count: sortedEvents.filter((event) => event.type === type).length,
      })),
    [lanes, sortedEvents],
  );

  const activeEra = useMemo(
    () => sortedEras.find((era) => era.id === activeEraId) ?? null,
    [activeEraId, sortedEras],
  );

  const readout = useMemo(() => {
    if (hoveredEvent) return `${describeEvent(hoveredEvent)}. ${hoveredEvent.impact}`;
    if (hoveredClusterMark) {
      return describeCluster(hoveredClusterMark.cluster, hoveredClusterMark.expanded);
    }
    if (activeEra) {
      const span = formatYearRange(activeEra.startYear, activeEra.endYear);
      return `${activeEra.name} (${span}): ${activeEra.summary}`;
    }
    return "Drag to pan, ctrl or cmd plus scroll to zoom. Arrow keys step through events by year; Enter opens one, or opens a pooled group of them.";
  }, [activeEra, hoveredClusterMark, hoveredEvent]);

  const sourceLine = useMemo(() => {
    const sourceIds = new Set(sortedEvents.flatMap((event) => event.sourceIds));
    if (sourceIds.size === 0) return "Era framing by The Software Atlas; no events in this range.";
    const pooling =
      pooledCount === 0
        ? ""
        : ` ${pooledCount} groups pool dots that would overlap at this width; zoom in or open a group to separate them.`;
    return `${sourceIds.size} sources across ${sortedEvents.length} events, each cited on its own dot and in the table. Era boundaries are the Atlas's framing, not a published series.${pooling}`;
  }, [pooledCount, sortedEvents]);

  const takeaway = useMemo(() => {
    if (sortedEras.length === 0 && sortedEvents.length === 0) {
      return "No eras or events fall inside the selected years.";
    }
    const shifts = sortedEvents.filter((event) => isStructuralBreak(event.type)).length;
    return `${sortedEras.length} eras and ${sortedEvents.length} events between ${fromYear} and ${toYear}; the ${shifts} platform shifts are the breaks where leadership changed hands.`;
  }, [fromYear, sortedEras.length, sortedEvents, toYear]);

  const eventColumns = useMemo<DataTableColumn<CompetitiveEvent>[]>(
    () => [
      { key: "year", header: "Year", render: (event) => event.year, numeric: true, align: "right" },
      { key: "type", header: "Type", render: (event) => eventTypeLabel[event.type] },
      { key: "title", header: "Event", render: (event) => event.title },
      {
        key: "deal",
        header: "Deal value",
        align: "right",
        numeric: true,
        render: (event) => (event.dealValue ? formatDataPoint(event.dealValue) : "—"),
      },
      { key: "impact", header: "Impact", render: (event) => event.impact },
      {
        key: "source",
        header: "Source",
        render: (event) => {
          const sourceId = event.sourceIds[0];
          return sourceId ? sourceTitleFor(sourceId) : "—";
        },
      },
    ],
    [sourceTitleFor],
  );

  const eraColumns = useMemo<DataTableColumn<Era>[]>(
    () => [
      { key: "name", header: "Era", render: (era) => era.name },
      {
        key: "years",
        header: "Years",
        render: (era) => formatYearRange(era.startYear, era.endYear),
      },
      { key: "tech", header: "Enabling technology", render: (era) => era.enablingTech.join(", ") },
      { key: "model", header: "Business model", render: (era) => era.businessModel },
      { key: "summary", header: "Summary", render: (era) => era.summary },
    ],
    [],
  );

  const table = (
    <div className="flex flex-col gap-4">
      <DataTable
        caption={`Eras between ${fromYear} and ${toYear}`}
        columns={eraColumns}
        rows={sortedEras}
        getRowKey={(era) => era.id}
        maxHeight={260}
      />
      <DataTable
        caption={`Competitive events between ${fromYear} and ${toYear}`}
        columns={eventColumns}
        rows={sortedEvents}
        getRowKey={(event) => event.id}
        getConfidence={(event) =>
          event.dealValue
            ? { confidence: event.dealValue.confidence, note: event.dealValue.note }
            : { confidence: "reported", note: "Event date and description taken from its source." }
        }
      />
    </div>
  );

  const toolbar = (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <Legend items={legendItems} className="min-w-0 flex-1" />
      <div className="flex shrink-0 items-center gap-1">
        <Button type="button" variant="outline" size="icon-sm" onClick={handleZoomOut}>
          <Minus aria-hidden="true" />
          <span className="sr-only">Zoom out of the timeline</span>
        </Button>
        <Button type="button" variant="outline" size="icon-sm" onClick={handleZoomIn}>
          <Plus aria-hidden="true" />
          <span className="sr-only">Zoom into the timeline</span>
        </Button>
        <Button type="button" variant="outline" size="icon-sm" onClick={handleZoomReset}>
          <RotateCcw aria-hidden="true" />
          <span className="sr-only">Reset the timeline zoom</span>
        </Button>
      </div>
    </div>
  );

  const isEmpty = sortedEras.length === 0 && sortedEvents.length === 0;

  if (isEmpty) {
    return (
      <ChartFrame
        title="Eras and competitive events"
        takeaway={takeaway}
        source="Era framing by The Software Atlas; no events in this range."
      >
        <EmptyState
          title="Nothing recorded in this range"
          description={`The Atlas holds no eras or competitive events between ${fromYear} and ${toYear}. Widen the year range to see the record.`}
        />
      </ChartFrame>
    );
  }

  const expandedMark = marks.find(
    (mark): mark is Extract<TimelineMark, { kind: "cluster" }> =>
      mark.kind === "cluster" && mark.expanded,
  );
  const overlayMarks = marks.filter((mark) =>
    mark.kind === "cluster" ? mark.expanded : mark.fannedOut,
  );
  const baseMarks = marks.filter((mark) =>
    mark.kind === "cluster" ? !mark.expanded : !mark.fannedOut,
  );

  const renderMark = (mark: TimelineMark): React.ReactElement => {
    const cy = markCentre(mark.laneIndex);
    const highlighted =
      typeof highlightedCompanyId === "string" && highlightedCompanyId.length > 0
        ? highlightedCompanyId
        : null;

    if (mark.kind === "cluster") {
      const { cluster } = mark;
      const color = eventTypeColor(cluster.type);
      const dimmed =
        highlighted !== null &&
        !cluster.events.some((event) => involvesCompany(event, highlighted));
      const holdsSelection =
        typeof focusEventId === "string" &&
        cluster.events.some((event) => event.id === focusEventId);
      return (
        <g key={mark.id} transform={`translate(${mark.x}, ${cy})`}>
          <rect
            ref={markNav.registerMark(mark.id)}
            data-atlas-mark="cluster"
            x={-CLUSTER_BADGE_WIDTH / 2}
            y={-BADGE_HEIGHT / 2}
            width={CLUSTER_BADGE_WIDTH}
            height={BADGE_HEIGHT}
            rx={BADGE_HEIGHT / 2}
            className="cursor-pointer fill-card outline-none focus-visible:stroke-ring focus-visible:[stroke-width:2.5]"
            fillOpacity={dimmed ? 0.4 : 0.98}
            stroke={holdsSelection ? "var(--ring)" : color}
            strokeWidth={holdsSelection || mark.expanded ? 2.4 : 1.4}
            tabIndex={markNav.getTabIndex(mark)}
            role="button"
            aria-expanded={mark.expanded}
            aria-label={
              holdsSelection
                ? `${describeCluster(cluster, mark.expanded)} Contains the selected event.`
                : describeCluster(cluster, mark.expanded)
            }
            onClick={() => handleActivateMark(mark)}
            onKeyDown={(keyEvent) => markNav.handleKeyDown(keyEvent, mark)}
            onFocus={() => {
              focusedMarkRef.current = mark.id;
              markNav.handleFocus(mark);
              handleFocusMark(mark);
            }}
            onBlur={handleBlurMark}
            onMouseEnter={() => handleFocusMark(mark)}
          >
            <title>{describeCluster(cluster, mark.expanded)}</title>
          </rect>
          <text
            aria-hidden="true"
            textAnchor="middle"
            dy="0.34em"
            className="pointer-events-none fill-foreground text-[11px] font-medium tabular-nums"
          >
            {cluster.events.length}
          </text>
        </g>
      );
    }

    const { event } = mark;
    const color = eventTypeColor(event.type);
    const focused = markNav.activeId === event.id;
    const selected = focusEventId === event.id;
    const dimmed = highlighted !== null && !involvesCompany(event, highlighted);
    const radius = isStructuralBreak(event.type) ? dotRadius + 1.5 : dotRadius;

    return (
      <circle
        key={mark.id}
        ref={markNav.registerMark(mark.id)}
        data-atlas-mark="event"
        cx={mark.x}
        cy={cy}
        r={selected || focused ? radius + 2 : radius}
        fill={color}
        fillOpacity={dimmed ? 0.18 : 0.9}
        stroke={selected ? "var(--ring)" : color}
        strokeWidth={selected ? 2.4 : 1}
        strokeDasharray={isStructuralBreak(event.type) ? "3 2" : undefined}
        tabIndex={markNav.getTabIndex(mark)}
        role="button"
        aria-pressed={selected}
        aria-label={describeEvent(event)}
        className="cursor-pointer outline-none focus-visible:stroke-ring focus-visible:[stroke-width:2.5]"
        onClick={() => handleActivateMark(mark)}
        onKeyDown={(keyEvent) => markNav.handleKeyDown(keyEvent, mark)}
        onFocus={() => {
          focusedMarkRef.current = mark.id;
          markNav.handleFocus(mark);
          handleFocusMark(mark);
        }}
        onBlur={handleBlurMark}
        onMouseEnter={() => handleFocusMark(mark)}
      >
        <title>{describeEvent(event)}</title>
      </circle>
    );
  };

  return (
    <ChartFrame
      title="Eras and competitive events"
      takeaway={takeaway}
      source={sourceLine}
      toolbar={toolbar}
      table={table}
      footnote="Platform shifts are drawn as full-height dashed rules because they reset the terms of competition in every lane below them. A numbered band is named in the key beneath the chart."
    >
      <div ref={containerRef} className="relative w-full">
        <p
          aria-live="polite"
          className="mb-2 min-h-[2.5rem] text-pretty text-xs text-muted-foreground"
        >
          {readout}
        </p>

        <svg
          ref={svgRef}
          width={size.width}
          height={totalHeight}
          viewBox={`0 0 ${size.width} ${totalHeight}`}
          role="group"
          aria-label={`Timeline of ${sortedEras.length} eras and ${sortedEvents.length} competitive events from ${fromYear} to ${toYear}`}
          className="w-full touch-pan-y select-none"
        >
          <HatchDefs />
          <clipPath id={CLIP_ID}>
            <rect x={0} y={0} width={innerWidth} height={totalHeight} />
          </clipPath>

          <g transform={`translate(${margin.left}, 0)`}>
            <g clipPath={`url(#${CLIP_ID})`} onMouseLeave={handleLeavePlot}>
              {sortedEras.map((era, index) => {
                if (!eraRows.has(era.id)) return null;
                const start = xScale(Math.max(domain[0], era.startYear));
                const end = xScale(Math.min(domain[1], era.endYear ?? domain[1]));
                const width = Math.max(1, end - start);
                const top = eraRowTop(era.id);
                const accent = eraAccent(index);
                const focused = eraNav.activeId === era.id || activeEraId === era.id;
                const span = formatYearRange(era.startYear, era.endYear);
                // Labels stick to the visible part of the band while panning.
                const visibleStart = Math.max(start, 0);
                const visibleWidth = Math.min(end, innerWidth) - visibleStart;
                const showBadge = visibleWidth >= ERA_BADGE_SPACE + 2;
                const textX = visibleStart + (showBadge ? ERA_BADGE_SPACE : ERA_LABEL_PADDING);
                const available =
                  visibleWidth - (showBadge ? ERA_BADGE_SPACE : ERA_LABEL_PADDING) - ERA_LABEL_PADDING;
                const nameFit = fitMarkLabel(era.name, available, ERA_LABEL_FONT);

                return (
                  <g key={era.id}>
                    <rect
                      ref={eraNav.registerMark(era.id)}
                      data-atlas-mark="era"
                      x={start}
                      y={top}
                      width={width}
                      height={ERA_ROW_HEIGHT}
                      rx={4}
                      fill={focused ? accent : "var(--muted)"}
                      fillOpacity={focused ? 0.18 : 1}
                      stroke={focused ? accent : "var(--border)"}
                      strokeWidth={1}
                      tabIndex={eraNav.getTabIndex(era)}
                      role="button"
                      aria-label={`Era ${index + 1}, ${era.name}, ${span}. ${era.summary}`}
                      className="cursor-pointer outline-none focus-visible:stroke-ring focus-visible:[stroke-width:2.5]"
                      onClick={() => handleSelectEra(era)}
                      onKeyDown={(keyEvent) => eraNav.handleKeyDown(keyEvent, era)}
                      onFocus={() => {
                        eraNav.handleFocus(era);
                        handleFocusEra(era);
                      }}
                      onBlur={handleLeaveEra}
                      onMouseEnter={() => handleFocusEra(era)}
                      onMouseLeave={handleLeaveEra}
                    >
                      <title>{`${era.name} (${span})`}</title>
                    </rect>

                    <rect
                      aria-hidden="true"
                      x={visibleStart}
                      y={top}
                      width={Math.min(3, Math.max(0, visibleWidth))}
                      height={ERA_ROW_HEIGHT}
                      fill={accent}
                      className="pointer-events-none"
                    />

                    {showBadge ? (
                      <text
                        aria-hidden="true"
                        x={visibleStart + ERA_BADGE_SPACE / 2}
                        y={top + ERA_ROW_HEIGHT / 2}
                        dy="0.34em"
                        textAnchor="middle"
                        className="pointer-events-none fill-muted-foreground font-mono text-[11px] font-semibold tabular-nums"
                      >
                        {index + 1}
                      </text>
                    ) : null}

                    {nameFit ? (
                      <text
                        aria-hidden="true"
                        x={textX}
                        y={top + ERA_ROW_HEIGHT / 2}
                        dy="0.34em"
                        className="pointer-events-none fill-foreground text-[12px] font-medium"
                      >
                        {nameFit.text}
                      </text>
                    ) : null}
                  </g>
                );
              })}

              {sortedEvents.map((event) => {
                if (!isStructuralBreak(event.type)) return null;
                const x = xScale(eventPosition(event));
                return (
                  <line
                    key={`shift-${event.id}`}
                    aria-hidden="true"
                    x1={x}
                    x2={x}
                    y1={lanesTop - ERA_GAP / 2}
                    y2={plotBottom}
                    stroke={eventTypeColor(event.type)}
                    strokeWidth={1.4}
                    strokeDasharray="5 3"
                    opacity={0.6}
                  />
                );
              })}

              {lanes.map((type: EventType, index: number) => (
                <line
                  key={`lane-${type}`}
                  aria-hidden="true"
                  x1={0}
                  x2={innerWidth}
                  y1={markCentre(index)}
                  y2={markCentre(index)}
                  className="stroke-rule"
                  strokeWidth={1}
                  opacity={0.4}
                />
              ))}

              {baseMarks.map(renderMark)}

              {expandedMark ? (
                <rect
                  aria-hidden="true"
                  x={expandedMark.trayX0}
                  y={markCentre(expandedMark.laneIndex) - laneHeight / 2 + 3}
                  width={Math.max(0, expandedMark.trayX1 - expandedMark.trayX0)}
                  height={Math.max(BADGE_HEIGHT + 4, laneHeight - 6)}
                  rx={8}
                  className="fill-card stroke-rule"
                  fillOpacity={0.97}
                  strokeWidth={1}
                />
              ) : null}

              {overlayMarks.map(renderMark)}
            </g>

            <g transform={`translate(0, ${plotBottom + 6})`}>
              <Axis
                orientation="bottom"
                ticks={ticks}
                scale={(value) => xScale(value)}
                length={innerWidth}
              />
            </g>
          </g>

          {narrow
            ? null
            : lanes.map((type: EventType, index: number) => {
                const label = fitLabel(
                  eventTypeLabel[type],
                  margin.left - 16,
                  // Uppercase and letter-spaced: measure it at a wider effective size.
                  LANE_LABEL_FONT * UPPERCASE_WIDTH_FACTOR,
                );
                if (!label) return null;
                return (
                  <text
                    key={`lane-label-${type}`}
                    x={margin.left - 10}
                    y={markCentre(index)}
                    dy="0.34em"
                    textAnchor="end"
                    className="fill-muted-foreground text-[11px] uppercase tracking-wide"
                  >
                    {label.text}
                    <title>{label.full}</title>
                  </text>
                );
              })}
        </svg>

        <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {sortedEras.map((era, index) => (
            <li
              key={`key-${era.id}`}
              className={cn("flex items-baseline gap-1.5", {
                "text-foreground": activeEraId === era.id,
              })}
            >
              <span
                className="font-mono font-semibold tabular-nums"
                style={{ color: eraAccent(index) }}
              >
                {index + 1}
              </span>
              <span>{era.name}</span>
              <span className="font-mono text-[11px] tabular-nums">
                {formatYearRange(era.startYear, era.endYear)}
              </span>
            </li>
          ))}
        </ol>

        <ChartTooltip
          x={eventTooltipPosition.x}
          y={eventTooltipPosition.y}
          containerWidth={size.width}
          containerHeight={totalHeight}
          title={hoveredEvent?.title ?? ""}
          year={hoveredEvent?.year ?? fromYear}
          rows={tooltipRows}
          footnote={hoveredEvent?.impact}
          visible={hoveredEvent !== null}
        />

        <AtlasMarkTooltip
          x={clusterTooltipPosition.x}
          y={clusterTooltipPosition.y}
          containerWidth={size.width}
          containerHeight={totalHeight}
          title={
            hoveredClusterMark
              ? `${hoveredClusterMark.cluster.events.length} ${eventTypeLabel[hoveredClusterMark.cluster.type].toLowerCase()} events`
              : ""
          }
          subtitle={hoveredClusterMark ? clusterSpan(hoveredClusterMark.cluster) : undefined}
          rows={clusterTooltipRows}
          footnote={clusterTooltipFootnote}
          visible={hoveredClusterMark !== null}
        />
      </div>
    </ChartFrame>
  );
};
