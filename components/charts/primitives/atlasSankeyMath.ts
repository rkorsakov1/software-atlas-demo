import {
  sankey,
  sankeyJustify,
  sankeyLinkHorizontal,
  type SankeyGraph,
  type SankeyLink,
  type SankeyNode,
} from "d3-sankey";

import { MIN_LABEL_BOX } from "@/components/charts/primitives/atlasLabelFit";
import type { FlowDirection, FlowKind } from "@/data/types";
import type { SankeyInput } from "@/lib/selectors";

/**
 * Turns the selector's `SankeyInput` into laid-out geometry. Everything here is
 * pure: `d3-sankey` computes the coordinates and React draws them, so the layout
 * rules (bipartite split, height scaling, label fitting, period bucketing) can be
 * unit-tested without a DOM.
 *
 * The diagram is deliberately **two columns**: every flow is drawn from a
 * "moved" node on the left to a "landed in" node on the right. A market that both
 * absorbed another market and was itself absorbed appears once on each side. That
 * costs a little redundancy and buys three things the multi-column version could
 * not give: a reserved label gutter on each side (CONTRACTS §10.1 and §10.5),
 * no middle column whose labels would have to sit on top of the ribbons, and no
 * dropped flows — a bipartite graph can never be circular, so every sourced flow
 * in the period is drawn.
 */

// --- node and link shapes ----------------------------------------------------

export type SankeySide = "source" | "target";

export type SankeyNodeDatum = {
  /** Draw id, unique per side: "source|market:crm". */
  id: string;
  /** The id the selector used, shared by both sides: "market:crm". */
  nodeId: string;
  label: string;
  kind: FlowKind;
  side: SankeySide;
};

export type SankeyLinkDatum = {
  id: string;
  source: string;
  target: string;
  value: number;
  direction: FlowDirection;
  eventId: string;
  year: number;
  sourceNodeId: string;
  targetNodeId: string;
};

export type SankeyLayoutNode = {
  /** Draw id; unique within the diagram even when an entity appears on both sides. */
  id: string;
  /** The selector's node id, e.g. "market:crm". */
  nodeId: string;
  label: string;
  kind: FlowKind;
  /** The undecorated id, e.g. "crm" from "market:crm". */
  entityId: string;
  side: SankeySide;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  value: number;
  /** True for the right-hand column, whose labels sit in the right gutter. */
  labelOnRight: boolean;
};

export type SankeyLayoutLink = {
  id: string;
  path: string;
  width: number;
  value: number;
  direction: FlowDirection;
  eventId: string;
  year: number;
  /** Selector node ids, safe to strip and hand to `onHoverMarket`. */
  sourceId: string;
  targetId: string;
  /** Draw ids, for looking the rectangles up in the layout. */
  sourceDrawId: string;
  targetDrawId: string;
  sourceEntityId: string;
  targetEntityId: string;
  sourceLabel: string;
  targetLabel: string;
};

export type SankeyLayoutResult = {
  nodes: SankeyLayoutNode[];
  links: SankeyLayoutLink[];
  /** Links whose endpoints are not in `input.nodes`; reported, never silently lost. */
  droppedLinkIds: string[];
};

export type SankeyLayoutOptions = {
  width: number;
  height: number;
  nodeWidth?: number;
  nodePadding?: number;
};

const EMPTY_RESULT: SankeyLayoutResult = { nodes: [], links: [], droppedLinkIds: [] };

const SOURCE_PREFIX = "source|";
const TARGET_PREFIX = "target|";

/** `market:crm` -> `crm`; ids without a prefix are returned unchanged. */
export const stripNodePrefix = (nodeId: string): string => {
  const separator = nodeId.indexOf(":");
  return separator === -1 ? nodeId : nodeId.slice(separator + 1);
};

export const isMarketNodeId = (nodeId: string): boolean => nodeId.startsWith("market:");

export const drawIdFor = (nodeId: string, side: SankeySide): string =>
  `${side === "source" ? SOURCE_PREFIX : TARGET_PREFIX}${nodeId}`;

export type BipartiteGraph = {
  nodes: SankeyNodeDatum[];
  links: SankeyLinkDatum[];
  unresolvedLinkIds: string[];
};

/**
 * Splits every node into the side or sides it is actually used on, so the graph
 * is bipartite by construction. Nodes nothing points at are dropped with their
 * links; the caller reports them.
 */
