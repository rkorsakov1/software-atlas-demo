"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export type KeyboardNavOrientation = "horizontal" | "vertical" | "grid";

export type UseKeyboardNavOptions<TItem> = {
  items: readonly TItem[];
  /** Stable id per item; focus follows the id so it survives re-sorting. */
  getId: (item: TItem) => string;
  orientation?: KeyboardNavOrientation;
  /** Columns per row; only read when `orientation` is "grid". */
  columns?: number;
  onActivate?: (item: TItem, index: number) => void;
  onFocusChange?: (item: TItem, index: number) => void;
};

export type UseKeyboardNavResult<TItem> = {
  activeId: string | null;
  activeIndex: number;
  /** Roving tabindex: exactly one mark in the chart is in the tab order. */
  getTabIndex: (item: TItem) => 0 | -1;
  /** Attach to each mark; owns arrow-key movement plus Enter/Space activation. */
  handleKeyDown: (event: React.KeyboardEvent<Element>, item: TItem) => void;
  handleFocus: (item: TItem) => void;
  setActiveId: (id: string | null) => void;
  /** Register each mark's DOM node so arrow keys can move real focus. */
  registerMark: (id: string) => (node: SVGGraphicsElement | HTMLElement | null) => void;
};

const STEP_KEYS = new Set([
  "ArrowRight",
  "ArrowLeft",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

/**
 * Roving-focus keyboard navigation for a set of SVG marks. Every chart in the
 * Atlas wires its marks through this so arrow keys move within the chart and
 * Enter/Space activate the focused mark.
 */
export const useKeyboardNav = <TItem>(
  options: UseKeyboardNavOptions<TItem>,
): UseKeyboardNavResult<TItem> => {
  const { items, getId, orientation = "horizontal", columns = 1, onActivate, onFocusChange } =
    options;

  const [requestedId, setRequestedId] = useState<string | null>(null);
  const nodesRef = useRef<Map<string, SVGGraphicsElement | HTMLElement>>(new Map());

  const ids = useMemo(() => items.map(getId), [getId, items]);

  /**
   * The active mark is derived, not stored: when the chart re-filters and the
   * requested id disappears, focus falls back to the first mark on the next
   * render rather than through an effect that would cascade a second render.
   */
  const activeId = requestedId !== null && ids.includes(requestedId) ? requestedId : ids[0] ?? null;
  const activeIndex = activeId === null ? -1 : ids.indexOf(activeId);

  const registerMark = useCallback(
    (id: string) =>
      (node: SVGGraphicsElement | HTMLElement | null): void => {
        if (node) {
          nodesRef.current.set(id, node);
          return;
        }
        nodesRef.current.delete(id);
      },
    [],
  );

  const moveTo = useCallback(
    (nextIndex: number): void => {
      const clamped = Math.min(items.length - 1, Math.max(0, nextIndex));
      const item = items[clamped];
      if (!item) return;
      const id = getId(item);
      setRequestedId(id);
      onFocusChange?.(item, clamped);
      const node = nodesRef.current.get(id);
      if (node && typeof node.focus === "function") node.focus();
    },
    [getId, items, onFocusChange],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<Element>, item: TItem): void => {
      const index = ids.indexOf(getId(item));
      if (index === -1) return;

      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        onActivate?.(item, index);
        return;
      }

      if (!STEP_KEYS.has(event.key)) return;

      const forwardKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
      const backwardKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

      if (event.key === "Home") {
        event.preventDefault();
        moveTo(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        moveTo(items.length - 1);
        return;
      }
      if (event.key === "PageUp") {
        event.preventDefault();
        moveTo(index - 10);
        return;
      }
      if (event.key === "PageDown") {
        event.preventDefault();
        moveTo(index + 10);
        return;
      }
      if (event.key === forwardKey) {
        event.preventDefault();
        moveTo(index + 1);
        return;
      }
      if (event.key === backwardKey) {
        event.preventDefault();
        moveTo(index - 1);
        return;
      }
      if (orientation !== "grid") return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveTo(index + Math.max(1, columns));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        moveTo(index - Math.max(1, columns));
      }
    },
    [columns, getId, ids, items.length, moveTo, onActivate, orientation],
  );

  const handleFocus = useCallback(
    (item: TItem): void => {
      const id = getId(item);
      setRequestedId((current) => (current === id ? current : id));
    },
    [getId],
  );

  const getTabIndex = useCallback(
    (item: TItem): 0 | -1 => {
      const id = getId(item);
      if (activeId === null) return ids[0] === id ? 0 : -1;
      return activeId === id ? 0 : -1;
    },
    [activeId, getId, ids],
  );

  return {
    activeId,
    activeIndex,
    getTabIndex,
    handleKeyDown,
    handleFocus,
    setActiveId: setRequestedId,
    registerMark,
  };
};
