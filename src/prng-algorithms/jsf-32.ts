import type {
  GeneratorInterface,
  Jsf32GeneratorState,
  PRNGAlgorithm,
} from '../types';
import { expand32 } from '../seed';

/**
 * JSF32 (Jenkins' Small Fast) PRNG by Bob Jenkins.
 * Reference: https://commons.apache.org/proper/commons-rng/commons-rng-core/apidocs/org/apache/commons/rng/core/source32/JenkinsSmallFast32.html
 */
class Jsf32Generator implements GeneratorInterface<Jsf32GeneratorState> {
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
    for (let i = 0; i < 20; i++) {
      this.next();
    }
  }

  next(): number {
    const e = (this.a - ((this.b << 27) | (this.b >>> 5))) >>> 0;
    this.a = (this.b ^ ((this.c << 17) | (this.c >>> 15))) >>> 0;
    this.b = (this.c + this.d) >>> 0;
    this.c = (this.d + e) >>> 0;
    this.d = (this.a + e) >>> 0;
    return (this.d >>> 0) / 4294967296;
  }

  state(): Jsf32GeneratorState {
    return {
      a: this.a >>> 0,
      b: this.b >>> 0,
      c: this.c >>> 0,
      d: this.d >>> 0,
    };
  }

  setState(s: Jsf32GeneratorState): void {
    this.a = s.a >>> 0;
    this.b = s.b >>> 0;
    this.c = s.c >>> 0;
    this.d = s.d >>> 0;
  }
}

export const jsf32: PRNGAlgorithm<Jsf32GeneratorState> = (seed, state) => {
  const generator = new Jsf32Generator(seed);

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
