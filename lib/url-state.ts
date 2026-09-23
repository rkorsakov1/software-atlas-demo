import { z } from "zod";

import { archetypeSchema, categorySchema, maturitySchema } from "@/data/schemas";
import type { Archetype, Category, Maturity } from "@/data/types";

export const ATLAS_MIN_YEAR = 1950;
export const ATLAS_MAX_YEAR = 2026;
export const MAX_PINS = 3;

export const CHART_KEYS = [
  "timeline",
  "treemap",
  "share",
  "bubble",
  "lineage",
  "bundling",
  "moat",
  "emerging",
] as const;

export type ChartKey = (typeof CHART_KEYS)[number];

export const FOCUS_KINDS = ["company", "market", "event"] as const;
export type FocusKind = (typeof FOCUS_KINDS)[number];

export type FocusRef = { kind: FocusKind; id: string };

export type AtlasState = {
  mode: "story" | "explore";
  year: number;
  from: number;
  to: number;
  cat: Category[];
  arch: Archetype[];
  mat: Maturity[];
  q: string;
  focus: FocusRef | null;
  pin: string[];
  chart: ChartKey;
  net: number;
  sw: number;
  ent: number;
  shift: number;
  ticks: number;
  seed: number;
};

export const ATLAS_DEFAULTS: AtlasState = {
  mode: "explore",
  year: 2025,
  from: ATLAS_MIN_YEAR,
  to: ATLAS_MAX_YEAR,
  cat: [],
  arch: [],
  mat: [],
  q: "",
  focus: null,
  pin: [],
  chart: "timeline",
  net: 0.5,
  sw: 0.5,
  // Zero, not one: with any entrant flow the model's softmax spreads new demand
  // almost uniformly, so every market fragments and the bare /simulator/ view
  // would open on HHI around 160 regardless of the other dials. Starting from a
  // fixed population of five firms lets the network-strength dial show what it
  // does; entrants are a dial the reader turns up. See /methodology#simulator.
  ent: 0,
  shift: 0.04,
  ticks: 60,
  seed: 1,
};

const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

const clampNumber = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const roundTo = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const yearSchema = z.coerce
  .number()
  .int()
  .catch(ATLAS_DEFAULTS.year)
  .transform((value) => clampNumber(value, ATLAS_MIN_YEAR, ATLAS_MAX_YEAR));

const unitIntervalSchema = (fallback: number, decimals: number, max = 1) =>
  z.coerce
    .number()
    .catch(fallback)
    .transform((value) =>
      Number.isFinite(value) ? roundTo(clampNumber(value, 0, max), decimals) : fallback,
    );

const focusSchema = z
  .string()
  .transform((raw): FocusRef | null => {
    const separatorIndex = raw.indexOf(":");
    if (separatorIndex <= 0) return null;
    const kind = raw.slice(0, separatorIndex);
    const id = raw.slice(separatorIndex + 1);
    if (!FOCUS_KINDS.includes(kind as FocusKind)) return null;
    if (!ID_PATTERN.test(id)) return null;
    return { kind: kind as FocusKind, id };
  })
  .catch(null);

/** Splits a repeated or comma-joined param into de-duplicated, ordered members. */
const splitList = (raw: string | string[] | undefined): string[] => {
  if (raw === undefined) return [];
  const parts = (Array.isArray(raw) ? raw : [raw]).flatMap((entry) => entry.split(","));
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.length === 0 || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
};

const filterToEnum = <TValue extends string>(
  candidates: string[],
  schema: z.ZodType<TValue>,
): TValue[] => {
  const result: TValue[] = [];
  for (const candidate of candidates) {
    const parsed = schema.safeParse(candidate);
    if (parsed.success) result.push(parsed.data);
  }
  return result;
};

export type ParamsInput =
  | URLSearchParams
  | Readonly<Record<string, string | string[] | undefined>>
  | string;

const toSearchParams = (input: ParamsInput): URLSearchParams => {
  if (typeof input === "string") return new URLSearchParams(input.replace(/^\?/, ""));
  if (input instanceof URLSearchParams) return new URLSearchParams(input.toString());
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    for (const entry of Array.isArray(value) ? value : [value]) params.append(key, entry);
  }
  return params;
};

const readAll = (params: URLSearchParams, key: string): string[] => params.getAll(key);

/** An empty param (`?sw=`) means "not set", so it falls through to the default. */
const readOne = (params: URLSearchParams, key: string): string | undefined => {
  const value = params.get(key);
  if (value === null || value.trim().length === 0) return undefined;
  return value;
};

