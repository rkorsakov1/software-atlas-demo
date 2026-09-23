/**
 * Herfindahl-Hirschman Index helpers.
 *
 * HHI is the sum of squared market shares expressed in percentage points, so a
 * monopoly scores 10,000 and a perfectly fragmented market approaches 0. The US
 * DOJ/FTC 2023 Merger Guidelines treat 1,800 as the threshold above which a
 * market is "highly concentrated".
 */

export const HHI_HIGHLY_CONCENTRATED = 1800;
export const HHI_MODERATELY_CONCENTRATED = 1000;

export type ConcentrationBand = "unconcentrated" | "moderate" | "high";

/** Shares are percentage points (0-100). Values outside that range are ignored. */
export const computeHhi = (sharesInPercent: readonly number[]): number => {
  let total = 0;
  for (const share of sharesInPercent) {
    if (!Number.isFinite(share) || share <= 0) continue;
    total += share * share;
  }
  return Math.min(10000, Math.round(total));
};

/** Shares are fractions (0-1), as produced by the simulator. */
export const computeHhiFromFractions = (shareFractions: readonly number[]): number =>
  computeHhi(shareFractions.map((fraction) => fraction * 100));

export const computeTopNShare = (
  sharesInPercent: readonly number[],
  topN: number,
): number => {
  if (topN <= 0) return 0;
  const sorted = [...sharesInPercent].filter(Number.isFinite).sort((a, b) => b - a);
  return sorted.slice(0, topN).reduce((sum, share) => sum + share, 0);
};

export const computeTop3Share = (sharesInPercent: readonly number[]): number =>
  computeTopNShare(sharesInPercent, 3);

export const concentrationBand = (hhi: number): ConcentrationBand => {
  if (hhi >= HHI_HIGHLY_CONCENTRATED) return "high";
  if (hhi >= HHI_MODERATELY_CONCENTRATED) return "moderate";
  return "unconcentrated";
};

export const concentrationLabel: Record<ConcentrationBand, string> = {
  unconcentrated: "Unconcentrated (HHI below 1,000)",
  moderate: "Moderately concentrated (HHI 1,000–1,800)",
  high: "Highly concentrated (HHI above 1,800)",
};

/** The sentence every modeled HHI data point must carry as its `note`. */
export const HHI_METHOD_NOTE =
  "Modeled: sum of squared published percentage shares, with the residual 'Other' treated as a fully fragmented tail contributing zero, which makes this a lower bound.";
