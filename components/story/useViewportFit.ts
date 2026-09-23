"use client";

import { useCallback, useEffect, useState } from "react";

export type UseViewportFitResult = {
  /** True when the measured block is taller than the space a sticky pin would have. */
  exceedsViewport: boolean;
  /** Attach to the block whose height decides whether pinning is safe. */
  measureRef: (node: HTMLElement | null) => void;
};

/**
 * A sticky panel only works while it is shorter than the viewport it is pinned
 * in; taller than that and the bottom of a chart becomes unreachable, or the
 * panel grows its own scrollbar and fights the page scroll. This measures the
 * block so the caller can pin it by its other edge — or not at all — instead.
 *
 * `reservedPx` is the vertical space the pin cannot use: the sticky offset plus
 * whatever breathing room the layout wants beneath it.
 */
export const useViewportFit = (reservedPx: number): UseViewportFitResult => {
  const [exceedsViewport, setExceedsViewport] = useState<boolean>(false);
  const [node, setNode] = useState<HTMLElement | null>(null);

  const measureRef = useCallback((element: HTMLElement | null): void => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!node) return;
    if (typeof window === "undefined") return;

    const evaluate = (): void => {
      setExceedsViewport(node.offsetHeight > window.innerHeight - reservedPx);
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

  return { exceedsViewport, measureRef };
};
