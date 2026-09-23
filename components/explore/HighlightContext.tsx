"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type HighlightValue = {
  highlightedCompanyId: string | null;
  highlightedMarketId: string | null;
  handleHoverCompany: (companyId: string | null) => void;
  handleHoverMarket: (marketId: string | null) => void;
};

const FALLBACK: HighlightValue = {
  highlightedCompanyId: null,
  highlightedMarketId: null,
  handleHoverCompany: () => undefined,
  handleHoverMarket: () => undefined,
};

const HighlightContext = createContext<HighlightValue>(FALLBACK);

type HighlightProviderProps = { children: React.ReactNode };

/**
 * One hovered company and one hovered market, shared by every chart on the page.
 * Hovering a mark in the bubble chart dims the same company in the lineage graph
 * and in the comparison tray; the charts themselves stay stateless about it.
 */
export const HighlightProvider = ({ children }: HighlightProviderProps): React.ReactElement => {
  const [highlightedCompanyId, setHighlightedCompanyId] = useState<string | null>(null);
  const [highlightedMarketId, setHighlightedMarketId] = useState<string | null>(null);

  const handleHoverCompany = useCallback((companyId: string | null): void => {
    setHighlightedCompanyId(companyId);
  }, []);

  const handleHoverMarket = useCallback((marketId: string | null): void => {
    setHighlightedMarketId(marketId);
  }, []);

  const value = useMemo<HighlightValue>(
    () => ({
      highlightedCompanyId,
      highlightedMarketId,
      handleHoverCompany,
      handleHoverMarket,
    }),
    [handleHoverCompany, handleHoverMarket, highlightedCompanyId, highlightedMarketId],
  );

  return <HighlightContext.Provider value={value}>{children}</HighlightContext.Provider>;
};

export const useHighlight = (): HighlightValue => useContext(HighlightContext);
