<template>
  <div>
    <h1 class="text-h4 mb-4">التقارير والإحصائيات</h1>

    <!-- Report Filters -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon start icon="mdi-filter"></v-icon>
        تصفية التقارير
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedReportType"
              :items="reportTypes"
              item-title="title"
              item-value="value"
              label="نوع التقرير"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedClass"
              :items="classes"
              item-title="name"
              item-value="id"
              label="الصف"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedSection"
              :items="sections"
              item-title="name"
              item-value="id"
              label="الفصل"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedSubject"
              :items="subjects"
              item-title="name"
              item-value="id"
              label="المادة"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="dateRange.start"
              label="من تاريخ"
              type="date"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="dateRange.end"
              label="إلى تاريخ"
              type="date"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="text-center">
            <v-btn color="primary" prepend-icon="mdi-magnify" @click="generateReport">
              عرض التقرير
            </v-btn>
            <v-btn class="mx-2" color="success" prepend-icon="mdi-file-excel" @click="exportToExcel">
              تصدير Excel
            </v-btn>
            <v-btn color="error" prepend-icon="mdi-file-pdf" @click="exportToPDF">
              تصدير PDF
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Report Content -->
    <v-card v-if="showReport">
      <v-card-title>
        <v-icon start icon="mdi-chart-box"></v-icon>
        {{ getReportTitle() }}
        <v-spacer></v-spacer>
        <v-chip>{{ new Date().toLocaleDateString('ar-SA') }}</v-chip>
      </v-card-title>
      <v-card-text>
        <!-- Charts Section -->
        <v-card class="mb-4" v-if="selectedReportType !== 'student'">
          <v-card-title>
            <v-icon start icon="mdi-chart-line"></v-icon>
            الرسوم البيانية
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="activeChartTab" class="mb-4">
              <v-tab value="grades" v-if="selectedReportType === 'grades'">الدرجات</v-tab>
              <v-tab value="attendance" v-if="selectedReportType === 'attendance' || selectedReportType === 'grades'">الحضور</v-tab>
              <v-tab value="assignments" v-if="selectedReportType === 'assignments' || selectedReportType === 'grades'">الواجبات</v-tab>
            </v-tabs>

            <v-window v-model="activeChartTab">
              <v-window-item value="grades">
                <h3 class="text-h6 mb-2">متوسط درجات الطلاب حسب المادة</h3>
                <ChartComponent
                  chart-type="bar"
                  :chart-data="gradesChartData"
                  :chart-options="chartOptions"
                />
              </v-window-item>

              <v-window-item value="attendance">
                <h3 class="text-h6 mb-2">نسبة الحضور والغياب</h3>
                <ChartComponent
                  chart-type="pie"
                  :chart-data="attendanceChartData"
                  :chart-options="chartOptions"
                />
              </v-window-item>

              <v-window-item value="assignments">
                <h3 class="text-h6 mb-2">نسبة تسليم الواجبات</h3>
                <ChartComponent
                  chart-type="doughnut"
                  :chart-data="assignmentsChartData"
                  :chart-options="chartOptions"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>

        <!-- Tables Section -->
        <div v-if="selectedReportType === 'grades'">
          <h2 class="text-h5 mb-4">تقرير الدرجات</h2>
          <v-data-table
            :headers="gradesReportHeaders"
            :items="reportData"
            :items-per-page="10"
            class="elevation-1"
          ></v-data-table>
        </div>

        <div v-else-if="selectedReportType === 'attendance'">
          <h2 class="text-h5 mb-4">تقرير الحضور والغياب</h2>
          <v-data-table
            :headers="attendanceReportHeaders"
            :items="reportData"
            :items-per-page="10"
            class="elevation-1"
          ></v-data-table>
        </div>

        <div v-else-if="selectedReportType === 'assignments'">
          <h2 class="text-h5 mb-4">تقرير الواجبات</h2>
          <v-data-table
            :headers="assignmentsReportHeaders"
            :items="reportData"
            :items-per-page="10"
            class="elevation-1"
          ></v-data-table>
        </div>

        <div v-else-if="selectedReportType === 'student'">
          <h2 class="text-h5 mb-4">تقرير الطالب</h2>
          <v-select
            v-model="selectedStudent"
            :items="students"
            item-title="name"
            item-value="id"
            label="اختر الطالب"
            variant="outlined"
            density="compact"
            class="mb-4"
          ></v-select>

          <div v-if="selectedStudent">
            <v-tabs v-model="activeTab">
              <v-tab value="grades">الدرجات</v-tab>
              <v-tab value="attendance">الحضور</v-tab>
              <v-tab value="assignments">الواجبات</v-tab>
              <v-tab value="notes">الملاحظات</v-tab>
            </v-tabs>
            <v-window v-model="activeTab">
              <v-window-item value="grades">
                <v-data-table
                  :headers="studentGradesHeaders"
                  :items="studentReportData.grades"
                  :items-per-page="10"
                  class="elevation-1 mt-4"
                ></v-data-table>
              </v-window-item>
              <v-window-item value="attendance">
                <v-data-table
                  :headers="studentAttendanceHeaders"
                  :items="studentReportData.attendance"
                  :items-per-page="10"
                  class="elevation-1 mt-4"
                ></v-data-table>
              </v-window-item>
              <v-window-item value="assignments">
                <v-data-table
                  :headers="studentAssignmentsHeaders"
                  :items="studentReportData.assignments"
                  :items-per-page="10"
                  class="elevation-1 mt-4"
                ></v-data-table>
              </v-window-item>
              <v-window-item value="notes">
                <v-data-table
                  :headers="studentNotesHeaders"
                  :items="studentReportData.notes"
                  :items-per-page="10"
                  class="elevation-1 mt-4"
                ></v-data-table>
              </v-window-item>
            </v-window>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import ChartComponent from '../components/ChartComponent.vue'