export const bipartiteGraph = (input: SankeyInput): BipartiteGraph => {
  const labelOf = new Map(input.nodes.map((node) => [node.id, node]));
  const nodes = new Map<string, SankeyNodeDatum>();
  const links: SankeyLinkDatum[] = [];
  const unresolvedLinkIds: string[] = [];

  const register = (nodeId: string, side: SankeySide): string | null => {
    const node = labelOf.get(nodeId);
    if (!node) return null;
    const id = drawIdFor(nodeId, side);
    if (!nodes.has(id)) {
      nodes.set(id, { id, nodeId, label: node.label, kind: node.kind, side });
    }
    return id;
  };

  for (const link of input.links) {
    if (link.source === link.target) {
      unresolvedLinkIds.push(link.id);
      continue;
    }
    const source = register(link.source, "source");
    const target = register(link.target, "target");
    if (source === null || target === null) {
      unresolvedLinkIds.push(link.id);
      continue;
    }
    links.push({
      id: link.id,
      source,
      target,
      value: Math.max(1, link.value),
      direction: link.direction,
      eventId: link.eventId,
      year: link.year,
      sourceNodeId: link.source,
      targetNodeId: link.target,
    });
  }

  return { nodes: [...nodes.values()], links, unresolvedLinkIds };
};

/** How many nodes each column carries, which is what the height has to fit. */
export const sankeyColumnCounts = (
  input: SankeyInput,
): { sources: number; targets: number; tallest: number } => {
  const { nodes } = bipartiteGraph(input);
  const sources = nodes.filter((node) => node.side === "source").length;
  const targets = nodes.length - sources;
  return { sources, targets, tallest: Math.max(sources, targets) };
};

export const MIN_SANKEY_HEIGHT = 520;
export const MAX_SANKEY_HEIGHT = 900;

/**
 * Height scaled to the tallest column rather than a fixed box (CONTRACTS §10.4),
 * so nodes get a readable pitch instead of being compressed into whatever room
 * the card happens to have.
 */
export const sankeyHeightFor = (nodesInTallestColumn: number, rowHeight = 28): number =>
  Math.round(
    Math.max(
      MIN_SANKEY_HEIGHT,
      Math.min(MAX_SANKEY_HEIGHT, Math.max(0, nodesInTallestColumn) * rowHeight + 24),
    ),
  );

export const computeSankeyLayout = (
  input: SankeyInput,
  options: SankeyLayoutOptions,
): SankeyLayoutResult => {
  const { width, height, nodeWidth = 12, nodePadding = 18 } = options;
  if (width <= 0 || height <= 0) return EMPTY_RESULT;
  if (input.nodes.length === 0 || input.links.length === 0) return EMPTY_RESULT;

  const graphInput = bipartiteGraph(input);
  if (graphInput.links.length === 0) {
    return { nodes: [], links: [], droppedLinkIds: graphInput.unresolvedLinkIds };
  }

  const nodes = graphInput.nodes.map((node) => ({ ...node })) as SankeyNode<
    SankeyNodeDatum,
    SankeyLinkDatum
  >[];
  const links = graphInput.links.map((link) => ({ ...link })) as unknown as SankeyLink<
    SankeyNodeDatum,
    SankeyLinkDatum
  >[];

  const layout = sankey<SankeyNodeDatum, SankeyLinkDatum>()
    .nodeId((node) => node.id)
    .nodeAlign(sankeyJustify)
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .extent([
      [0, 2],
      [width, Math.max(4, height - 2)],
    ]);

  const graph: SankeyGraph<SankeyNodeDatum, SankeyLinkDatum> = layout({ nodes, links });
  const pathOf = sankeyLinkHorizontal<SankeyNodeDatum, SankeyLinkDatum>();

  const laidOutNodes: SankeyLayoutNode[] = graph.nodes.map((node) => {
    const x0 = node.x0 ?? 0;
    const x1 = node.x1 ?? x0 + nodeWidth;
    return {
      id: node.id,
      nodeId: node.nodeId,
      label: node.label,
      kind: node.kind,
      entityId: stripNodePrefix(node.nodeId),
      side: node.side,
      x0,
      x1,
      y0: node.y0 ?? 0,
      y1: node.y1 ?? 0,
      value: node.value ?? 0,
      labelOnRight: node.side === "target",
    };
  });

  const nodeById = new Map(laidOutNodes.map((node) => [node.id, node]));

  const laidOutLinks: SankeyLayoutLink[] = graph.links.map((link) => {
    const source = link.source as SankeyNode<SankeyNodeDatum, SankeyLinkDatum>;
    const target = link.target as SankeyNode<SankeyNodeDatum, SankeyLinkDatum>;
    return {
      id: link.id,
      path: pathOf(link) ?? "",
      width: Math.max(1.5, link.width ?? 1.5),
      value: link.value,
      direction: link.direction,
      eventId: link.eventId,
      year: link.year,
      sourceId: link.sourceNodeId,
      targetId: link.targetNodeId,
      sourceDrawId: source.id,
      targetDrawId: target.id,
      sourceEntityId: stripNodePrefix(link.sourceNodeId),
      targetEntityId: stripNodePrefix(link.targetNodeId),
      sourceLabel: nodeById.get(source.id)?.label ?? link.sourceNodeId,
      targetLabel: nodeById.get(target.id)?.label ?? link.targetNodeId,
    };
  });

  return {
    nodes: laidOutNodes,
    links: laidOutLinks,
    droppedLinkIds: graphInput.unresolvedLinkIds,
  };
};

