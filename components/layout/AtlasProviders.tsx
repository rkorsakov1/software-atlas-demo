"use client";

import { ThemeProvider } from "next-themes";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { HighlightProvider } from "@/components/explore/HighlightContext";

type AtlasProvidersProps = { children: React.ReactNode };

export const AtlasProviders = ({ children }: AtlasProvidersProps): React.ReactElement => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <TooltipPrimitive.Provider delayDuration={120} skipDelayDuration={300}>
      <HighlightProvider>{children}</HighlightProvider>
    </TooltipPrimitive.Provider>
  </ThemeProvider>
);
