import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves a project site under /<repo>/. Override with VITE_BASE if
// your repository has a different name.
const base = process.env.VITE_BASE ?? '/cent_game/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? base : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'icons/apple-touch-icon.png',
        'icons/favicon-32.png',
        'questions.json',
      ],
      manifest: {
        name: 'Who Wants to Be a Millionaire?',
        short_name: 'Millionaire',
        description: 'A kid-friendly quiz game with history, science, geography and more.',
        theme_color: '#0a0a2e',
        background_color: '#0a0a2e',
        display: 'standalone',
        orientation: 'landscape',
        // Relative paths so the app works under a GitHub Pages sub-path.
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache everything needed to play fully offline: app shell, the
        // questions data, icons and the self-hosted fonts.
        globPatterns: ['**/*.{js,css,html,png,svg,json,webmanifest,woff,woff2,ttf}'],
        navigateFallback: 'index.html',
        // Font/data files can exceed the 2 MiB default; raise the ceiling.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
}))
