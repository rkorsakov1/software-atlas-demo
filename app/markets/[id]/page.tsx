import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EmptyState } from "@/components/charts/primitives";
import { EventTimeline } from "@/components/profile/EventTimeline";
import { MarketShareSection } from "@/components/profile/MarketShareSection";
import { MetricsGrid, type Metric } from "@/components/profile/MetricsGrid";
import { PinToCompare } from "@/components/profile/PinToCompare";
import { ProfileSeries } from "@/components/profile/SeriesChart";
import { SourceList } from "@/components/profile/SourceList";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { companies, events, markets, sources } from "@/data";
import type { Market } from "@/data/types";
import {
  archetypeLabel,
  categoryLabel,
  formatDataPoint,
  formatValue,
  maturityLabel,
} from "@/lib/format";
import { concentrationLabel, concentrationBand } from "@/lib/hhi";
import {
  byId,
  collectSourceIds,
  companiesInMarket,
  eventsForMarket,
  marketAncestors,
  marketChildren,
  sourcesFor,
} from "@/lib/selectors";

type MarketPageProps = { params: Promise<{ id: string }> };

export const generateStaticParams = (): { id: string }[] =>
  markets.map((market) => ({ id: market.id }));

export const generateMetadata = async ({ params }: MarketPageProps): Promise<Metadata> => {
  const { id } = await params;
  const market = byId(markets, id);
  if (!market) return { title: "Market not found" };
  return {
    title: market.name,
    description: `${market.name}: ${market.definition} Size, concentration, vendors, events and sources.`,
  };
};

const buildMetrics = (market: Market): Metric[] => {
  const metrics: Metric[] = [
    { label: "Category", value: categoryLabel[market.category] },
    { label: "Maturity", value: maturityLabel[market.maturity] },
    {
      label: "Origin",
      value: String(market.originYear),
      detail: "The year the Atlas dates the market's formation, not any one vendor's founding.",
    },
  ];

  const sortedSize = [...market.sizeByYear].sort((a, b) => a.year - b.year);
  const latestSize = sortedSize[sortedSize.length - 1];
  if (latestSize) {
    metrics.push({
      label: "Annual spend",
      value: formatDataPoint(latestSize),
      point: latestSize,
      detail:
        market.sizeBand === undefined
          ? latestSize.note
          : `Band ${market.sizeBand}${
              latestSize.low === undefined || latestSize.high === undefined
                ? ""
                : ` (${formatValue(latestSize.low, latestSize.unit)}–${formatValue(latestSize.high, latestSize.unit)})`
            }. ${latestSize.note ?? ""}`.trim(),
    });
  }

  if (market.growthRate) {
    metrics.push({
      label: "Growth rate",
      value: formatDataPoint(market.growthRate),
      point: market.growthRate,
      detail: market.growthRate.note,
    });
  }

  if (market.hhi) {
    metrics.push({
      label: "HHI",
      value: market.hhi.value.toLocaleString("en-US"),
      point: market.hhi,
      detail: concentrationLabel[concentrationBand(market.hhi.value)],
    });
  }

  metrics.push({
    label: "Pricing model",
    value: market.pricingModel,
    detail: `Buyer: ${market.buyerPersona}`,
  });

  return metrics;
};

