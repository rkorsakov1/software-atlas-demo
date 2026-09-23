"use client";

import Link from "next/link";

import {
  verificationExplanation,
  verificationLabel,
  verificationState,
} from "@/components/profile/verification";
import { shortPublisher } from "@/components/story/citations";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { sources } from "@/data";
import type { Source } from "@/data/types";

const SOURCE_BY_ID: ReadonlyMap<string, Source> = new Map(
  sources.map((source) => [source.id, source]),
);

export const isKnownSourceId = (id: string): boolean => SOURCE_BY_ID.has(id);

/** Where the methodology page anchors each entry of the full registry. */
export const sourceAnchorHref = (id: string): string => `/methodology/#source-${id}`;

const accessibleName = (source: Source): string =>
  `Source ${source.id}: ${source.title} — ${source.publisher}, ${source.date}. ${
    verificationExplanation[verificationState(source)]
  } Opens the source list on the methodology page.`;

type CitationChipProps = {
  source: Source;
};

const CitationChip = ({ source }: CitationChipProps): React.ReactElement => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link
        href={sourceAnchorHref(source.id)}
        aria-label={accessibleName(source)}
        className="text-[10px] font-medium text-muted-foreground no-underline transition-colors hover:text-brand"
      >
        {shortPublisher(source.publisher)}
      </Link>
    </TooltipTrigger>
    <TooltipContent side="top" align="start" className="max-w-[300px] text-left">
      <span className="block font-medium leading-snug">{source.title}</span>
      <span className="mt-1 block opacity-80">
        {source.publisher} · {source.date}
      </span>
      <span className="mt-1 block opacity-80">
        {verificationLabel[verificationState(source)]} · source {source.id}
      </span>
    </TooltipContent>
  </Tooltip>
);

export type SourceCitationProps = {
  ids: readonly string[];
  /** Prose that shared the parentheses with the ids, e.g. a modelling note. */
  trailing: string | null;
};

/**
 * The reading-side form of a `(S18, S27)` citation: one chip per source, naming
 * the publisher, linking to that source in the methodology registry, and showing
 * title, publisher and date on hover **and** on keyboard focus.
 */
export const SourceCitation = ({ ids, trailing }: SourceCitationProps): React.ReactElement => {
  const resolved = ids
    .map((id) => SOURCE_BY_ID.get(id))
    .filter((source): source is Source => source !== undefined);

  if (resolved.length === 0) return <></>;

  return (
    <sup className="ml-0.5 inline-flex flex-wrap gap-1 leading-none">
      {resolved.map((source) => (
        <CitationChip key={source.id} source={source} />
      ))}
      {trailing === null ? null : (
        <span className="text-[10px] text-muted-foreground">({trailing})</span>
      )}
    </sup>
  );
};
