import type { GeneratorInterface, PRNGAlgorithm, XorShift7GeneratorState } from 'src/types';
import { xorDouble } from 'src/utils';

class XorShift7Generator implements GeneratorInterface<XorShift7GeneratorState> {
  x: number[] = [];
  i = 0;

  constructor(seed: string | number = Date.now()) {
    if (Number.isInteger(seed)) {
      // Seed state array using a 32-bit integer.
      this.x[0] = seed as number;
    } else {
      const stringifiedSeed = seed.toString();

      for (let j = 0; j < stringifiedSeed.length; ++j) {
        this.x[j & 7] = (this.x[j & 7] << 15) ^ ((stringifiedSeed.charCodeAt(j) + this.x[(j + 1) & 7]) << 13);
      }
    }

    // Enforce an array length of 8, not all zeroes.
    while (this.x.length < 8) {
      this.x.push(0);
    }

    if (this.x.every((e) => e === 0)) {
      (this.x as number[])[7] = -1;
    }

    for (let j = 256; j > 0; --j) {
      this.next();
    }
  }

  next(): number {
    let t: number;
    let v: number;
    t = this.x[this.i];
    t ^= t >>> 7;
    v = t ^ (t << 24);
    t = this.x[(this.i + 1) & 7];
    v ^= t ^ (t >>> 10);
    t = this.x[(this.i + 3) & 7];
    v ^= t ^ (t >>> 3);
    t = this.x[(this.i + 4) & 7];
    v ^= t ^ (t << 7);
    t = this.x[(this.i + 7) & 7];
    t = t ^ (t << 13);
    v ^= t ^ (t << 9);
    this.x[this.i] = v;
    this.i = (this.i + 1) & 7;
    return v;
  }

  state(): XorShift7GeneratorState {
    return {
      x: [...this.x],
      i: this.i,
    };
  }

  setState(state: XorShift7GeneratorState): void {
    this.x = [...state.x];
    this.i = state.i;
  }
}

export const xorShift7: PRNGAlgorithm<XorShift7GeneratorState> = (seed, state) => {
  const xorShift7Generator = new XorShift7Generator(seed);

  const prng = () => (xorShift7Generator.next() >>> 0) / 0x100000000;
  prng.quick = () => prng();
  prng.double = () => xorDouble(xorShift7Generator);
  prng.int32 = () => xorShift7Generator.next() | 0;
  prng.state = () => xorShift7Generator.state();

  if (typeof state !== 'undefined') {
    xorShift7Generator.setState(state);
  }

  return prng;
};
