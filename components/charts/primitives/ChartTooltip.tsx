"use client";

import { ConfidenceBadge } from "@/components/charts/primitives/ConfidenceBadge";
import type { Confidence, Unit } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatValue } from "@/lib/format";

export type TooltipRow = {
  label: string;
  value: number;
  unit: Unit;
  confidence: Confidence;
  /** Source title, shown verbatim so the reader can trace the figure. */
  source: string;
  note?: string;
  low?: number;
  high?: number;
  color?: string;
};

export type ChartTooltipProps = {
  /** Cursor position inside the chart container, in pixels. */
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
  title: string;
  year: number;
  rows: readonly TooltipRow[];
  footnote?: string;
  visible: boolean;
};

const TOOLTIP_WIDTH = 268;
const OFFSET = 14;
/** §10.3: a tooltip may never grow tall enough to swallow the chart it describes. */
const MAX_HEIGHT = 320;
const MAX_ROWS = 4;
const EDGE_PADDING = 4;

/**
 * The single tooltip used by every chart. It always shows the value, the year,
 * the source and a confidence badge, which is a hard requirement in CLAUDE.md §5.
 *
 * `docs/CONTRACTS.md` §10.3 caps it: at most four rows and then a "+N more" line,
 * at most 300px wide and 320px tall, flipping on both axes so it stays inside the
 * chart. Exhaustive detail belongs in the table view, not in a hover card.
 */
export const ChartTooltip = ({
  x,
  y,
  containerWidth,
  containerHeight,
  title,
  year,
  rows,
  footnote,
  visible,
}: ChartTooltipProps): React.ReactElement | null => {
  if (!visible || rows.length === 0) return null;

  const shownRows = rows.slice(0, MAX_ROWS);
  const hiddenRows = rows.length - shownRows.length;

  const flipX = x + OFFSET + TOOLTIP_WIDTH > containerWidth;
  const rawLeft = flipX ? x - OFFSET - TOOLTIP_WIDTH : x + OFFSET;
  const left = Math.max(
    EDGE_PADDING,
    Math.min(rawLeft, containerWidth - TOOLTIP_WIDTH - EDGE_PADDING),
  );

  const estimatedHeight = Math.min(
    MAX_HEIGHT,
    58 + shownRows.length * 44 + (footnote ? 26 : 0) + (hiddenRows > 0 ? 18 : 0),
  );
  const flipY = y + OFFSET + estimatedHeight > containerHeight;
  const top = Math.max(EDGE_PADDING, flipY ? y - OFFSET - estimatedHeight : y + OFFSET);

  return (
    <div
      role="tooltip"
      style={{ left, top, width: TOOLTIP_WIDTH, maxHeight: MAX_HEIGHT }}
      className={cn(
        "pointer-events-none absolute z-30 overflow-y-auto rounded-md border border-border bg-popover/98 p-3 shadow-lg backdrop-blur-sm",
      )}
    >
      <p className="font-serif text-[13px] font-semibold leading-tight text-popover-foreground">
        {title}
      </p>
      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{year}</p>

      <ul className="mt-2 space-y-2">
        {shownRows.map((row, index) => (
          // Index-keyed on purpose: a mark can legitimately carry two rows with the
          // same label and value, and rows are never reordered within one render.
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
                {formatValue(row.value, row.unit)}
              </span>
            </div>
            {row.low !== undefined && row.high !== undefined ? (
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                range {formatValue(row.low, row.unit)}
                {"–"}
                {formatValue(row.high, row.unit)}
              </p>
            ) : null}
            <div className="mt-1 flex items-start gap-1.5">
              <ConfidenceBadge confidence={row.confidence} note={row.note} />
              <span className="min-w-0 flex-1 text-[11px] leading-snug text-muted-foreground">
                {row.source}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {hiddenRows > 0 ? (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          +{hiddenRows} more in the table view
        </p>
      ) : null}

      {footnote ? (
        <p className="mt-2 line-clamp-3 border-t border-border pt-2 text-[11px] leading-snug text-muted-foreground">
          {footnote}
        </p>
      ) : null}
    </div>
  );
};
