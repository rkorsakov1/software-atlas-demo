import { describe, expect, it } from "vitest";

import { parseCitations, shortPublisher } from "@/components/story/citations";
import { chapters, sources } from "@/data";

const known = new Set(sources.map((source) => source.id));
const isKnown = (id: string): boolean => known.has(id);

describe("parseCitations", () => {
  it("leaves prose without citations untouched", () => {
    const segments = parseCitations("No ids here (none at all).", isKnown);
    expect(segments).toEqual([{ kind: "text", value: "No ids here (none at all)." }]);
  });

  it("splits a multi-id citation out of the sentence", () => {
    const segments = parseCitations("casualties (S18, S27); an expectation", isKnown);
    expect(segments).toEqual([
      { kind: "text", value: "casualties " },
      { kind: "citation", ids: ["S18", "S27"], trailing: null },
      { kind: "text", value: "; an expectation" },
    ]);
  });

  it("keeps prose that shares the parentheses with an id", () => {
    const segments = parseCitations("margin (S14, modeled as 1 minus 2.55 divided by 23.77).", isKnown);
    expect(segments).toEqual([
      { kind: "text", value: "margin " },
      { kind: "citation", ids: ["S14"], trailing: "modeled as 1 minus 2.55 divided by 23.77" },
      { kind: "text", value: "." },
    ]);
  });

  it("handles the lettered ids the registry actually uses", () => {
    const segments = parseCitations("a claim (S18b) and another (B01).", isKnown);
    expect(segments.filter((segment) => segment.kind === "citation")).toHaveLength(2);
  });

  it("renders an unknown id as plain text rather than a broken citation", () => {
    const segments = parseCitations("a claim (S99) here", isKnown);
    expect(segments).toEqual([{ kind: "text", value: "a claim (S99) here" }]);
  });

  it("resolves every id cited in the shipped chapters", () => {
    const unresolved: string[] = [];
    for (const chapter of chapters) {
      for (const paragraph of chapter.body) {
        for (const match of paragraph.matchAll(/\((S\d{2,3}[a-z]?|B\d{2})[^()]*\)/g)) {
          const id = match[1];
          if (id !== undefined && !known.has(id)) unresolved.push(id);
        }
      }
    }
    expect(unresolved).toEqual([]);
  });

  it("never loses a character of the paragraph", () => {
    for (const chapter of chapters) {
      for (const paragraph of chapter.body) {
        const segments = parseCitations(paragraph, isKnown);
        const rebuilt = segments
          .map((segment) =>
            segment.kind === "text"
              ? segment.value
              : `(${[...segment.ids, ...(segment.trailing === null ? [] : [segment.trailing])].join(", ")})`,
          )
          .join("");
        expect(rebuilt).toBe(paragraph);
      }
    }
  });
});

describe("shortPublisher", () => {
  it("drops a trailing parenthetical", () => {
    expect(shortPublisher("TelecomTV (reporting Gartner)")).toBe("TelecomTV");
  });

  it("clips at a word boundary", () => {
    expect(shortPublisher("US National Institute of Standards and Technology")).toBe(
      "US National Institute…",
    );
  });

  it("leaves a short publisher alone", () => {
    expect(shortPublisher("Gartner")).toBe("Gartner");
  });
});
