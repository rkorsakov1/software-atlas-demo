"use client";

import { cn } from "@/lib/cn";

export type LegendItem = {
  id: string;
  label: string;
  color: string;
  /** Rendered with a dashed outline so modeled series read as modeled. */
  dashed?: boolean;
  hatched?: boolean;
  count?: number;
};

export type LegendProps = {
  items: readonly LegendItem[];
  activeIds?: readonly string[];
  onToggle?: (id: string) => void;
  onHover?: (id: string | null) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
  title?: string;
};

const swatch = (item: LegendItem): React.ReactElement => (
  <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 shrink-0">
    <rect
      x="0.75"
      y="0.75"
      width="10.5"
      height="10.5"
      rx="2"
      fill={item.hatched ? "none" : item.color}
      fillOpacity={item.hatched ? 0 : 0.9}
      stroke={item.color}
      strokeWidth="1.4"
      strokeDasharray={item.dashed ? "3 2" : undefined}
    />
    {item.hatched ? (
      <path d="M0 9 L9 0 M3 12 L12 3" stroke={item.color} strokeWidth="1.4" />
    ) : null}
  </svg>
);

/** Interactive when `onToggle` is passed; a plain list of swatches otherwise. */
export const Legend = ({
  items,
  activeIds,
  onToggle,
  onHover,
  orientation = "horizontal",
  className,
  title,
}: LegendProps): React.ReactElement | null => {
  if (items.length === 0) return null;

  const isDimmed = (id: string): boolean =>
    activeIds !== undefined && activeIds.length > 0 && !activeIds.includes(id);

  const handleMouseLeave = (): void => onHover?.(null);

  return (
    <div className={cn("text-xs", className)} onMouseLeave={handleMouseLeave}>
      {title ? (
        <p className="mb-1.5 font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      ) : null}
      <ul
        className={cn("flex gap-x-4 gap-y-1.5", {
          "flex-wrap": orientation === "horizontal",
          "flex-col": orientation === "vertical",
        })}
      >
        {items.map((item) => {
          const dimmed = isDimmed(item.id);
          const content = (
            <>
              {swatch(item)}
              <span className="truncate">{item.label}</span>
              {item.count === undefined ? null : (
                <span className="font-mono text-[11px] text-muted-foreground">{item.count}</span>
              )}
            </>
          );

          if (!onToggle) {
            return (
              <li
                key={item.id}
                className={cn("flex min-w-0 items-center gap-1.5 text-muted-foreground", {
                  "opacity-40": dimmed,
                })}
                onMouseEnter={() => onHover?.(item.id)}
              >
                {content}
              </li>
            );
          }

          return (
            <li key={item.id} className="min-w-0">
              <button
                type="button"
                aria-pressed={!dimmed}
                onClick={() => onToggle(item.id)}
                onMouseEnter={() => onHover?.(item.id)}
                onFocus={() => onHover?.(item.id)}
                onBlur={handleMouseLeave}
                className={cn(
                  "flex min-w-0 items-center gap-1.5 rounded px-1 py-0.5 text-muted-foreground transition-opacity hover:bg-secondary hover:text-foreground",
                  { "opacity-40": dimmed },
                )}
              >
                {content}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
