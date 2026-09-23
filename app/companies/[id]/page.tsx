import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ConfidenceBadge, EmptyState } from "@/components/charts/primitives";
import { EventTimeline } from "@/components/profile/EventTimeline";
import { MetricsGrid, type Metric } from "@/components/profile/MetricsGrid";
import { MoatSection } from "@/components/profile/MoatSection";
import { PinToCompare } from "@/components/profile/PinToCompare";
import { ProfileSeries } from "@/components/profile/SeriesChart";
import { SourceList } from "@/components/profile/SourceList";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { companies, events, markets, moatRubric, sources } from "@/data";
import type { Company, MoatKey } from "@/data/types";
import {
  archetypeLabel,
  categoryLabel,
  formatDataPoint,
  formatSignedPercent,
  moatLabel,
} from "@/lib/format";
import { growthAtYear } from "@/lib/scales";
import { byId, collectSourceIds, eventsForCompany, sourcesFor } from "@/lib/selectors";

type CompanyPageProps = { params: Promise<{ id: string }> };

export const generateStaticParams = (): { id: string }[] =>
  companies.map((company) => ({ id: company.id }));

export const generateMetadata = async ({ params }: CompanyPageProps): Promise<Metadata> => {
  const { id } = await params;
  const company = byId(companies, id);
  if (!company) return { title: "Company not found" };
  return {
    title: company.name,
    description: `${company.name}: founded ${company.founded}, ${archetypeLabel[company.archetype].toLowerCase()}. Revenue series, moat scores against the published rubric, competitive events and sources.`,
  };
};

const STATUS_LABEL: Record<Company["status"], string> = {
  public: "Public",
  private: "Private",
  acquired: "Acquired",
  defunct: "Defunct",
};

const MOAT_KEYS: readonly MoatKey[] = [
  "network",
  "switching",
  "scale",
  "data",
  "brand",
  "ecosystem",
  "regulatory",
];

const buildMetrics = (company: Company): Metric[] => {
  const metrics: Metric[] = [
    { label: "Founded", value: String(company.founded), detail: company.hq },
    {
      label: "Status",
      value: STATUS_LABEL[company.status],
      detail:
        company.acquiredById === undefined
          ? undefined
          : `Acquired by ${byId(companies, company.acquiredById)?.name ?? company.acquiredById}${
              company.acquiredYear === undefined ? "" : ` in ${company.acquiredYear}`
            }`,
    },
    {
      label: "Archetype",
      value: archetypeLabel[company.archetype],
      detail:
        company.secondaryArchetypes.length === 0
          ? "No secondary archetype recorded."
          : `Also: ${company.secondaryArchetypes.map((archetype) => archetypeLabel[archetype]).join(", ")}`,
    },
  ];

  const sortedRevenue = [...company.revenueByYear].sort((a, b) => a.year - b.year);
  const latestRevenue = sortedRevenue[sortedRevenue.length - 1];
  if (latestRevenue) {
    metrics.push({
      label: "Latest revenue",
      value: formatDataPoint(latestRevenue),
      point: latestRevenue,
      detail: `Fiscal ${latestRevenue.year}, ${sortedRevenue.length} years on file.`,
    });
    const growth = growthAtYear(sortedRevenue, latestRevenue.year);
    if (growth !== null) {
      metrics.push({
        label: "Revenue growth",
        value: formatSignedPercent(growth),
        detail: `Year on year into ${latestRevenue.year}, derived from the filed revenue series.`,
      });
    }
  }

  const sortedMargin = [...(company.grossMarginByYear ?? [])].sort((a, b) => a.year - b.year);
  const latestMargin = sortedMargin[sortedMargin.length - 1];
  if (latestMargin) {
    metrics.push({
      label: "Gross margin",
      value: formatDataPoint(latestMargin),
      point: latestMargin,
      detail: latestMargin.note,
    });
  }

  const moatTotal = MOAT_KEYS.reduce((sum, key) => sum + company.moats[key], 0);
  metrics.push({
    label: "Moat total",
    value: `${moatTotal} / 35`,
    detail: "Modeled: the sum of seven 0–5 judgments scored against the published rubric.",
  });

  return metrics;
};

