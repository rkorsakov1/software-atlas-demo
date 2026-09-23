# The Software Atlas

How software markets are born, consolidate, get disrupted and give rise to new ones, from 1950 to
today.

Two ways to read it:

- **Story**: ten short chapters, each with an interactive chart.
- **Explore**: eras and events, market sizes, vendor shares, revenue and growth, acquisitions,
  bundling, moats and emerging markets, with filters, a shared year slider and shareable URLs.

It's a static site (Next.js static export). There is no backend.

## Run it

```bash
npm ci
npm run dev          # http://localhost:3000
npm run build        # static site in out/
```

Node 22 or newer.

| Script | What it does |
|---|---|
| `npm run series` | Rebuilds `data/generated/series.json` from the CSVs in `data/series/` |
| `npm run validate-data` | Checks the generated series is current, then every id, source and number |
| `npm run typecheck` / `lint` / `test` | TypeScript, ESLint, Vitest |

## The data

Every number has a year, a source and a confidence level:

| Confidence | Meaning | Looks like |
|---|---|---|
| reported | Read on the cited page by a maintainer | Solid |
| estimated | From a credible source that's approximate or couldn't be opened | Lighter or hollow |
| modeled | Calculated here; the method is on the point | Dashed |

Market sizes, vendor shares and the size of the whole industry live in plain CSV files in
`data/series/`. You can add a figure by adding one line with its source URL and quote. See
[`data/series/README.md`](data/series/README.md).

Everything else (eras, markets, companies, events, emerging markets, story chapters) is typed
TypeScript in `data/`, validated by Zod schemas and `scripts/validate-data.ts`.

### Where the numbers come from

- **Industry size, 1970–2026:** INPUT via Campbell-Kelly (US, 1970–2000), OECD (worldwide packaged
  software, 1990s), US Census Service Annual Survey and FRED (US software publishers, 1998–2022),
  and Gartner (worldwide, 2009 onwards). Each publisher's definition is drawn as its own line.
- **Market sizes:** Gartner market-share releases for CRM, ERP, databases, security and operating
  systems; Newzoo for games; Menlo Ventures for foundation-model APIs and AI coding tools; Synergy
  Research for cloud infrastructure. The rest are order-of-magnitude bands until someone finds a series.
- **Vendor shares:** Synergy (cloud), Gartner (CRM, databases, security, operating systems, ERP) and
  Menlo Ventures (foundation-model APIs).
- **Company revenue:** SEC XBRL filings.

### Known limits

- **Definitions change.** Gartner widened CRM in 2018, and security switched from vendor revenue to
  end-user spending. The charts break the line at each change and don't compute growth across it.
- **Gartner pages block automated checks,** so Gartner figures are `estimated` unless a reprint of the
  same release could be read.
- **Before 1995 only US figures exist,** and no market below the whole industry is sized before 2004.
- **Private AI company revenue is run-rate,** reported by the press rather than audited.
- **Moat scores are judgements,** made against the rubric on the methodology page.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The most useful contribution is a sourced number that fills
a gap: a market size for a year we don't have, or a vendor share series.

## Licences

Code: MIT ([LICENSE](LICENSE)). Data and text: CC BY 4.0 ([LICENSE-DATA.md](LICENSE-DATA.md)).
Third-party figures remain their publishers'.

## Disclosure

The Atlas was built with Claude, an AI model made by Anthropic. Anthropic also appears in it as a
market participant: its figures come from third-party reporting, and it is scored on the same rubric
as its competitors.
