/**
 * Builds `data/generated/series.json` from the contributor-facing CSV files in
 * `data/series/`. Run `npm run series` after editing a CSV; `npm run series --
 * --check` fails when the JSON is out of date (used by `validate-data`).
 *
 * Every row carries its own source (publisher, title, date, URL, quote), so a
 * contributor adds a number by adding one line. Sources are deduplicated by URL
 * and reuse an existing `data/sources.ts` id when the URL is already registered.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

import { companies } from "@/data/companies";
import { markets } from "@/data/markets";
import { generatedSeriesSchema } from "@/data/schemas";
import { sources as registeredSources } from "@/data/sources";
import type {
  Confidence,
  DataPoint,
  GeneratedSeries,
  IndustrySizePoint,
  Source,
  Vendor,
} from "@/data/types";
import { parseCsv, type CsvRecord } from "@/lib/csv";

const ROOT = process.cwd();
const SERIES_DIR = join(ROOT, "data", "series");
const OUTPUT = join(ROOT, "data", "generated", "series.json");

const SOURCE_KINDS: readonly Source["kind"][] = [
  "filing",
  "company",
  "analyst",
  "press",
  "academic",
  "book",
  "legal",
];
const RELIABILITIES: readonly Source["reliability"][] = ["primary", "secondary", "low"];
const CONFIDENCES: readonly Confidence[] = ["reported", "estimated", "modeled"];

/** Names a share row may use for a profiled company that differ from its display name. */
const COMPANY_ALIASES: Readonly<Record<string, string>> = {
  aws: "amazon",
  "amazon web services": "amazon",
  "google cloud": "google",
  alphabet: "google",
  "salesforce.com": "salesforce",
};

const errors: string[] = [];

const fail = (file: string, line: number, message: string): void => {
  errors.push(`${file}:${line}: ${message}`);
};

const readRows = (file: string): CsvRecord[] => {
  const path = join(SERIES_DIR, file);
  if (!existsSync(path)) return [];
  return parseCsv(readFileSync(path, "utf-8"));
};

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toNumber = (raw: string | undefined): number | undefined => {
  if (raw === undefined || raw.length === 0) return undefined;
  const value = Number(raw.replace(/,/g, ""));
  return Number.isFinite(value) ? value : Number.NaN;
};

const registeredByUrl = new Map(
  registeredSources
    .filter((source): source is Source & { url: string } => typeof source.url === "string")
    .map((source) => [source.url, source]),
);

const generatedSources = new Map<string, Source>();

/** Registers the row's source once per URL and returns its id. */
const sourceIdFor = (row: CsvRecord, file: string, line: number): string | null => {
  const url = row.url ?? "";
  const title = row.source_title ?? "";
  const publisher = row.publisher ?? "";
  if (title.length === 0 || publisher.length === 0) {
    fail(file, line, "publisher and source_title are required");
    return null;
  }
  const key = url.length > 0 ? url : `${publisher}|${title}`;
  const registered = registeredByUrl.get(url);
  if (registered) return registered.id;
  const existing = generatedSources.get(key);
  const verified = (row.verified ?? "").toLowerCase() === "yes";
  if (existing) {
    // One verified row is enough to show the page was read in this project.
    if (verified && !existing.verified) existing.verified = true;
    return existing.id;
  }
  if (verified && url.length === 0) {
    fail(file, line, "verified=yes needs the url that was checked");
    return null;
  }
  const kind = (row.source_kind || "analyst") as Source["kind"];
  if (!SOURCE_KINDS.includes(kind)) {
    fail(file, line, `source_kind must be one of ${SOURCE_KINDS.join(", ")}`);
    return null;
  }
  const reliability = (row.reliability || "secondary") as Source["reliability"];
  if (!RELIABILITIES.includes(reliability)) {
    fail(file, line, `reliability must be one of ${RELIABILITIES.join(", ")}`);
    return null;
  }
  const id = `D${createHash("sha1").update(key).digest("hex").slice(0, 6).toUpperCase()}`;
  generatedSources.set(key, {
    id,
    title,
    publisher,
    date: row.source_date || row.year || "undated",
    kind,
    ...(url.length > 0 ? { url } : {}),
    verified,
    reliability,
  });
  return id;
};

/** Shared number, confidence and source handling for every series row. */
const buildPoint = (
  row: CsvRecord,
  file: string,
  line: number,
  valueColumn: string,
  unit: DataPoint["unit"],
): DataPoint | null => {
  const year = toNumber(row.year);
  const value = toNumber(row[valueColumn]);
  const low = toNumber(row.low);
  const high = toNumber(row.high);
  if (year === undefined || !Number.isInteger(year)) {
    fail(file, line, "year must be a whole number");
    return null;
  }
  if (value === undefined || Number.isNaN(value)) {
    fail(file, line, `${valueColumn} must be a number`);
    return null;
  }
  if (Number.isNaN(low) || Number.isNaN(high)) {
    fail(file, line, "low and high must be numbers when present");
    return null;
  }
  const confidence = row.confidence as Confidence;
  if (!CONFIDENCES.includes(confidence)) {
    fail(file, line, `confidence must be one of ${CONFIDENCES.join(", ")}`);
    return null;
  }
  const verified = (row.verified ?? "").toLowerCase() === "yes";
  if (confidence === "reported" && !verified) {
    fail(file, line, "confidence=reported requires verified=yes (a maintainer read the figure at the url)");
    return null;
  }
  const sourceId = sourceIdFor(row, file, line);
  if (sourceId === null) return null;
  const note = row.notes ?? "";
  if (confidence === "modeled" && note.length === 0) {
    fail(file, line, "confidence=modeled needs notes stating the method");
    return null;
  }
  return {
    value,
    ...(low === undefined ? {} : { low }),
    ...(high === undefined ? {} : { high }),
    year,
    unit,
    sourceId,
    confidence,
    ...(note.length === 0 ? {} : { note }),
    ...(row.definition ? { definition: row.definition } : {}),
  };
};

