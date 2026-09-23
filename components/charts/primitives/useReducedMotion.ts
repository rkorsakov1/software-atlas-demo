"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

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
 * True when the viewer asked for reduced motion. Charts use it to skip tweens and
 * to leave autoplay paused. It reads the media query as an external store, so the
 * server snapshot is `false` and the real value arrives with hydration.
 */
export const useReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

const subscribeNever = (): (() => void) => () => undefined;
const alwaysTrue = (): boolean => true;
const alwaysFalse = (): boolean => false;

/**
 * False during server rendering and the hydration pass, true afterwards. Use it
 * for controls whose correct markup is only knowable in the browser.
 */
export const useIsMounted = (): boolean =>
  useSyncExternalStore(subscribeNever, alwaysTrue, alwaysFalse);
