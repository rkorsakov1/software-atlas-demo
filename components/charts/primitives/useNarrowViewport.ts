"use client";

import { useSyncExternalStore } from "react";

import { MOBILE_BREAKPOINT } from "@/components/charts/primitives/useChartSize";

const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const subscribe = (onStoreChange: () => void): (() => void) => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onStoreChange);
  return () => {
    media.removeEventListener("change", onStoreChange);
  };
};

const getSnapshot = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(QUERY).matches;
};

const getServerSnapshot = (): boolean => false;

/**
 * True on viewports narrower than the mobile breakpoint, read from `matchMedia`
 * rather than from a measured container. `useChartSize` only knows the width
 * after the first paint, which is too late to choose `ChartFrame`'s initial view;
 * this hook is right on the first client render, so the charts that CLAUDE.md §5
 * collapses on mobile (bubble, lineage, Sankey) can open straight on their table.
 */
export const useNarrowViewport = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
