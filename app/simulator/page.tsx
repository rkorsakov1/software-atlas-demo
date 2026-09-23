import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { SimulatorDisclaimer, SimulatorRoute } from "@/components/charts/SimulatorChart";
import { Skeleton } from "@/components/ui/skeleton";
import { SIMULATOR_DISCLAIMER } from "@/lib/simulation";

export const metadata: Metadata = {
  title: "Market concentration simulator",
  description:
    "A seeded toy model of how network effects, switching costs, entrants and platform shifts push a software market towards or away from concentration. Illustrative, not predictive.",
};

const SimulatorFallback = (): React.ReactElement => (
  <div className="flex flex-col gap-4">
    <Skeleton className="h-52 w-full" />
    <Skeleton className="h-[520px] w-full" />
    <span className="sr-only">Loading the simulator controls and chart.</span>
  </div>
);

/**
 * A server component so the route can carry its own title: everything that reads
 * the URL lives in `SimulatorRoute`, which sits inside the Suspense boundary that
 * `useSearchParams` requires under `output: "export"`. The heading, the banner and
 * the explanation stay out here, so they are in the exported HTML and visible
 * before any JavaScript runs.
 */
const SimulatorPage = (): React.ReactElement => (
  <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <header className="mb-6 max-w-3xl">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Interactive model
      </p>
      <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Market concentration simulator
      </h1>
      <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
        <strong className="font-semibold text-foreground">{SIMULATOR_DISCLAIMER}</strong> Turn
        network effects, switching costs, the flow of entrants and the odds of a platform shift up
        and down, and watch whether the market tips towards one winner or stays fragmented. The run
        is fully determined by the seed, so the link in your address bar reproduces exactly what you
        are looking at.
      </p>
    </header>

    <div className="mb-4">
      <SimulatorDisclaimer />
    </div>

    <Suspense fallback={<SimulatorFallback />}>
      <SimulatorRoute />
    </Suspense>

    <section className="mt-10 max-w-3xl border-t border-border pt-6">
      <h2 className="font-serif text-xl font-semibold">What this model is, and is not</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        It is a teaching device. It has five starting firms, one abstract product, no prices, no
        costs, no regulation and no geography. Its ticks are not years, its firms are not companies,
        and nothing it outputs should be read as a forecast. What it does capture is the shape of
        three forces the rest of the Atlas documents with real data: share that compounds into more
        share, customers who cannot cheaply leave, and technology shifts that reset the board.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Every figure it produces is labelled <strong className="text-foreground">modeled</strong>,
        the same standard applied to the derived figures elsewhere in the Atlas. The equations,
        constants and known limitations are written out on the{" "}
        <Link
          href="/methodology/#simulator"
          className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          methodology page
        </Link>
        .
      </p>
    </section>
  </div>
);

export default SimulatorPage;
