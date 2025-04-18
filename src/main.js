import './assets/main.css'

// Vuetify
// استخدام CDN لخطوط MDI بدلاً من الحزمة
// import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'
import router from './router'
import api from './services/apiConfig'
import { useCacheStore } from './stores/cache'
import { useDataStore } from './stores/data'

// تكوين التطبيق
const app = createApp(App)
const pinia = createPinia()

// إضافة Pinia للتطبيق
app.use(pinia)

// تهيئة المخازن
const cacheStore = useCacheStore()
const dataStore = useDataStore()

// تهيئة التخزين المؤقت
cacheStore.updateSettings({
  defaultTTL: 5 * 60 * 1000, // 5 دقائق
  enabled: true
})

// Get user preferred theme
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
const savedTheme = localStorage.getItem('darkMode')
const initialTheme = savedTheme !== null ? savedTheme === 'true' : prefersDarkMode

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: initialTheme ? 'dark' : 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#F5F7FA',
          surface: '#FFFFFF',
          primary: '#1976D2',
          'primary-darken-1': '#1565C0',
          secondary: '#424242',
          'secondary-darken-1': '#212121',
          accent: '#82B1FF',
          error: '#F44336',
          info: '#03A9F4',
          success: '#4CAF50',
          warning: '#FF9800',
        }
      },
      dark: {
        dark: true,
        colors: {
          background: '#121212',
          surface: '#1E1E1E',
          primary: '#2196F3',
          'primary-darken-1': '#1E88E5',
          secondary: '#607D8B',
          'secondary-darken-1': '#455A64',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#4FC3F7',
          success: '#66BB6A',
          warning: '#FFA726',
        }
      }
    }
  },
  rtl: true, // Enable RTL for Arabic
})

// إضافة المكونات الأخرى للتطبيق
app.use(router)
app.use(vuetify)

// جعل API متاحًا عالميًا
app.config.globalProperties.$api = api

// تحميل البيانات المشتركة عند بدء التطبيق
router.beforeEach(async (_, __, next) => {
  // تحميل البيانات المشتركة إذا لم تكن محملة بالفعل
  if (dataStore.classOptions.length === 0) {
    try {
      // تحميل البيانات المشتركة بالتوازي
      await dataStore.fetchAllData();
    } catch (error) {
      console.error('Error loading shared data:', error);
    }
  }
  next();
})

app.mount('#app')
