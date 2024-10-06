// @ts-ignore
import seedrandom from 'seedrandom';
import { prngAlea, prngArc4 } from 'src/index';
import { describe, expect, test } from 'vitest';

// TODO: Uncomment additional tests as more algorithms are ported over
const prngPairs = [
  {
    name: 'alea',
    originalPrng: seedrandom.alea,
    portedPrng: prngAlea,
  },
  {
    name: 'arc4',
    originalPrng: seedrandom,
    portedPrng: prngArc4,
  },
  // {
  //   name: 'tychei',
  //   originalPrng: seedrandom.tychei,
  //   portedPrng: prngAlea,
  // },
  // {
  //   name: 'xor128',
  //   originalPrng: seedrandom.xor128,
  //   portedPrng: prngAlea,
  // },
  // {
  //   name: 'xor4096',
  //   originalPrng: seedrandom.xor4096,
  //   portedPrng: prngAlea,
  // },
  // {
  //   name: 'xorShift7',
  //   originalPrng: seedrandom.xorShift7,
  //   portedPrng: prngAlea,
  // },
  // {
  //   name: 'xorWow',
  //   originalPrng: seedrandom.xorWow,
  //   portedPrng: prngAlea,
  // },
];

describe('prng algorithms', () => {
  for (const { name, originalPrng, portedPrng } of prngPairs) {
    describe(name, () => {
      test(`"quick" method's values should match`, () => {
        const originalPrngInstance = originalPrng('seed');
        const portedPrngInstance = portedPrng('seed');

        for (let i = 0; i <= 100; i += 1) {
          const originalPrngNextValue = originalPrngInstance();
          const portedPrngNextValue = portedPrngInstance();

          expect(originalPrngNextValue).toEqual(portedPrngNextValue);
        }
      });

      test(`"double" method's values should match`, () => {
        const originalPrngInstance = originalPrng('seed');
        const portedPrngInstance = portedPrng('seed');

        for (let i = 0; i <= 100; i += 1) {
          const originalPrngNextValue = originalPrngInstance.double();
          const portedPrngNextValue = portedPrngInstance.double();

          expect(originalPrngNextValue).toEqual(portedPrngNextValue);
        }
      });

      test(`"int32" method's values should match`, () => {
        const originalPrngInstance = originalPrng('seed');
        const portedPrngInstance = portedPrng('seed');

        for (let i = 0; i <= 100; i += 1) {
          const originalPrngNextValue = originalPrngInstance.int32();
          const portedPrngNextValue = portedPrngInstance.int32();

          expect(originalPrngNextValue).toEqual(portedPrngNextValue);
        }
      });

      test(`"state" method's values should match`, () => {
        const originalPrngInstance = originalPrng('seed', { state: true });
        const portedPrngInstance = portedPrng('seed');

        for (let i = 0; i <= 100; i += 1) {
          const originalNextState = originalPrngInstance.state();
          const newNextState = portedPrngInstance.state();

          expect(originalNextState).toEqual(newNextState);
        }
      });
    });
  }
});
