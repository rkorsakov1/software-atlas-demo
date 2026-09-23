/**
 * Label fitting shared by every chart that draws text inside a shape.
 *
 * `docs/CONTRACTS.md` §10.1 is blunt about it: never draw a label that does not
 * fit. Before rendering text inside an era band, a treemap tile, a Sankey node or
 * a radar sector, the chart asks these helpers whether there is room and gets one
 * of three answers back — the string as-is, a truncated string with an ellipsis,
 * or `null`, meaning draw nothing and let the tooltip, the `aria-label` and the
 * table carry the full text.
 *
 * Width is estimated from an em approximation rather than measured with
 * `getComputedTextLength`, because measuring forces a layout during render.
 */

/** Rough advance width of one character of the body sans, as a fraction of 1em. */
export const CHAR_WIDTH_RATIO = 0.55;

/** §10.1: never draw a label in a box smaller than this. */
export const MIN_LABEL_BOX: { readonly width: number; readonly height: number } = {
  width: 48,
  height: 14,
};

/** §10.2: nothing in a chart may render below 11px. */
export const MIN_LABEL_FONT_PX = 11;

/**
 * Small-caps headings are set uppercase with letter-spacing, so their characters
 * are wider than the body-sans approximation. Multiply the font size by this
 * before measuring one, rather than inventing a second ratio.
 */
export const UPPERCASE_WIDTH_FACTOR = 1.25;

/** Below this many visible characters an abbreviation stops being a word. */
export const MIN_LABEL_CHARS = 4;

export const ELLIPSIS = "…";

export type FittedLabel = {
  /** What to render, ellipsis included when it was shortened. */
  text: string;
  /** True when `text` is shorter than `full`, so the caller must expose `full`. */
  truncated: boolean;
  /** The untouched string, for `<title>` and `aria-label`. */
  full: string;
};

/** Estimated rendered width of `text` at `fontPx`, in pixels. */
export const measureTextWidth = (text: string, fontPx: number): number =>
  text.length * fontPx * CHAR_WIDTH_RATIO;

/** How many characters of `fontPx` text fit in `availablePx`. */
export const maxCharsFor = (availablePx: number, fontPx: number): number => {
  if (!Number.isFinite(availablePx) || !Number.isFinite(fontPx) || fontPx <= 0) return 0;
  return Math.floor(availablePx / (fontPx * CHAR_WIDTH_RATIO));
};

/** True when a box is big enough to hold any label at all, per §10.1 and §10.2. */
export const hasLabelRoom = (
  widthPx: number,
  heightPx: number,
  fontPx: number = MIN_LABEL_FONT_PX,
): boolean =>
  widthPx >= MIN_LABEL_BOX.width &&
  heightPx >= Math.max(MIN_LABEL_BOX.height, fontPx + 2) &&
  fontPx >= MIN_LABEL_FONT_PX;

const TRAILING_NOISE = /[\s,;:./\-–—]+$/;

/**
 * Fit `text` into `availablePx`: the string itself, a truncated string with a
 * trailing ellipsis, or `null` when even a truncation would be unreadable.
 */
export const fitLabel = (
  text: string,
  availablePx: number,
  fontPx: number = MIN_LABEL_FONT_PX,
): FittedLabel | null => {
  const full = text.trim();
  if (full.length === 0) return null;
  if (fontPx < MIN_LABEL_FONT_PX) return null;
  if (availablePx < MIN_LABEL_BOX.width) return null;

  const maxChars = maxCharsFor(availablePx, fontPx);
  if (maxChars <= 0) return null;
  if (full.length <= maxChars) return { text: full, truncated: false, full };

  const sliced = full.slice(0, maxChars - 1).replace(TRAILING_NOISE, "");
  if (sliced.length < MIN_LABEL_CHARS) return null;
  return { text: `${sliced}${ELLIPSIS}`, truncated: true, full };
};

const ABBREVIATION_SPLIT = /\s(?:and|&|plus)\s|[:;,(]|\s[—–]\s/i;
const LEADING_ARTICLE = /^(?:the|a|an)\s+/i;

/**
 * A short stand-in for a long name: the part before the first conjunction or
 * punctuation break, with a leading article dropped. "Mainframes and bundled
 * software" becomes "Mainframes"; "The PC and packaged software" becomes "PC".
 * Returns the original string when there is nothing sensible to cut.
 */
export const abbreviateLabel = (text: string): string => {
  const full = text.trim();
  if (full.length === 0) return full;
  const head = full.split(ABBREVIATION_SPLIT)[0] ?? full;
  const withoutArticle = head.replace(LEADING_ARTICLE, "").trim();
  const candidate = withoutArticle.replace(TRAILING_NOISE, "");
  // "PC" is a real abbreviation; one stray character is not.
  if (candidate.length < 2) return full;
  if (candidate.length >= full.length) return full;
  return candidate;
};

/**
 * The rule in-mark labels use: draw the full name when it fits, otherwise an
 * abbreviation marked with an ellipsis, otherwise a truncation, otherwise
 * nothing. The ellipsis is never omitted when text was dropped, so a reader can
 * always tell that the tooltip and the table hold more.
 */
export const fitMarkLabel = (
  text: string,
  availablePx: number,
  fontPx: number = MIN_LABEL_FONT_PX,
): FittedLabel | null => {
  const truncatedFit = fitLabel(text, availablePx, fontPx);
  if (truncatedFit && !truncatedFit.truncated) return truncatedFit;

  const short = abbreviateLabel(text);
  if (short !== text.trim()) {
    const shortFit = fitLabel(`${short}${ELLIPSIS}`, availablePx, fontPx);
    if (shortFit && !shortFit.truncated) {
      return { text: shortFit.text, truncated: true, full: text.trim() };
    }
  }

  return truncatedFit;
};

/** `fitMarkLabel` with a height check and symmetric horizontal padding. */
export const fitLabelInBox = (
  text: string,
  box: { width: number; height: number },
  fontPx: number = MIN_LABEL_FONT_PX,
  paddingPx = 0,
): FittedLabel | null => {
  const available = box.width - paddingPx * 2;
  if (!hasLabelRoom(available, box.height, fontPx)) return null;
  return fitMarkLabel(text, available, fontPx);
};
