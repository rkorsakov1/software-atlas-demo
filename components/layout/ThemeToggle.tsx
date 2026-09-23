"use client";

import { MoonStar, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsMounted } from "@/components/charts/primitives/useReducedMotion";
import { Button } from "@/components/ui/button";

export const ThemeToggle = (): React.ReactElement => {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = resolvedTheme === "dark";

  const handleToggleTheme = (): void => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-hidden="true" tabIndex={-1} disabled>
        <Sun className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun className="size-4" /> : <MoonStar className="size-4" />}
    </Button>
  );
};
