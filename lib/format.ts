import type {
  Archetype,
  Category,
  Confidence,
  DataPoint,
  EventType,
  Horizon,
  Maturity,
  MoatKey,
  SignalType,
  SizeBand,
  Unit,
} from "@/data/types";

const compactUsd = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const preciseUsd = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** Formats a bare number in billions of USD, choosing trillions above 1,000B. */
export const formatUsdBillions = (value: number): string => {
  if (!Number.isFinite(value)) return "n/a";
  if (Math.abs(value) >= 1000) return `$${compactUsd.format(value / 1000)}T`;
  if (Math.abs(value) < 1) return `$${preciseUsd.format(value * 1000)}M`;
  return `$${compactUsd.format(value)}B`;
};

export const formatUsdMillions = (value: number): string => {
  if (!Number.isFinite(value)) return "n/a";
  if (Math.abs(value) >= 1000) return formatUsdBillions(value / 1000);
  return `$${compactUsd.format(value)}M`;
};

export const formatPercent = (value: number, fractionDigits = 1): string => {
  if (!Number.isFinite(value)) return "n/a";
  return `${value.toFixed(fractionDigits)}%`;
};

export const formatCount = (value: number): string =>
  Number.isFinite(value) ? compactUsd.format(value) : "n/a";

export const formatValue = (value: number, unit: Unit): string => {
  if (unit === "USD_B") return formatUsdBillions(value);
  if (unit === "USD_M") return formatUsdMillions(value);
  if (unit === "percent") return formatPercent(value);
  return formatCount(value);
};

/** Renders a data point as "value (low–high)" when a range is present. */
export const formatDataPoint = (point: DataPoint): string => {
  const main = formatValue(point.value, point.unit);
  if (point.low === undefined || point.high === undefined) return main;
  return `${main} (${formatValue(point.low, point.unit)}–${formatValue(point.high, point.unit)})`;
};

export const formatYearRange = (startYear: number, endYear: number | null): string =>
  endYear === null ? `${startYear}–present` : `${startYear}–${endYear}`;

export const formatSignedPercent = (value: number, fractionDigits = 1): string => {
  if (!Number.isFinite(value)) return "n/a";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(fractionDigits)}%`;
};

export const confidenceLabel: Record<Confidence, string> = {
  reported: "Reported",
  estimated: "Estimated",
  modeled: "Modeled",
};

export const confidenceDescription: Record<Confidence, string> = {
  reported: "Taken from a company filing or official release.",
  estimated: "An analyst or press estimate; definitions vary between firms.",
  modeled: "Derived in this project; the method is stated on the data point.",
};

export const categoryLabel: Record<Category, string> = {
  infrastructure: "Infrastructure",
  horizontal: "Horizontal apps",
  vertical: "Vertical apps",
  consumer: "Consumer",
  emerging: "Emerging",
};

export const archetypeLabel: Record<Archetype, string> = {
  "platform-giant": "Platform giant",
  "suite-consolidator": "Suite consolidator",
  "best-of-breed": "Best of breed",
  vertical: "Vertical specialist",
  "commercial-oss": "Commercial open source",
  "plg-challenger": "PLG challenger",
  "pe-rollup": "PE roll-up",
  marketplace: "Marketplace",
  "ai-native": "AI native",
  "si-channel": "SI / channel",
};

export const maturityLabel: Record<Maturity, string> = {
  nascent: "Nascent",
  emerging: "Emerging",
  scaling: "Scaling",
  consolidating: "Consolidating",
  mature: "Mature",
  declining: "Declining",
};

export const eventTypeLabel: Record<EventType, string> = {
  acquisition: "Acquisition",
  bundling: "Bundling",
  unbundling: "Unbundling",
  disruption: "Disruption",
  regulation: "Regulation",
  "license-change": "Licence change",
  "platform-shift": "Platform shift",
  "pricing-shift": "Pricing shift",
  launch: "Launch",
  "spin-off": "Spin-off",
  milestone: "Milestone",
};

export const moatLabel: Record<MoatKey, string> = {
  network: "Network effects",
  switching: "Switching costs",
  scale: "Scale economies",
  data: "Data advantage",
  brand: "Brand",
  ecosystem: "Ecosystem",
  regulatory: "Regulatory",
};

export const signalTypeLabel: Record<SignalType, string> = {
  "platform-shift": "Platform shift",
  "cost-curve": "Cost curve",
  "new-interface": "New interface",
  regulation: "Regulation",
  unbundling: "Unbundling",
  "leading-indicator": "Leading indicator",
};

export const horizonLabel: Record<Horizon, string> = {
  "0-2y": "0–2 years",
  "2-5y": "2–5 years",
  "5y+": "5+ years",
};

/**
 * The order-of-magnitude bands from research §3.1, in USD billions. `null` means
 * the band is open-ended on that side. `data/markets.ts` generates its modeled size
 * points from the same bounds, and `scripts/validate-data.ts` fails the build if a
 * market's size point ever falls outside the band it claims — the two definitions
 * drifted apart once already.
 */
export const SIZE_BAND_BOUNDS: Record<SizeBand, { low: number | null; high: number | null }> = {
  XS: { low: null, high: 5 },
  S: { low: 5, high: 20 },
  M: { low: 20, high: 60 },
  L: { low: 60, high: 150 },
  XL: { low: 150, high: null },
};

export const sizeBandLabel: Record<SizeBand, string> = {
  XS: "XS — under $5B",
  S: "S — $5–20B",
  M: "M — $20–60B",
  L: "L — $60–150B",
  XL: "XL — over $150B",
};

/** Turns an id such as "cloud-iaas-paas" into "Cloud iaas paas" for fallback labels. */
export const humanizeId = (id: string): string => {
  const spaced = id.replace(/-/g, " ").trim();
  if (spaced.length === 0) return id;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export type MoatRationaleLine = { label: string; score: number; text: string };

const MOAT_RATIONALE_PATTERN =
  /(Network|Switching|Scale|Data|Brand|Ecosystem|Regulatory) (\d): ([\s\S]*?)(?=\s(?:Network|Switching|Scale|Data|Brand|Ecosystem|Regulatory) \d:|$)/g;

/**
 * Splits a company's moat rationale ("Network 1: … Switching 4: …") into one
 * line per moat. Text that doesn't follow the pattern comes back as one line.
 */
export const splitMoatRationale = (rationale: string): MoatRationaleLine[] => {
  const lines = [...rationale.matchAll(MOAT_RATIONALE_PATTERN)].map((match) => ({
    label: match[1] ?? "",
    score: Number(match[2]),
    text: (match[3] ?? "").trim(),
  }));
  if (lines.length > 0) return lines;
  return [{ label: "", score: 0, text: rationale }];
};
