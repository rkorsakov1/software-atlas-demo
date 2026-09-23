"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { useHighlight } from "@/components/explore/HighlightContext";
import { EmptyState } from "@/components/charts/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { companies, moatRubric } from "@/data";
import { byId } from "@/lib/selectors";

const MoatRadar = dynamic(
  () => import("@/components/charts/MoatRadar").then((module) => module.MoatRadar),
  { ssr: false, loading: () => <Skeleton className="h-[420px] w-full" /> },
);

export type MoatSectionProps = {
  companyIds: readonly string[];
  onRemoveCompany?: (companyId: string) => void;
};

/** The moat radar for one or more companies, resolved from ids on the client. */
export const MoatSection = ({
  companyIds,
  onRemoveCompany,
}: MoatSectionProps): React.ReactElement => {
  const { highlightedCompanyId, handleHoverCompany } = useHighlight();

  const radarCompanies = useMemo(
    () =>
      companyIds
        .map((companyId) => byId(companies, companyId))
        .filter((company): company is NonNullable<typeof company> => company !== undefined)
        .map((company) => ({
          id: company.id,
          name: company.name,
          moats: company.moats,
          moatRationale: company.moatRationale,
        })),
    [companyIds],
  );

  if (radarCompanies.length === 0) {
    return (
      <EmptyState
        title="Nothing pinned to compare"
        description="Pin up to three companies from any chart, search result or profile page and their moat profiles will be overlaid here."
      />
    );
  }

  return (
    <MoatRadar
      companies={radarCompanies}
      rubric={moatRubric}
      onRemoveCompany={onRemoveCompany}
      highlightedCompanyId={highlightedCompanyId}
      onHoverCompany={handleHoverCompany}
    />
  );
};
