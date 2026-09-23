import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { scaleSqrt } from "d3-scale";

import type { LineageGraphData, LineageLink, LineageNode } from "@/lib/selectors";

/**
 * A settled force layout for the lineage graph, computed once and rendered as
 * static geometry. CLAUDE.md §6 forbids animating a force layout tick by tick, so
 * the simulation is stepped to rest here, inside a `useMemo`, and React only ever
 * sees coordinates. Keeping it out of the component also makes the two properties
 * that matter — determinism and fitting the viewport — unit-testable.
 */

export const DEFAULT_LINEAGE_TICKS = 300;

const MIN_NODE_RADIUS = 4.5;
const MAX_NODE_RADIUS = 15;
const ARROW_GAP = 3;

export type LineageLayoutNode = LineageNode & {
  x: number;
  y: number;
  radius: number;
  /** Deals this company is on either side of, which sets the node's size. */
  degree: number;
  acquisitions: number;
  timesAcquired: number;
};

export type LineageLayoutEdge = LineageLink & {
  /** Trimmed to the rim of each circle so the arrowhead is never hidden. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
};

export type LineageLayout = {
  nodes: LineageLayoutNode[];
  edges: LineageLayoutEdge[];
  /** Deals whose value is not disclosed, drawn at the thinnest stroke. */
  undisclosedCount: number;
};

export type LineageLayoutOptions = {
  width: number;
  height: number;
  ticks?: number;
  seed?: number;
  padding?: number;
};

const EMPTY_LAYOUT: LineageLayout = { nodes: [], edges: [], undisclosedCount: 0 };

/** mulberry32: a deterministic source so the same graph always settles the same way. */
const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

type SimNode = SimulationNodeDatum & { id: string };
type SimLink = SimulationLinkDatum<SimNode> & { id: string };

const PHYLLOTAXIS_ANGLE = 2.399963229728653;

/** Stroke width for a deal, by value; undisclosed deals get the thinnest line. */
export const dealStrokeWidth = (dealValueUsdB: number | null, maxDealValueUsdB: number): number => {
  if (dealValueUsdB === null || dealValueUsdB <= 0) return 0.8;
  const scale = scaleSqrt()
    .domain([0, Math.max(maxDealValueUsdB, 1)])
    .range([1.1, 5])
    .clamp(true);
  return scale(dealValueUsdB);
};

export const computeLineageLayout = (
  graph: LineageGraphData,
  options: LineageLayoutOptions,
): LineageLayout => {
  const { width, height, ticks = DEFAULT_LINEAGE_TICKS, seed = 20260101, padding = 24 } = options;
  if (graph.nodes.length === 0) return EMPTY_LAYOUT;
  if (width <= 0 || height <= 0) return EMPTY_LAYOUT;

  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  const links = graph.links.filter(
    (link) => nodeIds.has(link.source) && nodeIds.has(link.target) && link.source !== link.target,
  );

  const acquisitions = new Map<string, number>();
  const timesAcquired = new Map<string, number>();
  for (const link of links) {
    acquisitions.set(link.source, (acquisitions.get(link.source) ?? 0) + 1);
    timesAcquired.set(link.target, (timesAcquired.get(link.target) ?? 0) + 1);
  }
  const degreeOf = (id: string): number =>
    (acquisitions.get(id) ?? 0) + (timesAcquired.get(id) ?? 0);

  const maxDegree = Math.max(1, ...graph.nodes.map((node) => degreeOf(node.id)));
  const radiusScale = scaleSqrt()
    .domain([0, maxDegree])
    .range([MIN_NODE_RADIUS, MAX_NODE_RADIUS])
    .clamp(true);

  const centerX = width / 2;
  const centerY = height / 2;
  const spread = Math.min(width, height) / 12;

  const simNodes: SimNode[] = graph.nodes.map((node, index) => {
    const angle = index * PHYLLOTAXIS_ANGLE;
    const distance = spread * Math.sqrt(index);
    return {
      id: node.id,
      x: centerX + distance * Math.cos(angle),
      y: centerY + distance * Math.sin(angle),
      vx: 0,
      vy: 0,
    };
  });

  const simLinks: SimLink[] = links.map((link) => ({
    id: link.id,
    source: link.source,
    target: link.target,
  }));

  const simulation = forceSimulation<SimNode>(simNodes)
    .randomSource(seededRandom(seed))
    .force(
      "link",
      forceLink<SimNode, SimLink>(simLinks)
        .id((node) => node.id)
        .distance(52)
        .strength(0.55),
    )
    .force("charge", forceManyBody<SimNode>().strength(-190).distanceMax(420))
    .force(
      "collide",
      forceCollide<SimNode>().radius((node) => radiusScale(degreeOf(node.id)) + 5).strength(0.9),
    )
    .force("x", forceX<SimNode>(centerX).strength(0.055))
    .force("y", forceY<SimNode>(centerY).strength(0.075))
    .stop();

  simulation.tick(Math.max(1, ticks));

  const positioned = simNodes.map((node) => ({
    id: node.id,
    x: Number.isFinite(node.x) ? (node.x as number) : centerX,
    y: Number.isFinite(node.y) ? (node.y as number) : centerY,
    radius: radiusScale(degreeOf(node.id)),
  }));

  // Fit the settled cloud into the viewport: the forces decide the shape, the
  // viewport decides the scale, so a two-node graph is not lost in the middle.
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const node of positioned) {
    minX = Math.min(minX, node.x - node.radius);
    maxX = Math.max(maxX, node.x + node.radius);
    minY = Math.min(minY, node.y - node.radius);
    maxY = Math.max(maxY, node.y + node.radius);
  }
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);
  const usableWidth = Math.max(1, width - padding * 2);
  const usableHeight = Math.max(1, height - padding * 2);
  const scale = Math.min(usableWidth / spanX, usableHeight / spanY, 2.5);
  const offsetX = padding + (usableWidth - spanX * scale) / 2;
  const offsetY = padding + (usableHeight - spanY * scale) / 2;

  const layoutNodes: LineageLayoutNode[] = graph.nodes.map((node, index) => {
    const placed = positioned[index];
    const x = placed ? offsetX + (placed.x - minX) * scale : centerX;
    const y = placed ? offsetY + (placed.y - minY) * scale : centerY;
    return {
      ...node,
      x,
      y,
      radius: placed?.radius ?? MIN_NODE_RADIUS,
      degree: degreeOf(node.id),
      acquisitions: acquisitions.get(node.id) ?? 0,
      timesAcquired: timesAcquired.get(node.id) ?? 0,
    };
  });

  const nodeById = new Map(layoutNodes.map((node) => [node.id, node]));
  const maxDealValue = Math.max(
    1,
    ...links.map((link) => link.dealValueUsdB ?? 0).filter((value) => value > 0),
  );

  const edges: LineageLayoutEdge[] = [];
  let undisclosedCount = 0;
  for (const link of links) {
    const source = nodeById.get(link.source);
    const target = nodeById.get(link.target);
    if (!source || !target) continue;
    if (link.dealValueUsdB === null) undisclosedCount += 1;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.hypot(dx, dy);
    const ux = length === 0 ? 1 : dx / length;
    const uy = length === 0 ? 0 : dy / length;

    edges.push({
      ...link,
      x1: source.x + ux * source.radius,
      y1: source.y + uy * source.radius,
      x2: target.x - ux * (target.radius + ARROW_GAP),
      y2: target.y - uy * (target.radius + ARROW_GAP),
      strokeWidth: dealStrokeWidth(link.dealValueUsdB, maxDealValue),
    });
  }

  return { nodes: layoutNodes, edges, undisclosedCount };
};