const CompanyPage = async ({ params }: CompanyPageProps): Promise<React.ReactElement> => {
  const { id } = await params;
  const company = byId(companies, id);
  if (!company) notFound();

  const metrics = buildMetrics(company);
  const companyEvents = eventsForCompany(events, company.id);
  const memberMarkets = company.marketIds
    .map((marketId) => byId(markets, marketId))
    .filter((market): market is NonNullable<typeof market> => market !== undefined);

  const citedSourceIds = [
    ...collectSourceIds([...company.revenueByYear, ...(company.grossMarginByYear ?? [])]),
    ...companyEvents.flatMap((event) => event.sourceIds),
  ];
  const citedSources = sourcesFor(sources, citedSourceIds);

  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/explore/" className="underline underline-offset-4 hover:text-foreground">
          Explore
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Companies</span>
      </nav>

      <header className="mt-3">
        <h1 className="text-balance font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          {company.name}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{archetypeLabel[company.archetype]}</Badge>
          {company.secondaryArchetypes.map((archetype) => (
            <Badge key={archetype} variant="secondary">
              {archetypeLabel[archetype]}
            </Badge>
          ))}
          <Badge variant="outline">{STATUS_LABEL[company.status]}</Badge>
        </div>
      </header>

      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-28 w-full" />}>
          <PinToCompare id={company.id} name={company.name} />
        </Suspense>
      </div>

      <section aria-label="Key metrics" className="mt-8">
        <MetricsGrid metrics={metrics} />
      </section>

      <section aria-labelledby="revenue-heading" className="mt-10">
        <h2 id="revenue-heading" className="sr-only">
          Revenue
        </h2>
        <ProfileSeries
          title={`${company.name} revenue`}
          takeaway={
            company.revenueByYear.length === 0
              ? "No revenue series ships for this company."
              : "Annual revenue as filed or as reported by the cited source; the badge on each point says which."
          }
          source={
            company.revenueByYear.length === 0
              ? "No source, because no figure is claimed."
              : "Company filings and cited reporting, listed in full below."
          }
          seriesLabel="Revenue"
          points={company.revenueByYear}
          color="var(--cat-infrastructure)"
          emptyTitle="No revenue series for this company"
          emptyDescription={`${company.name} is a full participant in the Atlas — its markets, archetype, moats and events are all recorded — but no revenue figure could be verified to the standard the Atlas requires, so none is shown. Most private companies and most pre-2000 vendors are in this position.`}
        />
      </section>

      {(company.grossMarginByYear ?? []).length === 0 ? null : (
        <section aria-labelledby="margin-heading" className="mt-6">
          <h2 id="margin-heading" className="sr-only">
            Gross margin
          </h2>
          <ProfileSeries
            title={`${company.name} gross margin`}
            takeaway="Derived from the filings, not filed: one minus cost of revenue divided by revenue, both as reported."
            source="SEC XBRL company facts, derived in this project."
            seriesLabel="Gross margin"
            points={company.grossMarginByYear ?? []}
            color="var(--cat-vertical)"
            footnote="Every point on this series is modeled. The inputs are exact, so there is no range; the ratio is still our arithmetic and is labelled accordingly."
            emptyTitle="No gross-margin series"
            emptyDescription="No clean total-cost-of-revenue tag was available for this company."
          />
        </section>
      )}

      <section aria-labelledby="moats-heading" className="mt-10">
        <h2 id="moats-heading" className="font-serif text-2xl font-semibold">
          Moats
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-sm text-muted-foreground">
          Seven axes, each scored 0–5. These are{" "}
          <ConfidenceBadge confidence="modeled" /> judgments made in this project against the{" "}
          <Link
            href="/methodology/#moats"
            className="underline underline-offset-4 hover:text-foreground"
          >
            published rubric
          </Link>
          , not measurements. The rationale below says why.
        </p>
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed">
          {company.moatRationale}
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <MoatSection companyIds={[company.id]} />
          <dl className="divide-y divide-border rounded-lg border border-border">
            {MOAT_KEYS.map((moatKey) => (
              <div key={moatKey} className="px-4 py-3">
                <dt className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{moatLabel[moatKey]}</span>
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {company.moats[moatKey]} / 5
                  </span>
                </dt>
                <dd className="mt-1 text-pretty text-xs leading-snug text-muted-foreground">
                  {moatRubric[moatKey][company.moats[moatKey]]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="markets-heading" className="mt-10">
        <h2 id="markets-heading" className="font-serif text-2xl font-semibold">
          Markets
        </h2>
        {memberMarkets.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No market membership recorded"
              description="This company is referenced by events and eras but is not assigned to a market in the taxonomy."
            />
          </div>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {memberMarkets.map((market) => (
              <li key={market.id}>
                <Link
                  href={`/markets/${market.id}/`}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm underline-offset-4 hover:bg-secondary hover:underline"
                >
                  {market.name}
                  <span className="text-xs text-muted-foreground">
                    {categoryLabel[market.category]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="events-heading" className="mt-10">
        <h2 id="events-heading" className="font-serif text-2xl font-semibold">
          Events ({companyEvents.length})
        </h2>
        <div className="mt-4">
          <EventTimeline
            events={companyEvents}
            emptyTitle="No competitive events recorded"
            emptyDescription={`No acquisition, launch, platform shift or regulatory action in the dataset names ${company.name}. The event record covers structural moves, not every product release.`}
          />
        </div>
      </section>

      <section aria-labelledby="sources-heading" className="mt-10">
        <h2 id="sources-heading" className="font-serif text-2xl font-semibold">
          Sources ({citedSources.length})
        </h2>
        <div className="mt-4">
          <SourceList
            sources={citedSources}
            emptyTitle="No sources cited on this profile"
            emptyDescription={`Nothing on this page makes a quantitative claim about ${company.name}, so there is nothing to cite.`}
          />
        </div>
      </section>
    </article>
  );
};

export default CompanyPage;
