// biome-ignore-all lint/suspicious/noConsole: Test file

import {
  prngAlea,
  prngArc4,
  prngMulberry32,
  prngPcg32,
  prngSplitMix64,
  prngTychei,
  prngXor128,
  prngXor4096,
  prngXorShift7,
  prngXorWow,
  prngXoshiro128plus,
  prngXoshiro128plusplus,
  prngSplitMix32,
  prngJsf32,
  prngSfc32,
  prngXoroshiro128plus64,
  prngXoroshiro128ss,
} from '../dist/index.js';

const ITERATIONS = 1_000_000;

const STATE_SIZES: Record<string, string> = {
  alea: '~96 bits',
  arc4: '2048 bits',
  tychei: '128 bits',
  mulberry32: '32 bits',
  splitmix64: '64 bits',
  pcg32: '128 bits',
  xor128: '128 bits',
  xor4096: '4096 bits',
  xorshift7: '256 bits',
  xorwow: '192 bits',
  'xoshiro128+': '128 bits',
  'xoshiro128++': '128 bits',
  splitMix32: '32 bits',
  sfc32: '128 bits',
  jsf32: '128 bits',
  xoroshiro128ss: '128 bits',
  xoroshiro128plus64: '128 bits',
};

const PRNGS = [
  { name: 'alea', prng: prngAlea },
  { name: 'arc4', prng: prngArc4 },
  { name: 'tychei', prng: prngTychei },
  { name: 'mulberry32', prng: prngMulberry32 },
  { name: 'splitmix64', prng: prngSplitMix64 },
  { name: 'pcg32', prng: prngPcg32 },
  { name: 'xor128', prng: prngXor128 },
  { name: 'xor4096', prng: prngXor4096 },
  { name: 'xorshift7', prng: prngXorShift7 },
  { name: 'xorwow', prng: prngXorWow },
  { name: 'xoshiro128+', prng: prngXoshiro128plus },
  { name: 'xoshiro128++', prng: prngXoshiro128plusplus },
  { name: 'splitMix32', prng: prngSplitMix32 },
  { name: 'sfc32', prng: prngSfc32 },
  { name: 'jsf32', prng: prngJsf32 },
  { name: 'xoroshiro128ss', prng: prngXoroshiro128ss },
  { name: 'xoroshiro128plus64', prng: prngXoroshiro128plus64 },
];

const results: {
  name: string;
  stateSize: string;
  timeMs: number;
  mops: number;
  perIterNs: number;
  xSlower: number;
  slowerPct: number;
}[] = [];

for (const { name, prng } of PRNGS) {
  // warm-up JIT
  const prngWarm = prng('seed');
  for (let i = 0; i < 1_000; i++) {
    prngWarm();
  }

  const rng = prng('seed');
  let acc = 0;
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    acc += rng();
  }
  const duration = performance.now() - start; // ms
  const mops = 1000 / duration; // million ops/sec
  const perIterNs = duration; // numeric equivalence: X ms for 1e6 iters -> X ns/iter
  results.push({
    name,
    stateSize: STATE_SIZES[name] ?? '—',
    timeMs: duration,
    mops,
    perIterNs,
    xSlower: 0,
    slowerPct: 0,
  });

  console.log(
    `${name.padEnd(14)}: ${duration.toFixed(2)} ms — ${mops.toFixed(2)} Mops/s`,
  );

  // use acc so optimizer can't drop the loop (avoid dead-code-elim)
  if (!Number.isFinite(acc)) {
    throw new Error('acc is not finite');
  }
}

results.sort((a, b) => a.timeMs - b.timeMs);

const baseline: number = results[0].timeMs;

for (const r of results) {
  r.xSlower = r.timeMs / baseline;
  r.slowerPct = (r.xSlower - 1) * 100;
}

console.log('');
console.log(
  '| Name | State Size | Time for 1M iters (ms) | Speed (Mops/s) | Per-iter (ns) | × slower | Slower vs fastest |',
);
console.log(
  '| ---- | ---------- | ---------------------: | -------------: | ------------: | -------: | ----------------: |',
);

for (const r of results) {
  console.log(
    `| \`${r.name}\` | ${r.stateSize} | ${r.timeMs.toFixed(
      2,
    )} | ${r.mops.toFixed(2)} | ${r.perIterNs.toFixed(2)} | ${r.xSlower.toFixed(
      2,
    )}× | ${r.slowerPct.toFixed(1)}% |`,
  );
}
