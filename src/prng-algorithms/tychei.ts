import type { GeneratorInterface, PRNGAlgorithm, TycheiGeneratorState } from 'src/types';
import { xorDouble } from 'src/utils';

const createTycheiGenerator = (seed: string | number = Date.now()): GeneratorInterface<TycheiGeneratorState> => {
  let a = 0;
  let b = 0;
  let c = 2654435769 | 0;
  let d = 1367130551;

  const next = (): number => {
    b = (b << 25) ^ (b >>> 7) ^ c;
    c = (c - d) | 0;
    d = (d << 24) ^ (d >>> 8) ^ a;
    a = (a - b) | 0;
    b = (b << 20) ^ (b >>> 12) ^ c;
    c = (c - d) | 0;
    d = (d << 16) ^ (c >>> 16) ^ a;
    a = (a - b) | 0;

    return a;
  };

  const getState = (): TycheiGeneratorState => ({
    a,
    b,
    c,
    d,
  });

  const setState = (state: TycheiGeneratorState): void => {
    a = state.a;
    b = state.b;
    c = state.c;
    d = state.d;
  };

  if (Number.isInteger(seed)) {
    const integerSeed = seed as number;
    a = (integerSeed / 0x100000000) | 0;
    b = integerSeed | 0;
  }

  const stringifiedSeed = seed.toString();

  for (let k = 0; k < stringifiedSeed.length + 20; k++) {
    b ^= stringifiedSeed.charCodeAt(k) | 0;
    next();
  }

  return {
    next,
    state: getState,
    setState,
  };
};

export const tychei: PRNGAlgorithm<TycheiGeneratorState> = (seed, state) => {
  const tycheiGenerator = createTycheiGenerator(seed);

  const prng = () => (tycheiGenerator.next() >>> 0) / 0x100000000;
  prng.quick = () => prng();
  prng.double = () => xorDouble(tycheiGenerator);
  prng.int32 = () => tycheiGenerator.next() | 0;
  prng.state = () => tycheiGenerator.state();

  if (typeof state !== 'undefined') {
    tycheiGenerator.setState(state);
  }

  return prng;
};
