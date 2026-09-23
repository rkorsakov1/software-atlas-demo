import { scaleSqrt } from "d3-scale";

import type { Unit } from "@/data/types";
import type { BubbleDatum, BubbleSizeMetric } from "@/lib/selectors";

/**
 * Radius, domain and legend maths for the competitive bubble chart. It lives here
 * rather than in the component because the radius rule is the one design decision
 * in that chart that has to be argued for, and an argument should be testable.
 */

/** Small enough to read as "almost nothing", large enough to stay clickable. */
export const MIN_BUBBLE_RADIUS = 3;

/** Radius of the ring drawn for a company the selected metric cannot size. */
export const UNSIZED_BUBBLE_RADIUS = 4.5;

export const isPercentSizeMetric = (metric: BubbleSizeMetric): boolean =>
  metric === "grossMargin";

export const sizeMetricLabel: Record<BubbleSizeMetric, string> = {
  marketCap: "Market cap",
  grossMargin: "Gross margin",
  revenue: "Revenue",
};

export const sizeMetricUnit = (metric: BubbleSizeMetric): Unit =>
  isPercentSizeMetric(metric) ? "percent" : "USD_B";

export type BubbleRadiusKind = "area" | "linear";

export type BubbleRadiusScale = {
  /** "area": radius ∝ √value. "linear": radius ∝ value. Both anchored at zero. */
  kind: BubbleRadiusKind;
  metric: BubbleSizeMetric;
  unit: Unit;
  domainMax: number;
  /** The range actually present in the data, or null when nothing is sized. */
  observed: [number, number] | null;
  maxRadius: number;
  radius: (value: number) => number;
  /** Ascending reference values for the sized legend. */
  legendValues: number[];
  /** One sentence naming the encoding; shown in the legend and the footnote. */
  description: string;
};

const roundToStep = (value: number, step: number, mode: "floor" | "ceil" | "round"): number => {
  const scaled = value / step;
  if (mode === "floor") return Math.floor(scaled) * step;
  if (mode === "ceil") return Math.ceil(scaled) * step;
  return Math.round(scaled) * step;
};

const percentLegendValues = (observed: [number, number] | null): number[] => {
  if (!observed) return [40, 70, 90];
  const low = Math.max(0, roundToStep(observed[0], 5, "floor"));
  const high = Math.min(100, roundToStep(observed[1], 5, "ceil"));
  if (high <= low) return [high];
  const middle = roundToStep((low + high) / 2, 5, "round");
  return [...new Set([low, middle, high])].sort((a, b) => a - b);
};

const magnitudeLegendValues = (domainMax: number): number[] => {
  if (!Number.isFinite(domainMax) || domainMax <= 0) return [];
  return [domainMax / 16, domainMax / 4, domainMax].filter((value) => value > 0);
};

const PERCENT_DESCRIPTION =
  "Radius runs in a straight line from 0% to 100%, so the whole scale is on screen and the differences between software margins stay visible. Area is not proportional to the value.";

const AREA_DESCRIPTION =
  "Area is proportional to the value, on a domain anchored at zero, so a company twice the size covers twice the ink.";

/**
 * Builds the radius scale for one size metric.
 *
 * Two rules, because the two kinds of metric mean different things:
 *
 * - An **extensive** quantity (revenue, market cap) is a magnitude, so area
 *   carries it: radius ∝ √value over `[0, max]`. Doubling the money doubles the
 *   ink, which is the honest encoding for a size comparison.
 * - An **intensive** percentage (gross margin) is a position on a bounded 0–100
 *   scale, not a magnitude. Gross margin in this dataset spans roughly 35–91%
 *   and clusters between 65% and 85% (docs/CONTRACTS.md §8.9), so a √ scale over
 *   that range draws every bubble the same size and the channel says nothing.
 *   The radius therefore runs linearly from 0% to 100%: still anchored at zero,
 *   so nothing is exaggerated relative to a true zero, but a 20-point margin gap
 *   becomes a fifth of the radius instead of a rounding error. The legend and the
 *   chart footnote say which rule is in force, and the sized legend shows the
 *   observed range.
 */
