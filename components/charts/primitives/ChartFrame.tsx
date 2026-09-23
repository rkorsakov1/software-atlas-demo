"use client";

import { BarChart3, TableIcon } from "lucide-react";
import { useId, useState } from "react";

import { useReducedMotion } from "@/components/charts/primitives/useReducedMotion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export type ChartFrameRenderArgs = {
  /** False when the viewer asked for reduced motion; charts must honour it. */
  animate: boolean;
};

export type ChartFrameProps = {
  title: string;
  /** One sentence saying what the reader should take away. Required by §5. */
  takeaway: string;
  /** Source line rendered under the chart, e.g. "Synergy Research, via press releases". */
  source: string;
  children: React.ReactNode | ((args: ChartFrameRenderArgs) => React.ReactNode);
  /** The "View as table" alternative. Omit only if the chart has no tabular form. */
  table?: React.ReactNode;
  toolbar?: React.ReactNode;
  footnote?: string;
  className?: string;
  bodyClassName?: string;
  /** Starts on the table view, used by the mobile simplifications in §5. */
  defaultView?: "chart" | "table";
};

/**
 * The shell every Atlas chart sits in: title, takeaway, toolbar, the chart itself,
 * a "View as table" toggle and a source line. Charts never draw their own chrome.
 */
export const ChartFrame = ({
  title,
  takeaway,
  source,
  children,
  table,
  toolbar,
  footnote,
  className,
  bodyClassName,
  defaultView = "chart",
}: ChartFrameProps): React.ReactElement => {
  const reducedMotion = useReducedMotion();
  const [view, setView] = useState<"chart" | "table">(table ? defaultView : "chart");
  const bodyId = useId();
  const titleId = useId();

  const showingTable = view === "table" && table !== undefined;

  const handleToggleView = (): void => {
    setView((current) => (current === "chart" ? "table" : "chart"));
  };

  return (
    <figure
      className={cn(
        "flex w-full flex-col rounded-lg border border-border bg-card p-4 sm:p-5",
        className,
      )}
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="font-serif text-lg font-semibold leading-tight">
            {title}
          </h3>
          <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">{takeaway}</p>
        </div>

        {table ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleView}
            aria-expanded={showingTable}
            aria-controls={bodyId}
            className="shrink-0"
          >
            {showingTable ? (
              <BarChart3 aria-hidden="true" className="size-3.5" />
            ) : (
              <TableIcon aria-hidden="true" className="size-3.5" />
            )}
            {showingTable ? "View as chart" : "View as table"}
          </Button>
        ) : null}
      </div>

      {toolbar ? <div className="mt-3 flex flex-wrap items-center gap-2">{toolbar}</div> : null}

      <div id={bodyId} className={cn("relative mt-4 min-w-0 flex-1", bodyClassName)}>
        {showingTable
          ? table
          : typeof children === "function"
            ? children({ animate: !reducedMotion })
            : children}
      </div>

      <figcaption className="mt-3 border-t border-border pt-2.5 text-xs text-muted-foreground">
        {footnote ? <p className="mb-1 text-pretty">{footnote}</p> : null}
        <p>
          <span className="font-medium uppercase tracking-wider">Source</span> {source}
        </p>
      </figcaption>
    </figure>
  );
};
