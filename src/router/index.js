import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { title: 'لوحة التحكم' }
    },
    {
      path: '/students',
      name: 'students',
      component: () => import('../views/StudentsView.vue'),
      meta: { title: 'الطلاب' }
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('../views/ScheduleView.vue'),
      meta: { title: 'الجدول الدراسي' }
    },
    {
      path: '/grades',
      name: 'grades',
      component: () => import('../views/GradesView.vue'),
      meta: { title: 'الدرجات' }
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/ReportsView.vue'),
      meta: { title: 'التقارير' }
    },
    {
      path: '/random-picker',
      name: 'random-picker',
      component: () => import('../views/RandomPickerView.vue'),
      meta: { title: 'الاختيار العشوائي' }
    },
    {
      path: '/whiteboard',
      name: 'whiteboard',
      component: () => import('../views/WhiteboardView.vue'),
      meta: { title: 'السبورة البيضاء' }
    },
    {
      path: '/quran',
      name: 'quran',
      component: () => import('../views/QuranView.vue'),
      meta: { title: 'القرآن' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { title: 'الإعدادات' }
    },
    {
      path: '/classes-subjects',
      name: 'classes-subjects',
      component: () => import('../views/ClassesAndSubjectsView.vue'),
      meta: { title: 'إدارة الصفوف والفصول والمواد' }
    }
  ]
})

// Update document title based on route meta
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - نظام إدارة التعليم` : 'نظام إدارة التعليم'
  next()
})

export default router
