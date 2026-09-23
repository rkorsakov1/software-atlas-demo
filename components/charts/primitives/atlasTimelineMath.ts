import type { CompetitiveEvent, EventType } from "@/data/types";

/**
 * Density maths for the era timeline.
 *
 * A hundred-odd events across eleven lanes cannot be drawn as a hundred-odd dots
 * at the default width: in the 2010s the dots sit on top of each other and the
 * chart stops being readable, which `docs/CONTRACTS.md` §10.6 forbids. Events that
 * land within a dot's width of each other in the same lane are therefore pooled
 * into one count badge, and the badge fans its members out when it is hovered or
 * focused. Everything here is pure geometry so the behaviour is unit-testable.
 */

export type TimelineCluster = {
  /** Stable across renders for a given lane and leading event. */
  id: string;
  type: EventType;
  laneIndex: number;
  /** Centre of the pooled dots, in plot pixels. */
  x: number;
  events: CompetitiveEvent[];
  fromYear: number;
  toYear: number;
};

export type TimelineMark =
  | {
      kind: "cluster";
      id: string;
      laneIndex: number;
      x: number;
      cluster: TimelineCluster;
      expanded: boolean;
      trayX0: number;
      trayX1: number;
    }
  | {
      kind: "event";
      id: string;
      laneIndex: number;
      x: number;
      event: CompetitiveEvent;
      clusterId: string;
      /** True while the mark is only on screen because its cluster is open. */
      fannedOut: boolean;
    };

export type ExpandedClusterLayout = {
  badgeX: number;
  trayX0: number;
  trayX1: number;
  points: { event: CompetitiveEvent; x: number }[];
};

export type TimelineMarksOptions = {
  expandedClusterId: string | null;
  spacingPx: number;
  badgeWidthPx: number;
  /** Plot width, used to keep an opened cluster inside the chart. */
  maxX: number;
};

/** Two dots closer than this in the same lane are indistinguishable. */
export const CLUSTER_MIN_GAP_PX = 14;

/** Horizontal step between the dots of an opened cluster. */
export const CLUSTER_MEMBER_SPACING_PX = 15;

/** Width reserved for the count badge at the head of an opened cluster. */
export const CLUSTER_BADGE_WIDTH = 26;

const TRAY_PADDING = 5;

/**
 * Pools each lane's events into clusters of dots that would otherwise overlap.
 * A cluster of one is still a cluster, so callers have a single code path.
 */
export const clusterLaneEvents = (
  events: readonly CompetitiveEvent[],
  xOf: (event: CompetitiveEvent) => number,
  lanes: readonly EventType[],
  minGapPx: number = CLUSTER_MIN_GAP_PX,
): TimelineCluster[] => {
  const byLane = new Map<EventType, CompetitiveEvent[]>();
  for (const event of events) {
    const bucket = byLane.get(event.type);
    if (bucket) {
      bucket.push(event);
      continue;
    }
    byLane.set(event.type, [event]);
  }

  const clusters: TimelineCluster[] = [];

  lanes.forEach((type, laneIndex) => {
    const laneEvents = byLane.get(type);
    if (!laneEvents || laneEvents.length === 0) return;

    const positioned = laneEvents
      .map((event) => ({ event, x: xOf(event) }))
      .filter((entry) => Number.isFinite(entry.x))
      .sort((a, b) => a.x - b.x || a.event.id.localeCompare(b.event.id));

    let current: { event: CompetitiveEvent; x: number }[] = [];

    const flush = (): void => {
      if (current.length === 0) return;
      const first = current[0];
      const last = current[current.length - 1];
      if (!first || !last) return;
      const members = current.map((entry) => entry.event);
      const years = members.map((event) => event.year);
      clusters.push({
        id: `${type}:${first.event.id}:${members.length}`,
        type,
        laneIndex,
        x: (first.x + last.x) / 2,
        events: members,
        fromYear: Math.min(...years),
        toYear: Math.max(...years),
      });
      current = [];
    };

    for (const entry of positioned) {
      const previous = current[current.length - 1];
      if (previous && entry.x - previous.x >= minGapPx) flush();
      current.push(entry);
    }
    flush();
  });

  return clusters.sort((a, b) => a.x - b.x || a.laneIndex - b.laneIndex);
};

/**
 * Where an opened cluster's badge and dots sit: the badge leads, the member dots
 * fan out to its right, and the whole tray is nudged back inside the plot when it
 * would run off an edge.
 */
export const expandedClusterLayout = (
  cluster: TimelineCluster,
  options: { spacingPx: number; badgeWidthPx: number; maxX: number },
): ExpandedClusterLayout => {
  const { spacingPx, badgeWidthPx, maxX } = options;
  const span = badgeWidthPx + cluster.events.length * spacingPx;
  const rawStart = cluster.x - span / 2;

  const trayLow = rawStart - TRAY_PADDING;
  const trayHigh = rawStart + span + TRAY_PADDING;
  const overflowLeft = Math.max(0, -trayLow);
  const overflowRight = Math.max(0, trayHigh - maxX);
  const shift = overflowLeft > 0 ? overflowLeft : -overflowRight;
  const start = rawStart + shift;

  return {
    badgeX: start + badgeWidthPx / 2,
    trayX0: start - TRAY_PADDING,
    trayX1: start + span + TRAY_PADDING,
    points: cluster.events.map((event, index) => ({
      event,
      x: start + badgeWidthPx + spacingPx * (index + 0.5),
    })),
  };
};

