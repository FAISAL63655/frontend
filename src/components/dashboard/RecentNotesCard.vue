<template>
  <v-card class="mb-6" variant="flat">
    <v-card-item>
      <template v-slot:prepend>
        <v-avatar color="warning" variant="tonal">
          <v-icon icon="mdi-note-text"></v-icon>
        </v-avatar>
      </template>
      <v-card-title class="text-h6">آخر الملاحظات</v-card-title>
      <template v-slot:append>
        <v-btn variant="text" color="primary" to="/notes">
          مشاهدة الكل
        </v-btn>
      </template>
    </v-card-item>

    <v-divider></v-divider>

    <v-card-text>
      <div v-if="isLoading" class="d-flex justify-center align-center pa-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <div v-else-if="hasError" class="text-center my-4">
        <v-alert type="error" variant="tonal" title="خطأ في تحميل البيانات">
          {{ errorMessage }}
          <template v-slot:append>
            <v-btn color="error" variant="tonal" @click="fetchRecentNotes">إعادة المحاولة</v-btn>
          </template>
        </v-alert>
      </div>

      <div v-else-if="recentNotes.length === 0" class="text-center pa-4">
        <v-icon size="large" color="info" icon="mdi-note-off" class="mb-2"></v-icon>
        <p class="text-body-1">لا توجد ملاحظات متاحة</p>
      </div>

      <v-list v-else>
        <v-list-item
          v-for="note in recentNotes"
          :key="note.id"
          :class="{ 'note-positive': note.type === 'positive', 'note-negative': note.type === 'negative' }"
          class="my-2 rounded-lg"
        >
          <template v-slot:prepend>
            <v-avatar :color="note.type === 'positive' ? 'success' : 'error'" variant="tonal" class="mr-3">
              <v-icon :icon="note.type === 'positive' ? 'mdi-thumb-up' : 'mdi-thumb-down'"></v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium">{{ note.student_name }}</v-list-item-title>
          <v-list-item-subtitle>{{ note.content }}</v-list-item-subtitle>

          <template v-slot:append>
            <div class="d-flex flex-column align-end">
              <v-chip
                size="small"
                :color="note.type === 'positive' ? 'success' : 'error'"
                variant="tonal"
              >
                {{ note.type_display }}
              </v-chip>
              <div class="text-caption mt-1">{{ formatDate(note.date) }}</div>
              <div class="text-caption text-medium-emphasis">{{ note.subject }}</div>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardService from '../../services/DashboardService'

const recentNotes = ref([])
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

onMounted(() => {
  fetchRecentNotes()
})

const fetchRecentNotes = async () => {
  isLoading.value = true
  hasError.value = false

  try {
    const data = await DashboardService.getRecentNotes()
    if (data && data.length > 0) {
      recentNotes.value = data
      console.log('Recent notes loaded successfully:', recentNotes.value)
    } else {
      console.log('No recent notes data returned, using fallback data')
      // Fallback data
      recentNotes.value = [
        {
          id: 1,
          student_name: 'أحمد محمد',
          student_id: 1,
          content: 'متفوق في حفظ القرآن الكريم',
          type: 'positive',
          type_display: 'إيجابية',
          date: '2023-08-10',
          subject: 'القرآن الكريم'
        },
        {
          id: 2,
          student_name: 'عبدالله خالد',
          student_id: 2,
          content: 'لم يقم بحل الواجب المنزلي',
          type: 'negative',
          type_display: 'سلبية',
          date: '2023-08-09',
          subject: 'التوحيد'
        },
        {
          id: 3,
          student_name: 'محمد علي',
          student_id: 3,
          content: 'مشارك بشكل فعال في الفصل',
          type: 'positive',
          type_display: 'إيجابية',
          date: '2023-08-08',
          subject: 'الفقه'
        },
        {
          id: 4,
          student_name: 'سعد عبدالرحمن',
          student_id: 4,
          content: 'متأخر عن الحصة الدراسية',
          type: 'negative',
          type_display: 'سلبية',
          date: '2023-08-07',
          subject: 'الحديث'
        },
        {
          id: 5,
          student_name: 'فهد سلطان',
          student_id: 5,
          content: 'متعاون مع زملائه في الأنشطة الجماعية',
          type: 'positive',
          type_display: 'إيجابية',
          date: '2023-08-06',
          subject: 'اللغة العربية'
        }
      ]
    }
  } catch (error) {
    console.error('Error fetching recent notes:', error)
    hasError.value = true
    errorMessage.value = 'حدث خطأ أثناء تحميل الملاحظات. يرجى المحاولة مرة أخرى.'

    // Fallback data
    recentNotes.value = [
      {
        id: 1,
        student_name: 'أحمد محمد',
        student_id: 1,
        content: 'متفوق في حفظ القرآن الكريم',
        type: 'positive',
        type_display: 'إيجابية',
        date: '2023-08-10',
        subject: 'القرآن الكريم'
      },
      {
        id: 2,
        student_name: 'عبدالله خالد',
        student_id: 2,
        content: 'لم يقم بحل الواجب المنزلي',
        type: 'negative',
        type_display: 'سلبية',
        date: '2023-08-09',
        subject: 'التوحيد'
      },
      {
        id: 3,
        student_name: 'محمد علي',
        student_id: 3,
        content: 'مشارك بشكل فعال في الفصل',
        type: 'positive',
        type_display: 'إيجابية',
        date: '2023-08-08',
        subject: 'الفقه'
      }
    ]
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  // If date is today
  if (date.toDateString() === now.toDateString()) {
    return 'اليوم'
  }

  // If date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'أمس'
  }

  // Otherwise, format the date
  return date.toLocaleDateString('ar-SA')
}
</script>

<style scoped>
.note-positive {
  border-right: 3px solid rgb(var(--v-theme-success));
}

.note-negative {
  border-right: 3px solid rgb(var(--v-theme-error));
}
</style>
