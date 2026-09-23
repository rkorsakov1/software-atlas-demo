# The Software Atlas — Research Report

*Version 0.1 · Research cut-off: 21 September 2026 · Phase 1 of 5*

---

## 0. How to read this report

### 0.1 Data-point notation

Every quantitative claim carries a tag:

```
⟨value · year · unit · sourceId · confidence · verification⟩
```

| Field | Meaning |
|---|---|
| `confidence` | `reported` = from a company filing or official release · `estimated` = analyst or press estimate · `modeled` = author derivation (method stated inline) |
| `verification` | ✓ = located and checked in a live search during this research session (URL in bibliography) · ◇ = figure taken from a company annual report / 10-K as I know it, **not re-fetched in this session**; must be re-verified against the filing before publication |

The ◇ marker exists because the research integrity rules forbid presenting unchecked numbers as checked. ◇ figures are well-known filing values (e.g., historic Microsoft or Oracle revenue), but the data phase will re-verify each one and upgrade it to ✓ or remove it.

### 0.2 Claim types

- **[F] Fact** — documented event, date or number.
- **[I] Interpretation** — widely held reading among analysts/historians.
- **[A] Analysis** — this report's own argument. Disagree freely.

### 0.3 Disclosure

This report was produced by Claude, an AI model built by Anthropic. Anthropic appears in Sections 1.7 and 1.8 as a market participant. To limit bias, every Anthropic figure below comes from third-party reporting (CNBC, Axios, Bloomberg via press), Anthropic is scored with the same rubric as its competitors, and the report presents the bear case on foundation-model economics explicitly.

### 0.4 What this report cannot do

- **Market share by year** for most application markets sits in paywalled Gartner/IDC reports. Where only paywalled data exists, the Atlas shows **no share data** rather than reconstructed figures. Public, time-series share data exists for cloud infrastructure (Synergy Research press releases), which is therefore the flagship share-over-time dataset.
- **Market sizes** differ by up to 2–3× across analyst firms because definitions differ (e.g., whether "CRM" includes marketing automation and contact-center software). Sizes are therefore shown as ranges, mostly `modeled`.
- **Private AI company revenue** is almost entirely press-reported "annualized run rate" (latest month × 12), which is not GAAP revenue and can overstate trailing revenue in hyper-growth periods.

---

## 1. The size of the thing

**[F]** Gartner's July 2026 forecast puts worldwide software spending at $1,271B in 2025 (+13.9%) and $1,468B in 2026 (+15.5%), with infrastructure-as-a-service now broken out as its own line at $222B (2025) and $287B (2026). Total IT spending is forecast at $6.37T for 2026.
- ⟨1271 · 2025 · USD_B · S01 · estimated · ✓⟩ software spending
- ⟨1468 · 2026 · USD_B · S01 · estimated · ✓⟩ software spending (forecast)
- ⟨222 · 2025 · USD_B · S01 · estimated · ✓⟩ IaaS spending
- ⟨287 · 2026 · USD_B · S01 · estimated · ✓⟩ IaaS spending (forecast)

**[F]** Gartner revised the 2026 software figure three times in 2026: $1,434B in February (+14.7%), $1,444B in April (+15.1%), $1,468B in July (+15.5%) (S02, S01). **[A]** Forecast revisions of ±2% within a single year are a useful reminder that even "headline" market sizes are estimates, not measurements.

**[F]** Gartner separately forecasts worldwide **AI** spending (hardware + software + services) at $2.52T in 2026 (January forecast), with AI software at $452B and AI models at $26B (S25). The May 2026 update raised the total to $2.59T (+47%) and the AI-models growth rate to 110% (S25).
- ⟨2528 · 2026 · USD_B · S25 · estimated · ✓⟩ AI spending, all categories (Jan forecast)
- ⟨452 · 2026 · USD_B · S25 · estimated · ✓⟩ AI software
- ⟨26.4 · 2026 · USD_B · S25 · estimated · ✓⟩ AI models

**[A]** Note that Gartner's "AI software" overlaps heavily with its overall "software" line — AI features embedded in existing software count toward both. The Atlas never sums the two.

---

## 2. History: eras and platform shifts (Brief §1.2)

Each era lists: dates · enabling technology · dominant business model · defining players · what ended it · survivors and casualties of the shift *into* it.

### Era 1 — Mainframes and bundled software (1950s–1969)

- **Enabling tech [F]:** stored-program computers; IBM System/360 (announced 1964) as the first compatible family across price points.
- **Business model [F]:** hardware leases with software, education and support bundled at no separate charge. Software was a cost center for the hardware vendor.
- **Players [F]:** IBM (dominant), the "BUNCH" (Burroughs, UNIVAC, NCR, Control Data, Honeywell); early contract programming firms such as Computer Sciences Corporation (1959) and service bureaus like ADP.
- **The 1969 unbundling [F]:** On 23 June 1969, IBM announced it would price software and services separately from hardware, effective 1970. The decision came while the US Department of Justice was preparing its antitrust suit (filed January 1969) (B03, B01).
- **Why it created the industry [I]:** Once IBM charged for software, independent vendors could compete on price and function against a priced incumbent product rather than a free one. Historians (Campbell-Kelly, B01; Humphrey, B03) treat unbundling as the founding moment of the commercial software products industry. **[A]** The mechanism — *a dominant platform stops giving away a complement, creating a priced market for it* — recurs in every later era (browsers, app stores, AI models).
- **Survivors/casualties:** not applicable (founding era).

### Era 2 — Minicomputers and the first independent software vendors (1970s)

- **Enabling tech [F]:** minicomputers from DEC (PDP-11, VAX from 1977), Data General, HP; relational database theory (Codd, 1970); UNIX (Bell Labs, 1969–71).
- **Business model [F]:** perpetual licenses plus annual maintenance (typically a percentage of license price), sold by field sales forces.
- **Players [F]:** Software AG (1969), SAP (founded 1972), Computer Associates (1976), Oracle (founded 1977 as Software Development Laboratories), Cullinet, Informatics (Mark IV).
- **Shift survivors [I]:** IBM survived by becoming a major software vendor itself (DB2, CICS, IMS). Companies whose products ran on multiple hardware platforms (Oracle wrote its database in C for portability) gained an advantage over hardware-tied software.
- **Casualties [I]:** Minicomputer makers eventually lost to PCs and workstations in Era 3–4; DEC was acquired by Compaq in 1998.

### Era 3 — The PC and packaged software (1981–1995)

- **Enabling tech [F]:** microprocessors; the IBM PC (August 1981) with an open architecture and licensed MS-DOS; graphical interfaces (Macintosh 1984; Windows 3.0 in 1990; Windows 95).
- **Business model [F]:** shrink-wrap retail licenses; OEM per-copy royalties (the Microsoft-IBM DOS deal let Microsoft license DOS to clone makers).
- **Players [F]:** Microsoft (founded 1975), Lotus (1-2-3, 1983), WordPerfect, Ashton-Tate (dBASE), Borland, Novell (NetWare), Adobe (PostScript, 1982), Intuit, Autodesk.
- **Defining dynamic [I]:** The OS became the control point. Microsoft bundled Word, Excel and PowerPoint into Microsoft Office (1990) and priced the suite below the sum of standalone best-of-breed products — the canonical software bundling case.
- **Survivors [I]:** Microsoft; Adobe (by owning a format standard, PostScript and later PDF); Intuit; Autodesk.
- **Casualties [I]:** Lotus (acquired by IBM 1995), WordPerfect (sold to Novell 1994, then Corel), Ashton-Tate (acquired by Borland 1991). Common cause: late or weak Windows versions while Microsoft sold a bundle on the platform it controlled.

### Era 4 — Client-server and enterprise applications (1990s)

- **Enabling tech [F]:** LANs, UNIX servers and PC clients; relational databases over SQL.
- **Business model [F]:** large perpetual licenses (often seven figures), 15–22% annual maintenance, and systems-integrator implementation services several times the license value.
- **Players [F]:** SAP (R/3, 1992), Oracle (database, then applications), PeopleSoft (HR), Siebel (CRM), Baan, J.D. Edwards, Sybase, Informix, Microsoft SQL Server; Accenture (then Andersen Consulting) and other SIs.
- **Defining dynamic [I]:** ERP became the system of record for large enterprises, creating some of the highest switching costs in software. The SI ecosystem became a moat for SAP and Oracle.
- **Survivors [I]:** SAP, Oracle, Microsoft (SQL Server, Dynamics).
- **Casualties [F]:** PeopleSoft and J.D. Edwards (acquired by Oracle, hostile bid completed January 2005), Siebel (acquired by Oracle 2006), Baan (acquired by Invensys 2000), Informix (database business sold to IBM 2001).

### Era 5 — Internet and dot-com (1995–2002)

- **Enabling tech [F]:** the web browser (Mosaic 1993; Netscape Navigator 1994), HTTP servers, Java (1995), commercial ISPs.
- **Business model [F]:** free-to-user with advertising; e-commerce; enterprise web servers and application servers; "application service providers" (ASPs) hosting single-tenant software.
- **Players [F]:** Netscape (IPO August 1995), Yahoo, Amazon (1994), eBay, Google (1998), BEA, Sun Microsystems, Inktomi, and the first SaaS vendors (Salesforce, NetSuite; 1998–99).
- **Defining dynamic [F]:** The browser wars. Microsoft bundled Internet Explorer with Windows; the US v. Microsoft suit (filed May 1998) resulted in a District Court finding of monopoly maintenance (2000), partly upheld on appeal (D.C. Cir. 2001, B06), and a 2002 settlement imposing conduct remedies rather than a breakup.
- **Survivors [I]:** Microsoft (won the browser war, though the case constrained its later conduct), Amazon, Google, eBay.
- **Casualties [I]:** Netscape (acquired by AOL 1999), most ASPs (single-tenant hosting had poor unit economics), Sun (acquired by Oracle 2010).

### Era 6 — Open source goes mainstream (late 1990s–2010s)

