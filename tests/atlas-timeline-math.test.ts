import { describe, expect, it } from "vitest";

import {
  clusterIdByEvent,
  clusterLaneEvents,
  expandedClusterLayout,
  packEraRows,
  weightedTimeStops,
  pooledClusterCount,
  timelineMarks,
  type TimelineCluster,
} from "@/components/charts/primitives/atlasTimelineMath";
import type { CompetitiveEvent, EventType } from "@/data/types";

const eventOf = (
  id: string,
  year: number,
  type: EventType = "acquisition",
): CompetitiveEvent => ({
  id,
  year,
  type,
  title: `Event ${id}`,
  companyIds: [],
  marketIds: [],
  impact: "none",
  sourceIds: ["S01"],
});

const lanes: readonly EventType[] = ["acquisition", "launch"];

/** Ten pixels per year, so events a year apart are 10px apart. */
const xOf = (event: CompetitiveEvent): number => event.year * 10;

describe("clusterLaneEvents", () => {
  it("pools dots in the same lane that would overlap", () => {
    const events = [eventOf("a", 2000), eventOf("b", 2000), eventOf("c", 2001)];
    const clusters = clusterLaneEvents(events, xOf, lanes, 14);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.events.map((event) => event.id)).toEqual(["a", "b", "c"]);
    expect(clusters[0]?.fromYear).toBe(2000);
    expect(clusters[0]?.toYear).toBe(2001);
  });

  it("keeps dots separate once they clear the minimum gap", () => {
    const events = [eventOf("a", 2000), eventOf("b", 2002)];
    const clusters = clusterLaneEvents(events, xOf, lanes, 14);
    expect(clusters).toHaveLength(2);
    expect(clusters.every((cluster) => cluster.events.length === 1)).toBe(true);
  });

  it("never pools across lanes", () => {
    const events = [eventOf("a", 2000, "acquisition"), eventOf("b", 2000, "launch")];
    const clusters = clusterLaneEvents(events, xOf, lanes, 14);
    expect(clusters).toHaveLength(2);
    expect(clusters.map((cluster) => cluster.type).sort()).toEqual(["acquisition", "launch"]);
  });

  it("drops events whose lane is not on screen", () => {
    const events = [eventOf("a", 2000, "regulation")];
    expect(clusterLaneEvents(events, xOf, lanes, 14)).toHaveLength(0);
  });

  it("splits a cluster as the scale zooms in", () => {
    const events = [eventOf("a", 2000), eventOf("b", 2001)];
    const zoomed = clusterLaneEvents(events, (event) => event.year * 100, lanes, 14);
    expect(zoomed).toHaveLength(2);
  });

  it("returns clusters in reading order", () => {
    const events = [eventOf("late", 2020), eventOf("early", 1990)];
    const clusters = clusterLaneEvents(events, xOf, lanes, 14);
    expect(clusters[0]?.events[0]?.id).toBe("early");
  });

  it("counts only the clusters that pool more than one event", () => {
    const events = [eventOf("a", 2000), eventOf("b", 2000), eventOf("c", 2010)];
    expect(pooledClusterCount(clusterLaneEvents(events, xOf, lanes, 14))).toBe(1);
  });

  it("maps every event back to its cluster", () => {
    const events = [eventOf("a", 2000), eventOf("b", 2000)];
    const clusters = clusterLaneEvents(events, xOf, lanes, 14);
    const map = clusterIdByEvent(clusters);
    expect(map.get("a")).toBe(clusters[0]?.id);
    expect(map.get("b")).toBe(clusters[0]?.id);
  });
});

const clusterOf = (count: number, x: number): TimelineCluster => ({
  id: "acquisition:a:" + count,
  type: "acquisition",
  laneIndex: 0,
  x,
  events: Array.from({ length: count }, (_, index) => eventOf(`e${index}`, 2000 + index)),
  fromYear: 2000,
  toYear: 2000 + count - 1,
});

describe("expandedClusterLayout", () => {
  it("fans the members out to the right of the badge", () => {
    const layout = expandedClusterLayout(clusterOf(3, 400), {
      spacingPx: 15,
      badgeWidthPx: 26,
      maxX: 800,
    });
    expect(layout.points).toHaveLength(3);
    const xs = layout.points.map((point) => point.x);
    expect((xs[1] ?? 0) - (xs[0] ?? 0)).toBe(15);
    expect(layout.badgeX).toBeLessThan(xs[0] ?? 0);
  });

  it("pushes a cluster at the left edge back inside the plot", () => {
    const layout = expandedClusterLayout(clusterOf(4, 5), {
      spacingPx: 15,
      badgeWidthPx: 26,
      maxX: 800,
    });
    expect(layout.trayX0).toBeGreaterThanOrEqual(0);
  });

  it("pulls a cluster at the right edge back inside the plot", () => {
    const layout = expandedClusterLayout(clusterOf(4, 795), {
      spacingPx: 15,
      badgeWidthPx: 26,
      maxX: 800,
    });
    expect(layout.trayX1).toBeLessThanOrEqual(800);
  });
});

