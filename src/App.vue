<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NotificationCenter from '@/components/NotificationCenter.vue'
import LoadingBar from '@/components/LoadingBar.vue'
import { useTheme } from 'vuetify'

// Route information
const route = useRoute()

// Theme handling
const theme = useTheme()
const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')

// Set theme based on preference
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  theme.global.name.value = isDarkMode.value ? 'dark' : 'light'
  localStorage.setItem('darkMode', isDarkMode.value.toString())
}

// Watch for theme changes
watch(isDarkMode, (newVal) => {
  theme.global.name.value = newVal ? 'dark' : 'light'
})

// Navigation drawer state
const drawer = ref(false)

// Current date and time
const currentDateTime = ref(new Date())

// Update time every minute
setInterval(() => {
  currentDateTime.value = new Date()
}, 60000)

// Format date in Arabic
const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDateTime.value)
})

// Format time
const formattedTime = computed(() => {
  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(currentDateTime.value)
})

// Navigation items
const navItems = [
  { title: 'لوحة التحكم', icon: 'mdi-view-dashboard-outline', to: '/' },
  { title: 'الطلاب', icon: 'mdi-account-group-outline', to: '/students' },
  { title: 'الجدول الدراسي', icon: 'mdi-calendar-clock-outline', to: '/schedule' },
  { title: 'الدرجات', icon: 'mdi-clipboard-text-outline', to: '/grades' },
  { title: 'الدرجات المحدثة', icon: 'mdi-clipboard-pulse-outline', to: '/grades-new' },
  { title: 'الفرسان', icon: 'mdi-trophy-outline', to: '/champions' },
  { title: 'التقارير', icon: 'mdi-chart-box-outline', to: '/reports' },
  { title: 'الاختيار العشوائي', icon: 'mdi-dice-multiple-outline', to: '/random-picker' },
  { title: 'السبورة البيضاء', icon: 'mdi-drawing-box', to: '/whiteboard' },
  { title: 'القرآن', icon: 'mdi-book-open-page-variant-outline', to: '/quran' },
  { title: 'الصفوف والمواد', icon: 'mdi-book-education-outline', to: '/classes-subjects' },
  { title: 'الإعدادات', icon: 'mdi-cog-outline', to: '/settings' }
]

// Get active route
const getActiveClass = (path) => {
  return route.path === path ? 'active-nav-item' : ''
}

// Initialize app
onMounted(() => {
  // Set initial theme
  theme.global.name.value = isDarkMode.value ? 'dark' : 'light'

  // This will be replaced with actual API calls in the future
  console.log('App initialized')
})
</script>

<template>
  <v-app :theme="theme.global.name.value">
    <!-- شريط التحميل -->
    <LoadingBar />
    <v-layout>
      <!-- App Bar -->
      <v-app-bar color="primary" elevation="2" class="app-header">
        <template v-slot:prepend>
          <v-app-bar-title class="app-title">
            <div class="logo-container">
              <v-icon icon="mdi-school-outline" size="large" class="logo-icon"></v-icon>
              <span>نظام إدارة التعليم</span>
            </div>
          </v-app-bar-title>
        </template>

        <v-spacer></v-spacer>

        <!-- Current Schedule Info -->
        <div class="header-chip-group d-none d-sm-flex">
          <v-chip class="ma-2 date-chip" color="surface" variant="elevated" size="small">
            <v-icon start icon="mdi-calendar" size="small" color="primary"></v-icon>
            {{ formattedDate }}
          </v-chip>

          <v-chip class="ma-2 time-chip" color="surface" variant="elevated" size="small">
            <v-icon start icon="mdi-clock-outline" size="small" color="primary"></v-icon>
            {{ formattedTime }}
          </v-chip>
        </div>

        <!-- Notification Center -->
        <NotificationCenter class="mr-2" />

        <!-- Theme Switch -->
        <v-btn icon @click="toggleTheme" class="mr-2 app-bar-icon">
          <v-icon :icon="isDarkMode ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"></v-icon>
        </v-btn>

        <!-- User Menu -->
        <v-menu transition="slide-y-transition" location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" class="app-bar-icon">
              <v-avatar color="primary lighten-2" size="40">
                <v-icon color="white">mdi-account</v-icon>
              </v-avatar>
            </v-btn>
          </template>
          <v-list min-width="200">
            <v-list-item
              title="أحمد محمد"
              subtitle="معلم"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" size="40">
                  <v-icon color="white">mdi-account</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list-item title="الملف الشخصي" prepend-icon="mdi-account-details-outline" class="rounded-lg my-1"></v-list-item>
            <v-list-item title="الإعدادات" prepend-icon="mdi-cog-outline" :to="'/settings'" class="rounded-lg my-1"></v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list-item title="تسجيل الخروج" prepend-icon="mdi-logout" class="rounded-lg my-1"></v-list-item>
          </v-list>
        </v-menu>

        <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="ms-2 drawer-trigger app-bar-icon"></v-app-bar-nav-icon>
      </v-app-bar>

      <!-- Navigation Drawer -->
      <v-navigation-drawer v-model="drawer" location="right" elevation="3" class="app-drawer">
        <v-list-item
          title="فيصل الجطيلي"
          subtitle="معلم"
          class="user-profile"
        >
          <template v-slot:prepend>
            <v-avatar color="primary" size="40">
              <v-icon color="white">mdi-account</v-icon>
            </v-avatar>
          </template>
        </v-list-item>

        <v-divider class="mt-2"></v-divider>

        <v-list nav class="nav-list">
          <v-list-item
            v-for="item in navItems"
            :key="item.title"
            :value="item.title"
            :title="item.title"
            :prepend-icon="item.icon"
            :to="item.to"
            :class="getActiveClass(item.to)"
            class="nav-item"
            rounded="lg"
          ></v-list-item>
        </v-list>

        <template v-slot:append>
          <div class="pa-2">
            <v-btn block color="primary" prepend-icon="mdi-help-circle-outline" class="app-version">
              المساعدة
            </v-btn>
            <div class="text-caption text-center mt-2 text-disabled">الإصدار 1.0.0</div>
          </div>
        </template>
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main class="main-content">
        <v-container fluid class="px-4 py-4">
          <RouterView v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </v-container>
      </v-main>

      <!-- Footer -->
      <v-footer app class="d-flex justify-center app-footer" color="background">
        <span class="text-caption">&copy; {{ new Date().getFullYear() }} - نظام إدارة التعليم | تم تطويره بواسطة فريق التطوير</span>
      </v-footer>
    </v-layout>
  </v-app>
