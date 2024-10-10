import { alea } from 'src/prng-algorithms/alea';
import { arc4 } from 'src/prng-algorithms/arc-4';
import { tychei } from 'src/prng-algorithms/tychei';
import { xor128 } from 'src/prng-algorithms/xor-128';
import { xor4096 } from 'src/prng-algorithms/xor-4096';
import { xorShift7 } from 'src/prng-algorithms/xor-shift-7';
import { xorWow } from 'src/prng-algorithms/xor-wow';
import type {
  AleaGeneratorState,
  Arc4GeneratorState,
  PRNGAlgorithm,
  PRNGFunction,
  TycheiGeneratorState,
  Xor128GeneratorState,
  Xor4096GeneratorState,
  XorShift7GeneratorState,
  XorwowGeneratorState,
} from 'src/types';

export {
  alea as prngAlea,
  arc4 as prngArc4,
  tychei as prngTychei,
  xor128 as prngXor128,
  xor4096 as prngXor4096,
  xorShift7 as prngXorShift7,
  xorWow as prngXorWow,
  type PRNGAlgorithm,
  type PRNGFunction,
  type AleaGeneratorState,
  type Arc4GeneratorState,
  type TycheiGeneratorState,
  type Xor128GeneratorState,
  type Xor4096GeneratorState,
  type XorShift7GeneratorState,
  type XorwowGeneratorState,
};
