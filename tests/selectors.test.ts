import { describe, expect, it } from "vitest";

import type {
  BundlingFlow,
  Company,
  CompetitiveEvent,
  DataPoint,
  EmergingMarket,
  Era,
  Market,
  Source,
} from "@/data/types";
import {
  bubbleData,
  checkReferentialIntegrity,
  filterCompanies,
  filterMarkets,
  lineageGraph,
  marketAncestors,
  marketSizeAtYear,
  neighborIds,
  sankeyInput,
  searchAtlas,
  shareSeries,
  sizedMarketsAtYear,
  unsizedMarkets,
} from "@/lib/selectors";
import { ATLAS_DEFAULTS } from "@/lib/url-state";

const source: Source = {
  id: "S01",
  title: "Test source",
  publisher: "Publisher",
  date: "2025-01",
  kind: "analyst",
  url: "https://example.com/report",
  verified: true,
  reliability: "secondary",
};

const point = (year: number, value: number, extra: Partial<DataPoint> = {}): DataPoint => ({
  value,
  year,
  unit: "USD_B",
  sourceId: "S01",
  confidence: "reported",
  ...extra,
});

const market = (id: string, overrides: Partial<Market> = {}): Market => ({
  id,
  name: id,
  parentId: null,
  category: "infrastructure",
  originYear: 2000,
  definition: "definition",
  sizeByYear: [],
  pricingModel: "subscription",
  buyerPersona: "CIO",
  maturity: "mature",
  sharesByYear: [],
  description: "description",
  ...overrides,
});

const company = (id: string, overrides: Partial<Company> = {}): Company => ({
  id,
  name: id,
  founded: 1990,
  archetype: "platform-giant",
  secondaryArchetypes: [],
  hq: "Somewhere",
  status: "public",
  revenueByYear: [],
  marketIds: [],
  moats: { network: 0, switching: 0, scale: 0, data: 0, brand: 0, ecosystem: 0, regulatory: 0 },
  moatRationale: "none",
  ...overrides,
});

const event = (id: string, overrides: Partial<CompetitiveEvent> = {}): CompetitiveEvent => ({
  id,
  year: 2020,
  type: "acquisition",
  title: id,
  companyIds: [],
  marketIds: [],
  impact: "impact",
  sourceIds: ["S01"],
  ...overrides,
});

describe("filterMarkets", () => {
  const markets = [
    market("cloud", { category: "infrastructure", maturity: "mature", originYear: 2006 }),
    market("crm", { category: "horizontal", maturity: "consolidating", originYear: 1993 }),
    market("future", { category: "emerging", maturity: "nascent", originYear: 2024 }),
  ];

  it("returns everything with no filters", () => {
    expect(filterMarkets(markets, ATLAS_DEFAULTS)).toHaveLength(3);
  });

  it("filters by category and maturity", () => {
    expect(
      filterMarkets(markets, { ...ATLAS_DEFAULTS, cat: ["horizontal"] }).map((m) => m.id),
    ).toEqual(["crm"]);
    expect(
      filterMarkets(markets, { ...ATLAS_DEFAULTS, mat: ["nascent"] }).map((m) => m.id),
    ).toEqual(["future"]);
  });

  it("hides markets that do not exist yet at the end of the range", () => {
    expect(filterMarkets(markets, { ...ATLAS_DEFAULTS, to: 2010 }).map((m) => m.id)).toEqual([
      "cloud",
      "crm",
    ]);
  });
});

describe("marketAncestors", () => {
  it("walks the parent chain from the root down", () => {
    const markets = [
      market("root"),
      market("mid", { parentId: "root" }),
      market("leaf", { parentId: "mid" }),
    ];
    expect(marketAncestors(markets, "leaf").map((m) => m.id)).toEqual(["root", "mid"]);
  });

  it("stops rather than looping on a cyclic chain", () => {
    const markets = [market("a", { parentId: "b" }), market("b", { parentId: "a" })];
    expect(marketAncestors(markets, "a").length).toBeLessThanOrEqual(2);
  });
});

describe("shareSeries", () => {
  it("derives Other, HHI and top-3 per year", () => {
    const withShares = market("cloud", {
      sharesByYear: [
        {
          year: 2024,
          shares: [
            { companyId: "aws", share: { ...point(2024, 30), unit: "percent" } },
            { companyId: "microsoft", share: { ...point(2024, 20), unit: "percent" } },
            { companyId: "google", share: { ...point(2024, 13), unit: "percent" } },
          ],
        },
      ],
    });

    const series = shareSeries(withShares);
    expect(series).toHaveLength(1);
    expect(series[0]?.other).toBeCloseTo(37, 10);
    expect(series[0]?.top3).toBeCloseTo(63, 10);
    expect(series[0]?.hhi).toBe(1469);
  });
});

