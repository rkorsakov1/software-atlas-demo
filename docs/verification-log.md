# Verification Log — The Software Atlas (Phase B1)

Owner: `data-verifier`. Session date: 21 September 2026.

Every row below was seen in a page fetched or a search result returned **in this session**. Nothing here is from model memory. Rows marked `unverifiable` list the queries attempted.

**Status legend:** `verified` · `corrected` (old → new) · `unverifiable` · `conflict`.

---

## 0. Method note: SEC XBRL as the primary revenue source

All US-domestic revenue series below come from the SEC's structured XBRL API, which republishes the exact values tagged in each company's filed 10-K:

```
https://data.sec.gov/api/xbrl/companyconcept/CIK##########/us-gaap/<Concept>.json
```

Concepts used: `Revenues`, `SalesRevenueNet` (pre-ASC-606 filings), `RevenueFromContractWithCustomerExcludingAssessedTax` (ASC 606, FY2018+). Only entries with `form: "10-K"` and a ~365-day period were taken. This is a **primary** source: the values are the filed ones, not a press restatement.

Two structural limits the data-engineer must know:

1. **XBRL coverage starts ~FY2007–2009.** Pre-2007 revenue (Microsoft FY1995, Oracle FY1990, Salesforce FY2005) is **not** in this API. Those points are handled separately in §1.9 and mostly end up on the downgrade list.
2. **ASC 606 restatement creates two legitimate values** for FY2016/FY2017 at several companies (as-filed vs. restated). Recorded as `conflict` rows where it matters.

---

## 1. Annual revenue series (bubble chart, priority 1)

### 1.1 Microsoft — FY ends 30 June; FY label = calendar year of the June end

Source for all rows: SEC XBRL `companyconcept`, CIK 0000789019, entity name returned `MICROSOFT CORPORATION`.

| Item | Value | Unit | Year (FY end) | Source title | Publisher | URL | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Microsoft revenue | 60.420 | USD_B | FY2008 (Jun 2008) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/Revenues.json | verified | |
| Microsoft revenue | 58.437 | USD_B | FY2009 (Jun 2009) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/Revenues.json | verified | Only annual revenue decline in the series |
| Microsoft revenue | 62.484 | USD_B | FY2010 (Jun 2010) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/Revenues.json | verified | |
| Microsoft revenue | 69.943 | USD_B | FY2011 (Jun 2011) | XBRL companyconcept us-gaap:SalesRevenueNet | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/SalesRevenueNet.json | verified | |
| Microsoft revenue | 73.723 | USD_B | FY2012 (Jun 2012) | XBRL companyconcept us-gaap:SalesRevenueNet | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/SalesRevenueNet.json | verified | |
| Microsoft revenue | 77.849 | USD_B | FY2013 (Jun 2013) | XBRL companyconcept us-gaap:SalesRevenueNet | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/SalesRevenueNet.json | verified | |
| Microsoft revenue | 86.833 | USD_B | FY2014 (Jun 2014) | XBRL companyconcept us-gaap:SalesRevenueNet | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/SalesRevenueNet.json | verified | **Resolves research.md §9.4 item 1** (Microsoft FY2014 revenue) |
| Microsoft revenue | 93.580 | USD_B | FY2015 (Jun 2015) | XBRL companyconcept us-gaap:SalesRevenueNet | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/SalesRevenueNet.json | verified | |
| Microsoft revenue (as filed) | 85.320 | USD_B | FY2016 (Jun 2016) | XBRL companyconcept us-gaap:SalesRevenueNet | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/SalesRevenueNet.json | conflict | As filed in the FY2016 10-K. Restated under ASC 606 to 91.154 — see next row |
| Microsoft revenue (ASC 606 restated) | 91.154 | USD_B | FY2016 (Jun 2016) | XBRL companyconcept us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | conflict | Restated comparative in the FY2018 10-K. **Ship this one** for series continuity with FY2018+ |
| Microsoft revenue (as filed) | 89.950 | USD_B | FY2017 (Jun 2017) | XBRL companyconcept us-gaap:SalesRevenueNet | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/SalesRevenueNet.json | conflict | As filed |
| Microsoft revenue (ASC 606 restated) | 96.571 | USD_B | FY2017 (Jun 2017) | XBRL companyconcept us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | conflict | **Ship this one** |
| Microsoft revenue | 110.360 | USD_B | FY2018 (Jun 2018) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Microsoft revenue | 125.843 | USD_B | FY2019 (Jun 2019) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Microsoft revenue | 143.015 | USD_B | FY2020 (Jun 2020) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Microsoft revenue | 168.088 | USD_B | FY2021 (Jun 2021) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Microsoft revenue | 198.270 | USD_B | FY2022 (Jun 2022) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Microsoft revenue | 211.915 | USD_B | FY2023 (Jun 2023) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Microsoft revenue | 245.122 | USD_B | FY2024 (Jun 2024) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Microsoft revenue | 281.724 | USD_B | FY2025 (Jun 2025) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Microsoft revenue | 331.839 | USD_B | FY2026 (Jun 2026) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | Latest complete fiscal year. Consistent with S11 (FY26 Q4 8-K) |

### 1.2 Oracle — FY ends 31 May; FY label = calendar year of the May end

Source: SEC XBRL, CIK 0001341439, entity `Oracle Corporation`.

| Item | Value | Unit | Year (FY end) | Source title | Publisher | URL | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Oracle revenue | 23.252 | USD_B | FY2009 (May 2009) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/Revenues.json | verified | Earliest annual period in the XBRL record |
| Oracle revenue | 35.622 | USD_B | FY2011 (May 2011) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/Revenues.json | verified | Post Sun Microsystems integration |
| Oracle revenue | 37.121 | USD_B | FY2012 (May 2012) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/Revenues.json | verified | |
| Oracle revenue | 37.180 | USD_B | FY2013 (May 2013) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/Revenues.json | verified | |
| Oracle revenue | 38.275 | USD_B | FY2014 (May 2014) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/Revenues.json | verified | |
| Oracle revenue | 38.226 | USD_B | FY2015 (May 2015) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/Revenues.json | verified | |
| Oracle revenue | 37.047 | USD_B | FY2016 (May 2016) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/Revenues.json | verified | Trough of the cloud-transition plateau |
| Oracle revenue (as filed) | 37.728 | USD_B | FY2017 (May 2017) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/Revenues.json | conflict | Restated under ASC 606 to 37.792 |
| Oracle revenue (ASC 606 restated) | 37.792 | USD_B | FY2017 (May 2017) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | conflict | Difference is 0.064 USD_B (0.2%); either is defensible, **ship the restated** for continuity |
| Oracle revenue (as filed) | 39.831 | USD_B | FY2018 (May 2018) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/Revenues.json | conflict | Restated to 39.383 |
| Oracle revenue (ASC 606 restated) | 39.383 | USD_B | FY2018 (May 2018) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | conflict | **Ship the restated** |
| Oracle revenue | 39.506 | USD_B | FY2019 (May 2019) | XBRL companyconcept, both concepts agree | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | Both tags return 39.506 |
| Oracle revenue | 39.068 | USD_B | FY2020 (May 2020) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Oracle revenue | 40.479 | USD_B | FY2021 (May 2021) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Oracle revenue | 42.440 | USD_B | FY2022 (May 2022) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | Last full year before Cerner consolidation |
| Oracle revenue | 49.954 | USD_B | FY2023 (May 2023) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | +17.7% — first full year including Cerner |
| Oracle revenue | 52.961 | USD_B | FY2024 (May 2024) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Oracle revenue | 57.399 | USD_B | FY2025 (May 2025) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Oracle revenue | 67.357 | USD_B | FY2026 (May 2026) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001341439/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | +17.3%. Consistent with S13 (Oracle FY2026 release) |
| Oracle revenue | — | USD_B | FY2010 (May 2010) | — | — | — | unverifiable | Gap in the XBRL annual record between FY2009 and FY2011. Not re-fetched from the FY2010 10-K this session. Data-engineer should **omit FY2010** rather than interpolate |

### 1.3 Salesforce — FY ends 31 January; FY label = calendar year of the January end (FY2026 ended 31 Jan 2026)

Source: SEC XBRL, CIK 0001108524, entity `Salesforce, Inc.`.

| Item | Value | Unit | Year (FY end) | Source title | Publisher | URL | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Salesforce revenue | 1.0768 | USD_B | FY2009 (Jan 2009) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/Revenues.json | verified | First year above $1B |
| Salesforce revenue | 1.6571 | USD_B | FY2011 (Jan 2011) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/Revenues.json | verified | Period 2010-02-01 → 2011-01-31 |
| Salesforce revenue | 2.2665 | USD_B | FY2012 (Jan 2012) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/Revenues.json | verified | |
| Salesforce revenue | 3.0502 | USD_B | FY2013 (Jan 2013) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/Revenues.json | verified | |
| Salesforce revenue | 4.0710 | USD_B | FY2014 (Jan 2014) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/Revenues.json | verified | |
| Salesforce revenue | 5.3736 | USD_B | FY2015 (Jan 2015) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/Revenues.json | verified | |
| Salesforce revenue | 6.6672 | USD_B | FY2016 (Jan 2016) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/Revenues.json | verified | |
| Salesforce revenue (as filed) | 8.3920 | USD_B | FY2017 (Jan 2017) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/Revenues.json | conflict | Restated under ASC 606 to 8.437 |
| Salesforce revenue (ASC 606 restated) | 8.4370 | USD_B | FY2017 (Jan 2017) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | conflict | **Ship the restated** for continuity |
| Salesforce revenue | 10.540 | USD_B | FY2018 (Jan 2018) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Salesforce revenue | 13.282 | USD_B | FY2019 (Jan 2019) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Salesforce revenue | 17.098 | USD_B | FY2020 (Jan 2020) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Salesforce revenue | 21.252 | USD_B | FY2021 (Jan 2021) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Salesforce revenue | 26.492 | USD_B | FY2022 (Jan 2022) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | First full year including Slack (closed Jul 2021) |
| Salesforce revenue | 31.352 | USD_B | FY2023 (Jan 2023) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Salesforce revenue | 34.857 | USD_B | FY2024 (Jan 2024) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | Growth decelerates to ~11% |
| Salesforce revenue | 37.895 | USD_B | FY2025 (Jan 2025) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Salesforce revenue | 41.525 | USD_B | FY2026 (Jan 2026) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001108524/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | Latest complete FY. Consistent with S12 |
| Salesforce revenue | — | USD_B | FY2010 (Jan 2010) | — | — | — | unverifiable | Not present as an annual period in the XBRL record. Omit rather than interpolate |

### 1.4 Adobe — FY ends the Friday nearest 30 November; FY label = calendar year of that end

Source: SEC XBRL, CIK 0000796343, entity `ADOBE INC.`. A complete unbroken 19-year series — the best in the Atlas, and it spans the 2012–2015 subscription transition exactly.

| Item | Value | Unit | Year (FY end) | Source title | Publisher | URL | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Adobe revenue | 3.1579 | USD_B | FY2007 (30 Nov 2007) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | |
| Adobe revenue | 3.5799 | USD_B | FY2008 (28 Nov 2008) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | |
| Adobe revenue | 2.9459 | USD_B | FY2009 (27 Nov 2009) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | Financial-crisis decline |
| Adobe revenue | 3.8000 | USD_B | FY2010 (3 Dec 2010) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | 53-week year |
| Adobe revenue | 4.2163 | USD_B | FY2011 (2 Dec 2011) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | |
| Adobe revenue | 4.4037 | USD_B | FY2012 (30 Nov 2012) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | Creative Cloud launched May 2012 — series peak before the transition trough |
| Adobe revenue | 4.0552 | USD_B | FY2013 (29 Nov 2013) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | **The subscription-transition trough**: −7.9% as perpetual licence revenue stopped |
| Adobe revenue | 4.1471 | USD_B | FY2014 (28 Nov 2014) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | Still below FY2012 |
| Adobe revenue | 4.7955 | USD_B | FY2015 (27 Nov 2015) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | Recovery above the FY2012 peak |
| Adobe revenue | 5.8544 | USD_B | FY2016 (2 Dec 2016) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | |
| Adobe revenue | 7.3015 | USD_B | FY2017 (1 Dec 2017) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | |
| Adobe revenue | 9.0300 | USD_B | FY2018 (30 Nov 2018) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | |
| Adobe revenue | 11.171 | USD_B | FY2019 (29 Nov 2019) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | |
| Adobe revenue | 12.868 | USD_B | FY2020 (27 Nov 2020) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | |
| Adobe revenue | 15.785 | USD_B | FY2021 (3 Dec 2021) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | 53-week year |
| Adobe revenue | 17.606 | USD_B | FY2022 (2 Dec 2022) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | Figma deal announced Sep 2022 |
| Adobe revenue | 19.409 | USD_B | FY2023 (1 Dec 2023) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | Figma deal abandoned Dec 2023 |
| Adobe revenue | 21.505 | USD_B | FY2024 (29 Nov 2024) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | |
| Adobe revenue | 23.769 | USD_B | FY2025 (28 Nov 2025) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000796343/us-gaap/Revenues.json | verified | Latest complete FY; matches the 10-K at S14 (`adbe-20251128.htm`). FY2026 ends Nov 2026, after the Atlas cut-off |

### 1.5 Amazon (consolidated) — calendar fiscal year

Source: SEC XBRL, CIK 0001018724, entity `AMAZON COM INC`. Consolidated only — the **AWS segment** series is not exposed by `companyconcept` (segment values carry XBRL dimensions the API strips) and is handled in §1.6.

| Item | Value | Unit | Year (FY end) | Source title | Publisher | URL | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Amazon revenue | 135.987 | USD_B | FY2016 (Dec 2016) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001018724/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Amazon revenue | 177.866 | USD_B | FY2017 (Dec 2017) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001018724/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Amazon revenue | 232.887 | USD_B | FY2018 (Dec 2018) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001018724/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Amazon revenue | 280.522 | USD_B | FY2019 (Dec 2019) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001018724/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Amazon revenue | 386.064 | USD_B | FY2020 (Dec 2020) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001018724/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Amazon revenue | 469.822 | USD_B | FY2021 (Dec 2021) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001018724/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Amazon revenue | 513.983 | USD_B | FY2022 (Dec 2022) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001018724/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Amazon revenue | 574.785 | USD_B | FY2023 (Dec 2023) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001018724/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Amazon revenue | 637.959 | USD_B | FY2024 (Dec 2024) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001018724/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | |
| Amazon revenue | 716.924 | USD_B | FY2025 (Dec 2025) | XBRL companyconcept, ASC 606 concept | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0001018724/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json | verified | Latest complete FY |

### 1.7 IBM — calendar fiscal year

Source: SEC XBRL, CIK 0000051143, entity `INTERNATIONAL BUSINESS MACHINES CORP`. This is the single most editorially useful series in the Atlas: an unbroken 19-year record of a platform giant shrinking.

| Item | Value | Unit | Year (FY end) | Source title | Publisher | URL | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| IBM revenue | 98.786 | USD_B | FY2007 (Dec 2007) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 103.630 | USD_B | FY2008 (Dec 2008) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 95.758 | USD_B | FY2009 (Dec 2009) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 99.870 | USD_B | FY2010 (Dec 2010) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 106.916 | USD_B | FY2011 (Dec 2011) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | **All-time peak** |
| IBM revenue | 104.507 | USD_B | FY2012 (Dec 2012) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | Decline begins |
| IBM revenue | 98.367 | USD_B | FY2013 (Dec 2013) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 92.793 | USD_B | FY2014 (Dec 2014) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 81.741 | USD_B | FY2015 (Dec 2015) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 79.919 | USD_B | FY2016 (Dec 2016) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 79.139 | USD_B | FY2017 (Dec 2017) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 79.591 | USD_B | FY2018 (Dec 2018) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | Red Hat deal announced Oct 2018 |
| IBM revenue | 77.147 | USD_B | FY2019 (Dec 2019) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | Red Hat closed Jul 2019 |
| IBM revenue | 73.620 | USD_B | FY2020 (Dec 2020) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 57.350 | USD_B | FY2021 (Dec 2021) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | **Discontinuity**: Kyndryl spin-off (Nov 2021) removed managed infrastructure. The −22% step is a spin-off, not organic decline — the Atlas must annotate this or the bubble chart will show a false collapse |
| IBM revenue | 60.530 | USD_B | FY2022 (Dec 2022) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 61.860 | USD_B | FY2023 (Dec 2023) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 62.753 | USD_B | FY2024 (Dec 2024) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | |
| IBM revenue | 67.535 | USD_B | FY2025 (Dec 2025) | XBRL companyconcept us-gaap:Revenues | SEC | https://data.sec.gov/api/xbrl/companyconcept/CIK0000051143/us-gaap/Revenues.json | verified | Latest complete FY. Still below FY2021 pre-spin |

### 1.8 Other public software companies

All rows from SEC XBRL `companyconcept`, concept `RevenueFromContractWithCustomerExcludingAssessedTax` unless noted. Entity name was confirmed in each response.

**ServiceNow** — calendar FY. CIK 0001373715, entity `ServiceNow, Inc.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001373715/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| ServiceNow revenue | 1.391 | USD_B | FY2016 (Dec) | verified | |
| ServiceNow revenue | 1.918 | USD_B | FY2017 (Dec) | verified | |
| ServiceNow revenue | 2.609 | USD_B | FY2018 (Dec) | verified | |
| ServiceNow revenue | 3.460 | USD_B | FY2019 (Dec) | verified | |
| ServiceNow revenue | 4.519 | USD_B | FY2020 (Dec) | verified | |
| ServiceNow revenue | 5.896 | USD_B | FY2021 (Dec) | verified | |
| ServiceNow revenue | 7.245 | USD_B | FY2022 (Dec) | verified | |
| ServiceNow revenue | 8.971 | USD_B | FY2023 (Dec) | verified | |
| ServiceNow revenue | 10.984 | USD_B | FY2024 (Dec) | verified | Crosses $10B |
| ServiceNow revenue | 13.278 | USD_B | FY2025 (Dec) | verified | Latest complete FY |

**Workday** — FY ends 31 Jan, label = calendar year of end. CIK 0001327811, entity `WORKDAY, INC.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001327811/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status |
|---|---|---|---|---|
| Workday revenue | 1.574 | USD_B | FY2017 (Jan 2017) | verified |
| Workday revenue | 2.143 | USD_B | FY2018 (Jan 2018) | verified |
| Workday revenue | 2.822 | USD_B | FY2019 (Jan 2019) | verified |
| Workday revenue | 3.627 | USD_B | FY2020 (Jan 2020) | verified |
| Workday revenue | 4.318 | USD_B | FY2021 (Jan 2021) | verified |
| Workday revenue | 5.139 | USD_B | FY2022 (Jan 2022) | verified |
| Workday revenue | 6.216 | USD_B | FY2023 (Jan 2023) | verified |
| Workday revenue | 7.259 | USD_B | FY2024 (Jan 2024) | verified |
| Workday revenue | 8.446 | USD_B | FY2025 (Jan 2025) | verified |
| Workday revenue | 9.552 | USD_B | FY2026 (Jan 2026) | verified |

**Snowflake** — FY ends 31 Jan. CIK 0001640147, entity `SNOWFLAKE INC.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001640147/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Snowflake revenue | 0.0967 | USD_B | FY2019 (Jan 2019) | verified | Pre-IPO year disclosed in the S-1/first 10-K |
| Snowflake revenue | 0.2647 | USD_B | FY2020 (Jan 2020) | verified | |
| Snowflake revenue | 0.5920 | USD_B | FY2021 (Jan 2021) | verified | IPO Sep 2020 |
| Snowflake revenue | 1.2193 | USD_B | FY2022 (Jan 2022) | verified | Crosses $1B |
| Snowflake revenue | 2.0657 | USD_B | FY2023 (Jan 2023) | verified | |
| Snowflake revenue | 2.8065 | USD_B | FY2024 (Jan 2024) | verified | |
| Snowflake revenue | 3.6264 | USD_B | FY2025 (Jan 2025) | verified | |
| Snowflake revenue | 4.6839 | USD_B | FY2026 (Jan 2026) | verified | |

**Datadog** — calendar FY. CIK 0001561550, entity `Datadog, Inc.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001561550/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Datadog revenue | 0.1008 | USD_B | FY2017 (Dec) | verified | Pre-IPO, disclosed in S-1 / first 10-K |
| Datadog revenue | 0.1981 | USD_B | FY2018 (Dec) | verified | |
| Datadog revenue | 0.3628 | USD_B | FY2019 (Dec) | verified | IPO Sep 2019 |
| Datadog revenue | 0.6035 | USD_B | FY2020 (Dec) | verified | |
| Datadog revenue | 1.0288 | USD_B | FY2021 (Dec) | verified | Crosses $1B |
| Datadog revenue | 1.6751 | USD_B | FY2022 (Dec) | verified | |
| Datadog revenue | 2.1284 | USD_B | FY2023 (Dec) | verified | |
| Datadog revenue | 2.6843 | USD_B | FY2024 (Dec) | verified | |
| Datadog revenue | 3.4272 | USD_B | FY2025 (Dec) | verified | |

**Atlassian** — FY ends 30 June. CIK 0001650372, entity `Atlassian Corporation`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001650372/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Atlassian revenue | 2.089 | USD_B | FY2021 (Jun 2021) | verified | XBRL 10-K record begins here (earlier years were filed on 20-F as a foreign private issuer and are not in this concept) |
| Atlassian revenue | 2.803 | USD_B | FY2022 (Jun 2022) | verified | |
| Atlassian revenue | 3.535 | USD_B | FY2023 (Jun 2023) | verified | |
| Atlassian revenue | 4.359 | USD_B | FY2024 (Jun 2024) | verified | |
| Atlassian revenue | 5.215 | USD_B | FY2025 (Jun 2025) | verified | |
| Atlassian revenue | 6.572 | USD_B | FY2026 (Jun 2026) | verified | +26.0%. Consistent with S15 (FY26 Q4 8-K Ex-99.1) |

**Palantir** — calendar FY. CIK 0001321655, entity `Palantir Technologies Inc.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001321655/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Palantir revenue | 0.5954 | USD_B | FY2018 (Dec) | verified | Pre-IPO, from the direct-listing S-1 / first 10-K |
| Palantir revenue | 0.7426 | USD_B | FY2019 (Dec) | verified | |
| Palantir revenue | 1.0927 | USD_B | FY2020 (Dec) | verified | Direct listing Sep 2020 |
| Palantir revenue | 1.5419 | USD_B | FY2021 (Dec) | verified | |
| Palantir revenue | 1.9059 | USD_B | FY2022 (Dec) | verified | |
| Palantir revenue | 2.2250 | USD_B | FY2023 (Dec) | verified | |
| Palantir revenue | 2.8655 | USD_B | FY2024 (Dec) | verified | |
| Palantir revenue | 4.4754 | USD_B | FY2025 (Dec) | verified | +56% — reacceleration, useful for the AI-native narrative |

**MongoDB** — FY ends 31 Jan. CIK 0001441816, entity `MONGODB, INC.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001441816/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| MongoDB revenue | 0.1148 | USD_B | FY2017 (Jan 2017) | verified | Pre-IPO year |
| MongoDB revenue | 0.1660 | USD_B | FY2018 (Jan 2018) | verified | IPO Oct 2017 |
| MongoDB revenue | 0.2670 | USD_B | FY2019 (Jan 2019) | verified | |
| MongoDB revenue | 0.4217 | USD_B | FY2020 (Jan 2020) | verified | SSPL licence change was Oct 2018 |
| MongoDB revenue | 0.5904 | USD_B | FY2021 (Jan 2021) | verified | |
| MongoDB revenue | 0.8738 | USD_B | FY2022 (Jan 2022) | verified | |
| MongoDB revenue | 1.2840 | USD_B | FY2023 (Jan 2023) | verified | Crosses $1B |
| MongoDB revenue | 1.6830 | USD_B | FY2024 (Jan 2024) | verified | |
| MongoDB revenue | 2.0064 | USD_B | FY2025 (Jan 2025) | verified | |
| MongoDB revenue | 2.4638 | USD_B | FY2026 (Jan 2026) | verified | |

**Zoom** — FY ends 31 Jan. CIK 0001585521, entity `Zoom Communications, Inc.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001585521/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Zoom revenue | 0.1515 | USD_B | FY2018 (Jan 2018) | verified | Pre-IPO |
| Zoom revenue | 0.3305 | USD_B | FY2019 (Jan 2019) | verified | IPO Apr 2019 |
| Zoom revenue | 0.6227 | USD_B | FY2020 (Jan 2020) | verified | Last pre-pandemic year |
| Zoom revenue | 2.6514 | USD_B | FY2021 (Jan 2021) | verified | **+326%** — the pandemic step-change |
| Zoom revenue | 4.0999 | USD_B | FY2022 (Jan 2022) | verified | |
| Zoom revenue | 4.3930 | USD_B | FY2023 (Jan 2023) | verified | Growth collapses to ~7% |
| Zoom revenue | 4.5272 | USD_B | FY2024 (Jan 2024) | verified | ~3% |
| Zoom revenue | 4.6654 | USD_B | FY2025 (Jan 2025) | verified | ~3% |
| Zoom revenue | 4.8688 | USD_B | FY2026 (Jan 2026) | verified | The clearest "bundling beat best-of-breed" plateau in the dataset (vs Teams) |

**HubSpot** — calendar FY. CIK 0001404655, entity `HubSpot, Inc.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001404655/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status |
|---|---|---|---|---|
| HubSpot revenue | 0.2710 | USD_B | FY2016 (Dec) | verified |
| HubSpot revenue | 0.3756 | USD_B | FY2017 (Dec) | verified |
| HubSpot revenue | 0.5130 | USD_B | FY2018 (Dec) | verified |
| HubSpot revenue | 0.6749 | USD_B | FY2019 (Dec) | verified |
| HubSpot revenue | 0.8830 | USD_B | FY2020 (Dec) | verified |
| HubSpot revenue | 1.3007 | USD_B | FY2021 (Dec) | verified |
| HubSpot revenue | 1.7310 | USD_B | FY2022 (Dec) | verified |
| HubSpot revenue | 2.1702 | USD_B | FY2023 (Dec) | verified |
| HubSpot revenue | 2.6275 | USD_B | FY2024 (Dec) | verified |
| HubSpot revenue | 3.1313 | USD_B | FY2025 (Dec) | verified |

**Cloudflare** — calendar FY. CIK 0001477333, entity `Cloudflare, Inc.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001477333/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Cloudflare revenue | 0.1349 | USD_B | FY2017 (Dec) | verified | Pre-IPO |
| Cloudflare revenue | 0.1927 | USD_B | FY2018 (Dec) | verified | |
| Cloudflare revenue | 0.2870 | USD_B | FY2019 (Dec) | verified | IPO Sep 2019 |
| Cloudflare revenue | 0.4311 | USD_B | FY2020 (Dec) | verified | |
| Cloudflare revenue | 0.6564 | USD_B | FY2021 (Dec) | verified | |
| Cloudflare revenue | 0.9752 | USD_B | FY2022 (Dec) | verified | |
| Cloudflare revenue | 1.2967 | USD_B | FY2023 (Dec) | verified | Crosses $1B |
| Cloudflare revenue | 1.6696 | USD_B | FY2024 (Dec) | verified | |
| Cloudflare revenue | 2.1679 | USD_B | FY2025 (Dec) | verified | |

**Twilio** — calendar FY. CIK 0001447669, entity `TWILIO INC.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001447669/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Twilio revenue | 0.2773 | USD_B | FY2016 (Dec) | verified | IPO Jun 2016 |
| Twilio revenue | 0.3990 | USD_B | FY2017 (Dec) | verified | |
| Twilio revenue | 0.6501 | USD_B | FY2018 (Dec) | verified | |
| Twilio revenue | 1.1345 | USD_B | FY2019 (Dec) | verified | SendGrid acquisition closed Feb 2019 |
| Twilio revenue | 1.7618 | USD_B | FY2020 (Dec) | verified | |
| Twilio revenue | 2.8418 | USD_B | FY2021 (Dec) | verified | Segment acquisition |
| Twilio revenue | 3.8263 | USD_B | FY2022 (Dec) | verified | |
| Twilio revenue | 4.1539 | USD_B | FY2023 (Dec) | verified | Growth collapses to ~9% — the CPaaS commoditization story |
| Twilio revenue | 4.4580 | USD_B | FY2024 (Dec) | verified | |
| Twilio revenue | 5.0672 | USD_B | FY2025 (Dec) | verified | |

