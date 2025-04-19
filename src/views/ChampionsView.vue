<template>
  <div>
    <v-container fluid>
      <!-- Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card color="primary" class="text-white">
            <v-card-text class="d-flex flex-column flex-md-row justify-space-between align-center">
              <div class="mb-4 mb-md-0">
                <h1 class="text-h4 text-white mb-2">الفرسان</h1>
                <p class="text-subtitle-1 text-white text-opacity-75 mb-0">قائمة الطلاب المتميزين في مختلف المجالات</p>
              </div>
              <v-btn color="white" variant="outlined" @click="fetchAllData" class="d-none d-md-flex">
                <v-icon start>mdi-refresh</v-icon>
                تحديث البيانات
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Champions Cards -->
      <v-row>
        <!-- Top Attendance Students -->
        <v-col cols="12" md="6" lg="4">
          <champions-card
            title="الأكثر حضوراً"
            icon="mdi-calendar-check"
            icon-color="success"
            empty-icon="mdi-calendar-remove"
            empty-text="لا توجد بيانات حضور متاحة"
            :items="topAttendanceStudents"
            value-field="attendance_rate"
            value-suffix="%"
            secondary-value-field="present_days"
            secondary-value-prefix="حضور "
            secondary-value-suffix=" يوم"
            :is-loading="isLoadingAttendance"
            :has-error="hasErrorAttendance"
            :error-message="errorMessageAttendance"
            @refresh="fetchTopAttendanceStudents"
          />
        </v-col>

        <!-- Top Assignment Students -->
        <v-col cols="12" md="6" lg="4">
          <champions-card
            title="الأكثر تسليماً للواجبات"
            icon="mdi-book-check"
            icon-color="info"
            empty-icon="mdi-book-remove"
            empty-text="لا توجد بيانات واجبات متاحة"
            :items="topAssignmentStudents"
            value-field="submission_rate"
            value-suffix="%"
            secondary-value-field="submitted_assignments"
            secondary-value-prefix="تسليم "
            secondary-value-suffix=" واجب"
            :is-loading="isLoadingAssignments"
            :has-error="hasErrorAssignments"
            :error-message="errorMessageAssignments"
            @refresh="fetchTopAssignmentStudents"
          />
        </v-col>

        <!-- Top Positive Notes Students -->
        <v-col cols="12" md="6" lg="4">
          <champions-card
            title="الأكثر ملاحظات إيجابية"
            icon="mdi-thumb-up"
            icon-color="primary"
            empty-icon="mdi-thumb-up-outline"
            empty-text="لا توجد ملاحظات إيجابية متاحة"
            :items="topPositiveNotesStudents"
            value-field="positive_notes_count"
            value-suffix=" ملاحظة"
            :is-loading="isLoadingPositiveNotes"
            :has-error="hasErrorPositiveNotes"
            :error-message="errorMessagePositiveNotes"
            @refresh="fetchTopPositiveNotesStudents"
          />
        </v-col>

        <!-- Top Grades Students -->
        <v-col cols="12" md="6" lg="4">
          <champions-card
            title="الأعلى درجات"
            icon="mdi-school"
            icon-color="warning"
            empty-icon="mdi-school-outline"
            empty-text="لا توجد بيانات درجات متاحة"
            :items="topGradesStudents"
            value-field="avg_grade"
            value-suffix="%"
            secondary-value-field="grade_count"
            secondary-value-prefix="في "
            secondary-value-suffix=" مادة"
            :is-loading="isLoadingGrades"
            :has-error="hasErrorGrades"
            :error-message="errorMessageGrades"
            @refresh="fetchTopGradesStudents"
          />
        </v-col>

        <!-- Top Quran Students -->
        <v-col cols="12" md="6" lg="4">
          <champions-card
            title="الأعلى في القرآن"
            icon="mdi-book-open-variant"
            icon-color="success"
            empty-icon="mdi-book-open-outline"
            empty-text="لا توجد بيانات قرآن متاحة"
            :items="topQuranStudents"
            value-field="avg_quran_grade"
            value-suffix="%"
            secondary-value-field="quran_grade_count"
            secondary-value-prefix="في "
            secondary-value-suffix=" اختبار"
            :is-loading="isLoadingQuran"
            :has-error="hasErrorQuran"
            :error-message="errorMessageQuran"
            @refresh="fetchTopQuranStudents"
          />
        </v-col>

        <!-- Most Improved Students -->
        <v-col cols="12" md="6" lg="4">
          <champions-card
            title="الأكثر تحسناً"
            icon="mdi-trending-up"
            icon-color="error"
            empty-icon="mdi-trending-neutral"
            empty-text="لا توجد بيانات تحسن متاحة"
            :items="mostImprovedStudents"
            value-field="improvement"
            value-prefix="+"
            value-suffix="%"
            secondary-value-field="late_avg"
            secondary-value-prefix="من "
            secondary-value-suffix="%"
            :is-loading="isLoadingImproved"
            :has-error="hasErrorImproved"
            :error-message="errorMessageImproved"
            @refresh="fetchMostImprovedStudents"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/apiConfig'