</template>

<style>
/* إصلاح مشكلات التمرير الشاملة في التطبيق */
html, body {
  height: 100%;
  overflow-y: auto !important;
  scroll-behavior: smooth;
}

.v-application {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.v-main {
  flex: 1;
  overflow-y: auto !important;
}

.v-main__wrap {
  height: auto;
  min-height: 100%;
  overflow-y: auto !important;
}

/* إصلاح مشكلات جداول البيانات */
.v-data-table__wrapper {
  overflow-y: auto;
  height: auto !important;
  max-height: none !important;
}

/* Global styles */
:root {
  --primary-base: 25, 118, 210;
  --secondary-base: 66, 66, 66;
  --accent-base: 130, 177, 255;
  --success-base: 76, 175, 80;
  --info-base: 3, 169, 244;
  --warning-base: 255, 152, 0;
  --error-base: 244, 67, 54;
}

/* RTL support */
html {
  direction: rtl;
  font-family: 'Tajawal', 'Roboto', sans-serif;
  overflow-y: auto;
}

/* App specific styles */
.app-header {
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.app-title {
  font-weight: 600;
  letter-spacing: -0.5px;
}

.app-drawer {
  border-left: none !important;
}

.user-profile {
  margin: 16px 0;
}

.nav-item {
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.active-nav-item {
  background: rgba(var(--primary-base), 0.1);
  color: rgb(var(--primary-base));
  font-weight: 500;
}

.date-chip, .time-chip {
  font-weight: 500;
}

.main-content {
  background-color: var(--v-theme-background);
}

.app-footer {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.app-version {
  opacity: 0.9;
}

/* Fix for RTL layout issues */
.v-navigation-drawer--right {
  border-left: none !important;
}

.v-list-item__prepend {
  margin-right: 0;
  margin-left: 16px;
}

.v-list-item__append {
  margin-left: 0;
  margin-right: 16px;
}

/* Fix main content layout */
.v-main {
  width: 100%;
}

/* Fix app bar spacing */
.v-app-bar-title {
  margin-right: 0 !important;
}

/* Fix footer alignment */
.v-footer {
  justify-content: center;
  text-align: center;
}

/* Header specific styles */
.header-chip-group {
  display: flex;
  align-items: center;
}

.app-bar-icon {
  transition: transform 0.3s ease;
}

.app-bar-icon:hover {
  transform: scale(1.1);
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-icon {
  margin-left: 12px;
  color: white;
}

.drawer-trigger {
  margin-right: 8px;
}
/* انتقالات سلسة بين الصفحات */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* انتقال التمرير للأعلى */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
