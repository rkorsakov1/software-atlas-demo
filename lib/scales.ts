import { scaleLinear, scaleLog, scaleOrdinal, scaleSqrt, scaleTime } from "d3-scale";

import type {
  Archetype,
  Category,
  Confidence,
  DataPoint,
  EventType,
  Maturity,
} from "@/data/types";

/**
 * Every colour here resolves to a CSS variable defined in `app/globals.css`, so a
 * chart drawn with these keeps working when the theme flips without re-rendering.
 */
export const categoryColorVar: Record<Category, string> = {
  infrastructure: "var(--cat-infrastructure)",
  horizontal: "var(--cat-horizontal)",
  vertical: "var(--cat-vertical)",
  consumer: "var(--cat-consumer)",
  emerging: "var(--cat-emerging)",
};

export const categorySoftColorVar: Record<Category, string> = {
  infrastructure: "var(--cat-infrastructure-soft)",
  horizontal: "var(--cat-horizontal-soft)",
  vertical: "var(--cat-vertical-soft)",
  consumer: "var(--cat-consumer-soft)",
  emerging: "var(--cat-emerging-soft)",
};

export const confidenceColorVar: Record<Confidence, string> = {
  reported: "var(--confidence-reported)",
  estimated: "var(--confidence-estimated)",
  modeled: "var(--confidence-modeled)",
};

export const CATEGORY_ORDER: readonly Category[] = [
  "infrastructure",
  "horizontal",
  "vertical",
  "consumer",
  "emerging",
];

export const ARCHETYPE_ORDER: readonly Archetype[] = [
  "platform-giant",
  "suite-consolidator",
  "best-of-breed",
  "vertical",
  "commercial-oss",
  "plg-challenger",
  "pe-rollup",
  "marketplace",
  "ai-native",
  "si-channel",
];

export const MATURITY_ORDER: readonly Maturity[] = [
  "nascent",
  "emerging",
  "scaling",
  "consolidating",
  "mature",
  "declining",
];

/**
 * Ten archetype colours, one CSS variable each. They are nine hues roughly 36
 * degrees apart plus one neutral, generated to clear 4.9:1 (light) and 8.7:1
 * (dark) against the page. The earlier scheme reused the five category accents at
 * two lightness steps, which produced five same-hue pairs that measured 1.18:1
 * against each other in dark mode and were effectively one colour to the eye.
 */
const ARCHETYPE_COLORS: readonly string[] = [
  "var(--archetype-platform-giant)",
  "var(--archetype-suite-consolidator)",
  "var(--archetype-best-of-breed)",
  "var(--archetype-vertical)",
  "var(--archetype-commercial-oss)",
  "var(--archetype-plg-challenger)",
  "var(--archetype-pe-rollup)",
  "var(--archetype-marketplace)",
  "var(--archetype-ai-native)",
  "var(--archetype-si-channel)",
];

export const archetypeColorScale = scaleOrdinal<Archetype, string>()
  .domain([...ARCHETYPE_ORDER])
  .range([...ARCHETYPE_COLORS]);

export const archetypeColor = (archetype: Archetype): string =>
  archetypeColorScale(archetype);

export const maturityColorScale = scaleOrdinal<Maturity, string>()
  .domain([...MATURITY_ORDER])
  .range([
    "color-mix(in oklab, var(--cat-emerging) 35%, var(--background))",
    "color-mix(in oklab, var(--cat-emerging) 60%, var(--background))",
    "color-mix(in oklab, var(--cat-infrastructure) 70%, var(--background))",
    "color-mix(in oklab, var(--cat-vertical) 70%, var(--background))",
    "color-mix(in oklab, var(--cat-horizontal) 70%, var(--background))",
    "color-mix(in oklab, var(--cat-consumer) 70%, var(--background))",
  ]);

/** Event dots are laid out in one horizontal lane per event type on the timeline. */
export const EVENT_TYPE_LANES: readonly EventType[] = [
  "platform-shift",
  "launch",
  "acquisition",
  "bundling",
  "unbundling",
  "disruption",
  "pricing-shift",
  "license-change",
  "regulation",
  "spin-off",
  "milestone",
];

export const eventTypeLane = (type: EventType): number => {
  const index = EVENT_TYPE_LANES.indexOf(type);
  return index === -1 ? EVENT_TYPE_LANES.length : index;
};

export type Extent = [number, number];

export const niceLinearScale = (domain: Extent, range: Extent) =>
  scaleLinear().domain(domain).range(range).nice();

