import type { Metadata } from "next";
import Link from "next/link";

import { ConfidenceBadge } from "@/components/charts/primitives";
import { SourceList } from "@/components/profile/SourceList";
import { companies, emerging, markets, moatRubric, sources } from "@/data";
import type { Category, Confidence, MoatKey, MoatScore, SignalType } from "@/data/types";
import {
  categoryLabel,
  confidenceDescription,
  confidenceLabel,
  moatLabel,
  signalTypeLabel,
} from "@/lib/format";
import { HHI_HIGHLY_CONCENTRATED, HHI_METHOD_NOTE } from "@/lib/hhi";
import { CATEGORY_ORDER } from "@/lib/scales";
import { byId, shareSeries } from "@/lib/selectors";
import { SIMULATOR_DISCLAIMER } from "@/lib/simulation";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How the Atlas labels confidence, sizes markets, computes HHI and top-three share, scores moats and runs its simulator — plus the full source list and what the data cannot do.",
};

const CONFIDENCE_ORDER: readonly Confidence[] = ["reported", "estimated", "modeled"];

const SIZE_BANDS: readonly { band: string; range: string; count: number }[] = [
  { band: "XS", range: "under $5B", count: markets.filter((m) => m.sizeBand === "XS").length },
  { band: "S", range: "$5–20B", count: markets.filter((m) => m.sizeBand === "S").length },
  { band: "M", range: "$20–60B", count: markets.filter((m) => m.sizeBand === "M").length },
  { band: "L", range: "$60–150B", count: markets.filter((m) => m.sizeBand === "L").length },
  { band: "XL", range: "above $150B", count: markets.filter((m) => m.sizeBand === "XL").length },
];

const MOAT_SCORES: readonly MoatScore[] = [0, 1, 2, 3, 4, 5];

const cloudMarket = byId(markets, "cloud-infrastructure");
const cloudSeries = cloudMarket ? shareSeries(cloudMarket) : [];

const verifiedSources = sources.filter((source) => source.verified);
const unverifiedSources = sources.filter((source) => !source.verified);

/**
 * The two reasons a source can be unverified, split from the registry itself
 * rather than counted by hand, so this page cannot go stale if another source is
 * downgraded: literature carries no URL by design, and a page that was located
 * but never read keeps its URL so a reader can try it directly.
 */
const literatureSources = unverifiedSources.filter((source) => source.url === undefined);
const retrievedUnreadSources = unverifiedSources.filter((source) => source.url !== undefined);

const companiesWithRevenue = companies.filter((company) => company.revenueByYear.length > 0).length;
const companiesWithMargin = companies.filter(
  (company) => (company.grossMarginByYear ?? []).length > 0,
).length;
const marketsWithShares = markets.filter((market) => market.sharesByYear.length > 0).length;

/** The one candidate on the emerging radar that is not framed around AI. */
const NON_AI_EMERGING_IDS: readonly string[] = ["post-quantum-cryptography"];

const aiFramedEmerging = emerging.filter(
  (market) => !NON_AI_EMERGING_IDS.includes(market.id),
).length;
const emergingSignals = emerging.flatMap((market) => market.signals);
const signalTypeCount = Object.keys(signalTypeLabel).length;

const signalsOfType = (type: SignalType): number =>
  emergingSignals.filter((signal) => signal.type === type).length;

const emergingInCategory = (category: Category): number =>
  emerging.filter((market) => market.category === category).length;

const emergingCategorySpread = CATEGORY_ORDER.map(
  (category) => `${categoryLabel[category].toLowerCase()} ${emergingInCategory(category)}`,
).join(", ");
const emptyRadarSectors = CATEGORY_ORDER.filter(
  (category) => emergingInCategory(category) === 0,
).length;

type SectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
};

