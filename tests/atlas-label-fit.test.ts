import { describe, expect, it } from "vitest";

import {
  ELLIPSIS,
  MIN_LABEL_BOX,
  abbreviateLabel,
  fitLabel,
  fitLabelInBox,
  fitMarkLabel,
  hasLabelRoom,
  maxCharsFor,
  measureTextWidth,
} from "@/components/charts/primitives/atlasLabelFit";

describe("measureTextWidth and maxCharsFor", () => {
  it("agree with each other", () => {
    const width = measureTextWidth("Mainframes", 12);
    expect(maxCharsFor(width, 12)).toBe(10);
  });

  it("returns nothing usable for a zero-width box", () => {
    expect(maxCharsFor(0, 12)).toBe(0);
  });
});

describe("hasLabelRoom", () => {
  it("rejects a box narrower than the minimum", () => {
    expect(hasLabelRoom(MIN_LABEL_BOX.width - 1, 40, 12)).toBe(false);
  });

  it("rejects a box shorter than the minimum", () => {
    expect(hasLabelRoom(200, 10, 12)).toBe(false);
  });

  it("accepts a box that clears both minimums", () => {
    expect(hasLabelRoom(200, 40, 12)).toBe(true);
  });
});

describe("fitLabel", () => {
  it("returns the string untouched when it fits", () => {
    const fitted = fitLabel("Analytics", 200, 12);
    expect(fitted).toEqual({ text: "Analytics", truncated: false, full: "Analytics" });
  });

  it("truncates with an ellipsis when it nearly fits", () => {
    const fitted = fitLabel("Analytics and business intelligence", 90, 12);
    expect(fitted?.truncated).toBe(true);
    expect(fitted?.text.endsWith(ELLIPSIS)).toBe(true);
    expect(fitted?.full).toBe("Analytics and business intelligence");
    expect(measureTextWidth(fitted?.text ?? "", 12)).toBeLessThanOrEqual(90);
  });

  it("draws nothing at all in a box below the minimum width", () => {
    expect(fitLabel("Analytics", MIN_LABEL_BOX.width - 1, 12)).toBeNull();
  });

  it("draws nothing when the truncation would be shorter than a word", () => {
    expect(fitLabel("Infrastructure", 48, 22)).toBeNull();
  });

  it("refuses to render below the 11px floor", () => {
    expect(fitLabel("Analytics", 400, 10)).toBeNull();
  });

  it("ignores empty and whitespace-only labels", () => {
    expect(fitLabel("   ", 400, 12)).toBeNull();
  });

  it("does not leave punctuation stranded before the ellipsis", () => {
    const fitted = fitLabel("Design, creative and marketing software", 60, 12);
    expect(fitted?.text.includes(`,${ELLIPSIS}`)).toBe(false);
  });
});

describe("abbreviateLabel", () => {
  it("cuts at a conjunction", () => {
    expect(abbreviateLabel("Mainframes and bundled software")).toBe("Mainframes");
    expect(abbreviateLabel("Design and creative software")).toBe("Design");
  });

  it("drops a leading article", () => {
    expect(abbreviateLabel("The PC and packaged software")).toBe("PC");
  });

  it("keeps a hyphenated head word whole", () => {
    expect(abbreviateLabel("Client-server and enterprise suites")).toBe("Client-server");
  });

  it("cuts at punctuation", () => {
    expect(abbreviateLabel("Cloud: the platform era")).toBe("Cloud");
  });

  it("returns the original when there is nothing to cut", () => {
    expect(abbreviateLabel("Customer relationship management")).toBe(
      "Customer relationship management",
    );
  });
});

describe("fitMarkLabel", () => {
  it("prefers the full name when it fits", () => {
    const fitted = fitMarkLabel("Mainframes and bundled software", 400, 12);
    expect(fitted).toEqual({
      text: "Mainframes and bundled software",
      truncated: false,
      full: "Mainframes and bundled software",
    });
  });

  it("falls back to an abbreviation marked with an ellipsis", () => {
    const fitted = fitMarkLabel("Mainframes and bundled software", 90, 12);
    expect(fitted?.text).toBe(`Mainframes${ELLIPSIS}`);
    expect(fitted?.truncated).toBe(true);
    expect(fitted?.full).toBe("Mainframes and bundled software");
  });

  it("truncates when even the abbreviation is too long", () => {
    const fitted = fitMarkLabel("Minicomputers and the first vendors", 60, 12);
    expect(fitted?.truncated).toBe(true);
    expect(measureTextWidth(fitted?.text ?? "", 12)).toBeLessThanOrEqual(60);
  });

  it("gives up rather than drawing an unreadable stub", () => {
    expect(fitMarkLabel("Minicomputers and the first vendors", 40, 12)).toBeNull();
  });
});

describe("fitLabelInBox", () => {
  it("returns nothing when the tile is too short for a line of text", () => {
    expect(fitLabelInBox("Analytics", { width: 200, height: 12 }, 12, 6)).toBeNull();
  });

  it("accounts for padding on both sides", () => {
    const withoutPadding = fitLabelInBox("Analytics platform", { width: 120, height: 40 }, 12, 0);
    const withPadding = fitLabelInBox("Analytics platform", { width: 120, height: 40 }, 12, 20);
    expect(withoutPadding?.truncated).toBe(false);
    expect(withPadding?.truncated).toBe(true);
  });
});