describe("filterCompanies", () => {
  const markets = [market("cloud", { category: "infrastructure" })];
  const companies = [
    company("aws", { archetype: "platform-giant", marketIds: ["cloud"] }),
    company("newco", { archetype: "ai-native", founded: 2024, marketIds: [] }),
  ];

  it("filters by archetype", () => {
    expect(
      filterCompanies(companies, markets, { ...ATLAS_DEFAULTS, arch: ["ai-native"] }).map(
        (c) => c.id,
      ),
    ).toEqual(["newco"]);
  });

  it("filters by the category of the markets a company sells into", () => {
    expect(
      filterCompanies(companies, markets, { ...ATLAS_DEFAULTS, cat: ["infrastructure"] }).map(
        (c) => c.id,
      ),
    ).toEqual(["aws"]);
  });

  it("matches a free-text query against the name", () => {
    expect(
      filterCompanies(companies, markets, { ...ATLAS_DEFAULTS, q: "AWS" }).map((c) => c.id),
    ).toEqual(["aws"]);
  });
});

describe("bubbleData", () => {
  it("needs both a revenue point and a prior year to derive growth", () => {
    const companies = [
      company("grower", {
        revenueByYear: [point(2019, 100), point(2020, 150)],
        marketCapByYear: [point(2020, 900)],
      }),
      company("noseries", { revenueByYear: [] }),
    ];

    const data = bubbleData(companies, 2020, "marketCap");
    expect(data.map((d) => d.company.id)).toEqual(["grower"]);
    expect(data[0]?.growth).toBeCloseTo(50, 10);
    expect(data[0]?.sizeMetric).toBe("marketCap");
  });

  it("falls back to revenue for radius when the chosen metric is missing", () => {
    const companies = [company("plain", { revenueByYear: [point(2019, 10), point(2020, 12)] })];
    expect(bubbleData(companies, 2020, "marketCap")[0]?.sizeMetric).toBe("revenue");
  });

  it("drops companies whose latest point is more than three years stale", () => {
    const companies = [company("stale", { revenueByYear: [point(2009, 5), point(2010, 6)] })];
    expect(bubbleData(companies, 2020, "marketCap")).toHaveLength(0);
  });
});

describe("lineageGraph", () => {
  const companies = [company("big"), company("small"), company("other")];
  const events = [
    event("evt-a", {
      acquirerId: "big",
      targetId: "small",
      year: 2015,
      dealValue: point(2015, 5),
    }),
    event("evt-b", {
      acquirerId: "big",
      targetId: "other",
      year: 1999,
      dealValue: point(1999, 0.2),
    }),
  ];

  it("keeps only directed acquisition and spin-off edges in range", () => {
    const graph = lineageGraph(events, companies, {
      fromYear: 2000,
      toYear: 2020,
      minDealValueUsdB: 0,
    });
    expect(graph.links.map((link) => link.id)).toEqual(["evt-a"]);
    expect(graph.nodes.map((node) => node.id).sort()).toEqual(["big", "small"]);
  });

  it("applies the minimum deal size filter", () => {
    const graph = lineageGraph(events, companies, {
      fromYear: 1990,
      toYear: 2020,
      minDealValueUsdB: 1,
    });
    expect(graph.links).toHaveLength(1);
  });

  it("reports the one-hop neighbourhood of a node", () => {
    const graph = lineageGraph(events, companies, {
      fromYear: 1990,
      toYear: 2020,
      minDealValueUsdB: 0,
    });
    expect([...neighborIds(graph, "big")].sort()).toEqual(["big", "other", "small"]);
  });
});

describe("sankeyInput", () => {
  it("builds labelled nodes and drops flows whose endpoints do not resolve", () => {
    const markets = [market("email"), market("collab")];
    const companies = [company("microsoft")];
    const flows: BundlingFlow[] = [
      {
        id: "f1",
        year: 2017,
        fromMarketId: "email",
        toId: "microsoft",
        toKind: "company-suite",
        direction: "bundle",
        weight: 3,
        eventId: "evt-a",
      },
      {
        id: "f2",
        year: 2017,
        fromMarketId: "ghost",
        toId: "collab",
        toKind: "market",
        direction: "unbundle",
        weight: 1,
        eventId: "evt-b",
      },
    ];

    const result = sankeyInput(flows, markets, companies, { fromYear: 1990, toYear: 2026 });
    expect(result.links).toHaveLength(1);
    expect(result.nodes.map((node) => node.id).sort()).toEqual([
      "company-suite:microsoft",
      "market:email",
    ]);
  });
});

