import type { Metadata } from "next";
import { Suspense } from "react";

import { ExploreRoute } from "@/components/explore/ExploreRoute";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Eight cross-linked views of the software industry — eras, market sizes, share, revenue and growth, acquisitions, bundling flows, moats and emerging markets — with every filter in the URL.",
};

const ExploreFallback = (): React.ReactElement => (
  <div className="flex flex-col gap-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-[520px] w-full" />
    <span className="sr-only">Loading the Explore view from the link&apos;s parameters.</span>
  </div>
);

const ExplorePage = (): React.ReactElement => (
  <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 2xl:max-w-[1600px]">
    <header className="sr-only">
      <h1>Explore the Software Atlas</h1>
    </header>
    <Suspense fallback={<ExploreFallback />}>
      <ExploreRoute />
    </Suspense>
  </div>
);

export default ExplorePage;