import ChampionsCard from '@/components/champions/ChampionsCard.vue'

// Top Attendance Students
const topAttendanceStudents = ref([])
const isLoadingAttendance = ref(false)
const hasErrorAttendance = ref(false)
const errorMessageAttendance = ref('')

// Top Assignment Students
const topAssignmentStudents = ref([])
const isLoadingAssignments = ref(false)
const hasErrorAssignments = ref(false)
const errorMessageAssignments = ref('')

// Top Positive Notes Students
const topPositiveNotesStudents = ref([])
const isLoadingPositiveNotes = ref(false)
const hasErrorPositiveNotes = ref(false)
const errorMessagePositiveNotes = ref('')

// Top Grades Students
const topGradesStudents = ref([])
const isLoadingGrades = ref(false)
const hasErrorGrades = ref(false)
const errorMessageGrades = ref('')

// Top Quran Students
const topQuranStudents = ref([])
const isLoadingQuran = ref(false)
const hasErrorQuran = ref(false)
const errorMessageQuran = ref('')

// Most Improved Students
const mostImprovedStudents = ref([])
const isLoadingImproved = ref(false)
const hasErrorImproved = ref(false)
const errorMessageImproved = ref('')

onMounted(() => {
  fetchAllData()
})

// Fetch all data
const fetchAllData = async () => {
  await Promise.all([
    fetchTopAttendanceStudents(),
    fetchTopAssignmentStudents(),
    fetchTopPositiveNotesStudents(),
    fetchTopGradesStudents(),
    fetchTopQuranStudents(),
    fetchMostImprovedStudents()
  ])
}

// Fetch top attendance students
const fetchTopAttendanceStudents = async () => {
  isLoadingAttendance.value = true
  hasErrorAttendance.value = false
  
  try {
    const response = await api.get('/champions/top-attendance/')
    if (response.data && response.data.length > 0) {
      topAttendanceStudents.value = response.data
      console.log('Top attendance students loaded successfully:', topAttendanceStudents.value)
    } else {
      console.log('No top attendance students data returned, using fallback data')
      // Fallback data
      topAttendanceStudents.value = [
        { id: 1, name: 'أحمد محمد', class: 'الصف الثالث', section: 'أ', attendance_rate: 98.5, present_days: 65, total_days: 66, image: null },
        { id: 2, name: 'عبدالله خالد', class: 'الصف الرابع', section: 'ب', attendance_rate: 96.8, present_days: 60, total_days: 62, image: null },
        { id: 3, name: 'محمد علي', class: 'الصف الثالث', section: 'أ', attendance_rate: 95.2, present_days: 59, total_days: 62, image: null },
        { id: 4, name: 'سعد عبدالرحمن', class: 'الصف الرابع', section: 'أ', attendance_rate: 93.5, present_days: 58, total_days: 62, image: null },
        { id: 5, name: 'فهد سلطان', class: 'الصف الثالث', section: 'ب', attendance_rate: 91.9, present_days: 57, total_days: 62, image: null }
      ]
    }
  } catch (error) {
    console.error('Error fetching top attendance students:', error)
    hasErrorAttendance.value = true
    errorMessageAttendance.value = 'حدث خطأ أثناء تحميل بيانات الحضور. يرجى المحاولة مرة أخرى.'
  } finally {
    isLoadingAttendance.value = false
  }
}

