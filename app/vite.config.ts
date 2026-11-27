/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg'],
      manifest: {
        name: 'Pescado que cuida',
        short_name: 'Pescado',
        description: 'Semáforo de consumo de pescado según el mercurio de cada especie.',
        lang: 'es',
        display: 'standalone',
        start_url: '.',
        theme_color: '#0f766e',
        background_color: '#ffffff',
        icons: [{ src: 'icono.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,webp,ogg,svg,bin}'],
        // El modelo de visión y TensorFlow.js superan el límite por defecto de 2 MB.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
