import { describe, expect, it } from "vitest";

import {
  HORIZON_RINGS,
  MOAT_AXIS_ORDER,
  RING_INNER_RATIO,
  RING_LABEL_ANGLE,
  MOAT_MAX_SCORE,
  categorySector,
  emergingRadarDots,
  horizonRingBounds,
  horizonRingIndex,
  moatRadarVertices,
  moatScoreRadius,
  polarPoint,
  polygonPath,
  radarAxisAngle,
  radarRingPath,
  stableFraction,
  type RadarGeometry,
} from "@/components/charts/primitives/atlasRadarMath";
import type { EmergingMarket, MoatKey, MoatScore } from "@/data/types";

const geometry: RadarGeometry = { cx: 200, cy: 150, radius: 100 };

const moats = (scores: readonly number[]): Record<MoatKey, MoatScore> => {
  const record = {} as Record<MoatKey, MoatScore>;
  MOAT_AXIS_ORDER.forEach((key, index) => {
    record[key] = (scores[index] ?? 0) as MoatScore;
  });
  return record;
};

const emergingMarket = (
  id: string,
  overrides: Partial<EmergingMarket> = {},
): EmergingMarket => ({
  id,
  name: id,
  category: "emerging",
  thesis: "thesis",
  signals: [{ type: "cost-curve", evidence: "evidence", strength: 2, sourceIds: ["S01"] }],
  keyPlayerIds: [],
  risks: [],
  stage: "nascent",
  horizon: "2-5y",
  ...overrides,
});

