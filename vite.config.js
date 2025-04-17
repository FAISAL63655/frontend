import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Generate source maps for better debugging
    sourcemap: false,
    // Optimize chunks for better performance
    chunkSizeWarningLimit: 1000
  },
  // Configure server options
  server: {
    port: 5173,
    strictPort: false,
    // Configure proxy for API requests during development
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
