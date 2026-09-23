import { describe, expect, it } from "vitest";

import {
  INTERPOLATION_NOTE,
  OTHER_SHARE_KEY,
  activeEventLanes,
  bubbleMarkConfidence,
  clampYear,
  eventPosition,
  isSparseShareSeries,
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
import { eventTypeColor, isStructuralBreak } from "@/components/charts/primitives/eventStyles";
import type { Company, CompetitiveEvent, DataPoint, Market } from "@/data/types";
import type { BubbleDatum, ShareSeriesPoint } from "@/lib/selectors";

const point = (partial: Partial<DataPoint> & Pick<DataPoint, "value" | "year">): DataPoint => ({
  unit: "USD_B",
  sourceId: "S01",
  confidence: "reported",
  ...partial,
});

const eventOf = (partial: Partial<CompetitiveEvent> & Pick<CompetitiveEvent, "id">): CompetitiveEvent => ({
  year: 2000,
  type: "acquisition",
  title: "Test event",
  companyIds: [],
  marketIds: [],
  impact: "none",
  sourceIds: ["S01"],
  ...partial,
});

const marketOf = (sizeByYear: DataPoint[], growthRate?: DataPoint): Market => ({
  id: "m1",
  name: "Test market",
  parentId: null,
  category: "horizontal",
  originYear: 1990,
  definition: "test",
  sizeByYear,
  growthRate,
  pricingModel: "subscription",
  buyerPersona: "IT",
  maturity: "scaling",
  sharesByYear: [],
  description: "test",
});

describe("worstConfidence", () => {
  it("returns reported when nothing weakens it", () => {
    expect(worstConfidence("reported", "reported")).toBe("reported");
  });

  it("lets the least confident input win", () => {
    expect(worstConfidence("reported", "modeled", "estimated")).toBe("modeled");
    expect(worstConfidence("reported", "estimated")).toBe("estimated");
  });

  it("ignores missing inputs", () => {
    expect(worstConfidence(undefined, null, "estimated")).toBe("estimated");
    expect(worstConfidence()).toBe("reported");
  });
});

describe("eventPosition", () => {
  it("centres an undated event in its year", () => {
    expect(eventPosition({ year: 1999, month: undefined })).toBe(1999.5);
  });

  it("places a dated event inside the month", () => {
    expect(eventPosition({ year: 2000, month: 1 })).toBeCloseTo(2000 + 0.5 / 12, 6);
    expect(eventPosition({ year: 2000, month: 12 })).toBeCloseTo(2000 + 11.5 / 12, 6);
  });

  it("clamps an out-of-range month", () => {
    expect(eventPosition({ year: 2000, month: 0 })).toBeCloseTo(eventPosition({ year: 2000, month: 1 }), 6);
    expect(eventPosition({ year: 2000, month: 99 })).toBeCloseTo(eventPosition({ year: 2000, month: 12 }), 6);
  });
});

describe("activeEventLanes", () => {
  it("returns only the present types, in canonical order", () => {
    const lanes = activeEventLanes([
      eventOf({ id: "a", type: "regulation" }),
      eventOf({ id: "b", type: "platform-shift" }),
      eventOf({ id: "c", type: "acquisition" }),
      eventOf({ id: "d", type: "acquisition" }),
    ]);
    expect(lanes).toEqual(["platform-shift", "acquisition", "regulation"]);
  });

  it("is empty for no events", () => {
    expect(activeEventLanes([])).toEqual([]);
  });

  it("indexes a known lane and pushes an unknown one past the end", () => {
    const lanes = activeEventLanes([eventOf({ id: "a", type: "launch" })]);
    expect(laneIndexOf(lanes, "launch")).toBe(0);
    expect(laneIndexOf(lanes, "regulation")).toBe(lanes.length);
  });
});

describe("treemapGrowthPercent", () => {
  it("derives growth from the market's own size series", () => {
    const market = marketOf([point({ value: 100, year: 2019 }), point({ value: 125, year: 2020 })]);
    expect(treemapGrowthPercent(market, 2020)).toBeCloseTo(25, 6);
  });

  it("falls back to the published growth rate", () => {
    const market = marketOf(
      [point({ value: 100, year: 2020 })],
      point({ value: 12, year: 2020, unit: "percent" }),
    );
    expect(treemapGrowthPercent(market, 2020)).toBe(12);
  });

  it("returns null rather than guessing", () => {
    expect(treemapGrowthPercent(marketOf([point({ value: 100, year: 2020 })]), 2020)).toBeNull();
    expect(treemapGrowthPercent(marketOf([]), 2020)).toBeNull();
  });
});

describe("sizeConfidence", () => {
  it("downgrades an interpolated size to modeled", () => {
    expect(sizeConfidence("reported", true)).toBe("modeled");
    expect(sizeConfidence("estimated", true)).toBe("modeled");
  });

  it("leaves a real reported year alone", () => {
    expect(sizeConfidence("reported", false)).toBe("reported");
    expect(INTERPOLATION_NOTE.startsWith("Modeled:")).toBe(true);
  });
});

describe("share stacking", () => {
  const series: ShareSeriesPoint[] = [
    {
      year: 2020,
      shares: [
        { companyId: "small", value: 10, point: point({ value: 10, year: 2020, unit: "percent" }) },
        { companyId: "big", value: 30, point: point({ value: 30, year: 2020, unit: "percent" }) },
      ],
      other: 60,
      hhi: 1000,
      top3: 40,
    },
    {
      year: 2021,
      shares: [
        {
          companyId: "big",
          value: 34,
          point: point({ value: 34, year: 2021, unit: "percent", confidence: "estimated" }),
        },
      ],
      other: 66,
      hhi: 1156,
      top3: 34,
    },
  ];

  it("orders keys by total share with Other last", () => {
    expect(orderedShareKeys(series)).toEqual(["big", "small", OTHER_SHARE_KEY]);
  });

  it("zero-fills every key on every row", () => {
    const rows = shareStackRows(series, orderedShareKeys(series));
    expect(rows.map((row) => row.year)).toEqual([2020, 2021]);
    expect(rows[1]?.values.small).toBe(0);
    expect(rows[1]?.values.big).toBe(34);
    expect(rows[1]?.values[OTHER_SHARE_KEY]).toBe(66);
    expect(rows[1]?.points.small).toBeUndefined();
  });

  it("takes a band's confidence from its weakest point and calls Other modeled", () => {
    expect(shareBandConfidence(series, "big")).toBe("estimated");
    expect(shareBandConfidence(series, "small")).toBe("reported");
    expect(shareBandConfidence(series, OTHER_SHARE_KEY)).toBe("modeled");
  });

  it("handles an empty series", () => {
    expect(orderedShareKeys([])).toEqual([OTHER_SHARE_KEY]);
    expect(shareStackRows([], [OTHER_SHARE_KEY])).toEqual([]);
  });
});

describe("bubbleMarkConfidence", () => {
  const company: Company = {
    id: "c1",
    name: "Test",
    founded: 1990,
    archetype: "best-of-breed",
    secondaryArchetypes: [],
    hq: "Test",
    status: "public",
    revenueByYear: [],
    marketIds: [],
    moats: { network: 0, switching: 0, scale: 0, data: 0, brand: 0, ecosystem: 0, regulatory: 0 },
    moatRationale: "none",
  };

  it("takes the weaker of position and radius", () => {
    const datum: BubbleDatum = {
      company,
      revenue: 10,
      revenueBasis: point({ value: 10, year: 2020 }),
      growth: 12,
      size: 60,
      sizeBasis: point({ value: 60, year: 2020, unit: "percent", confidence: "modeled" }),
      sizeMetric: "grossMargin",
    revenueInterpolated: false,
    sizeInterpolated: false,
    };
    expect(bubbleMarkConfidence(datum)).toBe("modeled");
  });

  it("stays reported when both numbers are reported", () => {
    const datum: BubbleDatum = {
      company,
      revenue: 10,
      revenueBasis: point({ value: 10, year: 2020 }),
      growth: 12,
      size: 10,
      sizeBasis: point({ value: 10, year: 2020 }),
      sizeMetric: "revenue",
    revenueInterpolated: false,
    sizeInterpolated: false,
    };
    expect(bubbleMarkConfidence(datum)).toBe("reported");
  });

  it("demotes an interpolated value to modeled however its basis was filed", () => {
    const base: BubbleDatum = {
      company,
      revenue: 10,
      revenueBasis: point({ value: 10, year: 2020 }),
      growth: 12,
      size: 10,
      sizeBasis: point({ value: 10, year: 2020 }),
      sizeMetric: "revenue",
      revenueInterpolated: false,
      sizeInterpolated: false,
    };

    expect(bubbleMarkConfidence({ ...base, revenueInterpolated: true })).toBe("modeled");
    expect(bubbleMarkConfidence({ ...base, sizeInterpolated: true })).toBe("modeled");
    expect(bubbleMarkConfidence(base)).toBe("reported");
  });
});

describe("year playback", () => {
  it("clamps into range and rounds", () => {
    expect(clampYear(1990, 2000, 2020)).toBe(2000);
    expect(clampYear(2030, 2000, 2020)).toBe(2020);
    expect(clampYear(2010.4, 2000, 2020)).toBe(2010);
    expect(clampYear(Number.NaN, 2000, 2020)).toBe(2000);
    expect(clampYear(2010, 2020, 2000)).toBe(2020);
  });

  it("wraps at the end instead of stalling", () => {
    expect(stepYear(2019, 2000, 2020)).toBe(2020);
    expect(stepYear(2020, 2000, 2020)).toBe(2000);
    expect(stepYear(2005, 2000, 2000)).toBe(2000);
  });
});

describe("trailUpToYear", () => {
  const points = [
    { year: 2018, revenue: 1, growth: 10 },
    { year: 2019, revenue: 2, growth: 20 },
    { year: 2020, revenue: 3, growth: 30 },
  ];

  it("cuts the trail off at the year on screen", () => {
    expect(trailUpToYear(points, 2019).map((entry) => entry.year)).toEqual([2018, 2019]);
  });

  it("drops a trail that would be a single point", () => {
    expect(trailUpToYear(points, 2018)).toEqual([]);
    expect(trailUpToYear(points, 2000)).toEqual([]);
  });

  it("discards unplottable points", () => {
    const dirty = [
      { year: 2018, revenue: 0, growth: 10 },
      { year: 2019, revenue: 2, growth: Number.NaN },
      { year: 2020, revenue: 3, growth: 30 },
    ];
    expect(trailUpToYear(dirty, 2020)).toEqual([]);
  });

  it("de-duplicates repeated years", () => {
    const repeated = [...points, { year: 2020, revenue: 9, growth: 90 }];
    const trail = trailUpToYear(repeated, 2020);
    expect(trail).toHaveLength(3);
    expect(trail[2]?.revenue).toBe(9);
  });
});

describe("event styling", () => {
  it("gives every event type a colour", () => {
    expect(eventTypeColor("acquisition")).toContain("var(");
    expect(eventTypeColor("spin-off")).toContain("var(");
  });

  it("treats only platform shifts as structural breaks", () => {
    expect(isStructuralBreak("platform-shift")).toBe(true);
    expect(isStructuralBreak("acquisition")).toBe(false);
  });
});

describe("isSparseShareSeries", () => {
  const share = (companyId: string, value: number): ShareSeriesPoint["shares"][number] => ({
    companyId,
    value,
    point: { value, year: 2020, unit: "percent", sourceId: "S01", confidence: "reported" },
  });
  const year = (y: number, shares: ShareSeriesPoint["shares"]): ShareSeriesPoint => ({
    year: y,
    shares,
    other: 100 - shares.reduce((sum, item) => sum + item.value, 0),
    hhi: 0,
    top3: 0,
  });

  it("is dense when every year names the same three or more vendors", () => {
    const series = [
      year(2020, [share("a", 30), share("b", 20), share("c", 10)]),
      year(2021, [share("a", 31), share("b", 21), share("c", 9)]),
    ];
    expect(isSparseShareSeries(series)).toBe(false);
  });

  it("is sparse when a vendor drops out mid-series or a year names too few", () => {
    const gap = [
      year(2019, [share("a", 30), share("b", 20), share("c", 10)]),
      year(2020, [share("b", 20), share("c", 10), share("d", 5)]),
      year(2021, [share("a", 31), share("b", 21), share("c", 9)]),
    ];
    expect(isSparseShareSeries(gap)).toBe(true);
    expect(isSparseShareSeries([year(2020, [share("a", 30)])])).toBe(true);
  });
});
