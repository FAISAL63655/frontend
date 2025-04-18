import { createRouter, createWebHistory } from 'vue-router'

// تعريف المسارات مع التحميل الكسول لتحسين الأداء
const routes = [

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
    },
    {
      path: '/champions',
      name: 'champions',
      component: () => import('../views/ChampionsView.vue'),
      meta: { title: 'الفرسان' }
    }
]

// إنشاء موجه مع سلوك التمرير المحسن
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // تحسين سلوك التمرير لتجربة مستخدم أفضل
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      // العودة إلى الموضع المحفوظ عند استخدام زر الرجوع
      return savedPosition
    } else if (to.hash) {
      // التمرير إلى العنصر المحدد بواسطة الهاش
      return { el: to.hash, behavior: 'smooth' }
    } else {
      // التمرير إلى أعلى الصفحة
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// تحديث عنوان المستند بناءً على ميتا المسار
router.beforeEach((to, from, next) => {
  // تعيين عنوان الصفحة
  document.title = to.meta.title ? `${to.meta.title} - نظام إدارة التعليم` : 'نظام إدارة التعليم'

  // تنفيذ التحميل المسبق للصفحات المرتبطة
  if (to.name === 'dashboard') {
    // تحميل مسبق للصفحات الأكثر استخدامًا عند الوصول إلى لوحة التحكم
    import('../views/StudentsView.vue')
    import('../views/GradesView.vue')
  } else if (to.name === 'students') {
    // تحميل مسبق لصفحات ذات صلة بالطلاب
    import('../views/GradesView.vue')
    import('../views/ClassesAndSubjectsView.vue')
  }

  next()
})

export default router
