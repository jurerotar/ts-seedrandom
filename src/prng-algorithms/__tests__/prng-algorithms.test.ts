import { readFileSync } from 'node:fs';
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
  prngXoshiro256plusplus,
  prngXoshiro256starstar,
  prngSplitMix32,
  prngSfc32,
  prngJsf32,
  prngXoroshiro128ss,
  prngXoroshiro128plus,
  prngParkMiller,
  prngLcg32,
  prngXorShift32,
  prngXorShift64star,
  prngMiddleSquareWeyl,
} from '../../index';

const PRNGS = [
  { name: 'alea', exportName: 'prngAlea', prng: prngAlea },
  { name: 'arc4', exportName: 'prngArc4', prng: prngArc4 },
  { name: 'tychei', exportName: 'prngTychei', prng: prngTychei },
  { name: 'mulberry32', exportName: 'prngMulberry32', prng: prngMulberry32 },
  { name: 'splitmix64', exportName: 'prngSplitMix64', prng: prngSplitMix64 },
  { name: 'pcg32', exportName: 'prngPcg32', prng: prngPcg32 },
  { name: 'xor128', exportName: 'prngXor128', prng: prngXor128 },
  { name: 'xor4096', exportName: 'prngXor4096', prng: prngXor4096 },
  { name: 'xorshift7', exportName: 'prngXorShift7', prng: prngXorShift7 },
  { name: 'xorwow', exportName: 'prngXorWow', prng: prngXorWow },
  {
    name: 'xoshiro128+',
    exportName: 'prngXoshiro128plus',
    prng: prngXoshiro128plus,
  },
  {
    name: 'xoshiro128++',
    exportName: 'prngXoshiro128plusplus',
    prng: prngXoshiro128plusplus,
  },
  {
    name: 'xoshiro256++',
    exportName: 'prngXoshiro256plusplus',
    prng: prngXoshiro256plusplus,
  },
  {
    name: 'xoshiro256**',
    exportName: 'prngXoshiro256starstar',
    prng: prngXoshiro256starstar,
  },
  { name: 'splitMix32', exportName: 'prngSplitMix32', prng: prngSplitMix32 },
  { name: 'sfc32', exportName: 'prngSfc32', prng: prngSfc32 },
  { name: 'jsf32', exportName: 'prngJsf32', prng: prngJsf32 },
  {
    name: 'xoroshiro128ss',
    exportName: 'prngXoroshiro128ss',
    prng: prngXoroshiro128ss,
  },
  {
    name: 'xoroshiro128plus',
    exportName: 'prngXoroshiro128plus',
    prng: prngXoroshiro128plus,
  },
  {
    name: 'parkMiller',
    exportName: 'prngParkMiller',
    prng: prngParkMiller,
  },
  { name: 'lcg32', exportName: 'prngLcg32', prng: prngLcg32 },
  {
    name: 'xorshift32',
    exportName: 'prngXorShift32',
    prng: prngXorShift32,
  },
  {
    name: 'xorshift64*',
    exportName: 'prngXorShift64star',
    prng: prngXorShift64star,
  },
  {
    name: 'middleSquareWeyl',
    exportName: 'prngMiddleSquareWeyl',
    prng: prngMiddleSquareWeyl,
  },
];

const PRNG_TABLE = PRNGS.map(({ name, prng }) => [name, prng] as const);

type TestPrng = (
  seed?: string | number,
  state?: unknown,
) => (() => number) & {
  quick: () => number;
  double: () => number;
  int32: () => number;
  state: () => unknown;
};