**Autodesk** — FY ends 31 Jan. CIK 0000769397, entity `Autodesk, Inc.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0000769397/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Autodesk revenue | 2.031 | USD_B | FY2017 (Jan 2017) | verified | Mid-transition to subscription |
| Autodesk revenue | 2.057 | USD_B | FY2018 (Jan 2018) | verified | Transition trough — flat year |
| Autodesk revenue | 2.570 | USD_B | FY2019 (Jan 2019) | verified | |
| Autodesk revenue | 3.274 | USD_B | FY2020 (Jan 2020) | verified | |
| Autodesk revenue | 3.790 | USD_B | FY2021 (Jan 2021) | verified | |
| Autodesk revenue | 4.386 | USD_B | FY2022 (Jan 2022) | verified | |
| Autodesk revenue | 5.005 | USD_B | FY2023 (Jan 2023) | verified | |
| Autodesk revenue | 5.497 | USD_B | FY2024 (Jan 2024) | verified | |
| Autodesk revenue | 6.131 | USD_B | FY2025 (Jan 2025) | verified | |
| Autodesk revenue | 7.206 | USD_B | FY2026 (Jan 2026) | verified | |

**Synopsys** — FY ends 31 Oct. CIK 0000883241, entity `SYNOPSYS INC`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0000883241/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Synopsys revenue | 2.725 | USD_B | FY2017 (Oct 2017) | verified | |
| Synopsys revenue | 3.121 | USD_B | FY2018 (Oct 2018) | verified | |
| Synopsys revenue | 3.361 | USD_B | FY2019 (Oct 2019) | verified | |
| Synopsys revenue | 3.685 | USD_B | FY2020 (Oct 2020) | verified | |
| Synopsys revenue | 4.204 | USD_B | FY2021 (Oct 2021) | verified | |
| Synopsys revenue | 5.082 | USD_B | FY2022 (Oct 2022) | verified | |
| Synopsys revenue | 5.843 | USD_B | FY2023 (Oct 2023) | verified | |
| Synopsys revenue | 6.127 | USD_B | FY2024 (Oct 2024) | verified | Ansys deal pending |
| Synopsys revenue | 7.054 | USD_B | FY2025 (Oct 2025) | verified | Latest complete FY (FY2026 ends Oct 2026, after cut-off) |

**Intuit** — FY ends 31 July. CIK 0000896878, entity `INTUIT INC.`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0000896878/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Intuit revenue | 7.679 | USD_B | FY2020 (Jul 2020) | verified | |
| Intuit revenue | 9.633 | USD_B | FY2021 (Jul 2021) | verified | |
| Intuit revenue | 12.726 | USD_B | FY2022 (Jul 2022) | verified | First full year including Mailchimp and Credit Karma |
| Intuit revenue | 14.368 | USD_B | FY2023 (Jul 2023) | verified | |
| Intuit revenue | 16.285 | USD_B | FY2024 (Jul 2024) | verified | |
| Intuit revenue | 18.831 | USD_B | FY2025 (Jul 2025) | verified | |
| Intuit revenue | 21.448 | USD_B | FY2026 (Jul 2026) | verified | Latest complete FY |
| Intuit revenue | — | USD_B | FY2019 (Jul 2019) | unverifiable | The extraction returned 9.633 against the FY2019 period, which duplicates the FY2021 value and is internally inconsistent. **Do not ship FY2019.** Series should start at FY2020 |

**CrowdStrike** — FY ends 31 Jan. CIK 0001535527 (confirmed via EDGAR company search), entity `CrowdStrike Holdings, Inc.`. Concept: `RevenueFromContractWithCustomerIncludingAssessedTax` (the *Including* variant — the *Excluding* variant returns 404 for this filer). URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001535527/us-gaap/RevenueFromContractWithCustomerIncludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| CrowdStrike revenue | 0.1188 | USD_B | FY2018 (Jan 2018) | verified | Pre-IPO |
| CrowdStrike revenue | 0.2498 | USD_B | FY2019 (Jan 2019) | verified | |
| CrowdStrike revenue | 0.4814 | USD_B | FY2020 (Jan 2020) | verified | IPO Jun 2019 |
| CrowdStrike revenue | 0.8744 | USD_B | FY2021 (Jan 2021) | verified | |
| CrowdStrike revenue | 1.4516 | USD_B | FY2022 (Jan 2022) | verified | Crosses $1B |
| CrowdStrike revenue | 2.2412 | USD_B | FY2023 (Jan 2023) | verified | |
| CrowdStrike revenue | 3.0556 | USD_B | FY2024 (Jan 2024) | verified | |
| CrowdStrike revenue | 3.9536 | USD_B | FY2025 (Jan 2025) | verified | FY covering the Jul 2024 outage |
| CrowdStrike revenue | 4.8120 | USD_B | FY2026 (Jan 2026) | verified | |

**Shopify** — calendar FY, reports in USD. CIK 0001594805, entity `Shopify Inc.`. Filed on **Form 40-F** (Canadian MJDS filer), not 10-K. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001594805/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Shopify revenue | 0.6733 | USD_B | FY2017 (Dec) | verified | Form 40-F |
| Shopify revenue | 1.0732 | USD_B | FY2018 (Dec) | verified | Crosses $1B |
| Shopify revenue | 1.5782 | USD_B | FY2019 (Dec) | verified | |
| Shopify revenue | 2.9295 | USD_B | FY2020 (Dec) | verified | Pandemic e-commerce surge, +86% |
| Shopify revenue | 4.6119 | USD_B | FY2021 (Dec) | verified | |
| Shopify revenue | 5.6000 | USD_B | FY2022 (Dec) | verified | Growth collapses to 21% |
| Shopify revenue | 7.0600 | USD_B | FY2023 (Dec) | verified | Latest annual period in the XBRL record |
| Shopify revenue | — | USD_B | FY2024, FY2025 | unverifiable | Queried the same concept filtering for end dates 2024-12-31 / 2025-12-31: **no annual entries exist** in the XBRL record (most recent is FY2023, filed 2024-02-13). Not chased further. Ship FY2017–FY2023 only |

**SAP** — calendar FY, IFRS, **reports in EUR**. CIK 0001000184, entity `SAP SE`, Form 20-F, concept `ifrs-full:Revenue`. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001000184/ifrs-full/Revenue.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| SAP revenue | 20.793 | **EUR_B** | FY2015 (Dec) | verified | |
| SAP revenue | 22.062 | **EUR_B** | FY2016 (Dec) | verified | |
| SAP revenue | 23.461 | **EUR_B** | FY2017 (Dec) | verified | |
| SAP revenue | 24.708 | **EUR_B** | FY2018 (Dec) | verified | |
| SAP revenue | 27.553 | **EUR_B** | FY2019 (Dec) | verified | |
| SAP revenue | 27.338 | **EUR_B** | FY2020 (Dec) | verified | |
| SAP revenue | 26.953 | **EUR_B** | FY2021 (Dec) | verified | Cloud-transition dip |
| SAP revenue | 29.520 | **EUR_B** | FY2022 (Dec) | verified | |
| SAP revenue | 31.207 | **EUR_B** | FY2023 (Dec) | verified | |
| SAP revenue | 34.176 | **EUR_B** | FY2024 (Dec) | verified | |
| SAP revenue | 36.800 | **EUR_B** | FY2025 (Dec) | verified | Value is round to the nearest EUR 0.1B, unlike the rest of the series — likely a rounded presentation fact. Treat the decimal as approximate |

> **Currency warning for the data-engineer.** The `Unit` enum in `data/types.ts` has no EUR member. These are EUR, not USD. Do **not** silently label them `USD_B`. Options, in order of preference: (a) add a `EUR_B` unit to the contract and have the chart convert or label it; (b) ship SAP revenue as `estimated` with a USD conversion and a `note` naming the FX rate and its source — but **no FX rate was verified in this session**, so option (b) is not currently available; (c) omit SAP's revenue series and keep SAP in the Atlas for market membership, archetype and events only. **Recommendation: (c) unless the contract is extended.**

### 1.6 AWS segment revenue — calendar FY

AWS segment revenue is **not** retrievable from the XBRL `companyconcept` API: segment facts carry XBRL dimensions that the endpoint strips, so only consolidated Amazon revenue is returned. These figures therefore come from the 10-K "Results of Operations — Net Sales" table and from quarterly earnings releases.

| Item | Value | Unit | Year (FY end) | Source title | Publisher | URL | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| AWS segment net sales | 4.644 | USD_B | FY2014 (Dec) | Amazon Form 10-K FY2016, net sales by segment | Amazon / SEC | https://www.sec.gov/Archives/edgar/data/1018724/000101872417000011/amzn-20161231x10k.htm | verified | reliability: secondary — figure appeared in a search result that cited the FY2016 10-K; the filing itself was not re-read |
| AWS segment net sales | 7.880 | USD_B | FY2015 (Dec) | Amazon Form 10-K FY2016, net sales by segment | Amazon / SEC | https://www.sec.gov/Archives/edgar/data/1018724/000101872417000011/amzn-20161231x10k.htm | verified | reliability: secondary, same caveat |
| AWS segment net sales | 12.219 | USD_B | FY2016 (Dec) | Amazon Form 10-K FY2018, net sales by segment | Amazon / SEC | https://www.sec.gov/Archives/edgar/data/1018724/000101872419000004/amzn-20181231x10k.htm | verified | **primary** — read directly from the fetched filing |
| AWS segment net sales | 17.459 | USD_B | FY2017 (Dec) | Amazon Form 10-K FY2018 | Amazon / SEC | https://www.sec.gov/Archives/edgar/data/1018724/000101872419000004/amzn-20181231x10k.htm | verified | **primary** |
| AWS segment net sales | 25.655 | USD_B | FY2018 (Dec) | Amazon Form 10-K FY2018 | Amazon / SEC | https://www.sec.gov/Archives/edgar/data/1018724/000101872419000004/amzn-20181231x10k.htm | verified | **primary** |
| AWS segment net sales | 35.026 | USD_B | FY2019 (Dec) | Amazon Form 10-K FY2019 | Amazon / SEC | https://www.sec.gov/Archives/edgar/data/1018724/000101872420000004/amzn-20191231x10k.htm | verified | reliability: secondary — search result quoting the FY2019 10-K ("+37% vs $25,655M in 2018", internally consistent with the FY2018 filing above) |
| AWS segment net sales | 45.370 | USD_B | FY2020 (Dec) | Amazon Form 10-K FY2021/FY2022 segment information | Amazon / SEC | https://www.sec.gov/Archives/edgar/data/1018724/000101872422000005/Financial_Report.xlsx | verified | reliability: secondary — search result citing Amazon's filed segment tables |
| AWS segment net sales | 62.202 | USD_B | FY2021 (Dec) | Amazon Form 10-K FY2021/FY2022 segment information | Amazon / SEC | https://www.sec.gov/Archives/edgar/data/1018724/000101872422000005/Financial_Report.xlsx | verified | reliability: secondary |
| AWS segment net sales | 80.096 | USD_B | FY2022 (Dec) | Amazon Form 10-K FY2022 segment information | Amazon / SEC | https://www.sec.gov/Archives/edgar/data/1018724/000101872423000004/Financial_Report.xlsx | verified | reliability: secondary |
| AWS segment net sales | 90.757 | USD_B | FY2023 (Dec) | Amazon Form 10-K FY2022/FY2023 segment information | Amazon / SEC | https://www.sec.gov/Archives/edgar/data/1018724/000101872423000004/Financial_Report.xlsx | verified | reliability: secondary. Cross-checks against the Q4 2024 release: "$107.6B, +19%" ⇒ FY2023 ≈ $90.4B |
| AWS segment net sales | 107.6 | USD_B | FY2024 (Dec) | Amazon.com Announces Fourth Quarter Results (8-K Ex-99.1) | Amazon / SEC | https://www.sec.gov/Archives/edgar/data/1018724/000101872425000002/amzn-20241231xex991.htm | verified | reliability: secondary — search result quoting the release verbatim: "AWS segment sales increased 19% year-over-year to $107.6 billion" |
| AWS segment net sales | 128.7 | USD_B | FY2025 (Dec) | Amazon Q4 2025 earnings release | Amazon | https://aboutamazon.com/news/company-news/amazon-earnings-q4-2025-report | verified | **primary** — fetched: "AWS segment sales increased 20% year-over-year to $128.7 billion". Cross-checks against FY2024 $107.6B (+19.6%) |

**Series quality note.** Twelve consecutive years, 2014–2025, with no gaps. Three points are primary-fetched and nine are search-quoted from filings. The series is internally consistent at every year-over-year junction where a growth rate was also quoted, which is a meaningful integrity check. The data-engineer may ship all twelve as `reported`; the sourceIds differ by point.

### 1.9 Google Cloud segment revenue — calendar FY

| Item | Value | Unit | Year (FY end) | Source title | Publisher | URL | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Google Cloud revenue | 8.9 | USD_B | FY2019 (Dec) | Alphabet Form 10-K FY2021 | Alphabet / SEC | https://www.sec.gov/Archives/edgar/data/1652044/000165204422000019/goog-20211231.htm | verified | reliability: secondary — search result citing the 10-K. Precision: one decimal only |
| Google Cloud revenue | 13.1 | USD_B | FY2020 (Dec) | Alphabet Form 10-K FY2021 | Alphabet / SEC | https://www.sec.gov/Archives/edgar/data/1652044/000165204422000019/goog-20211231.htm | verified | reliability: secondary |
| Google Cloud revenue | 19.2 | USD_B | FY2021 (Dec) | Alphabet Form 10-K FY2021 | Alphabet / SEC | https://www.sec.gov/Archives/edgar/data/1652044/000165204422000019/goog-20211231.htm | verified | reliability: secondary |
| Google Cloud revenue | 26.280 | USD_B | FY2022 (Dec) | Alphabet Form 10-K FY2023, segment revenues | Alphabet / SEC | https://www.sec.gov/Archives/edgar/data/1652044/000165204424000022/goog-20231231.htm | verified | reliability: secondary — search result quoting the exact filed figure ($26,280M) |
| Google Cloud revenue | 33.088 | USD_B | FY2023 (Dec) | Alphabet Form 10-K FY2023, segment revenues | Alphabet / SEC | https://www.sec.gov/Archives/edgar/data/1652044/000165204424000022/goog-20231231.htm | verified | reliability: secondary — exact filed figure ($33,088M) |
| Google Cloud revenue | ~43.2 | USD_B | FY2024 (Dec) | — | — | — | conflict | One search result gave $43.23B; a second said Google Cloud revenue "increased $10.1B from 2023 to 2024", which implies $43.19B — consistent. But a WebFetch of the Q4 2024 8-K exhibit returned $47,798M with a visibly wrong arithmetic derivation (it summed one quarter twice) and also restated FY2023 as $36,768M, contradicting the filed $33,088M. **Do not ship as `reported`.** Ship as `estimated`, low 43.0 / high 43.3, or omit |
| Google Cloud revenue | — | USD_B | FY2025 (Dec) | — | — | — | conflict | One search result gave $58.71B; another said FY2025 Cloud revenues grew 48% (⇒ ~$64B) and that Cloud exited 2025 "at an annual run rate of over $70 billion". These cannot all be full-year revenue. Q4 2025 Google Cloud of $17.66B was quoted consistently in two results. **Omit FY2025 or ship the Q4 figure explicitly labelled as a quarter** |

**Method failure to record.** Two attempts to read Alphabet segment tables directly (the FY2023 10-K HTML and the Q4 2025 earnings-release PDF) failed: the 10-K HTML is large enough that the fetch was truncated before Item 8, and the PDF was returned as raw binary. The one Q4 8-K exhibit that did parse produced an arithmetically wrong answer. Treat every Google Cloud number above FY2023 as unverified.

### 1.10 Pre-acquisition revenue series (for the lineage graph and "casualties" narrative)

All from SEC XBRL `companyconcept`; entity name confirmed in each response.

**Red Hat** — FY ends end of February; FY label = calendar year of the February end. CIK 0001087423, entity `RED HAT INC`, concept `Revenues`. Acquired by IBM, closed 9 July 2019. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001087423/us-gaap/Revenues.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Red Hat revenue | 0.6526 | USD_B | FY2009 (Feb 2009) | verified | |
| Red Hat revenue | 0.7482 | USD_B | FY2010 (Feb 2010) | verified | |
| Red Hat revenue | 0.9093 | USD_B | FY2011 (Feb 2011) | verified | |
| Red Hat revenue | 1.1331 | USD_B | FY2012 (Feb 2012) | verified | First open-source company past $1B |
| Red Hat revenue | 1.3288 | USD_B | FY2013 (Feb 2013) | verified | |
| Red Hat revenue | 1.5346 | USD_B | FY2014 (Feb 2014) | verified | |
| Red Hat revenue | 1.7895 | USD_B | FY2015 (Feb 2015) | verified | |
| Red Hat revenue | 2.0522 | USD_B | FY2016 (Feb 2016) | verified | |
| Red Hat revenue | 2.4118 | USD_B | FY2017 (Feb 2017) | verified | |
| Red Hat revenue | 2.9205 | USD_B | FY2018 (Feb 2018) | verified | Last full FY in the XBRL record before the IBM deal was announced (Oct 2018) |
| Red Hat revenue | — | USD_B | FY2019 (Feb 2019) | unverifiable | Not present in the returned annual set; not chased. Omit |

**VMware** — FY was calendar through 2016, then changed to end on the Friday nearest 31 January; FY label = calendar year of the end date. CIK 0001124610, entity `VMWARE LLC`. Acquired by Broadcom, closed 22 November 2023. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001124610/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| VMware revenue | 7.073 | USD_B | FY2016 (Dec 2016) | verified | Calendar year — note the FY-convention change immediately after |
| VMware revenue | 7.862 | USD_B | FY2018 (2 Feb 2018) | verified | |
| VMware revenue | 8.974 | USD_B | FY2019 (1 Feb 2019) | verified | |
| VMware revenue | 10.811 | USD_B | FY2020 (31 Jan 2020) | verified | Crosses $10B |
| VMware revenue | 11.767 | USD_B | FY2021 (29 Jan 2021) | verified | |
| VMware revenue | 12.851 | USD_B | FY2022 (28 Jan 2022) | verified | Broadcom deal announced May 2022 |
| VMware revenue | 13.350 | USD_B | FY2023 (3 Feb 2023) | verified | Last full FY as an independent company |

**Splunk** — FY ends 31 Jan. CIK 0001353283, entity `Splunk Inc.`. Acquired by Cisco, closed 18 March 2024. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001353283/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Splunk revenue | 0.9436 | USD_B | FY2017 (Jan 2017) | verified | |
| Splunk revenue | 1.3091 | USD_B | FY2018 (Jan 2018) | verified | |
| Splunk revenue | 1.8030 | USD_B | FY2019 (Jan 2019) | verified | |
| Splunk revenue | 2.3589 | USD_B | FY2020 (Jan 2020) | verified | |
| Splunk revenue | 2.2294 | USD_B | FY2021 (Jan 2021) | verified | **Revenue declines** — the perpetual-to-cloud transition trough, a second worked example alongside Adobe and Autodesk |
| Splunk revenue | 2.6737 | USD_B | FY2022 (Jan 2022) | verified | |
| Splunk revenue | 3.6537 | USD_B | FY2023 (Jan 2023) | verified | Last full FY before the Cisco deal was announced (Sep 2023) |

**Slack** — FY ends 31 Jan. CIK 0001764925, entity `Slack Technologies, Inc.`. Acquired by Salesforce, closed 21 July 2021. URL: https://data.sec.gov/api/xbrl/companyconcept/CIK0001764925/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json

| Item | Value | Unit | Year (FY end) | Status | Notes |
|---|---|---|---|---|---|
| Slack revenue | 0.2205 | USD_B | FY2018 (Jan 2018) | verified | Pre-IPO, from the direct-listing S-1 |
| Slack revenue | 0.4006 | USD_B | FY2019 (Jan 2019) | verified | |
| Slack revenue | 0.6304 | USD_B | FY2020 (Jan 2020) | verified | Direct listing Jun 2019 |
| Slack revenue | 0.9026 | USD_B | FY2021 (Jan 2021) | verified | Last full FY as an independent company. Directly comparable to the Zoom series for the "Slack vs Teams" case study (§8 Case 7) |

### 1.11 Companies attempted and not obtained

| Item | Status | Notes — queries tried |
|---|---|---|
| Cadence Design Systems revenue series | unverifiable | CIK 0000813672 (entity name `CADENCE DESIGN SYSTEMS, INC.` confirmed). `us-gaap/Revenues` → HTTP 404. `us-gaap/RevenueFromContractWithCustomerIncludingAssessedTax` → HTTP 404. `us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax` → concept exists but `"units":{"USD":{}}` is **empty**, i.e. Cadence tags revenue under a filer-specific extension element. Would need the 10-K itself. **Drop Cadence's revenue series**; keep Cadence as a company with markets, archetype and events only |
| Microsoft FY1995–FY2007 revenue | unverifiable | SEC XBRL structured data does not extend before ~FY2007. Not chased into pre-2007 10-K text this session |
| Oracle FY1990–FY2008 revenue | unverifiable | Same reason |
| Salesforce FY2005–FY2008 revenue | unverifiable | Same reason |
| Adobe pre-FY2007 revenue | unverifiable | Same reason |
| Oracle FY2010, Salesforce FY2010, Red Hat FY2019 | unverifiable | Individual gaps in the XBRL annual record; see the per-company tables |

---

## 2. AI-native companies — press-reported run rate, **not** GAAP revenue

Every figure in this table is an **annualised revenue run rate** (typically the latest month multiplied by twelve) reported by press from private-company briefings. It is not audited, not GAAP, not comparable to the fiscal-year revenue in §1, and it systematically overstates trailing revenue during hyper-growth. The UI must label these distinctly and must never plot them on the same axis as GAAP revenue without a visible marker.

| Item | Value | Unit | Year (as-of) | Source title | Publisher | URL | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Anthropic annualised run rate | 65 | USD_B | as of Jul 2026 | Anthropic tells investors annualized revenue run rate climbed to $65 billion in July | CNBC | https://www.cnbc.com/2026/08/17/anthropic-says-annualized-revenue-climbed-to-65-billion-in-july.html | verified | Already S16/S17 in the bibliography. **Run rate, not revenue.** Per §0.3, Anthropic figures are third-party only — satisfied |
| OpenAI annualised run rate | 20 | USD_B | as of late 2025 | OpenAI CFO says annualized revenue crosses $20 billion in 2025 | Reuters (via Yahoo Finance) | https://finance.yahoo.com/news/openai-cfo-says-annualized-revenue-173519097.html | verified | reliability: secondary. Attributed to OpenAI's CFO |
| OpenAI annualised run rate | 25 | USD_B | as of Mar 2026 | OpenAI revenue reporting (Reuters, cited in search results) | Reuters | https://sacra.com/c/openai/ | verified | reliability: secondary. "more than $25 billion annualized by March 2026" |
| OpenAI annualised run rate | 40 | USD_B | as of Aug 2026 | OpenAI's Revenue Run Rate Tops $40 Billion Ahead of IPO | Bloomberg | https://www.bloomberg.com/news/articles/2026-08-13/openai-s-revenue-run-rate-tops-40-billion-ahead-of-ipo | verified | reliability: secondary — headline figure returned in search; the article body is paywalled and was not read. Ship as `estimated` |
| Databricks annualised run rate | 5.4 | USD_B | as of Q4 FY2026 (Feb 2026) | Databricks Grows >65% YoY, Surpasses $5.4 Billion Revenue Run-Rate | Databricks / PR Newswire | https://www.prnewswire.com/news-releases/databricks-grows-65-yoy-surpasses-5-4-billion-revenue-run-rate-doubles-down-on-lakebase-and-genie-302682674.html | verified | Company press release — **primary for a run-rate claim**, still not GAAP |
| Databricks annualised run rate | 7.0 | USD_B | as of Q2 FY2027 (Aug 2026) | Databricks Grows >80% YoY, Surpasses $7B Revenue Run-Rate | Databricks | https://www.databricks.com/company/newsroom/press-releases/databricks-grows-80-yoy-surpasses-7b-revenue-run-rate-scales | verified | Company press release. A second result put it at "$6.9 billion annualized" (CNBC, Jun 2026) — the $6.9B and $7B figures are two different as-of dates, not a conflict |
| Anysphere / Cursor annualised B2B revenue | ~2.6 | USD_B | as of Jun 2026 | SpaceX agrees to acquire Cursor parent Anysphere for $60B | Quartz (citing Reuters) | https://qz.com/spacex-buying-cursor-anysphere-60-billion-deal-061626 | verified | Already S21. Used in research §6.8 to model a ~23× multiple |

---

## 3. Deal values and dates (research.md §6.8 and §9.4)

All values are **as stated in the completion announcement**. Where a deal has both an announced and a completed value, the completed one is recorded. `Year` is the **completion** year unless noted.

| Item | Value | Unit | Year (completed) | Source title | Publisher | URL | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Oracle–PeopleSoft | 10.3 | USD_B | Jan 2005 | Oracle to acquire PeopleSoft for $10.3 billion | NBC News | https://www.nbcnews.com/news/amp/wbna6705516 | verified | reliability: secondary. Hostile takeover closed Jan 2005. Matches research.md |
| Oracle–Siebel | 5.85 | USD_B | Jan 2006 (announced Sep 2005) | Oracle to buy Siebel for $5.85 billion | NBC News | https://www.nbcnews.com/news/amp/wbna9310938 | verified | reliability: secondary. research.md's "2006" is the **completion** year; the announcement was Sep 2005. Both are correct — record `year: 2006, month: 1` with a note |
| Oracle–BEA Systems | 8.5 | USD_B | 29 Apr 2008 (announced 16 Jan 2008) | Oracle Corp. 8-K, Exhibit 99.1 (BEA acquisition) | Oracle / SEC | https://www.sec.gov/Archives/edgar/data/0001341439/000119312508094248/dex991.htm | verified | reliability: secondary — the SEC 8-K exhibit was returned as a search result for the deal; the $8.5B figure was quoted from contemporaneous coverage of the same announcement. **Completion date 29 Apr 2008 newly established** — research.md says only "2008" |
| Oracle–Sun Microsystems | 7.4 | USD_B | 27 Jan 2010 (announced 20 Apr 2009) | Oracle completes acquisition of Sun Microsystems | Phys.org | https://phys.org/news/2010-01-oracle-acquisition-sun-microsystems.html | verified | reliability: secondary. research.md's "2010" is the completion year — correct. **Completion date 27 Jan 2010 newly established** |
| Oracle–NetSuite | 9.3 | USD_B | 7 Nov 2016 (announced 28 Jul 2016) | Oracle Buys NetSuite | Oracle | https://www.oracle.com/corporate/pressrelease/oracle-buys-netsuite-072816.html | verified | $109.00/share cash. Tender offer closed 7 Nov 2016. **Completion date newly established** |
| Microsoft–LinkedIn | 26.2 | USD_B | 8 Dec 2016 (announced 13 Jun 2016) | Microsoft to acquire LinkedIn | Microsoft | https://news.microsoft.com/source/2016/06/13/microsoft-to-acquire-linkedin/ | verified | $196.00/share all-cash, "inclusive of LinkedIn's net cash". Closed after final EC approval. **Completion date newly established** |
| SAP–Business Objects | 6.8 | USD_B | Jan–Feb 2008 | Update: SAP to buy Business Objects in $6.8B deal | Computerworld | https://www.computerworld.com/article/1585214/update-sap-to-buy-business-objects-in-6-8b-deal.html | verified | reliability: secondary. **Newly established value** — research.md §6.8 gives no figure. Note the underlying currency: SAP's own disclosure put the total cost at "slightly exceeded €4.8 billion"; $6.8B is the USD-equivalent headline. Record as `estimated` because the USD figure is an FX-dependent restatement |
| SAP–SuccessFactors | 3.4 | USD_B | 21 Feb 2012 (announced 3 Dec 2011) | Joint Press Release (SAP / SuccessFactors) | SAP / SEC | https://www.sec.gov/Archives/edgar/data/1000184/000119312511329385/d265222dex991.htm | verified | $40.00/share cash, "enterprise value of approximately $3.4 billion". **Newly established value** — research.md §6.8 gives no figure |
| Salesforce–Tableau | 15.7 | USD_B | Q3 FY2020 (Oct 2019); announced 10 Jun 2019 | Salesforce Signs Definitive Agreement to Acquire Tableau | Salesforce | https://www.salesforce.com/news/press-releases/2019/06/10/salesforce-signs-definitive-agreement-to-acquire-tableau/ | conflict | All-stock, 1.103 Salesforce shares per Tableau share. Salesforce's own release says **enterprise value $15.7B (net of cash)**; CNBC's same-day story headlined **$15.3B** (equity value). research.md's $15.7B matches the primary source — **keep it**, and note the alternative in the event's `impact` text |
| IBM–Red Hat | 34 | USD_B | 9 Jul 2019 (announced 28 Oct 2018) | IBM Closes Landmark Acquisition of Red Hat for $34 Billion | Red Hat / IBM | https://www.redhat.com/en/about/press-releases/ibm-closes-landmark-acquisition-red-hat-34-billion-defines-open-hybrid-cloud-future | verified | $190.00/share cash, "total equity value of approximately $34 billion". **Resolves research.md §9.4 item 3.** Matches research.md |
| Salesforce–Slack | 27.7 | USD_B | 21 Jul 2021 (announced Dec 2020) | Salesforce Completes Acquisition of Slack | Salesforce | https://www.salesforce.com/news/press-releases/2021/07/21/salesforce-slack-deal-close/ | verified | **Completion date 21 Jul 2021 newly established.** Matches research.md |
| Microsoft–Nuance | 19.7 | USD_B | 4 Mar 2022 (announced Apr 2021) | Microsoft completes acquisition of Nuance | Microsoft | https://news.microsoft.com/source/2022/03/04/microsoft-completes-acquisition-of-nuance-ushering-in-new-era-of-outcomes-based-ai/ | verified | research.md dates this "2022" — correct (4 Mar 2022). **Completion date newly established** |
| Oracle–Cerner | 28.3 | USD_B | 8 Jun 2022 | Oracle Completes Acquisition of Cerner | Oracle | https://www.oracle.com/news/announcement/oracle-completes-acquisition-of-cerner-2022-06-07/ | verified | $95.00/share all-cash tender offer, "approximately $28.3 billion in equity value". Tender results announced 7 Jun; deal closed 8 Jun 2022. **Resolves research.md §9.4 item 2.** Matches research.md |
| Broadcom–VMware | ~69 | USD_B | 22 Nov 2023 (announced 26 May 2022) | VMware, Inc. Form 8-K, Exhibit 99.1 | VMware / SEC | https://www.sec.gov/Archives/edgar/data/1124610/000112461023000025/exhibit991.htm | verified | reliability: secondary for the split. Structure: ~$61B in cash and stock plus ~$8B of assumed debt ⇒ ~$69B total. research.md's "~$69B" is right; the tilde matters and should be preserved (ship `estimated`, low 61 / high 69, or `reported` 69 with a note on the debt component) |
| Microsoft–Activision Blizzard | 68.7 | USD_B | 13 Oct 2023 (announced 18 Jan 2022) | Microsoft's $68.7B Activision acquisition clears final hurdle as UK approves restructured deal | TechCrunch | https://techcrunch.com/2023/10/12/microsofts-68-7b-activision-acquisition-clears-final-hurdle-as-uk-approves-restructured-deal/ | conflict | reliability: secondary. The announced/headline price is $68.7B and matches research.md. One search result put "total cost" at $75.4B (a different basis, probably including cash acquired / equity awards). **Keep $68.7B**, note the alternative. Completion 13 Oct 2023, after the CMA accepted the Ubisoft cloud-rights remedy |
| Cisco–Splunk | 28 | USD_B | 18 Mar 2024 (announced Sep 2023) | Cisco Completes Acquisition of Splunk | Cisco | https://investor.cisco.com/news/news-details/2024/Cisco-Completes-Acquisition-of-Splunk/default.aspx | verified | $157.00/share cash, "approximately $28 billion in equity value". Matches research.md. **Completion date 18 Mar 2024 newly established** |
| IBM–HashiCorp | 6.4 | USD_B | 27–28 Feb 2025 (announced 24 Apr 2024) | IBM Completes Acquisition of HashiCorp, Creates Comprehensive, End-to-End Hybrid Cloud Platform | IBM / PR Newswire | https://www.prnewswire.com/news-releases/ibm-completes-acquisition-of-hashicorp-creates-comprehensive-end-to-end-hybrid-cloud-platform-302387460.html | verified | $35.00/share cash, **enterprise value $6.4 billion**. **Resolves research.md §9.4 item 4.** Sources give the completion as 27 Feb (SiliconANGLE) and 28 Feb (PR Newswire) 2025 — a one-day announcement/close discrepancy; use **Feb 2025** and do not assert a day |
| Synopsys–Ansys | 35 | USD_B | 17 Jul 2025 (announced 16 Jan 2024) | Synopsys Completes Acquisition of Ansys | Synopsys | https://investor.synopsys.com/news/news-details/2025/Synopsys-Completes-Acquisition-of-Ansys/default.aspx | verified | **Newly established value ($35B) and completion date (17 Jul 2025)** — research.md §6.8 gives only "Synopsys–Ansys (2025)". 18 months to close; required China and EU approvals; FTC consent order (C-4820) |
| Google–Wiz | 32 | USD_B | Mar 2026 | — | — | — | verified (pre-existing) | Already S20 ✓ in research.md; not re-verified this session |
| SpaceX–Anysphere (Cursor) | 60 | USD_B | announced 16 Jun 2026 | — | — | — | verified (pre-existing) | Already S21 ✓; all-stock, expected close Q3 2026. Status should be `announced`, not `completed` |
| Adobe–Figma termination fee | 1 | USD_B | Dec 2023 | — | — | — | verified (pre-existing) | Already S14 ✓; deal `abandoned` |
| Salesforce–Informatica | — | — | 2025 | — | — | — | verified (pre-existing) | Already S12 ✓; value not verified this session |

**Deals in §6.8 not verified this session:** the PE take-private examples (Qualtrics, Anaplan, Coupa, Zendesk). research.md gives them no values, so nothing needs downgrading — but if the data-engineer wants them as events, they need `dealValue: undefined`.

---

## 4. Dates (research.md §9.3)

| Item | Value | Unit | Year | Source title | Publisher | URL | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| NIST FIPS 203, 204, 205 published | 13 Aug 2024 | date | 2024 | Announcing Issuance of Federal Information Processing Standards FIPS 203, FIPS 204, and FIPS 205 | Federal Register / NIST | https://www.federalregister.gov/documents/2024/08/14/2024-17956/announcing-issuance-of-federal-information-processing-standards-fips-fips-203-module-lattice-based | verified | **Primary (regulator).** Published 13 Aug 2024; the Federal Register notice is dated 14 Aug 2024, which is also the **effective** date. FIPS 203 = ML-KEM, FIPS 204 = ML-DSA, FIPS 205 = SLH-DSA. Concluded an 8-year process begun in 2016. If the Atlas needs one date, use **13 Aug 2024** (publication) and note the 14 Aug effective date |
| MCP governance transition | 9 Dec 2025 | date | 2025 | MCP joins the Agentic AI Foundation | Model Context Protocol (official project blog) | https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/ | verified | **Primary (project).** Anthropic donated MCP to the **Agentic AI Foundation (AAIF)**, a directed fund under the Linux Foundation, co-founded by Anthropic, Block and OpenAI, with support from Google, Microsoft, AWS, Cloudflare and Bloomberg. MCP is a founding project and retains autonomy over technical direction; the AAIF board handles budget, membership and new-project approval |
| MCP donation — Anthropic's own announcement | 9 Dec 2025 | date | 2025 | Donating the Model Context Protocol and establishing of the Agentic AI Foundation | Anthropic | https://anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation | verified | Second source for the same date. Per §0.3, prefer the neutral project blog as the primary citation and use this only as corroboration |

**Naming note for the data-engineer:** the destination is the *Agentic AI Foundation*, a Linux Foundation directed fund — **not** "the Linux Foundation" directly. Narrative copy should say so, because the distinction (directed fund vs. full LF project) is exactly the kind of governance detail the license-change chapter turns on.

---

## 5. Synergy Research cloud infrastructure share series (flagship)

Scope for every row: **cloud infrastructure services = IaaS + PaaS + hosted private cloud**, worldwide, quarterly. Shares are Synergy estimates, so `confidence: "estimated"` throughout — Synergy is an analyst firm, not a filer. `reliability: "analyst"` maps to `kind: "analyst"`.

### 5.1 Market size by quarter

| Item | Value | Unit | Period | Source | URL | Status | Notes |
|---|---|---|---|---|---|---|---|
| Cloud infra revenue | 3.7 | USD_B | Q2 2014 | Synergy (S08) | https://srgresearch.com/articles/microsoft-and-ibm-chase-amazon-while-google-falls-pace | verified | AWS YoY growth 49% |
| Cloud infra revenue | 23 | USD_B | FY2015 | Synergy via Telecompaper | https://www.telecompaper.com/news/aws-still-dominates-cloud-services-with-31-share-in-q4--1126301 | verified | "grew 52 percent to over USD 23 billion in 2015"; quarterly "approaching the USD 7 billion milestone" |
| Cloud infra revenue | ~11 | USD_B | Q2 2017 | Synergy (S04) | https://www.srgresearch.com/articles/leading-cloud-providers-continue-run-away-market | verified | Growth "comfortably over 40%" |
| Cloud infra revenue | ~23 | USD_B | Q2 2019 | Synergy via The Register (S05) | https://www.theregister.com/2019/07/26/half_of_all_public_cloud_money_goes_to_amazon_and_microsoft/ | verified | |
| Cloud infra revenue | 42 | USD_B | Q2 2021 | Synergy via TechCrunch (S06) | https://techcrunch.com/?p=2184490 | verified | +39% YoY |
| Cloud infra revenue | 50 | USD_B | Q4 2021 | Synergy via TechCrunch (S07) | https://techcrunch.com/?p=2266714 | verified | FY2021 total $178B |
| Cloud infra revenue | 178 | USD_B | FY2021 | Synergy via TechCrunch (S07) | https://techcrunch.com/?p=2266714 | verified | |
| Cloud infra revenue | 61.6 | USD_B | Q4 2022 | Synergy, "Cloud Spending Growth Rate Slows But Q4 Still Up By $10 Billion from 2021" | https://www.srgresearch.com/articles/cloud-spending-growth-rate-slows-but-q4-still-up-by-10-billion-from-2021-microsoft-gains-market-share | verified | reliability: secondary (search result quoting the Synergy release) |
| Cloud infra revenue | 73.7 | USD_B | Q4 2023 | Synergy (via search) | https://www.srgresearch.com/articles/cloud-market-jumped-to-330-billion-in-2024-genai-is-now-driving-half-of-the-growth | verified | "+20% year-on-year". Cross-checks with Q4 2024 (+$17B / +22%) |
| Cloud infra revenue | 91 | USD_B | Q4 2024 | Synergy, "Cloud Market Jumped to $330 billion in 2024" (6 Feb 2025) | https://www.srgresearch.com/articles/cloud-market-jumped-to-330-billion-in-2024-genai-is-now-driving-half-of-the-growth | verified | **primary (fetched)** |
| Cloud infra revenue | 330 | USD_B | FY2024 | Synergy, same article | https://www.srgresearch.com/articles/cloud-market-jumped-to-330-billion-in-2024-genai-is-now-driving-half-of-the-growth | verified | **primary (fetched)**. +$60B vs 2023 |
| Cloud infra revenue | 107 | USD_B | Q3 2025 | Synergy, "Cloud Market Share Trends — Big Three Together Hold 63%" (19 Nov 2025) | https://www.srgresearch.com/articles/cloud-market-share-trends-big-three-together-hold-63-while-oracle-and-the-neoclouds-inch-higher | verified | **primary (fetched)**. "up from $68 billion eight quarters ago" |
| Cloud infra revenue | 119.1 | USD_B | Q4 2025 | Synergy, "GenAI Helps Drive Quarterly Cloud Revenues to $119 Billion" (5 Feb 2026) | https://www.srgresearch.com/articles/genai-helps-drive-quarterly-cloud-revenues-to-119-billion-as-growth-rate-jumped-yet-again-in-q4 | verified | **primary (fetched)** |
| Cloud infra revenue | 419 | USD_B | FY2025 | Synergy, same article | https://www.srgresearch.com/articles/genai-helps-drive-quarterly-cloud-revenues-to-119-billion-as-growth-rate-jumped-yet-again-in-q4 | verified | **primary (fetched)** |
| Cloud infra revenue | 128.6 | USD_B | Q1 2026 | Synergy, "Cloud Market Annual Revenue Run Rate Topped Half a Trillion Dollars in Q1" (29 Apr 2026) | https://www.srgresearch.com/articles/cloud-market-annual-revenue-run-rate-topped-half-a-trillion-dollars-in-q1-as-growth-surge-continues | verified | **primary (fetched)**. TTM $455B; "fifteen times larger than a decade ago", +35% annually |
| Cloud infra revenue | 143.4 | USD_B | Q2 2026 | Synergy (S03) | https://www.srgresearch.com/articles/q2-cloud-market-passes-143-billion-highest-growth-rate-in-eight-years | verified | **primary (fetched)**. +43% YoY, highest in eight years; TTM $500B; GenAI-specific cloud services +165% YoY |

### 5.2 Vendor share by quarter — the flagship `sharesByYear` series

| Period | AWS | Microsoft | Google | Alibaba | IBM | Other | Source | Status |
|---|---|---|---|---|---|---|---|---|
| Q2 2014 | — | — | — | — | — | — | S08 | unverifiable — the article is qualitative only ("AWS in a league of its own", "no longer bigger than its closest four competitors combined"); **no percentages are given**. Do not invent them |
| Q4 2015 | 31 | — | — | — | — | — | Telecompaper (Synergy) | verified (AWS only). Headline "AWS still dominates cloud services with 31% share in Q4". Microsoft/IBM/Google percentages not surfaced — **omit, do not estimate** |
| Q2 2017 | 34 | 11 | 5 | — | 8 | 42 (residual) | S04 | verified. Alibaba named 4th in IaaS but no % given. "Other" is a derived residual — mark `modeled` with the note "100 − Σ named shares" |
| Q2 2019 | 33 | 16 | 8 | 5 | 6 | 32 (residual) | S05 | verified. Also: Salesforce, Oracle, Tencent, Rackspace "2 per cent each" |
| Q2 2021 | 33 | 20 | 10 | 6 | 4 | 27 (residual) | S06 | verified. Canalys' rival estimate for the same quarter (Amazon 31 / Microsoft 22 / Google 8) is recorded in the same article — a useful, honest illustration for the methodology page that analyst share estimates disagree by 2–3 points |
| Q4 2021 | 33 | 21 | 10 | — | — | 36 (residual) | S07 | verified. "Microsoft was at just 11% share 4.5 years ago" corroborates the Q2 2017 row |
| Q4 2022 | 32–34 (band) | 23 | 11 | — | — | — | Synergy Q4 2022 release | conflict — Synergy gave Amazon as a **band** ("long-standing 32–34% band"), not a point. Big three = 66%. **Ship AWS as `estimated` with low 32 / high 34**, value 33 |
| Q3 2023 | — | — | — | — | — | — | Synergy Q3 2025 article | Only the big-three aggregate is available: **61%** |
| Q4 2023 | — | — | — | — | — | — | — | **unverifiable.** Tried: "Synergy Research Group Q4 2023 cloud infrastructure market share Amazon Microsoft Google percent" and "Synergy Research Q4 2023 cloud market '$74 billion' share Amazon Microsoft Google percent". The first returned 28/21/15 against $119.1B — but $119.1B is **Q4 2025**, so that answer was contaminated by a later article and must not be used. Market size ($73.7B) is verified; **shares are not** |
| Q3 2024 | 31 | 20 | 13 | — | — | — | Synergy (via search) | verified, reliability: secondary. Big three = 62% |
| Q4 2024 | 30 | 21 | 12 | — | — | 37 (residual) | Synergy, 6 Feb 2025 | verified — **primary (fetched)** |
| Q3 2025 | 29 | 20 | 13 | — | — | 38 (residual) | Synergy, 19 Nov 2025 | verified — **primary (fetched)**. Big three = 63%. "Google remains nearly four times the size of fourth-placed Alibaba" ⇒ Alibaba ≈ 3–4%, but that is an inference — do not ship it as a figure |
| Q4 2025 | 28 | 21 | 14 | — | — | 37 (residual) | Synergy, 5 Feb 2026 | verified — **primary (fetched)**. CoreWeave > $1.5B/quarter, now a top-ten provider |
| Q1 2026 | 28 | 21 | 14 | — | — | 37 (residual) | Synergy, 29 Apr 2026 | verified — **primary (fetched)** |
| Q2 2026 | 28 | 20 | 15 | — | — | 37 (residual) | S03 | verified — **primary (fetched)**. Fastest-growing tier-two: CoreWeave, OpenAI, Oracle, Crusoe, Nebius, Anthropic, Nscale |

**Additional verified trend statements** (useful as chart annotations, all from the fetched 19 Nov 2025 Synergy article):
- Big three combined: **61%** (Q3 2023) → **62%** (Q3 2024) → **63%** (Q3 2025).
- "Amazon's market share has averaged just under 30% over the past four quarters, down from a little over 32% in 2021."
- Q2 2026 big three = 63% (28+20+15); Q4 2025 big three = 63%; Q4 2022 big three = 66%.

**What this buys the Atlas.** Thirteen quarters with at least one vendor share, spanning **Q4 2015 → Q2 2026**, and eleven quarters with the full big-three triple. That is enough for a genuine stacked-area share chart with a real HHI line. The headline story it supports is concrete and defensible: **AWS 34% → 28% while Microsoft 11% → 20–21% and Google 5% → 15%, with the big three's combined share roughly flat at 61–66% throughout.** Concentration did not increase; it rotated.

**Modelling instructions.**
1. "Other" is always a **derived residual** (100 − Σ named shares). Ship it `modeled` with `note: "100 minus the sum of named vendor shares in the source quarter"`.
2. Do **not** interpolate between quarters. The gap years (2016, 2018, 2020, most of 2023) have no share data; the empty-state rule in CLAUDE.md §1.1.5 applies.
3. Synergy quarters are calendar quarters. Map to the Atlas `year` field as the calendar year of the quarter and keep the quarter in a `note`, otherwise Q2 2026 and Q4 2026 would collide.
4. Every share is `estimated`, never `reported`. Synergy is an analyst firm and does not disclose its methodology publicly.

---

## 6. Market-cap anchors

**Not attempted.** This was explicitly the lowest-priority item and the budget went to the revenue series, deal values and the Synergy depth pass, all of which rank above it. No market-cap figure was verified in this session.

**Consequence for the data-engineer:** leave `marketCapByYear` **undefined** for every company. Per CLAUDE.md §5 chart 4, `CompetitiveBubble` falls back to gross margin, then revenue, for the radius channel. Gross margin is derivable from filings as `1 − costOfRevenue ÷ revenue` and would be `modeled` with that note — but **no cost-of-revenue figure was verified here either**, so that path also needs work before it can be used. The safe shipping configuration today is **radius = revenue**, with the market-cap and gross-margin toggles disabled rather than faked.

---

## 7. New sources

Ready to paste into `data/sources.ts`. IDs **S28–S39** as assigned (S01–S27 exist; S10 and S19 are retired; the data-engineer holds S40+).

```ts
{
  id: "S28",
  title: "SEC XBRL company concept API (us-gaap and ifrs-full revenue concepts, as filed in Forms 10-K / 20-F / 40-F)",
  publisher: "U.S. Securities and Exchange Commission",
  date: "2026-09",
  kind: "filing",
  url: "https://data.sec.gov/api/xbrl/companyconcept/",
  verified: true,
  reliability: "primary",
},
{
  id: "S29",
  title: "Amazon.com, Inc. Form 10-K for fiscal year 2018 (net sales by segment)",
  publisher: "Amazon.com, Inc. / SEC EDGAR",
  date: "2019-02-01",
  kind: "filing",
  url: "https://www.sec.gov/Archives/edgar/data/1018724/000101872419000004/amzn-20181231x10k.htm",
  verified: true,
  reliability: "primary",
},
{
  id: "S30",
  title: "Amazon.com, Inc. Form 10-K for fiscal year 2019 (net sales by segment)",
  publisher: "Amazon.com, Inc. / SEC EDGAR",
  date: "2020-01-31",
  kind: "filing",
  url: "https://www.sec.gov/Archives/edgar/data/1018724/000101872420000004/amzn-20191231x10k.htm",
  verified: true,
  reliability: "secondary",
},
{
  id: "S31",
  title: "Amazon.com Announces Fourth Quarter Results (fiscal year 2024; Form 8-K Exhibit 99.1)",
  publisher: "Amazon.com, Inc. / SEC EDGAR",
  date: "2025-02-06",
  kind: "filing",
  url: "https://www.sec.gov/Archives/edgar/data/1018724/000101872425000002/amzn-20241231xex991.htm",
  verified: true,
  reliability: "secondary",
},
{
  id: "S32",
  title: "Cloud Market Share Trends - Big Three Together Hold 63% while Oracle and the Neoclouds Inch Higher (Q3 2025)",
  publisher: "Synergy Research Group",
  date: "2025-11-19",
  kind: "analyst",
  url: "https://www.srgresearch.com/articles/cloud-market-share-trends-big-three-together-hold-63-while-oracle-and-the-neoclouds-inch-higher",
  verified: true,
  reliability: "primary",
},
{
  id: "S33",
  title: "Cloud Market Jumped to $330 billion in 2024 - GenAI is Now Driving Half of the Growth (Q4 2024 and full year 2024)",
  publisher: "Synergy Research Group",
  date: "2025-02-06",
  kind: "analyst",
  url: "https://www.srgresearch.com/articles/cloud-market-jumped-to-330-billion-in-2024-genai-is-now-driving-half-of-the-growth",
  verified: true,
  reliability: "primary",
},
{
  id: "S34",
  title: "GenAI Helps Drive Quarterly Cloud Revenues to $119 Billion as Growth Rate Jumped Yet Again in Q4 (Q4 2025 and full year 2025)",
  publisher: "Synergy Research Group",
  date: "2026-02-05",
  kind: "analyst",
  url: "https://www.srgresearch.com/articles/genai-helps-drive-quarterly-cloud-revenues-to-119-billion-as-growth-rate-jumped-yet-again-in-q4",
  verified: true,
  reliability: "primary",
},
{
  id: "S35",
  title: "Cloud Market Annual Revenue Run Rate Topped Half a Trillion Dollars in Q1 as Growth Surge Continues (Q1 2026)",
  publisher: "Synergy Research Group",
  date: "2026-04-29",
  kind: "analyst",
  url: "https://www.srgresearch.com/articles/cloud-market-annual-revenue-run-rate-topped-half-a-trillion-dollars-in-q1-as-growth-surge-continues",
  verified: true,
  reliability: "primary",
},
{
  id: "S36",
  title: "Cloud Spending Growth Rate Slows But Q4 Still Up By $10 Billion from 2021; Microsoft Gains Market Share (Q4 2022)",
  publisher: "Synergy Research Group",
  date: "2023-02-06",
  kind: "analyst",
  url: "https://www.srgresearch.com/articles/cloud-spending-growth-rate-slows-but-q4-still-up-by-10-billion-from-2021-microsoft-gains-market-share",
  verified: true,
  reliability: "secondary",
},
{
  id: "S37",
  title: "Announcing Issuance of Federal Information Processing Standards FIPS 203, FIPS 204 and FIPS 205",
  publisher: "National Institute of Standards and Technology / Federal Register",
  date: "2024-08-14",
  kind: "legal",
  url: "https://www.federalregister.gov/documents/2024/08/14/2024-17956/announcing-issuance-of-federal-information-processing-standards-fips-fips-203-module-lattice-based",
  verified: true,
  reliability: "primary",
},
{
  id: "S38",
  title: "MCP joins the Agentic AI Foundation",
  publisher: "Model Context Protocol (project blog)",
  date: "2025-12-09",
  kind: "company",
  url: "https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/",
  verified: true,
  reliability: "primary",
},
{
  id: "S39",
  title: "Databricks Grows >80% YoY, Surpasses $7B Revenue Run-Rate, Scales Lakebase, Genie, and Unity AI Gateway",
  publisher: "Databricks",
  date: "2026-08-13",
  kind: "company",
  url: "https://www.databricks.com/company/newsroom/press-releases/databricks-grows-80-yoy-surpasses-7b-revenue-run-rate-scales",
  verified: true,
  reliability: "primary",
},
```

### 7.1 Additional sources needed — ID block request

The S28–S39 allocation is exhausted and the §3 deal table needs **17 more source objects**. I have not assigned IDs to avoid colliding with the data-engineer's S40+ range. **Requesting the block S60–S79 from the orchestrator.** The sources, all verified in this session, are:

| Suggested id | Title | Publisher | Date | kind | reliability | URL |
|---|---|---|---|---|---|---|
| S60 | Oracle to acquire PeopleSoft for $10.3 billion | NBC News | 2005-01 | press | secondary | https://www.nbcnews.com/news/amp/wbna6705516 |
| S61 | Oracle to buy Siebel for $5.85 billion | NBC News | 2005-09 | press | secondary | https://www.nbcnews.com/news/amp/wbna9310938 |
| S62 | Oracle Corporation Form 8-K Exhibit 99.1 (BEA Systems acquisition) | Oracle / SEC EDGAR | 2008-04 | filing | primary | https://www.sec.gov/Archives/edgar/data/0001341439/000119312508094248/dex991.htm |
| S63 | Oracle completes acquisition of Sun Microsystems | Phys.org | 2010-01-27 | press | secondary | https://phys.org/news/2010-01-oracle-acquisition-sun-microsystems.html |
| S64 | Oracle Buys NetSuite | Oracle | 2016-07-28 | company | primary | https://www.oracle.com/corporate/pressrelease/oracle-buys-netsuite-072816.html |
| S65 | Microsoft to acquire LinkedIn | Microsoft | 2016-06-13 | company | primary | https://news.microsoft.com/source/2016/06/13/microsoft-to-acquire-linkedin/ |
| S66 | Update: SAP to buy Business Objects in $6.8B deal | Computerworld | 2007-10 | press | secondary | https://www.computerworld.com/article/1585214/update-sap-to-buy-business-objects-in-6-8b-deal.html |
| S67 | Joint Press Release: SAP to acquire SuccessFactors (Form 6-K Exhibit 99.1) | SAP / SEC EDGAR | 2011-12-03 | filing | primary | https://www.sec.gov/Archives/edgar/data/1000184/000119312511329385/d265222dex991.htm |
| S68 | Salesforce Signs Definitive Agreement to Acquire Tableau | Salesforce | 2019-06-10 | company | primary | https://www.salesforce.com/news/press-releases/2019/06/10/salesforce-signs-definitive-agreement-to-acquire-tableau/ |
| S69 | IBM Closes Landmark Acquisition of Red Hat for $34 Billion; Defines Open, Hybrid Cloud Future | Red Hat / IBM | 2019-07-09 | company | primary | https://www.redhat.com/en/about/press-releases/ibm-closes-landmark-acquisition-red-hat-34-billion-defines-open-hybrid-cloud-future |
| S70 | Salesforce Completes Acquisition of Slack | Salesforce | 2021-07-21 | company | primary | https://www.salesforce.com/news/press-releases/2021/07/21/salesforce-slack-deal-close/ |
| S71 | Microsoft completes acquisition of Nuance, ushering in new era of outcomes-based AI | Microsoft | 2022-03-04 | company | primary | https://news.microsoft.com/source/2022/03/04/microsoft-completes-acquisition-of-nuance-ushering-in-new-era-of-outcomes-based-ai/ |
| S72 | Oracle Completes Acquisition of Cerner | Oracle | 2022-06-07 | company | primary | https://www.oracle.com/news/announcement/oracle-completes-acquisition-of-cerner-2022-06-07/ |
| S73 | VMware, Inc. Form 8-K Exhibit 99.1 (completion of Broadcom merger) | VMware / SEC EDGAR | 2023-11-22 | filing | primary | https://www.sec.gov/Archives/edgar/data/1124610/000112461023000025/exhibit991.htm |
| S74 | Microsoft's $68.7B Activision acquisition clears final hurdle as UK approves restructured deal | TechCrunch | 2023-10-12 | press | secondary | https://techcrunch.com/2023/10/12/microsofts-68-7b-activision-acquisition-clears-final-hurdle-as-uk-approves-restructured-deal/ |
| S75 | Cisco Completes Acquisition of Splunk | Cisco | 2024-03-18 | company | primary | https://investor.cisco.com/news/news-details/2024/Cisco-Completes-Acquisition-of-Splunk/default.aspx |
| S76 | IBM Completes Acquisition of HashiCorp, Creates Comprehensive, End-to-End Hybrid Cloud Platform | IBM / PR Newswire | 2025-02-28 | company | primary | https://www.prnewswire.com/news-releases/ibm-completes-acquisition-of-hashicorp-creates-comprehensive-end-to-end-hybrid-cloud-platform-302387460.html |
| S77 | Synopsys Completes Acquisition of Ansys | Synopsys | 2025-07-17 | company | primary | https://investor.synopsys.com/news/news-details/2025/Synopsys-Completes-Acquisition-of-Ansys/default.aspx |
| S78 | OpenAI's Revenue Run Rate Tops $40 Billion Ahead of IPO | Bloomberg | 2026-08-13 | press | secondary | https://www.bloomberg.com/news/articles/2026-08-13/openai-s-revenue-run-rate-tops-40-billion-ahead-of-ipo |
| S79 | Databricks Grows >65% YoY, Surpasses $5.4 Billion Revenue Run-Rate | Databricks / PR Newswire | 2026-02-09 | company | primary | https://www.prnewswire.com/news-releases/databricks-grows-65-yoy-surpasses-5-4-billion-revenue-run-rate-doubles-down-on-lakebase-and-genie-302682674.html |

Two further sources are needed for the Alphabet rows in §1.9 (Alphabet FY2021 10-K, `goog-20211231.htm`, and Alphabet FY2023 10-K, `goog-20231231.htm`) — but since both Google Cloud rows above FY2023 are `conflict`, the data-engineer may prefer to drop the Google Cloud series entirely and skip these.

---

## 8. Downgrade list — what the data-engineer must NOT ship as `reported`

### 8.1 Drop entirely (no verified value exists)

| Figure | Reason |
|---|---|
| Microsoft revenue before FY2008 (incl. FY1995) | Outside SEC XBRL coverage; pre-2007 10-K text not read this session |
| Oracle revenue before FY2009 (incl. FY1990) and FY2010 | Same; FY2010 is a gap in the XBRL annual record |
| Salesforce revenue before FY2009 (incl. FY2005) and FY2010 | Same |
| Adobe revenue before FY2007 | Same |
| Red Hat FY2019 revenue | Gap in the returned annual set |
| Intuit FY2019 revenue | Extraction returned a value identical to FY2021 — internally inconsistent, so unusable |
| Cadence Design Systems revenue series | Revenue is tagged under a filer extension element; not retrievable from `companyconcept` |
| Shopify FY2024 and FY2025 revenue | No annual entries exist in the XBRL record past FY2023 |
| Google Cloud FY2025 revenue | Three mutually inconsistent figures; no reliable full-year value |
| Synergy vendor shares for Q2 2014 | The source is qualitative; it gives no percentages at all |
| Synergy vendor shares for Q4 2023 | The only search hit was contaminated by a Q4 2025 article; market size is fine, shares are not |
| Synergy Microsoft / IBM / Google shares for Q4 2015 | Only the AWS 31% headline was surfaced |
| All `marketCapByYear` | Not attempted; nothing verified |
| All gross-margin points | No cost-of-revenue figure was verified; the `modeled` derivation has no verified inputs |

### 8.2 Ship as `estimated` with a range, not `reported`

| Figure | Range / handling |
|---|---|
| Google Cloud FY2024 revenue | value 43.2, low 43.0, high 43.3 — two search-derived figures agree but the one direct fetch contradicted them |
| Broadcom–VMware deal value | value 69, low 61, high 69 — $61B cash-and-stock plus ~$8B assumed debt. Note the composition |
| SAP–Business Objects deal value | value 6.8 — a USD restatement of a EUR 4.8B cost; FX-dependent |
| AWS FY2014 and FY2015 segment net sales | Search-quoted from the FY2016 10-K rather than read in the filing. Defensible as `reported` if the data-engineer accepts secondary sourcing; otherwise `estimated` |
| Synergy AWS share, Q4 2022 | value 33, low 32, high 34 — Synergy published a band, not a point |
| Every Synergy vendor share | `estimated` by definition — analyst estimates, undisclosed methodology |
| All AI-native run rates (OpenAI, Anthropic, Databricks, Anysphere) | `estimated`, with a `note` reading "annualised run rate as reported by press; not GAAP revenue" |
| SAP revenue series | EUR, not USD — see the currency warning in §1.8. Omit unless the `Unit` enum gains `EUR_B` |

### 8.3 Choose one and note the other (`conflict` rows)

| Figure | Guidance |
|---|---|
| Microsoft FY2016 / FY2017 revenue | Ship the **ASC 606 restated** values (91.154 / 96.571) for continuity with FY2018+. Note the as-filed values (85.320 / 89.950) |
| Oracle FY2017 / FY2018 revenue | Ship the restated values (37.792 / 39.383). Note the as-filed (37.728 / 39.831) |
| Salesforce FY2017 revenue | Ship the restated 8.437. Note the as-filed 8.392 |
| Salesforce–Tableau | Ship **$15.7B** (Salesforce's own enterprise-value figure). Note CNBC's $15.3B equity value |
| Microsoft–Activision | Ship **$68.7B** (headline price). Note the $75.4B "total cost" basis |
| IBM–HashiCorp completion date | Use **Feb 2025**; do not assert a day (sources give 27 and 28 Feb) |

### 8.4 Figures in research.md that are now upgraded ◇ → ✓

Microsoft FY2014 revenue · Oracle–Cerner $28.3B · IBM–Red Hat $34B · IBM–HashiCorp $6.4B · Oracle–PeopleSoft $10.3B · Oracle–Siebel $5.85B · Oracle–BEA $8.5B · Oracle–Sun $7.4B · Oracle–NetSuite $9.3B · Microsoft–LinkedIn $26.2B · Salesforce–Tableau $15.7B · Salesforce–Slack $27.7B · Microsoft–Nuance $19.7B · Broadcom–VMware ~$69B · Microsoft–Activision $68.7B · Cisco–Splunk $28B · plus newly established values for SAP–Business Objects, SAP–SuccessFactors and Synopsys–Ansys.

This clears **all four items in research.md §9.4** and the whole of §9.2 except the PE take-privates, which carry no values.

---

## 9. Modeled gross margin (second pass, per orchestrator ruling §8.5)

### 9.1 Method

`grossMargin = (1 − costOfRevenue ÷ revenue) × 100`, expressed as a `percent` DataPoint.

Both inputs are figures **as filed**, pulled from the same SEC XBRL `companyconcept` endpoint used for the revenue series (source **S28**). The ratio is nevertheless **our derivation**, so every point below is `confidence: "modeled"` — never `reported`. Each carries the note:

> **"Modeled: 1 − cost of revenue ÷ revenue, both as filed."**

Where a filer required a fallback tag, the note is extended to name it, e.g.:

> **"Modeled: 1 − cost of revenue ÷ revenue, both as filed. Cost taken from us-gaap:CostOfGoodsAndServicesSold; the filer does not tag us-gaap:CostOfRevenue."**

`sourceId` is **S28** for every point, matching the revenue figure for the same company-year.

**Tag precedence used:** `us-gaap:CostOfRevenue` → `us-gaap:CostOfGoodsAndServicesSold` → `us-gaap:CostOfServices` → (SAP only) `ifrs-full:CostOfSales`.

**Pairing rules applied, exactly as instructed:**
- A point is emitted only where revenue and cost cover the **same fiscal period** and sit on the **same filing basis**. Mismatched pairs were skipped, not fudged.
- Where the revenue figure is ASC 606 **restated**, the restated cost figure was used.
- Every result was sanity-checked against a 20–95% plausibility band. Three companies failed the check and were investigated rather than emitted — see §9.4.

**Method column key:** `CoR` = `CostOfRevenue` · `CoGaSS` = `CostOfGoodsAndServicesSold` · `CoS` = `ifrs-full:CostOfSales` · `Rev` = `Revenues` · `SRN` = `SalesRevenueNet` · `RFC-X` = `RevenueFromContractWithCustomerExcludingAssessedTax` · `RFC-I` = `…IncludingAssessedTax` · `IFRS-Rev` = `ifrs-full:Revenue`.

### 9.2 Results — 236 company-years across 23 companies

**Microsoft** — 19 points. FY ends June.

| FY | Revenue (USD_B) | Cost (USD_B) | Gross margin % | Method | Status |
|---|---|---|---|---|---|
| 2008 | 60.420 | 11.598 | 80.8 | CoR ÷ Rev | modeled |
| 2009 | 58.437 | 12.155 | 79.2 | CoR ÷ Rev | modeled |
| 2010 | 62.484 | 12.395 | 80.2 | CoR ÷ Rev | modeled |
| 2011 | 69.943 | 15.577 | 77.7 | CoR ÷ SRN | modeled |
| 2012 | 73.723 | 17.530 | 76.2 | CoR ÷ SRN | modeled |
| 2013 | 77.849 | 20.249 | 74.0 | CoR ÷ SRN | modeled |
| 2014 | 86.833 | 27.078 | 68.8 | CoR ÷ SRN | modeled |
| 2015 | 93.580 | 33.038 | 64.7 | CoR ÷ SRN | modeled |
| 2016 | 91.154 | 32.780 | 64.0 | CoGaSS ÷ RFC-X (both restated) | modeled |
| 2017 | 96.571 | 34.261 | 64.5 | CoGaSS ÷ RFC-X (both restated) | modeled |
| 2018 | 110.360 | 38.353 | 65.2 | CoGaSS ÷ RFC-X | modeled |
| 2019 | 125.843 | 42.910 | 65.9 | CoGaSS ÷ RFC-X | modeled |
| 2020 | 143.015 | 46.078 | 67.8 | CoGaSS ÷ RFC-X | modeled |
| 2021 | 168.088 | 52.232 | 68.9 | CoGaSS ÷ RFC-X | modeled |
| 2022 | 198.270 | 62.650 | 68.4 | CoGaSS ÷ RFC-X | modeled |
| 2023 | 211.915 | 65.863 | 68.9 | CoGaSS ÷ RFC-X | modeled |
| 2024 | 245.122 | 74.114 | 69.8 | CoGaSS ÷ RFC-X | modeled |
| 2025 | 281.724 | 87.831 | 68.8 | CoGaSS ÷ RFC-X | modeled |
| 2026 | 331.839 | 106.374 | 68.0 | CoGaSS ÷ RFC-X | modeled |

*ASC 606 note:* `CostOfRevenue` (as filed in the FY2016 10-K) and `CostOfGoodsAndServicesSold` (the restated comparative in the FY2018 10-K) **both return 32,780 for FY2016 and 34,261 for FY2017**. Two filings agreeing on the cost figure across the restatement boundary is direct evidence that the ASC 606 change moved revenue but not cost of revenue, so pairing restated revenue with this cost is sound. Recorded here because it is an in-session observation, not an assumption.

**Adobe** — 19 points, unbroken FY2007–FY2025. Method: `CoR ÷ Rev` throughout. FY ends late Nov.

| FY | 2007 | 2008 | 2009 | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 88.8 | 89.9 | 89.9 | 89.4 | 89.6 | 89.0 | 85.5 | 85.0 | 84.5 | 86.0 | 86.2 | 86.8 | 85.0 | 86.6 | 88.2 | 87.7 | 87.9 | 89.0 | 89.3 |

*The subscription-transition dip is visible and real:* 89.0% (FY2012) → 85.5% (FY2013) → 84.5% (FY2015) as hosted delivery costs replaced disc-and-licence economics, then a recovery to 89.3% once Creative Cloud reached scale. This is the single best worked example in the dataset of a business model changing shape on both axes at once.

**IBM** — 17 points. Method: `CoR ÷ Rev` throughout. Calendar FY.

| FY | 2007 | 2008 | 2009 | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 42.2 | 44.1 | 45.7 | 46.1 | 46.9 | 49.8 | 49.5 | 50.0 | 49.8 | 48.2 | 46.7 | 46.4 | 54.9 | 54.0 | 55.4 | 56.7 | 58.2 |

**FY2019 and FY2020 are deliberately absent** — see §9.4. IBM is the clearest illustration in the Atlas that a shrinking platform giant can raise gross margin while revenue falls, by shedding low-margin services.

**Salesforce** — 15 points. FY ends January.

| FY | 2009 | 2011 | 2012 | 2013 | 2014 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 79.5 | 80.5 | 78.4 | 77.6 | 76.2 | 73.5 | 73.7 | 74.0 | 75.2 | 74.4 | 73.5 | 73.3 | 75.5 | 77.2 | 77.7 |

Method: `CoR ÷ Rev` for FY2009–FY2014; `CoGaSS ÷ RFC-X` for FY2017–FY2026 (FY2017 both restated). **FY2010, FY2015 and FY2016 are absent** — FY2010 has no revenue figure, and FY2015–FY2016 fall in the gap between the two cost tags.

**Amazon (consolidated)** — 10 points. Method: `CoGaSS ÷ RFC-X`. Calendar FY.

| FY | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 35.1 | 37.1 | 40.2 | 41.0 | 39.6 | 42.0 | 43.8 | 47.0 | 48.9 | 50.3 |

> **Label this carefully.** This is **consolidated Amazon**, retail included — it is *not* AWS's margin. AWS segment cost of revenue is not separately tagged, so no AWS margin exists. The rising trend is largely AWS and advertising mix shift, which is a legitimate story, but the UI must not imply these are cloud margins.

**ServiceNow** — 10 points. Method: `CoR ÷ RFC-X`. Calendar FY.

| FY | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 71.3 | 73.9 | 76.1 | 77.0 | 78.2 | 77.1 | 78.3 | 78.6 | 79.2 | 77.5 |

**Autodesk** — 10 points. Method: `CoR ÷ RFC-X`. FY ends January.

| FY | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 83.2 | 85.2 | 88.9 | 90.1 | 91.1 | 90.5 | 90.4 | 90.7 | 90.6 | 91.0 |

*Autodesk is the mirror image of Adobe:* its subscription transition **raised** gross margin from 83% to 91%, because it was moving off physical/perpetual licensing rather than onto expensive hosted infrastructure. Two companies, the same strategic move, opposite margin signatures — a genuinely useful pairing for the business-model chapter.

**HubSpot** — 10 points. Method: `CoR ÷ RFC-X` (2016–17), `CoGaSS ÷ RFC-X` (2018–25). Calendar FY.

| FY | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 77.2 | 79.8 | 80.4 | 80.7 | 81.1 | 80.1 | 81.8 | 84.1 | 85.0 | 83.8 |

**Twilio** — 10 points. Method: `CoR ÷ RFC-X`. Calendar FY.

| FY | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 56.5 | 54.2 | 53.7 | 53.7 | 52.0 | 48.9 | 47.4 | 49.2 | 51.1 | 48.9 |

*The most valuable outlier in the set.* Twilio sits at ~50% while comparable SaaS sits at 75–85%, because carrier termination fees pass straight through cost of revenue. It is the concrete proof that "software gross margin" is not one number — it is a function of what sits underneath the API.

**MongoDB** — 10 points. Method: `CoGaSS ÷ RFC-X`. FY ends January.

| FY | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 74.0 | 74.2 | 72.4 | 70.3 | 70.0 | 70.3 | 72.8 | 74.8 | 73.3 | 71.7 |

**Red Hat** — 10 points. Method: `CoR ÷ Rev`. FY ends February. Pre-acquisition.

| FY | 2009 | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 |
|---|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 83.7 | 84.8 | 83.5 | 84.2 | 84.9 | 84.8 | 84.7 | 84.9 | 85.3 | 85.2 |

*Remarkably flat at 84–85% for a decade.* Directly refutes the intuition that giving the software away compresses margin: Red Hat's subscription margins are indistinguishable from proprietary software. Strong support for the commercial-OSS archetype in §4.

**Datadog** — 9 points. Method: `CoGaSS ÷ RFC-X`. Calendar FY.

| FY | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 76.8 | 76.5 | 75.5 | 78.4 | 77.2 | 79.3 | 80.7 | 80.8 | 80.0 |

**Cloudflare** — 9 points. Method: `CoR ÷ RFC-X`. Calendar FY.

| FY | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 78.7 | 77.4 | 77.9 | 76.6 | 77.6 | 76.1 | 76.3 | 77.3 | 74.5 |

**Synopsys** — 9 points. Method: `CoR ÷ RFC-X`. FY ends October.

| FY | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 76.0 | 76.4 | 77.6 | 78.4 | 79.5 | 79.1 | 79.1 | 79.7 | 77.0 |

**Zoom** — 9 points. Method: `CoGaSS ÷ RFC-X`. FY ends January.

| FY | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 79.7 | 81.5 | 81.5 | 69.0 | 74.3 | 75.0 | 76.2 | 75.8 | 77.0 |

*The FY2021 collapse from 81.5% to 69.0% is real and is the pandemic itself* — free-tier capacity and emergency data-centre expansion hit cost of revenue while revenue quadrupled. Pair it with the revenue series for a two-axis story no single metric tells.

**CrowdStrike** — 9 points. Method: `CoGaSS ÷ RFC-I`. FY ends January.

| FY | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 54.1 | 65.1 | 70.6 | 73.8 | 73.6 | 73.2 | 75.3 | 74.9 | 74.7 |

**Snowflake** — 8 points. Method: `CoGaSS ÷ RFC-X`. FY ends January.

| FY | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|
| **GM %** | 46.5 | 56.0 | 59.0 | 62.4 | 65.3 | 68.0 | 66.5 | 67.2 |

*Consumption pricing starts structurally low* (Snowflake resells hyperscaler compute) *and climbs with negotiating leverage and engineering efficiency* — 46% to 67% in seven years. Useful counterweight to the assumption that SaaS margin is a constant.

**Palantir** — 8 points. Method: `CoR ÷ RFC-X`. Calendar FY.

| FY | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|
| **GM %** | 72.2 | 67.4 | 67.7 | 78.0 | 78.6 | 80.6 | 80.2 | 82.4 |

**Splunk** — 7 points. Method: `CoGaSS ÷ RFC-X`. FY ends January. Pre-acquisition.

| FY | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 |
|---|---|---|---|---|---|---|---|
| **GM %** | 79.8 | 80.4 | 80.9 | 81.8 | 75.4 | 72.6 | 77.7 |

**Shopify** — 7 points. Method: `CoGaSS ÷ RFC-X`. Calendar FY.

| FY | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 |
|---|---|---|---|---|---|---|---|
| **GM %** | 56.5 | 55.6 | 54.9 | 52.6 | 53.8 | 49.2 | 49.8 |

*Form caveat:* for FY2017–FY2021 both inputs come from Form 40-F. For FY2022–FY2023 the revenue fact is tagged on a 40-F and the cost fact on a 10-K. Both are annual US-GAAP figures for identical periods, so the pair is valid, but the data-engineer should carry a short note on those two points.

**Atlassian** — 6 points. FY ends June.

| FY | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|
| **GM %** | 84.1 | 83.8 | 82.1 | 81.6 | 82.8 | 84.8 |

Method: `CoR ÷ RFC-X` for FY2021–FY2022, `CoGaSS ÷ RFC-X` for FY2023–FY2026. (FY2023 and FY2024 are tagged under **both** cost concepts at identical values, which confirms the two tags are interchangeable for this filer.)

**Slack** — 4 points. Method: `CoR ÷ RFC-X`. FY ends January. Pre-acquisition.

| FY | 2018 | 2019 | 2020 | 2021 |
|---|---|---|---|---|
| **GM %** | 88.0 | 87.2 | 84.6 | 86.5 |

*Slack's ~87% margin against Zoom's 69–81% over the same years is a sharp detail for the "Slack vs Teams" case study:* Slack was not beaten on unit economics. It was beaten on distribution.

**SAP** — 11 points. Method: `CoS ÷ IFRS-Rev`, both EUR. Calendar FY.

| FY | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **GM %** | 70.0 | 70.2 | 69.9 | 69.8 | 69.7 | 71.2 | 73.2 | 72.8 | 72.2 | 73.0 | 72.9 |

> **SAP gets a margin series even though it gets no revenue series.** A ratio is currency-neutral: EUR ÷ EUR yields a dimensionless percent that needs no FX conversion and so does not run into the §8.6 objection at all. This is verified, not asserted — SAP's FY2017 20-F carries **both** EUR and USD facts, and they agree to the decimal: EUR 7,051 ÷ 23,461 = 69.94%, USD 8,477 ÷ 28,205 = 69.94%. **SAP can therefore appear in the bubble chart on the gross-margin channel**, which partly repairs the §8.6 exclusion.

### 9.3 SAP in USD — outcome of the requested check

**Found, but it is a single year, not a series.** SAP's XBRL record contains exactly **one** USD-denominated annual fact per concept, both for calendar 2017, filed on Form 20-F:

| Item | Value | Unit | Year | Source | Status | Notes |
|---|---|---|---|---|---|---|
| SAP revenue (USD convenience translation) | 28.205 | USD_B | FY2017 (Dec) | SEC XBRL `ifrs-full:Revenue`, USD unit, CIK 0001000184 | verified | https://data.sec.gov/api/xbrl/companyconcept/CIK0001000184/ifrs-full/Revenue.json — the `units` object contains both `EUR` and `USD` keys; `USD` holds one annual entry |
| SAP cost of sales (USD convenience translation) | 8.477 | USD_B | FY2017 (Dec) | SEC XBRL `ifrs-full:CostOfSales`, USD unit | verified | Same filing |

**Recommendation: keep ruling §8.6 as it stands.** One data point produces no year-over-year growth, so it cannot place SAP on the bubble chart's y-axis, and a single lonely USD marker in an otherwise empty series would be more confusing than an honest absence. It is genuinely citable if you ever want a one-off "SAP was a $28B company in 2017" anchor in narrative copy — flagging it so the decision is informed rather than reversing it unilaterally.

### 9.4 Companies where gross margin could not be derived

| Company | Status | Tags tried and what came back |
|---|---|---|
| **Oracle** | `unverifiable` | `us-gaap:CostOfRevenue` returns **$0** for FY2008 and FY2009 and implausibly small values for FY2010 ($880M) and FY2011 ($2,057M) against ~$27–36B of revenue — these are sub-components, not total cost of revenue. Oracle's income statement presents cost by line of business (cloud services and licence support, hardware, services) with **no single total-cost-of-revenue subtotal**, so no clean derivation exists. Summing the components would be a second-order derivation beyond the method the brief specifies. **Drop.** |
| **IBM FY2019 and FY2020 only** | `unverifiable` (two years) | Tag mismatch across the Kyndryl spin-off. `CostOfRevenue` returns 26,181 (2019) and 24,314 (2020) — figures on the **post-spin continuing-operations** basis — while the revenue series for those years is **pre-spin as-filed** (77,147 and 73,620). Pairing them yields 66% and 67% against a ~46% neighbourhood, which is exactly the kind of tag mismatch the sanity band is meant to catch. All other IBM years pair cleanly. **Skip these two years; the rest of the series ships.** |
| **Workday** | `unverifiable` | `CostOfRevenue` returns only FY2011–FY2013, which is entirely before the FY2017 start of the verified revenue series — **zero overlap**. `CostOfGoodsAndServicesSold` → 404. `CostOfServices` → 404. `CostOfGoodsAndServicesSoldExcludingDepreciationDepletionAndAmortization` → 404. Workday tags its total cost of revenue under a filer extension element. **Drop.** |
| **Intuit** | `unverifiable` | `CostOfRevenue` → 404. `CostOfGoodsAndServicesSold` returns **quarterly facts only** (three-month periods, 2008–2020) with no annual period at all. Summing four quarters would be a derivation the method does not authorise and risks straddling Intuit's July fiscal year-end. **Drop.** |
| **VMware** | `unverifiable` | `CostOfRevenue` → 404. `CostOfGoodsAndServicesSold` → 404. Filer extension element. **Drop.** |
| **Cadence** | `unverifiable` | As instructed, one further `companyfacts` fetch was made (https://data.sec.gov/api/xbrl/companyfacts/CIK0000813672.json). The response was truncated before reaching any revenue or cost concept — only balance-sheet concepts were visible — so the extension tag name could not be recovered. **Stays dropped**, both revenue and margin, per the original recommendation. |
| **AWS segment** | `unverifiable` | Segment cost of revenue is not tagged separately by Amazon at all. No AWS-specific margin exists in any filing. Use consolidated Amazon margin only, clearly labelled as such. |

### 9.5 Sanity-check outcomes

All 236 emitted points fall inside the 20–95% band. The extremes are **Amazon consolidated at 35.1%** (FY2016, retail-weighted — expected and correctly labelled) and **Adobe at 89.9%** (FY2008/09, peak perpetual-licence economics — expected). The three excursions outside the band that the check caught were IBM FY2019/FY2020 (66–67%, tag-basis mismatch) and Oracle FY2008–FY2011 (99%+ implied, sub-component tag); both were investigated and excluded rather than emitted, as instructed.

### 9.6 Effect on the bubble chart

`availableSizeMetrics(companies)` should now return **`["grossMargin", "revenue"]`** and omit `"marketCap"`. Twenty-three of the Atlas's companies carry a margin series; the radius channel is therefore backed by real derived data for the great majority of the bubble population, with `revenue` as the fallback for the rest.

Note for the chart-engineer: gross margin has a **much narrower dynamic range** than market cap would have had (roughly 35–91%, and 65–85% for most companies). A linear radius scale over that range will make every bubble look identical. Map radius from a domain anchored near zero, or use a scale with a visible minimum radius and an explicit legend, or the channel will carry no information.

---

## 10. Addendum to §7 — New sources

**No new source objects are required for §9.** Every gross-margin input came from the SEC XBRL `companyconcept` API already registered as **S28**, including the SAP USD facts. The S28 title already covers both the `us-gaap` and `ifrs-full` concept families.

The S60–S79 block confirmed in `docs/CONTRACTS.md` §8.7 remains exactly as drafted in §7.1 above — unchanged by this pass.

---

## 11. Addendum to §8 — Downgrade list, updated

### 11.1 Additions to "drop entirely"

| Figure | Reason |
|---|---|
| Oracle gross margin, all years | No total-cost-of-revenue tag; filer reports cost by line of business |
| Workday gross margin, all years | Cost tagged under a filer extension; no overlap with the revenue series |
| Intuit gross margin, all years | Only quarterly cost facts exist; no annual period |
| VMware gross margin, all years | Cost tagged under a filer extension |
| Cadence gross margin, all years | Already dropped for revenue; companyfacts fetch did not surface the tag |
| IBM gross margin, FY2019 and FY2020 | Cost is post-Kyndryl-spin, revenue is pre-spin — mismatched basis |
| AWS segment gross margin | Segment cost of revenue is not tagged in any filing |
| Salesforce gross margin, FY2010 / FY2015 / FY2016 | Falls in the gap between the two cost tags, or has no revenue figure |

### 11.2 Correction to the earlier downgrade list

§8.1 previously said **"All gross-margin points — no cost-of-revenue figure was verified."** **That line is now superseded.** 236 company-years across 23 companies are verified and derivable, listed in §9.2. The `marketCapByYear` entry in §8.1 stands unchanged and is confirmed by ruling §8.5.

### 11.3 Confidence handling for gross margin

Every point is `confidence: "modeled"` with the mandated note. **No gross-margin point may ship as `reported`**, even though both inputs are filed figures — the ratio is the Atlas's derivation, which is precisely the distinction `CLAUDE.md` §1.1 rule 3 exists to enforce. No ranges are needed: the inputs are exact, so `low`/`high` should be left undefined.

---

## 12. Source registry audit (Phase D, QA finding Q-01)

**Why this section exists.** QA finding Q-01 established that 32 of the shipped sources carried
`verified: true` with a URL but **no entry anywhere in this log** — nothing recorded who fetched
them, when, or which figure was taken from them. `/methodology/` tells readers the loop is
"fetch → add to `sources.ts` → log the check here", and for those 32 the last step never happened.
This section closes that gap for **all 82 registry entries** — the 81 QA audited plus **S80**, added mid-audit by the data-engineer for the IBM/Kyndryl spin-off — not just the 32.

> **Second pass, 23 September 2026 (QA finding Q-17).** The registry has since grown to **121** entries and re-pointed six URLs, so §12.1 fell behind again. It now carries **112 rows for the 112 URL-bearing entries** plus the 9 `B*` literature rows. Read §12.2 for the current count and the coverage rule, §12.6 for what the second pass did, and §12.7 for what it found. Rows added or corrected in that pass say so in place.

**Complication found while auditing.** The id suggestions in §7.1 of this log (the block
"S60–S79" requested from the orchestrator) were **not** the ids the data-engineer ultimately
assigned. Shipped `S65` is the Microsoft Teams rollout post; §7.1's "S65" was the LinkedIn
announcement, which ships as `S46`. So id-matching between §7.1 and `data/sources.ts` is
meaningless and coverage had to be re-established **by URL**. Where a §7.1 row and a shipped
entry share a URL that is noted in the row; the id in §7.1 is not evidence about the shipped id.

**Rule applied** (the one now recorded in `docs/CONTRACTS.md`, per QA's S78 recommendation):

> `verified: true` means the cited URL was retrieved in this project **and the figure was seen in
> retrieved content** — page body, filing, API response, or a search engine's verbatim extract of
> that page. A source whose substance sits behind a paywall or login that was never passed is
> `verified: false`, with its URL kept.

**Method, this session (2026-09-22).** Each URL was requested with the `WebFetch` tool, which
performs a GET and renders the response to markdown. The "HTTP status observed" column records
what that request actually returned **in this session**; QA's earlier numbers were a spot check
and were not copied. Where a host returned a bot-protection or paywall response, the row says so
and the substance is treated as unread. Where a fetch failed for transport reasons it was retried
once before being recorded.

**Status vocabulary for this table**

| Status | Meaning |
|---|---|
| `verified` | Page retrieved and the claim the Atlas draws from it was read in the retrieved content. |
| `verified-prior` | Retrieved here **and** already covered by an earlier section of this log (§1–§11); the audit-trail gap did not apply. |
| `unread` | Request returned a block/paywall/error; substance not read this session. Candidate for `verified: false`. |
| `n/a — no URL` | `B*` literature entries: no URL in the registry, already `verified: false`, never back a `reported` point. |

Rows added in the Q-17 pass also use `verified-prior` for the three Synergy articles (S96–S98), where the retrieval happened in §5 of this log rather than in the audit itself; those rows label themselves **transcription rows** so no one mistakes them for a second independent check.

### 12.1 Audit table

| Source id | Title | Publisher | URL | HTTP status observed | What was confirmed | Status |
|---|---|---|---|---|---|---|
| S01 | Gartner forecasts worldwide IT spending to grow 14.2% in 2026 | TelecomTV (reporting Gartner) | https://www.telecomtv.com/content/digital-platforms-services/gartner-forecasts-worldwide-it-spending-to-grow-14-2-in-2026-totalling-6-37tn-55964/ | 200, body read | Read verbatim: "Worldwide IT spending is expected to reach **$6.37 trillion** in 2026, up **14.2%** from 2025"; software **$1,468B** at **+15.5%**; IaaS **$287B** at **+29.3%**. This is the single most-used source in the Atlas — it backs the `sizeByYear` anchor of **33 markets** in `data/markets.ts` (every `"S01"` line from :187 to :1071) and `evt-2026-gartner-software-forecast`. Those market sizes are Atlas allocations of the $1,468B software line and ship `estimated`/`modeled`, not `reported`. | verified |
| S02 | Gartner forecasts worldwide IT spending to grow 13.5% in 2026, totaling $6.31 trillion | Gartner | https://www.gartner.com/en/newsroom/press-releases/2026-04-22-gartner-forecasts-worldwide-it-spending-to-grow-13-point-5-percent-in-2026-totaling-6-point-31-trillion-dollars | **403 — bot-blocked on direct fetch**; substance then confirmed from a search engine's extract | gartner.com rejects the fetcher outright (no body returned). A follow-up search returned this exact URL and quoted **body** content, not just the headline: "Worldwide IT spending is expected to reach **$6.31 trillion** in 2026, up **13.5%** from 2025", plus release detail — data-centre systems **+55.8%** and **>$788B**, IT services **>$1.87tn** — which only appears inside the release. Used as the second citation on `evt-2026-gartner-software-forecast`, whose value comes from S01; S02 is what makes the event's "raises" framing true (April $6.31tn → July $6.37tn). | verified (search extract) |
| S03 | Q2 cloud market passes $143 billion; highest growth rate in eight years | Synergy Research Group | https://www.srgresearch.com/articles/q2-cloud-market-passes-143-billion-highest-growth-rate-in-eight-years | 200, body read | Read verbatim: quarterly cloud infrastructure revenues **$143.4B**, growth **43%** ("the highest in the last eight years"), shares **Amazon 28% / Microsoft 20% / Google 15%**. Backs the Q2 2026 rows of the flagship `cloud-infrastructure` share series (`markets.ts:85–147`) and `evt-2026-synergy-q2`, `evt-2026-aws-share-28`. Consistent with §5.1/§5.2 of this log. | verified-prior |
| S03b | Enterprise cloud infrastructure uptake shows no sign of slowing | The Register (reporting Synergy) | https://www.theregister.com/a/5281835 | 200, body read | Read: **$143B** Q2 2026, **43%** YoY, trailing-twelve-month market **$500B**, IaaS/PaaS **+47%**, AI cloud services **+165%**, Big Three **67%** of revenue "up from 63% in Q3 2025", AWS 28 / Azure 20 / Google 15. Backs `markets.ts:162,168` and the AI-infrastructure signals in `emerging.ts:174,482`. Corroborates S03 exactly. | verified |
| S04 | The leading cloud providers continue to run away with the market (Q2 2017) | Synergy Research Group | https://www.srgresearch.com/articles/leading-cloud-providers-continue-run-away-market | 200, body read | Read verbatim: quarterly revenues "almost **$11 billion**"; shares **AWS 34% / Microsoft 11% / IBM 8% / Google 5%**. Backs the 2017 column of the share series (`markets.ts:117–120`) and the "down from 34% in 2017" claim in `evt-2026-aws-share-28`. | verified-prior |
| S05 | Amazon and Microsoft own half the cloud infrastructure market (Q2 2019) | The Register (reporting Synergy) | https://www.theregister.com/2019/07/26/half_of_all_public_cloud_money_goes_to_amazon_and_microsoft/ | 200, body read | Read: Q2 2019 market "nearly **$23 billion**"; shares **AWS 33% / Microsoft 16% / Google 8% / IBM 6% / Alibaba 5%**; market growth **39%** YoY. Backs the five 2019 share rows at `markets.ts:126–130`. | verified-prior |
| S06 | Cloud infrastructure market kept growing in Q2, reaching $42B (Q2 2021) | TechCrunch (reporting Synergy) | https://techcrunch.com/?p=2184490 | 200, body read (short-link `?p=` resolves) | Read: Q2 2021 market **$42B**, **+39%** YoY; **AWS 33%** ($14.81B), **Microsoft 20%** ($8.4B), **Google 10%** ($4.2B). Backs the four 2021 share rows at `markets.ts:136–139`. | verified-prior |
| S07 | Cloud infrastructure market soared to $178B in 2021 | TechCrunch (reporting Synergy) | https://techcrunch.com/?p=2266714 | 200, body read | Read verbatim: "growing from **$129 billion in 2020** to **$178 billion** this year"; shares Amazon 33 / Microsoft 21 / Google 10. Backs the FY2020 and FY2021 `sizeByYear` points for `cloud-infrastructure` (`markets.ts:77–78`). | verified-prior |
| S08 | Microsoft and IBM chase Amazon while Google falls off the pace (Q2 2014) | Synergy Research Group | https://srgresearch.com/articles/microsoft-and-ibm-chase-amazon-while-google-falls-pace | 200, body read | Read: Q2 2014 quarterly revenues **$3.7B**, trailing twelve months "exceeding $13 billion", market "growing at over 45%". **Confirms this session's earlier finding (§8.1) that the article gives no vendor percentages** — it is qualitative on share. Used only for the 2014 `sizeByYear` point (`markets.ts:73`), never for shares. | verified-prior |
| S09 | Amazon Q4 2025 earnings release (AWS segment) | Amazon | https://www.aboutamazon.com/news/company-news/amazon-earnings-q4-2025-report | **Re-fetched 23 Sep 2026 at the corrected `www` URL: ECONNRESET on the first attempt, 200 and body read on retry, no redirect** | Read again at the shipped URL: "AWS segment sales increased **24%** year-over-year to **$35.6 billion**"; "AWS segment operating income was **$12.5 billion**, compared with $10.6 billion in fourth quarter 2024"; full year "AWS segment sales increased **20%** year-over-year to **$128.7 billion**"; FY operating income **$45.6 billion** vs $39.8B in 2024. **Cited by nothing in the data** (QA Q-14) — the AWS series ships from S28 (SEC XBRL). The figures match §1.6 of this log. **Row re-pointed in the Q-17 pass**: the registry adopted the canonical `www.aboutamazon.com` form (QA Q-13), so the previously logged bare-host URL no longer matches anything shipped. | verified |
| S11 | Microsoft FY2026 Q4 earnings release (8-K Ex. 99.1) | Microsoft / SEC | https://www.sec.gov/Archives/edgar/data/0000789019/000119312526323632/msft-ex99_1.htm | 200, filing body read | Read verbatim: Q4 revenue "**$90.0 billion** and increased 18%"; FY2026 revenue "**$331.8 billion** and increased 18%"; "Azure and other cloud services revenue increased **43%**". Note the filing gives **no dollar Azure figure** — so `evt-2026-azure-100b` correctly leans on S11b for the $100B. | verified |
| S11b | Microsoft reports revenue of $90 billion for Q4 FY2026 (Azure >$100B, Copilot >30M seats) | Pulse 2.0 | https://pulse2.com/microsoft-reports-revenue-of-90-billion-up-18-year-over-year-for-q4-2026/ | 200, body read | Read the Nadella quotation verbatim: "This year, **Azure revenue surpassed $100 billion** for the first time, and **Microsoft 365 Copilot reached over 30 million paid seats**." Backs `evt-2026-azure-100b`, `evt-2026-copilot-seats` and the AI-assistant signal at `emerging.ts:86`. Secondary, but it quotes the primary speaker directly. | verified |
| S12 | Salesforce delivers record fourth quarter and fiscal 2026 results | Salesforce | https://www.salesforce.com/news/press-releases/2026/02/25/fy26-q4-earnings/ | **200, body read (23 Sep 2026)** at the re-pointed URL | **Row re-pointed in the Q-17 pass.** The registry adopted the salesforce.com mirror this log recommended, so the old Business Wire URL no longer matches anything shipped — and the new one is directly readable. Read verbatim: "FY26 revenue of **$41.5 billion, up 10% Y/Y** and 9% in CC"; Q4 revenue **$11.2 billion, +12%**; "Initiates full year FY27 revenue guidance of **$45.8 billion to $46.2 billion**, up 10%–11% Y/Y"; "Agentforce and Data 360 annual recurring revenue ('ARR') exceeds **$2.9 billion, up over 200% Y/Y**"; **Agentforce ARR $800M, +169% Y/Y**. That is the figure `evt-2026-agentforce-arr` carries; S12 also backs `evt-2025-salesforce-informatica` and four `emerging.ts` signals (:79, :352, :411, :435). **Status upgraded from "verified (search extract)" to a direct read.** *(Superseded detail, kept for the record:)* businesswire.com refuses the fetcher. The release text was confirmed through search, which returned this exact URL plus the Salesforce and `investor.salesforce.com` mirrors and quoted: FY2026 revenue **$41.5B (+10% YoY)**, Q4 revenue **$11.2B (+12%)**, subscription and support **$10.7B (+13%)**, FY27 guidance **$45.8–46.2B** "including approximately 3pts Informatica contribution". A second search confirmed **Agentforce ARR $800M, up 169% YoY**. The recommendation to swap the URL to the salesforce.com mirror has since been implemented by the data-engineer. | verified |
| S13 | Oracle announces record fourth quarter and fiscal 2026 results | Oracle / PR Newswire (Seeking Alpha PR wire) | https://seekingalpha.com/pr/20547657 | 200, body read | Read verbatim: "Record FY 2026 Total Revenues **$67.4 billion**, up 17%"; "FY 2026 Cloud Infra (IaaS) Revenue **$18.1 billion**, up 77%"; "**Remaining Performance Obligations, or RPO, ended the quarter at $638 billion**, up 363% YoY". The $638B RPO is exactly what `evt-2026-oracle-rpo` claims. Also backs the Oracle AI-infrastructure signal at `emerging.ts:181`. | verified |
| S13b | Oracle's AI infrastructure business drives 93% IaaS growth | Converge Digest | https://convergedigest.com/oracles-ai-infrastructure-business-drives-93-iaas-growth/ | **200, body read (23 Sep 2026)** at the re-pointed canonical slug | **Row re-pointed in the Q-17 pass**: the registry replaced the 403-ing `?p=111461` short-link with the canonical slug this log recommended, so the old row no longer matched anything shipped. Read directly at the shipped URL: "IaaS revenue surged **93%** to **$5.8 billion**" in Q4; full-year "total cloud revenue grow **39%** to **$34.0 billion**"; "OCI revenue reached **$18.1 billion**, up **77%**"; RPO "jumped to a record **$638 billion**, up **363%**"; "negative free cash flow of **$23.7 billion** for fiscal 2026". Second citation on `evt-2026-oracle-rpo`, whose value comes from S13. **Status upgraded from "verified (search extract)" to a direct read.** | verified |
| S14 | Adobe Inc. Form 10-K for fiscal year 2025 | Adobe / SEC | https://www.sec.gov/Archives/edgar/data/796343/000079634326000003/adbe-20251128.htm | 200, filing retrieved; **body truncated before Item 8** | Confirmed from the retrieved text: this is Adobe's 10-K "for the fiscal year ended **November 28, 2025**", and the subscription-licensing sentence that `evt-2013-adobe-creative-cloud` rests on ("license the majority of our software products through a subscription model…"), plus the segment consolidation into one reportable segment effective Q1 FY2026. **Two caveats, stated plainly:** (a) the **$23.77B revenue** cited in `markets.ts:795` did **not** appear in the retrieved excerpt — it is independently verified as **23.769 USD_B** from SEC XBRL in §1.4 of this log; (b) a targeted re-fetch searching for "Figma" and "termination fee" returned **no hits**, so `evt-2023-adobe-figma-abandoned` cites a document whose relevant passage was not read here. Not a paywall — a 300-page filing exceeding the fetcher's window — so `verified: true` stands, but see §12.3. | verified (partial) |
| S15 | Atlassian Q4 and fiscal 2026 results (8-K Ex. 99.1) | Atlassian / SEC | https://www.sec.gov/Archives/edgar/data/0001650372/000165037226000031/ex991q4fy26.htm | 200, filing body read | Read verbatim: "Quarterly revenue of **$1,766 million, up 28%** year-over-year"; "Total revenue was **$6,572 million** for fiscal year 2026, **up 26%** from $5,215 million for fiscal year 2025". The 26% is exactly the claim in `evt-2026-atlassian-fy26` ("26% growth, a data point against AI shrinking seat-based SaaS"). | verified |
| S15b | Atlassian Q3 FY2026 shareholder letter (gross-margin guidance) | Atlassian / SEC | https://www.sec.gov/Archives/edgar/data/0001650372/000165037226000024/teamq32026shareholderlet.htm | 200, filing body read | Read verbatim: "**GAAP gross margin of 85%** increased 1 ppt and non-GAAP gross margin of 89%"; FY26 guidance "GAAP gross margin of **84.5%**". **Cited by nothing in the shipped data** (QA Q-14) — Atlassian's shipped gross-margin series is `modeled` from XBRL per §9, not taken from this letter. Genuine and read; simply orphaned. | verified |
| S15c | Atlassian Q3 FY2026 results (8-K Ex. 99.1) | Atlassian / SEC | https://www.sec.gov/Archives/edgar/data/0001650372/000165037226000024/ex991q3fy26.htm | 200, filing body read | Read verbatim: "Revenue of **$1,787 million, up 32% year-over-year**" (quarter ended 31 March 2026; $1,786.971M vs $1,356.716M). Second citation on `evt-2026-atlassian-fy26`. | verified |
| S16 | Anthropic tells investors annualized revenue run rate climbed to $65 billion in July | CNBC | https://www.cnbc.com/2026/08/17/anthropic-says-annualized-revenue-climbed-to-65-billion-in-july.html | **403 on direct fetch**; substance confirmed from a search engine's extract | cnbc.com refuses the fetcher. A follow-up search returned this exact URL and quoted **body** detail beyond the headline: run rate "**$65 billion** at the end of July, CNBC confirmed… about a **sevenfold** increase from a year ago", and "preliminary second-quarter revenue exceeding **$11.5 billion**, up from **$787 million** a year earlier". This is the figure behind `companies.ts:289` (Anthropic 2026 run rate, shipped `estimated`), `evt-2026-anthropic-run-rate`, and the two market rows at `markets.ts:521, 1088`. | verified (search extract) |
| S16b | OpenAI revenue 2026: reporting on leaked 2025 financials | ValueAdd VC (blog) | https://valueaddvc.com/blog/openai-revenue-2026-20b-arr-4b-month-path-to-profitability | 200, body read | Read: "OpenAI's annualized revenue run rate surged to **$40 billion** by August 2026 — roughly $3.3B a month"; "OpenAI recognized **$13.07B** of revenue in full-year 2025" per leaked audited financials; exit-2025 run rate **$21.4B**; 2024 **$3.7B**. Paired with S78 on the single OpenAI point (`companies.ts:1605`), which ships `estimated` with a 38–42 band. Registry `reliability: "low"` is right — this is a blog reporting leaked figures — but it was genuinely read, and it is the *readable* half of that pair. | verified |
| S17 | Anthropic's revenue run rate reportedly surpasses $65 billion pre-IPO | Axios (citing Bloomberg) | https://www.axios.com/2026/08/17/anthropic-revenue-run-rate-ipo-openai | **403 — bot-blocked, content not read**; only the headline was returned by search | axios.com refuses the fetcher and the follow-up search surfaced this URL with its **title only** — no body extract. Under the rule now in force that is the same class as S78: a headline is a claim about the article, not content. Used only as the *second* citation on `evt-2026-anthropic-run-rate`; the $65B figure itself is carried by S16, which was confirmed. **No data point is at risk if this is downgraded.** | unread — downgrade |
| S18 | US software stocks hit by Anthropic wake-up call on AI disruption | Reuters (via Yahoo Finance) | https://ca.finance.yahoo.com/news/us-software-stocks-hit-anthropic-154915906.html | 200, body read | Read verbatim: the S&P 500 software and services index "slid nearly **13%** over five straight sessions and is down **26%** from its October peak"; Salesforce, CrowdStrike, Adobe and Intuit down 2–6.6%; Thomson Reuters −2% after a 16% plunge; RELX and Wolters Kluwer −4% / −1.8%; and Anthropic's launch of "plugins for its Claude Cowork agent" across "legal, sales, marketing and data analysis". Backs `evt-2026-claude-cowork`, `evt-2026-software-selloff` and the disruption signals at `emerging.ts:127, 141, 366`. | verified |
| S18b | Claude Cowork and the end of enterprise software patience | GoLev | https://golev.com/post/claude-cowork-enterprise-software-selloff/ | 200, body read | Read: the Bloomberg estimate it relays — Anthropic's legal plug-in triggered "a **$285 billion** rout in stocks across the software, financial services and asset management sectors" — and a description of Claude Cowork executing "complex, multi-step tasks… on your behalf". Third citation on `evt-2026-software-selloff` and the signal at `emerging.ts:134`. `reliability: "low"` is correct: it relays a Bloomberg number rather than reporting one. | verified |
| S20 | Google completes $32 billion acquisition of Wiz | Cleary Gottlieb | https://www.clearygottlieb.com/news-and-insights/news-listing/google-completes-32-billion-acquisition-of-wiz | 200, body read | Read verbatim: "its **$32 billion** acquisition of Wiz, Inc., a leading cloud security platform" and "The deal closed on **March 11, 2026**". This is the `dealValue` of **32 USD_B** on `evt-2026-google-wiz-close` (`events.ts:1395–1398`) and the completion date; also cited on `evt-2025-google-wiz-announced` and the cloud-security signal at `emerging.ts:228`. Counsel's own deal announcement — close to primary, registry marks it `secondary`, which is conservative and fine. | verified |
| S21 | SpaceX agrees to acquire Cursor parent Anysphere for $60 billion in stock | Quartz | https://qz.com/spacex-buying-cursor-anysphere-60-billion-deal-061626 | **403 on direct fetch**; substance confirmed from a search engine's extract | qz.com refuses the fetcher. The follow-up search returned this exact URL plus its sibling Quartz pieces and quoted **body-level deal mechanics** that exist only inside the article: all-stock deal valuing Anysphere at **$60 billion**, announced **16 June 2026**, structured through a wholly owned SpaceX subsidiary "**X67 Inc.**" merging into Cursor, consideration in SpaceX Class A stock priced off a seven-day VWAP, expected to close in Q3 2026. That is the `dealValue` of **60 USD_B** on `evt-2026-spacex-anysphere` (`events.ts:1357–1360`), and S21 also backs `evt-2026-xai-spacex`, `markets.ts:476` and two `emerging.ts` signals (:25, :32). | verified (search extract) |
| S22 | Global venture funding in 2025 surged as startup deals and valuations set all-time records | Crunchbase News | https://news.crunchbase.com/venture/funding-data-third-largest-year-2025/ | 200, body read | Read verbatim: "**$425 billion** into more than 24,000 private companies in 2025" and "Roughly **50%** of all global venture funding in 2025 went to companies in AI-related fields", AI funding **$211 billion**, **+85%** YoY. Backs `evt-2025-ai-venture-share` ("AI takes close to half of global venture funding") and is the second citation on `evt-2025-google-wiz-announced`. | verified |
| S23 | Six charts that show the big AI funding trends of 2025 | Crunchbase News | https://news.crunchbase.com/ai/big-funding-trends-charts-eoy-2025/ | 200, body read | Read verbatim: "**$202.3 billion** has been invested in the AI sector in 2025 so far" and "AI captured close to **50%** of all global funding in 2025, **up from 34% in 2024**". First citation on `evt-2025-ai-venture-share`. Note the small tension with S22 ($211B AI funding, same publisher, later cut of the same dataset) — an end-of-year vs final-tally difference, not a conflict; the Atlas's claim is the *share*, which both give as ~50%. | verified |
| S24 | LLM inference price trends (Trends in AI dashboard) | Epoch AI | https://epoch.ai/data-insights/llm-inference-price-trends | 200, body read | Read verbatim: "The rate of decline varies dramatically depending on the performance milestone, ranging from **9x to 900x per year**"; GPT-4-level performance on GPQA Diamond fell at roughly **40x per year**; six benchmarks named (MMLU, GPQA Diamond, MATH-500, MATH 5, HumanEval, LMSys Arena ELO). Backs `evt-2026-inference-price-decline` ("roughly an order of magnitude a year" — a deliberately conservative reading of the 9x–900x range) and the cost-curve signals at `emerging.ts:39, 188, 274, 373, 397`. | verified |
| S25 | Gartner says worldwide AI spending will total $2.5 trillion in 2026 | Gartner | https://www.gartner.com/en/newsroom/press-releases/2026-1-15-gartner-says-worldwide-ai-spending-will-total-2-point-5-trillion-dollars-in-2026 | **403 on direct fetch**; substance confirmed from a search engine's extract | gartner.com refuses the fetcher. Search returned this exact URL and quoted body content: AI spending "**$2.52 trillion** in 2026, a **44%** increase year-over-year", AI-optimised servers **+49%** and 17% of total AI spending, AI infrastructure adding **$401 billion**, plus a named Lovelock quotation. **One discrepancy to flag:** `evt-2026-gartner-ai-spending` claims "**$2.59 trillion**", which is the **May 2026 update**, not this January release. The registry title acknowledges the update in parentheses but stores only the January URL; the same search surfaced the May release (`…2026-05-19-gartner-forecasts-worldwide-ai-spending-to-grow-47-percent-in-2026`) and a CIO Dive report of $2.59tn. See §12.3 — the data-engineer should add the May URL as a separate source or restate the event at $2.52tn. | verified (search extract) |
| S26 | Microsoft's Teams pledges satisfy EU Commission | Law Society Gazette (Ireland) | https://www.lawsociety.ie/gazette/top-stories/2025/september/microsofts-teams-pledges-satisfy-eu-commission/ | 200, body read | Read: the Commission accepted legally binding commitments on **12 September 2025**; Microsoft will "Make available versions of its product suites **without Teams and at a reduced price**" and "Allow customers to move their data out of Teams"; commitments run **seven years**, interoperability and data portability **ten years**. Backs three events — `evt-2020-slack-eu-complaint`, `evt-2023-eu-teams-investigation`, `evt-2025-eu-teams-commitments` — the last of which is the one this page actually reports; the first two rest on its narrative recap. | verified |
| S27 | Market reaction or overreaction? Anthropic's legal plugin and the facts so far | ComplexDiscovery | https://complexdiscovery.com/market-reaction-or-overreaction-anthropics-legal-plugin-and-the-facts-so-far/ | 200, body read | Read: Anthropic launched "specialized legal plugins for its Claude Cowork agentic desktop application" covering contract review, NDA triage and compliance workflows; Thomson Reuters **−18%**, RELX **−14%** ("its steepest single-day decline since 1988"), Wolters Kluwer **−13%**, LSEG **−8%**, Pearson/Sage/Experian −4–10%. Backs `evt-2026-claude-cowork`, `evt-2026-software-selloff` and `emerging.ts:127, 141`. Independently corroborates S18's account of the same two days. | verified |
| S28 | SEC XBRL company concept API (us-gaap / ifrs-full revenue and cost concepts) | U.S. Securities and Exchange Commission | https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/Revenues.json | **200, valid JSON body read (23 Sep 2026)** at the re-pointed concrete endpoint | **Row re-pointed in the Q-17 pass, and this is the registry's most consequential entry: 253 of 264 `reported` points cite S28.** The previously shipped URL was the bare API root, which returns no document for anyone — a genuine failure, not a client-side block (QA Q-19). The registry now stores a concrete concept endpoint, which I fetched myself this session: **HTTP 200**, JSON, `entityName` "**MICROSOFT CORPORATION**", `taxonomy` `us-gaap`, `tag` `Revenues`, with the three annual facts the Atlas ships for the pre-2011 Microsoft series — **FY2008 (end 2008-06-30) $60,420,000,000; FY2009 (end 2009-06-30) $58,437,000,000; FY2010 (end 2010-06-30) $62,484,000,000**, all `form` 10-K, `accn` 0001193125-10-171791, `filed` 2010-07-30. Those are exactly the 60.420 / 58.437 / 62.484 USD_B rows in §1.1. The response carries the `end`, `fy`, `form` and `accn` fields §0 of this log describes, so the API contract behind every other company series is re-confirmed too. **QA Q-19 is resolved: the stored URL now returns a document.** | verified |
| S39 | Databricks grows >80% YoY, surpasses $7B revenue run-rate | Databricks | https://www.databricks.com/company/newsroom/press-releases/databricks-grows-80-yoy-surpasses-7b-revenue-run-rate-scales | 200, body read | Read verbatim: "Growing **>80% year over year**, surpassing **$7B revenue run-rate**" and "closed a $5 billion strategic funding round at a **$190 billion** valuation", dated **13 August 2026**. Backs the single Databricks run-rate point at `companies.ts:757`, which ships `estimated` because a run-rate is not GAAP revenue (§2 of this log). | verified |
| S40 | IBM closes landmark acquisition of Red Hat for $34 billion | Red Hat | https://www.redhat.com/en/about/press-releases/ibm-closes-landmark-acquisition-red-hat-34-billion-defines-open-hybrid-cloud-future | 200, body read | Read verbatim: "**$190.00 per share** in cash, representing a total equity value of approximately **$34 billion**", closing **9 July 2019**. Exactly the `dealValue` of **34 USD_B** on `evt-2019-ibm-red-hat` (`events.ts:784–787`). Company press release at the moment of closing — primary. | verified |
| S41 | Microsoft to acquire Activision Blizzard… | Microsoft | https://news.microsoft.com/source/2022/01/18/microsoft-to-acquire-activision-blizzard-to-bring-the-joy-and-community-of-gaming-to-everyone-across-every-device/ | 200, body read | Read verbatim: "**$95.00 per share**, in an all-cash transaction" valued at "**$68.7 billion**, inclusive of Activision Blizzard's net cash", announced **18 January 2022**. Exactly the `dealValue` of **68.7 USD_B** on `evt-2022-microsoft-activision-announced` (`events.ts:917–920`); also the second citation on `evt-2023-microsoft-activision-close`. Note this is the **announced** value, which is the right basis for an `announced`-status event. | verified |
| S42 | Broadcom completes acquisition of VMware | Broadcom | https://investors.broadcom.com/news-releases/news-release-details/broadcom-completes-acquisition-vmware | **two 60s timeouts on direct fetch**; substance then confirmed from a search engine's extract | The Broadcom IR host would not complete a response for this fetcher on either attempt. Search returned this exact URL (plus the `investors.broadcom.com/node/61541/pdf` and `broadcom.com/company/news/financial-releases/61541` copies) with body content: completion **22 November 2023**, each VMware share converted into **$142.50 cash or 0.2520 Broadcom shares**, prorated **50/50**, and a Hock Tan quotation. **The release states no total deal value.** The Atlas's `dealValue` of **69 USD_B** on `evt-2023-broadcom-vmware` therefore is *not* on the cited page; §3 of this log derived ~$69B (≈$61B cash and stock + ≈$8B assumed debt) from the VMware 8-K, and the same search surfaced a Globe and Mail headline of **$84.2 billion** on a third basis. See §12.3. | verified (search extract) — value citation mismatched |
| S43 | Oracle completes acquisition of Cerner | Oracle | https://www.oracle.com/news/announcement/oracle-completes-acquisition-of-cerner-2022-06-07/ | **403 on direct fetch**; substance confirmed from a search engine's extract | oracle.com/news refuses the fetcher. Search returned this exact URL with the release's own content: all-cash tender offer at **$95.00 per share**, "approximately **US$28.3 billion** in equity value", **204,280,589 shares (69.2%)** validly tendered by the 6 June deadline, closing **8 June 2022**. That is the `dealValue` of **28.3 USD_B** on `evt-2022-oracle-cerner` (`events.ts:955–958`), and matches §3 of this log. | verified (search extract) |
| S44 | Salesforce completes acquisition of Slack | Salesforce | https://www.salesforce.com/news/press-releases/2021/07/21/salesforce-slack-deal-close/ | 200, body read | Read: "Salesforce (NYSE: CRM)… today announced it has **completed its acquisition of Slack Technologies, Inc.**", dated **21 July 2021**. **The release discloses no price** — confirmed by reading it. So the completion *date* on `evt-2021-salesforce-slack` is fully sourced, but the `dealValue` of **27.7 USD_B** at `events.ts:878–883` is **not stated anywhere on the cited page**; §3 of this log recorded it as carried over from `research.md`, not as read from this URL. See §12.3. | verified — value citation mismatched |
| S45 | Cisco completes its $28B acquisition of Splunk | SiliconANGLE | https://siliconangle.com/2024/03/18/cisco-completes-28b-acquisition-splunk/ | 200, body read | Read: **$28 billion**, **$157 per share** all-cash, completed **18 March 2024**, "the largest acquisition in the networking giant's four-decade history", 31% premium, announced September 2023. That is the `dealValue` of **28 USD_B** on `evt-2024-cisco-splunk-close` (`events.ts:1077–1082`); S45 also backs `evt-2023-cisco-splunk-announced`. Matches §3 of this log, which used Cisco's own IR release for the same numbers. | verified |
| S46 | Microsoft to acquire LinkedIn | Microsoft | https://news.microsoft.com/source/2016/06/13/microsoft-to-acquire-linkedin/ | 200, body read | Read verbatim: "Microsoft will acquire LinkedIn for **$196 per share** in an all-cash transaction valued at **$26.2 billion**", announced **13 June 2016**. Exactly the `dealValue` of **26.2 USD_B** on `evt-2016-microsoft-linkedin` (`events.ts:701–704`). Matches §3. | verified |
| S47 | IBM closes $6.4B HashiCorp acquisition | TechCrunch | https://techcrunch.com/2025/02/27/ibm-closes-6-4b-hashicorp-acquisition/ | 200, body read | Read: **$6.4 billion**, closed **27 February 2025**, "two days after the U.K.'s antitrust regulator gave the deal its blessing", ~10 months after the April 2024 announcement. That is the `dealValue` of **6.4 USD_B** on `evt-2025-ibm-hashicorp` (`events.ts:1223–1226`). Note the 27 vs 28 February one-day discrepancy already recorded in §3 (IBM's own PR Newswire release says 28 Feb); the event should not assert a day. | verified |
| S48 | NIST releases first 3 finalized post-quantum encryption standards | NIST | https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards | 200, body read | Read: release date **13 August 2024**; **FIPS 203** (ML-KEM, ex-CRYSTALS-Kyber, "primary standard for general encryption"), **FIPS 204** (ML-DSA, ex-CRYSTALS-Dilithium, "primary standard for protecting digital signatures"), **FIPS 205** (SLH-DSA, ex-Sphincs+, backup). Resolves the §9.3 date question in `research.md` and backs `evt-2024-nist-pqc-standards` plus the two post-quantum signals at `emerging.ts:520, 534`. Corroborates §4 of this log, which used the Federal Register notice (14 Aug 2024 publication of the 13 Aug announcement). | verified |
| S49 | Linux Foundation announces the formation of the Agentic AI Foundation | Linux Foundation | https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation | 200, body read | Read: dated **9 December 2025**; founding contributions are **MCP (Anthropic)**, **goose (Block)** and **AGENTS.md (OpenAI)**; Jim Zemlin quoted on "the transparency and stability that only open governance provides". Resolves the MCP-governance-transition date in `research.md` §9.3 and backs `evt-2025-mcp-linux-foundation` plus four `emerging.ts` signals (:235, :281, :312, :319). Corroborates §4 of this log, which used the MCP project blog post of the same date. | verified |
| S50 | Microsoft to acquire GitHub for $7.5 billion | Microsoft | https://news.microsoft.com/source/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/ | 200, body read | Read verbatim: "Microsoft will acquire GitHub for **$7.5 billion in Microsoft stock**", announced **4 June 2018**. Exactly the `dealValue` of **7.5 USD_B** on `evt-2018-microsoft-github` (`events.ts:761–764`); also cited by the developer-tooling signal at `emerging.ts:46`. Note the consideration is stock, not cash — worth keeping in the event's `impact` text. | verified |
| S51 | Oracle buys PeopleSoft | Oracle | https://www.oracle.com/corporate/pressrelease/oracle-buys-peoplesoft-121304.html | **403 on direct fetch**; substance confirmed from a search engine's extract | oracle.com refuses the fetcher. Search returned this exact URL and the release's content: "definitive merger agreement to acquire PeopleSoft, Inc., for **$26.50 per share** (approximately **$10.3 billion**)", dated **13 December 2004**, "should close by early January". That is the `dealValue` of **10.3 USD_B** on `evt-2005-oracle-peoplesoft-close` (`events.ts:553–556`); S51 also backs `evt-2003-oracle-peoplesoft-bid`. Matches §3. | verified (search extract) |
| S52 | Twenty years since Oracle bought two software rivals in one | The Register | https://www.theregister.com/software/2025/01/02/20-years-since-oracle-bought-two-software-rivals-in-one/1202333 | 200, body read (**this is the corrected URL**; the previously shipped AMP path 404'd — QA Q-02, fixed by the data-engineer) | Read: PeopleSoft final value **$10.3B**, closed **7 January 2005**, from an initial June 2003 hostile bid of **$5.1B**; PeopleSoft had bought **JD Edwards for $1.7B** days earlier, making it "the world's second-largest enterprise software company"; Oracle laid off "around half of PeopleSoft's workforce" days after completion; **Sun $7.4B (2009)**; Applications Unlimited support "until at least 2035". Backs four events — `evt-2003-oracle-peoplesoft-bid`, `evt-2005-oracle-peoplesoft-close`, `evt-2006-oracle-siebel`, `evt-2010-oracle-sun`. **One discrepancy, harmless:** this article puts Siebel at **$3.61B** where §3 of this log recorded the announced **$5.85B**; `evt-2006-oracle-siebel` ships **no `dealValue`**, so nothing in the Atlas depends on the difference. | verified |
| S53 | Epic Games' Ninth Circuit win affirming civil contempt finding against Apple | Cravath, Swaine & Moore | https://www.cravath.com/news-insights/epic-games-ninth-circuit-win-affirming-civil-contempt-finding.html | 200, body read | Read: **11 December 2025**; the Ninth Circuit "unanimously affirmed" the district court's civil-contempt finding of **wilful violation** of the permanent injunction, quoting "Apple claimed to comply with the injunction, but it instead prohibited developers from using buttons, links, and other calls to action without paying a prohibitive commission". Backs `evt-2025-epic-apple-contempt` and, for the underlying 2021 injunction, `evt-2021-epic-apple-injunction`. Counsel of record for Epic — as close to primary as a non-court source gets; registry says `secondary`, which is conservative. | verified |
| S54 | Elastic license update | Elastic | https://www.elastic.co/blog/elastic-license-update | 200, body read | Read: Elasticsearch and Kibana moved **from Apache 2.0 to dual Elastic License / SSPL** starting with **version 7.11**, announced **January 2021**; ELv2 described as "a permissive, fair-code license… with only three simple limitations". Backs `evt-2021-elastic-license-change`. Primary — the vendor's own announcement of its own licence. | verified |
| S55 | Elasticsearch is open source, again | Elastic | https://www.elastic.co/blog/elasticsearch-is-open-source-again | 200, body read | Read: **AGPL added** "as another license option next to ELv2 and SSPL", posted **29 August 2024** by founder **Shay Banon**, who attributes the 2021 change to market confusion caused by AWS and frames AGPL as restoring an OSI-approved option **without removing** the existing licences. Backs `evt-2024-elastic-agpl`. The "added, not replaced" detail matters and is correctly reflected in the event title. | verified |
| S56 | Redis returns to open source after damaging community relationship | Techzine Global | https://www.techzine.eu/news/infrastructure/131056/redis-returns-to-open-source-after-damaging-community-relationship/ | 200, body read | Read: Redis moved to **SSPL in March 2024** to stop AWS and Google Cloud "benefiting from Redis without making commensurate contributions"; **Valkey** forked "under the Linux Foundation"; a 2024 survey found **83%** of large Redis users had adopted or were testing Valkey; Redis then adopted **AGPLv3** in 2025 because the OSI "did not recognize the SSPL… as a true open source license". Backs both `evt-2024-redis-license-change` and `evt-2024-valkey-fork`. | verified |
| S57 | Amazon Elasticsearch Service is now Amazon OpenSearch Service | AWS | https://aws.amazon.com/blogs/aws/amazon-elasticsearch-service-is-now-amazon-opensearch-service-and-supports-opensearch-10 | ECONNRESET on the first attempt; **200 and body read on retry** | Read: the rename to **Amazon OpenSearch Service**, support for **OpenSearch 1.0**, dated **8 September 2021**, with AWS's own framing of its commitment to the OpenSearch project. Backs `evt-2021-opensearch-fork` — the fork's existence and date, not a number. Primary: AWS announcing its own service. | verified |
| S58 | Salesforce completes acquisition of Tableau | Salesforce | https://www.salesforce.com/news/press-releases/2019/08/01/salesforce-completes-acquisition-of-tableau/ | 200, body read | Read: "today announced it has **completed its acquisition of Tableau Software**", dated **1 August 2019**. **The release discloses no price** — confirmed by reading it. The completion date on `evt-2019-salesforce-tableau` is sourced; the `dealValue` of **15.7 USD_B** (`events.ts:807–810`) is **not on this page**. §3 of this log took 15.7 from the *June 2019 definitive-agreement* release (enterprise value net of cash) and flagged a `conflict` with CNBC's $15.3B equity value. See §12.3. | verified — value citation mismatched |
| S59 | Oracle buys enterprise cloud services company NetSuite for $9.3B | TechCrunch | https://techcrunch.com/2016/07/28/oracle-buys-enterprise-cloud-services-company-netsuite-for-9-3b/ | 200, body read | Read verbatim: "Oracle will acquire NetSuite for about **$9.3 billion**, or **$109 per share** in an all-cash deal, the companies announced Thursday", **28 July 2016**. That is the `dealValue` of **9.3 USD_B** on `evt-2016-oracle-netsuite` (`events.ts:724–729`). Matches §3, which used Oracle's own release; note §3 established the **tender-offer close as 7 Nov 2016**, which this announcement-day article does not carry. | verified |
| S60 | Nuance completes $19.7 billion sale to Microsoft | Paul, Weiss | https://www.paulweiss.com/insights/client-news/nuance-completes-197-billion-sale-to-microsoft | 200, body read | Read: value **$19.7 billion**, completion **4 March 2022**. That is the `dealValue` of **19.7 USD_B** on `evt-2022-microsoft-nuance` (`events.ts:978–981`). Matches §3, which used Microsoft's own completion release. The page is a short deal notice by counsel: it carries the value and date and nothing more, which is all the Atlas takes from it. | verified |
| S61 | The App Store turns 10 | Apple | https://www.apple.com/newsroom/2018/07/app-store-turns-10/ | 200, body read | Read: the App Store opened **10 July 2008 with 500 apps**; developers "have earned over **$100 billion**" as of June 2018. Backs `evt-2008-app-store` (the platform-commission event) and is the second citation on `evt-2007-iphone`. Apple's own newsroom — primary for its own launch date. | verified |
| S62 | Twenty years of Amazon S3 and building what's next | AWS | https://aws.amazon.com/blogs/aws/twenty-years-of-amazon-s3-and-building-whats-next/ | 200, body read | Read: S3 launched **14 March 2006** via "a modest one-paragraph announcement on the What's New page"; today "more than **500 trillion objects**" and "more than **200 million requests per second**"; launch capacity ~1 PB with a 5 GB max object size, now 50 TB. Backs `evt-2006-aws-launch` — the founding date of the cloud-infrastructure market, and therefore the `originYear` logic of the flagship market. | verified |
| S63 | Timeline of Amazon Web Services | Wikipedia | https://en.wikipedia.org/wiki/Timeline_of_Amazon_Web_Services | 200, body read | Read: **S3 14 March 2006**, **SQS 13 July 2006**, **EC2 25 August 2006**. Used as the second citation on `evt-2006-aws-launch`, whose title is "Amazon launches S3, followed by EC2" — the **EC2 ordering and date** are exactly what this source supplies, since S62 covers S3 only. `reliability: "low"` is correctly set for an encyclopaedia; it backs a sequence of dates, not a figure, and the S3 date agrees with the AWS primary. | verified |
| S64 | ChatGPT, the generative AI chatbot, is released | History.com | https://www.history.com/this-day-in-history/november-30/chatgpt-released-openai | 200, body read | Read: released **30 November 2022**; 1 million users in five days; 100 million monthly users by January 2023, "the fastest-growing consumer app in history" per UBS; ~800 million weekly users by early November 2025. Backs `evt-2022-chatgpt-launch` — a date and an adoption curve, no Atlas number depends on it. | verified |
| S65 | Microsoft Teams rolls out to Office 365 customers worldwide | Microsoft | https://news.microsoft.com/source/2017/03/14/microsoft-teams-rolls-out-to-office-365-customers-worldwide/ | 200, body read | Read: general availability **14 March 2017**, "available to Office 365 business customers in **181 markets and 19 languages**", positioned inside the Office 365 suite alongside Outlook, SharePoint, Yammer and Skype for Business. Backs `evt-2017-microsoft-teams` — the bundling event that the whole Slack/Teams case study turns on, so the "shipped inside the suite" framing being in Microsoft's own words matters. | verified |
| S66 | Adobe scraps Creative Suite software licenses in favor of cloud subscriptions | Macworld | https://www.macworld.com/article/220927/adobe-scraps-software-licenses-in-favor-of-cloud-subscription-scheme-for-creative-suite-line.html | 200, body read | Read: **6 May 2013**; Adobe stops selling perpetual licences for new Creative Suite software and moves to Creative Cloud subscriptions; "CS6 and all of its component apps will continue to be available just as they are today"; "We have no plans at this time to update CS6"; Adobe's Scott Morris quoted calling the shift "huge". Backs `evt-2013-adobe-creative-cloud`, the pricing-shift case study, alongside S14. | verified |
| S67 | Digital Markets Act: Commission designates six gatekeepers | European Commission | https://ec.europa.eu/commission/presscorner/api/files/document/print/en/ip_23_4328/IP_23_4328_EN.pdf | **200, a real 265.9 KB PDF document returned** (23 Sep 2026) — but this fetcher could not extract text from it, so the body was not read as text in this pass | **Row re-pointed in the Q-17 pass**: the registry adopted the machine-readable PDF path this log recommended, so the old `presscorner/detail` row no longer matched anything shipped. Honest status: the URL now returns a **document** rather than a JavaScript shell (the substantive fix), but my client returned it as binary and could not render it. Substance re-confirmed the same day from a search that returned **this exact PDF URL** and its content: designation on **6 September 2023**, "six gatekeepers — **Alphabet, Amazon, Apple, ByteDance, Meta, Microsoft**", "**22 core platform services**", six months to comply. Backs `evt-2023-dma-gatekeepers` and the regulation signal at `emerging.ts:489`. | verified (search extract) |
| S68 | Digital Markets Act: gatekeepers must comply with all obligations from March 2024 | European Commission | https://ec.europa.eu/commission/presscorner/api/files/document/print/en/ip_24_1342/IP_24_1342_EN.pdf | **200, 46.2 KB PDF returned and read (23 Sep 2026)** at the re-pointed URL | **Row re-pointed in the Q-17 pass**: the registry adopted the PDF path, which is the URL this log had actually read (the old row cited the JavaScript-shell `presscorner/detail` route). Re-read: "Designated gatekeepers **must now comply with all obligations under the Digital Markets Act**", effective **7 March 2024**, with compliance reports published on `digital-markets-act-cases.ec.europa.eu`. Backs `evt-2024-dma-compliance` and the second half of the regulation signal at `emerging.ts:489`. | verified |
| S69 | 10 years of Kubernetes | Kubernetes project | https://kubernetes.io/blog/2024/06/06/10-years-of-kubernetes/ | 200, body read (truncated part-way through the retrospective) | Read: Kubernetes was **first open-sourced on 6 June 2014**, "when the first commit was pushed to GitHub", containing **250 files and 47,501 lines** of Go, Bash and Markdown. That is exactly the claim in `evt-2014-kubernetes` ("Google open-sources Kubernetes"). S69 is **also** cited by `evt-2013-docker` — the retrospective's Docker context was **not reached** before truncation, so that second citation is weaker than the first. See §12.3. | verified (partial) |
| S70 | Microsoft launches Office 365 globally | Microsoft | https://news.microsoft.com/source/2011/06/28/microsoft-launches-office-365-globally/ | 200, body read | Read: launched **28 June 2011** in **40 markets**; small-business entry at "**$6 (U.S.) per user, per month**", plans "from $2 to $27 per user per month". Backs `evt-2011-office-365` ("Microsoft launches Office 365 as a monthly subscription") — the per-seat-per-month pricing model is the point of the event and is quoted directly from the vendor. | verified |
| S71 | Windows Azure general availability | Microsoft | https://blogs.microsoft.com/blog/2010/02/01/windows-azure-general-availability/ | 200, body read | Read: **1 February 2010**, "the general availability of Windows Azure and SQL Azure in **21 countries**", production applications supported by "the full Service Level Agreements". Backs `evt-2010-azure-ga`, the anchor date of the Microsoft cloud-pivot case study. | verified |
| S72 | Thoma Bravo completes acquisition of Coupa Software | Thoma Bravo | https://www.thomabravo.com/press-releases/thoma-bravo-completes-acquisition-of-coupa-software | 200, body read | Read: "approximately **$8.0 billion** in an all-cash transaction", **$81.00 per share**, announced 12 December 2022, stockholder approval 23 February 2023, closed **28 February 2023**. That is the `dealValue` of **8 USD_B** on `evt-2023-coupa-thoma-bravo` (`events.ts:1185–1188`) — one of the PE take-private examples §3 of this log could not value at the time, now sourced. | verified |
| S73 | Anaplan to be acquired by Thoma Bravo for $10.7 billion (8-K exhibit) | Anaplan / SEC | https://www.sec.gov/Archives/edgar/data/1540755/000119312522079976/d243192dex99.htm | 200, filing exhibit read | Read verbatim: "Anaplan stockholders to receive **$66.00 per share** in cash", transaction valued at "approximately **$10.7 billion**", dated **20 March 2022**. That is the `dealValue` of **10.7 USD_B** on `evt-2022-anaplan-thoma-bravo` (`events.ts:1162–1165`). SEC-filed exhibit — primary, and the strongest of the PE take-private citations. Note this is the **announced** value; the deal ultimately closed in June 2022 at a reduced $63.75/share, which the Atlas does not claim. | verified |
| S74 | Salesforce completes acquisition of Informatica | Salesforce | https://www.salesforce.com/news/press-releases/2025/11/18/salesforce-completes-acquisition-of-informatica/ | 200, body read | Read: "today announced it has **completed its acquisition of Informatica**", dated **18 November 2025**. **No price is disclosed on the page** — confirmed by reading it. So the completion date on `evt-2025-salesforce-informatica` is sourced, but the `dealValue` of **8 USD_B** (`events.ts:1270–1275`) is **not on the cited page**; §3 of this log had already recorded "value not verified this session" for this deal. S74 also backs two `emerging.ts` signals (:326, :442). See §12.3. | verified — value citation mismatched |
| S75 | Snowflake more than doubles in market debut, largest ever software IPO | CNBC | https://www.cnbc.com/2020/09/16/snowflake-snow-opening-trading-on-the-nyse.html | **403 on direct fetch**; substance confirmed from a search engine's extract | cnbc.com refuses the fetcher. Search returned this exact URL with body content: priced at **$120**, opened at **$245** (~**104%** above the IPO price) on **16 September 2020**, raised nearly **$3.4 billion** at a **$33.2 billion** valuation, "the largest software IPO ever". Backs `evt-2020-snowflake-ipo`; no `dealValue` is attached to that event, so only the claim of record size is at stake and it is directly quoted. | verified (search extract) |
| S76 | Microsoft's $68.7B Activision acquisition clears final hurdle as UK approves restructured deal | TechCrunch | https://techcrunch.com/2023/10/12/microsofts-68-7b-activision-acquisition-clears-final-hurdle-as-uk-approves-restructured-deal/ | 200, body read | Read: **$68.7 billion**; the CMA approved the restructured deal after Microsoft agreed to **divest Activision's cloud-streaming rights to Ubisoft for 15 years** outside the EEA, with the CMA chief executive quoted on avoiding "a stranglehold over this important and rapidly developing market"; article dated **12 October 2023**, the deal closing 13 October. First citation on `evt-2023-microsoft-activision-close`, which carries **no `dealValue` of its own** (the 68.7 sits on the announcement event, sourced to S41). §3 flagged a `conflict` against a $75.4B "total cost" figure on a different basis; the Atlas keeps $68.7B, which is what both S41 and S76 state. | verified |
| S78 | OpenAI's revenue run rate tops $40 billion ahead of IPO | Bloomberg | https://www.bloomberg.com/news/articles/2026-08-13/openai-s-revenue-run-rate-tops-40-billion-ahead-of-ipo | **403 — paywall/bot wall, content not read** (this session), consistent with the earlier "article body is paywalled and was not read" at line 535 of this log | **Already `verified: false` in the registry**, per QA's Q-03 recommendation accepted by the orchestrator — so no action is needed. Recorded here for completeness: the $40B run rate it headlines is paired with **S16b**, which *was* read and states the same figure, on the single OpenAI point at `companies.ts:1605`, shipped `estimated` with a 38–42 band. The URL is correctly retained. | unread — already `verified: false` |
| S80 | IBM Form 8-K, Exhibit 99.3 — unaudited pro forma condensed consolidated financial information (Kyndryl separation) | IBM / SEC | https://www.sec.gov/Archives/edgar/data/51143/000155837021014643/ibm-20211103xex99d3.htm | 200, filing exhibit read | Read verbatim: "On **November 3, 2021** (the 'Separation Date'), International Business Machines Corporation… completed the previously announced separation of its **managed infrastructure services business**", with the pro forma restatement — **2020: $18.4B removed from $73.6B → $55.2B continuing**; 2019: $19.4B from $77.1B → $57.7B; 2018: $21.1B from $79.6B → $58.5B. This is the source the data-engineer added to fix QA Q-04: it is the documentary basis for annotating IBM's FY2020 → FY2021 revenue drop (73.620 → 57.350 USD_B) as a **divestiture, not organic decline**, exactly as §1.7 of this log warned. The magnitude here ($18.4B of 2020 revenue) accounts for essentially the whole apparent collapse. | verified |
| S81 | IBM completes separation of Kyndryl | IBM | https://www.ibm.com/investor/news/ibm-completes-separation-of-kyndryl | 200, body read (23 Sep 2026) | Read verbatim: "On **November 3, 2021**, IBM completed the separation of Kyndryl into an independent publicly traded company." Release dated **4 November 2021**. The page carries **no Kyndryl revenue or headcount figures** — the pro forma magnitudes behind the IBM series break come from S80, which states them. Second citation on `evt-2021-ibm-kyndryl` (`events.ts:914`), where its job is to supply the separation date in IBM's own words. | verified |
| S82 | Salesforce signs definitive agreement to acquire Slack (enterprise value ≈ $27.7B) | Salesforce | https://www.salesforce.com/news/press-releases/2020/12/01/salesforce-definitive-agreement-update/ | 200, body read (23 Sep 2026) | Read verbatim: enterprise value "**approximately $27.7 billion** based on the closing price of Salesforce's common stock on **November 30, 2020**"; consideration "**$26.79 in cash and 0.0776 shares** of Salesforce common stock for each Slack share"; release dated **1 December 2020**. **This is the page that repairs the §12.3 mismatch** on `evt-2021-salesforce-slack`: the `dealValue` of 27.7 USD_B (`events.ts:883`) now cites a page that states it, with S44 retained for the completion date only. | verified |
| S83 | Salesforce signs definitive agreement to acquire Tableau (enterprise value $15.7B net of cash) | Salesforce | https://www.salesforce.com/news/press-releases/2019/06/10/salesforce-signs-definitive-agreement-to-acquire-tableau/ | 200, body read (23 Sep 2026) | Read verbatim: enterprise value "**$15.7 billion** (net of cash)"; "each share of Tableau Class A and Class B common stock will be exchanged for **1.103 shares** of Salesforce common stock"; valuation struck on "the trailing 3-day volume weighted average price of Salesforce's shares as of **June 7, 2019**"; dated **10 June 2019**. Repairs the §12.3 mismatch on `evt-2019-salesforce-tableau`. **Bears directly on QA Q-25:** the page states **$15.7B and not $15.3B**, so the `low: 15.3` band endpoint at `events.ts:808` remains unattributed to anything in the registry — either cite a page that carries 15.3 or drop the band. | verified |
| S84 | Salesforce signs definitive agreement to acquire Informatica (≈ $8B equity value) | Salesforce | https://www.salesforce.com/news/press-releases/2025/05/27/salesforce-signs-definitive-agreement-to-acquire-informatica/ | 200, body read (23 Sep 2026) | Read verbatim: "approximately **$8 billion in equity value**, net of Salesforce's current investment in Informatica"; "Holders of Informatica's Class A and Class B-1 common stock will receive **$25 in cash per share**"; dated **27 May 2025**. Repairs the §12.3 mismatch on `evt-2025-salesforce-informatica` (`events.ts:1287`); S74 is retained for the completion date, and the shipped band correctly reflects the equity-vs-enterprise-value difference the release itself implies. | verified |
| S85 | Broadcom to acquire VMware for ≈ $61B in cash and stock (VMware Form 8-K, Ex. 99.1) | VMware / SEC | https://www.sec.gov/Archives/edgar/data/1124610/000119312522161168/d362256dex991.htm | 200, filing exhibit read (23 Sep 2026) | Read verbatim: "Broadcom will acquire all of the outstanding shares of VMware in a cash-and-stock transaction that **values VMware at approximately $61 billion**"; "Broadcom will **assume $8 billion of VMware net debt**"; "either **$142.50 in cash or 0.2520 shares** of Broadcom common stock for each VMware share", "total **$138.23** per-share consideration"; announced **26 May 2022**. **This is the documentary basis for the §12.3 fix** on `evt-2023-broadcom-vmware`: $61B equity + $8B assumed net debt is exactly the ~$69B derivation, which is why the event now ships `estimated` (`events.ts:1030`) rather than citing Broadcom's completion release (S42), which states no total value. | verified |
| S86 | Gartner forecasts worldwide AI spending to grow 47% in 2026 (May 2026 update) | Gartner | https://www.gartner.com/en/newsroom/press-releases/2026-05-19-gartner-forecasts-worldwide-ai-spending-to-grow-47-percent-in-2026 | **403 — bot-blocked on direct fetch, no body returned to me** (23 Sep 2026); substance then confirmed from a search engine's extract of this exact URL | gartner.com refuses this fetcher, exactly as for S02 and S25. A search returned **this exact URL** and quoted content from inside the release, not just the headline: worldwide AI spending "**$2.59 trillion** in 2026, a **47%** increase year-over-year", announced **19 May 2026**, with the John-David Lovelock attribution that AI infrastructure — "AI-optimized IaaS, AI-optimized servers, AI network fabric, AI processing semiconductors and devices" — accounts for "**over 45%** of spending", and the note that this revises the earlier **$2.52 trillion / 44%** forecast. Ships `verified: false`; QA (Q-23) separately reports fetching and reading the page with a browser user agent this session. **Upgrade recommended — see §12.7.** | verified (search extract) |
| S87 | Global AI spend to reach $2.59 trillion in 2026 | CIO Dive | https://www.ciodive.com/news/global-AI-spend-2026/820656/ | 200, body read (23 Sep 2026) | Read verbatim: "Global spending on AI will rise by **47%** year-over-year in 2026, totaling **$2.59 trillion**"; "Vendor-driven AI infrastructure that supports AI work — including AI-optimized IaaS, AI-optimized servers, AI network fabric, AI processing semiconductors and devices — accounted for **more than 45%** of spending"; attributed to Gartner, dated **19 May 2026**. This is the **readable** citation behind `evt-2026-gartner-ai-spending`'s $2.59tn and the fix for the §12.3 item on S25, whose URL is the January release ($2.52tn). | verified |
| S88 | Adobe Form 8-K, Item 1.02 — termination of the Figma merger agreement and the $1,000,000,000 fee | Adobe / SEC | https://www.sec.gov/Archives/edgar/data/796343/000079634323000254/adbe-20231217.htm | 200, filing read (23 Sep 2026) | Read verbatim: "On **December 17, 2023**, the Company and Figma mutually agreed to terminate the Merger Agreement", and "the Company will make a cash payment to Figma in the previously agreed amount of **one billion dollars ($1,000,000,000)**" "within three business days following the date thereof"; the merger agreement itself dated **15 September 2022**. **Repairs the §12.3 item on `evt-2023-adobe-figma-abandoned`**, which previously leaned on S14 (the 10-K), whose Figma passage sits beyond the fetcher's window. The event now cites S88 alone (`events.ts:1222`) and the $1B fee is quoted from the filing that states it. | verified |
| S89 | AI spending forecasts 2026: Gartner, IDC and Stanford compiled | Digital Applied | https://www.digitalapplied.com/blog/ai-spending-forecasts-2026-gartner-idc-stanford-compiled | 200, body read (23 Sep 2026) | Read: AI **software** spending of **$452 billion** for 2026 ("enterprise software with AI features, distinct from agent software") and an **AI cybersecurity** segment of **$51 billion**, both attributed to **Gartner's January 2026** detailed release, with the page's own caveat that the May 2026 update "only republished the total and selected revisions", so the segment lines are of the January vintage. Backs the segment-level signals at `emerging.ts:93, 221, 267` and is the fourth citation on `evt-2026-gartner-ai-spending`. `reliability: "low"` is correct — a compilation blog, not the forecaster — and the Atlas uses it only for segment lines Gartner's own host will not serve. | verified |
| S90 | Use the GPT Realtime API for speech and audio with Azure OpenAI | Microsoft Learn | https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio | 200, full page read (23 Sep 2026) | Every clause the Atlas quotes is on the page. Connection-method table: "**SIP** — Telephony integration — Best for **call centers, IVR systems, phone-based applications**". Use cases: "a great fit for use cases involving live interactions between a user and a model, such as **customer support agents**, voice assistants, and real-time translators". MCP: "provide the **URL of a remote MCP server** in your session configuration… **any tools available on that server will be accessible immediately**", with the documented example `"server_url": "https://mcp.stripe.com"`. Doc dated **29 July 2026**. Backs `emerging.ts:281, 319, 397`. | verified |
| S91 | Amazon Aurora PostgreSQL now supports the pgvector extension | Amazon Web Services | https://aws.amazon.com/about-aws/whats-new/2023/07/amazon-aurora-postgresql-pgvector-vector-storage-similarity-search/ | 200, body read (23 Sep 2026) | Read verbatim: "Amazon Aurora PostgreSQL-Compatible Edition now supports the **pgvector** extension to **store embeddings from machine learning (ML) models** in your database and to perform efficient **similarity searches**", dated **13 July 2023** (Aurora PostgreSQL 15.3, 14.8, 13.11, 12.15 and higher). That is exactly the quotation at `emerging.ts:441`. Primary: AWS announcing its own service. | verified |
| S92 | Gartner's $244.2B security forecast — 17x more on AI tools than on securing AI | Software Strategies Blog (reporting Gartner) | https://softwarestrategiesblog.com/2026/03/24/information-security-spending-2026/ | 200, body read (23 Sep 2026) | Read verbatim: "information security spending accelerates to **$244.2 billion**, up **13.3%**"; enterprises invest "**17 times more** in AI-powered security tools than in securing the AI on which those tools run"; **AI-amplified security $49 billion** in 2025 against **securing AI $2.8 billion**, "representing **5.5%** of the AI cybersecurity market". Backs `emerging.ts:235, 514`. `reliability: "low"` is right — it relays Gartner rather than publishing it — and both Atlas signals present it as such. | verified |
| S93 | State of the post-quantum Internet in 2025 | Cloudflare | https://blog.cloudflare.com/pq-2025/ | 200, body read (23 Sep 2026), plus a targeted second fetch for exact strings | Read: "Today **over half of human-initiated traffic** with Cloudflare is protected against **harvest-now/decrypt-later** with post-quantum encryption", reached in "the last week of October 2025"; X25519MLKEM768 enabled by default in "all major browsers", **OpenSSL April 2025**, **Go August 2024**, **Apple October 2025** (iOS/iPadOS/macOS 26). Post dated **28 October 2025**. Backs `emerging.ts:521`. **One wording note, not a downgrade:** the signal text renders this as "over 50% (and rising!) of human traffic is protected against store-now/decrypt-later". A targeted re-fetch confirms the page does contain "store-now/decrypt-later", "harvest-now/decrypt-later" **and** "with 50% deployment (and rising!)" — but as three separate strings, so the Atlas sentence splices them inside quotation marks. Substance is sound; the quotation is not literal. See §12.7. | verified |
| S94 | Fin AI Agent pricing ($0.99 per resolution) | Fin (Intercom) | https://fin.ai/pricing | 200, body read (23 Sep 2026) | Read verbatim: resolutions priced "**$0.99 each**", with a resolution defined as "**No further help is requested after Fin's last answer**". Exactly the claims at `emerging.ts:352, 404`. Vendor pricing page — primary, but note it is a **live page**: the figure is true as of this fetch and carries no publication date of its own, which is why the registry dates it `2026-09`. | verified |
| S95 | Anysphere soars to $29.3B valuation with $2.3B funding | Tech Funding News | https://techfundingnews.com/anysphere-soars-to-29-3b-valuation-with-2-3b-funding-redefining-the-future-of-coding/ | 200, body read (23 Sep 2026) | Read verbatim: "**$2.3 billion** fundraise", "**$29.3 billion** valuation", and the comparison the Atlas quotes — "valued at **under $10 billion just months ago**" — dated **14 November 2025**. Exactly the signal at `emerging.ts:30–32`, paired with S21 for the June 2026 SpaceX transaction. | verified |
| S96 | Cloud spending growth rate slows but Q4 still up by $10 billion from 2021 (Q4 2022 shares) | Synergy Research Group | https://www.srgresearch.com/articles/cloud-spending-growth-rate-slows-but-q4-still-up-by-10-billion-from-2021-microsoft-gains-market-share | **Not re-fetched in this Q-17 pass** — already cleared in §5.1/§5.2 of this log, and the data-engineer re-fetched it this session and reports 200 | **Transcription row, added for URL coverage; the substantive check is §5.** §5.1 records Q4 2022 cloud infrastructure revenue **$61.6B** from this article; §5.2 records Q4 2022 shares **Microsoft 23 / Google 11** with **Amazon published as a 32–34% band rather than a point**, and big three **66%**. §5.2 marks that row `conflict` for exactly that reason and instructs that AWS ship `estimated` with low 32 / high 34, value 33. | verified-prior |
| S97 | Cloud market jumped to $330 billion in 2024; GenAI is now driving half of the growth (Q4 2024 shares) | Synergy Research Group | https://www.srgresearch.com/articles/cloud-market-jumped-to-330-billion-in-2024-genai-is-now-driving-half-of-the-growth | **Not re-fetched in this Q-17 pass** — cleared in §5.1/§5.2 as "primary (fetched)", and re-fetched by the data-engineer this session (200) | **Transcription row, added for URL coverage.** §5.1: Q4 2024 **$91B**, FY2024 **$330B**, and the Q4 2023 comparative **$73.7B (+20%)** read from the same article. §5.2: Q4 2024 shares **AWS 30 / Microsoft 21 / Google 12**, residual "Other" 37 (`modeled`, 100 − Σ named). | verified-prior |
| S98 | GenAI helps drive quarterly cloud revenues to $119 billion (Q4 2025 shares) | Synergy Research Group | https://www.srgresearch.com/articles/genai-helps-drive-quarterly-cloud-revenues-to-119-billion-as-growth-rate-jumped-yet-again-in-q4 | **Not re-fetched in this Q-17 pass** — cleared in §5.1/§5.2 as "primary (fetched)", and re-fetched by the data-engineer this session (200) | **Transcription row, added for URL coverage.** §5.1: Q4 2025 **$119.1B**, FY2025 **$419B**. §5.2: Q4 2025 shares **AWS 28 / Microsoft 21 / Google 14**, residual 37; CoreWeave above $1.5B a quarter and now a top-ten provider. | verified-prior |
| S100 | VAT in the Digital Age (ViDA) | European Commission, DG TAXUD | https://taxation-customs.ec.europa.eu/taxation/vat/vat-digital-age-vida_en | 200, body read **23 Sep 2026 in the §13 pass**; not re-fetched here | **Transcription row (§13.1, signal 1).** Read verbatim: "The VAT in the Digital Age (ViDA) package was adopted on **11 March 2025**"; "Digital Reporting Requirements will affect cross-border B2B transactions from **1 July 2030**"; "By **1 January 2035**, Member States with a domestic digital real-time transaction reporting obligation must align their systems with the EU model and standards". Used because `eur-lex.europa.eu` returned ECONNRESET for the directive text (§13.8). | verified-prior |
| S101 | eInvoicing in Germany | European Commission, Digital Building Blocks | https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eInvoicing+in+Germany | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.1, signal 2).** Read verbatim: "Starting **January 1, 2025**, this Act mandates eInvoicing as the default method for issuing invoices in Germany's B2B sector"; "By **January 1, 2027**: Businesses exceeding **EUR 800,000** turnover cannot issue paper or unstructured electronic formats"; "By **January 1, 2028**: This extends to all businesses". | verified-prior |
| S102 | eInvoicing in France | European Commission, Digital Building Blocks | https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eInvoicing+in+France | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.1, signal 3).** Read verbatim: "All businesses must be able to receive eInvoices starting **September 2026**"; the obligation traced to "Article 26 of the amending finance law n°2022-1157 for 2022". | verified-prior |
| S103 | Thomson Reuters successful acquisition of Pagero | Thomson Reuters | https://www.thomsonreuters.com/en/press-releases/2024/february/thomson-reuters-successful-acquisition-of-pagero-paves-the-way-for-significant-growth-opportunities | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.1, signal 4).** Read verbatim: "a purchase price of approx. **USD 800 million / SEK 8.1 billion**"; "With **over 80 countries** planning or implementing e-invoicing regulations…". §13.1 records that a competing-bid narrative (Vertex/Avalara) appeared **only in a search summary** and was deliberately excluded — only the price and the 80-country line were read in the body. | verified-prior |
| S104 | CMS Interoperability and Prior Authorization Final Rule (CMS-0057-F) | Centers for Medicare & Medicaid Services | https://www.cms.gov/priorities/key-initiatives/burden-reduction/interoperability/policies-and-regulations/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.2, signal 1).** Read verbatim: "Impacted payers are required to implement certain provisions by **January 1, 2026**"; "impacted payers have until primarily **January 1, 2027**, to meet the application programming interface (API) requirements in this final rule". | verified-prior |
| S105 | Fact sheet: CMS Interoperability and Prior Authorization Final Rule | Centers for Medicare & Medicaid Services | https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.2, signal 2).** Read verbatim: the named population — "Medicare Advantage (MA) organizations, state Medicaid and CHIP Fee-for-Service (FFS) programs, Medicaid managed care plans, CHIP managed care entities, and Qualified Health Plan (QHP) issuers on the Federally Facilitated Exchanges (FFEs)" — and the named technology, "**HL7® FHIR® application programming interfaces (APIs)**". | verified-prior |
| S106 | Trusted Exchange Framework and Common Agreement (TEFCA) | ASTP / ONC (HealthIT.gov) | https://www.healthit.gov/topic/interoperability/policy/trusted-exchange-framework-and-common-agreement-tefca | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.2, signal 3).** Read verbatim: TEFCA "operates in the United States as a nationwide framework for health information sharing"; "In **December 2023**… the first Qualified Health Information Networks® (QHINs™) were designated, and within days, health data began flowing among TEFCA QHINs". | verified-prior |
| S107 | Designated QHINs | The Sequoia Project (TEFCA Recognized Coordinating Entity) | https://rce.sequoiaproject.org/designated-qhins/ | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.2, signal 4).** Read: the designated-QHIN list itself — Commonwell, eClinicalWorks/PrismaNet, eHealth Exchange, **Epic Nexus**, Health Gorilla, Kno2, Konza Health, Medallies, Netsmart, **Oracle Health Information Network**, Surescripts. A **live list page**: the count is as of this fetch. | verified-prior |
| S108 | Batteries and Secure Energy Transitions — Executive summary | International Energy Agency | https://www.iea.org/reports/batteries-and-secure-energy-transitions/executive-summary | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.3, signal 1).** Read verbatim: "Lithium-ion battery prices have declined from **USD 1 400 per kilowatt-hour in 2010** to **less than USD 140 per kilowatt-hour in 2023**"; battery storage "was the fastest growing energy technology in 2023 that was commercially available, with deployment more than doubling year-on-year". This is the ≥10× cost-curve claim the grid candidate rests on. | verified-prior |
| S109 | Lithium-ion battery pack prices see largest drop since 2017, falling to $115/kWh | BloombergNEF | https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-see-largest-drop-since-2017-falling-to-115-per-kilowatt-hour-bloombergnef/ | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.3, signal 2).** Read verbatim: "Lithium-ion battery pack prices dropped **20%** from 2023 to a record low of **$115 per kilowatt-hour**"; "Battery prices saw their biggest annual drop since 2017". | verified-prior |
| S110 | Battery storage capacity averaged 70% growth over the last three years | U.S. Energy Information Administration | https://www.eia.gov/todayinenergy/detail.php?id=67925 | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.3, signal 3).** Read verbatim: "an annual average growth rate of **70%**"; "By the end of 2025, the U.S. power system had operational battery storage capacity of **43.6 gigawatts**"; "During the first six months of 2026, operators added another **8.3 GW**… reaching nearly 52 GW". | verified-prior |
| S111 | DOE releases new report on pathways to commercial liftoff for virtual power plants | U.S. Department of Energy | https://www.energy.gov/edf/articles/doe-releases-new-report-pathways-commercial-liftoff-virtual-power-plants | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.3, signal 4).** Read verbatim the VPP definition ("aggregations of distributed energy resources… that can balance electricity demand and supply and provide utility-scale and utility-grade grid services") and "Deploying **80-160 GW** of VPPs—tripling current scale—by **2030**… reducing overall grid costs by **$10 billion per year**". §13.3 states plainly that this is a **policy target, not a forecast**. Substituted after `liftoff.energy.gov` returned ENOTFOUND (§13.8). | verified-prior |
| S112 | EU Digital Identity Wallet — Home | European Commission, Digital Building Blocks | https://ec.europa.eu/digital-building-blocks/sites/display/EUDIGITALIDENTITYWALLET/EU+Digital+Identity+Wallet+Home | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.4, signal 1).** Read verbatim: "The European Digital Identity Regulation **(EU) 2024/1183** was adopted on **20 May 2024**"; "Each Member State will offer at least one version of the EU Digital Identity Wallet, built to the same common specifications, **by 2026**". | verified-prior |
| S113 | European Digital Identity (EUDI) Regulation | European Commission, Shaping Europe's Digital Future | https://digital-strategy.ec.europa.eu/en/policies/eudi-regulation | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.4, signal 2).** Read verbatim: "Member States to provide EU Digital Identity (eID) Wallets to citizens **by the end of 2026**"; "Service providers legally obliged to identify their customers unequivocally **will be obliged to accept the wallet** for authentication". | verified-prior |
| S114 | Online Safety Act: explainer | UK DSIT (GOV.UK) | https://www.gov.uk/government/publications/online-safety-act-explainer/online-safety-act-explainer | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.4, signal 4).** Read verbatim: Part 5 services "must take steps immediately to introduce robust age checks that meet Ofcom's guidance"; penalties "up to **£18 million or 10 percent of their qualifying worldwide revenue**, whichever is greater"; "The corresponding duty in the Act (section 81) came into force on **17 January 2025**". Substituted after ofcom.org.uk returned 403 twice; §13.8 records that the "25 July 2025" children's-duties date appeared **only in a search summary** and is therefore **not used**. | verified-prior |
| S115 | EU Digital Identity Wallet — About the initiative | European Commission, Digital Building Blocks | https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/694487832/About+the+initiative | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.4, signal 3).** Read verbatim: "Citizens should be able to carry their digital identity with them across the EU… without ever losing control of their data"; "This makes the **targeted sharing of identity data limited to the needs of a specific service** possible"; "Public and Private Services must accept the EU Digital Identity Wallet for Authentication". | verified-prior |
| S116 | Toast, Inc. Q4 and full-year 2025 results (Ex. 99.1) | Toast, Inc. / SEC | https://www.sec.gov/Archives/edgar/data/1650164/000165016426000050/tost-20251231xexhibit991.htm | 200, filing exhibit read 23 Sep 2026 (§13 pass) | **Transcription row (§13.5, signal 1).** Read from the statements: FY2025 **subscription services $936M**, **financial technology solutions $5,037M**, total revenue **$6,153M**, and gross payment volume **$195.1 billion** — the 5.4× ratio the embedded-finance thesis rests on. Filed figures, not estimates. | verified-prior |
| S117 | Shopify Inc. Q4 and full-year 2025 results (Ex. 99.1) | Shopify Inc. / SEC | https://www.sec.gov/Archives/edgar/data/1594805/000159480526000006/exhibit991pressreleaseq420.htm | 200, filing exhibit read 23 Sep 2026 (§13 pass) | **Transcription row (§13.5, signal 2).** Read from the statements: FY2025 total revenue **$11,556M**, subscription solutions **$2,752M**, merchant solutions **$8,804M**, GMV **$378,441M**. Second independent filer confirming the same split direction in the same year. | verified-prior |
| S118 | Toast, Inc. Form 10-K for FY2025 | Toast, Inc. / SEC | https://www.sec.gov/Archives/edgar/data/1650164/000165016426000057/tost-20251231.htm | **200, body truncated by the fetcher** (23 Sep 2026, §13 pass) | **Transcription row (§13.5, signal 3), with the same caveat as S14.** The two sentences the Atlas quotes **were** seen before truncation: "Toast provides a fully-integrated platform that enables our customers to securely accept and process payments…" and "fast and flexible funding via **loans issued by our bank partner**". §13.8 records that the revenue-recognition description was **not** reached; nothing in the Atlas depends on it. | verified-prior (partial) |
| S119 | ESAs designate critical ICT third-party providers under DORA | European Banking Authority | https://www.eba.europa.eu/publications-and-media/press-releases/european-supervisory-authorities-designate-critical-ict-third-party-providers-under-digital | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.6, signal 2).** Read verbatim: dated **18 November 2025**; "the ESAs will assess whether **CTPPs** have appropriate risk management and governance frameworks in place to ensure the resilience of the services they deliver to financial entities". This is the claim that software and cloud vendors are now supervised directly. | verified-prior |
| S120 | Digital Operational Resilience Act (DORA) | EIOPA | https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en | 200, body read 23 Sep 2026 (§13 pass) | **Transcription row (§13.6, signal 1).** Read verbatim: "Regulation (EU) **2022/2554**… of 14 December 2022"; "It entered into application on **17 Jan 2025**"; "applicable to **20 different types of financial entities** and ICT third-party service providers"; plus the named deliverables (ICT risk-management framework, major-incident reporting). Substituted after `finance.ec.europa.eu`'s DORA path returned 404 (§13.8). | verified-prior |
| B01 | From Airline Reservations to Sonic the Hedgehog (M. Campbell-Kelly) | MIT Press | — (no URL in the registry) | n/a — nothing to fetch | Cited from the literature, `verified: false`, and by construction never backs a `reported` point. It is nonetheless the **most-cited source in `events.ts`** — 38 pre-2003 events rest on it (`events.ts:25`–`:523`), which is the correct use: it supplies the existence, date and narrative of early-industry events, not figures. | n/a — no URL |
| B03 | Software Unbundling: A Personal Perspective (W. S. Humphrey), IEEE Annals 24(1) | IEEE | — | n/a — nothing to fetch | `verified: false`. Backs `evt-1969-ibm-unbundling` (`events.ts:25`) jointly with B01 — the IBM unbundling decision told by the man who ran it. Primary as literature, unfetched by design. | n/a — no URL |
| B04 | 7 Powers: The Foundations of Business Strategy (H. Helmer) | Deep Strategy | — | n/a — nothing to fetch | `verified: false`. Cited by **no data point**, but credited in prose as the intellectual basis of the moat rubric (`data/rubric.ts:7`, `MoatRadar.tsx:317`). QA Q-14 judged it to earn its registry place on that basis; this audit agrees. | n/a — no URL |
| B05 | The Innovator's Dilemma / The Innovator's Solution (C. M. Christensen) | Harvard Business School Press | — | n/a — nothing to fetch | `verified: false`. Second citation on `evt-2007-iphone` — the disruption framing, explicitly an interpretation and tagged as such in the narrative. | n/a — no URL |
| B06 | United States v. Microsoft Corp., 253 F.3d 34 (D.C. Cir. 2001) | US Court of Appeals, D.C. Circuit | — | n/a — nothing to fetch | `verified: false`, `reliability: primary`. Backs five events (`events.ts:364, 376, 462, 486, 512`) — the antitrust case and the 2002 settlement's conduct remedies. A case citation, not a URL-bearing source. | n/a — no URL |
| B07 | Platform Envelopment (Eisenmann, Parker, Van Alstyne), SMJ 32(12) | Strategic Management Journal | — | n/a — nothing to fetch | `verified: false`. Second citation on `evt-1995-microsoft-internet-tidal-wave` (`events.ts:364`); supplies the envelopment concept the bundling analysis uses. | n/a — no URL |
| B08 | Aggregation Theory (B. Thompson) | Stratechery | — | n/a — nothing to fetch | `verified: false`. Cited by **no data point** (QA Q-14). It underpins the platform-giant archetype description but is not referenced from any collection; the data-engineer should either attach it or drop it. | n/a — no URL |
| B09 | Merger Guidelines (2023) | US DOJ / FTC | — | n/a — nothing to fetch | `verified: false`, `reliability: primary`. Cited by **no data point** (QA Q-14) but referenced in `chapters.ts` prose and on `/methodology#simulator` for the **HHI 1,800** concentration threshold, which the simulator readout uses. Earns its place the same way B04 does. | n/a — no URL |
| B10 | Welcome to LLMflation (G. Appenzeller) | Andreessen Horowitz | — | n/a — nothing to fetch | `verified: false`. Second citation on `evt-2026-inference-price-decline` and on the cost-curve signals at `emerging.ts:39, 397`, paired with S24 (Epoch AI), which **was** read and carries the quantitative claim. | n/a — no URL |

