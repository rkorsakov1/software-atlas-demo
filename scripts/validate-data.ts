/**
 * Data gate. Importing `@/data` already runs every Zod schema and the
 * referential-integrity pass, so this script adds the checks that are about the
 * dataset as a whole: sourcing discipline, minimum volumes and the confidence
 * census reported at each phase gate.
 *
 * Integrity checks always fail the process, so they also guard `prebuild`.
 * Volume checks are gate checks: they are always reported, and they fail the
 * process only under `--strict`, which is what Gate B and Gate D run. That lets
 * chart and app work build against a partially populated dataset while the data
 * agents are still filling it, without ever letting a sourcing error through.
 */
import {
  chapters,
  companies,
  emerging,
  eras,
  events,
  flows,
  markets,
  moatRubric,
  sources,
} from "@/data";
import type { Confidence, DataPoint } from "@/data/types";
import { SIZE_BAND_BOUNDS, sizeBandLabel } from "@/lib/format";

type Check = { label: string; ok: boolean; detail: string; gateOnly: boolean };

const MINIMUMS = {
  eras: 11,
  markets: 40,
  companies: 80,
  events: 100,
  emerging: 12,
  flows: 25,
  chapters: 9,
} as const;

const strict = process.argv.includes("--strict");

const allDataPoints = (): { point: DataPoint; owner: string }[] => {
  const points: { point: DataPoint; owner: string }[] = [];
  for (const market of markets) {
    for (const point of market.sizeByYear) points.push({ point, owner: `market:${market.id}` });
    if (market.growthRate) points.push({ point: market.growthRate, owner: `market:${market.id}` });
    if (market.hhi) points.push({ point: market.hhi, owner: `market:${market.id}` });
    for (const entry of market.sharesByYear) {
      for (const share of entry.shares) {
        points.push({ point: share.share, owner: `market:${market.id}` });
      }
    }
  }
  for (const company of companies) {
    for (const point of company.revenueByYear) {
      points.push({ point, owner: `company:${company.id}` });
    }
    for (const point of company.marketCapByYear ?? []) {
      points.push({ point, owner: `company:${company.id}` });
    }
    for (const point of company.grossMarginByYear ?? []) {
      points.push({ point, owner: `company:${company.id}` });
    }
  }
  for (const event of events) {
    if (event.dealValue) points.push({ point: event.dealValue, owner: `event:${event.id}` });
  }
  return points;
};

