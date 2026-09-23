import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CompetitiveBubble } from "@/components/charts/CompetitiveBubble";
import type { Archetype, Company, DataPoint } from "@/data/types";
import { INTERPOLATED_BUBBLE_NOTE, type BubbleDatum } from "@/lib/selectors";

afterEach(cleanup);

const sourceTitleFor = (sourceId: string): string => `Source ${sourceId} — Test Publisher`;

const revenuePoint = (value: number): DataPoint => ({
  value,
  year: 2024,
  unit: "USD_B",
  sourceId: "S30",
  confidence: "reported",
});

const marginPoint = (value: number): DataPoint => ({
  value,
  year: 2024,
  unit: "percent",
  sourceId: "S30",
  confidence: "modeled",
  note: "Modeled: 1 − cost of revenue ÷ revenue, both as filed.",
});

const company = (id: string, name: string, archetype: Archetype): Company => ({
  id,
  name,
  founded: 1999,
  archetype,
  secondaryArchetypes: [],
  hq: "United States",
  status: "public",
  revenueByYear: [],
  marketIds: [],
  moats: { network: 0, switching: 0, scale: 0, data: 0, brand: 0, ecosystem: 0, regulatory: 0 },
  moatRationale: "",
});

const withMargin: BubbleDatum = {
  company: company("salesforce", "Salesforce", "suite-consolidator"),
  revenue: 34.9,
  revenueBasis: revenuePoint(34.9),
  growth: 11.2,
  size: 75.5,
  sizeBasis: marginPoint(75.5),
  sizeMetric: "grossMargin",
    revenueInterpolated: false,
    sizeInterpolated: false,
};

const withoutMargin: BubbleDatum = {
  company: company("oracle", "Oracle", "platform-giant"),
  revenue: 50,
  revenueBasis: revenuePoint(50),
  growth: 6,
  size: 50,
  sizeBasis: revenuePoint(50),
  sizeMetric: "revenue",
    revenueInterpolated: false,
    sizeInterpolated: false,
};

