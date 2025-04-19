import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/apiConfig'

export const useGradesStore = defineStore('grades', () => {
  // Estado
  const students = ref({}) // Estudiantes por clase y sección
  const grades = ref({}) // Calificaciones por estudiante
  const attendance = ref({}) // Asistencia por estudiante y fecha
  const assignments = ref({}) // Asignaciones por materia
  const submissions = ref({}) // Entregas por estudiante y asignación
  const lastFetch = ref({}) // Timestamp de la última actualización

  // Inicializar objetos para evitar errores
  attendance.value = {}

  // Tiempo de caducidad de la caché (5 minutos)
  const CACHE_EXPIRY = 5 * 60 * 1000

  // Getters
  const getStudentsByClassAndSection = computed(() => {
    return (classId, sectionId) => {
      try {
        const key = `${classId}-${sectionId}`
        return students.value[key] || []
      } catch (error) {
        console.error(`Error in getStudentsByClassAndSection for class ${classId} and section ${sectionId}:`, error)
        return []
      }
    }
  })

  // تعديل: تحويل getGradesByStudent من computed إلى دالة عادية
  const getGradesByStudent = (studentId) => {
    try {
      // التأكد من وجود grades.value قبل الوصول إليه
      if (!grades.value) {
        grades.value = {}
        console.log('Initialized grades object in getGradesByStudent')
      }
      return grades.value[studentId] || []
    } catch (error) {
      console.error(`Error in getGradesByStudent for student ${studentId}:`, error)
      return []
    }
  }

  const getAttendanceByStudentAndDate = computed(() => {
    return (studentId, date) => {
      try {
        // Asegurarse de que attendance.value esté inicializado
        if (!attendance.value) {
          attendance.value = {}
          console.log(`Attendance object initialized for student ${studentId} and date ${date}`)
        }

        const key = `${studentId}-${date}`
        // Verificar si existe la clave específica
        if (!attendance.value[key]) {
          // Si no existe, devolver un objeto con valores por defecto
          return {
            student: studentId,
            date: date,
            status: 'present' // Valor por defecto
          }
        }
        return attendance.value[key]
      } catch (error) {
        console.error(`Error in getAttendanceByStudentAndDate for student ${studentId} and date ${date}:`, error)
        // Devolver un objeto con valores por defecto en caso de error
        return {
          student: studentId,
          date: date,
          status: 'present' // Valor por defecto
        }
      }
    }
  })

  const getAssignmentsBySubject = computed(() => {
    return (subjectId) => {
      try {
        return assignments.value[subjectId] || []
      } catch (error) {
        console.error(`Error in getAssignmentsBySubject for subject ${subjectId}:`, error)
        return []
      }
    }
  })

  const getSubmissionsByStudentAndAssignment = computed(() => {
    return (studentId, assignmentId) => {
      try {
        const key = `${studentId}-${assignmentId}`
        return submissions.value[key]
      } catch (error) {
        console.error(`Error in getSubmissionsByStudentAndAssignment for student ${studentId} and assignment ${assignmentId}:`, error)
        return null
      }
    }
  })

  // Verificar si los datos están en caché y son válidos
  const isCacheValid = (key) => {
    if (!lastFetch.value[key]) return false
    const now = Date.now()
    return now - lastFetch.value[key] < CACHE_EXPIRY
  }

  // Acciones
  const fetchStudentsByClassAndSection = async (classId, sectionId) => {
    const key = `students-${classId}-${sectionId}`

    // Si los datos están en caché y son válidos, no hacer la solicitud
    if (isCacheValid(key)) {
      console.log('Using cached students data for class', classId, 'section', sectionId)
      return getStudentsByClassAndSection.value(classId, sectionId)
    }

    try {
      console.log('Fetching students for class', classId, 'section', sectionId)
      const response = await api.get('students/', {
        params: {
          class_name: classId,
          section: sectionId
        }
      })

      // Guardar en caché
      const cacheKey = `${classId}-${sectionId}`
      students.value[cacheKey] = response.data
      lastFetch.value[key] = Date.now()

      return response.data
    } catch (error) {
      console.error('Error fetching students:', error)
      // Inicializar un array vacío para esta clase y sección
      const cacheKey = `${classId}-${sectionId}`
      students.value[cacheKey] = []
      lastFetch.value[key] = Date.now() // Evitar solicitudes repetidas
      return []
    }
  }

  const fetchGradesForStudents = async (studentIds) => {
    // تأكد من تهيئة كائن الدرجات
    if (!grades.value) {
      grades.value = {}
      console.log('Initialized grades object in fetchGradesForStudents')
    }

    // تسجيل معلومات تشخيصية
    console.log('Student IDs to fetch grades for:', studentIds)
    console.log('Current grades cache:', JSON.stringify(grades.value))

    // Si todos los estudiantes tienen datos en caché y son válidos, no hacer la solicitud
    const allCached = studentIds.every(id => {
      const key = `grades-${id}`
      const isValid = isCacheValid(key)
      console.log(`Cache for student ${id}: ${isValid ? 'valid' : 'invalid or missing'}`)
      return isValid
    })

    if (allCached) {
      console.log('Using cached grades data for all students')
      return studentIds.map(id => grades.value[id] || [])
    }

    try {
      console.log('Fetching grades for multiple students:', studentIds)

      // محاولة استخدام نقطة النهاية batch أولاً
      try {
        console.log('Attempting to use batch endpoint')
        const batchResponse = await api.get('grades/batch/', {
          params: {
            student_ids: studentIds.join(',')
          }
        })

        console.log('Batch endpoint response:', batchResponse.data)
        const batchResults = batchResponse.data?.results || []

        // تنظيم النتائج حسب الطالب
        studentIds.forEach(studentId => {
          const studentGrades = batchResults.filter(grade => {
            const matches = grade.student === parseInt(studentId) || grade.student === studentId
            return matches
          })
          console.log(`Grades for student ${studentId} from batch:`, studentGrades)
          grades.value[studentId] = studentGrades
          lastFetch.value[`grades-${studentId}`] = Date.now()
        })

        return batchResults
      } catch (batchError) {
        console.error('Error using batch endpoint, falling back to individual requests:', batchError)
        console.error('Error details:', batchError.response?.data || batchError.message)
      }

      // تقسيم الطلاب إلى مجموعات أصغر (10 طلاب في كل مجموعة) لتجنب الأخطاء
      const chunkSize = 10;
      const chunks = [];
      for (let i = 0; i < studentIds.length; i += chunkSize) {
          chunks.push(studentIds.slice(i, i + chunkSize));
      }

      let allResults = [];

      // جلب البيانات لكل طالب فرديًا
      for (const studentId of studentIds) {
        const key = `grades-${studentId}`;

        // استخدام الكاش إذا كان متاحًا
        if (isCacheValid(key)) {
          console.log(`Using cached data for student ${studentId}`)
          allResults = [...allResults, ...(grades.value[studentId] || [])];
          continue;
        }

        try {
          console.log(`Making individual request for student ${studentId}`)
          const response = await api.get('grades/', {
            params: {
              student: studentId
            }
          });

          console.log(`Response for student ${studentId}:`, response.data)
          const studentGrades = response.data?.results || [];
          grades.value[studentId] = studentGrades;
          lastFetch.value[key] = Date.now();
          allResults = [...allResults, ...studentGrades];
        } catch (err) {
          console.error(`Error fetching grades for student ${studentId}:`, err);
          console.error('Error details:', err.response?.data || err.message);
          grades.value[studentId] = [];
          lastFetch.value[key] = Date.now();
        }
      }

      return allResults;
    } catch (error) {
      console.error('Error fetching grades for students:', error);
      console.error('Error details:', error.response?.data || error.message);

      // استخدام الطلبات الفردية في حال فشل الطلب الرئيسي
      console.log('Falling back to individual requests');
      const results = [];

      for (const id of studentIds) {
        const key = `grades-${id}`;

        // استخدام الكاش إذا كان متاحًا
        if (isCacheValid(key)) {
          console.log(`Using cached data for student ${id}`)
          results.push(...(grades.value[id] || []));
          continue;
        }

        try {
          console.log(`Making individual request for student ${id}`)
          const response = await api.get('grades/', {
            params: { student: id }
          });

          console.log(`Response for student ${id}:`, response.data)
          const studentGrades = response.data?.results || [];
          grades.value[id] = studentGrades;
          lastFetch.value[key] = Date.now();
          results.push(...studentGrades);
        } catch (err) {
          console.error(`Error fetching grades for student ${id}:`, err);
          console.error('Error details:', err.response?.data || err.message);
          grades.value[id] = [];
          lastFetch.value[key] = Date.now();
        }
      }

      return results;
    }
  }

  const fetchAttendanceForDate = async (date, classId, sectionId) => {
    // Asegurarse de que attendance.value esté inicializado
    if (!attendance.value) {
      attendance.value = {}
    }

    const key = `attendance-${date}-${classId}-${sectionId}`

    // Si los datos están en caché y son válidos, no hacer la solicitud
    if (isCacheValid(key)) {
      console.log('Using cached attendance data for', date)
      return attendance.value
    }

    try {
      console.log('Fetching attendance for date', date)
      const response = await api.get('attendances/by_date/', {
        params: {
          date: date,
          class_name: classId,
          section: sectionId
        }
      })

      // Guardar en caché
      if (response.data) {
        response.data.forEach(record => {
          const recordKey = `${record.student}-${date}`
          attendance.value[recordKey] = record
        })
      }

      lastFetch.value[key] = Date.now()
      return response.data
    } catch (error) {
      console.error('Error fetching attendance:', error)
      // Inicializar valores por defecto para todos los estudiantes
      lastFetch.value[key] = Date.now() // Evitar solicitudes repetidas
      return []
    }
  }

  const fetchAssignmentsBySubject = async (subjectId) => {
    const key = `assignments-${subjectId}`

    // Si los datos están en caché y son válidos, no hacer la solicitud
    if (isCacheValid(key)) {
      console.log('Using cached assignments data for subject', subjectId)
      return assignments.value[subjectId] || []
    }

    try {
      console.log('Fetching assignments for subject', subjectId)
      const response = await api.get('assignments/', {
        params: {
          subject: subjectId,
          ordering: '-due_date'
        }
      })

      // Guardar en caché
      assignments.value[subjectId] = response.data || []
      lastFetch.value[key] = Date.now()

      return response.data
    } catch (error) {
      console.error('Error fetching assignments:', error)
      // Inicializar un array vacío para este subject
      if (!assignments.value[subjectId]) {
        assignments.value[subjectId] = []
      }
      lastFetch.value[key] = Date.now() // Evitar solicitudes repetidas
      return []
    }
  }

  const fetchSubmissionsForAssignment = async (assignmentId, studentIds = []) => {
    const key = `submissions-${assignmentId}`

    // Si los datos están en caché y son válidos, no hacer la solicitud
    if (isCacheValid(key)) {
      console.log('Using cached submissions data for assignment', assignmentId)
      return submissions.value
    }

    try {
      console.log('Fetching submissions for assignment', assignmentId)
      const response = await api.get('assignment-submissions/by_assignment/', {
        params: {
          assignment_id: assignmentId
        }
      })

      // Guardar en caché
      if (response.data) {
        response.data.forEach(submission => {
          const submissionKey = `${submission.student}-${assignmentId}`
          submissions.value[submissionKey] = submission
        })
      }

      lastFetch.value[key] = Date.now()
      return response.data
    } catch (error) {
      console.error('Error fetching submissions:', error)
      // Inicializar valores vacíos para todos los estudiantes
      if (studentIds.length > 0) {
        studentIds.forEach(studentId => {
          const submissionKey = `${studentId}-${assignmentId}`
          if (!submissions.value[submissionKey]) {
            submissions.value[submissionKey] = null
          }
        })
      }
      return []
    }
  }

  // Limpiar caché
  const clearCache = () => {
    students.value = {}
    grades.value = {}
    attendance.value = {}
    assignments.value = {}
    submissions.value = {}
    lastFetch.value = {}
  }

  // دوال حفظ البيانات على الخادم
  const saveGrade = async (gradeData) => {
    try {
      console.log('Saving grade:', gradeData)

      // التحقق من وجود جميع الحقول المطلوبة
      if (!gradeData.student || !gradeData.subject || !gradeData.date) {
        throw new Error('Missing required fields for grade')
      }

      // التأكد من وجود حقل type وأنه من القيم المسموح بها
      const validTypes = ['theory', 'practical', 'participation', 'quran', 'final']
      if (!gradeData.type || !validTypes.includes(gradeData.type)) {
        // إذا لم يكن موجوداً أو غير صحيح، نستخدم القيمة 'theory' كقيمة افتراضية
        console.warn(`Invalid grade type: ${gradeData.type}, using 'theory' instead`)
        gradeData.type = 'theory'
      }

      // التأكد من وجود حقل score
      if (gradeData.score === undefined) {
        gradeData.score = 0
      }

      // التأكد من وجود حقل max_score
      if (gradeData.max_score === undefined) {
        // تعيين القيمة القصوى بناءً على نوع الدرجة
        switch (gradeData.type) {
          case 'theory':
            gradeData.max_score = 15
            break
          case 'practical':
            gradeData.max_score = 5
            break
          case 'homework':
            gradeData.max_score = 10
            break
          case 'participation':
            gradeData.max_score = 10
            break
          case 'quran':
            gradeData.max_score = 20
            break
          case 'final':
            gradeData.max_score = 40
            break
          default:
            gradeData.max_score = 100
        }
      }

      // التحقق من وجود معرف للدرجة
      if (gradeData.id) {
        // تحديث درجة موجودة
        const response = await api.put(`grades/${gradeData.id}/`, gradeData)

        // تحديث الكاش
        if (response.data && grades.value[gradeData.student]) {
          const index = grades.value[gradeData.student].findIndex(g => g.id === gradeData.id)
          if (index !== -1) {
            grades.value[gradeData.student][index] = response.data
          }
        }

        return response.data
      } else {
        // البحث عن درجة موجودة بنفس النوع والتاريخ والطالب والمادة
        let existingGrade = null
        if (grades.value[gradeData.student]) {
          existingGrade = grades.value[gradeData.student].find(g =>
            g.type === gradeData.type &&
            g.date === gradeData.date &&
            g.subject === gradeData.subject
          )
        }

        if (existingGrade) {
          // تحديث درجة موجودة
          const updateData = { ...gradeData, id: existingGrade.id }
          const response = await api.put(`grades/${existingGrade.id}/`, updateData)

          // تحديث الكاش
          if (response.data && grades.value[gradeData.student]) {
            const index = grades.value[gradeData.student].findIndex(g => g.id === existingGrade.id)
            if (index !== -1) {
              grades.value[gradeData.student][index] = response.data
            }
          }

          return response.data
        } else {
          // إنشاء درجة جديدة
          const response = await api.post('grades/', gradeData)

          // تحديث الكاش
          if (response.data) {
            if (!grades.value[gradeData.student]) {
              grades.value[gradeData.student] = []
            }
            grades.value[gradeData.student].push(response.data)
          }

          return response.data
        }
      }
    } catch (error) {
      console.error('Error saving grade:', error)
      throw error
    }
  }

  const saveAttendance = async (attendanceData) => {
    try {
      console.log('Saving attendance:', attendanceData)

      // التحقق من وجود جميع الحقول المطلوبة
      if (!attendanceData.student || !attendanceData.date || !attendanceData.status) {
        throw new Error('Missing required fields for attendance')
      }

      // التحقق من وجود سجل حضور موجود لنفس الطالب والتاريخ
      const key = `${attendanceData.student}-${attendanceData.date}`
      const existingAttendance = attendance.value[key]

      // التأكد من وجود حقل schedule
      if (!attendanceData.schedule) {
        // إذا لم يكن موجوداً، نستخدم القيمة 1 كقيمة افتراضية
        attendanceData.schedule = 1
      }

      if (existingAttendance && existingAttendance.id) {
        // تحديث سجل حضور موجود
        const updateData = { ...attendanceData, id: existingAttendance.id }
        const response = await api.put(`attendances/${existingAttendance.id}/`, updateData)

        // تحديث الكاش
        if (response.data) {
          attendance.value[key] = response.data
        }

        return response.data
      } else if (attendanceData.id) {
        // تحديث سجل حضور موجود باستخدام المعرف المقدم
        const response = await api.put(`attendances/${attendanceData.id}/`, attendanceData)

        // تحديث الكاش
        if (response.data) {
          attendance.value[key] = response.data
        }

        return response.data
      } else {
        // إنشاء سجل حضور جديد
        const response = await api.post('attendances/', attendanceData)

        // تحديث الكاش
        if (response.data) {
          attendance.value[key] = response.data
        }

        return response.data
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
      throw error
    }
  }

  const saveAssignment = async (assignmentData) => {
    try {
      console.log('Saving assignment:', assignmentData)

      // التحقق من وجود جميع الحقول المطلوبة
      if (!assignmentData.title || !assignmentData.description || !assignmentData.subject) {
        throw new Error('Missing required fields for assignment')
      }

      // إضافة حقل schedule إذا لم يكن موجوداً
      if (!assignmentData.schedule) {
        assignmentData.schedule = 1
      }

      // التأكد من أن تاريخ الاستحقاق بالتنسيق الصحيح
      if (assignmentData.due_date instanceof Date) {
        assignmentData.due_date = assignmentData.due_date.toISOString().split('T')[0]
      }

      // التحقق من وجود معرف للواجب
      if (assignmentData.id && assignmentData.id.toString().indexOf('temp-') === -1) {
        // تحديث واجب موجود
        const response = await api.put(`assignments/${assignmentData.id}/`, assignmentData)

        // تحديث الكاش
        if (response.data && assignments.value[assignmentData.subject]) {
          const index = assignments.value[assignmentData.subject].findIndex(a => a.id === assignmentData.id)
          if (index !== -1) {
            assignments.value[assignmentData.subject][index] = response.data
          }
        }

        return response.data
      } else {
        // إنشاء واجب جديد
        // إزالة المعرف المؤقت إذا كان موجوداً
        if (assignmentData.id && assignmentData.id.toString().indexOf('temp-') !== -1) {
          delete assignmentData.id
        }

        const response = await api.post('assignments/', assignmentData)

        // تحديث الكاش
        if (response.data) {
          if (!assignments.value[assignmentData.subject]) {
            assignments.value[assignmentData.subject] = []
          }
          assignments.value[assignmentData.subject].push(response.data)
        }

        return response.data
      }
    } catch (error) {
      console.error('Error saving assignment:', error)
      throw error
    }
  }

  const deleteAssignment = async (assignmentId, subjectId) => {
    try {
      console.log('Deleting assignment:', assignmentId)

      // التحقق من أن المعرف ليس معرفًا مؤقتًا
      if (assignmentId && assignmentId.toString().indexOf('temp-') !== -1) {
        console.log('Skipping delete for temporary assignment ID:', assignmentId)

        // تحديث الكاش فقط للمعرفات المؤقتة
        if (assignments.value[subjectId]) {
          assignments.value[subjectId] = assignments.value[subjectId].filter(a => a.id !== assignmentId)
        }

        return true
      }

      try {
        // حذف الواجب من الخادم
        await api.delete(`assignments/${assignmentId}/`)
      } catch (deleteError) {
        console.error('Error deleting assignment from server:', deleteError)
        console.error('Error details:', deleteError.response?.data || deleteError.message)

        // إذا كان الخطأ 404 (غير موجود)، نحذف من الكاش فقط
        if (deleteError.response && deleteError.response.status === 404) {
          console.log('Assignment not found on server, removing from cache only')
        } else {
          throw deleteError
        }
      }

      // تحديث الكاش
      if (assignments.value[subjectId]) {
        assignments.value[subjectId] = assignments.value[subjectId].filter(a => a.id !== assignmentId)
      }

      return true
    } catch (error) {
      console.error('Error deleting assignment:', error)
      throw error
    }
  }

  const saveSubmission = async (submissionData) => {
    try {
      console.log('Saving submission:', submissionData)

      // التحقق من وجود معرف للتسليم
      if (submissionData.id) {
        // تحديث تسليم موجود
        const response = await api.put(`assignment-submissions/${submissionData.id}/`, submissionData)

        // تحديث الكاش
        if (response.data) {
          const key = `${response.data.student}-${response.data.assignment}`
          submissions.value[key] = response.data
        }

        return response.data
      } else {
        // إنشاء تسليم جديد
        const response = await api.post('assignment-submissions/', submissionData)

        // تحديث الكاش
        if (response.data) {
          const key = `${response.data.student}-${response.data.assignment}`
          submissions.value[key] = response.data
        }

        return response.data
      }
    } catch (error) {
      console.error('Error saving submission:', error)
      throw error
    }
  }

  /**
   * دالة حفظ مجموعة من الدرجات دفعة واحدة
   *
   * تستخدم هذه الدالة نقطة نهاية API المجمعة لحفظ مجموعة من الدرجات في طلب واحد
   * مما يحسن الأداء ويقلل من عدد الطلبات المرسلة إلى الخادم
   *
   * @param {Array} gradesDataArray - مصفوفة من بيانات الدرجات
   * @returns {Promise<Array>} - وعد بمصفوفة من الدرجات المحفوظة
   */
  const saveBatchGrades = async (gradesDataArray) => {
    try {
      console.log('Saving batch grades:', gradesDataArray)

      // التحقق من صحة البيانات المدخلة
      if (!Array.isArray(gradesDataArray)) {
        console.error('Invalid input: gradesDataArray is not an array')
        return []
      }

      if (gradesDataArray.length === 0) {
        console.warn('Empty grades array provided, nothing to save')
        return []
      }

      // تحويل بيانات الدرجات إلى التنسيق المطلوب للباك اند
      const formattedGrades = []

      for (const gradeData of gradesDataArray) {
        // التحقق من وجود الحقول المطلوبة
        if (!gradeData.student || !gradeData.subject || !gradeData.date) {
          console.warn('Skipping grade with missing required fields:', gradeData)
          continue
        }

        // إضافة كل نوع من أنواع الدرجات كسجل منفصل
        const gradeTypes = [
          { type: 'theory', score: gradeData.theory || 0, max_score: 15 },
          { type: 'practical', score: gradeData.practical || 0, max_score: 5 },
          { type: 'participation', score: (gradeData.participation || 0) + (gradeData.homework || 0), max_score: 10 },
          { type: 'quran', score: gradeData.quran || 0, max_score: 20 },
          { type: 'final', score: gradeData.final || 0, max_score: 40 }
        ]

        for (const gradeType of gradeTypes) {
          // إذا كان النوع موجود في gradeData أو كانت الدرجة أكبر من صفر
          if (gradeData[gradeType.type] !== undefined || gradeType.score > 0) {
            formattedGrades.push({
              student: gradeData.student,
              subject: gradeData.subject,
              date: gradeData.date,
              type: gradeType.type,
              score: gradeType.score,
              max_score: gradeType.max_score
            })
          }
        }
      }

      console.log('Using batch API endpoint')
      console.log('Formatted grades to save:', formattedGrades)

      if (formattedGrades.length === 0) {
        console.warn('No valid grades to save after formatting')
        return []
      }

      try {
        // استخدام نقطة النهاية المجمعة
        console.log('Making API request to grades/batch-create/')
        const response = await api.post('grades/batch-create/', {
          grades: formattedGrades
        })

        console.log('Batch save response:', response.data)

        // تحديث الكاش
        if (response.data && response.data.results) {
          console.log(`Successfully saved ${response.data.results.length} grades`)

          for (const grade of response.data.results) {
            if (!grades.value[grade.student]) {
              grades.value[grade.student] = []
            }

            // البحث عن درجة موجودة في الكاش وتحديثها
            const existingIndex = grades.value[grade.student].findIndex(g =>
              g.id === grade.id ||
              (g.type === grade.type && g.subject === grade.subject && g.date === grade.date)
            )

            if (existingIndex !== -1) {
              grades.value[grade.student][existingIndex] = grade
            } else {
              grades.value[grade.student].push(grade)
            }
          }
        }

        // إذا كانت هناك أخطاء، نسجلها في وحدة التحكم
        if (response.data && response.data.errors && response.data.errors.length > 0) {
          console.warn(`${response.data.errors.length} grades could not be saved:`, response.data.errors)
        }

        // إرجاع النتائج
        return response.data.results || []
      } catch (apiError) {
        console.error('Error using batch-create endpoint:', apiError)
        console.error('Error details:', apiError.response?.data || apiError.message)

        // في حالة فشل الطلب المجمع، نستخدم الطريقة القديمة كخطة بديلة
        throw apiError
      }
    } catch (error) {
      console.error('Error saving batch grades, falling back to individual saves:', error)

      // في حالة فشل الطلب المجمع، نستخدم الطريقة القديمة كخطة بديلة
      console.log('Using individual grade saves as fallback')

      const results = []
      for (const gradeData of gradesDataArray) {
        // التحقق من وجود الحقول المطلوبة
        if (!gradeData.student || !gradeData.subject || !gradeData.date) {
          console.warn('Skipping grade with missing required fields:', gradeData)
          continue
        }

        const gradeTypes = [
          { type: 'theory', score: gradeData.theory || 0 },
          { type: 'practical', score: gradeData.practical || 0 },
          { type: 'participation', score: (gradeData.participation || 0) + (gradeData.homework || 0) },
          { type: 'quran', score: gradeData.quran || 0 },
          { type: 'final', score: gradeData.final || 0 }
        ]

        for (const gradeType of gradeTypes) {
          // إذا كان النوع موجود في gradeData أو كانت الدرجة أكبر من صفر
          if (gradeData[gradeType.type] !== undefined || gradeType.score > 0) {
            try {
              console.log(`Saving individual ${gradeType.type} grade for student ${gradeData.student}`)
              const singleGradeData = {
                student: gradeData.student,
                subject: gradeData.subject,
                date: gradeData.date,
                type: gradeType.type,
                score: gradeType.score
              }

              const result = await saveGrade(singleGradeData)
              console.log(`Successfully saved ${gradeType.type} grade:`, result)
              results.push(result)
            } catch (err) {
              console.error(`Error saving individual ${gradeType.type} grade:`, err)
              console.error('Error details:', err.response?.data || err.message)
            }
          }
        }
      }

      return results
    }
  }

  /**
   * دالة حفظ مجموعة من سجلات الحضور دفعة واحدة
   *
   * تستخدم هذه الدالة نقطة نهاية API المجمعة لحفظ مجموعة من سجلات الحضور في طلب واحد
   * مما يحسن الأداء ويقلل من عدد الطلبات المرسلة إلى الخادم
   *
   * @param {Array} attendanceDataArray - مصفوفة من بيانات الحضور
   * @returns {Promise<Array>} - وعد بمصفوفة من سجلات الحضور المحفوظة
   */
  const saveBatchAttendance = async (attendanceDataArray) => {
    try {
      console.log('Saving batch attendance:', attendanceDataArray)

      // تحويل بيانات الحضور إلى التنسيق المطلوب للباك اند
      const formattedAttendance = attendanceDataArray.map(record => {
        // التأكد من وجود حقل schedule
        return !record.schedule ? { ...record, schedule: 1 } : record
      })

      console.log('Using new batch API endpoint')
      console.log('Formatted attendance:', formattedAttendance)

      // استخدام نقطة النهاية المجمعة الجديدة
      const response = await api.post('attendances/batch-create/', {
        attendance: formattedAttendance
      })

      console.log('Batch save response:', response.data)

      // تحديث الكاش
      if (response.data && response.data.results) {
        for (const record of response.data.results) {
          const key = `${record.student}-${record.date}`
          attendance.value[key] = record
        }
      }

      // إذا كانت هناك أخطاء، نسجلها في وحدة التحكم
      if (response.data && response.data.errors && response.data.errors.length > 0) {
        console.warn('Some attendance records could not be saved:', response.data.errors)
      }

      // إرجاع النتائج
      return response.data.results || []
    } catch (error) {
      console.error('Error saving batch attendance:', error)

      // في حالة فشل الطلب المجمع، نستخدم الطريقة القديمة كخطة بديلة
      console.log('Falling back to individual attendance saves')

      const results = []
      for (const attendanceData of attendanceDataArray) {
        try {
          // التأكد من وجود حقل schedule
          const formattedData = !attendanceData.schedule ?
            { ...attendanceData, schedule: 1 } :
            attendanceData

          const result = await saveAttendance(formattedData)
          results.push(result)
        } catch (err) {
          console.error('Error saving individual attendance:', err)
        }
      }

      return results
    }
  }

  return {
    // Estado
    students,
    grades,
    attendance,
    assignments,
    submissions,

    // Getters
    getStudentsByClassAndSection,
    getGradesByStudent,
    getAttendanceByStudentAndDate,
    getAssignmentsBySubject,
    getSubmissionsByStudentAndAssignment,

    // Acciones de lectura
    fetchStudentsByClassAndSection,
    fetchGradesForStudents,
    fetchAttendanceForDate,
    fetchAssignmentsBySubject,
    fetchSubmissionsForAssignment,
    clearCache,

    // Acciones de escritura
    saveGrade,
    saveAttendance,
    saveAssignment,
    deleteAssignment,
    saveSubmission,
    saveBatchGrades,
    saveBatchAttendance
  }
})
