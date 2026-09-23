# QA report — The Software Atlas (Phase D)

Owner: **qa-reviewer**. Audit only; no app code was changed by this agent.
First audit 2026-09-22. **Re-audit 2026-09-22 (this revision)** after the Phase D fix round,
against `CLAUDE.md` §1/§9, `docs/CONTRACTS.md` §8–§11, `docs/verification-log.md` §12,
`README.md` and `research.md` §0. Dev server at `http://localhost:3000`; static export
inspected in `out/`. `npm run build` deliberately not re-run (§7 / orchestrator instruction).

Closures were **re-verified, not accepted**: every repaired citation was fetched again and
read here, the archetype palette was re-measured with a perceptual metric, and all 88
registry URLs were live-checked a second time.

**Counts after re-audit:** P0 0 · **P1 2** · **P2 3** · **P3 6** (open or newly found).
Prior findings: 12 verified closed, 2 still open as accepted P3s, 1 not a defect.

---

## 1. Findings — current state

### 1.1 Open (new this round)

| ID | Priority | Area | File:line | Finding | Suggested owner |
|---|---|---|---|---|---|
| **Q-17** | **P1** | Sourcing audit trail | `docs/verification-log.md:1270` (§12.2); `data/sources.ts:747–911` | **Q-01 is closed for the 82 entries that existed when it was written, and re-opened by the fix round itself.** The registry now holds **97** entries; §12.1 has **82** rows. Matching by URL (per §11.5): **15 shipped entries have no log row at all** — S81, S82, S83, S84, S85, S86, S87, S88, S89, S90, S91, S92, S93, S94, S95 — and these are precisely the sources added to repair the citation–content mismatches, i.e. the highest-risk class in the project. Separately, **5 §12.1 rows cite URLs the registry no longer ships** (S09, S12, S13b, S67, S68 — the repointings §12.3 itself recommended), so those rows no longer match by URL either. §12.2's claim "82 registry entries, 82 rows above. Every id in `data/sources.ts` now has a log entry" is stale. Mitigation: **QA fetched and read 14 of the 15 unlogged pages this session** and every cited figure was present (S80, already logged, also checked) — so this is transcription work, not re-verification. | `data-verifier` |
| **Q-18** | **P1** | Methodology accuracy | `app/methodology/page.tsx:191–193` and `:616–619` | The page states, twice, that the unverified sources "are books, papers and case law cited from the literature; **they carry no URL**". That was true at 81 sources; it is false now. Of the 12 unverified entries, **three are URL-bearing press/analyst sources** — S17 (Axios), S78 (Bloomberg), S86 (Gartner) — and the list rendered immediately under the sentence shows S17 with its URL. The claim "they never back a `reported` data point" is still true (validator-enforced, re-checked: 0 violations). Reader-facing, and it understates exactly the thing a sceptical reader is looking for. Fix: derive the sentence, e.g. name the nine `B*` literature entries and the three fetched-but-unread pages separately. | `app-engineer` |
| **Q-19** | **P2** | Sourcing integrity | `data/sources.ts:349` (S28) | `verified: true` source whose stored URL **404s**: `https://data.sec.gov/api/xbrl/companyconcept/` is the API *root*, not a document. Checked with an SEC-compliant UA: root → **404**; a concrete endpoint (`…/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json`) → **200**. S28 is the backbone of the Atlas: **253 of 264 `reported` points cite it**, and the chip renders to the reader as "Fetched and verified in this project". The log (§1, line 16) records the concrete pattern, so the evidence is real — only the shipped URL is unusable. Fix: store one concrete endpoint, or the EDGAR APIs documentation page. Same class as Q-02, larger blast radius. | `data-engineer` |
| **Q-20** | **P2** | README accuracy | `README.md:181–183` | The known-limitation entry on the flagship share series is contradicted by the shipped series. README: "between 2017 and 2026 AWS went 34% → 28%, **Microsoft 11% → 21%**, Google 5% → 15%, with the big three **roughly flat at 61–66%**. Concentration did not increase; it rotated." Shipped `markets.ts` `cloud-infrastructure.sharesByYear`: 2017 = AWS 34 / MS 11 / Google 5 (**big three 50%**); 2026 = 28 / **20** / 15 (**big three 63%**). So Microsoft ships as 20, not 21, and concentration **rose 13 points** over the window the sentence describes. The 61–66% band belongs to the log's quarterly commentary (Q4 2022 66%, Q3 2023 61%, Q3 2025 63%), not to the 2017→2026 span. Nothing in the product repeats the claim — it is contained to the README. | `orchestrator` |
| **Q-21** | **P2** | Data completeness | `data/markets.ts` (`cloud-infrastructure.sharesByYear`); `docs/verification-log.md:612–640` (§5.2) | The flagship share series ships **4 year-columns** (2017, 2019, 2021, 2026) although §5.2 verifies **thirteen quarters, eleven with the full big-three triple**, including Q4 2022 (33/23/11), Q3 2024 (31/20/13), Q4 2024 (30/21/12), Q3 2025 (29/20/13), Q4 2025 (28/21/14), Q1 2026 (28/21/14). Mapped to calendar years per the log's own instruction 3, at least **2022, 2024 and 2025** are available and unshipped, and Q4 2015 (AWS 31, vendor-partial) besides. The visible cost is a **five-year hole between 2021 and 2026** in the one chart `CLAUDE.md` §1.1.5 names as the flagship, and an HHI/top-3 line coarser than the verified evidence supports. Not a correctness defect — the shipped points are right — but verified data is being left on the floor. | `data-engineer` |

