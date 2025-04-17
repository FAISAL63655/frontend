<template>
  <div class="random-picker-page pa-4" dir="rtl">
    <!-- جزء البطاقة الرئيسية العلوية -->
    <v-card class="header-card mb-6 elevation-2">
      <v-toolbar color="primary" flat class="px-4 rounded-t">
        <v-toolbar-title class="text-white d-flex align-center">
          <v-icon size="large" class="ms-2">mdi-dice-multiple-outline</v-icon>
          <span class="text-h5 font-weight-bold">الاختيار العشوائي</span>
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-4">
        <p class="text-body-1">يمكنك استخدام هذه الصفحة لاختيار طالب عشوائي أو تشكيل مجموعات عشوائية من الطلاب.</p>
      </v-card-text>
    </v-card>

    <!-- قسم اختيار الطالب العشوائي -->
    <v-card class="student-picker-card mb-6 elevation-2">
      <v-toolbar color="blue-lighten-1" flat class="px-4 rounded-t">
        <v-toolbar-title class="d-flex align-center">
          <v-icon start icon="mdi-dice-3-outline" class="me-2"></v-icon>
          <span class="font-weight-bold">اختيار طالب عشوائي</span>
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-4">
        <v-row align="center" class="mb-4">
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
              bg-color="surface"
              class="rounded-lg"
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
              bg-color="surface"
              class="rounded-lg"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="12" md="4" class="d-flex align-center">
            <v-chip
              color="primary"
              size="large"
              class="ms-2 px-3"
            >
              <v-icon start>mdi-account-group</v-icon>
              {{ getAvailableStudents.length }} / {{ students.length }}
            </v-chip>
          </v-col>
        </v-row>

        <v-divider class="my-6"></v-divider>



        <!-- قسم العجلة وقائمة الطلاب -->
        <div class="wheel-and-students-section my-6">
          <v-row>
            <!-- عجلة الاختيار العشوائي -->
            <v-col cols="12" md="6">
              <div class="wheel-section">
                <RandomWheel
                  ref="wheelRef"
                  :items="getAvailableStudents"
                  :spin-time="5000"
                  spin-button-text="اختيار طالب عشوائي"
                  @selected="onStudentSelected"
                />
              </div>
            </v-col>

            <!-- قائمة الطلاب للاستبعاد من العجلة -->
            <v-col cols="12" md="6">
              <v-card flat border class="pa-3 students-list-card">
                <div class="d-flex align-center mb-3">
                  <v-icon color="primary" class="me-2">mdi-account-group</v-icon>
                  <span class="text-subtitle-1 font-weight-bold">قائمة الطلاب</span>
                  <v-spacer></v-spacer>
                  <v-chip color="primary" size="small">
                    {{ getAvailableStudents.length }} / {{ students.length }}
                  </v-chip>
                </div>

                <div class="text-caption text-grey mb-3 text-center">
                  <v-icon size="small" color="grey" class="me-1">mdi-information-outline</v-icon>
                  اضغط على الطالب لاستبعاده من العجلة أو إعادته
                </div>

                <v-divider class="mb-3"></v-divider>

                <div class="students-grid">
                  <v-card
                    v-for="student in students"
                    :key="student.id"
                    :class="['student-wheel-card', {'excluded': isStudentExcluded(student.id)}]"
                    variant="outlined"
                    :color="isStudentExcluded(student.id) ? 'grey-lighten-3' : undefined"
                    @click="isStudentExcluded(student.id) ? includeStudent(student) : excludeStudent(student)"
                  >
                    <div class="d-flex align-center pa-2">
                      <v-avatar size="40" class="me-2 student-list-avatar">
                        <v-img
                          :src="student.image || 'https://cdn.vuetifyjs.com/images/john.jpg'"
                          alt="Student"
                          cover
                        ></v-img>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="text-subtitle-2 font-weight-medium">{{ student.name }}</div>
                      </div>
                      <v-icon
                        :color="isStudentExcluded(student.id) ? 'success' : 'error'"
                        size="small"
                      >
                        {{ isStudentExcluded(student.id) ? 'mdi-account-check' : 'mdi-account-cancel' }}
                      </v-icon>
                    </div>
                  </v-card>
                </div>

                <div class="text-center mt-3">
                  <v-btn
                    color="primary"
                    variant="text"
                    size="small"
                    :disabled="excludedStudents.length === 0"
                    @click="resetExcludedStudents"
                  >
                    <v-icon start size="small">mdi-refresh</v-icon>
                    إعادة تعيين الكل
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- عرض الطالب المختار -->
        <div v-if="selectedStudent" class="selected-student-container text-center py-4 mt-6">
          <v-scale-transition>
            <div>
              <v-avatar size="180" class="mb-4 elevation-5 student-avatar">
                <v-img
                  :src="selectedStudent.image || 'https://cdn.vuetifyjs.com/images/john.jpg'"
                  alt="Student"
                  cover
                ></v-img>
              </v-avatar>
              <h2 class="text-h3 font-weight-bold mb-2 student-name">{{ selectedStudent.name }}</h2>
              <div class="d-flex justify-center flex-wrap">
                <v-chip color="info" size="large" class="ma-2 px-4 py-2">
                  <v-icon start>mdi-school</v-icon>
                  {{ selectedStudent.class_name }} - {{ selectedStudent.section }}
                </v-chip>
                <v-btn
                  color="error"
                  variant="outlined"
                  class="ma-2"
                  @click="excludeStudent(selectedStudent)"
                  :disabled="isStudentExcluded(selectedStudent.id)"
                >
                  <v-icon start>mdi-account-cancel</v-icon>
                  استبعاد من العجلة
                </v-btn>
              </div>
            </div>
          </v-scale-transition>
        </div>
      </v-card-text>
    </v-card>

    <!-- قسم تشكيل المجموعات العشوائية -->
    <v-card class="groups-card elevation-2">
      <v-toolbar color="success-lighten-1" flat class="px-4 rounded-t">
        <v-toolbar-title class="d-flex align-center">
          <v-icon start icon="mdi-account-group" class="me-2"></v-icon>
          <span class="font-weight-bold">تشكيل مجموعات عشوائية</span>
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-4">
        <v-row align="center" class="mb-4">
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
              bg-color="surface"
              class="rounded-lg"
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
              bg-color="surface"
              class="rounded-lg"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="groupCount"
              label="عدد المجموعات"
              type="number"
              min="2"
              max="10"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-numeric"
              bg-color="surface"
              class="rounded-lg"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" class="text-center">
            <v-btn
              color="success"
              size="large"
              elevation="2"
              class="px-6 py-3 groups-button"
              :loading="isCreatingGroups"
              :disabled="isCreatingGroups"
              @click="createRandomGroups"
            >
              <v-icon start icon="mdi-account-group" class="me-2"></v-icon>
              تشكيل المجموعات
            </v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-6"></v-divider>

        <!-- عرض المجموعات -->
        <div v-if="groups.length > 0" class="groups-container">
          <h3 class="text-h5 mb-4 font-weight-bold d-flex align-center">
            <v-icon start color="success" class="me-2">mdi-account-group</v-icon>
            المجموعات
          </h3>

          <v-row>
            <v-col v-for="(group, index) in groups" :key="index" cols="12" sm="6" md="4" lg="3">
              <v-card class="group-card elevation-3 rounded-lg" :color="getGroupColor(index)">
                <v-card-title class="d-flex align-center">
                  <v-avatar color="white" class="me-2" size="36">
                    <span class="text-h6 font-weight-bold" :class="getGroupTextColor(index)">{{ index + 1 }}</span>
                  </v-avatar>
                  <span class="white--text">المجموعة {{ index + 1 }}</span>
                </v-card-title>

                <v-card-text class="pa-0">
                  <v-list class="bg-transparent">
                    <v-list-item
                      v-for="student in group"
                      :key="student.id"
                      class="student-list-item"
                      :ripple="false"
                    >
                      <template v-slot:prepend>
                        <v-avatar size="40" class="elevation-2 me-2">
                          <v-img
                            :src="student.image || 'https://cdn.vuetifyjs.com/images/john.jpg'"
                            alt="Student"
                            cover
                          ></v-img>
                        </v-avatar>
                      </template>
                      <v-list-item-title class="font-weight-medium">{{ student.name }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>

                <v-card-actions class="pa-3 justify-center">
                  <v-chip size="small" color="white" class="px-2">
                    <v-icon start size="small">mdi-account</v-icon>
                    {{ group.length }} طالب
                  </v-chip>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- رسالة في حالة عدم وجود مجموعات -->
        <div v-else class="text-center py-6 empty-state">
          <v-icon icon="mdi-account-group-outline" size="x-large" color="grey-lighten-1" class="mb-4"></v-icon>
          <p class="text-body-1 text-grey">اضغط على زر تشكيل المجموعات لإنشاء مجموعات عشوائية</p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import RandomWheel from '@/components/RandomWheel.vue'

// Data
const classes = ref([])
const sections = ref([])
const students = ref([])
const selectedClass = ref(null)
const selectedSection = ref(null)
const selectedStudent = ref(null)
const groupCount = ref(3)
const groups = ref([])
const excludedStudents = ref([])

// UI state
const isPickingStudent = ref(false)
const isCreatingGroups = ref(false)
const showFilters = ref(true)
const showExcludedStudents = ref(false)

// الحصول على قائمة الطلاب المتاحين (غير المستبعدين)
const getAvailableStudents = computed(() => {
  const excludedIds = excludedStudents.value.map(student => student.id)
  return students.value.filter(student => !excludedIds.includes(student.id))
})

// التحقق مما إذا كان الطالب مستبعداً
const isStudentExcluded = (studentId) => {
  return excludedStudents.value.some(student => student.id === studentId)
}

// استبعاد طالب من الاختيار العشوائي
const excludeStudent = (student) => {
  if (!isStudentExcluded(student.id)) {
    excludedStudents.value.push(student)
    // عرض قائمة المستبعدين عند استبعاد طالب لأول مرة
    if (excludedStudents.value.length === 1) {
      showExcludedStudents.value = true
    }
  }
}

// إعادة طالب إلى قائمة الاختيار العشوائي
const includeStudent = (student) => {
  excludedStudents.value = excludedStudents.value.filter(s => s.id !== student.id)
}

// إعادة تعيين جميع الطلاب المستبعدين
const resetExcludedStudents = () => {
  excludedStudents.value = []
}

// ألوان المجموعات
const groupColors = [
  'primary',
  'success',
  'info',
  'warning',
  'error',
  'purple',
  'indigo',
  'teal',
  'orange',
  'pink'
]

// الحصول على لون المجموعة بناءً على الفهرس
const getGroupColor = (index) => {
  return groupColors[index % groupColors.length]
}

// الحصول على لون النص للمجموعة
const getGroupTextColor = (index) => {
  const color = groupColors[index % groupColors.length]
  return `${color}--text`
}

// Fetch data on component mount
onMounted(async () => {
  try {
    console.log('Fetching initial data...')

    // Fetch classes
    const classesResponse = await axios.get('classes/')
    console.log('Classes response:', classesResponse.data)
    classes.value = classesResponse.data || []

    if (classes.value.length > 0) {
      selectedClass.value = classes.value[0].id
    }

    // Fetch sections
    const sectionsResponse = await axios.get('sections/')
    console.log('Sections response:', sectionsResponse.data)
    sections.value = sectionsResponse.data || []

    if (sections.value.length > 0) {
      selectedSection.value = sections.value[0].id
    }

    // Fetch students
    await fetchStudents()

    console.log('Initial data loaded successfully')
  } catch (error) {
    console.error('Error fetching initial data:', error)
    // For demo purposes, add some dummy data if API fails
    console.log('Loading dummy data instead')
    addDummyData()
  }
})

// Fetch students based on selected class and section
const fetchStudents = async () => {
  if (!selectedClass.value || !selectedSection.value) return

  try {
    console.log('Fetching students for class:', selectedClass.value, 'section:', selectedSection.value)
    const response = await axios.get('students/by_class_section/', {
      params: {
        class_id: selectedClass.value,
        section_id: selectedSection.value
      }
    })

    console.log('Students response:', response.data)
    students.value = response.data

    // إعادة تعيين الطالب المختار والمجموعات عند تغيير الصف أو الفصل
    selectedStudent.value = null
    groups.value = []

    // إعادة تعيين قائمة الطلاب المستبعدين عند تغيير الصف أو الفصل
    excludedStudents.value = []
  } catch (error) {
    console.error('Error fetching students:', error)
    // For demo purposes, add some dummy data if API fails
    console.log('Loading dummy student data instead')
    addDummyData()
  }
}

// مرجع لمكون العجلة
const wheelRef = ref(null)

// معالجة اختيار الطالب من العجلة
const onStudentSelected = (student) => {
  console.log('Student selected from wheel:', student)
  selectedStudent.value = student
}

// تدوير العجلة لاختيار طالب عشوائي
const pickRandomStudent = () => {
  if (!selectedClass.value || !selectedSection.value) {
    console.error('Class and section must be selected')
    return
  }

  // التحقق من وجود طلاب متاحين
  const availableStudents = getAvailableStudents.value
  if (availableStudents.length === 0) {
    console.error('No available students for random selection')
    return
  }

  // تدوير العجلة
  if (wheelRef.value) {
    wheelRef.value.spinWheel()
  }
}

// Create random groups with animation effect
const createRandomGroups = async () => {
  if (!selectedClass.value || !selectedSection.value || groupCount.value <= 0) {
    console.error('Class, section, and group count must be valid')
    return
  }

  // تعيين حالة التحميل
  isCreatingGroups.value = true

  // إزالة المجموعات الحالية للتأثير الحركي
  groups.value = []

  try {
    // إضافة تأخير للتأثير الحركي
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('Requesting random groups from API...')
    const response = await axios.get('random/groups/', {
      params: {
        class_id: selectedClass.value,
        section_id: selectedSection.value,
        group_count: groupCount.value
      }
    })

    console.log('Random groups response:', response.data)

    // إضافة تأخير قبل عرض النتيجة النهائية
    await new Promise(resolve => setTimeout(resolve, 300))

    // عرض المجموعات المنشأة
    groups.value = response.data

    // تشغيل صوت النجاح
    try {
      const audio = new Audio('/sounds/success.mp3')
      audio.volume = 0.5
      audio.play()
    } catch (audioError) {
      console.log('تعذر تشغيل الصوت:', audioError)
    }

  } catch (error) {
    console.error('Error creating random groups:', error)

    // Fallback to client-side group creation if API fails
    if (students.value.length > 0) {
      console.log('Falling back to client-side random groups')

      // إضافة تأخير للتأثير الحركي
      await new Promise(resolve => setTimeout(resolve, 500))

      // Shuffle students array
      const shuffledStudents = [...students.value].sort(() => Math.random() - 0.5)

      // Create groups
      const count = Math.min(groupCount.value, students.value.length)
      const newGroups = Array.from({ length: count }, () => [])

      // Distribute students to groups
      shuffledStudents.forEach((student, index) => {
        const groupIndex = index % count
        newGroups[groupIndex].push(student)
      })

      groups.value = newGroups
    } else {
      console.error('No students available for creating groups')
    }
  } finally {
    // إنهاء حالة التحميل
    isCreatingGroups.value = false
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

  selectedClass.value = 1
  selectedSection.value = 1

  students.value = [
    {
      id: 1,
      name: 'أحمد محمد',
      class_id: 1,
      section_id: 1,
      class_name: 'الصف الأول',
      section: 'أ',
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      name: 'محمد علي',
      class_id: 1,
      section_id: 1,
      class_name: 'الصف الأول',
      section: 'أ',
      image: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    {
      id: 3,
      name: 'عبدالله خالد',
      class_id: 1,
      section_id: 1,
      class_name: 'الصف الأول',
      section: 'أ',
      image: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    {
      id: 4,
      name: 'سعد محمد',
      class_id: 1,
      section_id: 1,
      class_name: 'الصف الأول',
      section: 'أ',
      image: 'https://randomuser.me/api/portraits/men/4.jpg'
    },
    {
      id: 5,
      name: 'فهد عبدالله',
      class_id: 1,
      section_id: 1,
      class_name: 'الصف الأول',
      section: 'أ',
      image: 'https://randomuser.me/api/portraits/men/5.jpg'
    },
    {
      id: 6,
      name: 'خالد سعد',
      class_id: 1,
      section_id: 1,
      class_name: 'الصف الأول',
      section: 'أ',
      image: 'https://randomuser.me/api/portraits/men/6.jpg'
    }
  ]
}
</script>

<style scoped>
/* تنسيقات عامة */
.random-picker-page {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}

/* تنسيقات البطاقات */
.header-card,
.student-picker-card,
.groups-card {
  border-radius: 8px;
  overflow: hidden;
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.3s ease;
}

.header-card:hover,
.student-picker-card:hover,
.groups-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
}

/* تنسيقات الطالب المختار */
.selected-student-container {
  padding: 20px;
  border-radius: 12px;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.student-avatar {
  border: 4px solid rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.student-avatar:hover {
  transform: scale(1.05);
}

.student-name {
  color: rgb(var(--v-theme-on-surface));
  margin-top: 16px;
  transition: all 0.3s ease;
}

/* تنسيقات المجموعات */
.groups-container {
  padding: 10px;
}

.group-card {
  margin-bottom: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.group-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
}

.student-list-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s ease;
}

.student-list-item:last-child {
  border-bottom: none;
}

.student-list-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* تنسيقات الأزرار */
.spin-button,
.groups-button {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.spin-button:hover,
.groups-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(var(--v-theme-primary), 0.3) !important;
}

.spin-button::after,
.groups-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0) 70%);
  transform: translateX(-100%);
}

.spin-button:hover::after,
.groups-button:hover::after {
  animation: shine 1.5s infinite;
}

@keyframes shine {
  100% {
    transform: translateX(100%);
  }
}

/* تنسيقات الحالة الفارغة */
.empty-state {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
  border-radius: 12px;
  padding: 30px;
}

/* تنسيقات العجلة وقائمة الطلاب */
.wheel-section {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px 0;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

.student-wheel-card {
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.student-wheel-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.student-wheel-card.excluded {
  opacity: 0.7;
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.02),
    rgba(0, 0, 0, 0.02) 10px,
    rgba(0, 0, 0, 0.04) 10px,
    rgba(0, 0, 0, 0.04) 20px
  ) !important;
}

.students-list-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
}