describe("searchAtlas", () => {
  it("matches companies, markets and events by name", () => {
    const hits = searchAtlas(
      {
        companies: [company("slack", { name: "Slack" })],
        markets: [market("collab", { name: "Team collaboration" })],
        events: [event("evt", { title: "Slack acquired by Salesforce" })],
      },
      "slack",
    );
    expect(hits.map((hit) => hit.kind)).toEqual(["company", "event"]);
  });

  it("returns nothing for an empty query", () => {
    expect(searchAtlas({ companies: [], markets: [], events: [] }, "  ")).toEqual([]);
  });
});

describe("checkReferentialIntegrity", () => {
  const base = {
    sources: [source],
    eras: [] as Era[],
    markets: [market("cloud")],
    companies: [company("aws", { marketIds: ["cloud"] })],
    events: [] as CompetitiveEvent[],
    emerging: [] as EmergingMarket[],
    flows: [] as BundlingFlow[],
  };

  it("passes a consistent dataset", () => {
    expect(checkReferentialIntegrity(base)).toEqual([]);
  });

  it("catches an unresolved market reference", () => {
    const issues = checkReferentialIntegrity({
      ...base,
      companies: [company("aws", { marketIds: ["ghost"] })],
    });
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("ghost");
  });

  it("catches a cyclic parentId chain", () => {
    const issues = checkReferentialIntegrity({
      ...base,
      markets: [market("a", { parentId: "b" }), market("b", { parentId: "a" })],
      companies: [],
    });
    expect(issues.some((issue) => issue.message.includes("cyclic"))).toBe(true);
  });

  it("catches duplicate ids and shares that over-sum", () => {
    const issues = checkReferentialIntegrity({
      ...base,
      markets: [
        market("cloud", {
          sharesByYear: [
            {
              year: 2024,
              shares: [
                { companyId: "aws", share: { ...point(2024, 70), unit: "percent" } },
                { companyId: "aws", share: { ...point(2024, 70), unit: "percent" } },
              ],
            },
          ],
        }),
        market("cloud"),
      ],
    });
    expect(issues.some((issue) => issue.message === "duplicate id")).toBe(true);
    expect(issues.some((issue) => issue.message.includes("above 100%"))).toBe(true);
  });

  it("catches a missing sourceId on a data point", () => {
    const issues = checkReferentialIntegrity({
      ...base,
      companies: [
        company("aws", { marketIds: ["cloud"], revenueByYear: [point(2020, 1, { sourceId: "S99" })] }),
      ],
    });
    expect(issues.some((issue) => issue.message.includes("S99"))).toBe(true);
  });
});

describe("market sizes by year", () => {
  const streaming = market("streaming", { originYear: 2007, sizeByYear: [point(2025, 250)] });
  const cloud = market("cloud", {
    originYear: 2006,
    sizeByYear: [point(2014, 15), point(2020, 129)],
  });

  it("never sizes a market before it existed or before its first data point", () => {
    expect(marketSizeAtYear(streaming, 1965)).toBeNull();
    expect(marketSizeAtYear(streaming, 2015)).toBeNull();
    expect(marketSizeAtYear(cloud, 2010)).toBeNull();
  });

  it("interpolates inside the series and carries forward only briefly", () => {
    expect(marketSizeAtYear(cloud, 2017)?.value).toBeCloseTo(72);
    expect(marketSizeAtYear(cloud, 2017)?.interpolated).toBe(true);
    expect(marketSizeAtYear(cloud, 2022)?.value).toBe(129);
    expect(marketSizeAtYear(cloud, 2023)).toBeNull();
  });

  it("lists only markets that existed as unsized", () => {
    expect(sizedMarketsAtYear([streaming, cloud], 2016).map((entry) => entry.market.id)).toEqual(["cloud"]);
    expect(unsizedMarkets([streaming, cloud], 2016).map((entry) => entry.id)).toEqual(["streaming"]);
    expect(unsizedMarkets([streaming, cloud], 1990)).toEqual([]);
  });
});
