import { describe, expect, it } from "vitest";

import {
  ATLAS_DEFAULTS,
  ATLAS_MAX_YEAR,
  ATLAS_MIN_YEAR,
  MAX_PINS,
  exploreHrefFromGraphicState,
  parseAtlasState,
  serializeAtlasState,
  togglePin,
  updateAtlasState,
} from "@/lib/url-state";

/** serialize(parse(x)) must be a fixed point: parsing it again changes nothing. */
const roundTrip = (query: string): string => serializeAtlasState(parseAtlasState(query));

describe("parseAtlasState", () => {
  it("returns the documented defaults for an empty query", () => {
    expect(parseAtlasState("")).toEqual(ATLAS_DEFAULTS);
  });

  it("reads every field from the query", () => {
    const state = parseAtlasState(
      "mode=story&chart=bubble&year=2015&from=2000&to=2020&cat=infrastructure,horizontal" +
        "&arch=ai-native&mat=mature&q=oracle&focus=company:oracle&pin=oracle,sap&seed=42",
    );

    expect(state.mode).toBe("story");
    expect(state.chart).toBe("bubble");
    expect(state.year).toBe(2015);
    expect(state.from).toBe(2000);
    expect(state.to).toBe(2020);
    expect(state.cat).toEqual(["infrastructure", "horizontal"]);
    expect(state.arch).toEqual(["ai-native"]);
    expect(state.mat).toEqual(["mature"]);
    expect(state.q).toBe("oracle");
    expect(state.focus).toEqual({ kind: "company", id: "oracle" });
    expect(state.pin).toEqual(["oracle", "sap"]);
    expect(state.seed).toBe(42);
  });

  it("accepts repeated params as well as comma-joined lists", () => {
    const state = parseAtlasState("cat=vertical&cat=consumer&pin=sap&pin=oracle");
    expect(state.cat).toEqual(["vertical", "consumer"]);
    expect(state.pin).toEqual(["sap", "oracle"]);
  });

  it("drops unknown enum members instead of throwing", () => {
    const state = parseAtlasState("cat=infrastructure,not-a-category&arch=nonsense&chart=nope");
    expect(state.cat).toEqual(["infrastructure"]);
    expect(state.arch).toEqual([]);
    expect(state.chart).toBe(ATLAS_DEFAULTS.chart);
  });

  it("clamps years into range and orders from/to", () => {
    const state = parseAtlasState("from=2030&to=1900&year=1800");
    expect(state.from).toBe(ATLAS_MIN_YEAR);
    expect(state.to).toBe(ATLAS_MAX_YEAR);
    expect(state.year).toBeGreaterThanOrEqual(state.from);
    expect(state.year).toBeLessThanOrEqual(state.to);
  });

  it("keeps the scrubber year inside the selected range", () => {
    const state = parseAtlasState("from=2010&to=2015&year=2024");
    expect(state.year).toBe(2015);
  });

  it("rejects a malformed focus reference", () => {
    expect(parseAtlasState("focus=oracle").focus).toBeNull();
    expect(parseAtlasState("focus=planet:mars").focus).toBeNull();
    expect(parseAtlasState("focus=company:Bad Id").focus).toBeNull();
  });

  it("caps pins at three", () => {
    const state = parseAtlasState("pin=a,b,c,d,e");
    expect(state.pin).toHaveLength(MAX_PINS);
  });

  it("de-duplicates list members while preserving order", () => {
    expect(parseAtlasState("cat=vertical,vertical,consumer").cat).toEqual([
      "vertical",
      "consumer",
    ]);
  });

  it("falls back to defaults for non-numeric simulator params", () => {
    const state = parseAtlasState("net=abc&sw=&shift=9&ticks=-5");
    expect(state.net).toBe(ATLAS_DEFAULTS.net);
    expect(state.sw).toBe(ATLAS_DEFAULTS.sw);
    expect(state.shift).toBe(0.2);
    expect(state.ticks).toBe(10);
  });
});

describe("serializeAtlasState", () => {
  it("omits every default so a clean view has a clean URL", () => {
    expect(serializeAtlasState(ATLAS_DEFAULTS)).toBe("");
  });

  it("round-trips: serialize(parse(x)) is stable under a second pass", () => {
    const queries = [
      "",
      "mode=story",
      "chart=lineage&from=1995&to=2010",
      "cat=infrastructure,horizontal&arch=platform-giant&mat=mature",
      "q=salesforce&focus=market:crm&pin=salesforce,sap,oracle",
      "year=2018&chart=share&focus=event:evt-2021-salesforce-slack",
      "net=0.8&sw=0.25&ent=2&shift=0.12&ticks=90&seed=7",
      "cat=nope&arch=nope&pin=a,b,c,d&year=9999",
    ];

    for (const query of queries) {
      const once = roundTrip(query);
      expect(roundTrip(once)).toBe(once);
      expect(parseAtlasState(once)).toEqual(parseAtlasState(query));
    }
  });

  it("round-trips a fully populated state object", () => {
    const state = updateAtlasState(ATLAS_DEFAULTS, {
      mode: "story",
      chart: "moat",
      year: 2012,
      from: 1999,
      to: 2020,
      cat: ["vertical", "consumer"],
      arch: ["pe-rollup", "marketplace"],
      mat: ["consolidating"],
      q: "adobe",
      focus: { kind: "market", id: "creative-tools" },
      pin: ["adobe", "canva"],
      net: 0.77,
      sw: 0.33,
      ent: 3,
      shift: 0.08,
      ticks: 120,
      seed: 999,
    });

    expect(parseAtlasState(serializeAtlasState(state))).toEqual(state);
  });
});

describe("updateAtlasState", () => {
  it("re-orders an inverted range and re-clamps the year", () => {
    const state = updateAtlasState(ATLAS_DEFAULTS, { from: 2020, to: 1990, year: 2025 });
    expect(state.from).toBe(1990);
    expect(state.to).toBe(2020);
    expect(state.year).toBe(2020);
  });
});

describe("togglePin", () => {
  it("adds, removes and refuses a fourth pin", () => {
    const one = togglePin(ATLAS_DEFAULTS, "oracle");
    expect(one.pin).toEqual(["oracle"]);
    expect(togglePin(one, "oracle").pin).toEqual([]);

    const full = ["a", "b", "c"].reduce(togglePin, ATLAS_DEFAULTS);
    expect(full.pin).toHaveLength(3);
    expect(togglePin(full, "d").pin).toEqual(["a", "b", "c"]);
  });
});

describe("exploreHrefFromGraphicState", () => {
  it("turns a chapter graphicState into an /explore link", () => {
    const href = exploreHrefFromGraphicState({
      chart: "share",
      year: 2020,
      focus: "market:cloud-iaas-paas",
      cat: ["infrastructure"],
    });

    expect(href.startsWith("/explore/?")).toBe(true);
    const state = parseAtlasState(href.split("?")[1] ?? "");
    expect(state.chart).toBe("share");
    expect(state.year).toBe(2020);
    expect(state.focus).toEqual({ kind: "market", id: "cloud-iaas-paas" });
    expect(state.cat).toEqual(["infrastructure"]);
  });

  it("returns the bare route when the state is all defaults", () => {
    expect(exploreHrefFromGraphicState({})).toBe("/explore/");
  });
});
