import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MarketTreemap } from "@/components/charts/MarketTreemap";
import type { Category, DataPoint, Market } from "@/data/types";
import type { MarketSizeAtYear } from "@/lib/selectors";

afterEach(cleanup);

const sourceTitleFor = (sourceId: string): string => `Source ${sourceId} — Test Publisher`;

const sizePoint = (value: number): DataPoint => ({
  value,
  year: 2024,
  unit: "USD_B",
  sourceId: "S01",
  confidence: "reported",
});

const marketOf = (id: string, name: string, category: Category = "horizontal"): Market => ({
  id,
  name,
  parentId: null,
  category,
  originYear: 1990,
  definition: `${name} definition.`,
  sizeByYear: [sizePoint(1)],
  pricingModel: "subscription",
  buyerPersona: "IT",
  maturity: "scaling",
  sharesByYear: [],
  description: `${name} description.`,
});

const sizedOf = (id: string, name: string, value: number, category?: Category): MarketSizeAtYear => ({
  market: marketOf(id, name, category),
  value,
  interpolated: false,
  basis: sizePoint(value),
});

const tiny = Array.from({ length: 5 }, (_, index) =>
  sizedOf(`tiny${index}`, `Niche market ${index}`, 1),
);

const sized: MarketSizeAtYear[] = [
  sizedOf("crm", "Customer relationship management", 400),
  sizedOf("hcm", "Human capital management", 300),
  ...tiny,
];

const svgTexts = (container: HTMLElement): (string | null)[] =>
  Array.from(container.querySelectorAll("svg text")).map((node) => node.textContent);

const renderTreemap = (
  overrides: Partial<React.ComponentProps<typeof MarketTreemap>> = {},
) =>
  render(
    <MarketTreemap
      sized={sized}
      unsized={[marketOf("unsized", "Unsized market")]}
      year={2024}
      minYear={2015}
      maxYear={2024}
      colorBy="growth"
      sourceTitleFor={sourceTitleFor}
      {...overrides}
    />,
  );

describe("MarketTreemap tile labels", () => {
  it("draws a name that fits in full", () => {
    const { container } = renderTreemap();
    expect(svgTexts(container)).toContain("Customer relationship management");
  });

  it("never paints a name on a tile with no room for it", () => {
    const { container } = renderTreemap();
    const texts = svgTexts(container);
    for (const market of tiny) {
      expect(texts).not.toContain(market.market.name);
    }
  });

  it("keeps every name reachable through the tile's accessible name", () => {
    renderTreemap();
    expect(
      screen.getByRole("button", { name: /Customer relationship management, Horizontal apps, 2024/ }),
    ).toBeDefined();
  });
});

describe("MarketTreemap category headings", () => {
  it("draws the heading with its market count in the gutter, not behind the tiles", () => {
    const { container } = renderTreemap();
    expect(svgTexts(container)).toContain("HORIZONTAL APPS · 7");
  });

  it("gives each heading an opaque band so no tile can show through it", () => {
    const { container } = renderTreemap();
    const bands = container.querySelectorAll("svg .fill-secondary");
    expect(bands.length).toBe(1);
  });
});

describe("MarketTreemap tail pooling", () => {
  it("pools the markets too small to label into one tile", () => {
    renderTreemap();
    expect(screen.getByRole("button", { name: /Other \(5 markets\)/ })).toBeDefined();
  });

  it("names the pooled markets in the tile's accessible name", () => {
    renderTreemap();
    const tile = screen.getByRole("button", { name: /Other \(5 markets\)/ });
    expect(tile.getAttribute("aria-label")).toContain("Niche market 3");
  });

  it("says in the source line how many markets were pooled", () => {
    renderTreemap();
    expect(screen.getByText(/5 of the smallest markets are pooled/)).toBeDefined();
  });

  it("opens the category on its own when the pooled tile is activated", () => {
    renderTreemap();
    fireEvent.click(screen.getByRole("button", { name: /Other \(5 markets\)/ }));
    expect(screen.getByRole("button", { name: /Niche market 3, Horizontal apps, 2024/ })).toBeDefined();
    expect(screen.queryByRole("button", { name: /Other \(5 markets\)/ })).toBeNull();
    expect(screen.getByRole("button", { name: "All categories" })).toBeDefined();
  });

  it("returns to every category from the toolbar", () => {
    renderTreemap();
    fireEvent.click(screen.getByRole("button", { name: /Other \(5 markets\)/ }));
    fireEvent.click(screen.getByRole("button", { name: "All categories" }));
    expect(screen.getByRole("button", { name: /Other \(5 markets\)/ })).toBeDefined();
  });

  it("opens a pooled tile from the keyboard too", () => {
    renderTreemap();
    const tile = screen.getByRole("button", { name: /Other \(5 markets\)/ });
    fireEvent.keyDown(tile, { key: "Enter" });
    expect(screen.getByRole("button", { name: "All categories" })).toBeDefined();
  });

  it("lists every pooled and unsized market in the table view", () => {
    renderTreemap();
    fireEvent.click(screen.getByRole("button", { name: "View as table" }));
    for (const market of tiny) {
      expect(screen.getByText(market.market.name)).toBeDefined();
    }
    expect(screen.getByText("Unsized market")).toBeDefined();
  });
});

describe("MarketTreemap empty state", () => {
  it("explains a selection with nothing in it", () => {
    render(
      <MarketTreemap
        sized={[]}
        unsized={[]}
        year={2024}
        minYear={2015}
        maxYear={2024}
        colorBy="growth"
        sourceTitleFor={sourceTitleFor}
      />,
    );
    expect(screen.getByText("No markets match this selection")).toBeDefined();
  });
});
