"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Height changes smaller than this are ignored. Hovering a mark can change a line
 * of text; rescaling for it would move the mark away from the cursor and loop.
 */
const HEIGHT_TOLERANCE_PX = 48;

/** Below this a chart is too small to read, so the panel scrolls instead. */
export const MIN_FIT_SCALE = 0.6;

export type UseViewportFitResult = {
  /** How much to shrink the block so it fits beside the prose: 1 when it already fits. */
  scale: number;
  /** The block's unscaled height in pixels, so the caller can reserve the scaled space. */
  height: number;
  /** True when even the minimum scale leaves the block taller than the viewport. */
  overflows: boolean;
  /** Attach to the block being fitted. Its layout height is unaffected by the transform. */
  measureRef: (node: HTMLElement | null) => void;
};

/**
 * A sticky panel only works while it fits the viewport it is pinned in. Rather
 * than let a tall chart scroll away (or pin it by an edge it never reaches), this
 * measures it and returns the scale that makes it fit, down to `MIN_FIT_SCALE`.
 *
 * `reservedPx` is the vertical space the pin cannot use: the sticky offset plus
 * breathing room beneath it.
 */
export const useViewportFit = (reservedPx: number): UseViewportFitResult => {
  const [fit, setFit] = useState<{ scale: number; height: number; overflows: boolean }>({
    scale: 1,
    height: 0,
    overflows: false,
  });
  const [node, setNode] = useState<HTMLElement | null>(null);
  const lastHeightRef = useRef<number>(0);
  const lastViewportRef = useRef<number>(0);

  const measureRef = useCallback((element: HTMLElement | null): void => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!node) return;
    if (typeof window === "undefined") return;

    const evaluate = (): void => {
      const height = node.offsetHeight;
      const viewport = window.innerHeight;
      const sameViewport = viewport === lastViewportRef.current;
      if (sameViewport && Math.abs(height - lastHeightRef.current) < HEIGHT_TOLERANCE_PX) return;
      lastHeightRef.current = height;
      lastViewportRef.current = viewport;
      const available = viewport - reservedPx;
      if (height <= 0 || height <= available) {
        setFit({ scale: 1, height, overflows: false });
        return;
      }
      const scale = Math.max(MIN_FIT_SCALE, available / height);
      setFit({ scale, height, overflows: height * scale > available });
    };

    evaluate();
    window.addEventListener("resize", evaluate);

    if (typeof ResizeObserver === "undefined") {
      return () => window.removeEventListener("resize", evaluate);
    }

    const observer = new ResizeObserver(evaluate);
    observer.observe(node);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", evaluate);
    };
  }, [node, reservedPx]);

  return { ...fit, measureRef };
};
