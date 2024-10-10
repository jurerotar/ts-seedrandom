// @ts-ignore
import { prng_alea, prng_arc4, prng_tychei, prng_xor128, prng_xor4096, prng_xorshift7, prng_xorwow } from 'esm-seedrandom';
import { prngAlea, prngArc4, prngTychei, prngXor128, prngXor4096, prngXorShift7, prngXorWow } from 'src/index';
import { describe, expect, test } from 'vitest';

const prngPairs = [
  {
    name: 'alea',
    originalPrng: prng_alea,
    portedPrng: prngAlea,
  },
  {
    name: 'arc4',
    originalPrng: prng_arc4,
    portedPrng: prngArc4,
  },
  {
    name: 'tychei',
    originalPrng: prng_tychei,
    portedPrng: prngTychei,
  },
  {
    name: 'xor128',
    originalPrng: prng_xor128,
    portedPrng: prngXor128,
  },
  {
    name: 'xor4096',
    originalPrng: prng_xor4096,
    portedPrng: prngXor4096,
  },
  {
    name: 'xorShift7',
    originalPrng: prng_xorshift7,
    portedPrng: prngXorShift7,
  },
  {
    name: 'xorWow',
    originalPrng: prng_xorwow,
    portedPrng: prngXorWow,
  },
];

describe('prng algorithms', () => {
  for (const { name, originalPrng, portedPrng } of prngPairs) {
    describe(name, () => {
      test(`"quick" method's values should match`, () => {
        const originalPrngInstance = originalPrng('seed');
        const portedPrngInstance = portedPrng('seed');

        for (let i = 0; i <= 10000; i += 1) {
          const originalPrngNextValue = originalPrngInstance();
          const portedPrngNextValue = portedPrngInstance();

          expect(originalPrngNextValue, `Failed on iteration ${i}`).toEqual(portedPrngNextValue);
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
