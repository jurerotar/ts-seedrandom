import type {
  GeneratorInterface,
  PRNGAlgorithm,
  Xoroshiro128PlusGeneratorState,
} from '../types';
import { splitMix64Stream, fnv1a64, seedToBytes } from '../seed';

const MASK64 = 0xffffffffffffffffn;

const rotl64 = (x: bigint, k: number): bigint => {
  const n = BigInt(k & 63);
  return ((x << n) & MASK64) | (x >> (64n - n));
};

class Xoroshiro128Plus
  implements GeneratorInterface<Xoroshiro128PlusGeneratorState>
{
  s0: bigint;
  s1: bigint;

  constructor(seed: string | number = Date.now()) {
    const h = fnv1a64(seedToBytes(seed));
    const next = splitMix64Stream(h);
    this.s0 = next();
    this.s1 = next();
    if (((this.s0 | this.s1) & MASK64) === 0n) this.s0 = 1n;
    for (let i = 0; i < 8; i++) this.next();
  }

  next64(): bigint {
    const result = (this.s0 + this.s1) & MASK64;
    const s1 = this.s1 ^ this.s0;
    this.s0 = (rotl64(this.s0, 24) ^ s1 ^ ((s1 << 16n) & MASK64)) & MASK64;
    this.s1 = rotl64(s1, 37);
    return result & MASK64;
  }

  next(): number {
    const v = this.next64();
    return Number(v >> 11n) / 9007199254740992; // top 53 bits
  }

  state(): Xoroshiro128PlusGeneratorState {
    return {
      s0: this.s0 & MASK64,
      s1: this.s1 & MASK64,
    };
  }

  setState(st: Xoroshiro128PlusGeneratorState): void {
    // The type is bigint in our definitions; ensure masking
    this.s0 = BigInt(st.s0) & MASK64;
    this.s1 = BigInt(st.s1) & MASK64;
  }
}

export const xoroshiro128plus: PRNGAlgorithm<Xoroshiro128PlusGeneratorState> = (
  seed,
  state,
) => {
  const generator = new Xoroshiro128Plus(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.next();
  prng.quick = prng;
  prng.double = () =>
    prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => Number(generator.next64?.() & 0xffffffffn) | 0;
  prng.state = () => generator.state();

  return prng;
};
