"use client";

import { PanelRightOpen } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ChartSwitcher, CHART_DESCRIPTION, CHART_LABEL } from "@/components/explore/ChartSwitcher";
import { ComparisonTray } from "@/components/explore/ComparisonTray";
import { DetailDrawer } from "@/components/explore/DetailDrawer";
import { ExplorePanel } from "@/components/explore/ExplorePanel";
import { FilterBar } from "@/components/explore/FilterBar";
import { SearchCommand } from "@/components/explore/SearchCommand";
import { useAtlasState } from "@/components/explore/useAtlasState";
import { YearScrubber } from "@/components/explore/YearScrubber";
import { Button } from "@/components/ui/button";
import { companies, events, markets } from "@/data";
import {
  filterCompanies,
  filterEvents,
  filterMarkets,
  type AtlasFilters,
} from "@/lib/selectors";
import { cn } from "@/lib/cn";
import type { AtlasState, FocusRef } from "@/lib/url-state";

const PANEL_ID = "explore-chart-panel";
const TAB_ID_PREFIX = "explore-chart-tab-";

/**
 * Explore. Every filter, the year, the pinned comparison and the focused entity
 * live in the query string, so the address bar is the complete description of
 * what is on screen. The drawer's open/closed state is the one exception: it is
 * an action, not a view, and opening it on every arrival would cover the chart a
 * shared link was meant to show.
 */
export const ExploreRoute = (): React.ReactElement => {
  const { state, setState, handleTogglePin } = useAtlasState();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

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

  const handleStateChange = useCallback(
    (patch: Partial<AtlasState>): void => setState(patch),
    [setState],
  );

  const handleOpenDetail = useCallback(
    (kind: "company" | "market" | "event", id: string): void => {
      setState({ focus: { kind, id } });
      setDrawerOpen(true);
    },
    [setState],
  );

  const handleSelectHit = useCallback(
    (ref: FocusRef): void => {
      setState({ focus: ref });
      setDrawerOpen(true);
    },
    [setState],
  );

  const handleQueryChange = useCallback(
    (query: string): void => setState({ q: query }),
    [setState],
  );

  const handleYearChange = useCallback(
    (year: number): void => setState({ year }),
    [setState],
  );

  const handleCloseDrawer = (): void => setDrawerOpen(false);
  const handleReopenDrawer = (): void => setDrawerOpen(true);
  const handleClearPins = (): void => setState({ pin: [] });
  const handleChartChange = (chart: AtlasState["chart"]): void => setState({ chart });

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ChartSwitcher
            chart={state.chart}
            onChartChange={handleChartChange}
            panelId={PANEL_ID}
            tabIdPrefix={TAB_ID_PREFIX}
          />
          <div className="flex items-center gap-2">
            <SearchCommand
              query={state.q}
              onQueryChange={handleQueryChange}
              onSelectHit={handleSelectHit}
            />
            {state.focus === null ? null : (
              <Button variant="outline" size="sm" onClick={handleReopenDrawer}>
                <PanelRightOpen aria-hidden="true" className="size-4" />
                Details
              </Button>
            )}
          </div>
        </div>

        <FilterBar
          state={state}
          onChange={handleStateChange}
          counts={{
            markets: filteredMarkets.length,
            companies: filteredCompanies.length,
            events: filteredEvents.length,
          }}
        />

        <div
          className={cn("grid gap-4", {
            "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]": state.pin.length > 0,
          })}
        >
          <YearScrubber
            year={state.year}
            minYear={state.from}
            maxYear={state.to}
            onYearChange={handleYearChange}
          />
          {/* Pins are added from a company's details; the tray appears once there is one. */}
          {state.pin.length === 0 ? null : (
            <ComparisonTray
              pinnedIds={state.pin}
              onUnpin={handleTogglePin}
              onClear={handleClearPins}
            />
          )}
        </div>

        <section
          id={PANEL_ID}
          role="tabpanel"
          tabIndex={-1}
          aria-labelledby={`${TAB_ID_PREFIX}${state.chart}`}
          className="min-w-0 scroll-mt-20 outline-none"
        >
          <h2 className="sr-only">{CHART_LABEL[state.chart]}</h2>
          <p className="mb-3 text-sm text-muted-foreground">{CHART_DESCRIPTION[state.chart]}</p>
          <ExplorePanel
            state={state}
            onStateChange={handleStateChange}
            onTogglePin={handleTogglePin}
            onOpenDetail={handleOpenDetail}
            filteredMarkets={filteredMarkets}
            filteredCompanies={filteredCompanies}
            filteredEvents={filteredEvents}
          />
        </section>
      </div>

      <DetailDrawer
        focus={drawerOpen ? state.focus : null}
        onClose={handleCloseDrawer}
        pinnedIds={state.pin}
        onTogglePin={handleTogglePin}
        returnFocusElementId={PANEL_ID}
      />
    </>
  );
};
