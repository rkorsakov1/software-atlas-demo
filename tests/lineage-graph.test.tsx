import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { LineageGraph, type LineageFilters } from "@/components/charts/LineageGraph";
import type { LineageGraphData } from "@/lib/selectors";

/** jsdom has no ResizeObserver, and the Radix slider inside the toolbar needs one. */
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
});

afterEach(cleanup);

const eventTitleFor = (eventId: string): string => `Event ${eventId}`;
const sourceTitleFor = (sourceId: string): string => `Source ${sourceId}`;

const filters: LineageFilters = { fromYear: 1995, toYear: 2025, minDealValueUsdB: 0 };

const graph: LineageGraphData = {
  nodes: [
    { id: "microsoft", name: "Microsoft", archetype: "platform-giant", founded: 1975 },
    { id: "github", name: "GitHub", archetype: "plg-challenger", founded: 2008 },
    { id: "linkedin", name: "LinkedIn", archetype: "marketplace", founded: 2003 },
  ],
  links: [
    {
      id: "acq-github",
      source: "microsoft",
      target: "github",
      year: 2018,
      type: "acquisition",
      dealValueUsdB: 7.5,
      eventId: "E41",
    },
    {
      id: "acq-linkedin",
      source: "microsoft",
      target: "linkedin",
      year: 2016,
      type: "acquisition",
      dealValueUsdB: null,
      eventId: "E33",
    },
  ],
};

describe("LineageGraph", () => {
  it("explains an empty graph instead of drawing an empty canvas", () => {
    render(
      <LineageGraph
        graph={{ nodes: [], links: [] }}
        filters={{ fromYear: 2020, toYear: 2021, minDealValueUsdB: 25 }}
        eventTitleFor={eventTitleFor}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    expect(screen.getByText("No deals match these filters")).toBeDefined();
    expect(screen.getByRole("status").textContent).toContain("$25B");
  });

  it("labels every company and every deal with its value and year", () => {
    render(
      <LineageGraph
        graph={graph}
        filters={filters}
        eventTitleFor={eventTitleFor}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    const companies = screen.getAllByRole("button", { name: /founded \d{4}/ });
    expect(companies).toHaveLength(3);
    expect(companies.filter((item) => item.getAttribute("tabindex") === "0")).toHaveLength(1);

    const deals = screen.getAllByRole("button", { name: /^20\d\d: / });
    expect(deals).toHaveLength(2);
    const github = deals.find((item) => item.getAttribute("aria-label")?.includes("GitHub"));
    expect(github?.getAttribute("aria-label")).toContain("2018");
    expect(github?.getAttribute("aria-label")).toContain("$7.5B as announced");
    expect(github?.getAttribute("aria-label")).toContain("Event E41");

    const linkedin = deals.find((item) => item.getAttribute("aria-label")?.includes("LinkedIn"));
    expect(linkedin?.getAttribute("aria-label")).toContain("value not disclosed");
  });

  it("opens a company on Enter and a deal on click", () => {
    const onSelectCompany = vi.fn();
    const onSelectEvent = vi.fn();
    render(
      <LineageGraph
        graph={graph}
        filters={filters}
        eventTitleFor={eventTitleFor}
        sourceTitleFor={sourceTitleFor}
        onSelectCompany={onSelectCompany}
        onSelectEvent={onSelectEvent}
      />,
    );

    const microsoft = screen
      .getAllByRole("button", { name: /founded \d{4}/ })
      .find((item) => item.getAttribute("aria-label")?.startsWith("Microsoft"));
    if (!microsoft) throw new Error("expected the Microsoft node");
    fireEvent.keyDown(microsoft, { key: "Enter" });
    expect(onSelectCompany).toHaveBeenCalledWith("microsoft");

    const deal = screen.getAllByRole("button", { name: /^20\d\d: / })[0];
    if (!deal) throw new Error("expected a deal edge");
    fireEvent.click(deal);
    expect(onSelectEvent).toHaveBeenCalledTimes(1);
  });

  it("dims everything outside the one-hop neighbourhood of the focused company", () => {
    render(
      <LineageGraph
        graph={graph}
        filters={filters}
        focusCompanyId="github"
        eventTitleFor={eventTitleFor}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    const companies = screen.getAllByRole("button", { name: /founded \d{4}/ });
    const linkedin = companies.find((item) => item.getAttribute("aria-label")?.startsWith("LinkedIn"));
    const github = companies.find((item) => item.getAttribute("aria-label")?.startsWith("GitHub"));
    expect(linkedin?.getAttribute("class")).toContain("opacity-20");
    expect(github?.getAttribute("class")).not.toContain("opacity-20");
  });

  it("reports a new minimum deal value through onFiltersChange", () => {
    const onFiltersChange = vi.fn();
    render(
      <LineageGraph
        graph={graph}
        filters={filters}
        onFiltersChange={onFiltersChange}
        eventTitleFor={eventTitleFor}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    const group = screen.getByRole("group", { name: /Minimum deal value/ });
    const slider = within(group).getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onFiltersChange).toHaveBeenCalledWith({ ...filters, minDealValueUsdB: 0.5 });
  });

  it("never draws a node caption wider than the room it has, and keeps the full name on the node", () => {
    const { container } = render(
      <LineageGraph
        graph={graph}
        filters={filters}
        eventTitleFor={eventTitleFor}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    const nodeTitles = [...container.querySelectorAll("circle > title")].map(
      (node) => node.textContent,
    );
    for (const node of graph.nodes) expect(nodeTitles).toContain(node.name);

    // Below the degree floor no caption is drawn at all, so the SVG must not be
    // carrying company names as loose text — the tooltip and table hold them.
    const drawn = [...container.querySelectorAll("svg text")].map((node) => node.textContent);
    for (const node of graph.nodes) expect(drawn).not.toContain(node.name);
  });

  it("lists every deal in the table alternative", () => {
    render(
      <LineageGraph
        graph={graph}
        filters={filters}
        eventTitleFor={eventTitleFor}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /view as table/i }));
    expect(screen.getByText("Not disclosed")).toBeDefined();
    expect(screen.getByText("Event E41")).toBeDefined();
  });
});
