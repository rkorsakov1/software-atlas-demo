export { Axis, ticksFrom } from "@/components/charts/primitives/Axis";
export type { AxisProps, AxisTick } from "@/components/charts/primitives/Axis";

export { ChartFrame } from "@/components/charts/primitives/ChartFrame";
export type {
  ChartFrameProps,
  ChartFrameRenderArgs,
} from "@/components/charts/primitives/ChartFrame";

export { ChartTooltip } from "@/components/charts/primitives/ChartTooltip";
export type { ChartTooltipProps, TooltipRow } from "@/components/charts/primitives/ChartTooltip";

export { ConfidenceBadge } from "@/components/charts/primitives/ConfidenceBadge";
export type { ConfidenceBadgeProps } from "@/components/charts/primitives/ConfidenceBadge";

export { DataTable } from "@/components/charts/primitives/DataTable";
export type { DataTableColumn, DataTableProps } from "@/components/charts/primitives/DataTable";

export { EmptyState } from "@/components/charts/primitives/EmptyState";
export type { EmptyStateProps } from "@/components/charts/primitives/EmptyState";

export {
  DOT_PATTERN_ID,
  HATCH_PATTERN_ID,
  HatchDefs,
  lineStyleFor,
  markStyleFor,
} from "@/components/charts/primitives/HatchDefs";
export type { MarkStyle } from "@/components/charts/primitives/HatchDefs";

export { Legend } from "@/components/charts/primitives/Legend";
export type { LegendItem, LegendProps } from "@/components/charts/primitives/Legend";

export {
  MOBILE_BREAKPOINT,
  isNarrow,
  useChartSize,
} from "@/components/charts/primitives/useChartSize";
export type {
  ChartSize,
  UseChartSizeOptions,
  UseChartSizeResult,
} from "@/components/charts/primitives/useChartSize";

export { useKeyboardNav } from "@/components/charts/primitives/useKeyboardNav";
export type {
  KeyboardNavOrientation,
  UseKeyboardNavOptions,
  UseKeyboardNavResult,
} from "@/components/charts/primitives/useKeyboardNav";

export { useReducedMotion } from "@/components/charts/primitives/useReducedMotion";

export {
  CONFIDENCE_RANK,
  INTERPOLATION_NOTE,
  OTHER_SHARE_KEY,
  OTHER_SHARE_NOTE,
  activeEventLanes,
  bubbleMarkConfidence,
  clampYear,
  eventPosition,
  laneIndexOf,
  orderedShareKeys,
  shareBandConfidence,
  shareStackRows,
  sizeConfidence,
  stepYear,
  trailUpToYear,
  treemapGrowthPercent,
  worstConfidence,
} from "@/components/charts/primitives/atlasChartMath";
export type {
  ShareStackRow,
  TrailPoint,
} from "@/components/charts/primitives/atlasChartMath";

export {
  EVENT_LANE_ORDER,
  eventTypeColor,
  eventTypeColorVar,
  isStructuralBreak,
} from "@/components/charts/primitives/eventStyles";

export { AtlasMarkTooltip } from "@/components/charts/primitives/AtlasMarkTooltip";
export type {
  AtlasMarkTooltipProps,
  AtlasMarkTooltipRow,
} from "@/components/charts/primitives/AtlasMarkTooltip";

export {
  HORIZON_RINGS,
  MOAT_AXIS_ORDER,
  MOAT_MAX_SCORE,
  RING_INNER_RATIO,
  RING_LABEL_ANGLE,
  categorySector,
  emergingRadarDots,
  horizonRingBounds,
  horizonRingIndex,
  moatPolygonPath,
  moatRadarVertices,
  moatScoreRadius,
  polarPoint,
  polygonPath,
  radarAxisAngle,
  radarRingPath,
  radarTextAnchor,
  sectorDividerPoints,
  sectorLabelPoint,
  stableFraction,
} from "@/components/charts/primitives/atlasRadarMath";
export type {
  EmergingDot,
  EmergingRadarOptions,
  MoatRadarInputCompany,
  MoatVertex,
  RadarGeometry,
  RadarPoint,
  RadarTextAnchor,
} from "@/components/charts/primitives/atlasRadarMath";

export { useNarrowViewport } from "@/components/charts/primitives/useNarrowViewport";

export {
  MIN_BUBBLE_RADIUS,
  UNSIZED_BUBBLE_RADIUS,
  bubbleGrowthDomain,
  bubblePaintOrder,
  bubbleRadiusScaleFor,
  bubbleReadingOrder,
  bubbleRevenueDomain,
  isPercentSizeMetric,
  isSizedByMetric,
  sizeMetricLabel,
  sizeMetricUnit,
} from "@/components/charts/primitives/atlasBubbleMath";
export type {
  BubbleRadiusKind,
  BubbleRadiusScale,
} from "@/components/charts/primitives/atlasBubbleMath";

export {
  CHAR_WIDTH_RATIO,
  ELLIPSIS,
  MIN_LABEL_BOX,
  MIN_LABEL_CHARS,
  MIN_LABEL_FONT_PX,
  UPPERCASE_WIDTH_FACTOR,
  abbreviateLabel,
  fitLabel,
  fitLabelInBox,
  fitMarkLabel,
  hasLabelRoom,
  maxCharsFor,
  measureTextWidth,
} from "@/components/charts/primitives/atlasLabelFit";
export type { FittedLabel } from "@/components/charts/primitives/atlasLabelFit";

export {
  placeOutsideMarkLabels,
  placedLabelsById,
} from "@/components/charts/primitives/atlasLabelPlacement";
export type {
  OutsideLabelMark,
  OutsideLabelOptions,
  PlacedLabel,
} from "@/components/charts/primitives/atlasLabelPlacement";

export {
  CLUSTER_BADGE_WIDTH,
  CLUSTER_MEMBER_SPACING_PX,
  CLUSTER_MIN_GAP_PX,
  clusterIdByEvent,
  clusterLaneEvents,
  expandedClusterLayout,
  pooledClusterCount,
  timelineMarks,
} from "@/components/charts/primitives/atlasTimelineMath";
export type {
  ExpandedClusterLayout,
  TimelineCluster,
  TimelineMark,
  TimelineMarksOptions,
} from "@/components/charts/primitives/atlasTimelineMath";

export {
  MAX_TILES_PER_CATEGORY,
  MIN_POOLED_TILES,
  MIN_TILE_AREA,
  pooledTileLabel,
  splitTreemapTail,
  sumValues,
} from "@/components/charts/primitives/atlasTreemapMath";
export type {
  TreemapTailOptions,
  TreemapTailSplit,
} from "@/components/charts/primitives/atlasTreemapMath";

export {
  DEFAULT_LINEAGE_TICKS,
  computeLineageLayout,
  dealStrokeWidth,
} from "@/components/charts/primitives/atlasForceLayout";
export type {
  LineageLayout,
  LineageLayoutEdge,
  LineageLayoutNode,
  LineageLayoutOptions,
} from "@/components/charts/primitives/atlasForceLayout";
