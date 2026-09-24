"use client";

import { Monitor, X } from "lucide-react";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "atlas-desktop-nudge-dismissed";

const listeners = new Set<() => void>();
/** Keeps the dismissal for this page view even when storage is blocked. */
let dismissedInMemory = false;

const readDismissed = (): boolean => {
  if (dismissedInMemory) return true;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The static build renders it hidden; the browser decides after hydration. */
const serverSnapshot = (): boolean => true;

/**
 * On phones the charts fall back to simplified views and tables. This says so
 * once, recommends a larger screen, and stays dismissed for the session.
 */
export const DesktopNudge = (): React.ReactElement | null => {
  const dismissed = useSyncExternalStore(subscribe, readDismissed, serverSnapshot);

  const handleDismiss = (): void => {
    dismissedInMemory = true;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Private browsing can block storage; the banner then returns on the next page.
    }
    for (const listener of listeners) listener();
  };

  if (dismissed) return null;

  return (
    <div role="note" className="border-b border-border bg-secondary lg:hidden">
      <div className="mx-auto flex max-w-[1400px] items-start gap-3 px-4 py-3 text-sm">
        <Monitor aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
        <p className="flex-1 text-pretty">
          The Atlas is built for a larger screen. On a phone the charts are simplified; open it on a
          laptop or desktop for the full interactive version.
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="-m-1 rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
};
