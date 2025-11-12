import type {
  GeneratorInterface,
  PRNGAlgorithm,
  ParkMillerGeneratorState,
} from '../types';

// Park–Miller LCG (MINSTD), modulus m = 2147483647 (2^31 - 1), multiplier a = 48271
const M = 2147483647; // 0x7fffffff
const A = 48271;

class ParkMillerGenerator
  implements GeneratorInterface<ParkMillerGeneratorState>
{
  s: number;

  constructor(seed: string | number = Date.now()) {
    const base =
      typeof seed === 'number'
        ? seed
        : [...seed.toString()].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

    // Map to [1, M-1]
    const mapped = ((base % (M - 1)) + (M - 1)) % (M - 1); // handle negatives
    this.s = (mapped + 1) >>> 0;
  }

  private nextInt(): number {
    // Use Number arithmetic (53-bit integer precision) which is safe here.
    // Compute s = (A * s) mod M in [1, M-1]. If it lands at 0, map to 1.
    let next = (A * this.s) % M; // exact under IEEE-754 because < 2^53
    if (next === 0) {
      next = 1;
    }
    this.s = next | 0;
    return this.s;
  }

  next(): number {
    return this.nextInt() / M;
  }

  state(): ParkMillerGeneratorState {
    return {
      s: this.s,
    };
  }

  setState(state: ParkMillerGeneratorState): void {
    let s = Math.trunc(state.s);
    // Normalize into [1, M-1]
    s = ((s % M) + M) % M; // [0, M-1]
    if (s === 0) {
      // map 0 to 1 as per MINSTD valid state
      s = 1;
    }
    this.s = s;
  }
}

export const parkMiller: PRNGAlgorithm<ParkMillerGeneratorState> = (
  seed,
  state,
) => {
  const generator = new ParkMillerGenerator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.next();
  prng.quick = prng;
  prng.double = () =>
    prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => (prng() * 0x100000000) | 0;
  prng.state = () => generator.state();

  return prng;
};
