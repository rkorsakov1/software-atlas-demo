/**
 * Seeded pseudo-random numbers.
 *
 * The simulator must be reproducible: the same seed has to produce byte-identical
 * output on every machine, in tests, and when a reader shares a URL. `Math.random`
 * is therefore banned across the simulator; every random draw comes from here.
 *
 * `mulberry32` is a small, fast 32-bit generator with a 2^32 period — far more
 * than a 60-tick toy model needs, and simple enough to audit in one sitting.
 */

export type RandomSource = () => number;

/** Returns a generator of uniform values in [0, 1) for the given 32-bit seed. */
export const mulberry32 = (seed: number): RandomSource => {
  let state = Math.trunc(seed) >>> 0;

  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Uniform draw on [min, max). */
export const uniform = (random: RandomSource, min: number, max: number): number =>
  min + random() * (max - min);

/**
 * Derives the next seed in a deterministic chain, so the "New seed" button can
 * hand the reader a fresh market without reaching for `Math.random`.
 */
export const nextSeed = (seed: number, maxSeed = 999999): number => {
  const draw = mulberry32(seed + 1)();
  const candidate = Math.floor(draw * (maxSeed + 1));
  if (candidate === seed) return (candidate + 1) % (maxSeed + 1);
  return candidate;
};