/**
 * The flat, left-to-right list of focusable marks. A lone event is its own mark
 * so `focusEventId` and the roving tab stop keep working; a pooled cluster is one
 * mark, immediately followed by its members while it is open, so an arrow key
 * steps into the cluster rather than skipping past it.
 */
export const timelineMarks = (
  clusters: readonly TimelineCluster[],
  options: TimelineMarksOptions,
): TimelineMark[] => {
  const { expandedClusterId, spacingPx, badgeWidthPx, maxX } = options;
  const marks: TimelineMark[] = [];

  for (const cluster of clusters) {
    const first = cluster.events[0];
    if (!first) continue;

    if (cluster.events.length === 1) {
      marks.push({
        kind: "event",
        id: first.id,
        laneIndex: cluster.laneIndex,
        x: cluster.x,
        event: first,
        clusterId: cluster.id,
        fannedOut: false,
      });
      continue;
    }

    const expanded = expandedClusterId === cluster.id;
    if (!expanded) {
      marks.push({
        kind: "cluster",
        id: cluster.id,
        laneIndex: cluster.laneIndex,
        x: cluster.x,
        cluster,
        expanded: false,
        trayX0: cluster.x,
        trayX1: cluster.x,
      });
      continue;
    }

    const layout = expandedClusterLayout(cluster, { spacingPx, badgeWidthPx, maxX });
    marks.push({
      kind: "cluster",
      id: cluster.id,
      laneIndex: cluster.laneIndex,
      x: layout.badgeX,
      cluster,
      expanded: true,
      trayX0: layout.trayX0,
      trayX1: layout.trayX1,
    });
    for (const point of layout.points) {
      marks.push({
        kind: "event",
        id: point.event.id,
        laneIndex: cluster.laneIndex,
        x: point.x,
        event: point.event,
        clusterId: cluster.id,
        fannedOut: true,
      });
    }
  }

  return marks;
};

/** Cluster id for every event, so a selection made elsewhere can open its cluster. */
export const clusterIdByEvent = (
  clusters: readonly TimelineCluster[],
): Map<string, string> => {
  const map = new Map<string, string>();
  for (const cluster of clusters) {
    for (const event of cluster.events) map.set(event.id, cluster.id);
  }
  return map;
};

/** How many clusters pool more than one event, for the chart's source line. */
export const pooledClusterCount = (clusters: readonly TimelineCluster[]): number =>
  clusters.filter((cluster) => cluster.events.length > 1).length;

export type EraSpan = {
  id: string;
  startYear: number;
  endYear: number | null;
  /** Breaks ties when spans are clipped to a range: the era's real start year. */
  sortYear?: number;
};

/**
 * Assigns each era to the first row where it does not overlap an era already
 * placed. Eras from the 1990s on run concurrently, so a single row would paint
 * their names on top of each other. An era ending in year N and one starting
 * in N share a boundary, not a year, so they may sit in the same row.
 */
export const packEraRows = (eras: readonly EraSpan[]): Map<string, number> => {
  const sorted = [...eras].sort(
    (a, b) =>
      a.startYear - b.startYear ||
      (a.sortYear ?? a.startYear) - (b.sortYear ?? b.startYear) ||
      a.id.localeCompare(b.id),
  );
  const rowEnds: number[] = [];
  const rows = new Map<string, number>();
  for (const era of sorted) {
    const end = era.endYear ?? Number.POSITIVE_INFINITY;
    const free = rowEnds.findIndex((rowEnd) => rowEnd <= era.startYear);
    const row = free === -1 ? rowEnds.length : free;
    rowEnds[row] = end;
    rows.set(era.id, row);
  }
  return rows;
};

/**
 * Relative width of one year in each period. Events per year grow roughly
 * tenfold from the 1970s to the 2020s, so an even scale leaves the early decades
 * empty and piles the recent ones into the right edge.
 */
const YEAR_WEIGHTS: readonly { from: number; weight: number }[] = [
  { from: Number.NEGATIVE_INFINITY, weight: 1 },
  { from: 1990, weight: 1.8 },
  { from: 2010, weight: 3 },
];

/**
 * Domain and range stops for a piecewise-linear time scale over [start, end]
 * mapped onto [0, width]. Short spans stay even, because they are already
 * zoomed into one period.
 */
export const weightedTimeStops = (
  start: number,
  end: number,
  width: number,
): { domain: number[]; range: number[] } => {
  if (end - start < 30) return { domain: [start, end], range: [0, width] };
  const domain = [
    start,
    ...YEAR_WEIGHTS.map((period) => period.from).filter((year) => year > start && year < end),
    end,
  ];
  const weightAt = (year: number): number =>
    [...YEAR_WEIGHTS].reverse().find((period) => year >= period.from)?.weight ?? 1;
  const lengths = domain.slice(1).map((stop, index) => {
    const from = domain[index] ?? start;
    return (stop - from) * weightAt(from);
  });
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const range = [0];
  let covered = 0;
  for (const length of lengths) {
    covered += length;
    range.push((covered / total) * width);
  }
  return { domain, range };
};
