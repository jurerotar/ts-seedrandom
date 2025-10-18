import type {
  AleaGeneratorState,
  GeneratorInterface,
  PRNGAlgorithm,
} from 'src/types';
import { mash } from 'src/utils';

class AleaGenerator implements GeneratorInterface<AleaGeneratorState> {
  c = 1;
  s0;
  s1;
  s2;

  constructor(seed: string | number = Date.now()) {
    const m = mash();

    const stringifiedSeed = seed.toString();

    this.s0 = m(' ');
    this.s1 = m(' ');
    this.s2 = m(' ');

    this.s0 -= m(stringifiedSeed);
    if (this.s0 < 0) {
      this.s0 += 1;
    }
    this.s1 -= m(stringifiedSeed);
    if (this.s1 < 0) {
      this.s1 += 1;
    }
    this.s2 -= m(stringifiedSeed);
    if (this.s2 < 0) {
      this.s2 += 1;
    }
  }

  next() {
    const { c, s0, s1, s2 } = this;
    const t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
    this.c = t | 0;
    this.s0 = s1;
    this.s1 = s2;
    this.s2 = t - this.c;
    return this.s2;
  }

  state(): AleaGeneratorState {
    return {
      c: this.c,
      s0: this.s0,
      s1: this.s1,
      s2: this.s2,
    };
  }

  setState(state: AleaGeneratorState): void {
    this.c = state.c;
    this.s0 = state.s0;
    this.s1 = state.s1;
    this.s2 = state.s2;
  }
}

export const alea: PRNGAlgorithm<AleaGeneratorState> = (seed, state) => {
  const generator = new AleaGenerator(seed);

  const prng = () => generator.next();
  prng.quick = prng;
  prng.double = () =>
    prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16; // 2^-53
  prng.int32 = () => (generator.next() * 0x100000000) | 0;
  prng.state = () => generator.state();

  if (typeof state !== 'undefined') {
    generator.setState(state);
  }

  return prng;
};
