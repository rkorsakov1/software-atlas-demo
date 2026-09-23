"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { companies, events, markets } from "@/data";
import { searchAtlas, type SearchHit } from "@/lib/selectors";
import type { FocusRef } from "@/lib/url-state";

export type SearchCommandProps = {
  /** Applied to the URL as `focus` when a hit is chosen. */
  onSelectHit: (ref: FocusRef) => void;
  /** Applied to the URL as `q`, so the filters narrow with the search. */
  onQueryChange: (query: string) => void;
  query: string;
};

const GROUP_LABEL: Record<SearchHit["kind"], string> = {
  company: "Companies",
  market: "Markets",
  event: "Events",
};

const KINDS: readonly SearchHit["kind"][] = ["company", "market", "event"];

/**
 * Search across companies, markets and events. Choosing a hit sets `focus` in the
 * URL, which opens the detail drawer; the typed text is also written to `q` so
 * the charts narrow to what was searched for.
 */
export const SearchCommand = ({
  onSelectHit,
  onQueryChange,
  query,
}: SearchCommandProps): React.ReactElement => {
  const [open, setOpen] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>(query);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setOpen((current) => !current);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hits = searchAtlas({ companies, markets, events }, draft, 24);

  const handleSelect = (hit: SearchHit): void => {
    setOpen(false);
    onSelectHit({ kind: hit.kind, id: hit.id });
  };

  const handleApplyQuery = (): void => {
    setOpen(false);
    onQueryChange(draft.trim());
  };

  const handleOpenChange = (next: boolean): void => {
    setOpen(next);
    if (next) setDraft(query);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleOpenChange(true)}
        className="justify-start gap-2 text-muted-foreground"
      >
        <Search aria-hidden="true" className="size-4" />
        <span>Search companies, markets, events</span>
        <kbd className="ml-2 hidden rounded border border-border px-1.5 font-mono text-[11px] sm:inline">
          Ctrl K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search the Atlas"
        description="Find a company, a market or a competitive event by name."
      >
        <CommandInput
          value={draft}
          onValueChange={setDraft}
          placeholder="Search companies, markets and events…"
        />
        <CommandList>
          <CommandEmpty>
            {draft.trim().length === 0
              ? "Type to search across companies, markets and events."
              : `Nothing in the Atlas matches “${draft}”.`}
          </CommandEmpty>
          {KINDS.map((kind) => {
            const group = hits.filter((hit) => hit.kind === kind);
            if (group.length === 0) return null;
            return (
              <CommandGroup key={kind} heading={GROUP_LABEL[kind]}>
                {group.map((hit) => (
                  <CommandItem
                    key={`${hit.kind}-${hit.id}`}
                    value={`${hit.kind} ${hit.label} ${hit.detail}`}
                    onSelect={() => handleSelect(hit)}
                  >
                    <span className="flex-1 truncate">{hit.label}</span>
                    <span className="ml-2 shrink-0 font-mono text-[11px] text-muted-foreground">
                      {hit.detail}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
          {draft.trim().length === 0 ? null : (
            <CommandGroup heading="Filter">
              <CommandItem value={`apply-filter-${draft}`} onSelect={handleApplyQuery}>
                Narrow every chart to “{draft.trim()}”
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
