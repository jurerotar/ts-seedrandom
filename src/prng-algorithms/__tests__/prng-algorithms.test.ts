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
  prngSplitMix32,
  prngSfc32,
  prngJsf32,
  prngXoroshiro128ss,
  prngXoroshiro128plus64,
} from '../../index';

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
  { name: 'splitMix32', prng: prngSplitMix32 },
  { name: 'sfc32', prng: prngSfc32 },
  { name: 'jsf32', prng: prngJsf32 },
  { name: 'xoroshiro128ss', prng: prngXoroshiro128ss },
  { name: 'xoroshiro128plus64', prng: prngXoroshiro128plus64 },
];

const PRNG_TABLE = PRNGS.map(({ name, prng }) => [name, prng] as const);

describe.for(PRNG_TABLE)('%s', ([, prng]) => {
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
      expect(Number.isInteger(int)).toBeTruthy();
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

  test('different seeds produce at least one differing value', () => {
    const a = prng('seed-a');
    const b = prng('seed-b');

    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());

    // Assert sequences are not identical (at least one differing element)
    const allEqual = seqA.every((v, i) => Object.is(v, seqB[i]));
    expect(allEqual).toBeFalsy();
  });

  test('two instances with same seed are independent', () => {
    const a = prng('shared-seed');
    const b = prng('shared-seed');

    a();

    const nextA = Array.from({ length: 10 }, () => a());
    const nextB = Array.from({ length: 10 }, () => b());

    const allEqual = nextA.every((v, i) => Object.is(v, nextB[i]));
    expect(allEqual).toBeFalsy();
  });

  test('never returns NaN/Infinity and always number', () => {
    const inst = prng('seed-for-safety');
    for (let i = 0; i < 2000; i++) {
      const v = inst();
      expect(typeof v).toBe('number');
      expect(Number.isFinite(v)).toBeTruthy();
      expect(Number.isNaN(v)).toBeFalsy();
    }
  });

  test('double uses extra precision (not identical to prng())', () => {
    const g = prng('double-seed');

    let foundDiff = false;

    for (let i = 0; i < 200; i++) {
      const a = g();
      const d = g.double();
      expect(typeof d).toBe('number');
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThan(1);
      if (!Object.is(a, d)) {
        foundDiff = true;
      }
    }

    expect(foundDiff).toBe(true);
  });

  test('no immediate consecutive repeats in a short sample (sanity)', () => {
    const g = prng('no-repeat-seed');

    const s = Array.from({ length: 2000 }, () => g());

    let repeats = 0;
    for (let i = 1; i < s.length; i++) {
      if (Object.is(s[i], s[i - 1])) {
        repeats++;
      }
    }

    expect(repeats).toBeLessThan(5);
  });

  test('interleaving two instances seeded the same behaves like independent streams', () => {
    const a = prng('inter-seed');
    const b = prng('inter-seed');

    // produce interleaved sequence: a,b,a,b,a,b...
    const interleaved: number[] = [];
    for (let i = 0; i < 20; i++) {
      interleaved.push(a());
      interleaved.push(b());
    }

    // Now produce two independent sequences and recombine to compare
    const a2 = prng('inter-seed');
    const b2 = prng('inter-seed');
    const aSeq = Array.from({ length: 20 }, () => a2());
    const bSeq = Array.from({ length: 20 }, () => b2());

    const recombined = aSeq
      .flatMap((v, i) => [v, bSeq[i]])
      .slice(0, interleaved.length);
    expect(recombined).toEqual(interleaved);
  });

  test('prng.quick is an alias (or returns same as prng)', () => {
    const g1 = prng('alias-seed');
    const g2 = prng('alias-seed');

    // if quick is the same function identity, that's fine
    if (g1.quick === g1) {
      expect(g1.quick).toBe(g1);
      return;
    }

    // Compare outputs from two separate instances started from same seed:
    // g1() vs g2.quick() called in the same sequence positions.
    const seqA = Array.from({ length: 10 }, () => g1());
    const seqB = Array.from({ length: 10 }, () => g2.quick());
    expect(seqB).toEqual(seqA);
  });
});
