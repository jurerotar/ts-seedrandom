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
  mixKey: (seed: string, key: number[]) => number[];
};

type PRNGFunctionName = 'quick' | 'double' | 'int32';

export type PRNGFunction = (() => number) & Record<PRNGFunctionName, () => number>;

export type PRNGAlgorithm<State = AleaGeneratorState | Arc4GeneratorState> = (
  seed?: string | number,
  state?: State,
) => PRNGFunction & {
  state: () => State;
};

export type GeneratorInterface<GeneratorState> = GeneratorState & {
  next: () => number;
  state: () => GeneratorState;
  setState: (state: GeneratorState) => void;
};
