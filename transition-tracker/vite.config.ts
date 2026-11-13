import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Full build: installable, offline-capable PWA (needs testing on target devices).
export default defineConfig({
  define: { __ARTIFACT__: false },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Transition Tracker',
        short_name: 'Transitions',
        description: 'Classroom transition timer and action-research tracker for Grade 4.',
        theme_color: '#172B4D',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
