import type {
  GeneratorInterface,
  PRNGAlgorithm,
  Pcg32GeneratorState,
} from '../types';

const MASK64 = (1n << 64n) - 1n;
const MULTIPLIER = 6364136223846793005n;

class Pcg32Generator implements GeneratorInterface<Pcg32GeneratorState> {
  s: bigint;
  inc: bigint;

  constructor(seed: string | number = Date.now()) {
    const seedNum =
      typeof seed === 'number'
        ? BigInt(seed)
        : BigInt([...seed.toString()].reduce((a, c) => a + c.charCodeAt(0), 0));

    this.s = 0n;
    this.inc = ((seedNum << 1n) | 1n) & MASK64;

    this.nextUInt32();
    this.s = (this.s + seedNum) & MASK64;
    this.nextUInt32();
  }

  nextUInt32(): number {
    this.s = (this.s * MULTIPLIER + this.inc) & MASK64;

    const xorshiftedBig = ((this.s >> 18n) ^ this.s) >> 27n;

    const rot = Number((this.s >> 59n) & 31n);

    const xorshifted = Number(xorshiftedBig & 0xffffffffn) >>> 0;

    const result =
      (xorshifted >>> rot) | ((xorshifted << ((32 - rot) & 31)) >>> 0);
    return result >>> 0;
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
    this.s = BigInt(state.s) & MASK64;
    this.inc = BigInt(state.inc) & MASK64;
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
  prng.int32 = () => generator.nextUInt32() | 0;
  prng.state = () => generator.state();

  return prng;
};
