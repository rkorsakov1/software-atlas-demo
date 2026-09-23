"use client";

import type { ClaimType } from "@/components/story/ClaimBadge";
import { isKnownSourceId, SourceCitation } from "@/components/story/SourceCitation";
import { parseCitations } from "@/components/story/citations";
import { cn } from "@/lib/cn";

const CLAIM_PATTERN = /^\[([FIA])\]\s*/;

type ParsedParagraph = {
  claim: ClaimType | null;
  text: string;
};

const parseParagraph = (paragraph: string): ParsedParagraph => {
  const match = CLAIM_PATTERN.exec(paragraph);
  if (!match) return { claim: null, text: paragraph };
  const claim = match[1];
  if (claim !== "F" && claim !== "I" && claim !== "A") {
    return { claim: null, text: paragraph };
  }
  return { claim, text: paragraph.slice(match[0].length) };
};

export type ChapterBodyProps = {
  paragraphs: readonly string[];
};

/**
 * Chapter prose. Facts and interpretations read as plain text, and the wording
 * signals which is which; the Atlas's own analysis is set apart with a rule and
 * an "Our take" label so a reader never mistakes argument for record. Source ids
 * become small superscript links.
 */
export const ChapterBody = ({ paragraphs }: ChapterBodyProps): React.ReactElement => (
  <div className="space-y-4">
    {paragraphs.map((paragraph) => {
      const parsed = parseParagraph(paragraph);
      const segments = parseCitations(parsed.text, isKnownSourceId);
      return (
        <p
          key={paragraph.slice(0, 48)}
          className={cn("text-pretty leading-relaxed", {
            "border-l-2 border-brand/60 pl-4": parsed.claim === "A",
          })}
        >
          {parsed.claim === "A" ? (
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand">
              Our take
            </span>
          ) : null}
          {segments.map((segment, index) =>
            segment.kind === "text" ? (
              <span key={`text-${index}`}>{segment.value}</span>
            ) : (
              <SourceCitation
                key={`cite-${index}-${segment.ids.join("-")}`}
                ids={segment.ids}
                trailing={segment.trailing}
              />
            ),
          )}
        </p>
      );
    })}
  </div>
);
