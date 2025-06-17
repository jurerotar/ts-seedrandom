import type {
  GeneratorInterface,
  PRNGAlgorithm,
  Pcg32GeneratorState,
} from 'src/types';

class Pcg32Generator implements GeneratorInterface<Pcg32GeneratorState> {
  s: bigint;
  inc: bigint;

  constructor(seed: string | number = Date.now()) {
    const seedNum =
      typeof seed === 'number'
        ? BigInt(seed)
        : BigInt([...seed.toString()].reduce((a, c) => a + c.charCodeAt(0), 0));
    this.s = 0n;
    this.inc = (seedNum << 1n) | 1n; // Must be odd
    this.next(); // advance once to mix in seed
    this.s += seedNum;
    this.next(); // advance again
  }

  private nextUInt32(): number {
    const multiplier = 6364136223846793005n;

    this.s = this.s * multiplier + this.inc;
    const xorShifted = Number(((this.s >> 18n) ^ this.s) >> 27n) & 0xffffffff;
    const rot = Number(this.s >> 59n) & 31;

    return ((xorShifted >>> rot) | (xorShifted << ((32 - rot) & 31))) >>> 0;
  }

  next(): number {
    return this.nextUInt32() / 4294967296; // 2^32
  }

  state(): Pcg32GeneratorState {
    return {
      s: this.s,
      inc: this.inc,
    };
  }

  setState(state: Pcg32GeneratorState): void {
    this.s = state.s;
    this.inc = state.inc;
  }
}

export const pcg32: PRNGAlgorithm<Pcg32GeneratorState> = (seed, state) => {
  const generator = new Pcg32Generator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.next();
  prng.quick = prng;
  prng.double = () =>
    prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => (generator.next() * 0x100000000) | 0;
  prng.state = () => generator.state();

  return prng;
};
