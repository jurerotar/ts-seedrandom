import { defineConfig } from 'tsup';

const tsupConfig: ReturnType<typeof defineConfig> = defineConfig({
  entry: ['src/index.ts'],
  target: 'esnext',
  format: ['esm'],
  dts: true,
  clean: true,
});

export default tsupConfig;
