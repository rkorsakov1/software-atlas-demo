import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { SimulatorPanel } from "@/components/charts/SimulatorChart";

import { mulberry32, nextSeed, uniform } from "@/lib/prng";
import {
  OTHER_SERIES_ID,
  SIMULATION_PRESETS,
  normalizeParams,
  runSimulation,
  type SimulationParams,
  type SimulationResult,
} from "@/lib/simulation";

const baseParams: SimulationParams = {
  networkStrength: 0.5,
  switchingCost: 0.5,
  entrantsPerTick: 1,
  shiftProb: 0.04,
  ticks: 60,
  seed: 1,
};

const withParams = (patch: Partial<SimulationParams>): SimulationParams => ({
  ...baseParams,
  ...patch,
});

const sharesAtTick = (result: SimulationResult, tick: number): number[] =>
  result.shareSeries.map((series) => series.values[tick] ?? 0);

const finalHhi = (result: SimulationResult): number =>
  result.hhiSeries[result.hhiSeries.length - 1]?.value ?? 0;

const meanFinalHhi = (patch: Partial<SimulationParams>, seedCount: number): number => {
  let total = 0;
  for (let seed = 1; seed <= seedCount; seed += 1) {
    total += finalHhi(runSimulation(withParams({ ...patch, seed })));
  }
  return total / seedCount;
};

describe("mulberry32", () => {
  it("is deterministic for a seed and stays inside [0, 1)", () => {
    const first = Array.from({ length: 200 }, mulberry32(42));
    const again = mulberry32(42);
    const drawn = Array.from({ length: 200 }, again);

    expect(drawn).toEqual(first);
    for (const value of drawn) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("produces different streams for different seeds", () => {
    expect(Array.from({ length: 20 }, mulberry32(1))).not.toEqual(
      Array.from({ length: 20 }, mulberry32(2)),
    );
  });

  it("draws uniforms inside the requested range", () => {
    const random = mulberry32(9);
    for (let draw = 0; draw < 500; draw += 1) {
      const value = uniform(random, 0.8, 1.2);
      expect(value).toBeGreaterThanOrEqual(0.8);
      expect(value).toBeLessThan(1.2);
    }
  });

  it("derives a fresh in-range seed that is never the current one", () => {
    for (let seed = 0; seed < 300; seed += 1) {
      const next = nextSeed(seed);
      expect(next).not.toBe(seed);
      expect(next).toBeGreaterThanOrEqual(0);
      expect(next).toBeLessThanOrEqual(999999);
    }
  });
});

describe("runSimulation determinism", () => {
  it("produces identical output for the same seed", () => {
    expect(runSimulation(baseParams)).toEqual(runSimulation({ ...baseParams }));
  });

  it("produces different output for different seeds", () => {
    const a = runSimulation(withParams({ seed: 11 }));
    const b = runSimulation(withParams({ seed: 12 }));
    expect(a.hhiSeries).not.toEqual(b.hhiSeries);
  });
});

describe("runSimulation invariants", () => {
  const cases: { name: string; params: SimulationParams }[] = [
    { name: "balanced", params: baseParams },
    {
      name: "max network effects",
      params: withParams({ networkStrength: 1, switchingCost: 1, shiftProb: 0 }),
    },
    {
      name: "commodity",
      params: withParams({ networkStrength: 0, switchingCost: 0, shiftProb: 0, entrantsPerTick: 3 }),
    },
    { name: "shift-heavy", params: withParams({ shiftProb: 0.2, seed: 7 }) },
    { name: "no entrants", params: withParams({ entrantsPerTick: 0 }) },
  ];

  for (const testCase of cases) {
    it(`keeps shares summing to 1 every tick (${testCase.name})`, () => {
      const result = runSimulation(testCase.params);
      for (let tick = 0; tick < testCase.params.ticks; tick += 1) {
        const total = sharesAtTick(result, tick).reduce((sum, value) => sum + value, 0);
        expect(total).toBeCloseTo(1, 9);
      }
    });

    it(`keeps HHI inside [0, 10000] every tick (${testCase.name})`, () => {
      const result = runSimulation(testCase.params);
      expect(result.hhiSeries).toHaveLength(testCase.params.ticks);
      for (const point of result.hhiSeries) {
        expect(point.value).toBeGreaterThanOrEqual(0);
        expect(point.value).toBeLessThanOrEqual(10000);
      }
    });

    it(`keeps the top-3 share inside [0, 100] every tick (${testCase.name})`, () => {
      const result = runSimulation(testCase.params);
      expect(result.top3Series).toHaveLength(testCase.params.ticks);
      for (const point of result.top3Series) {
        expect(point.value).toBeGreaterThanOrEqual(0);
        expect(point.value).toBeLessThanOrEqual(100 + 1e-9);
      }
    });
  }

  it("emits ticks numbered 1..ticks on both line series", () => {
    const result = runSimulation(withParams({ ticks: 25 }));
    expect(result.hhiSeries.map((point) => point.tick)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1),
    );
    expect(result.top3Series.map((point) => point.tick)).toEqual(
      result.hhiSeries.map((point) => point.tick),
    );
  });
});

describe("runSimulation share series shape", () => {
  it("returns at most nine series: top eight firms plus 'other'", () => {
    const result = runSimulation(withParams({ entrantsPerTick: 3, shiftProb: 0.2, seed: 5 }));
    expect(result.shareSeries.length).toBeLessThanOrEqual(9);
    expect(result.shareSeries.filter((series) => series.id === OTHER_SERIES_ID)).toHaveLength(1);
    expect(
      result.shareSeries.filter((series) => series.id !== OTHER_SERIES_ID).length,
    ).toBeLessThanOrEqual(8);
  });

  it("gives every series exactly one value per tick", () => {
    const result = runSimulation(withParams({ ticks: 40, entrantsPerTick: 2 }));
    for (const series of result.shareSeries) {
      expect(series.values).toHaveLength(40);
      for (const value of series.values) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1 + 1e-9);
      }
    }
  });

  it("labels firm series by id and pools the tail as 'other'", () => {
    const result = runSimulation(withParams({ entrantsPerTick: 3, seed: 3 }));
    for (const series of result.shareSeries) {
      if (series.id === OTHER_SERIES_ID) continue;
      expect(series.id).toMatch(/^firm-\d+$/);
    }
  });
});