describe("timelineMarks", () => {
  const events = [
    eventOf("a", 2000),
    eventOf("b", 2000),
    eventOf("c", 2000),
    eventOf("far", 2020),
  ];
  const clusters = clusterLaneEvents(events, xOf, lanes, 14);

  it("gives a lone event its own mark keyed by event id", () => {
    const marks = timelineMarks(clusters, {
      expandedClusterId: null,
      spacingPx: 15,
      badgeWidthPx: 26,
      maxX: 800,
    });
    const lone = marks.find((mark) => mark.id === "far");
    expect(lone?.kind).toBe("event");
  });

  it("collapses a pooled cluster into a single mark", () => {
    const marks = timelineMarks(clusters, {
      expandedClusterId: null,
      spacingPx: 15,
      badgeWidthPx: 26,
      maxX: 800,
    });
    expect(marks).toHaveLength(2);
    expect(marks.some((mark) => mark.id === "a")).toBe(false);
  });

  it("inserts the members straight after their badge when it is open", () => {
    const pooled = clusters.find((cluster) => cluster.events.length > 1);
    const marks = timelineMarks(clusters, {
      expandedClusterId: pooled?.id ?? null,
      spacingPx: 15,
      badgeWidthPx: 26,
      maxX: 800,
    });
    expect(marks.map((mark) => mark.id)).toEqual([pooled?.id, "a", "b", "c", "far"]);
    const members = marks.filter((mark) => mark.kind === "event" && mark.fannedOut);
    expect(members).toHaveLength(3);
  });

  it("keeps every mark inside the plot when a cluster opens at the edge", () => {
    const edge = clusterLaneEvents(events, () => 799, lanes, 14);
    const marks = timelineMarks(edge, {
      expandedClusterId: edge[0]?.id ?? null,
      spacingPx: 15,
      badgeWidthPx: 26,
      maxX: 800,
    });
    expect(marks.every((mark) => mark.x <= 800)).toBe(true);
  });
});

describe("packEraRows", () => {
  it("keeps back-to-back eras in one row and stacks concurrent ones", () => {
    const rows = packEraRows([
      { id: "a", startYear: 1950, endYear: 1969 },
      { id: "b", startYear: 1969, endYear: 1981 },
      { id: "c", startYear: 1975, endYear: 1990 },
      { id: "d", startYear: 1985, endYear: null },
      { id: "e", startYear: 1995, endYear: null },
    ]);
    expect(rows.get("a")).toBe(0);
    expect(rows.get("b")).toBe(0);
    expect(rows.get("c")).toBe(1);
    expect(rows.get("d")).toBe(0);
    expect(rows.get("e")).toBe(1);
  });
});

describe("weightedTimeStops", () => {
  it("gives recent decades more width on long spans", () => {
    const { domain, range } = weightedTimeStops(1950, 2027, 1000);
    expect(domain).toEqual([1950, 1990, 2010, 2027]);
    expect(range[0]).toBe(0);
    expect(range[range.length - 1]).toBeCloseTo(1000);
    const perYearEarly = (range[1] ?? 0) / 40;
    const perYearLate = (1000 - (range[2] ?? 0)) / 17;
    expect(perYearLate).toBeGreaterThan(perYearEarly * 2.5);
  });

  it("keeps short spans even", () => {
    expect(weightedTimeStops(2010, 2027, 500)).toEqual({ domain: [2010, 2027], range: [0, 500] });
  });
});

describe("packEraRows with clipped spans", () => {
  it("keeps the real chronological order when clipping makes start years tie", () => {
    const rows = packEraRows([
      { id: "era-10", startYear: 2010, endYear: 2021, sortYear: 2010 },
      { id: "era-6", startYear: 2010, endYear: 2015, sortYear: 1998 },
      { id: "era-7", startYear: 2010, endYear: null, sortYear: 1999 },
    ]);
    expect(rows.get("era-6")).toBe(0);
    expect(rows.get("era-7")).toBe(1);
    expect(rows.get("era-10")).toBe(2);
  });
});
