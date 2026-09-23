"use client";

import { useSyncExternalStore } from "react";

/** Tailwind's `lg` breakpoint: below it Story stacks instead of sticking. */
const QUERY = "(max-width: 1023px)";

const subscribe = (onStoreChange: () => void): (() => void) => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
};

const getSnapshot = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(QUERY).matches;
};

const getServerSnapshot = (): boolean => false;

/**
 * True when Story should put each chapter's graphic inline beneath its prose
 * instead of pinning one sticky graphic beside the column. It is a real media
 * query rather than a `hidden lg:block` pair, so only one copy of each chart is
 * ever mounted.
 */
export const useStackedLayout = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