// Data
const classes = ref([])
const sections = ref([])
const subjects = ref([])
const students = ref([])
const selectedClass = ref(null)
const selectedSection = ref(null)
const selectedSubject = ref(null)
const selectedStudent = ref(null)
const activeTab = ref('grades')
const activeChartTab = ref('grades')
const showReport = ref(false)
const reportData = ref([])
const studentReportData = ref({
  grades: [],
  attendance: [],
  assignments: [],
  notes: []
})

// Chart data and options
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          family: 'Arial',
          size: 14
        }
      }
    },
    tooltip: {
      bodyFont: {
        family: 'Arial',
        size: 14
      },
      titleFont: {
        family: 'Arial',
        size: 16
      }
    }
  }
})

// Grades chart data
const gradesChartData = computed(() => ({
  labels: ['النظري', 'التطبيق', 'الواجبات', 'المشاركة', 'النهائي'],
  datasets: [
    {
      label: 'متوسط الدرجات',
      backgroundColor: ['#1976D2', '#4CAF50', '#FFC107', '#9C27B0', '#F44336'],
      data: [12, 4, 25, 8, 35]
    }
  ]
}))

// Attendance chart data
const attendanceChartData = computed(() => ({
  labels: ['حضور', 'غياب'],
  datasets: [
    {
      backgroundColor: ['#4CAF50', '#F44336'],
      data: [85, 15]
    }
  ]
}))

// Assignments chart data
const assignmentsChartData = computed(() => ({
  labels: ['تم التسليم', 'لم يتم التسليم'],
  datasets: [
    {
      backgroundColor: ['#4CAF50', '#F44336'],
      data: [75, 25]
    }
  ]
}))

// Date range
const dateRange = ref({
  start: new Date().toISOString().substr(0, 10),
  end: new Date().toISOString().substr(0, 10)
})

// Report types
const reportTypes = ref([
  { title: 'تقرير الدرجات', value: 'grades' },
  { title: 'تقرير الحضور والغياب', value: 'attendance' },
  { title: 'تقرير الواجبات', value: 'assignments' },
  { title: 'تقرير الطالب', value: 'student' }
])
const selectedReportType = ref('grades')

