import { describe, expect, it } from "vitest";

import {
  computeLineageLayout,
  dealStrokeWidth,
} from "@/components/charts/primitives/atlasForceLayout";
import type { LineageGraphData } from "@/lib/selectors";

const node = (id: string): LineageGraphData["nodes"][number] => ({
  id,
  name: id.toUpperCase(),
  archetype: "platform-giant",
  founded: 1990,
});

const graph: LineageGraphData = {
  nodes: [node("a"), node("b"), node("c"), node("d")],
  links: [
    { id: "e1", source: "a", target: "b", year: 2001, type: "acquisition", dealValueUsdB: 5, eventId: "E1" },
    { id: "e2", source: "a", target: "c", year: 2005, type: "acquisition", dealValueUsdB: null, eventId: "E2" },
    { id: "e3", source: "d", target: "a", year: 2010, type: "spin-off", dealValueUsdB: 1, eventId: "E3" },
  ],
};

const options = { width: 600, height: 400 };

describe("computeLineageLayout", () => {
  it("settles to the same positions for the same graph, so nothing jumps on re-render", () => {
    const first = computeLineageLayout(graph, options);
    const second = computeLineageLayout(graph, options);
    expect(second.nodes.map((item) => [item.id, item.x, item.y])).toEqual(
      first.nodes.map((item) => [item.id, item.x, item.y]),
    );
  });

  it("fits every node inside the viewport", () => {
    const layout = computeLineageLayout(graph, options);
    for (const item of layout.nodes) {
      expect(item.x - item.radius).toBeGreaterThanOrEqual(-0.001);
      expect(item.x + item.radius).toBeLessThanOrEqual(options.width + 0.001);
      expect(item.y - item.radius).toBeGreaterThanOrEqual(-0.001);
      expect(item.y + item.radius).toBeLessThanOrEqual(options.height + 0.001);
      expect(Number.isFinite(item.x)).toBe(true);
    }
  });

  it("sizes a node by how many deals it is part of", () => {
    const layout = computeLineageLayout(graph, options);
    const a = layout.nodes.find((item) => item.id === "a");
    const b = layout.nodes.find((item) => item.id === "b");
    expect(a?.degree).toBe(3);
    expect(a?.acquisitions).toBe(2);
    expect(a?.timesAcquired).toBe(1);
    expect(b?.degree).toBe(1);
    expect(a?.radius ?? 0).toBeGreaterThan(b?.radius ?? 0);
  });

  it("counts undisclosed deals instead of estimating a value for them", () => {
    const layout = computeLineageLayout(graph, options);
    expect(layout.undisclosedCount).toBe(1);
    const undisclosed = layout.edges.find((edge) => edge.id === "e2");
    const disclosed = layout.edges.find((edge) => edge.id === "e1");
    expect(undisclosed?.strokeWidth ?? 0).toBeLessThan(disclosed?.strokeWidth ?? 0);
  });

  it("stops each edge at the rim of its circles so the arrowhead stays visible", () => {
    const layout = computeLineageLayout(graph, options);
    const edge = layout.edges.find((item) => item.id === "e1");
    const source = layout.nodes.find((item) => item.id === "a");
    const target = layout.nodes.find((item) => item.id === "b");
    if (!edge || !source || !target) throw new Error("expected a laid-out edge");

    const distanceToSource = Math.hypot(edge.x1 - source.x, edge.y1 - source.y);
    const distanceToTarget = Math.hypot(edge.x2 - target.x, edge.y2 - target.y);
    expect(distanceToSource).toBeCloseTo(source.radius, 5);
    expect(distanceToTarget).toBeGreaterThan(target.radius);
  });

  it("drops self-links and links to companies outside the graph", () => {
    const layout = computeLineageLayout(
      {
        nodes: [node("a"), node("b")],
        links: [
          { id: "self", source: "a", target: "a", year: 2000, type: "acquisition", dealValueUsdB: 1, eventId: "E" },
          { id: "ghost", source: "a", target: "zz", year: 2000, type: "acquisition", dealValueUsdB: 1, eventId: "E" },
        ],
      },
      options,
    );
    expect(layout.edges).toHaveLength(0);
    expect(layout.nodes).toHaveLength(2);
  });

  it("returns nothing for an empty graph rather than a degenerate layout", () => {
    expect(computeLineageLayout({ nodes: [], links: [] }, options).nodes).toHaveLength(0);
  });
});

describe("dealStrokeWidth", () => {
  it("keeps a bigger deal visibly heavier, on a zero-anchored area scale", () => {
    expect(dealStrokeWidth(60, 60)).toBeGreaterThan(dealStrokeWidth(15, 60));
    expect(dealStrokeWidth(null, 60)).toBeLessThan(dealStrokeWidth(0.1, 60));
  });
});
