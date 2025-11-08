// Unified seeding utilities: hashing and SplitMix expanders
// These helpers provide consistent seeding across algorithms from string | number | Uint8Array | Uint32Array.

export type SeedInput = string | number | Uint8Array | Uint32Array;

// FNV-1a 32-bit hash
export const fnv1a32 = (data: Uint8Array): number => {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < data.length; i++) {
    h ^= data[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
};

// FNV-1a 64-bit hash using BigInt
export const fnv1a64 = (data: Uint8Array): bigint => {
  let h = 0xcbf29ce484222325n; // offset basis
  const p = 0x100000001b3n; // prime
  for (let i = 0; i < data.length; i++) {
    h ^= BigInt(data[i]);
    h = (h * p) & 0xffffffffffffffffn;
  }
  return h & 0xffffffffffffffffn;
};

// Normalize seed input into a byte array (UTF-8 for strings, little-endian for numbers)
export const seedToBytes = (seed: SeedInput): Uint8Array => {
  if (typeof seed === 'number') {
    // Encode JS number as 8 bytes little-endian (through BigInt)
    const b = new Uint8Array(8);
    const v = BigInt(Math.floor(seed)) & 0xffffffffffffffffn;
    for (let i = 0; i < 8; i++) b[i] = Number((v >> BigInt(8 * i)) & 0xffn);
    return b;
  }
  if (typeof seed === 'string') {
    // UTF-8 encode
    return new TextEncoder().encode(seed);
  }
  if (seed instanceof Uint8Array) {
    return seed;
  }
  if (seed instanceof Uint32Array) {
    const out = new Uint8Array(seed.length * 4);
    for (let i = 0; i < seed.length; i++) {
      const v = seed[i] >>> 0;
      out[i * 4 + 0] = v & 0xff;
      out[i * 4 + 1] = (v >>> 8) & 0xff;
      out[i * 4 + 2] = (v >>> 16) & 0xff;
      out[i * 4 + 3] = (v >>> 24) & 0xff;
    }
    return out;
  }
  // Fallback: empty
  return new Uint8Array();
};

// SplitMix32 seeder producing 32-bit unsigned ints
export const splitMix32 = (seed: number): (() => number) => {
  let z = seed >>> 0;
  return () => {
    z = (z + 0x9e3779b9) >>> 0; // golden ratio
    let v = z;
    v ^= v >>> 16;
    v = Math.imul(v, 0x85ebca6b) >>> 0;
    v ^= v >>> 13;
    v = Math.imul(v, 0xc2b2ae35) >>> 0;
    v ^= v >>> 16;
    return v >>> 0;
  };
};

// Expand to N 32-bit words from seed bytes via FNV-1a32 then SplitMix32
export const expand32 = (seed: SeedInput, count: number): Uint32Array => {
  const bytes = seedToBytes(seed);
  const h = fnv1a32(bytes);
  const sm = splitMix32(h);
  const out = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    out[i] = sm() >>> 0;
  }
  return out;
};

// SplitMix64 next function (returns 64-bit value)
export const splitMix64Stream = (seed: bigint): (() => bigint) => {
  let s = seed & 0xffffffffffffffffn;
  return () => {
    s = (s + 0x9e3779b97f4a7c15n) & 0xffffffffffffffffn;
    let z = s;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & 0xffffffffffffffffn;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & 0xffffffffffffffffn;
    z = z ^ (z >> 31n);
    return z & 0xffffffffffffffffn;
  };
};

// Expand to N 32-bit words using FNV-1a64 + SplitMix64 (taking low 32 bits each step)
export const expand32From64 = (seed: SeedInput, count: number): Uint32Array => {
  const bytes = seedToBytes(seed);
  const h = fnv1a64(bytes);
  const next64 = splitMix64Stream(h);
  const out = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    const v = next64();
    out[i] = Number(v & 0xffffffffn) >>> 0;
  }
  return out;
};

// Create a non-zero 32-bit vector of length n (avoid all-zero vector)
export const nonZeroVector32 = (seed: SeedInput, n: number): Uint32Array => {
  const v = expand32(seed, n);
  let allZero = true;
  for (let i = 0; i < v.length; i++)
    if (v[i] !== 0) {
      allZero = false;
      break;
    }
  if (allZero) {
    v[0] = 1;
  }
  return v;
};
