/**
 * Tail pooling for the market treemap.
 *
 * Fifty-odd tiles in one 420px box gives most markets a sliver too small to label,
 * which `docs/CONTRACTS.md` §10.1 and §10.6 both rule out. Rather than drawing
 * labels that do not fit, each category keeps the tiles that are big enough to
 * read and pools the rest into a single "Other (N markets)" tile; the full list
 * is always in the table view and one click opens the category on its own.
 */

/** Smallest tile area, in square pixels, that can hold a 12px label line. */
export const MIN_TILE_AREA = 1800;

/** Upper bound on tiles per category, whatever the areas say. */
export const MAX_TILES_PER_CATEGORY = 12;

/** Pooling one market into "Other" hides it for nothing, so never pool fewer than two. */
export const MIN_POOLED_TILES = 2;

export type TreemapTailSplit<TItem> = {
  /** Drawn as their own tiles, largest first. */
  kept: TItem[];
  /** Drawn as one "Other" tile, or empty when pooling was not worth it. */
  pooled: TItem[];
};

export type TreemapTailOptions = {
  /** Sum of every value in the treemap, not just this category. */
  totalValue: number;
  /** Usable plot area in square pixels. */
  plotArea: number;
  minTileArea?: number;
  maxTiles?: number;
};

/**
 * Splits one category's markets into the tiles worth drawing and the tail to
 * pool. A market is kept while its projected area clears `minTileArea` and the
 * category is under `maxTiles`; because the input is sorted by value, the first
 * failure ends the kept run.
 */
export const splitTreemapTail = <TItem>(
  items: readonly TItem[],
  valueOf: (item: TItem) => number,
  options: TreemapTailOptions,
): TreemapTailSplit<TItem> => {
  const {
    totalValue,
    plotArea,
    minTileArea = MIN_TILE_AREA,
    maxTiles = MAX_TILES_PER_CATEGORY,
  } = options;

  const sorted = [...items].sort((a, b) => valueOf(b) - valueOf(a));
  if (totalValue <= 0 || plotArea <= 0) return { kept: sorted, pooled: [] };

  const kept: TItem[] = [];
  const pooled: TItem[] = [];

  for (const item of sorted) {
    if (pooled.length > 0) {
      pooled.push(item);
      continue;
    }
    const projectedArea = (Math.max(0, valueOf(item)) / totalValue) * plotArea;
    if (kept.length < maxTiles && projectedArea >= minTileArea) {
      kept.push(item);
      continue;
    }
    pooled.push(item);
  }

  // A category drawn as nothing but an "Other" tile tells the reader nothing, so
  // the largest market always keeps its own tile.
  if (kept.length === 0 && pooled.length > 0) {
    const largest = pooled.shift();
    if (largest !== undefined) kept.push(largest);
  }

  if (pooled.length < MIN_POOLED_TILES) return { kept: sorted, pooled: [] };
  return { kept, pooled };
};

export const sumValues = <TItem>(
  items: readonly TItem[],
  valueOf: (item: TItem) => number,
): number => items.reduce((total, item) => total + Math.max(0, valueOf(item)), 0);

export const pooledTileLabel = (count: number): string =>
  count === 1 ? "Other (1 market)" : `Other (${count} markets)`;
