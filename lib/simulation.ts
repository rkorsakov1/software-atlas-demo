/**
 * The Atlas market-dynamics toy model (CLAUDE.md §7).
 *
 * This is an illustrative agent-based simulation, not a forecast of any real
 * market. It exists to let a reader feel how three forces — network effects,
 * switching costs and platform shifts — push a market towards or away from
 * concentration. Every figure it produces is `modeled`.
 *
 * The whole module is pure and seeded: `runSimulation` has no side effects and
 * the same `params` always produce the same `SimulationResult`.
 */

import { computeHhiFromFractions, computeTopNShare } from "@/lib/hhi";
import { mulberry32, uniform, type RandomSource } from "@/lib/prng";

export type SimulationParams = {
  /** 0–1. How strongly existing share feeds back into attractiveness. */
  networkStrength: number;
  /** 0–1. How hard it is for a customer to leave; 1 means nobody churns. */
  switchingCost: number;
  /** 0–3. New firms entering each tick. */
  entrantsPerTick: number;
  /** 0–0.2. Per-tick probability of a platform shift. */
  shiftProb: number;
  ticks: number;
  seed: number;
};

export type SimulationSeriesPoint = { tick: number; value: number };

export type SimulationShareSeries = {
  /** "firm-3" for a surviving firm, "other" for the pooled tail. */
  id: string;
  label: string;
  values: readonly number[]; // one entry per tick, share as a fraction 0-1
};

export type SimulationResult = {
  /** HHI in points, 0–10,000. */
  hhiSeries: readonly SimulationSeriesPoint[];
  /** Combined share of the three largest firms, in percentage points, 0–100. */
  top3Series: readonly SimulationSeriesPoint[];
  /** The eight firms with the largest peak share, plus a pooled "other". */
  shareSeries: readonly SimulationShareSeries[];
  /** Ticks on which a platform shift fired. */
  shiftTicks: readonly number[];
};

/** Model constants, named so the code reads like the spec in CLAUDE.md §7. */
const INITIAL_FIRMS = 5;
const INITIAL_QUALITY_MIN = 0.8;
const INITIAL_QUALITY_MAX = 1.2;
const ENTRANT_QUALITY_MIN = 0.7;
const ENTRANT_QUALITY_MAX = 1.4;
const ENTRANT_SHARE = 0.005;
const NETWORK_FEEDBACK = 4;
const BASE_CHURN_RATE = 0.15;
const NEW_DEMAND = 0.05;
const SHIFT_INCUMBENT_PENALTY = 0.6;
const SHIFT_ENTRANT_QUALITY = 1.6;
const SHIFT_SWITCHING_DISCOUNT = 0.5;
const SHIFT_WINDOW_TICKS = 5;
const PRUNE_THRESHOLD = 0.001;
const MAX_NAMED_FIRMS = 8;

export const OTHER_SERIES_ID = "other";

type Firm = {
  id: string;
  label: string;
  quality: number;
  share: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Numerically stable softmax; returns weights that sum to 1. */
const softmax = (values: readonly number[]): number[] => {
  if (values.length === 0) return [];
  const max = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - max));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 1 / values.length);
  return exponentials.map((value) => value / total);
};

const makeFirm = (index: number, quality: number, share: number): Firm => ({
  id: `firm-${index}`,
  label: `Firm ${index}`,
  quality,
  share,
});

/** Guards the UI and URL against out-of-range params before the model runs. */
export const normalizeParams = (params: SimulationParams): SimulationParams => ({
  networkStrength: clamp(params.networkStrength, 0, 1),
  switchingCost: clamp(params.switchingCost, 0, 1),
  entrantsPerTick: clamp(Math.round(params.entrantsPerTick), 0, 3),
  shiftProb: clamp(params.shiftProb, 0, 0.2),
  ticks: clamp(Math.round(params.ticks), 1, 200),
  seed: clamp(Math.trunc(params.seed), 0, 999999),
});

