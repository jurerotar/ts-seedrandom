import type {
  GeneratorInterface,
  MiddleSquareWeylGeneratorState,
  PRNGAlgorithm,
} from '../types';
import { expand32From64 } from '../seed';
import { MASK_64, UINT32_TO_DOUBLE } from '../utils';

/**
 * Middle Square Weyl Sequence (MSWS) PRNG by Bernard Widynski.
 * Compact and interesting, but newer and less scrutinized than PCG/xoshiro-family generators.
 * Reference: https://arxiv.org/abs/1704.00358
 */
class MiddleSquareWeylGenerator
  implements GeneratorInterface<MiddleSquareWeylGeneratorState>
{
  x: bigint;
  w: bigint;
  s: bigint;

  constructor(seed: string | number = Date.now()) {
    const v = expand32From64(seed, 4);
    this.x = (BigInt(v[0]) << 32n) | BigInt(v[1]);
    this.w = 0n;
    this.s = ((BigInt(v[2]) << 32n) | BigInt(v[3]) | 1n) & MASK_64;
  }

  nextUint32(): number {
    this.w = (this.w + this.s) & MASK_64;
    const x = (this.x * this.x + this.w) & MASK_64;
    this.x = ((x >> 32n) | (x << 32n)) & MASK_64;
    return Number(x >> 32n) >>> 0;
  }

  next(): number {
    return this.nextUint32() * UINT32_TO_DOUBLE;
  }

  state(): MiddleSquareWeylGeneratorState {
    return {
      x: this.x,
      w: this.w,
      s: this.s,
    };
  }

  setState(state: MiddleSquareWeylGeneratorState): void {
    this.x = BigInt(state.x) & MASK_64;
    this.w = BigInt(state.w) & MASK_64;
    this.s = BigInt(state.s) & MASK_64;

    if ((this.s & 1n) === 0n) {
      this.s = (this.s | 1n) & MASK_64;
    }
  }
}

export const middleSquareWeyl: PRNGAlgorithm<MiddleSquareWeylGeneratorState> = (
  seed,
  state,
) => {
  const generator = new MiddleSquareWeylGenerator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.nextUint32() * UINT32_TO_DOUBLE;
  prng.quick = prng;
  prng.double = () =>
    prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16;
  prng.int32 = () => generator.nextUint32() | 0;
  prng.state = () => generator.state();

  return prng;
};
