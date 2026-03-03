import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['source/index.ts'],
  format: ['cjs', 'esm'],
  dts: { resolve: false },
  splitting: false,
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: 'terser',
  terserOptions: {
    compress: {
      passes: 2,
      drop_console: false,
      pure_getters: true,
    },
    mangle: {
      properties: false,
    },
  },
});
