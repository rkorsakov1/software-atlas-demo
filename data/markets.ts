import type { DataPoint, Market, SizeBand } from "@/data/types";

/**
 * The taxonomy. Level 1 markets have `parentId: null`; segments point at their
 * parent.
 *
 * Sizing honesty: only cloud infrastructure has a verified, published size
 * series (Synergy Research). Every other market carries an order-of-magnitude
 * **band** expressed as a single `modeled` point whose `low`/`high` span the
 * whole band. The midpoint exists so a treemap can allocate area, not because
 * anyone measured it. Share data is likewise published only for cloud
 * infrastructure, so `sharesByYear` is intentionally empty everywhere else.
 */

const BAND_RANGE: Record<SizeBand, { low: number; value: number; high: number }> = {
  XS: { low: 1, value: 2.5, high: 5 },
  S: { low: 5, value: 12, high: 20 },
  M: { low: 20, value: 40, high: 60 },
  L: { low: 60, value: 100, high: 150 },
  XL: { low: 150, value: 250, high: 400 },
};

const BAND_LABEL: Record<SizeBand, string> = {
  XS: "XS (under $5B)",
  S: "S ($5-20B)",
  M: "M ($20-60B)",
  L: "L ($60-150B)",
  XL: "XL (above $150B)",
};

/**
 * One modeled size point representing a whole band. The note carries the method
 * so the number can never be mistaken for a measurement.
 */
const bandSize = (band: SizeBand, year: number, sourceId: string, basis: string): DataPoint => {
  const range = BAND_RANGE[band];
  return {
    value: range.value,
    low: range.low,
    high: range.high,
    year,
    unit: "USD_B",
    sourceId,
    confidence: "modeled",
    note:
      `Modeled order-of-magnitude band ${BAND_LABEL[band]}: start from the combined revenue of the ` +
      `leading vendors in the category, divide by an assumed combined share, and round out to a band, ` +
      `sanity-checked against the cited worldwide spending total. ${basis} ` +
      `The midpoint is a layout device; only the low-high span is a claim.`,
  };
};

/**
 * Synergy publishes share by calendar quarter, not by year. Each Atlas year
 * carries exactly one quarter - never an average, never an interpolation - and
 * the note says which, so a reader can see that 2026 is a Q2 reading while 2022,
 * 2024 and 2025 are Q4 readings.
 */
const SHARE_QUARTER_NOTE = (quarter: string): string =>
  `Worldwide share of cloud infrastructure services revenue in ${quarter}, as published by Synergy Research Group; the Atlas year is the calendar year of that quarter.`;

const HHI_CLOUD_NOTE =
  "Modeled: sum of squared published Synergy percentage shares for Q2 2026 (AWS 28, Microsoft 20, Google 15 = 1,409) plus a 50-150 point allowance for an unreported tail in which no vendor exceeds 3%. A lower bound, not a measurement.";

