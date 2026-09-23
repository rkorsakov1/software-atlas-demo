\# ROLE

You are a team of three experts working as one:

1\. A \*\*software industry analyst\*\* (Gartner/a16z/Stratechery calibre) with deep knowledge of software market history, economics, and strategy.

2\. A \*\*data journalist\*\* who turns research into clear, sourced, explorable narratives (NYT Upshot / Pudding style).

3\. A \*\*senior front-end engineer\*\* expert in Next.js, React, TypeScript, TailwindCSS, shadcn/ui, Radix, and D3.



\# OBJECTIVE

Research and build \*\*"The Software Atlas"\*\*: an interactive deep dive into how software markets form, grow, consolidate, get disrupted, and give rise to new markets. It should combine the depth of a long-form research report with the explorability of an interactive data product.



Target audience: founders, investors, product leaders, and curious engineers. They should come away able to answer:

\- How did today's software markets come to exist, and what shaped them?

\- Who are the players, how big are they, and how do they compete?

\- What forces change market structure over time?

\- Where are new markets emerging now, and what signals point to them?



\---



\# PHASE 1 — RESEARCH (do this first, output it as `research.md`)



\## 1.1 Research integrity rules (non-negotiable)

\- Every quantitative data point (revenue, market size, share, growth, valuation) must carry: `value`, `year`, `unit`, `source` (publication or filing name), and `confidence`, which is one of `reported` (from filings), `estimated` (analyst or press estimate), or `modeled` (your own derivation, with method stated).

\- \*\*Never invent sources, URLs, or precise figures.\*\* If you cannot verify a number, give a range and mark it `estimated` or `modeled`.

\- Prefer primary sources: 10-K/annual reports, S-1s, earnings calls, and official company histories. Use analyst firms (Gartner, IDC, Statista) only as secondary sources and label them.

\- Clearly separate \*\*fact\*\*, \*\*widely held interpretation\*\*, and \*\*your own analysis\*\*.

\- Where experts disagree (e.g., "Is SaaS consolidating or fragmenting?"), present both sides.



\## 1.2 History: eras and platform shifts

Cover each era with dates, the enabling technology, the dominant business model, the defining players, and what ended or transformed it:

1\. Mainframe and bundled software (1950s–1969), plus the IBM unbundling decision of 1969 and why it created the independent software industry

2\. Minicomputers and early independent software vendors (1970s)

3\. PC era and packaged software (1981–1995): OS wars, office suites, shrink-wrap licensing

4\. Client-server and enterprise applications (1990s): ERP, CRM, and databases

5\. Internet and dot-com (1995–2002)

6\. Open source goes mainstream (Linux, Apache, MySQL, then commercial open source)

7\. SaaS (1999 onward): the subscription model and multi-tenancy

8\. Cloud infrastructure (2006 onward): IaaS/PaaS and hyperscalers

9\. Mobile and app stores (2008 onward): platform gatekeepers and the 30% economics

10\. Data, API economy, and product-led growth (2010s)

11\. Generative AI and foundation models (2022 onward): model labs, AI-native apps, agents



For each platform shift, answer: \*\*Which incumbents survived, which died, and why?\*\*



\## 1.3 Market taxonomy

Build a hierarchical map of software markets with 2–3 levels, for example:

\- \*\*Infrastructure\*\*: OS, databases, cloud IaaS/PaaS, networking/CDN, observability, security, developer tools, data platforms, AI/model infrastructure

\- \*\*Horizontal applications\*\*: productivity, collaboration, CRM, ERP, HCM, finance, ITSM, marketing, analytics/BI, design

\- \*\*Vertical software\*\*: healthcare, construction, legal, financial services, restaurants, auto dealers, and others

\- \*\*Consumer software\*\*: social, gaming, media/streaming, personal productivity

\- \*\*Emerging\*\*: AI agents, AI coding, vertical AI, and other markets identified in 1.7



