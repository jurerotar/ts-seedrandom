import type { GeneratorInterface, PRNGAlgorithm } from '../types';

export type SplitMix32GeneratorState = { s: number };

/**
 * SplitMix32 PRNG.
 * Reference: https://github.com/bryc/code/blob/master/jshash/PRNGs.md
 */
class SplitMix32Generator
  implements GeneratorInterface<SplitMix32GeneratorState>
{
  s: number;

  constructor(seed: string | number = Date.now()) {
    const s =
      typeof seed === 'number'
        ? seed >>> 0
        : [...seed.toString()].reduce((a, c) => (a + c.charCodeAt(0)) >>> 0, 0);
    this.s = s >>> 0;
  }

  nextUint32(): number {
    this.s = (this.s + 0x9e3779b9) >>> 0; // golden ratio
    let v = this.s >>> 0;
    v ^= v >>> 16;
    v = Math.imul(v, 0x85ebca6b) >>> 0;
    v ^= v >>> 13;
    v = Math.imul(v, 0xc2b2ae35) >>> 0;
    v ^= v >>> 16;
    return v >>> 0;
  }

  next(): number {
    return this.nextUint32() / 4294967296;
  }

  state(): SplitMix32GeneratorState {
    return { s: this.s >>> 0 };
  }

  setState(state: SplitMix32GeneratorState): void {
    this.s = state.s >>> 0;
  }
}

export const splitMix32: PRNGAlgorithm<SplitMix32GeneratorState> = (
  seed,
  state,
) => {
  const generator = new SplitMix32Generator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.next();
  prng.quick = prng;
  prng.double = () =>
    prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => (generator.nextUint32?.() ?? prng() * 0x100000000) | 0;
  prng.state = () => generator.state();

  return prng;
};
