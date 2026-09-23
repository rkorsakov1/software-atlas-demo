/**
 * Lists every company id referenced anywhere in the dataset, with the collections
 * that reference it and whether `data/companies.ts` defines it.
 *
 * This is the hand-off tool for the data-update workflow: eras, events, emerging
 * markets, bundling flows and market share series all point at company ids, so
 * adding any of those can silently create a dangling reference. Run this before
 * `validate-data` to see what still needs a company record.
 */
import { companies } from "@/data/companies";
import { emerging } from "@/data/emerging";
import { eras } from "@/data/eras";
import { events } from "@/data/events";
import { flows } from "@/data/flows";
import { markets } from "@/data/markets";

const references = new Map<string, Set<string>>();

const note = (id: string, where: string): void => {
  const existing = references.get(id);
  if (existing) {
    existing.add(where);
    return;
  }
  references.set(id, new Set([where]));
};

for (const era of eras) {
  for (const id of [...era.definingCompanyIds, ...era.survivors, ...era.casualties]) {
    note(id, "eras");
  }
}
for (const event of events) {
  for (const id of event.companyIds) note(id, "events");
  if (event.acquirerId) note(event.acquirerId, "events");
  if (event.targetId) note(event.targetId, "events");
}
for (const market of emerging) {
  for (const id of market.keyPlayerIds) note(id, "emerging");
}
for (const flow of flows) {
  if (flow.toKind === "company-suite") note(flow.toId, "flows");
}
for (const market of markets) {
  for (const year of market.sharesByYear) {
    for (const share of year.shares) note(share.companyId, "markets.sharesByYear");
  }
}

const defined = new Set(companies.map((company) => company.id));
const sorted = [...references.keys()].sort();
const missing = sorted.filter((id) => !defined.has(id));
const orphaned = [...defined].filter((id) => !references.has(id)).sort();

process.stdout.write(`\nCompany references: ${sorted.length} distinct ids\n`);
process.stdout.write(`Defined in data/companies.ts: ${defined.size}\n`);
process.stdout.write(`Referenced but not defined: ${missing.length}\n`);
process.stdout.write(`Defined but never referenced: ${orphaned.length}\n\n`);

for (const id of sorted) {
  const where = [...(references.get(id) ?? [])].sort().join(", ");
  process.stdout.write(`${defined.has(id) ? "ok  " : "MISS"}  ${id.padEnd(28)} ${where}\n`);
}

if (orphaned.length > 0) {
  process.stdout.write(`\nDefined but unreferenced: ${orphaned.join(", ")}\n`);
}
