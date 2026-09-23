import { describe, expect, it } from "vitest";

import {
  ALL_PERIODS_ID,
  MAX_SANKEY_HEIGHT,
  MIN_SANKEY_HEIGHT,
  bipartiteGraph,
  computeSankeyLayout,
  decadeIdFor,
  defaultPeriodId,
  filterInputToPeriod,
  flowPeriods,
  labelledNodeIds,
  sankeyColumnCounts,
  sankeyHeightFor,
  type SankeyLayoutNode,
} from "@/components/charts/primitives/atlasSankeyMath";
import type { SankeyInput } from "@/lib/selectors";

const input: SankeyInput = {
  nodes: [
    { id: "market:crm", label: "Customer relationship management", kind: "market" },
    { id: "market:marketing-automation", label: "Marketing automation", kind: "market" },
    { id: "company-suite:salesforce", label: "Salesforce", kind: "company-suite" },
  ],
  links: [
    {
      id: "flow-a",
      source: "market:crm",
      target: "market:marketing-automation",
      value: 2,
      direction: "unbundle",
      eventId: "E08",
      year: 2006,
    },
    {
      id: "flow-b",
      source: "market:marketing-automation",
      target: "company-suite:salesforce",
      value: 3,
      direction: "bundle",
      eventId: "E20",
      year: 2013,
    },
    {
      // Closes a loop with flow-a; the old multi-column layout had to drop it.
      id: "flow-c",
      source: "market:marketing-automation",
      target: "market:crm",
      value: 1,
      direction: "bundle",
      eventId: "E31",
      year: 2021,
    },
  ],
};

const node = (id: string, y0: number, y1: number, x0 = 0): SankeyLayoutNode => ({
  id,
  nodeId: `market:${id}`,
  label: id,
  kind: "market",
  entityId: id,
  side: "source",
  x0,
  x1: x0 + 12,
  y0,
  y1,
  value: 1,
  labelOnRight: false,
});

describe("sankeyHeightFor", () => {
  it("scales with the tallest column", () => {
    expect(sankeyHeightFor(24, 28)).toBeGreaterThan(sankeyHeightFor(20, 28));
  });

  it("never compresses below the floor or grows past the ceiling", () => {
    expect(sankeyHeightFor(1, 28)).toBe(MIN_SANKEY_HEIGHT);
    expect(sankeyHeightFor(400, 28)).toBe(MAX_SANKEY_HEIGHT);
  });

  it("gives every node at least the row height once past the floor", () => {
    const nodes = 30;
    expect(sankeyHeightFor(nodes, 28) / nodes).toBeGreaterThanOrEqual(24);
  });
});

describe("bipartiteGraph", () => {
  it("splits an entity that appears on both sides and keeps every flow", () => {
    const graph = bipartiteGraph(input);
    expect(graph.links).toHaveLength(3);
    expect(graph.unresolvedLinkIds).toEqual([]);
    expect(graph.nodes.filter((entry) => entry.nodeId === "market:crm")).toHaveLength(2);
    expect(graph.nodes.every((entry) => entry.side === "source" || entry.side === "target")).toBe(
      true,
    );
  });

  it("reports a link whose endpoint is unknown instead of dropping it silently", () => {
    const graph = bipartiteGraph({
      nodes: input.nodes,
      links: [{ ...input.links[0]!, id: "flow-x", target: "market:missing" }],
    });
    expect(graph.links).toHaveLength(0);
    expect(graph.unresolvedLinkIds).toEqual(["flow-x"]);
  });

  it("counts the columns the height has to fit", () => {
    expect(sankeyColumnCounts(input)).toEqual({ sources: 2, targets: 3, tallest: 3 });
  });
});

describe("computeSankeyLayout", () => {
  it("lays every node out in exactly two columns and draws every flow", () => {
    const layout = computeSankeyLayout(input, { width: 400, height: 520 });
    const columns = new Set(layout.nodes.map((entry) => Math.round(entry.x0)));

    expect(layout.links).toHaveLength(3);
    expect(layout.droppedLinkIds).toEqual([]);
    expect(columns.size).toBe(2);
    expect(layout.nodes.filter((entry) => entry.labelOnRight).length).toBe(3);
  });

  it("keeps the selector node ids on the link so hover can strip the prefix", () => {
    const layout = computeSankeyLayout(input, { width: 400, height: 520 });
    const drawn = layout.links.find((link) => link.id === "flow-b");
    expect(drawn?.sourceId).toBe("market:marketing-automation");
    expect(drawn?.sourceEntityId).toBe("marketing-automation");
    expect(drawn?.targetLabel).toBe("Salesforce");
  });
});

describe("labelledNodeIds", () => {
  it("keeps labels that clear each other and drops the ones with no room", () => {
    const kept = labelledNodeIds([node("a", 0, 8), node("b", 10, 16), node("c", 60, 80)]);
    expect(kept.has("a")).toBe(true);
    expect(kept.has("b")).toBe(false);
    expect(kept.has("c")).toBe(true);
  });

  it("treats each column independently", () => {
    const kept = labelledNodeIds([node("left", 0, 8), node("right", 2, 9, 300)]);
    expect(kept.has("left")).toBe(true);
    expect(kept.has("right")).toBe(true);
  });
});

describe("period bucketing", () => {
  it("buckets flows into the decades they happened in", () => {
    expect(decadeIdFor(2013)).toBe("2010s");
    expect(flowPeriods(input.links)).toEqual([
      { id: "2000s", label: "2000s", fromYear: 2000, toYear: 2009, count: 1 },
      { id: "2010s", label: "2010s", fromYear: 2010, toYear: 2019, count: 1 },
      { id: "2020s", label: "2020s", fromYear: 2020, toYear: 2029, count: 1 },
    ]);
  });

  it("opens on everything when everything is legible, and on the last decade when it is not", () => {
    const periods = flowPeriods(input.links);
    expect(defaultPeriodId(periods, 12)).toBe(ALL_PERIODS_ID);
    expect(defaultPeriodId(periods, 30)).toBe("2020s");
    expect(defaultPeriodId([], 99)).toBe(ALL_PERIODS_ID);
  });

  it("narrows the input to one decade and drops the nodes that lose their links", () => {
    const narrowed = filterInputToPeriod(input, "2010s");
    expect(narrowed.links.map((link) => link.id)).toEqual(["flow-b"]);
    expect(narrowed.nodes.map((entry) => entry.id).sort()).toEqual([
      "company-suite:salesforce",
      "market:marketing-automation",
    ]);
    expect(filterInputToPeriod(input, ALL_PERIODS_ID)).toBe(input);
  });
});