describe("CompetitiveBubble", () => {
  it("explains why a year with no usable revenue series draws nothing", () => {
    render(
      <CompetitiveBubble
        data={[]}
        year={2024}
        minYear={2015}
        maxYear={2024}
        sizeMetric="grossMargin"
        pinnedIds={[]}
        trails={{}}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    expect(screen.getByText("No companies can be plotted for this year")).toBeDefined();
    expect(screen.getByRole("status").textContent).toContain("2023");
  });

  it("labels every bubble with its value, year and growth, with one roving tab stop", () => {
    render(
      <CompetitiveBubble
        data={[withMargin, withoutMargin]}
        year={2024}
        minYear={2015}
        maxYear={2024}
        sizeMetric="grossMargin"
        pinnedIds={[]}
        trails={{}}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    const marks = screen.getAllByRole("button", { name: /revenue \$/ });
    expect(marks).toHaveLength(2);
    expect(marks.filter((node) => node.getAttribute("tabindex") === "0")).toHaveLength(1);

    const salesforce = marks.find((node) => node.getAttribute("aria-label")?.startsWith("Salesforce"));
    expect(salesforce?.getAttribute("aria-label")).toContain("2024");
    expect(salesforce?.getAttribute("aria-label")).toContain("growth +11.2%");
    expect(salesforce?.getAttribute("aria-label")).toContain("gross margin 75.5%");
  });

  it("says so rather than mis-sizing a company with no figure for the chosen metric", () => {
    render(
      <CompetitiveBubble
        data={[withMargin, withoutMargin]}
        year={2024}
        minYear={2015}
        maxYear={2024}
        sizeMetric="grossMargin"
        pinnedIds={[]}
        trails={{}}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    const oracle = screen
      .getAllByRole("button", { name: /revenue \$/ })
      .find((node) => node.getAttribute("aria-label")?.startsWith("Oracle"));
    expect(oracle?.getAttribute("aria-label")).toContain("no gross margin figure");
    expect(screen.getByText(/drawn as small dashed rings/)).toBeDefined();
  });

  it("drops a mark label rather than printing it over the one already drawn", () => {
    const onTopOfSalesforce: BubbleDatum = {
      ...withMargin,
      company: company("sap", "SAP", "suite-consolidator"),
    };

    const { container } = render(
      <CompetitiveBubble
        data={[withMargin, onTopOfSalesforce]}
        year={2024}
        minYear={2015}
        maxYear={2024}
        sizeMetric="grossMargin"
        pinnedIds={[]}
        trails={{}}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    const drawn = [...container.querySelectorAll("svg text")].map((node) => node.textContent);
    expect(drawn).toContain("Salesforce");
    expect(drawn).not.toContain("SAP");
    // The name a reader cannot see on the mark is still on the mark itself.
    const sap = screen
      .getAllByRole("button", { name: /revenue \$/ })
      .find((node) => node.getAttribute("aria-label")?.startsWith("SAP"));
    expect(sap).toBeDefined();
    expect(sap?.querySelector("title")?.textContent).toBe("SAP");
  });

  it("never offers market cap when the dataset cannot back it, and says why", () => {
    render(
      <CompetitiveBubble
        data={[withMargin, withoutMargin]}
        year={2024}
        minYear={2015}
        maxYear={2024}
        sizeMetric="grossMargin"
        availableSizeMetrics={["grossMargin", "revenue"]}
        pinnedIds={[]}
        trails={{}}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    expect(screen.queryByRole("radio", { name: "Market cap" })).toBeNull();
    expect(screen.getByText(/Market capitalisation is not offered/)).toBeDefined();
    expect(screen.getByRole("button", { name: /view as table/i })).toBeDefined();
  });
});

describe("CompetitiveBubble interpolated marks (CONTRACTS §11.2)", () => {
  const interpolated: BubbleDatum = {
    company: company("oracle", "Oracle", "platform-giant"),
    revenue: 26.8,
    // The basis is the neighbouring filed year, which is `reported`. The value
    // plotted for this year was interpolated, so the mark must not inherit it.
    revenueBasis: revenuePoint(26.8),
    growth: 4.2,
    size: 26.8,
    sizeBasis: revenuePoint(26.8),
    sizeMetric: "revenue",
    revenueInterpolated: true,
    sizeInterpolated: true,
  };

  const reported: BubbleDatum = {
    company: company("adobe", "Adobe", "suite-consolidator"),
    revenue: 19.4,
    revenueBasis: revenuePoint(19.4),
    growth: 10,
    size: 19.4,
    sizeBasis: revenuePoint(19.4),
    sizeMetric: "revenue",
    revenueInterpolated: false,
    sizeInterpolated: false,
  };

  const renderChart = (): void => {
    render(
      <CompetitiveBubble
        data={[interpolated, reported]}
        year={2010}
        minYear={2005}
        maxYear={2015}
        sizeMetric="revenue"
        pinnedIds={[]}
        trails={{}}
        sourceTitleFor={sourceTitleFor}
      />,
    );
  };

  const markFor = (name: string): HTMLElement | undefined =>
    screen
      .getAllByRole("button", { name: /revenue \$/ })
      .find((node) => node.getAttribute("aria-label")?.startsWith(name));

  it("tells a screen-reader user the figure was interpolated, not reported", () => {
    renderChart();

    const oracle = markFor("Oracle");
    expect(oracle?.getAttribute("aria-label")).toContain("(modeled, interpolated)");
    expect(oracle?.getAttribute("aria-label")).toContain("No figure was filed for 2010");
    expect(oracle?.getAttribute("aria-label")).not.toContain("(reported)");

    const adobe = markFor("Adobe");
    expect(adobe?.getAttribute("aria-label")).toContain("(reported)");
    expect(adobe?.getAttribute("aria-label")).not.toContain("interpolated");
  });

  it("draws an interpolated mark in the modeled style even when its basis is reported", () => {
    renderChart();

    expect(markFor("Oracle")?.getAttribute("stroke-dasharray")).toBe("5 3");
    expect(markFor("Adobe")?.getAttribute("stroke-dasharray")).toBeNull();
  });

  it("says in the tooltip that the value was interpolated", () => {
    renderChart();

    const oracle = markFor("Oracle");
    if (!oracle) throw new Error("Oracle mark was not rendered");
    fireEvent.mouseEnter(oracle);

    expect(screen.getAllByTitle(INTERPOLATED_BUBBLE_NOTE).length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(INTERPOLATED_BUBBLE_NOTE.slice(0, 40)))).toBeDefined();
  });

  it("carries the interpolation note into the table row's confidence badge", () => {
    renderChart();

    fireEvent.click(screen.getByRole("button", { name: /view as table/i }));
    expect(screen.getAllByTitle(INTERPOLATED_BUBBLE_NOTE)).toHaveLength(1);
  });
});
