"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

import { DetailDrawer } from "@/components/explore/DetailDrawer";
import { ExplorePanel } from "@/components/explore/ExplorePanel";
import { Skeleton } from "@/components/ui/skeleton";
import { companies, events, markets } from "@/data";
import type { GraphicKind, GraphicState, StoryChapter } from "@/data/types";
import { cn } from "@/lib/cn";
import type { SimulationParams } from "@/lib/simulation";
import {
  filterCompanies,
  filterEvents,
  filterMarkets,
  type AtlasFilters,
} from "@/lib/selectors";
import { parseAtlasState, type AtlasState } from "@/lib/url-state";

/**
 * The room a chapter's graphic is guaranteed, prose column or not: `CONTRACTS.md`
 * §10.4 sets a 420px plot floor, 520px for the Sankey and the lineage graph, and
 * these add the frame's own chrome — title, takeaway, toolbar, source line — on
 * top of it. A minimum, never a cap: a chart that needs more room takes it.
 */
const MIN_HEIGHT_CLASS: Record<GraphicKind, string> = {
  timeline: "min-h-[560px]",
  treemap: "min-h-[560px]",
  share: "min-h-[560px]",
  bubble: "min-h-[560px]",
  lineage: "min-h-[680px]",
  bundling: "min-h-[680px]",
  moat: "min-h-[560px]",
  emerging: "min-h-[560px]",
  simulator: "min-h-[620px]",
};

export const graphicMinHeightClass = (graphic: GraphicKind): string => MIN_HEIGHT_CLASS[graphic];

const SimulatorPanel = dynamic(
  () => import("@/components/charts/SimulatorChart").then((module) => module.SimulatorPanel),
  { ssr: false, loading: () => <Skeleton className="h-[620px] w-full" /> },
);

const searchParamsFrom = (graphicState: GraphicState): URLSearchParams => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(graphicState)) {
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(","));
      continue;
    }
    params.set(key, String(value));
  }
  return params;
};

const simulationParamsFrom = (state: AtlasState): SimulationParams => ({
  networkStrength: state.net,
  switchingCost: state.sw,
  entrantsPerTick: state.ent,
  shiftProb: state.shift,
  ticks: state.ticks,
  seed: state.seed,
});

export type StoryGraphicProps = {
  chapter: StoryChapter;
};

/**
 * A chapter's graphic. It is the same `ExplorePanel` the Explore route renders,
 * driven by the chapter's `graphicState` instead of the URL, so a chapter can
 * never drift from what "Explore this view" opens. Mount it with
 * `key={chapter.id}` so switching chapters re-seeds the state.
 */
export const StoryGraphic = ({ chapter }: StoryGraphicProps): React.ReactElement => {
  const initial = useMemo(
    () => parseAtlasState(searchParamsFrom(chapter.graphicState)),
    [chapter.graphicState],
  );

  const [state, setState] = useState<AtlasState>(initial);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [simulationParams, setSimulationParams] = useState<SimulationParams>(() =>
    simulationParamsFrom(initial),
  );

  const filters = useMemo<AtlasFilters>(
    () => ({
      from: state.from,
      to: state.to,
      cat: state.cat,
      arch: state.arch,
      mat: state.mat,
      q: state.q,
    }),
    [state.arch, state.cat, state.from, state.mat, state.q, state.to],
  );

  const filteredMarkets = useMemo(() => filterMarkets(markets, filters), [filters]);
  const filteredCompanies = useMemo(
    () => filterCompanies(companies, markets, filters),
    [filters],
  );
  const filteredEvents = useMemo(() => filterEvents(events, markets, filters), [filters]);

  const handleStateChange = useCallback((patch: Partial<AtlasState>): void => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const handleTogglePin = useCallback((id: string): void => {
    setState((current) => {
      if (current.pin.includes(id)) {
        return { ...current, pin: current.pin.filter((pinned) => pinned !== id) };
      }
      if (current.pin.length >= 3) return current;
      return { ...current, pin: [...current.pin, id] };
    });
  }, []);

  const handleOpenDetail = useCallback(
    (kind: "company" | "market" | "event", id: string): void => {
      setState((current) => ({ ...current, focus: { kind, id } }));
      setDrawerOpen(true);
    },
    [],
  );

  const handleCloseDrawer = (): void => setDrawerOpen(false);

  const panelId = `story-graphic-${chapter.id}`;

  if (chapter.graphic === "simulator") {
    return (
      <div
        id={panelId}
        tabIndex={-1}
        className={cn("min-w-0 outline-none", graphicMinHeightClass(chapter.graphic))}
      >
        <SimulatorPanel params={simulationParams} onParamsChange={setSimulationParams} compact />
      </div>
    );
  }

  return (
    <>
      <div
        id={panelId}
        tabIndex={-1}
        className={cn("min-w-0 outline-none", graphicMinHeightClass(chapter.graphic))}
      >
        <ExplorePanel
          state={state}
          onStateChange={handleStateChange}
          onTogglePin={handleTogglePin}
          onOpenDetail={handleOpenDetail}
          filteredMarkets={filteredMarkets}
          filteredCompanies={filteredCompanies}
          filteredEvents={filteredEvents}
        />
      </div>
      <DetailDrawer
        focus={drawerOpen ? state.focus : null}
        onClose={handleCloseDrawer}
        pinnedIds={state.pin}
        onTogglePin={handleTogglePin}
        returnFocusElementId={panelId}
      />
    </>
  );
};
