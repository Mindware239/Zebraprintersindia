import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    host: true,
    open: false, // Don't auto-open browser
    hmr: {
      overlay: true
    }
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true
  }
})