/** Parses URL params into fully-populated state; every field falls back to its default. */
export const parseAtlasState = (input: ParamsInput): AtlasState => {
  const params = toSearchParams(input);

  const mode = readOne(params, "mode") === "story" ? "story" : ATLAS_DEFAULTS.mode;
  const year = yearSchema.parse(readOne(params, "year") ?? ATLAS_DEFAULTS.year);

  const rawFrom = yearSchema.parse(readOne(params, "from") ?? ATLAS_DEFAULTS.from);
  const rawTo = yearSchema.parse(readOne(params, "to") ?? ATLAS_DEFAULTS.to);
  const from = Math.min(rawFrom, rawTo);
  const to = Math.max(rawFrom, rawTo);

  const chartCandidate = readOne(params, "chart");
  const chart = CHART_KEYS.includes(chartCandidate as ChartKey)
    ? (chartCandidate as ChartKey)
    : ATLAS_DEFAULTS.chart;

  const pin = splitList(readAll(params, "pin"))
    .filter((id) => ID_PATTERN.test(id))
    .slice(0, MAX_PINS);

  const focusRaw = readOne(params, "focus");

  return {
    mode,
    year: clampNumber(year, from, to),
    from,
    to,
    cat: filterToEnum(splitList(readAll(params, "cat")), categorySchema),
    arch: filterToEnum(splitList(readAll(params, "arch")), archetypeSchema),
    mat: filterToEnum(splitList(readAll(params, "mat")), maturitySchema),
    q: (readOne(params, "q") ?? ATLAS_DEFAULTS.q).slice(0, 80).trim(),
    focus: focusRaw === undefined ? null : focusSchema.parse(focusRaw),
    pin,
    chart,
    net: unitIntervalSchema(ATLAS_DEFAULTS.net, 2).parse(readOne(params, "net") ?? ATLAS_DEFAULTS.net),
    sw: unitIntervalSchema(ATLAS_DEFAULTS.sw, 2).parse(readOne(params, "sw") ?? ATLAS_DEFAULTS.sw),
    ent: unitIntervalSchema(ATLAS_DEFAULTS.ent, 0, 3).parse(
      readOne(params, "ent") ?? ATLAS_DEFAULTS.ent,
    ),
    shift: unitIntervalSchema(ATLAS_DEFAULTS.shift, 3, 0.2).parse(
      readOne(params, "shift") ?? ATLAS_DEFAULTS.shift,
    ),
    ticks: z.coerce
      .number()
      .int()
      .catch(ATLAS_DEFAULTS.ticks)
      .transform((value) => clampNumber(value, 10, 200))
      .parse(readOne(params, "ticks") ?? ATLAS_DEFAULTS.ticks),
    seed: z.coerce
      .number()
      .int()
      .catch(ATLAS_DEFAULTS.seed)
      .transform((value) => clampNumber(Math.trunc(value), 0, 999999))
      .parse(readOne(params, "seed") ?? ATLAS_DEFAULTS.seed),
  };
};

const SERIALIZE_ORDER = [
  "mode",
  "chart",
  "year",
  "from",
  "to",
  "cat",
  "arch",
  "mat",
  "q",
  "focus",
  "pin",
  "net",
  "sw",
  "ent",
  "shift",
  "ticks",
  "seed",
] as const;

const sameList = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

/** Serialises state to a canonical query string, omitting every default value. */
export const serializeAtlasState = (state: AtlasState): string => {
  const params = new URLSearchParams();

  const appendList = (key: string, values: readonly string[]): void => {
    if (values.length === 0) return;
    params.set(key, values.join(","));
  };

  for (const key of SERIALIZE_ORDER) {
    if (key === "mode") {
      if (state.mode !== ATLAS_DEFAULTS.mode) params.set("mode", state.mode);
      continue;
    }
    if (key === "chart") {
      if (state.chart !== ATLAS_DEFAULTS.chart) params.set("chart", state.chart);
      continue;
    }
    if (key === "cat" || key === "arch" || key === "mat" || key === "pin") {
      if (!sameList(state[key], ATLAS_DEFAULTS[key])) appendList(key, state[key]);
      continue;
    }
    if (key === "q") {
      if (state.q !== ATLAS_DEFAULTS.q) params.set("q", state.q);
      continue;
    }
    if (key === "focus") {
      if (state.focus !== null) params.set("focus", `${state.focus.kind}:${state.focus.id}`);
      continue;
    }
    if (state[key] !== ATLAS_DEFAULTS[key]) params.set(key, String(state[key]));
  }

  return params.toString();
};

export const updateAtlasState = (
  state: AtlasState,
  patch: Partial<AtlasState>,
): AtlasState => {
  const next: AtlasState = { ...state, ...patch };
  if (next.from > next.to) {
    const from = Math.min(next.from, next.to);
    const to = Math.max(next.from, next.to);
    next.from = from;
    next.to = to;
  }
  next.year = clampNumber(next.year, next.from, next.to);
  next.pin = next.pin.slice(0, MAX_PINS);
  return next;
};

export const togglePin = (state: AtlasState, id: string): AtlasState => {
  if (state.pin.includes(id)) {
    return updateAtlasState(state, { pin: state.pin.filter((pinned) => pinned !== id) });
  }
  if (state.pin.length >= MAX_PINS) return state;
  return updateAtlasState(state, { pin: [...state.pin, id] });
};

export const focusHref = (ref: FocusRef): string =>
  `/explore/?${serializeAtlasState(updateAtlasState(ATLAS_DEFAULTS, { focus: ref }))}`;

/** Builds an /explore link from a story chapter's `graphicState`. */
export const exploreHrefFromGraphicState = (
  graphicState: Record<string, string | number | string[]>,
): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(graphicState)) {
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(","));
      continue;
    }
    params.set(key, String(value));
  }
  const state = parseAtlasState(params);
  const query = serializeAtlasState(state);
  return query.length === 0 ? "/explore/" : `/explore/?${query}`;
};
