import type {
  GeneratorInterface,
  Lcg32GeneratorState,
  PRNGAlgorithm,
} from '../types';
import { UINT32_TO_DOUBLE } from '../utils';
import { expand32 } from '../seed';

const MULTIPLIER = 1664525;
const INCREMENT = 1013904223;

/**
 * 32-bit linear congruential generator using the Numerical Recipes constants.
 * Fast and historically common, but statistically weak, especially in low bits.
 * Reference: https://en.wikipedia.org/wiki/Linear_congruential_generator
 */
class Lcg32Generator implements GeneratorInterface<Lcg32GeneratorState> {
  s: number;

  constructor(seed: string | number = Date.now()) {
    this.s = expand32(seed, 1)[0] >>> 0;
  }

  nextUint32(): number {
    this.s = (Math.imul(this.s, MULTIPLIER) + INCREMENT) >>> 0;
    return this.s;
  }

  next(): number {
    return this.nextUint32() * UINT32_TO_DOUBLE;
  }

  state(): Lcg32GeneratorState {
    return {
      s: this.s >>> 0,
    };
  }

  setState(state: Lcg32GeneratorState): void {
    this.s = state.s >>> 0;
  }
}

export const lcg32: PRNGAlgorithm<Lcg32GeneratorState> = (seed, state) => {
  const generator = new Lcg32Generator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.nextUint32() * UINT32_TO_DOUBLE;
  prng.quick = prng;
  prng.double = () =>
    prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => generator.nextUint32() | 0;
  prng.state = () => generator.state();

  return prng;
};