const MarketPage = async ({ params }: MarketPageProps): Promise<React.ReactElement> => {
  const { id } = await params;
  const market = byId(markets, id);
  if (!market) notFound();

  const metrics = buildMetrics(market);
  const ancestors = marketAncestors(markets, market.id);
  const children = marketChildren(markets, market.id);
  const vendors = companiesInMarket(companies, market.id);
  const marketEvents = eventsForMarket(events, market.id);

  const sharePoints = market.sharesByYear.flatMap((entry) =>
    entry.shares.map((share) => share.share),
  );

  const citedSourceIds = [
    ...collectSourceIds([...market.sizeByYear, market.growthRate, market.hhi, ...sharePoints]),
    ...marketEvents.flatMap((event) => event.sourceIds),
  ];
  const citedSources = sourcesFor(sources, citedSourceIds);

  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/explore/" className="underline underline-offset-4 hover:text-foreground">
          Explore
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Markets</span>
        {ancestors.map((ancestor) => (
          <span key={ancestor.id}>
            <span aria-hidden="true"> / </span>
            <Link
              href={`/markets/${ancestor.id}/`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {ancestor.name}
            </Link>
          </span>
        ))}
      </nav>

      <header className="mt-3">
        <h1 className="text-balance font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          {market.name}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{categoryLabel[market.category]}</Badge>
          <Badge variant="secondary">{maturityLabel[market.maturity]}</Badge>
          {market.sizeBand === undefined ? null : (
            <Badge variant="outline">Band {market.sizeBand}</Badge>
          )}
        </div>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed">
          {market.description}
        </p>
        <div className="mt-4 max-w-3xl rounded-md border border-border bg-muted/40 p-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            What is counted
          </h2>
          <p className="mt-1.5 text-pretty text-sm leading-relaxed">{market.definition}</p>
        </div>
      </header>

      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-28 w-full" />}>
          <PinToCompare id={market.id} name={market.name} />
        </Suspense>
      </div>

      <section aria-label="Key metrics" className="mt-8">
        <MetricsGrid metrics={metrics} />
      </section>

      <section aria-labelledby="size-heading" className="mt-10">
        <h2 id="size-heading" className="sr-only">
          Market size
        </h2>
        <ProfileSeries
          title={`${market.name}: annual spend`}
          takeaway="Where a verified analyst figure exists it is plotted as reported; otherwise the point is a modeled order-of-magnitude band whose whisker is the claim."
          source="Analyst press releases and company filings, listed in full below."
          seriesLabel="Annual spend"
          points={market.sizeByYear}
          color="var(--cat-horizontal)"
          footnote="A band's midpoint exists so the line can be drawn. Read the whisker, not the dot."
          emptyTitle="This market is not sized"
          emptyDescription={`No analyst figure for ${market.name} could be verified and no defensible band could be built from vendor revenue, so the Atlas records no size. It is listed as "not sized" beneath the treemap rather than given an invented rectangle.`}
        />
      </section>

      <section aria-labelledby="share-heading" className="mt-6">
        <h2 id="share-heading" className="sr-only">
          Market share
        </h2>
        <MarketShareSection marketId={market.id} />
      </section>

      {children.length === 0 ? null : (
        <section aria-labelledby="segments-heading" className="mt-10">
          <h2 id="segments-heading" className="font-serif text-2xl font-semibold">
            Segments ({children.length})
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/markets/${child.id}/`}
                  className="block rounded-lg border border-border bg-card p-3 transition-colors hover:bg-secondary/60"
                >
                  <span className="font-serif text-base font-semibold">{child.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {maturityLabel[child.maturity]}
                    {child.sizeBand === undefined ? "" : ` · band ${child.sizeBand}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="vendors-heading" className="mt-10">
        <h2 id="vendors-heading" className="font-serif text-2xl font-semibold">
          Vendors ({vendors.length})
        </h2>
        {vendors.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No vendor assigned to this market"
              description="The market is part of the taxonomy but no company in the dataset lists it among its markets."
            />
          </div>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {vendors.map((company) => (
              <li key={company.id}>
                <Link
                  href={`/companies/${company.id}/`}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm underline-offset-4 hover:bg-secondary hover:underline"
                >
                  {company.name}
                  <span className="text-xs text-muted-foreground">
                    {archetypeLabel[company.archetype]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="events-heading" className="mt-10">
        <h2 id="events-heading" className="font-serif text-2xl font-semibold">
          Events ({marketEvents.length})
        </h2>
        <div className="mt-4">
          <EventTimeline
            events={marketEvents}
            emptyTitle="No competitive events recorded"
            emptyDescription={`No structural move in the dataset is tagged to ${market.name}. Events cover acquisitions, bundling, platform shifts and regulation, not every product launch.`}
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
            emptyDescription={`Nothing on this page makes a quantitative claim about ${market.name}, so there is nothing to cite.`}
          />
        </div>
      </section>
    </article>
  );
};

export default MarketPage;
