<template>
  <div class="dashboard-container">
    <v-card class="mb-6 welcome-card" variant="flat" color="primary">
      <v-card-text>
        <div class="d-flex flex-column flex-md-row align-center justify-space-between">
          <div class="mb-4 mb-md-0">
            <h1 class="text-h4 text-white mb-2">مرحباً بك، أحمد</h1>
            <p class="text-subtitle-1 text-white text-opacity-75 mb-0">لديك {{ stats.alertsCount }} تنبيهات جديدة اليوم</p>
          </div>
          <v-avatar size="120" color="white" class="elevation-4">
            <v-icon size="64" color="primary">mdi-account</v-icon>
          </v-avatar>
        </div>
      </v-card-text>
    </v-card>

    <!-- Stats Cards -->
    <div class="mb-6">
      <h2 class="text-h6 mb-4 dashboard-section-title">ملخص الإحصائيات اليومية</h2>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" variant="elevated" elevation="1">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar class="mr-4" color="primary" variant="tonal" size="48">
                  <v-icon size="24" icon="mdi-account-group"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold">{{ stats.totalStudents }}</div>
                  <div class="text-caption text-medium-emphasis">إجمالي الطلاب</div>
                </div>
              </div>
              <v-progress-linear color="primary" :model-value="100" height="4" class="mt-2"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" variant="elevated" elevation="1">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar class="mr-4" color="success" variant="tonal" size="48">
                  <v-icon size="24" icon="mdi-check-circle"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold">{{ stats.attendanceRate }}%</div>
                  <div class="text-caption text-medium-emphasis">نسبة الحضور</div>
                </div>
              </div>
              <v-progress-linear color="success" :model-value="stats.attendanceRate" height="4" class="mt-2"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" variant="elevated" elevation="1">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar class="mr-4" color="info" variant="tonal" size="48">
                  <v-icon size="24" icon="mdi-clipboard-text"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold">{{ stats.assignmentsCount }}</div>
                  <div class="text-caption text-medium-emphasis">الواجبات النشطة</div>
                </div>
              </div>
              <v-progress-linear color="info" :model-value="stats.assignmentsCount * 10" height="4" class="mt-2"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" variant="elevated" elevation="1">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar class="mr-4" color="warning" variant="tonal" size="48">
                  <v-icon size="24" icon="mdi-alert-circle"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold">{{ stats.alertsCount }}</div>
                  <div class="text-caption text-medium-emphasis">التنبيهات</div>
                </div>
              </div>
              <v-progress-linear color="warning" :model-value="stats.alertsCount * 20" height="4" class="mt-2"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-row>
      <!-- Today's Schedule -->
      <v-col cols="12" md="6">
        <v-card class="mb-6 h-100" variant="flat">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal">
                <v-icon icon="mdi-calendar-today"></v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-h6">الحصص الدراسية اليوم</v-card-title>
          </v-card-item>

          <v-divider></v-divider>

          <v-card-text>
            <v-list v-if="todaySchedule.length > 0" class="schedule-list">
              <v-list-item
                v-for="(schedule, index) in todaySchedule"
                :key="index"
                :class="{ 'schedule-active': index === 0 }"
                class="schedule-item my-2 rounded-lg"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary" variant="tonal" class="mr-3">
                    <span class="text-subtitle-1 font-weight-bold">{{ index + 1 }}</span>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">{{ schedule.subject }}</v-list-item-title>
                <v-list-item-subtitle>{{ schedule.class }} {{ schedule.section }} - {{ schedule.time }}</v-list-item-subtitle>

                <template v-slot:append>
                  <v-chip
                    size="small"
                    variant="outlined"
                    color="primary"
                    class="mr-2"
                  >
                    <v-icon start size="small" icon="mdi-clock-outline"></v-icon>
                    {{ schedule.duration }} دقيقة
                  </v-chip>
                  <v-btn
                    density="comfortable"
                    variant="tonal"
                    color="primary"
                    icon
                    :to="`/grades?class=${schedule.classId}&section=${schedule.sectionId}&subject=${schedule.subjectId}`"
                  >
                    <v-icon>mdi-arrow-left</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>

            <div v-else class="pa-4 text-center">
              <v-icon size="large" color="info" icon="mdi-calendar-blank" class="mb-2"></v-icon>
              <p class="text-body-1">لا توجد دروس لهذا اليوم</p>
              <v-btn color="primary" variant="tonal" prepend-icon="mdi-calendar-edit">
                إضافة درس جديد
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Recent Alerts -->
      <v-col cols="12" md="6">
        <v-card class="mb-6 h-100" variant="flat">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="error" variant="tonal">
                <v-icon icon="mdi-bell"></v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-h6">التنبيهات والإشعارات</v-card-title>
            <template v-slot:append>
              <v-btn variant="text" color="primary" @click="markAllAsRead" v-if="stats.alertsCount > 0">
                تعليم الكل كمقروء
              </v-btn>
              <v-btn variant="text" color="primary">
                مشاهدة الكل
              </v-btn>
            </template>
          </v-card-item>

          <v-divider></v-divider>

          <v-card-text>
            <v-list v-if="recentAlerts.length > 0" class="alerts-list">
              <v-list-item
                v-for="(alert, index) in recentAlerts"
                :key="index"
                class="alert-item my-2 rounded-lg"
                :class="{ 'alert-warning': alert.type === 'warning', 'alert-danger': alert.type === 'error', 'alert-read': alert.is_read }"
                @click="handleAlertClick(alert)"
              >
                <template v-slot:prepend>
                  <v-avatar :color="alert.type === 'warning' ? 'warning' : 'error'" variant="tonal" class="mr-3">
                    <v-icon :icon="alert.type === 'warning' ? 'mdi-alert' : 'mdi-alert-circle'"></v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">{{ alert.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ alert.description }}</v-list-item-subtitle>

                <template v-slot:append>
                  <v-chip
                    :color="alert.type === 'warning' ? 'warning' : 'error'"
                    variant="tonal"
                    size="small"
                  >
                    {{ alert.date }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>

            <div v-else class="py-12 text-center">
              <v-icon size="64" color="success" icon="mdi-check-circle" class="mb-4"></v-icon>
              <h3 class="text-h6 mb-2">كل شيء على ما يرام!</h3>
              <p class="text-body-2 text-medium-emphasis">لا توجد تنبيهات حالية، جميع الطلاب يؤدون بشكل جيد.</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Performance Chart -->
    <v-card class="mb-6" variant="flat">
      <v-card-item>
        <template v-slot:prepend>
          <v-avatar color="primary" variant="tonal">
            <v-icon icon="mdi-chart-line"></v-icon>
          </v-avatar>
        </template>
        <v-card-title class="text-h6">تحليل أداء الطلاب</v-card-title>
        <template v-slot:append>
          <v-select
            v-model="selectedClass"
            :items="['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع']"
            variant="outlined"
            density="compact"
            class="chart-select"
            hide-details
            label="اختر الصف"
          ></v-select>
        </template>
      </v-card-item>

      <v-divider></v-divider>

      <v-card-text class="pt-4">
        <div v-if="hasError" class="text-center my-4">
          <v-alert type="error" variant="tonal" title="خطأ في تحميل البيانات">
            {{ errorMessage }}
            <template v-slot:append>
              <v-btn color="error" variant="tonal" @click="reloadDashboard">إعادة المحاولة</v-btn>
            </template>
          </v-alert>
        </div>

        <div v-else-if="isLoadingStats" class="d-flex justify-center align-center pa-12">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <div v-else>
          <!-- Chart Section -->
          <div class="d-flex justify-space-between align-center flex-wrap mb-4">
            <div class="mb-2 mb-md-0">
              <div class="text-subtitle-2 text-medium-emphasis">متوسط درجات الطلاب</div>
              <div class="text-h5 font-weight-bold">85.4<span class="text-success text-subtitle-1 ms-2">+2.5%</span></div>
            </div>
            <div class="d-flex">
              <v-btn-toggle v-model="chartPeriod" color="primary" mandatory density="comfortable" variant="outlined">
                <v-btn value="week">أسبوع</v-btn>
                <v-btn value="month">شهر</v-btn>
                <v-btn value="year">سنة</v-btn>
              </v-btn-toggle>
            </div>
          </div>

          <!-- Chart Placeholder (will be replaced with actual chart) -->
          <v-sheet height="300" class="d-flex align-center justify-center rounded-lg">
            <div class="chart-container">
              <!-- Mock chart -->
              <div class="d-flex align-end justify-space-around h-100 w-100 pa-4 chart-bars">
                <div v-for="(subject, i) in ['القرآن', 'التوحيد', 'الفقه', 'الحديث', 'اللغة العربية']" :key="i">
                  <div class="chart-bar" :style="{ height: `${70 + Math.floor(Math.random() * 25)}%` }"></div>
                  <div class="text-caption text-center mt-2">{{ subject }}</div>
                </div>
              </div>
              <div class="chart-horizontal-lines">
                <div v-for="n in 5" :key="n" class="chart-line">
                  <span class="chart-line-label">{{ 100 - (n-1)*20 }}%</span>
                </div>
              </div>
            </div>
          </v-sheet>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import NotificationService from '../services/NotificationService'

// Selected class for chart filtering
const selectedClass = ref('الصف الأول')

// Chart period
const chartPeriod = ref('month')

// Stats data
const stats = ref({
  totalStudents: 0,
  attendanceRate: 0,
  assignmentsCount: 0,
  alertsCount: 0
})

// Today's schedule
const todaySchedule = ref([])

// Recent alerts
const recentAlerts = ref([])

// Loading states
const isLoadingStats = ref(false)
const isLoadingSchedule = ref(false)
const isLoadingAlerts = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

// Fetch dashboard data
onMounted(async () => {
  try {
    // Fetch all data in parallel
    await Promise.all([
      fetchStats(),
      fetchTodaySchedule(),
      fetchRecentAlerts()
    ])
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    hasError.value = true

    // Show specific error message based on error type
    if (error.code === 'ECONNABORTED') {
      errorMessage.value = 'انتهت مهلة الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.'
    } else if (error.response) {
      // Server responded with a status code outside of 2xx range
      if (error.response.status === 404) {
        errorMessage.value = 'لم يتم العثور على البيانات المطلوبة. الخدمة غير متوفرة حاليًا.'
      } else if (error.response.status === 401 || error.response.status === 403) {
        errorMessage.value = 'ليس لديك صلاحية للوصول إلى هذه البيانات.'
      } else if (error.response.status >= 500) {
        errorMessage.value = 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.'
      } else {
        errorMessage.value = 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.'
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage.value = 'لا يمكن الوصول إلى الخادم. يرجى التحقق من اتصالك بالإنترنت.'
    } else {
      // Something happened in setting up the request that triggered an error
      errorMessage.value = 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.'
    }

    // Add dummy data as fallback
    addDummyData()
  }
})

// Fetch stats from API
const fetchStats = async () => {
  isLoadingStats.value = true
  try {
    const response = await api.get('/dashboard/stats/')
    stats.value = response.data
    console.log('Stats loaded successfully:', stats.value)
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Fallback to dummy data
    stats.value = {
      totalStudents: 120,
      attendanceRate: 92,
      assignmentsCount: 5,
      alertsCount: 3
    }
  } finally {
    isLoadingStats.value = false
  }
}

// Fetch today's schedule from API
const fetchTodaySchedule = async () => {
  isLoadingSchedule.value = true
  try {
    const response = await api.get('/dashboard/today-schedule/')
    todaySchedule.value = response.data
    console.log('Schedule loaded successfully:', todaySchedule.value)
  } catch (error) {
    console.error('Error fetching today schedule:', error)
    // Fallback to dummy data
    todaySchedule.value = [
      {
        subject: 'القرآن الكريم',
        class: 'الصف الثالث',
        section: 'أ',
        time: '8:00 - 8:45',
        duration: 45,
        classId: 3,
        sectionId: 1,
        subjectId: 1
      },
      {
        subject: 'التوحيد',
        class: 'الصف الثالث',
        section: 'ب',
        time: '9:00 - 9:45',
        duration: 45,
        classId: 3,
        sectionId: 2,
        subjectId: 2
      },
      {
        subject: 'الفقه',
        class: 'الصف الرابع',
        section: 'أ',
        time: '10:00 - 10:45',
        duration: 45,
        classId: 4,
        sectionId: 1,
        subjectId: 3
      },
      {
        subject: 'الحديث',
        class: 'الصف الرابع',
        section: 'ب',
        time: '11:00 - 11:45',
        duration: 45,
        classId: 4,
        sectionId: 2,
        subjectId: 4
      }
    ]
  } finally {
    isLoadingSchedule.value = false
  }
}

// Fetch recent alerts from API
const fetchRecentAlerts = async () => {
  isLoadingAlerts.value = true
  try {
    // استخدام خدمة التنبيهات للحصول على التنبيهات غير المقروءة
    const notifications = await NotificationService.getNotifications()
    console.log('Notifications loaded successfully:', notifications)

    // تحويل التنبيهات إلى التنسيق المطلوب
    recentAlerts.value = notifications.map(notification => ({
      title: notification.title,
      description: notification.message,
      type: notification.type,
      date: formatDate(notification.created_at),
      id: notification.id,
      is_read: notification.is_read,
      link: notification.link
    })).slice(0, 5) // عرض أحدث 5 تنبيهات فقط

    // تحديث عدد التنبيهات في الإحصائيات
    stats.value.alertsCount = notifications.filter(n => !n.is_read).length
  } catch (error) {
    console.error('Error fetching notifications:', error)
    // Fallback to dummy data
    recentAlerts.value = [
      {
        title: 'عدم حضور طالب',
        description: 'الطالب محمد أحمد غائب لليوم الثالث على التوالي',
        type: 'warning',
        date: 'اليوم'
      },
      {
        title: 'درجات منخفضة',
        description: 'خمسة طلاب حصلوا على درجات أقل من 60% في مادة التوحيد',
        type: 'error',
        date: 'أمس'
      },
      {
        title: 'موعد تسليم الواجب',
        description: 'يجب تسليم واجب مادة القرآن للصف الثالث غداً',
        type: 'warning',
        date: '30/07/2023'
      }
    ]
  } finally {
    isLoadingAlerts.value = false
  }
}

// تعليم جميع التنبيهات كمقروءة
const markAllAsRead = async () => {
  try {
    await NotificationService.markAllAsRead()
    console.log('Marked all notifications as read')

    // تحديث حالة التنبيهات في الواجهة الأمامية
    recentAlerts.value.forEach(alert => {
      alert.is_read = true
    })

    // تحديث عدد التنبيهات غير المقروءة
    stats.value.alertsCount = 0
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

// معالجة النقر على التنبيه
const handleAlertClick = async (alert) => {
  try {
    // إذا لم يكن التنبيه مقروءً، قم بتعليمه كمقروء
    if (!alert.is_read && alert.id) {
      await NotificationService.markAsRead(alert.id)
      console.log(`Marked notification ${alert.id} as read`)

      // تحديث حالة التنبيه في الواجهة الأمامية
      alert.is_read = true

      // تحديث عدد التنبيهات غير المقروءة
      stats.value.alertsCount = Math.max(0, stats.value.alertsCount - 1)
    }

    // إذا كان هناك رابط، انتقل إليه
    if (alert.link) {
      window.location.href = alert.link
    }
  } catch (error) {
    console.error('Error handling alert click:', error)
  }
}

// تنسيق التاريخ
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  // إذا كان التاريخ اليوم
  if (date.toDateString() === now.toDateString()) {
    return 'اليوم'
  }

  // إذا كان التاريخ أمس
  if (date.toDateString() === yesterday.toDateString()) {
    return 'أمس'
  }

  // غير ذلك، عرض التاريخ بالتنسيق العربي
  return date.toLocaleDateString('ar-SA')
}

// Add dummy data if API fails
const addDummyData = () => {
  stats.value = {
    totalStudents: 120,
    attendanceRate: 92,
    assignmentsCount: 5,
    alertsCount: 3
  }

  todaySchedule.value = [
    {
      subject: 'القرآن الكريم',
      class: 'الصف الثالث',
      section: 'أ',
      time: '8:00 - 8:45',
      duration: 45,
      classId: 3,
      sectionId: 1,
      subjectId: 1
    },
    {
      subject: 'التوحيد',
      class: 'الصف الثالث',
      section: 'ب',
      time: '9:00 - 9:45',
      duration: 45,
      classId: 3,
      sectionId: 2,
      subjectId: 2
    },
    {
      subject: 'الفقه',
      class: 'الصف الرابع',
      section: 'أ',
      time: '10:00 - 10:45',
      duration: 45,
      classId: 4,
      sectionId: 1,
      subjectId: 3
    },
    {
      subject: 'الحديث',
      class: 'الصف الرابع',
      section: 'ب',
      time: '11:00 - 11:45',
      duration: 45,
      classId: 4,
      sectionId: 2,
      subjectId: 4
    }
  ]

  recentAlerts.value = [
    {
      title: 'عدم حضور طالب',
      description: 'الطالب محمد أحمد غائب لليوم الثالث على التوالي',
      type: 'warning',
      date: 'اليوم'
    },
    {
      title: 'درجات منخفضة',
      description: 'خمسة طلاب حصلوا على درجات أقل من 60% في مادة التوحيد',
      type: 'error',
      date: 'أمس'
    },
    {
      title: 'موعد تسليم الواجب',
      description: 'يجب تسليم واجب مادة القرآن للصف الثالث غداً',
      type: 'warning',
      date: '30/07/2023'
    }
  ]
}

// Reload dashboard data
const reloadDashboard = async () => {
  hasError.value = false
  errorMessage.value = ''
  try {
    await Promise.all([
      fetchStats(),
      fetchTodaySchedule(),
      fetchRecentAlerts()
    ])
  } catch (error) {
    console.error('Error reloading dashboard data:', error)
    hasError.value = true
    errorMessage.value = 'حدث خطأ أثناء إعادة تحميل البيانات. يرجى المحاولة مرة أخرى.'
    addDummyData()
  }
}
</script>

<style scoped>
.dashboard-container {
  padding-bottom: 16px;
}

.welcome-card {
  border-radius: 12px;
}

.dashboard-section-title {
  position: relative;
  padding-left: 12px;
  padding-right: 0;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.dashboard-section-title::before {
  content: "";
  position: absolute;
  left: 0;
  right: auto;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: rgb(var(--v-theme-primary));
  border-radius: 4px;
}

.stat-card {
  height: 100%;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
}

.schedule-item, .alert-item {
  transition: background-color 0.3s ease;
  margin-bottom: 8px;
}

.schedule-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.schedule-active {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-left: 3px solid rgb(var(--v-theme-primary));
  border-right: none;
}

.alert-item:hover {
  background-color: rgba(var(--v-theme-error), 0.05);
}

.alert-warning {
  border-left: 3px solid rgb(var(--v-theme-warning));
  border-right: none;
}

.alert-danger {
  border-left: 3px solid rgb(var(--v-theme-error));
  border-right: none;
}

.alert-read {
  opacity: 0.7;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
}

.alert-read:hover {
  opacity: 1;
}

.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-bars {
  position: relative;
  z-index: 2;
}

.chart-bar {
  width: 40px;
  background: linear-gradient(to top, rgba(var(--v-theme-primary), 0.7), rgba(var(--v-theme-primary), 0.3));
  border-radius: 8px 8px 0 0;
  position: relative;
  transition: height 0.5s ease;
}

.chart-horizontal-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  padding: 16px;
}

.chart-line {
  position: relative;
  border-bottom: 1px dashed rgba(var(--v-theme-on-surface), 0.1);
  height: 20%;
}

.chart-line-label {
  position: absolute;
  right: 0;
  left: auto;
  top: -10px;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.chart-select {
  max-width: 180px;
}

@media (max-width: 600px) {
  .chart-bar {
    width: 24px;
  }
}
</style>
