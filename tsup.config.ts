import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'face-api.js', 'lottie-web'],
  loader: {
    '.css': 'css',
  },
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
