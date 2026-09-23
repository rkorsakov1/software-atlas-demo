"use client";

import { X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { AtlasMarkTooltip } from "@/components/charts/primitives/AtlasMarkTooltip";
import {
  MOAT_AXIS_ORDER,
  MOAT_MAX_SCORE,
  type MoatVertex,
  type RadarGeometry,
  moatPolygonPath,
  moatRadarVertices,
  polarPoint,
  radarAxisAngle,
  radarRingPath,
  radarTextAnchor,
} from "@/components/charts/primitives/atlasRadarMath";
import { ChartFrame } from "@/components/charts/primitives/ChartFrame";
import { ConfidenceBadge } from "@/components/charts/primitives/ConfidenceBadge";
import { DataTable, type DataTableColumn } from "@/components/charts/primitives/DataTable";
import { EmptyState } from "@/components/charts/primitives/EmptyState";
import { lineStyleFor } from "@/components/charts/primitives/HatchDefs";
import { isNarrow, useChartSize } from "@/components/charts/primitives/useChartSize";
import { useKeyboardNav } from "@/components/charts/primitives/useKeyboardNav";
import { useNarrowViewport } from "@/components/charts/primitives/useNarrowViewport";
import type { MoatKey, MoatRubric, MoatScore } from "@/data/types";
import { cn } from "@/lib/cn";
import { moatLabel, splitMoatRationale } from "@/lib/format";

export type MoatRadarCompany = {
  id: string;
  name: string;
  moats: Record<MoatKey, MoatScore>;
  moatRationale: string;
};

export type MoatRadarProps = {
  /** Up to three; the app enforces the cap through the comparison tray. */
  companies: readonly MoatRadarCompany[];
  rubric: MoatRubric;
  onRemoveCompany?: (companyId: string) => void;
  highlightedCompanyId?: string | null;
  onHoverCompany?: (companyId: string | null) => void;
};

const COMPANY_COLORS: readonly string[] = [
  "var(--cat-horizontal)",
  "var(--cat-infrastructure)",
  "var(--cat-vertical)",
];

/** §10.4 minimum plot height, applied to the measured size and to the fallback. */
const MIN_PLOT_HEIGHT = 420;

const MOAT_SCORE_NOTE =
  "Modeled: a 0-5 judgment made in this project against the published moat rubric. It is not a reported figure and it carries no year.";

const TOOLTIP_FOOTNOTE =
  "Moat scores are modeled judgments scored against the rubric on the methodology page. They are undated and have no external source.";

const companyColor = (index: number): string =>
  COMPANY_COLORS[index % COMPANY_COLORS.length] ?? COMPANY_COLORS[0] ?? "var(--foreground)";

const shortMoatLabel = (key: MoatKey): string => moatLabel[key].split(" ")[0] ?? moatLabel[key];

type ScoredMoat = { moatKey: MoatKey; score: number };

const extremeMoat = (company: MoatRadarCompany, direction: "high" | "low"): ScoredMoat => {
  let best: ScoredMoat = { moatKey: MOAT_AXIS_ORDER[0] ?? "network", score: Number.NaN };
  for (const moatKey of MOAT_AXIS_ORDER) {
    const score = company.moats[moatKey];
    if (Number.isNaN(best.score)) {
      best = { moatKey, score };
      continue;
    }
    if (direction === "high" && score > best.score) best = { moatKey, score };
    if (direction === "low" && score < best.score) best = { moatKey, score };
  }
  return best;
};

const takeawayFor = (companies: readonly MoatRadarCompany[]): string => {
  if (companies.length === 0) {
    return "Pin up to three companies to compare where their defensibility actually comes from.";
  }
  const first = companies[0];
  if (companies.length === 1 && first) {
    const best = extremeMoat(first, "high");
    const worst = extremeMoat(first, "low");
    return `${first.name} is strongest on ${moatLabel[best.moatKey].toLowerCase()} (${best.score}/5) and weakest on ${moatLabel[worst.moatKey].toLowerCase()} (${worst.score}/5).`;
  }
  const phrases = companies.map((company) => {
    const best = extremeMoat(company, "high");
    return `${company.name} on ${moatLabel[best.moatKey].toLowerCase()} (${best.score}/5)`;
  });
  return `Each company's strongest power: ${phrases.join("; ")}.`;
};

type MoatTableRow = {
  key: string;
  companyId: string;
  companyName: string;
  moatKey: MoatKey;
  score: MoatScore;
  level: string;
};

/**
 * Seven powers, 0-5, up to three companies overlaid. Every score is a modeled
 * judgment, so the chart carries a permanent "Modeled" label and surfaces the
 * rubric sentence behind the hovered or focused score rather than leaving the
 * number to speak for itself.
 */
export const MoatRadar = ({
  companies,
  rubric,
  onRemoveCompany,
  highlightedCompanyId,
  onHoverCompany,
}: MoatRadarProps): React.ReactElement => {
  const { ref, size } = useChartSize({
    initial: { width: 560, height: MIN_PLOT_HEIGHT },
    aspectRatio: 1.32,
    // §10.4: seven axes and up to three overlaid polygons need the full floor.
    // Below it the rings collapse into each other and the scores stop reading.
    minHeight: MIN_PLOT_HEIGHT,
    maxHeight: 520,
  });
  const narrowViewport = useNarrowViewport();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const narrow = isNarrow(size.width);
  const labelPadding = narrow ? 52 : 96;

  const geometry = useMemo<RadarGeometry>(() => {
    const cx = size.width / 2;
    const cy = size.height / 2;
    const radius = Math.max(40, Math.min(cx - labelPadding, cy - 26));
    return { cx, cy, radius };
  }, [labelPadding, size.height, size.width]);

  const vertices = useMemo(
    () => moatRadarVertices(companies, geometry),
    [companies, geometry],
  );

  const vertexById = useMemo(
    () => new Map(vertices.map((vertex) => [vertex.id, vertex])),
    [vertices],
  );

  const polygons = useMemo(
    () =>
      companies.map((company, index) => ({
        company,
        color: companyColor(index),
        path: moatPolygonPath(company, geometry),
      })),
    [companies, geometry],
  );

  const axisLabels = useMemo(
    () =>
      MOAT_AXIS_ORDER.map((moatKey, index) => {
        const angle = radarAxisAngle(index, MOAT_AXIS_ORDER.length);
        const outer = polarPoint(geometry, geometry.radius, angle);
        const label = polarPoint(geometry, geometry.radius + (narrow ? 12 : 16), angle);
        const anchor = radarTextAnchor(Math.cos(angle));
        return {
          moatKey,
          outer,
          label,
          anchor,
          text: narrow ? shortMoatLabel(moatKey) : moatLabel[moatKey],
        };
      }),
    [geometry, narrow],
  );

  const tableRows = useMemo<MoatTableRow[]>(
    () =>
      companies.flatMap((company) =>
        MOAT_AXIS_ORDER.map((moatKey) => ({
          key: `${company.id}:${moatKey}`,
          companyId: company.id,
          companyName: company.name,
          moatKey,
          score: company.moats[moatKey],
          level: rubric[moatKey][company.moats[moatKey]],
        })),
      ),
    [companies, rubric],
  );

  const handleActivate = useCallback((vertex: MoatVertex): void => {
    setPinnedId((current) => (current === vertex.id ? null : vertex.id));
  }, []);

  const handleFocusChange = useCallback(
    (vertex: MoatVertex): void => {
      setFocusedId(vertex.id);
      onHoverCompany?.(vertex.companyId);
    },
    [onHoverCompany],
  );

  const nav = useKeyboardNav<MoatVertex>({
    items: vertices,
    getId: (vertex) => vertex.id,
    orientation: "grid",
    columns: MOAT_AXIS_ORDER.length,
    onActivate: handleActivate,
    onFocusChange: handleFocusChange,
  });

  const handleVertexClick = useCallback(
    (vertex: MoatVertex): void => {
      nav.setActiveId(vertex.id);
      handleActivate(vertex);
    },
    [handleActivate, nav],
  );

  const handlePointerEnter = useCallback(
    (vertex: MoatVertex): void => {
      setHoveredId(vertex.id);
      onHoverCompany?.(vertex.companyId);
    },
    [onHoverCompany],
  );

  const handlePointerLeave = useCallback((): void => {
    setHoveredId(null);
    onHoverCompany?.(null);
  }, [onHoverCompany]);

  const handleRemove = useCallback(
    (companyId: string): void => {
      onRemoveCompany?.(companyId);
    },
    [onRemoveCompany],
  );

  const activeVertex =
    (hoveredId ? vertexById.get(hoveredId) : undefined) ??
    (focusedId ? vertexById.get(focusedId) : undefined) ??
    (pinnedId ? vertexById.get(pinnedId) : undefined) ??
    null;

  const activeLevel = activeVertex ? rubric[activeVertex.moatKey][activeVertex.score] : null;

  const toolbar = (
    <>
      <span className="flex items-center gap-1.5">
        <ConfidenceBadge confidence="modeled" note={MOAT_SCORE_NOTE} size="md" />
        <span className="text-xs text-muted-foreground">
          Scores are judgments against a published rubric, not measurements.
        </span>
      </span>
      <ul className="flex flex-wrap items-center gap-1.5">
        {companies.map((company, index) => (
          <li key={company.id}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs",
                { "opacity-45": Boolean(highlightedCompanyId) && highlightedCompanyId !== company.id },
              )}
              title={company.moatRationale}
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: companyColor(index) }}
              />
              {company.name}
              {onRemoveCompany ? (
                <button
                  type="button"
                  onClick={() => handleRemove(company.id)}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label={`Remove ${company.name} from the moat comparison`}
                >
                  <X aria-hidden="true" className="size-3" />
                </button>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </>
  );

  const tableColumns: readonly DataTableColumn<MoatTableRow>[] = [
    { key: "company", header: "Company", render: (row) => row.companyName },
    { key: "moat", header: "Power", render: (row) => moatLabel[row.moatKey] },
    {
      key: "score",
      header: "Score",
      align: "right",
      numeric: true,
      render: (row) => `${row.score} / ${MOAT_MAX_SCORE}`,
    },
    { key: "level", header: "Rubric level", render: (row) => row.level },
  ];

  const table = (
    <DataTable<MoatTableRow>
      caption="Modeled moat scores from 0 to 5, with the rubric sentence for each score."
      columns={tableColumns}
      rows={tableRows}
      getRowKey={(row) => row.key}
      getConfidence={() => ({ confidence: "modeled", note: MOAT_SCORE_NOTE })}
    />
  );

  return (
    <ChartFrame
      // Remounted when the breakpoint is crossed or the tray fills, because
      // `defaultView` is only read when the frame mounts (§8.11.6).
      key={`${narrowViewport ? "narrow" : "wide"}-${companies.length === 0 ? "empty" : "filled"}`}
      title="Where the moat actually is"
      takeaway={takeawayFor(companies)}
      defaultView={narrowViewport && companies.length > 0 ? "table" : "chart"}
      source="Modeled in this project against the seven-power rubric on the methodology page."
      footnote="Every score is a modeled judgment adapted from Helmer's 7 Powers; the rubric sentence for each level is shown on hover, on focus and in the table."
      table={table}
      toolbar={toolbar}
    >
      <div ref={ref} className="relative w-full">
        {companies.length === 0 ? (
          <EmptyState
            title="No companies selected"
            description="Pin up to three companies in the comparison tray to overlay their modeled moat profiles."
          />
        ) : (
          <>
            <svg
              width={size.width}
              height={size.height}
              role="group"
              aria-label={`Moat radar comparing ${companies.map((company) => company.name).join(", ")} across seven powers scored 0 to 5`}
              className="max-w-full overflow-visible"
              onMouseLeave={handlePointerLeave}
            >
              <g aria-hidden="true">
                {[1, 2, 3, 4, 5].map((ring) => (
                  <path
                    key={ring}
                    d={radarRingPath(geometry, ring / MOAT_MAX_SCORE, MOAT_AXIS_ORDER.length)}
                    fill="none"
                    className="stroke-rule"
                    strokeWidth={1}
                    opacity={ring === MOAT_MAX_SCORE ? 1 : 0.5}
                  />
                ))}
                {axisLabels.map((axis) => (
                  <line
                    key={`spoke-${axis.moatKey}`}
                    x1={geometry.cx}
                    y1={geometry.cy}
                    x2={axis.outer.x}
                    y2={axis.outer.y}
                    className="stroke-rule"
                    strokeWidth={1}
                    opacity={0.6}
                  />
                ))}
                {[1, 3, 5].map((ring) => (
                  <text
                    key={`tick-${ring}`}
                    x={geometry.cx + 5}
                    y={geometry.cy - (geometry.radius * ring) / MOAT_MAX_SCORE + 3}
                    className="fill-muted-foreground font-mono text-[11px]"
                  >
                    {ring}
                  </text>
                ))}
              </g>

              {axisLabels.map((axis) => (
                <text
                  key={`label-${axis.moatKey}`}
                  x={axis.label.x}
                  y={axis.label.y}
                  dy="0.32em"
                  textAnchor={axis.anchor}
                  className={cn("fill-muted-foreground text-[11px]", {
                    "fill-foreground font-medium": activeVertex?.moatKey === axis.moatKey,
                  })}
                >
                  {axis.text}
                </text>
              ))}

              {polygons.map(({ company, color, path }) => {
                const dimmed =
                  Boolean(highlightedCompanyId) && highlightedCompanyId !== company.id;
                const stroke = lineStyleFor(color, "modeled");
                return (
                  <path
                    key={company.id}
                    d={path}
                    fill={color}
                    fillOpacity={dimmed ? 0.05 : 0.14}
                    stroke={stroke.stroke}
                    strokeWidth={stroke.strokeWidth}
                    strokeDasharray={stroke.strokeDasharray}
                    strokeLinejoin="round"
                    opacity={dimmed ? 0.35 : 1}
                    aria-hidden="true"
                  />
                );
              })}

              {vertices.map((vertex) => {
                const color = companyColor(vertex.companyIndex);
                const dimmed =
                  Boolean(highlightedCompanyId) && highlightedCompanyId !== vertex.companyId;
                const active = activeVertex?.id === vertex.id;
                return (
                  <g key={vertex.id} opacity={dimmed ? 0.35 : 1}>
                    {active ? (
                      <circle
                        cx={vertex.point.x}
                        cy={vertex.point.y}
                        r={9}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        opacity={0.55}
                        aria-hidden="true"
                      />
                    ) : null}
                    <circle
                      ref={nav.registerMark(vertex.id)}
                      cx={vertex.point.x}
                      cy={vertex.point.y}
                      r={active ? 5.5 : 4}
                      fill={color}
                      stroke="var(--card)"
                      strokeWidth={1.25}
                      tabIndex={nav.getTabIndex(vertex)}
                      role="button"
                      aria-label={`${vertex.companyName}, ${moatLabel[vertex.moatKey]}: ${vertex.score} of ${MOAT_MAX_SCORE}, modeled. ${rubric[vertex.moatKey][vertex.score]}`}
                      className="cursor-pointer outline-offset-2"
                      onClick={() => handleVertexClick(vertex)}
                      onKeyDown={(event) => nav.handleKeyDown(event, vertex)}
                      onFocus={() => {
                        nav.handleFocus(vertex);
                        handleFocusChange(vertex);
                      }}
                      onBlur={() => setFocusedId(null)}
                      onMouseEnter={() => handlePointerEnter(vertex)}
                    />
                  </g>
                );
              })}
            </svg>

            {activeVertex && activeLevel ? (
              <AtlasMarkTooltip
                x={activeVertex.point.x}
                y={activeVertex.point.y}
                containerWidth={size.width}
                containerHeight={size.height}
                title={activeVertex.companyName}
                subtitle={
                  splitMoatRationale(
                    companies.find((company) => company.id === activeVertex.companyId)
                      ?.moatRationale ?? "",
                  ).find((line) => line.label.toLowerCase() === activeVertex.moatKey)?.text
                }
                rows={[
                  {
                    label: moatLabel[activeVertex.moatKey],
                    value: `${activeVertex.score} / ${MOAT_MAX_SCORE}`,
                    confidence: "modeled",
                    note: MOAT_SCORE_NOTE,
                    detail: activeLevel,
                    color: companyColor(activeVertex.companyIndex),
                  },
                ]}
                footnote={TOOLTIP_FOOTNOTE}
                visible
              />
            ) : null}
          </>
        )}

        <p className="mt-2 min-h-[2.5rem] text-xs text-muted-foreground" aria-live="polite">
          {activeVertex && activeLevel
            ? `${activeVertex.companyName} · ${moatLabel[activeVertex.moatKey]} ${activeVertex.score}/${MOAT_MAX_SCORE} — ${activeLevel}`
            : "Hover or focus a point to read the rubric level behind its score."}
        </p>
      </div>
    </ChartFrame>
  );
};
