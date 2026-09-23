"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ChartSize = { width: number; height: number };

export type UseChartSizeOptions = {
  /** Used before the first measurement and when the element is detached. */
  initial?: ChartSize;
  /** Height is derived from width unless the caller passes a fixed height. */
  aspectRatio?: number;
  minHeight?: number;
  maxHeight?: number;
};

export type UseChartSizeResult = {
  ref: (node: HTMLDivElement | null) => void;
  size: ChartSize;
  /** True until the first real measurement lands, so charts can skip layout work. */
  measuring: boolean;
};

const DEFAULT_INITIAL: ChartSize = { width: 720, height: 420 };

/**
 * Measures a container with a ResizeObserver and derives a chart height from its
 * width. Charts read `size` for their scales; they never read the DOM themselves.
 */
export const useChartSize = (options: UseChartSizeOptions = {}): UseChartSizeResult => {
  const { initial = DEFAULT_INITIAL, aspectRatio, minHeight = 220, maxHeight = 720 } = options;

  const [size, setSize] = useState<ChartSize>(initial);
  const [measuring, setMeasuring] = useState<boolean>(true);
  const observerRef = useRef<ResizeObserver | null>(null);

  const computeHeight = useCallback(
    (width: number): number => {
      if (aspectRatio === undefined) return initial.height;
      const derived = width / aspectRatio;
      return Math.round(Math.min(maxHeight, Math.max(minHeight, derived)));
    },
    [aspectRatio, initial.height, maxHeight, minHeight],
  );

  const ref = useCallback(
    (node: HTMLDivElement | null): void => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node) return;
      if (typeof ResizeObserver === "undefined") {
        setMeasuring(false);
        return;
      }

      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const width = Math.round(entry.contentRect.width);
        if (width <= 0) return;
        setSize({ width, height: computeHeight(width) });
        setMeasuring(false);
      });

      observer.observe(node);
      observerRef.current = observer;

      const width = Math.round(node.getBoundingClientRect().width);
      if (width > 0) {
        setSize({ width, height: computeHeight(width) });
        setMeasuring(false);
      }
    },
    [computeHeight],
  );

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    },
    [],
  );

  return { ref, size, measuring };
};

/** Shared breakpoint for the simplified mobile variants required by CLAUDE.md §5. */
export const MOBILE_BREAKPOINT = 640;

export const isNarrow = (width: number): boolean => width < MOBILE_BREAKPOINT;
