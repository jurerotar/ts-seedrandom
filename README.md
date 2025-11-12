# ts-seedrandom

Seeded random number generators for TypeScript.

## Installation

```shell
npm install ts-seedrandom
```

## Usage

Each generator includes the following methods:
* `quick` - Default method used. Provides 32 bits of randomness in a float. Can either be called by calling generator instance directly (ex. `generator()`) or by name (ex. `generator.quick()`).
* `double` - Provides 56 bits of randomness.
* `int32` - Providers a 32 bit (signed) integer.
* `state` - Provides internal generator state. Used for saving and restoring states.

```ts
import { prngAlea } from 'ts-seedrandom';

const aleaGenerator = prngAlea('seed');
const firstValue = aleaGenerator();
const secondValue = aleaGenerator();
```

You also have the option of saving and restoring state of your generator.

```ts
import { prngAlea } from 'ts-seedrandom';

const aleaGenerator = prngAlea('seed');
const firstValue = aleaGenerator();

// Return internal generator state, which you can use in other generator instances
const state = aleaGenerator.state();

// This generator starts from the same state as first generator, but runs independently
const secondAleaGenerator = prngAlea('seed', state);
```

## Available Algorithms

The following PRNG algorithms are available:

1. `prngAlea`: Alea algorithm
2. `prngArc4`: ARC4 algorithm
3. `prngTychei`: Tyche-i algorithm
4. `prngXor128`: XorShift128 algorithm
5. `prngXor4096`: XorShift4096 algorithm
6. `prngXorshift7`: XorShift7 algorithm
7. `prngXorwow`: Xorwow algorithm
8. `prngMulberry32`: Mulberry 32 algorithm
9. `prngXoshiro128Plus`: Xoshiro128+ algorithm
10. `prngXoshiro128PlusPlus`: Xoshiro128++ algorithm
11. `prngSplitMix64`: SplitMix64 algorithm
12. `prngSplitMix32`: SplitMix32 algorithm
13. `prngSfc32`: SFC32 algorithm
14. `prngJsf32`: JSF32 algorithm
15. `prngXoroshiro128ss`: Xoshiro128** algorithm
16. `prngXoroshiro128+`: Xoroshiro128plus algorithm
16. `prngParkMiller`: Lehrer (Park-Miller) algorithm

You can import and use any of these algorithms in the same way as demonstrated in the usage examples above.

### Algorithm comparison (fastest → slowest)

| Name | State Size | Time for 1M iters (ms) | Speed (Mops/s) | Per-iter (ns) | × slower | Slower vs fastest |
| ---- | ---------- | ---------------------: | -------------: | ------------: | -------: | ----------------: |
| `xor128` | 128 bits | 10.26 | 97.42 | 10.26 | 1.00× | 0.0% |
| `xor4096` | 4096 bits | 10.33 | 96.83 | 10.33 | 1.01× | 0.6% |
| `xorwow` | 192 bits | 11.80 | 84.71 | 11.80 | 1.15× | 15.0% |
| `xorshift7` | 256 bits | 12.39 | 80.74 | 12.39 | 1.21× | 20.7% |
| `splitMix32` | 32 bits | 13.45 | 74.35 | 13.45 | 1.31× | 31.0% |
| `mulberry32` | 32 bits | 13.62 | 73.44 | 13.62 | 1.33× | 32.6% |
| `tychei` | 128 bits | 15.75 | 63.51 | 15.75 | 1.53× | 53.4% |
| `xoshiro128+` | 128 bits | 16.08 | 62.19 | 16.08 | 1.57× | 56.7% |
| `xoshiro128++` | 128 bits | 16.99 | 58.86 | 16.99 | 1.66× | 65.5% |
| `parkMiller` | 31 bits | 17.48 | 57.20 | 17.48 | 1.70× | 70.3% |
| `alea` | ~96 bits | 19.01 | 52.60 | 19.01 | 1.85× | 85.2% |
| `sfc32` | 128 bits | 26.01 | 38.45 | 26.01 | 2.53× | 153.4% |
| `jsf32` | 128 bits | 37.41 | 26.73 | 37.41 | 3.64× | 264.4% |
| `arc4` | 2048 bits | 86.60 | 11.55 | 86.60 | 8.44× | 743.7% |
| `pcg32` | 128 bits | 156.63 | 6.38 | 156.63 | 15.26× | 1425.8% |
| `xoroshiro128plus` | 128 bits | 261.90 | 3.82 | 261.90 | 25.51× | 2451.4% |
| `xoroshiro128ss` | 128 bits | 373.66 | 2.68 | 373.66 | 36.40× | 3540.2% |
| `splitmix64` | 64 bits | 632.14 | 1.58 | 632.14 | 61.58× | 6058.2% |

---

## Notes on the numbers

* **What I computed:**

  * `Mops/s (million iters/sec) = 1000 / (time_ms)`
  * `per-iteration (ns) ≈ time_ms`
  * `Slower vs fastest (%) = (1 - (current_speed / fastest_speed)) * 100`.
* **Test details / machine:** **Lenovo Legion 5 Pro 16ACH6H** (Ryzen 7 5800H — 8 cores / 16 threads, base ≈ 3.2 GHz, turbo ≈ 4.4 GHz, DDR4-3200 memory); Node.js v24.10.0.
* **Why numbers vary:** JIT warm-up, Node version, single vs multi-thread scheduling, background load, and micro-optimizations in each PRNG implementation all affect timings. Use these as a relative ranking on this machine, not an absolute cross-platform benchmark.
* You can replicate this exact table by running `npm run compare:performance`




