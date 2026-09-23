import Link from "next/link";

import { ConfidenceBadge, EmptyState } from "@/components/charts/primitives";
import { Badge } from "@/components/ui/badge";
import { companies, markets } from "@/data";
import type { CompetitiveEvent } from "@/data/types";
import { eventTypeLabel, formatDataPoint } from "@/lib/format";
import { byId } from "@/lib/selectors";

export type EventTimelineProps = {
  events: readonly CompetitiveEvent[];
  emptyTitle: string;
  emptyDescription: string;
};

const MONTHS: readonly string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const eventDate = (event: CompetitiveEvent): string => {
  if (event.month === undefined) return String(event.year);
  const name = MONTHS[event.month - 1];
  return name === undefined ? String(event.year) : `${name} ${event.year}`;
};

/**
 * Every sourced event that touches this company or market, oldest first. Deal
 * values carry their own confidence badge; an undisclosed deal shows no number
 * rather than an estimate.
 */
export const EventTimeline = ({
  events,
  emptyTitle,
  emptyDescription,
}: EventTimelineProps): React.ReactElement => {
  if (events.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {events.map((event) => {
        const relatedCompanies = event.companyIds
          .map((companyId) => byId(companies, companyId))
          .filter((company): company is NonNullable<typeof company> => company !== undefined);
        const relatedMarkets = event.marketIds
          .map((marketId) => byId(markets, marketId))
          .filter((market): market is NonNullable<typeof market> => market !== undefined);

        return (
          <li key={event.id} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[26px] top-1.5 size-2.5 rounded-full border border-border bg-foreground"
            />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-mono text-xs text-muted-foreground">{eventDate(event)}</span>
              <Badge variant="outline">{eventTypeLabel[event.type]}</Badge>
              {event.status === undefined ? null : (
                <span className="font-mono text-xs text-muted-foreground">{event.status}</span>
              )}
            </div>
            <h3 className="mt-1 text-pretty font-serif text-base font-semibold">{event.title}</h3>
            {event.dealValue === undefined ? null : (
              <p className="mt-1 flex items-center gap-2 text-sm">
                <span className="font-medium tabular-nums">
                  {formatDataPoint(event.dealValue)}
                </span>
                <ConfidenceBadge
                  confidence={event.dealValue.confidence}
                  note={event.dealValue.note}
                />
              </p>
            )}
            <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
              {event.impact}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {relatedCompanies.length === 0 ? null : (
                <span className="flex flex-wrap gap-x-2 gap-y-1">
                  {relatedCompanies.map((company) => (
                    <Link
                      key={company.id}
                      href={`/companies/${company.id}/`}
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {company.name}
                    </Link>
                  ))}
                </span>
              )}
              {relatedMarkets.length === 0 ? null : (
                <span className="flex flex-wrap gap-x-2 gap-y-1">
                  {relatedMarkets.map((market) => (
                    <Link
                      key={market.id}
                      href={`/markets/${market.id}/`}
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {market.name}
                    </Link>
                  ))}
                </span>
              )}
              <span className="font-mono">
                {event.sourceIds.length === 0 ? "No source" : event.sourceIds.join(", ")}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