test('snapshot table matches README algorithms', () => {
  const readme = readFileSync(new URL('../../../README.md', import.meta.url), {
    encoding: 'utf8',
  });
  const documentedAlgorithms = Array.from(
    readme.matchAll(/^\d+\. `(prng[^`]+)`:/gm),
    ([, exportName]) => exportName,
  );

  expect(PRNGS.map(({ exportName }) => exportName)).toEqual(
    documentedAlgorithms,
  );
});

describe('snapshots', () => {
  test.for(PRNGS)('$name matches the public output vector', ({ prng }) => {
    const quick = prng('snapshot-seed');
    const double = prng('snapshot-seed');
    const int32 = prng('snapshot-seed');
    const mixed = prng('snapshot-seed');

    const snapshot = {
      quick: Array.from({ length: 8 }, () => quick()),
      double: Array.from({ length: 4 }, () => double.double()),
      int32: Array.from({ length: 8 }, () => int32.int32()),
      mixed: [mixed(), mixed.quick(), mixed.double(), mixed.int32()],
      state: mixed.state(),
    };

    expect(snapshot).toMatchSnapshot();
  });
});

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

    const resumed = (prng as TestPrng)('ignored', savedState);
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

const toUint32 = (value: number) => value >>> 0;

const uint64ToDouble = (value: bigint) =>
  Number(value >> 11n) / 9007199254740992;

describe('reference vectors', () => {
  test('pcg32 uses the PCG XSH-RR output function from old state', () => {
    const g = prngPcg32('ignored', { s: 42n, inc: 109n });

    expect(Array.from({ length: 5 }, () => toUint32(g.int32()))).toEqual([
      0x00000000, 0x0c855c84, 0x0bde36a5, 0x49dd4da9, 0x92dc7b03,
    ]);
  });

  test('splitmix64 matches the canonical 64-bit mix sequence', () => {
    const g = prngSplitMix64('ignored', { s: 0n });

    expect(Array.from({ length: 5 }, () => g())).toEqual([
      uint64ToDouble(0xe220a8397b1dcdafn),
      uint64ToDouble(0x6e789e6aa1b965f4n),
      uint64ToDouble(0x06c45d188009454fn),
      uint64ToDouble(0xf88bb8a8724c81ecn),
      uint64ToDouble(0x1b39896a51a8749bn),
    ]);
  });

  test('xoshiro128++ uses the plus-plus output scrambler', () => {
    const g = prngXoshiro128plusplus('ignored', {
      s0: 1,
      s1: 2,
      s2: 3,
      s3: 4,
    });

    expect(Array.from({ length: 5 }, () => toUint32(g.int32()))).toEqual([
      0x00000281, 0x00180387, 0xc0183387, 0xd1ae3b02, 0x31e2310a,
    ]);
  });

  test('xoroshiro128 variants match published state transitions', () => {
    const plus = prngXoroshiro128plus('ignored', { s0: 1n, s1: 2n });
    const starStar = prngXoroshiro128ss('ignored', { s0: 1n, s1: 2n });

    expect(Array.from({ length: 5 }, () => plus())).toEqual([
      uint64ToDouble(0x0000000000000003n),
      uint64ToDouble(0x0000006001030003n),
      uint64ToDouble(0x20c102c302000c03n),
      uint64ToDouble(0x810180670d23ad61n),
      uint64ToDouble(0x26d13a4941333a42n),
    ]);

    expect(Array.from({ length: 5 }, () => starStar())).toEqual([
      uint64ToDouble(0x0000000000001680n),
      uint64ToDouble(0x00000016c3804380n),
      uint64ToDouble(0x86b5b3ad00004380n),
      uint64ToDouble(0x800044a4cd1497b2n),
      uint64ToDouble(0x73fe9d66c77d08f6n),
    ]);
  });

  test('xoshiro256 variants match published state transitions', () => {
    const plusPlus = prngXoshiro256plusplus('ignored', {
      s0: 1n,
      s1: 2n,
      s2: 3n,
      s3: 4n,
    });
    const starStar = prngXoshiro256starstar('ignored', {
      s0: 1n,
      s1: 2n,
      s2: 3n,
      s3: 4n,
    });

    expect(Array.from({ length: 5 }, () => plusPlus())).toEqual([
      uint64ToDouble(0x0000000002800001n),
      uint64ToDouble(0x0000000003800067n),
      uint64ToDouble(0x000cc00003800067n),
      uint64ToDouble(0x000cc201994400b2n),
      uint64ToDouble(0x8012a2019ac433cdn),
    ]);

    expect(Array.from({ length: 5 }, () => starStar())).toEqual([
      uint64ToDouble(0x0000000000002d00n),
      uint64ToDouble(0x0000000000000000n),
      uint64ToDouble(0x000000005a007080n),
      uint64ToDouble(0x10e0000000009d80n),
      uint64ToDouble(0x10e0b61ce1009d80n),
    ]);
  });

  test('small legacy generators match their core recurrences', () => {
    const lcg = prngLcg32('ignored', { s: 0 });
    const xorshift = prngXorShift32('ignored', { s: 1 });

    expect(Array.from({ length: 5 }, () => toUint32(lcg.int32()))).toEqual([
      0x3c6ef35f, 0x47502932, 0xd1ccf6e9, 0xaaf95334, 0x6252e503,
    ]);

    expect(Array.from({ length: 5 }, () => toUint32(xorshift.int32()))).toEqual(
      [0x00042021, 0x04080601, 0x9dcca8c5, 0x1255994f, 0x8ef917d1],
    );
  });

  test('xorshift64* matches the scrambled 64-bit recurrence', () => {
    const g = prngXorShift64star('ignored', { s: 1n });

    expect(Array.from({ length: 5 }, () => g())).toEqual([
      uint64ToDouble(0x47e4ce4b896cdd1dn),
      uint64ToDouble(0xabcfa6a8e079651dn),
      uint64ToDouble(0xb9d10d8feb731f57n),
      uint64ToDouble(0x4db418a0bb1b019dn),
      uint64ToDouble(0x0e6199b04d5aa600n),
    ]);
  });

  test('middle-square Weyl matches the rotate-middle recurrence', () => {
    const g = prngMiddleSquareWeyl('ignored', {
      x: 1n,
      w: 0n,
      s: 0xb5ad4eceda1ce2a9n,
    });

    expect(Array.from({ length: 5 }, () => toUint32(g.int32()))).toEqual([
      0xb5ad4ece, 0x4aa985f8, 0x05d634c2, 0xffc8bdf3, 0x3bdd4ecd,
    ]);
  });
});
