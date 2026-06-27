import type {
  GeneratorInterface,
  PRNGAlgorithm,
  Xoroshiro128PlusGeneratorState,
} from '../types';
import { splitMix64Stream, fnv1a64, seedToBytes } from '../seed';
import { MASK_64, rotl64_24, rotl64_37, uint64ToDouble } from '../utils';

/**
 * Xoroshiro128+ PRNG by David Blackman and Sebastiano Vigna.
 * Reference: https://prng.di.unimi.it/xoroshiro128plus.c
 */
class Xoroshiro128Plus
  implements GeneratorInterface<Xoroshiro128PlusGeneratorState>
{
  s0: bigint;
  s1: bigint;

  constructor(seed: string | number = Date.now()) {
    const h = fnv1a64(seedToBytes(seed));
    const next = splitMix64Stream(h);
    this.s0 = next();
    this.s1 = next();
    if (((this.s0 | this.s1) & MASK_64) === 0n) this.s0 = 1n;
    for (let i = 0; i < 8; i++) this.next();
  }

  next64(): bigint {
    const s0 = this.s0;
    let s1 = this.s1;
    const result = (s0 + s1) & MASK_64;
    s1 ^= s0;
    this.s0 = rotl64_24(s0) ^ s1 ^ ((s1 << 16n) & MASK_64);
    this.s1 = rotl64_37(s1);
    return result;
  }

  next(): number {
    return uint64ToDouble(this.next64());
  }

  state(): Xoroshiro128PlusGeneratorState {
    return {
      s0: this.s0 & MASK_64,
      s1: this.s1 & MASK_64,
    };
  }

  setState(st: Xoroshiro128PlusGeneratorState): void {
    this.s0 = BigInt(st.s0) & MASK_64;
    this.s1 = BigInt(st.s1) & MASK_64;
  }
}

export const xoroshiro128plus: PRNGAlgorithm<Xoroshiro128PlusGeneratorState> = (
  seed,
  state,
) => {
  const generator = new Xoroshiro128Plus(seed);

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
