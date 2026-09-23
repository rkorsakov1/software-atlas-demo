# Data series: how to add a number

Market sizes, market shares and the size of the whole industry live in three CSV files.
You can add a data point without touching any TypeScript.

| File | One row is | Value column |
|---|---|---|
| `market-sizes.csv` | one market's size in one year | `value_usd_b` (US$ billions) |
| `market-shares.csv` | one vendor's share of one market in one year | `share_percent` |
| `industry-size.csv` | the whole software industry in one year | `value_usd_b` |

After editing, run:

```bash
npm run series          # rebuilds data/generated/series.json from the CSVs
npm run validate-data   # checks every id, number and source
```

Commit the CSV **and** the regenerated `data/generated/series.json`. CI fails if they differ.

## Columns

| Column | Required | Notes |
|---|---|---|
| `market_id` | sizes, shares | An `id` from `data/markets.ts` (e.g. `crm`, `databases`) |
| `year` | yes | The year the figure describes, not the year it was published |
| `value_usd_b` / `share_percent` | yes | Plain number: no `$`, `B` or `%` |
| `low`, `high` | no | Only if the source gives a range, or says "over"/"nearly" |
| `company` | shares | An Atlas company id (`salesforce`) or a plain name (`Trend Micro`). Unknown names become vendors automatically |
| `scope` | industry | `world` or `us` |
| `definition` | industry: yes; others: recommended | What the figure counts, e.g. `Gartner enterprise software vendor revenue`. **A new definition starts a new line in the charts**, so keep the wording identical within one series |
| `confidence` | yes | `reported`, `estimated` or `modeled` (see below) |
| `publisher`, `source_title`, `source_date` | yes | `source_date` is `YYYY`, `YYYY-MM` or `YYYY-MM-DD` |
| `source_kind` | no | `analyst` (default), `press`, `filing`, `company`, `academic`, `book`, `legal` |
| `reliability` | no | `primary` (the publisher's own page), `secondary` (default: a repost or article citing it), `low` |
| `url` | yes, except books | The page that shows the number |
| `quote` | yes | The exact sentence or table row containing the number |
| `verified` | yes | `yes` only after a maintainer opened `url` and found `quote` on it. Otherwise `no` |
| `notes` | modeled: yes | Anything about scope. For `modeled`, the method |

## Confidence

- **reported**: the number appears on the page at `url`, and a maintainer has checked it (`verified=yes`). The build rejects `reported` without `verified=yes`.
- **estimated**: from a credible source you couldn't open, a figure the source states only approximately, or a quarter standing in for a year.
- **modeled**: calculated by us. Explain how in `notes`.

## Rules

1. **One publisher per series.** Gartner and IDC define markets differently, so switching publisher partway through a series creates a jump that isn't real growth. If you must switch, change `definition`.
2. **Use the latest vintage.** Publishers restate past years. Keep one row per year, the most recent restatement, and say so in `notes`.
3. **Actuals over forecasts.** Forecasts only for the current and next year.
4. **No paywalled teasers.** If you can only see the number in a snippet, it's `estimated` at best.
5. **Worldwide by default.** Market sizes are worldwide. US-only industry figures go in `industry-size.csv` with `scope=us`.

Open a pull request with the rows. A maintainer checks each URL and flips `verified` to `yes`.
