import type { MoatRubric } from "@/data/types";

/**
 * The scoring rubric behind every `Company.moats` value. Scores are `modeled`
 * judgments made in this project, not reported figures: the rubric exists so the
 * judgment is legible and arguable rather than hidden. It adapts Helmer's
 * *7 Powers* (B04) to a 0-5 scale, with one sentence per level.
 */
export const moatRubric: MoatRubric = {
  network: {
    0: "The product works exactly as well for the first user as for the millionth; no user creates value for another.",
    1: "Users occasionally benefit from others through shared templates or forums, but the product stands alone without them.",
    2: "A same-side community (content, integrations, public examples) makes the product meaningfully better once populated.",
    3: "Cross-side effects exist within a customer: more colleagues on the product raise its value to each of them.",
    4: "Cross-company effects operate, so adoption at one organisation pulls in its suppliers, customers or collaborators.",
    5: "A market-wide two-sided network makes the leading position self-reinforcing and a subscale rival structurally worse for its users.",
  },
  switching: {
    0: "A customer can leave inside a day with no data, workflow or contractual cost.",
    1: "Leaving costs a short export and some retraining; substitutes are drop-in.",
    2: "Accumulated configuration, history and user habit make a move a multi-week project.",
    3: "The product holds the system of record for a business process, so migration is a funded project with real risk.",
    4: "Deep customisation, bespoke integrations and certified administrators make replacement a multi-year programme.",
    5: "The product is embedded in regulated or revenue-critical processes, and replacement risk is treated as existential by the buyer.",
  },
  scale: {
    0: "Unit costs are flat or rising with volume; each new customer costs roughly what the last one did.",
    1: "Modest fixed-cost leverage on R&D, but delivery costs scale nearly linearly.",
    2: "Gross margin improves visibly with volume as R&D and support amortise over more customers.",
    3: "Large fixed investments (data centres, model training, compliance) amortise over a base a subscale rival cannot match.",
    4: "Scale buys materially better input prices or utilisation, so the leader can price below a challenger's cost.",
    5: "Minimum efficient scale is so high that only a handful of firms worldwide can operate at competitive cost.",
  },
  data: {
    0: "The product generates no proprietary data, or the data has no bearing on product quality.",
    1: "Usage data informs the roadmap but does not make the product itself better for the customer.",
    2: "Aggregate usage data improves defaults, benchmarks or recommendations in a way rivals would need time to match.",
    3: "A proprietary corpus materially improves output quality, and the corpus grows with usage.",
    4: "The data asset is both hard to assemble and legally or practically exclusive, and it compounds with deployment.",
    5: "The feedback loop is the product: quality gains from data are the main reason customers choose the leader over a technically similar rival.",
  },
  brand: {
    0: "Buyers cannot name the vendor and choose on price or feature checklist alone.",
    1: "The name is recognised inside its niche but carries no pricing power.",
    2: "The brand shortens the sales cycle and appears on shortlists without marketing spend.",
    3: "The brand is the safe institutional choice, so choosing it needs less internal justification than choosing a rival.",
    4: "The brand supports a visible price premium over functionally comparable products.",
    5: "The brand is the category noun, and buyers describe the job using the vendor's name.",
  },
  ecosystem: {
    0: "No third party builds on, resells or specialises in the product.",
    1: "A handful of integrations exist, mostly built by the vendor itself.",
    2: "An integration marketplace and a small partner community extend the product beyond the vendor's roadmap.",
    3: "A paid developer and consulting economy exists around the product, with certifications and staffing.",
    4: "Third parties run substantial standalone businesses on the platform, and their customers become the platform's customers.",
    5: "The ecosystem is a labour market and a curriculum: skills are taught, hired for and career-defining, which locks in the next generation of buyers.",
  },
  regulatory: {
    0: "No licence, certification or regulatory clearance is needed to compete.",
    1: "Generic security attestations are expected but obtainable by any funded entrant.",
    2: "Sector certifications take a funded entrant a year or more to obtain.",
    3: "Accreditation, audit history or regulator-facing filings create a multi-year barrier for new entrants.",
    4: "The vendor is named in or certified under regulation, so buyers in the sector face additional risk using an alternative.",
    5: "Regulation effectively enumerates the qualifying vendors, and the incumbent set changes only when the rules do.",
  },
};
