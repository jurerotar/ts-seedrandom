import type {
  GeneratorInterface,
  PRNGAlgorithm,
  Xoshiro256StarStarGeneratorState,
} from '../types';
import { fnv1a64, seedToBytes, splitMix64Stream } from '../seed';
import { MASK_64, rotl64_7, rotl64_45, uint64ToDouble } from '../utils';

/**
 * Xoshiro256** PRNG by David Blackman and Sebastiano Vigna.
 * Reference: https://prng.di.unimi.it/xoshiro256starstar.c
 */
class Xoshiro256StarStarGenerator
  implements GeneratorInterface<Xoshiro256StarStarGeneratorState>
{
  s0: bigint;
  s1: bigint;
  s2: bigint;
  s3: bigint;

  constructor(seed: string | number = Date.now()) {
    const next = splitMix64Stream(fnv1a64(seedToBytes(seed)));
    this.s0 = next();
    this.s1 = next();
    this.s2 = next();
    this.s3 = next();

    if (((this.s0 | this.s1 | this.s2 | this.s3) & MASK_64) === 0n) {
      this.s0 = 1n;
    }

    for (let i = 0; i < 16; i++) {
      this.next64();
    }
  }

  next64(): bigint {
    const result = (rotl64_7((this.s1 * 5n) & MASK_64) * 9n) & MASK_64;
    const t = (this.s1 << 17n) & MASK_64;

    this.s2 ^= this.s0;
    this.s3 ^= this.s1;
    this.s1 ^= this.s2;
    this.s0 ^= this.s3;

    this.s2 ^= t;
    this.s3 = rotl64_45(this.s3);

    return result;
  }

  next(): number {
    return uint64ToDouble(this.next64());
  }

  state(): Xoshiro256StarStarGeneratorState {
    return {
      s0: this.s0 & MASK_64,
      s1: this.s1 & MASK_64,
      s2: this.s2 & MASK_64,
      s3: this.s3 & MASK_64,
    };
  }

  setState(state: Xoshiro256StarStarGeneratorState): void {
    this.s0 = BigInt(state.s0) & MASK_64;
    this.s1 = BigInt(state.s1) & MASK_64;
    this.s2 = BigInt(state.s2) & MASK_64;
    this.s3 = BigInt(state.s3) & MASK_64;
  }
}

export const xoshiro256starstar: PRNGAlgorithm<
  Xoshiro256StarStarGeneratorState
> = (seed, state) => {
  const generator = new Xoshiro256StarStarGenerator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => uint64ToDouble(generator.next64());
  prng.quick = prng;
  prng.double = prng;
  prng.int32 = () => Number(generator.next64() & 0xffffffffn) | 0;
  prng.state = () => generator.state();

  return prng;
};
