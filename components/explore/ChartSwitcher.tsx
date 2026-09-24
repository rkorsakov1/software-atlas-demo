"use client";

import { cn } from "@/lib/cn";
import { CHART_KEYS, type ChartKey } from "@/lib/url-state";

export const CHART_LABEL: Record<ChartKey, string> = {
  timeline: "Eras & events",
  treemap: "Market sizes",
  share: "Share over time",
  bubble: "Revenue & growth",
  lineage: "Acquisitions",
  bundling: "Bundling flows",
  moat: "Moats",
  emerging: "Emerging",
};

export const CHART_DESCRIPTION: Record<ChartKey, string> = {
  timeline: "Eleven eras and every sourced competitive event, in lanes by event type.",
  treemap: "Every sized market at the year on screen, with the unsized ones listed beneath.",
  share: "Vendor shares over time, for the markets where a publisher reports them.",
  bubble: "Revenue against year-on-year growth, coloured by archetype.",
  lineage: "Who bought whom: acquisitions and spin-offs as a directed graph.",
  bundling: "Capability leaving a market for a suite, and coming back out again.",
  moat: "Seven moat axes for up to three pinned companies.",
  emerging: "Candidate markets by horizon, category and evidence weight.",
};

const ARROW_STEP: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

const nextChartIndex = (key: string, index: number, step: number): number => {
  if (key === "Home") return 0;
  if (key === "End") return CHART_KEYS.length - 1;
  return (index + step + CHART_KEYS.length) % CHART_KEYS.length;
};

export type ChartSwitcherProps = {
  chart: ChartKey;
  onChartChange: (chart: ChartKey) => void;
  panelId: string;
  tabIdPrefix: string;
};

/**
 * A manual tablist: Radix Tabs would want a panel per value, and there is only
 * one panel here that swaps its contents. Arrow keys move between tabs and the
 * roving tabindex keeps exactly one of them in the document tab order.
 */
export const ChartSwitcher = ({
  chart,
  onChartChange,
  panelId,
  tabIdPrefix,
}: ChartSwitcherProps): React.ReactElement => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    const step = ARROW_STEP[event.key];
    const isEdgeKey = event.key === "Home" || event.key === "End";
    if (step === undefined && !isEdgeKey) return;

    event.preventDefault();
    const index = CHART_KEYS.indexOf(chart);
    const nextKey = CHART_KEYS[nextChartIndex(event.key, index, step ?? 0)];
    if (nextKey === undefined) return;

    onChartChange(nextKey);
    document.getElementById(`${tabIdPrefix}${nextKey}`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Chart"
      aria-orientation="horizontal"
      className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1"
    >
      {CHART_KEYS.map((key) => {
        const isActive = key === chart;
        return (
          <button
            key={key}
            id={`${tabIdPrefix}${key}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChartChange(key)}
            onKeyDown={handleKeyDown}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              { "bg-secondary text-foreground": isActive },
            )}
          >
            {CHART_LABEL[key]}
          </button>
        );
      })}
    </div>
  );
};