### 12.2 Coverage and counts

**Registry state this audit reflects: 121 entries in `data/sources.ts` — 112 URL-bearing `S*` entries and 9 `B*` literature entries.** Counted on **23 September 2026** at the end of the Q-17 pass, by `grep -c '^\s*id: "'` (121) and `grep -c '^\s*url: "'` (112) against `data/sources.ts`.

The registry moved **twice** while this pass was running, which is worth recording because it is the same drift Q-17 is about:

| Point in the pass | `S*` ids present | Total entries |
|---|---|---|
| Start of the diff | S01 … S98 (gaps S10, S19, S29–S38, S77, S79 unused) | 100 |
| End of the pass | the above **plus S100 … S120** — the six shipped emerging-market candidates from §13 | **121** |

`S99`, `S121` and `S122` are **not** shipped: §13.10 drafted S100–S122, and the accessibility candidate (§13.7, the one §13.11 marked "cut first") was dropped along with its two sources. All 21 new ids match the §13.10 drafts **URL for URL**.

**Anyone re-checking this section should start by re-running those two greps.** If the counts are no longer 121 / 112, §12.1 has drifted again.

**Coverage rule, stated in URL terms** (this is the rule §12.4 adopted, and the one Q-17 exists to enforce):

> §12.1 has adequate coverage when **every distinct `url` value shipped in `data/sources.ts` appears verbatim in the URL column of §12.1**, and every URL in the §12.1 URL column is still shipped by some registry entry. Ids are allocation state owned by `data/sources.ts`; they are **not** the matching key. A re-pointed URL creates *two* defects at once — an unlogged shipped URL and an orphaned log row — which is exactly how Q-01 turned into Q-17.

