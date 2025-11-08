import type {
  GeneratorInterface,
  PRNGAlgorithm,
  Xor4096GeneratorState,
} from '../types';
import { xorDouble } from '../utils';

class Xor4096Generator implements GeneratorInterface<Xor4096GeneratorState> {
  private w: number;
  private X: number[];
  private i: number;

  constructor(seed: string | number = Date.now()) {
    let t: number;
    let v: number;
    let i: number;
    let j: number;
    let w = 0;
    const X: number[] = [];
    let limit = 128;

    const xor4096Seed = (() => {
      if (Number.isInteger(seed)) {
        v = seed as number;
        return null;
      }
      const stringifiedSeed = `${seed.toString()}\0`;
      v = 0;
      limit = Math.max(limit, stringifiedSeed.length);
      return stringifiedSeed;
    })();

    for (i = 0, j = -32; j < limit; ++j) {
      if (xor4096Seed) {
        v ^= xor4096Seed.charCodeAt((j + 32) % xor4096Seed.length);
      }

      if (j === 0) {
        w = v;
      }

      v ^= v << 10;
      v ^= v >>> 15;
      v ^= v << 4;
      v ^= v >>> 13;

      if (j >= 0) {
        w = (w + 0x61c88647) | 0;
        t = X[j & 127] ^= v + w;
        i = t === 0 ? i + 1 : 0;
      }
    }

    if (i >= 128) {
      X[(xor4096Seed?.length || 0) & 127] = -1;
    }

    i = 127;
    for (j = 4 * 128; j > 0; --j) {
      v = X[(i + 34) & 127];
      i = (i + 1) & 127;
      t = X[i];
      v ^= v << 13;
      t ^= t << 17;
      v ^= v >>> 15;
      t ^= t >>> 12;
      X[i] = v ^ t;
    }

    this.w = w;
    this.X = X;
    this.i = i;
  }

  next(): number {
    let t: number;
    let v: number;
    // Update Weyl generator.
    this.w = (this.w + 0x61c88647) | 0;

    // Update xor generator.
    v = this.X[(this.i + 34) & 127];
    this.i = (this.i + 1) & 127;
    t = this.X[this.i];
    v ^= v << 13;
    t ^= t << 17;
    v ^= v >>> 15;
    t ^= t >>> 12;

    // Update Xor generator array state.
    v = this.X[this.i] = v ^ t;

    // Result is the combination.
    return (v + (this.w ^ (this.w >>> 16))) | 0;
  }

  state(): Xor4096GeneratorState {
    return {
      w: this.w,
      X: [...this.X],
      i: this.i,
    };
  }

  setState(state: Xor4096GeneratorState): void {
    this.w = state.w;
    this.X = [...state.X];
    this.i = state.i;
  }
}

export const xor4096: PRNGAlgorithm<Xor4096GeneratorState> = (seed, state) => {
  const generator = new Xor4096Generator(seed);

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
