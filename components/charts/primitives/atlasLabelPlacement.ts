import {
  MIN_LABEL_BOX,
  MIN_LABEL_FONT_PX,
  fitMarkLabel,
  measureTextWidth,
  type FittedLabel,
} from "@/components/charts/primitives/atlasLabelFit";

/**
 * Placement for labels drawn *outside* a mark rather than inside it.
 *
 * `atlasLabelFit` answers "does this string fit in this box"; the bubble chart
 * and the lineage graph have no box, they have a centred caption floating above
 * a circle in a crowded plot. `docs/CONTRACTS.md` §10.1 still applies: a caption
 * that would collide with one already drawn, or that would spill out of the
 * plot, is truncated to the room it has or dropped entirely, and the full string
 * survives in the mark's `<title>`, its `aria-label`, the tooltip and the table.
 *
 * Marks are processed in the order given, so callers pass them most-important
 * first: an earlier label claims its room and a later one works around it.
 */

export type OutsideLabelMark = {
  id: string;
  /** The untruncated string the caller would like to draw. */
  text: string;
  /** Centre of the mark, in plot coordinates. */
  x: number;
  y: number;
  /** Radius of the mark; the label sits directly above it. */
  radius: number;
};

export type PlacedLabel = FittedLabel & {
  id: string;
  /** Mid-point of the text, which is drawn with `text-anchor="middle"`. */
  x: number;
  /** Baseline of the text. */
  y: number;
  /** Room the label was fitted into, useful in tests and debugging. */
  availableWidth: number;
};

export type OutsideLabelOptions = {
  plotWidth: number;
  plotHeight: number;
  fontPx?: number;
  /** Clearance kept between two labels that share a line. */
  gapPx?: number;
  /** Distance from the top of the mark to the label baseline. */
  offsetPx?: number;
};

/** Vertical extent of one label line, used only to test for collisions. */
type LabelBand = { top: number; bottom: number };

type LabelBox = LabelBand & { left: number; right: number };

const DEFAULT_GAP_PX = 6;
const DEFAULT_OFFSET_PX = 4;
/** A descender's worth of slack under the baseline, so two lines cannot touch. */
const BASELINE_SLACK_PX = 2;

const bandsOverlap = (a: LabelBand, b: LabelBand): boolean => a.top < b.bottom && b.top < a.bottom;

/**
 * Fit and place centred labels above a set of marks, skipping any that cannot be
 * drawn legibly. The returned list is in the same order as the input, minus the
 * marks that got no label.
 */
export const placeOutsideMarkLabels = (
  marks: readonly OutsideLabelMark[],
  options: OutsideLabelOptions,
): PlacedLabel[] => {
  const fontPx = options.fontPx ?? MIN_LABEL_FONT_PX;
  if (fontPx < MIN_LABEL_FONT_PX) return [];

  const gapPx = options.gapPx ?? DEFAULT_GAP_PX;
  const offsetPx = options.offsetPx ?? DEFAULT_OFFSET_PX;
  const placed: PlacedLabel[] = [];
  const boxes: LabelBox[] = [];

  for (const mark of marks) {
    const baseline = mark.y - mark.radius - offsetPx;
    // Above the top edge or below the bottom edge is not a place for a label.
    if (baseline - fontPx < 0) continue;
    if (baseline > options.plotHeight) continue;

    const band: LabelBand = { top: baseline - fontPx, bottom: baseline + BASELINE_SLACK_PX };

    let halfWidth = Math.min(mark.x, options.plotWidth - mark.x);
    for (const box of boxes) {
      if (halfWidth <= 0) break;
      if (!bandsOverlap(band, box)) continue;
      if (mark.x <= box.left) {
        halfWidth = Math.min(halfWidth, box.left - gapPx - mark.x);
        continue;
      }
      if (mark.x >= box.right) {
        halfWidth = Math.min(halfWidth, mark.x - box.right - gapPx);
        continue;
      }
      // The mark sits under a label that is already drawn: there is no room at all.
      halfWidth = 0;
    }

    const availableWidth = halfWidth * 2;
    if (availableWidth < MIN_LABEL_BOX.width) continue;

    const fitted = fitMarkLabel(mark.text, availableWidth, fontPx);
    if (!fitted) continue;

    const drawnWidth = measureTextWidth(fitted.text, fontPx);
    boxes.push({
      left: mark.x - drawnWidth / 2,
      right: mark.x + drawnWidth / 2,
      top: band.top,
      bottom: band.bottom,
    });
    placed.push({ ...fitted, id: mark.id, x: mark.x, y: baseline, availableWidth });
  }

  return placed;
};

/** The same placements keyed by mark id, which is how the charts read them. */
export const placedLabelsById = (
  marks: readonly OutsideLabelMark[],
  options: OutsideLabelOptions,
): Map<string, PlacedLabel> =>
  new Map(placeOutsideMarkLabels(marks, options).map((label) => [label.id, label]));
