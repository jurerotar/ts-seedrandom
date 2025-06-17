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

### Algorithm comparison

| Name                     | State Size | Speed 🏎️    | Quality 📊 | Period    | Notes                                    |
| ------------------------ | ---------- | ------------ | ---------- | --------- | ---------------------------------------- |
| `prngAlea`               | \~96 bits  | 🟢 Fast      | 🔸 OK      | \~2³²     | Simple and widely used in JS             |
| `prngArc4`               | 2048 bits  | 🟡 Medium    | 🔸 OK      | \~2¹⁷⁰⁰   | Legacy cipher, good entropy, slowish     |
| `prngTychei`             | 128 bits   | 🟢 Fast      | 🟡 Medium  | \~2⁶⁴     | Inspired by Marsaglia, fast and small    |
| `prngXor128`             | 128 bits   | 🟢 Fast      | 🔸 OK      | \~2¹²⁸−1  | Basic Xorshift, outdated                 |
| `prngXor4096`            | 4096 bits  | 🔴 Slow      | 🟡 Medium  | \~2⁴⁰⁹⁶−1 | Very large state                         |
| `prngXorshift7`          | 224 bits   | 🟡 Medium    | 🟡 Medium  | \~2²²⁴    | Passes more tests than basic Xorshift    |
| `prngXorwow`             | 160 bits   | 🟢 Fast      | 🟡 Medium  | \~2¹⁹²    | Used in older CUDA RNGs                  |
| `prngMulberry32`         | 32 bits    | 🟢 Very fast | 🔸 OK      | \~2³²     | Very small, ultra fast                   |
| `prngXoshiro128Plus`     | 128 bits   | 🟢 Fast      | 🟡 Good    | \~2¹²⁸−1  | Simple, good for games                   |
| `prngXoshiro128PlusPlus` | 128 bits   | 🟢 Fast      | 🟢 Better  | \~2¹²⁸−1  | Improved output function                 |
| `prngSplitMix64`         | 64 bits    | 🟢 Very fast | 🟢 High    | \~2⁶⁴     | Great for seeding other PRNGs            |
| `prngPcg32`              | 64 bits    | 🟢 Fast      | 🟢 High    | \~2⁶⁴     | Compact, modern, good for simulation use |

### Legend

- **Speed**:
  - 🟢 Fast: Suitable for games, animation, UI
  - 🟡 Medium: Acceptable overhead
  - 🔴 Slow: Use only when large state is essential

- **Quality**:
  - 🔸 OK: May fail strict tests (e.g., PractRand)
  - 🟡 Medium: Passes basic uniformity/randomness
  - 🟢 High: Strong statistical quality


