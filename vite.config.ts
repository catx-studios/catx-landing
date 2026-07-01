import { defineConfig } from 'vite';

// base: './' keeps asset URLs relative so the static build works on any host
// path (root domain, sub-path, or preview URL) without reconfiguration.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
});
