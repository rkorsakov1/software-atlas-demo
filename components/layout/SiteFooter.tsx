import Link from "next/link";

export const SiteFooter = (): React.ReactElement => (
  <footer className="mt-16 border-t border-border">
    <div className="mx-auto w-full max-w-[1400px] px-4 py-10 text-sm text-muted-foreground sm:px-6">
      <p className="max-w-3xl text-pretty">
        Every figure in the Atlas carries a source, a year and a confidence level. Figures labelled{" "}
        <span className="font-medium text-foreground">estimated</span> come from analysts or the
        press; figures labelled <span className="font-medium text-foreground">modeled</span> are
        derived here and state their method. Where no reliable public data exists, the Atlas shows
        that rather than filling the gap.
      </p>
      <p className="mt-4">
        <Link href="/methodology/" className="underline underline-offset-4 hover:text-foreground">
          Methodology, sources and limitations
        </Link>
      </p>
      <p className="mt-4 text-xs">
        Built by Claude, an AI model made by Anthropic. Anthropic appears in this atlas as a market
        participant and is scored with the same rubric as its competitors; see the disclosure on the
        methodology page.
      </p>
    </div>
  </footer>
);
