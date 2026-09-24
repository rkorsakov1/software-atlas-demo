/**
 * Pulls annual revenue and gross margin for US filers from the SEC's XBRL
 * companyfacts API and prints them as `revenue([...])` / `margin([...])` blocks
 * ready to paste into `data/companies.ts`.
 *
 *   SEC_USER_AGENT="Your Name you@example.com" npm run sec-revenue -- nvidia:1045810 apple:320193
 *
 * The SEC rejects requests without a contact email in the User-Agent, so the
 * script refuses to run without SEC_USER_AGENT. Find a company's CIK at
 * https://www.sec.gov/edgar/searchedgar/companysearch. Each fiscal year uses the
 * value from the most recent 10-K that reports it (restatements win), labelled by
 * the calendar year the fiscal year ends in. Only USD facts are read, so 20-F
 * filers reporting in other currencies return nothing.
 */

type Fact = {
  start?: string;
  end: string;
  val: number;
  form: string;
  filed: string;
};

type CompanyFacts = {
  entityName: string;
  facts: { "us-gaap"?: Record<string, { units?: { USD?: Fact[] } }> };
};

type Annual = Map<number, { value: number; end: string; filed: string }>;

const REVENUE_TAGS = [
  "RevenueFromContractWithCustomerExcludingAssessedTax",
  "Revenues",
  "SalesRevenueNet",
  "SalesRevenueGoodsNet",
];
const COST_TAGS = ["CostOfRevenue", "CostOfGoodsAndServicesSold", "CostOfGoodsSold"];
const DAY_MS = 86_400_000;

const annualFacts = (facts: CompanyFacts, tags: readonly string[]): Annual => {
  const out: Annual = new Map();
  for (const tag of tags) {
    for (const fact of facts.facts["us-gaap"]?.[tag]?.units?.USD ?? []) {
      if (fact.form !== "10-K" && fact.form !== "10-K/A") continue;
      if (!fact.start) continue;
      const days = (Date.parse(fact.end) - Date.parse(fact.start)) / DAY_MS;
      if (days < 350 || days > 380) continue;
      const year = Number(fact.end.slice(0, 4));
      const previous = out.get(year);
      if (previous && previous.filed >= fact.filed) continue;
      out.set(year, { value: fact.val, end: fact.end, filed: fact.filed });
    }
  }
  return out;
};

const fetchFacts = async (cik: string, userAgent: string): Promise<CompanyFacts> => {
  const padded = cik.padStart(10, "0");
  const response = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${padded}.json`, {
    headers: { "User-Agent": userAgent },
  });
  if (!response.ok) throw new Error(`SEC returned ${response.status} for CIK ${cik}`);
  return (await response.json()) as CompanyFacts;
};

const main = async (): Promise<void> => {
  const userAgent = process.env.SEC_USER_AGENT;
  if (!userAgent || !userAgent.includes("@")) {
    console.error('Set SEC_USER_AGENT to "Your Name you@example.com" (the SEC requires a contact email).');
    process.exit(1);
  }
  const pairs = process.argv.slice(2);
  if (pairs.length === 0) {
    console.error("Usage: npm run sec-revenue -- <atlasCompanyId>:<CIK> [...]");
    process.exit(1);
  }

  for (const pair of pairs) {
    const [companyId, cik] = pair.split(":");
    if (!companyId || !cik) {
      console.error(`Skipping "${pair}": expected <atlasCompanyId>:<CIK>`);
      continue;
    }
    const facts = await fetchFacts(cik, userAgent);
    const revenue = annualFacts(facts, REVENUE_TAGS);
    const cost = annualFacts(facts, COST_TAGS);
    const years = [...revenue.keys()].sort((a, b) => a - b);
    if (years.length === 0) {
      console.log(`// ${companyId}: no USD 10-K revenue facts for ${facts.entityName}`);
      continue;
    }
    const revenueRows = years
      .map((year) => `        [${year}, ${Number(((revenue.get(year)?.value ?? 0) / 1e9).toFixed(3))}],`)
      .join("\n");
    const marginRows = years
      .flatMap((year) => {
        const rev = revenue.get(year);
        const costOfRevenue = cost.get(year);
        if (!rev || !costOfRevenue || costOfRevenue.end !== rev.end) return [];
        return [`      [${year}, ${(100 * (1 - costOfRevenue.value / rev.value)).toFixed(1)}],`];
      })
      .join("\n");

    console.log(`// ${companyId}: ${facts.entityName} (CIK ${cik})`);
    console.log(`    revenueByYear: onBasis(\n      revenue([\n${revenueRows}\n      ]),\n      LATEST_FILED_NOTE,\n    ),`);
    if (marginRows.length > 0) console.log(`    grossMarginByYear: margin([\n${marginRows}\n    ]),`);
    console.log("");
  }
};

void main();
