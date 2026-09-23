import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmergingRadar } from "@/components/charts/EmergingRadar";
import type { EmergingMarket } from "@/data/types";

const market = (id: string, overrides: Partial<EmergingMarket> = {}): EmergingMarket => ({
  id,
  name: id.toUpperCase(),
  category: "emerging",
  thesis: `${id} thesis`,
  signals: [{ type: "cost-curve", evidence: `${id} evidence`, strength: 2, sourceIds: ["S01"] }],
  keyPlayerIds: [],
  risks: [],
  stage: "nascent",
  horizon: "2-5y",
  ...overrides,
});

const sourceTitleFor = (sourceId: string): string => `Source ${sourceId}`;

describe("EmergingRadar", () => {
  it("says why the radar is empty rather than drawing bare rings", () => {
    render(<EmergingRadar markets={[]} sourceTitleFor={sourceTitleFor} />);
    expect(screen.getByText("No candidate markets in view")).toBeDefined();
  });

  it("labels each dot with its horizon, category and modeled strength", () => {
    render(
      <EmergingRadar
        markets={[market("agents", { horizon: "0-2y", category: "infrastructure" })]}
        sourceTitleFor={sourceTitleFor}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: /AGENTS: Infrastructure, horizon 0–2 years, 1 signals with combined strength 2 \(modeled\)/,
      }),
    ).toBeDefined();
  });

  it("selects a market on click and on Enter", () => {
    const handleSelect = vi.fn();
    render(
      <EmergingRadar
        markets={[market("agents"), market("edge")]}
        onSelectMarket={handleSelect}
        sourceTitleFor={sourceTitleFor}
      />,
    );
    const dots = screen.getAllByRole("button", { name: /combined strength/ });
    const first = dots[0];
    if (!first) throw new Error("no dot rendered");
    fireEvent.click(first);
    fireEvent.keyDown(first, { key: "Enter" });
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });

  it("shows the thesis and the signal source on focus", () => {
    render(<EmergingRadar markets={[market("agents")]} sourceTitleFor={sourceTitleFor} />);
    const dot = screen.getByRole("button", { name: /combined strength/ });
    fireEvent.focus(dot);
    expect(screen.getAllByText(/agents thesis/).length).toBeGreaterThan(0);
    expect(screen.getByText("Source S01")).toBeDefined();
    expect(screen.getByText("agents evidence")).toBeDefined();
  });

  it("offers a table alternative with horizon and strength", () => {
    render(
      <EmergingRadar
        markets={[market("agents", { horizon: "5y+" })]}
        sourceTitleFor={sourceTitleFor}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "View as table" }));
    expect(screen.getByText("5+ years")).toBeDefined();
    expect(screen.getByText("Candidate market")).toBeDefined();
  });
});

describe("EmergingRadar hover card", () => {
  const manySignals = Array.from({ length: 6 }, (_unused, index) => ({
    type: "cost-curve" as const,
    evidence: `evidence ${index}`,
    strength: 3 as const,
    sourceIds: ["S01"],
  }));

  it("summarises the case in three rows instead of covering the radar with it", () => {
    render(
      <EmergingRadar
        markets={[market("agents", { signals: manySignals })]}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    fireEvent.focus(screen.getByRole("button", { name: /combined strength/ }));
    const card = screen.getByRole("tooltip");

    expect(card.querySelectorAll("li")).toHaveLength(4);
    expect(within(card).getByText(/\+4 more/)).toBeDefined();
    // The card never scrolls: it is capped by rows, not by a scroll box.
    expect(card.style.maxHeight).toBe("");
  });

  it("puts the strongest signals first so the summary is the useful three", () => {
    render(
      <EmergingRadar
        markets={[
          market("agents", {
            signals: [
              { type: "cost-curve", evidence: "weak evidence", strength: 1, sourceIds: ["S01"] },
              { type: "regulation", evidence: "strong evidence", strength: 3, sourceIds: ["S02"] },
            ],
          }),
        ]}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    fireEvent.focus(screen.getByRole("button", { name: /combined strength/ }));
    const card = screen.getByRole("tooltip");
    const rows = [...card.querySelectorAll("li")].map((node) => node.textContent ?? "");

    expect(rows[1]).toContain("strong evidence");
    expect(rows[2]).toContain("weak evidence");
  });
});

describe("EmergingRadar repeated signal types", () => {
  it("numbers two signals of the same type instead of printing the same row twice", () => {
    render(
      <EmergingRadar
        markets={[
          market("agents", {
            signals: [
              {
                type: "leading-indicator",
                evidence: "first indicator",
                strength: 3,
                sourceIds: ["S01"],
              },
              {
                type: "leading-indicator",
                evidence: "second indicator",
                strength: 2,
                sourceIds: ["S02"],
              },
            ],
          }),
        ]}
        sourceTitleFor={sourceTitleFor}
      />,
    );

    fireEvent.focus(screen.getByRole("button", { name: /combined strength/ }));
    const card = screen.getByRole("tooltip");
    expect(within(card).getByText("Leading indicator 1 of 2")).toBeDefined();
    expect(within(card).getByText("Leading indicator 2 of 2")).toBeDefined();
  });
});

