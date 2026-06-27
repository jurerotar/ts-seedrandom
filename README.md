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
4. `prngMulberry32`: Mulberry 32 algorithm
5. `prngSplitMix64`: SplitMix64 algorithm
6. `prngPcg32`: PCG32 algorithm
7. `prngXor128`: XorShift128 algorithm
8. `prngXor4096`: XorShift4096 algorithm
9. `prngXorShift7`: XorShift7 algorithm
10. `prngXorWow`: Xorwow algorithm
11. `prngXoshiro128plus`: Xoshiro128+ algorithm
12. `prngXoshiro128plusplus`: Xoshiro128++ algorithm
13. `prngXoshiro256plusplus`: Xoshiro256++ algorithm
14. `prngXoshiro256starstar`: Xoshiro256** algorithm
15. `prngSplitMix32`: SplitMix32 algorithm
16. `prngSfc32`: SFC32 algorithm
17. `prngJsf32`: JSF32 algorithm
18. `prngXoroshiro128ss`: Xoroshiro128** algorithm
19. `prngXoroshiro128plus`: Xoroshiro128+ algorithm
20. `prngParkMiller`: Lehmer (Park-Miller) algorithm
21. `prngLcg32`: 32-bit linear congruential generator using Numerical Recipes constants
22. `prngXorShift32`: Marsaglia XorShift32 algorithm
23. `prngXorShift64star`: XorShift64* algorithm
24. `prngMiddleSquareWeyl`: Middle Square Weyl Sequence algorithm

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
| `prngPcg32` | Compact modern generator with good statistical behavior for deterministic fixtures and simulations. | Uses BigInt in this implementation; slower than pure 32-bit generators. |
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
| `xor4096` | 4096 bits | 6.85 | 145.88 | 6.85 | 1.00× | 0.0% |
| `xor128` | 128 bits | 7.28 | 137.43 | 7.28 | 1.06× | 6.2% |
| `mulberry32` | 32 bits | 7.54 | 132.67 | 7.54 | 1.10× | 10.0% |
| `xorwow` | 192 bits | 7.55 | 132.39 | 7.55 | 1.10× | 10.2% |
| `xorshift7` | 256 bits | 7.66 | 130.61 | 7.66 | 1.12× | 11.7% |
| `splitMix32` | 32 bits | 8.65 | 115.66 | 8.65 | 1.26× | 26.1% |
| `tychei` | 128 bits | 8.76 | 114.15 | 8.76 | 1.28× | 27.8% |
| `alea` | ~96 bits | 10.04 | 99.57 | 10.04 | 1.47× | 46.5% |
| `xorshift32` | 32 bits | 10.28 | 97.27 | 10.28 | 1.50× | 50.0% |
| `lcg32` | 32 bits | 10.75 | 93.01 | 10.75 | 1.57× | 56.9% |
| `xoshiro128+` | 128 bits | 11.40 | 87.72 | 11.40 | 1.66× | 66.3% |
| `xoshiro128++` | 128 bits | 12.06 | 82.89 | 12.06 | 1.76× | 76.0% |
| `parkMiller` | 31 bits | 16.71 | 59.85 | 16.71 | 2.44× | 143.7% |
| `sfc32` | 128 bits | 19.11 | 52.33 | 19.11 | 2.79× | 178.8% |
| `jsf32` | 128 bits | 28.30 | 35.34 | 28.30 | 4.13× | 312.8% |
| `arc4` | 2048 bits | 31.59 | 31.65 | 31.59 | 4.61× | 360.9% |
| `xorshift64*` | 64 bits | 80.19 | 12.47 | 80.19 | 11.70× | 1069.9% |
| `pcg32` | 128 bits | 82.26 | 12.16 | 82.26 | 12.00× | 1100.0% |
| `middleSquareWeyl` | 192 bits | 85.79 | 11.66 | 85.79 | 12.51× | 1151.5% |
| `xoroshiro128plus` | 128 bits | 109.25 | 9.15 | 109.25 | 15.94× | 1493.8% |
| `splitmix64` | 64 bits | 116.85 | 8.56 | 116.85 | 17.05× | 1604.6% |
| `xoshiro256++` | 256 bits | 142.36 | 7.02 | 142.36 | 20.77× | 1976.7% |
| `xoshiro256**` | 256 bits | 162.07 | 6.17 | 162.07 | 23.64× | 2264.4% |
| `xoroshiro128ss` | 128 bits | 162.55 | 6.15 | 162.55 | 23.71× | 2271.3% |

---

## Notes on the numbers

* **What I computed:**

  * `Mops/s (million iters/sec) = 1000 / (time_ms)`
  * `per-iteration (ns) ≈ time_ms`
  * `Slower vs fastest (%) = (1 - (current_speed / fastest_speed)) * 100`.
* **Test details / machine:** **Lenovo Legion 5 Pro 16ACH6H** (Ryzen 7 5800H — 8 cores / 16 threads, base ≈ 3.2 GHz, turbo ≈ 4.4 GHz, DDR4-3200 memory); Node.js v24.13.0.
* **Why numbers vary:** JIT warm-up, Node version, single vs multi-thread scheduling, background load, and micro-optimizations in each PRNG implementation all affect timings. Use these as a relative ranking on this machine, not an absolute cross-platform benchmark.
* You can replicate this exact table by running `npm run compare:performance`