const Section = ({ id, title, children }: SectionProps): React.ReactElement => (
  <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20 border-t border-border pt-8">
    <h2 id={`${id}-heading`} className="font-serif text-2xl font-semibold">
      {title}
    </h2>
    <div className="mt-4 space-y-4 text-sm leading-relaxed">{children}</div>
  </section>
);

const CONTENTS: readonly { href: string; label: string }[] = [
  { href: "#confidence", label: "Confidence levels" },
  { href: "#verification", label: "✓ and ◇" },
  { href: "#sizing", label: "Market sizing" },
  { href: "#concentration", label: "HHI and top-three share" },
  { href: "#moats", label: "The moat rubric" },
  { href: "#simulator", label: "The simulator model" },
  { href: "#limitations", label: "Known limitations" },
  { href: "#workflow", label: "Updating the data" },
  { href: "#disclosure", label: "Anthropic disclosure" },
  { href: "#sources", label: "Sources" },
];

const MethodologyPage = (): React.ReactElement => (
  <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
    <header>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        How this was built
      </p>
      <h1 className="mt-2 text-balance font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Methodology
      </h1>
      <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
        Every number in the Atlas carries a value, a year, a unit, a source id and a confidence
        level. This page says what each of those means, how the derived figures were derived, and
        where the data runs out. Nothing here is decoration: if a chart looks empty, this page
        explains why the honest answer was to leave it empty.
      </p>
    </header>

    <nav aria-label="On this page" className="mt-8 rounded-lg border border-border bg-card p-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        On this page
      </h2>
      <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {CONTENTS.map((entry) => (
          <li key={entry.href}>
            <a
              href={entry.href}
              className="text-sm underline-offset-4 hover:underline focus-visible:underline"
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    <div className="mt-10 space-y-10">
      <Section id="confidence" title="Confidence levels">
        <p>
          Three levels, applied to every data point in the Atlas and shown on every tooltip, every
          data table and every metric on a profile page.
        </p>
        <dl className="space-y-3">
          {CONFIDENCE_ORDER.map((confidence) => (
            <div key={confidence} className="rounded-md border border-border bg-card p-3">
              <dt className="flex items-center gap-2">
                <ConfidenceBadge confidence={confidence} size="md" />
                <span className="font-medium">{confidenceLabel[confidence]}</span>
              </dt>
              <dd className="mt-1.5 text-muted-foreground">
                {confidenceDescription[confidence]}
              </dd>
            </div>
          ))}
        </dl>
        <p>
          The rule that keeps the three apart: a figure may only ship as{" "}
          <strong className="font-semibold">reported</strong> if it appears, as printed, in a filing
          or official release that was fetched during this project. A ratio computed from two filed
          figures is <strong className="font-semibold">modeled</strong>, not reported, even though
          both inputs are filed — the arithmetic is ours. Every modeled point carries a{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">note</code> stating the
          method, and that note is what the confidence badge shows on hover.
        </p>
        <p>
          Marks in the charts follow the same three-way split: solid for reported, hatched for
          estimated, dashed outline for modeled. Where a value was interpolated between two
          reported years — the treemap does this as the year scrubber moves — the interpolated
          value is flagged as modeled, because no one measured that year.
        </p>
      </Section>

      <Section id="verification" title="✓ and ◇: what was actually checked">
        <p>
          The research phase tagged every figure with one of two verification marks, and the data
          phase acted on them:
        </p>
        <ul className="ml-5 list-disc space-y-2 marker:text-muted-foreground">
          <li>
            <strong className="font-semibold text-reported">✓ verified</strong> — the source was
            located and fetched during this project. The URL is in the source registry below.
          </li>
          <li>
            <strong className="font-semibold text-estimated">◇ not re-verified</strong> — the figure
            was a well-known filing value recalled during research but not re-fetched. A ◇ figure
            could only ship as <em>reported</em> after the verification pass confirmed it against
            the filing and logged it. Anything that failed that test ships as{" "}
            <em>estimated</em> with a low/high range, or was dropped.
          </li>
        </ul>
        <p>
          <strong className="font-semibold">The rule.</strong>{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">verified: true</code>{" "}
          means the cited URL was retrieved in this project <em>and the figure was seen in
          retrieved content</em> — page body, filing, API response, or a search engine&apos;s
          verbatim extract of that page. A source whose substance sits behind a paywall or a login
          that was never passed is{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">verified: false</code>,
          with its URL kept.
        </p>
        <p>
          The other half of that rule is less obvious: a 403 on a later automated re-check does{" "}
          <em>not</em> unverify a source that was read earlier. Blocking is a property of the
          fetcher, not of the page — during review, a host that refused one fetcher returned the
          same page in full to another. The flag answers &ldquo;was this figure ever seen in this
          project&rdquo;, not &ldquo;does an automated re-fetch succeed today&rdquo;.
        </p>
        <p>
          Of {sources.length} sources in the registry, {verifiedSources.length} clear that bar and{" "}
          {unverifiedSources.length} do not — for two different reasons.{" "}
          {literatureSources.length} are books, papers and case law cited from the literature: those
          carry no URL, by design. The other {retrievedUnreadSources.length} are real, URL-bearing
          pages whose substance nobody here has read, because the body is paywalled or the host
          blocks automated fetchers. Their links are kept so you can try them yourself, and every
          figure resting on one of them ships as <em>estimated</em>. Neither group ever backs a{" "}
          <em>reported</em> data point, and the registry below lists the two apart, so a link
          sitting under a ◇ badge explains itself.
        </p>
        <p>
          The full record of what was checked, what was corrected and what was rejected is in{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            docs/verification-log.md
          </code>{" "}
          in the repository.
        </p>
      </Section>

      <Section id="sizing" title="Market sizing: bands, not point estimates">
        <p>
          Analyst firms differ by two to three times on the same software category because they draw
          the boundary differently — whether CRM includes marketing automation, whether
          contact-centre software counts as service or as telephony. Gartner&apos;s IaaS figure and
          Synergy&apos;s cloud-infrastructure figure differ by more than two times for what sounds
          like the same market. So every market in the Atlas records its{" "}
          <strong className="font-semibold">definition</strong> before it records a size, and the
          size itself is usually a band.
        </p>
        <p>
          <strong className="font-semibold">The method.</strong> Start from the combined revenue of
          the leading vendors in the category, divide by an assumed combined share for those
          vendors, and round out to an order-of-magnitude band. The band ships as a single{" "}
          <em>modeled</em> data point whose <code className="font-mono text-xs">low</code> and{" "}
          <code className="font-mono text-xs">high</code> span the whole band. The midpoint exists
          only so a treemap rectangle can be allocated an area; the span is the claim, the midpoint
          is not.
        </p>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Size bands used in the Atlas, with the number of markets in each.
            </caption>
            <thead className="bg-muted/60">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Band
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Annual spend
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Markets
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SIZE_BANDS.map((entry) => (
                <tr key={entry.band}>
                  <th scope="row" className="px-3 py-2 font-mono text-xs font-medium">
                    {entry.band}
                  </th>
                  <td className="px-3 py-2">{entry.range}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{entry.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Exactly one market — cloud infrastructure — carries a published, verified size series
          rather than a band, because Synergy Research puts quarterly figures in public press
          releases. Where a verified analyst figure exists for a category it replaces the band;
          otherwise the band stands, and the treemap hatches the rectangle so the reader can see at
          a glance which rectangles are measured and which are modelled.
        </p>
      </Section>

      <Section id="concentration" title="HHI and top-three share, and why they diverge">
        <p>
          <strong className="font-semibold">HHI</strong> — the Herfindahl-Hirschman Index — is the
          sum of every firm&apos;s squared market share, with shares expressed in percentage points.
          A monopoly scores 10,000; a market split evenly between ten firms scores 1,000. The US
          DOJ/FTC 2023 Merger Guidelines treat a market above{" "}
          <strong className="font-semibold">{HHI_HIGHLY_CONCENTRATED.toLocaleString("en-US")}</strong>{" "}
          as highly concentrated.
        </p>
        <p>
          <strong className="font-semibold">Top-three share</strong> is simply the sum of the three
          largest shares. It answers a different question: how much of the market the leading group
          holds, regardless of how it is divided among them.
        </p>
        <p className="rounded-md border border-dashed border-modeled/50 bg-muted/40 p-3 text-muted-foreground">
          <strong className="font-semibold text-foreground">Every HHI in the Atlas is modeled</strong>{" "}
          and carries this note: {HHI_METHOD_NOTE} Because the unreported tail contributes zero, each
          figure is a lower bound on true concentration.
        </p>
        {cloudSeries.length === 0 ? null : (
          <>
            <p>
              <strong className="font-semibold">Why the two measures disagree.</strong> Cloud
              infrastructure is the one market here with a published share series, and it shows the
              divergence cleanly:
            </p>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Modeled HHI and top-three share for cloud infrastructure, by year.
                </caption>
                <thead className="bg-muted/60">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Year
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      HHI (modeled)
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      Top-three share
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      Named vendors
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cloudSeries.map((point) => (
                    <tr key={point.year}>
                      <th scope="row" className="px-3 py-2 font-medium tabular-nums">
                        {point.year}
                      </th>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {point.hhi.toLocaleString("en-US")}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {point.top3.toFixed(0)}%
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{point.shares.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Top-three share rose steadily. HHI peaked and then fell. Both are correct, and they
              disagree because the leader lost share to the second and third players rather than to
              the tail: the market became more oligopolistic and less dominated by one firm at the
              same time. That is the reason the share chart plots both lines, and the reason any
              single concentration statistic quoted on its own should be distrusted.
            </p>
            <p className="text-muted-foreground">
              One rounding caveat is worth stating: summing Synergy&apos;s rounded published shares
              for 2026 gives a top three of {cloudSeries[cloudSeries.length - 1]?.top3.toFixed(0)}%,
              while Synergy-derived coverage reports 67% on the full definition. The Atlas shows what
              it can compute from the published per-vendor shares and footnotes the gap rather than
              silently picking the friendlier number.
            </p>
          </>
        )}
      </Section>

      <Section id="moats" title="The moat rubric">
        <p>
          Every company is scored 0–5 on seven axes. The scores are{" "}
          <ConfidenceBadge confidence="modeled" /> judgments made in this project, not measurements
          and not reported figures. The rubric below exists so that you can disagree with a specific
          number rather than with a vague claim about durability: each company&apos;s profile shows
          its scores next to a one-sentence rationale.
        </p>
        <div className="space-y-6">
          {(Object.keys(moatRubric) as MoatKey[]).map((moatKey) => (
            <div key={moatKey}>
              <h3 className="font-serif text-lg font-semibold">{moatLabel[moatKey]}</h3>
              <dl className="mt-2 divide-y divide-border rounded-md border border-border">
                {MOAT_SCORES.map((score) => (
                  <div key={score} className="flex gap-3 px-3 py-2">
                    <dt className="w-6 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                      {score}
                    </dt>
                    <dd className="text-pretty text-sm">{moatRubric[moatKey][score]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Section>

      <Section id="simulator" title="The simulator model">
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3">
          <strong className="font-semibold">{SIMULATOR_DISCLAIMER}</strong> Nothing it outputs is
          observed in the world, and nothing it outputs is a forecast.
        </p>
        <p>
          The{" "}
          <Link
            href="/simulator/"
            className="font-medium underline underline-offset-4 hover:no-underline"
          >
            simulator
          </Link>{" "}
          is a seeded agent-based toy. It starts with five firms holding equal share and a quality
          score drawn uniformly from 0.8 to 1.2 by a mulberry32 generator, so a given seed always
          reproduces the same run. Each tick applies five rules:
        </p>
        <ol className="ml-5 list-decimal space-y-2 marker:font-mono marker:text-muted-foreground">
          <li>
            <strong className="font-semibold">Attraction.</strong> A firm&apos;s pull is its quality
            multiplied by one plus four times the network-strength dial times its current share. The
            constant 4 is what makes share compound into more share; at a network strength of zero
            the term vanishes and only quality matters.
          </li>
          <li>
            <strong className="font-semibold">Churn.</strong> Each firm loses 15% of its share per
            tick, scaled down by the effective switching cost. At a switching cost of 1 nobody
            leaves; at 0 the full 15% is up for grabs.
          </li>
          <li>
            <strong className="font-semibold">The pool.</strong> All churn plus 0.05 of new demand
            is redistributed across firms in proportion to the softmax of their attraction scores.
          </li>
          <li>
            <strong className="font-semibold">Entrants.</strong> The entrants-per-tick dial adds new
            firms at 0.005 share with quality drawn uniformly from 0.7 to 1.4.
          </li>
          <li>
            <strong className="font-semibold">Platform shifts.</strong> With the shift probability
            each tick, every incumbent&apos;s quality is multiplied by 0.6, one entrant arrives with
            quality 1.6, and the effective switching cost is halved for the next five ticks. Firms
            below 0.001 share are pruned and the remainder renormalised; HHI and top-three share are
            recorded.
          </li>
        </ol>
        <p>
          <strong className="font-semibold">Ticks are not years and firms are not companies.</strong>{" "}
          There are no prices, no costs, no product categories, no regulators, no capital constraints
          and no acquisitions. A tick is one round of redistribution and nothing more. Five firms
          with a quality score are not an industry, and the model has no calibration against any real
          market in this dataset.
        </p>
        <p>
          It reports the same two concentration measures as the rest of the Atlas:{" "}
          <strong className="font-semibold">HHI</strong>, the sum of squared percentage-point shares
          on a 0–10,000 scale, against the{" "}
          {HHI_HIGHLY_CONCENTRATED.toLocaleString("en-US")} &ldquo;highly concentrated&rdquo;
          threshold from the US DOJ/FTC 2023 Merger Guidelines, and{" "}
          <strong className="font-semibold">top-three share</strong> in percentage points. Seeing the
          two diverge here is the same phenomenon documented above for cloud infrastructure.
        </p>
        <h3 className="font-serif text-lg font-semibold">
          A known limitation: entrant flow dominates concentration
        </h3>
        <p>
          With the entrants dial at one or more per tick, the softmax spreads new demand almost
          uniformly across a growing firm population, so the market fragments whatever the other
          dials say. Mean final HHI is roughly 189 at maximum network strength and switching cost
          with one entrant per tick, against roughly 164 with both dials at zero — a difference too
          small to read. At zero entrants the same comparison is roughly 2,525 against 2,020, and the
          network-strength dial does what the narrative claims it does.
        </p>
        <p>
          This is a property of the model as specified, not a bug in the implementation, and it is
          why the default is zero entrants. It is also a fair warning about toy models in general:
          the parameter that dominates the output is not always the one the argument is about.
        </p>
      </Section>

      <Section id="limitations" title="Known limitations">
        <ul className="ml-5 list-disc space-y-3 marker:text-muted-foreground">
          <li>
            <strong className="font-semibold">Share by year barely exists in public.</strong>{" "}
            {marketsWithShares} of {markets.length} markets carry a share series. For every other
            market the data sits in paywalled analyst reports, and reconstructing it from vendor
            revenue divided by an estimated market size would produce a figure with the appearance
            of measurement and none of the substance. Those charts show &ldquo;no reliable public
            share data&rdquo; instead. The blank is itself a finding: very little of this industry is
            actually measured in public.
          </li>
          <li>
            <strong className="font-semibold">Market sizes are ranges.</strong> Analyst definitions
            differ by two to three times for the same category, so most sizes here are modeled bands
            rather than point estimates. Comparing two rectangles in the treemap tells you about
            orders of magnitude, not about percentages.
          </li>
          <li>
            <strong className="font-semibold">Private AI revenue is run-rate, not revenue.</strong>{" "}
            Press-reported &ldquo;annualised run rate&rdquo; is the latest month multiplied by
            twelve. It is not GAAP revenue and it overstates trailing revenue during hyper-growth.
            Every such figure here is labelled estimated and sourced to the reporting outlet, never
            to the company.
          </li>
          <li>
            <strong className="font-semibold">There is no market-cap series.</strong> Share price is
            not in SEC XBRL and no reachable source would have let one be built without fabrication,
            so the bubble chart never offers market capitalisation as a size metric. It offers gross
            margin ({companiesWithMargin} companies) and revenue ({companiesWithRevenue} companies)
            — the two the dataset can actually support.
          </li>
          <li>
            <strong className="font-semibold">Gross margin is derived, not filed.</strong> Every
            margin figure is modeled as one minus cost of revenue divided by revenue, both as filed.
            Five companies were dropped for lack of a clean total-cost-of-revenue tag, and two IBM
            years were skipped because a spin-off put the two inputs on different bases. AWS has no
            segment-level margin, so consolidated Amazon margin is used and labelled as such.
          </li>
          <li>
            <strong className="font-semibold">
              Revenue in a currency other than dollars is not shown.
            </strong>{" "}
            SAP reports in euros and the unit vocabulary here has no euro member. Converting without
            a verified period-matched exchange rate would be fabrication, so SAP ships with no
            revenue series and is a full participant everywhere else. An absent series is better than
            a quietly wrong axis.
          </li>
          <li>
            <strong className="font-semibold">Moat scores, signal strengths, flow weights and
            horizons are judgments.</strong> They are modeled, published with their rubric, and
            meant to be argued with. The emerging-market horizons are the softest numbers in the
            Atlas: naming the year a category will have an independent vendor above $1B of revenue
            is a guess with a rubric attached.
          </li>
          <li>
            <strong className="font-semibold">
              The emerging set is AI-heavy, and the skew is inherited.
            </strong>{" "}
            {aiFramedEmerging} of the {emerging.length} candidate markets on the radar are framed
            around AI. Only post-quantum cryptography sits outside it, and sovereign cloud is
            outside it only in part, through regulation. That shape comes from the Phase 1 research
            cut of 21 September 2026, not from the data layer: the research names{" "}
            {signalTypeCount} signal types, but of the {emergingSignals.length} signals recorded
            here {signalsOfType("platform-shift")} are platform shifts and{" "}
            {signalsOfType("leading-indicator")} are leading indicators, against{" "}
            {signalsOfType("regulation")} for regulation and {signalsOfType("unbundling")} for
            unbundling. The framework was not applied evenly. Applied evenly it would likely have
            surfaced regulation-driven categories — e-invoicing mandates, digital identity wallets,
            healthcare interoperability — and cost-curve-driven ones such as grid and energy
            management or battery software. The Atlas is not claiming those are emerging markets:
            no sourced evidence was gathered for them, which is why they are absent rather than
            scored low. The consequence is structural and visible on screen. The candidate set runs{" "}
            {emergingCategorySpread}, so {emptyRadarSectors} of the radar&apos;s{" "}
            {CATEGORY_ORDER.length} sectors are empty by construction. Two blank sectors are a
            property of the candidate set, not a rendering fault. The {emerging.length} candidates
            that did ship are each individually sourced.
          </li>
        </ul>
      </Section>

      <Section id="workflow" title="Updating the data">
        <p>
          All data lives in typed TypeScript files under{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">data/</code> and is parsed
          by Zod at import time, so a malformed figure fails the build rather than reaching a chart.
          The loop for changing anything is:
        </p>
        <ol className="ml-5 list-decimal space-y-2 marker:font-mono marker:text-muted-foreground">
          <li>
            Fetch the source and record it in{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">data/sources.ts</code>{" "}
            with <code className="font-mono text-xs">verified: true</code> and its URL. A URL that
            was not actually fetched may not be added.
          </li>
          <li>
            Add or edit the data point with its value, year, unit, source id and confidence. A
            modeled point must carry a note stating the method; a point with a range must satisfy
            low ≤ value ≤ high.
          </li>
          <li>
            Log the check — figure, source, what was found, whether it was accepted — in{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              docs/verification-log.md
            </code>
            .
          </li>
          <li>
            Run <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">npm run
            validate-data</code>, which re-checks referential integrity, the confidence rules and the
            range rules, then{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">npm run build</code>.
            Minimum collection volumes are enforced only by{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              npm run validate-data:strict
            </code>
            ; npm swallows a{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">--strict</code> flag
            appended to the plain script, so that form runs the lenient checks without saying so.
          </li>
        </ol>
      </Section>

      <Section id="disclosure" title="Disclosure">
        <p>
          This Atlas was produced by Claude, an AI model built by Anthropic.{" "}
          <strong className="font-semibold">
            Anthropic appears in this dataset as a market participant
          </strong>{" "}
          — in the foundation-model era, in the emerging-market radar and in the competitive events
          — and that is a conflict of interest worth stating plainly rather than burying.
        </p>
        <p>Three things were done to limit the bias it creates:</p>
        <ul className="ml-5 list-disc space-y-2 marker:text-muted-foreground">
          <li>
            Every Anthropic figure comes from third-party reporting, never from Anthropic&apos;s own
            materials.
          </li>
          <li>
            Anthropic is scored against the same moat rubric, on the same 0–5 scale, as its
            competitors, and its scores are visible next to theirs in the comparison tray.
          </li>
          <li>
            The bear case on foundation-model economics — that inference is a real marginal cost and
            that model labs may not capture the value they create — is stated explicitly in the
            narrative rather than argued away.
          </li>
        </ul>
        <p>
          You should still read anything this Atlas says about foundation models with that conflict
          in mind. The sources are listed below so you can check the claims against them directly.
        </p>
      </Section>

      <Section id="sources" title={`Sources (${sources.length})`}>
        <p>
          The complete registry. Every figure in the Atlas points at one of these ids, every
          tooltip names the source behind the number it is showing, and every citation chip in the
          story links straight to its entry here.
        </p>
        <h3 className="font-serif text-lg font-semibold">
          Fetched and verified in this project ({verifiedSources.length})
        </h3>
        <SourceList sources={verifiedSources} anchorIds />
        {literatureSources.length === 0 ? null : (
          <>
            <h3 className="pt-4 font-serif text-lg font-semibold">
              Cited from the literature ({literatureSources.length})
            </h3>
            <p className="text-muted-foreground">
              Books, papers and case law. These carry no URL, by design, and never back a reported
              data point.
            </p>
            <SourceList sources={literatureSources} anchorIds />
          </>
        )}
        {retrievedUnreadSources.length === 0 ? null : (
          <>
            <h3 className="pt-4 font-serif text-lg font-semibold">
              Retrieved but unread ({retrievedUnreadSources.length})
            </h3>
            <p className="text-muted-foreground">
              Real pages, and the links below are real — but their bodies are paywalled or their
              hosts block automated fetching, so nobody in this project has read the figure inside.
              The URL is kept so you can try it yourself; every figure resting on one of these ships
              as estimated, never as reported.
            </p>
            <SourceList sources={retrievedUnreadSources} anchorIds />
          </>
        )}
      </Section>
    </div>
  </div>
);

export default MethodologyPage;
