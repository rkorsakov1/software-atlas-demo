import { describe, expect, it } from "vitest";

import {
  MAX_TILES_PER_CATEGORY,
  MIN_TILE_AREA,
  pooledTileLabel,
  splitTreemapTail,
  sumValues,
} from "@/components/charts/primitives/atlasTreemapMath";

type Item = { id: string; value: number };

const valueOf = (item: Item): number => item.value;

const items = (...values: number[]): Item[] =>
  values.map((value, index) => ({ id: `m${index}`, value }));

describe("splitTreemapTail", () => {
  it("keeps tiles that project to a readable area", () => {
    const split = splitTreemapTail(items(100, 100, 100), valueOf, {
      totalValue: 300,
      plotArea: 300_000,
    });
    expect(split.kept).toHaveLength(3);
    expect(split.pooled).toHaveLength(0);
  });

  it("pools the tail that would be too small to label", () => {
    const split = splitTreemapTail(items(500, 300, 2, 1, 1), valueOf, {
      totalValue: 805,
      plotArea: 200_000,
    });
    expect(split.kept.map(valueOf)).toEqual([500, 300]);
    expect(split.pooled.map(valueOf)).toEqual([2, 1, 1]);
  });

  it("sorts largest first before deciding", () => {
    const split = splitTreemapTail(items(1, 900, 2), valueOf, {
      totalValue: 903,
      plotArea: 200_000,
    });
    expect(split.kept[0]?.value).toBe(900);
  });

  it("never pools a single market, because that hides it for nothing", () => {
    const split = splitTreemapTail(items(500, 300, 1), valueOf, {
      totalValue: 801,
      plotArea: 200_000,
    });
    expect(split.pooled).toHaveLength(0);
    expect(split.kept).toHaveLength(3);
  });

  it("caps the number of tiles in one category", () => {
    const many = items(...Array.from({ length: 20 }, () => 100));
    const split = splitTreemapTail(many, valueOf, {
      totalValue: 2000,
      plotArea: 10_000_000,
    });
    expect(split.kept).toHaveLength(MAX_TILES_PER_CATEGORY);
    expect(split.pooled).toHaveLength(8);
  });

  it("pools more aggressively as the plot gets smaller", () => {
    const values = items(500, 200, 60, 50, 40);
    const wide = splitTreemapTail(values, valueOf, { totalValue: 850, plotArea: 400_000 });
    const narrow = splitTreemapTail(values, valueOf, { totalValue: 850, plotArea: 20_000 });
    expect(narrow.kept.length).toBeLessThan(wide.kept.length);
  });

  it("keeps everything when there is no area to reason about", () => {
    const split = splitTreemapTail(items(5, 4, 3), valueOf, { totalValue: 12, plotArea: 0 });
    expect(split.kept).toHaveLength(3);
    expect(split.pooled).toHaveLength(0);
  });

  it("respects an explicit minimum tile area", () => {
    const split = splitTreemapTail(items(100, 20, 10, 5), valueOf, {
      totalValue: 135,
      plotArea: 100_000,
      minTileArea: MIN_TILE_AREA * 100,
    });
    expect(split.kept.map(valueOf)).toEqual([100]);
    expect(split.pooled).toHaveLength(3);
  });

  it("always leaves the largest market a tile of its own", () => {
    const split = splitTreemapTail(items(9, 8, 7), valueOf, {
      totalValue: 24,
      plotArea: 100,
    });
    expect(split.kept.map(valueOf)).toEqual([9]);
    expect(split.pooled.map(valueOf)).toEqual([8, 7]);
  });
});

describe("sumValues", () => {
  it("ignores negative values rather than subtracting them", () => {
    expect(sumValues(items(10, -5, 5), valueOf)).toBe(15);
  });
});

describe("pooledTileLabel", () => {
  it("counts markets in words a reader can check against the table", () => {
    expect(pooledTileLabel(1)).toBe("Other (1 market)");
    expect(pooledTileLabel(7)).toBe("Other (7 markets)");
  });
});
