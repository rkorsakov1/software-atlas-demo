"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  type AtlasState,
  parseAtlasState,
  serializeAtlasState,
  togglePin,
  updateAtlasState,
} from "@/lib/url-state";

export type AtlasStateController = {
  state: AtlasState;
  /** Merges a patch and rewrites the query string; never adds a history entry. */
  setState: (patch: Partial<AtlasState>) => void;
  /** Adds or removes an id from the comparison pins, capped at three. */
  handleTogglePin: (id: string) => void;
};

/**
 * The single reader and writer of Atlas URL state. Every route that needs it sits
 * inside a `<Suspense>` boundary, because `useSearchParams` forces client-side
 * rendering under `output: "export"`.
 */
export const useAtlasState = (): AtlasStateController => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.toString();
  const state = useMemo<AtlasState>(() => parseAtlasState(query), [query]);

  const replaceWith = useCallback(
    (next: AtlasState): void => {
      const nextQuery = serializeAtlasState(next);
      if (nextQuery === query) return;
      router.replace(nextQuery.length === 0 ? pathname : `${pathname}?${nextQuery}`, {
        scroll: false,
      });
    },
    [pathname, query, router],
  );

  const setState = useCallback(
    (patch: Partial<AtlasState>): void => {
      replaceWith(updateAtlasState(state, patch));
    },
    [replaceWith, state],
  );

  const handleTogglePin = useCallback(
    (id: string): void => {
      replaceWith(togglePin(state, id));
    },
    [replaceWith, state],
  );

  return { state, setState, handleTogglePin };
};
