# Market-size data request

**Why:** the treemap's year slider has nothing to animate. 53 of 55 markets have a single
size bucket (e.g. "XL, 2025"). Real multi-year series for the biggest markets fix that.

**Where to put it:** `data-intake/market-sizes.csv`. The header is already there. One row per
market per year. Save as UTF-8 CSV and put any value containing a comma in double quotes.
Paste links into the chat if that's easier; I'll do the typing.

---

## 1. Columns

| Column | Required | Example | Notes |
|---|---|---|---|
| `market_id` | yes | `crm` | Must match an id from the tables in §3 |
| `year` | yes | `2019` | Calendar year the figure describes, not the year it was published |
| `value_usd_b` | yes | `48.2` | Billions of US dollars, worldwide. No `$` or `B` |
| `low` / `high` | no | `45` / `52` | Only if the source gives a range |
| `kind` | yes | `actual` | `actual` (reported/estimated after the fact) or `forecast` |
| `publisher` | yes | `Gartner` | Gartner, IDC, Synergy, US Census, company 10-K, etc. |
| `source_title` | yes | `Gartner Says Worldwide CRM Market Grew 15.6% in 2018` | Page or press release title |
| `source_date` | yes | `2019-06-17` | Publication date, `YYYY-MM-DD` or `YYYY-MM` |
| `url` | yes* | `https://www.gartner.com/en/newsroom/...` | *Leave blank only for books or print |
| `quote` | yes | `"CRM software revenue reached $48.2 billion in 2018"` | The exact sentence with the number. I verify against this |
| `notes` | no | `software revenue only, excludes services` | Anything about what the figure includes or excludes |

**Example rows**

```csv
market_id,year,value_usd_b,low,high,kind,publisher,source_title,source_date,url,quote,notes
crm,2018,48.2,,,actual,Gartner,"Gartner Says CRM Became the Largest Software Market in 2018",2019-06-17,https://www.gartner.com/...,"CRM software revenue reached $48.2 billion in 2018",
databases,2021,80,,,actual,Gartner,"...",2022-..,https://...,"...",DBMS market incl. cloud dbPaaS
```

(These examples show the format only. Please don't copy the figures in them.)

---

## 2. Rules that make the data usable

1. **Use one publisher per market where you can.** A trend line that switches from IDC to
   Gartner partway through shows a jump that is really a change of definition. If you have to
   switch, say so in `notes`.
2. **Include the `quote`.** It's what lets me mark a figure as verified instead of estimated.
3. **Actuals beat forecasts.** Use a forecast only for the current or next year, and mark it
   `kind=forecast`.
4. **Aim for one figure every 5 years** (1995, 2000, 2005, 2010, 2015, 2020, 2025). Annual
   figures are better, but 3 or 4 well-sourced points per market is enough to draw a curve.
5. **Worldwide figures only.** If you only find a US or regional figure, include it and write
   `US only` in `notes`. I'll decide case by case.
6. **Vendor-revenue totals are fine.** "Top 5 vendors had $X revenue" is useful if the source
   says what share of the market that is.
7. **Skip paywalled numbers you can only see in a teaser or snippet.** Use press releases,
   annual reports and government statistics.

**Good free sources**
- Gartner / IDC newsroom press releases (e.g. "Gartner Says Worldwide … Market Grew …")
- Synergy Research press releases (cloud; already in use)
- US Census *Service Annual Survey*, NAICS 5112 "Software publishers" (US revenue back to the 1990s)
- OECD *Information Technology Outlook* (historical software market sizes)
- Company 10-Ks, when one company is effectively the market (e.g. Epic/Cerner for EHR)
- Newzoo (games), IFPI/MPA (music/video streaming revenue)

---

## 3. What to collect, in priority order

### Tier 1: start here (biggest markets and the backbone of the story)

| `market_id` | Market | Since | Ideal years |
|---|---|---|---|
| `total-software` | **Total worldwide software market** (new id, anchors the early eras) | 1970 | 1970, 1975, 1980, 1985, 1990, 1995 … 2025 |
| `crm` | CRM | 1993 | 2000 → 2025 |
| `erp` | ERP | 1992 | 1995 → 2025 |
| `databases` | Databases (DBMS) | 1979 | 1990 → 2025 |
| `security-software` | Security software | 1989 | 2000 → 2025 |
| `productivity-suites` | Productivity suites (Office, Workspace) | 1990 | 1995 → 2025 |
| `games` | Games software | 1980 | 1990 → 2025 |
| `social-messaging` | Social and messaging (ad + subscription revenue) | 2004 | 2008 → 2025 |
| `media-streaming` | Media and streaming (video + music subscription/ad) | 2007 | 2010 → 2025 |
| `marketing-ad-tech` | Marketing and ad tech | 1998 | 2005 → 2025 |
| `foundation-model-apis` | Foundation model APIs | 2020 | 2022 → 2026 |

### Tier 2: next most useful

| `market_id` | Market | Since |
|---|---|---|
| `analytics-bi` | Analytics and BI | 1991 |
| `hcm-payroll` | HCM and payroll | 1989 |
| `collaboration-software` | Collaboration and work management | 2003 |
| `developer-tools` | Developer tools | 1983 |
| `observability` | Observability and monitoring | 2010 |
| `healthcare-it` | Healthcare IT | 1979 |
| `operating-systems` | Operating systems | 1969 |
| `mobile-os` | Mobile OS and app stores (app-store consumer spend is a good proxy) | 2008 |
| `cloud-data-warehouse` | Cloud data warehouse / lakehouse | 2012 |
| `gpu-ai-cloud` | GPU and AI capacity cloud | 2019 |
| `consumer-ai-assistants` | Consumer AI assistants | 2022 |
| `ai-coding-assistants` | AI coding assistants | 2021 |

### Tier 3: only if you run into them

`serverless-paas`, `server-os`, `nosql-databases`, `data-platforms-integration`,
`data-streaming`, `endpoint-security`, `identity-access-management`, `cloud-security`,
`networking-cdn`, `source-control-cicd`, `vector-search-retrieval`,
`virtualization-private-cloud`, `team-chat`, `video-conferencing`,
`customer-service-software`, `marketing-automation`, `supply-chain-management`,
`finance-spend-management`, `itsm`, `design-creative`, `interface-design-tools`,
`demand-side-platforms`, `ehr`, `life-sciences-software`, `financial-services-software`,
`core-banking`, `construction-aec`, `legal-software`, `restaurant-hospitality-software`,
`auto-dealer-software`, `government-public-sector-software`, `ai-model-infrastructure`.

`cloud-infrastructure` already has a series (Synergy). Extra years there are welcome
but not needed.

---

## 4. Optional: market share data

Share-over-time charts currently exist only for cloud infrastructure. If you find a publisher
that reports vendor shares for the same market in several years (Gartner does this for CRM,
DBMS and security; IDC for some others), use `data-intake/market-shares.csv`:

```csv
market_id,year,company,share_percent,publisher,source_title,source_date,url,quote
crm,2018,Salesforce,19.5,Gartner,"...",2019-06-17,https://...,"Salesforce ... 19.5% market share"
```

Company names can be written as normal names. I'll map them to ids.

---

## 5. What happens next

Tell me when a batch is in (even 3–4 markets). I will:
1. Open each URL and check the quote. Figures that check out ship as **reported** and are logged
   in `docs/verification-log.md`. Anything I can't open ships as **estimated**.
2. Add the series to `data/markets.ts` and run `npm run validate-data`.
3. Markets without a series stay as a size bucket. The treemap will show them as "size range
   only" instead of pretending they grew.