export const yearScale = (domain: Extent, range: Extent) =>
  scaleLinear().domain(domain).range(range);

export const timeScale = (domain: [Date, Date], range: Extent) =>
  scaleTime().domain(domain).range(range);

/** Log scales cannot start at zero; revenue floors at $10M so pre-IPO firms still plot. */
export const REVENUE_LOG_FLOOR_USD_B = 0.01;

export const revenueLogScale = (domain: Extent, range: Extent) =>
  scaleLog()
    .domain([Math.max(REVENUE_LOG_FLOOR_USD_B, domain[0]), Math.max(domain[1], domain[0] * 1.1)])
    .range(range)
    .clamp(true);

/** Bubble radius uses sqrt so that area, not radius, encodes the value. */
export const bubbleRadiusScale = (maxValue: number, maxRadius: number) =>
  scaleSqrt().domain([0, Math.max(maxValue, 1)]).range([2, maxRadius]);

export const extentOf = (values: readonly number[], fallback: Extent): Extent => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (min === Number.POSITIVE_INFINITY || max === Number.NEGATIVE_INFINITY) return fallback;
  if (min === max) return [min, max === 0 ? 1 : max * 1.1];
  return [min, max];
};

export const dataPointExtent = (points: readonly DataPoint[], fallback: Extent): Extent =>
  extentOf(
    points.flatMap((point) => [point.low ?? point.value, point.high ?? point.value]),
    fallback,
  );

/**
 * Linear interpolation between the two data points bracketing `year`. Returns
 * `interpolated: true` whenever the answer is not an actual reported year, which
 * the treemap surfaces as a modeled value.
 */
export type InterpolatedValue = {
  value: number;
  interpolated: boolean;
  basis: DataPoint;
};

export const valueAtYear = (
  points: readonly DataPoint[],
  year: number,
): InterpolatedValue | null => {
  if (points.length === 0) return null;
  const sorted = [...points].sort((a, b) => a.year - b.year);
  const exact = sorted.find((point) => point.year === year);
  if (exact) return { value: exact.value, interpolated: false, basis: exact };

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return null;
  if (year < first.year) return { value: first.value, interpolated: true, basis: first };
  if (year > last.year) return { value: last.value, interpolated: true, basis: last };

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const before = sorted[index];
    const after = sorted[index + 1];
    if (!before || !after) continue;
    if (year <= before.year || year >= after.year) continue;
    const span = after.year - before.year;
    const ratio = span === 0 ? 0 : (year - before.year) / span;
    return {
      value: before.value + (after.value - before.value) * ratio,
      interpolated: true,
      basis: before,
    };
  }
  return { value: last.value, interpolated: true, basis: last };
};

/**
 * True when the points that feed values for `fromYear` and `toYear` (the nearest
 * point at or before `fromYear` through the nearest at or after `toYear`) do not
 * all share one definition. A publisher widening its scope is not growth.
 */
export const spansDefinitionBreak = (
  points: readonly DataPoint[],
  fromYear: number,
  toYear: number,
): boolean => {
  const sorted = [...points].sort((a, b) => a.year - b.year);
  const start = [...sorted].reverse().find((point) => point.year <= fromYear)?.year ?? fromYear;
  const end = sorted.find((point) => point.year >= toYear)?.year ?? toYear;
  const used = sorted.filter((point) => point.year >= start && point.year <= end);
  return new Set(used.map((point) => point.definition ?? "")).size > 1;
};

/**
 * Year-over-year growth in percent, derived from the two nearest annual points.
 * Returns null when the series does not actually reach back to `year - 1`:
 * `valueAtYear` clamps outside the series, so without this guard a single-point
 * series would report a spurious 0% growth.
 */
export const growthAtYear = (points: readonly DataPoint[], year: number): number | null => {
  if (points.length < 2) return null;
  const earliestYear = Math.min(...points.map((point) => point.year));
  if (year - 1 < earliestYear) return null;

  if (spansDefinitionBreak(points, year - 1, year)) return null;

  const current = valueAtYear(points, year);
  const previous = valueAtYear(points, year - 1);
  if (!current || !previous) return null;
  if (previous.value <= 0) return null;
  return ((current.value - previous.value) / previous.value) * 100;
};

/** A stable pseudo-angle in [0, 2π) derived from an id, for the emerging radar. */
export const angleFromId = (id: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 100000) / 100000 * Math.PI * 2;
};
