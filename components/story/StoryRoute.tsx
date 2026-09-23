"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { EmptyState } from "@/components/charts/primitives";
import { ChapterBody } from "@/components/story/ChapterBody";
import { StoryGraphic, graphicMinHeightClass } from "@/components/story/StoryGraphic";
import { useActiveStep } from "@/components/story/useActiveStep";
import { useStackedLayout } from "@/components/story/useStackedLayout";
import { useViewportFit } from "@/components/story/useViewportFit";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { chapters } from "@/data";
import type { StoryChapter } from "@/data/types";
import { cn } from "@/lib/cn";
import { exploreHrefFromGraphicState } from "@/lib/url-state";

/**
 * The simulator is not one of the eight Explore charts, so its chapter links at
 * the simulator route instead — carrying the same parameters, which that route
 * parses with the same `parseAtlasState`.
 */
const graphicHref = (chapter: StoryChapter): string => {
  const href = exploreHrefFromGraphicState(chapter.graphicState);
  if (chapter.graphic !== "simulator") return href;
  const query = href.split("?")[1] ?? "";
  return query.length === 0 ? "/simulator/" : `/simulator/?${query}`;
};

const graphicLinkLabel = (chapter: StoryChapter): string =>
  chapter.graphic === "simulator" ? "Open the simulator" : "Explore this view";

/** How far ahead of the reading position a stacked graphic is mounted. */
const MOUNT_LOOKAHEAD = 1;

/**
 * Vertical space a pinned graphic cannot use: the `top-20` sticky offset plus a
 * little room beneath it. Past this, the panel pins by its bottom edge instead,
 * so a tall chart stays whole and scrolls with the page rather than growing its
 * own scrollbar.
 */
const STICKY_RESERVED_PX = 112;

/**
 * Story mode. On a wide screen one graphic sticks beside the prose and swaps as
 * the reader crosses into a new chapter; below `lg` each chapter carries its own
 * graphic inline, and only that layout is mounted.
 */
export const StoryRoute = (): React.ReactElement => {
  const stacked = useStackedLayout();
  const { activeIndex, registerStep } = useActiveStep(chapters.length);
  const { exceedsViewport, measureRef } = useViewportFit(STICKY_RESERVED_PX);

  if (chapters.length === 0) {
    return (
      <EmptyState
        title="No chapters are loaded"
        description="The narrative is assembled from data/chapters.ts, and this build contains none."
      />
    );
  }

  const activeChapter = chapters[Math.min(activeIndex, chapters.length - 1)] ?? chapters[0];

  return (
    <div
      className={cn(
        "grid gap-x-8 xl:gap-x-12",
        "lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]",
        "xl:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]",
        "2xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]",
      )}
    >
      <div className="min-w-0">
        <ol className="space-y-0">
          {chapters.map((chapter, index) => (
            <li
              key={chapter.id}
              ref={registerStep(index)}
              className={cn("border-t border-border py-12 transition-opacity duration-300", {
                "lg:opacity-45": !stacked && chapter.id !== activeChapter?.id,
              })}
            >
              <section aria-labelledby={`${chapter.id}-title`}>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Chapter {chapter.order} of {chapters.length} · {chapter.kicker}
                </p>
                <h2
                  id={`${chapter.id}-title`}
                  className="mt-2 text-balance text-2xl font-semibold leading-tight sm:text-3xl"
                >
                  {chapter.title}
                </h2>

                <div className="mt-5">
                  <ChapterBody paragraphs={chapter.body} />
                </div>

                <div className="mt-6">
                  <Button asChild variant="outline" size="sm">
                    <Link href={graphicHref(chapter)}>
                      {graphicLinkLabel(chapter)}
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                  </Button>
                </div>

                {stacked ? (
                  <div className="mt-8">
                    {index <= activeIndex + MOUNT_LOOKAHEAD ? (
                      <StoryGraphic key={chapter.id} chapter={chapter} />
                    ) : (
                      <Skeleton
                        className={cn("w-full", graphicMinHeightClass(chapter.graphic))}
                      />
                    )}
                  </div>
                ) : null}
              </section>
            </li>
          ))}
        </ol>
      </div>

      {stacked || activeChapter === undefined ? null : (
        <aside
          aria-label="Chapter graphic"
          className={cn("hidden min-w-0 py-8 lg:block lg:self-start", {
            "lg:sticky lg:top-20": !exceedsViewport,
            "lg:sticky lg:bottom-6": exceedsViewport,
          })}
        >
          <div ref={measureRef} className="flex min-w-0 flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Chapter {activeChapter.order} of {chapters.length} · {activeChapter.title}
              </p>
              <Link
                href={graphicHref(activeChapter)}
                className="shrink-0 text-xs underline underline-offset-4 hover:text-foreground"
              >
                {graphicLinkLabel(activeChapter)}
              </Link>
            </div>
            <div
              aria-hidden="true"
              className="flex gap-1"
            >
              {chapters.map((chapter, index) => (
                <span
                  key={chapter.id}
                  className={cn("h-0.5 flex-1 rounded-full bg-border", {
                    "bg-foreground": index <= activeIndex,
                  })}
                />
              ))}
            </div>
            <StoryGraphic key={activeChapter.id} chapter={activeChapter} />
          </div>
        </aside>
      )}
    </div>
  );
};