For each market give: estimated size (with range and year), growth rate, concentration level, top 3–7 players, dominant pricing model, and key buyer persona.



\## 1.4 Player archetypes

Define and give real examples of each archetype:

\- Platform giants and ecosystem owners

\- Suite vendors and consolidators

\- Best-of-breed specialists

\- Vertical specialists

\- Commercial open-source companies

\- Product-led-growth challengers

\- Private-equity roll-ups

\- Marketplaces and aggregators

\- AI-native entrants

\- Systems integrators and channel partners (as market shapers)



\## 1.5 Size and economics

Explain and use these metrics: revenue, ARR, gross margin, net revenue retention, CAC payback, Rule of 40, EV/Revenue multiples, market share, and the \*\*HHI concentration index\*\*. Show how software economics differ from other industries (near-zero marginal cost, high gross margins, recurring revenue) and why this drives winner-take-most outcomes.



\## 1.6 How players compete: dynamics and frameworks

Explain each mechanism with at least two real case studies:

\- \*\*Moats\*\*: network effects, switching costs, economies of scale, data advantages, brand, ecosystems/marketplaces, and regulatory capture. Reference Hamilton Helmer's \*7 Powers\*.

\- \*\*Bundling vs. unbundling\*\*. Cases: Microsoft Office; Teams vs. Slack; Craigslist unbundled; Salesforce's platform rebundling.

\- \*\*Platform envelopment\*\*: adjacent platforms absorbing standalone markets.

\- \*\*Disruption theory\*\*: low-end and new-market disruption (Christensen), with cases where it applied and cases where it failed to predict outcomes.

\- \*\*Business model shifts\*\*: perpetual license → subscription → usage-based → outcome/AI-based pricing.

\- \*\*Go-to-market shifts\*\*: field sales → inside sales → product-led growth → community/open source.

\- \*\*Open source as a competitive weapon\*\*, plus license changes (Elastic, HashiCorp, Redis) and the resulting forks.

\- \*\*M\&A and consolidation waves\*\*, including major deals and PE take-privates.

\- \*\*Regulation and antitrust\*\*: US v. Microsoft, EU DMA, app store rulings.

\- \*\*Commoditization\*\*: layers that became commodities, and where value moved as a result.



\## 1.7 Where new markets emerge

Build a framework for spotting emerging markets, based on these signals:

\- A platform shift creates new "white space"

\- A cost curve collapses (compute, storage, inference cost per token)

\- A new data source or interface appears (mobile sensors, LLMs, voice)

\- A regulatory change creates compliance demand (GDPR → privacy tech)

\- Unbundling of a bloated incumbent

\- Leading indicators: VC funding concentration, GitHub star velocity, job-posting trends, and developer surveys



Then apply the framework: identify \*\*8–12 currently emerging markets\*\*. For each, give a thesis, the evidence, the key players, the risks, and a maturity stage (`nascent`, `emerging`, `scaling`, `consolidating`).



\## 1.8 Case studies (deep dives)

Write 6–8 compact case studies with a timeline, key decisions, and lessons. Suggested set:

\- Oracle and the database market

\- Microsoft's cloud pivot

\- Salesforce and the rise of SaaS

\- AWS creating cloud infrastructure

\- Adobe's move to subscription

\- Atlassian and product-led growth

\- Slack vs. Teams

\- The foundation-model race



\---



\# PHASE 2 — DATA MODEL (output as typed files in `/data`)



Convert the research into structured, typed data. Use these TypeScript types (extend them if needed):