/**
 * Which nodes in a column can carry a drawn label without the labels colliding.
 * Walks each column downwards and keeps a label only when its anchor clears the
 * last kept one by `minGap`, which is what CONTRACTS §10.1 asks for: a band with
 * no room gets no text, and its name survives in the tooltip, the `aria-label`
 * and the table.
 */
export const labelledNodeIds = (
  nodes: readonly SankeyLayoutNode[],
  minGap = MIN_LABEL_BOX.height,
): Set<string> => {
  const kept = new Set<string>();
  const columns = new Map<number, SankeyLayoutNode[]>();

  for (const node of nodes) {
    const key = Math.round(node.x0);
    const column = columns.get(key);
    if (column) {
      column.push(node);
      continue;
    }
    columns.set(key, [node]);
  }

  for (const column of columns.values()) {
    const ordered = [...column].sort((a, b) => a.y0 - b.y0);
    let lastAnchor = Number.NEGATIVE_INFINITY;
    for (const node of ordered) {
      const anchor = (node.y0 + node.y1) / 2;
      if (anchor - lastAnchor < minGap) continue;
      kept.add(node.id);
      lastAnchor = anchor;
    }
  }

  return kept;
};

// --- period bucketing (CONTRACTS §10.6) --------------------------------------

export const ALL_PERIODS_ID = "all";

/**
 * Above this many nodes in one column, the full set is not worth drawing at the
 * default size and the chart opens on its most recent decade instead.
 */
export const MAX_LEGIBLE_COLUMN_NODES = 22;

export type FlowPeriod = {
  id: string;
  label: string;
  fromYear: number;
  toYear: number;
  count: number;
};

export const decadeIdFor = (year: number): string => `${Math.floor(year / 10) * 10}s`;

/** The decades the flows actually fall in, ascending, each with its flow count. */
export const flowPeriods = (links: readonly { year: number }[]): FlowPeriod[] => {
  const counts = new Map<number, number>();
  for (const link of links) {
    const decade = Math.floor(link.year / 10) * 10;
    counts.set(decade, (counts.get(decade) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([decade, count]) => ({
      id: `${decade}s`,
      label: `${decade}s`,
      fromYear: decade,
      toYear: decade + 9,
      count,
    }));
};

/**
 * Opens on everything when everything is legible, and on the most recent decade
 * when it is not.
 */
export const defaultPeriodId = (
  periods: readonly FlowPeriod[],
  nodesInTallestColumn: number,
  budget = MAX_LEGIBLE_COLUMN_NODES,
): string => {
  if (periods.length <= 1) return ALL_PERIODS_ID;
  if (nodesInTallestColumn <= budget) return ALL_PERIODS_ID;
  return periods[periods.length - 1]?.id ?? ALL_PERIODS_ID;
};

/** Narrows the input to one decade, dropping nodes that lose all their links. */
export const filterInputToPeriod = (input: SankeyInput, periodId: string): SankeyInput => {
  if (periodId === ALL_PERIODS_ID) return input;
  const links = input.links.filter((link) => decadeIdFor(link.year) === periodId);
  if (links.length === 0) return { nodes: [], links: [] };
  const used = new Set<string>();
  for (const link of links) {
    used.add(link.source);
    used.add(link.target);
  }
  return { nodes: input.nodes.filter((node) => used.has(node.id)), links };
};