### 1.2 Open (carried forward, accepted priority)

| ID | Priority | Area | File:line | Finding | Suggested owner |
|---|---|---|---|---|---|
| Q-14 | P3 | Data hygiene | `data/sources.ts` | **Unchanged.** Five registry entries cited by nothing in the data: S09, S15b, B04, B08, B09. B04 (Helmer) is credited in prose (`data/rubric.ts:7`, `MoatRadar.tsx:317`) so it earns its place; S09 and S15b remain orphans. | `data-engineer` |
| Q-15 | P3 | Legibility §10.9 | `components/charts/LineageGraph.tsx:50` | **Unchanged.** `sourceTitleFor` is declared in the props type and never called, because `LineageLink` carries no `sourceIds`. Logged in `CONTRACTS.md` §8.11.4 / §9.2 as accepted. Re-stated so it is not lost. | `chart-engineer` |
| Q-22 | P3 | Accessibility (colour vision) | `app/globals.css:45–54, 99–108` | New measurement. The ten archetype hues are well separated for normal vision (see §2, Q-05) but **collapse under deuteranopia**: simulated ΔE00 in dark theme is **0.2** (platform-giant / ai-native), **0.3** (ai-native / si-channel), **0.3** (platform-giant / si-channel); light theme minimum **1.4** (commercial-oss / marketplace). Ten categories cannot be carried by hue alone. **Not a WCAG 1.4.1 failure** — archetype is also text in the mark `aria-label`, the tooltip, the legend and the table column (`CompetitiveBubble.tsx:318, 471, 510`) — so this is a usability ceiling, not a defect. A second channel (fill pattern or mark shape) for the four colliding hues would close it. | `chart-engineer` |
| Q-23 | P3 | Sourcing hygiene | `data/sources.ts:815` (S86) | S86 (Gartner, "worldwide AI spending to grow 47% in 2026") ships `verified: false` because the verifier's fetch was blocked. **QA fetched it this session with a browser UA: 200, body read, "$2.59 Trillion in AI Spending…", "over 45% of spending".** The downgrade is conservative and not wrong under §11.1 (the verifier never saw it), but the page is public and now *has* been read in this project. Either log this read and upgrade, or leave as is and accept that the most authoritative of the four Gartner-AI sources is the one marked unverified. | `data-verifier` |
| Q-24 | P3 | Documentation consistency | `components/charts/primitives/atlasRadarMath.ts:8`; `CLAUDE.md:190, 237` | §11.8 says "quadrant" was corrected everywhere. Two stale uses remain: the `atlasRadarMath` header comment ("ring order, quadrant order") and `CLAUDE.md` itself (`// ext: radar quadrant`, "quadrants = category"). The rendered UI and the methodology copy are correct ("2 of the radar's 5 sectors are empty"). | `chart-engineer` (comment) / `orchestrator` (spec) |
| Q-25 | P3 | Sourcing precision (§11.6 edge) | `data/events.ts:807–814` | `evt-2019-salesforce-tableau` ships `low: 15.3` under `confidence: "reported"`. The cited page (S83) states $15.7B and **not** $15.3B; the note says "$15.3B circulates as the equity-value basis", attributed to nothing in the registry. The `value` is impeccably sourced and the note is honest about S58 being date-only, so this is the weakest possible form of §11.6 — an unattributed *band endpoint*. Either cite the page that carries 15.3 or drop the band. | `data-engineer` |
| Q-26 | P3 | Accessibility (1.4.11) | `components/ui/button.tsx:15`; `app/globals.css:22` | §11 left `--border` at 1.35:1 light / 1.44:1 dark as a decorative hairline, which is right for `Card`, `Separator` and the section rules. One interactive exception survives: `button` `variant="outline"` uses the plain `border` token in **light** theme (dark theme correctly overrides to `border-input`). The label carries the affordance, so this is defensible; making light match dark costs one class. | `orchestrator` |

