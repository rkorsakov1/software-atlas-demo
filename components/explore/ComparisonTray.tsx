"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { useHighlight } from "@/components/explore/HighlightContext";
import { Button } from "@/components/ui/button";
import { companies, markets } from "@/data";
import { cn } from "@/lib/cn";
import { archetypeLabel, categoryLabel } from "@/lib/format";
import { byId } from "@/lib/selectors";
import { MAX_PINS } from "@/lib/url-state";

type PinnedEntity = {
  id: string;
  name: string;
  kind: "company" | "market";
  detail: string;
  href: string;
};

const resolvePin = (id: string): PinnedEntity | null => {
  const company = byId(companies, id);
  if (company) {
    return {
      id,
      name: company.name,
      kind: "company",
      detail: archetypeLabel[company.archetype],
      href: `/companies/${company.id}/`,
    };
  }
  const market = byId(markets, id);
  if (market) {
    return {
      id,
      name: market.name,
      kind: "market",
      detail: categoryLabel[market.category],
      href: `/markets/${market.id}/`,
    };
  }
  return null;
};

export type ComparisonTrayProps = {
  pinnedIds: readonly string[];
  onUnpin: (id: string) => void;
  onClear: () => void;
  /** Rendered as a link into the moat comparison; omit when already in Explore. */
  exploreHref?: string;
  className?: string;
};

/**
 * Up to three pinned companies or markets, shared by Explore and the profiles.
 * The cap lives in `togglePin`, so the tray only has to show what is pinned and
 * say how many slots are left.
 */
export const ComparisonTray = ({
  pinnedIds,
  onUnpin,
  onClear,
  exploreHref,
  className,
}: ComparisonTrayProps): React.ReactElement => {
  const { highlightedCompanyId, highlightedMarketId, handleHoverCompany, handleHoverMarket } =
    useHighlight();

  const entities = pinnedIds
    .map(resolvePin)
    .filter((entity): entity is PinnedEntity => entity !== null);

  return (
    <section
      aria-label="Comparison tray"
      className={cn("rounded-lg border border-border bg-card p-3", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Pinned to compare · {entities.length}/{MAX_PINS}
        </h2>
        {entities.length === 0 ? null : (
          <div className="flex items-center gap-2">
            {exploreHref === undefined ? null : (
              <Button asChild size="xs" variant="outline">
                <Link href={exploreHref}>Compare in Explore</Link>
              </Button>
            )}
            <Button size="xs" variant="ghost" onClick={onClear}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {entities.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Nothing pinned. Pin up to {MAX_PINS} companies or markets to overlay them on the moat
          radar and compare them side by side; the pins travel in the URL, so the link you copy
          carries them.
        </p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {entities.map((entity) => {
            const isHighlighted =
              entity.kind === "company"
                ? highlightedCompanyId === entity.id
                : highlightedMarketId === entity.id;

            const handleEnter = (): void => {
              if (entity.kind === "company") {
                handleHoverCompany(entity.id);
                return;
              }
              handleHoverMarket(entity.id);
            };

            const handleLeave = (): void => {
              if (entity.kind === "company") {
                handleHoverCompany(null);
                return;
              }
              handleHoverMarket(null);
            };

            return (
              <li
                key={entity.id}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                className={cn(
                  "flex items-center gap-1 rounded-full border border-border py-1 pl-3 pr-1 text-xs transition-colors",
                  { "border-foreground bg-secondary": isHighlighted },
                )}
              >
                <Link
                  href={entity.href}
                  onFocus={handleEnter}
                  onBlur={handleLeave}
                  className="underline-offset-4 hover:underline"
                >
                  {entity.name}
                </Link>
                <span className="text-muted-foreground">{entity.detail}</span>
                <button
                  type="button"
                  onClick={() => onUnpin(entity.id)}
                  aria-label={`Unpin ${entity.name}`}
                  className="ml-0.5 rounded-full p-1 hover:bg-secondary"
                >
                  <X aria-hidden="true" className="size-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
