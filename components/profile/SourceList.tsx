import { EmptyState } from "@/components/charts/primitives";
import {
  verificationExplanation,
  verificationLabel,
  verificationState,
} from "@/components/profile/verification";
import type { Reliability, Source, SourceKind } from "@/data/types";
import { cn } from "@/lib/cn";

const kindLabel: Record<SourceKind, string> = {
  filing: "Filing",
  company: "Company",
  analyst: "Analyst",
  press: "Press",
  academic: "Academic",
  book: "Book",
  legal: "Legal",
};

const reliabilityLabel: Record<Reliability, string> = {
  primary: "Primary",
  secondary: "Secondary",
  low: "Low",
};

export type SourceListProps = {
  sources: readonly Source[];
  /**
   * Gives every entry an `id="source-<id>"` anchor. Set it only on the one list
   * that owns the full registry — the methodology page — so inline citations in
   * Story have a single, unambiguous target to link at.
   */
  anchorIds?: boolean;
  /** Shown instead of the list when there is nothing to cite. */
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

/**
 * The one way the Atlas prints a citation. `verified` (✓) means the URL was
 * retrieved in this project and the figure was seen in the retrieved content;
 * everything else is marked ◇ and never backs a `reported` figure. The two
 * reasons for ◇ — literature cited without a URL, and a real page nobody here
 * has read — are labelled apart, so a URL under a ◇ badge explains itself. Both
 * states are shown, because hiding the unverified ones would make the
 * bibliography look stronger than it is.
 */
export const SourceList = ({
  sources,
  anchorIds = false,
  emptyTitle = "No sources recorded",
  emptyDescription = "Nothing in this view carries a citation yet, so none is shown.",
  className,
}: SourceListProps): React.ReactElement => {
  if (sources.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className={cn("divide-y divide-border rounded-md border border-border", className)}>
      {sources.map((source) => {
        const state = verificationState(source);

        return (
          <li
            key={source.id}
            id={anchorIds ? `source-${source.id}` : undefined}
            className="flex scroll-mt-24 flex-col gap-1 px-3 py-3 text-sm target:bg-secondary sm:px-4"
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-mono text-xs text-muted-foreground">{source.id}</span>
              <span
                className={cn("font-mono text-xs", {
                  "text-reported": source.verified,
                  "text-estimated": !source.verified,
                })}
                title={verificationExplanation[state]}
              >
                {verificationLabel[state]}
              </span>
              <span className="text-xs text-muted-foreground">
                {kindLabel[source.kind]} · {reliabilityLabel[source.reliability]} · {source.date}
              </span>
            </div>
            <p className="text-pretty font-medium leading-snug">{source.title}</p>
            <p className="text-xs text-muted-foreground">{source.publisher}</p>
            {source.url === undefined ? null : (
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="break-all text-xs underline underline-offset-4 hover:text-foreground"
              >
                {source.url}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
};