### 1.3 Closed — re-verified this session

| ID | Verdict | Evidence gathered in this re-audit |
|---|---|---|
| **Q-01** | **Closed as written; superseded by Q-17** | §12.1 exists with 82 rows, one per entry then shipping, each with URL, observed HTTP status and what was confirmed. Machine-checked: **0 id mismatches and 0 URL mismatches** between the 82 rows and the 82 entries they cover — the §11.5 URL rule **does hold** for the audited set. The verifier's counter-finding is correct and my original count was wrong: I matched by id, ids had drifted (§12.4), so hits on "S65", "S69", "S70", "S72", "S74" pointed at different pages. |
| **Q-02** | **Closed** | `S52` now stores `…/software/2025/01/02/20-years-since-oracle-bought-two-software-rivals-in-one/1202333` → **200**, body contains "PeopleSoft" ×64 and "$10.3 billion". Confirmed my suggested URL was itself a **301** to exactly this target; the canonical form was stored and read. |
| **Q-03** | **Closed; ruling §11.1 holds** | `S78` and `S17` are `verified: false` with URLs kept; no `reported` point cites either (checked programmatically). **Nothing over-downgraded:** the unverified set is exactly S17, S78, S86 + the nine `B*`. The 403 hosts stay `verified: true` — re-checked here: S13 (seekingalpha) 403, S42 (investors.broadcom.com) 403, both bot-protection on free pages; S02 (gartner.com), which 403'd for the verifier, returned **200 to a browser UA** for me, which is the clearest possible vindication of the ruling. See §2. |
| **Q-04** | **Closed; the Adobe/Splunk judgment is right** | IBM: **19 of 19** revenue points carry a basis note (`onBasis`, `companies.ts:50–56`). `evt-2021-ibm-kyndryl` exists, `type: "spin-off"`, cites S80 + S81. **Both fetched and read here:** S80 (IBM 8-K Ex-99.3) shows the pro forma line "Total revenue 73,620 (18,439) 55,181 2,689 **57,870**" — the exact three numbers the event's `impact` quotes; S81 confirms "On November 3, 2021, IBM completed the separation". Adobe FY2009 (3.5799 → 2.9459, −17.7%) and Splunk FY2021 (2.3589 → 2.2294, −5.5%) are same-basis GAAP declines with no divestiture and no restatement: annotating them would be the error, not omitting it. |
| **Q-05** | **Closed** | Recomputed with **CIEDE2000**, not contrast ratio. Light: min ΔE00 **8.2** (best-of-breed/ai-native), median **32.4**; dark: min **8.8**, median **35.1**. Against the previous scheme's 1.18–1.57:1 same-hue pairs this is a different order of problem. Contrast against the page is retained: **4.91–5.71:1** light, **8.77–9.77:1** dark, all ten hues, both themes. Residual: Q-22 (colour-vision). Event-lane colours still use the accent + `color-mix` variants, but lanes are positionally separated and labelled, so hue is not load-bearing there. |
| **Q-06** | **Closed; the `--border` reasoning holds** | `--input` measured: **3.23:1** light (`#948a7b` on `#faf9f7`), **3.33:1** dark (`#6f6759` on `#14130f`) — both clear the 1.4.11 3:1 floor. `Input`, `Select` and `Checkbox` all use `border-input` (verified in the three files), so the controls that need the boundary get it. `--border` at 1.35/1.44 now draws only card edges, separators and section rules — decorative, exempt. One leak: Q-26. |
| **Q-07** | **Closed** | `/methodology/#limitations` carries the AI-skew entry and **every numeral is computed at module scope from `emerging`** (`page.tsx:53–70`). Rendered output checked against the live dataset: "11 of the 12", "6 signal types", "35 signals", "11 platform shifts", "10 leading indicators", "2 regulation", "3 unbundling", "infrastructure 8, horizontal apps 3, vertical apps 1, consumer 0, emerging 0", "2 of the radar's 5 sectors" — **all correct**, and it says *sectors*. One soft spot: `aiFramedEmerging` is `emerging.length` minus a hard-coded `NON_AI_EMERGING_IDS` list, so a future non-AI candidate would silently mis-count. |
| **Q-08** | **Closed** | `MoatRadar.tsx:54` `MIN_PLOT_HEIGHT = 420`, applied at `:127`; narrow viewports open on the table (`:326`, remounted by `key` at `:323`), with short axis labels and reduced label padding for the chart variant. |
| **Q-09** | **Closed** | New primitive `components/charts/primitives/atlasLabelPlacement.ts` (`placeOutsideMarkLabels`, `placedLabelsById`) does width-fitting via `fitMarkLabel`, collision bands and plot-edge clamping, most-important-first. Consumed by `CompetitiveBubble.tsx:270` and `LineageGraph.tsx:197`. Covered by `tests/atlas-label-placement.test.ts`. |
| **Q-10** | **Closed** | `EventTimeline.tsx:74` is now `<h3>`. Heading sequences extracted from the export: `/`, `/explore/`, `/methodology/`, `/emerging/`, `/simulator/`, `/markets/crm/`, `/markets/cloud-infrastructure/`, `/companies/ibm/`, `/companies/sap/` — **zero skips in all nine**. The `/emerging/` sheet headings sit under `sr-only` `<h2>`s (`EmergingRoute.tsx:157, 169`), which is the fix I had missed. |
| **Q-11** | **Closed** | `LineageGraph.tsx:59` `MIN_PLOT_HEIGHT = 520`, matching the §10.4 standard. |
| **Q-12** | **Closed** | `grep motion package.json` → nothing. Dependency removed. |
| **Q-13** | **Closed** | `S09` stores `https://www.aboutamazon.com/…` → 200, no redirect. |
| Q-16 | Not a defect | Unchanged: 37 `function` declarations, all in `components/ui/` (shadcn-generated, orchestrator-owned). |

