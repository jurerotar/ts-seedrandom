import type {
  GeneratorInterface,
  PRNGAlgorithm,
  XorwowGeneratorState,
} from '../types';
import { xorDouble } from '../utils';
import { nonZeroVector32 } from '../seed';

/**
 * Xorwow PRNG by George Marsaglia.
 * Reference: https://en.wikipedia.org/wiki/Xorshift#xorwow
 */
class XorwowGenerator implements GeneratorInterface<XorwowGeneratorState> {
  x = 0;
  y = 0;
  z = 0;
  w = 0;
  v = 0;
  d = 0;

  constructor(seed: string | number = Date.now()) {
    // Seed all five 32-bit words; ensure not all-zero vector
    const s = nonZeroVector32(seed, 5);
    this.x = s[0] >>> 0;
    this.y = s[1] >>> 0;
    this.z = s[2] >>> 0;
    this.w = s[3] >>> 0;
    this.v = s[4] >>> 0;

    // Initialize Weyl constant
    this.d = 362437 | 0;

    // Warm-up
    for (let i = 0; i < 64; i++) this.next();
  }

  next(): number {
    const t = (this.x ^ (this.x >>> 2)) >>> 0;
    this.x = this.y >>> 0;
    this.y = this.z >>> 0;
    this.z = this.w >>> 0;
    this.w = this.v >>> 0;

    this.v = (this.v ^ (this.v << 4) ^ (t ^ (t << 1))) >>> 0;

    this.d = (this.d + 362437) | 0;
    return ((this.d + this.v) | 0) >>> 0;
  }

  state(): XorwowGeneratorState {
    return {
      x: this.x >>> 0,
      y: this.y >>> 0,
      z: this.z >>> 0,
      w: this.w >>> 0,
      v: this.v >>> 0,
      d: this.d | 0,
    };
  }

  setState(state: XorwowGeneratorState): void {
    this.x = state.x >>> 0;
    this.y = state.y >>> 0;
    this.z = state.z >>> 0;
    this.w = state.w >>> 0;
    this.v = state.v >>> 0;
    this.d = state.d | 0;
  }
}

export const xorWow: PRNGAlgorithm<XorwowGeneratorState> = (seed, state) => {
  const generator = new XorwowGenerator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => (generator.next() >>> 0) / 0x100000000;
  prng.quick = prng;
  prng.double = () => xorDouble(generator);
  prng.int32 = () => generator.next() | 0;
  prng.state = () => generator.state();

  return prng;
};