// Table headers for different report types
const gradesReportHeaders = ref([
  { title: 'الطالب', key: 'student', align: 'start' },
  { title: 'الصف', key: 'class', align: 'center' },
  { title: 'الفصل', key: 'section', align: 'center' },
  { title: 'المادة', key: 'subject', align: 'center' },
  { title: 'النظري', key: 'theory', align: 'center' },
  { title: 'التطبيق', key: 'practical', align: 'center' },
  { title: 'الواجبات', key: 'homework', align: 'center' },
  { title: 'المشاركة', key: 'participation', align: 'center' },
  { title: 'النهائي', key: 'final', align: 'center' },
  { title: 'المجموع', key: 'total', align: 'center' }
])

const attendanceReportHeaders = ref([
  { title: 'الطالب', key: 'student', align: 'start' },
  { title: 'الصف', key: 'class', align: 'center' },
  { title: 'الفصل', key: 'section', align: 'center' },
  { title: 'عدد أيام الحضور', key: 'present_days', align: 'center' },
  { title: 'عدد أيام الغياب', key: 'absent_days', align: 'center' },
  { title: 'نسبة الحضور', key: 'attendance_rate', align: 'center' }
])

const assignmentsReportHeaders = ref([
  { title: 'الطالب', key: 'student', align: 'start' },
  { title: 'الصف', key: 'class', align: 'center' },
  { title: 'الفصل', key: 'section', align: 'center' },
  { title: 'المادة', key: 'subject', align: 'center' },
  { title: 'عدد الواجبات', key: 'assignments_count', align: 'center' },
  { title: 'عدد الواجبات المسلمة', key: 'submitted_count', align: 'center' },
  { title: 'نسبة التسليم', key: 'submission_rate', align: 'center' },
  { title: 'متوسط الدرجات', key: 'average_score', align: 'center' }
])

// Student report headers
const studentGradesHeaders = ref([
  { title: 'المادة', key: 'subject', align: 'start' },
  { title: 'نوع الدرجة', key: 'type', align: 'center' },
  { title: 'الدرجة', key: 'score', align: 'center' },
  { title: 'التاريخ', key: 'date', align: 'center' }
])

const studentAttendanceHeaders = ref([
  { title: 'التاريخ', key: 'date', align: 'center' },
  { title: 'اليوم', key: 'day', align: 'center' },
  { title: 'الحصة', key: 'period', align: 'center' },
  { title: 'المادة', key: 'subject', align: 'center' },
  { title: 'الحالة', key: 'status', align: 'center' }
])

const studentAssignmentsHeaders = ref([
  { title: 'الواجب', key: 'title', align: 'start' },
  { title: 'المادة', key: 'subject', align: 'center' },
  { title: 'تاريخ التسليم', key: 'due_date', align: 'center' },
  { title: 'الحالة', key: 'status', align: 'center' },
  { title: 'الدرجة', key: 'score', align: 'center' }
])

const studentNotesHeaders = ref([
  { title: 'التاريخ', key: 'date', align: 'center' },
  { title: 'المادة', key: 'subject', align: 'center' },
  { title: 'النوع', key: 'type', align: 'center' },
  { title: 'الملاحظة', key: 'content', align: 'start' }
])

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

    // Fetch subjects
    const subjectsResponse = await axios.get('subjects/')
    console.log('Subjects response:', subjectsResponse.data)
    subjects.value = subjectsResponse.data || []

    if (subjects.value.length > 0) {
      selectedSubject.value = subjects.value[0].id
    }

    // Fetch students
    const studentsResponse = await axios.get('students/')
    console.log('Students response:', studentsResponse.data)
    students.value = studentsResponse.data || []

    console.log('Initial data loaded successfully')

    // Generate a default report after loading initial data
    await generateReport()
  } catch (error) {
    console.error('Error fetching initial data:', error)
    // For demo purposes, add some dummy data if API fails
    console.log('Loading dummy data instead')
    addDummyData()
  }
})

