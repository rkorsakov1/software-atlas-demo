import type { Confidence } from "@/data/types";
import { cn } from "@/lib/cn";
import { confidenceDescription, confidenceLabel } from "@/lib/format";

export type ConfidenceBadgeProps = {
  confidence: Confidence;
  /** The method note from a modeled data point, shown as the badge's title. */
  note?: string;
  size?: "sm" | "md";
  className?: string;
};

const TONE: Record<Confidence, string> = {
  reported: "border-reported/45 text-reported",
  estimated: "border-estimated/45 text-estimated",
  modeled: "border-modeled/45 text-modeled",
};

/**
 * The one badge used everywhere a number appears. `reported` is solid, `estimated`
 * is hatched and `modeled` is dashed, matching the marks in the charts themselves.
 */
export const ConfidenceBadge = ({
  confidence,
  note,
  size = "sm",
  className,
}: ConfidenceBadgeProps): React.ReactElement => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center gap-1 rounded-full border bg-background/60 font-medium uppercase tracking-wide",
      TONE[confidence],
      {
        "px-1.5 py-0.5 text-[11px]": size === "sm",
        "px-2 py-0.5 text-xs": size === "md",
        "border-dashed": confidence === "modeled",
      },
      className,
    )}
    title={note ?? confidenceDescription[confidence]}
  >
    <svg aria-hidden="true" viewBox="0 0 8 8" className="size-2">
      {confidence === "reported" ? <circle cx="4" cy="4" r="3.5" fill="currentColor" /> : null}
      {confidence === "estimated" ? (
        <>
          <circle cx="4" cy="4" r="3.5" fill="currentColor" opacity="0.28" />
          <path d="M0 6 L6 0 M2 8 L8 2" stroke="currentColor" strokeWidth="1.2" />
        </>
      ) : null}
      {confidence === "modeled" ? (
        <circle
          cx="4"
          cy="4"
          r="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeDasharray="2 1.6"
        />
      ) : null}
    </svg>
    {confidenceLabel[confidence]}
  </span>
);
