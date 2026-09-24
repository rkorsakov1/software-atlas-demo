import type { EmergingMarket } from "@/data/types";

/**
 * Candidate markets, scored against the six-signal framework.
 *
 * The first twelve are the AI-era candidates from the original research. The six
 * that follow (`em-einvoicing` onwards) were added after an audit showed the set
 * was reading the six signals through one lens: eleven of twelve were AI-framed,
 * `platform-shift` and `leading-indicator` accounted for most signals, and the
 * `regulation`, `cost-curve` and `unbundling` signals were barely used. Nothing
 * was removed to make room - the six are candidates an even application of the
 * same framework surfaces, and none of them is an AI story.
 *
 * Signal strength: 1 = weak or anecdotal, 2 = multiple independent sources,
 * 3 = verified financial or regulatory evidence. The radar dot size is the sum
 * of strengths, so a large dot means "well evidenced", not "large market".
 * `horizon` is this project's estimate of when the category will have at least
 * one independent vendor above $1B of revenue.
 */
export const emerging: EmergingMarket[] = [
  {
    id: "ai-coding-agents",
    name: "AI coding agents",
    category: "infrastructure",
    thesis:
      "Software creation is the first knowledge-work category bought at enterprise scale in the AI era, because the output is cheap to verify - the tests pass or they do not - and because developers adopt tools bottom-up without waiting for procurement.",
    signals: [
      {
        type: "leading-indicator",
        evidence:
          "SpaceX agreed on 16 June 2026 to acquire Cursor's parent Anysphere in an all-stock deal valuing it at $60B, structured through a wholly owned subsidiary and priced off a seven-day VWAP of SpaceX Class A stock.",
        strength: 3,
        sourceIds: ["S21"],
      },
      {
        type: "leading-indicator",
        evidence:
          "Anysphere raised $2.3B in November 2025 at a $29.3B valuation, having been 'valued at under $10 billion just months ago' — a repricing of the coding layer that preceded the SpaceX deal by seven months.",
        strength: 3,
        sourceIds: ["S95", "S21"],
      },
      {
        type: "cost-curve",
        evidence:
          "Epoch AI measures inference price declines at a fixed capability level of '9x to 900x per year' depending on the milestone, with GPT-4-level performance on GPQA Diamond falling at roughly 40x a year, which is what makes long agentic loops over a whole repository economic.",
        strength: 2,
        sourceIds: ["S24", "B10"],
      },
      {
        type: "platform-shift",
        evidence:
          "The incumbent distribution position is the code host, and it was bought a platform shift early: Microsoft announced the acquisition of GitHub for '$7.5 billion in Microsoft stock' on 4 June 2018.",
        strength: 2,
        sourceIds: ["S50"],
      },
    ],
    keyPlayerIds: [
      "anysphere",
      "github",
      "microsoft",
      "anthropic",
      "openai",
      "google",
      "replit",
      "cognition",
    ],
    risks: [
      "Model labs vertically integrate and bundle coding agents into their own subscriptions.",
      "Per-seat pricing gives way to usage pricing with materially lower gross margins.",
      "Developer-tool switching costs are low, so leadership can change in a single model generation.",
    ],
    stage: "scaling",
    horizon: "0-2y",
  },
  {
    id: "agentic-enterprise-automation",
    name: "Agentic enterprise automation",
    category: "horizontal",
    thesis:
      "Incumbent suites are the first large sellers of agents, because the scarce inputs are not model quality but permissions, data and workflow context - and the incumbents already hold all three.",
    signals: [
      {
        type: "leading-indicator",
        evidence:
          "Salesforce reported Agentforce ARR of $800M, up 169% year on year, with 'Agentforce and Data 360 ARR exceeds $2.9 billion' — agent revenue arriving through an installed base rather than beside it.",
        strength: 3,
        sourceIds: ["S12"],
      },
      {
        type: "leading-indicator",
        evidence:
          "Microsoft 365 Copilot passed 30 million paid seats in FY2026, sold as an add-on to a suite the customer already licenses.",
        strength: 3,
        sourceIds: ["S11b"],
      },
      {
        type: "platform-shift",
        evidence:
          "Gartner's January 2026 forecast puts the AI software line at $452B for 2026, against a total worldwide software forecast of $1,468B: most of the AI budget is being booked through software vendors, not around them.",
        strength: 2,
        sourceIds: ["S25", "S89", "S01"],
      },
    ],
    keyPlayerIds: [
      "salesforce",
      "microsoft",
      "servicenow",
      "workday",
      "sap",
      "uipath",
      "sierra",
      "glean",
      "decagon",
    ],
    risks: [
      "Return on investment remains unproven; Gartner places generative AI in the trough of disillusionment for 2026.",
      "Agent capacity may cannibalise seat revenue rather than add to it.",
      "Model labs ship their own agent products directly into the same workflows.",
    ],
    stage: "emerging",
    horizon: "2-5y",
  },
  {
    id: "vertical-ai",
    name: "Vertical AI (legal, clinical, financial)",
    category: "vertical",
    thesis:
      "Regulated, text-heavy verticals with high labour costs are the most valuable AI application markets, but general-purpose agents with vertical plug-ins now compete directly with vertical specialists and with the incumbent information providers.",
    signals: [
      {
        type: "unbundling",
        evidence:
          "Markets priced the threat on 3 February 2026: Thomson Reuters fell 18%, RELX 14% — 'its steepest single-day decline since 1988' — Wolters Kluwer 13% and LSEG 8%, after a model lab shipped legal plug-ins.",
        strength: 3,
        sourceIds: ["S18", "S27"],
      },
      {
        type: "new-interface",
        evidence:
          "Bloomberg-cited estimates put losses across software, financial-services and asset-management stocks at roughly $285B in the same episode, an expectation of interface substitution rather than an observed revenue shift.",
        strength: 2,
        sourceIds: ["S18b"],
      },
      {
        type: "platform-shift",
        evidence:
          "Anthropic's 'specialized legal plugins for its Claude Cowork agentic desktop application' cover contract review, NDA triage and compliance workflows: application categories built on top of the lab's own API.",
        strength: 2,
        sourceIds: ["S18", "S27"],
      },
    ],
    keyPlayerIds: [
      "harvey",
      "abridge",
      "hebbia",
      "thomson-reuters",
      "relx",
      "wolters-kluwer",
      "epic-systems",
      "anthropic",
    ],
    risks: [
      "Horizontal envelopment by general-purpose assistants with vertical plug-ins.",
      "Liability and accuracy requirements raise the cost of being wrong in regulated work.",
      "Incumbents' proprietary content and citation graphs remain a genuine moat.",
    ],
    stage: "emerging",
    horizon: "0-2y",
  },
  {
    id: "ai-inference-clouds",
    name: "AI inference clouds (neoclouds)",
    category: "infrastructure",
    thesis:
      "GPU capacity became its own infrastructure market with its own operators, partly outside the big three, because the buyers want reserved capacity and power rather than the managed-service breadth classic cloud sells.",
    signals: [
      {
        type: "platform-shift",
        evidence:
          "Synergy lists a high-growth 'tier two' of providers including CoreWeave, Oracle, Crusoe, Nebius and Nscale, and reports AI-specific cloud services growing 165% year on year.",
        strength: 3,
        sourceIds: ["S03b", "S03"],
      },
      {
        type: "leading-indicator",
        evidence:
          "Oracle reported OCI revenue of $18.1B, up 77%, with $638B of remaining performance obligations, up 363% year on year, concentrated in AI capacity contracts.",
        strength: 3,
        sourceIds: ["S13"],
      },
      {
        type: "cost-curve",
        evidence:
          "Epoch AI measures inference price declines at fixed capability of '9x to 900x per year'. Falling unit prices expand the set of workloads worth running, which on the Atlas's reading keeps aggregate capacity demand growing even as price per token falls.",
        strength: 2,
        sourceIds: ["S24"],
      },
    ],
    keyPlayerIds: [
      "coreweave",
      "oracle",
      "nebius",
      "crusoe",
      "lambda-labs",
      "nscale",
      "amazon",
      "microsoft",
    ],
    risks: [
      "Customer concentration: a handful of counterparties carry most of the backlog.",
      "GPU depreciation schedules and power availability dominate the economics.",
      "Hyperscalers can price capacity against their own margin structure.",
    ],
    stage: "scaling",
    horizon: "0-2y",
  },
  {
    id: "ai-security-agent-identity",
    name: "AI security and agent identity",
    category: "infrastructure",
    thesis:
      "Every agent is a non-human identity holding permissions, so securing prompts, tools, model supply chains and machine credentials becomes its own budget line rather than a feature of existing controls.",
    signals: [
      {
        type: "leading-indicator",
        evidence:
          "Gartner's 2026 AI spending forecast breaks AI cybersecurity out as a segment of its own at roughly $51B for 2026, which is what a line looks like once buyers stop treating it as a feature of something else.",
        strength: 3,
        sourceIds: ["S89", "S25"],
      },
      {
        type: "platform-shift",
        evidence:
          "Google closed its '$32 billion acquisition of Wiz, Inc., a leading cloud security platform' on 11 March 2026, putting cloud and AI workload security inside a hyperscaler.",
        strength: 2,
        sourceIds: ["S20"],
      },
      {
        type: "new-interface",
        evidence:
          "Enterprises are spending '17 times more' on AI-powered security tools than on securing the AI those tools run on: AI-amplified security reached $49B in 2025 while securing AI itself stood at $2.8B, 5.5% of the AI cybersecurity market. That gap is the shape of an underserved layer, not a solved one.",
        strength: 2,
        sourceIds: ["S92"],
      },
    ],
    keyPlayerIds: [
      "palo-alto-networks",
      "crowdstrike",
      "microsoft",
      "google",
      "wiz",
      "okta",
      "zscaler",
    ],
    risks: [
      "Absorbed into existing security platforms as a feature rather than a market.",
      "Category definitions are unsettled, so budgets move between existing lines.",
      "Buyers may treat agent identity as a directory problem already solved by incumbents.",
    ],
    stage: "emerging",
    horizon: "2-5y",
  },
  {
    id: "llm-evaluation-observability",
    name: "LLM evaluation and observability",
    category: "infrastructure",
    thesis:
      "Teams shipping AI need test suites, tracing and cost monitoring, but the capability is being absorbed by the observability vendors and model platforms that already hold the telemetry and the billing relationship.",
    signals: [
      {
        type: "platform-shift",
        evidence:
          "Gartner books $452B of AI software for 2026 inside a $1,468B total software forecast, and the pattern is already visible here: tracing and evaluation ship as features of existing observability and model platforms rather than as standalone purchases.",
        strength: 1,
        sourceIds: ["S25", "S89", "S01"],
      },
      {
        type: "cost-curve",
        evidence:
          "Epoch AI's measured inference price declines of '9x to 900x per year' at fixed capability make per-call cost monitoring valuable, but they also shrink the spend the category is measuring.",
        strength: 1,
        sourceIds: ["S24"],
      },
      {
        type: "new-interface",
        evidence:
          "Tool-calling now runs through a neutrally governed standard — MCP moved to the Linux Foundation's Agentic AI Foundation on 9 December 2025 — and Azure's Realtime API already takes a remote MCP server URL in session configuration. A shared call path is a shared instrumentation point, which on the Atlas's reading favours whoever already owns the trace.",
        strength: 2,
        sourceIds: ["S49", "S90"],
      },
    ],
    keyPlayerIds: [
      "datadog",
      "grafana-labs",
      "langchain",
      "weights-and-biases",
      "openai",
      "anthropic",
    ],
    risks: [
      "A feature, not a product: bundled free by model platforms and observability suites.",
      "No verified independent revenue figure exists for the category, which is itself a signal.",
      "Buyers conflate it with existing application performance monitoring budgets.",
    ],
    stage: "consolidating",
    horizon: "0-2y",
  },
  {
    id: "agent-interoperability",
    name: "Agent interoperability tooling",
    category: "infrastructure",
    thesis:
      "When agents choose tools, the connector layer becomes a distribution channel, analogous to the app store for mobile: being callable is the new being findable.",
    signals: [
      {
        type: "platform-shift",
        evidence:
          "The Model Context Protocol moved to the Linux Foundation's Agentic AI Foundation on 9 December 2025, contributed alongside Block's goose and OpenAI's AGENTS.md, with Jim Zemlin citing 'the transparency and stability that only open governance provides'.",
        strength: 3,
        sourceIds: ["S49"],
      },
      {
        type: "unbundling",
        evidence:
          "Vendors are repositioning as agent-callable tools rather than human-configured workflow: Azure's Realtime API accepts a remote MCP server URL directly in session configuration — documented with `https://mcp.stripe.com` as the example — so that 'any tools available on that server will be accessible immediately'.",
        strength: 2,
        sourceIds: ["S90", "S49"],
      },
    ],
    keyPlayerIds: [
      "anthropic",
      "openai",
      "google",
      "microsoft",
      "zapier",
      "workato",
      "mulesoft",
      "cloudflare",
    ],
    risks: [
      "Protocols are free, so value accrues somewhere else and may not be capturable at this layer. The Atlas's reading is that neutral governance stops value settling on the protocol itself and pushes it to registries, gateways and whichever tools are easiest for an agent to call — a judgement, not an observation.",
      "Security of tool-calling is unsolved and could slow enterprise adoption.",
      "Competing standards fragment the connector ecosystem.",
    ],
    stage: "emerging",
    horizon: "2-5y",
  },
  {
    id: "usage-outcome-billing",
    name: "Usage and outcome billing infrastructure",
    category: "horizontal",
    thesis:
      "Moving from seats to tokens, actions and outcomes requires metering, rating, entitlement and revenue-recognition systems that seat-era billing stacks were never built for.",
    signals: [
      {
        type: "platform-shift",
        evidence:
          "Salesforce reported Agentforce ARR of $800M growing 169%, and Intercom's Fin bills $0.99 per resolution: the fastest-growing lines in enterprise software are increasingly priced by outcome or activity rather than by seat.",
        strength: 2,
        sourceIds: ["S12", "S94"],
      },
      {
        type: "leading-indicator",
        evidence:
          "The February 2026 repricing of seat-based software made the durability of per-seat revenue an investor question rather than a product question.",
        strength: 2,
        sourceIds: ["S18"],
      },
      {
        type: "cost-curve",
        evidence:
          "When the marginal cost of a unit of work is a real and volatile number, vendors need metering to protect gross margin, which was not true in the flat-seat era.",
        strength: 2,
        sourceIds: ["S24"],
      },
    ],
    keyPlayerIds: ["stripe", "metronome", "orb", "zuora", "salesforce"],
    risks: [
      "Large vendors build metering in-house rather than buying it.",
      "Absorbed into payments and billing platforms as a feature.",
      "Outcome definitions are contested, which slows contract standardisation.",
    ],
    stage: "emerging",
    horizon: "2-5y",
  },
  {
    id: "voice-ai-agents",
    name: "Voice AI agents",
    category: "horizontal",
    thesis:
      "Real-time speech models plus falling inference prices make phone-based service automatable at a cost below offshore labour, which is the first time the economics have favoured software in a labour-dominated category.",
    signals: [
      {
        type: "cost-curve",
        evidence:
          "Epoch AI measures inference price declines at fixed capability of '9x to 900x per year' depending on the milestone, with GPT-4-level performance on GPQA Diamond falling at roughly 40x a year: the per-call cost of a spoken turn is collapsing on the same curve.",
        strength: 2,
        sourceIds: ["S24", "B10"],
      },
      {
        type: "new-interface",
        evidence:
          "Azure documents SIP as a first-class connection method for the GPT Realtime API, aimed at 'call centers, IVR systems, phone-based applications', and names customer support agents as a headline use case: speech-to-speech turns the telephone into an agent surface without asking the customer to change behaviour.",
        strength: 2,
        sourceIds: ["S90"],
      },
      {
        type: "leading-indicator",
        evidence:
          "Per-resolution pricing is already live in customer service: Intercom's Fin AI Agent charges $0.99 per resolution, defined as 'no further help is requested after Fin's last answer' — the pricing structure this category needs if it is to displace labour budgets rather than software budgets.",
        strength: 1,
        sourceIds: ["S94"],
      },
    ],
    keyPlayerIds: ["elevenlabs", "sierra", "decagon", "salesforce", "microsoft"],
    risks: [
      "Consumer acceptance of automated voice remains uncertain.",
      "Disclosure regulation for AI in calls is arriving unevenly by jurisdiction.",
      "Contact-centre incumbents hold the installed base and the telephony integrations.",
    ],
    stage: "scaling",
    horizon: "0-2y",
  },
  {
    id: "ai-data-infrastructure",
    name: "AI data infrastructure",
    category: "infrastructure",
    thesis:
      "Standalone vector databases were absorbed as a feature of general-purpose databases; the durable market is the governed data layer that decides what an agent is allowed to see and where the answer came from.",
    signals: [
      {
        type: "leading-indicator",
        evidence:
          "Salesforce reported that 'Agentforce and Data 360 ARR exceeds $2.9 billion', pricing the data layer rather than the application.",
        strength: 3,
        sourceIds: ["S12"],
      },
      {
        type: "platform-shift",
        evidence:
          "Salesforce agreed to acquire Informatica for 'approximately $8 billion in equity value' in May 2025 and completed it on 18 November 2025, buying catalog, governance, quality and master data management to feed agents.",
        strength: 3,
        sourceIds: ["S84", "S74"],
      },
      {
        type: "unbundling",
        evidence:
          "Vector search moved from standalone products into mainstream databases: Amazon Aurora PostgreSQL added pgvector in July 2023 'to store embeddings from machine learning (ML) models in your database and to perform efficient similarity searches', leaving retrieval quality and governance, not storage, as the contested layer.",
        strength: 2,
        sourceIds: ["S91"],
      },
    ],
    keyPlayerIds: [
      "databricks",
      "snowflake",
      "salesforce",
      "informatica",
      "oracle",
      "mongodb",
      "pinecone",
      "elastic",
    ],
    risks: [
      "Commoditization: retrieval quality becomes a model capability rather than a data-platform feature.",
      "Hyperscaler bundling of governed retrieval into existing data services.",
      "Buyers may treat governance as a compliance cost rather than an AI enabler.",
    ],
    stage: "consolidating",
    horizon: "0-2y",
  },
  {
    id: "sovereign-cloud-ai",
    name: "Sovereign cloud and AI",
    category: "infrastructure",
    thesis:
      "Governments and regulated industries want infrastructure under local legal control, which creates demand for in-region operators and for sovereign editions of hyperscaler clouds that are priced above global regions.",
    signals: [
      {
        type: "platform-shift",
        evidence:
          "Regional operators including Nscale appear inside Synergy's high-growth tier two of cloud providers, alongside the AI specialists.",
        strength: 2,
        sourceIds: ["S03b"],
      },
      {
        type: "regulation",
        evidence:
          "EU digital regulation, from the Digital Markets Act designations onward, has made jurisdiction and control over platform services an explicit policy objective.",
        strength: 2,
        sourceIds: ["S67", "S68"],
      },
    ],
    keyPlayerIds: ["nscale", "mistral", "microsoft", "google", "amazon", "oracle"],
    risks: [
      "Hyperscaler partnerships and sovereign editions capture most of the demand.",
      "Costs run above global regions, limiting demand to genuinely regulated workloads.",
      "Policy can reverse faster than data centres can be built.",
      "The Atlas's reading is that sovereignty requirements ride an existing public-sector accreditation mechanism rather than needing a new one, which would make adoption cheaper than it looks; this project found no citable source for that claim, so it is carried here as a judgement rather than as a signal.",
    ],
    stage: "emerging",
    horizon: "2-5y",
  },
  {
    id: "post-quantum-cryptography",
    name: "Post-quantum cryptography migration",
    category: "infrastructure",
    thesis:
      "Standardised post-quantum algorithms create a long, compliance-driven migration of every TLS stack, HSM and PKI in production - a market created by a document rather than by a technology shift.",
    signals: [
      {
        type: "regulation",
        evidence:
          "NIST finalised FIPS 203 (ML-KEM, 'the primary standard for general encryption'), FIPS 204 (ML-DSA) and FIPS 205 (SLH-DSA) on 13 August 2024, giving procurement a specification it can name in a contract.",
        strength: 3,
        sourceIds: ["S48"],
      },
      {
        type: "leading-indicator",
        evidence:
          "Gartner's 2026 information security forecast is $244.2B, up 13.3% year on year: migration work attaches to a large standing budget rather than needing a new line, even though security is growing slightly slower than the $1,468B software market around it.",
        strength: 1,
        sourceIds: ["S92", "S01"],
      },
      {
        type: "platform-shift",
        evidence:
          "The layer that terminates most public TLS upgrades wholesale: Cloudflare reported that by the last week of October 2025 post-quantum key agreement had passed half of human-initiated traffic on its network and was still rising, protecting that share against harvest-now/decrypt-later interception, after all major browsers, OpenSSL, Go and Apple's October 2025 releases enabled X25519MLKEM768 by default. Adoption is front-loaded at the edge and back-loaded in the private and embedded long tail.",
        strength: 2,
        sourceIds: ["S93", "S48"],
      },
    ],
    keyPlayerIds: ["cloudflare", "google", "microsoft", "akamai", "amazon"],
    risks: [
      "Timelines are measured in a decade, so early revenue is consulting rather than product.",
      "Mostly absorbed as a feature of existing security and infrastructure products.",
      "Demand depends on a threat that has not yet materialised.",
    ],
    stage: "nascent",
    horizon: "5y+",
  },
  {
    id: "em-einvoicing",
    name: "Mandatory e-invoicing and real-time tax reporting",
    category: "horizontal",
    thesis:
      "Invoicing was a feature of the ERP, a print-and-post afterthought at the end of order-to-cash. Statute is pulling it out and turning it into a regulated network: a structured document, a mandated schema, a clearing or reporting hop to the tax authority, and a different rulebook in every jurisdiction. That combination - compulsory, cross-border, and too fiddly for any one ERP vendor to cover alone - is how a feature becomes a market, and the buyer has no discretion and no ability to defer, which is the rarest property in enterprise software. The specialists carrying most of this work today (Pagero, Sovos, Avalara, Basware, Vertex) sit outside the Atlas roster; the players listed here are the suites the obligation lands on.",
    signals: [
      {
        type: "regulation",
        evidence:
          "The EU adopted the VAT in the Digital Age package on 11 March 2025. Digital reporting requirements affect cross-border B2B transactions from 1 July 2030, and by 1 January 2035 Member States with a domestic real-time reporting obligation must align their systems with the EU model - a decade-long statutory replacement cycle for invoicing systems.",
        strength: 3,
        sourceIds: ["S100"],
      },
      {
        type: "regulation",
        evidence:
          "The demand is already live rather than prospective: from 1 January 2025 German law mandates e-invoicing as the default method for issuing invoices in the B2B sector, with businesses above EUR 800,000 of turnover barred from paper or unstructured formats from 1 January 2027 and all businesses from 1 January 2028.",
        strength: 3,
        sourceIds: ["S101"],
      },
      {
        type: "regulation",
        evidence:
          "France puts a second large economy inside the same window: all businesses must be able to receive e-invoices starting September 2026, under Article 26 of amending finance law 2022-1157.",
        strength: 2,
        sourceIds: ["S102"],
      },
      {
        type: "leading-indicator",
        evidence:
          "Capital is moving on the network layer, not the ERP: Thomson Reuters acquired the e-invoicing network Pagero at 'a purchase price of approx. USD 800 million', citing 'over 80 countries planning or implementing e-invoicing regulations' as the rationale.",
        strength: 3,
        sourceIds: ["S103"],
      },
    ],
    keyPlayerIds: ["sap", "oracle", "microsoft", "intuit", "thomson-reuters"],
    risks: [
      "The ERP suites can bundle compliance into the platform and reduce the specialists to connectors, which is the classic envelopment path.",
      "State-operated clearing platforms can absorb the network layer outright and leave only thin integration revenue behind them.",
      "The long ViDA dates are a genuine hazard: obligations in 2030 and 2035 are far enough out to be renegotiated, and the timetable already slipped once before adoption.",
    ],
    stage: "scaling",
    horizon: "0-2y",
  },
  {
    id: "em-health-interop",
    name: "Healthcare data interoperability and health-record APIs",
    category: "vertical",
    thesis:
      "Health records have been the canonical example of data that is technically portable and commercially immobile: part of an electronic health record's value to its vendor was that the data could not leave. Two mandates attack that from opposite ends - a national exchange framework built above the incumbents, and a rule obliging the payers beneath them to expose standard APIs on a fixed date. When exchange is compulsory and the schema is specified, the moat stops being the data and becomes what you do with it, which opens room for a tier of API, ingestion and prior-authorisation vendors that could not exist while every integration was a bespoke interface engine.",
    signals: [
      {
        type: "regulation",
        evidence:
          "CMS-0057-F obliges a named set of US payers to stand up HL7 FHIR APIs: 'impacted payers are required to implement certain provisions by January 1, 2026' and have 'until primarily January 1, 2027, to meet the application programming interface (API) requirements'. A dated, non-optional build for every affected plan.",
        strength: 3,
        sourceIds: ["S104"],
      },
      {
        type: "regulation",
        evidence:
          "The obligation names both the technology and the population: Medicare Advantage organisations, state Medicaid and CHIP fee-for-service programmes, Medicaid managed care plans, CHIP managed care entities and Qualified Health Plan issuers on the federally facilitated exchanges must implement FHIR APIs. A compliance mandate that specifies the API standard is a specification for a vendor market.",
        strength: 3,
        sourceIds: ["S105"],
      },
      {
        type: "platform-shift",
        evidence:
          "TEFCA created a nationwide exchange layer above the electronic health records: the first Qualified Health Information Networks were designated in December 2023 and 'within days, health data began flowing among TEFCA QHINs'.",
        strength: 2,
        sourceIds: ["S106"],
      },
      {
        type: "platform-shift",
        evidence:
          "The layer now has eleven designated operators, and incumbents and independents sit on it as peers: Epic Nexus and Oracle Health Information Network alongside CommonWell, eClinicalWorks, eHealth Exchange, Health Gorilla, Kno2, Konza Health, Medallies, Netsmart and Surescripts.",
        strength: 2,
        sourceIds: ["S107"],
      },
    ],
    keyPlayerIds: ["epic-systems", "oracle", "cerner"],
    risks: [
      "The EHR incumbents are themselves designated network operators, so the exchange can be run by the parties it was meant to open up and independents end as thin resellers of access.",
      "US health IT rules have a long history of enforcement discretion and date slippage, and the API deadlines are still in the future.",
      "Interoperability mandates set a floor, not a business: a market only forms if someone will pay above the compliance minimum.",
    ],
    stage: "emerging",
    horizon: "2-5y",
  },
  {
    id: "em-grid-flex",
    name: "Grid flexibility and distributed-energy orchestration",
    category: "vertical",
    thesis:
      "This Atlas's own framework says a market opens when a key input falls tenfold, and battery storage has done exactly that. The consequence is not more hardware but a control problem nobody previously had: a grid built around a few hundred dispatchable plants is becoming one with millions of dispatchable assets, each with its own state of charge, owner, tariff and market. Deciding what charges, what discharges and what bids, every five minutes, across a heterogeneous fleet, is the software layer the cost curve creates. The limit belongs in the thesis rather than in a footnote: the cost curve and the deployment curve here are measured and primary-sourced, but the software market inferred from them is not sized anywhere in this Atlas. No revenue figure for any grid-software vendor could be verified in this project, and none of the credible vendors - Schneider Electric, GE Vernova, Uplight, EnergyHub, Voltus, Itron and their peers - is in the company roster, which is why no players are listed. The step from a falling input price to a software market is our inference, not an observation.",
    signals: [
      {
        type: "cost-curve",
        evidence:
          "Lithium-ion storage fell an order of magnitude in thirteen years - 'from USD 1 400 per kilowatt-hour in 2010 to less than USD 140 per kilowatt-hour in 2023' - clearing the framework's tenfold input-cost test outright, with battery storage the fastest-growing commercially available energy technology in 2023.",
        strength: 3,
        sourceIds: ["S108"],
      },
      {
        type: "cost-curve",
        evidence:
          "The curve has not flattened: pack prices 'dropped 20% from 2023 to a record low of $115 per kilowatt-hour', the largest annual fall since 2017.",
        strength: 3,
        sourceIds: ["S109"],
      },
      {
        type: "leading-indicator",
        evidence:
          "The installed base that needs orchestrating is compounding: US utility-scale battery storage grew at a 70% average annual rate over three years to 43.6 GW of operational capacity at the end of 2025, and operators added another 8.3 GW in the first six months of 2026.",
        strength: 3,
        sourceIds: ["S110"],
      },
      {
        type: "platform-shift",
        evidence:
          "The US Department of Energy frames the next step as aggregation - rooftop solar, customer-sited batteries, EV chargers, smart buildings 'and their controls' dispatched as one plant - and puts a number on it: 80-160 GW of virtual power plants by 2030, tripling current scale and cutting grid costs by $10 billion a year. Aggregation at that scale is a software problem before it is anything else.",
        strength: 2,
        sourceIds: ["S111"],
      },
    ],
    keyPlayerIds: [],
    risks: [
      "The value may stay with the hardware and the asset owner: battery and inverter makers ship their own optimisation, and software that comes free with the battery is hard to sell against.",
      "Utility procurement is slow, fragmented by jurisdiction and hostile to new vendors, so the buyer list is short and the sales cycles are long.",
      "The 80-160 GW figure is a policy target rather than a forecast, and energy policy can reverse faster than software companies can be built.",
      "Market-access rules for distributed resources are set by energy regulators whose current rule text this project could not retrieve, so the regulation that would make this software purchasable is treated here as contested rather than settled.",
    ],
    stage: "emerging",
    horizon: "2-5y",
  },
  {
    id: "em-digital-identity",
    name: "Digital identity wallets and age assurance",
    category: "consumer",
    thesis:
      "Consumer identity on the internet has been a by-product of platform accounts for twenty-five years: you are who Google or Apple says you are. Two unrelated regulators are now prising that apart. The EU is issuing a state-backed credential the holder controls and that private relying parties must accept; the UK is obliging consumer services to know an attribute about a user - their age - that they cannot get from a platform login. Both point at the same new layer: verifiable attributes, disclosed selectively, issued by someone other than the platform, needing wallets, issuers, verifiers and age-estimation engines that do not exist at scale today. It is filed as consumer because the artefact is an app in a citizen's pocket and the age duty attaches to consumer services, though the paying buyer is usually a government or a relying party, which would make it infrastructure. The identity specialists - Thales, IDEMIA, Entrust, Signicat, Yoti, Persona, Veriff, iProov - are outside the Atlas roster, so the two players listed are the platform gatekeepers whose wallet surface a state credential has to live on.",
    signals: [
      {
        type: "regulation",
        evidence:
          "The European Digital Identity Regulation (EU) 2024/1183 was adopted on 20 May 2024 and obliges each Member State to offer 'at least one version of the EU Digital Identity Wallet, built to the same common specifications, by 2026' - a statutory delivery date for a consumer application in 27 countries at once.",
        strength: 3,
        sourceIds: ["S112"],
      },
      {
        type: "regulation",
        evidence:
          "The demand side is mandated too, not merely invited: Member States must provide the wallets to citizens by the end of 2026, and 'service providers legally obliged to identify their customers unequivocally will be obliged to accept the wallet for authentication'.",
        strength: 3,
        sourceIds: ["S113"],
      },
      {
        type: "new-interface",
        evidence:
          "The wallet is a new interaction mode rather than a new login screen: citizens should be able to 'carry their digital identity with them across the EU, moving seamlessly across borders without ever losing control of their data', with sharing 'limited to the needs of a specific service'. Selective disclosure of attributes is a different primitive from the account-and-password model the consumer web is built on.",
        strength: 2,
        sourceIds: ["S115"],
      },
      {
        type: "regulation",
        evidence:
          "A second, unrelated regulator is forcing age attributes into consumer products with real penalties: under the UK Online Safety Act, services publishing their own pornographic content 'must take steps immediately to introduce robust age checks that meet Ofcom's guidance', and companies can be fined 'up to £18 million or 10 percent of their qualifying worldwide revenue, whichever is greater'.",
        strength: 3,
        sourceIds: ["S114"],
      },
    ],
    keyPlayerIds: ["apple", "google"],
    risks: [
      "Wallets are free to citizens by law, so the money sits in issuance, verification and integration - a thin, tendered, government-procurement business rather than a consumer subscription.",
      "Apple and Google control the secure element and the OS-level wallet surface, and can make a state wallet a second-class citizen on the device.",
      "Citizen uptake is voluntary and there is no evidence yet that people want it; mandated supply does not create demand.",
      "Age assurance is the most contested consumer regulation of the decade, and privacy litigation, circumvention and divergent national rules could keep the market fragmented and low-margin.",
    ],
    stage: "emerging",
    horizon: "2-5y",
  },
  {
    id: "em-embedded-finance",
    name: "Embedded payments inside vertical software",
    category: "vertical",
    thesis:
      "The unbundling signal is usually read as a suite losing a feature to a focused challenger. This is the same mechanic pointed at a different incumbent: the bloated suite is the bank and the merchant acquirer, and vertical software is taking the profitable job - moving money - while leaving the regulated balance sheet behind. A restaurant point-of-sale company now earns five dollars of payment revenue for every dollar of software subscription, and a commerce platform three, which changes what a vertical software company is: pricing, gross margin, unit economics and moat all follow the payment flow rather than the seat count. Say the obvious thing plainly, though - this category has already arrived. The Atlas's own test for graduation is an independent vendor above $1B of revenue, and both filers cleared it years ago. It is carried on the radar because the shift in what vertical software sells is still working its way through categories that have not yet made it, not because the arrival is in doubt.",
    signals: [
      {
        type: "unbundling",
        evidence:
          "Toast's FY2025 financial technology revenue of $5,037M is 5.4 times its $936M of subscription services revenue, on $195.1 billion of gross payment volume. The software subscription is no longer the product being monetised; the payment flow is. Filed figures, not estimates.",
        strength: 3,
        sourceIds: ["S116"],
      },
      {
        type: "unbundling",
        evidence:
          "The same split holds at a second filer on a different vertical: Shopify's FY2025 merchant solutions revenue was $8,804M against $2,752M of subscription solutions, on $378.4 billion of gross merchandise volume. Two filers, same ratio direction, same year - a pattern rather than one company's pricing quirk.",
        strength: 3,
        sourceIds: ["S117"],
      },
      {
        type: "unbundling",
        evidence:
          "The software vendor has moved past acquiring into lending: Toast's 10-K describes 'a fully-integrated platform that enables our customers to securely accept and process payments' alongside 'fast and flexible funding via loans issued by our bank partner' - two functions that belonged to the merchant acquirer and the bank.",
        strength: 2,
        sourceIds: ["S118"],
      },
    ],
    keyPlayerIds: ["toast", "shopify", "stripe"],
    risks: [
      "Payment revenue is gross-margin-poor relative to software and drags reported margins down, so the model trades quality of revenue for quantity.",
      "Interchange regulation can reprice the whole opportunity overnight, and lending exposes a software company to credit risk it is not structured to carry.",
      "The attach rate has a ceiling: once every customer is on the vendor's payments, growth reverts to merchant volume growth, which is GDP-like rather than software-like.",
    ],
    stage: "scaling",
    horizon: "0-2y",
  },
  {
    id: "em-operational-resilience",
    name: "ICT operational resilience and third-party risk",
    category: "vertical",
    thesis:
      "Vendor risk used to be a spreadsheet and an annual questionnaire. DORA converts it into a continuously maintained register with statutory content, mandatory incident timelines and threat-led resilience testing, for twenty categories of financial firm at once, with supervisors reading the output. Regulation of that specificity does not create demand for consulting; it creates demand for a system of record. The second-order effect is the more interesting one: by designating critical ICT providers and supervising them directly, the EU has made the dependency of finance on a handful of software vendors an explicitly regulated fact - the same concentration story the Atlas tells elsewhere, now with a supervisor attached. Microsoft, Amazon, Google, IBM and Oracle are in this market as supervised providers rather than as sellers of the compliance tooling, and the specialist vendors (Archer, MetricStream, OneTrust, Riskonnect, LogicGate) are outside the Atlas roster, so only the one incumbent that genuinely sells the system of record is listed as a player.",
    signals: [
      {
        type: "regulation",
        evidence:
          "DORA, Regulation (EU) 2022/2554, 'entered into application on 17 Jan 2025' and is 'applicable to 20 different types of financial entities and ICT third-party service providers'. It names the deliverables: an ICT risk management framework, reporting of major ICT-related incidents to competent authorities, resilience testing and a register of third-party arrangements. That is a software specification written by a legislature.",
        strength: 3,
        sourceIds: ["S120"],
      },
      {
        type: "regulation",
        evidence:
          "The regime reaches past the regulated firms to their suppliers: on 18 November 2025 the European Supervisory Authorities designated critical ICT third-party providers and took them under direct oversight, assessing 'whether CTPPs have appropriate risk management and governance frameworks in place to ensure the resilience of the services they deliver to financial entities'. Software and cloud vendors supervised as if they were financial infrastructure.",
        strength: 3,
        sourceIds: ["S119"],
      },
    ],
    keyPlayerIds: ["servicenow"],
    risks: [
      "This may be a governance-and-risk feature rather than a market: the workflow suites and the big audit firms can absorb it, and the cloud providers will ship compliance packs to keep customers in place.",
      "It is EU-only, which caps the addressable base, and the first compliance cycle is a one-off build - spend can fall sharply once the register exists.",
      "This project verified the obligation and its supervision, not a single euro of vendor revenue, so the step from rule to market is an inference carried in this thesis rather than evidence in a signal.",
    ],
    stage: "emerging",
    horizon: "2-5y",
  },
  {
    id: "ai-glasses",
    name: "AI glasses",
    category: "consumer",
    thesis:
      "The face computer that is arriving is not the headset but ordinary-looking glasses with a camera, microphones and an assistant. Headsets asked people to change what they wear and where they sit; glasses don't, which is why the same company's VR line is shrinking while its glasses triple.",
    signals: [
      {
        type: "new-interface",
        evidence:
          "Meta and EssilorLuxottica sold more than 7 million smart glasses in 2025, against 2 million Ray-Ban Meta units in the sixteen months from the October 2023 launch to February 2025.",
        strength: 3,
        sourceIds: ["S124"],
      },
      {
        type: "leading-indicator",
        evidence:
          "IDC expects the smart glasses market to have grown 211.2% in 2025 and forecasts 29.3% a year from 2025 to 2029, while VR headsets fell: Meta Quest shipments down 16% and Apple Vision Pro at 45,000 units against 390,000 in 2024.",
        strength: 2,
        sourceIds: ["S123"],
      },
      {
        type: "platform-shift",
        evidence:
          "Meta invested $21.40B in Reality Labs in 2025 to 'build the next computing platform' and expects the segment to operate at a loss for the foreseeable future, so the leading vendor is subsidising the category.",
        strength: 2,
        sourceIds: ["S122"],
      },
    ],
    keyPlayerIds: ["meta", "google", "apple"],
    risks: [
      "The software layer may stay inside the device maker's assistant, leaving no independent market for apps.",
      "Always-on cameras invite privacy regulation that could limit where the glasses can be worn.",
      "Meta's subsidy hides the true unit economics; the category may shrink when it stops.",
    ],
    stage: "emerging",
    horizon: "2-5y",
  },
];
