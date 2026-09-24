import type { EventType } from "@/data/types";
import { EVENT_TYPE_LANES } from "@/lib/scales";

/**
 * One colour per competitive-event type, drawn from the same five category accents
 * as the rest of the palette so the timeline and the share annotations agree on
 * what an acquisition looks like.
 */
export const eventTypeColorVar: Record<EventType, string> = {
  "platform-shift": "var(--cat-emerging)",
  launch: "var(--cat-infrastructure)",
  acquisition: "var(--cat-horizontal)",
  bundling: "var(--cat-vertical)",
  unbundling: "color-mix(in oklab, var(--cat-vertical) 60%, var(--foreground))",
  disruption: "var(--cat-consumer)",
  "pricing-shift": "color-mix(in oklab, var(--cat-consumer) 60%, var(--foreground))",
  "license-change": "color-mix(in oklab, var(--cat-infrastructure) 60%, var(--foreground))",
  regulation: "color-mix(in oklab, var(--cat-horizontal) 60%, var(--foreground))",
  "spin-off": "color-mix(in oklab, var(--cat-emerging) 60%, var(--foreground))",
  milestone: "var(--muted-foreground)",
};

export const eventTypeColor = (type: EventType): string =>
  eventTypeColorVar[type] ?? "var(--muted-foreground)";

/** Platform shifts are the structural breaks the Atlas narrates, so they read louder. */
export const isStructuralBreak = (type: EventType): boolean => type === "platform-shift";

/** Canonical lane order re-exported so charts do not reach past the primitives. */
export const EVENT_LANE_ORDER: readonly EventType[] = EVENT_TYPE_LANES;