- **Enabling tech [F]:** GNU tools and the GPL (1989), the Linux kernel (1991), Apache HTTP Server (1995), MySQL (1995), PostgreSQL, and internet-scale distributed collaboration; the term "open source" was coined in 1998.
- **Business models [F]:** subscriptions for support and certified builds (Red Hat, IPO 1999); dual licensing (MySQL AB); later "open core" (proprietary enterprise features on an open base) and managed cloud services.
- **Players [F]:** Red Hat (acquired by IBM for $34B, closed 2019 ◇), MySQL AB (acquired by Sun for ~$1B in 2008 ◇), SUSE, JBoss, and later MongoDB, Elastic, Confluent, HashiCorp, Databricks, Redis.
- **Defining dynamic [I]:** Open source commoditized the OS and web-server layers for internet companies, collapsing the price of infrastructure and enabling both SaaS and cloud. **[A]** Open source was the precondition for Eras 7–8: hyperscalers could not have priced compute as low as they did while paying per-server OS and database licenses.
- **Survivors [I]:** Microsoft adapted late but decisively (open-sourced .NET Core in 2014, acquired GitHub for $7.5B in 2018 ◇). Oracle retained its database business despite open-source competition.
- **Casualties [I]:** Proprietary UNIX vendors; SCO Group (bankrupt 2007 after suing over Linux).

### Era 7 — Software as a Service (1999 onward)

- **Enabling tech [F]:** broadband, the browser as a universal client, and multi-tenant architecture (one code base and database schema serving all customers).
- **Business model [F]:** subscription pricing per user per month, recognized ratably; low upfront cost for the customer; vendor bears hosting cost.
- **Players [F]:** Salesforce (founded 1999, IPO 2004), NetSuite (1998), Workday (2005), ServiceNow (2004), Zendesk, HubSpot, Atlassian (cloud transition), Shopify, Veeva (vertical).
- **Economics [I]:** Subscriptions trade an immediate license payment for a stream of revenue, depressing reported revenue and profit during transition (the "SaaS J-curve") but raising lifetime value and predictability — which public markets eventually rewarded with higher revenue multiples.
- **Survivors [I]:** Microsoft (Office 365, launched 2011), Adobe (Creative Cloud, full switch 2013), SAP and Oracle (through acquisitions: SuccessFactors, NetSuite, Taleo, etc.), Intuit (QuickBooks Online).
- **Casualties [I]:** Siebel (already absorbed), many on-prem mid-market vendors rolled up by private equity rather than dying outright.

### Era 8 — Cloud infrastructure (2006 onward)

- **Enabling tech [F]:** server virtualization (VMware), commodity x86 servers, open-source stacks, and APIs for provisioning. AWS launched S3 (March 2006) and EC2 (August 2006).
- **Business model [F]:** pay-as-you-go utility pricing for compute, storage and managed services; later committed-use discounts.
- **Players [F]:** AWS, Microsoft Azure (general availability 2010), Google Cloud, Alibaba Cloud, Oracle Cloud Infrastructure, IBM; plus "neoclouds" for AI (CoreWeave, Nebius, Crusoe).
- **Scale [F]:** Synergy Research estimated cloud infrastructure services (IaaS, PaaS, hosted private cloud) at ~$3.7B per quarter in Q2 2014 (S08), $129B for full-year 2020 and $178B for 2021 (S07), and $143B in Q2 2026 alone, growing 43% year-on-year — its fastest growth in eight years (S03).
- **Survivors [I]:** Microsoft (the most successful incumbent pivot, see Case 2), Oracle (late, but re-accelerated via AI capacity contracts — FY2026 OCI revenue $18.1B, +77% ⟨18.1 · 2026 · USD_B · S13 · reported · ✓⟩).
- **Casualties/diminished [I]:** Rackspace (shifted to managed services), HP Helion (exited 2016), traditional hosting providers; on-prem hardware vendors lost share of wallet.

### Era 9 — Mobile and app stores (2008 onward)

- **Enabling tech [F]:** capacitive touchscreen smartphones (iPhone, 2007), 3G/4G, and mobile operating systems (iOS, Android).
- **Business model [F]:** app stores with platform commissions, historically 30% on paid apps and in-app purchases (reduced to 15% for small developers and subscriptions after year one on both major stores from 2021–22); freemium and in-app purchase; ad-supported consumer apps.
- **Players [F]:** Apple (App Store, July 2008), Google (Android Market 2008, later Google Play); app-native giants Facebook/Meta, WhatsApp, Uber, Instagram, TikTok.
- **Defining dynamic [I]:** Platform owners became gatekeepers able to set distribution terms. This triggered the largest wave of platform regulation since US v. Microsoft (see §6.9).
- **Survivors [I]:** Google (through Android), Microsoft (by shifting to cloud and cross-platform apps after exiting phone hardware), Meta (through an aggressive mobile pivot in 2012 and acquisitions of Instagram and WhatsApp).
- **Casualties [F]:** Nokia (phone business sold to Microsoft 2014), BlackBerry (exited phone hardware 2016), Windows Phone (discontinued).

### Era 10 — Data, APIs and product-led growth (2010s)

- **Enabling tech [F]:** cloud data warehouses separating storage from compute (Snowflake, BigQuery), REST APIs and developer platforms, Git/GitHub, containers (Docker 2013) and Kubernetes (2014).
- **Business models [F]:** usage-based pricing (Twilio, Snowflake, AWS); freemium and self-serve product-led growth (Atlassian, Slack, Zoom, Dropbox, Figma, Notion).
- **Players [F]:** Stripe, Twilio, Snowflake (IPO 2020), Databricks, Datadog, MongoDB, Atlassian, Slack, Zoom, Figma.
- **Defining dynamic [I]:** The buyer shifted from the CIO to individual developers and teams. A developer could adopt an API or tool with a credit card, and bottom-up usage later became enterprise contracts.
- **Survivors [I]:** Microsoft (VS Code, GitHub, Teams); Oracle and SAP less so in developer mindshare.
- **Casualties [I]:** Legacy on-prem data warehouse appliances (Teradata lost growth; Netezza absorbed into IBM); Hadoop distributors (Cloudera and Hortonworks merged in 2019, taken private in 2021).

### Era 11 — Generative AI and foundation models (2022 onward)