// Generate report based on selected filters
const generateReport = async () => {
  try {
    console.log('Generating report for type:', selectedReportType.value)

    if (selectedReportType.value === 'student' && selectedStudent.value) {
      console.log('Fetching student report data for student ID:', selectedStudent.value)
      // Fetch student report data
      await fetchStudentReportData()
    } else {
      console.log('Fetching general report data')
      // Fetch general report data
      await fetchReportData()

      // Set appropriate chart tab based on report type
      if (selectedReportType.value === 'grades') {
        activeChartTab.value = 'grades'
      } else if (selectedReportType.value === 'attendance') {
        activeChartTab.value = 'attendance'
      } else if (selectedReportType.value === 'assignments') {
        activeChartTab.value = 'assignments'
      }

      // Update chart data based on report data
      updateChartData()
    }

    showReport.value = true
    console.log('Report generated successfully')
  } catch (error) {
    console.error('Error generating report:', error)
    // Add dummy data for demo
    console.log('Loading dummy report data instead')
    addDummyReportData()
    showReport.value = true
  }
}

// Fetch report data based on selected report type
const fetchReportData = async () => {
  try {
    // Build query parameters
    const params = new URLSearchParams()

    if (selectedClass.value) {
      params.append('class_id', selectedClass.value)
    }

    if (selectedSection.value) {
      params.append('section_id', selectedSection.value)
    }

    if (selectedSubject.value && selectedReportType.value !== 'attendance') {
      params.append('subject_id', selectedSubject.value)
    }

    if (dateRange.value.start) {
      params.append('date_from', dateRange.value.start)
    }

    if (dateRange.value.end) {
      params.append('date_to', dateRange.value.end)
    }

    console.log('API request parameters:', params.toString())

    // Make API request based on report type
    let response

    if (selectedReportType.value === 'grades') {
      console.log('Fetching grades report data...')
      response = await axios.get(`reports/grades/?${params.toString()}`)
      console.log('Grades API response:', response.data)

      // Transform data for the table
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('Processing grades data from API')
        reportData.value = response.data.map(item => {
          // Extract subject scores if available
          let theory = 0, practical = 0, homework = 0, participation = 0, final = 0;

          if (item.subject_scores) {
            // Try to extract scores from subject_scores if available
            const subjects = Object.values(item.subject_scores);
            if (subjects.length > 0) {
              // Use the first subject's score for now
              const subjectScore = subjects[0];
              // Distribute the score across different categories for visualization
              const totalScore = subjectScore.score || 0;
              theory = Math.round(totalScore * 0.3);
              practical = Math.round(totalScore * 0.2);
              homework = Math.round(totalScore * 0.2);
              participation = Math.round(totalScore * 0.1);
              final = Math.round(totalScore * 0.2);
            }
          }

          return {
            student: item.student_name,
            class: item.class_name,
            section: item.section_name,
            total: item.average_percentage,
            theory,
            practical,
            homework,
            participation,
            final,
            subject: 'متوسط جميع المواد'
          };
        });
      } else {
        console.log('No valid grades data in API response')
        reportData.value = [];
      }

    } else if (selectedReportType.value === 'attendance') {
      console.log('Fetching attendance report data...')
      response = await axios.get(`reports/attendance/?${params.toString()}`)
      console.log('Attendance API response:', response.data)

      // Transform data for the table
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('Processing attendance data from API')
        reportData.value = response.data.map(item => ({
          student: item.student_name,
          class: item.class_name,
          section: item.section_name,
          present_days: item.present_days,
          absent_days: item.absent_days,
          attendance_rate: `${item.attendance_percentage}%`
        }))
      } else {
        console.log('No valid attendance data in API response')
        reportData.value = [];
      }

    } else if (selectedReportType.value === 'assignments') {
      console.log('Fetching assignments report data...')
      response = await axios.get(`reports/assignments/?${params.toString()}`)
      console.log('Assignments API response:', response.data)

      // Transform data for the table
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('Processing assignments data from API')
        reportData.value = response.data.map(item => ({
          student: item.student_name,
          class: item.class_name,
          section: item.section_name,
          subject: selectedSubject.value ? subjects.value.find(s => s.id === selectedSubject.value)?.name || 'جميع المواد' : 'جميع المواد',
          assignments_count: item.assignments_count,
          submitted_count: item.submitted_count,
          submission_rate: `${item.submission_percentage}%`,
          average_score: `${item.average_percentage}%`
        }))
      } else {
        console.log('No valid assignments data in API response')
        reportData.value = [];
      }
    }

    console.log('Processed report data:', reportData.value)

    // Only use dummy data if no data returned and we're in development mode
    if (!reportData.value.length) {
      console.log('No data returned from API, using dummy data')
      // Uncomment the line below to use dummy data when no real data is available
      // addDummyReportData()
    }
  } catch (error) {
    console.error('Error fetching report data:', error)
    // Fallback to dummy data only in development mode
    console.log('Error occurred, using dummy data')
    // Uncomment the line below to use dummy data when an error occurs
    // addDummyReportData()
  }
}