export const bubbleRadiusScaleFor = (
  values: readonly number[],
  metric: BubbleSizeMetric,
  maxRadius: number,
): BubbleRadiusScale => {
  const finite = values.filter((value) => Number.isFinite(value) && value > 0);
  const top = Math.max(maxRadius, MIN_BUBBLE_RADIUS + 1);
  const observed: [number, number] | null =
    finite.length === 0 ? null : [Math.min(...finite), Math.max(...finite)];

  if (isPercentSizeMetric(metric)) {
    const domainMax = 100;
    const radius = (value: number): number => {
      if (!Number.isFinite(value) || value <= 0) return MIN_BUBBLE_RADIUS;
      const ratio = Math.min(1, value / domainMax);
      return MIN_BUBBLE_RADIUS + (top - MIN_BUBBLE_RADIUS) * ratio;
    };
    return {
      kind: "linear",
      metric,
      unit: "percent",
      domainMax,
      observed,
      maxRadius: top,
      radius,
      legendValues: percentLegendValues(observed),
      description: PERCENT_DESCRIPTION,
    };
  }

  const domainMax = observed ? observed[1] : 1;
  const scale = scaleSqrt()
    .domain([0, Math.max(domainMax, Number.EPSILON)])
    .range([MIN_BUBBLE_RADIUS, top])
    .clamp(true);
  const radius = (value: number): number =>
    Number.isFinite(value) && value > 0 ? scale(value) : MIN_BUBBLE_RADIUS;

  return {
    kind: "area",
    metric,
    unit: "USD_B",
    domainMax,
    observed,
    maxRadius: top,
    radius,
    legendValues: magnitudeLegendValues(domainMax),
    description: AREA_DESCRIPTION,
  };
};

/**
 * True when this company is sized by the metric the reader asked for. The
 * selector falls back to revenue for companies with no figure for the chosen
 * metric, and a revenue magnitude cannot share a radius scale with a percentage,
 * so those companies are drawn as unsized rings instead of being mis-sized.
 */
export const isSizedByMetric = (datum: BubbleDatum, metric: BubbleSizeMetric): boolean =>
  datum.sizeMetric === metric;

/** A growth axis domain that always contains zero and never crops a company out. */
export const bubbleGrowthDomain = (values: readonly number[]): [number, number] => {
  const finite = values.filter((value) => Number.isFinite(value));
  if (finite.length === 0) return [-20, 60];
  const low = Math.min(0, ...finite);
  const high = Math.max(0, ...finite);
  const pad = Math.max(2, (high - low) * 0.08);
  return [low - pad, high + pad];
};

/** Revenue axis domain with a little headroom on both ends of the log scale. */
export const bubbleRevenueDomain = (values: readonly number[]): [number, number] => {
  const finite = values.filter((value) => Number.isFinite(value) && value > 0);
  if (finite.length === 0) return [0.01, 100];
  const low = Math.min(...finite);
  const high = Math.max(...finite);
  if (low === high) return [low * 0.5, high * 2];
  return [low * 0.7, high * 1.4];
};

/** Biggest first, so a small bubble is never buried under a large one. */
export const bubblePaintOrder = (
  data: readonly BubbleDatum[],
  metric: BubbleSizeMetric,
  scale: BubbleRadiusScale,
): BubbleDatum[] =>
  [...data].sort((a, b) => {
    const radiusA = isSizedByMetric(a, metric) ? scale.radius(a.size) : UNSIZED_BUBBLE_RADIUS;
    const radiusB = isSizedByMetric(b, metric) ? scale.radius(b.size) : UNSIZED_BUBBLE_RADIUS;
    return radiusB - radiusA || a.company.id.localeCompare(b.company.id);
  });

/** Left to right along the revenue axis, which is the order arrow keys follow. */
export const bubbleReadingOrder = (data: readonly BubbleDatum[]): BubbleDatum[] =>
  [...data].sort((a, b) => a.revenue - b.revenue || a.company.id.localeCompare(b.company.id));