export const markets: Market[] = [
  // ---------------------------------------------------------------- infrastructure
  {
    id: "cloud-infrastructure",
    name: "Cloud infrastructure services",
    parentId: null,
    category: "infrastructure",
    originYear: 2006,
    definition:
      "Synergy Research's definition: public infrastructure-as-a-service, platform-as-a-service and hosted private cloud, counted as provider revenue. Gartner's narrower IaaS-only line put the same year at $222B (2025) and $287B (2026F), which is why every size in the Atlas travels with its definition.",
    sizeByYear: [
      {
        value: 14.8,
        low: 13,
        high: 17,
        year: 2014,
        unit: "USD_B",
        sourceId: "S08",
        confidence: "modeled",
        note: "Modeled: Synergy reported roughly $3.7B of cloud infrastructure revenue in Q2 2014; annualised as 4 x the quarter, with a band for seasonality and definition drift.",
      },
      { value: 129, year: 2020, unit: "USD_B", sourceId: "S07", confidence: "estimated" },
      { value: 178, year: 2021, unit: "USD_B", sourceId: "S07", confidence: "estimated" },
      {
        value: 500,
        low: 460,
        high: 540,
        year: 2026,
        unit: "USD_B",
        sourceId: "S03",
        confidence: "estimated",
        note: "Synergy reported $143B for Q2 2026 alone; the trailing-twelve-month figure of roughly $500B is the band implied by that quarter and the reported 43% growth rate.",
      },
    ],
    sizeBand: "XL",
    growthRate: {
      value: 43,
      year: 2026,
      unit: "percent",
      sourceId: "S03",
      confidence: "estimated",
      note: "Year-on-year growth of the Q2 2026 quarter, the fastest in eight years, as published by Synergy.",
    },
    hhi: {
      value: 1509,
      low: 1460,
      high: 1560,
      year: 2026,
      unit: "count",
      sourceId: "S03",
      confidence: "modeled",
      note: HHI_CLOUD_NOTE,
    },
    pricingModel:
      "Metered usage per resource-hour, request or gigabyte, discounted against multi-year committed spend; AI capacity increasingly sold as long-dated reserved contracts.",
    buyerPersona: "CIO and platform engineering leadership, with finance approving committed spend",
    maturity: "scaling",
    sharesByYear: [
      {
        year: 2017,
        shares: [
          { companyId: "amazon", share: { value: 34, year: 2017, unit: "percent", sourceId: "S04", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2017") } },
          { companyId: "microsoft", share: { value: 11, year: 2017, unit: "percent", sourceId: "S04", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2017") } },
          { companyId: "ibm", share: { value: 8, year: 2017, unit: "percent", sourceId: "S04", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2017") } },
          { companyId: "google", share: { value: 5, year: 2017, unit: "percent", sourceId: "S04", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2017") } },
        ],
      },
      {
        year: 2019,
        shares: [
          { companyId: "amazon", share: { value: 33, year: 2019, unit: "percent", sourceId: "S05", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2019") } },
          { companyId: "microsoft", share: { value: 16, year: 2019, unit: "percent", sourceId: "S05", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2019") } },
          { companyId: "google", share: { value: 8, year: 2019, unit: "percent", sourceId: "S05", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2019") } },
          { companyId: "ibm", share: { value: 6, year: 2019, unit: "percent", sourceId: "S05", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2019") } },
          { companyId: "alibaba", share: { value: 5, year: 2019, unit: "percent", sourceId: "S05", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2019") } },
        ],
      },
      {
        year: 2021,
        shares: [
          { companyId: "amazon", share: { value: 33, year: 2021, unit: "percent", sourceId: "S06", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2021") } },
          { companyId: "microsoft", share: { value: 20, year: 2021, unit: "percent", sourceId: "S06", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2021") } },
          { companyId: "google", share: { value: 10, year: 2021, unit: "percent", sourceId: "S06", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2021") } },
          { companyId: "alibaba", share: { value: 6, year: 2021, unit: "percent", sourceId: "S06", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2021") } },
        ],
      },
      {
        year: 2022,
        shares: [
          {
            companyId: "amazon",
            share: {
              value: 33,
              low: 32,
              high: 34,
              year: 2022,
              unit: "percent",
              sourceId: "S96",
              confidence: "estimated",
              note: "Synergy gave Amazon as a band for Q4 2022 - it 'stayed within its long-standing market share band of 32-34%' - not as a point, so the band is shipped and 33 is its midpoint.",
            },
          },
          { companyId: "microsoft", share: { value: 23, year: 2022, unit: "percent", sourceId: "S96", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q4 2022") } },
          { companyId: "google", share: { value: 11, year: 2022, unit: "percent", sourceId: "S96", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q4 2022") } },
        ],
      },
      {
        year: 2024,
        shares: [
          { companyId: "amazon", share: { value: 30, year: 2024, unit: "percent", sourceId: "S97", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q4 2024") } },
          { companyId: "microsoft", share: { value: 21, year: 2024, unit: "percent", sourceId: "S97", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q4 2024") } },
          { companyId: "google", share: { value: 12, year: 2024, unit: "percent", sourceId: "S97", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q4 2024") } },
        ],
      },
      {
        year: 2025,
        shares: [
          { companyId: "amazon", share: { value: 28, year: 2025, unit: "percent", sourceId: "S98", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q4 2025") } },
          { companyId: "microsoft", share: { value: 21, year: 2025, unit: "percent", sourceId: "S98", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q4 2025") } },
          { companyId: "google", share: { value: 14, year: 2025, unit: "percent", sourceId: "S98", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q4 2025") } },
        ],
      },
      {
        year: 2026,
        shares: [
          { companyId: "amazon", share: { value: 28, year: 2026, unit: "percent", sourceId: "S03", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2026") } },
          { companyId: "microsoft", share: { value: 20, year: 2026, unit: "percent", sourceId: "S03", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2026") } },
          { companyId: "google", share: { value: 15, year: 2026, unit: "percent", sourceId: "S03", confidence: "estimated", note: SHARE_QUARTER_NOTE("Q2 2026") } },
        ],
      },
    ],
    description:
      "The Atlas's flagship share series, and the only market where a public time series of vendor share exists. Seven Synergy readings between 2017 and 2026 show two concentration stories at once: the leader's share fell from 34% to 28%, while the big three went 50% - 57% - 63% - 66% - 63% - 63% - 63%, peaking in Q4 2022 and flat ever since (66% is Synergy's own aggregate for that quarter; the named shares here sum to 67 because Amazon ships at the midpoint of the 32-34% band Synergy gave instead of a point). The market became more oligopolistic and less dominated at the same time. 2016, 2018, 2020 and 2023 are absent because no vendor-level share was published or verifiable for them; the series is not interpolated across the gaps.",
  },
  {
    id: "gpu-ai-cloud",
    name: "GPU and AI capacity cloud",
    parentId: "cloud-infrastructure",
    category: "infrastructure",
    originYear: 2019,
    definition:
      "Rented accelerator capacity and the managed services wrapped around it: training clusters, inference endpoints and reserved multi-year GPU contracts, sold by hyperscalers and by specialist 'neocloud' operators.",
    sizeByYear: [bandSize("L", 2026, "S03b", "Basis: the AI-specific cloud services line Synergy reports growing 165% year-on-year, plus the disclosed AI capacity revenue of Oracle and the specialist operators.")],
    sizeBand: "L",
    growthRate: {
      value: 165,
      year: 2026,
      unit: "percent",
      sourceId: "S03b",
      confidence: "estimated",
      note: "Synergy's reported year-on-year growth for AI-specific cloud services, as summarised in secondary coverage.",
    },
    pricingModel: "Per GPU-hour on demand, heavily discounted against reserved multi-year capacity commitments",
    buyerPersona: "Model-lab infrastructure leads and enterprise AI platform teams",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "The fastest-growing line inside cloud infrastructure and the first in two decades where specialists have taken meaningful share from the big three. The economics are unlike classic cloud: depreciation schedules, power contracts and a handful of counterparties dominate the risk.",
  },
  {
    id: "serverless-paas",
    name: "Application platform services (PaaS)",
    parentId: "cloud-infrastructure",
    category: "infrastructure",
    originYear: 2008,
    definition:
      "Managed runtimes, container platforms, serverless functions, queues and application services billed per execution or per resource, excluding raw virtual machines and storage.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: hyperscaler platform-service revenue disclosed inside cloud segments, plus independent platform vendors.")],
    sizeBand: "M",
    pricingModel: "Per invocation, per container-second or per provisioned unit, with free tiers for adoption",
    buyerPersona: "Platform engineering and application development leaders",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The layer that turned infrastructure into a developer product. Its commercial significance is less its own size than its pull-through: a team that builds on a platform's runtime rarely moves its data elsewhere.",
  },
  {
    id: "operating-systems",
    name: "Operating systems",
    parentId: null,
    category: "infrastructure",
    originYear: 1969,
    definition:
      "Licensed and subscription revenue for client, server and mobile operating systems, including enterprise Linux subscriptions. Free operating systems bundled with hardware are counted at zero even where their installed base is enormous.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: Windows OEM and commercial licensing, enterprise Linux subscription revenue and mobile OS licensing.")],
    sizeBand: "M",
    pricingModel: "OEM per-copy royalties, enterprise subscriptions, or free distribution funded by an adjacent business",
    buyerPersona: "Device OEMs and infrastructure IT leadership",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The original control point of the industry, and the clearest case of value migrating away from a layer that still matters technically. Open source drove the server side to near-zero price while the strategic value moved to whoever operated the machines.",
  },
  {
    id: "server-os",
    name: "Server operating systems and enterprise Linux",
    parentId: "operating-systems",
    category: "infrastructure",
    originYear: 1993,
    definition:
      "Paid subscriptions and licences for server operating systems, including certified enterprise Linux distributions sold with support and long-term maintenance.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: enterprise Linux subscription revenue plus Windows Server licensing.")],
    sizeBand: "S",
    pricingModel: "Per-socket or per-instance annual subscription including support and certification",
    buyerPersona: "Infrastructure and platform operations leadership",
    maturity: "mature",
    sharesByYear: [],
    description:
      "A market that proved software can be given away and still be worth billions, provided the vendor sells the thing enterprises actually want: someone accountable for it at 3am.",
  },
  {
    id: "mobile-os",
    name: "Mobile operating systems and app distribution",
    parentId: "operating-systems",
    category: "infrastructure",
    originYear: 2008,
    definition:
      "Mobile platform economics: store commissions on paid apps and in-app purchases, plus licensing and services tied to the mobile OS. Hardware revenue is excluded.",
    sizeByYear: [bandSize("L", 2025, "S01", "Basis: disclosed app-store billings and platform services revenue of the two dominant stores.")],
    sizeBand: "L",
    pricingModel: "Platform commission of 15-30% on store transactions, with regulated alternatives emerging in several jurisdictions",
    buyerPersona: "App developers as suppliers; consumers as end payers",
    maturity: "mature",
    sharesByYear: [],
    description:
      "A duopoly whose take rate has become a regulated variable rather than a commercial one. Every change in the commission is now negotiated with courts and regulators as much as with developers.",
  },
  {
    id: "databases",
    name: "Databases",
    parentId: null,
    category: "infrastructure",
    originYear: 1979,
    definition:
      "Operational and analytical database software and managed database services: relational engines, NoSQL stores, cloud data warehouses and lakehouses, counted as licence, support and consumption revenue.",
    sizeByYear: [bandSize("L", 2025, "S01", "Basis: Oracle, Microsoft, AWS, Google, Snowflake, Databricks and MongoDB database revenue divided by an assumed combined share of roughly two thirds.")],
    sizeBand: "L",
    pricingModel: "Perpetual licence plus support on-premises; consumption or capacity pricing in the cloud",
    buyerPersona: "CIO, data engineering and application architecture leadership",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The most durable switching-cost moat in software: data has gravity, query dialects are sticky, and the applications above the database are written against it. Oracle survived a decade of open-source competition and a late cloud entry on this alone.",
  },
  {
    id: "cloud-data-warehouse",
    name: "Cloud data warehouse and lakehouse",
    parentId: "databases",
    category: "infrastructure",
    originYear: 2012,
    definition:
      "Analytical data platforms that separate storage from compute and bill for query execution or capacity, including lakehouse platforms that combine warehouse and data-lake semantics.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: Snowflake and Databricks revenue plus hyperscaler warehouse services, divided by an assumed combined share.")],
    sizeBand: "M",
    pricingModel: "Consumption pricing per compute-second or credit, with capacity commitments",
    buyerPersona: "Chief data officer and data platform teams",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "The layer that captured the profits released when storage and compute commoditized. Its current fight is whether the governed data layer beneath AI agents belongs to the warehouse, the application suite or the model provider.",
  },
  {
    id: "nosql-databases",
    name: "Document, key-value and vector-capable NoSQL",
    parentId: "databases",
    category: "infrastructure",
    originYear: 2009,
    definition:
      "Non-relational operational databases sold as open-core licences or managed services, including document, key-value, wide-column and graph stores.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: MongoDB, Redis, Elastic and hyperscaler NoSQL service revenue.")],
    sizeBand: "S",
    pricingModel: "Open-core licence plus managed-service consumption pricing",
    buyerPersona: "Application developers and platform engineering",
    maturity: "consolidating",
    sharesByYear: [],
    description:
      "The commercial open-source heartland, and the site of the licence-change wars: every vendor here has had to choose between an open licence that hyperscalers can resell and a restrictive one that invites a foundation-backed fork.",
  },
  {
    id: "data-platforms-integration",
    name: "Data integration and platforms",
    parentId: null,
    category: "infrastructure",
    originYear: 1993,
    definition:
      "Software that moves, transforms, catalogs and governs data between systems: ETL and ELT tools, streaming platforms, metadata catalogs, master data management and reverse ETL.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: Informatica, Confluent, Fivetran-class vendors and the data-engineering portions of Databricks and Snowflake.")],
    sizeBand: "M",
    pricingModel: "Capacity or volume pricing per row, connector or throughput unit",
    buyerPersona: "Data engineering leadership and enterprise architects",
    maturity: "consolidating",
    sharesByYear: [],
    description:
      "A fragmented category that consolidated quickly once agents made governed data valuable: Salesforce's purchase of Informatica was explicitly a bet that the data layer, not the application, is what an agent buys.",
  },
  {
    id: "data-streaming",
    name: "Event streaming",
    parentId: "data-platforms-integration",
    category: "infrastructure",
    originYear: 2014,
    definition:
      "Distributed log and stream-processing platforms sold as managed services or enterprise distributions, billed on throughput and retention.",
    sizeByYear: [bandSize("XS", 2025, "S01", "Basis: Confluent revenue plus hyperscaler managed streaming services.")],
    sizeBand: "XS",
    pricingModel: "Throughput and storage consumption, with enterprise support subscriptions",
    buyerPersona: "Platform and data engineering teams",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "A small market with outsized architectural influence: once a company's events flow through a log, every downstream system is built against its semantics.",
  },
  {
    id: "observability",
    name: "Observability and monitoring",
    parentId: null,
    category: "infrastructure",
    originYear: 2010,
    definition:
      "Software that collects and analyses telemetry from running systems — metrics, logs, traces and profiles — priced on the volume of telemetry or the number of monitored entities.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: Datadog, Dynatrace, Splunk and Grafana-class vendor revenue divided by an assumed combined share.")],
    sizeBand: "S",
    pricingModel: "Per host, per million events or per gigabyte ingested, which makes the bill scale with the customer's own growth",
    buyerPersona: "Site reliability and platform engineering leadership",
    maturity: "consolidating",
    sharesByYear: [],
    description:
      "The clearest example of usage-based pricing working as a growth engine and a customer grievance at once. Cisco's purchase of Splunk and the arrival of LLM tracing have both pushed the category toward the platforms.",
  },
  {
    id: "security-software",
    name: "Security software",
    parentId: null,
    category: "infrastructure",
    originYear: 1989,
    definition:
      "Software and cloud services that prevent, detect and respond to attacks: endpoint, network, identity, application, data and cloud security, excluding security hardware and managed security services revenue.",
    sizeByYear: [bandSize("L", 2025, "S01", "Basis: Palo Alto Networks, CrowdStrike, Fortinet, Zscaler, Okta and Microsoft security revenue divided by an assumed combined share of roughly one third.")],
    sizeBand: "L",
    pricingModel: "Per endpoint, per identity or per protected workload, sold as annual subscription with platform bundles",
    buyerPersona: "Chief information security officer",
    maturity: "consolidating",
    sharesByYear: [],
    description:
      "Historically the most fragmented large market in software — hundreds of vendors, no share above the mid-teens — and now the most actively consolidated, as platforms buy categories faster than startups create them.",
  },
  {
    id: "endpoint-security",
    name: "Endpoint and workload protection",
    parentId: "security-software",
    category: "infrastructure",
    originYear: 1989,
    definition:
      "Agent-based protection for laptops, servers and cloud workloads, including detection and response, priced per protected device or workload.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: CrowdStrike, Microsoft Defender and comparable endpoint suites.")],
    sizeBand: "S",
    pricingModel: "Per endpoint per year, with module-based upsell inside one agent",
    buyerPersona: "Security operations leadership",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The category that proved a single agent on every machine is a distribution channel: once installed, each additional module is sold at near-zero acquisition cost.",
  },
  {
    id: "identity-access-management",
    name: "Identity and access management",
    parentId: "security-software",
    category: "infrastructure",
    originYear: 2000,
    definition:
      "Directory, single sign-on, multi-factor authentication, privileged access and, increasingly, machine and agent identity, priced per identity per month.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: Okta, Microsoft Entra and privileged-access vendors.")],
    sizeBand: "S",
    pricingModel: "Per identity per month, with separate tiers for workforce, customer and non-human identities",
    buyerPersona: "CISO and IT operations",
    maturity: "mature",
    sharesByYear: [],
    description:
      "Identity is the quietest platform moat in enterprise software: whoever owns the directory decides what every other application can see, which is why it is bundled aggressively by suite vendors.",
  },
  {
    id: "cloud-security",
    name: "Cloud and application security",
    parentId: "security-software",
    category: "infrastructure",
    originYear: 2015,
    definition:
      "Posture management, workload protection, code-to-cloud scanning and runtime defence for cloud environments, priced per workload or per cloud account.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: Wiz-class cloud security platforms plus the cloud-security lines of the large platforms.")],
    sizeBand: "S",
    pricingModel: "Per protected workload or per cloud resource, annual subscription",
    buyerPersona: "Cloud security architects and CISO",
    maturity: "consolidating",
    sharesByYear: [],
    description:
      "A category that went from founding to a $32B exit inside six years. Its speed is the argument that cloud platforms now envelop security rather than partner with it.",
  },
  {
    id: "networking-cdn",
    name: "Networking, CDN and edge software",
    parentId: null,
    category: "infrastructure",
    originYear: 1998,
    definition:
      "Content delivery, DNS, edge compute, DDoS mitigation and software-defined networking services billed on traffic, requests or subscription tiers.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: Cloudflare, Akamai and Fastly revenue plus the networking software lines of infrastructure vendors.")],
    sizeBand: "S",
    pricingModel: "Bandwidth and request-based usage pricing, with free tiers used as a distribution strategy",
    buyerPersona: "Network and platform engineering leadership",
    maturity: "mature",
    sharesByYear: [],
    description:
      "A layer that repeatedly converts a commodity (bandwidth) into a platform (security, edge compute) by sitting in front of every request a company serves.",
  },
  {
    id: "developer-tools",
    name: "Developer tools",
    parentId: null,
    category: "infrastructure",
    originYear: 1983,
    definition:
      "Tools used to write, review, build, test and ship software: editors and IDEs, source control, CI/CD, package registries, issue tracking and AI coding assistants, sold per developer seat or per build minute.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: GitHub, Atlassian, GitLab, JetBrains and AI coding assistant revenue divided by an assumed combined share.")],
    sizeBand: "M",
    pricingModel: "Per developer seat per month, increasingly with usage-based AI components on top",
    buyerPersona: "Engineering leaders, with bottom-up adoption by developers themselves",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "The market where product-led growth was invented and where AI arrived first, because the output of a coding agent is cheap to verify: the tests either pass or they do not.",
  },
  {
    id: "source-control-cicd",
    name: "Source control and CI/CD",
    parentId: "developer-tools",
    category: "infrastructure",
    originYear: 2008,
    definition:
      "Hosted repositories, code review, pipelines and artifact registries, priced per contributing developer plus compute minutes.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: GitHub and GitLab subscription revenue plus the CI lines of the platform vendors.")],
    sizeBand: "S",
    pricingModel: "Per contributor per month plus metered build minutes and storage",
    buyerPersona: "Engineering leadership and platform teams",
    maturity: "mature",
    sharesByYear: [],
    description:
      "Whoever hosts the repository sees the code, the review conversation and the deployment history, which turned out to be the best possible starting position for selling AI that writes code.",
  },
  {
    id: "ai-coding-assistants",
    name: "AI coding assistants and agents",
    parentId: "developer-tools",
    category: "infrastructure",
    originYear: 2021,
    definition:
      "Products that generate, edit, review or autonomously change code using foundation models, sold per developer seat, per agent task or on token consumption.",
    sizeByYear: [bandSize("S", 2026, "S21", "Basis: the roughly $2.6B of annualised business revenue Reuters cited for Cursor's parent, plus the disclosed scale of the incumbent assistants.")],
    sizeBand: "XS",
    pricingModel: "Per seat per month, with usage-metered agent execution increasingly replacing the flat seat",
    buyerPersona: "Individual developers first, engineering and platform leadership second",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "The first knowledge-work category bought at enterprise scale in the AI era. A $60B all-stock offer for the category leader in June 2026 priced it as a capability acquisition, not a revenue multiple.",
  },
  {
    id: "ai-model-infrastructure",
    name: "AI and model infrastructure",
    parentId: null,
    category: "infrastructure",
    originYear: 2020,
    definition:
      "Foundation model access and the tooling around it: hosted model APIs, fine-tuning, inference serving, orchestration frameworks, evaluation and vector retrieval. This is Gartner's narrow 'AI models' line, not its much wider 'AI software' line of $452B for 2026, which overlaps the whole software forecast and is therefore never used to size a market here.",
    sizeByYear: [
      { value: 32.6, low: 26, high: 33, year: 2026, unit: "USD_B", sourceId: "S89", confidence: "estimated", note: "Gartner's 'AI models' line. The January 2026 release sized 2026 near $26B; the May 2026 update raised it to about $32.6B on a widened scope, and Gartner cautions that the two bases are not directly comparable, so the band spans both." },
      { value: 15.5, low: 14.4, high: 15.5, year: 2025, unit: "USD_B", sourceId: "S89", confidence: "estimated", note: "The 2025 base for the same line, restated upward with the May 2026 scope change; the band spans the pre- and post-revision bases." },
    ],
    sizeBand: "M",
    growthRate: {
      value: 110,
      low: 100,
      high: 120,
      year: 2026,
      unit: "percent",
      sourceId: "S89",
      confidence: "estimated",
      note: "Implied by the May 2026 restatement of Gartner's AI models line, roughly $15.5B in 2025 to roughly $32.6B in 2026; the band reflects that both endpoints are reported to one decimal place at best.",
    },
    pricingModel: "Per million input and output tokens, with committed throughput contracts and batch discounts",
    buyerPersona: "CTO, AI platform leads and application developers",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "The layer with the fastest price declines and the fastest revenue growth in the dataset at the same time. Both are true because demand for frontier capability grows faster than the price of last year's capability falls.",
  },
  {
    id: "foundation-model-apis",
    name: "Foundation model APIs",
    parentId: "ai-model-infrastructure",
    category: "infrastructure",
    originYear: 2020,
    definition:
      "Paid programmatic access to frontier and open-weight models, billed per token or per request, excluding the consumer subscriptions sold on top of the same models.",
    sizeByYear: [bandSize("M", 2026, "S16", "Basis: the press-reported annualised run rates of the largest labs, discounted to exclude consumer subscription revenue.")],
    sizeBand: "S",
    pricingModel: "Per million tokens, with separate rates for input, output, caching and batch processing",
    buyerPersona: "Developers and AI engineering teams inside product organisations",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "Highly concentrated in a handful of labs despite price declines of an order of magnitude a year at fixed capability. Revenue accrues to frontier capability, not to commodity capability.",
  },
  {
    id: "vector-search-retrieval",
    name: "Vector search and retrieval",
    parentId: "ai-model-infrastructure",
    category: "infrastructure",
    originYear: 2021,
    definition:
      "Embedding storage, similarity search and retrieval-augmented generation plumbing, sold standalone or as an extension of an existing database.",
    sizeByYear: [bandSize("XS", 2025, "S01", "Basis: standalone vector database revenue, which remains small next to the general databases that absorbed the feature.")],
    sizeBand: "XS",
    pricingModel: "Consumption pricing per stored vector and per query, or included free in a general-purpose database",
    buyerPersona: "AI application engineers",
    maturity: "consolidating",
    sharesByYear: [],
    description:
      "The shortest full cycle in the dataset: a category defined, funded and absorbed as a feature of mainstream databases inside four years.",
  },
  {
    id: "virtualization-private-cloud",
    name: "Virtualization and private cloud",
    parentId: null,
    category: "infrastructure",
    originYear: 1999,
    definition:
      "Hypervisors, private-cloud stacks and hyperconverged infrastructure software licensed per socket, core or node for customer-operated data centres.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: VMware subscription revenue under Broadcom plus Nutanix and OpenShift-class platforms.")],
    sizeBand: "S",
    pricingModel: "Per-core subscription bundles after the industry's move away from perpetual per-socket licences",
    buyerPersona: "Infrastructure and IT operations leadership",
    maturity: "declining",
    sharesByYear: [],
    description:
      "A mature, highly concentrated market being harvested rather than grown: post-acquisition repricing raised revenue per customer while pushing a visible minority of customers toward alternatives.",
  },

  // ---------------------------------------------------------------- horizontal
  {
    id: "productivity-suites",
    name: "Productivity suites",
    parentId: null,
    category: "horizontal",
    originYear: 1990,
    definition:
      "Bundled documents, spreadsheets, presentations, email and calendaring sold per user per month to organisations, plus the consumer editions of the same suites.",
    sizeByYear: [bandSize("L", 2025, "S01", "Basis: Microsoft 365 commercial and consumer revenue plus Google Workspace, divided by an assumed combined share above 80%.")],
    sizeBand: "L",
    pricingModel: "Per seat per month in tiered bundles, with the tier used to carry new capabilities such as AI assistants",
    buyerPersona: "CIO buying for every employee in the organisation",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The canonical bundling market: a suite priced below the sum of its parts in 1990 ended three standalone software companies, and the same bundle has since carried chat, video, security and AI into millions of seats.",
  },
  {
    id: "collaboration-software",
    name: "Collaboration and work management",
    parentId: null,
    category: "horizontal",
    originYear: 2003,
    definition:
      "Team chat, video meetings, shared documents and knowledge bases, and work or project management, sold per seat and usually adopted bottom-up before a central contract.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: Zoom, Atlassian work-management, Asana, monday.com, Notion and the addressable portion of bundled suite revenue.")],
    sizeBand: "M",
    pricingModel: "Freemium then per seat per month, with heavy discounting when bundled into a productivity suite",
    buyerPersona: "Team leads and department heads, ratified later by IT",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The market where bundling and best-of-breed fought most visibly, and where the bundle won on distribution before competition law arrived eight years later to test whether unbundling can restore a lost position.",
  },
  {
    id: "team-chat",
    name: "Team messaging",
    parentId: "collaboration-software",
    category: "horizontal",
    originYear: 2013,
    definition:
      "Persistent channel-based messaging for organisations, including integrations and bot platforms, sold per active user or included in a suite.",
    sizeByYear: [bandSize("XS", 2025, "S01", "Basis: standalone messaging subscription revenue only; the dominant product is distributed inside a suite at no separate price.")],
    sizeBand: "XS",
    pricingModel: "Per active user per month, or zero when bundled into an existing suite licence",
    buyerPersona: "Team leads, then IT",
    maturity: "consolidating",
    sharesByYear: [],
    description:
      "A category whose standalone market is small precisely because the winning distribution strategy was to price it at zero inside something the customer already bought.",
  },
  {
    id: "video-conferencing",
    name: "Video meetings",
    parentId: "collaboration-software",
    category: "horizontal",
    originYear: 2011,
    definition:
      "Hosted real-time video meeting services sold per host or per room, including webinar and contact-centre extensions built on the same infrastructure.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: Zoom revenue plus the addressable share of bundled meeting services.")],
    sizeBand: "S",
    pricingModel: "Per host per month with capacity add-ons; free consumer tiers as the acquisition funnel",
    buyerPersona: "IT and facilities leadership, with strong end-user preference",
    maturity: "mature",
    sharesByYear: [],
    description:
      "A market that expanded ten-fold in a year and then had to prove it was a product rather than a feature. Its answer, like Slack's, was to build adjacent products before the bundle caught up.",
  },
  {
    id: "crm",
    name: "CRM",
    parentId: null,
    category: "horizontal",
    originYear: 1993,
    definition:
      "Systems of record for customer relationships: sales force automation, customer service, field service and marketing automation, priced per seat and increasingly per agent action.",
    sizeByYear: [bandSize("L", 2025, "S01", "Basis: Salesforce, Microsoft Dynamics, Oracle, SAP, HubSpot and Zoho customer-facing revenue divided by an assumed combined share.")],
    sizeBand: "L",
    pricingModel: "Per seat per month by edition, with new agent capacity sold per conversation, action or flat enterprise agreement",
    buyerPersona: "Chief revenue officer, chief marketing officer and service leadership",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The market where SaaS was proved, and now the market where the seat itself is being questioned. If an agent resolves a case without a licensed human, the unit of pricing has to change, and CRM is where that experiment is running at scale.",
  },
  {
    id: "customer-service-software",
    name: "Customer service and support software",
    parentId: "crm",
    category: "horizontal",
    originYear: 2007,
    definition:
      "Ticketing, case management, help centres and contact-centre software for support organisations, priced per agent seat or per resolved interaction.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: Salesforce Service Cloud, Zendesk, Freshworks and contact-centre software vendors.")],
    sizeBand: "M",
    pricingModel: "Per agent seat per month, with per-resolution pricing emerging for AI deflection",
    buyerPersona: "Head of customer support and service operations",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "The first place outcome pricing appeared in mainstream enterprise software, because the outcome is unusually easy to define: the customer's problem was solved without a human.",
  },
  {
    id: "marketing-automation",
    name: "Marketing automation",
    parentId: "crm",
    category: "horizontal",
    originYear: 1999,
    definition:
      "Campaign management, email and lifecycle messaging, lead scoring and customer journey orchestration, priced on contact volume or messages sent.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: the marketing clouds of Adobe, Salesforce and Oracle plus HubSpot and Braze-class vendors.")],
    sizeBand: "S",
    pricingModel: "Tiered by contact database size and message volume rather than by seat",
    buyerPersona: "Chief marketing officer and marketing operations",
    maturity: "mature",
    sharesByYear: [],
    description:
      "One of the earliest categories to price on volume rather than seats, which is why it is often cited as the template for agent-era billing.",
  },
  {
    id: "erp",
    name: "ERP",
    parentId: null,
    category: "horizontal",
    originYear: 1992,
    definition:
      "Integrated systems of record for finance, procurement, manufacturing and supply chain, sold as cloud subscriptions or as licences with annual maintenance, excluding the implementation services around them.",
    sizeByYear: [bandSize("L", 2025, "S01", "Basis: SAP, Oracle Fusion and NetSuite, Microsoft Dynamics, Infor and Workday financials revenue divided by an assumed combined share.")],
    sizeBand: "L",
    pricingModel: "Cloud subscription per user or per transaction volume; legacy estate still on licence plus 15-22% maintenance",
    buyerPersona: "CFO and CIO jointly, with board sign-off on replacement",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The highest switching costs in the industry. A replacement is a multi-year programme with a real chance of failure, which is why ERP vendors survive platform shifts that kill faster-moving companies.",
  },
  {
    id: "supply-chain-management",
    name: "Supply chain and procurement software",
    parentId: "erp",
    category: "horizontal",
    originYear: 1996,
    definition:
      "Planning, sourcing, procurement, logistics and supplier network software, priced per user or as a percentage of spend under management.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: SAP Ariba-class networks, Oracle supply chain, Coupa and specialist planning vendors.")],
    sizeBand: "M",
    pricingModel: "Subscription tiered on spend under management or transaction volume across a supplier network",
    buyerPersona: "Chief procurement officer and supply chain leadership",
    maturity: "mature",
    sharesByYear: [],
    description:
      "A rare enterprise category with genuine cross-company network effects: a supplier network becomes more valuable to a buyer as more of its suppliers are already on it.",
  },
  {
    id: "hcm-payroll",
    name: "HCM and payroll",
    parentId: null,
    category: "horizontal",
    originYear: 1989,
    definition:
      "Core human resources records, payroll processing, benefits, time and talent management, priced per employee per month and frequently sold with regulated payroll services.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: Workday, SAP SuccessFactors, Oracle HCM, ADP, UKG and the newer employer-of-record vendors.")],
    sizeBand: "M",
    pricingModel: "Per employee per month, with payroll and benefits revenue often float- and transaction-based",
    buyerPersona: "Chief human resources officer with CFO co-sign",
    maturity: "mature",
    sharesByYear: [],
    description:
      "Payroll is the software equivalent of a utility: regulated, unglamorous, almost never switched, and consequently one of the most profitable installed bases in the industry.",
  },
  {
    id: "finance-spend-management",
    name: "Finance and spend management",
    parentId: null,
    category: "horizontal",
    originYear: 1983,
    definition:
      "Accounting, accounts payable, expense, corporate cards, planning and tax compliance software for finance teams, often earning transaction revenue alongside subscriptions.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: Intuit business segments, Bill, Coupa, Anaplan, Avalara and the card-linked spend platforms.")],
    sizeBand: "M",
    pricingModel: "Subscription plus interchange or transaction fees, which makes revenue grow with the customer's own payment volume",
    buyerPersona: "CFO and controller",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "The category where software and payments merged: several of its fastest-growing companies earn more from moving money than from licensing the software that initiates the movement.",
  },
  {
    id: "itsm",
    name: "IT service management",
    parentId: null,
    category: "horizontal",
    originYear: 2004,
    definition:
      "Workflow software for IT operations — incidents, requests, changes, assets and configuration — extended into enterprise-wide service workflows, priced per fulfiller seat.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: ServiceNow's ITSM-attributable revenue plus Atlassian service management, BMC and Freshworks.")],
    sizeBand: "S",
    pricingModel: "Per agent or fulfiller seat per year, with platform pricing for custom workflow applications",
    buyerPersona: "CIO and IT operations leadership",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The best illustration of a workflow engine escaping its category: having digitised the IT help desk, the same platform was sold to HR, legal and facilities as a general workflow layer.",
  },
  {
    id: "analytics-bi",
    name: "Analytics and business intelligence",
    parentId: null,
    category: "horizontal",
    originYear: 1991,
    definition:
      "Self-service dashboards, semantic models, embedded analytics and reporting tools, priced per viewer or creator seat, excluding the underlying data warehouse.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: Power BI, Tableau, Looker, Qlik and embedded analytics vendors divided by an assumed combined share.")],
    sizeBand: "M",
    pricingModel: "Per creator and per viewer seat, often bundled into a productivity or cloud platform licence",
    buyerPersona: "Chief data officer, analysts and line-of-business teams",
    maturity: "mature",
    sharesByYear: [],
    description:
      "A category twice enveloped: first by productivity suites that bundled a competent dashboard tool, and now by natural-language interfaces that answer the question without building the dashboard at all.",
  },
  {
    id: "design-creative",
    name: "Design and creative software",
    parentId: null,
    category: "horizontal",
    originYear: 1987,
    definition:
      "Tools for image, video, document, 3D and interface creation sold to professionals and, increasingly, to non-designers, priced as individual and team subscriptions.",
    sizeByYear: [bandSize("M", 2025, "S14", "Basis: Adobe's reported fiscal 2025 revenue of $23.77B plus Figma, Canva and Autodesk's creative lines, divided by an assumed combined share.")],
    sizeBand: "M",
    pricingModel: "Individual and team subscriptions with per-seat enterprise agreements; generative credits metered on top",
    buyerPersona: "Designers and marketers, with procurement for enterprise agreements",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The market that self-disrupted on purpose: dropping perpetual licences in 2013 cost a year of reported revenue and bought a decade of predictable subscription growth and a 96% subscription mix.",
  },
  {
    id: "interface-design-tools",
    name: "Interface and product design tools",
    parentId: "design-creative",
    category: "horizontal",
    originYear: 2016,
    definition:
      "Collaborative vector design, prototyping and design-system tools for software product teams, priced per editor with free viewer access.",
    sizeByYear: [bandSize("XS", 2025, "S01", "Basis: the subscription revenue of collaborative design vendors serving software teams.")],
    sizeBand: "XS",
    pricingModel: "Per editor seat per month, with viewers and commenters free to maximise the collaboration network",
    buyerPersona: "Design and product leadership",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "A small market with a large strategic history: a $20B acquisition attempt was abandoned on competition grounds and settled with a $1B termination fee, one of the few cases where regulators stopped a software roll-up outright.",
  },
  {
    id: "marketing-ad-tech",
    name: "Marketing and advertising technology",
    parentId: null,
    category: "horizontal",
    originYear: 1998,
    definition:
      "Software used to plan, buy, measure and personalise advertising and customer engagement, counted as platform revenue and take rate rather than gross advertising spend.",
    sizeByYear: [bandSize("L", 2025, "S01", "Basis: demand-side platform take rates, marketing clouds and customer-engagement vendors; gross media spend is deliberately excluded.")],
    sizeBand: "L",
    pricingModel: "Percentage of managed advertising spend, plus subscription for the marketing cloud components",
    buyerPersona: "Chief marketing officer and agency partners",
    maturity: "mature",
    sharesByYear: [],
    description:
      "One of the few large software markets with no dominant vendor, because the money and the data sit with the walled-garden platforms while the software sits with everyone else.",
  },
  {
    id: "demand-side-platforms",
    name: "Demand-side advertising platforms",
    parentId: "marketing-ad-tech",
    category: "horizontal",
    originYear: 2009,
    definition:
      "Programmatic buying platforms that bid for inventory on behalf of advertisers, earning a percentage of the spend routed through them.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: independent demand-side platform revenue, which is take rate rather than gross spend.")],
    sizeBand: "S",
    pricingModel: "Take rate of roughly a fifth of managed media spend",
    buyerPersona: "Advertisers and media buying agencies",
    maturity: "mature",
    sharesByYear: [],
    description:
      "A marketplace business dressed as software: its growth tracks the shift of television and retail media budgets into auctions rather than any feature race.",
  },

  // ---------------------------------------------------------------- vertical
  {
    id: "healthcare-it",
    name: "Healthcare IT",
    parentId: null,
    category: "vertical",
    originYear: 1979,
    definition:
      "Clinical and administrative software for providers and life sciences: electronic health records, revenue cycle, imaging, clinical trials and life-sciences CRM, excluding medical devices.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: Epic, Oracle Health, Veeva, athenahealth-class vendors and revenue-cycle specialists.")],
    sizeBand: "M",
    pricingModel: "Multi-year licences and subscriptions scaled by beds, providers or claims volume, with large implementation components",
    buyerPersona: "Health-system CIO and chief medical information officer",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The highest-regulation, highest-switching-cost vertical in software. Certification requirements written into reimbursement rules turned a product advantage into a regulatory moat that has outlasted three platform shifts.",
  },
  {
    id: "ehr",
    name: "Electronic health records",
    parentId: "healthcare-it",
    category: "vertical",
    originYear: 1979,
    definition:
      "The clinical system of record for a hospital or physician group: charting, orders, results and the patient portal, sold on multi-year contracts sized by beds and providers.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: the EHR-attributable revenue of the two dominant US vendors plus regional and ambulatory specialists.")],
    sizeBand: "S",
    pricingModel: "Multi-year enterprise agreements plus hosting and very large one-time implementation fees",
    buyerPersona: "Health-system CIO, with clinical governance approval",
    maturity: "mature",
    sharesByYear: [],
    description:
      "Concentrated in US acute care to a degree that would draw scrutiny in any other market, and effectively unswitchable: replacing the EHR means retraining every clinician in the system.",
  },
  {
    id: "life-sciences-software",
    name: "Life sciences software",
    parentId: "healthcare-it",
    category: "vertical",
    originYear: 2007,
    definition:
      "Industry-specific CRM, clinical data management, regulatory submission and quality software for pharmaceutical and biotech companies, priced per user with validated deployments.",
    sizeByYear: [bandSize("XS", 2025, "S01", "Basis: Veeva and comparable validated-environment vendors serving pharmaceutical customers.")],
    sizeBand: "XS",
    pricingModel: "Per seat subscription with premium pricing for validated, audit-ready environments",
    buyerPersona: "Commercial and clinical operations leadership in pharma",
    maturity: "mature",
    sharesByYear: [],
    description:
      "Proof that a vertical specialist can beat a horizontal giant on its own platform and then leave it: the category leader built on another vendor's cloud, won the industry, and migrated to its own stack.",
  },
  {
    id: "financial-services-software",
    name: "Financial services software",
    parentId: null,
    category: "vertical",
    originYear: 1971,
    definition:
      "Core banking, payments processing, lending, insurance policy and claims, and capital-markets software, counted as software and processing revenue rather than the payment volumes themselves.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: FIS, Fiserv, Temenos, Guidewire, SS&C and nCino-class vendors divided by an assumed combined share.")],
    sizeBand: "M",
    pricingModel: "Per account, per policy or per transaction processing fees, layered on long-term licences",
    buyerPersona: "Bank or insurer CIO and COO",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The vertical where regulation most directly sets the competitive structure: audit, capital and resilience requirements make the incumbent set stable and make every migration a supervised event.",
  },
  {
    id: "core-banking",
    name: "Core banking platforms",
    parentId: "financial-services-software",
    category: "vertical",
    originYear: 1971,
    definition:
      "The ledger of record for deposits, loans and payments at a bank, licensed or delivered as a processing service priced per account.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: core processing revenue at the large US processors plus international core banking vendors.")],
    sizeBand: "S",
    pricingModel: "Per account per month processing fees on very long contracts",
    buyerPersona: "Bank COO and head of technology",
    maturity: "mature",
    sharesByYear: [],
    description:
      "Software so hard to replace that decades-old COBOL ledgers are still running under modern front ends, and the modernisation market exists mainly to avoid touching them.",
  },
  {
    id: "construction-aec",
    name: "Construction and AEC software",
    parentId: null,
    category: "vertical",
    originYear: 1982,
    definition:
      "Design, modelling, project management, field execution and asset software for architecture, engineering and construction, priced per seat or as a percentage of construction volume.",
    sizeByYear: [bandSize("S", 2025, "S01", "Basis: Autodesk AEC revenue plus Procore, Trimble and Bentley.")],
    sizeBand: "S",
    pricingModel: "Per seat subscription, or pricing tied to annual construction volume rather than users",
    buyerPersona: "General contractor and project owner leadership",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "An industry that digitised late and is now doing so quickly. Pricing on construction volume rather than seats is an early example of value-based pricing in a vertical market.",
  },
  {
    id: "legal-software",
    name: "Legal software and information",
    parentId: null,
    category: "vertical",
    originYear: 1973,
    definition:
      "Legal research and information services, practice and matter management, contract lifecycle management and AI legal assistants, sold to firms and corporate legal departments.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: the legal segments of the large information services companies plus practice-management and AI-native vendors.")],
    sizeBand: "M",
    pricingModel: "Per lawyer subscriptions for research and practice tools, with usage components for AI drafting and review",
    buyerPersona: "General counsel and law-firm partners",
    maturity: "consolidating",
    sharesByYear: [],
    description:
      "The market where the AI-disruption thesis was first priced by investors: a single set of legal plug-ins from a model lab in early 2026 moved the shares of the incumbent information providers by double digits in a day.",
  },
  {
    id: "restaurant-hospitality-software",
    name: "Restaurant and hospitality software",
    parentId: null,
    category: "vertical",
    originYear: 2012,
    definition:
      "Point of sale, ordering, kitchen, payroll and payments software for restaurants and hotels, where the payments take rate usually exceeds the software subscription.",
    sizeByYear: [bandSize("XS", 2025, "S01", "Basis: restaurant platform software and payments revenue at the leading vertical vendors.")],
    sizeBand: "XS",
    pricingModel: "Modest software subscription per location plus a payments take rate on every transaction",
    buyerPersona: "Restaurant owner-operator and multi-site operations",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "The clearest case of vertical software as a payments distribution channel: the software wins the merchant, and the merchant's card volume pays for it several times over.",
  },
  {
    id: "auto-dealer-software",
    name: "Automotive dealer software",
    parentId: null,
    category: "vertical",
    originYear: 1985,
    definition:
      "Dealer management systems covering inventory, sales, financing, service and parts for vehicle dealerships, sold on multi-year contracts per rooftop.",
    sizeByYear: [bandSize("XS", 2025, "S01", "Basis: dealer management system revenue at the two dominant vendors plus the marketing and inventory platforms around them.")],
    sizeBand: "XS",
    pricingModel: "Multi-year per-rooftop contracts with per-module add-ons",
    buyerPersona: "Dealer principal and dealer group IT",
    maturity: "mature",
    sharesByYear: [],
    description:
      "A small, highly concentrated vertical that became a case study in systemic risk: when one provider went offline in 2024, thousands of dealerships reverted to paper for weeks.",
  },
  {
    id: "government-public-sector-software",
    name: "Government and public sector software",
    parentId: null,
    category: "vertical",
    originYear: 1966,
    definition:
      "Software for courts, permitting, tax and revenue, public safety, benefits administration and defence analytics, sold under procurement rules and security accreditations.",
    sizeByYear: [bandSize("M", 2025, "S01", "Basis: Tyler Technologies, Palantir government revenue, Oracle and SAP public-sector business and the accredited cloud regions serving them.")],
    sizeBand: "M",
    pricingModel: "Multi-year licences and subscriptions won through public tender, often with accreditation-gated bidding",
    buyerPersona: "Agency CIO and programme leadership under procurement rules",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "The market where the regulatory moat is explicit: a cloud region without the right authorisation cannot bid at all, which is also why sovereignty requirements are now reshaping where software runs.",
  },

  // ---------------------------------------------------------------- consumer
  {
    id: "social-messaging",
    name: "Social and messaging",
    parentId: null,
    category: "consumer",
    originYear: 2004,
    definition:
      "Consumer social networks and messaging apps monetised through advertising and, increasingly, in-app commerce. Counted as platform revenue; the user is not the payer.",
    sizeByYear: [bandSize("XL", 2025, "S01", "Basis: the advertising revenue of the largest social platforms, which is an order of magnitude above any enterprise software category.")],
    sizeBand: "XL",
    pricingModel: "Advertising auctions priced per impression or action, with a small and growing subscription tail",
    buyerPersona: "Advertisers pay; consumers use",
    maturity: "mature",
    sharesByYear: [],
    description:
      "The purest network-effect market in the dataset and the one where an acquisition strategy paid off most visibly: the two apps that carried the incumbent through the mobile shift were both bought, not built.",
  },
  {
    id: "games",
    name: "Games software",
    parentId: null,
    category: "consumer",
    originYear: 1980,
    definition:
      "Game software and in-game purchases across mobile, PC and console, counted as publisher and platform revenue excluding console hardware.",
    sizeByYear: [bandSize("XL", 2025, "S01", "Basis: the software and in-game purchase revenue of the largest publishers and platforms across mobile, PC and console.")],
    sizeBand: "XL",
    pricingModel: "Free-to-play with in-app purchases, premium titles, and subscription catalogues",
    buyerPersona: "Consumers, with platform stores as intermediaries",
    maturity: "mature",
    sharesByYear: [],
    description:
      "Large, fragmented and structurally different from enterprise software: hits are unpredictable, so the durable businesses are the platforms, the engines and the live-service franchises rather than the studios.",
  },
  {
    id: "media-streaming",
    name: "Media and streaming software",
    parentId: null,
    category: "consumer",
    originYear: 2007,
    definition:
      "Subscription and ad-supported video, music and podcast services, counted as service revenue including the recommendation and delivery software that defines them.",
    sizeByYear: [bandSize("XL", 2025, "S01", "Basis: the subscription and advertising revenue of the leading global video and audio services.")],
    sizeBand: "XL",
    pricingModel: "Monthly subscription tiers, increasingly with an advertising-supported tier at a lower price",
    buyerPersona: "Consumers, with advertisers funding the cheaper tiers",
    maturity: "mature",
    sharesByYear: [],
    description:
      "Software economics with content costs attached: near-zero marginal delivery cost meets enormous fixed content spend, which is why the winners are the ones with the largest subscriber bases to amortise it over.",
  },
  {
    id: "consumer-ai-assistants",
    name: "Consumer AI assistants",
    parentId: null,
    category: "consumer",
    originYear: 2022,
    definition:
      "General-purpose assistant subscriptions sold directly to individuals and prosumers, typically $20-$200 per month, excluding the API revenue earned from developers.",
    sizeByYear: [bandSize("M", 2026, "S16", "Basis: the consumer share of the press-reported annualised run rates of the leading assistants; the labs do not disclose a consumer-only split, so the band is wide.")],
    sizeBand: "M",
    pricingModel: "Freemium with monthly subscription tiers, and usage limits rather than seats as the upgrade trigger",
    buyerPersona: "Individual consumers and prosumers, expensed later by employers",
    maturity: "scaling",
    sharesByYear: [],
    description:
      "The fastest consumer software adoption ever recorded, and a genuine strategic threat to productivity suites: for many tasks the assistant is now the first application opened rather than the document.",
  },
];
