import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  AtlasMarkTooltip,
  MAX_TOOLTIP_HEIGHT,
  MAX_TOOLTIP_ROWS,
  TOOLTIP_WIDTH,
  capTooltipRows,
  tooltipPlacement,
  type AtlasMarkTooltipRow,
} from "@/components/charts/primitives/AtlasMarkTooltip";

afterEach(cleanup);

const rowsOf = (count: number): AtlasMarkTooltipRow[] =>
  Array.from({ length: count }, (_unused, index) => ({
    label: `Signal ${index + 1}`,
    value: "3 / 3",
    confidence: "modeled" as const,
    detail: "Evidence sentence that would otherwise run the card down the page.",
  }));

describe("capTooltipRows", () => {
  it("passes a short list through untouched", () => {
    const capped = capTooltipRows(rowsOf(MAX_TOOLTIP_ROWS));
    expect(capped.visible).toHaveLength(MAX_TOOLTIP_ROWS);
    expect(capped.hiddenCount).toBe(0);
  });

  it("never renders more than four lines, counting the overflow line", () => {
    const capped = capTooltipRows(rowsOf(9));
    expect(capped.visible).toHaveLength(MAX_TOOLTIP_ROWS - 1);
    expect(capped.hiddenCount).toBe(6);
    expect(capped.visible.length + 1).toBeLessThanOrEqual(MAX_TOOLTIP_ROWS);
  });
});

describe("tooltipPlacement", () => {
  const container = { containerWidth: 600, containerHeight: 400 };

  it("sits below and right of the mark when there is room", () => {
    const placement = tooltipPlacement({ x: 100, y: 100, ...container, height: 200 });
    expect(placement.left).toBeGreaterThan(100);
    expect(placement.top).toBeGreaterThan(100);
  });

  it("flips on both axes rather than leaving the chart", () => {
    const placement = tooltipPlacement({ x: 580, y: 380, ...container, height: 200 });
    expect(placement.left).toBeLessThan(580);
    expect(placement.top).toBeLessThan(380);
    expect(placement.left + TOOLTIP_WIDTH).toBeLessThanOrEqual(container.containerWidth);
    expect(placement.top + 200).toBeLessThanOrEqual(container.containerHeight);
  });

  it("stays inside a container smaller than the card rather than going negative", () => {
    const placement = tooltipPlacement({
      x: 10,
      y: 10,
      containerWidth: 200,
      containerHeight: 120,
      height: 300,
    });
    expect(placement.left).toBeGreaterThanOrEqual(4);
    expect(placement.top).toBeGreaterThanOrEqual(4);
  });
});

describe("AtlasMarkTooltip", () => {
  it("caps the card at four lines and says how much it is holding back", () => {
    render(
      <AtlasMarkTooltip
        x={20}
        y={20}
        containerWidth={600}
        containerHeight={400}
        title="Agentic software"
        subtitle="A long thesis paragraph that belongs in the drawer, not in a hover card."
        rows={rowsOf(7)}
        footnote="Strengths are modeled."
        visible
      />,
    );

    expect(screen.getAllByText("3 / 3")).toHaveLength(MAX_TOOLTIP_ROWS - 1);
    expect(screen.getByText(/\+4 more/)).toBeDefined();
    expect(screen.queryByText("Signal 7")).toBeNull();
  });

  it("is bounded in width and height so it cannot swallow the chart", () => {
    render(
      <AtlasMarkTooltip
        x={20}
        y={20}
        containerWidth={600}
        containerHeight={400}
        title="Agentic software"
        rows={rowsOf(2)}
        footnote="Strengths are modeled."
        visible
      />,
    );

    const card = screen.getByRole("tooltip");
    expect(card.style.width).toBe(`${TOOLTIP_WIDTH}px`);
    expect(card.style.maxHeight).toBe(`${MAX_TOOLTIP_HEIGHT}px`);
    expect(TOOLTIP_WIDTH).toBeLessThanOrEqual(300);
    expect(MAX_TOOLTIP_HEIGHT).toBeLessThanOrEqual(320);
  });
});
