/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
})