// Fetch top assignment students
const fetchTopAssignmentStudents = async () => {
  isLoadingAssignments.value = true
  hasErrorAssignments.value = false
  
  try {
    const response = await api.get('/champions/top-assignments/')
    if (response.data && response.data.length > 0) {
      topAssignmentStudents.value = response.data
      console.log('Top assignment students loaded successfully:', topAssignmentStudents.value)
    } else {
      console.log('No top assignment students data returned, using fallback data')
      // Fallback data
      topAssignmentStudents.value = [
        { id: 1, name: 'أحمد محمد', class: 'الصف الثالث', section: 'أ', submission_rate: 100, submitted_assignments: 15, total_assignments: 15, image: null },
        { id: 2, name: 'عبدالله خالد', class: 'الصف الرابع', section: 'ب', submission_rate: 93.3, submitted_assignments: 14, total_assignments: 15, image: null },
        { id: 3, name: 'محمد علي', class: 'الصف الثالث', section: 'أ', submission_rate: 86.7, submitted_assignments: 13, total_assignments: 15, image: null },
        { id: 4, name: 'سعد عبدالرحمن', class: 'الصف الرابع', section: 'أ', submission_rate: 80, submitted_assignments: 12, total_assignments: 15, image: null },
        { id: 5, name: 'فهد سلطان', class: 'الصف الثالث', section: 'ب', submission_rate: 73.3, submitted_assignments: 11, total_assignments: 15, image: null }
      ]
    }
  } catch (error) {
    console.error('Error fetching top assignment students:', error)
    hasErrorAssignments.value = true
    errorMessageAssignments.value = 'حدث خطأ أثناء تحميل بيانات الواجبات. يرجى المحاولة مرة أخرى.'
  } finally {
    isLoadingAssignments.value = false
  }
}

// Fetch top positive notes students
const fetchTopPositiveNotesStudents = async () => {
  isLoadingPositiveNotes.value = true
  hasErrorPositiveNotes.value = false
  
  try {
    const response = await api.get('/champions/top-positive-notes/')
    if (response.data && response.data.length > 0) {
      topPositiveNotesStudents.value = response.data
      console.log('Top positive notes students loaded successfully:', topPositiveNotesStudents.value)
    } else {
      console.log('No top positive notes students data returned, using fallback data')
      // Fallback data
      topPositiveNotesStudents.value = [
        { id: 1, name: 'أحمد محمد', class: 'الصف الثالث', section: 'أ', positive_notes_count: 12, image: null },
        { id: 2, name: 'عبدالله خالد', class: 'الصف الرابع', section: 'ب', positive_notes_count: 10, image: null },
        { id: 3, name: 'محمد علي', class: 'الصف الثالث', section: 'أ', positive_notes_count: 8, image: null },
        { id: 4, name: 'سعد عبدالرحمن', class: 'الصف الرابع', section: 'أ', positive_notes_count: 7, image: null },
        { id: 5, name: 'فهد سلطان', class: 'الصف الثالث', section: 'ب', positive_notes_count: 5, image: null }
      ]
    }
  } catch (error) {
    console.error('Error fetching top positive notes students:', error)
    hasErrorPositiveNotes.value = true
    errorMessagePositiveNotes.value = 'حدث خطأ أثناء تحميل بيانات الملاحظات الإيجابية. يرجى المحاولة مرة أخرى.'
  } finally {
    isLoadingPositiveNotes.value = false
  }
}

// Fetch top grades students
const fetchTopGradesStudents = async () => {
  isLoadingGrades.value = true
  hasErrorGrades.value = false
  
  try {
    const response = await api.get('/champions/top-grades/')
    if (response.data && response.data.length > 0) {
      topGradesStudents.value = response.data
      console.log('Top grades students loaded successfully:', topGradesStudents.value)
    } else {
      console.log('No top grades students data returned, using fallback data')
      // Fallback data
      topGradesStudents.value = [
        { id: 1, name: 'أحمد محمد', class: 'الصف الثالث', section: 'أ', avg_grade: 95.5, grade_count: 10, image: null },
        { id: 2, name: 'عبدالله خالد', class: 'الصف الرابع', section: 'ب', avg_grade: 92.3, grade_count: 8, image: null },
        { id: 3, name: 'محمد علي', class: 'الصف الثالث', section: 'أ', avg_grade: 90.1, grade_count: 12, image: null },
        { id: 4, name: 'سعد عبدالرحمن', class: 'الصف الرابع', section: 'أ', avg_grade: 88.7, grade_count: 9, image: null },
        { id: 5, name: 'فهد سلطان', class: 'الصف الثالث', section: 'ب', avg_grade: 87.2, grade_count: 11, image: null }
      ]
    }
  } catch (error) {
    console.error('Error fetching top grades students:', error)
    hasErrorGrades.value = true
    errorMessageGrades.value = 'حدث خطأ أثناء تحميل بيانات الدرجات. يرجى المحاولة مرة أخرى.'
  } finally {
    isLoadingGrades.value = false
  }
}

