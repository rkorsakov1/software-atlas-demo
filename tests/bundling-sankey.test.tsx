import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BundlingSankey } from "@/components/charts/BundlingSankey";
import type { SankeyInput } from "@/lib/selectors";

afterEach(cleanup);

const eventTitleFor = (eventId: string): string => `Event ${eventId}`;

const input: SankeyInput = {
  nodes: [
    { id: "market:crm", label: "CRM", kind: "market" },
    { id: "market:marketing-automation", label: "Marketing automation", kind: "market" },
    { id: "company-suite:salesforce", label: "Salesforce", kind: "company-suite" },
  ],
  links: [
    {
      id: "flow-1",
      source: "market:marketing-automation",
      target: "company-suite:salesforce",
      value: 3,
      direction: "bundle",
      eventId: "E20",
      year: 2013,
    },
    {
      id: "flow-2",
      source: "market:crm",
      target: "market:marketing-automation",
      value: 2,
      direction: "unbundle",
      eventId: "E08",
      year: 2006,
    },
  ],
};

describe("BundlingSankey", () => {
  it("states the absence rather than drawing an empty diagram", () => {
    render(
      <BundlingSankey
        input={{ nodes: [], links: [] }}
        fromYear={1990}
        toYear={1995}
        eventTitleFor={eventTitleFor}
      />,
    );

    expect(screen.getByText("No bundling flows in this window")).toBeDefined();
    expect(screen.getByRole("status").textContent).toContain("1990");
  });

  it("makes each ribbon a focusable control labelled with both endpoints and the year", () => {
    render(
      <BundlingSankey input={input} fromYear={2000} toYear={2020} eventTitleFor={eventTitleFor} />,
    );

    const ribbons = screen.getAllByRole("button", { name: /weight \d of 3/ });
    expect(ribbons).toHaveLength(2);
    expect(ribbons.filter((node) => node.getAttribute("tabindex") === "0")).toHaveLength(1);

    const bundle = ribbons.find((node) => node.getAttribute("aria-label")?.startsWith("Bundle,"));
    expect(bundle?.getAttribute("aria-label")).toContain("2013");
    expect(bundle?.getAttribute("aria-label")).toContain("Marketing automation into Salesforce");
    expect(bundle?.getAttribute("aria-label")).toContain("Event E20");
  });

  it("opens the source event on click and on Enter", () => {
    const onSelectEvent = vi.fn();
    render(
      <BundlingSankey
        input={input}
        fromYear={2000}
        toYear={2020}
        eventTitleFor={eventTitleFor}
        onSelectEvent={onSelectEvent}
      />,
    );

    const ribbons = screen.getAllByRole("button", { name: /weight \d of 3/ });
    const unbundle = ribbons.find((node) => node.getAttribute("aria-label")?.startsWith("Unbundle,"));
    if (!unbundle) throw new Error("expected an unbundle ribbon");

    fireEvent.click(unbundle);
    fireEvent.keyDown(unbundle, { key: "Enter" });
    expect(onSelectEvent).toHaveBeenCalledTimes(2);
    expect(onSelectEvent).toHaveBeenCalledWith("E08");
  });

  it("strips the node prefix before reporting a hovered market", () => {
    const onHoverMarket = vi.fn();
    render(
      <BundlingSankey
        input={input}
        fromYear={2000}
        toYear={2020}
        eventTitleFor={eventTitleFor}
        onHoverMarket={onHoverMarket}
      />,
    );

    const ribbons = screen.getAllByRole("button", { name: /weight \d of 3/ });
    const unbundle = ribbons.find((node) => node.getAttribute("aria-label")?.startsWith("Unbundle,"));
    if (!unbundle) throw new Error("expected an unbundle ribbon");

    fireEvent.mouseEnter(unbundle);
    expect(onHoverMarket).toHaveBeenCalledWith("crm");
  });

  it("lists every flow in the table alternative, including its weight and event", () => {
    render(
      <BundlingSankey input={input} fromYear={2000} toYear={2020} eventTitleFor={eventTitleFor} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /view as table/i }));
    expect(screen.getByText("Event E20")).toBeDefined();
    expect(screen.getByText("Event E08")).toBeDefined();
    expect(screen.getAllByText("3 / 3").length).toBeGreaterThan(0);
  });
});

describe("BundlingSankey legibility", () => {
  const withLoop: SankeyInput = {
    nodes: [
      ...input.nodes,
      {
        id: "market:nosql",
        label: "Document, key-value and vector-capable NoSQL",
        kind: "market",
      },
    ],
    links: [
      ...input.links,
      {
        id: "flow-3",
        source: "company-suite:salesforce",
        target: "market:crm",
        value: 1,
        direction: "bundle",
        eventId: "E44",
        year: 2021,
      },
      {
        id: "flow-4",
        source: "market:nosql",
        target: "company-suite:salesforce",
        value: 2,
        direction: "bundle",
        eventId: "E45",
        year: 2021,
      },
    ],
  };

  it("draws a flow that would have closed a loop in a single-column-per-market layout", () => {
    render(
      <BundlingSankey input={withLoop} fromYear={2000} toYear={2025} eventTitleFor={eventTitleFor} />,
    );

    expect(screen.getAllByRole("button", { name: /weight \d of 3/ })).toHaveLength(4);
  });

  it("shortens a node label to its gutter and keeps the full name in a title", () => {
    render(
      <BundlingSankey input={withLoop} fromYear={2000} toYear={2025} eventTitleFor={eventTitleFor} />,
    );

    const full = "Document, key-value and vector-capable NoSQL";
    const titles = [...document.querySelectorAll("title")].map((node) => node.textContent ?? "");
    expect(titles).toContain(full);
    const labels = [...document.querySelectorAll("text")].map((node) => node.textContent ?? "");
    const truncated = labels.find((label) => label.startsWith("Document,"));
    expect(truncated).toBeDefined();
    expect(truncated).not.toBe(full);
    expect(truncated?.endsWith("…")).toBe(true);
  });

  it("narrows the diagram to one decade and still lists every flow in the table", () => {
    render(
      <BundlingSankey input={withLoop} fromYear={2000} toYear={2025} eventTitleFor={eventTitleFor} />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "2020s (2)" }));
    expect(screen.getAllByRole("button", { name: /weight \d of 3/ })).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /view as table/i }));
    expect(screen.getByText("Event E20")).toBeDefined();
    expect(screen.getAllByText(/not the shown period/).length).toBe(2);
  });
});
