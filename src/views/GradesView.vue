<template>
  <div class="grades-page" dir="rtl">
    <!-- رأس الصفحة -->
    <v-card class="grades-header-card mb-4 elevation-2">
      <v-toolbar color="primary" flat class="px-2 rounded-t">
        <v-toolbar-title class="text-white d-flex align-center">
          <v-icon size="large" class="ms-2">mdi-clipboard-text-outline</v-icon>
          <span class="text-h5 font-weight-bold">صفحة الدرجات</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" color="white" prepend-icon="mdi-filter-variant" class="ms-2" @click="showFilters = !showFilters">
          الفلاتر
          <v-icon end>{{ showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
        <v-btn color="white" variant="tonal" prepend-icon="mdi-plus" @click="showAddAssignmentDialog = true">
          إضافة واجب
        </v-btn>
      </v-toolbar>
      <v-expand-transition>
        <div v-if="showFilters" class="pa-4 bg-primary-lighten-5">
          <GradesFilters
            :classes="classes"
            :sections="sections"
            :subjects="subjects"
            v-model:class="selectedClass"
            v-model:section="selectedSection"
            v-model:subject="selectedSubject"
            v-model:date="selectedDate"
            @change="onFiltersChange"
          />
        </div>
      </v-expand-transition>
    </v-card>

    <!-- الواجبات -->
    <GradesAssignments
      :assignments="assignments"
      :current-assignment="currentAssignment"
      :pending-count="pendingSubmissionsCount"
      :is-due-soon="isAssignmentDueSoon"
      @select="setActiveAssignment"
      @add="showAddAssignmentDialog = true"
      @edit="showEditAssignmentDialog = true"
      @delete="deleteCurrentAssignment"
      @mark-all="markAllSubmitted"
    />

    <!-- جدول الطلاب -->
    <GradesStudentsTable
      :headers="headers"
      :students="students"
      :search="search"
      :loading="loading"
      :current-assignment="currentAssignment"
      :pagination="pagination"
      @save-grade="saveGrade"
      @save-attendance="saveAttendance"
      @save-assignment="saveAssignmentSubmission"
      @save-note="saveNote"
      @open-details="openStudentDetails"
      @pagination-change="onPaginationChange"
    />

    <!-- الحوارات -->
    <GradesDialogs
      :show-add-assignment="showAddAssignmentDialog"
      :show-edit-assignment="showEditAssignmentDialog"
      :show-student-details="showStudentDetailsDialog"
      :show-edit-note="showEditNoteDialog"
      :show-edit-attendance="showEditAttendanceDialog"
      :new-assignment="newAssignment"
      :current-assignment="currentAssignment"
      :selected-student="selectedStudent"
      :student-grades="studentGrades"
      :student-attendance="studentAttendance"
      :student-assignments="studentAssignments"
      :student-notes="studentNotes"
      :edited-note="editedNote"
      :edited-attendance="editedAttendance"
      :is-submitting="isSubmitting"
      @add-assignment="addAssignment"
      @update-assignment="updateCurrentAssignment"
      @update-note="updateNoteRecord"
      @update-attendance="updateAttendanceRecord"
      @delete-note="deleteNoteRecord"
      @delete-attendance="deleteAttendanceRecord"
      @close="closeDialog"
    />

    <!-- نافذة التشجيع -->
    <EncouragementDialog
      :show="showEncouragementDialog"
      @update:show="showEncouragementDialog = $event"
      :student-name="encouragementStudent.name"
      :student-image="encouragementStudent.image"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import GradesFilters from '@/components/class/GradesFilters.vue'
import GradesAssignments from '@/components/class/GradesAssignments.vue'
import GradesStudentsTable from '@/components/class/GradesStudentsTable.vue'
import GradesDialogs from '@/components/class/GradesDialogs.vue'
import EncouragementDialog from '@/components/EncouragementDialog.vue'
import { useGradesStore } from '@/stores/gradesStore'

const showFilters = ref(true)
const search = ref('')
const loading = ref(false)

const classes = ref([])
const sections = ref([])
const subjects = ref([])
const students = ref([])
const assignments = ref([])
const currentAssignment = ref(null)
const selectedClass = ref(null)
const selectedSection = ref(null)
const selectedSubject = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])

const showAddAssignmentDialog = ref(false)
const showEditAssignmentDialog = ref(false)
const showStudentDetailsDialog = ref(false)
const showEditNoteDialog = ref(false)
const showEditAttendanceDialog = ref(false)