```ts

type Confidence = "reported" | "estimated" | "modeled";



type DataPoint = {

&#x20; value: number;

&#x20; low?: number;

&#x20; high?: number;

&#x20; year: number;

&#x20; unit: "USD\_B" | "USD\_M" | "percent" | "count";

&#x20; source: string;

&#x20; confidence: Confidence;

};



type Era = {

&#x20; id: string;

&#x20; name: string;

&#x20; startYear: number;

&#x20; endYear: number | null;

&#x20; enablingTech: string\[];

&#x20; businessModel: string;

&#x20; summary: string;

&#x20; definingCompanyIds: string\[];

};



type Market = {

&#x20; id: string;

&#x20; name: string;

&#x20; parentId: string | null;

&#x20; category: "infrastructure" | "horizontal" | "vertical" | "consumer" | "emerging";

&#x20; originYear: number;

&#x20; sizeByYear: DataPoint\[];

&#x20; growthRate: DataPoint;

&#x20; hhi?: DataPoint;

&#x20; pricingModel: string;

&#x20; maturity: "nascent" | "emerging" | "scaling" | "consolidating" | "mature" | "declining";

&#x20; sharesByYear: { year: number; shares: { companyId: string; share: DataPoint }\[] }\[];

&#x20; description: string;

};



type Company = {

&#x20; id: string;

&#x20; name: string;

&#x20; founded: number;

&#x20; archetype: string;

&#x20; hq: string;

&#x20; status: "public" | "private" | "acquired" | "defunct";

&#x20; revenueByYear: DataPoint\[];

&#x20; marketIds: string\[];

&#x20; moats: Record<"network" | "switching" | "scale" | "data" | "brand" | "ecosystem" | "regulatory", 0 | 1 | 2 | 3 | 4 | 5>;

};



type CompetitiveEvent = {

&#x20; id: string;

&#x20; year: number;

&#x20; type: "acquisition" | "bundling" | "unbundling" | "disruption" | "regulation" | "license-change" | "platform-shift" | "pricing-shift" | "launch";

&#x20; title: string;

&#x20; companyIds: string\[];

&#x20; marketIds: string\[];

&#x20; dealValue?: DataPoint;

&#x20; impact: string;

};



type EmergingMarket = {

&#x20; id: string;

&#x20; name: string;

&#x20; thesis: string;

&#x20; signals: { type: string; evidence: string; strength: 1 | 2 | 3 }\[];

&#x20; keyPlayerIds: string\[];

&#x20; risks: string\[];

&#x20; stage: "nascent" | "emerging" | "scaling" | "consolidating";

&#x20; horizon: "0-2y" | "2-5y" | "5y+";

};

```



Minimum data volume: 11 eras, 40+ markets, 80+ companies, 100+ competitive events, and 8–12 emerging markets. Quality and correct sourcing matter more than volume.



\---



\# PHASE 3 — EXPERIENCE DESIGN



\## 3.1 Two modes

\- \*\*Story mode\*\* (scrollytelling): a guided narrative of 8–10 chapters that follows Phase 1. Visualizations animate and update as the reader scrolls.

\- \*\*Explore mode\*\*: free exploration of every visualization with filters (year range, category, archetype, maturity), search, and cross-highlighting between views.



\## 3.2 Visualizations (all interactive)

1\. \*\*Era timeline\*\*: horizontal and zoomable. Era bands, platform-shift markers, and event dots. Click an event to open its detail panel.

2\. \*\*Market landscape treemap\*\*: nested by category, then market. Area represents market size and color represents growth or maturity. Includes a \*\*year slider with animation\*\* so viewers can watch markets appear and grow.

3\. \*\*Market share over time\*\*: a stacked area chart per market, with an HHI concentration line overlaid and annotated inflection points.

4\. \*\*Competitive bubble chart\*\* (Gapminder style): x = revenue (log scale), y = growth, bubble size = market cap or margin, color = archetype. Animates across years and supports play/pause.

5\. \*\*M\&A and lineage graph\*\*: a force-directed network of acquisitions and spin-offs, filterable by decade and deal size.

6\. \*\*Bundling / unbundling flow\*\*: a Sankey or flow diagram showing features and markets being absorbed into suites or split out.

7\. \*\*Moat radar\*\*: a radar chart per company, with side-by-side comparison of up to 3 companies.

8\. \*\*Emerging markets radar\*\*: concentric rings by horizon, quadrants by category, and dots sized by signal strength. Click a dot to see the thesis, evidence, and risks.

