import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['source/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: true,
});
