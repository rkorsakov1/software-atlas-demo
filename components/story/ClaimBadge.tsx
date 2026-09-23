import { cn } from "@/lib/cn";

export type ClaimType = "F" | "I" | "A";

export const CLAIM_NAME: Record<ClaimType, string> = {
  F: "Fact",
  I: "Interpretation",
  A: "Analysis",
};

export const CLAIM_MEANING: Record<ClaimType, string> = {
  F: "A documented event, date or number, traceable to a source.",
  I: "A reading widely held among analysts and historians, not a measurement.",
  A: "This project's own argument. Disagree freely.",
};

const TONE: Record<ClaimType, string> = {
  F: "border-reported/50 text-reported",
  I: "border-estimated/50 text-estimated",
  A: "border-modeled/50 text-modeled",
};

export type ClaimBadgeProps = {
  claim: ClaimType;
  className?: string;
};

/** The [F] / [I] / [A] marker that opens a paragraph in `research.md`. */
export const ClaimBadge = ({ claim, className }: ClaimBadgeProps): React.ReactElement => (
  <span
    title={`${CLAIM_NAME[claim]}: ${CLAIM_MEANING[claim]}`}
    className={cn(
      "mr-2 inline-flex shrink-0 items-center rounded border bg-background/60 px-1.5 py-0.5 align-[0.15em] font-mono text-[11px] font-medium uppercase tracking-wide",
      TONE[claim],
      className,
    )}
  >
    <span aria-hidden="true">{claim}</span>
    <span className="sr-only">{CLAIM_NAME[claim]}</span>
  </span>
);

export type ClaimLegendProps = { className?: string };

/** The key that makes the badges readable; rendered once at the top of Story. */
export const ClaimLegend = ({ className }: ClaimLegendProps): React.ReactElement => (
  <dl
    className={cn(
      "grid gap-x-6 gap-y-2 rounded-lg border border-border bg-card p-4 text-sm sm:grid-cols-3",
      className,
    )}
  >
    {(Object.keys(CLAIM_NAME) as ClaimType[]).map((claim) => (
      <div key={claim} className="flex min-w-0 items-start gap-2">
        <dt className="shrink-0">
          <ClaimBadge claim={claim} />
          <span className="sr-only">{CLAIM_NAME[claim]}</span>
        </dt>
        <dd className="min-w-0">
          <span className="font-medium">{CLAIM_NAME[claim]}</span>
          <span className="block text-pretty text-xs leading-snug text-muted-foreground">
            {CLAIM_MEANING[claim]}
          </span>
        </dd>
      </div>
    ))}
  </dl>
);
