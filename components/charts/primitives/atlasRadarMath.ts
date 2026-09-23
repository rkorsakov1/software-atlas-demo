import type { Category, EmergingMarket, Horizon, MoatKey, MoatScore } from "@/data/types";
import { CATEGORY_ORDER, angleFromId, bubbleRadiusScale } from "@/lib/scales";
import { signalStrengthTotal } from "@/lib/selectors";

/**
 * Pure polar geometry for the two radar charts (moat comparison and emerging
 * markets). Nothing here touches React or the DOM, so every placement rule the
 * charts rely on — ring order, sector order, stable angles — is unit-testable.
 */

export const MOAT_AXIS_ORDER: readonly MoatKey[] = [
  "network",
  "switching",
  "scale",
  "data",
  "brand",
  "ecosystem",
  "regulatory",
];

export const MOAT_MAX_SCORE = 5;

/** Rings run outwards: the nearest horizon sits closest to the centre. */
export const HORIZON_RINGS: readonly Horizon[] = ["0-2y", "2-5y", "5y+"];

export type RadarPoint = { x: number; y: number };

export type RadarGeometry = {
  cx: number;
  cy: number;
  /** Radius of the outermost ring, in pixels. */
  radius: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const round = (value: number): number => Math.round(value * 100) / 100;

/** Axis 0 points straight up; the rest are spaced clockwise. */
export const radarAxisAngle = (index: number, count: number): number => {
  if (count <= 0) return -Math.PI / 2;
  return -Math.PI / 2 + (index * Math.PI * 2) / count;
};

export type RadarTextAnchor = "start" | "middle" | "end";

/** Anchors a label by which side of the centre its spoke points towards. */
export const radarTextAnchor = (cosine: number, threshold = 0.25): RadarTextAnchor => {
  if (cosine > threshold) return "start";
  if (cosine < -threshold) return "end";
  return "middle";
};

export const polarPoint = (
  geometry: RadarGeometry,
  radius: number,
  angle: number,
): RadarPoint => ({
  x: geometry.cx + radius * Math.cos(angle),
  y: geometry.cy + radius * Math.sin(angle),
});

export const polygonPath = (points: readonly RadarPoint[]): string => {
  if (points.length === 0) return "";
  const segments = points.map(
    (point, index) => `${index === 0 ? "M" : "L"}${round(point.x)},${round(point.y)}`,
  );
  return `${segments.join(" ")} Z`;
};

/** One closed ring of the web, drawn as a polygon so it lines up with the spokes. */
export const radarRingPath = (
  geometry: RadarGeometry,
  ratio: number,
  axisCount: number,
): string => {
  if (axisCount <= 0) return "";
  const radius = geometry.radius * clamp(ratio, 0, 1);
  const points = Array.from({ length: axisCount }, (_, index) =>
    polarPoint(geometry, radius, radarAxisAngle(index, axisCount)),
  );
  return polygonPath(points);
};

export const moatScoreRadius = (score: number, geometry: RadarGeometry): number =>
  (clamp(score, 0, MOAT_MAX_SCORE) / MOAT_MAX_SCORE) * geometry.radius;

export type MoatRadarInputCompany = {
  id: string;
  name: string;
  moats: Record<MoatKey, MoatScore>;
};

export type MoatVertex = {
  /** Stable across re-renders so roving focus survives a company being removed. */
  id: string;
  companyId: string;
  companyName: string;
  companyIndex: number;
  moatKey: MoatKey;
  axisIndex: number;
  score: MoatScore;
  angle: number;
  point: RadarPoint;
};

/**
 * Vertices in company-major order, so a 7-column keyboard grid steps sideways
 * through the moats of one company and vertically between companies.
 */
export const moatRadarVertices = (
  companies: readonly MoatRadarInputCompany[],
  geometry: RadarGeometry,
  axes: readonly MoatKey[] = MOAT_AXIS_ORDER,
): MoatVertex[] => {
  const vertices: MoatVertex[] = [];
  companies.forEach((company, companyIndex) => {
    axes.forEach((moatKey, axisIndex) => {
      const score = company.moats[moatKey];
      const angle = radarAxisAngle(axisIndex, axes.length);
      vertices.push({
        id: `${company.id}:${moatKey}`,
        companyId: company.id,
        companyName: company.name,
        companyIndex,
        moatKey,
        axisIndex,
        score,
        angle,
        point: polarPoint(geometry, moatScoreRadius(score, geometry), angle),
      });
    });
  });
  return vertices;
};

export const moatPolygonPath = (
  company: MoatRadarInputCompany,
  geometry: RadarGeometry,
  axes: readonly MoatKey[] = MOAT_AXIS_ORDER,
): string =>
  polygonPath(
    axes.map((moatKey, axisIndex) =>
      polarPoint(
        geometry,
        moatScoreRadius(company.moats[moatKey], geometry),
        radarAxisAngle(axisIndex, axes.length),
      ),
    ),
  );

// --- emerging radar ----------------------------------------------------------

/** A category's sector, in radians, measured from the top and running clockwise. */
export const categorySector = (
  category: Category,
): { startAngle: number; endAngle: number; index: number } => {
  const count = CATEGORY_ORDER.length;
  const index = Math.max(0, CATEGORY_ORDER.indexOf(category));
  const span = (Math.PI * 2) / count;
  const startAngle = -Math.PI / 2 + index * span;
  return { startAngle, endAngle: startAngle + span, index };
};

/** [0, 1) derived from the id, so a dot lands in the same place on every render. */
export const stableFraction = (id: string, salt: string): number =>
  angleFromId(`${id}~${salt}`) / (Math.PI * 2);

export const horizonRingIndex = (horizon: Horizon): number => {
  const index = HORIZON_RINGS.indexOf(horizon);
  return index === -1 ? HORIZON_RINGS.length - 1 : index;
};

export type EmergingRadarOptions = {
  maxDotRadius?: number;
  /** Fraction of a ring band kept clear at each edge, so dots stay inside it. */
  ringInset?: number;
  /** Fraction of a sector kept clear at each edge, so dots stay inside it. */
  sectorInset?: number;
  /** Clear space kept between two dots during relaxation, in pixels. */
  dotPadding?: number;
  /** Relaxation passes; deterministic, so the same input always settles the same. */
  iterations?: number;
  /** Room reserved beside the ring-label spoke, in pixels. */
  labelSpokeClearPx?: number;
};

/**
 * Ring boundaries as a fraction of the outer radius. Equal area per ring rather
 * than equal width, because the nearest horizon is the crowded one: half the
 * candidate markets sit in the two-year ring, and a linear split gives that ring
 * the smallest disc on the chart.
 */
export const RING_INNER_RATIO = 0.16;

export const horizonRingBounds = (ringIndex: number): { inner: number; outer: number } => {
  const count = HORIZON_RINGS.length;
  const index = Math.round(clamp(ringIndex, 0, count - 1));
  const inner = index === 0 ? RING_INNER_RATIO : Math.sqrt(index / count);
  return { inner, outer: Math.sqrt((index + 1) / count) };
};

/** The spoke the ring labels run along: straight up, on a sector boundary. */
export const RING_LABEL_ANGLE = -Math.PI / 2;

const TAU = Math.PI * 2;

const isLabelSpoke = (angle: number): boolean => {
  const delta = Math.abs(((angle - RING_LABEL_ANGLE) % TAU) / TAU);
  return delta < 1e-6 || Math.abs(delta - 1) < 1e-6;
};

export type EmergingDot = {
  id: string;
  market: EmergingMarket;
  point: RadarPoint;
  radius: number;
  /** Sum of the market's signal strengths; dot area is proportional to it. */
  strength: number;
  ringIndex: number;
  sectorIndex: number;
  angle: number;
};

type PlacedDot = EmergingDot & { distance: number };

/**
 * Pushes a dot back into its own ring band and its own sector, and away from the
 * spoke the ring labels run along. Every constraint is expressed in pixels, so a
 * fat dot in the narrow inner ring is handled the same way as a small one.
 */
const constrainDot = (
  dot: PlacedDot,
  geometry: RadarGeometry,
  sectorInset: number,
  labelSpokeClearPx: number,
): PlacedDot => {
  const sector = categorySector(dot.market.category);
  const bounds = horizonRingBounds(dot.ringIndex);
  const minRadius = geometry.radius * bounds.inner + dot.radius + 1;
  const maxRadius = geometry.radius * bounds.outer - dot.radius - 1;
  const distance =
    maxRadius <= minRadius
      ? (geometry.radius * (bounds.inner + bounds.outer)) / 2
      : clamp(dot.distance, minRadius, maxRadius);

  const span = sector.endAngle - sector.startAngle;
  const baseInset = span * sectorInset;
  const spokeInset = (labelSpokeClearPx + dot.radius) / Math.max(1, distance);
  const startInset = isLabelSpoke(sector.startAngle) ? Math.max(baseInset, spokeInset) : baseInset;
  const endInset = isLabelSpoke(sector.endAngle) ? Math.max(baseInset, spokeInset) : baseInset;

  const budget = span * 0.9;
  const scale = startInset + endInset > budget ? budget / (startInset + endInset) : 1;
  const angle = clamp(
    dot.angle,
    sector.startAngle + startInset * scale,
    sector.endAngle - endInset * scale,
  );

  return { ...dot, angle, distance, point: polarPoint(geometry, distance, angle) };
};

/**
 * Relaxes overlapping dots apart along their ring and sector. Several of the
 * candidate markets sit in the two-year ring, so the hash placement alone stacks
 * them; this pushes each overlapping pair apart and then puts every dot back
 * inside its own band, so each one stays individually hoverable and focusable.
 */
const relaxDots = (
  dots: readonly PlacedDot[],
  geometry: RadarGeometry,
  sectorInset: number,
  labelSpokeClearPx: number,
  dotPadding: number,
  iterations: number,
): PlacedDot[] => {
  let current = dots.map((dot) => constrainDot(dot, geometry, sectorInset, labelSpokeClearPx));

  for (let pass = 0; pass < iterations; pass += 1) {
    let moved = false;
    const next = current.map((dot) => ({ ...dot }));

    for (let i = 0; i < next.length; i += 1) {
      for (let j = i + 1; j < next.length; j += 1) {
        const a = next[i];
        const b = next[j];
        if (!a || !b) continue;
        const minimum = a.radius + b.radius + dotPadding;
        const dx = b.point.x - a.point.x;
        const dy = b.point.y - a.point.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= minimum) continue;

        moved = true;
        // Coincident dots are separated along the ring rather than at random.
        const ux = distance === 0 ? Math.cos(a.angle + Math.PI / 2) : dx / distance;
        const uy = distance === 0 ? Math.sin(a.angle + Math.PI / 2) : dy / distance;
        const shift = ((minimum - distance) / 2) * 0.6;

        next[i] = { ...a, point: { x: a.point.x - ux * shift, y: a.point.y - uy * shift } };
        next[j] = { ...b, point: { x: b.point.x + ux * shift, y: b.point.y + uy * shift } };
      }
    }

    if (!moved) return current;

    current = next.map((dot) => {
      const dx = dot.point.x - geometry.cx;
      const dy = dot.point.y - geometry.cy;
      return constrainDot(
        { ...dot, angle: Math.atan2(dy, dx), distance: Math.hypot(dx, dy) },
        geometry,
        sectorInset,
        labelSpokeClearPx,
      );
    });
  }

  return current;
};

