"use client";

import type { ClaimType } from "@/components/story/ClaimBadge";
import { isKnownSourceId, SourceCitation } from "@/components/story/SourceCitation";
import { parseCitations, type CitationSegment } from "@/components/story/citations";

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

type Block = { isAnalysis: boolean; paragraphs: CitationSegment[][] };

/** Consecutive "Our take" paragraphs share one block and one label. */
const toBlocks = (paragraphs: readonly string[]): Block[] => {
  const blocks: Block[] = [];
  for (const paragraph of paragraphs) {
    const parsed = parseParagraph(paragraph);
    const segments = parseCitations(parsed.text, isKnownSourceId);
    const isAnalysis = parsed.claim === "A";
    const last = blocks[blocks.length - 1];
    if (isAnalysis && last?.isAnalysis) {
      last.paragraphs.push(segments);
      continue;
    }
    blocks.push({ isAnalysis, paragraphs: [segments] });
  }
  return blocks;
};

/** Numbers each source in order of first citation within the chapter. */
const numberSources = (blocks: readonly Block[]): Map<string, number> => {
  const numbers = new Map<string, number>();
  for (const block of blocks) {
    for (const segments of block.paragraphs) {
      for (const segment of segments) {
        if (segment.kind !== "citation") continue;
        for (const id of segment.ids) {
          if (!numbers.has(id)) numbers.set(id, numbers.size + 1);
        }
      }
    }
  }
  return numbers;
};

export type ChapterBodyProps = {
  paragraphs: readonly string[];
};

type ParagraphProps = { segments: CitationSegment[]; numbers: Map<string, number> };

const Paragraph = ({ segments, numbers }: ParagraphProps): React.ReactElement => (
  <p className="text-pretty leading-relaxed">
    {segments.map((segment, index) =>
      segment.kind === "text" ? (
        <span key={`text-${index}`}>{segment.value}</span>
      ) : (
        <SourceCitation
          key={`cite-${index}-${segment.ids.join("-")}`}
          ids={segment.ids}
          numbers={segment.ids.map((id) => numbers.get(id) ?? 0)}
          trailing={segment.trailing}
        />
      ),
    )}
  </p>
);

/**
 * Chapter prose. Facts and interpretations read as plain text, and the wording
 * signals which is which; the Atlas's own analysis is set apart with a rule and
 * an "Our take" label so a reader never mistakes argument for record. Sources are
 * numbered footnotes that open on click.
 */
export const ChapterBody = ({ paragraphs }: ChapterBodyProps): React.ReactElement => {
  const blocks = toBlocks(paragraphs);
  const numbers = numberSources(blocks);

  return (
    <div className="space-y-4">
      {blocks.map((block, blockIndex) => {
        const key = `block-${blockIndex}`;
        if (!block.isAnalysis) {
          const segments = block.paragraphs[0] ?? [];
          return <Paragraph key={key} segments={segments} numbers={numbers} />;
        }
        return (
          <div key={key} className="space-y-3 border-l-2 border-brand/60 pl-4">
            <span className="block text-[11px] font-medium uppercase tracking-wider text-brand">
              Our take
            </span>
            {block.paragraphs.map((segments, index) => (
              <Paragraph key={`${key}-${index}`} segments={segments} numbers={numbers} />
            ))}
          </div>
        );
      })}
    </div>
  );
};
