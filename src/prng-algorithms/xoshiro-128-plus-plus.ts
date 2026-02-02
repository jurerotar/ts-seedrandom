import type {
  GeneratorInterface,
  PRNGAlgorithm,
  Xoshiro128PlusPlusGeneratorState,
} from '../types';
import { rotl } from '../utils';
import { expand32From64 } from '../seed';

/**
 * Xoshiro128++ PRNG by David Blackman and Sebastiano Vigna.
 * Reference: https://prng.di.unimi.it/xoshiro128plusplus.c
 */
class Xoshiro128PlusPlusGenerator
  implements GeneratorInterface<Xoshiro128PlusPlusGeneratorState>
{
  s0: number;
  s1: number;
  s2: number;
  s3: number;

  constructor(seed: string | number = Date.now()) {
    const s = expand32From64(seed, 4);
    this.s0 = s[0] >>> 0;
    this.s1 = s[1] >>> 0;
    this.s2 = s[2] >>> 0;
    this.s3 = s[3] >>> 0;

    if ((this.s0 | this.s1 | this.s2 | this.s3) === 0) {
      this.s0 = 1;
    }

    for (let i = 0; i < 16; i++) {
      this.nextInt();
    }
  }

  nextInt(): number {
    const result = (rotl((this.s1 * 5) >>> 0, 7) * 9) >>> 0;

    const t = (this.s1 << 9) >>> 0;

    this.s2 ^= this.s0;
    this.s3 ^= this.s1;
    this.s1 ^= this.s2;
    this.s0 ^= this.s3;

    this.s2 ^= t;
    this.s3 = rotl(this.s3, 11);

    return result >>> 0;
  }

  next(): number {
    return this.nextInt() / 4294967296;
  }

  state(): Xoshiro128PlusPlusGeneratorState {
    return {
      s0: this.s0 >>> 0,
      s1: this.s1 >>> 0,
      s2: this.s2 >>> 0,
      s3: this.s3 >>> 0,
    };
  }

  setState(state: Xoshiro128PlusPlusGeneratorState): void {
    this.s0 = state.s0 >>> 0;
    this.s1 = state.s1 >>> 0;
    this.s2 = state.s2 >>> 0;
    this.s3 = state.s3 >>> 0;
  }
}

export const xoshiro128plusplus: PRNGAlgorithm<
  Xoshiro128PlusPlusGeneratorState
> = (seed, state) => {
  const generator = new Xoshiro128PlusPlusGenerator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.next();
  prng.quick = prng;
  prng.double = () =>
    prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => (generator.nextInt?.() ?? prng() * 0x100000000) | 0;
  prng.state = () => generator.state();

  return prng;
};
