import type { Metadata } from "next";
import Link from "next/link";

import { companies, industrySize, markets, sources } from "@/data";
import type { Market } from "@/data/types";
import { categoryLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Help complete the Atlas",
  description:
    "Where the Atlas is missing data, ranked by how much each gap matters, and how to add a sourced number.",
};

const REPO_URL = "https://github.com/rkorsakov1/software-atlas-demo";
const SERIES_GUIDE_URL = `${REPO_URL}/blob/main/data/series/README.md`;
const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`;
const ISSUES_URL = `${REPO_URL}/issues`;

/** Fewer share years than this can't show a trend, so the market is left out of the chart. */
const MIN_SHARE_YEARS = 3;

const BAND_WEIGHT: Record<NonNullable<Market["sizeBand"]>, number> = {
  XL: 5,
  L: 4,
  M: 3,
  S: 2,
  XS: 1,
};

/** A market only has a real size series once it carries more than one non-modeled point. */
const hasSizeSeries = (market: Market): boolean =>
  market.sizeByYear.filter((point) => point.confidence !== "modeled").length > 1;

const bySizeBand = (a: Market, b: Market): number =>
  (BAND_WEIGHT[b.sizeBand ?? "XS"] ?? 0) - (BAND_WEIGHT[a.sizeBand ?? "XS"] ?? 0);

const unsizedMarkets = markets.filter((market) => !hasSizeSeries(market)).sort(bySizeBand);
const thinShareMarkets = markets
  .filter((market) => market.sharesByYear.length < MIN_SHARE_YEARS)
  .sort(bySizeBand);
const companiesWithoutRevenue = companies
  .filter((company) => company.revenueByYear.length === 0 && company.status !== "defunct")
  .sort((a, b) => a.name.localeCompare(b.name));
const unverifiedWithUrl = sources.filter((source) => !source.verified && source.url !== undefined);
const earliestSegmentYear = Math.min(
  ...markets.flatMap((market) =>
    market.sizeByYear.filter((point) => point.confidence !== "modeled").map((point) => point.year),
  ),
);
const industryYears = industrySize.map((entry) => entry.point.year);

type Ask = { title: string; detail: string };

/** Specific asks found while building the Atlas, most valuable first. */
const SPECIFIC_ASKS: readonly Ask[] = [
  {
    title: "Market capitalisation for the largest companies",
    detail:
      "No company has a market-cap series yet, so the 'Largest' comparison uses revenue and the bubble chart can't size by value. Year-end market caps from filings or exchange data would fix both.",
  },
  {
    title: "Revenue for Alphabet, Apple, Meta and Nvidia",
    detail:
      "They are missing from the revenue chart and the 'Largest by revenue' comparison. SEC 10-K figures, one row per fiscal year.",
  },
  {
    title: "CRM vendor shares for 2019–2025, including Salesforce and HubSpot",
    detail:
      "The CRM share chart has Salesforce through 2018 only, and no HubSpot at all. Gartner and IDC publish annual CRM shares.",
  },
  {
    title: "Operating systems, security and ERP vendor shares for more years",
    detail:
      "Each has one or two years, which is not enough for a trend, so they are left out of the share chart for now.",
  },
  {
    title: "Video streaming revenue",
    detail:
      "Only music streaming figures were found (IFPI). Worldwide subscription video revenue from Ampere, MPA or company filings would size the market properly.",
  },
  {
    title: "Market sizes before 2004",
    detail: `No market below the whole industry is sized before ${earliestSegmentYear}. ERP and database sizes from the 1990s (AMR Research, Dataquest, IDC) are the most valuable.`,
  },
  {
    title: "Two OECD PDFs that need a human to read them",
    detail:
      "The 1995 and 2001 worldwide software figures come from OECD Information Technology Outlook PDFs whose text couldn't be extracted automatically. Confirming the quotes upgrades them from estimated to reported.",
  },
];

type GapListProps = { names: readonly string[]; limit?: number };

const GapList = ({ names, limit = 40 }: GapListProps): React.ReactElement => (
  <ul className="mt-3 flex flex-wrap gap-1.5">
    {names.slice(0, limit).map((name) => (
      <li key={name} className="rounded-full border border-border px-2.5 py-0.5 text-xs">
        {name}
      </li>
    ))}
    {names.length > limit ? (
      <li className="px-1 py-0.5 text-xs text-muted-foreground">+{names.length - limit} more</li>
    ) : null}
  </ul>
);

type SectionProps = { title: string; count?: number; children: React.ReactNode };

const Section = ({ title, count, children }: SectionProps): React.ReactElement => (
  <section className="border-t border-border py-8">
    <h2 className="text-xl font-semibold">
      {title}
      {count === undefined ? null : (
        <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">{count}</span>
      )}
    </h2>
    <div className="mt-2 max-w-3xl text-pretty leading-relaxed text-muted-foreground">
      {children}
    </div>
  </section>
);

const ContributePage = (): React.ReactElement => (
  <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
    <header className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Open data</p>
      <h1 className="mt-2 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
        Help complete the Atlas
      </h1>
      <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
        The Atlas is open source, and the most useful contribution is a sourced number that fills a
        gap. You don&apos;t need to write code: most figures are one row in a CSV file, with the
        page it came from and the sentence that contains it.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <a
          href={SERIES_GUIDE_URL}
          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
        >
          How to add a number
        </a>
        <a href={CONTRIBUTING_URL} className="rounded-md border border-border px-4 py-2 hover:bg-secondary">
          Contributing guide
        </a>
        <a href={ISSUES_URL} className="rounded-md border border-border px-4 py-2 hover:bg-secondary">
          Suggest a source
        </a>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        This page is generated from the data, so it shrinks as gaps are filled.
      </p>
    </header>

    <div className="mt-10">
      <Section title="Most wanted">
        <ol className="mt-3 space-y-4">
          {SPECIFIC_ASKS.map((ask, index) => (
            <li key={ask.title} className="flex gap-3">
              <span className="font-mono text-sm text-brand">{index + 1}</span>
              <div>
                <p className="font-medium text-foreground">{ask.title}</p>
                <p className="mt-0.5 text-sm">{ask.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Markets without a size series" count={unsizedMarkets.length}>
        <p>
          These markets show only a rough size range. Three or four sourced years each (ideally one
          publisher, e.g. Gartner or IDC press releases) turn a range into a line. Largest markets
          first.
        </p>
        <GapList
          names={unsizedMarkets.map(
            (market) => `${market.name} (${categoryLabel[market.category]})`,
          )}
        />
      </Section>

      <Section title="Markets without vendor shares over time" count={thinShareMarkets.length}>
        <p>
          A share chart needs at least {MIN_SHARE_YEARS} years of vendor shares from one publisher.
          Largest markets first.
        </p>
        <GapList names={thinShareMarkets.map((market) => market.name)} />
      </Section>

      <Section title="Companies without a revenue series" count={companiesWithoutRevenue.length}>
        <p>
          Public companies: annual revenue from 10-K or 20-F filings. Private companies: a reported
          figure or credible estimate, with its source.
        </p>
        <GapList names={companiesWithoutRevenue.map((company) => company.name)} limit={60} />
      </Section>

      <Section title="Sources we couldn't open" count={unverifiedWithUrl.length}>
        <p>
          Our automated checks were blocked on these pages, so figures from them are marked
          estimated. If you can open one and confirm the quoted figure, say so in an issue and it
          becomes reported.
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {unverifiedWithUrl.slice(0, 25).map((source) => (
            <li key={source.id}>
              <a href={source.url} className="underline underline-offset-4 hover:text-foreground">
                {source.title}
              </a>{" "}
              <span className="text-xs">({source.publisher})</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="The whole industry">
        <p>
          The industry chart has figures for {industryYears.length} year-definition pairs between{" "}
          {Math.min(...industryYears)} and {Math.max(...industryYears)}, from several publishers
          with different definitions. A single worldwide series from one publisher, or more years
          for any existing one, makes the lines comparable.{" "}
          <Link href="/explore/?chart=treemap" className="underline underline-offset-4">
            See the chart
          </Link>
          .
        </p>
      </Section>
    </div>
  </div>
);

export default ContributePage;