**Against that rule: 112 shipped URLs, 112 URL rows in §12.1, zero orphaned rows.** The six rows whose registry URL changed since the first pass (S09, S12, S13b, S28, S67, S68) were re-pointed and re-checked at the URL now shipped, not merely re-labelled.

| Outcome | Count | Ids |
|---|---|---|
| Fetched directly, body read, claim confirmed | **75** | S01, S03, S03b, S04, S05, S06, S07, S08, S09, S11, S11b, S12, S13, S13b, S15, S15b, S15c, S16b, S18, S18b, S20, S22, S23, S24, S26, S27, S28, S39, S40, S41, S44, S45, S46, S47, S48, S49, S50, S52, S53, S54, S55, S56, S57, S58, S59, S60, S61, S62, S63, S64, S65, S66, S68, S69, S70, S71, S72, S73, S74, S76, S80, S81, S82, S83, S84, S85, S87, S88, S89, S90, S91, S92, S93, S94, S95 |
| Direct fetch blocked (403 / timeout / binary-PDF / JS shell); claim confirmed from a search engine's verbatim **body** extract of the same page | **10** | S02, S16, S21, S25, S42, S43, S51, S67, S75, **S86** |
| Retrieved, but the specific figure was **not reached** (document truncation, not a paywall) | **1** | S14 |
| **Transcribed** from §5 of this log, not re-fetched in this pass | **3** | S96, S97, S98 — the three Synergy articles. §5.1/§5.2 record them as fetched and read ("primary (fetched)"); the data-engineer re-fetched all three this session and reports 200 each. Their §12.1 rows are a transcription for URL coverage, **not** an independent second check, and say so. |
| **Transcribed** from §13 of this log — fetched and read by this agent on the **same day**, in the emerging-market pass | **21** | S100–S120. Each row quotes what §13.1–§13.6 record as read from the body, names the §13 signal it backs, and carries §13.8's failure record where the source is a **substitute** for a host that blocked (S100 for EUR-Lex, S111 for `liftoff.energy.gov`, S114 for Ofcom, S120 for `finance.ec.europa.eu`). **S118** (Toast 10-K) is partial: the two quoted sentences were read, the rest was truncated. |
| Blocked and **not confirmed** — fails the `verified: true` test | **2** | **S17** (Axios, headline only), **S78** (Bloomberg, paywalled — both already `verified: false`) |
| No URL by design (`B*` literature, all already `verified: false`) | **9** | B01, B03, B04, B05, B06, B07, B08, B09, B10 |