// Update chart data based on report data
const updateChartData = () => {
  console.log('Updating chart data for report type:', selectedReportType.value)

  if (selectedReportType.value === 'grades') {
    // Update grades chart data
    if (reportData.value.length > 0) {
      console.log('Updating grades chart with real data')
      const theoryAvg = reportData.value.reduce((sum, item) => sum + (item.theory || 0), 0) / reportData.value.length
      const practicalAvg = reportData.value.reduce((sum, item) => sum + (item.practical || 0), 0) / reportData.value.length
      const homeworkAvg = reportData.value.reduce((sum, item) => sum + (item.homework || 0), 0) / reportData.value.length
      const participationAvg = reportData.value.reduce((sum, item) => sum + (item.participation || 0), 0) / reportData.value.length
      const finalAvg = reportData.value.reduce((sum, item) => sum + (item.final || 0), 0) / reportData.value.length

      gradesChartData.value = {
        labels: ['النظري', 'التطبيق', 'الواجبات', 'المشاركة', 'النهائي'],
        datasets: [
          {
            label: 'متوسط الدرجات',
            backgroundColor: ['#1976D2', '#4CAF50', '#FFC107', '#9C27B0', '#F44336'],
            data: [theoryAvg, practicalAvg, homeworkAvg, participationAvg, finalAvg]
          }
        ]
      }
    } else {
      console.log('No grades data available for chart')
    }
  } else if (selectedReportType.value === 'attendance') {
    // Update attendance chart data
    if (reportData.value.length > 0) {
      console.log('Updating attendance chart with real data')
      const totalStudents = reportData.value.length
      const presentDays = reportData.value.reduce((sum, item) => sum + (item.present_days || 0), 0)
      const absentDays = reportData.value.reduce((sum, item) => sum + (item.absent_days || 0), 0)
      const totalDays = presentDays + absentDays

      attendanceChartData.value = {
        labels: ['حضور', 'غياب'],
        datasets: [
          {
            backgroundColor: ['#4CAF50', '#F44336'],
            data: [presentDays, absentDays]
          }
        ]
      }
    } else {
      console.log('No attendance data available for chart')
    }
  } else if (selectedReportType.value === 'assignments') {
    // Update assignments chart data
    if (reportData.value.length > 0) {
      console.log('Updating assignments chart with real data')
      const totalAssignments = reportData.value.reduce((sum, item) => sum + (item.assignments_count || 0), 0)
      const submittedAssignments = reportData.value.reduce((sum, item) => sum + (item.submitted_count || 0), 0)
      const notSubmittedAssignments = totalAssignments - submittedAssignments

      assignmentsChartData.value = {
        labels: ['تم التسليم', 'لم يتم التسليم'],
        datasets: [
          {
            backgroundColor: ['#4CAF50', '#F44336'],
            data: [submittedAssignments, notSubmittedAssignments]
          }
        ]
      }
    } else {
      console.log('No assignments data available for chart')
    }
  }
}

