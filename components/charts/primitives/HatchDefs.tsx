import type { Confidence } from "@/data/types";

export const HATCH_PATTERN_ID = "atlas-hatch-estimated";
export const DOT_PATTERN_ID = "atlas-dots-modeled";

/**
 * SVG defs shared by every chart. Drop `<HatchDefs />` once inside an `<svg>` and
 * then style marks with the helpers below so estimated and modeled values look the
 * same wherever they appear.
 */
export const HatchDefs = (): React.ReactElement => (
  <defs>
    <pattern
      id={HATCH_PATTERN_ID}
      width="7"
      height="7"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <rect width="7" height="7" fill="currentColor" fillOpacity="0.3" />
      <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" />
    </pattern>
    <pattern id={DOT_PATTERN_ID} width="5" height="5" patternUnits="userSpaceOnUse">
      <rect width="5" height="5" fill="currentColor" fillOpacity="0.12" />
      <circle cx="1.6" cy="1.6" r="1.1" fill="currentColor" />
    </pattern>
  </defs>
);

export type MarkStyle = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  fillOpacity: number;
};

/**
 * Turns a colour plus a confidence level into the fill and stroke an SVG mark
 * should use: solid for reported, hatched for estimated, dashed for modeled.
 *
 * The hatch pattern paints with `currentColor`, so the mark must set
 * `color: <colour>` (via `style={{ color }}`) for the pattern to pick it up.
 */
export const markStyleFor = (color: string, confidence: Confidence): MarkStyle => {
  if (confidence === "reported") {
    return { fill: color, stroke: color, strokeWidth: 1, fillOpacity: 0.92 };
  }
  if (confidence === "estimated") {
    return {
      fill: `url(#${HATCH_PATTERN_ID})`,
      stroke: color,
      strokeWidth: 1,
      fillOpacity: 1,
    };
  }
  return {
    fill: color,
    stroke: color,
    strokeWidth: 1.5,
    strokeDasharray: "5 3",
    fillOpacity: 0.32,
  };
};

export const lineStyleFor = (
  color: string,
  confidence: Confidence,
): Pick<MarkStyle, "stroke" | "strokeWidth" | "strokeDasharray"> => {
  if (confidence === "modeled") {
    return { stroke: color, strokeWidth: 2, strokeDasharray: "5 3" };
  }
  if (confidence === "estimated") {
    return { stroke: color, strokeWidth: 2, strokeDasharray: "9 3 2 3" };
  }
  return { stroke: color, strokeWidth: 2 };
};
