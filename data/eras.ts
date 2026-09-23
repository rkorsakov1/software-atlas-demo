import type { Era } from "@/data/types";

/**
 * Eleven eras of commercial software, each defined by the technology that made
 * it possible and the business model that paid for it. `survivors` and
 * `casualties` name companies whose fate was decided by the shift *into* the
 * next era, which is why the last era lists no casualties: naming them now
 * would be a prediction, not a record.
 */
export const eras: Era[] = [
  {
    id: "era-1-mainframe-bundled",
    name: "Mainframes and bundled software",
    startYear: 1950,
    endYear: 1969,
    enablingTech: [
      "Stored-program mainframes",
      "IBM System/360 compatible family (1964)",
      "Batch processing and service bureaus",
    ],
    businessModel:
      "Hardware leases with software, education and support bundled at no separate charge; software was a cost centre for the hardware vendor.",
    summary:
      "There was no software industry, because software had no price. IBM and the BUNCH leased machines with programs, training and engineers included, and the only independent software businesses were contract programmers and service bureaus. On 23 June 1969, under antitrust pressure, IBM announced it would price software and services separately from 1970 — the act that created a market where vendors could compete against a priced product instead of a free one.",
    definingCompanyIds: ["ibm", "adp"],
    survivors: [],
    casualties: [],
  },
  {
    id: "era-2-minicomputer-isv",
    name: "Minicomputers and the first independent software vendors",
    startYear: 1969,
    endYear: 1981,
    enablingTech: [
      "Minicomputers (DEC PDP-11 and VAX, Data General, HP)",
      "Codd's relational model (1970)",
      "UNIX and the C language (1969-73)",
    ],
    businessModel:
      "Perpetual licences plus annual maintenance priced as a percentage of the licence, sold by field sales forces to data-processing departments.",
    summary:
      "Unbundling plus cheaper machines produced the first generation of companies whose product was software itself: Software AG, SAP, Computer Associates and Oracle. The durable lesson of the era was portability — Oracle wrote its database in C so it could run on any vendor's hardware, while software tied to one machine family died with that family.",
    definingCompanyIds: [
      "software-ag",
      "sap",
      "oracle",
      "computer-associates",
      "digital-equipment",
      "data-general",
    ],
    survivors: ["ibm", "oracle", "sap"],
    casualties: [],
  },
  {
    id: "era-3-pc-packaged",
    name: "The PC and packaged software",
    startYear: 1981,
    endYear: 1995,
    enablingTech: [
      "Microprocessors and the open IBM PC architecture (1981)",
      "Licensed MS-DOS and PC clones",
      "Graphical interfaces (Macintosh 1984, Windows 3.0 1990, Windows 95)",
    ],
    businessModel:
      "Shrink-wrapped retail licences sold through distribution, plus OEM per-copy royalties paid by hardware makers.",
    summary:
      "Software became a consumer product sold in a box, and the operating system became the control point. Microsoft's per-copy DOS royalties on every clone funded an applications business that bundled Word, Excel and PowerPoint into Office (1990) at a price below the sum of the standalone leaders. Within five years the standalone leaders were gone.",
    definingCompanyIds: [
      "microsoft",
      "apple",
      "lotus",
      "wordperfect",
      "ashton-tate",
      "borland",
      "novell",
      "adobe",
      "intuit",
      "autodesk",
    ],
    survivors: ["microsoft", "adobe", "intuit", "autodesk", "apple"],
    casualties: [
      "lotus",
      "wordperfect",
      "ashton-tate",
      "digital-equipment",
      "data-general",
    ],
  },
  {
    id: "era-4-client-server",
    name: "Client-server and enterprise applications",
    startYear: 1990,
    endYear: 2001,
    enablingTech: [
      "Local area networks with UNIX servers and PC clients",
      "Relational databases and SQL as a standard",
      "Three-tier application architectures",
    ],
    businessModel:
      "Seven-figure perpetual licences, 15-22% annual maintenance, and systems-integrator implementation fees often several times the licence value.",
    summary:
      "ERP turned software into the system of record for the large enterprise and produced the highest switching costs the industry has ever created: a replacement is a multi-year, board-level programme. The integrator ecosystem around SAP and Oracle became a moat in its own right, and every independent application vendor of the era was eventually bought by one of them.",
    definingCompanyIds: [
      "sap",
      "oracle",
      "peoplesoft",
      "siebel",
      "baan",
      "jd-edwards",
      "sybase",
      "informix",
      "microsoft",
      "accenture",
    ],
    survivors: ["sap", "oracle", "microsoft", "accenture"],
    casualties: ["peoplesoft", "jd-edwards", "siebel", "baan", "informix", "sybase"],
  },
  {
    id: "era-5-internet-dotcom",
    name: "Internet and dot-com",
    startYear: 1995,
    endYear: 2002,
    enablingTech: [
      "The web browser (Mosaic 1993, Netscape Navigator 1994)",
      "HTTP servers, application servers and Java (1995)",
      "Commercial ISPs and consumer dial-up",
    ],
    businessModel:
      "Free-to-user services funded by advertising, e-commerce margins, enterprise web and application server licences, and single-tenant application service providers.",
    summary:
      "The browser threatened to make the operating system irrelevant, and Microsoft answered by bundling Internet Explorer into Windows — the conduct at the centre of US v. Microsoft. Netscape lost, but the litigation constrained Microsoft for a decade and left room for Google. The era's other legacy was the discovery that single-tenant hosting had terrible unit economics, which is what multi-tenancy fixed.",
    definingCompanyIds: [
      "netscape",
      "amazon",
      "google",
      "microsoft",
      "sun-microsystems",
      "bea-systems",
      "salesforce",
      "netsuite",
    ],
    survivors: ["microsoft", "amazon", "google"],
    casualties: ["netscape", "sun-microsystems", "bea-systems"],
  },
  {
    id: "era-6-open-source",
    name: "Open source goes mainstream",
    startYear: 1998,
    endYear: 2015,
    enablingTech: [
      "GNU tooling and the GPL (1989), the Linux kernel (1991)",
      "Apache HTTP Server (1995), MySQL and PostgreSQL",
      "Internet-scale distributed collaboration and, later, GitHub",
    ],
    businessModel:
      "Subscriptions for support and certified builds, dual licensing, then open core and managed cloud services on top of an open project.",
    summary:
      "Open source collapsed the price of the operating system, web server and database layers to zero, which is the precondition for both SaaS and cloud: no hyperscaler could have priced compute as it did while paying per-server licence fees. Value moved up to whoever operated the software, which is also the source of the licence-change fights of the 2020s.",
    definingCompanyIds: [
      "red-hat",
      "mysql-ab",
      "suse",
      "canonical",
      "mongodb",
      "elastic",
      "confluent",
      "hashicorp",
      "databricks",
      "redis",
    ],
    survivors: ["microsoft", "oracle", "ibm", "red-hat"],
    casualties: ["sco-group", "novell"],
  },
  {
    id: "era-7-saas",
    name: "Software as a service",
    startYear: 1999,
    endYear: null,
    enablingTech: [
      "Broadband and the browser as a universal client",
      "Multi-tenant architecture: one code base and schema for all customers",
      "Cloud hosting that removed the vendor's own data-centre cost",
    ],
    businessModel:
      "Subscription pricing per user per month, recognised ratably, with the vendor carrying the hosting cost and the customer carrying almost no upfront cost.",
    summary:
      "Salesforce counter-positioned against licensed CRM: a model Siebel could not copy without destroying its own licence revenue. The trade was an immediate licence payment for a stream, which depresses reported revenue during a transition and raises lifetime value afterwards — the J-curve Adobe walked through deliberately in 2013. Incumbents that made the switch kept their franchises; those that waited were rolled up.",
    definingCompanyIds: [
      "salesforce",
      "netsuite",
      "workday",
      "servicenow",
      "zendesk",
      "hubspot",
      "atlassian",
      "shopify",
      "veeva",
    ],
    survivors: ["microsoft", "adobe", "oracle", "sap", "intuit"],
    casualties: ["siebel"],
  },
  {
    id: "era-8-cloud-infrastructure",
    name: "Cloud infrastructure",
    startYear: 2006,
    endYear: null,
    enablingTech: [
      "Server virtualization and commodity x86 hardware",
      "Open-source stacks with no per-server licence cost",
      "Provisioning APIs, and later custom silicon and GPU fleets",
    ],
    businessModel:
      "Pay-as-you-go utility pricing for compute, storage and managed services, with committed-use discounts and multi-year capacity contracts at the top end.",
    summary:
      "AWS sold Amazon's internal primitives to outsiders in 2006 and created a market by serving customers enterprise IT did not want: startups. Utility pricing and repeated price cuts expanded demand faster than margins fell. Two decades later the same market is the battleground for AI capacity, and the leader's share has fallen while the top three's combined share has risen.",
    definingCompanyIds: [
      "amazon",
      "microsoft",
      "google",
      "oracle",
      "alibaba",
      "ibm",
      "coreweave",
    ],
    survivors: ["microsoft", "oracle", "google"],
    casualties: ["rackspace", "vmware"],
  },
  {
    id: "era-9-mobile-app-stores",
    name: "Mobile and app stores",
    startYear: 2008,
    endYear: null,
    enablingTech: [
      "Capacitive touchscreen smartphones (iPhone, 2007)",
      "3G and 4G networks",
      "Mobile operating systems and SDKs (iOS, Android)",
    ],
    businessModel:
      "Platform commissions on paid apps and in-app purchases (historically 30%, reduced to 15% for small developers and for subscriptions after year one), freemium mechanics and advertising.",
    summary:
      "Distribution moved inside two stores whose owners set the terms, the take rate and the rules of discovery. That gatekeeping produced the biggest wave of platform regulation since US v. Microsoft, from the Digital Markets Act to the Epic v. Apple anti-steering injunction, and it made 'which platform can reach the customer' a more important question than product quality.",
    definingCompanyIds: ["apple", "google", "meta", "bytedance", "nokia", "blackberry"],
    survivors: ["apple", "google", "meta", "microsoft"],
    casualties: ["nokia", "blackberry"],
  },
  {
    id: "era-10-data-apis-plg",
    name: "Data, APIs and product-led growth",
    startYear: 2010,
    endYear: 2021,
    enablingTech: [
      "Cloud data warehouses separating storage from compute",
      "REST APIs, developer platforms and Git/GitHub",
      "Containers (Docker, 2013) and Kubernetes (2014)",
    ],
    businessModel:
      "Usage-based pricing metered on the resource consumed, plus freemium self-serve adoption that converts into enterprise contracts later.",
    summary:
      "The buyer changed. A developer with a credit card could adopt an API, a repository or a chat tool without asking the CIO, and the vendor's job became making the first hour delightful rather than winning a bake-off. Bottom-up adoption then hardened into enterprise agreements, and the vendors that had built a sales motion around procurement committees found themselves selling to people who had already chosen.",
    definingCompanyIds: [
      "stripe",
      "twilio",
      "snowflake",
      "databricks",
      "datadog",
      "mongodb",
      "atlassian",
      "slack",
      "zoom",
      "figma",
      "github",
    ],
    survivors: ["microsoft", "github", "atlassian"],
    casualties: ["cloudera", "hortonworks"],
  },
  {
    id: "era-11-generative-ai",
    name: "Generative AI and foundation models",
    startYear: 2022,
    endYear: null,
    enablingTech: [
      "The transformer architecture (2017) and scaled training compute",
      "GPU and accelerator clusters at data-centre scale",
      "Instruction tuning and reinforcement learning from human feedback",
    ],
    businessModel:
      "Usage-based API pricing per token, consumer and business subscriptions from $20 to $200 a month, seat-based AI add-ons, and early per-outcome pricing such as per resolved support conversation.",
    summary:
      "ChatGPT's launch in November 2022 made natural language a universal interface and moved a decade of capital into a handful of model labs. The open question is whether the labs are suppliers to software or competitors to it: in early 2026 the market repriced information services and seat-based SaaS on the second reading, while the incumbents' own reported revenue kept growing. This era has no casualty list yet, and naming one would be a forecast rather than a record.",
    definingCompanyIds: [
      "openai",
      "anthropic",
      "google",
      "nvidia",
      "microsoft",
      "anysphere",
      "perplexity",
      "elevenlabs",
      "xai",
      "deepseek",
      "mistral",
    ],
    survivors: ["microsoft", "google", "amazon", "oracle", "nvidia"],
    casualties: [],
  },
];
