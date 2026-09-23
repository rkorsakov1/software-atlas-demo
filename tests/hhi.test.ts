import { describe, expect, it } from "vitest";

import {
  HHI_HIGHLY_CONCENTRATED,
  computeHhi,
  computeHhiFromFractions,
  computeTop3Share,
  computeTopNShare,
  concentrationBand,
} from "@/lib/hhi";

describe("computeHhi", () => {
  it("scores a monopoly at 10,000", () => {
    expect(computeHhi([100])).toBe(10000);
  });

  it("scores an even ten-way split at 1,000", () => {
    expect(computeHhi(Array.from({ length: 10 }, () => 10))).toBe(1000);
  });

  it("matches the worked cloud example from research 5.3", () => {
    // 30 + 20 + 13 named shares, the rest treated as a fragmented tail.
    expect(computeHhi([30, 20, 13])).toBe(900 + 400 + 169);
  });

  it("ignores non-positive and non-finite shares", () => {
    expect(computeHhi([50, 0, -10, Number.NaN])).toBe(2500);
  });

  it("never exceeds 10,000 even if inputs over-sum", () => {
    expect(computeHhi([100, 100])).toBe(10000);
  });

  it("reads fractions as well as percentages", () => {
    expect(computeHhiFromFractions([0.3, 0.2, 0.13])).toBe(computeHhi([30, 20, 13]));
  });
});

describe("top-N share", () => {
  it("sums the largest three regardless of input order", () => {
    expect(computeTop3Share([5, 30, 12, 20, 1])).toBe(62);
  });

  it("returns zero for a non-positive N", () => {
    expect(computeTopNShare([10, 20], 0)).toBe(0);
  });

  it("handles fewer entries than N", () => {
    expect(computeTop3Share([40, 10])).toBe(50);
  });
});

describe("concentrationBand", () => {
  it("uses the 2023 Merger Guidelines thresholds", () => {
    expect(concentrationBand(500)).toBe("unconcentrated");
    expect(concentrationBand(1000)).toBe("moderate");
    expect(concentrationBand(1799)).toBe("moderate");
    expect(concentrationBand(HHI_HIGHLY_CONCENTRATED)).toBe("high");
  });
});
