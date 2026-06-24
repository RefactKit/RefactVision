/// <reference types="vitest" />

import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    ...(process.env.VITEST ? [] : [tanstackStart()]),
    viteReact(),
    tailwindcss(),
    ...(process.env.VITEST ? [] : [nitro()]),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  environments: {
    ssr: { build: { rollupOptions: { input: './src/server.ts' } } },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'src/test/setup.ts',
        'src/routeTree.gen.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
    },
  },
})
