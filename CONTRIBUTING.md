# Contributing to The Software Atlas

Thanks for helping. There are two ways in: adding data (no TypeScript needed) and changing code.

## Setup

```bash
npm ci
npm run dev        # http://localhost:3000
```

Node 22 or newer.

## Adding or correcting data

Most contributions are numbers: a market's size in a given year, a vendor's share, or the size of the
whole industry. These live in three CSV files; `data/series/README.md` explains every column.

1. Add one row per figure to the right CSV in `data/series/`, with the source URL and the exact quote
   that contains the number. Leave `verified` as `no`.
2. Run `npm run series`, then `npm run validate-data`.
3. Open a pull request. A maintainer opens each URL, checks the quote, and sets `verified=yes`
   (which is what allows `confidence=reported`).

Rules that keep the Atlas honest:

- **Never enter a number you can't point to.** No figures from memory. No URLs you haven't opened.
- **One publisher per series.** If the definition changes, change the `definition` column. The charts
  then break the line instead of showing a jump that isn't growth.
- **Say what's uncertain.** Use `estimated` when a source is approximate or you couldn't open it, and
  `modeled` when you calculated it (explain how in `notes`).

**Company revenue for US filers** comes straight from SEC filings. Find the company's CIK on
[EDGAR](https://www.sec.gov/edgar/searchedgar/companysearch), then run:

```bash
SEC_USER_AGENT="Your Name you@example.com" npm run sec-revenue -- <atlasCompanyId>:<CIK>
```

It prints `revenueByYear` and `grossMarginByYear` blocks to paste into that company in
`data/companies.ts`. The SEC requires a contact email in the User-Agent.

Everything else (eras, events, companies, emerging markets, story chapters) is in the TypeScript files
in `data/`. It's validated by the Zod schemas in `data/schemas.ts` and by `scripts/validate-data.ts`.

## Changing code

Before opening a pull request:

```bash
npm run validate-data && npm run typecheck && npm run lint && npm test
```

CI runs the same checks. Conventions:

- TypeScript strict, no `any`, no `@ts-ignore`.
- Tailwind classes only. Conditional classes use `cn()` with object syntax.
- `const` arrow functions with explicit types. Event handlers are named `handle…`.
- Charts in `components/charts/` are presentational: they get typed data and callbacks through props
  and never import from `data/`. Filtering belongs in `lib/selectors.ts`.
- Every interactive SVG mark is keyboard-reachable (`tabIndex`, `role`, `aria-label`, Enter/Space).
  Every chart has a "View as table" alternative.
- Estimated and modeled values must look different from reported ones, and every tooltip shows the
  value, year, source and confidence.

## Licences

Code is MIT (`LICENSE`). Data and text are CC BY 4.0 (`LICENSE-DATA.md`). By contributing you agree
your contribution is released under these licences.
