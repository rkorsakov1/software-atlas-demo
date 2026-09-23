import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MoatRadar, type MoatRadarCompany } from "@/components/charts/MoatRadar";
import { MOAT_AXIS_ORDER } from "@/components/charts/primitives/atlasRadarMath";
import type { MoatKey, MoatRubric, MoatScore } from "@/data/types";

const rubric = MOAT_AXIS_ORDER.reduce((accumulator, key) => {
  const levels = {} as Record<MoatScore, string>;
  ([0, 1, 2, 3, 4, 5] as const).forEach((score) => {
    levels[score] = `${key} level ${score}`;
  });
  accumulator[key] = levels;
  return accumulator;
}, {} as MoatRubric);

const moats = (score: MoatScore): Record<MoatKey, MoatScore> =>
  MOAT_AXIS_ORDER.reduce((accumulator, key) => {
    accumulator[key] = score;
    return accumulator;
  }, {} as Record<MoatKey, MoatScore>);

/** `useNarrowViewport` reads `matchMedia`, which jsdom does not implement. */
const stubViewport = ({ narrow }: { narrow: boolean }): void => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: narrow && query.includes("max-width"),
    media: query,
    onchange: null,
    addEventListener: (): void => undefined,
    removeEventListener: (): void => undefined,
    addListener: (): void => undefined,
    removeListener: (): void => undefined,
    dispatchEvent: (): boolean => false,
  }));
};

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

const companies: MoatRadarCompany[] = [
  { id: "alpha", name: "Alpha", moats: { ...moats(3), network: 5 }, moatRationale: "Alpha why" },
  { id: "beta", name: "Beta", moats: { ...moats(2), scale: 4 }, moatRationale: "Beta why" },
];

describe("MoatRadar", () => {
  it("explains the absence instead of drawing an empty web", () => {
    render(<MoatRadar companies={[]} rubric={rubric} />);
    expect(screen.getByText("No companies selected")).toBeDefined();
  });

  it("labels every vertex with its company, power, score and basis", () => {
    render(<MoatRadar companies={companies} rubric={rubric} />);
    const marks = screen.getAllByRole("button", { name: /of 5, modeled/ });
    expect(marks).toHaveLength(companies.length * MOAT_AXIS_ORDER.length);
    expect(
      screen.getByRole("button", { name: /Alpha, Network effects: 5 of 5, modeled/ }),
    ).toBeDefined();
  });

  it("carries a permanent modeled label", () => {
    render(<MoatRadar companies={companies} rubric={rubric} />);
    expect(screen.getAllByText("Modeled").length).toBeGreaterThan(0);
  });

  it("reveals the rubric level for the focused score", () => {
    render(<MoatRadar companies={companies} rubric={rubric} />);
    const mark = screen.getByRole("button", { name: /Alpha, Network effects: 5 of 5/ });
    fireEvent.focus(mark);
    expect(screen.getAllByText(/network level 5/).length).toBeGreaterThan(0);
  });

  it("removes a company through the chip button", () => {
    const handleRemove = vi.fn();
    render(<MoatRadar companies={companies} rubric={rubric} onRemoveCompany={handleRemove} />);
    fireEvent.click(screen.getByLabelText("Remove Beta from the moat comparison"));
    expect(handleRemove).toHaveBeenCalledWith("beta");
  });

  it("offers a table alternative carrying the rubric sentences", () => {
    render(<MoatRadar companies={companies} rubric={rubric} />);
    fireEvent.click(screen.getByRole("button", { name: "View as table" }));
    expect(screen.getByText("Rubric level")).toBeDefined();
    expect(screen.getAllByText("scale level 4").length).toBe(1);
  });

  it("opens on the table below the mobile breakpoint rather than on a squeezed web", () => {
    stubViewport({ narrow: true });
    render(<MoatRadar companies={companies} rubric={rubric} />);

    expect(screen.getByRole("button", { name: "View as chart" })).toBeDefined();
    expect(screen.getByText("Rubric level")).toBeDefined();
  });

  it("opens on the chart above the breakpoint", () => {
    stubViewport({ narrow: false });
    render(<MoatRadar companies={companies} rubric={rubric} />);

    expect(screen.getByRole("button", { name: "View as table" })).toBeDefined();
  });
});
