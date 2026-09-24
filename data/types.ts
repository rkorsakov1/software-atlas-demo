export type Confidence = "reported" | "estimated" | "modeled";
export type Unit = "USD_B" | "USD_M" | "percent" | "count";

export type SourceKind =
  | "filing"
  | "company"
  | "analyst"
  | "press"
  | "academic"
  | "book"
  | "legal";

export type Reliability = "primary" | "secondary" | "low";

export type Source = {
  id: string;
  title: string;
  publisher: string;
  date: string;
  kind: SourceKind;
  url?: string;
  verified: boolean;
  reliability: Reliability;
};

export type DataPoint = {
  value: number;
  low?: number;
  high?: number;
  year: number;
  unit: Unit;
  sourceId: string;
  confidence: Confidence;
  note?: string;
  /** What the publisher counts. Points with different definitions are never compared. */
  definition?: string;
};

export type Category =
  | "infrastructure"
  | "horizontal"
  | "vertical"
  | "consumer"
  | "emerging";

export type Archetype =
  | "platform-giant"
  | "suite-consolidator"
  | "best-of-breed"
  | "vertical"
  | "commercial-oss"
  | "plg-challenger"
  | "pe-rollup"
  | "marketplace"
  | "ai-native"
  | "si-channel";

export type Era = {
  id: string;
  name: string;
  startYear: number;
  endYear: number | null;
  enablingTech: string[];
  businessModel: string;
  summary: string;
  definingCompanyIds: string[];
  survivors: string[];
  casualties: string[];
};

export type SizeBand = "XS" | "S" | "M" | "L" | "XL";

export type Maturity =
  | "nascent"
  | "emerging"
  | "scaling"
  | "consolidating"
  | "mature"
  | "declining";

export type MarketShareYear = {
  year: number;
  shares: { companyId: string; share: DataPoint }[];
};

export type Market = {
  id: string;
  name: string;
  parentId: string | null;
  category: Category;
  originYear: number;
  definition: string;
  sizeByYear: DataPoint[];
  sizeBand?: SizeBand;
  growthRate?: DataPoint;
  hhi?: DataPoint;
  pricingModel: string;
  buyerPersona: string;
  maturity: Maturity;
  sharesByYear: MarketShareYear[];
  description: string;
};

export type MoatKey =
  | "network"
  | "switching"
  | "scale"
  | "data"
  | "brand"
  | "ecosystem"
  | "regulatory";

export type MoatScore = 0 | 1 | 2 | 3 | 4 | 5;

export type CompanyStatus = "public" | "private" | "acquired" | "defunct";

export type Company = {
  id: string;
  name: string;
  founded: number;
  archetype: Archetype;
  secondaryArchetypes: Archetype[];
  hq: string;
  status: CompanyStatus;
  acquiredById?: string;
  acquiredYear?: number;
  revenueByYear: DataPoint[];
  marketCapByYear?: DataPoint[];
  grossMarginByYear?: DataPoint[];
  marketIds: string[];
  moats: Record<MoatKey, MoatScore>;
  moatRationale: string;
};

export type EventType =
  | "acquisition"
  | "bundling"
  | "unbundling"
  | "disruption"
  | "regulation"
  | "license-change"
  | "platform-shift"
  | "pricing-shift"
  | "launch"
  | "spin-off"
  /** A reading, not an action: a revenue threshold, an analyst figure, a market data point. */
  | "milestone";

export type EventStatus = "announced" | "completed" | "abandoned";

export type CompetitiveEvent = {
  id: string;
  year: number;
  month?: number;
  type: EventType;
  title: string;
  companyIds: string[];
  marketIds: string[];
  acquirerId?: string;
  targetId?: string;
  dealValue?: DataPoint;
  status?: EventStatus;
  impact: string;
  sourceIds: string[];
};

export type SignalType =
  | "platform-shift"
  | "cost-curve"
  | "new-interface"
  | "regulation"
  | "unbundling"
  | "leading-indicator";

export type SignalStrength = 1 | 2 | 3;

export type EmergingSignal = {
  type: SignalType;
  evidence: string;
  strength: SignalStrength;
  sourceIds: string[];
};

export type EmergingStage = "nascent" | "emerging" | "scaling" | "consolidating";
export type Horizon = "0-2y" | "2-5y" | "5y+";

export type EmergingMarket = {
  id: string;
  name: string;
  category: Category;
  thesis: string;
  signals: EmergingSignal[];
  keyPlayerIds: string[];
  risks: string[];
  stage: EmergingStage;
  horizon: Horizon;
};

export type FlowKind = "company-suite" | "market";
export type FlowDirection = "bundle" | "unbundle";
export type FlowWeight = 1 | 2 | 3;

export type BundlingFlow = {
  id: string;
  year: number;
  fromMarketId: string;
  toId: string;
  toKind: FlowKind;
  direction: FlowDirection;
  weight: FlowWeight;
  eventId: string;
};

export type GraphicKind =
  | "timeline"
  | "treemap"
  | "share"
  | "bubble"
  | "lineage"
  | "bundling"
  | "moat"
  | "emerging"
  | "simulator";

export type GraphicState = Record<string, string | number | string[]>;

export type StoryChapter = {
  id: string;
  order: number;
  title: string;
  kicker: string;
  body: string[];
  graphic: GraphicKind;
  graphicState: GraphicState;
};

export type MoatRubric = Record<MoatKey, Record<MoatScore, string>>;

/**
 * A vendor named in a share series that has no profile in `companies`. Lets a
 * contributor add a share row without writing a full company record.
 */
export type Vendor = { id: string; name: string };

export type SizeScope = "world" | "us";

/**
 * One reading of the size of the whole software industry. Publishers define
 * "software" differently (packaged products, vendor revenue, end-user spending),
 * so every point names its definition and scope and the UI marks each switch.
 */
export type IndustrySizePoint = {
  scope: SizeScope;
  definition: string;
  point: DataPoint;
};

/** What `scripts/build-series.ts` generates from the CSV files in `data/series/`. */
export type GeneratedSeries = {
  sources: Source[];
  vendors: Vendor[];
  marketSizes: { marketId: string; point: DataPoint }[];
  marketShares: { marketId: string; year: number; companyId: string; point: DataPoint }[];
  industrySize: IndustrySizePoint[];
};
