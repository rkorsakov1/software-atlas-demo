"use client";

import Link from "next/link";
import { Pin, PinOff } from "lucide-react";

import { ConfidenceBadge, EmptyState } from "@/components/charts/primitives";
import { EmergingDetail } from "@/components/explore/EmergingDetail";
import { MoatRationaleList } from "@/components/profile/MoatRationaleList";
import { SourceList } from "@/components/profile/SourceList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { companies, emerging, events, markets, sources } from "@/data";
import type { Company, CompetitiveEvent, Market, MoatKey } from "@/data/types";
import {
  archetypeLabel,
  categoryLabel,
  eventTypeLabel,
  formatDataPoint,
  maturityLabel,
  moatLabel,
} from "@/lib/format";
import {
  byId,
  companiesInMarket,
  eventsForCompany,
  eventsForMarket,
  sourcesFor,
} from "@/lib/selectors";
import { MAX_PINS, type FocusRef } from "@/lib/url-state";

const MOAT_KEYS: readonly MoatKey[] = [
  "network",
  "switching",
  "scale",
  "data",
  "brand",
  "ecosystem",
  "regulatory",
];

const RECENT_EVENT_LIMIT = 6;

export type DetailDrawerProps = {
  focus: FocusRef | null;
  onClose: () => void;
  pinnedIds: readonly string[];
  onTogglePin: (id: string) => void;
  /** Focused when the drawer closes, so keyboard focus never lands on the body. */
  returnFocusElementId: string;
};

type Resolved =
  | { kind: "company"; company: Company }
  | { kind: "market"; market: Market }
  | { kind: "emerging"; id: string }
  | { kind: "event"; event: CompetitiveEvent };

const resolveFocus = (focus: FocusRef | null): Resolved | null => {
  if (focus === null) return null;
  if (focus.kind === "company") {
    const company = byId(companies, focus.id);
    return company ? { kind: "company", company } : null;
  }
  if (focus.kind === "market") {
    const market = byId(markets, focus.id);
    if (market) return { kind: "market", market };
    const candidate = byId(emerging, focus.id);
    return candidate ? { kind: "emerging", id: candidate.id } : null;
  }
  const event = byId(events, focus.id);
  return event ? { kind: "event", event } : null;
};

type PinControlProps = {
  id: string;
  name: string;
  pinnedIds: readonly string[];
  onTogglePin: (id: string) => void;
};

const PinControl = ({
  id,
  name,
  pinnedIds,
  onTogglePin,
}: PinControlProps): React.ReactElement => {
  const isPinned = pinnedIds.includes(id);
  const isFull = !isPinned && pinnedIds.length >= MAX_PINS;

  return (
    <Button
      type="button"
      size="sm"
      variant={isPinned ? "secondary" : "outline"}
      aria-pressed={isPinned}
      disabled={isFull}
      onClick={() => onTogglePin(id)}
      title={isFull ? `Three items are already pinned. Unpin one to add ${name}.` : undefined}
    >
      {isPinned ? (
        <PinOff aria-hidden="true" className="size-4" />
      ) : (
        <Pin aria-hidden="true" className="size-4" />
      )}
      {isPinned ? "Unpin" : "Pin to compare"}
    </Button>
  );
};

/**
 * One drawer for whatever `focus` names: a company, a market, an emerging market
 * or an event. Focus returns to the chart panel on close, so a keyboard reader is
 * never dropped at the top of the document.
 */
export const DetailDrawer = ({
  focus,
  onClose,
  pinnedIds,
  onTogglePin,
  returnFocusElementId,
}: DetailDrawerProps): React.ReactElement => {
  const resolved = resolveFocus(focus);

  const handleOpenChange = (open: boolean): void => {
    if (open) return;
    onClose();
  };

  const handleCloseAutoFocus = (event: Event): void => {
    const target = document.getElementById(returnFocusElementId);
    if (!target) return;
    event.preventDefault();
    target.focus();
  };

  return (
    <Sheet open={focus !== null} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto pt-4 sm:max-w-xl"
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        {resolved === null ? (
          <div className="p-6">
            <SheetHeader className="px-0">
              <SheetTitle className="font-serif text-xl">Nothing to show</SheetTitle>
              <SheetDescription>
                The focused id does not resolve in the loaded dataset.
              </SheetDescription>
            </SheetHeader>
            <EmptyState
              title="Unknown selection"
              description="The link you followed names an entity that is not in this build of the Atlas."
            />
          </div>
        ) : null}

        {resolved?.kind === "company" ? (
          <CompanyDetail
            company={resolved.company}
            pinnedIds={pinnedIds}
            onTogglePin={onTogglePin}
          />
        ) : null}

        {resolved?.kind === "market" ? (
          <MarketDetail market={resolved.market} pinnedIds={pinnedIds} onTogglePin={onTogglePin} />
        ) : null}

        {resolved?.kind === "emerging" ? <EmergingFocus id={resolved.id} /> : null}

        {resolved?.kind === "event" ? <EventDetail event={resolved.event} /> : null}
      </SheetContent>
    </Sheet>
  );
};

