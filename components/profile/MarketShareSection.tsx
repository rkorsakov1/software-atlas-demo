"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";

import { useHighlight } from "@/components/explore/HighlightContext";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/charts/primitives";
import { companies, events, markets, sources, vendors } from "@/data";
import { byId, eventsForMarket, shareSeries, sourceTitle } from "@/lib/selectors";

const ShareStackedArea = dynamic(
  () => import("@/components/charts/ShareStackedArea").then((module) => module.ShareStackedArea),
  { ssr: false, loading: () => <Skeleton className="h-[420px] w-full" /> },
);

export type MarketShareSectionProps = {
  marketId: string;
};

/**
 * Share over time for one market. Where `sharesByYear` is empty the chart itself
 * renders the "no reliable public share data" state, which is the honest answer
 * for every market here except cloud infrastructure.
 */
export const MarketShareSection = ({ marketId }: MarketShareSectionProps): React.ReactElement => {
  const { highlightedCompanyId, handleHoverCompany } = useHighlight();

  const market = byId(markets, marketId);

  const series = useMemo(() => (market ? shareSeries(market) : []), [market]);

  const companyNames = useMemo<Record<string, string>>(() => {
    const names: Record<string, string> = {};
    for (const point of series) {
      for (const share of point.shares) {
        const holder = byId(companies, share.companyId) ?? byId(vendors, share.companyId);
        if (holder) names[share.companyId] = holder.name;
      }
    }
    return names;
  }, [series]);

  const marketEvents = useMemo(() => eventsForMarket(events, marketId), [marketId]);

  const sourceTitleFor = useCallback(
    (sourceId: string): string => sourceTitle(sources, sourceId),
    [],
  );

  if (!market) {
    return (
      <EmptyState
        title="Market not found"
        description="This market id does not resolve in the loaded dataset."
      />
    );
  }

  return (
    <ShareStackedArea
      marketName={market.name}
      series={series}
      companyNames={companyNames}
      events={marketEvents}
      sourceTitleFor={sourceTitleFor}
      highlightedCompanyId={highlightedCompanyId}
      onHoverCompany={handleHoverCompany}
    />
  );
};
