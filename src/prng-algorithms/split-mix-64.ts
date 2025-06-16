import type { GeneratorInterface, PRNGAlgorithm, SplitMix64GeneratorState } from 'src/types';

class SplitMix64Generator implements GeneratorInterface<SplitMix64GeneratorState> {
  s: bigint;

  constructor(seed: string | number = Date.now()) {
    const seedNum = typeof seed === 'number' ? BigInt(seed) : BigInt([...seed.toString()].reduce((acc, c) => acc + c.charCodeAt(0), 0));
    this.s = seedNum & BigInt('0xFFFFFFFFFFFFFFFF');
  }

  private nextBigInt(): bigint {
    this.s = (this.s + BigInt('0x9E3779B97F4A7C15')) & BigInt('0xFFFFFFFFFFFFFFFF');
    let z = this.s;
    z = (z ^ (z >> 30n)) * BigInt('0xBF58476D1CE4E5B9');
    z = (z ^ (z >> 27n)) * BigInt('0x94D049BB133111EB');
    return z ^ (z >> 31n);
  }

  next(): number {
    const value = this.nextBigInt() & BigInt('0xFFFFFFFFFFFFFFFF');
    return Number(value >> 11n) / 9007199254740992; // Scale to [0, 1) using 53 bits
  }

  state(): SplitMix64GeneratorState {
    return {
      s: this.s,
    };
  }

  setState({ s }: SplitMix64GeneratorState): void {
    this.s = s;
  }
}

export const splitMix64: PRNGAlgorithm<SplitMix64GeneratorState> = (seed, state) => {
  const generator = new SplitMix64Generator(seed);
  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.next();
  prng.quick = prng;
  prng.double = () => prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => (generator.next() * 0x100000000) | 0;
  prng.state = () => generator.state();

  return prng;
};