### 1.4 New work audited — verdicts

| Item | Verdict | Evidence |
|---|---|---|
| **Citation–content repairs (6)** | **All six verified against the cited page, fetched here** | **Slack $27.7B → S82:** page reads "an enterprise value of approximately **$27.7 billion** based on the closing price … on **November 30, 2020**" — the note's wording is the page's. **Tableau $15.7B → S83:** "an enterprise value of **$15.7 billion** (net of cash), based on the trailing 3-day volume weighted average price … as of June [7], 2019". **Informatica $8B → S84:** "approximately **$8 billion** in equity value, net of Salesforce's current investment in Informatica … **$25 in cash per share**". **Broadcom–VMware:** now `estimated`, `low: 61`, `high: 69`, cited to S85 (VMware 8-K Ex-99.1), which reads "values VMware at approximately **$61 billion** … Broadcom will **assume $8 billion of VMware net debt**" and states **no** total — the shipped derivation is exactly the arithmetic the page supports. **Gartner AI $2.59tn:** S87 (CIO Dive) "rise by 47% year-over-year in 2026, totaling **$2.59 trillion**"; S86 (Gartner) "**$2.59 Trillion** in AI Spending"; S89 "over 45%". **Adobe–Figma:** S88 (Adobe 8-K) reads "a cash payment to Figma in the previously agreed amount of **one billion dollars ($1,000,000,000)**" — the event's `impact` quotes it verbatim. |
| **Blast radius of the Gartner figures** | **Contained** | `grep -rn "2\.59\|2\.52\|2590\|2520" data/ app/ components/` → four hits, all in `events.ts` (title + impact of `evt-2026-gartner-ai-spending`) and `sources.ts` (two titles). `markets.ts` and `emerging.ts` carry none. S25 is now cited only where a January-basis segment line is being quoted, and S89 **explicitly labels those segment figures "Jan est."** on the page — so `agentic-enterprise-automation`'s "Gartner's **January 2026** forecast puts the AI software line at $452B" is precisely attributed. |
| **Emerging signals sweep (37 → 35)** | **Verified** | 35 signals; **0 with an empty `sourceIds`**; per-market counts 4/3/3/3/3/3/2/3/3/3/2/3 — **no market lost its last signal**, minimum is 2. The two folded interpretations now read as the Atlas's own argument in prose: `voice-ai-agents.thesis` ("Real-time speech models plus falling inference prices…") and `ai-data-infrastructure.thesis` ("Standalone vector databases were absorbed as a feature…"). Where a source was found instead of folding, it is real: **S91** (AWS) "supports the pgvector extension **to store embeddings from machine learning (ML) models in your database**", **S92** "investing **17 times more** in AI-powered security tools… $2.8 billion", **S93** (Cloudflare) "**over 50% (and rising!) of human traffic is protected against store-now/decrypt-later**", **S94** (fin.ai) "$0.99 … **No further help is requested after Fin's last answer**", **S90** (Microsoft Learn) SIP "Call centers, IVR systems" and `"server_url": "https://mcp.stripe.com"`, **S95** "$2.3 billion fundraise at a **$29.3 billion** valuation … valued at **under $10 billion just months ago**". All twelve quoted fragments matched verbatim. |
| **Interpolated bubble marks** | **Verified** | Ran `bubbleData` over the shipped roster: the interpolated set is exactly **Oracle FY2010, Salesforce FY2010, VMware FY2017** (both size metrics), each with `revenueBasis.confidence === "reported"` but `bubbleDatumConfidence() === "modeled"`. `CompetitiveBubble` consumes it at `:294–295`, `:413–421`, `:438–442`, `:452–454` (tooltip note = `INTERPOLATED_BUBBLE_NOTE`). |
| **Radar sectors, not quadrants** | **Verified in the product, stale in two comments** | Rendered methodology copy derives the count from `CATEGORY_ORDER.length`. See Q-24 for the residue. |

