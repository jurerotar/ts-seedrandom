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
6. `prngXorShift7`: XorShift7 algorithm
7. `prngXorWow`: Xorwow algorithm
8. `prngMulberry32`: Mulberry 32 algorithm
9. `prngXoshiro128plus`: Xoshiro128+ algorithm
10. `prngXoshiro128plusplus`: Xoshiro128++ algorithm
11. `prngXoshiro256plusplus`: Xoshiro256++ algorithm
12. `prngXoshiro256starstar`: Xoshiro256** algorithm
13. `prngSplitMix64`: SplitMix64 algorithm
14. `prngSplitMix32`: SplitMix32 algorithm
15. `prngSfc32`: SFC32 algorithm
16. `prngJsf32`: JSF32 algorithm
17. `prngXoroshiro128ss`: Xoroshiro128** algorithm
18. `prngXoroshiro128plus`: Xoroshiro128+ algorithm
19. `prngParkMiller`: Lehmer (Park-Miller) algorithm

You can import and use any of these algorithms in the same way as demonstrated in the usage examples above.

### Algorithm comparison (fastest → slowest)

| Name | State Size | Time for 1M iters (ms) | Speed (Mops/s) | Per-iter (ns) | × slower | Slower vs fastest |
| ---- | ---------- | ---------------------: | -------------: | ------------: | -------: | ----------------: |
| `xor4096` | 4096 bits | 6.99 | 143.03 | 6.99 | 1.00× | 0.0% |
| `xorshift7` | 256 bits | 7.29 | 137.18 | 7.29 | 1.04× | 4.3% |
| `xor128` | 128 bits | 7.46 | 134.04 | 7.46 | 1.07× | 6.7% |
| `xorwow` | 192 bits | 7.67 | 130.44 | 7.67 | 1.10× | 9.7% |
| `mulberry32` | 32 bits | 8.07 | 123.88 | 8.07 | 1.15× | 15.5% |
| `splitMix32` | 32 bits | 8.49 | 117.81 | 8.49 | 1.21× | 21.4% |
| `tychei` | 128 bits | 9.15 | 109.29 | 9.15 | 1.31× | 30.9% |
| `alea` | ~96 bits | 9.35 | 106.91 | 9.35 | 1.34× | 33.8% |
| `xoshiro128+` | 128 bits | 10.85 | 92.17 | 10.85 | 1.55× | 55.2% |
| `xoshiro128++` | 128 bits | 11.23 | 89.06 | 11.23 | 1.61× | 60.6% |
| `parkMiller` | 31 bits | 16.43 | 60.86 | 16.43 | 2.35× | 135.0% |
| `sfc32` | 128 bits | 18.62 | 53.69 | 18.62 | 2.66× | 166.4% |
| `jsf32` | 128 bits | 27.85 | 35.91 | 27.85 | 3.98× | 298.3% |
| `arc4` | 2048 bits | 49.78 | 20.09 | 49.78 | 7.12× | 611.9% |
| `pcg32` | 128 bits | 84.65 | 11.81 | 84.65 | 12.11× | 1110.7% |
| `xoroshiro128plus` | 128 bits | 122.71 | 8.15 | 122.71 | 17.55× | 1655.1% |
| `splitmix64` | 64 bits | 129.58 | 7.72 | 129.58 | 18.53× | 1753.4% |
| `xoshiro256++` | 256 bits | 171.57 | 5.83 | 171.57 | 24.54× | 2353.9% |
| `xoroshiro128ss` | 128 bits | 178.74 | 5.59 | 178.74 | 25.57× | 2456.5% |
| `xoshiro256**` | 256 bits | 187.36 | 5.34 | 187.36 | 26.80× | 2579.9% |

---

## Notes on the numbers

* **What I computed:**

  * `Mops/s (million iters/sec) = 1000 / (time_ms)`
  * `per-iteration (ns) ≈ time_ms`
  * `Slower vs fastest (%) = (1 - (current_speed / fastest_speed)) * 100`.
* **Test details / machine:** **Lenovo Legion 5 Pro 16ACH6H** (Ryzen 7 5800H — 8 cores / 16 threads, base ≈ 3.2 GHz, turbo ≈ 4.4 GHz, DDR4-3200 memory); Node.js v24.13.0.
* **Why numbers vary:** JIT warm-up, Node version, single vs multi-thread scheduling, background load, and micro-optimizations in each PRNG implementation all affect timings. Use these as a relative ranking on this machine, not an absolute cross-platform benchmark.
* You can replicate this exact table by running `npm run compare:performance`


