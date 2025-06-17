import { describe, test, expect } from 'vitest';
import {
  prngAlea,
  prngArc4,
  prngTychei,
  prngMulberry32,
  prngSplitMix64,
  prngPcg32,
  prngXor128,
  prngXor4096,
  prngXorShift7,
  prngXorWow,
  prngXoshiro128plus,
  prngXoshiro128plusplus,
} from 'src/index';

const PRNGS = [
  { name: 'alea', prng: prngAlea },
  { name: 'arc4', prng: prngArc4 },
  { name: 'tychei', prng: prngTychei },
  { name: 'mulberry32', prng: prngMulberry32 },
  { name: 'splitmix64', prng: prngSplitMix64 },
  { name: 'pcg32', prng: prngPcg32 },
  { name: 'xor128', prng: prngXor128 },
  { name: 'xor4096', prng: prngXor4096 },
  { name: 'xorshift7', prng: prngXorShift7 },
  { name: 'xorwow', prng: prngXorWow },
  { name: 'xoshiro128+', prng: prngXoshiro128plus },
  { name: 'xoshiro128++', prng: prngXoshiro128plusplus },
];

for (const { name, prng } of PRNGS) {
  describe(`${name} PRNG`, () => {
    test('is deterministic from seed', () => {
      const a = prng('seed');
      const b = prng('seed');

      const seqA = Array.from({ length: 10 }, () => a());
      const seqB = Array.from({ length: 10 }, () => b());

      expect(seqA).toEqual(seqB);
    });

    test('produces values in [0, 1)', () => {
      const instance = prng('seed');

      for (let i = 0; i < 1000; i++) {
        const n = instance();
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThan(1);
      }
    });

    test('restores from exported state', () => {
      const original = prng('seed');

      for (let i = 0; i < 5; i++) {
        original();
      }

      const savedState = original.state();

      // @ts-expect-error: ts issue due to different states
      const resumed = prng('ignored', savedState);
      const next5 = Array.from({ length: 5 }, () => resumed());
      const continued = Array.from({ length: 5 }, () => original());

      expect(next5).toEqual(continued);
    });

    test('int32 returns valid signed 32-bit integers', () => {
      const instance = prng('seed');

      for (let i = 0; i < 1000; i++) {
        const int = instance.int32();
        expect(Number.isInteger(int)).toBe(true);
        expect(int).toBeGreaterThanOrEqual(-2147483648);
        expect(int).toBeLessThanOrEqual(2147483647);
      }
    });

    test('double returns high-precision floats in [0, 1)', () => {
      const instance = prng('seed');

      for (let i = 0; i < 1000; i++) {
        const dbl = instance.double();
        expect(dbl).toBeGreaterThanOrEqual(0);
        expect(dbl).toBeLessThan(1);
      }
    });
  });
}