---

## 2. The two rulings made against the obvious fix — do they hold?

**§11.1 (a 403 on re-check does not unverify).** **Holds, and the evidence this session strengthens it.**
The flag is a claim about a past act — "was the figure seen in this project" — and an automated
re-fetch failing today cannot make a past reading not have happened. The only reason to prefer the
naive rule ("if it 403s, unverify") would be the reader-facing promise: the chip says "Fetched and
verified in this project", and a reader who cannot open the page is owed something. That objection
largely dissolves on measurement. Re-checking all 88 URLs with a normal browser UA: **83 × 200,
3 × 403, 1 × 404**. The 403s are S13 (seekingalpha.com), S42 (investors.broadcom.com) and S78
(bloomberg.com, already `verified: false`) — two bot-protected free pages a human browser opens
normally. **S02 (gartner.com), which 403'd the verifier and drove part of this discussion, returned
200 with a full body to me** — proving the failure is fetcher-specific, not reader-facing. The
distinction the ruling draws (never-read ⇒ false; read-then-blocked ⇒ true) is the one that
survives contact with the data, and §12.1 records the provenance in the row, which is what makes it
auditable rather than merely asserted. The one thing it does not cover is Q-19: a URL that 404s for
*everyone* is a different failure from a 403, and S28 should not keep the flag on a dead root.

**§11.7 (the schema stays at `sourceIds.min(1)`).** **Holds.** The refusal is right for a reason
stronger than tidiness: the constraint is what *produced* the finding. Three unsourced readings
surfaced only because the schema would not let them ship quietly, and relaxing it would have
converted a detection mechanism into a loophole available to every future signal. The alternative
on offer — an "interpretation" signal type with no sources — would also have been a category error
on screen: the radar sizes dots by Σ signal strength, so an evidence-free interpretation would have
*added weight to a market* on the strength of an opinion. The chosen resolution is better than a
compromise: both folded readings now sit in `thesis`, a field the methodology page already frames
as the Atlas's own argument, where they read as claims rather than evidence; and one of the three
(vector search in mainstream databases) found a real source (S91) and stayed a signal. The
schema's own `min(1)` also guarantees the second half of the resolution order — verified: every
market still has ≥ 2 sourced signals. No part of this ruling needs revisiting.

