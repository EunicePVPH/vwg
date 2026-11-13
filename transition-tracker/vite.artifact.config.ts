import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Single-file build for previewing as a Claude Artifact (no service worker there).
export default defineConfig({
  define: { __ARTIFACT__: true },
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-artifact', assetsInlineLimit: 100000000, cssCodeSplit: false },
});
