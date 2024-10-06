import type { Arc4GeneratorExtraMethods, Arc4GeneratorState, GeneratorInterface, PRNGAlgorithm } from 'src/types';

const ARC4_START_DENOMINATION = 281474976710656;
const ARC4_SIGNIFICANCE = 4503599627370496;
const ARC4_OVERFLOW = 9007199254740992n;

type ARC4GeneratorInterface = GeneratorInterface<Arc4GeneratorState> & Arc4GeneratorExtraMethods;

class ARC4Generator implements ARC4GeneratorInterface {
  i = 0;
  j = 0;
  S: number[] = [];

  constructor(seed: string | number = Date.now()) {
    const stringifiedSeed = seed.toString();

    let key = this.mixKey(stringifiedSeed, []);
    let i = 0;
    let j = 0;
    let t: number;
    let keyLength: number = key.length;

    // The empty key [] is treated as [0].
    if (!keyLength) {
      key = [keyLength++];
    }

    // Set up S using the standard key scheduling algorithm.
    while (i <= 0xff) {
      this.S[i] = i++;
    }

    for (let i = 0; i <= 0xff; i++) {
      // Calculate the new index based on the key and previous state
      const keyIndex = i % keyLength;

      // Store the current state value for swapping
      const currentState = this.S[i];

      // Update j and calculate the new state
      j = (j + key[keyIndex] + currentState) & 0xff;
      t = this.S[j]; // Save the value at the new index

      // Perform the swap
      this.S[i] = t;
      this.S[j] = currentState;
    }

    // For robust unpredictability, the function call below automatically
    // discards an initial batch of values.  This is called RC4-drop[256].
    // See http://google.com/search?q=rsa+fluhrer+response&btnI
    this.g(256);
  }

  next() {
    // This function returns a random double in [0, 1) that contains
    // randomness in every bit of the mantissa of the IEEE 754 value.

    let n = this.g(6); // Start with a numerator n < 2 ^ 48
    let d = ARC4_START_DENOMINATION; //   and denominator d = 2 ^ 48.
    let x = 0; //   and no 'extra last byte'.

    while (n < ARC4_SIGNIFICANCE) {
      // Fill up all significant digits (2 ** 52)
      n = (n + x) * 256; //   by shifting numerator and
      d *= 256; //   denominator and generating a
      x = this.g(1); //   new least-significant-byte.
    }
    while (n >= ARC4_OVERFLOW) {
      // To avoid rounding past overflow, before adding
      n /= 2; //   last byte, shift everything
      d /= 2; //   right using integer math until
      x >>>= 1; //   we have exactly the desired bits.
    }
    return (n + x) / d; // Form the number within [0, 1).
  }

  g(count: number): number {
    // The "g" method returns the next (count) outputs as one number.
    let t: number;
    let r = 0;
    let { i, j, S } = this;

    let counter = count;

    // Loop through the count
    while (counter--) {
      // Increment i, ensure it wraps around 256
      i = 0xff & (i + 1);

      // Get the current value of S at index i
      t = S[i];

      // Update j, wrapping it around 256
      j = 0xff & (j + t);

      // Swap S[i] and S[j]
      S[i] = S[j];
      S[j] = t;

      // Accumulate the result using S[j]
      r = r * 256 + S[0xff & (S[i] + S[j])];
    }

    // Update the state
    this.i = i;
    this.j = j;

    // Return the accumulated result
    return r;
  }

  mixKey(seed: string, key: number[]) {
    let smear = 0;

    // Iterate over each character in the seed
    for (let j = 0; j < seed.length; j++) {
      // Get the character code for the current character
      const charCode = seed.charCodeAt(j);
      const keyIndex = 0xff & j; // Calculate the key index once

      // Update smear and assign to key
      smear ^= key[keyIndex] * 19;
      key[keyIndex] = 0xff & (smear + charCode);
    }

    return key;
  }

  state(): Arc4GeneratorState {
    return {
      i: this.i,
      j: this.j,
      S: this.S,
    };
  }

  setState(state: Arc4GeneratorState): void {
    this.i = state.i;
    this.j = state.j;
    this.S = state.S;
  }
}

export const arc4: PRNGAlgorithm<Arc4GeneratorState> = (seed, state) => {
  const arc4Generator = new ARC4Generator(seed);

  const prng = () => arc4Generator.next();
  prng.quick = () => arc4Generator.g(4) / 0x100000000;
  prng.double = () => arc4Generator.next();
  prng.int32 = () => arc4Generator.g(4) | 0;
  prng.state = () => arc4Generator.state();

  if (typeof state !== 'undefined') {
    arc4Generator.setState(state);
  }

  return prng;
};
