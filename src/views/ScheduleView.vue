<template>
  <div class="schedule-page pa-4" dir="rtl">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <!-- جزء البطاقة الرئيسية العلوية -->
          <v-card class="schedule-header-card mb-4 elevation-2">
            <!-- عنوان الصفحة والفلاتر -->
            <v-toolbar color="primary" flat class="px-4 rounded-t">
              <v-toolbar-title class="text-white d-flex align-center">
                <v-icon size="large" class="ms-2">mdi-calendar-month</v-icon>
                <span class="text-h5 font-weight-bold">الجدول الدراسي</span>
              </v-toolbar-title>
              <v-spacer></v-spacer>

              <v-btn variant="tonal" color="white" prepend-icon="mdi-filter-variant" class="ms-2" @click="showFilters = !showFilters">
                الفلاتر
                <v-icon end>{{ showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </v-toolbar>

            <!-- قسم الفلاتر -->
            <v-expand-transition>
              <div v-if="showFilters" class="pa-4 bg-primary-lighten-5">
                <v-row align="center">
                  <v-col cols="12" sm="6" md="4">
                    <v-select
                      v-model="selectedClass"
                      :items="classes"
                      item-title="name"
                      item-value="id"
                      label="الصف"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-school"
                      hide-details
                      bg-color="white"
                      class="rounded-lg"
                      @update:model-value="fetchSchedule"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-select
                      v-model="selectedSection"
                      :items="sections"
                      item-title="name"
                      item-value="id"
                      label="الفصل"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-home"
                      hide-details
                      bg-color="white"
                      class="rounded-lg"
                      @update:model-value="fetchSchedule"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="12" md="4">
                    <v-text-field
                      type="date"
                      label="التاريخ"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar"
                      hide-details
                      bg-color="white"
                      class="rounded-lg"
                      :model-value="new Date().toISOString().substr(0, 10)"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>

            <!-- معلومات التاريخ والفترة -->
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12">
                  <div class="d-flex align-center flex-wrap">
                    <v-chip class="ma-2" color="info" prepend-icon="mdi-calendar" elevation="1">
                      {{ new Date().toLocaleDateString('ar-SA') }}
                    </v-chip>
                    <v-chip class="ma-2" color="success" prepend-icon="mdi-account-group" elevation="1">
                      {{ selectedClass && classes.find(c => c.id === selectedClass)?.name || 'الكل' }} -
                      {{ selectedSection && sections.find(s => s.id === selectedSection)?.name || 'الكل' }}
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">

    <!-- جدول الحصص -->
    <v-card class="student-grades-table-card elevation-2">
      <v-toolbar color="blue-lighten-5" density="compact" class="rounded-t">
        <v-toolbar-title>
          <div class="d-flex align-center">
            <v-icon start class="me-2">mdi-calendar-week</v-icon>
            <span>جدول الحصص</span>
          </div>
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-4">
        <div class="schedule-container">
          <table class="schedule-table">
            <thead>
              <tr>
                <th class="text-center table-header period-header">
                  <div class="d-flex justify-center align-center">
                    <v-icon icon="mdi-timetable" class="me-2" color="primary"></v-icon>
                    <span>الحصة / اليوم</span>
                  </div>
                </th>
                <th
                  v-for="day in days"
                  :key="day.value"
                  class="text-center table-header day-header"
                >
                  <v-chip variant="flat" color="primary" class="font-weight-bold px-3 py-2 day-chip">
                    <v-icon start icon="mdi-calendar-week" size="small"></v-icon>
                    {{ day.title }}
                  </v-chip>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="period in periods" :key="period.value">
                <td class="text-center font-weight-bold period-cell">
                  <v-chip variant="flat" color="secondary" class="font-weight-bold period-chip">
                    <v-icon start icon="mdi-clock-outline" size="small"></v-icon>
                    {{ period.title }}
                  </v-chip>
                </td>
                <td
                  v-for="day in days"
                  :key="`${period.value}-${day.value}`"
                  class="text-center schedule-cell"
                  @click="openScheduleDialog(day.value, period.value)"
                >
                  <v-card
                    v-if="getScheduleItem(day.value, period.value)"
                    :color="getScheduleColor(getScheduleItem(day.value, period.value))"
                    class="pa-3 schedule-item-card"
                    elevation="2"
                    rounded="lg"
                  >
                    <div class="text-subtitle-1 font-weight-bold white--text">
                      {{ getScheduleItem(day.value, period.value).subject }}
                    </div>
                    <div class="text-caption white--text">
                      {{ getScheduleItem(day.value, period.value).class }} {{ getScheduleItem(day.value, period.value).section }}
                    </div>
                  </v-card>
                  <div v-else class="empty-cell">
                    <v-icon icon="mdi-plus" class="add-icon"></v-icon>
                    <div class="text-caption text-grey mt-1">إضافة حصة</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Schedule Dialog -->
    <v-dialog v-model="showScheduleDialog" max-width="500px" dir="rtl">
      <v-card>
        <v-card-title>
          {{ isEditMode ? 'تعديل الحصة' : 'إضافة حصة جديدة' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="scheduleForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="scheduleForm.day"
                  :items="days"
                  item-title="title"
                  item-value="value"
                  label="اليوم"
                  name="day"
                  disabled
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar-week"
                  density="comfortable"
                  bg-color="grey-lighten-4"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="scheduleForm.period"
                  :items="periods"
                  item-title="title"
                  item-value="value"
                  label="الحصة"
                  name="period"
                  disabled
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-clock-outline"
                  density="comfortable"
                  bg-color="grey-lighten-4"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="scheduleForm.class_id"
                  :items="classes"
                  item-title="name"
                  item-value="id"
                  label="الصف"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-school"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="scheduleForm.section_id"
                  :items="sections"
                  item-title="name"
                  item-value="id"
                  label="الفصل"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-home"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="scheduleForm.subject_id"
                  :items="subjects"
                  item-title="name"
                  item-value="id"
                  label="المادة"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-book-open-variant"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-btn color="grey" variant="text" @click="showScheduleDialog = false">
            <v-icon start>mdi-close</v-icon>
            إلغاء
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="isEditMode" color="error" variant="outlined" class="me-2" @click="deleteSchedule">
            <v-icon start>mdi-delete</v-icon>
            حذف
          </v-btn>
          <v-btn :color="isEditMode ? 'warning' : 'primary'" @click="saveSchedule">
            <v-icon start>{{ isEditMode ? 'mdi-content-save-edit' : 'mdi-content-save' }}</v-icon>
            حفظ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// Data
const classes = ref([])
const sections = ref([])
const subjects = ref([])
const scheduleItems = ref([])
const selectedClass = ref(null)
const selectedSection = ref(null)

// Days and periods
const days = ref([
  { title: 'الأحد', value: 0 },
  { title: 'الإثنين', value: 1 },
  { title: 'الثلاثاء', value: 2 },
  { title: 'الأربعاء', value: 3 },
  { title: 'الخميس', value: 4 }
])

const periods = ref([
  { title: 'الحصة الأولى', value: 1 },
  { title: 'الحصة الثانية', value: 2 },
  { title: 'الحصة الثالثة', value: 3 },
  { title: 'الحصة الرابعة', value: 4 },
  { title: 'الحصة الخامسة', value: 5 },
  { title: 'الحصة السادسة', value: 6 },
  { title: 'الحصة السابعة', value: 7 }
])

// Dialogs and UI state
const showScheduleDialog = ref(false)
const isEditMode = ref(false)
const showFilters = ref(false)

// Schedule form
const scheduleForm = ref({
  id: null,
  day: null,
  period: null,
  class_id: null,
  section_id: null,
  subject_id: null
})

// Fetch data on component mount
onMounted(async () => {
  try {
    // Fetch classes
    const classesResponse = await axios.get('classes/')
    classes.value = classesResponse.data || []

    console.log('Fetched classes:', classes.value)

    if (classes.value.length > 0) {
      selectedClass.value = classes.value[0].id
    }

    // Fetch sections
    const sectionsResponse = await axios.get('sections/')
    sections.value = sectionsResponse.data || []

    console.log('Fetched sections:', sections.value)

    if (sections.value.length > 0) {
      selectedSection.value = sections.value[0].id
    }

    // Fetch subjects
    const subjectsResponse = await axios.get('subjects/')
    subjects.value = subjectsResponse.data || []

    console.log('Fetched subjects:', subjects.value)

    // Fetch schedule
    await fetchSchedule()
  } catch (error) {
    console.error('Error fetching initial data:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    // For demo purposes, add some dummy data if API fails
    addDummyData()
  }
})

// Fetch schedule based on selected class and section
const fetchSchedule = async () => {
  if (!selectedClass.value || !selectedSection.value) return

  try {
    const response = await axios.get('schedules/by_class_section/', {
      params: {
        class_id: selectedClass.value,
        section_id: selectedSection.value
      }
    })

    console.log('Fetched schedule data:', response.data)

    // تحويل البيانات المستلمة إلى الشكل المطلوب
    scheduleItems.value = response.data.map(item => ({
      id: item.id,
      day: item.day,
      period: item.period,
      class_id: item.class_name,  // في الخادم الخلفي، الحقل هو class_name وليس class_id
      section_id: item.section,   // في الخادم الخلفي، الحقل هو section وليس section_id
      subject_id: item.subject,   // في الخادم الخلفي، الحقل هو subject وليس subject_id
      class: item.class_name_display || '',  // من ScheduleDetailSerializer
      section: item.section_display || '',    // من ScheduleDetailSerializer
      subject: item.subject_display || ''     // من ScheduleDetailSerializer
    }))

    console.log('Processed schedule items:', scheduleItems.value)
  } catch (error) {
    console.error('Error fetching schedule:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    // For demo purposes, add some dummy data if API fails
    addDummyData()
  }
}

// Get schedule item for a specific day and period
const getScheduleItem = (day, period) => {
  // التأكد من أن القيم رقمية للمقارنة الصحيحة
  const numDay = Number(day)
  const numPeriod = Number(period)

  return scheduleItems.value.find(item => {
    const itemDay = Number(item.day)
    const itemPeriod = Number(item.period)
    return itemDay === numDay && itemPeriod === numPeriod
  })
}

// Get color for schedule item based on subject
const getScheduleColor = (item) => {
  if (!item) return ''

  // Generate a color based on subject ID
  const colors = ['primary', 'secondary', 'info', 'success', 'warning', 'error']
  const index = (item.subject_id || 0) % colors.length
  return colors[index]
}

// Open schedule dialog
const openScheduleDialog = (day, period) => {
  console.log('Opening schedule dialog for day:', day, 'period:', period)

  // حفظ قيم اليوم والحصة لاستخدامها لاحقًا
  savedDay = Number(day);
  savedPeriod = Number(period);

  const existingItem = getScheduleItem(day, period)
  console.log('Existing item:', existingItem)

  // إعادة تعيين النموذج أولاً لتجنب مشاكل القيم المتبقية
  scheduleForm.value = {
    id: null,
    day: Number(day),
    period: Number(period),
    class_id: selectedClass.value,
    section_id: selectedSection.value,
    subject_id: null
  }

  // فتح نافذة الحوار أولاً
  showScheduleDialog.value = true

  // تأخير بسيط للتأكد من أن النموذج تم تحديثه أولاً
  setTimeout(() => {
    if (existingItem) {
      // Edit mode
      isEditMode.value = true
      scheduleForm.value = {
        id: existingItem.id,
        day: Number(day),
        period: Number(period),
        class_id: existingItem.class_id,
        section_id: existingItem.section_id,
        subject_id: existingItem.subject_id
      }
      console.log('Schedule form updated for edit mode:', scheduleForm.value)
    } else {
      // Add mode
      isEditMode.value = false
      console.log('Schedule form initialized for add mode:', scheduleForm.value)
    }
  }, 100)
}

// متغيرات لتخزين قيم اليوم والحصة عند فتح نافذة الحوار
let savedDay = null;
let savedPeriod = null;

// Save schedule
const saveSchedule = async () => {
  try {
    // طباعة النموذج بالكامل للتحقق من القيم
    console.log('Schedule form data before validation:', {
      id: scheduleForm.value.id,
      day: scheduleForm.value.day,
      period: scheduleForm.value.period,
      class_id: scheduleForm.value.class_id,
      section_id: scheduleForm.value.section_id,
      subject_id: scheduleForm.value.subject_id
    })
    console.log('Saved day and period:', savedDay, savedPeriod)

    // التحقق من صحة البيانات
    if (!scheduleForm.value.subject_id) {
      alert('يرجى اختيار المادة')
      return
    }

    // استخدام القيم المحفوظة لليوم والحصة
    const day = savedDay;
    const period = savedPeriod;

    if (day === undefined || day === null) {
      alert('حدث خطأ: قيمة اليوم غير محددة')
      return
    }

    if (period === undefined || period === null) {
      alert('حدث خطأ: قيمة الحصة غير محددة')
      return
    }

    console.log('Schedule form data after validation:', {
      id: scheduleForm.value.id,
      day: scheduleForm.value.day,
      period: scheduleForm.value.period,
      class_id: scheduleForm.value.class_id,
      section_id: scheduleForm.value.section_id,
      subject_id: scheduleForm.value.subject_id
    })

    let response

    // إعداد البيانات للإرسال إلى الخادم الخلفي
    const scheduleData = {
      day: Number(day),  // التأكد من أن القيمة رقمية
      period: Number(period),  // التأكد من أن القيمة رقمية
      class_name: scheduleForm.value.class_id,  // في الخادم الخلفي، الحقل هو class_name
      section: scheduleForm.value.section_id,    // في الخادم الخلفي، الحقل هو section
      subject: scheduleForm.value.subject_id     // في الخادم الخلفي، الحقل هو subject
    }

    console.log('Saving schedule with data:', scheduleData)

    if (isEditMode.value && scheduleForm.value.id) {
      // Update existing schedule
      console.log(`Updating schedule with ID: ${scheduleForm.value.id}`)
      response = await axios.put(`schedules/${scheduleForm.value.id}/`, scheduleData)

      console.log('Schedule updated successfully:', response.data)

      // تحويل البيانات المستلمة إلى الشكل المطلوب
      const updatedSchedule = {
        id: response.data.id,
        day: response.data.day,
        period: response.data.period,
        class_id: response.data.class_name,
        section_id: response.data.section,
        subject_id: response.data.subject,
        class: response.data.class_name_display || '',
        section: response.data.section_display || '',
        subject: response.data.subject_display || ''
      }

      // Update schedule item in list
      const index = scheduleItems.value.findIndex(item => item.id === scheduleForm.value.id)
      if (index !== -1) {
        scheduleItems.value[index] = updatedSchedule
      }
    } else {
      // Create new schedule
      response = await axios.post('schedules/', scheduleData)

      console.log('Schedule created successfully:', response.data)

      // تحويل البيانات المستلمة إلى الشكل المطلوب
      const newSchedule = {
        id: response.data.id,
        day: response.data.day,
        period: response.data.period,
        class_id: response.data.class_name,
        section_id: response.data.section,
        subject_id: response.data.subject,
        class: response.data.class_name_display || '',
        section: response.data.section_display || '',
        subject: response.data.subject_display || ''
      }

      // Add new schedule item to list
      scheduleItems.value.push(newSchedule)
    }

    // Close dialog
    showScheduleDialog.value = false
  } catch (error) {
    console.error('Error saving schedule:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }

    // لأغراض العرض، نقوم بمحاكاة نجاح العملية
    const classObj = classes.value.find(c => c.id === scheduleForm.value.class_id)
    const sectionObj = sections.value.find(s => s.id === scheduleForm.value.section_id)
    const subjectObj = subjects.value.find(s => s.id === scheduleForm.value.subject_id)

    if (isEditMode.value) {
      // Update schedule item in list
      const index = scheduleItems.value.findIndex(item =>
        item.day === scheduleForm.value.day &&
        item.period === scheduleForm.value.period
      )

      if (index !== -1) {
        scheduleItems.value[index] = {
          id: scheduleForm.value.id,
          day: scheduleForm.value.day,
          period: scheduleForm.value.period,
          class_id: scheduleForm.value.class_id,
          section_id: scheduleForm.value.section_id,
          subject_id: scheduleForm.value.subject_id,
          class: classObj?.name || '',
          section: sectionObj?.name || '',
          subject: subjectObj?.name || ''
        }
      }
    } else {
      // Add new schedule item to list
      scheduleItems.value.push({
        id: Date.now(), // Use timestamp as dummy ID
        day: scheduleForm.value.day,
        period: scheduleForm.value.period,
        class_id: scheduleForm.value.class_id,
        section_id: scheduleForm.value.section_id,
        subject_id: scheduleForm.value.subject_id,
        class: classObj?.name || '',
        section: sectionObj?.name || '',
        subject: subjectObj?.name || ''
      })
    }

    // Close dialog
    showScheduleDialog.value = false
  }
}

// Delete schedule
const deleteSchedule = async () => {
  if (!scheduleForm.value.id) return

  try {
    console.log('Deleting schedule with ID:', scheduleForm.value.id)

    // إرسال طلب حذف الجدول إلى الخادم الخلفي
    await axios.delete(`schedules/${scheduleForm.value.id}/`)

    console.log('Schedule deleted successfully')

    // إزالة الجدول من القائمة
    scheduleItems.value = scheduleItems.value.filter(item => item.id !== scheduleForm.value.id)

    // إغلاق نافذة الحوار
    showScheduleDialog.value = false
  } catch (error) {
    console.error('Error deleting schedule:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }

    // لأغراض العرض، نقوم بإزالة الجدول من القائمة حتى في حالة الخطأ
    scheduleItems.value = scheduleItems.value.filter(item =>
      !(item.day === scheduleForm.value.day && item.period === scheduleForm.value.period)
    )

    // إغلاق نافذة الحوار
    showScheduleDialog.value = false
  }
}

// Add dummy data for demo purposes
const addDummyData = () => {
  classes.value = [
    { id: 1, name: 'الصف الأول' },
    { id: 2, name: 'الصف الثاني' },
    { id: 3, name: 'الصف الثالث' }
  ]

  sections.value = [
    { id: 1, name: 'أ' },
    { id: 2, name: 'ب' },
    { id: 3, name: 'ج' }
  ]

  subjects.value = [
    { id: 1, name: 'الدراسات الإسلامية' },
    { id: 2, name: 'الفقه' },
    { id: 3, name: 'التوحيد' },
    { id: 4, name: 'القرآن' }
  ]

  selectedClass.value = 1
  selectedSection.value = 1

  scheduleItems.value = [
    {
      id: 1,
      day: 0,
      period: 1,
      class_id: 1,
      section_id: 1,
      subject_id: 1,
      class: 'الصف الأول',
      section: 'أ',
      subject: 'الدراسات الإسلامية'
    },
    {
      id: 2,
      day: 0,
      period: 2,
      class_id: 1,
      section_id: 1,
      subject_id: 2,
      class: 'الصف الأول',
      section: 'أ',
      subject: 'الفقه'
    },
    {
      id: 3,
      day: 1,
      period: 1,
      class_id: 1,
      section_id: 1,
      subject_id: 3,
      class: 'الصف الأول',
      section: 'أ',
      subject: 'التوحيد'
    },
    {
      id: 4,
      day: 2,
      period: 3,
      class_id: 1,
      section_id: 1,
      subject_id: 4,
      class: 'الصف الأول',
      section: 'أ',
      subject: 'القرآن'
    }
  ]
}
</script>

<style scoped>
/* تنسيق عام */
.schedule-page {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.schedule-header-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) !important;
  background-color: rgb(var(--v-theme-surface));
}

/* تنسيق الجدول */
.schedule-container {
  width: 100%;
  overflow-x: auto;
  padding: 8px;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
}

.schedule-table {
  direction: rtl;
  border-collapse: separate;
  border-spacing: 8px;
  width: 100%;
  min-width: 800px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-header {
  padding: 12px 8px;
  font-weight: bold;
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
  color: rgb(var(--v-theme-on-surface));
}

.period-header {
  width: 180px;
  background-color: rgba(var(--v-theme-secondary), 0.05);
  border-radius: 8px 0 0 8px;
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.2);
}

.day-header {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.2);
}

.day-chip {
  width: 100%;
  justify-content: center;
}

.period-cell {
  background-color: rgba(var(--v-theme-secondary), 0.05);
  border-right: 2px solid rgba(var(--v-theme-secondary), 0.2);
  padding: 8px;
  width: 180px;
}

.period-chip {
  width: 100%;
  justify-content: center;
}

.schedule-cell {
  height: 120px;
  width: 180px;
  cursor: pointer;
  vertical-align: middle;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  transition: all 0.2s ease;
  padding: 8px;
  position: relative;
  overflow: hidden;
  background-color: rgb(var(--v-theme-surface));
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.schedule-cell:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.schedule-item-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.schedule-item-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%);
  pointer-events: none;
}

.v-theme--dark .schedule-item-card::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%);
}

.empty-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed rgba(var(--v-theme-outline), 0.3);
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.add-icon {
  opacity: 0.5;
  transition: all 0.2s ease;
  font-size: 24px;
  color: rgba(var(--v-theme-primary), 0.7);
}

.schedule-cell:hover .add-icon {
  opacity: 1;
  transform: scale(1.1);
}

.schedule-cell:hover .empty-cell {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background-color: rgba(var(--v-theme-primary), 0.1);
}

/* المزيد من التنسيقات لتتناسب مع صفحة الطلاب */
.student-grades-table-card {
  border-radius: 8px;
  overflow: hidden;
  background-color: rgb(var(--v-theme-surface));
}

/* تنسيقات خاصة بالثيم الداكن */
.v-theme--dark .schedule-container {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}

.v-theme--dark .schedule-cell {
  border-color: rgba(var(--v-theme-outline), 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.v-theme--dark .empty-cell {
  border-color: rgba(var(--v-theme-outline), 0.2);
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}

.v-theme--dark .schedule-cell:hover .empty-cell {
  border-color: rgba(var(--v-theme-primary), 0.4);
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.v-theme--dark .table-header {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.v-theme--dark .period-header,
.v-theme--dark .day-header {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}
</style>