// Fetch top Quran students
const fetchTopQuranStudents = async () => {
  isLoadingQuran.value = true
  hasErrorQuran.value = false
  
  try {
    const response = await api.get('/champions/top-quran/')
    if (response.data && response.data.length > 0) {
      topQuranStudents.value = response.data
      console.log('Top Quran students loaded successfully:', topQuranStudents.value)
    } else {
      console.log('No top Quran students data returned, using fallback data')
      // Fallback data
      topQuranStudents.value = [
        { id: 1, name: 'أحمد محمد', class: 'الصف الثالث', section: 'أ', avg_quran_grade: 98.5, quran_grade_count: 5, image: null },
        { id: 2, name: 'عبدالله خالد', class: 'الصف الرابع', section: 'ب', avg_quran_grade: 96.0, quran_grade_count: 5, image: null },
        { id: 3, name: 'محمد علي', class: 'الصف الثالث', section: 'أ', avg_quran_grade: 94.5, quran_grade_count: 5, image: null },
        { id: 4, name: 'سعد عبدالرحمن', class: 'الصف الرابع', section: 'أ', avg_quran_grade: 92.0, quran_grade_count: 5, image: null },
        { id: 5, name: 'فهد سلطان', class: 'الصف الثالث', section: 'ب', avg_quran_grade: 90.5, quran_grade_count: 5, image: null }
      ]
    }
  } catch (error) {
    console.error('Error fetching top Quran students:', error)
    hasErrorQuran.value = true
    errorMessageQuran.value = 'حدث خطأ أثناء تحميل بيانات القرآن. يرجى المحاولة مرة أخرى.'
  } finally {
    isLoadingQuran.value = false
  }
}

// Fetch most improved students
const fetchMostImprovedStudents = async () => {
  isLoadingImproved.value = true
  hasErrorImproved.value = false
  
  try {
    const response = await api.get('/champions/most-improved/')
    if (response.data && response.data.length > 0) {
      mostImprovedStudents.value = response.data
      console.log('Most improved students loaded successfully:', mostImprovedStudents.value)
    } else {
      console.log('No most improved students data returned, using fallback data')
      // Fallback data
      mostImprovedStudents.value = [
        { id: 1, name: 'أحمد محمد', class: 'الصف الثالث', section: 'أ', improvement: 15.5, early_avg: 75.0, late_avg: 90.5, image: null },
        { id: 2, name: 'عبدالله خالد', class: 'الصف الرابع', section: 'ب', improvement: 12.3, early_avg: 70.0, late_avg: 82.3, image: null },
        { id: 3, name: 'محمد علي', class: 'الصف الثالث', section: 'أ', improvement: 10.1, early_avg: 72.0, late_avg: 82.1, image: null },
        { id: 4, name: 'سعد عبدالرحمن', class: 'الصف الرابع', section: 'أ', improvement: 8.7, early_avg: 68.0, late_avg: 76.7, image: null },
        { id: 5, name: 'فهد سلطان', class: 'الصف الثالث', section: 'ب', improvement: 7.2, early_avg: 65.0, late_avg: 72.2, image: null }
      ]
    }
  } catch (error) {
    console.error('Error fetching most improved students:', error)
    hasErrorImproved.value = true
    errorMessageImproved.value = 'حدث خطأ أثناء تحميل بيانات التحسن. يرجى المحاولة مرة أخرى.'
  } finally {
    isLoadingImproved.value = false
  }
}
</script>

<style scoped>
/* Add any additional styles here */
</style>
