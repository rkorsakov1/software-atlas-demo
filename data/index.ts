import type { z } from "zod";

import { chapters as rawChapters } from "@/data/chapters";
import { companies as rawCompanies } from "@/data/companies";
import { emerging as rawEmerging } from "@/data/emerging";
import { eras as rawEras } from "@/data/eras";
import { events as rawEvents } from "@/data/events";
import { flows as rawFlows } from "@/data/flows";
import rawSeries from "@/data/generated/series.json";
import { markets as rawMarkets } from "@/data/markets";
import { moatRubric as rawRubric } from "@/data/rubric";
import {
  chaptersSchema,
  companiesSchema,
  emergingSchema,
  erasSchema,
  eventsSchema,
  flowsSchema,
  generatedSeriesSchema,
  marketsSchema,
  moatRubricSchema,
  sourcesSchema,
} from "@/data/schemas";
import { sources as rawSources } from "@/data/sources";
import type {
  BundlingFlow,
  Company,
  CompetitiveEvent,
  EmergingMarket,
  Era,
  GeneratedSeries,
  IndustrySizePoint,
  Market,
  MoatRubric,
  Source,
  StoryChapter,
  Vendor,
} from "@/data/types";
import { checkReferentialIntegrity, type IntegrityIssue } from "@/lib/selectors";

const parseCollection = <TParsed>(
  name: string,
  schema: z.ZodType<TParsed>,
  input: unknown,
): TParsed => {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  const details = result.error.issues
    .slice(0, 5)
    .map((issue) => `  ${name}.${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Data validation failed for ${name}:\n${details}`);
};

const series: GeneratedSeries = parseCollection("series", generatedSeriesSchema, rawSeries);

/**
 * Folds the CSV-built series into the hand-written markets. A market with CSV
 * size rows uses them instead of its modeled size band; CSV share rows add years
 * the hand-written share series does not already cover.
 */
const mergeSeries = (base: Market[]): Market[] =>
  base.map((market) => {
    const sizes = series.marketSizes
      .filter((entry) => entry.marketId === market.id)
      .map((entry) => entry.point);
    const coveredYears = new Set(market.sharesByYear.map((entry) => entry.year));
    const shareYears = new Map<number, Market["sharesByYear"][number]["shares"]>();
    for (const entry of series.marketShares) {
      if (entry.marketId !== market.id || coveredYears.has(entry.year)) continue;
      const shares = shareYears.get(entry.year) ?? [];
      shares.push({ companyId: entry.companyId, share: entry.point });
      shareYears.set(entry.year, shares);
    }
    const addedShares = [...shareYears.entries()].map(([year, shares]) => ({ year, shares }));
    return {
      ...market,
      sizeByYear: sizes.length > 0 ? sizes : market.sizeByYear,
      sharesByYear: [...market.sharesByYear, ...addedShares].sort((a, b) => a.year - b.year),
    };
  });

export const sources: Source[] = parseCollection("sources", sourcesSchema, [
  ...rawSources,
  ...series.sources,
]);
export const vendors: Vendor[] = series.vendors;
export const industrySize: IndustrySizePoint[] = series.industrySize;
export const eras: Era[] = parseCollection("eras", erasSchema, rawEras);
export const markets: Market[] = mergeSeries(parseCollection("markets", marketsSchema, rawMarkets));
export const companies: Company[] = parseCollection("companies", companiesSchema, rawCompanies);
export const events: CompetitiveEvent[] = parseCollection("events", eventsSchema, rawEvents);
export const emerging: EmergingMarket[] = parseCollection("emerging", emergingSchema, rawEmerging);
export const flows: BundlingFlow[] = parseCollection("flows", flowsSchema, rawFlows);
export const chapters: StoryChapter[] = parseCollection("chapters", chaptersSchema, rawChapters)
  .slice()
  .sort((a, b) => a.order - b.order);
export const moatRubric: MoatRubric = parseCollection("rubric", moatRubricSchema, rawRubric);

export const atlas = {
  sources,
  eras,
  markets,
  companies,
  events,
  emerging,
  flows,
  vendors,
} as const;

const integrityIssues: IntegrityIssue[] = checkReferentialIntegrity(atlas);
if (integrityIssues.length > 0) {
  const details = integrityIssues
    .slice(0, 10)
    .map((issue) => `  ${issue.collection}#${issue.id}: ${issue.message}`)
    .join("\n");
  throw new Error(
    `Referential integrity failed (${integrityIssues.length} issues):\n${details}`,
  );
}

export type { IntegrityIssue };
