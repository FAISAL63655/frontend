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
                  :spin-time="3000"
                  spin-button-text="اختيار طالب عشوائي"
                  @selected="(student) => onStudentSelected(student)"
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
                      <v-avatar size="40" class="me-2 student-list-avatar" :color="getAvatarColor(student.name)">
                        <v-img v-if="student.image" :src="student.image" :alt="student.name" cover></v-img>
                        <span v-else class="text-subtitle-2 text-white">{{ getInitials(student.name) }}</span>
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

        <!-- تم إزالة عرض الطالب المختار من هنا لأنه سيظهر في المربع الجديد في الأسفل -->

        <!-- مربع الطالب المختار في الأسفل -->
        <v-card
          class="selected-student-box mt-6 elevation-3"
          :class="{'student-selected-animation': selectedStudent}"
          color="surface"
        >
          <v-card-title class="bg-primary text-white py-3 px-4 d-flex align-center">
            <v-icon size="large" class="me-2">mdi-account-star</v-icon>
            <span class="text-h5 font-weight-bold">الطالب المختار</span>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-row align="center">
              <v-col cols="12" sm="4" class="text-center">
                <v-avatar v-if="selectedStudent" size="100" class="elevation-3 mb-2" :color="getAvatarColor(selectedStudent.name)">
                  <v-img v-if="selectedStudent.image" :src="selectedStudent.image" :alt="selectedStudent.name" cover></v-img>
                  <span v-else class="text-h4 text-white">{{ getInitials(selectedStudent.name) }}</span>
                </v-avatar>
                <v-avatar v-else size="100" class="elevation-3 mb-2 grey lighten-2">
                  <v-icon size="x-large" color="grey darken-2">mdi-account-question</v-icon>
                </v-avatar>
              </v-col>

              <v-col cols="12" sm="8">
                <h3 class="text-h4 font-weight-bold primary--text mb-2" v-if="selectedStudent">
                  {{ selectedStudent.name }}
                </h3>
                <h3 class="text-h4 font-weight-medium text-grey mb-2" v-else>
                  اختر طالب
                </h3>

                <v-chip v-if="selectedStudent" color="info" size="large" class="mb-2">
                  <v-icon start>mdi-school</v-icon>
                  {{ selectedStudent.class_name }} - {{ selectedStudent.section }}
                </v-chip>
                <v-chip v-else color="grey" size="large" class="mb-2">
                  <v-icon start>mdi-school</v-icon>
                  لم يتم اختيار طالب بعد
                </v-chip>

                <div v-if="selectedStudent" class="mt-2 text-body-1">
                  <v-icon color="success" class="me-1">mdi-check-circle</v-icon>
                  تم اختيار الطالب بنجاح!
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="pa-4 justify-center">
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-refresh"
              @click="pickRandomStudent"
              class="px-6"
              elevation="2"
            >
              اختيار طالب آخر
            </v-btn>
            <v-btn
              color="error"
              variant="outlined"
              class="ms-2"
              @click="selectedStudent && excludeStudent(selectedStudent); pickRandomStudent()"
              :disabled="!selectedStudent || (selectedStudent && isStudentExcluded(selectedStudent.id))"
            >
              <v-icon start>mdi-account-cancel</v-icon>
              استبعاد واختيار آخر
            </v-btn>
          </v-card-actions>

          <!-- زر إضافي لاختيار طالب مباشرة من الخدمة -->
          <v-card-actions class="pt-0 pb-4 justify-center">
            <v-btn
              color="info"
              variant="text"
              @click="async () => {
                try {
                  const randomStudent = await RandomPickerService.getRandomStudent(selectedClass, selectedSection);
                  console.log('Direct random student from service:', randomStudent);
                  updateSelectedStudent(randomStudent);
                } catch (error) {
                  console.error('Error getting direct random student:', error);
                }
              }"
              class="text-caption"
            >
              <v-icon start size="small">mdi-lightning-bolt</v-icon>
              اختيار مباشر بدون العجلة
            </v-btn>
          </v-card-actions>
        </v-card>
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
import { ref, computed, onMounted, watch } from 'vue'
import RandomWheel from '@/components/RandomWheel.vue'
import { getInitials, getAvatarColor } from '@/utils/imageUtils'
import ClassService from '@/services/ClassService'
import SectionService from '@/services/SectionService'
import StudentService from '@/services/StudentService'
import RandomPickerService from '@/services/RandomPickerService'

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
    const classesData = await ClassService.getClasses()
    console.log('Classes data:', classesData)
    classes.value = classesData || []

    if (classes.value.length > 0) {
      selectedClass.value = classes.value[0].id
    }

    // Fetch sections
    const sectionsData = await SectionService.getSections()
    console.log('Sections data:', sectionsData)
    sections.value = sectionsData || []

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
    const studentsData = await StudentService.getStudentsByClassAndSection(
      selectedClass.value,
      selectedSection.value
    )

    console.log('Students data:', studentsData)
    students.value = studentsData

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
  console.log('HANDLER CALLED: Student selected from wheel:', student)

  // إذا كان الطالب null، نعيد تعيين selectedStudent
  if (student === null) {
    selectedStudent.value = null;
    console.log('Reset selectedStudent to null');
    return;
  }

  // التأكد من أن الطالب موجود قبل تعيينه
  if (student && student.id) {
    console.log('VALID STUDENT RECEIVED:', student.name, 'with ID:', student.id);

    // استخدام الوظيفة المساعدة لتحديث الطالب المختار
    updateSelectedStudent(student);

    // للتأكد من تحديث الواجهة، نقوم بتحديث الطالب مرة أخرى بعد فترة قصيرة
    setTimeout(() => {
      updateSelectedStudent(student);
      console.log('RE-UPDATED selectedStudent.value after delay');
    }, 200);
  } else {
    console.error('Invalid student object received:', student);

    // إذا كان الطالب غير صالح، نحاول الحصول على طالب عشوائي من الخدمة
    if (selectedClass.value && selectedSection.value) {
      RandomPickerService.getRandomStudent(selectedClass.value, selectedSection.value)
        .then(randomStudent => {
          console.log('Random student from service (fallback in handler):', randomStudent);
          updateSelectedStudent(randomStudent);
        })
        .catch(error => {
          console.error('Error getting random student from service:', error);
        });
    }
  }
}

