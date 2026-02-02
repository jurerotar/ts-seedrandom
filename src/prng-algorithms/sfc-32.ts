import type {
  GeneratorInterface,
  PRNGAlgorithm,
  Sfc32GeneratorState,
} from '../types';
import { expand32 } from '../seed';

/**
 * SFC32 (Small Fast Chaotic) PRNG by Chris Doty-Humphrey.
 * Reference: https://github.com/bryc/code/blob/master/jshash/PRNGs.md
 */
class Sfc32Generator implements GeneratorInterface<Sfc32GeneratorState> {
  a: number;
  b: number;
  c: number;
  d: number;

  constructor(seed: string | number = Date.now()) {
    const v = expand32(seed, 4);
    this.a = v[0] >>> 0;
    this.b = v[1] >>> 0;
    this.c = v[2] >>> 0;
    this.d = v[3] >>> 0;

    // Warm-up
    for (let i = 0; i < 12; i++) {
      this.next();
    }
  }

  next(): number {
    const t = (this.a + this.b + this.d) >>> 0;
    this.d = (this.d + 1) >>> 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) >>> 0;
    this.c = ((this.c << 21) | (this.c >>> 11)) >>> 0;
    this.c = (this.c + t) >>> 0;
    return (t >>> 0) / 4294967296;
  }

  state(): Sfc32GeneratorState {
    return {
      a: this.a >>> 0,
      b: this.b >>> 0,
      c: this.c >>> 0,
      d: this.d >>> 0,
    };
  }

  setState(s: Sfc32GeneratorState): void {
    this.a = s.a >>> 0;
    this.b = s.b >>> 0;
    this.c = s.c >>> 0;
    this.d = s.d >>> 0;
  }
}

export const sfc32: PRNGAlgorithm<Sfc32GeneratorState> = (seed, state) => {
  const generator = new Sfc32Generator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.next();
  prng.quick = prng;
  prng.double = () =>
    prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => Math.floor(prng() * 0x100000000) | 0;
  prng.state = () => generator.state();

  return prng;
};