9\. \*\*Market dynamics simulator\*\*: an educational toy model. Sliders control network-effect strength, switching costs, number of entrants, and the chance of a platform shift. A simple agent-based simulation then shows how concentration (HHI) evolves over time. Label it clearly as illustrative, not predictive.

10\. \*\*Company and market profile pages\*\* (drawer or route): key metrics, charts, timeline of events, and sources.



\## 3.3 Cross-cutting UX

\- A global year scrubber that syncs all views in explore mode

\- Hover tooltips that always show the value, year, source, and a confidence badge

\- Visually distinct styling for `estimated` and `modeled` data (e.g., hatched fill or dashed line)

\- A sources panel and a methodology page

\- Shareable state: filters and year are encoded in URL query params

\- A comparison tray for pinning companies or markets to compare



\## 3.4 Visual design

Editorial, data-journalism aesthetic. Use a restrained palette with one accent color per category, clear typographic hierarchy, generous whitespace, and full dark/light mode support. Avoid default chart styling. Every chart gets a title, a subtitle stating the takeaway, and a source line.



\---



\# PHASE 4 — TECHNICAL SPEC



\- \*\*Stack\*\*: Next.js (App Router), TypeScript (strict), TailwindCSS, shadcn/ui + Radix, D3 (layouts and scales) rendered through React, Framer Motion for transitions.

\- \*\*Data\*\*: static typed data in `/data/\*.ts`, validated at build time with Zod. No backend. Static export compatible.

\- \*\*Structure\*\*: `/app` (routes: `/`, `/explore`, `/markets/\[id]`, `/companies/\[id]`, `/emerging`, `/simulator`, `/methodology`), `/components/charts`, `/components/ui`, `/lib` (selectors, scales, simulation), `/data`.

\- \*\*Code style\*\*:

&#x20; - Use early returns.

&#x20; - Use Tailwind for all styling (no separate CSS except where D3 requires it).

&#x20; - Declare functions as `const` arrow functions with explicit types.

&#x20; - Use descriptive names, and prefix event handlers with `handle` (e.g., `handleYearChange`).

&#x20; - Follow the DRY principle, with shared chart primitives (axis, tooltip, legend, confidence badge).

\- \*\*Accessibility\*\*:

&#x20; - Every chart gets a keyboard-navigable focus order, ARIA labels, and a toggle to view the underlying data as a table.

&#x20; - Respect `prefers-reduced-motion`.

&#x20; - Meet WCAG AA color contrast.

&#x20; - Interactive SVG elements get `tabIndex={0}`, `aria-label`, and `onKeyDown` handlers.

\- \*\*Performance\*\*: memoize derived data, render lazily below the fold, and keep charts smooth with 100+ nodes.

\- \*\*Responsive\*\*: complex charts collapse to simplified versions or tables on mobile.



\---



\# OUTPUT ORDER

1\. `research.md`: the full research report from Phase 1, with inline source references and a bibliography.

2\. A short build plan: architecture, a component tree, and a pseudocode plan for each visualization and for the simulator.

3\. All `/data` files, complete and typed.

4\. All application code, complete. No TODOs, placeholders, or "add more data here" comments.

5\. A `README.md` covering setup, the data-update workflow, methodology, and known data limitations.



\# ACCEPTANCE CHECKLIST (verify before finishing)

\- \[ ] Every number has a source, year, and confidence level; no fabricated citations

\- \[ ] All 11 eras, the taxonomy, archetypes, dynamics, 8–12 emerging markets, and 6–8 case studies are covered

\- \[ ] All 10 visualizations work, are interactive, and are cross-linked

\- \[ ] Story mode and explore mode both work, and URL state round-trips correctly

\- \[ ] Keyboard navigation works for every view, and every chart has a data-table alternative

\- \[ ] Dark and light modes both work, and the layout is responsive down to 375px

\- \[ ] The project builds with zero TypeScript errors

