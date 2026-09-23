import { Info } from "lucide-react";

import { cn } from "@/lib/cn";

export type EmptyStateProps = {
  title: string;
  /** Say why the data is missing, never imply the chart is broken. */
  description: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * Shown wherever the Atlas has no reliable data. Stating the absence explicitly is
 * part of the research contract: the alternative would be a reconstructed figure.
 */
export const EmptyState = ({
  title,
  description,
  action,
  className,
}: EmptyStateProps): React.ReactElement => (
  <div
    role="status"
    className={cn(
      "flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-6 py-10 text-center",
      className,
    )}
  >
    <Info aria-hidden="true" className="size-5 text-muted-foreground" />
    <p className="font-serif text-base font-semibold">{title}</p>
    <p className="max-w-md text-pretty text-sm text-muted-foreground">{description}</p>
    {action}
  </div>
);