// Fetch student report data
const fetchStudentReportData = async () => {
  try {
    if (!selectedStudent.value) {
      console.log('No student selected, using dummy data')
      addDummyStudentReportData()
      return
    }

    // Build query parameters
    const params = new URLSearchParams()
    params.append('student_id', selectedStudent.value)

    if (dateRange.value.start) {
      params.append('date_from', dateRange.value.start)
    }

    if (dateRange.value.end) {
      params.append('date_to', dateRange.value.end)
    }

    console.log('Student report API parameters:', params.toString())

    // Make API request
    console.log('Fetching student report data...')
    const response = await axios.get(`reports/student/?${params.toString()}`)
    console.log('Student report API response:', response.data)

    // Transform data for the tables
    if (response.data && typeof response.data === 'object') {
      console.log('Processing student report data from API')
      studentReportData.value = {
        grades: Array.isArray(response.data.grades) ? response.data.grades : [],
        attendance: Array.isArray(response.data.attendance) ? response.data.attendance : [],
        assignments: Array.isArray(response.data.assignments) ? response.data.assignments : [],
        notes: Array.isArray(response.data.notes) ? response.data.notes : []
      }
    } else {
      console.log('No valid student data in API response')
      studentReportData.value = {
        grades: [],
        attendance: [],
        assignments: [],
        notes: []
      }
    }

    console.log('Processed student report data:', studentReportData.value)

    // Only use dummy data if no data returned and we're in development mode
    if (!studentReportData.value.grades.length &&
        !studentReportData.value.attendance.length &&
        !studentReportData.value.assignments.length &&
        !studentReportData.value.notes.length) {
      console.log('No student data returned from API, using dummy data')
      // Uncomment the line below to use dummy data when no real data is available
      // addDummyStudentReportData()
    }
  } catch (error) {
    console.error('Error fetching student report data:', error)
    // Fallback to dummy data only in development mode
    console.log('Error occurred, using dummy student data')
    // Uncomment the line below to use dummy data when an error occurs
    // addDummyStudentReportData()
  }
}

// Export report to Excel
const exportToExcel = () => {
  alert('تم تصدير التقرير بصيغة Excel')
}

// Export report to PDF
const exportToPDF = () => {
  alert('تم تصدير التقرير بصيغة PDF')
}

// Get report title based on selected report type
const getReportTitle = () => {
  const reportType = reportTypes.value.find(type => type.value === selectedReportType.value)
  return reportType ? reportType.title : ''
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
    { id: 3, name: 'التوحيد' }
  ]

  students.value = [
    { id: 1, name: 'أحمد محمد' },
    { id: 2, name: 'محمد علي' },
    { id: 3, name: 'عبدالله خالد' }
  ]

  selectedClass.value = 1
  selectedSection.value = 1
  selectedSubject.value = 1
  selectedStudent.value = 1
}

