import type {
  GeneratorInterface,
  PRNGAlgorithm,
  Xor128GeneratorState,
} from '../types';
import { xorDouble } from '../utils';
import { nonZeroVector32 } from '../seed';

class Xor128Generator implements GeneratorInterface<Xor128GeneratorState> {
  x = 0;
  y = 0;
  z = 0;
  w = 0;

  constructor(seed: string | number = Date.now()) {
    // Initialize all four 32-bit state words from unified seeding
    const s = nonZeroVector32(seed, 4);
    this.x = s[0] >>> 0;
    this.y = s[1] >>> 0;
    this.z = s[2] >>> 0;
    this.w = s[3] >>> 0;

    // Warm-up to decorrelate initial state
    for (let i = 0; i < 64; i++) this.next();
  }

  next(): number {
    const t = (this.x ^ (this.x << 11)) >>> 0;
    this.x = this.y >>> 0;
    this.y = this.z >>> 0;
    this.z = this.w >>> 0;
    this.w = (this.w ^ ((this.w >>> 19) ^ t ^ (t >>> 8))) >>> 0;
    return this.w >>> 0;
  }

  state(): Xor128GeneratorState {
    return {
      x: this.x >>> 0,
      y: this.y >>> 0,
      z: this.z >>> 0,
      w: this.w >>> 0,
    };
  }

  setState(state: Xor128GeneratorState): void {
    this.x = state.x >>> 0;
    this.y = state.y >>> 0;
    this.z = state.z >>> 0;
    this.w = state.w >>> 0;
  }
}

export const xor128: PRNGAlgorithm<Xor128GeneratorState> = (seed, state) => {
  const generator = new Xor128Generator(seed);

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
