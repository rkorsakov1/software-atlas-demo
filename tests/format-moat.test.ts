import { describe, expect, it } from "vitest";

import { splitMoatRationale } from "@/lib/format";

describe("splitMoatRationale", () => {
  it("splits one line per moat", () => {
    const lines = splitMoatRationale(
      "Network 1: works alone. Switching 3: a funded project. Regulatory 3: years of audits.",
    );
    expect(lines).toEqual([
      { label: "Network", score: 1, text: "works alone." },
      { label: "Switching", score: 3, text: "a funded project." },
      { label: "Regulatory", score: 3, text: "years of audits." },
    ]);
  });

  it("returns free text as a single line", () => {
    expect(splitMoatRationale("No moat worth scoring.")).toEqual([
      { label: "", score: 0, text: "No moat worth scoring." },
    ]);
  });
});