describe("radar geometry", () => {
  it("puts the first axis straight up and spaces the rest clockwise", () => {
    expect(radarAxisAngle(0, 7)).toBeCloseTo(-Math.PI / 2);
    const first = polarPoint(geometry, geometry.radius, radarAxisAngle(0, 7));
    expect(first.x).toBeCloseTo(geometry.cx);
    expect(first.y).toBeCloseTo(geometry.cy - geometry.radius);

    const quarter = polarPoint(geometry, geometry.radius, radarAxisAngle(1, 4));
    expect(quarter.x).toBeCloseTo(geometry.cx + geometry.radius);
    expect(quarter.y).toBeCloseTo(geometry.cy);
  });

  it("scales a moat score linearly and clamps outside 0-5", () => {
    expect(moatScoreRadius(0, geometry)).toBe(0);
    expect(moatScoreRadius(MOAT_MAX_SCORE, geometry)).toBe(geometry.radius);
    expect(moatScoreRadius(2.5, geometry)).toBeCloseTo(50);
    expect(moatScoreRadius(12, geometry)).toBe(geometry.radius);
  });

  it("closes every polygon and returns an empty path for no points", () => {
    expect(polygonPath([])).toBe("");
    const path = radarRingPath(geometry, 1, MOAT_AXIS_ORDER.length);
    expect(path.startsWith("M")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    expect(path.split("L")).toHaveLength(MOAT_AXIS_ORDER.length);
  });

  it("emits moat vertices in company-major order with stable ids", () => {
    const companies = [
      { id: "a", name: "A", moats: moats([5, 4, 3, 2, 1, 0, 0]) },
      { id: "b", name: "B", moats: moats([0, 1, 2, 3, 4, 5, 5]) },
    ];
    const vertices = moatRadarVertices(companies, geometry);

    expect(vertices).toHaveLength(companies.length * MOAT_AXIS_ORDER.length);
    expect(vertices[0]?.id).toBe("a:network");
    expect(vertices[MOAT_AXIS_ORDER.length]?.companyId).toBe("b");
    expect(vertices[0]?.point.y).toBeCloseTo(geometry.cy - geometry.radius);
    expect(vertices[MOAT_AXIS_ORDER.length]?.point.y).toBeCloseTo(geometry.cy);
    expect(moatRadarVertices(companies, geometry)).toEqual(vertices);
  });
});

describe("emerging radar placement", () => {
  it("orders horizon rings from nearest to furthest", () => {
    expect(HORIZON_RINGS[0]).toBe("0-2y");
    expect(horizonRingIndex("0-2y")).toBe(0);
    expect(horizonRingIndex("2-5y")).toBe(1);
    expect(horizonRingIndex("5y+")).toBe(2);
  });

  it("gives every radar category its own sector covering the full circle", () => {
    const infrastructure = categorySector("infrastructure");
    expect(infrastructure.index).toBe(0);
    expect(infrastructure.startAngle).toBeCloseTo(-Math.PI / 2);
    expect(categorySector("consumer").endAngle - infrastructure.startAngle).toBeCloseTo(
      Math.PI * 2,
    );
  });

  it("derives a stable fraction in [0, 1) from an id", () => {
    const value = stableFraction("cloud-iaas", "angle");
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
    expect(stableFraction("cloud-iaas", "angle")).toBe(value);
    expect(stableFraction("cloud-iaas", "ring")).not.toBe(value);
  });

  it("places nearer horizons closer to the centre and keeps dots inside the radar", () => {
    const near = emergingMarket("near", { horizon: "0-2y" });
    const far = emergingMarket("far", { horizon: "5y+" });
    const dots = emergingRadarDots([far, near], geometry);
    const byId = new Map(dots.map((dot) => [dot.id, dot]));

    const distance = (id: string): number => {
      const dot = byId.get(id);
      if (!dot) throw new Error(`missing dot ${id}`);
      return Math.hypot(dot.point.x - geometry.cx, dot.point.y - geometry.cy);
    };

    expect(distance("near")).toBeLessThan(distance("far"));
    expect(distance("far")).toBeLessThanOrEqual(geometry.radius);
  });

  it("sizes dots by the summed signal strength and repeats exactly", () => {
    const weak = emergingMarket("weak", {
      signals: [{ type: "cost-curve", evidence: "e", strength: 1, sourceIds: [] }],
    });
    const strong = emergingMarket("strong", {
      signals: [
        { type: "cost-curve", evidence: "e", strength: 3, sourceIds: [] },
        { type: "regulation", evidence: "e", strength: 3, sourceIds: [] },
      ],
    });
    const dots = emergingRadarDots([weak, strong], geometry);
    const weakDot = dots.find((dot) => dot.id === "weak");
    const strongDot = dots.find((dot) => dot.id === "strong");

    expect(weakDot?.strength).toBe(1);
    expect(strongDot?.strength).toBe(6);
    expect(strongDot?.radius ?? 0).toBeGreaterThan(weakDot?.radius ?? 0);
    expect(emergingRadarDots([weak, strong], geometry)).toEqual(dots);
  });

  it("returns nothing for an empty market list", () => {
    expect(emergingRadarDots([], geometry)).toEqual([]);
  });
});

describe("emerging radar rings", () => {
  it("splits the rings by equal area, so the crowded near horizon gets the room", () => {
    const bounds = HORIZON_RINGS.map((_horizon, index) => horizonRingBounds(index));

    expect(bounds[0]?.inner).toBe(RING_INNER_RATIO);
    expect(bounds[HORIZON_RINGS.length - 1]?.outer).toBeCloseTo(1);
    bounds.forEach((band, index) => {
      expect(band.outer).toBeGreaterThan(band.inner);
      const next = bounds[index + 1];
      if (next) expect(next.inner).toBeCloseTo(band.outer);
    });

    const innerWidth = (bounds[0]?.outer ?? 0) - (bounds[0]?.inner ?? 0);
    const outerWidth = (bounds[2]?.outer ?? 0) - (bounds[2]?.inner ?? 0);
    expect(innerWidth).toBeGreaterThan(outerWidth);
  });
});

describe("emerging radar dot relaxation", () => {
  const crowded: EmergingMarket[] = Array.from({ length: 6 }, (_unused, index) =>
    emergingMarket(`near-${index}`, { horizon: "0-2y", category: "infrastructure" }),
  );
  const roomy: RadarGeometry = { cx: 320, cy: 300, radius: 260 };

  const overlappingPairs = (dots: readonly { point: { x: number; y: number }; radius: number }[]) => {
    const pairs: number[] = [];
    for (let i = 0; i < dots.length; i += 1) {
      for (let j = i + 1; j < dots.length; j += 1) {
        const a = dots[i];
        const b = dots[j];
        if (!a || !b) continue;
        const distance = Math.hypot(a.point.x - b.point.x, a.point.y - b.point.y);
        if (distance < a.radius + b.radius) pairs.push(1);
      }
    }
    return pairs.length;
  };

  it("pulls six dots in one ring apart so each one is separately hoverable", () => {
    const stacked = emergingRadarDots(crowded, roomy, { iterations: 0 });
    const relaxed = emergingRadarDots(crowded, roomy);

    expect(overlappingPairs(stacked)).toBeGreaterThan(0);
    expect(overlappingPairs(relaxed)).toBe(0);
  });

  it("keeps every dot inside its own horizon band after relaxing", () => {
    const mixed: EmergingMarket[] = [
      ...crowded,
      emergingMarket("mid", { horizon: "2-5y", category: "infrastructure" }),
      emergingMarket("far", { horizon: "5y+", category: "infrastructure" }),
    ];

    for (const dot of emergingRadarDots(mixed, roomy)) {
      const bounds = horizonRingBounds(dot.ringIndex);
      const distance = Math.hypot(dot.point.x - roomy.cx, dot.point.y - roomy.cy);
      expect(distance).toBeGreaterThanOrEqual(roomy.radius * bounds.inner - 0.5);
      expect(distance).toBeLessThanOrEqual(roomy.radius * bounds.outer + 0.5);
    }
  });

  it("leaves the ring-label spoke clear", () => {
    for (const dot of emergingRadarDots(crowded, roomy)) {
      const distance = Math.hypot(dot.point.x - roomy.cx, dot.point.y - roomy.cy);
      const sweep = Math.abs(dot.angle - RING_LABEL_ANGLE);
      expect(sweep * distance).toBeGreaterThanOrEqual(20);
    }
  });

  it("settles in the same place every time it runs", () => {
    expect(emergingRadarDots(crowded, roomy)).toEqual(emergingRadarDots(crowded, roomy));
  });
});
