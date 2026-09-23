"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { useReducedMotion } from "@/components/charts/primitives";
import { Button } from "@/components/ui/button";
import { eras } from "@/data";
import { cn } from "@/lib/cn";
import { formatYearRange } from "@/lib/format";
import { eraAtYear } from "@/lib/selectors";

const PLAY_INTERVAL_MS = 900;

export type YearScrubberProps = {
  year: number;
  minYear: number;
  maxYear: number;
  onYearChange: (year: number) => void;
  className?: string;
};

/**
 * The one year control for the whole Explore view. Every chart that has a notion
 * of "the year on screen" reads it, so moving this moves the treemap, the bubble
 * chart and the era readout together.
 */
export const YearScrubber = ({
  year,
  minYear,
  maxYear,
  onYearChange,
  className,
}: YearScrubberProps): React.ReactElement => {
  const inputId = useId();
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState<boolean>(false);

  const canPlay = maxYear > minYear && !reducedMotion;
  const era = eraAtYear(eras, year);

  // Derived, not stored: if the year window collapses or the viewer asks for
  // reduced motion, playback stops without an effect writing state back.
  const isPlaying = playing && canPlay;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => {
      onYearChange(year >= maxYear ? minYear : year + 1);
    }, PLAY_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [isPlaying, maxYear, minYear, onYearChange, year]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onYearChange(Number(event.target.value));
  };

  const handleStepBack = (): void => onYearChange(Math.max(minYear, year - 1));
  const handleStepForward = (): void => onYearChange(Math.min(maxYear, year + 1));
  const handleTogglePlay = (): void => setPlaying((current) => !current);

  return (
    <section
      aria-label="Year"
      className={cn("rounded-lg border border-border bg-card p-3", className)}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Year
        </label>
        <output htmlFor={inputId} className="font-serif text-xl font-semibold tabular-nums">
          {year}
        </output>

        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleStepBack}
            disabled={year <= minYear}
            aria-label="Step back one year"
          >
            <SkipBack aria-hidden="true" className="size-4" />
          </Button>
          {canPlay ? (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? "Pause the year animation" : "Play the year animation"}
              aria-pressed={isPlaying}
            >
              {isPlaying ? (
                <Pause aria-hidden="true" className="size-4" />
              ) : (
                <Play aria-hidden="true" className="size-4" />
              )}
            </Button>
          ) : null}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleStepForward}
            disabled={year >= maxYear}
            aria-label="Step forward one year"
          >
            <SkipForward aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <input
          id={inputId}
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={year}
          onChange={handleChange}
          aria-valuetext={`${year}${era ? `, ${era.name}` : ""}`}
          className="h-2 min-w-40 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
        />
      </div>

      <p aria-live="polite" className="mt-2 text-xs text-muted-foreground">
        {era === undefined
          ? `No era in the dataset covers ${year}.`
          : `${era.name} · ${formatYearRange(era.startYear, era.endYear)} · ${era.businessModel}`}
      </p>
    </section>
  );
};