const marketIds = new Set(markets.map((market) => market.id));
const companyById = new Map(companies.map((company) => [company.id, company]));
const companyByName = new Map(companies.map((company) => [company.name.toLowerCase(), company]));
const vendors = new Map<string, Vendor>();

const resolveHolder = (name: string): string => {
  const lower = name.toLowerCase();
  const alias = COMPANY_ALIASES[lower];
  if (alias) return alias;
  if (companyById.has(lower)) return lower;
  const byName = companyByName.get(lower);
  if (byName) return byName.id;
  const id = slugify(name);
  if (!companyById.has(id) && !vendors.has(id)) vendors.set(id, { id, name });
  return id;
};

const buildMarketSizes = (): GeneratedSeries["marketSizes"] => {
  const file = "market-sizes.csv";
  return readRows(file).flatMap((row, index) => {
    const line = index + 2;
    if (!marketIds.has(row.market_id ?? "")) {
      fail(file, line, `unknown market_id "${row.market_id}"`);
      return [];
    }
    const point = buildPoint(row, file, line, "value_usd_b", "USD_B");
    return point ? [{ marketId: row.market_id ?? "", point }] : [];
  });
};

const buildMarketShares = (): GeneratedSeries["marketShares"] => {
  const file = "market-shares.csv";
  return readRows(file).flatMap((row, index) => {
    const line = index + 2;
    if (!marketIds.has(row.market_id ?? "")) {
      fail(file, line, `unknown market_id "${row.market_id}"`);
      return [];
    }
    const company = row.company ?? "";
    if (company.length === 0) {
      fail(file, line, "company is required");
      return [];
    }
    const point = buildPoint(row, file, line, "share_percent", "percent");
    if (!point) return [];
    return [
      { marketId: row.market_id ?? "", year: point.year, companyId: resolveHolder(company), point },
    ];
  });
};

const buildIndustrySize = (): IndustrySizePoint[] => {
  const file = "industry-size.csv";
  return readRows(file).flatMap((row, index) => {
    const line = index + 2;
    const scope = row.scope as IndustrySizePoint["scope"];
    if (scope !== "world" && scope !== "us") {
      fail(file, line, 'scope must be "world" or "us"');
      return [];
    }
    if (!row.definition) {
      fail(file, line, "definition is required: say what the figure counts");
      return [];
    }
    const point = buildPoint(row, file, line, "value_usd_b", "USD_B");
    return point ? [{ scope, definition: row.definition, point }] : [];
  });
};

const byYear = <TItem extends { point: DataPoint }>(a: TItem, b: TItem): number =>
  a.point.year - b.point.year;

const series: GeneratedSeries = {
  marketSizes: buildMarketSizes().sort(
    (a, b) => a.marketId.localeCompare(b.marketId) || byYear(a, b),
  ),
  marketShares: buildMarketShares().sort(
    (a, b) =>
      a.marketId.localeCompare(b.marketId) ||
      a.year - b.year ||
      b.point.value - a.point.value,
  ),
  industrySize: buildIndustrySize().sort(
    (a, b) => a.scope.localeCompare(b.scope) || byYear(a, b),
  ),
  sources: [...generatedSources.values()].sort((a, b) => a.id.localeCompare(b.id)),
  vendors: [...vendors.values()].sort((a, b) => a.id.localeCompare(b.id)),
};

const seen = new Set<string>();
for (const entry of series.marketShares) {
  const key = `${entry.marketId}|${entry.year}|${entry.companyId}`;
  if (seen.has(key)) errors.push(`market-shares.csv: duplicate share for ${key}`);
  seen.add(key);
}

const parsed = generatedSeriesSchema.safeParse(series);
if (!parsed.success) {
  for (const issue of parsed.error.issues.slice(0, 10)) {
    errors.push(`series.${issue.path.join(".")}: ${issue.message}`);
  }
}

if (errors.length > 0) {
  console.error(`Series build failed (${errors.length} problems):`);
  for (const message of errors) console.error(`  ${message}`);
  process.exit(1);
}

const json = `${JSON.stringify(series, null, 2)}\n`;

if (process.argv.includes("--check")) {
  const current = existsSync(OUTPUT) ? readFileSync(OUTPUT, "utf-8") : "";
  if (current !== json) {
    console.error("data/generated/series.json is out of date. Run `npm run series`.");
    process.exit(1);
  }
  console.log("PASS  series: data/generated/series.json matches data/series/*.csv");
  process.exit(0);
}

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, json);
console.log(
  `Wrote ${OUTPUT}: ${series.marketSizes.length} sizes, ${series.marketShares.length} shares, ` +
    `${series.industrySize.length} industry points, ${series.sources.length} new sources, ` +
    `${series.vendors.length} vendors.`,
);
