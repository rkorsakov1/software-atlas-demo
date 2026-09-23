"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type UseActiveStepResult = {
  activeIndex: number;
  /** Attach to each step element: `ref={registerStep(index)}`. */
  registerStep: (index: number) => (node: HTMLElement | null) => void;
};

/**
 * The reading band: a slice of the viewport a third of the way down. A step is
 * "being read" while it covers that line, which holds for steps of any height —
 * a chapter taller than the screen covers it for the whole time it is on screen,
 * and a short one covers it as it passes.
 */
const READING_BAND = "-32% 0px -58% 0px";

/**
 * Tracks which scrollytelling step is in the reading band so the sticky graphic
 * can follow the prose. The set of steps currently crossing the band is kept
 * across callbacks — an IntersectionObserver only reports what changed, so
 * deciding from one batch alone would lose steps that entered earlier and are
 * still there. The topmost crossing step wins, which makes the switch happen when
 * the previous chapter has cleared the band rather than the moment the next one
 * peeks into it.
 */
export const useActiveStep = (stepCount: number): UseActiveStepResult => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const nodesRef = useRef<Map<number, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const crossingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (stepCount === 0) return;
    if (typeof IntersectionObserver === "undefined") return;

    const crossing = crossingRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(entry.target.getAttribute("data-step-index"));
          if (!Number.isInteger(index)) continue;
          if (entry.isIntersecting) {
            crossing.add(index);
            continue;
          }
          crossing.delete(index);
        }
        if (crossing.size === 0) return;
        setActiveIndex(Math.min(...crossing));
      },
      { rootMargin: READING_BAND, threshold: 0 },
    );

    observerRef.current = observer;
    for (const node of nodesRef.current.values()) observer.observe(node);

    return () => {
      observer.disconnect();
      observerRef.current = null;
      crossing.clear();
    };
  }, [stepCount]);

  // One stable callback per index: a fresh closure on every render would make
  // React detach and re-attach every step ref, and each re-observe fires the
  // IntersectionObserver again for no reason.
  const callbacksRef = useRef<Map<number, (node: HTMLElement | null) => void>>(new Map());

  const registerStep = useCallback((index: number): ((node: HTMLElement | null) => void) => {
    const existing = callbacksRef.current.get(index);
    if (existing) return existing;

    const callback = (node: HTMLElement | null): void => {
      const previous = nodesRef.current.get(index);
      if (previous) {
        observerRef.current?.unobserve(previous);
        nodesRef.current.delete(index);
        crossingRef.current.delete(index);
      }
      if (!node) return;
      node.setAttribute("data-step-index", String(index));
      nodesRef.current.set(index, node);
      observerRef.current?.observe(node);
    };

    callbacksRef.current.set(index, callback);
    return callback;
  }, []);

  return { activeIndex, registerStep };
};