const run = (): void => {
  const checks: Check[] = [];
  const points = allDataPoints();

  const addVolume = (label: string, actual: number, minimum: number): void => {
    checks.push({
      label: `volume: ${label}`,
      ok: actual >= minimum,
      detail: `${actual} / ${minimum} minimum`,
      gateOnly: true,
    });
  };

  addVolume("eras", eras.length, MINIMUMS.eras);
  addVolume("markets", markets.length, MINIMUMS.markets);
  addVolume("companies", companies.length, MINIMUMS.companies);
  addVolume("events", events.length, MINIMUMS.events);
  addVolume("emerging markets", emerging.length, MINIMUMS.emerging);
  addVolume("bundling flows", flows.length, MINIMUMS.flows);
  addVolume("story chapters", chapters.length, MINIMUMS.chapters);

  const verifiedWithoutUrl = sources.filter((source) => source.verified && !source.url);
  checks.push({
    label: "sources: verified entries carry a fetched URL",
    ok: verifiedWithoutUrl.length === 0,
    detail:
      verifiedWithoutUrl.length === 0
        ? "all verified sources have URLs"
        : verifiedWithoutUrl.map((source) => source.id).join(", "),
    gateOnly: false,
  });

  const modeledWithoutNote = points.filter(
    (entry) => entry.point.confidence === "modeled" && !entry.point.note,
  );
  checks.push({
    label: "data points: every modeled value states its method",
    ok: modeledWithoutNote.length === 0,
    detail:
      modeledWithoutNote.length === 0
        ? "all modeled points carry a note"
        : modeledWithoutNote.map((entry) => entry.owner).slice(0, 5).join(", "),
    gateOnly: false,
  });

  const reportedFromUnverified = points.filter((entry) => {
    if (entry.point.confidence !== "reported") return false;
    const source = sources.find((candidate) => candidate.id === entry.point.sourceId);
    return !source || !source.verified;
  });
  checks.push({
    label: "data points: reported values trace to a verified source",
    ok: reportedFromUnverified.length === 0,
    detail:
      reportedFromUnverified.length === 0
        ? "all reported points cite a verified source"
        : reportedFromUnverified
            .map((entry) => `${entry.owner} -> ${entry.point.sourceId}`)
            .slice(0, 5)
            .join(", "),
    gateOnly: false,
  });

  const badRange = points.filter((entry) => {
    const { low, high, value } = entry.point;
    if (low !== undefined && low > value) return true;
    if (high !== undefined && high < value) return true;
    return low !== undefined && high !== undefined && low > high;
  });
  checks.push({
    label: "data points: low <= value <= high",
    ok: badRange.length === 0,
    detail: badRange.length === 0 ? "all ranges ordered" : badRange.map((e) => e.owner).join(", "),
    gateOnly: false,
  });

  // `sizeBand` describes where the market sits *now*, while `sizeByYear` is a series
  // that legitimately starts far smaller - cloud infrastructure was $14.8B in 2014
  // and roughly $500B in 2026. So only the most recent point is held to the band.
  const bandMismatches = markets.filter((market) => {
    if (!market.sizeBand || market.sizeByYear.length === 0) return false;
    const latest = [...market.sizeByYear].sort((a, b) => b.year - a.year)[0];
    if (!latest) return false;
    const bounds = SIZE_BAND_BOUNDS[market.sizeBand];
    const low = latest.low ?? latest.value;
    const high = latest.high ?? latest.value;
    if (bounds.low !== null && high < bounds.low) return true;
    return bounds.high !== null && low > bounds.high;
  });
  checks.push({
    label: "markets: the latest size point sits inside the band it claims",
    ok: bandMismatches.length === 0,
    detail:
      bandMismatches.length === 0
        ? "all banded markets agree with research 3.1"
        : bandMismatches
            .map((market) => `${market.id} claims ${sizeBandLabel[market.sizeBand ?? "XS"]}`)
            .slice(0, 5)
            .join(", "),
    gateOnly: false,
  });

  const contiguous = chapters.every((chapter, index) => chapter.order === index + 1);
  checks.push({
    label: "chapters: order is 1..n with no gaps",
    ok: contiguous,
    detail: chapters.map((chapter) => chapter.order).join(", ") || "none yet",
    gateOnly: false,
  });

  const rubricKeys = Object.keys(moatRubric);
  checks.push({
    label: "rubric: seven moats, six levels each",
    ok:
      rubricKeys.length === 7 &&
      rubricKeys.every(
        (key) => Object.keys(moatRubric[key as keyof typeof moatRubric]).length === 6,
      ),
    detail: `${rubricKeys.length} moats`,
    gateOnly: false,
  });

  const census: Record<Confidence, number> = { reported: 0, estimated: 0, modeled: 0 };
  for (const entry of points) census[entry.point.confidence] += 1;

  const verifiedSources = sources.filter((source) => source.verified).length;
  const withRevenue = companies.filter((company) => company.revenueByYear.length > 0).length;
  const marketsWithShare = markets.filter((market) => market.sharesByYear.length > 0).length;

  process.stdout.write("\nThe Software Atlas - data validation\n");
  process.stdout.write(`====================================${strict ? " (strict)" : ""}\n\n`);
  process.stdout.write(
    `collections   eras ${eras.length} | markets ${markets.length} | companies ${companies.length} | ` +
      `events ${events.length} | emerging ${emerging.length} | flows ${flows.length} | ` +
      `chapters ${chapters.length} | sources ${sources.length}\n`,
  );
  process.stdout.write(
    `data points   ${points.length} total | reported ${census.reported} | ` +
      `estimated ${census.estimated} | modeled ${census.modeled}\n`,
  );
  process.stdout.write(
    `coverage      ${verifiedSources}/${sources.length} sources verified | ` +
      `${withRevenue}/${companies.length} companies with a revenue series | ` +
      `${marketsWithShare}/${markets.length} markets with share data\n\n`,
  );

  let blocking = 0;
  for (const check of checks) {
    const enforced = strict || !check.gateOnly;
    const status = check.ok ? "PASS" : enforced ? "FAIL" : "PEND";
    if (!check.ok && enforced) blocking += 1;
    process.stdout.write(`${status}  ${check.label} (${check.detail})\n`);
  }

  process.stdout.write("\n");
  if (blocking > 0) {
    process.stderr.write(`${blocking} check(s) failed.\n`);
    process.exit(1);
  }
  process.stdout.write(
    strict
      ? "All data checks passed, including minimum volumes.\n"
      : "All integrity checks passed. Run with --strict to enforce minimum volumes.\n",
  );
};

run();