- **Enabling tech [F]:** the transformer architecture (2017), scaling of training compute (Epoch AI estimates training compute for notable models has grown ~4–5× per year since 2010 (S24)), GPU clusters, and reinforcement learning from human feedback. ChatGPT launched 30 November 2022.
- **Business models [F]:** usage-based API pricing per token; consumer and business subscriptions ($20–$200/month tiers); seat-based AI add-ons (Microsoft 365 Copilot); and emerging per-outcome pricing (e.g., per resolved support conversation).
- **Players [F]:** Model labs (OpenAI, Anthropic, Google DeepMind, Meta, xAI — merged into SpaceX in February 2026 (S21) — Mistral, DeepSeek, Alibaba Qwen); hyperscalers; NVIDIA; AI-native apps (Cursor, Perplexity, Harvey, ElevenLabs); incumbents adding agents (Salesforce Agentforce, ServiceNow, Microsoft Copilot).
- **Scale [F]:**
  - Anthropic's annualized revenue run rate reached $65B at the end of July 2026, versus roughly $10B of revenue for all of 2025 (S16); preliminary Q2 2026 revenue was more than $11.5B, versus $4.73B in Q1 (S17). ⟨65 · 2026 · USD_B · S16 · estimated · ✓⟩ (run rate, press-reported from an investor update)
  - OpenAI's annualized run rate recently reached $40B, per the same CNBC report (S16). ⟨40 · 2026 · USD_B · S16 · estimated · ✓⟩
  - AI took close to 50% of global venture funding in 2025 (up from 34% in 2024); foundation model companies raised $80B, 40% of AI funding (S23). ⟨202.3 · 2025 · USD_B · S23 · estimated · ✓⟩ AI venture funding (the same outlet's later update puts it at $212B; the Atlas shows the range 202–212).
- **Defining dynamic [I]:** Contested. See §6.10 ("Is AI eating SaaS?") for both sides.
- **Survivors so far [I]:** Microsoft (OpenAI partnership, Azure passed $100B annual revenue in FY2026 (S11)), Google (in-house models and TPUs), Amazon (Bedrock, custom Trainium chips), Oracle (AI capacity contracts), NVIDIA.
- **Casualties so far [A]:** Too early to name with confidence. The February 2026 repricing of information-services and seat-based SaaS stocks (§6.10) is a market *expectation* of casualties, not an observed outcome. The Atlas treats it as such.

### 2.12 Cross-era pattern: who survives a platform shift?

**[A]** Across the ten shifts above, incumbents that survived shared at least one of three traits:

1. **They owned a layer the new platform still needed** (Oracle's database under the web and SaaS; Microsoft's identity and Office file formats under the cloud; Adobe's PDF standard).
2. **They cannibalized themselves before a challenger did** (Microsoft moving Office to subscription; Adobe dropping perpetual licenses in 2013; Salesforce re-pricing for agents in 2025–26).
3. **They bought the challenger at a price that looked expensive at the time** (Microsoft–GitHub, Google–YouTube, Meta–Instagram, Salesforce–Slack, Google–Wiz).

Incumbents died when they tied their product to a hardware platform that lost (minicomputer software, BlackBerry), or when a rival controlled the new distribution point and bundled against them (Lotus, WordPerfect, Netscape).

---

## 3. Market taxonomy (Brief §1.3)

### 3.1 Sizing method and its limits

Sizes below are **order-of-magnitude bands**, not point estimates, unless a verified anchor exists. Bands are `modeled` using this method: *start from the combined revenue of the listed leading vendors in that category (◇ filings), divide by an assumed combined share for those vendors, and round out to a band.* The band is deliberately wide. The data phase will replace a band with a verified analyst press-release figure wherever one can be found and checked.

Bands: **XS** < $5B · **S** $5–20B · **M** $20–60B · **L** $60–150B · **XL** > $150B.

Concentration labels are **[I]** qualitative readings: **High** (one vendor > 40% or HHI likely > 1,800), **Moderate**, **Low** (fragmented, no vendor > 15%).

### 3.2 Anchored sizes (verified)

| Market | Figure | Tag |
|---|---|---|
| All enterprise software | $1,271B (2025), $1,468B (2026F) | ⟨S01 · estimated · ✓⟩ |
| IaaS (Gartner definition) | $222B (2025), $287B (2026F) | ⟨S01 · estimated · ✓⟩ |
| Cloud infrastructure services (Synergy definition: IaaS + PaaS + hosted private cloud) | $143B in Q2 2026; ~$500B trailing 12 months | ⟨S03, S03b · estimated · ✓⟩ |
| AI software (Gartner) | $283B (2025), $452B (2026F) | ⟨S25 · estimated · ✓⟩ |
| AI models (Gartner) | $14.4B (2025), $26.4B (2026F, Jan) | ⟨S25 · estimated · ✓⟩ |

**[A]** The two cloud figures differ by more than 2× for "the same market". Gartner's IaaS excludes PaaS and hosted private cloud; Synergy includes them. Every market in the Atlas therefore records its **definition** alongside its size.

### 3.3 Hierarchy

Level 1 = category · Level 2 = market · Level 3 = segment (selected).

#### Infrastructure

| Market (segments) | Band | Growth [I] | Concentration | Leading players | Dominant pricing | Buyer |
|---|---|---|---|---|---|---|
| Cloud IaaS/PaaS (compute, storage, managed DB, GPU cloud) | XL (anchored) | ~40%+ (S03) | Moderate; top 3 = 63% (S03) | AWS, Microsoft, Google, Oracle, Alibaba, CoreWeave | Usage + committed spend | CIO, platform eng. |
| Operating systems (client, server, mobile) | M | Low | High | Microsoft, Apple, Google (Android), Red Hat, Canonical | OEM license, subscription, free (bundled) | OEM, IT |
| Databases (relational, NoSQL, cloud DW) | L | Mid-teens | Moderate | Oracle, Microsoft, AWS, Google, Snowflake, Databricks, MongoDB | License + support; usage | CIO, data eng. |
| Data platforms & integration (ETL, streaming, catalogs) | M | High | Low→consolidating | Databricks, Snowflake, Informatica (Salesforce), Confluent, Fivetran | Usage / capacity | Data eng. |
| Observability & monitoring | S–M | High | Moderate | Datadog, Splunk (Cisco), Dynatrace, New Relic, Grafana Labs | Usage (hosts, GB ingested) | SRE, platform eng. |
| Security (network, endpoint, identity, cloud) | L | Low-to-mid teens | Low→consolidating | Palo Alto Networks, Microsoft, CrowdStrike, Fortinet, Zscaler, Okta, Wiz (Google) | Subscription per endpoint/user | CISO |
| Networking & CDN software | S | Mid | Moderate | Cloudflare, Akamai, Fastly, Cisco | Usage + subscription | Network/platform eng. |
| Developer tools (IDE, SCM, CI/CD, ALM) | M | High (AI) | Moderate | Microsoft/GitHub, Atlassian, GitLab, JetBrains, Cursor (SpaceX) | Per seat → usage | Developers, eng. leaders |
| AI & model infrastructure (model APIs, inference, MLOps, vector search) | L–XL | Very high | High at model layer | OpenAI, Anthropic, Google, AWS Bedrock, Azure AI, NVIDIA software | Per token / usage | CTO, developers |
| Virtualization & private cloud | S–M | Low/negative | High | VMware (Broadcom), Nutanix, Red Hat OpenShift | Subscription (post-Broadcom) | Infra/IT |

#### Horizontal applications

| Market (segments) | Band | Growth [I] | Concentration | Leading players | Dominant pricing | Buyer |
|---|---|---|---|---|---|---|
| Productivity suites (docs, email, spreadsheets) | L | Mid | High (two vendors) | Microsoft 365, Google Workspace, Zoho | Per seat subscription | CIO, all employees |
| Collaboration (chat, video, knowledge, work mgmt) | M | Mid | Moderate | Microsoft Teams, Slack (Salesforce), Zoom, Atlassian, Notion, Asana, monday.com | Per seat, freemium | Team leads, IT |
| CRM (sales, service, marketing automation) | L | ~10% | Moderate; Salesforce leads | Salesforce, Microsoft Dynamics, Oracle, SAP, HubSpot, Zoho | Per seat → per agent action | CRO, CMO, service leaders |
| ERP (financials, supply chain) | L | High single digit | Moderate | SAP, Oracle (Fusion, NetSuite), Microsoft Dynamics, Infor, Workday | Subscription (cloud), license + maintenance (on-prem) | CFO, CIO |
| HCM & payroll | M | High single digit | Moderate | Workday, SAP SuccessFactors, Oracle, ADP, UKG, Rippling, Deel | Per employee per month | CHRO |
| Finance & spend (AP, expense, FP&A, tax) | M | Low-to-mid teens | Low | Intuit, Coupa, Bill.com, Ramp, Brex, Anaplan, Avalara | Subscription + transaction | CFO, controller |
| IT service management | S–M | Mid-teens | High | ServiceNow, Atlassian (Jira Service Mgmt), BMC, Freshworks | Per agent seat | CIO |
| Analytics & BI | M | Low-to-mid teens | Moderate | Microsoft Power BI, Salesforce Tableau, Google Looker, Qlik | Per seat | CDO, analysts |
| Design & creative | M | Low-to-mid teens | High | Adobe, Figma, Canva, Autodesk | Subscription (individual + team) | Designers, marketers |
| Marketing & ad tech | L | Mid | Low | Adobe, Salesforce, HubSpot, Google, The Trade Desk, Braze | Subscription + % of spend | CMO |

#### Vertical software

| Market | Band | Growth [I] | Concentration | Leading players | Pricing | Buyer |
|---|---|---|---|---|---|---|
| Healthcare IT (EHR, revenue cycle, life-sciences CRM) | M | Mid | High in US EHR | Epic, Oracle Health (Cerner), Veeva, athenahealth | License + subscription | Health-system CIO |
| Financial services software (core banking, trading, insurance) | M | Mid | Moderate | FIS, Fiserv, Temenos, Guidewire, SS&C, nCino | License, per account | Bank CIO/COO |
| Construction & AEC | S | Mid-teens | Moderate | Autodesk, Procore, Trimble, Bentley | Subscription, % of construction volume | GC, owner |
| Legal software & information | S–M | Mid | Moderate | Thomson Reuters, RELX (LexisNexis), Clio, Harvey | Subscription, per seat | GC, law-firm partners |
| Restaurants & hospitality | XS–S | High | Low | Toast, Oracle Hospitality, Lightspeed | SaaS + payments take rate | Owner/operator |
| Auto dealers | XS–S | Low | High | CDK Global, Reynolds & Reynolds, Cox Automotive | Subscription | Dealer principal |
| Government & public sector | S–M | Mid | Low | Tyler Technologies, Palantir, Oracle | License + subscription | Agency CIO |

#### Consumer software

| Market | Band | Growth [I] | Concentration | Leading players | Pricing | Buyer |
|---|---|---|---|---|---|---|
| Social & messaging | XL (ad revenue) | Mid | High | Meta, ByteDance, Snap, X | Advertising | Consumer (user), advertiser (payer) |
| Games (mobile, PC, console software) | XL | Low single digit | Low-moderate | Tencent, Microsoft (Activision), Sony, Nintendo, EA, Roblox | Free-to-play IAP, premium | Consumer |
| Media & streaming (video, music, podcasts) | XL | Mid | Moderate | Netflix, YouTube, Spotify, Disney | Subscription + ads | Consumer |
| Personal productivity & consumer AI assistants | M–L | Very high | High (AI assistants) | ChatGPT, Gemini, Claude, Microsoft Copilot, Notion | Freemium subscription | Consumer, prosumer |

#### Emerging (detailed in §7)

AI coding agents · Agentic enterprise automation · Vertical AI · AI inference clouds · AI security & agent identity · LLM evaluation & observability · Agent interoperability tooling · Usage & outcome billing infrastructure · Voice AI agents · AI data infrastructure · Sovereign cloud & AI · Post-quantum cryptography migration.

---

## 4. Player archetypes (Brief §1.4)

| Archetype | Definition | Examples | Signature advantage | Typical failure mode |
|---|---|---|---|---|
| **Platform giant / ecosystem owner** | Owns a layer others build on and sets its terms | Microsoft, Apple, Google, Amazon | Distribution + ecosystem lock-in | Regulation; missing the next platform (Microsoft on mobile) |
| **Suite vendor / consolidator** | Integrates many adjacent modules under one contract | SAP, Oracle, Salesforce, ServiceNow, Workday | Switching costs, one throat to choke | Integration debt; best-of-breed erosion at the edges |
| **Best-of-breed specialist** | Deepest product in one category | Datadog, CrowdStrike, Figma, Snowflake, Zoom | Product velocity and focus | Envelopment by a suite or platform |
| **Vertical specialist** | Deep domain workflow for one industry | Veeva, Epic, Procore, Toast, Guidewire | Domain data, regulation know-how, embedded payments | Small total addressable market; horizontal entrants |
| **Commercial open source (COSS)** | Monetizes an open project via cloud, support or open core | Red Hat, MongoDB, Elastic, Confluent, HashiCorp, Databricks | Bottom-up adoption, community | Hyperscaler free-riding; forks after license changes |
| **Product-led-growth challenger** | Self-serve adoption, then enterprise expansion | Atlassian, Slack, Zoom, Canva, Notion, Cursor | Low CAC, viral loops | Enterprise features gap; bundling by incumbents |
| **Private-equity roll-up** | Buys mature software, raises prices, cuts costs, bolts on | Thoma Bravo, Vista, Silver Lake portfolios; Constellation Software (serial acquirer) | Cash-flow discipline, pricing power on installed base | Under-investment; customer churn; leverage |
| **Marketplace / aggregator** | Aggregates demand and routes it to suppliers | App Store, Google Play, AWS Marketplace, Shopify App Store | Two-sided network effects | Regulatory limits on take rates (§6.9) |
| **AI-native entrant** | Built around model capabilities from day one | Cursor, Harvey, Perplexity, ElevenLabs, Sierra, Glean | Speed; no legacy pricing to protect | Dependence on model suppliers who may move up the stack |
| **Systems integrator / channel partner** | Implements, customizes and resells | Accenture, Deloitte, Infosys, TCS, Capgemini; VARs | Relationships; certified expertise | Automation of implementation work by AI |

**[I]** The archetypes are roles, not fixed identities: Microsoft is simultaneously a platform giant, suite vendor and (via GitHub) a PLG company. The Atlas assigns each company its *primary* archetype for color coding and records secondary ones in its profile.

**[A]** Two archetype flows matter most for the story: best-of-breed → acquired by suite (Slack → Salesforce, Wiz → Google, Informatica → Salesforce), and COSS → license change → fork (Elastic, HashiCorp, Redis; §6.7).

---

## 5. Size and economics (Brief §1.5)

### 5.1 Metric definitions

| Metric | Definition | Why it matters |
|---|---|---|
| **Revenue** | GAAP revenue for the fiscal year | Comparable across filings; lags ARR for subscription firms |
| **ARR** | Annualized value of active recurring contracts | Leading indicator for subscription businesses; *not* GAAP. "Run rate" (latest month × 12) is a looser cousin used by AI companies |
| **Gross margin** | (Revenue − cost of revenue) ÷ revenue | Software's structural advantage; AI inference costs pressure it |
| **Net revenue retention (NRR)** | Revenue this year from last year's customers ÷ their revenue last year | > 100% means the base grows without new logos |
| **CAC payback** | Sales & marketing cost to acquire a customer ÷ monthly gross profit per customer | Efficiency of growth; PLG targets short paybacks |
| **Rule of 40** | Revenue growth % + free-cash-flow margin % | Balance of growth and profitability; ≥ 40 is considered healthy |
| **EV/Revenue** | Enterprise value ÷ (forward or trailing) revenue | Market's price for a dollar of revenue; compresses when durability is doubted |
| **Market share** | Vendor revenue in a defined market ÷ market size | Only as good as the market definition |
| **HHI** | Σ (market share in % points)² across all firms | Concentration index, 0–10,000. US 2023 Merger Guidelines treat markets above 1,800 as highly concentrated (B09) |

### 5.2 Worked examples using verified figures

- **Gross margin — Adobe FY2025 (modeled from reported):** revenue $23.77B (sum of geographic revenue in the 10-K), cost of revenue $2.55B (S14) → gross margin ≈ **89.3%**. ⟨89.3 · 2025 · percent · S14 · modeled · ✓⟩ *Method: 1 − 2.55 ÷ 23.77.*
- **Subscription share — Adobe:** subscription revenue was 96% of total in FY2025, up from 94% in FY2023 (S14). ⟨96 · 2025 · percent · S14 · reported · ✓⟩
- **Rule of 40 — Atlassian FY2026 (modeled from reported):** revenue growth 26%, free-cash-flow margin 20% (S15) → **46**. ⟨46 · 2026 · count · S15 · modeled · ✓⟩
- **Segment operating margin — AWS 2025:** Q4 2025 AWS operating income was $12.5B on $35.6B of sales (S09) → ~**35%** for the quarter. ⟨35.1 · 2025 · percent · S09 · modeled · ✓⟩
- **Backlog as a leading indicator — Oracle FY2026:** remaining performance obligations of $638B, up 363% year-on-year, against FY2026 revenue of just over $67B (S13). ⟨638 · 2026 · USD_B · S13 · reported · ✓⟩ **[A]** A backlog nearly 10× annual revenue is unprecedented for Oracle and concentrated in a few AI customers; it is both the strongest growth signal and the largest counterparty risk in the dataset.

### 5.3 HHI worked example: cloud infrastructure (modeled)

Synergy publishes shares for the top vendors each quarter. Treating unreported vendors as a fragmented tail (each < 3%) gives a lower-bound HHI from the named vendors plus an allowance for the tail (method: Σ named shares² + tail allowance of 50–150 points).

| Quarter | Named shares (Synergy) | Σ named² | HHI range (modeled) | Top-3 share |
|---|---|---|---|---|
| Q2 2017 | AWS 34, Microsoft 11, IBM 8, Google 5 (S04) | 1,366 | 1,420–1,520 | 50% |
| Q2 2019 | AWS 33, Microsoft 16, Google 8, IBM 6, Alibaba 5 (S05) | 1,470 | 1,520–1,620 | 57% |
| Q2 2021 | AWS 33, Microsoft 20, Google 10, Alibaba 6 (S06) | 1,625 | 1,680–1,780 | 63% |
| Q2 2026 | AWS 28, Microsoft 20, Google 15 (S03) | 1,409 | 1,460–1,560 | 63% (S03 reports 67% for top 3 on the full definition) |

**[A] Insight for the Atlas:** Concentration measured by *top-3 share* rose from 50% to 63–67% while concentration measured by *HHI* peaked around 2021 and then fell. The two metrics diverge because the leader (AWS) lost share to #2 and #3. The market became more oligopolistic but less dominated by one firm. The share-over-time chart overlays both lines to make this visible.

**Caveat:** the Q2 2026 top-3 figure is reported as 67% in Synergy-derived coverage (S03b) versus 63% from summing rounded shares; the Atlas displays the published figure and footnotes the rounding gap.

### 5.4 Why software economics produce winner-take-most outcomes

1. **Near-zero marginal cost [I].** Once built, an extra license costs almost nothing to deliver. Gross margins of 75–90% (Adobe ~89%, Atlassian non-GAAP ~88% guidance (S15b)) leave most incremental revenue available for R&D and distribution, which compounds the leader's advantage.
2. **Recurring revenue [I].** Subscriptions with NRR above 100% grow even without new customers, and investors capitalize that durability at high multiples, giving leaders cheaper capital for acquisitions.
3. **Increasing returns to adoption [I].** Network effects (marketplaces, collaboration), data effects and ecosystem effects (developers, integrators, certified admins) make the most-adopted product more valuable.
4. **High switching costs [I].** Data migration, retraining and re-integration costs protect installed bases for decades (ERP, databases, EHR).

**[A] Counterforces** that keep software from being purely winner-take-all: definitional fragmentation (every niche is its own market), platform shifts that reset the board roughly once a decade, open source commoditizing layers, and antitrust. **[A] New in the AI era:** inference is a real marginal cost. OpenAI's 2025 financials, as reported in press coverage of leaked documents, show an operating loss larger than revenue (S16b, `estimated`, single secondary source). If AI features raise cost of revenue, software's structural margin advantage narrows — a thesis the Atlas tracks rather than asserts.

---

## 6. How players compete: dynamics and frameworks (Brief §1.6)

### 6.1 Moats (Hamilton Helmer's *7 Powers*, B04)

Helmer names seven sources of durable advantage: **scale economies, network economies, counter-positioning, switching costs, branding, cornered resource, process power**. The Atlas's moat radar uses a software-adapted set of seven axes defined in the brief (network, switching, scale, data, brand, ecosystem, regulatory). Mapping: Helmer's *cornered resource* ≈ data and regulatory; *counter-positioning* is scored in the case studies rather than as a static axis because it describes a moment, not a state.

| Moat | Case 1 | Case 2 |
|---|---|---|
| Network effects | Microsoft Office file formats and Excel skills: every new user raised the value of compatibility (Era 3) | App stores: more users attract more developers and vice versa (Era 9) |
| Switching costs | SAP/Oracle ERP: multi-year implementations make replacement rare (Era 4) | Salesforce: customizations, Apex code and certified admins |
| Economies of scale | AWS: capex scale lowers unit cost; FY2025 segment sales $128.7B ◇ | NVIDIA CUDA + hyperscaler GPU fleets for AI training |
| Data advantages | Google Search query logs | Epic and Veeva: longitudinal industry datasets |
| Brand | Adobe in creative professions | Apple in consumer platforms |
| Ecosystem / marketplace | Salesforce AppExchange | Atlassian Marketplace; Shopify apps |
| Regulatory capture / compliance | FedRAMP authorizations for US government cloud | Healthcare certification (EHR incentive programs favored certified incumbents) |

**Counter-positioning cases [I]:** Salesforce vs Siebel (a subscription model that Siebel could not copy without destroying its license revenue); Adobe itself used counter-positioning against its own license base in 2013.

### 6.2 Bundling vs unbundling

**[F/I] Microsoft Office (1990s).** The suite was priced below the sum of standalone Word, Excel and PowerPoint, and bundled with PCs. Standalone leaders (WordPerfect, Lotus 1-2-3) lost share within a few years.

**[F] Teams vs Slack.** Microsoft launched Teams in March 2017 and included it in Office 365 suites. Slack filed an EU complaint in 2020; the European Commission opened a formal investigation in July 2023 and on 12 September 2025 accepted binding commitments for Microsoft to sell suites without Teams at a lower price, allow long-term licensees to switch, and provide interoperability and data portability (seven years, ten for interoperability/portability) (S26). **[I]** The case is the modern textbook example of bundling as a competitive weapon and of competition law as the counterweight; Slack sold to Salesforce for ~$27.7B in 2021 ◇ rather than continue independently.

**[I] Craigslist unbundled.** Successive startups each took one Craigslist category (Airbnb: rooms; Indeed: jobs; Zillow: housing; Tinder: personals) and built a vertical product with better UX, trust and payments. Andrew Parrish's 2010 visualization popularized this reading.

**[F/I] Salesforce re-bundling.** Salesforce assembled a suite through acquisitions — MuleSoft (2018), Tableau (2019), Slack (2021), Informatica (closed 2025) — and in FY2026 reported Agentforce plus Data 360 ARR of $2.9B, including $1.1B of Informatica Cloud ARR (S12). **[A]** The suite pitch shifted from "one CRM" to "one data layer for agents".

**[I] Pattern** (often attributed to Jim Barksdale: "there are only two ways to make money: bundling and unbundling"): unbundling happens when a bundle's weakest components underserve a segment; re-bundling happens when integration cost, not feature depth, becomes the buyer's main pain.

### 6.3 Platform envelopment

**[I]** Eisenmann, Parker and Van Alstyne (B07) define envelopment as a platform provider entering an adjacent market by bundling its functionality with the platform and exploiting shared users.
- **Case: Internet Explorer / Windows (1995–2001)** — browser absorbed into the OS (B06).
- **Case: Microsoft Teams / Microsoft 365 (2017–2025)** — collaboration absorbed into productivity (S26).
- **Case: Security into cloud platforms** — Microsoft's security business and Google's $32B Wiz acquisition (closed 11 March 2026; cleared unconditionally by the US and EU) (S20) show cloud platforms enveloping cloud security.
- **Live case [A]:** foundation-model labs shipping agent products (e.g., Claude Cowork plugins for legal, sales and finance, January 2026) are enveloping application categories built on their own APIs (S18).

### 6.4 Disruption theory (Christensen, B05)

**Low-end disruption:** an entrant serves overserved customers with a cheaper, "good enough" product and moves upmarket. **New-market disruption:** an entrant serves non-consumers.

Where it applied **[I]:**
- **Salesforce vs Siebel** — SaaS CRM started with small sales teams that could not afford Siebel implementations, then moved upmarket.
- **AWS vs enterprise hardware and hosting** — started with startups (non-consumers of enterprise IT), then won enterprises.
- **Canva vs Adobe (partially)** — new-market disruption for non-designers.

Where it failed to predict **[I]:**
- **iPhone (2007)** — Christensen predicted in 2007 that the iPhone would not succeed because it was a sustaining innovation from outsiders; it entered at the high end and won.
- **Microsoft cloud** — theory predicted incumbents would fail at a business-model disruption; Microsoft transitioned successfully (Case 2).
- **Adobe** — theory predicted new-model entrants would win; the incumbent self-disrupted first (Case 5).

**[A]** Disruption theory predicts well when the incumbent's profit model makes response irrational, and poorly when incumbents own a complementary asset (identity, file formats, distribution) that lets them absorb the new model.

### 6.5 Business-model shifts

`perpetual license + maintenance → subscription (SaaS) → usage-based → outcome/agent-based`

| Shift | Cases | Evidence |
|---|---|---|
| License → subscription | Adobe (2013), Microsoft Office 365 (2011 onward), Autodesk (2016) | Adobe subscription revenue 96% of total in FY2025 (S14) |
| Subscription → usage | AWS (2006), Snowflake, Twilio, Datadog; AI APIs per token | Oracle OCI consumption growth; AI run-rate reporting (S13, S16) |
| Seat → agent/outcome | Salesforce Agentforce (per conversation/action, then flat enterprise agreements); per-resolution pricing in AI customer service | Agentforce ARR $800M, +169% YoY in Q4 FY2026 (S12) |

**[I] Open question:** whether agent pricing *adds* to seat revenue or *replaces* it. Salesforce reported that more than 60% of Agentforce and Data 360 bookings came from existing customers expanding (S12) — evidence for "adds"; the February 2026 selloff (§6.10) priced in "replaces".

### 6.6 Go-to-market shifts

`field sales → inside sales → product-led growth → community / open source → agent-mediated (?)`

- **Field sales:** Oracle and SAP in the 1990s — high-ACV deals with SI partners.
- **Inside sales:** Salesforce and HubSpot in the 2000s–10s — phone/web sales to mid-market.
- **Product-led growth:** Atlassian — historically sold with little traditional enterprise sales force, relying on self-serve adoption and partners (Case 6); Slack and Zoom as bottom-up adoption.
- **Community/open source:** MongoDB, HashiCorp, Databricks — developers adopt the open project, enterprises buy the managed/enterprise edition.
- **[A] Emerging:** AI agents choosing tools via protocols (e.g., Model Context Protocol) may make "being callable by agents" a distribution channel, the way SEO made "being findable by Google" one.

### 6.7 Open source as a competitive weapon — and license changes

**Weapon cases [I]:**
- **Google open-sourcing Kubernetes (2014)** commoditized container orchestration, reducing AWS's proprietary lock-in and helping Google Cloud compete.
- **Meta releasing Llama weights (2023 onward)** commoditized a layer competitors monetize (frontier model APIs).

**License-change cases [F]:**

| Company | Change | Year | Response |
|---|---|---|---|
| Elastic | Apache 2.0 → SSPL / Elastic License (Elasticsearch, Kibana) | 2021 | AWS forked as OpenSearch; Elastic later added AGPL as an option (2024) |
| HashiCorp | MPL → Business Source License (Terraform and others) | 2023 | OpenTofu fork under the Linux Foundation; IBM acquired HashiCorp (closed February 2025, $6.4B enterprise value ✓) |
| Redis | BSD → RSALv2 / SSPL | 2024 | Valkey fork under the Linux Foundation, backed by AWS, Google and others; Redis added AGPLv3 in 2025 |

**[I]** License changes defend against hyperscaler free-riding but reliably trigger a foundation-backed fork within weeks. **[A]** Two of three companies later moved partially back toward OSI-approved licenses, suggesting the fork threat caps how restrictive a COSS company can become.

### 6.8 M&A and consolidation waves

| Wave | Period | Representative deals (◇ unless noted) |
|---|---|---|
| Enterprise app consolidation | 2003–2010 | Oracle–PeopleSoft ($10.3B, closed Jan 2005 ✓), Oracle–Siebel ($5.85B, announced Sep 2005, closed 2006 ✓), Oracle–BEA ($8.5B, closed 29 Apr 2008 ✓), Oracle–Sun ($7.4B, closed 27 Jan 2010 ✓), SAP–Business Objects ($6.8B / €4.8B, closed 2008 ✓) |
| SaaS roll-up by incumbents | 2011–2019 | SAP–SuccessFactors ($3.4B, closed Feb 2012 ✓), Oracle–NetSuite ($9.3B, closed Nov 2016 ✓), Microsoft–LinkedIn ($26.2B, closed Dec 2016 ✓), Salesforce–Tableau ($15.7B enterprise value, 2019 ✓), IBM–Red Hat ($34B, closed 9 Jul 2019 ✓) |
| Pandemic-era platform deals | 2020–2023 | Salesforce–Slack ($27.7B, closed 21 Jul 2021 ✓), Microsoft–Nuance ($19.7B, closed 4 Mar 2022 ✓), Oracle–Cerner ($28.3B equity value, closed 8 Jun 2022 ✓), Broadcom–VMware (~$69B = ~$61B cash and stock plus ~$8B assumed debt, closed 22 Nov 2023 ✓), Microsoft–Activision Blizzard ($68.7B, closed 13 Oct 2023 ✓); Adobe–Figma abandoned (Adobe paid a $1B termination fee, S14 ✓) |
| Security & data consolidation | 2024–2026 | Cisco–Splunk ($28B, closed 18 Mar 2024 ✓), IBM–HashiCorp ($6.4B enterprise value, closed Feb 2025 ✓), Synopsys–Ansys ($35B, closed 17 Jul 2025 ✓), Salesforce–Informatica (2025, S12 ✓), Google–Wiz ($32B, closed March 2026, S20 ✓) |
| AI-era talent and product deals | 2024–2026 | SpaceX–Anysphere/Cursor ($60B all-stock, announced 16 June 2026, expected close Q3 2026, S21 ✓) |
| PE take-privates | 2018–2026 | Thoma Bravo, Vista, Silver Lake and others acquiring mature public SaaS companies (e.g., Qualtrics, Anaplan, Coupa, Zendesk, 2022–23) |

**[F]** Crunchbase called Wiz the largest venture-backed acquisition on record in 2025 (S22); the Cursor deal is larger by headline value (S21). **[A]** Both deals were priced as capability acquisitions by platforms (cloud security; AI coding) rather than as revenue multiples — the Cursor price was ~23× the ~$2.6B of annualized B2B revenue cited by Reuters (S21), modeled.

### 6.9 Regulation and antitrust

| Case | Year | Outcome | Market effect [I] |
|---|---|---|---|
| US v. IBM (filed 1969) | 1969–1982 | Dropped in 1982 | Pressure contributed to unbundling (Era 1) |
| US v. Microsoft | 1998–2002 | Liability for monopoly maintenance upheld in part; conduct remedies (B06) | Constrained Microsoft's later bundling; widely credited with leaving room for Google and Firefox |
| EU Microsoft (Windows Media Player, interoperability) | 2004 | Fine and unbundled Windows edition | Low uptake of the unbundled edition — an early lesson in remedy design |
| EU Digital Markets Act | Obligations applied from 2024 | Gatekeeper rules on app stores, self-preferencing, interoperability | Alternative app stores and payment options in the EU |
| Epic v. Apple (US) | 2021–2025 | Anti-steering injunction; 2025 contempt finding restricted commissions on link-outs | Direct-to-consumer web payments for iOS apps in the US |
| EU Teams commitments | 2025 | Binding commitments to unbundle Teams (S26) | Test of whether unbundling restores competition a decade after tying |

**[A]** Regulation tends to arrive 5–10 years after the platform lock-in it targets, which is why the Atlas marks regulatory events as *lagging* indicators of concentration.

### 6.10 Is AI eating SaaS? (contested)

**[F]** Anthropic launched Claude Cowork in January 2026 and released plug-ins for legal, sales, marketing and data-analysis tasks at the end of that month. On 3 February 2026, Thomson Reuters fell nearly 18% — on track for its largest daily loss on record — while RELX, Wolters Kluwer and London Stock Exchange Group also dropped sharply (S18, S27). Bloomberg-cited estimates put losses across software, financial-services and asset-management stocks at roughly $285B (S18b, `estimated`).

**Bear case for SaaS [I]:** agents do work without needing a licensed human seat, so seat-based revenue compresses; foundation-model labs move up the stack into applications; customers build more in-house with AI coding tools; information-services moats weaken when models can reason over public and customer data.

**Bull case for SaaS [I]:** reported results through mid-2026 show continued growth at large SaaS vendors — Salesforce FY2026 revenue $41.5B, +10% (S12); Atlassian FY2026 revenue $6.57B, +26% (S15); Gartner raised its 2026 software forecast to +15.5% (S01). Systems of record, permissions, audit trails and distribution remain with incumbents, and agents need data and workflow context that incumbents hold. Gartner expects AI to be sold mostly by incumbent software providers in 2026 (S25).

**[A] Atlas position:** As of September 2026 the evidence shows *valuation* compression and *pricing-model* change, not *revenue* collapse. The distinguishing signals to watch are seat counts disclosed in filings, net revenue retention, and the share of new bookings priced on usage or outcomes.

### 6.11 Commoditization: where value moved

| Layer commoditized | By | Value moved to |
|---|---|---|
| Operating systems (servers) | Linux | Cloud providers and application layers |
| Web servers, app servers | Apache, open-source Java | SaaS applications |
| Storage and compute | Hyperscaler scale | Managed data platforms (Snowflake, Databricks) and cloud margins |
| Container orchestration | Kubernetes | Managed platforms and observability |
| Model inference at a fixed capability level | Price declines of ~9× to 900× per year depending on task (median ~40×–50×), per Epoch AI (S24) | Frontier models, AI-native applications, and GPU/infrastructure owners |

**[I]** Clayton Christensen's "law of conservation of attractive profits" (B05, *The Innovator's Solution*) holds that when one layer commoditizes, profits migrate to an adjacent layer. **[A]** The fastest commoditization curve in software history (inference prices) coexists with the fastest revenue growth (model labs). Both are true because demand for frontier capability grows faster than the price of last year's capability falls.

---

## 7. Where new markets emerge (Brief §1.7)

### 7.1 Framework: six signal types

| Signal | What to look for | Historical example |
|---|---|---|
| **Platform shift → white space** | A new layer creates categories that did not exist on the old one | Mobile created app analytics, mobile ads, ride-hailing |
| **Cost-curve collapse** | A key input falls ≥ 10× in price | Cloud storage enabled consumer photo backup; inference price declines of ~9–900× per year (S24) make per-task AI economic |
| **New data source or interface** | A new sensor, dataset or interaction mode | Smartphone GPS → location services; LLMs → natural-language interfaces to software |
| **Regulatory change** | New obligation creates compliance demand | GDPR (2018) → privacy/consent management; NIST post-quantum standards (2024) → PQC migration |
| **Unbundling of a bloated incumbent** | Users pay for a suite but need one job done well | Craigslist verticals; Teams-free Microsoft 365 SKUs in the EU (S26) |
| **Leading indicators** | Capital, developer and hiring flows | VC concentration (AI ~50% of global VC in 2025, S23); GitHub star velocity; job postings; developer surveys |

**Scoring used in the Atlas [A]:** each emerging market records up to six signals with a strength of 1 (weak/anecdotal), 2 (multiple independent sources) or 3 (verified financial or regulatory evidence). The radar dot size is the sum of strengths. Stage uses the brief's scale; horizon is the author's estimate of when the category has at least one independent vendor with more than $1B of revenue.

### 7.2 Twelve emerging markets (applied framework)

#### 7.2.1 AI coding agents — **scaling · 0–2y**
- **Thesis [A]:** Software creation is the first knowledge-work category where AI agents are purchased at enterprise scale, because output is verifiable (tests pass or fail) and developers adopt tools bottom-up.
- **Evidence:** SpaceX agreed to acquire Cursor's parent Anysphere for $60B in stock; Reuters cited ~$2.6B of annualized B2B revenue (S21) — strength 3. Cursor's most recent venture round (November 2025) valued it at $29.3B, versus $2.5B at the start of 2025 (S21) — strength 3. Microsoft had examined a bid before SpaceX's option (S21) — strength 2.
- **Players:** Cursor (SpaceX), GitHub Copilot (Microsoft), Claude Code (Anthropic), Codex (OpenAI), Google, Replit, Cognition.
- **Risks:** Model labs vertically integrate and bundle coding agents into subscriptions; per-seat pricing gives way to usage pricing with lower gross margins; developer tool switching costs are low.

#### 7.2.2 Agentic enterprise automation — **emerging · 2–5y**
- **Thesis [I]:** Incumbent suites are the first large sellers of agents because they own permissions, data and workflow context.
- **Evidence:** Salesforce Agentforce ARR $800M (+169%), 29,000 deals closed since launch (S12) — strength 3. Microsoft 365 Copilot passed 30 million paid seats in FY2026 (S11b) — strength 3. Gartner expects AI to be sold mostly by incumbent software providers during 2026 (S25) — strength 2.
- **Players:** Salesforce, Microsoft, ServiceNow, Workday, SAP, UiPath; AI-native: Sierra, Glean, Decagon.
- **Risks:** ROI proof (Gartner places GenAI in the "trough of disillusionment" in 2026, S25); cannibalization of seat revenue; model labs' own agent products.

#### 7.2.3 Vertical AI (legal, healthcare documentation, financial analysis) — **emerging · 0–2y**
- **Thesis [A]:** Regulated, text-heavy verticals with high labor costs are the most valuable AI application markets, but general-purpose agents with vertical plug-ins now compete directly with vertical specialists.
- **Evidence:** Markets priced the threat on 3 February 2026 — Thomson Reuters −18%, RELX −14%, Wolters Kluwer −13% after Anthropic's legal plug-in (S18, S27) — strength 3 (as evidence of investor expectation, not of revenue shift).
- **Players:** Harvey, Abridge, Hebbia, EvenUp (AI-native); Thomson Reuters CoCounsel, LexisNexis, Epic (incumbents).
- **Risks:** Horizontal envelopment; liability and accuracy requirements; incumbents' proprietary content remains a moat.

#### 7.2.4 AI inference clouds ("neoclouds") — **scaling · 0–2y**
- **Thesis [I]:** GPU capacity became its own infrastructure market, partly outside the big three.
- **Evidence:** Synergy lists a "tier two" of high-growth providers — CoreWeave, OpenAI, Oracle, Crusoe, Nebius, Anthropic, Nscale — and reports AI-specific cloud services growing 165% year-on-year (S03b) — strength 3. Oracle OCI revenue +77% in FY2026 with $638B of RPO (S13) — strength 3.
- **Players:** CoreWeave, Oracle, Nebius, Crusoe, Lambda, Nscale; hyperscalers.
- **Risks:** Customer concentration; GPU depreciation schedules; power availability; hyperscaler price competition.

#### 7.2.5 AI security and agent identity — **emerging · 2–5y**
- **Thesis [A]:** Every agent is a new non-human identity with permissions; securing prompts, tools and model supply chains becomes a budget line.
- **Evidence:** Gartner forecasts AI cybersecurity spending at $25.9B (2025) → $51.3B (2026) (S25) — strength 3. Google's $32B Wiz acquisition explicitly cites AI security (S20) — strength 2.
- **Players:** Palo Alto Networks, CrowdStrike, Microsoft, Google (Wiz), Okta, Zscaler; startups in AI red-teaming and agent identity.
- **Risks:** Absorbed into existing security platforms (envelopment); category definitions still unsettled.

#### 7.2.6 LLM evaluation and observability — **consolidating · 0–2y**
- **Thesis [I]:** Teams shipping AI need test suites, tracing and cost monitoring; the category is being absorbed by observability and model platforms.
- **Evidence:** Existing observability vendors (Datadog, Grafana) added LLM tracing; model platforms bundle evals — strength 1 (qualitative, awaiting verified revenue data).
- **Players:** Datadog, Arize, Braintrust, LangChain (LangSmith), Weights & Biases (CoreWeave), model providers' built-in evals.
- **Risks:** Feature, not a product; bundled free by platforms.

#### 7.2.7 Agent interoperability tooling (protocols, connectors, registries) — **emerging · 2–5y**
- **Thesis [A]:** When agents choose tools, the connector layer becomes a distribution channel, analogous to app stores for mobile.
- **Evidence:** The Model Context Protocol, introduced by Anthropic in November 2024, was adopted by other major labs and platforms during 2025 and moved to open governance under the Linux Foundation — strength 2 (◇; exact dates to verify in data phase).
- **Players:** Protocol stewards and adopters (Anthropic, OpenAI, Google, Microsoft), integration platforms (Zapier, MuleSoft, Workato), connector marketplaces.
- **Risks:** Protocols are free, so value accrues elsewhere; security of tool-calling; competing standards.

#### 7.2.8 Usage and outcome billing infrastructure — **emerging · 2–5y**
- **Thesis [I]:** Moving from seats to tokens, actions and outcomes requires metering, rating and revenue-recognition systems that seat-era billing lacks.
- **Evidence:** Seat-to-agent pricing shift at Salesforce (S12) and industry-wide repricing debate (S18) — strength 2.
- **Players:** Stripe Billing, Metronome, Orb, Chargebee, Zuora; cloud marketplaces.
- **Risks:** Built in-house by large vendors; absorbed into payments platforms.

#### 7.2.9 Voice AI agents — **scaling · 0–2y**
- **Thesis [A]:** Real-time speech models plus falling inference prices make phone-based customer service automatable at a cost below offshore labor.
- **Evidence:** Inference price declines (S24) — strength 2; rapid funding of voice-AI companies — strength 1 (to be quantified from Crunchbase in the data phase).
- **Players:** ElevenLabs, Sierra, Decagon, PolyAI, Deepgram; contact-center incumbents (Genesys, NICE, Five9).
- **Risks:** Consumer acceptance; regulation of AI disclosure in calls; incumbents' installed base.

#### 7.2.10 AI data infrastructure (retrieval, unstructured data, governance) — **consolidating · 0–2y**
- **Thesis [I]:** Standalone vector databases were absorbed as features of general databases and data platforms; value moved to governed data layers.
- **Evidence:** Salesforce's Informatica acquisition and Data 360 ARR (S12) — strength 3; vector search added to mainstream databases (PostgreSQL pgvector, MongoDB, Oracle) — strength 2.
- **Players:** Databricks, Snowflake, Salesforce/Informatica, Oracle, MongoDB, Pinecone, Elastic.
- **Risks:** Commoditization; hyperscaler bundling.

#### 7.2.11 Sovereign cloud and AI — **emerging · 2–5y**
- **Thesis [I]:** Governments and regulated industries want infrastructure under local legal control, creating demand for in-region operators and sovereign editions of hyperscaler clouds.
- **Evidence:** Nscale and other regional providers appear among Synergy's high-growth tier two (S03b) — strength 2; EU digital regulation (DMA, S26 context) — strength 1.
- **Players:** Hyperscalers' sovereign offerings, Nscale, Mistral, OVHcloud, national telcos.
- **Risks:** Hyperscaler partnerships capture most of the demand; higher costs than global regions.

#### 7.2.12 Post-quantum cryptography migration — **nascent · 5y+**
- **Thesis [I]:** Standardized post-quantum algorithms create a long, compliance-driven migration of every TLS stack, HSM and PKI.
- **Evidence:** NIST finalized its first post-quantum standards (FIPS 203, 204, 205) in August 2024 — strength 3 (◇, to re-verify).
- **Players:** Cloudflare, Google, Microsoft, Thales, Entrust, PQShield, SandboxAQ.
- **Risks:** Long timelines; mostly absorbed as a feature of existing security products.

---

## 8. Case studies (Brief §1.8)

Timelines use ✓/◇ markers only for numbers; dated events are **[F]** unless marked.

### Case 1 — Oracle and the database market

| Year | Event |
|---|---|
| 1977 | Founded as Software Development Laboratories |
| 1979 | Ships Oracle V2, an early commercial SQL relational database |
| 1986 | IPO |
| 1990–91 | Revenue-recognition problems and first loss; near-death experience |
| 2005–2010 | Acquires PeopleSoft, Siebel, BEA, Sun |
| 2016 | Acquires NetSuite |
| 2022 | Acquires Cerner ($28.3B ◇) |
| FY2026 | Revenue just over $67B; OCI $18.1B (+77%); RPO $638B (+363%) (S13 ✓) |

**Key decisions:** write the database in portable C and sell across hardware platforms; buy applications to lock in the database; arrive late to cloud, then compete on price-performance for GPU clusters and database workloads.
**Lessons [A]:** a switching-cost moat buys time to miss a platform shift — Oracle was a decade late to cloud and survived. The same backlog that signals success (RPO $638B) concentrates risk in a few AI customers, and FY2026 free cash flow was reported as negative (S13b, `reported` via secondary).

### Case 2 — Microsoft's cloud pivot

| Year | Event |
|---|---|
| 2008 | Windows Azure announced |
| 2010 | Azure generally available |
| 2011 | Office 365 launched |
| 2014 | Satya Nadella becomes CEO; FY2014 revenue $86.8B ◇ |
| 2018 | Acquires GitHub |
| 2019 | First OpenAI investment |
| 2023 | Microsoft 365 Copilot |
| FY2026 | Revenue $331.8B (+18%); Azure revenue passes $100B (+41%); Microsoft Cloud revenue above $214B (+27%) (S11 ✓, S11b ✓) |

**Key decisions:** subordinate Windows to Azure and cross-platform Office; move Office to subscription; adopt open source; bet early on a third-party model lab.
**Lessons [A]:** the pivot succeeded because Microsoft owned complements that carried over — enterprise identity (Active Directory), Office file formats and relationships with every CIO. Counter to naive disruption theory, the incumbent captured the new model.

### Case 3 — Salesforce and the rise of SaaS

| Year | Event |
|---|---|
| 1999 | Founded; multi-tenant CRM |
| 2004 | IPO |
| 2005–2008 | AppExchange and Force.com platform |
| 2018–2021 | MuleSoft, Tableau, Slack acquisitions |
| 2024–2025 | Agentforce launch; Informatica acquisition |
| FY2026 | Revenue $41.5B (+10%); Agentforce ARR $800M; RPO $72.4B (S12 ✓) |

**Key decisions:** counter-position against licensed CRM; build a platform and marketplace on top of the application; grow by acquisition once organic growth slowed.
**Lessons [A]:** the SaaS pioneer now faces the same counter-positioning it used against Siebel — agent pricing that can undercut seats. Its response (sell agents to existing customers, bundle the data layer) is the classic incumbent playbook from Case 2.

### Case 4 — AWS creating cloud infrastructure

| Year | Event |
|---|---|
| 2006 | S3 (March) and EC2 (August) launch |
| 2015 | Amazon first discloses AWS as a segment; revenue $7.9B ◇ |
| 2021 | Revenue $62.2B ◇ |
| 2025 | Revenue $128.7B ◇; Q4 2025 AWS sales $35.6B (+24%), operating income $12.5B (S09 ✓) |
| Q2 2026 | Cloud infrastructure market share 28%, still #1 (S03 ✓) |

**Key decisions:** sell internal infrastructure primitives to outsiders; price as a utility; cut prices repeatedly to expand demand.
**Lessons [A]:** new-market disruption at its purest — startups were non-consumers of enterprise IT. AWS's share decline from ~33–34% to 28% (§5.3) shows that first-mover scale did not prevent platform giants with enterprise relationships (Microsoft) from catching up in a growing market.

### Case 5 — Adobe's move to subscription

| Year | Event |
|---|---|
| 2012 | Creative Cloud launched alongside perpetual Creative Suite 6 |
| 2013 | Perpetual Creative Suite discontinued; revenue dips to ~$4.06B from ~$4.40B ◇ |
| 2022–2023 | Announces and then abandons Figma acquisition; pays $1B termination fee (S14 ✓) |
| FY2025 | Revenue $23.77B (modeled sum of reported geographic revenue, S14 ✓); subscription 96% of revenue; ARR $25.2B (S14 ✓) |

**Key decisions:** accept a revenue dip to move the whole base to subscription; use the cloud relationship to add document (Acrobat) and marketing businesses.
**Lessons [A]:** self-disruption worked because Adobe had brand and skills lock-in among professionals. The failed Figma deal and generative-image entrants show its exposure moved from pricing model to product category.

### Case 6 — Atlassian and product-led growth

| Year | Event |
|---|---|
| 2002 | Founded in Sydney; Jira launched |
| 2015 | IPO |
| 2020–2024 | Announces end of Server products; moves customers to Cloud (Server support ended February 2024) |
| FY2026 | Revenue $6.57B (+26%); subscription ARR $6.61B; non-GAAP operating margin 30%; FCF margin 20% (S15 ✓) |

**Key decisions:** low price points and self-serve purchase instead of a large field sales force; marketplace for extensions; force migration from self-hosted to cloud.
**Lessons [A]:** PLG creates efficient distribution, but enterprise scale eventually requires enterprise sales — Atlassian now reports growth driven by larger, longer-term commitments (S15c). Its FY2026 growth is a data point against the claim that AI is already shrinking seat-based SaaS.

### Case 7 — Slack vs Teams

| Year | Event |
|---|---|
| 2013–2014 | Slack launches; rapid bottom-up adoption |
| 2017 | Microsoft launches Teams inside Office 365 |
| 2019 | Slack direct listing |
| 2020 | Slack files EU complaint over Teams tying |
| 2021 | Salesforce acquires Slack (~$27.7B ◇) |
| 2023 | EU opens formal investigation (July) |
| 2025 | EU accepts binding commitments: Teams-free suites at lower price, switching rights, interoperability and data portability (S26 ✓) |

**Key decisions:** Slack competed on product and developer ecosystem; Microsoft competed on distribution and price-of-zero in the bundle.
**Lessons [I/A]:** best-of-breed rarely beats bundled distribution alone; Slack's outcome was a sale to a rival suite. Regulatory remedies arrived eight years after the bundle — the Atlas will test whether they change share.

### Case 8 — The foundation-model race

| Date | Event |
|---|---|
| 2017 | Transformer architecture published |
| Nov 2022 | ChatGPT launch |
| 2023–2025 | GPT-4, Claude, Gemini, Llama, DeepSeek; reasoning models |
| 2025 | AI takes ~50% of global VC; foundation model companies raise $80B (S23 ✓) |
| Jan 2026 | Claude Cowork launches; late-January plug-ins trigger early-February software selloff (S18 ✓) |
| Feb 2026 | xAI merges with SpaceX (S21 ✓) |
| Jun 2026 | SpaceX agrees to acquire Cursor for $60B (S21 ✓) |
| Jul–Aug 2026 | Anthropic run rate $65B (end of July) vs OpenAI $40B, per CNBC (S16 ✓) |

**Key decisions:** labs chose different go-to-market emphases — consumer subscriptions versus enterprise API and coding — and different distribution partners among hyperscalers.
**Lessons [A]:** (1) The model layer shows *high* concentration (a handful of labs) despite *rapid* price declines at fixed capability (S24) — frontier capability, not commodity capability, is what captures revenue. (2) Leadership changed within 18 months, so the Atlas does not treat any current ranking as stable. (3) Run-rate figures are press-reported and not GAAP; the Atlas marks them `estimated` and plots them with dashed styling.
**Bear case [I]:** reported training and inference costs exceed revenue at some labs (S16b, single secondary source); open-weight models narrow the capability gap; hyperscalers and application companies may capture more value than model providers.

---

## 9. Verification backlog for the data phase

These items appear in this report with ◇ status and must be checked against primary filings before being shipped as `reported` in `/data`:

1. Historical revenue series for Microsoft (FY1995–FY2025), Oracle (FY1990–FY2025), Salesforce (FY2005–FY2025), Adobe (FY2012–FY2024), AWS (2013–2025).
2. Deal values for the M&A table in §6.8.
3. NIST FIPS 203/204/205 publication date; MCP governance transition date.
4. Microsoft FY2014 revenue; Oracle Cerner price; IBM–Red Hat and IBM–HashiCorp prices.

---

## 10. Bibliography

### Sources verified in this session (S)

| ID | Source | Publisher | Date | URL |
|---|---|---|---|---|
| S01 | Gartner forecasts worldwide IT spending to grow 14.2% in 2026 (July 2026 forecast, reported) | TelecomTV (reporting Gartner) | Jul 2026 | https://www.telecomtv.com/content/digital-platforms-services/gartner-forecasts-worldwide-it-spending-to-grow-14-2-in-2026-totalling-6-37tn-55964/ |
| S02 | Gartner forecasts worldwide IT spending to grow 13.5% in 2026 | Gartner press release | 22 Apr 2026 | https://www.gartner.com/en/newsroom/press-releases/2026-04-22-gartner-forecasts-worldwide-it-spending-to-grow-13-point-5-percent-in-2026-totaling-6-point-31-trillion-dollars |
| S03 | Q2 cloud market passes $143 billion; highest growth rate in eight years | Synergy Research Group | 30 Jul 2026 | https://www.srgresearch.com/articles/q2-cloud-market-passes-143-billion-highest-growth-rate-in-eight-years |
| S03b | Enterprise cloud infrastructure uptake shows no sign of slowing | The Register (reporting Synergy) | Jul 2026 | https://www.theregister.com/a/5281835 |
| S04 | The leading cloud providers continue to run away with the market | Synergy Research Group | 27 Jul 2017 | https://www.srgresearch.com/articles/leading-cloud-providers-continue-run-away-market |
| S05 | Amazon and Microsoft own half the cloud infrastructure market | The Register (reporting Synergy) | 26 Jul 2019 | https://www.theregister.com/2019/07/26/half_of_all_public_cloud_money_goes_to_amazon_and_microsoft/ |
| S06 | Cloud infrastructure market kept growing in Q2, reaching $42B | TechCrunch (reporting Synergy) | 2021 | https://techcrunch.com/?p=2184490 |
| S07 | Cloud infrastructure market soared to $178B in 2021 | TechCrunch (reporting Synergy) | 2022 | https://techcrunch.com/?p=2266714 |
| S08 | Microsoft and IBM chase Amazon while Google falls off the pace | Synergy Research Group | 28 Jul 2014 | https://srgresearch.com/articles/microsoft-and-ibm-chase-amazon-while-google-falls-pace |
| S09 | Amazon Q4 2025 earnings release | Amazon | Feb 2026 | https://aboutamazon.com/news/company-news/amazon-earnings-q4-2025-report |
| S11 | Microsoft FY2026 Q4 earnings release (Form 8-K Exhibit 99.1) | Microsoft / SEC | 29 Jul 2026 | https://www.sec.gov/Archives/edgar/data/0000789019/000119312526323632/msft-ex99_1.htm |
| S11b | Microsoft reports revenue of $90 billion for Q4 2026 (executive quotes: Azure > $100B; Copilot > 30M seats) | Pulse 2.0 | Jul 2026 | https://pulse2.com/microsoft-reports-revenue-of-90-billion-up-18-year-over-year-for-q4-2026/ |
| S12 | Salesforce delivers record fourth quarter fiscal 2026 results | Salesforce / Business Wire | 25 Feb 2026 | https://www.businesswire.com/news/home/20260225325122/en/Salesforce-Delivers-Record-Fourth-Quarter-Fiscal-2026-Results |
| S13 | Oracle announces record Q4 and FY2026 results | Oracle / PR Newswire | 10 Jun 2026 | https://seekingalpha.com/pr/20547657 |
| S13b | Oracle's AI infrastructure business drives 93% IaaS growth (FY2026 FCF) | Converge Digest | 11 Jun 2026 | https://convergedigest.com/?p=111461 |
| S14 | Adobe Form 10-K, fiscal 2025 | Adobe / SEC | Jan 2026 | https://www.sec.gov/Archives/edgar/data/796343/000079634326000003/adbe-20251128.htm |
| S15 | Atlassian Q4 and fiscal 2026 results (Form 8-K Exhibit 99.1) | Atlassian / SEC | Aug 2026 | https://www.sec.gov/Archives/edgar/data/0001650372/000165037226000031/ex991q4fy26.htm |
| S15b | Atlassian Q3 FY2026 shareholder letter (gross-margin guidance) | Atlassian / SEC | Apr 2026 | https://www.sec.gov/Archives/edgar/data/0001650372/000165037226000024/teamq32026shareholderlet.htm |
| S15c | Atlassian Q3 FY2026 results (Form 8-K Exhibit 99.1) | Atlassian / SEC | 30 Apr 2026 | https://www.sec.gov/Archives/edgar/data/0001650372/000165037226000024/ex991q3fy26.htm |
| S16 | Anthropic tells investors annualized revenue run rate climbed to $65 billion in July | CNBC | 17 Aug 2026 | https://www.cnbc.com/2026/08/17/anthropic-says-annualized-revenue-climbed-to-65-billion-in-july.html |
| S16b | OpenAI revenue 2026 (reports on leaked 2025 financials) — **low-reliability secondary source** | ValueAdd VC blog | Sep 2026 | https://valueaddvc.com/blog/openai-revenue-2026-20b-arr-4b-month-path-to-profitability |
| S17 | Anthropic's revenue run rate reportedly surpasses $65 billion pre-IPO | Axios (citing Bloomberg) | 17 Aug 2026 | https://www.axios.com/2026/08/17/anthropic-revenue-run-rate-ipo-openai |
| S18 | US software stocks hit by Anthropic wake-up call on AI disruption | Reuters (via Yahoo Finance) | 4 Feb 2026 | https://ca.finance.yahoo.com/news/us-software-stocks-hit-anthropic-154915906.html |
| S18b | Claude Cowork and the end of enterprise software patience (cites Bloomberg's $285B estimate) | GoLev | Aug 2026 | https://golev.com/post/claude-cowork-enterprise-software-selloff/ |
| S20 | Google completes $32 billion acquisition of Wiz | Cleary Gottlieb | 11 Mar 2026 | https://www.clearygottlieb.com/news-and-insights/news-listing/google-completes-32-billion-acquisition-of-wiz |
| S21 | SpaceX agrees to acquire Cursor parent Anysphere for $60B | Quartz (citing SpaceX filing, CNBC, Reuters) | 16 Jun 2026 | https://qz.com/spacex-buying-cursor-anysphere-60-billion-deal-061626 |
| S22 | Global venture funding in 2025 surged as startup deals and valuations set all-time records | Crunchbase News | Jan 2026 | https://news.crunchbase.com/venture/funding-data-third-largest-year-2025/ |
| S23 | Six charts that show the big AI funding trends of 2025 | Crunchbase News | Dec 2025 | https://news.crunchbase.com/ai/big-funding-trends-charts-eoy-2025/ |
| S24 | LLM inference price trends; Trends in AI dashboard | Epoch AI | 2025–2026 | https://epoch.ai/data-insights/llm-inference-price-trends |
| S25 | Gartner says worldwide AI spending will total $2.5 trillion in 2026; update to $2.59T | Gartner press releases | 15 Jan 2026; 19 May 2026 | https://www.gartner.com/en/newsroom/press-releases/2026-1-15-gartner-says-worldwide-ai-spending-will-total-2-point-5-trillion-dollars-in-2026 |
| S26 | Microsoft's Teams pledges satisfy EU Commission | Law Society Gazette (Ireland) | 12 Sep 2025 | https://www.lawsociety.ie/gazette/top-stories/2025/september/microsofts-teams-pledges-satisfy-eu-commission/ |
| S27 | Market reaction or overreaction? Anthropic's legal plugin and the facts so far | ComplexDiscovery | 4 Feb 2026 | https://complexdiscovery.com/market-reaction-or-overreaction-anthropics-legal-plugin-and-the-facts-so-far/ |

### Books, papers and legal sources (B) — cited from knowledge, not fetched

| ID | Reference |
|---|---|
| B01 | Campbell-Kelly, M. *From Airline Reservations to Sonic the Hedgehog: A History of the Software Industry*. MIT Press, 2003. |
| B03 | Humphrey, W. S. "Software Unbundling: A Personal Perspective." *IEEE Annals of the History of Computing* 24(1), 2002. |
| B04 | Helmer, H. *7 Powers: The Foundations of Business Strategy*. Deep Strategy, 2016. |
| B05 | Christensen, C. M. *The Innovator's Dilemma* (1997); Christensen & Raynor, *The Innovator's Solution* (2003). Harvard Business School Press. |
| B06 | *United States v. Microsoft Corp.*, 253 F.3d 34 (D.C. Cir. 2001). |
| B07 | Eisenmann, T., Parker, G., & Van Alstyne, M. "Platform Envelopment." *Strategic Management Journal* 32(12), 2011. |
| B08 | Thompson, B. "Aggregation Theory." *Stratechery*, 2015. |
| B09 | US Department of Justice & Federal Trade Commission. *Merger Guidelines*, 2023. |
| B10 | Appenzeller, G. "Welcome to LLMflation — LLM inference cost is going down fast." Andreessen Horowitz, 2024. |

*(IDs B02 and S10, S19 were retired during drafting and are intentionally unused so that IDs referenced in the data files stay stable.)*

---

## Changelog

Append-only. Figures may only be changed here by `data-verifier`, with the evidence recorded in `docs/verification-log.md`.

### 2026-09-21 — `data-verifier`, Phase B1

1. **§6.7 (license-change table), HashiCorp row** — "IBM acquired HashiCorp (closed 2025, ~$6.4B ◇)" → "closed February 2025, $6.4B enterprise value ✓". Verified against IBM's completion press release (PR Newswire, 28 Feb 2025; $35.00/share cash). Note: SiliconANGLE dates the close 27 Feb and IBM's release 28 Feb, so the Atlas asserts the month only. Resolves §9.4 item 4.
2. **§6.8, "Enterprise app consolidation" row** — added verified completion dates for Oracle–PeopleSoft (Jan 2005), Oracle–Siebel (announced Sep 2005, closed 2006), Oracle–BEA (29 Apr 2008) and Oracle–Sun (27 Jan 2010); marked all ✓. **Added the previously missing SAP–Business Objects value: $6.8B (≈ €4.8B).** The USD figure is an FX-dependent restatement of SAP's own EUR disclosure and must ship as `estimated`.
3. **§6.8, "SaaS roll-up by incumbents" row** — **added the previously missing SAP–SuccessFactors value: $3.4B enterprise value** ($40.00/share, closed 21 Feb 2012), from the SAP/SuccessFactors joint press release filed as a Form 6-K exhibit. Added verified completion dates for Oracle–NetSuite (7 Nov 2016), Microsoft–LinkedIn (8 Dec 2016) and IBM–Red Hat (9 Jul 2019); marked all ✓. Resolves §9.4 item 3. Clarified that Salesforce–Tableau's $15.7B is an **enterprise** value (CNBC reported $15.3B equity value the same day — a basis difference, not an error).
4. **§6.8, "Pandemic-era platform deals" row** — added verified completion dates for Salesforce–Slack (21 Jul 2021), Microsoft–Nuance (4 Mar 2022), Oracle–Cerner (8 Jun 2022), Broadcom–VMware (22 Nov 2023) and Microsoft–Activision Blizzard (13 Oct 2023); marked all ✓. Clarified Oracle–Cerner's $28.3B as an **equity** value (resolves §9.4 item 2) and decomposed Broadcom–VMware's ~$69B into ~$61B cash and stock plus ~$8B of assumed debt, so the tilde is now explained rather than merely flagged.
5. **§6.8, "Security & data consolidation" row** — **added the previously missing Synopsys–Ansys value: $35B** (closed 17 Jul 2025, after FTC consent order C-4820 plus China and EU approvals). Added the IBM–HashiCorp value and the Cisco–Splunk completion date (18 Mar 2024); marked ✓.

**No figure in this report was found to be wrong.** Every ◇ deal value that could be checked was confirmed at the stated number; the changes above add missing values, add completion dates, and distinguish equity from enterprise value where the two differ.

**Still ◇ / unverified after this pass** (see `docs/verification-log.md` §8 for the full downgrade list): all pre-2007 revenue figures for Microsoft, Oracle, Salesforce and Adobe — SEC structured (XBRL) data does not reach before roughly FY2007, and the older filings were not read in this session. §9.1's requested start years (Microsoft FY1995, Oracle FY1990, Salesforce FY2005) are therefore **not** achievable from the route used here; the verified series begin at FY2008, FY2009, FY2009 and FY2007 respectively. AWS is fully covered 2014–2025.