type CompanyDetailProps = {
  company: Company;
  pinnedIds: readonly string[];
  onTogglePin: (id: string) => void;
};

const CompanyDetail = ({
  company,
  pinnedIds,
  onTogglePin,
}: CompanyDetailProps): React.ReactElement => {
  const revenue = [...company.revenueByYear].sort((a, b) => a.year - b.year);
  const latest = revenue[revenue.length - 1];
  const companyEvents = eventsForCompany(events, company.id).slice(-RECENT_EVENT_LIMIT).reverse();
  const memberMarkets = company.marketIds
    .map((marketId) => byId(markets, marketId))
    .filter((market): market is Market => market !== undefined);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-serif text-xl">{company.name}</SheetTitle>
        <SheetDescription>
          Founded {company.founded} · {company.hq}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6 px-4 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{archetypeLabel[company.archetype]}</Badge>
          <Badge variant="secondary">{company.status}</Badge>
          <PinControl
            id={company.id}
            name={company.name}
            pinnedIds={pinnedIds}
            onTogglePin={onTogglePin}
          />
        </div>

        {latest === undefined ? (
          <EmptyState
            title="No revenue series"
            description={`No revenue figure for ${company.name} could be verified to the Atlas standard, so none is shown. The company is a full participant everywhere else.`}
          />
        ) : (
          <div className="rounded-md border border-border p-3">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Latest revenue
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-serif text-xl font-semibold tabular-nums">
                {formatDataPoint(latest)}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{latest.year}</span>
              <ConfidenceBadge confidence={latest.confidence} note={latest.note} />
            </p>
          </div>
        )}

        <section>
          <h3 className="font-serif text-base font-semibold">Moats</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Modeled 0–5 judgments against the published rubric.
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {MOAT_KEYS.map((moatKey) => (
              <li key={moatKey} className="flex justify-between gap-2">
                <span className="truncate text-muted-foreground">{moatLabel[moatKey]}</span>
                <span className="font-mono tabular-nums">{company.moats[moatKey]}</span>
              </li>
            ))}
          </ul>
          <MoatRationaleList rationale={company.moatRationale} />
        </section>

        {memberMarkets.length === 0 ? null : (
          <section>
            <h3 className="font-serif text-base font-semibold">Markets</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {memberMarkets.map((market) => (
                <li key={market.id}>
                  <Link
                    href={`/markets/${market.id}/`}
                    className="inline-flex rounded-full border border-border px-2.5 py-1 text-xs underline-offset-4 hover:bg-secondary hover:underline"
                  >
                    {market.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {companyEvents.length === 0 ? null : (
          <section>
            <h3 className="font-serif text-base font-semibold">Most recent events</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {companyEvents.map((event) => (
                <li key={event.id}>
                  <span className="font-mono text-xs text-muted-foreground">{event.year}</span>{" "}
                  {event.title}
                </li>
              ))}
            </ul>
          </section>
        )}

        <Button asChild size="sm">
          <Link href={`/companies/${company.id}/`}>Open the full profile</Link>
        </Button>
      </div>
    </>
  );
};

type MarketDetailProps = {
  market: Market;
  pinnedIds: readonly string[];
  onTogglePin: (id: string) => void;
};

const MarketDetail = ({
  market,
  pinnedIds,
  onTogglePin,
}: MarketDetailProps): React.ReactElement => {
  const size = [...market.sizeByYear].sort((a, b) => a.year - b.year);
  const latest = size[size.length - 1];
  const vendors = companiesInMarket(companies, market.id);
  const marketEvents = eventsForMarket(events, market.id).slice(-RECENT_EVENT_LIMIT).reverse();

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-serif text-xl">{market.name}</SheetTitle>
        <SheetDescription>
          {categoryLabel[market.category]} · {maturityLabel[market.maturity]} · since{" "}
          {market.originYear}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6 px-4 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {market.sizeBand === undefined ? null : (
            <Badge variant="outline">Band {market.sizeBand}</Badge>
          )}
          <PinControl
            id={market.id}
            name={market.name}
            pinnedIds={pinnedIds}
            onTogglePin={onTogglePin}
          />
        </div>

        <section>
          <h3 className="font-serif text-base font-semibold">What is counted</h3>
          <p className="mt-1.5 text-pretty text-sm leading-relaxed">{market.definition}</p>
        </section>

        {latest === undefined ? (
          <EmptyState
            title="This market is not sized"
            description="No analyst figure could be verified and no defensible band could be built, so the Atlas records no size."
          />
        ) : (
          <div className="rounded-md border border-border p-3">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Annual spend
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-serif text-xl font-semibold tabular-nums">
                {formatDataPoint(latest)}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{latest.year}</span>
              <ConfidenceBadge confidence={latest.confidence} note={latest.note} />
            </p>
          </div>
        )}

        {market.sharesByYear.length === 0 ? (
          <EmptyState
            title="No reliable public share data"
            description={`Share by year for ${market.name} sits in paywalled analyst reports. Reconstructing it would produce a figure with the appearance of measurement and none of the substance.`}
          />
        ) : null}

        {vendors.length === 0 ? null : (
          <section>
            <h3 className="font-serif text-base font-semibold">Vendors ({vendors.length})</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {vendors.slice(0, 12).map((company) => (
                <li key={company.id}>
                  <Link
                    href={`/companies/${company.id}/`}
                    className="inline-flex rounded-full border border-border px-2.5 py-1 text-xs underline-offset-4 hover:bg-secondary hover:underline"
                  >
                    {company.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {marketEvents.length === 0 ? null : (
          <section>
            <h3 className="font-serif text-base font-semibold">Most recent events</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {marketEvents.map((event) => (
                <li key={event.id}>
                  <span className="font-mono text-xs text-muted-foreground">{event.year}</span>{" "}
                  {event.title}
                </li>
              ))}
            </ul>
          </section>
        )}

        <Button asChild size="sm">
          <Link href={`/markets/${market.id}/`}>Open the full profile</Link>
        </Button>
      </div>
    </>
  );
};

type EventDetailProps = { event: CompetitiveEvent };

const EventDetail = ({ event }: EventDetailProps): React.ReactElement => {
  const relatedCompanies = event.companyIds
    .map((companyId) => byId(companies, companyId))
    .filter((company): company is Company => company !== undefined);
  const relatedMarkets = event.marketIds
    .map((marketId) => byId(markets, marketId))
    .filter((market): market is Market => market !== undefined);
  const citedSources = sourcesFor(sources, event.sourceIds);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-pretty font-serif text-xl">{event.title}</SheetTitle>
        <SheetDescription>
          {event.year} · {eventTypeLabel[event.type]}
          {event.status === undefined ? "" : ` · ${event.status}`}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6 px-4 pb-8">
        {event.dealValue === undefined ? null : (
          <div className="rounded-md border border-border p-3">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Deal value
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-serif text-xl font-semibold tabular-nums">
                {formatDataPoint(event.dealValue)}
              </span>
              <ConfidenceBadge
                confidence={event.dealValue.confidence}
                note={event.dealValue.note}
              />
            </p>
          </div>
        )}

        <section>
          <h3 className="font-serif text-base font-semibold">Why it mattered</h3>
          <p className="mt-1.5 text-pretty text-sm leading-relaxed">{event.impact}</p>
        </section>

        {relatedCompanies.length === 0 ? null : (
          <section>
            <h3 className="font-serif text-base font-semibold">Companies</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {relatedCompanies.map((company) => (
                <li key={company.id}>
                  <Link
                    href={`/companies/${company.id}/`}
                    className="inline-flex rounded-full border border-border px-2.5 py-1 text-xs underline-offset-4 hover:bg-secondary hover:underline"
                  >
                    {company.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {relatedMarkets.length === 0 ? null : (
          <section>
            <h3 className="font-serif text-base font-semibold">Markets</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {relatedMarkets.map((market) => (
                <li key={market.id}>
                  <Link
                    href={`/markets/${market.id}/`}
                    className="inline-flex rounded-full border border-border px-2.5 py-1 text-xs underline-offset-4 hover:bg-secondary hover:underline"
                  >
                    {market.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3 className="font-serif text-base font-semibold">Sources</h3>
          <div className="mt-2">
            <SourceList
              sources={citedSources}
              emptyTitle="No source recorded"
              emptyDescription="This event is in the dataset without a citation, which the validator treats as a defect."
            />
          </div>
        </section>
      </div>
    </>
  );
};

type EmergingFocusProps = { id: string };

const EmergingFocus = ({ id }: EmergingFocusProps): React.ReactElement | null => {
  const market = byId(emerging, id);
  if (!market) return null;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-serif text-xl">{market.name}</SheetTitle>
        <SheetDescription>
          A candidate market, scored on typed and sourced signals rather than asserted.
        </SheetDescription>
      </SheetHeader>
      <div className="px-4 pb-8">
        <EmergingDetail market={market} />
      </div>
    </>
  );
};
