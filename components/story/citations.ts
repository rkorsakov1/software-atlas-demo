/**
 * Chapter prose in `data/chapters.ts` cites its sources the way the research did:
 * as bare ids in parentheses, e.g. `(S18, S27)`. The ids are correct data and are
 * never edited out — they are the traceability the whole project rests on — but a
 * reader should see a source, not a key. This splits a paragraph into prose and
 * citation runs so the renderer can put a named, linked affordance in their place.
 */

export type CitationSegment =
  | { kind: "text"; value: string }
  | { kind: "citation"; ids: readonly string[]; trailing: string | null };

/**
 * `(S18, S27)` — one or more ids, optionally followed by prose in the same
 * parentheses, as in `(S14, modeled as 1 minus 2.55 divided by 23.77)`, where the
 * prose stays in the sentence and only the id becomes a citation.
 */
const CITATION_PATTERN =
  /\((S\d{2,3}[a-z]?|B\d{2})((?:,\s*(?:S\d{2,3}[a-z]?|B\d{2}))*)(,\s*[^()]+?)?\)/g;

// Ids run past S99 now, so the class must admit three digits; a two-digit-only
// class silently dropped every S100+ citation back into prose.
const ID_PATTERN = /S\d{2,3}[a-z]?|B\d{2}/g;

const pushText = (segments: CitationSegment[], value: string): void => {
  if (value.length === 0) return;
  const last = segments[segments.length - 1];
  if (last?.kind === "text") {
    segments[segments.length - 1] = { kind: "text", value: last.value + value };
    return;
  }
  segments.push({ kind: "text", value });
};

/**
 * Splits `text` into prose and citation segments. A parenthesised group is only
 * turned into a citation when **every** id in it resolves; otherwise the original
 * characters are kept verbatim, so a stale id degrades to plain prose rather than
 * to a citation that leads nowhere.
 */
export const parseCitations = (
  text: string,
  isKnownSourceId: (id: string) => boolean,
): CitationSegment[] => {
  const segments: CitationSegment[] = [];
  let cursor = 0;

  CITATION_PATTERN.lastIndex = 0;
  for (
    let match = CITATION_PATTERN.exec(text);
    match !== null;
    match = CITATION_PATTERN.exec(text)
  ) {
    const [whole, first, rest, trailing] = match;
    pushText(segments, text.slice(cursor, match.index));
    cursor = match.index + whole.length;

    const followingIds = (rest ?? "").match(ID_PATTERN) ?? [];
    const ids = [first ?? "", ...followingIds].filter((id) => id.length > 0);

    if (ids.length === 0 || !ids.every(isKnownSourceId)) {
      pushText(segments, whole);
      continue;
    }

    const trailingProse = trailing === undefined ? null : trailing.replace(/^,\s*/, "");
    segments.push({
      kind: "citation",
      ids,
      trailing: trailingProse === null || trailingProse.length === 0 ? null : trailingProse,
    });
  }

  pushText(segments, text.slice(cursor));
  return segments;
};

/** "TelecomTV (reporting Gartner)" → "TelecomTV": the chip has room for a name, not a clause. */
export const shortPublisher = (publisher: string, maxLength = 22): string => {
  const trimmed = publisher.replace(/\s*\([^()]*\)\s*$/, "").trim();
  if (trimmed.length === 0) return publisher;
  if (trimmed.length <= maxLength) return trimmed;

  const words = trimmed.split(" ");
  let clipped = words[0] ?? trimmed;
  for (const word of words.slice(1)) {
    const next = `${clipped} ${word}`;
    if (next.length > maxLength) break;
    clipped = next;
  }
  return `${clipped}…`;
};
