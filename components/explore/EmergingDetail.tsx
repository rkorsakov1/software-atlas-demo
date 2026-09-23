import Link from "next/link";

import { SourceList } from "@/components/profile/SourceList";
import { Badge } from "@/components/ui/badge";
import { companies, sources } from "@/data";
import type { EmergingMarket } from "@/data/types";
import { categoryLabel, horizonLabel, maturityLabel, signalTypeLabel } from "@/lib/format";
import { byId, signalStrengthTotal, sourcesFor } from "@/lib/selectors";

export type EmergingDetailProps = {
  market: EmergingMarket;
};

const STRENGTH_WORD: Record<1 | 2 | 3, string> = {
  1: "Weak",
  2: "Moderate",
  3: "Strong",
};

/**
 * The full case for one emerging market: thesis, every typed signal with the
 * sources behind it, the players already in it, and the risks. Shared by the
 * `/emerging` sheet and the Explore detail drawer.
 */
export const EmergingDetail = ({ market }: EmergingDetailProps): React.ReactElement => {
  const players = market.keyPlayerIds
    .map((playerId) => byId(companies, playerId))
    .filter((company): company is NonNullable<typeof company> => company !== undefined);

  const allSourceIds = market.signals.flatMap((signal) => signal.sourceIds);
  const citedSources = sourcesFor(sources, allSourceIds);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{categoryLabel[market.category]}</Badge>
        <Badge variant="outline">{maturityLabel[market.stage]}</Badge>
        <Badge variant="outline">Horizon {horizonLabel[market.horizon]}</Badge>
        <Badge variant="secondary">Signal strength {signalStrengthTotal(market)}</Badge>
      </div>

      <section aria-labelledby={`${market.id}-thesis`}>
        <h3 id={`${market.id}-thesis`} className="font-serif text-base font-semibold">
          Thesis
        </h3>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed">{market.thesis}</p>
      </section>

      <section aria-labelledby={`${market.id}-signals`}>
        <h3 id={`${market.id}-signals`} className="font-serif text-base font-semibold">
          Signals ({market.signals.length})
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Signal strength is a modeled 1–3 judgment of how much weight the evidence carries; a 3
          requires verified financial or regulatory evidence. It says nothing about how large the
          market is.
        </p>
        <ul className="mt-3 space-y-3">
          {market.signals.map((signal) => (
            <li
              key={`${signal.type}-${signal.evidence.slice(0, 24)}`}
              className="rounded-md border border-border bg-card p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{signalTypeLabel[signal.type]}</Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  {STRENGTH_WORD[signal.strength]} · {signal.strength}/3
                </span>
              </div>
              <p className="mt-2 text-pretty text-sm leading-relaxed">{signal.evidence}</p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {signal.sourceIds.length === 0
                  ? "No source recorded"
                  : `Sources: ${signal.sourceIds.join(", ")}`}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {players.length === 0 ? null : (
        <section aria-labelledby={`${market.id}-players`}>
          <h3 id={`${market.id}-players`} className="font-serif text-base font-semibold">
            Players already here
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {players.map((company) => (
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

      <section aria-labelledby={`${market.id}-risks`}>
        <h3 id={`${market.id}-risks`} className="font-serif text-base font-semibold">
          Risks
        </h3>
        <ul className="mt-2 ml-5 list-disc space-y-1.5 text-sm marker:text-muted-foreground">
          {market.risks.map((risk) => (
            <li key={risk.slice(0, 32)} className="text-pretty">
              {risk}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={`${market.id}-sources`}>
        <h3 id={`${market.id}-sources`} className="font-serif text-base font-semibold">
          Sources
        </h3>
        <div className="mt-2">
          <SourceList
            sources={citedSources}
            emptyTitle="No sources recorded for these signals"
            emptyDescription="This market's signals are argued from the surrounding narrative rather than from a citable document."
          />
        </div>
      </section>
    </div>
  );
};
