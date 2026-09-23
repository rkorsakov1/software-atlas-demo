import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EraTimeline } from "@/components/charts/EraTimeline";
import { ELLIPSIS } from "@/components/charts/primitives/atlasLabelFit";
import type { CompetitiveEvent, Era } from "@/data/types";

afterEach(cleanup);

const sourceTitleFor = (sourceId: string): string => `Source ${sourceId} — Test Publisher`;

const eraOf = (id: string, name: string, startYear: number, endYear: number): Era => ({
  id,
  name,
  startYear,
  endYear,
  enablingTech: ["test"],
  businessModel: "licence",
  summary: `${name} summary.`,
  definingCompanyIds: [],
  survivors: [],
  casualties: [],
});

const eventOf = (
  id: string,
  year: number,
  title: string,
  overrides: Partial<CompetitiveEvent> = {},
): CompetitiveEvent => ({
  id,
  year,
  type: "acquisition",
  title,
  companyIds: ["c1"],
  marketIds: [],
  impact: `${title} impact.`,
  sourceIds: ["S01"],
  ...overrides,
});

const eras: Era[] = [
  eraOf("e1", "Mainframes and bundled software", 1950, 1968),
  eraOf("e2", "Minicomputers and the first independent software vendors", 1969, 1980),
  eraOf("e3", "The PC and packaged software", 1981, 1994),
  eraOf("e4", "Client-server and enterprise suites", 1995, 2000),
  eraOf("e5", "Interregnum", 2001, 2002),
];

const pooled: CompetitiveEvent[] = Array.from({ length: 5 }, (_, index) =>
  eventOf(`p${index}`, 2010, `Pooled deal ${index}`),
);

const events: CompetitiveEvent[] = [...pooled, eventOf("lone", 1990, "Lone deal")];

const svgTexts = (container: HTMLElement): (string | null)[] =>
  Array.from(container.querySelectorAll("svg text")).map((node) => node.textContent);

const renderTimeline = (overrides: Partial<React.ComponentProps<typeof EraTimeline>> = {}) =>
  render(
    <EraTimeline
      eras={eras}
      events={events}
      fromYear={1950}
      toYear={2026}
      sourceTitleFor={sourceTitleFor}
      {...overrides}
    />,
  );

describe("EraTimeline era band labels", () => {
  it("never paints an era name that does not fit its band", () => {
    const { container } = renderTimeline();
    const texts = svgTexts(container);
    expect(texts).not.toContain("Mainframes and bundled software");
    expect(texts).not.toContain("Minicomputers and the first independent software vendors");
  });

  it("falls back to an abbreviation marked with an ellipsis", () => {
    const { container } = renderTimeline();
    expect(svgTexts(container)).toContain(`Mainframes${ELLIPSIS}`);
  });

  it("draws nothing at all in a band too narrow for any label", () => {
    const { container } = renderTimeline();
    const drawn = svgTexts(container).filter(
      (text) => typeof text === "string" && text.startsWith("Interre"),
    );
    expect(drawn).toHaveLength(0);
  });

  it("keeps the full name in the band's accessible name", () => {
    renderTimeline();
    expect(
      screen.getByRole("button", { name: /Era 5, Interregnum, 2001–2002/ }),
    ).toBeDefined();
  });

  it("names every era in the numbered key beneath the chart", () => {
    renderTimeline();
    for (const era of eras) {
      expect(screen.getAllByText(era.name).length).toBeGreaterThan(0);
    }
  });
});

describe("EraTimeline event density", () => {
  it("pools dots that would overlap into one count badge", () => {
    renderTimeline();
    expect(screen.getByRole("button", { name: /5 acquisition events in 2010/ })).toBeDefined();
    expect(screen.queryByRole("button", { name: /Pooled deal 0/ })).toBeNull();
  });

  it("leaves an isolated event as its own dot", () => {
    renderTimeline();
    expect(screen.getByRole("button", { name: /Acquisition, 1990: Lone deal/ })).toBeDefined();
  });

  it("opens the pooled group on Enter and exposes each event", () => {
    renderTimeline();
    const badge = screen.getByRole("button", { name: /5 acquisition events in 2010/ });
    fireEvent.keyDown(badge, { key: "Enter" });
    expect(screen.getByRole("button", { name: /Acquisition, 2010: Pooled deal 0/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /Acquisition, 2010: Pooled deal 4/ })).toBeDefined();
  });

  it("opens the group on hover too", () => {
    renderTimeline();
    const badge = screen.getByRole("button", { name: /5 acquisition events in 2010/ });
    fireEvent.mouseEnter(badge);
    expect(screen.getByRole("button", { name: /Acquisition, 2010: Pooled deal 2/ })).toBeDefined();
  });

  it("says in the source line that dots were pooled", () => {
    renderTimeline();
    expect(screen.getByText(/groups pool dots that would overlap/)).toBeDefined();
  });

  it("lists every pooled event in the table view", () => {
    renderTimeline();
    fireEvent.click(screen.getByRole("button", { name: "View as table" }));
    for (const event of pooled) {
      expect(screen.getByText(event.title)).toBeDefined();
    }
  });
});

describe("EraTimeline empty state", () => {
  it("explains an empty range instead of drawing an empty grid", () => {
    render(
      <EraTimeline
        eras={[]}
        events={[]}
        fromYear={2100}
        toYear={2110}
        sourceTitleFor={sourceTitleFor}
      />,
    );
    expect(screen.getByText("Nothing recorded in this range")).toBeDefined();
  });
});
