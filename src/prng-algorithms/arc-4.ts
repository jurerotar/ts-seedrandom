import type { Arc4GeneratorExtraMethods, Arc4GeneratorState, GeneratorInterface, PRNGAlgorithm } from 'src/types';

const ARC4_START_DENOMINATION = 281474976710656;
const ARC4_SIGNIFICANCE = 4503599627370496;
const ARC4_OVERFLOW = 9007199254740992n;

type ARC4GeneratorInterface = GeneratorInterface<Arc4GeneratorState> & Arc4GeneratorExtraMethods;

class ARC4Generator implements ARC4GeneratorInterface {
  i = 0;
  j = 0;
  S: number[] = [];

  constructor(seed?: string | number, skipInit = false) {
    if (!skipInit) {
      this.initialize(seed ?? Date.now());
    }
  }

  private initialize(seed: string | number) {
    const stringifiedSeed = seed.toString();
    let key = this.mixKey(stringifiedSeed, []);
    let i = 0;
    let j = 0;
    let t: number;
    let keyLength: number = key.length;

    if (!keyLength) {
      key = [keyLength++];
    }

    while (i <= 0xff) {
      this.S[i] = i++;
    }

    for (i = 0; i <= 0xff; i++) {
      const keyIndex = i % keyLength;
      const currentState = this.S[i];
      j = (j + key[keyIndex] + currentState) & 0xff;
      t = this.S[j];
      this.S[i] = t;
      this.S[j] = currentState;
    }

    this.g(256); // RC4-drop[256]
  }

  next() {
    let n = this.g(6);
    let d = ARC4_START_DENOMINATION;
    let x = 0;

    while (n < ARC4_SIGNIFICANCE) {
      n = (n + x) * 256;
      d *= 256;
      x = this.g(1);
    }

    while (n >= ARC4_OVERFLOW) {
      n /= 2;
      d /= 2;
      x >>>= 1;
    }

    return (n + x) / d;
  }

  g(count: number): number {
    let t: number;
    let r = 0;
    let { i, j, S } = this;

    let n = count; // copy the input value

    while (n--) {
      i = 0xff & (i + 1);
      t = S[i];
      j = 0xff & (j + t);
      S[i] = S[j];
      S[j] = t;
      r = r * 256 + S[0xff & (S[i] + S[j])];
    }

    this.i = i;
    this.j = j;

    return r;
  }

  mixKey(seed: string, key: number[]) {
    let smear = 0;
    for (let j = 0; j < seed.length; j++) {
      const charCode = seed.charCodeAt(j);
      const keyIndex = 0xff & j;
      smear ^= key[keyIndex] * 19;
      key[keyIndex] = 0xff & (smear + charCode);
    }
    return key;
  }

  state(): Arc4GeneratorState {
    return {
      i: this.i,
      j: this.j,
      S: [...this.S],
    };
  }

  setState(state: Arc4GeneratorState): void {
    this.i = state.i;
    this.j = state.j;
    this.S = [...state.S];
  }
}

export const arc4: PRNGAlgorithm<Arc4GeneratorState> = (seed, state) => {
  const generator = state
    ? new ARC4Generator(undefined, true) // skip init if restoring
    : new ARC4Generator(seed);

  if (state) {
    generator.setState(state);
  }

  const prng = () => generator.next();
  prng.quick = () => generator.g(4) / 0x100000000;
  prng.double = () => generator.next();
  prng.int32 = () => generator.g(4) | 0;
  prng.state = () => generator.state();

  return prng;
};
