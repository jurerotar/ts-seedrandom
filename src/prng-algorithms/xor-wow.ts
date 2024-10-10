import type { GeneratorInterface, PRNGAlgorithm, XorwowGeneratorState } from 'src/types';
import { xorDouble } from 'src/utils';

class XorwowGenerator implements GeneratorInterface<XorwowGeneratorState> {
  x = 0;
  y = 0;
  z = 0;
  w = 0;
  v = 0;
  d = 0;

  constructor(seed: string | number = Date.now()) {
    if (Number.isInteger(seed)) {
      this.x = seed as number;
    }

    const stringifiedSeed = seed.toString();

    // Mix in string seed, then discard an initial batch of 64 values.
    for (let k = 0; k < stringifiedSeed.length + 64; k++) {
      this.x ^= stringifiedSeed.charCodeAt(k) | 0;
      if (k === stringifiedSeed.length) {
        this.d = (this.x << 10) ^ (this.x >>> 4);
      }
      this.next();
    }
  }

  next(): number {
    const t = this.x ^ (this.x >>> 2);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = this.v;

    this.v = this.v ^ (this.v << 4) ^ (t ^ (t << 1));

    this.d = (this.d + 362437) | 0;
    return (this.d + this.v) | 0;
  }

  state(): XorwowGeneratorState {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      w: this.w,
      v: this.v,
      d: this.d,
    };
  }

  setState(state: XorwowGeneratorState): void {
    this.x = state.x;
    this.y = state.y;
    this.z = state.z;
    this.w = state.w;
    this.v = state.v;
    this.d = state.d;
  }
}

export const xorWow: PRNGAlgorithm<XorwowGeneratorState> = (seed, state) => {
  const xorWowGenerator = new XorwowGenerator(seed);

  const prng = () => (xorWowGenerator.next() >>> 0) / 0x100000000;
  prng.quick = () => prng();
  prng.double = () => xorDouble(xorWowGenerator);
  prng.int32 = () => xorWowGenerator.next() | 0;
  prng.state = () => xorWowGenerator.state();

  if (typeof state !== 'undefined') {
    xorWowGenerator.setState(state);
  }

  return prng;
};
