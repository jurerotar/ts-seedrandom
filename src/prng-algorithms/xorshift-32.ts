import type {
  GeneratorInterface,
  PRNGAlgorithm,
  XorShift32GeneratorState,
} from '../types';
import { expand32 } from '../seed';

/**
 * Marsaglia XorShift32 PRNG.
 * Extremely small and fast, but has linear artifacts and a short 2^32 - 1 period.
 * Reference: https://www.jstatsoft.org/article/view/v008i14
 */
class XorShift32Generator
  implements GeneratorInterface<XorShift32GeneratorState>
{
  s: number;

  constructor(seed: string | number = Date.now()) {
    this.s = expand32(seed, 1)[0] >>> 0;

    if (this.s === 0) {
      this.s = 1;
    }
  }

  nextUint32(): number {
    let x = this.s >>> 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.s = x >>> 0;
    return this.s;
  }

  next(): number {
    return this.nextUint32() / 4294967296;
  }

  state(): XorShift32GeneratorState {
    return {
      s: this.s >>> 0,
    };
  }

  setState(state: XorShift32GeneratorState): void {
    this.s = state.s >>> 0;

    if (this.s === 0) {
      this.s = 1;
    }
  }
}

export const xorshift32: PRNGAlgorithm<XorShift32GeneratorState> = (
  seed,
  state,
) => {
  const generator = new XorShift32Generator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.next();
  prng.quick = prng;
  prng.double = () =>
    prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => generator.nextUint32() | 0;
  prng.state = () => generator.state();

  return prng;
};
