import type {
  GeneratorInterface,
  PRNGAlgorithm,
  SplitMix64GeneratorState,
} from '../types';
import { MASK_64, uint64ToDouble } from '../utils';

/**
 * SplitMix64 PRNG by Guy Steele, Doug Lea, and Christine Flood.
 * Reference: https://prng.di.unimi.it/splitmix64.c
 */
class SplitMix64Generator
  implements GeneratorInterface<SplitMix64GeneratorState>
{
  s: bigint;

  constructor(seed: string | number = Date.now()) {
    const seedNum =
      typeof seed === 'number'
        ? BigInt(seed)
        : BigInt(
            [...seed.toString()].reduce((acc, c) => acc + c.charCodeAt(0), 0),
          );
    this.s = seedNum & MASK_64;
  }

  nextUint64(): bigint {
    this.s = (this.s + 0x9e3779b97f4a7c15n) & MASK_64;
    let z = this.s;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK_64;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK_64;
    return z ^ (z >> 31n);
  }

  next(): number {
    return uint64ToDouble(this.nextUint64());
  }

  state(): SplitMix64GeneratorState {
    return {
      s: this.s,
    };
  }

  setState({ s }: SplitMix64GeneratorState): void {
    this.s = s & MASK_64;
  }
}

export const splitMix64: PRNGAlgorithm<SplitMix64GeneratorState> = (
  seed,
  state,
) => {
  const generator = new SplitMix64Generator(seed);

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
