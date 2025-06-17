import type {
  GeneratorInterface,
  PRNGAlgorithm,
  Xor128GeneratorState,
} from 'src/types';
import { xorDouble } from 'src/utils';

class Xor128Generator implements GeneratorInterface<Xor128GeneratorState> {
  x = 0;
  y = 0;
  z = 0;
  w = 0;

  constructor(seed: string | number = Date.now()) {
    if (Number.isInteger(seed)) {
      this.x = seed as number;
    }

    const stringifiedSeed = seed.toString();

    // Mix in string seed, then discard an initial batch of 64 values.
    for (let k = 0; k < stringifiedSeed.length + 64; k++) {
      this.x ^= stringifiedSeed.charCodeAt(k) | 0;
      this.next();
    }
  }

  next(): number {
    const t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = this.w ^ ((this.w >>> 19) ^ t ^ (t >>> 8));
    return this.w;
  }

  state(): Xor128GeneratorState {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      w: this.w,
    };
  }

  setState(state: Xor128GeneratorState): void {
    this.x = state.x;
    this.y = state.y;
    this.z = state.z;
    this.w = state.w;
  }
}

export const xor128: PRNGAlgorithm<Xor128GeneratorState> = (seed, state) => {
  const xor128Generator = new Xor128Generator(seed);

  const prng = () => (xor128Generator.next() >>> 0) / 0x100000000;
  prng.quick = () => prng();
  prng.double = () => xorDouble(xor128Generator);
  prng.int32 = () => xor128Generator.next() | 0;
  prng.state = () => xor128Generator.state();

  if (typeof state !== 'undefined') {
    xor128Generator.setState(state);
  }

  return prng;
};
