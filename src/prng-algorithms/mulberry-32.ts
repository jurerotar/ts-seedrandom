import type { GeneratorInterface, PRNGAlgorithm, Mulberry32GeneratorState } from 'src/types';

class Mulberry32Generator implements GeneratorInterface<Mulberry32GeneratorState> {
  s: number;

  constructor(seed: string | number = Date.now()) {
    const s = typeof seed === 'number' ? seed : [...seed.toString()].reduce((a, c) => a + c.charCodeAt(0), 0);
    this.s = s >>> 0;
  }

  next() {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  state() {
    return {
      s: this.s,
    };
  }

  setState({ s }: Mulberry32GeneratorState) {
    this.s = s >>> 0;
  }
}

export const mulberry32: PRNGAlgorithm<Mulberry32GeneratorState> = (seed, state) => {
  const g = new Mulberry32Generator(seed);
  if (state) {
    g.setState(state);
  }

  const prng = () => g.next();
  prng.quick = prng;
  prng.double = () => prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => (prng() * 0x100000000) | 0;
  prng.state = () => g.state();

  return prng;
};