const newAssignment = ref({})
const selectedStudent = ref(null)
const studentGrades = ref([])
const studentAttendance = ref([])
const studentAssignments = ref([])
const studentNotes = ref([])
const editedNote = ref({})
const editedAttendance = ref({})
const isSubmitting = ref(false)

const pendingSubmissionsCount = ref(0)
const isAssignmentDueSoon = ref(false)

const encouragementStudent = ref({ name: '', image: '' })
const showEncouragementDialog = ref(false)

const headers = ref([
  { title: 'الصورة', key: 'image', align: 'center', sortable: false },
  { title: 'الاسم', key: 'name', align: 'start' },
  { title: 'الصف', key: 'class_name', align: 'start' },
  { title: 'الفصل', key: 'section', align: 'start' },
  { title: 'الملاحظات', key: 'notes', align: 'center', sortable: false },
  { title: 'الواجبات', key: 'assignments', align: 'center', sortable: false },
  { title: 'الحضور', key: 'attendance', align: 'center', sortable: false },
  { title: 'المجموع (100)', key: 'total', align: 'center' },
  { title: 'النهائي (40)', key: 'final', align: 'center' },
  { title: 'القرآن (20)', key: 'quran', align: 'center' },
  { title: 'المشاركة (10)', key: 'participation', align: 'center' },
  { title: 'الواجبات (10)', key: 'homework', align: 'center' },
  { title: 'الشفوي (5)', key: 'practical', align: 'center' },
  { title: 'النظري (15)', key: 'theory', align: 'center' }
])

const pagination = ref({
  page: 1,
  itemsPerPage: 10,
  pageCount: 1,
  start: 1,
  end: 10
})

const gradesStore = useGradesStore()

onMounted(async () => {
  // تحميل البيانات الأولية (سيتم تحسينها لاحقًا)
  await loadInitialData()
})

async function loadInitialData() {
  loading.value = true
  try {
    await Promise.all([
      fetchClasses(),
      fetchSections(),
      fetchSubjects()
    ])
    await fetchStudents()
    await fetchAssignments()
  } finally {
    loading.value = false
  }
}

async function fetchClasses() {
  const res = await gradesStore.fetchClasses()
  classes.value = res || []
  if (classes.value.length > 0) selectedClass.value = classes.value[0].id
}
async function fetchSections() {
  const res = await gradesStore.fetchSections()
  sections.value = res || []
  if (sections.value.length > 0) selectedSection.value = sections.value[0].id
}
async function fetchSubjects() {
  const res = await gradesStore.fetchSubjects()
  subjects.value = res || []
  if (subjects.value.length > 0) selectedSubject.value = subjects.value[0].id
}
async function fetchStudents() {
  if (!selectedClass.value || !selectedSection.value || !selectedSubject.value) return
  students.value = await gradesStore.fetchStudentsByClassAndSection(selectedClass.value, selectedSection.value) || []
}
async function fetchAssignments() {
  if (!selectedSubject.value) return
  assignments.value = await gradesStore.fetchAssignmentsBySubject(selectedSubject.value) || []
  currentAssignment.value = assignments.value.length > 0 ? assignments.value[0] : null
}

function onFiltersChange() {
  fetchStudents()
  fetchAssignments()
}

function setActiveAssignment(assignment) {
  currentAssignment.value = assignment
}

/*
  سيتم تنفيذ الدوال التالية في المكونات الفرعية عند البناء الكامل:
  - saveGrade
  - saveAttendance
  - saveAssignmentSubmission
  - saveNote
  - openStudentDetails
  - addAssignment
  - updateCurrentAssignment
  - deleteCurrentAssignment
  - markAllSubmitted
  - updateNoteRecord
  - updateAttendanceRecord
  - deleteNoteRecord
  - deleteAttendanceRecord
*/
function closeDialog() {
  showAddAssignmentDialog.value = false
  showEditAssignmentDialog.value = false
  showStudentDetailsDialog.value = false
  showEditNoteDialog.value = false
  showEditAttendanceDialog.value = false
}
function onPaginationChange(paginationData) {
  pagination.value = paginationData
}
</script>

<style scoped>
.grades-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding-bottom: 60px;
  text-align: right;
  background: #f7fafd;
}
.grades-header-card {
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 24px;
}
</style>