/**
 * Places every emerging market: ring from `horizon`, sector from `category`,
 * angle inside the sector from the id hash and area from the summed signal
 * strength, then relaxes the dots apart so none of them hides another. Reading
 * order is category, then horizon, then name.
 */
export const emergingRadarDots = (
  markets: readonly EmergingMarket[],
  geometry: RadarGeometry,
  options: EmergingRadarOptions = {},
): EmergingDot[] => {
  const {
    maxDotRadius = 13,
    ringInset = 0.16,
    sectorInset = 0.1,
    dotPadding = 4,
    iterations = 60,
    labelSpokeClearPx = 22,
  } = options;
  if (markets.length === 0) return [];

  const strengths = markets.map((market) => signalStrengthTotal(market));
  const maxStrength = strengths.reduce((max, value) => Math.max(max, value), 0);
  const radiusScale = bubbleRadiusScale(maxStrength, Math.max(4, maxDotRadius));

  const ordered = [...markets].sort((a, b) => {
    const categoryDelta = categorySector(a.category).index - categorySector(b.category).index;
    if (categoryDelta !== 0) return categoryDelta;
    const ringDelta = horizonRingIndex(a.horizon) - horizonRingIndex(b.horizon);
    if (ringDelta !== 0) return ringDelta;
    return a.name.localeCompare(b.name);
  });

  const placed: PlacedDot[] = ordered.map((market) => {
    const sector = categorySector(market.category);
    const ringIndex = horizonRingIndex(market.horizon);
    const strength = signalStrengthTotal(market);
    const bounds = horizonRingBounds(ringIndex);
    const band = bounds.outer - bounds.inner;
    const ratio =
      bounds.inner +
      band * ringInset +
      stableFraction(market.id, "ring") * band * (1 - ringInset * 2);
    const distance = geometry.radius * ratio;

    const span = sector.endAngle - sector.startAngle;
    const angle =
      sector.startAngle +
      span * sectorInset +
      stableFraction(market.id, "angle") * span * (1 - sectorInset * 2);

    return {
      id: market.id,
      market,
      point: polarPoint(geometry, distance, angle),
      radius: radiusScale(strength),
      strength,
      ringIndex,
      sectorIndex: sector.index,
      angle,
      distance,
    };
  });

  return relaxDots(placed, geometry, sectorInset, labelSpokeClearPx, dotPadding, iterations).map(
    ({ distance: _distance, ...dot }) => dot,
  );
};

/** Where a sector's label sits: just outside the outer ring, mid-sector. */
export const sectorLabelPoint = (
  category: Category,
  geometry: RadarGeometry,
  offset = 18,
): RadarPoint => {
  const sector = categorySector(category);
  const midAngle = (sector.startAngle + sector.endAngle) / 2;
  return polarPoint(geometry, geometry.radius + offset, midAngle);
};

/** The dividing spokes between category sectors. */
export const sectorDividerPoints = (geometry: RadarGeometry): RadarPoint[] =>
  CATEGORY_ORDER.map((category) =>
    polarPoint(geometry, geometry.radius, categorySector(category).startAngle),
  );
