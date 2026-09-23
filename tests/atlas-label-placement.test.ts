import { describe, expect, it } from "vitest";

import { ELLIPSIS, MIN_LABEL_BOX } from "@/components/charts/primitives/atlasLabelFit";
import {
  placeOutsideMarkLabels,
  placedLabelsById,
  type OutsideLabelMark,
  type OutsideLabelOptions,
} from "@/components/charts/primitives/atlasLabelPlacement";

const options: OutsideLabelOptions = { plotWidth: 800, plotHeight: 400 };

const mark = (
  id: string,
  text: string,
  x: number,
  y: number,
  radius = 8,
): OutsideLabelMark => ({ id, text, x, y, radius });

describe("placeOutsideMarkLabels", () => {
  it("draws a label in full when it has room, above the mark", () => {
    const [label] = placeOutsideMarkLabels([mark("a", "Salesforce", 400, 200)], options);

    expect(label?.text).toBe("Salesforce");
    expect(label?.truncated).toBe(false);
    expect(label?.x).toBe(400);
    // Baseline sits above the mark: centre − radius − offset.
    expect(label?.y).toBe(188);
  });

  it("truncates the later label when a neighbour has already claimed the room", () => {
    const placed = placeOutsideMarkLabels(
      [
        mark("first", "Hewlett Packard Enterprise", 400, 200),
        mark("second", "Palo Alto Networks", 520, 200),
      ],
      options,
    );

    expect(placed).toHaveLength(2);
    expect(placed[0]?.truncated).toBe(false);
    expect(placed[1]?.truncated).toBe(true);
    expect(placed[1]?.text.endsWith(ELLIPSIS)).toBe(true);
    expect(placed[1]?.full).toBe("Palo Alto Networks");
  });

  it("draws nothing rather than overlapping when two marks sit on top of each other", () => {
    const placed = placeOutsideMarkLabels(
      [mark("first", "Microsoft", 400, 200), mark("second", "Oracle", 402, 200)],
      options,
    );

    expect(placed.map((label) => label.id)).toEqual(["first"]);
  });

  it("leaves a label alone when its neighbour sits on another line", () => {
    const placed = placeOutsideMarkLabels(
      [mark("first", "Microsoft", 400, 200), mark("second", "Oracle", 402, 320)],
      options,
    );

    expect(placed.map((label) => label.text)).toEqual(["Microsoft", "Oracle"]);
  });

  it("drops a label with no room at the edge of the plot", () => {
    const placed = placeOutsideMarkLabels([mark("edge", "Snowflake", 12, 200)], options);

    expect(placed).toHaveLength(0);
  });

  it("drops a label that would be drawn off the top of the plot", () => {
    const placed = placeOutsideMarkLabels([mark("top", "Datadog", 400, 6)], options);

    expect(placed).toHaveLength(0);
  });

  it("never fits a label into less than the minimum box", () => {
    for (const placed of placeOutsideMarkLabels(
      [
        mark("first", "International Business Machines", 400, 200),
        mark("second", "Broadcom", 560, 200),
        mark("third", "ServiceNow", 600, 200),
      ],
      options,
    )) {
      expect(placed.availableWidth).toBeGreaterThanOrEqual(MIN_LABEL_BOX.width);
    }
  });

  it("refuses to draw anything below the 11px floor", () => {
    expect(
      placeOutsideMarkLabels([mark("a", "Salesforce", 400, 200)], { ...options, fontPx: 9 }),
    ).toHaveLength(0);
  });

  it("keys the placements by mark id", () => {
    const byId = placedLabelsById([mark("a", "Salesforce", 400, 200)], options);

    expect(byId.get("a")?.full).toBe("Salesforce");
    expect(byId.has("b")).toBe(false);
  });
});
