import type { GeneratorInterface, PRNGAlgorithm, Xoshiro128PlusGeneratorState } from 'src/types';
import { rotl } from 'src/utils';


class Xoshiro128PlusGenerator implements GeneratorInterface<Xoshiro128PlusGeneratorState> {
  s0: number;
  s1: number;
  s2: number;
  s3: number;

  constructor(seed: string | number = Date.now()) {
    // Use SplitMix64 to seed the state (reliable seeder)
    const hash = typeof seed === 'number' ? seed.toString() : [...seed.toString()].reduce((acc, c) => acc + c.charCodeAt(0), 0);

    let sm = BigInt(hash);
    const next = () => {
      sm = (sm + 0x9e3779b97f4a7c15n) & BigInt('0xFFFFFFFFFFFFFFFF');
      let z = sm;
      z = (z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n;
      z = (z ^ (z >> 27n)) * 0x94d049bb133111ebn;
      z = z ^ (z >> 31n);
      return Number(z & 0xffffffffn);
    };

    this.s0 = next();
    this.s1 = next();
    this.s2 = next();
    this.s3 = next();
  }

  next(): number {
    const result = (this.s0 + this.s3) >>> 0;

    const t = (this.s1 << 9) >>> 0;

    this.s2 ^= this.s0;
    this.s3 ^= this.s1;
    this.s1 ^= this.s2;
    this.s0 ^= this.s3;

    this.s2 ^= t;
    this.s3 = rotl(this.s3, 11);

    return result / 4294967296;
  }

  state(): Xoshiro128PlusGeneratorState {
    return {
      s0: this.s0,
      s1: this.s1,
      s2: this.s2,
      s3: this.s3,
    };
  }

  setState(state: Xoshiro128PlusGeneratorState): void {
    this.s0 = state.s0 >>> 0;
    this.s1 = state.s1 >>> 0;
    this.s2 = state.s2 >>> 0;
    this.s3 = state.s3 >>> 0;
  }
}

export const xoshiro128plus: PRNGAlgorithm<Xoshiro128PlusGeneratorState> = (seed, state) => {
  const generator = new Xoshiro128PlusGenerator(seed);
  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.next();
  prng.quick = prng;
  prng.double = () => prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => (prng() * 0x100000000) | 0;
  prng.state = () => generator.state();

  return prng;
};