// وظيفة مساعدة لتحديث الطالب المختار مباشرة
const updateSelectedStudent = (student) => {
  console.log('DIRECT UPDATE: Setting selectedStudent to:', student);
  if (student && student.id) {
    // نسخ الطالب لتجنب مشاكل المراجع
    const studentCopy = {
      ...student,
      // التأكد من وجود جميع الحقول المطلوبة
      name: student.name || 'طالب',
      class_name: student.class_name || '',
      section: student.section || '',
      image: student.image || student.photo_url || null
    };

    // تعيين الطالب المختار مباشرة
    selectedStudent.value = studentCopy;
    console.log('UPDATED selectedStudent.value:', selectedStudent.value);

    // تطبيق التأثير الحركي
    const box = document.querySelector('.selected-student-box');
    if (box) {
      box.classList.remove('student-selected-animation');
      setTimeout(() => {
        box.classList.add('student-selected-animation');
      }, 10);
    }

    // تشغيل صوت النجاح
    try {
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (audioError) {
      console.log('تعذر تشغيل الصوت:', audioError);
    }

    // للتأكد من تحديث الواجهة، نقوم بتحديث الطالب مرة أخرى بعد فترة قصيرة
    setTimeout(() => {
      // إعادة تعيين الطالب للتأكد من تحديث الواجهة
      selectedStudent.value = { ...studentCopy };
      console.log('RE-UPDATED selectedStudent.value after delay in updateSelectedStudent');
    }, 100);
  }
};

// تدوير العجلة لاختيار طالب عشوائي
const pickRandomStudent = async () => {
  console.log('pickRandomStudent called')
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

  try {
    // إذا لم تكن هناك عجلة أو كانت هناك مشكلة في العجلة، نستخدم الخدمة مباشرة
    if (!wheelRef.value) {
      console.log('wheelRef is not available, using RandomPickerService directly');
      // استخدام RandomPickerService للحصول على طالب عشوائي
      const randomStudent = await RandomPickerService.getRandomStudent(selectedClass.value, selectedSection.value);
      console.log('Random student from service:', randomStudent);
      updateSelectedStudent(randomStudent);
      return;
    }

    // إذا كانت العجلة متاحة، نستخدمها
    console.log('Spinning wheel...');
    wheelRef.value.spinWheel();

    // للتأكد من أن الطالب سيظهر، نستخدم الخدمة بعد فترة قصيرة إذا لم يتم تحديث الطالب
    setTimeout(async () => {
      if (!selectedStudent.value) {
        console.log('No student selected after wheel spin, using RandomPickerService as fallback');
        try {
          const randomStudent = await RandomPickerService.getRandomStudent(selectedClass.value, selectedSection.value);
          console.log('Random student from service (fallback):', randomStudent);
          updateSelectedStudent(randomStudent);
        } catch (fallbackError) {
          console.error('Error in fallback random selection:', fallbackError);
        }
      }
    }, 4000); // انتظار 4 ثواني للتأكد من انتهاء دوران العجلة
  } catch (error) {
    console.error('Error in pickRandomStudent:', error);

    // في حالة الخطأ، نختار طالبًا عشوائيًا من القائمة المتاحة
    const randomIndex = Math.floor(Math.random() * availableStudents.length);
    const randomStudent = availableStudents[randomIndex];
    updateSelectedStudent(randomStudent);
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

    console.log('Creating random groups...')
    const groupsData = await RandomPickerService.createRandomGroups(
      selectedClass.value,
      selectedSection.value,
      groupCount.value
    )

    console.log('Random groups data:', groupsData)

    // إضافة تأخير قبل عرض النتيجة النهائية
    await new Promise(resolve => setTimeout(resolve, 300))

    // عرض المجموعات المنشأة
    groups.value = groupsData

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

// Watch for changes in selectedStudent
watch(selectedStudent, (newValue) => {
  console.log('WATCHER: selectedStudent changed:', newValue)

  // Force UI update when selectedStudent changes
  if (newValue) {
    // Apply animation to the box
    const box = document.querySelector('.selected-student-box');
    if (box) {
      box.classList.remove('student-selected-animation');
      setTimeout(() => {
        box.classList.add('student-selected-animation');
      }, 10);
    }
  }
})

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

/* تنسيقات النافذة المنبثقة */
.student-dialog-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5), 0 0 50px rgba(var(--v-theme-primary), 0.3);
  animation: pulse 2s infinite;
  transform-origin: center;
  animation: scaleIn 0.5s ease-out;
}

.student-image-container {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 3px solid #1976d2;
}

.student-result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.student-image-container:hover .student-result-image {
  transform: scale(1.05);
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

/* تنسيقات مربع الطالب المختار في الأسفل */
.selected-student-box {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-out;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.selected-student-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
}

.v-theme--dark .selected-student-box {
  border-color: rgba(var(--v-theme-primary), 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
}

/* تأثير حركي عند اختيار طالب جديد */
@keyframes celebrateSelection {
  0% { transform: scale(0.95); box-shadow: 0 0 0 rgba(var(--v-theme-primary), 0); }
  50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(var(--v-theme-primary), 0.3); }
  100% { transform: scale(1); box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.1); }
}

.student-selected-animation {
  animation: celebrateSelection 0.8s ease-out;
}
</style>
