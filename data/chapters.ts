import type { StoryChapter } from "@/data/types";

/**
 * Story mode. Ten chapters following the research arc: origin, eras, size,
 * players, economics, concentration, bundling, disruption, emerging markets and
 * the simulator.
 *
 * Every paragraph opens with its claim type - [F] fact, [I] interpretation
 * accepted by most analysts, [A] this project's own argument. The UI sets [A]
 * paragraphs apart as "Our take". Source ids in parentheses resolve in the sources
 * panel. `graphicState` uses the same keys as the Explore URL state, so every
 * chapter graphic is a link into Explore.
 */
export const chapters: StoryChapter[] = [
  {
    id: "ch-origin",
    order: 1,
    title: "The day software got a price",
    kicker: "23 June 1969",
    body: [
      "[F] On 23 June 1969, IBM announced it would start charging for software separately from its machines. The Justice Department had filed its antitrust suit that January (B03, B01).",
      "[I] Historians treat this as the birth of commercial software. Once IBM's software had a price, anyone could build a cheaper one, and a market existed.",
      "[A] The pattern repeats. A dominant platform stops giving something away, and a new market appears. It happened with browsers, with app stores, and it is happening now between AI models and the apps built on them.",
    ],
    graphic: "timeline",
    graphicState: {
      mode: "story",
      chart: "timeline",
      from: 1960,
      to: 1995,
      year: 1969,
      focus: "event:evt-1969-ibm-unbundling",
    },
  },
  {
    id: "ch-eras",
    order: 2,
    title: "Eleven eras, one question",
    kicker: "Who survives a platform change?",
    body: [
      "[F] Commercial software has gone through eleven eras, each built on a new technology and a new way of charging: licences for minicomputers, boxed retail for PCs, big licences plus maintenance for client-server, subscriptions for SaaS, metered usage for cloud, per-token pricing for AI models.",
      "[I] The losers of each shift fail the same way. Lotus and WordPerfect were late to Windows. Netscape had the better browser but no distribution. Nokia and BlackBerry owned the phone, not the platform.",
      "[A] The survivors did one of three things. They owned a layer the new platform still needed: Oracle's database, Microsoft's identity, Adobe's PDF. They disrupted themselves first: Office went subscription in 2011 (S70), Creative Suite was retired in 2013 (S66). Or they bought the challenger at a price that looked absurd: GitHub for $7.5B (S50), LinkedIn for $26.2B (S46), Wiz for $32B (S20).",
      "[A] The AI era has no casualties yet. In February 2026 investors priced them in anyway (S18, S27).",
    ],
    graphic: "timeline",
    graphicState: { mode: "story", chart: "timeline", from: 1950, to: 2026, year: 2026 },
  },
  {
    id: "ch-size",
    order: 3,
    title: "How big is software?",
    kicker: "About $1.27 trillion, depending on who counts",
    body: [
      "[F] Gartner puts worldwide software spending at $1,271B in 2025 and $1,468B in 2026 (S01). It revised the 2026 figure three times in one year (S01, S02).",
      "[F] Synergy measures cloud more broadly and puts it at $143B in a single quarter of 2026, up 43% year on year (S03). Two respected sources, the same-sounding market, figures more than twice apart.",
      "[I] That's normal. Analysts disagree by two to three times on the same category because they draw its edges differently. Does CRM include marketing automation? Is a contact centre software or telephony?",
      "[A] So each market here states what it counts before it states a number. Where there's no published figure, we show a size range (under $5B up to over $150B) rather than a made-up point.",
    ],
    graphic: "treemap",
    graphicState: {
      mode: "story",
      chart: "treemap",
      year: 2025,
      cat: ["infrastructure", "horizontal", "vertical", "consumer"],
    },
  },
  {
    id: "ch-players",
    order: 4,
    title: "Ten ways to be a software company",
    kicker: "Archetypes",
    body: [
      "[F] We sort companies into ten archetypes, from platform giants and suite consolidators to open-source vendors, private-equity roll-ups and AI-native newcomers. Each has its own advantage and its own way of failing.",
      "[I] These are roles, not labels. Microsoft is a platform giant, a suite consolidator and, through GitHub and VS Code, one of the biggest product-led businesses in software.",
      "[A] Two moves drive most of the story. Specialists get absorbed into suites: Slack by Salesforce for $27.7B (S82), Wiz by Google for $32B (S20), Informatica by Salesforce for about $8B (S84). And open-source companies change their licence, get forked, then partly walk it back: Elastic in 2021 (S54), Redis in 2024 (S55, S56).",
      "[A] In the chart, look at the clusters, not the ranking. Platform giants sit large and steady. AI natives sit small and fast-growing. PE-owned companies trade growth for cash.",
    ],
    graphic: "bubble",
    graphicState: {
      mode: "story",
      chart: "bubble",
      year: 2025,
      arch: ["platform-giant", "suite-consolidator", "best-of-breed", "ai-native"],
    },
  },
  {
    id: "ch-economics",
    order: 5,
    title: "Why winners take most",
    kicker: "Margins, retention, moats",
    body: [
      "[F] Software costs almost nothing to copy. Adobe's fiscal 2025 revenue was $23.77B against $2.55B in cost of revenue, a gross margin of about 89% (S14, modeled as 1 minus 2.55 divided by 23.77). Atlassian grew 26% with a 20% free-cash-flow margin (S15).",
      "[I] Three forces compound that. Existing customers spend more each year, so revenue grows without new sales. Network, data and ecosystem effects make the most-used product the most valuable. And switching costs keep ERP, databases and health records in place for decades.",
      "[A] The radar scores each company 0–5 on seven moats against a published rubric, so you can argue with a specific score. Compare like with like: the tabs group incumbents that compete for the same buyers.",
      "[A] What's new: AI inference costs real money for every query. If it pushes costs up, software's margin advantage shrinks. Public evidence on AI unit economics is still thin and mostly leaked (S16b).",
    ],
    graphic: "moat",
    graphicState: {
      mode: "story",
      chart: "moat",
      year: 2026,
      pin: ["amazon", "microsoft", "google"],
    },
  },
  {
    id: "ch-concentration",
    order: 6,
    title: "Is cloud getting more concentrated?",
    kicker: "Cloud infrastructure, 2017–2026",
    body: [
      "[F] Cloud is the one market with published share data. In mid-2017 AWS held 34% and Microsoft 11% (S04). By mid-2026 AWS was at 28%, Microsoft 20% and Google 15% (S03). Microsoft passed 20% in 2021 (S06), peaked at 23% in late 2022 (S96) and has held 20–21% since (S97, S98).",
      "[A] Whether cloud is concentrating depends on how you measure it. The top three went from about half the market to two thirds. But HHI, the standard concentration index, peaked in 2022 and fell, because AWS lost share to its two nearest rivals rather than to small players. More oligopoly, less dominance.",
      "[I] Our HHI is computed from published shares, treating the unreported rest as fragmented, so it's a lower bound. The 2023 US merger guidelines put the line for a concentrated market at 1,800 (B09).",
      "[A] For most other markets, share data sits behind paywalls. Where a publisher has released vendor shares (CRM, databases, security, operating systems, ERP, AI model APIs), the Explore view shows them, gaps included.",
    ],
    graphic: "share",
    graphicState: {
      mode: "story",
      chart: "share",
      focus: "market:cloud-infrastructure",
      from: 2014,
      to: 2026,
      year: 2026,
    },
  },
  {
    id: "ch-bundling",
    order: 7,
    title: "Bundle, unbundle, repeat",
    kicker: "The two ways to make money in software",
    body: [
      "[F] In 1990 Microsoft bundled Word, Excel and PowerPoint into Office and priced it below the standalone leaders. Within five years Lotus 1-2-3 and WordPerfect had both been sold (B01).",
      "[F] It ran the same play in 2017, shipping Teams inside Office 365 (S65). Slack complained to the European Commission in 2020. In September 2025 the Commission accepted Microsoft's commitments to sell suites without Teams, at a lower price (S26). By then Slack had belonged to Salesforce for four years (S44).",
      "[I] Unbundling happens when a suite serves some customers badly enough that a standalone product is worth buying. Re-bundling follows when stitching tools together becomes the bigger pain, which is Salesforce's pitch for its AI agents today (S12, S74).",
      "[A] The cycle is speeding up. Wiz went from founding to a $32B acquisition in six years (S20). AI coding agents went from new category to a $60B acquisition offer in under three (S21).",
    ],
    graphic: "bundling",
    graphicState: { mode: "story", chart: "bundling", from: 1990, to: 2026, year: 2026 },
  },
  {
    id: "ch-disruption",
    order: 8,
    title: "Is AI eating software?",
    kicker: "The case for and against",
    body: [
      "[F] On 3 February 2026, days after an AI lab launched legal, sales and data-analysis plug-ins, Thomson Reuters fell nearly 18%, heading for its worst day on record. RELX, Wolters Kluwer and LSEG fell sharply too (S18, S27). Losses across affected sectors were estimated at about $285B (S18b).",
      "[I] The bear case: AI agents don't need a seat licence, so per-seat revenue shrinks. Model labs move into applications. Customers build more in-house.",
      "[I] The bull case comes from the filings. Salesforce grew 10% to $41.5B, with Agentforce at $800M in annual recurring revenue (S12). Atlassian grew 26% to $6.57B (S15). Microsoft sold more than 30 million paid Copilot seats (S11b). Gartner raised its 2026 software forecast to +15.5% (S01).",
      "[A] So far, valuations have fallen but revenue hasn't. Watch seat counts, net retention and how much new business is priced on usage. The acquisitions chart shows where the money is going: into the layers incumbents don't yet own.",
    ],
    graphic: "lineage",
    graphicState: { mode: "story", chart: "lineage", from: 2000, to: 2026, year: 2026 },
  },
  {
    id: "ch-emerging",
    order: 9,
    title: "Where the next markets come from",
    kicker: "18 candidates, six signals",
    body: [
      "[F] New software markets tend to follow one of six signals: a platform shift, a key cost falling tenfold, a new interface or data source, a new regulation, a bloated incumbent coming apart, or a surge in funding and hiring.",
      "[F] All six are firing now. AI inference costs fall about tenfold a year at the same capability (S24). AI took close to half of global venture funding in 2025 (S23). NIST published its first post-quantum encryption standards in 2024, starting a decade of mandatory migration (S48). The EU's Digital Markets Act opened iPhones to rival app stores in 2024 (S67, S68).",
      "[F] Six of the 18 candidates aren't about AI. They're driven by law or cost curves: mandatory e-invoicing, health-data APIs, battery prices down 90% since 2010, EU digital identity wallets.",
      "[A] Bigger dots mean stronger evidence, not bigger markets. Every signal is sourced and scored 1–3. Timing guesses are the softest numbers here. A coding-agent company valued at $60B three years after it was founded (S21) is a reminder of how wrong they can be.",
    ],
    graphic: "emerging",
    graphicState: { mode: "story", chart: "emerging", year: 2026 },
  },
  {
    id: "ch-simulator",
    order: 10,
    title: "Play the dynamics yourself",
    kicker: "A toy model, not a forecast",
    body: [
      "[A] The patterns so far fit a few rules. Better products attract more customers, and network effects amplify that. Low switching costs increase churn. New entrants arrive. Now and then a platform shift resets the board.",
      "[F] The simulator runs those rules. Every parameter is in the URL, so any run can be shared and reproduced exactly.",
      "[A] Try it. Turn network effects up and one firm takes over fast. Turn switching costs up and concentration builds slowly and never unwinds. Make platform shifts frequent and no leader lasts.",
      "[A] It has no prices, regulators or acquisitions. Use it to build intuition, not to predict anything.",
    ],
    graphic: "simulator",
    graphicState: {
      mode: "story",
      net: 0.7,
      sw: 0.6,
      ent: 1,
      shift: 0.05,
      ticks: 60,
      seed: 7,
    },
  },
];
