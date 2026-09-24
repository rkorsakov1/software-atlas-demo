import { cn } from "@/lib/cn";

export type AxisTick = { value: number; label: string };

export type AxisProps = {
  orientation: "bottom" | "left" | "right" | "top";
  /** Pre-computed ticks. Charts derive these from their d3 scale. */
  ticks: readonly AxisTick[];
  scale: (value: number) => number;
  /** Length of the plot area along the other axis, used for gridlines. */
  length: number;
  label?: string;
  showGrid?: boolean;
  tickSize?: number;
  className?: string;
};

const LABEL_CLASS = "fill-muted-foreground text-[11px]";

/**
 * A plain SVG axis. React renders it; d3 only supplies the scale and tick values,
 * so there is no d3 DOM manipulation anywhere in the chart layer.
 */
export const Axis = ({
  orientation,
  ticks,
  scale,
  length,
  label,
  showGrid = false,
  tickSize = 5,
  className,
}: AxisProps): React.ReactElement => {
  const horizontal = orientation === "bottom" || orientation === "top";
  const gridSign = orientation === "bottom" || orientation === "right" ? -1 : 1;

  return (
    <g className={cn("select-none", className)} aria-hidden="true">
      {horizontal ? (
        <line x1={0} y1={0} x2={length} y2={0} className="stroke-rule" strokeWidth={1} />
      ) : (
        <line x1={0} y1={0} x2={0} y2={length} className="stroke-rule" strokeWidth={1} />
      )}

      {ticks.map((tick) => {
        const position = scale(tick.value);
        if (!Number.isFinite(position)) return null;

        if (horizontal) {
          const tickDirection = orientation === "bottom" ? 1 : -1;
          return (
            <g key={`${tick.value}-${tick.label}`} transform={`translate(${position}, 0)`}>
              {showGrid ? (
                <line
                  y1={0}
                  y2={gridSign * length}
                  className="stroke-rule"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  opacity={0.55}
                />
              ) : null}
              <line y1={0} y2={tickDirection * tickSize} className="stroke-rule" strokeWidth={1} />
              <text
                y={tickDirection * (tickSize + 11)}
                textAnchor="middle"
                className={LABEL_CLASS}
              >
                {tick.label}
              </text>
            </g>
          );
        }

        const tickDirection = orientation === "left" ? -1 : 1;
        return (
          <g key={`${tick.value}-${tick.label}`} transform={`translate(0, ${position})`}>
            {showGrid ? (
              <line
                x1={0}
                x2={orientation === "left" ? length : -length}
                className="stroke-rule"
                strokeWidth={1}
                strokeDasharray="2 3"
                opacity={0.55}
              />
            ) : null}
            <line x1={0} x2={tickDirection * tickSize} className="stroke-rule" strokeWidth={1} />
            <text
              x={tickDirection * (tickSize + 4)}
              dy="0.32em"
              textAnchor={orientation === "left" ? "end" : "start"}
              className={LABEL_CLASS}
            >
              {tick.label}
            </text>
          </g>
        );
      })}

      {label ? (
        horizontal ? (
          <text
            x={length / 2}
            y={orientation === "bottom" ? 38 : -30}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px] font-medium uppercase tracking-wider"
          >
            {label}
          </text>
        ) : (
          <text
            transform={`translate(${orientation === "left" ? -46 : 46}, ${length / 2}) rotate(-90)`}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px] font-medium uppercase tracking-wider"
          >
            {label}
          </text>
        )
      ) : null}
    </g>
  );
};

/** Builds evenly-readable ticks from a d3 scale that exposes `ticks()`. */
export const ticksFrom = (
  scale: { ticks: (count?: number) => number[] },
  count: number,
  format: (value: number) => string,
): AxisTick[] => scale.ticks(count).map((value) => ({ value, label: format(value) }));

/**
 * Ticks for a log scale: d3 offers every 1–9 × 10ⁿ, which piles labels up at the
 * top of each decade. Keeps only the 1, 2 and 5 steps, then drops any tick that
 * would sit closer than `minGapPx` to the one before it.
 */
export const logTicksFrom = (
  scale: { ticks: (count?: number) => number[]; (value: number): number },
  format: (value: number) => string,
  minGapPx = 56,
): AxisTick[] => {
  const ticks: AxisTick[] = [];
  let lastX = Number.NEGATIVE_INFINITY;
  for (const value of scale.ticks()) {
    const mantissa = Math.round(value / 10 ** Math.floor(Math.log10(value)));
    if (mantissa !== 1 && mantissa !== 2 && mantissa !== 5) continue;
    const x = scale(value);
    if (x - lastX < minGapPx) continue;
    ticks.push({ value, label: format(value) });
    lastX = x;
  }
  return ticks;
};
