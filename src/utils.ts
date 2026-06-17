import type { GeneratorInterface, PRNGAlgorithmState } from './types';

export const mash = (): ((seed: string) => number) => {
  let n = 0xefc8249d;

  return (seed: string): number => {
    for (let i = 0; i < seed.length; i++) {
      n += seed.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };
};

export const xorDouble = <T = PRNGAlgorithmState>(
  generator: GeneratorInterface<T>,
): number => {
  let top: number;
  let bot: number;
  let result: number;

  do {
    top = generator.next() >>> 11;
    bot = (generator.next() >>> 0) / 0x100000000;
    result = (top + bot) / (1 << 21);
  } while (result === 0);
  return result;
};

export const rotl = (x: number, k: number): number => {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
};

export const MASK_64 = 0xffffffffffffffffn;

export const rotl64 = (x: bigint, k: number): bigint => {
  const n = BigInt(k & 63);
  return ((x << n) | (x >> (64n - n))) & MASK_64;
};

export const uint64ToDouble = (x: bigint): number => {
  return Number((x & MASK_64) >> 11n) / 9007199254740992;
};
