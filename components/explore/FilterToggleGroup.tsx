"use client";

import { cn } from "@/lib/cn";

export type FilterOption<TValue extends string> = {
  value: TValue;
  label: string;
  /** Rendered after the label, e.g. a count of matching rows. */
  hint?: string;
};

export type FilterToggleGroupProps<TValue extends string> = {
  legend: string;
  options: readonly FilterOption<TValue>[];
  selected: readonly TValue[];
  onToggle: (value: TValue) => void;
  onClear?: () => void;
  className?: string;
};

/**
 * A multi-select filter as a fieldset of toggle buttons. Buttons rather than
 * checkboxes because each one is a single-press action that rewrites the URL, and
 * `aria-pressed` states it exactly.
 */
export const FilterToggleGroup = <TValue extends string>({
  legend,
  options,
  selected,
  onToggle,
  onClear,
  className,
}: FilterToggleGroupProps<TValue>): React.ReactElement => (
  <fieldset className={cn("min-w-0", className)}>
    <legend className="mb-1.5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
      {legend}
      {onClear === undefined || selected.length === 0 ? null : (
        <button
          type="button"
          onClick={onClear}
          className="rounded normal-case tracking-normal underline underline-offset-2 hover:text-foreground"
        >
          clear
        </button>
      )}
    </legend>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(option.value)}
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-xs leading-5 transition-colors hover:bg-secondary",
              {
                "border-foreground bg-foreground text-background hover:bg-foreground": isSelected,
              },
            )}
          >
            {option.label}
            {option.hint === undefined ? null : (
              <span className="ml-1.5 tabular-nums opacity-70">{option.hint}</span>
            )}
          </button>
        );
      })}
    </div>
  </fieldset>
);
