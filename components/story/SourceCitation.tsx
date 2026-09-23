"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { verificationLabel, verificationState } from "@/components/profile/verification";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { sources } from "@/data";
import type { Source } from "@/data/types";

const SOURCE_BY_ID: ReadonlyMap<string, Source> = new Map(
  sources.map((source) => [source.id, source]),
);

export const isKnownSourceId = (id: string): boolean => SOURCE_BY_ID.has(id);

/** Where the methodology page anchors each entry of the full registry. */
export const sourceAnchorHref = (id: string): string => `/methodology/#source-${id}`;

export type SourceCitationProps = {
  ids: readonly string[];
  /** The chapter-wide number of each id, in the same order as `ids`. */
  numbers: readonly number[];
  /** Prose that shared the parentheses with the ids, e.g. a modelling note. */
  trailing: string | null;
};

/**
 * A citation as a footnote number. Clicking it opens a small card with each
 * source's title, publisher, date and a link, so the prose stays uncluttered and
 * the provenance stays one click away.
 */
export const SourceCitation = ({
  ids,
  numbers,
  trailing,
}: SourceCitationProps): React.ReactElement => {
  const resolved = ids
    .map((id) => SOURCE_BY_ID.get(id))
    .filter((source): source is Source => source !== undefined);

  if (resolved.length === 0) return <></>;

  const label = numbers.join(", ");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Sources ${label}`}
          className="ml-0.5 cursor-pointer align-super text-[11px] font-medium leading-none text-brand hover:underline"
        >
          [{label}]
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-3 p-4">
        {resolved.map((source, index) => (
          <div key={source.id} className="space-y-1 text-sm">
            <p className="font-medium leading-snug">
              <span className="mr-1.5 font-mono text-xs text-muted-foreground">
                [{numbers[index]}]
              </span>
              {source.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {source.publisher} · {source.date} · {verificationLabel[verificationState(source)]}
            </p>
            <div className="flex gap-3 text-xs">
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-brand hover:underline"
                >
                  Open source <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              ) : null}
              <Link href={sourceAnchorHref(source.id)} className="text-muted-foreground hover:underline">
                All sources
              </Link>
            </div>
          </div>
        ))}
        {trailing === null ? null : (
          <p className="border-t border-border pt-2 text-xs text-muted-foreground">{trailing}</p>
        )}
      </PopoverContent>
    </Popover>
  );
};
