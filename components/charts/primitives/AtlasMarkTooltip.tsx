"use client";

import { ConfidenceBadge } from "@/components/charts/primitives/ConfidenceBadge";
import { shortSource } from "@/components/charts/primitives/ChartTooltip";
import type { Confidence } from "@/data/types";

export type AtlasMarkTooltipRow = {
  label: string;
  /** Already formatted, because these marks carry scores and weights, not units. */
  value: string;
  /** Omitted only where the underlying record genuinely carries no basis. */
  confidence?: Confidence;
  /** Source title, shown verbatim so the reader can trace the claim. */
  source?: string;
  note?: string;
  /** A sentence of context: a rubric level, a signal's evidence, an impact line. */
  detail?: string;
  color?: string;
};

export type AtlasMarkTooltipProps = {
  /** Cursor position inside the chart container, in pixels. */
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
  title: string;
  subtitle?: string;
  /** Omitted where the mark is genuinely undated; the footnote must then say so. */
  year?: number;
  rows: readonly AtlasMarkTooltipRow[];
  /** Required: states the basis of the numbers, including why there is no year. */
  footnote: string;
  visible: boolean;
};

export const TOOLTIP_WIDTH = 340;
/** Kept for callers that size around the card; the card itself never scrolls. */
export const MAX_TOOLTIP_HEIGHT = 420;
/** At most three rows, then a "+N more" line: the rest lives in the record. */
export const MAX_TOOLTIP_ROWS = 3;

const OFFSET = 14;
const CHROME_HEIGHT = 110;
const ROW_HEIGHT = 70;

/**
 * Keeps a hover card to four rows and reports what it left out, so the exhaustive
 * detail lives in the table view and the drawer instead of over the chart.
 */
export const capTooltipRows = <TRow,>(
  rows: readonly TRow[],
): { visible: TRow[]; hiddenCount: number } => {
  if (rows.length <= MAX_TOOLTIP_ROWS) return { visible: [...rows], hiddenCount: 0 };
  const visible = rows.slice(0, MAX_TOOLTIP_ROWS);
  return { visible, hiddenCount: rows.length - visible.length };
};

export type TooltipPlacement = { left: number; top: number };

/**
 * Places the card inside the chart container, flipping on **both** axes rather
 * than only sliding, so it never covers the mark it describes and never leaves
 * the frame.
 */
export const tooltipPlacement = (args: {
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
  height: number;
  width?: number;
}): TooltipPlacement => {
  const { x, y, containerWidth, containerHeight, height, width = TOOLTIP_WIDTH } = args;
  const flipX = x + OFFSET + width > containerWidth;
  const rawLeft = flipX ? x - OFFSET - width : x + OFFSET;
  const left = Math.max(4, Math.min(rawLeft, Math.max(4, containerWidth - width - 4)));

  const flipY = y + OFFSET + height > containerHeight;
  const rawTop = flipY ? y - OFFSET - height : y + OFFSET;
  const top = Math.max(4, Math.min(rawTop, Math.max(4, containerHeight - height - 4)));

  return { left, top };
};

/**
 * A sibling of `ChartTooltip` for marks that carry no dated data point: moat
 * scores, emerging-market signal strengths, bundling-flow weights and lineage
 * edges. `ChartTooltip` requires a year and a source on every row, and CLAUDE.md
 * §1.1 forbids inventing either, so these charts state the basis in the footnote
 * instead while still showing a confidence badge on every number that has one.
 */
export const AtlasMarkTooltip = ({
  x,
  y,
  containerWidth,
  containerHeight,
  title,
  subtitle,
  year,
  rows,
  footnote,
  visible,
}: AtlasMarkTooltipProps): React.ReactElement | null => {
  if (!visible || rows.length === 0) return null;

  const { visible: shownRows, hiddenCount } = capTooltipRows(rows);
  const estimatedHeight = Math.min(
    MAX_TOOLTIP_HEIGHT,
    CHROME_HEIGHT + shownRows.length * ROW_HEIGHT + (hiddenCount > 0 ? 18 : 0),
  );
  const { left, top } = tooltipPlacement({
    x,
    y,
    containerWidth,
    containerHeight,
    height: estimatedHeight,
  });

  return (
    <div
      role="tooltip"
      style={{ left, top, width: TOOLTIP_WIDTH }}
      className="pointer-events-none absolute z-30 flex flex-col rounded-lg border border-border bg-popover p-3.5 shadow-xl"
    >
      <p className="text-sm font-semibold leading-snug text-popover-foreground">
        {title}
      </p>
      {subtitle ? (
        <p className="mt-1 line-clamp-4 text-[13px] leading-snug text-popover-foreground">
          {subtitle}
        </p>
      ) : null}
      {year === undefined ? null : (
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{year}</p>
      )}

      <ul className="mt-2.5 space-y-2.5">
        {shownRows.map((row, index) => (
          // Index-keyed on purpose: a mark can legitimately carry two rows with the
          // same label and value (two "Leading indicator 3 / 3" signals, say), and
          // rows are never reordered within a single tooltip render.
          <li key={`${row.label}-${row.value}-${index}`} className="text-xs">
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                {row.color ? (
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                ) : null}
                <span className="truncate text-muted-foreground">{row.label}</span>
              </span>
              <span className="shrink-0 font-mono font-medium tabular-nums text-popover-foreground">
                {row.value}
              </span>
            </div>
            {row.detail ? (
              <p className="mt-1 line-clamp-3 text-xs leading-snug text-popover-foreground">
                {row.detail}
              </p>
            ) : null}
            {row.confidence || row.source ? (
              <div className="mt-1 flex items-center gap-1.5">
                {row.confidence ? (
                  <ConfidenceBadge confidence={row.confidence} note={row.note} />
                ) : null}
                {row.source ? (
                  <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                    {shortSource(row.source)}
                  </span>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
        {hiddenCount > 0 ? (
          <li className="text-[11px] text-muted-foreground">
            +{hiddenCount} more. Click to open the full record.
          </li>
        ) : null}
      </ul>

      <p className="mt-2.5 line-clamp-2 border-t border-border pt-2 text-[11px] leading-snug text-muted-foreground">
        {footnote}
      </p>
    </div>
  );
};