describe("platform shifts", () => {
  it("records no shift ticks when shiftProb is 0", () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      expect(runSimulation(withParams({ shiftProb: 0, seed })).shiftTicks).toEqual([]);
    }
  });

  it("records shift ticks in range and in order when shiftProb is high", () => {
    const params = withParams({ shiftProb: 0.2, seed: 4, ticks: 60 });
    const result = runSimulation(params);

    expect(result.shiftTicks.length).toBeGreaterThan(0);
    for (const tick of result.shiftTicks) {
      expect(tick).toBeGreaterThanOrEqual(1);
      expect(tick).toBeLessThanOrEqual(params.ticks);
    }
    expect([...result.shiftTicks].sort((a, b) => a - b)).toEqual([...result.shiftTicks]);
    expect(new Set(result.shiftTicks).size).toBe(result.shiftTicks.length);
  });

  it("fires shifts across seeds at a high shift probability", () => {
    let seedsWithShift = 0;
    for (let seed = 1; seed <= 20; seed += 1) {
      if (runSimulation(withParams({ shiftProb: 0.2, seed })).shiftTicks.length > 0) {
        seedsWithShift += 1;
      }
    }
    expect(seedsWithShift).toBeGreaterThan(15);
  });
});

describe("concentration dynamics", () => {
  it("ends more concentrated with full network effects and lock-in than in a commodity market", () => {
    const networked = meanFinalHhi(
      { networkStrength: 1, switchingCost: 1, shiftProb: 0 },
      20,
    );
    const commodity = meanFinalHhi(
      { networkStrength: 0, switchingCost: 0, shiftProb: 0 },
      20,
    );

    expect(networked).toBeGreaterThan(commodity);
  });

  it("ends above the 1,800 highly-concentrated threshold with no entrants to dilute the leader", () => {
    expect(
      meanFinalHhi(
        { networkStrength: 1, switchingCost: 1, shiftProb: 0, entrantsPerTick: 0 },
        20,
      ),
    ).toBeGreaterThan(1800);
  });

  it("stays less concentrated without network effects even when no entrants dilute", () => {
    const networked = meanFinalHhi(
      { networkStrength: 1, switchingCost: 1, shiftProb: 0, entrantsPerTick: 0 },
      20,
    );
    const commodity = meanFinalHhi(
      { networkStrength: 0, switchingCost: 0, shiftProb: 0, entrantsPerTick: 0 },
      20,
    );

    expect(networked).toBeGreaterThan(commodity);
  });

  it("fragments the market as entrants pour in", () => {
    const fewEntrants = meanFinalHhi({ entrantsPerTick: 0, shiftProb: 0 }, 20);
    const manyEntrants = meanFinalHhi({ entrantsPerTick: 3, shiftProb: 0 }, 20);

    expect(manyEntrants).toBeLessThan(fewEntrants);
  });
});

