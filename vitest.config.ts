import type { UserConfig } from 'vite';
import { defineConfig } from 'vitest/config';

const vitestConfig: UserConfig = defineConfig({
  test: {
    watch: false,
  },
});

export default vitestConfig;
