import { describe, expect, it } from "vitest";

import {
  MIN_BUBBLE_RADIUS,
  bubbleGrowthDomain,
  bubbleRadiusScaleFor,
  bubbleReadingOrder,
  bubbleRevenueDomain,
  isSizedByMetric,
} from "@/components/charts/primitives/atlasBubbleMath";
import type { Company, DataPoint } from "@/data/types";
import type { BubbleDatum } from "@/lib/selectors";

const point = (value: number, year: number): DataPoint => ({
  value,
  year,
  unit: "USD_B",
  sourceId: "S01",
  confidence: "reported",
});

const company = (id: string): Company => ({
  id,
  name: id,
  founded: 2000,
  archetype: "best-of-breed",
  secondaryArchetypes: [],
  hq: "Somewhere",
  status: "public",
  revenueByYear: [],
  marketIds: [],
  moats: { network: 0, switching: 0, scale: 0, data: 0, brand: 0, ecosystem: 0, regulatory: 0 },
  moatRationale: "",
});

const datum = (id: string, revenue: number, size: number, metric: BubbleDatum["sizeMetric"]): BubbleDatum => ({
  company: company(id),
  revenue,
  revenueBasis: point(revenue, 2024),
  growth: 10,
  size,
  sizeBasis: point(size, 2024),
  sizeMetric: metric,
    revenueInterpolated: false,
    sizeInterpolated: false,
});

describe("bubbleRadiusScaleFor", () => {
  it("encodes a magnitude metric by area, anchored at zero", () => {
    const scale = bubbleRadiusScaleFor([1, 4, 16], "revenue", 40);
    expect(scale.kind).toBe("area");
    expect(scale.domainMax).toBe(16);
    // Four times the revenue is twice the radius, so the ink quadruples.
    const span = (value: number): number => scale.radius(value) - MIN_BUBBLE_RADIUS;
    expect(span(16) / span(4)).toBeCloseTo(2, 5);
    expect(span(4) / span(1)).toBeCloseTo(2, 5);
  });

  it("keeps gross margin on a linear 0-100 radius so clustered margins stay apart", () => {
    const scale = bubbleRadiusScaleFor([65, 75, 85], "grossMargin", 40);
    expect(scale.kind).toBe("linear");
    expect(scale.domainMax).toBe(100);
    expect(scale.observed).toEqual([65, 85]);

    const span = (value: number): number => scale.radius(value) - MIN_BUBBLE_RADIUS;
    // A 20-point margin gap is roughly a quarter of the radius, not a rounding error.
    expect(span(85) / span(65)).toBeCloseTo(85 / 65, 5);

    // The √ alternative over the observed range would have been near-flat.
    const sqrtRatio = Math.sqrt(85) / Math.sqrt(65);
    expect(span(85) / span(65)).toBeGreaterThan(sqrtRatio);
  });

  it("never returns a zero radius, so every mark stays hoverable", () => {
    const scale = bubbleRadiusScaleFor([], "revenue", 30);
    expect(scale.radius(0)).toBe(MIN_BUBBLE_RADIUS);
    expect(scale.radius(Number.NaN)).toBe(MIN_BUBBLE_RADIUS);
    expect(scale.observed).toBeNull();
  });

  it("offers legend reference values inside the observed range", () => {
    const scale = bubbleRadiusScaleFor([35.4, 90.6], "grossMargin", 30);
    expect(scale.legendValues[0]).toBe(35);
    expect(scale.legendValues[scale.legendValues.length - 1]).toBe(95);
  });
});

describe("bubble domains", () => {
  it("always keeps the zero growth line on the growth axis", () => {
    const [low, high] = bubbleGrowthDomain([12, 40, 31]);
    expect(low).toBeLessThan(0);
    expect(high).toBeGreaterThan(40);
  });

  it("falls back to a readable domain when nothing is plotted", () => {
    expect(bubbleGrowthDomain([])).toEqual([-20, 60]);
    expect(bubbleRevenueDomain([])).toEqual([0.01, 100]);
  });

  it("gives a single-company revenue domain room on both sides", () => {
    expect(bubbleRevenueDomain([10])).toEqual([5, 20]);
  });
});

describe("metric matching and ordering", () => {
  it("treats a revenue fallback as unsized when gross margin was asked for", () => {
    expect(isSizedByMetric(datum("a", 10, 80, "grossMargin"), "grossMargin")).toBe(true);
    expect(isSizedByMetric(datum("b", 10, 10, "revenue"), "grossMargin")).toBe(false);
  });

  it("reads left to right along the revenue axis", () => {
    const order = bubbleReadingOrder([
      datum("big", 50, 50, "revenue"),
      datum("small", 2, 2, "revenue"),
      datum("mid", 9, 9, "revenue"),
    ]);
    expect(order.map((item) => item.company.id)).toEqual(["small", "mid", "big"]);
  });
});
