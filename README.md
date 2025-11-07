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

|               Name | State Size | Time for 1M iters (ms) | Speed (Mops/s) | Per-iter (ns) | × slower | Slower vs fastest |
| -----------------: | :--------: | ---------------------: | -------------: | ------------: | -------: | ----------------: |
|       `prngXor128` |  128 bits  |                   7.89 |         126.74 |          7.89 |     1.00 |              0.0% |
|       `prngXorwow` |  160 bits  |                   8.87 |         112.74 |          8.87 |     1.12 |             12.4% |
|      `prngXor4096` |  4096 bits |                  10.85 |          92.17 |         10.85 |     1.38 |             37.5% |
|   `prngMulberry32` |   32 bits  |                  11.63 |          85.98 |         11.63 |     1.47 |             47.4% |
|    `prngXorshift7` |  224 bits  |                  11.79 |          84.82 |         11.79 |     1.49 |             49.4% |
|       `prngTychei` |  128 bits  |                  12.06 |          82.92 |         12.06 |     1.53 |             52.9% |
|         `prngAlea` |  ~96 bits  |                  12.36 |          80.91 |         12.36 |     1.57 |             56.7% |
|  `prngXoshiro128+` |  128 bits  |                  23.76 |          42.09 |         23.76 |     3.01 |            201.1% |
| `prngXoshiro128++` |  128 bits  |                  36.41 |          27.46 |         36.41 |     4.61 |            361.5% |
|         `prngArc4` |  2048 bits |                  88.30 |          11.33 |         88.30 |    11.19 |          1,019.1% |
|        `prngPcg32` |   64 bits  |                 162.25 |           6.16 |        162.25 |    20.56 |          1,956.4% |
|   `prngSplitMix64` |   64 bits  |                 709.11 |           1.41 |        709.11 |    89.87 |          8,887.5% |

---

## Notes on the numbers

* **What I computed:**

  * `Mops/s (million iters/sec) = 1000 / (time_ms)`
  * `per-iteration (ns) ≈ time_ms`
  * `Slower vs fastest (%) = (1 - (current_speed / fastest_speed)) * 100`.
* **Test details / machine:** **Lenovo Legion 5 Pro 16ACH6H** (Ryzen 7 5800H — 8 cores / 16 threads, base ≈ 3.2 GHz, turbo ≈ 4.4 GHz, DDR4-3200 memory); Node.js v24.10.0.
* **Why numbers vary:** JIT warm-up, Node version, single vs multi-thread scheduling, background load, and micro-optimizations in each PRNG implementation all affect timings. Use these as a relative ranking on this machine, not an absolute cross-platform benchmark.
* You can replicate this exact table by running `npm run compare:performance"`




