import { z } from "zod";

import type {
  BundlingFlow,
  GeneratedSeries,
  IndustrySizePoint,
  Vendor,
  Company,
  CompetitiveEvent,
  EmergingMarket,
  Era,
  Market,
  MoatRubric,
  Source,
  StoryChapter,
} from "@/data/types";

export const confidenceSchema = z.enum(["reported", "estimated", "modeled"]);
export const unitSchema = z.enum(["USD_B", "USD_M", "percent", "count"]);

export const sourceSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    publisher: z.string().min(1),
    date: z.string().min(4),
    kind: z.enum(["filing", "company", "analyst", "press", "academic", "book", "legal"]),
    url: z.url().optional(),
    verified: z.boolean(),
    reliability: z.enum(["primary", "secondary", "low"]),
  })
  .refine((source) => !source.verified || typeof source.url === "string", {
    message: "A source marked verified: true must carry the URL that was fetched",
    path: ["url"],
  });

export const dataPointSchema = z
  .object({
    value: z.number().finite(),
    low: z.number().finite().optional(),
    high: z.number().finite().optional(),
    year: z.number().int().min(1940).max(2100),
    unit: unitSchema,
    sourceId: z.string().min(1),
    confidence: confidenceSchema,
    note: z.string().min(1).optional(),
    definition: z.string().min(1).optional(),
  })
  .refine((point) => point.confidence !== "modeled" || typeof point.note === "string", {
    message: "A modeled data point must state its method in note",
    path: ["note"],
  })
  .refine((point) => point.low === undefined || point.low <= point.value, {
    message: "low must be less than or equal to value",
    path: ["low"],
  })
  .refine((point) => point.high === undefined || point.high >= point.value, {
    message: "high must be greater than or equal to value",
    path: ["high"],
  })
  .refine(
    (point) => point.low === undefined || point.high === undefined || point.low <= point.high,
    { message: "low must be less than or equal to high", path: ["low"] },
  );

export const categorySchema = z.enum([
  "infrastructure",
  "horizontal",
  "vertical",
  "consumer",
  "emerging",
]);

export const archetypeSchema = z.enum([
  "platform-giant",
  "suite-consolidator",
  "best-of-breed",
  "vertical",
  "commercial-oss",
  "plg-challenger",
  "pe-rollup",
  "marketplace",
  "ai-native",
  "si-channel",
]);

export const maturitySchema = z.enum([
  "nascent",
  "emerging",
  "scaling",
  "consolidating",
  "mature",
  "declining",
]);

export const moatKeySchema = z.enum([
  "network",
  "switching",
  "scale",
  "data",
  "brand",
  "ecosystem",
  "regulatory",
]);

export const moatScoreSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const eraSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  startYear: z.number().int(),
  endYear: z.number().int().nullable(),
  enablingTech: z.array(z.string().min(1)).min(1),
  businessModel: z.string().min(1),
  summary: z.string().min(1),
  definingCompanyIds: z.array(z.string().min(1)),
  survivors: z.array(z.string().min(1)),
  casualties: z.array(z.string().min(1)),
});

export const marketSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().min(1).nullable(),
  category: categorySchema,
  originYear: z.number().int(),
  definition: z.string().min(1),
  sizeByYear: z.array(dataPointSchema),
  sizeBand: z.enum(["XS", "S", "M", "L", "XL"]).optional(),
  growthRate: dataPointSchema.optional(),
  hhi: dataPointSchema.optional(),
  pricingModel: z.string().min(1),
  buyerPersona: z.string().min(1),
  maturity: maturitySchema,
  sharesByYear: z.array(
    z.object({
      year: z.number().int(),
      shares: z
        .array(z.object({ companyId: z.string().min(1), share: dataPointSchema }))
        .min(1),
    }),
  ),
  description: z.string().min(1),
});

export const companySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  founded: z.number().int(),
  archetype: archetypeSchema,
  secondaryArchetypes: z.array(archetypeSchema),
  hq: z.string().min(1),
  status: z.enum(["public", "private", "acquired", "defunct"]),
  acquiredById: z.string().min(1).optional(),
  acquiredYear: z.number().int().optional(),
  revenueByYear: z.array(dataPointSchema),
  marketCapByYear: z.array(dataPointSchema).optional(),
  grossMarginByYear: z.array(dataPointSchema).optional(),
  marketIds: z.array(z.string().min(1)),
  moats: z.record(moatKeySchema, moatScoreSchema),
  moatRationale: z.string().min(1),
});

export const eventTypeSchema = z.enum([
  "acquisition",
  "bundling",
  "unbundling",
  "disruption",
  "regulation",
  "license-change",
  "platform-shift",
  "pricing-shift",
  "launch",
  "spin-off",
]);

