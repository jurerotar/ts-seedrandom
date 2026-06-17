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
20. `prngLcg32`: 32-bit linear congruential generator using Numerical Recipes constants
21. `prngXorShift32`: Marsaglia XorShift32 algorithm
22. `prngXorShift64star`: XorShift64* algorithm
23. `prngMiddleSquareWeyl`: Middle Square Weyl Sequence algorithm

You can import and use any of these algorithms in the same way as demonstrated in the usage examples above.

### Algorithm guidance and limitations

None of these algorithms are cryptographically secure. Use Web Crypto or Node's `crypto` module for security-sensitive tokens, passwords, keys, gambling, lotteries, or adversarial simulations.

| Algorithm | Good fit | Limitations |
| --------- | -------- | ----------- |
| `prngAlea` | Compatibility with David Bau-style seeded random APIs and simple deterministic simulations. | Older non-cryptographic generator with modest state; not a modern statistical-quality default. |
| `prngArc4` | Legacy compatibility with RC4/ARC4-style seedrandom behavior. | ARC4 has known biases and should not be used for security or high-quality simulation. |
| `prngTychei` | Fast 32-bit chaotic generator for deterministic procedural use. | Less commonly standardized than PCG/xoshiro-family generators. |
| `prngXor128` | Very fast legacy XorShift-style streams. | Linear artifacts; weaker than xoshiro/xoroshiro variants. |
| `prngXor4096` | Fast generator with large state and long period. | Large state for serialization; still non-cryptographic. |
| `prngXorShift7` | Fast XorShift-family generator with larger state than XorShift32. | Linear artifacts; not a modern default for demanding statistical workloads. |
| `prngXorWow` | Legacy Marsaglia/NVIDIA-style XorShift with Weyl sequence. | Linear core and known statistical weaknesses compared with modern alternatives. |
| `prngMulberry32` | Tiny, fast 32-bit generator for games, UI effects, and procedural fixtures. | Small 32-bit state; not suitable when long independent streams or high statistical quality matter. |
| `prngXoshiro128plus` | Fast 32-bit xoshiro-family stream. | The `+` output has weaker low bits; prefer `prngXoshiro128plusplus` for general use. |
| `prngXoshiro128plusplus` | Strong default when BigInt-free 32-bit performance is preferred. | Non-cryptographic; 128-bit state is smaller than the 256-bit variants. |
| `prngXoshiro256plusplus` | Strong general-purpose modern PRNG with 256-bit state. | Uses BigInt, so it is slower in JavaScript runtimes. |
| `prngXoshiro256starstar` | Strong modern PRNG for general deterministic simulation. | Uses BigInt; not cryptographically secure. |
| `prngSplitMix64` | Seeding other generators and simple 64-bit streams. | Designed more as a splittable mixer/seeder than a top-tier standalone simulation generator. |
| `prngSplitMix32` | Fast 32-bit seed expansion and lightweight deterministic streams. | Small state and lower quality than 64-bit SplitMix or xoshiro-family generators. |
| `prngSfc32` | Small Fast Chaotic generator for compact deterministic streams. | Small 128-bit state; not as widely used as PCG/xoshiro-family choices. |
| `prngJsf32` | Bob Jenkins' small fast generator for compact deterministic streams. | Older design; use modern alternatives for demanding statistical workloads. |
| `prngXoroshiro128ss` | Good 64-bit xoroshiro-family generator with scrambled output. | Uses BigInt in JavaScript; not suitable for cryptographic use. |
| `prngXoroshiro128plus` | Fast xoroshiro-family stream where `+` output compatibility is needed. | Lower bits are weaker; prefer `prngXoroshiro128ss` unless compatibility matters. |
| `prngParkMiller` | Historical MINSTD/Lehmer compatibility and tiny state. | 31-bit state, short period by modern standards, and weak statistical quality. |
| `prngLcg32` | Historical LCG compatibility, tiny state, and very fast deterministic fixtures. | Low bits are especially poor; avoid for simulations, shuffling, sampling, or anything quality-sensitive. |
| `prngXorShift32` | Extremely small and fast deterministic streams where quality is not important. | Only 32 bits of state, all-zero state is invalid, short period, and clear linear artifacts. |
| `prngXorShift64star` | Compact 64-bit XorShift stream with multiplicative output scrambling. | Better than plain XorShift64 but still linear internally; not a modern default. |
| `prngMiddleSquareWeyl` | Obscure compact generator for experimentation and deterministic procedural content. | Newer and less scrutinized than PCG/xoshiro-family generators; avoid for high-assurance statistical work. |