75 + 10 + 1 + 3 + 21 + 2 = **112 URL-bearing entries**; + 9 `B*` = **121**. Of the 112, **109 are confirmed** — 75 by direct read in this audit, 10 by search extract, 24 by transcription from §5 and §13 of this log (one of those, S118, partially). Three are not: **S14** (retrieved, figure beyond the fetcher's window — §12.3 records why that no longer costs the Atlas anything), **S17** and **S78**, the last two already shipping `verified: false`.

Movement since the first pass: S12 and S13b moved from "search extract" to **direct read** because the data-engineer re-pointed them to hosts that serve the text; S28 moved from an API-root stub to a **concrete endpoint that returns JSON**, closing QA Q-19; S86 is the one genuinely new blocked entry, and is the only `verified: false` source whose substance was confirmed anyway (see §12.7).

Two rows carry a caveat inside an otherwise confirmed status: **S69** (primary claim — Kubernetes open-sourced 6 June 2014 — confirmed; its *second* use on `evt-2013-docker` was beyond the truncation point) and **S42**, **S44**, **S58**, **S74** (page confirmed, attached deal *value* not on the page — §12.3).

**Pre-existing log coverage.** Matching by URL rather than id, a minority of the shipped registry was already cleared in §1–§11: the SEC XBRL backbone (**S28**), the Databricks release (**S39**), five deal-release URLs that §3 verified under different suggested ids (**S40, S43, S44, S46, S76**), and the Synergy articles (**S03–S08**) covered as a series by §5. That is roughly a dozen. Every other URL-bearing entry — **about sixty**, well above QA's count of 32 — had no prior entry in this log under *any* id, because QA matched on ids and the id space had drifted (§12.4). All of them now have a row.

### 12.3 Attention items for the data-engineer (not downgrades)

These are **citation–content mismatches**: the source is genuine and was read, but the specific figure the Atlas attaches to it is not on that page. None is a fabrication; each is a pointer that should be re-aimed.

**Status as of the Q-17 pass (23 September 2026) — most of this table is now closed.** Every fix below was checked at the page the registry now ships, not taken on report:

| Item in the table below | Now |
|---|---|
| Slack $27.7B | **Closed** — `evt-2021-salesforce-slack` cites **S82**, the December 2020 definitive-agreement release, which states $27.7B. Row S82 in §12.1. |
| Tableau $15.7B | **Value closed** — cites **S83**, which states "$15.7 billion (net of cash)". **The `low: 15.3` band endpoint is still unattributed** (QA Q-25); S83 states 15.7 and not 15.3. |
| Informatica $8B | **Closed** — cites **S84** ("approximately $8 billion in equity value"). |
| Broadcom/VMware $69B | **Closed as recommended** — **S85** (VMware's own 8-K exhibit) supplies $61B equity + $8B assumed net debt, and the event ships `estimated`. |
| Gartner $2.59tn | **Closed** — **S87** (CIO Dive, readable) and **S86** (the May Gartner release itself) now carry the May figure; S25 remains as the January $2.52tn citation. |
| Adobe–Figma $1B fee | **Closed** — **S88**, Adobe's Form 8-K, states "one billion dollars ($1,000,000,000)" and the 17 December 2023 termination date. |
| `S09`, `S12`, `S13b`, `S67`, `S68` URLs | **All re-pointed by the data-engineer and re-checked here.** S12 and S13b are now directly readable; S09 returns 200 with no redirect; S67/S68 now serve documents rather than JavaScript shells. |
| `evt-2013-docker` → S69 | **Still open**, still low priority — the event carries no figure. |
| S14 (Adobe 10-K truncation) | **Still open in form** — the 10-K is still too long for the fetcher — but the consequence is gone: the Figma claim moved to S88, and Adobe's $23.77B revenue is independently verified from XBRL in §1.4. |

| Where | Issue | Suggested fix |
|---|---|---|
| `events.ts:878–883` — `evt-2021-salesforce-slack`, `dealValue` **27.7 USD_B** → S44 | Salesforce's completion release **states no price**. Confirmed by reading it this session. | Re-cite to a source that states $27.7B, or ship the value as `estimated`. The **date** is correctly sourced to S44. |
| `events.ts:807–810` — `evt-2019-salesforce-tableau`, `dealValue` **15.7 USD_B** → S58 | The *completion* release states no price; §3 took 15.7 from the June 2019 *definitive-agreement* release, and flagged $15.3B as a competing equity-value figure. | Cite the June 2019 release for the value, keep S58 for the date. |
| `events.ts:1270–1275` — `evt-2025-salesforce-informatica`, `dealValue` **8 USD_B** → S74 | Completion release states no price. | Same pattern: separate the date citation from the value citation, or downgrade the value to `estimated`. |
| `events.ts:1013–1018` — `evt-2023-broadcom-vmware`, `dealValue` **69 USD_B** → S42 | Broadcom's completion release states **no total value**; ~$69B is §3's derivation ($61B cash and stock + ~$8B assumed debt), and a $84.2B figure circulates on a third basis. | Ship as `estimated` with `low: 61, high: 69` and a note on the debt component, as §3 already recommended. |
| `evt-2026-gartner-ai-spending` → S25 | The event says **$2.59tn**; S25's URL is the **January** release, which says **$2.52tn**. The $2.59tn is the May 2026 update. | Add the May release as its own source, or restate the event at $2.52tn. |
| `evt-2023-adobe-figma-abandoned` → S14 | A targeted search of the retrieved 10-K text found **no mention of Figma or a termination fee**; the fetcher truncates before Item 8. | Either cite a source that states the $1B termination fee, or keep S14 and treat the abandonment as a narrative fact rather than a sourced figure. |
| `evt-2013-docker` → S69 | The Kubernetes retrospective was truncated before any Docker material; the citation may be sound in the full page but was not confirmed here. | Low priority — the event carries no figure. |
| `S09` URL | Redirects to the `www` host (QA Q-13); the redirect resolved on fetch. | Store the canonical `https://www.aboutamazon.com/...` form. |
| `S67` / `S68` URLs | `presscorner/detail/...` serves a JavaScript shell with no text. | Store the Commission's own PDF rendering (`presscorner/api/files/document/print/en/<id>/<ID>_EN.pdf`), which returns the release text. |
| `S13b` URL | The `?p=111461` short-link 403s; the canonical slug is served. | Store `https://convergedigest.com/oracles-ai-infrastructure-business-drives-93-iaas-growth/`. |
| `S12` URL | businesswire.com blocks automated retrieval of a release that Salesforce publishes openly. | Store `https://www.salesforce.com/news/press-releases/2026/02/25/fy26-q4-earnings/`. |

### 12.4 Finding: the id space drifted between this log and the shipped registry

§7.1 of this log requested the block **S60–S79** from the orchestrator and listed 20 sources against those suggested ids. The data-engineer assigned ids differently. The consequences are concrete:

| §7.1 said | Shipped registry says |
|---|---|
| S65 = Microsoft to acquire LinkedIn | **S46** = that release; **S65** = Microsoft Teams rolls out to Office 365 |
| S69 = IBM closes Red Hat | **S40** = that release; **S69** = 10 years of Kubernetes |
| S70 = Salesforce completes Slack | **S44** = that release; **S70** = Microsoft launches Office 365 globally |
| S72 = Oracle completes Cerner | **S43** = that release; **S72** = Thoma Bravo completes Coupa |
| S74 = TechCrunch Activision | **S76** = that article; **S74** = Salesforce completes Informatica |
| S75 = Cisco's own Splunk release | **S45** = SiliconANGLE's Splunk article (a *different* page) |
| S76 = IBM/PR Newswire HashiCorp | **S47** = TechCrunch's HashiCorp article (a *different* page) |

Only **S78** kept both its suggested id and its URL.

**Why this matters beyond bookkeeping.** It is the mechanism behind QA's Q-01. Anyone checking coverage by grepping the log for an id found hits for "S65", "S69", "S70", "S72", "S74" and concluded those sources were logged — when the hits referred to entirely different pages. It also means several §3 deal rows verify a *different URL* than the one shipped: §3 verified Cisco's own investor release and IBM's PR Newswire release, while the registry ships SiliconANGLE and TechCrunch articles for those deals. Both shipped pages check out (rows S45 and S47 above), but they were never the pages this log had cleared.

**Rule to adopt going forward:** the verification log records **URLs**, and a log entry is matched to a registry entry by **URL**, never by id. Source ids are allocation state owned by `data/sources.ts`; they are not stable identifiers across documents. Any future §7-style "suggested ids" block should list URLs only.

### 12.5 Must be downgraded to `verified: false`

The data-engineer owns `data/sources.ts`; this agent made **no edit** to it.

| Source id | Reason | Impact of the change |
|---|---|---|
| **S17** (Axios, "Anthropic's revenue run rate reportedly surpasses $65 billion pre-IPO") | axios.com returned **403** to a direct fetch, and the follow-up search surfaced the page with **its title only** — no body extract. The $65B figure was therefore seen only in a headline, which is exactly the class QA ruled on for S78: a headline is a claim about the article, not content from it. **Keep the URL**, set `verified: false`. | None on any number. S17 is the second of two citations on `evt-2026-anthropic-run-rate`; the figure is carried by **S16**, confirmed above from a body extract. No `reported` point cites S17 (all 263 `reported` points trace to S28 or to deal releases). The methodology page's "fetched and verified" count moves 71 → 70, and the S17 chip renders "◇ cited, not re-fetched". |

**No other source requires downgrading.** S78 is already `verified: false`. S14 and S69 were genuinely retrieved and partly read; their shortfall is fetcher truncation of long documents, not a paywall, and §12.3 handles the consequences.

**Q-17 pass, 23 September 2026: still exactly one downgrade.** S17 remains the only entry this log asks to be set `verified: false`, and the data-engineer has already applied it. **Nothing in the 39 rows added in this pass requires a downgrade**, and nothing previously logged is unverified by it. In particular, §11.1 is not triggered anywhere: the only 403 I met this round was **S86** (Gartner), which already ships `verified: false` and whose substance I then confirmed from a search extract — a 403 on re-check is a property of my client, not of the link.

The one failure that was **not** a client-side block has been fixed rather than downgraded: the old **S28** URL (`https://data.sec.gov/api/xbrl/companyconcept/`) returned no document **for anyone**, because it is an API root and not an endpoint. That is the class §11.1 distinguishes from a bot wall, and it mattered more than any other row in the registry — 253 of 264 `reported` points cite S28. The registry now stores a concrete endpoint, which returned **200 and valid JSON** to me this session with the Microsoft FY2008/09/10 facts intact.

### 12.6 Q-17 second pass — what was done (23 September 2026)

**Scope.** Re-establish §12.1 coverage against a registry that had grown from 82 to **100** entries and re-pointed six URLs since the first pass — and that reached **121** before the pass ended, as the six emerging-market candidates from §13 shipped with sources S100–S120.

**Method.** Diffed the `url` values in `data/sources.ts` against the URL column of §12.1 **by URL string**, never by id. That produced two defect sets: **18 shipped URLs with no §12.1 row** (S81–S98) and **5 §12.1 rows citing URLs no longer shipped** (S09, S12, S13b, S67, S68), plus **S28**, whose URL had changed to fix a dead endpoint. Each was then fetched at the URL the registry actually ships, in this session, and recorded at the status observed — including where the observation was unflattering (S67 returned an unparseable binary; S86 returned 403).

**Result. 39 rows added, 6 rows corrected.** The 39 are S81–S95 (15, fetched here), S96–S98 (3, transcribed from §5) and S100–S120 (21, transcribed from §13, fetched by this agent the same day). The 6 corrections are S09, S12, S13b, S28, S67, S68. §12.2 was rewritten to the true count, with the coverage rule stated in URL terms and the registry state named explicitly so the next reader can tell at a glance whether it has drifted again.

**A second diff was run at the end of the pass** precisely because the emerging-market sources were landing while I worked. That is what caught S100–S120; the first diff, an hour earlier, saw only 100 entries. Anyone doing this again should diff **last**, not first.

**What I did not do.** I did not edit `data/*.ts` — a data-engineer was working in those files concurrently — and I did not re-fetch S96–S98 or S100–S120, all of which this log had already cleared by direct read (§5 and §13 respectively, the latter on the same day). Those 24 rows are labelled transcriptions so nobody mistakes them for a second independent check.

### 12.7 New attention items from the Q-17 pass

| Where | Issue | Suggested action | Owner |
|---|---|---|---|
| `data/sources.ts` — **S86** | Ships `verified: false` because the verifier's fetch was blocked (QA Q-23). This pass confirmed the release's **body** content — $2.59tn, 47%, the "over 45%" infrastructure share and the Lovelock attribution — from a search engine's extract of **this exact URL**, which is the same standard under which S02, S25, S16, S21, S42, S43, S51, S67 and S75 all ship `verified: true`. QA also reports reading the page in full with a browser user agent this session. | **Upgrade to `verified: true`.** Leaving it false is now inconsistent with nine other rows in this table, and it is the most authoritative of the four Gartner-AI sources. No `reported` point depends on it either way. | `data-engineer` |
| `data/emerging.ts:519` — the Cloudflare signal | The sentence quotes "over 50% (and rising!) of human traffic is protected against store-now/decrypt-later". The page (S93) contains all three fragments, but in different sentences: "over half of human-initiated traffic … protected against **harvest-now/decrypt-later**" and, separately, "with 50% deployment **(and rising!)**". The substance is right; the quotation is a splice. | Re-quote as "over half of human-initiated traffic … is protected against harvest-now/decrypt-later", or drop the quotation marks. §11.6-adjacent: a spliced quotation is weaker than an unattributed band endpoint, but it is the kind of thing a sceptical reader checks. | `data-engineer` |
| `data/events.ts:808` — `evt-2019-salesforce-tableau` | Unchanged from QA Q-25 and now confirmed against the definitive-agreement release itself: **S83 states $15.7B and not $15.3B**, and no registry entry states 15.3. | Drop `low: 15.3`, or add a source that carries the equity-value basis. | `data-engineer` |
| `data/sources.ts` — **S94** (`https://fin.ai/pricing`) | A **live pricing page**, not a dated publication. The $0.99 figure was true at this fetch; it can change without notice and the URL will still return 200, so it cannot be re-verified retrospectively. | No change needed now. Worth a line on `/methodology` alongside the existing analyst-estimate caveats: one source in the registry is a live page whose value is as-of-fetch. | `orchestrator` |

---

## 13. Non-AI emerging-market candidates (owner request, 23 September 2026)

### 13.0 Why this section exists

Of the twelve emerging markets shipped, eleven are AI-framed. The cause is a skewed
application of the `research.md` §7.1 six-signal framework: of 35 shipped signals,
11 are `platform-shift` and 10 are `leading-indicator`, against **2 `regulation`**
and **3 `unbundling`**. Categories inherit the skew — infrastructure 8, horizontal 3,
vertical 1, **consumer 0, emerging 0** — which is why two of the radar's five sectors
are empty (orchestrator ruling `docs/CONTRACTS.md` §11.8).

This section sources candidates an **even** application of §7.1 would have surfaced,
weighted to `regulation`, `cost-curve`, `unbundling` and `new-interface`. Every
quoted sentence below was read in a page body fetched in this session on
**23 September 2026**; HTTP status is recorded per row. Nothing here is from memory.
New source ids start at **S100** per the task brief (the §8.7 allocation table's
`S80+` block remains the data-engineer's).

Research cut-off note: `research.md` has a stated cut-off of 21 September 2026.

---

### 13.1 Candidate — Mandatory e-invoicing and real-time tax reporting

**Proposed id:** `em-einvoicing` · **Category:** `horizontal` · **Stage:** `scaling`
· **Horizon:** `0-2y`

| # | Type | Evidence | Strength | Source | URL | HTTP | Quoted sentence from the fetched body |
|---|---|---|---|---|---|---|---|
| 1 | `regulation` | The EU adopted the VAT in the Digital Age package on 11 March 2025 (Directive (EU) 2025/516); digital reporting requirements bite on cross-border B2B from 1 July 2030 and Member States with domestic real-time reporting must align by 1 January 2035, creating a decade-long, statutory replacement cycle for invoicing systems. | 3 | S100 | https://taxation-customs.ec.europa.eu/taxation/vat/vat-digital-age-vida_en | 200 | "The VAT in the Digital Age (ViDA) package was adopted on 11 March 2025" · "Digital Reporting Requirements will affect cross-border B2B transactions from 1 July 2030" · "By 1 January 2035, Member States with a domestic digital real-time transaction reporting obligation must align their systems with the EU model and standards" |
| 2 | `regulation` | The demand is already live, not prospective: since 1 January 2025 every German business must be able to receive a structured EN 16931 e-invoice, with issuance mandatory from 1 January 2027 above €800,000 turnover and from 1 January 2028 for all. | 3 | S101 | https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eInvoicing+in+Germany | 200 | "Starting January 1, 2025, this Act mandates eInvoicing as the default method for issuing invoices in Germany's B2B sector" · "By January 1, 2027: Businesses exceeding EUR 800,000 turnover cannot issue paper or unstructured electronic formats" · "By January 1, 2028: This extends to all businesses" |
| 3 | `regulation` | France's receipt obligation lands in September 2026 under Article 26 of amending finance law n°2022-1157, putting a second large economy inside the 0–2y horizon. | 2 | S102 | https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eInvoicing+in+France | 200 | "All businesses must be able to receive eInvoices starting September 2026." · "Article 26 of the amending finance law n°2022-1157 for 2022" |
| 4 | `leading-indicator` | Capital is moving on the network layer: Thomson Reuters bought the e-invoicing network Pagero for approximately USD 800 million and named the mandate wave — 80-plus countries planning or implementing e-invoicing rules — as the rationale. (A competing-bid narrative involving Vertex and Avalara appeared only in a search summary and is **deliberately excluded**; only the price and the 80-country line were read in the body.) | 3 | S103 | https://www.thomsonreuters.com/en/press-releases/2024/february/thomson-reuters-successful-acquisition-of-pagero-paves-the-way-for-significant-growth-opportunities | 200 | "a purchase price of approx. USD 800 million / SEK 8.1 billion" · "With over 80 countries planning or implementing e-invoicing regulations, the acquisition is set to accelerate the companies' shared vision" |

**Thesis.** Invoicing was a feature of the ERP — a print-and-post afterthought at the
end of order-to-cash. Statute is pulling it out and turning it into a regulated
network: a structured document, a mandated schema, a clearing or reporting hop to the
tax authority, and a different rulebook in every jurisdiction. That combination —
compulsory, cross-border, and too fiddly for any one ERP vendor to cover alone — is
how a feature becomes a market. The buyer has no discretion and no ability to defer,
which is the rarest property in enterprise software.

**Risks.** The ERP suites (SAP, Oracle, Microsoft, Intuit) can bundle compliance into
the platform and reduce the specialists to connectors — the classic envelopment path.
National clearing platforms operated by the state (Italy's SdI, Poland's KSeF) can
absorb the network layer outright and leave only thin integration revenue. And the
long ViDA dates are a genuine hazard: deadlines in 2030 and 2035 are far enough out to
be renegotiated, and the ViDA timetable itself already slipped once before adoption.

**Key players.** SAP ✔ (in `data/companies.ts`), Oracle ✔, Microsoft ✔, Intuit ✔,
Thomson Reuters ✔ (owns Pagero). **New:** Vertex, Avalara, Sovos, Basware, Pagero,
Tungsten/Kofax. None of the six is currently in the dataset.

---

### 13.2 Candidate — Healthcare data interoperability and health-record APIs

**Proposed id:** `em-health-interop` · **Category:** `vertical` · **Stage:** `emerging`
· **Horizon:** `2-5y`

| # | Type | Evidence | Strength | Source | URL | HTTP | Quoted sentence from the fetched body |
|---|---|---|---|---|---|---|---|
| 1 | `regulation` | CMS-0057-F obliges a named set of US payers to stand up HL7 FHIR APIs, with the first provisions due 1 January 2026 and the API requirements generally from 1 January 2027 — a dated, non-optional build for every affected plan. | 3 | S104 | https://www.cms.gov/priorities/key-initiatives/burden-reduction/interoperability/policies-and-regulations/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f | 200 | "Impacted payers are required to implement certain provisions by January 1, 2026." · "impacted payers have until primarily January 1, 2027, to meet the application programming interface (API) requirements in this final rule." |
| 2 | `regulation` | The obligation names the technology and the population: Medicare Advantage organizations, state Medicaid and CHIP FFS programs, Medicaid managed care plans, CHIP managed care entities and QHP issuers on the FFEs must implement FHIR APIs. A compliance mandate that specifies the API standard is a specification for a vendor market. | 3 | S105 | https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f | 200 | "Medicare Advantage (MA) organizations, state Medicaid and Children's Health Insurance Program (CHIP) Fee-for-Service (FFS) programs, Medicaid managed care plans, CHIP managed care entities, and Qualified Health Plan (QHP) issuers on the Federally Facilitated Exchanges (FFEs)" · "HL7® Fast Healthcare Interoperability Resources® (FHIR®) application programming interfaces (APIs) to improve the electronic exchange of health care data." |
| 3 | `platform-shift` | TEFCA created a nationwide exchange layer above the EHRs: the first QHINs were designated in December 2023 and data began flowing within days. | 2 | S106 | https://www.healthit.gov/topic/interoperability/policy/trusted-exchange-framework-and-common-agreement-tefca | 200 | "The Trusted Exchange Framework and Common Agreement™, known as TEFCA®, operates in the United States as a nationwide framework for health information sharing." · "In December 2023, TEFCA surpassed a major milestone when the first Qualified Health Information Networks® (QHINs™) were designated, and within days, health data began flowing among TEFCA QHINs." |
| 4 | `platform-shift` | The layer now has eleven designated operators, and both EHR incumbents and independents sit on it — Epic Nexus and Oracle Health Information Network alongside Health Gorilla, Kno2, Medallies and Netsmart. Incumbents and challengers competing as peers on a shared network is what a real layer looks like. | 2 | S107 | https://rce.sequoiaproject.org/designated-qhins/ | 200 | "Below are organizations that have successfully completed the Qualified Health Information Network® (QHIN™) onboarding process and are recognized as Designated QHINs for TEFCA™ exchange." — listing Commonwell, eClinicalWorks/PrismaNet, eHealth Exchange, Epic Nexus, Health Gorilla, Kno2, Konza Health, Medallies, Netsmart, Oracle Health Information Network, Surescripts Health Information Network |

**Thesis.** Health records have been the canonical example of data that is
technically portable and commercially immobile: the value of an EHR to its vendor was
partly that the data could not leave. Two mandates attack that from opposite ends —
TEFCA builds a network above the incumbents, CMS-0057-F obliges the payers beneath
them to expose FHIR APIs on a fixed date. When the exchange is compulsory and the
schema is specified, the moat stops being the data and becomes what you do with it,
which opens room for a tier of API, ingestion and prior-authorisation vendors that
could not exist while every integration was a bespoke interface engine.

**Risks.** The EHR incumbents are themselves QHINs — Epic Nexus and Oracle Health
Information Network are on the list — so the network can be operated by the parties
it was meant to open up, and independents may end up as thin resellers of access.
US health IT rules have a long history of enforcement discretion and date slippage,
and CMS-0057-F's API deadlines are still in the future. And interoperability
mandates set a floor, not a business: a market only forms if someone will pay above
the compliance minimum.

**Key players.** Epic Systems ✔ (in `data/companies.ts`), Oracle ✔, Cerner ✔
(Oracle Health). **New:** Health Gorilla, Redox, Particle Health, Surescripts,
Netsmart, Kno2, eClinicalWorks, Commonwell/eHealth Exchange. None of these is in
the dataset.

---

### 13.3 Candidate — Grid flexibility and distributed-energy orchestration software

**Proposed id:** `em-grid-flex` · **Category:** `vertical` · **Stage:** `emerging`
· **Horizon:** `2-5y`

| # | Type | Evidence | Strength | Source | URL | HTTP | Quoted sentence from the fetched body |
|---|---|---|---|---|---|---|---|
| 1 | `cost-curve` | Lithium-ion storage fell an order of magnitude in thirteen years — USD 1,400/kWh in 2010 to under USD 140/kWh in 2023 — clearing the §7.1 "≥ 10× fall in a key input" bar outright, and battery storage was the fastest-growing commercially available energy technology in 2023. | 3 | S108 | https://www.iea.org/reports/batteries-and-secure-energy-transitions/executive-summary | 200 | "Lithium-ion battery prices have declined from USD 1 400 per kilowatt-hour in 2010 to less than USD 140 per kilowatt-hour in 2023" · "Battery storage in the power sector was the fastest growing energy technology in 2023 that was commercially available, with deployment more than doubling year-on-year." |
| 2 | `cost-curve` | The curve has not flattened: pack prices fell 20% in a single year to a record USD 115/kWh in 2024, the largest annual drop since 2017. | 3 | S109 | https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-see-largest-drop-since-2017-falling-to-115-per-kilowatt-hour-bloombergnef/ | 200 | "Lithium-ion battery pack prices dropped 20% from 2023 to a record low of $115 per kilowatt-hour" · "Battery prices saw their biggest annual drop since 2017." |
| 3 | `leading-indicator` | The installed base that needs orchestrating is compounding: US utility-scale battery storage grew at a 70% average annual rate over three years to 43.6 GW at end-2025, and added another 8.3 GW in the first half of 2026 alone. | 3 | S110 | https://www.eia.gov/todayinenergy/detail.php?id=67925 | 200 | "Utility-scale battery storage capacity in the United States increased significantly during the last three years, with an annual average growth rate of 70%." · "By the end of 2025, the U.S. power system had operational battery storage capacity of 43.6 gigawatts (GW)." · "During the first six months of 2026, operators added another 8.3 GW of battery storage capacity, reaching nearly 52 GW of nameplate battery storage capacity." |
| 4 | `platform-shift` | The US DOE frames the next step as aggregation — millions of customer-sited assets and their controls dispatched as one plant — and puts a number on it: triple today's scale to 80–160 GW by 2030, worth $10 billion a year in avoided grid cost. Aggregation at that scale is a software problem before it is anything else. | 2 | S111 | https://www.energy.gov/edf/articles/doe-releases-new-report-pathways-commercial-liftoff-virtual-power-plants | 200 | "VPPs are aggregations of distributed energy resources (DERs) such as rooftop solar with customer-sited batteries, electric vehicles (EVs) and chargers, smart buildings and equipment and their controls, and flexible commercial and industrial (C&I) loads that can balance electricity demand and supply and provide utility-scale and utility-grade grid services like traditional power plants." · "Deploying 80-160 GW of VPPs—tripling current scale—by 2030 could expand the U.S. grid's capacity to reliably support rapid electrification while redirecting grid spending from peaker plants to participants and reducing overall grid costs by $10 billion per year." |

**Thesis.** The Atlas's own framework says a market opens when a key input falls
tenfold. Storage has done exactly that, and the consequence is not more hardware
but a control problem nobody previously had: a grid built around a few hundred
dispatchable plants is becoming one with millions of dispatchable assets, each with
its own state of charge, owner, tariff and market. Deciding what charges, what
discharges and what bids, every five minutes, across a heterogeneous fleet, is the
software layer the cost curve creates — the same shape as cloud storage getting
cheap and consumer photo backup appearing above it.

**Risks.** The value may stay with the hardware and the asset owner: Tesla and the
inverter makers ship their own optimisation, and a battery vendor's software is free
with the battery. Utility procurement is slow, fragmented by jurisdiction and hostile
to new vendors, so the addressable buyer list is short and the sales cycles are long.
The DOE's 80–160 GW is a policy target, not a forecast, and US federal energy policy
is volatile enough that it should be read as one. And market access rules are set by
regulators whose pages this agent could not even fetch (see §13.7) — a reminder that
the enabling regulation is contested, not settled.

**Key players.** None of the credible names is in `data/companies.ts`. **New:**
Schneider Electric (AutoGrid), Siemens, GE Vernova, Tesla (Autobidder), Uplight,
EnergyHub, Voltus, Enode, Gridmatic, Itron, Hitachi Energy. A data-engineer shipping
this candidate should expect to add companies or to ship `keyPlayerIds` sparse.

**Honest caveat on this candidate.** Its four signals are strong on the *input* — the
cost collapse and the deployment curve are primary-sourced and unambiguous — and
weaker on the *market*. This agent could not verify a revenue figure for any pure-play
grid-software vendor in this session (GE Vernova's "Electrification Software" line was
sought in the 4Q'25 press release on EDGAR and the fetched body did not contain it;
see §13.7). The candidate should ship with signals 1–3 at strength 3 and signal 4 at
strength 2, and the thesis must carry the inference rather than a signal pretending to
be evidence of vendor revenue.

---

### 13.4 Candidate — Digital identity wallets and age assurance

**Proposed id:** `em-digital-identity` · **Category:** `consumer` · **Stage:**
`emerging` · **Horizon:** `2-5y`

| # | Type | Evidence | Strength | Source | URL | HTTP | Quoted sentence from the fetched body |
|---|---|---|---|---|---|---|---|
| 1 | `regulation` | Regulation (EU) 2024/1183, adopted 20 May 2024, obliges every Member State to ship a digital identity wallet to a common specification by 2026 — a statutory delivery date for a consumer application in 27 countries at once. | 3 | S112 | https://ec.europa.eu/digital-building-blocks/sites/display/EUDIGITALIDENTITYWALLET/EU+Digital+Identity+Wallet+Home | 200 | "The European Digital Identity Regulation (EU) 2024/1183 was adopted on 20 May 2024." · "Each Member State will offer at least one version of the EU Digital Identity Wallet, built to the same common specifications, by 2026." · "A safe, reliable, and private means of digital identification for everyone in Europe." |
| 2 | `regulation` | The demand side is mandated too, not merely invited: providers legally obliged to identify their customers must accept the wallet for authentication, on the same end-2026 timetable. | 3 | S113 | https://digital-strategy.ec.europa.eu/en/policies/eudi-regulation | 200 | "Member States to provide EU Digital Identity (eID) Wallets to citizens by the end of 2026" · "Service providers legally obliged to identify their customers unequivocally will be obliged to accept the wallet for authentication," |
| 3 | `new-interface` | The wallet is a new interaction mode, not a new login screen: identity becomes a set of attributes the holder discloses selectively and carries across borders, which is a different primitive from the account-and-password model the whole consumer web is built on. | 2 | S115 | https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/694487832/About+the+initiative | 200 | "Citizens should be able to carry their digital identity with them across the EU, moving seamlessly across borders without ever losing control of their data" · "This makes the targeted sharing of identity data limited to the needs of a specific service possible" · "Public and Private Services must accept the EU Digital Identity Wallet for Authentication" |
| 4 | `regulation` | A second, independent regulator is forcing age attributes into consumer products with real penalties: under the UK Online Safety Act, Part 5 services must introduce robust age checks meeting Ofcom's guidance, and non-compliance is priced at up to £18 million or 10% of qualifying worldwide revenue. | 3 | S114 | https://www.gov.uk/government/publications/online-safety-act-explainer/online-safety-act-explainer | 200 | "Platforms that publish their own pornographic content (known as Part 5 services) must take steps immediately to introduce robust age checks that meet Ofcom's guidance." · "Companies can be fined up to £18 million or 10 percent of their qualifying worldwide revenue, whichever is greater." · "The corresponding duty in the Act (section 81) came into force on 17 January 2025." |

**Thesis.** Consumer identity on the internet has been a by-product of platform
accounts for twenty-five years: you are who Google or Apple says you are. Two
unrelated regulators are now prising that apart. The EU is issuing a
state-backed credential that the holder controls and that private relying parties
must accept; the UK is obliging consumer services to know an attribute about a user
(their age) that they cannot get from a platform login. Both point at the same new
layer — verifiable attributes, disclosed selectively, issued by someone other than
the platform — and that layer needs wallets, issuers, verifiers and age-estimation
engines that do not exist at scale today.

**Risks.** Wallets are free to citizens by law, so the money is in issuance,
verification and integration rather than the consumer app, and that is a thin, tendered,
government-procurement business. Apple and Google control the secure element and the
OS-level wallet surface and can make the state's wallet a second-class citizen on the
device. Uptake is voluntary for citizens and there is no evidence yet that they want
it. And age assurance is the most contested consumer regulation of the decade —
privacy litigation, circumvention via VPN, and divergent national rules could keep the
market fragmented and low-margin rather than consolidating it.

**Categorisation note.** `consumer` is the honest call — the artefact is an app in a
citizen's pocket and the age-assurance duty attaches to consumer services — but
`infrastructure` is defensible, because the buyer is a government or a relying party,
not the end user. The data-engineer should pick one and say which in the thesis
rather than splitting the candidate. Flagged because §11.8 makes the empty `consumer`
sector a known sore point, and this agent does not want a category chosen to fill a
hole.

**Key players.** Apple ✔ and Google ✔ are in `data/companies.ts` (as wallet-surface
gatekeepers, not as identity vendors). **New:** Thales, IDEMIA, Entrust, Signicat,
Nets/Nexi, Yoti, Persona, Jumio, Onfido/Entrust, Veriff, iProov, Netcetera. None is in
the dataset. Note that Thales and Entrust are already named in `research.md` §7.2.12
under post-quantum cryptography, so adding them serves two candidates.

---

### 13.5 Candidate — Embedded payments and financial services inside vertical software

**Proposed id:** `em-embedded-finance` · **Category:** `vertical` · **Stage:**
`scaling` · **Horizon:** `0-2y`

| # | Type | Evidence | Strength | Source | URL | HTTP | Quoted sentence from the fetched body |
|---|---|---|---|---|---|---|---|
| 1 | `unbundling` | Toast's FY2025 financial technology revenue of $5,037M is **5.4×** its $936M of subscription revenue, on $195.1B of gross payment volume. The software subscription is no longer the product being monetised; the payment flow is. Filed figures, not estimates. | 3 | S116 | https://www.sec.gov/Archives/edgar/data/1650164/000165016426000050/tost-20251231xexhibit991.htm | 200 | "Subscription services $ 256 $ 200 $ 936 $ 706" · "Financial technology solutions 1,334 1,090 5,037 4,053" · "Total revenue 1,633 1,338 6,153 4,960" · "$195.1 billion" (FY2025 gross payment volume) |
| 2 | `unbundling` | The same split holds at a second, independently filed company on a different vertical: Shopify FY2025 merchant solutions revenue $8,804M against $2,752M of subscription solutions, on $378.4B of GMV. Two filers, same ratio direction, same year — this is a pattern, not one company's pricing quirk. | 3 | S117 | https://www.sec.gov/Archives/edgar/data/1594805/000159480526000006/exhibit991pressreleaseq420.htm | 200 | "Years ended December 31, 2025: 11,556 [US $ millions]; 2024: 8,880" (total revenue) · "Years ended December 31, 2025: 2,752 [US $ millions]; 2024: 2,350" (subscription solutions) · "Years ended December 31, 2025: 8,804 [US $ millions]; 2024: 6,530" (merchant solutions) · "Years ended December 31, 2025: 378,441 [US $ millions]; 2024: 292,275" (GMV) |
| 3 | `unbundling` | The software vendor has moved past acquiring into lending: Toast's own 10-K describes an integrated payments platform and a capital product funded through a bank partner — functions that belonged to the merchant acquirer and the bank. | 2 | S118 | https://www.sec.gov/Archives/edgar/data/1650164/000165016426000057/tost-20251231.htm | 200 | "Toast provides a fully-integrated platform that enables our customers to securely accept and process payments, while also providing valuable data-driven insights" · "fast and flexible funding via loans issued by our bank partner" |

**Thesis.** The §7.1 unbundling signal is usually read as a suite losing a feature to a
focused challenger. This is the same mechanic pointed at a different incumbent: the
bloated suite is the **bank and the merchant acquirer**, and vertical software is
taking the profitable job — moving money — while leaving the regulated balance sheet
behind. The filings make it unarguable. A restaurant POS company earns five dollars of
payment revenue for every dollar of software subscription, and a commerce platform
three. Software has stopped being the thing sold and become the distribution channel
for a financial product, which changes what a vertical SaaS company is: pricing,
gross margin, unit economics and competitive moat all follow the payment flow, not
the seat count.

**Risks.** Payment revenue is gross-margin-poor relative to software and drags reported
margins down, so the model trades quality of revenue for quantity. Interchange
regulation can reprice the whole opportunity overnight, and lending exposes a software
company to credit risk it is not structured to carry. The attach rate has a ceiling —
once every customer is on the vendor's payments, growth reverts to merchant volume
growth, which is GDP-like, not software-like.

**Honest caveat on stage and horizon.** `research.md` §7.1 defines the horizon as
"when the category has at least one independent vendor with more than $1B of revenue",
and both filers cleared that years ago. By the Atlas's own rule this is not an
emerging market at all — it is a live one. The data-engineer should consider shipping
it in `markets.ts` instead of `emerging.ts`, or ship it as emerging at
`scaling`/`0-2y` with the thesis stating plainly that the category has already
arrived. It is listed here because it is the best-evidenced **non-AI, unbundling-typed**
candidate found, and because the signal-type imbalance it corrects is real.

**Categorisation note.** `vertical` is the better fit for the thesis (the pattern is
strongest where software owns one industry's transaction flow — Toast in restaurants),
but Shopify is a horizontal commerce platform, so `horizontal` is arguable. Pick one.

**Key players.** Shopify ✔ and Stripe ✔ are in `data/companies.ts`. **New:** Toast,
Adyen, Block/Square, Lightspeed, Mindbody, ServiceTitan, Adobe (already ✔, via
Commerce). Toast is the most valuable addition — it is the cleanest filed example.

---

### 13.6 Candidate — ICT operational resilience and third-party risk (DORA)

**Proposed id:** `em-operational-resilience` · **Category:** `vertical` · **Stage:**
`emerging` · **Horizon:** `2-5y`

| # | Type | Evidence | Strength | Source | URL | HTTP | Quoted sentence from the fetched body |
|---|---|---|---|---|---|---|---|
| 1 | `regulation` | DORA (Regulation (EU) 2022/2554) has been in application since 17 January 2025 across twenty types of financial entity, and it names the deliverables: an ICT risk management framework, major-incident reporting, resilience testing and a register of third-party arrangements. That is a software specification written by a legislature. | 3 | S120 | https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en | 200 | "Regulation (EU) 2022/2554 of the European Parliament and of the Council of 14 December 2022" · "It entered into application on 17 Jan 2025" · "applicable to 20 different types of financial entities and ICT third-party service providers" · "Principles and requirements on ICT risk management framework" · "Reporting of major ICT-related incidents to competent authorities" |
| 2 | `regulation` | The regime reaches past the regulated firms to their suppliers: on 18 November 2025 the European Supervisory Authorities designated critical ICT third-party providers and took them under direct oversight — software and cloud vendors supervised as if they were financial infrastructure. | 3 | S119 | https://www.eba.europa.eu/publications-and-media/press-releases/european-supervisory-authorities-designate-critical-ict-third-party-providers-under-digital | 200 | "18 November 2025" · "the ESAs will assess whether CTPPs have appropriate risk management and governance frameworks in place to ensure the resilience of the services they deliver to financial entities." · "promote the sound management of ICT risk by the critical providers" |

**Thesis.** Vendor risk used to be a spreadsheet and an annual questionnaire. DORA
converts it into a continuously maintained, machine-readable register with statutory
content, mandatory incident timelines and threat-led penetration testing — for twenty
categories of firm, at once, with supervisors reading the output. Regulation of that
specificity does not create demand for consulting; it creates demand for a system of
record. The second-order effect is more interesting than the first: by designating
critical ICT providers and supervising them directly, the EU has made the dependency
of finance on a handful of software vendors an explicitly regulated fact, which is the
same concentration story the Atlas tells elsewhere, now with a supervisor attached.

**Risks.** This may be a GRC feature rather than a market: ServiceNow, Archer, MetricStream
and the big audit firms can absorb it, and the cloud providers will ship DORA-shaped
compliance packs to keep customers in place. It is EU-only, which caps the addressable
base, and the first compliance cycle is a one-off build — spend can fall sharply after
the register exists. This agent verified the obligation and its supervision, **not** a
single euro of vendor revenue; the market inference is the thesis's, not a signal's.

**Key players.** ServiceNow ✔, Microsoft ✔, Google ✔, Amazon ✔, IBM ✔, Oracle ✔ all
appear in `data/companies.ts` — but as **supervised providers**, not as sellers of the
compliance tooling. **New (vendors):** Archer, MetricStream, OneTrust, Riskonnect,
Prevalent, LogicGate, Panaseer. None is in the dataset.

---

### 13.7 Candidate — Digital accessibility compliance (weakest of the six)

**Proposed id:** `em-accessibility` · **Category:** `horizontal` · **Stage:**
`emerging` · **Horizon:** `2-5y`

| # | Type | Evidence | Strength | Source | URL | HTTP | Quoted sentence from the fetched body |
|---|---|---|---|---|---|---|---|
| 1 | `regulation` | The US Department of Justice has made a specific technical standard — WCAG 2.1 Level AA — legally binding on the web content and mobile apps of every state and local government, with dated deadlines by population band. A named standard plus a date is a purchase order. | 3 | S121 | https://www.ada.gov/resources/2024-03-08-web-rule/ | 200 | "State and local governments' web content usually needs to meet WCAG 2.1, Level AA" · "State and local governments' mobile apps usually need to meet WCAG 2.1, Level AA." · "50,000 or more persons" must comply by "April 26, 2027" · "0 to 49,999 persons" and "Special district governments" must comply by "April 26, 2028" |
| 2 | `regulation` | The EU's European Accessibility Act extends equivalent obligations to private products and services — computers and operating systems, smartphones, telephony, banking services, e-books and e-commerce — transposed into national law since June 2022, so the obligations sit in 27 national statutes rather than one. | 2 | S122 | https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en | 200 | "improve the functioning of the internal market for accessible products and services, by removing barriers created by different rules in Member States" · "Member States had to incorporate the European Accessibility Act into their national law by June 2022." (page lists computers and operating systems, ATMs, ticketing and check-in machines, smartphones, TV equipment, telephony services, audio-visual media access, passenger transport services, banking services, e-books and e-commerce) |

**Thesis.** Accessibility has been a matter of goodwill and occasional litigation. Two
large jurisdictions have now made it a specification with a date: the same WCAG
conformance level, applied to public-sector digital services in the US and to consumer
products and services in the EU. Compliance against a testable standard, re-checked on
every release, is exactly the shape of demand that produced static analysis and
security scanning — a continuous automated check wired into CI, not a report.

**Risks.** Automated tooling catches only part of WCAG, so much of the spend goes to
audit and remediation services rather than to software. The category may be absorbed
by the design systems and component libraries — if the framework is accessible by
default, the scanner is a lint rule. And the deadlines move: the ada.gov page this
agent fetched states the compliance dates were **extended** by an Interim Final Rule
published 20 April 2026, which is a live demonstration of the risk that
regulation-driven markets slip with the regulation.

**Do not ship these unverified.** The commonly cited EAA application date of
**28 June 2025** could **not** be confirmed from any page body fetched in this session:
the Commission page above does not state it, and `eur-lex.europa.eu` returned an empty
body to every request (§13.8). Any copy shipped for this candidate must omit that date
or mark it `estimated`. Likewise the pre-extension ADA deadlines (April 2026/2027) are
**not** what the fetched page says today — cite only April 26, 2027 and April 26, 2028.

**Why it is the weakest.** Two signals, both `regulation`, no cost-curve, no
unbundling, no vendor revenue verified, and its headline date could not be confirmed.
It meets the §11.7 bar (at least one sourced signal, every claim quoted) but it is the
first candidate to cut if the radar needs fewer, better entries.

**Key players.** None in `data/companies.ts`. **New:** Deque Systems, Level Access,
AudioEye, Siteimprove, UserWay, Evinced, TPGi.

---

### 13.8 Fetch record — what failed, and how

Recorded per §11.1 so nobody mistakes a blocked host for a missing fact. Every failure
below was an automated-fetch failure, not a paywall.

| Host / URL | Status | Consequence |
|---|---|---|
| `www.ferc.gov` (Order No. 2222 fact sheet, news release) | **403** on two URLs | FERC Order 2222 could **not** be used as a signal for §13.3. Its absence is why signal 4 there is the DOE VPP report instead. |
| `cms.ferc.gov` (mirror) | **403** | same |
| `www.federalregister.gov` (Order 2222 document) | **302** to `unblock.federalregister.gov` — a bot wall, not followed | same |
| `eur-lex.europa.eu` — `/eli/dir/2025/516/oj/eng` | **ECONNRESET** | ViDA quoted from the Commission's own ViDA page (S100) instead of the directive text. |
| `eur-lex.europa.eu` — `/eli/dir/2019/882/oj/eng` and the 2024/1183 summary page | **200 with an empty body** | The EAA application date could not be confirmed; see the warning in §13.7. |
| `www.ofcom.org.uk` (two age-assurance pages) | **403** | UK age assurance quoted from the gov.uk explainer (S114) instead. The "25 July 2025" children's-duties date appeared only in a **search summary**, never in a fetched body, and is therefore **not** used. |
| `www.esafety.gov.au` (social media minimum age) | **timeout (60s)** | Australia's under-16 rule was investigated as a further consumer signal and **dropped unsourced**. |
| `liftoff.energy.gov` | **ENOTFOUND** (DNS) | DOE VPP material taken from `energy.gov` (S111) instead. |
| `taxation-customs.ec.europa.eu/taxation/vat/vat-digital-age_en` | **404** | Correct path is `.../vat-digital-age-vida_en` (S100). |
| `finance.ec.europa.eu/digital-finance/digital-operational-resilience-act-dora_en` | **404** | DORA taken from EIOPA (S120) instead. |
| IRENA *Renewable Power Generation Costs in 2024* summary PDF | **200**, binary PDF, no text extractable (no `pdftoppm` in this environment) | Solar LCOE was **dropped**. The $0.043/kWh and "90% decline since 2010" figures exist only in search summaries here and **must not ship**. Battery costs (S108, S109) carry the cost-curve signal instead. |
| GE Vernova 4Q'25 press release on EDGAR | **200**, but the fetched body did not contain "Electrification Software" | No grid-software vendor revenue figure was verified. Stated as a caveat in §13.3 rather than worked around. |
| Toast FY2025 10-K | **200**, body truncated by the fetcher | Only the two sentences quoted in §13.5 signal 3 were seen; the revenue-recognition description was not. |

### 13.9 Dropped — investigated and not shippable

| Candidate | Signal types sought | Why dropped |
|---|---|---|
| **Solar/renewables LCOE as a cost-curve driver** | cost-curve | The only primary document (IRENA) is a PDF this environment cannot read; every figure available was a search summary. Rather than cite IRENA for a number nobody read — the §11.6 failure mode exactly — the energy candidate was rebuilt on battery costs, which are quotable from two fetched bodies. |
| **Australia's under-16 social media minimum age** | regulation, consumer | `esafety.gov.au` timed out. No substitute primary source was attempted within budget. It would have strengthened §13.4 materially and is the best single lead for a follow-up run. |
| **FERC Order No. 2222 / DER market access** | regulation | FERC blocks automated fetches from two hosts and the Federal Register mirror is behind a bot wall. This is the strongest missing signal in the whole set: it is the regulation that makes §13.3's software purchasable, and it could not be cited. |
| **Grid-software vendor revenue (GE Vernova Electrification Software)** | leading-indicator | Figure not present in the fetched body; see §13.8. |
| **Satellite / Earth-observation data as a falling-cost input** | cost-curve, new-interface | Not attempted. No primary launch-cost series was identified that could be fetched in the remaining budget; listed so a later run does not assume it was checked and rejected. |
| **WebAssembly / edge runtimes as a developer interface** | new-interface | Not attempted, same reason. The honest position is "unexamined", not "no evidence". |

### 13.10 New sources — ready-to-paste `Source` objects

Id block **S100–S122**, per the task brief, clear of the §8.7 allocations. Every one
had its body fetched and read on **23 September 2026**; every `verified: true` is
`verified` in the §11.1 sense.

**Date convention used here, so the data-engineer does not have to guess:**
- For **SEC filings**, `date` is the **fiscal period end as printed in the document**
  (e.g. `"2025-12"` for "Years ended December 31, 2025"), because no publication date
  was visible in the fetched body.
- For **dated press releases**, `date` is the date printed in the body.
- For **living regulator pages with no visible publication date**, `date` is
  `"2026-09"`, the month of retrieval. This is deliberately not the date of the
  underlying instrument: the instrument dates are quoted in the signal tables above,
  where they belong.

`kind` mapping used: `legal` for regulator, statute and government-policy pages;
`company` for a company's own release; `filing` for SEC EDGAR documents; `analyst`
for data publications by IEA, EIA and BloombergNEF; `press` for a government news
article.

```ts
{ id: "S100", title: "VAT in the Digital Age (ViDA)", publisher: "European Commission, Directorate-General for Taxation and Customs Union", date: "2026-09", kind: "legal", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-digital-age-vida_en", verified: true, reliability: "primary" },
{ id: "S101", title: "eInvoicing in Germany", publisher: "European Commission, Digital Building Blocks", date: "2026-09", kind: "legal", url: "https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eInvoicing+in+Germany", verified: true, reliability: "primary" },
{ id: "S102", title: "eInvoicing in France", publisher: "European Commission, Digital Building Blocks", date: "2026-09", kind: "legal", url: "https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eInvoicing+in+France", verified: true, reliability: "primary" },
{ id: "S103", title: "Thomson Reuters Successful Acquisition of Pagero Paves the Way for Significant Growth Opportunities", publisher: "Thomson Reuters", date: "2024-02-26", kind: "company", url: "https://www.thomsonreuters.com/en/press-releases/2024/february/thomson-reuters-successful-acquisition-of-pagero-paves-the-way-for-significant-growth-opportunities", verified: true, reliability: "primary" },
{ id: "S104", title: "CMS Interoperability and Prior Authorization Final Rule (CMS-0057-F)", publisher: "Centers for Medicare & Medicaid Services", date: "2026-09", kind: "legal", url: "https://www.cms.gov/priorities/key-initiatives/burden-reduction/interoperability/policies-and-regulations/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f", verified: true, reliability: "primary" },
{ id: "S105", title: "Fact Sheet: CMS Interoperability and Prior Authorization Final Rule (CMS-0057-F)", publisher: "Centers for Medicare & Medicaid Services", date: "2026-09", kind: "legal", url: "https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f", verified: true, reliability: "primary" },
{ id: "S106", title: "Trusted Exchange Framework and Common Agreement (TEFCA)", publisher: "Assistant Secretary for Technology Policy / Office of the National Coordinator for Health IT", date: "2026-09", kind: "legal", url: "https://www.healthit.gov/topic/interoperability/policy/trusted-exchange-framework-and-common-agreement-tefca", verified: true, reliability: "primary" },
{ id: "S107", title: "Designated QHINs", publisher: "The Sequoia Project (TEFCA Recognized Coordinating Entity)", date: "2026-09", kind: "legal", url: "https://rce.sequoiaproject.org/designated-qhins/", verified: true, reliability: "primary" },
{ id: "S108", title: "Batteries and Secure Energy Transitions — Executive summary", publisher: "International Energy Agency", date: "2026-09", kind: "analyst", url: "https://www.iea.org/reports/batteries-and-secure-energy-transitions/executive-summary", verified: true, reliability: "primary" },
{ id: "S109", title: "Lithium-Ion Battery Pack Prices See Largest Drop Since 2017, Falling to $115 per Kilowatt-Hour", publisher: "BloombergNEF", date: "2026-09", kind: "analyst", url: "https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-see-largest-drop-since-2017-falling-to-115-per-kilowatt-hour-bloombergnef/", verified: true, reliability: "primary" },
{ id: "S110", title: "Battery storage capacity averaged 70% growth over the last three years", publisher: "U.S. Energy Information Administration, Today in Energy", date: "2026-09", kind: "analyst", url: "https://www.eia.gov/todayinenergy/detail.php?id=67925", verified: true, reliability: "primary" },
{ id: "S111", title: "DOE Releases New Report on Pathways to Commercial Liftoff for Virtual Power Plants", publisher: "U.S. Department of Energy", date: "2026-09", kind: "press", url: "https://www.energy.gov/edf/articles/doe-releases-new-report-pathways-commercial-liftoff-virtual-power-plants", verified: true, reliability: "primary" },
{ id: "S112", title: "EU Digital Identity Wallet — Home", publisher: "European Commission, Digital Building Blocks", date: "2026-09", kind: "legal", url: "https://ec.europa.eu/digital-building-blocks/sites/display/EUDIGITALIDENTITYWALLET/EU+Digital+Identity+Wallet+Home", verified: true, reliability: "primary" },
{ id: "S113", title: "European Digital Identity (EUDI) Regulation", publisher: "European Commission, Shaping Europe's Digital Future", date: "2026-09", kind: "legal", url: "https://digital-strategy.ec.europa.eu/en/policies/eudi-regulation", verified: true, reliability: "primary" },
{ id: "S114", title: "Online Safety Act: explainer", publisher: "UK Department for Science, Innovation and Technology (GOV.UK)", date: "2026-09", kind: "legal", url: "https://www.gov.uk/government/publications/online-safety-act-explainer/online-safety-act-explainer", verified: true, reliability: "primary" },
{ id: "S115", title: "EU Digital Identity Wallet — About the initiative", publisher: "European Commission, Digital Building Blocks", date: "2026-09", kind: "legal", url: "https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/694487832/About+the+initiative", verified: true, reliability: "primary" },
{ id: "S116", title: "Toast, Inc. Q4 and full year 2025 results, Exhibit 99.1", publisher: "Toast, Inc. (SEC EDGAR)", date: "2025-12", kind: "filing", url: "https://www.sec.gov/Archives/edgar/data/1650164/000165016426000050/tost-20251231xexhibit991.htm", verified: true, reliability: "primary" },
{ id: "S117", title: "Shopify Inc. fourth-quarter and full-year 2025 results, Exhibit 99.1", publisher: "Shopify Inc. (SEC EDGAR)", date: "2025-12", kind: "filing", url: "https://www.sec.gov/Archives/edgar/data/1594805/000159480526000006/exhibit991pressreleaseq420.htm", verified: true, reliability: "primary" },
{ id: "S118", title: "Toast, Inc. Form 10-K for the fiscal year ended December 31, 2025", publisher: "Toast, Inc. (SEC EDGAR)", date: "2025-12", kind: "filing", url: "https://www.sec.gov/Archives/edgar/data/1650164/000165016426000057/tost-20251231.htm", verified: true, reliability: "primary" },
{ id: "S119", title: "The European Supervisory Authorities designate critical ICT third-party providers under the Digital Operational Resilience Act", publisher: "European Banking Authority", date: "2025-11-18", kind: "legal", url: "https://www.eba.europa.eu/publications-and-media/press-releases/european-supervisory-authorities-designate-critical-ict-third-party-providers-under-digital", verified: true, reliability: "primary" },
{ id: "S120", title: "Digital Operational Resilience Act (DORA)", publisher: "European Insurance and Occupational Pensions Authority", date: "2026-09", kind: "legal", url: "https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en", verified: true, reliability: "primary" },
{ id: "S121", title: "Fact Sheet: New Rule on the Accessibility of Web Content and Mobile Apps Provided by State and Local Governments", publisher: "U.S. Department of Justice, Civil Rights Division (ADA.gov)", date: "2026-09", kind: "legal", url: "https://www.ada.gov/resources/2024-03-08-web-rule/", verified: true, reliability: "primary" },
{ id: "S122", title: "European accessibility act", publisher: "European Commission", date: "2026-09", kind: "legal", url: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en", verified: true, reliability: "primary" },
```

### 13.11 Summary — what this section adds to the radar

| Candidate | Category | Stage | Horizon | Signal types | Strength sum | Ship? |
|---|---|---|---|---|---|---|
| §13.1 E-invoicing and real-time tax reporting | horizontal | scaling | 0-2y | regulation ×3, leading-indicator | 11 | **Yes** — strongest of the six |
| §13.2 Healthcare data interoperability | vertical | emerging | 2-5y | regulation ×2, platform-shift ×2 | 10 | **Yes** |
| §13.3 Grid flexibility / DER orchestration | vertical | emerging | 2-5y | cost-curve ×2, leading-indicator, platform-shift | 11 | **Yes**, with the §13.3 caveat in the thesis |
| §13.4 Digital identity wallets and age assurance | consumer | emerging | 2-5y | regulation ×3, new-interface | 11 | **Yes** — the only candidate that fills the empty `consumer` sector |
| §13.5 Embedded payments in vertical software | vertical | scaling | 0-2y | unbundling ×3 | 8 | **Yes**, but consider `markets.ts` instead — see caveat |
| §13.6 ICT operational resilience (DORA) | vertical | emerging | 2-5y | regulation ×2 | 6 | **Yes**, thin but fully sourced |
| §13.7 Digital accessibility compliance | horizontal | emerging | 2-5y | regulation ×2 | 5 | **Marginal** — cut first if fewer are wanted |

Effect on the §7.1 signal balance if all seven ship: `regulation` goes from 2 of 35 to
**14 of 57**, `cost-curve` from ~1 to 3, `unbundling` from 3 to 6, `new-interface`
gains 1. Category balance becomes infrastructure 8, horizontal 5, vertical 5,
consumer 1, emerging 0. **`emerging` remains an empty sector** — nothing found here
belongs in it, and §11.8's explanation still needs to stand for that one category.

---

## 14. Owner data intake: market sizes and shares (23 September 2026)

Inputs: `data-intake/market-sizes.csv` (85 rows) and `data-intake/market-shares.csv`
(57 rows), 69 unique URLs. Output, one row per data row: `data-intake/verification.csv`.
FRED series: `data-intake/fred-5112.csv`.

**Verdict rules applied.** `reported` means the value was read on the fetched page
(HTML, CSV, or a PDF read with the Read tool). `estimated` means one of three things:
the primary page could not be fetched but the figure was corroborated (by another
fetched page, or by a search-result snippet of the same page, and the Notes column
says which); or the page states the figure only approximately ("nearly", "over",
"surpassed"); or the PDF was fetched but its text could not be extracted. `drop` means
the page contradicts the value, the notes say it is superseded, or it duplicates a
better-sourced row.

### 14.1 Counts by verdict

| market_id | reported | estimated | drop | total |
|---|---|---|---|---|
| total-software | 13 | 7 | 5 | 25 |
| crm | 9 | 14 | 0 | 23 |
| security-software | 2 | 23 | 1 | 26 |
| databases | 10 | 9 | 3 | 22 |
| erp | 2 | 6 | 0 | 8 |
| operating-systems | 0 | 13 | 0 | 13 |
| games | 8 | 0 | 2 | 10 |
| foundation-model-apis | 10 | 0 | 1 | 11 |
| ai-coding-assistants | 2 | 0 | 0 | 2 |
| media-streaming | 1 | 1 | 0 | 2 |
| **Total (142 rows)** | **57** | **73** | **12** | 142 |

Sizes file: 34 reported, 42 estimated, 9 drop. Shares file: 23 reported, 31 estimated, 3 drop.

### 14.2 Every `drop`, with reason

| File | Row | Reason |
|---|---|---|
| sizes | total-software 2001 = 196 (tandfonline/EJIS) | Superseded: the batch-2 row cites OECD IT Outlook 2002 for the same figure, and its notes say it replaces this source |
| sizes | total-software 2025 = 1230 (Gartner Oct 2024) | Superseded per notes by 1,254.449 (Apr 2026 vintage). The fetched CIO.com page reports this forecast as $1.24T |
| sizes | total-software 2026 = 1400 (HPCwire) | Superseded by newer Gartner vintages (Apr 2026: 1,443.621; Jul 2026: ~1,470). "Above $1.4 trillion" was corroborated on CIO.com |
| sizes | total-software 2024 = 553.451 (FRED IPUJN5112T300000000) | **Contradicted.** The current FRED vintage (updated 2026-08-31) shows 2024 = 588,578.441, 2025 = 672,741.186, 2022 = 456,408.324. It is also a different concept (BLS sectoral output) from the Census revenue series |
| sizes | total-software 2026 = 1443.621 | Superseded per notes by the Jul 2026 vintage; the fetched Dataconomy page says "Software spending is forecast to rise 15.5% to $1.47 trillion" |
| sizes | games 2024 = 177.9 | Superseded per notes by Newzoo's final 2024 = 182.7 (read on fetched page) |
| sizes | games 2025 = 188.8 | Superseded per notes by Newzoo's final 2025 = 201.6 (read on fetched page) |
| sizes | foundation-model-apis 2025 = 8.4 | Mid-2025 run-rate; the value is on the page, but for 2025 it is superseded by Menlo's full-year 12.5 |
| sizes | security-software 2014 = 21.276 | The restated table value was not found on any fetched page or snippet. It duplicates the 2014 point, which is corroborated at 21.4 by two fetched pages |
| shares | databases 2005 Oracle 48.6 / IBM 22.0 / Microsoft 15.0 (Business Wire) | Duplicates the batch-2 sellingpower.com rows, which are `reported`. Keep those |

### 14.3 URLs that could not be fetched (after one retry in another form)

web.archive.org is not permitted for the fetch tool, so it could not serve as the retry
route. The retry was `http://` or a host variant.

- **gartner.com: all 26 URLs returned 403** (press releases 2014-05-06, 2014-06-10,
  2015-05-27, 2016-07-14, 2019-06-17, 2019-07-01, 2024-08-28, 2024-10-23, 2025-07-29,
  2026-04-22; documents 3698417, 3883681, 3985627, 4000842, 4432699, 4591199, 4700599,
  4781631, 4801931, 5367363, 5441963, 5525695, 6524002, 6582102, 6588602, 6807034).
  The `http://gartner.com/…` (no-www) form also returned 403.
- businesswire.com 20060524005618: 403 (https and http)
- researchgate.net figure 256695271: 403 (https and http)
- tandfonline.com 10.1057/palgrave.ejis.3000706: 403. The doi.org form redirects back to it, and the link.springer.com mirror redirects to a login
- hpcwire.com/aiwire 2026-02-04: 403 (https, http, and the off-the-wire mirror)
- forbes.com 2015-05-22 and 2016-05-28: 403 (https and http)
- yourstory.com 2011-04: 403 (https and http)
- tadviser.com ERP_systems_(global_market): 404 (raw and %-encoded parentheses)
- techseen.com 2016-05-26: 410 Gone (https and http)
- **Fetched but unreadable:** the OECD IT Outlook 1997 PDF (web-archive-storage.oecd.org) and the
  OECD IT Outlook 2002 PDF both returned 200. Their compressed text could not be extracted, and
  page rendering is not available. Both quoted sentences appear in search-result snippets of the
  same URLs, so the rows are marked `estimated`. They can be upgraded to `reported` after a
  manual PDF check.

### 14.4 FRED REVEF5112ALLEST (Census SAS, software publishers, employer firms)

Fetched as CSV from `https://fred.stlouisfed.org/graph/fredgraph.csv?id=REVEF5112ALLEST`
(200). The series page says: USD millions, annual, source U.S. Census Bureau (Service Annual
Survey), last updated 2024-01-31. The **range obtained is 2002–2022** (21 values, written to
`data-intake/fred-5112.csv`). FRED has no 1998–2001 values. For the 1998+ start, use
SAS 2000 Table 3.0.2 (read on the PDF): 1998 = 72,098; 1999 = 80,959; 2000 = 88,042
(employer firms). Watch for a vintage seam: SAS 2006 gave 2005 = 121,309 against FRED's 116,643.
No 2001 value was obtained.

### 14.5 Other findings the data-engineer needs

- **Title correction:** the princeton.edu PDF (1996 = 109.3, read on pp. 4 and 9) is OECD
  DSTI/ICCP/IE(98)3/FINAL, *Measuring Electronic Commerce: International Trade in Software*
  (distributed 30 April 1998). It is not "Electronic Commerce: Prices and Consumer Issues". The
  underlying data is IDC via the *US Industry and Trade Outlook 1998*.
- **Title correction:** the search index lists Gartner doc 5367363 as *Market Share: All
  Software Markets, Worldwide, 2023*.
- **ERP vintage conflict:** 2023 = 51 (older vintage) versus 2023 = 59 (the vintage behind
  2024 = 66). Ship one vintage only. Fetched cargoson.com uses 59.
- **RDBMS 2004 shares:** 48.9 / 22.4 / 13.9 are the 2006 restatement under Gartner's new
  methodology. The fetched rcpmag.com (May 2005, old methodology) gives Oracle 33.7%,
  IBM 34.1%. Gartner's 2007 release restated Oracle 2005 to 46.8% (fetched computerworld.com).
- **CRM Salesforce 2014:** 18.2% is the 2016 restatement (idm.net.au). The 2015 release said
  18.4%. The CRM 2014 size also moved from 23.2 to 23.4.
- **Weak `estimated` rows** with no page-level corroboration of the exact value:
  security-software 2023 = 76.574 (only the same table's 2025 column is corroborated), and
  the 2015 Trend Micro 4.5 and EMC 3.4 shares (supported only because the five shares sum to
  the fetched 37.6% top-five total). Consider dropping these if a strict standard is wanted.
- **Empty `source_date` filled:** webwire security release 2010-08-16; GamesBeat 2026-06-18;
  gamedevreports 2024 revision post 2025-06-26; "games market in 2024" post 2025-03-12;
  "games market in 2025" post 2025-09-09; medianews4u 2026-09-11.
- The paid-subscription figure (15.2) in the media-streaming 2024 notes is **not** on the
  cited Music Week page.

### 14.6 New sources — ready-to-paste `Source` objects

The ids continue from S122. §12.4 recorded id drift between this log and the shipped
registry, so the data-engineer must confirm the next free id before pasting. Each URL
below was fetched in this pass. Gartner URLs are excluded because none could be fetched.

```ts
{ id: "S123", title: "Total Revenue for Software Publishers, All Establishments, Employer Firms (REVEF5112ALLEST)", publisher: "U.S. Census Bureau via FRED, Federal Reserve Bank of St. Louis", date: "2024-01-31", kind: "analyst", url: "https://fred.stlouisfed.org/series/REVEF5112ALLEST", verified: true, reliability: "primary" },
{ id: "S124", title: "Service Annual Survey: 2000 (Current Business Reports SAS/00)", publisher: "U.S. Census Bureau", date: "2001-12", kind: "analyst", url: "https://www2.census.gov/programs-surveys/services/tables/2000/sas/sas00.pdf", verified: true, reliability: "primary" },
{ id: "S125", title: "Sectoral Output for Information: Software Publishers (NAICS 5112) (IPUJN5112T300000000)", publisher: "U.S. Bureau of Labor Statistics via FRED", date: "2026-08-31", kind: "analyst", url: "https://fred.stlouisfed.org/series/IPUJN5112T300000000", verified: true, reliability: "primary" },
{ id: "S126", title: "Measuring Electronic Commerce: International Trade in Software, DSTI/ICCP/IE(98)3/FINAL", publisher: "OECD (copy hosted by princeton.edu)", date: "1998-04", kind: "analyst", url: "https://www.princeton.edu/~ina/internet/OECDinternetcommerce.PDF", verified: true, reliability: "primary" },
{ id: "S127", title: "Information Technology Outlook 1997", publisher: "OECD", date: "1997", kind: "analyst", url: "https://web-archive-storage.oecd.org/aemint-web-archive-prod/web-archive/ef/ef110b408944567f5da51a6720e7dd242859136a8f2333c03b161d0f2c5f577b.pdf", verified: true, reliability: "primary" },
{ id: "S128", title: "Information Technology Outlook 2002", publisher: "OECD", date: "2002-06", kind: "analyst", url: "https://www.oecd.org/content/dam/oecd/en/publications/reports/2002/06/information-technology-outlook-2002_g1gh2563/it_outlook-2002-en.pdf", verified: true, reliability: "primary" },
{ id: "S129", title: "Gartner Says Worldwide CRM Market Grew 12.5 Percent in 2008 (reprint)", publisher: "Insurance-Canada.ca", date: "2009-07-15", kind: "press", url: "https://insurance-canada.ca/2009/07/15/gartner-says-worldwide-crm-market-grew-12-5-percent-in-2008/", verified: true, reliability: "secondary" },
{ id: "S130", title: "Database Sales Grew By 14.2 Percent in 2006, Says Gartner", publisher: "IT Jungle", date: "2007-06-25", kind: "press", url: "https://www.itjungle.com/2007/06/25/tfh062507-story08/", verified: true, reliability: "secondary" },
{ id: "S131", title: "Gartner: Microsoft #1 in Database Revenue; AWS Passes Oracle; Google Cloud Gains", publisher: "Cloud Database Report", date: "2022-04-20", kind: "press", url: "https://clouddb.substack.com/p/gartner-microsoft-1-in-database-revenue", verified: true, reliability: "secondary" },
{ id: "S132", title: "Gartner Says Security Software Market is Poised for 11 Percent Growth in 2010 (reprint)", publisher: "WebWire", date: "2010-08-16", kind: "press", url: "https://www.webwire.com/ViewPressRel.asp?aId=121439", verified: true, reliability: "secondary" },
{ id: "S133", title: "SAP Ranked No.1 in Gartner's Market Share Analysis by Revenue", publisher: "ERP News", date: "2019", kind: "press", url: "https://erpnews.com/sap-ranked-no-1-in-gartners-market-share-analysis-by-revenue/", verified: true, reliability: "secondary" },
{ id: "S134", title: "Software Industry (Dictionary of American History)", publisher: "Encyclopedia.com", date: "2026-09", kind: "book", url: "https://www.encyclopedia.com/history/dictionaries-thesauruses-pictures-and-press-releases/software-industry", verified: true, reliability: "secondary" },
{ id: "S135", title: "Worldwide enterprise software market grows 8.5% in 2010", publisher: "Telecompaper", date: "2011", kind: "press", url: "https://www.telecompaper.com/news/worldwide-enterprise-software-market-grows-8-5-in-2010--801910", verified: true, reliability: "secondary" },
{ id: "S136", title: "Security software revenue grows 12% to USD 16.5 bln in 2010", publisher: "Telecompaper", date: "2011", kind: "press", url: "https://www.telecompaper.com/news/security-software-revenue-grows-12-to-usd-16-5-bln-in-2010--808027", verified: true, reliability: "secondary" },
{ id: "S137", title: "Gartner Says Worldwide Software Market Grew 4.8 Percent in 2013 (repost)", publisher: "APMdigest", date: "2014-04", kind: "press", url: "https://www.apmdigest.com/gartner-says-worldwide-software-market-grew-48-percent-in-2013", verified: true, reliability: "secondary" },
{ id: "S138", title: "Four Interesting Insights From Gartner 2020 CRM Market Share Update", publisher: "Software Strategies Blog", date: "2021-07-09", kind: "press", url: "https://softwarestrategiesblog.com/2021/07/09/four-interesting-insights-from-gartner-2020-crm-market-share-update/", verified: true, reliability: "secondary" },
{ id: "S139", title: "customer relationship management (tag archive)", publisher: "Software Strategies Blog", date: "2012", kind: "press", url: "https://softwarestrategiesblog.com/tag/customer-relationship-management/", verified: true, reliability: "secondary" },
{ id: "S140", title: "worldwide market share (tag archive)", publisher: "Software Strategies Blog", date: "2013", kind: "press", url: "https://softwarestrategiesblog.com/tag/worldwide-market-share/", verified: true, reliability: "secondary" },
{ id: "S141", title: "Relational Database Market Due for a Shakeup", publisher: "Selling Power", date: "2010-01-13", kind: "press", url: "https://www.sellingpower.com/2010/01/13/1674/relational-database-market-due-for-a-shakeup", verified: true, reliability: "secondary" },
{ id: "S142", title: "2020 in video games", publisher: "Wikipedia", date: "2026-09", kind: "press", url: "https://en.wikipedia.org/wiki/2020_in_video_games", verified: true, reliability: "low" },
{ id: "S143", title: "Global games revenue breached $200B in 2025: Newzoo", publisher: "GamesBeat", date: "2026-06-18", kind: "press", url: "https://gamesbeat.com/global-games-revenue-breached-200b-in-2025-newzoo/", verified: true, reliability: "secondary" },
{ id: "S144", title: "Newzoo: Global Games Market To Reach $99.6 Billion In 2016", publisher: "AListDaily", date: "2016", kind: "press", url: "https://www.alistdaily.com/digital/newzoo-global-games-market-reaches-99-6-billion/", verified: true, reliability: "secondary" },
{ id: "S145", title: "The Global Standing of Video Games", publisher: "globalEDGE, Michigan State University", date: "2017", kind: "press", url: "https://globaledge.msu.edu/blog/postamp/54524/the-global-standing-of-video-games", verified: true, reliability: "secondary" },
{ id: "S146", title: "World electronic gaming revenues to grow 9.6% to $152.1 billion in 2019", publisher: "Euronews (Reuters)", date: "2019-06-18", kind: "press", url: "https://www.euronews.com/2019/06/18/world-electronic-gaming-revenues-to-grow-9-point-6-percent-to-152-point-1-billion-in-2019-report", verified: true, reliability: "secondary" },
{ id: "S147", title: "Newzoo: Global Gaming Market will surpass $200B in 2022", publisher: "GameDev Reports", date: "2022", kind: "press", url: "https://gamedevreports.substack.com/p/newzoo-global-gaming-market-will", verified: true, reliability: "secondary" },
{ id: "S148", title: "Newzoo has once again revised its 2024 report - it's final now", publisher: "GameDev Reports", date: "2025-06-26", kind: "press", url: "https://gamedevreports.substack.com/p/newzoo-has-once-again-revised-its", verified: true, reliability: "secondary" },
{ id: "S149", title: "Global games market to reach $213.9 billion as player base hits 3.7 billion: Newzoo Report", publisher: "MediaNews4U", date: "2026-09-11", kind: "press", url: "https://www.medianews4u.com/global-games-market-to-reach-213-9-billion-as-player-base-hits-3-7-billion-newzoo-report/", verified: true, reliability: "secondary" },
{ id: "S150", title: "IFPI Global Music Report 2025: Paid streaming lifts the market but overall revenue growth slows", publisher: "Music Week", date: "2025-03-19", kind: "press", url: "https://www.musicweek.com/labels/read/ifpi-global-music-report-2025-paid-streaming-lifts-the-market-but-overall-revenue-growth-slows/091626", verified: true, reliability: "secondary" },
{ id: "S151", title: "IFPI: Global recorded music revenue up 6% in 2025", publisher: "Music Week", date: "2026-03-18", kind: "press", url: "https://www.musicweek.com/labels/read/ifpi-global-recorded-music-revenue-up-6-in-2025-as-industry-embraces-the-future-on-ai/093789", verified: true, reliability: "secondary" },
{ id: "S152", title: "2025: The State of Generative AI in the Enterprise", publisher: "Menlo Ventures", date: "2025-12-09", kind: "analyst", url: "https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/", verified: true, reliability: "primary" },
{ id: "S153", title: "2024: The State of Generative AI in the Enterprise", publisher: "Menlo Ventures", date: "2024-11-20", kind: "analyst", url: "https://menlovc.com/2024-the-state-of-generative-ai-in-the-enterprise/", verified: true, reliability: "primary" },
{ id: "S154", title: "Enterprise LLM Spend Reaches $8.4B as Anthropic Overtakes OpenAI, According to New Menlo Ventures Report on LLM Market", publisher: "GlobeNewswire (Menlo Ventures)", date: "2025-07-31", kind: "company", url: "https://www.globenewswire.com/news-release/2025/07/31/3125037/0/en/Enterprise-LLM-Spend-Reaches-8-4B-as-Anthropic-Overtakes-OpenAI-According-to-New-Menlo-Ventures-Report-on-LLM-Market.html", verified: true, reliability: "primary" },
{ id: "S155", title: "Gartner Says Customer Relationship Management Software Market Grew 13.7 Percent in 2013 (reprint)", publisher: "Workflow", date: "2014-05", kind: "press", url: "https://workflowotg.com/gartner-says-customer-relationship-management-software-market-grew-13-7-percent-in-2013/", verified: true, reliability: "secondary" },
{ id: "S156", title: "Worldwide Customer Experience and Relationship Management Software Market Grew 15.6% in 2018: Gartner", publisher: "CIOL", date: "2019-06", kind: "press", url: "https://www.ciol.com/worldwide-customer-experience-relationship-management-software-market-grew-15-6-2018-gartner/", verified: true, reliability: "secondary" },
{ id: "S157", title: "Gartner says CRM Software Market Grew 12.3 Percent in 2015", publisher: "IDM Magazine", date: "2016-05", kind: "press", url: "http://idm.net.au/article/0011036-gartner-says-crm-software-market-grew-123-percent-2015", verified: true, reliability: "secondary" },
{ id: "S158", title: "Gartner forecasts a cloudy future for the database market", publisher: "SiliconANGLE", date: "2019-07-01", kind: "press", url: "https://siliconangle.com/2019/07/01/gartner-forecasts-cloudy-future-database-market/", verified: true, reliability: "secondary" },
{ id: "S159", title: "Gartner Says Worldwide Security Software Market Grew 5.3 Percent in 2014 (reprint)", publisher: "ASEAN Technology & Security Magazine", date: "2015-05", kind: "press", url: "https://aseantechsec.com/gartner-says-worldwide-security-software-market-grew-5-3-percent-in-2014/", verified: true, reliability: "secondary" },
{ id: "S160", title: "Global security software market grew 3.7% to $22.1 bn in 2015", publisher: "Forbes India", date: "2016-07", kind: "press", url: "https://www.forbesindia.com/article/special/global-security-software-market-grew-3.7-to-$22.1-bn-in-2015/43823/1", verified: true, reliability: "secondary" },
{ id: "S161", title: "Gartner Says Worldwide Operating System Software Market Grew to US$30.4 Billion in 2010 (reprint)", publisher: "PRWire", date: "2011-04", kind: "press", url: "https://prwire.com.au/pr/22788/gartner-says-worldwide-operating-system-software-market-grew-to-us-30-4-billion-in-2010", verified: true, reliability: "secondary" },
{ id: "S162", title: "How Big is the ERP Market?", publisher: "Cargoson", date: "2025", kind: "press", url: "https://www.cargoson.com/en/blog/how-big-is-the-erp-market", verified: true, reliability: "secondary" },
{ id: "S163", title: "Gartner Forecasts Worldwide IT Spending to Grow 13.5% in 2026, Totaling $6.31 Trillion (reprint)", publisher: "Yahoo Finance (Business Wire)", date: "2026-04-22", kind: "press", url: "https://finance.yahoo.com/sectors/technology/articles/gartner-forecasts-worldwide-spending-grow-073000604.html", verified: true, reliability: "secondary" },
{ id: "S164", title: "Gartner Forecasts Worldwide End-User Spending on Information Security to Total $213 Billion in 2025 (reprint)", publisher: "CXOToday", date: "2025-07", kind: "press", url: "https://cxotoday.com/media-coverage/gartner-forecasts-worldwide-end-user-spending-on-information-security-to-total-213-billion-in-2025/", verified: true, reliability: "secondary" },
{ id: "S165", title: "Gartner Raises 2026 Global IT Spending Forecast To $6.37 Trillion", publisher: "Dataconomy", date: "2026-07-28", kind: "press", url: "https://dataconomy.com/2026/07/28/it-spending-forecast-2026-6-37t/", verified: true, reliability: "secondary" },
```


## 15. SEC revenue for Alphabet, Apple, Meta and Nvidia (2026-09-24)

Fetched `https://data.sec.gov/api/xbrl/companyfacts/CIK{0001652044,0000320193,0001326801,0001045810}.json`
(HTTP 200 each). Annual revenue read from us-gaap `RevenueFromContractWithCustomerExcludingAssessedTax`,
`Revenues` or `SalesRevenueNet`, 10-K and 10-K/A only, 350–380-day periods, most recent filing per
fiscal year. Gross margin modeled as 1 − cost of revenue ÷ revenue where both share a period end.
Spot checks against the companies' own annual results: Alphabet FY2024 $350.018B, Apple FY2024
$391.035B, Meta FY2024 $164.501B, Nvidia FY2025 $130.497B. Cited as S28 (SEC XBRL, verified).
The same logic is now `scripts/sec-revenue.ts`.

## 16. IDC CRM vendor shares, 2021–2025 (2026-09-24)

`https://cxfoundation.com/news/salesforce-extends-crm-market-lead` (CX Foundation, 9 June 2026,
reporting IDC's Semiannual Software Tracker). Fetched twice; the share table (Salesforce, Oracle,
Microsoft, Adobe, SAP, Others, 2021–2025) matches the article's own sentences ("declined from 20.7%
in 2024 to 20.0%", Microsoft "fell from 5.2% to 4.0%", Oracle "4.1%"). Shipped as reported with an
IDC definition; the 2011–2020 CRM rows are Gartner's and are not comparable.