export const competitiveEventSchema = z
  .object({
    id: z.string().min(1),
    year: z.number().int(),
    month: z.number().int().min(1).max(12).optional(),
    type: eventTypeSchema,
    title: z.string().min(1),
    companyIds: z.array(z.string().min(1)),
    marketIds: z.array(z.string().min(1)),
    acquirerId: z.string().min(1).optional(),
    targetId: z.string().min(1).optional(),
    dealValue: dataPointSchema.optional(),
    status: z.enum(["announced", "completed", "abandoned"]).optional(),
    impact: z.string().min(1),
    sourceIds: z.array(z.string().min(1)).min(1),
  })
  .refine(
    (event) =>
      event.type !== "acquisition" ||
      (typeof event.acquirerId === "string" && typeof event.targetId === "string"),
    { message: "An acquisition must name both acquirerId and targetId", path: ["acquirerId"] },
  );

export const emergingMarketSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: categorySchema,
  thesis: z.string().min(1),
  signals: z
    .array(
      z.object({
        type: z.enum([
          "platform-shift",
          "cost-curve",
          "new-interface",
          "regulation",
          "unbundling",
          "leading-indicator",
        ]),
        evidence: z.string().min(1),
        strength: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        sourceIds: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
  keyPlayerIds: z.array(z.string().min(1)),
  risks: z.array(z.string().min(1)).min(1),
  stage: z.enum(["nascent", "emerging", "scaling", "consolidating"]),
  horizon: z.enum(["0-2y", "2-5y", "5y+"]),
});

export const bundlingFlowSchema = z.object({
  id: z.string().min(1),
  year: z.number().int(),
  fromMarketId: z.string().min(1),
  toId: z.string().min(1),
  toKind: z.enum(["company-suite", "market"]),
  direction: z.enum(["bundle", "unbundle"]),
  weight: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  eventId: z.string().min(1),
});

export const storyChapterSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(1),
  title: z.string().min(1),
  kicker: z.string().min(1),
  body: z.array(z.string().min(1)).min(1),
  graphic: z.enum([
    "timeline",
    "treemap",
    "share",
    "bubble",
    "lineage",
    "bundling",
    "moat",
    "emerging",
    "simulator",
  ]),
  graphicState: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.array(z.string())]),
  ),
});

export const moatRubricSchema = z.record(
  moatKeySchema,
  z.record(moatScoreSchema, z.string().min(1)),
);

export const sourcesSchema = z.array(sourceSchema);
export const erasSchema = z.array(eraSchema);
export const marketsSchema = z.array(marketSchema);
export const companiesSchema = z.array(companySchema);
export const eventsSchema = z.array(competitiveEventSchema);
export const emergingSchema = z.array(emergingMarketSchema);
export const flowsSchema = z.array(bundlingFlowSchema);
export const chaptersSchema = z.array(storyChapterSchema);

type Assignable<TSchemaOutput extends TContract, TContract> = TSchemaOutput;

export type SourceOut = Assignable<z.infer<typeof sourceSchema>, Source>;
export type EraOut = Assignable<z.infer<typeof eraSchema>, Era>;
export type MarketOut = Assignable<z.infer<typeof marketSchema>, Market>;
export type EventOut = Assignable<z.infer<typeof competitiveEventSchema>, CompetitiveEvent>;
export type EmergingOut = Assignable<z.infer<typeof emergingMarketSchema>, EmergingMarket>;
export type FlowOut = Assignable<z.infer<typeof bundlingFlowSchema>, BundlingFlow>;
export type ChapterOut = Assignable<z.infer<typeof storyChapterSchema>, StoryChapter>;
export type CompanyIn = Assignable<Company, z.input<typeof companySchema>>;
export type RubricIn = Assignable<MoatRubric, z.input<typeof moatRubricSchema>>;

export const vendorSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });

export const industrySizePointSchema = z.object({
  scope: z.enum(["world", "us"]),
  definition: z.string().min(1),
  point: dataPointSchema,
});

export const generatedSeriesSchema = z.object({
  sources: z.array(sourceSchema),
  vendors: z.array(vendorSchema),
  marketSizes: z.array(z.object({ marketId: z.string().min(1), point: dataPointSchema })),
  marketShares: z.array(
    z.object({
      marketId: z.string().min(1),
      year: z.number().int(),
      companyId: z.string().min(1),
      point: dataPointSchema,
    }),
  ),
  industrySize: z.array(industrySizePointSchema),
});

export type VendorOut = Assignable<z.infer<typeof vendorSchema>, Vendor>;
export type IndustrySizeOut = Assignable<z.infer<typeof industrySizePointSchema>, IndustrySizePoint>;
export type GeneratedSeriesOut = Assignable<z.infer<typeof generatedSeriesSchema>, GeneratedSeries>;
