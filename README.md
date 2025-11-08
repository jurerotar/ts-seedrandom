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
9. `prngXoshiro128Plus`: Xoshiro128+ algorithm (simple, fast)
10. `prngXoshiro128PlusPlus`: Xoshiro128++ algorithm (higher statistical quality)
11. `prngSplitMix64`: SplitMix64 algorithm
12. `prngPcg32`: PCG32 algorithm

You can import and use any of these algorithms in the same way as demonstrated in the usage examples above.

### Algorithm comparison (fastest → slowest)

| Name | State Size | Time for 1M iters (ms) | Speed (Mops/s) | Per-iter (ns) | × slower | Slower vs fastest |
| ---- | ---------- | ---------------------: | -------------: | ------------: | -------: | ----------------: |
| `xor4096` | 4096 bits | 9.91 | 100.92 | 9.91 | 1.00× | 0.0% |
| `xor128` | 128 bits | 11.29 | 88.57 | 11.29 | 1.14× | 13.9% |
| `xorwow` | 192 bits | 11.81 | 84.68 | 11.81 | 1.19× | 19.2% |
| `splitMix32` | 32 bits | 12.68 | 78.84 | 12.68 | 1.28× | 28.0% |
| `xorshift7` | 256 bits | 12.71 | 78.70 | 12.71 | 1.28× | 28.2% |
| `mulberry32` | 32 bits | 13.15 | 76.03 | 13.15 | 1.33× | 32.7% |
| `tychei` | 128 bits | 14.89 | 67.18 | 14.89 | 1.50× | 50.2% |
| `xoshiro128++` | 128 bits | 16.39 | 61.00 | 16.39 | 1.65× | 65.4% |
| `xoshiro128+` | 128 bits | 16.50 | 60.61 | 16.50 | 1.66× | 66.5% |
| `alea` | ~96 bits | 17.86 | 56.00 | 17.86 | 1.80× | 80.2% |
| `sfc32` | 128 bits | 24.36 | 41.05 | 24.36 | 2.46× | 145.8% |
| `jsf32` | 128 bits | 36.71 | 27.24 | 36.71 | 3.71× | 270.5% |
| `arc4` | 2048 bits | 93.08 | 10.74 | 93.08 | 9.39× | 839.3% |
| `pcg32` | 128 bits | 151.11 | 6.62 | 151.11 | 15.25× | 1425.0% |
| `xoroshiro128plus64` | 128 bits | 254.90 | 3.92 | 254.90 | 25.72× | 2472.3% |
| `xoroshiro128ss` | 128 bits | 349.12 | 2.86 | 349.12 | 35.23× | 3423.2% |
| `splitmix64` | 64 bits | 613.12 | 1.63 | 613.12 | 61.87× | 6087.3% |

---

## Notes on the numbers

* **What I computed:**

  * `Mops/s (million iters/sec) = 1000 / (time_ms)`
  * `per-iteration (ns) ≈ time_ms`
  * `Slower vs fastest (%) = (1 - (current_speed / fastest_speed)) * 100`.
* **Test details / machine:** **Lenovo Legion 5 Pro 16ACH6H** (Ryzen 7 5800H — 8 cores / 16 threads, base ≈ 3.2 GHz, turbo ≈ 4.4 GHz, DDR4-3200 memory); Node.js v24.10.0.
* **Why numbers vary:** JIT warm-up, Node version, single vs multi-thread scheduling, background load, and micro-optimizations in each PRNG implementation all affect timings. Use these as a relative ranking on this machine, not an absolute cross-platform benchmark.
* You can replicate this exact table by running `npm run compare:performance"`




