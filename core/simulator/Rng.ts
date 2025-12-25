export type Rng = {
  nextFloat: () => number; // [0, 1)
};

/**
 * Creates a seeded pseudo-random number generator (Mulberry32).
 *
 * Given the same seed, this RNG produces the same sequence of numbers.
 * This allows execution schedules to be reproduced for debugging
 * and visualization.
 *
 */
export function makeMulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return {
    nextFloat: () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
  };
}

/**
 * Picks a random index in the range [0, n).
 *
 * This is used by the simulator to randomly choose
 * which runnable thread executes next.
 *
 */
export function pickRandomIndex(rng: Rng, n: number): number {
  // assumes n > 0
  return Math.floor(rng.nextFloat() * n);
}
