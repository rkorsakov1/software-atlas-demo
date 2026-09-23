import type { Confidence, CompetitiveEvent, EventType, Market } from "@/data/types";
import { EVENT_TYPE_LANES, growthAtYear } from "@/lib/scales";
import {
  bubbleDatumConfidence,
  type BubbleDatum,
  type ShareSeriesPoint,
} from "@/lib/selectors";

/**
 * Pure layout and derivation maths shared by the timeline, treemap, share and
 * bubble charts. Nothing here touches React or the DOM, so every rule the charts
 * depend on is unit-testable on its own.
 */

export const CONFIDENCE_RANK: Record<Confidence, number> = {
  reported: 0,
  estimated: 1,
  modeled: 2,
};

/** The least confident of the inputs wins, so a mark never overstates its basis. */
export const worstConfidence = (
  ...values: readonly (Confidence | undefined | null)[]
): Confidence => {
  let worst: Confidence = "reported";
  for (const value of values) {
    if (!value) continue;
    if (CONFIDENCE_RANK[value] > CONFIDENCE_RANK[worst]) worst = value;
  }
  return worst;
};

/** Fractional year used to place an event dot inside its year on the timeline. */
export const eventPosition = (event: Pick<CompetitiveEvent, "year" | "month">): number => {
  const month = event.month;
  if (month === undefined) return event.year + 0.5;
  const clamped = Math.min(12, Math.max(1, month));
  return event.year + (clamped - 0.5) / 12;
};

/** Only the event types actually present get a lane, in the canonical lane order. */
export const activeEventLanes = (
  events: readonly Pick<CompetitiveEvent, "type">[],
): EventType[] => {
  const present = new Set<EventType>(events.map((event) => event.type));
  const lanes = EVENT_TYPE_LANES.filter((type) => present.has(type));
  const extras = [...present].filter((type) => !EVENT_TYPE_LANES.includes(type));
  return [...lanes, ...extras];
};

export const laneIndexOf = (lanes: readonly EventType[], type: EventType): number => {
  const index = lanes.indexOf(type);
  return index === -1 ? lanes.length : index;
};

/**
 * Growth for a treemap tile: the year-over-year change in the market's own size
 * series where the series supports it, otherwise the market's published growth
 * rate, otherwise nothing. Never a guess.
 */
export const treemapGrowthPercent = (market: Market, year: number): number | null => {
  const derived = growthAtYear(market.sizeByYear, year);
  if (derived !== null) return derived;
  const published = market.growthRate;
  if (published && published.unit === "percent") return published.value;
  return null;
};

/** An interpolated size is a modeled number, whatever the surrounding points say. */
export const sizeConfidence = (basis: Confidence, interpolated: boolean): Confidence =>
  interpolated ? "modeled" : basis;

export const INTERPOLATION_NOTE =
  "Modeled: linearly interpolated between the two nearest reported years.";

export const OTHER_SHARE_KEY = "other";

export const OTHER_SHARE_NOTE =
  "Modeled: the residual between the published shares and 100%, not a reported figure.";

/**
 * Stack keys ordered by mean share across the window, largest first, with the
 * residual "Other" band always last so the stack reads top-down by size.
 */
export const orderedShareKeys = (series: readonly ShareSeriesPoint[]): string[] => {
  const totals = new Map<string, number>();
  for (const point of series) {
    for (const share of point.shares) {
      totals.set(share.companyId, (totals.get(share.companyId) ?? 0) + share.value);
    }
  }
  const ranked = [...totals.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([companyId]) => companyId);
  return [...ranked, OTHER_SHARE_KEY];
};

export type ShareStackRow = {
  year: number;
  values: Record<string, number>;
  points: Record<string, ShareSeriesPoint["shares"][number]["point"] | undefined>;
};

/** One row per year, zero-filled for every key so d3-shape can stack it directly. */
export const shareStackRows = (
  series: readonly ShareSeriesPoint[],
  keys: readonly string[],
): ShareStackRow[] =>
  [...series]
    .sort((a, b) => a.year - b.year)
    .map((point) => {
      const values: Record<string, number> = {};
      const points: ShareStackRow["points"] = {};
      for (const key of keys) values[key] = 0;
      for (const share of point.shares) {
        values[share.companyId] = share.value;
        points[share.companyId] = share.point;
      }
      values[OTHER_SHARE_KEY] = point.other;
      return { year: point.year, values, points };
    });

/** The confidence a whole share band should be drawn with: its least confident point. */
export const shareBandConfidence = (
  series: readonly ShareSeriesPoint[],
  companyId: string,
): Confidence => {
  if (companyId === OTHER_SHARE_KEY) return "modeled";
  const confidences = series.flatMap((point) =>
    point.shares
      .filter((share) => share.companyId === companyId)
      .map((share) => share.point.confidence),
  );
  return worstConfidence(...confidences);
};

/**
 * A bubble is only as solid as the weakest number that places it — and an
 * interpolated value is modeled whatever the neighbouring filing said, which is
 * what `bubbleDatumConfidence` adds on top of the basis comparison
 * (docs/CONTRACTS.md §11.2). This wrapper exists so charts that already import
 * the chart maths get the one answer, not a second competing one.
 */
export const bubbleMarkConfidence = (datum: BubbleDatum): Confidence =>
  bubbleDatumConfidence(datum);

export const clampYear = (year: number, minYear: number, maxYear: number): number => {
  if (maxYear < minYear) return minYear;
  if (!Number.isFinite(year)) return minYear;
  return Math.min(maxYear, Math.max(minYear, Math.round(year)));
};

/** Playback step that wraps back to the first year instead of stalling at the end. */
export const stepYear = (year: number, minYear: number, maxYear: number): number => {
  if (maxYear <= minYear) return minYear;
  const current = clampYear(year, minYear, maxYear);
  return current >= maxYear ? minYear : current + 1;
};

export type TrailPoint = { year: number; revenue: number; growth: number };

/**
 * A pinned company's trail: sorted, de-duplicated by year, cut off at the year on
 * screen and dropped entirely when a single point would draw a line to nowhere.
 */
export const trailUpToYear = (
  points: readonly TrailPoint[],
  year: number,
): TrailPoint[] => {
  const byYear = new Map<number, TrailPoint>();
  for (const point of points) {
    if (point.year > year) continue;
    if (!Number.isFinite(point.revenue) || !Number.isFinite(point.growth)) continue;
    if (point.revenue <= 0) continue;
    byYear.set(point.year, point);
  }
  const sorted = [...byYear.values()].sort((a, b) => a.year - b.year);
  return sorted.length < 2 ? [] : sorted;
};

/** Concentration (HHI, top three) is only meaningful when this many vendors are named. */
export const MIN_NAMED_FOR_CONCENTRATION = 3;

/**
 * A share series is sparse when a vendor is missing from a year inside its own
 * first-to-last span, or a year names fewer than three vendors. Stacking such a
 * series would draw missing data as a fall to zero, so it is drawn as lines.
 */
export const isSparseShareSeries = (series: readonly ShareSeriesPoint[]): boolean => {
  const sorted = [...series].sort((a, b) => a.year - b.year);
  if (sorted.some((point) => point.shares.length < MIN_NAMED_FOR_CONCENTRATION)) return true;
  const companyIds = new Set(sorted.flatMap((point) => point.shares.map((share) => share.companyId)));
  for (const companyId of companyIds) {
    const present = sorted.map((point) => point.shares.some((share) => share.companyId === companyId));
    const first = present.indexOf(true);
    const last = present.lastIndexOf(true);
    if (present.slice(first, last + 1).includes(false)) return true;
  }
  return false;
};
