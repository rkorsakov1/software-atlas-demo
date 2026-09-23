"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

import { EmergingDetail } from "@/components/explore/EmergingDetail";
import { FilterToggleGroup } from "@/components/explore/FilterToggleGroup";
import { useAtlasState } from "@/components/explore/useAtlasState";
import { EmptyState } from "@/components/charts/primitives";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { emerging, sources } from "@/data";
import type { Category, EmergingStage, Horizon, Maturity } from "@/data/types";
import { categoryLabel, horizonLabel, maturityLabel } from "@/lib/format";
import { CATEGORY_ORDER } from "@/lib/scales";
import { byId, signalStrengthTotal, sourceTitle } from "@/lib/selectors";

const EmergingRadar = dynamic(
  () => import("@/components/charts/EmergingRadar").then((module) => module.EmergingRadar),
  { ssr: false, loading: () => <Skeleton className="h-[560px] w-full" /> },
);

const STAGE_ORDER: readonly EmergingStage[] = [
  "nascent",
  "emerging",
  "scaling",
  "consolidating",
];

const HORIZON_ORDER: readonly Horizon[] = ["0-2y", "2-5y", "5y+"];

const isStage = (value: Maturity): value is EmergingStage =>
  STAGE_ORDER.includes(value as EmergingStage);

const ROW_ID_PREFIX = "emerging-row-";
const RADAR_HEADING_ID = "emerging-radar-heading";
const LIST_HEADING_ID = "emerging-list-heading";

export const EmergingRoute = (): React.ReactElement => {
  const { state, setState } = useAtlasState();
  const [horizons, setHorizons] = useState<Horizon[]>([]);

  const stages = useMemo<EmergingStage[]>(() => state.mat.filter(isStage), [state.mat]);

  const visible = useMemo(
    () =>
      emerging.filter((market) => {
        if (state.cat.length > 0 && !state.cat.includes(market.category)) return false;
        if (stages.length > 0 && !stages.includes(market.stage)) return false;
        if (horizons.length > 0 && !horizons.includes(market.horizon)) return false;
        return true;
      }),
    [horizons, stages, state.cat],
  );

  const selectedId = state.focus?.kind === "market" ? state.focus.id : null;
  const selected = selectedId === null ? undefined : byId(emerging, selectedId);

  const sourceTitleFor = useCallback((sourceId: string): string => sourceTitle(sources, sourceId), []);

  const handleToggleCategory = (value: Category): void => {
    setState({
      cat: state.cat.includes(value)
        ? state.cat.filter((entry) => entry !== value)
        : [...state.cat, value],
    });
  };

  const handleToggleStage = (value: EmergingStage): void => {
    setState({
      mat: state.mat.includes(value)
        ? state.mat.filter((entry) => entry !== value)
        : [...state.mat, value],
    });
  };

  const handleToggleHorizon = (value: Horizon): void => {
    setHorizons((current) =>
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  };

  const handleClearCategories = (): void => setState({ cat: [] });
  const handleClearStages = (): void => setState({ mat: [] });
  const handleClearHorizons = (): void => setHorizons([]);

  const handleSelectMarket = (marketId: string): void => {
    setState({ focus: { kind: "market", id: marketId } });
  };

  const handleOpenChange = (open: boolean): void => {
    if (open) return;
    setState({ focus: null });
  };

  const handleCloseAutoFocus = (event: Event): void => {
    if (selectedId === null) return;
    const trigger = document.getElementById(`${ROW_ID_PREFIX}${selectedId}`);
    if (!trigger) return;
    event.preventDefault();
    trigger.focus();
  };

  const categoriesPresent = useMemo(
    () => CATEGORY_ORDER.filter((category) => emerging.some((m) => m.category === category)),
    [],
  );

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section aria-label="Filters" className="lg:col-span-2">
          <div className="flex flex-wrap gap-x-8 gap-y-4 rounded-lg border border-border bg-card p-4">
            <FilterToggleGroup
              legend="Category"
              options={categoriesPresent.map((category) => ({
                value: category,
                label: categoryLabel[category],
              }))}
              selected={state.cat}
              onToggle={handleToggleCategory}
              onClear={handleClearCategories}
            />
            <FilterToggleGroup
              legend="Stage"
              options={STAGE_ORDER.map((stage) => ({ value: stage, label: maturityLabel[stage] }))}
              selected={stages}
              onToggle={handleToggleStage}
              onClear={handleClearStages}
            />
            <FilterToggleGroup
              legend="Horizon"
              options={HORIZON_ORDER.map((horizon) => ({
                value: horizon,
                label: horizonLabel[horizon],
              }))}
              selected={horizons}
              onToggle={handleToggleHorizon}
              onClear={handleClearHorizons}
            />
          </div>
          <p aria-live="polite" className="mt-2 text-xs text-muted-foreground">
            Showing {visible.length} of {emerging.length} candidate markets.
          </p>
        </section>

        <section aria-labelledby={RADAR_HEADING_ID} className="min-h-[560px] min-w-0">
          <h2 id={RADAR_HEADING_ID} className="sr-only">
            Emerging market radar
          </h2>
          <EmergingRadar
            markets={visible}
            selectedId={selectedId}
            onSelectMarket={handleSelectMarket}
            sourceTitleFor={sourceTitleFor}
          />
        </section>

        <section aria-labelledby={LIST_HEADING_ID} className="min-w-0">
          <h2 id={LIST_HEADING_ID} className="sr-only">
            Emerging market list
          </h2>
          {visible.length === 0 ? (
            <EmptyState
              title="No candidate matches these filters"
              description="Clear a filter to bring all the candidate markets back into view."
            />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {visible.map((market) => (
                <li key={market.id}>
                  <button
                    type="button"
                    id={`${ROW_ID_PREFIX}${market.id}`}
                    onClick={() => handleSelectMarket(market.id)}
                    aria-haspopup="dialog"
                    aria-expanded={selectedId === market.id}
                    className="w-full px-4 py-3 text-left transition-colors hover:bg-secondary/60"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="font-serif text-base font-semibold">{market.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {horizonLabel[market.horizon]} · {maturityLabel[market.stage]}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-pretty text-sm text-muted-foreground">
                      {market.thesis}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="outline">{categoryLabel[market.category]}</Badge>
                      <Badge variant="secondary">
                        {market.signals.length} signals · strength {signalStrengthTotal(market)}
                      </Badge>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Sheet open={selected !== undefined} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-xl"
          onCloseAutoFocus={handleCloseAutoFocus}
        >
          {selected === undefined ? null : (
            <>
              <SheetHeader>
                <SheetTitle className="font-serif text-xl">{selected.name}</SheetTitle>
                <SheetDescription>
                  A candidate market, scored on typed and sourced signals rather than asserted.
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-8">
                <EmergingDetail market={selected} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
