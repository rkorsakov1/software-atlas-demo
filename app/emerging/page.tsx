import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmergingRoute } from "@/components/explore/EmergingRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { emerging } from "@/data";

export const metadata: Metadata = {
  title: "Emerging markets",
  description:
    "Candidate software markets, each scored on six typed signal types with its sources, stage, horizon and risks.",
};

const EmergingFallback = (): React.ReactElement => (
  <div className="grid gap-6 lg:grid-cols-2">
    <Skeleton className="h-24 w-full lg:col-span-2" />
    <Skeleton className="h-[560px] w-full" />
    <Skeleton className="h-[560px] w-full" />
    <span className="sr-only">Loading the emerging-market radar and list.</span>
  </div>
);

const EmergingPage = (): React.ReactElement => (
  <div className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 2xl:max-w-[1600px]">
    <header className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Where the next markets come from
      </p>
      <h1 className="mt-2 text-balance font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Emerging markets
      </h1>
      <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
        {emerging.length} candidates, each argued from typed signals rather than asserted: a platform
        shift opening white space, an input cost falling by an order of magnitude, a new data source
        or interface, a regulatory obligation, the unbundling of a bloated incumbent, or a leading
        indicator in capital and hiring. A dot&apos;s area is the sum of its signal strengths, so a
        large dot means the case is well evidenced — not that the market is large. Horizons are the
        softest numbers in the Atlas; the{" "}
        <Link
          href="/methodology/#limitations"
          className="underline underline-offset-4 hover:text-foreground"
        >
          methodology page
        </Link>{" "}
        says why.
      </p>
    </header>

    <div className="mt-8">
      <Suspense fallback={<EmergingFallback />}>
        <EmergingRoute />
      </Suspense>
    </div>
  </div>
);

export default EmergingPage;
