"use client";

import { Pin, PinOff } from "lucide-react";

import { ComparisonTray } from "@/components/explore/ComparisonTray";
import { useAtlasState } from "@/components/explore/useAtlasState";
import { Button } from "@/components/ui/button";
import { MAX_PINS, serializeAtlasState, updateAtlasState, ATLAS_DEFAULTS } from "@/lib/url-state";

export type PinToCompareProps = {
  /** A company id or a market id; the tray resolves whichever it is. */
  id: string;
  name: string;
};

/**
 * Pinning on a profile writes to that profile's own query string, so the link you
 * copy carries the comparison. "Compare in Explore" hands the same pins to the
 * moat radar, and the tray's entity links carry them on to the next profile.
 */
export const PinToCompare = ({ id, name }: PinToCompareProps): React.ReactElement => {
  const { state, setState, handleTogglePin } = useAtlasState();

  const isPinned = state.pin.includes(id);
  const isFull = !isPinned && state.pin.length >= MAX_PINS;

  const exploreQuery = serializeAtlasState(
    updateAtlasState(ATLAS_DEFAULTS, { chart: "moat", pin: [...state.pin] }),
  );

  const handleClick = (): void => handleTogglePin(id);
  const handleClear = (): void => setState({ pin: [] });
  const handleUnpin = (pinnedId: string): void => handleTogglePin(pinnedId);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant={isPinned ? "secondary" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={isFull}
        aria-pressed={isPinned}
        title={
          isFull
            ? `Three items are already pinned. Unpin one to add ${name}.`
            : undefined
        }
      >
        {isPinned ? (
          <PinOff aria-hidden="true" className="size-4" />
        ) : (
          <Pin aria-hidden="true" className="size-4" />
        )}
        {isPinned ? `Unpin ${name}` : `Pin ${name} to compare`}
      </Button>

      <ComparisonTray
        pinnedIds={state.pin}
        onUnpin={handleUnpin}
        onClear={handleClear}
        exploreHref={`/explore/?${exploreQuery}`}
      />
    </div>
  );
};