---

## 3. Evidence by area (re-run)

### 3.1 Build health

| Command | Result |
|---|---|
| `npm run typecheck` | clean, no output |
| `npm run lint` | clean, no output |
| `npx vitest run` | **25 files, 322 tests, all passed** |
| `npm run validate-data:strict` | **all 14 checks PASS**; 11 eras / 55 markets / 127 companies / **109** events / 12 emerging / 44 flows / 10 chapters / **97** sources |
| static export | `out/` = **190** HTML files (189 routes + `404.html`); `out/markets` 55 dirs, `out/companies` 127 dirs; dev server returns 200 on `/`, `/explore/`, `/methodology/`, `/emerging/`, `/simulator/`, `/markets/crm/`, `/companies/ibm/`, `/companies/salesforce/` |

### 3.2 Data integrity

- Programmatic sweep of all **574** points (264 `reported` / 36 `estimated` / 274 `modeled`):
  **0** missing or unresolvable `sourceId`, **0** missing `year`/`unit`/`confidence`, **0** `modeled`
  without `note`, **0** band violations (`low ≤ value ≤ high`), **0** `reported` points citing an
  unverified source, **0** `verified: true` sources without a URL.
- **20 `reported` figures re-spot-checked** against the log in the first audit (20/20 exact); this
  round the check moved to the repaired citations, where **6/6** matched the cited page and
  **12/12** quoted fragments in the new emerging signals matched verbatim.
- **URL sweep, all 88:** 83 × 200, 3 × 403 (S13, S42, S78 — known bot-blocked/paywalled hosts,
  `verified` flags consistent with §11.1), **1 × 404 (S28 — Q-19)**. No invented-looking URLs: every
  host is the real publisher and every path shape matches that publisher's scheme.
- **Minimum volumes** exceeded on every axis. Share data still exists for exactly one market
  (correct per `research.md` §0.4), though shallower than the log supports — Q-21.

### 3.3 Conventions

Sweeps over `app/ components/ lib/ data/ scripts/ tests/`: `any` / `as any` / `@ts-ignore` /
`@ts-expect-error` / `eslint-disable` — **zero**. `function` declarations outside
`components/ui/` — **zero**. Ternaries inside `className` outside `cn()` — **zero**. Raw CSS —
exactly one file, `app/globals.css`. `todo|fixme|placeholder|lorem` — one hit, a Tailwind
`placeholder:` variant in `components/ui/select.tsx:39`.

### 3.4 Accessibility

- All **9** chart files pass a `table` node to `ChartFrame` and carry `tabIndex` marks wired to
  `useKeyboardNav`. Narrow-viewport table-first defaults now cover **five** components:
  `BundlingSankey:420`, `CompetitiveBubble:716`, `LineageGraph:524`, **`MoatRadar:326`** (new) and
  `SeriesChart:184`.
- `useReducedMotion` consumed by `ChartFrame`, `CompetitiveBubble`, `MarketTreemap`,
  `YearScrubber`, `ThemeToggle`; global `@media (prefers-reduced-motion: reduce)` at
  `globals.css:224` zeroes animation, transition and scroll behaviour.
- Heading order clean on all nine sampled routes (§1.3, Q-10).
- **Contrast, recomputed.** Unchanged and passing: all text pairs and the five category accents in
  both themes; ring 6.32 / 9.02. Changed: `--input` **3.23 / 3.33** (was 1.35 / 1.44) — passes.
  Unchanged by decision: `--border` 1.35 / 1.44, decorative (Q-26 is the one leak).
  Archetype palette vs page: 4.91–5.71 light, 8.77–9.77 dark.
- **Categorical distinctness, CIEDE2000** (the right metric — contrast ratio measures luminance
  only and says nothing about hue separation): min ΔE00 8.2 light / 8.8 dark, median 32.4 / 35.1.
  Colour-vision caveat in Q-22.

### 3.5 Behaviour

- `tests/url-state.test.ts` round-trips `serialize(parse(x))` as a fixed point and round-trips a
  fully populated state; passing in the 322-test run. `pin` capped at 3 on parse, update and toggle.
