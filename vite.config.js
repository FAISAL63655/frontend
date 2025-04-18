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
    // تعطيل خرائط المصدر في الإنتاج لتحسين الأداء
    sourcemap: false,
    // تحسين حجم الأجزاء
    chunkSizeWarningLimit: 1000,
    // تقسيم الشيفرة CSS لتحسين التحميل
    cssCodeSplit: true,
    // تحسين الأصول الثابتة
    assetsInlineLimit: 4096,
    // تكوين البناء لتحسين الأداء
    rollupOptions: {
      output: {
        // تقسيم المكتبات الكبيرة إلى أجزاء منفصلة
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['vuetify']
        },
        // تحسين أسماء الملفات للتخزين المؤقت الأفضل
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // تقليل حجم البناء باستخدام esbuild بدلاً من terser
    minify: 'esbuild',
    esbuildOptions: {
      drop: ['console', 'debugger']
    }
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
  },
  preview: {
    port: 4173,
    // Allow all hosts in preview mode
    host: '0.0.0.0',
    // Explicitly allow Render domains
    allowedHosts: ['frontend-smuk.onrender.com', '.onrender.com', 'localhost']
  }
})
