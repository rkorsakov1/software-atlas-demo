"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useId, useState } from "react";

import { FilterToggleGroup } from "@/components/explore/FilterToggleGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { Archetype, Category, Maturity } from "@/data/types";
import { archetypeLabel, categoryLabel, maturityLabel } from "@/lib/format";
import { ARCHETYPE_ORDER, CATEGORY_ORDER, MATURITY_ORDER } from "@/lib/scales";
import { ATLAS_MAX_YEAR, ATLAS_MIN_YEAR, type AtlasState } from "@/lib/url-state";

export type FilterCounts = {
  markets: number;
  companies: number;
  events: number;
};

export type FilterBarProps = {
  state: AtlasState;
  onChange: (patch: Partial<AtlasState>) => void;
  counts: FilterCounts;
};

const toggleMember = <TValue extends string>(
  current: readonly TValue[],
  value: TValue,
): TValue[] =>
  current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];

/**
 * Year window on one line; category, archetype and maturity behind a toggle so
 * the chart stays near the top of the page. Filter values live in the URL; only
 * the open/closed state of the panel is local.
 */
export const FilterBar = ({ state, onChange, counts }: FilterBarProps): React.ReactElement => {
  const fromId = useId();
  const toId = useId();
  const panelId = useId();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const activeCount = state.cat.length + state.arch.length + state.mat.length;

  const hasFilters =
    state.cat.length > 0 ||
    state.arch.length > 0 ||
    state.mat.length > 0 ||
    state.q.length > 0 ||
    state.from !== ATLAS_MIN_YEAR ||
    state.to !== ATLAS_MAX_YEAR;

  const handleFromChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(event.target.value);
    if (!Number.isFinite(value)) return;
    onChange({ from: value });
  };

  const handleToChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(event.target.value);
    if (!Number.isFinite(value)) return;
    onChange({ to: value });
  };

  const handleReset = (): void => {
    onChange({
      cat: [],
      arch: [],
      mat: [],
      q: "",
      from: ATLAS_MIN_YEAR,
      to: ATLAS_MAX_YEAR,
    });
  };

  const handleClearQuery = (): void => onChange({ q: "" });

  const handleTogglePanel = (): void => setIsOpen((current) => !current);

  return (
    <section aria-label="Filters" className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3">
        <fieldset className="flex min-w-0 items-center gap-2">
          <legend className="sr-only">Years</legend>
          <label htmlFor={fromId} className="sr-only">
            First year
          </label>
          <Input
            id={fromId}
            type="number"
            inputMode="numeric"
            min={ATLAS_MIN_YEAR}
            max={ATLAS_MAX_YEAR}
            value={state.from}
            onChange={handleFromChange}
            className="h-8 w-20 tabular-nums"
          />
          <span aria-hidden="true" className="text-muted-foreground">
            –
          </span>
          <label htmlFor={toId} className="sr-only">
            Last year
          </label>
          <Input
            id={toId}
            type="number"
            inputMode="numeric"
            min={ATLAS_MIN_YEAR}
            max={ATLAS_MAX_YEAR}
            value={state.to}
            onChange={handleToChange}
            className="h-8 w-20 tabular-nums"
          />
        </fieldset>

        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={handleTogglePanel}
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filters
          {activeCount === 0 ? null : (
            <span className="rounded-full bg-brand px-1.5 text-[11px] font-medium leading-4 text-primary-foreground tabular-nums">
              {activeCount}
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 transition-transform", { "rotate-180": isOpen })}
          />
        </Button>

        <p aria-live="polite" className="min-w-0 flex-1 text-xs text-muted-foreground tabular-nums">
          {counts.markets} markets · {counts.companies} companies · {counts.events} events
          {state.q.length === 0 ? "" : ` matching “${state.q}”`}
        </p>

        <div className="flex items-center gap-2">
          {state.q.length === 0 ? null : (
            <Button size="xs" variant="outline" onClick={handleClearQuery}>
              Clear search
            </Button>
          )}
          {hasFilters ? (
            <Button size="xs" variant="ghost" onClick={handleReset}>
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      <div
        id={panelId}
        hidden={!isOpen}
        className="flex flex-wrap items-start gap-x-8 gap-y-5 border-t border-border px-4 py-4"
      >
        <FilterToggleGroup<Category>
          legend="Category"
          options={CATEGORY_ORDER.map((category) => ({
            value: category,
            label: categoryLabel[category],
          }))}
          selected={state.cat}
          onToggle={(value) => onChange({ cat: toggleMember(state.cat, value) })}
          onClear={() => onChange({ cat: [] })}
        />

        <FilterToggleGroup<Archetype>
          legend="Archetype"
          options={ARCHETYPE_ORDER.map((archetype) => ({
            value: archetype,
            label: archetypeLabel[archetype],
          }))}
          selected={state.arch}
          onToggle={(value) => onChange({ arch: toggleMember(state.arch, value) })}
          onClear={() => onChange({ arch: [] })}
        />

        <FilterToggleGroup<Maturity>
          legend="Maturity"
          options={MATURITY_ORDER.map((maturity) => ({
            value: maturity,
            label: maturityLabel[maturity],
          }))}
          selected={state.mat}
          onToggle={(value) => onChange({ mat: toggleMember(state.mat, value) })}
          onClear={() => onChange({ mat: [] })}
        />
      </div>
    </section>
  );
};