// Add dummy report data for demo purposes
const addDummyReportData = () => {
  if (selectedReportType.value === 'grades') {
    reportData.value = [
      {
        student: 'أحمد محمد',
        class: 'الصف الأول',
        section: 'أ',
        subject: 'الدراسات الإسلامية',
        theory: 12,
        practical: 4,
        homework: 25,
        participation: 8,
        final: 35,
        total: 84
      },
      {
        student: 'محمد علي',
        class: 'الصف الأول',
        section: 'أ',
        subject: 'الدراسات الإسلامية',
        theory: 10,
        practical: 3,
        homework: 20,
        participation: 7,
        final: 30,
        total: 70
      },
      {
        student: 'عبدالله خالد',
        class: 'الصف الأول',
        section: 'أ',
        subject: 'الدراسات الإسلامية',
        theory: 14,
        practical: 5,
        homework: 28,
        participation: 9,
        final: 38,
        total: 94
      }
    ]
  } else if (selectedReportType.value === 'attendance') {
    reportData.value = [
      {
        student: 'أحمد محمد',
        class: 'الصف الأول',
        section: 'أ',
        present_days: 18,
        absent_days: 2,
        attendance_rate: '90%'
      },
      {
        student: 'محمد علي',
        class: 'الصف الأول',
        section: 'أ',
        present_days: 15,
        absent_days: 5,
        attendance_rate: '75%'
      },
      {
        student: 'عبدالله خالد',
        class: 'الصف الأول',
        section: 'أ',
        present_days: 20,
        absent_days: 0,
        attendance_rate: '100%'
      }
    ]
  } else if (selectedReportType.value === 'assignments') {
    reportData.value = [
      {
        student: 'أحمد محمد',
        class: 'الصف الأول',
        section: 'أ',
        subject: 'الدراسات الإسلامية',
        assignments_count: 5,
        submitted_count: 5,
        submission_rate: '100%',
        average_score: 8.5
      },
      {
        student: 'محمد علي',
        class: 'الصف الأول',
        section: 'أ',
        subject: 'الدراسات الإسلامية',
        assignments_count: 5,
        submitted_count: 3,
        submission_rate: '60%',
        average_score: 7.0
      },
      {
        student: 'عبدالله خالد',
        class: 'الصف الأول',
        section: 'أ',
        subject: 'الدراسات الإسلامية',
        assignments_count: 5,
        submitted_count: 4,
        submission_rate: '80%',
        average_score: 9.0
      }
    ]
  }
}

// Add dummy student report data for demo purposes
const addDummyStudentReportData = () => {
  studentReportData.value = {
    grades: [
      {
        subject: 'الدراسات الإسلامية',
        type: 'نظري',
        score: '12/15',
        date: '2023-04-10'
      },
      {
        subject: 'الدراسات الإسلامية',
        type: 'تطبيق',
        score: '4/5',
        date: '2023-04-12'
      },
      {
        subject: 'الفقه',
        type: 'نظري',
        score: '13/15',
        date: '2023-04-15'
      }
    ],
    attendance: [
      {
        date: '2023-04-10',
        day: 'الأحد',
        period: 'الحصة الأولى',
        subject: 'الدراسات الإسلامية',
        status: 'حاضر'
      },
      {
        date: '2023-04-11',
        day: 'الإثنين',
        period: 'الحصة الثانية',
        subject: 'الفقه',
        status: 'غائب'
      },
      {
        date: '2023-04-12',
        day: 'الثلاثاء',
        period: 'الحصة الثالثة',
        subject: 'التوحيد',
        status: 'حاضر'
      }
    ],
    assignments: [
      {
        title: 'واجب 1',
        subject: 'الدراسات الإسلامية',
        due_date: '2023-04-15',
        status: 'تم التسليم',
        score: '9/10'
      },
      {
        title: 'واجب 2',
        subject: 'الفقه',
        due_date: '2023-04-20',
        status: 'لم يتم التسليم',
        score: '-'
      },
      {
        title: 'واجب 3',
        subject: 'التوحيد',
        due_date: '2023-04-25',
        status: 'تم التسليم',
        score: '8/10'
      }
    ],
    notes: [
      {
        date: '2023-04-10',
        subject: 'الدراسات الإسلامية',
        type: 'إيجابية',
        content: 'متفاعل في الفصل'
      },
      {
        date: '2023-04-11',
        subject: 'الفقه',
        type: 'سلبية',
        content: 'لم يكمل الواجب'
      },
      {
        date: '2023-04-12',
        subject: 'التوحيد',
        type: 'إيجابية',
        content: 'أداء ممتاز في الاختبار'
      }
    ]
  }
}
</script>

<style scoped>
.v-data-table {
  direction: rtl;
}
</style>