const spawnEntrants = (
  firms: Firm[],
  count: number,
  random: RandomSource,
  nextIndex: number,
): number => {
  let index = nextIndex;
  for (let entrant = 0; entrant < count; entrant += 1) {
    const quality = uniform(random, ENTRANT_QUALITY_MIN, ENTRANT_QUALITY_MAX);
    firms.push(makeFirm(index, quality, ENTRANT_SHARE));
    index += 1;
  }
  return index;
};

/**
 * One pass of the spec: attract, churn, redistribute the freed demand plus new
 * demand through a softmax, admit entrants, maybe fire a platform shift, then
 * prune the dead and renormalize.
 */
const advance = (
  firms: readonly Firm[],
  params: SimulationParams,
  effectiveSwitchingCost: number,
): Firm[] => {
  const attract = firms.map(
    (firm) => firm.quality * (1 + NETWORK_FEEDBACK * params.networkStrength * firm.share),
  );
  const churn = firms.map(
    (firm) => firm.share * BASE_CHURN_RATE * (1 - effectiveSwitchingCost),
  );
  const pool = churn.reduce((sum, value) => sum + value, 0) + NEW_DEMAND;
  const weights = softmax(attract);

  return firms.map((firm, index) => ({
    ...firm,
    share: Math.max(0, firm.share - (churn[index] ?? 0) + pool * (weights[index] ?? 0)),
  }));
};

const pruneAndRenormalize = (firms: readonly Firm[]): Firm[] => {
  const survivors = firms.filter((firm) => firm.share >= PRUNE_THRESHOLD);
  const pool = survivors.length > 0 ? survivors : [...firms];
  const total = pool.reduce((sum, firm) => sum + firm.share, 0);
  if (total <= 0) {
    return pool.map((firm) => ({ ...firm, share: 1 / pool.length }));
  }
  return pool.map((firm) => ({ ...firm, share: firm.share / total }));
};

type TickRecord = { shares: Map<string, number> };

const buildShareSeries = (
  records: readonly TickRecord[],
  labels: ReadonlyMap<string, string>,
): SimulationShareSeries[] => {
  const peak = new Map<string, number>();
  const final = new Map<string, number>();
  const lastRecord = records[records.length - 1];

  for (const record of records) {
    for (const [id, share] of record.shares) {
      peak.set(id, Math.max(peak.get(id) ?? 0, share));
    }
  }
  if (lastRecord) {
    for (const [id, share] of lastRecord.shares) final.set(id, share);
  }

  /**
   * Ranked by peak share rather than final share: a firm that led the market and
   * then collapsed after a platform shift is the whole point of the model, so it
   * must stay visible instead of vanishing into "other".
   */
  const named = [...peak.keys()]
    .sort((a, b) => {
      const byPeak = (peak.get(b) ?? 0) - (peak.get(a) ?? 0);
      if (byPeak !== 0) return byPeak;
      const byFinal = (final.get(b) ?? 0) - (final.get(a) ?? 0);
      if (byFinal !== 0) return byFinal;
      return a.localeCompare(b);
    })
    .slice(0, MAX_NAMED_FIRMS);

  const series: SimulationShareSeries[] = named.map((id) => ({
    id,
    label: labels.get(id) ?? id,
    values: records.map((record) => record.shares.get(id) ?? 0),
  }));

  const namedSet = new Set(named);
  const otherValues = records.map((record) => {
    let total = 0;
    for (const [id, share] of record.shares) {
      if (namedSet.has(id)) continue;
      total += share;
    }
    return total;
  });

  if (otherValues.some((value) => value > 0)) {
    series.push({ id: OTHER_SERIES_ID, label: "Other firms", values: otherValues });
  }

  return series;
};

