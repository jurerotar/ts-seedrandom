import type {
  GeneratorInterface,
  PRNGAlgorithm,
  XorShift64StarGeneratorState,
} from '../types';
import { fnv1a64, seedToBytes } from '../seed';
import { MASK_64, uint64ToDouble } from '../utils';

const MULTIPLIER = 2685821657736338717n;

/**
 * XorShift64* PRNG by George Marsaglia, with Sebastiano Vigna's multiplicative scrambler.
 * Better than plain XorShift64, but still linear over its state and not a general-purpose modern default.
 * Reference: https://vigna.di.unimi.it/ftp/papers/xorshift.pdf
 */
class XorShift64StarGenerator
  implements GeneratorInterface<XorShift64StarGeneratorState>
{
  s: bigint;

  constructor(seed: string | number = Date.now()) {
    this.s = fnv1a64(seedToBytes(seed)) & MASK_64;

    if (this.s === 0n) {
      this.s = 1n;
    }
  }

  nextUint64(): bigint {
    let x = this.s;
    x ^= x >> 12n;
    x ^= (x << 25n) & MASK_64;
    x ^= x >> 27n;
    this.s = x;
    return (this.s * MULTIPLIER) & MASK_64;
  }

  next(): number {
    return uint64ToDouble(this.nextUint64());
  }

  state(): XorShift64StarGeneratorState {
    return {
      s: this.s,
    };
  }

  setState(state: XorShift64StarGeneratorState): void {
    this.s = BigInt(state.s) & MASK_64;

    if (this.s === 0n) {
      this.s = 1n;
    }
  }
}

export const xorshift64star: PRNGAlgorithm<XorShift64StarGeneratorState> = (
  seed,
  state,
) => {
  const generator = new XorShift64StarGenerator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => uint64ToDouble(generator.nextUint64());
  prng.quick = prng;
  prng.double = prng;
  prng.int32 = () => Number(generator.nextUint64() & 0xffffffffn) | 0;
  prng.state = () => generator.state();

  return prng;
};
