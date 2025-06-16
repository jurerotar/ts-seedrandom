export type AleaGeneratorState = {
  c: number;
  s0: number;
  s1: number;
  s2: number;
};

export type Arc4GeneratorState = {
  i: number;
  j: number;
  S: number[];
};

export type Arc4GeneratorExtraMethods = {
  g: (count: number) => number;
};

export type TycheiGeneratorState = {
  a: number;
  b: number;
  c: number;
  d: number;
};

export type Xor128GeneratorState = {
  x: number;
  y: number;
  z: number;
  w: number;
};

export type Xor4096GeneratorState = {
  X: number[];
  w: number;
  i: number;
};

export type XorShift7GeneratorState = {
  x: number[];
  i: number;
};

export type XorwowGeneratorState = {
  x: number;
  y: number;
  z: number;
  w: number;
  v: number;
  d: number;
};

export type Xoshiro128PlusGeneratorState = {
  s0: number;
  s1: number;
  s2: number;
  s3: number;
};

export type Xoshiro128PlusPlusGeneratorState = {
  s0: number;
  s1: number;
  s2: number;
  s3: number;
};

export type Mulberry32GeneratorState = {
  s: number;
};

export type Pcg32GeneratorState = {
  s: bigint;
  inc: bigint;
};

export type SplitMix64GeneratorState = {
  s: bigint;
};

type PRNGFunctionName = 'quick' | 'double' | 'int32';

export type PRNGFunction = (() => number) & Record<PRNGFunctionName, () => number>;

export type PRNGAlgorithmState =
  | AleaGeneratorState
  | Arc4GeneratorState
  | TycheiGeneratorState
  | Mulberry32GeneratorState
  | SplitMix64GeneratorState
  | Pcg32GeneratorState
  | Xoshiro128PlusGeneratorState
  | Xoshiro128PlusPlusGeneratorState
  | Xor128GeneratorState
  | Xor4096GeneratorState
  | XorShift7GeneratorState
  | XorwowGeneratorState;

export type PRNGAlgorithm<State = PRNGAlgorithmState> = (
  seed?: string | number,
  state?: State,
) => PRNGFunction & {
  state: () => State;
};

export type GeneratorInterface<GeneratorState> = {
  next: () => number;
  state: () => GeneratorState;
  setState: (state: GeneratorState) => void;
};