- 10 chapters, `order` 1…10, graphics `timeline, timeline, treemap, bubble, moat, share, bundling,
  lineage, emerging, simulator` — all ten visualizations reachable from Story. `graphicState` keys
  (`arch, cat, chart, ent, focus, from, mode, net, pin, seed, shift, sw, ticks, to, year`) are a
  subset of the URL key set, validator-enforced.
- Profile routes: 55 market dirs, 127 company dirs in `out/`.
- Empty state: `ShareStackedArea.tsx:451` renders "No reliable public share data" for the 54
  markets without a series; `DetailDrawer.tsx:365` mirrors it.
- Methodology source anchors: **97** `id="source-…"` anchors for 97 registry entries, exact match;
  rendered counts "Of 97 sources… 85 were fetched… 12 were not" agree with the data (the *prose
  describing* the 12 is Q-18).

---

## 4. Definition of done (`CLAUDE.md` §9)

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 1 | Every number has sourceId, year, confidence; no fabricated citations; all `verified: true` sources have fetched URLs | **Pass with defects** | 574/574 points complete and schema-enforced; 0 `reported` points citing an unverified source. Six citation–content mismatches repaired and **each re-verified against the cited page here**. Defects: **S28's stored URL 404s (Q-19)**; **15 entries have no log row (Q-17)**. No fabricated citation found anywhere: 88/88 URLs resolve to the real publisher, and every figure QA sampled was on its page. |
| 2 | 11 eras, 40+ markets, archetypes, dynamics, 12 emerging markets, 8 case studies in data **and** UI | **Pass** | 11 / 55 / 10 archetypes / 10 event types / 12 emerging / 109 events. Eight case studies present as data and reachable UI (unchanged from the first audit, re-spot-checked on `/companies/ibm/` and `/companies/salesforce/`). |
| 3 | All 10 visualizations work, interactive, cross-linked | **Pass** | 9 chart files + profiles; all 9 pass `table` to `ChartFrame` and carry keyboard-reachable marks; reachable from `/explore/` via the `chart` key and from Story. |
| 4 | Story and Explore both work; URL state round-trips (tested) | **Pass** | §3.5; both routes 200; round-trip fixed-point test green in the 322-test run. |
| 5 | Keyboard nav in every view; data-table alternative on every chart | **Pass** | §3.4. MoatRadar's narrow table variant closes the last gap. |
| 6 | Estimated/modeled visually distinct; tooltips always show value, year, source, confidence | **Pass** | `HatchDefs` + `ConfidenceBadge` in both tooltip primitives; **interpolated bubble marks now demote to `modeled` with a note** (Oracle/Salesforce FY2010, VMware FY2017 — verified at runtime), matching the treemap's existing behaviour. |
| 7 | Dark and light work; AA contrast; responsive to 375px | **Pass** | All text and accent pairs pass AA in both themes; `--input` now clears the 3:1 UI floor; `--border` is decorative by ruling. Simplified variants for Bubble, Lineage, Sankey **and MoatRadar**. Residuals are P3 (Q-22, Q-26). |
| 8 | `npm run build` produces a static export, zero TS errors, zero lint errors, all tests pass | **Pass** | typecheck clean, lint clean, **322/322** tests, `validate-data:strict` 14/14, `out/` holds 190 HTML files. Build not re-run by QA (orchestrator built immediately before this audit); the artefact was inspected instead. |
| 9 | No TODOs, placeholders or "add more data" comments | **Pass** | One hit, a Tailwind `placeholder:` variant. Zero TODO/FIXME/lorem. |
| 10 | README complete; `docs/verification-log.md` and `docs/qa-report.md` present | **Pass with one defect** | `README.md` (229 lines) now exists and covers setup, all scripts including the `validate-data:strict` trap (§11.4), architecture, the data-update workflow, what `verified: true` means, the two rules learned the hard way, seven known limitations and the Anthropic disclosure. `docs/verification-log.md` 1,334 lines (§0–§12). This file. Defect: **the cloud-share limitation is numerically wrong (Q-20)**. |

**Blocking for completion:** Q-17 and Q-18 (P1). Q-19, Q-20, Q-21 (P2) should follow.
No P0. No regression found in any previously passing §9 item.
