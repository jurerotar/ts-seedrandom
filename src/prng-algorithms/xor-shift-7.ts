import type {
  GeneratorInterface,
  PRNGAlgorithm,
  XorShift7GeneratorState,
} from '../types';
import { xorDouble } from '../utils';

const splitMix32 = (seed: number): (() => number) => {
  let z = seed >>> 0;

  return () => {
    z = (z + 0x9e3779b9) >>> 0; // golden ratio
    let v = z;
    v = (v ^ (v >>> 16)) >>> 0;
    v = Math.imul(v, 0x85ebca6b) >>> 0;
    v = (v ^ (v >>> 13)) >>> 0;
    v = Math.imul(v, 0xc2b2ae35) >>> 0;
    v = (v ^ (v >>> 16)) >>> 0;
    return v >>> 0;
  };
};

class XorShift7Generator
  implements GeneratorInterface<XorShift7GeneratorState>
{
  x: number[] = [];
  i = 0;

  constructor(seed: string | number = Date.now()) {
    this.x = new Array(8).fill(0);
    this.i = 0;

    let seedNum32: number;
    if (typeof seed === 'number' && Number.isInteger(seed)) {
      seedNum32 = seed >>> 0;
    } else {
      const s = seed.toString();
      let h = 0x811c9dc5 >>> 0;
      for (let k = 0; k < s.length; k++) {
        h ^= s.charCodeAt(k);
        h = Math.imul(h, 0x01000193) >>> 0;
      }
      seedNum32 = h >>> 0;
    }

    const gen = splitMix32(seedNum32);
    for (let k = 0; k < 8; k++) {
      this.x[k] = gen() >>> 0;
    }

    for (let j = 0; j < 256; ++j) {
      this.next();
    }
  }

  next(): number {
    let t: number;
    let v: number;

    t = this.x[this.i] >>> 0;
    t ^= t >>> 7;
    v = (t ^ (t << 24)) >>> 0;

    t = this.x[(this.i + 1) & 7] >>> 0;
    v = (v ^ t ^ (t >>> 10)) >>> 0;

    t = this.x[(this.i + 3) & 7] >>> 0;
    v = (v ^ t ^ (t >>> 3)) >>> 0;

    t = this.x[(this.i + 4) & 7] >>> 0;
    v = (v ^ t ^ (t << 7)) >>> 0;

    t = this.x[(this.i + 7) & 7] >>> 0;
    t = (t ^ (t << 13)) >>> 0;
    v = (v ^ t ^ (t << 9)) >>> 0;

    this.x[this.i] = v >>> 0;
    this.i = (this.i + 1) & 7;

    return v >>> 0;
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

export const xorShift7: PRNGAlgorithm<XorShift7GeneratorState> = (
  seed,
  state,
) => {
  const generator = new XorShift7Generator(seed);

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