describe("params and presets", () => {
  it("clamps out-of-range params before running", () => {
    expect(
      normalizeParams({
        networkStrength: 4,
        switchingCost: -2,
        entrantsPerTick: 9,
        shiftProb: 1,
        ticks: 1000,
        seed: -5,
      }),
    ).toEqual({
      networkStrength: 1,
      switchingCost: 0,
      entrantsPerTick: 3,
      shiftProb: 0.2,
      ticks: 200,
      seed: 0,
    });
  });

  it("ships the three named presets and they all run", () => {
    const ids = SIMULATION_PRESETS.map((preset) => preset.id);
    expect(ids).toContain("network-effect");
    expect(ids).toContain("commodity");
    expect(ids).toContain("platform-shift");

    for (const preset of SIMULATION_PRESETS) {
      const result = runSimulation(preset.params);
      expect(result.hhiSeries).toHaveLength(preset.params.ticks);
    }
  });

  it("makes the network-effect preset more concentrated than the commodity preset", () => {
    const network = SIMULATION_PRESETS.find((preset) => preset.id === "network-effect");
    const commodity = SIMULATION_PRESETS.find((preset) => preset.id === "commodity");
    if (!network || !commodity) throw new Error("presets missing");

    expect(finalHhi(runSimulation(network.params))).toBeGreaterThan(
      finalHhi(runSimulation(commodity.params)),
    );
  });
});

/** jsdom has no ResizeObserver and Radix's Slider needs one to measure its thumb. */
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

describe("SimulatorPanel", () => {
  beforeAll(() => {
    globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
  });
  afterEach(() => cleanup());

  it("renders the persistent disclaimer, the sliders and the seed control", () => {
    render(
      createElement(SimulatorPanel, {
        params: baseParams,
        onParamsChange: () => undefined,
      }),
    );

    expect(
      screen.getAllByText("Illustrative toy model — not a prediction of any real market.").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("slider").length).toBeGreaterThanOrEqual(5);
    // The /simulator shell owns the banner in full mode, so the panel must not double it.
    expect(screen.queryAllByRole("note")).toHaveLength(0);
    expect(screen.getByLabelText("Seed")).toBeDefined();
    expect(screen.getByRole("button", { name: /new seed/i })).toBeDefined();
    expect(screen.getByRole("button", { name: "Network-effect market" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Commodity market" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Platform shift" })).toBeDefined();
    expect(screen.getByRole("button", { name: /view as table/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /methodology/i }).getAttribute("href")).toBe(
      "/methodology#simulator",
    );
  });

  it("hides the seed and entrant controls in compact mode", () => {
    render(
      createElement(SimulatorPanel, {
        params: baseParams,
        onParamsChange: () => undefined,
        compact: true,
      }),
    );

    expect(screen.queryByLabelText("Seed")).toBeNull();
    // A Story embed has no page shell, so the compact panel carries the banner itself.
    expect(screen.getAllByRole("note")).toHaveLength(1);
    expect(screen.getAllByRole("slider")).toHaveLength(3);
    expect(
      screen.getAllByText("Illustrative toy model — not a prediction of any real market.").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("gives every tick mark a focusable, labelled hit area", () => {
    render(
      createElement(SimulatorPanel, {
        params: { ...baseParams, ticks: 20 },
        onParamsChange: () => undefined,
      }),
    );

    const marks = screen.getAllByRole("button", { name: /^Tick \d+: HHI/ });
    expect(marks).toHaveLength(20);
    expect(marks.filter((mark) => mark.getAttribute("tabindex") === "0")).toHaveLength(1);
  });
});
