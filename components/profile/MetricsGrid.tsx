import { ConfidenceBadge } from "@/components/charts/primitives";
import type { DataPoint } from "@/data/types";
import { cn } from "@/lib/cn";

export type Metric = {
  label: string;
  /** Already formatted for display. */
  value: string;
  /** Present when the metric comes from a dated, sourced figure. */
  point?: DataPoint;
  /** A sentence of context, or the source title for a sourced figure. */
  detail?: string;
};

export type MetricsGridProps = {
  metrics: readonly Metric[];
  className?: string;
};

/**
 * The headline numbers on a profile. Any metric backed by a data point shows its
 * confidence badge and year next to the value, so a modeled band can never be
 * mistaken for a filed figure.
 */
export const MetricsGrid = ({ metrics, className }: MetricsGridProps): React.ReactElement => (
  <dl
    className={cn(
      "grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3",
      className,
    )}
  >
    {metrics.map((metric) => (
      <div key={metric.label} className="bg-card p-4">
        <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {metric.label}
        </dt>
        <dd className="mt-1.5">
          <span className="font-serif text-xl font-semibold tabular-nums">{metric.value}</span>
          {metric.point === undefined ? null : (
            <span className="ml-2 inline-flex items-center gap-1.5 align-middle">
              <span className="font-mono text-xs text-muted-foreground">{metric.point.year}</span>
              <ConfidenceBadge
                confidence={metric.point.confidence}
                note={metric.point.note}
              />
            </span>
          )}
          {metric.detail === undefined ? null : (
            <p className="mt-1.5 text-pretty text-xs leading-snug text-muted-foreground">
              {metric.detail}
            </p>
          )}
        </dd>
      </div>
    ))}
  </dl>
);
