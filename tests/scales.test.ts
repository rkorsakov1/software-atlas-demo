import { describe, expect, it } from "vitest";

import type { DataPoint } from "@/data/types";
import {
  angleFromId,
  dataPointExtent,
  extentOf,
  growthAtYear,
  spansDefinitionBreak,
  valueAtYear,
} from "@/lib/scales";

const point = (year: number, value: number, extra: Partial<DataPoint> = {}): DataPoint => ({
  value,
  year,
  unit: "USD_B",
  sourceId: "S01",
  confidence: "reported",
  ...extra,
});

const series: DataPoint[] = [point(2010, 10), point(2015, 20), point(2020, 40)];

describe("valueAtYear", () => {
  it("returns the reported point when the year matches exactly", () => {
    const result = valueAtYear(series, 2015);
    expect(result).toEqual({ value: 20, interpolated: false, basis: series[1] });
  });

  it("interpolates linearly between bracketing points and flags it", () => {
    const result = valueAtYear(series, 2012);
    expect(result?.interpolated).toBe(true);
    expect(result?.value).toBeCloseTo(14, 10);
  });

  it("clamps outside the series rather than extrapolating", () => {
    expect(valueAtYear(series, 1990)?.value).toBe(10);
    expect(valueAtYear(series, 2030)?.value).toBe(40);
    expect(valueAtYear(series, 1990)?.interpolated).toBe(true);
  });

  it("returns null for an empty series", () => {
    expect(valueAtYear([], 2020)).toBeNull();
  });

  it("does not depend on input order", () => {
    const shuffled = [series[2], series[0], series[1]].filter(
      (entry): entry is DataPoint => entry !== undefined,
    );
    expect(valueAtYear(shuffled, 2012)?.value).toBeCloseTo(14, 10);
  });
});

describe("growthAtYear", () => {
  it("derives year-over-year growth in percent", () => {
    const annual = [point(2019, 100), point(2020, 125)];
    expect(growthAtYear(annual, 2020)).toBeCloseTo(25, 10);
  });

  it("returns null when the prior year is zero or missing", () => {
    expect(growthAtYear([point(2020, 5)], 2020)).toBeNull();
    expect(growthAtYear([point(2019, 0), point(2020, 5)], 2020)).toBeNull();
  });
});

describe("extentOf", () => {
  it("falls back when there is nothing finite to measure", () => {
    expect(extentOf([], [0, 1])).toEqual([0, 1]);
    expect(extentOf([Number.NaN], [2, 3])).toEqual([2, 3]);
  });

  it("widens a degenerate extent so scales stay usable", () => {
    const [min, max] = extentOf([7, 7], [0, 1]);
    expect(min).toBe(7);
    expect(max).toBeGreaterThan(min);
  });

  it("spans low and high on ranged data points", () => {
    const ranged = [point(2020, 10, { low: 6, high: 18 })];
    expect(dataPointExtent(ranged, [0, 1])).toEqual([6, 18]);
  });
});

describe("angleFromId", () => {
  it("is stable for the same id and inside one turn", () => {
    const first = angleFromId("agentic-ops");
    expect(angleFromId("agentic-ops")).toBe(first);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(Math.PI * 2);
  });

  it("separates different ids", () => {
    expect(angleFromId("a")).not.toBe(angleFromId("b"));
  });
});

describe("growth across a definition break", () => {
  const defined = (year: number, value: number, definition: string): DataPoint => ({
    value,
    year,
    unit: "USD_B",
    sourceId: "S01",
    confidence: "reported",
    definition,
  });
  const series = [defined(2015, 26.3, "narrow"), defined(2018, 48.2, "wide"), defined(2019, 61.6, "wide")];

  it("is not computed where the definition changes", () => {
    expect(growthAtYear(series, 2016)).toBeNull();
    expect(spansDefinitionBreak(series, 2017, 2018)).toBe(true);
  });

  it("is computed within one definition", () => {
    expect(growthAtYear(series, 2019)).toBeCloseTo(27.8, 1);
  });
});