### Algorithm comparison (fastest → slowest)

| Name | State Size | Time for 1M iters (ms) | Speed (Mops/s) | Per-iter (ns) | × slower | Slower vs fastest |
| ---- | ---------- | ---------------------: | -------------: | ------------: | -------: | ----------------: |
| `xor4096` | 4096 bits | 7.01 | 142.58 | 7.01 | 1.00× | 0.0% |
| `xorshift7` | 256 bits | 7.63 | 131.13 | 7.63 | 1.09× | 8.7% |
| `mulberry32` | 32 bits | 7.86 | 127.24 | 7.86 | 1.12× | 12.1% |
| `xor128` | 128 bits | 7.95 | 125.75 | 7.95 | 1.13× | 13.4% |
| `xorwow` | 192 bits | 8.10 | 123.46 | 8.10 | 1.15× | 15.5% |
| `tychei` | 128 bits | 9.10 | 109.85 | 9.10 | 1.30× | 29.8% |
| `splitMix32` | 32 bits | 9.29 | 107.65 | 9.29 | 1.32× | 32.5% |
| `alea` | ~96 bits | 9.90 | 101.03 | 9.90 | 1.41× | 41.1% |
| `xorshift32` | 32 bits | 10.67 | 93.68 | 10.67 | 1.52× | 52.2% |
| `xoshiro128+` | 128 bits | 11.06 | 90.41 | 11.06 | 1.58× | 57.7% |
| `xoshiro128++` | 128 bits | 11.94 | 83.75 | 11.94 | 1.70× | 70.2% |
| `lcg32` | 32 bits | 11.98 | 83.47 | 11.98 | 1.71× | 70.8% |
| `parkMiller` | 31 bits | 17.64 | 56.68 | 17.64 | 2.52× | 151.6% |
| `sfc32` | 128 bits | 19.26 | 51.92 | 19.26 | 2.75× | 174.6% |
| `jsf32` | 128 bits | 28.07 | 35.63 | 28.07 | 4.00× | 300.2% |
| `arc4` | 2048 bits | 50.87 | 19.66 | 50.87 | 7.25× | 625.3% |
| `pcg32` | 128 bits | 82.27 | 12.16 | 82.27 | 11.73× | 1073.0% |
| `xorshift64*` | 64 bits | 93.13 | 10.74 | 93.13 | 13.28× | 1227.8% |
| `middleSquareWeyl` | 192 bits | 93.44 | 10.70 | 93.44 | 13.32× | 1232.3% |
| `xoroshiro128plus` | 128 bits | 126.09 | 7.93 | 126.09 | 17.98× | 1697.9% |
| `splitmix64` | 64 bits | 129.64 | 7.71 | 129.64 | 18.48× | 1748.4% |
| `xoshiro256++` | 256 bits | 179.76 | 5.56 | 179.76 | 25.63× | 2463.2% |
| `xoroshiro128ss` | 128 bits | 180.69 | 5.53 | 180.69 | 25.76× | 2476.4% |
| `xoshiro256**` | 256 bits | 187.33 | 5.34 | 187.33 | 26.71× | 2571.0% |

---

## Notes on the numbers

* **What I computed:**

  * `Mops/s (million iters/sec) = 1000 / (time_ms)`
  * `per-iteration (ns) ≈ time_ms`
  * `Slower vs fastest (%) = (1 - (current_speed / fastest_speed)) * 100`.
* **Test details / machine:** **Lenovo Legion 5 Pro 16ACH6H** (Ryzen 7 5800H — 8 cores / 16 threads, base ≈ 3.2 GHz, turbo ≈ 4.4 GHz, DDR4-3200 memory); Node.js v24.13.0.
* **Why numbers vary:** JIT warm-up, Node version, single vs multi-thread scheduling, background load, and micro-optimizations in each PRNG implementation all affect timings. Use these as a relative ranking on this machine, not an absolute cross-platform benchmark.
* You can replicate this exact table by running `npm run compare:performance`
