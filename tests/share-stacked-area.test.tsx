import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ShareStackedArea } from "@/components/charts/ShareStackedArea";
import type { DataPoint } from "@/data/types";
import type { ShareSeriesPoint } from "@/lib/selectors";

afterEach(cleanup);

const sharePoint = (value: number, year: number, confidence: DataPoint["confidence"]): DataPoint => ({
  value,
  year,
  unit: "percent",
  sourceId: "S01",
  confidence,
});

const series: ShareSeriesPoint[] = [
  {
    year: 2022,
    shares: [
      { companyId: "aws", value: 34, point: sharePoint(34, 2022, "estimated") },
      { companyId: "azure", value: 21, point: sharePoint(21, 2022, "estimated") },
      { companyId: "gcp", value: 11, point: sharePoint(11, 2022, "estimated") },
    ],
    other: 34,
    hhi: 1597,
    top3: 55,
  },
  {
    year: 2023,
    shares: [
      { companyId: "aws", value: 31, point: sharePoint(31, 2023, "estimated") },
      { companyId: "azure", value: 24, point: sharePoint(24, 2023, "estimated") },
      { companyId: "gcp", value: 11, point: sharePoint(11, 2023, "estimated") },
    ],
    other: 34,
    hhi: 1537,
    top3: 55,
  },
];

const sourceTitleFor = (sourceId: string): string => `Source ${sourceId} — Test Publisher`;

describe("ShareStackedArea", () => {
  it("names the market in an explicit empty state instead of drawing a stack", () => {
    render(
      <ShareStackedArea
        marketName="CRM"
        series={[]}
        companyNames={{}}
        events={[]}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    expect(screen.getByText("No reliable public share data")).toBeDefined();
    expect(screen.getByRole("status").textContent).toContain("CRM");
    expect(screen.queryByRole("button", { name: /view as table/i })).toBeNull();
  });

  it("renders one focusable year column per published year, labelled with the values", () => {
    render(
      <ShareStackedArea
        marketName="Cloud infrastructure"
        series={series}
        companyNames={{ aws: "AWS", azure: "Microsoft Azure", gcp: "Google Cloud" }}
        events={[]}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    const columns = screen.getAllByRole("button", { name: /^20\d\d:/ });
    expect(columns).toHaveLength(2);
    expect(columns[0]?.getAttribute("aria-label")).toContain("AWS 34.0%");
    expect(columns[0]?.getAttribute("aria-label")).toContain("HHI 1,597");

    // Exactly one roving tab stop across the year columns.
    expect(columns.filter((node) => node.getAttribute("tabindex") === "0")).toHaveLength(1);
  });

  it("offers a table alternative and labels the residual band as modeled", () => {
    render(
      <ShareStackedArea
        marketName="Cloud infrastructure"
        series={series}
        companyNames={{ aws: "AWS", azure: "Microsoft Azure", gcp: "Google Cloud" }}
        events={[]}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    expect(screen.getByRole("button", { name: /view as table/i })).toBeDefined();
    expect(screen.getAllByText(/Other \/ not separately reported/).length).toBeGreaterThan(0);
  });

  it("draws a sparse series as vendor lines, without an Other band or HHI", () => {
    const sparse = series.map((point) => ({ ...point, shares: point.shares.slice(0, 1) }));
    render(
      <ShareStackedArea
        marketName="CRM"
        series={sparse}
        companyNames={{ aws: "AWS" }}
        events={[]}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    expect(screen.queryAllByText(/Other \/ not separately reported/)).toHaveLength(0);
    expect(screen.queryAllByText(/HHI \(right axis/)).toHaveLength(0);
    expect(screen.getByText(/Too few vendors are named/)).toBeDefined();
  });
});