/** Runs the model. Pure: identical params always give an identical result. */
export const runSimulation = (rawParams: SimulationParams): SimulationResult => {
  const params = normalizeParams(rawParams);
  const random = mulberry32(params.seed);

  let firms: Firm[] = Array.from({ length: INITIAL_FIRMS }, (_, index) =>
    makeFirm(
      index + 1,
      uniform(random, INITIAL_QUALITY_MIN, INITIAL_QUALITY_MAX),
      1 / INITIAL_FIRMS,
    ),
  );

  let nextFirmIndex = INITIAL_FIRMS + 1;
  let shiftWindowRemaining = 0;

  const hhiSeries: SimulationSeriesPoint[] = [];
  const top3Series: SimulationSeriesPoint[] = [];
  const shiftTicks: number[] = [];
  const records: TickRecord[] = [];
  const labels = new Map<string, string>(firms.map((firm) => [firm.id, firm.label]));

  for (let tick = 1; tick <= params.ticks; tick += 1) {
    const effectiveSwitchingCost =
      shiftWindowRemaining > 0
        ? params.switchingCost * SHIFT_SWITCHING_DISCOUNT
        : params.switchingCost;

    firms = advance(firms, params, effectiveSwitchingCost);
    nextFirmIndex = spawnEntrants(firms, params.entrantsPerTick, random, nextFirmIndex);

    if (shiftWindowRemaining > 0) shiftWindowRemaining -= 1;

    if (random() < params.shiftProb) {
      shiftTicks.push(tick);
      for (const firm of firms) firm.quality *= SHIFT_INCUMBENT_PENALTY;
      firms.push(makeFirm(nextFirmIndex, SHIFT_ENTRANT_QUALITY, ENTRANT_SHARE));
      nextFirmIndex += 1;
      shiftWindowRemaining = SHIFT_WINDOW_TICKS;
    }

    firms = pruneAndRenormalize(firms);

    const shares = new Map<string, number>();
    for (const firm of firms) {
      shares.set(firm.id, firm.share);
      labels.set(firm.id, firm.label);
    }
    records.push({ shares });

    const fractions = firms.map((firm) => firm.share);
    hhiSeries.push({ tick, value: computeHhiFromFractions(fractions) });
    top3Series.push({
      tick,
      value: computeTopNShare(
        fractions.map((fraction) => fraction * 100),
        3,
      ),
    });
  }

  return {
    hhiSeries,
    top3Series,
    shareSeries: buildShareSeries(records, labels),
    shiftTicks,
  };
};

export const SIMULATION_PRESETS: readonly {
  id: string;
  label: string;
  description: string;
  params: SimulationParams;
}[] = [
  {
    id: "network-effect",
    label: "Network-effect market",
    description:
      "Strong network feedback and high switching costs: share compounds and one firm runs away with the market.",
    params: {
      networkStrength: 0.9,
      switchingCost: 0.8,
      entrantsPerTick: 0,
      shiftProb: 0,
      ticks: 60,
      seed: 4,
    },
  },
  {
    id: "commodity",
    label: "Commodity market",
    description:
      "Weak network effects, cheap switching and a steady stream of entrants: nobody holds a lead and the market stays fragmented.",
    params: {
      networkStrength: 0.1,
      switchingCost: 0.1,
      entrantsPerTick: 3,
      shiftProb: 0,
      ticks: 60,
      seed: 1,
    },
  },
  {
    id: "platform-shift",
    label: "Platform shift",
    description:
      "A concentrating market repeatedly disrupted: each shift devalues incumbent quality, halves switching costs for five ticks and lets a strong entrant in.",
    params: {
      networkStrength: 0.8,
      switchingCost: 0.7,
      entrantsPerTick: 0,
      shiftProb: 0.08,
      ticks: 60,
      seed: 1,
    },
  },
  {
    id: "balanced",
    label: "Balanced market",
    description:
      "Moderate settings on every dial and the occasional shift: a market that concentrates slowly without tipping to one winner. These are the defaults, so this preset clears the query string.",
    params: {
      networkStrength: 0.5,
      switchingCost: 0.5,
      entrantsPerTick: 0,
      shiftProb: 0.04,
      ticks: 60,
      seed: 1,
    },
  },
];

/** The plain-language sentence the UI and the methodology page both reuse. */
export const SIMULATOR_DISCLAIMER =
  "Illustrative toy model — not a prediction of any real market.";