.v-theme--dark .student-wheel-card.excluded {
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0.02) 10px,
    rgba(255, 255, 255, 0.04) 10px,
    rgba(255, 255, 255, 0.04) 20px
  ) !important;
}

/* تنسيقات بطاقات الطلاب */
.student-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.student-card.excluded {
  opacity: 0.7;
}

.student-card.excluded::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.03),
    rgba(0, 0, 0, 0.03) 10px,
    rgba(0, 0, 0, 0.06) 10px,
    rgba(0, 0, 0, 0.06) 20px
  );
  pointer-events: none;
}

.student-list-avatar {
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.student-card:hover .student-list-avatar {
  transform: scale(1.05);
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.excluded-students-container {
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.excluded-students-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
}

/* تنسيقات الثيم الداكن */
.v-theme--dark .empty-state {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.v-theme--dark .selected-student-container {
  background-color: rgba(var(--v-theme-surface-variant), 0.15);
}

.v-theme--dark .student-avatar {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

/* تنسيقات الثيم الداكن لبطاقات الطلاب */
.v-theme--dark .student-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .student-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

.v-theme--dark .student-card.excluded::after {
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.03) 10px,
    rgba(255, 255, 255, 0.06) 10px,
    rgba(255, 255, 255, 0.06) 20px
  );
}

.v-theme--dark .student-list-avatar {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
