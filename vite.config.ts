import { defineConfig } from 'vite';

// base: './' keeps asset URLs relative so the static build works on any host
// path (root domain, sub-path, or preview URL) without reconfiguration.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
  server: {
    // Allow previewing the dev server over Tailscale MagicDNS (e.g. tailscale serve,
    // or http://<host>.<tailnet>.ts.net:5173). Scoped to .ts.net, not wide-open.
    allowedHosts: ['.ts.net'],
  },
});
