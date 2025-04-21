import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/apiConfig'
import GradeService from '@/services/GradeService'
import AssignmentService from '@/services/AssignmentService'
import AssignmentSubmissionService from '@/services/AssignmentSubmissionService'
import StudentService from '@/services/StudentService'
import supabase from '@/services/supabaseClient'

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

  /**
   * دالة لمسح الكاش
   * @param {string} key مفتاح الكاش (اختياري)
   */
  const clearCache = (key = null) => {
    if (key) {
      // مسح كاش محدد
      console.log(`Clearing cache for key: ${key}`)
      lastFetch.value[key] = null
    } else {
      // مسح جميع الكاش
      console.log('Clearing all cache')
      Object.keys(lastFetch.value).forEach(k => {
        lastFetch.value[k] = null
      })
    }
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

      // استخدام خدمة الطلاب للحصول على الطلاب من Supabase
      const studentsData = await StudentService.getStudentsByClassAndSection(classId, sectionId)
      console.log('Students data from Supabase:', studentsData)

      // Guardar en caché
      const cacheKey = `${classId}-${sectionId}`
      students.value[cacheKey] = studentsData
      lastFetch.value[key] = Date.now()

      return studentsData
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
      let allResults = [];

      // جلب البيانات لكل طالب فرديًا باستخدام GradeService
      for (const studentId of studentIds) {
        const key = `grades-${studentId}`;

        // استخدام الكاش إذا كان متاحًا
        if (isCacheValid(key)) {
          console.log(`Using cached data for student ${studentId}`)
          allResults = [...allResults, ...(grades.value[studentId] || [])];
          continue;
        }

        try {
          console.log(`Fetching grades for student ${studentId} using GradeService`)
          const studentGrades = await GradeService.getGradesByStudent(studentId);

          console.log(`Grades for student ${studentId}:`, studentGrades)
          grades.value[studentId] = studentGrades;
          lastFetch.value[key] = Date.now();
          allResults = [...allResults, ...studentGrades];
        } catch (err) {
          console.error(`Error fetching grades for student ${studentId}:`, err);
          grades.value[studentId] = [];
          lastFetch.value[key] = Date.now();
        }
      }

      return allResults;
    } catch (error) {
      console.error('Error fetching grades for students:', error);

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
          console.log(`Fetching grades for student ${id} using GradeService`)
          const studentGrades = await GradeService.getGradesByStudent(id);

          console.log(`Grades for student ${id}:`, studentGrades)
          grades.value[id] = studentGrades;
          lastFetch.value[key] = Date.now();
          results.push(...studentGrades);
        } catch (err) {
          console.error(`Error fetching grades for student ${id}:`, err);
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

      // استخدام خدمة الحضور للحصول على بيانات الحضور من Supabase
      const attendanceData = await GradeService.getAttendanceByDate(date, classId, sectionId)
      console.log('Attendance data from Supabase:', attendanceData)

      // Guardar en caché
      if (attendanceData && attendanceData.length > 0) {
        attendanceData.forEach(record => {
          const recordKey = `${record.student_id}-${date}`
          attendance.value[recordKey] = record
        })
      }

      lastFetch.value[key] = Date.now()
      return attendanceData
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

      // استخدام خدمة الواجبات للحصول على الواجبات
      const assignmentsData = await AssignmentService.getAssignments({ subjectId })

      // Guardar en caché
      assignments.value[subjectId] = assignmentsData || []
      lastFetch.value[key] = Date.now()

      return assignmentsData
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
      // تحويل الكائن إلى مصفوفة للحفاظ على التوافق
      const submissionsArray = Object.values(submissions.value).filter(s =>
        s && s.assignment_id === parseInt(assignmentId)
      )
      return submissionsArray
    }

    // إعادة تعيين الكاش للتأكد من تحديث البيانات
    lastFetch.value[key] = null

    try {
      console.log('Fetching submissions for assignment', assignmentId)

      // استخدام خدمة تسليمات الواجبات للحصول على التسليمات
      const submissionsData = await AssignmentSubmissionService.getSubmissionsByAssignment(assignmentId)

      // Guardar en caché
      if (submissionsData && submissionsData.length > 0) {
        submissionsData.forEach(submission => {
          const submissionKey = `${submission.student_id}-${assignmentId}`
          submissions.value[submissionKey] = submission
        })
      }

      lastFetch.value[key] = Date.now()
      return submissionsData
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



  // دوال حفظ البيانات على الخادم
  const saveGrade = async (gradeData) => {
    try {
      console.log('Saving grade:', gradeData)

      // التحقق من وجود جميع الحقول المطلوبة
      if (!gradeData.student || !gradeData.subject || !gradeData.date) {
        throw new Error('Missing required fields for grade')
      }

      // التأكد من وجود حقل type وأنه من القيم المسموح بها
      const validTypes = ['theory', 'practical', 'participation', 'quran', 'final', 'homework']
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

      // إعداد بيانات الدرجة للحفظ في Supabase
      const gradeRecord = {
        student_id: gradeData.student,
        subject_id: gradeData.subject,
        date: gradeData.date,
        grade_type: gradeData.type,
        score: gradeData.score,
        max_score: gradeData.max_score,
        notes: gradeData.notes || null
      };

      console.log('Grade record to save:', gradeRecord);

      // التحقق من وجود معرف للدرجة
      if (gradeData.id) {
        // تحديث درجة موجودة باستخدام GradeService
        console.log(`Updating grade with id ${gradeData.id} using GradeService`);
        const updatedGrade = await GradeService.updateGrade(gradeData.id, gradeRecord);

        // تحديث الكاش
        if (updatedGrade && grades.value[gradeData.student]) {
          const index = grades.value[gradeData.student].findIndex(g => g.id === gradeData.id)
          if (index !== -1) {
            grades.value[gradeData.student][index] = {
              ...updatedGrade,
              student: updatedGrade.student_id,
              subject: updatedGrade.subject_id
            }
          }

          // إعادة تعيين كاش الدرجات للطالب
          const studentCacheKey = `grades-${gradeData.student}`
          lastFetch.value[studentCacheKey] = null
        }

        return updatedGrade
      } else {
        // البحث عن درجة موجودة بنفس النوع والتاريخ والطالب والمادة
        let existingGrade = null

        // البحث في قاعدة البيانات عن درجة موجودة
        let existingGradeFromDB = null;
        try {
          const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('student_id', gradeData.student)
            .eq('subject_id', gradeData.subject)
            .eq('grade_type', gradeData.type)
            .eq('date', gradeData.date)
            .limit(1);

          if (error) {
            console.error('Error checking for existing grade:', error);
          } else if (data && data.length > 0) {
            existingGradeFromDB = data[0];
          }
        } catch (error) {
          console.error('Exception checking for existing grade:', error);
        }

        if (existingGradeFromDB) {
          existingGrade = {
            ...existingGradeFromDB,
            id: existingGradeFromDB.id,
            type: existingGradeFromDB.grade_type,
            student: existingGradeFromDB.student_id,
            subject: existingGradeFromDB.subject_id
          };
        } else if (grades.value[gradeData.student]) {
          // إذا لم نجد في قاعدة البيانات، نبحث في الكاش
          existingGrade = grades.value[gradeData.student].find(g =>
            g.type === gradeData.type &&
            g.date === gradeData.date &&
            g.subject === gradeData.subject
          )
        }

        if (existingGrade) {
          // تحديث درجة موجودة باستخدام GradeService
          console.log(`Updating existing grade with id ${existingGrade.id} using GradeService`);
          const updatedGrade = await GradeService.updateGrade(existingGrade.id, gradeRecord);

          // تحديث الكاش
          if (updatedGrade && grades.value[gradeData.student]) {
            const index = grades.value[gradeData.student].findIndex(g => g.id === existingGrade.id)
            if (index !== -1) {
              grades.value[gradeData.student][index] = {
                ...updatedGrade,
                student: updatedGrade.student_id,
                subject: updatedGrade.subject_id
              }
            }

            // إعادة تعيين كاش الدرجات للطالب
            const studentCacheKey = `grades-${gradeData.student}`
            lastFetch.value[studentCacheKey] = null
          }

          return updatedGrade
        } else {
          // إنشاء درجة جديدة باستخدام GradeService
          console.log(`Creating new grade for student ${gradeData.student} using GradeService`);
          const newGrade = await GradeService.createGrade(gradeRecord);

          // تحديث الكاش
          if (newGrade) {
            if (!grades.value[gradeData.student]) {
              grades.value[gradeData.student] = []
            }
            grades.value[gradeData.student].push({
              ...newGrade,
              student: newGrade.student_id,
              subject: newGrade.subject_id
            })

            // إعادة تعيين كاش الدرجات للطالب
            const studentCacheKey = `grades-${gradeData.student}`
            lastFetch.value[studentCacheKey] = null
          }

          return newGrade
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

      // التحقق من وجود سجل حضور في قاعدة البيانات لنفس الطالب والتاريخ
      const { data: existingRecords, error: searchError } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', attendanceData.student)
        .eq('date', attendanceData.date)

      if (searchError) {
        console.error('Error searching for existing attendance records:', searchError)
        throw searchError
      }

      // إعداد بيانات الحضور للحفظ في Supabase
      const attendanceRecord = {
        student_id: attendanceData.student,
        date: attendanceData.date,
        status: attendanceData.status,
        notes: attendanceData.notes || null
      };

      // التحقق من وجود سجل حضور موجود لنفس الطالب والتاريخ
      if (existingRecords && existingRecords.length > 0) {
        // تحديث سجل حضور موجود باستخدام Supabase
        console.log(`Updating existing attendance record with id ${existingRecords[0].id}`);

        const { data, error } = await supabase
          .from('attendance')
          .update(attendanceRecord)
          .eq('id', existingRecords[0].id)
          .select();

        if (error) {
          console.error(`Error updating attendance record:`, error);
          throw error;
        }

        // تحديث الكاش
        if (data && data.length > 0) {
          attendance.value[key] = {
            ...data[0],
            student: data[0].student_id
          }
        }

        return data[0];
      } else if (existingAttendance && existingAttendance.id) {
        // تحديث سجل حضور موجود في الكاش
        console.log(`Updating existing attendance record with id ${existingAttendance.id}`);

        const { data, error } = await supabase
          .from('attendance')
          .update(attendanceRecord)
          .eq('id', existingAttendance.id)
          .select();

        if (error) {
          console.error(`Error updating attendance record:`, error);
          throw error;
        }

        // تحديث الكاش
        if (data && data.length > 0) {
          attendance.value[key] = {
            ...data[0],
            student: data[0].student_id
          }
        }

        return data[0];
      } else if (attendanceData.id) {
        // تحديث سجل حضور موجود باستخدام المعرف المقدم
        console.log(`Updating attendance record with id ${attendanceData.id}`);

        const { data, error } = await supabase
          .from('attendance')
          .update(attendanceRecord)
          .eq('id', attendanceData.id)
          .select();

        if (error) {
          console.error(`Error updating attendance record:`, error);
          throw error;
        }

        // تحديث الكاش
        if (data && data.length > 0) {
          attendance.value[key] = {
            ...data[0],
            student: data[0].student_id
          }
        }

        return data[0];
      } else {
        // إنشاء سجل حضور جديد باستخدام Supabase
        console.log(`Creating new attendance record for student ${attendanceData.student}`);

        const { data, error } = await supabase
          .from('attendance')
          .insert([attendanceRecord])
          .select();

        if (error) {
          console.error(`Error creating attendance record:`, error);
          throw error;
        }

        // تحديث الكاش
        if (data && data.length > 0) {
          attendance.value[key] = {
            ...data[0],
            student: data[0].student_id
          }
        }

        return data[0];
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
      if (!assignmentData.title || !assignmentData.description) {
        throw new Error('Missing required fields for assignment')
      }

      // تعيين حقل schedule_id إلى null دائماً
      assignmentData.schedule_id = null

      // التأكد من أن تاريخ الاستحقاق بالتنسيق الصحيح
      if (assignmentData.due_date instanceof Date) {
        assignmentData.due_date = assignmentData.due_date.toISOString().split('T')[0]
      }

      // التأكد من وجود حقل subject_id
      if (!assignmentData.subject_id && assignmentData.subject) {
        assignmentData.subject_id = assignmentData.subject
      }

      // التحقق من وجود معرف للواجب
      let savedAssignment;

      if (assignmentData.id && assignmentData.id.toString().indexOf('temp-') === -1) {
        // تحديث واجب موجود
        savedAssignment = await AssignmentService.updateAssignment(assignmentData.id, assignmentData);

        // تحديث الكاش
        if (savedAssignment && assignments.value[assignmentData.subject_id]) {
          const index = assignments.value[assignmentData.subject_id].findIndex(a => a.id === assignmentData.id)
          if (index !== -1) {
            assignments.value[assignmentData.subject_id][index] = savedAssignment
          }
        }
      } else {
        // إنشاء واجب جديد
        // إزالة المعرف المؤقت إذا كان موجوداً
        if (assignmentData.id && assignmentData.id.toString().indexOf('temp-') !== -1) {
          delete assignmentData.id
        }

        savedAssignment = await AssignmentService.createAssignment(assignmentData);

        // تحديث الكاش
        if (savedAssignment) {
          const subjectId = savedAssignment.subject_id;
          if (!assignments.value[subjectId]) {
            assignments.value[subjectId] = []
          }
          assignments.value[subjectId].push(savedAssignment)
        }
      }

      return savedAssignment;
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
        // حذف الواجب من الخادم باستخدام خدمة الواجبات
        await AssignmentService.deleteAssignment(assignmentId)
      } catch (deleteError) {
        console.error('Error deleting assignment from server:', deleteError)

        // إذا كان الخطأ 404 (غير موجود)، نحذف من الكاش فقط
        if (deleteError.response && deleteError.response.status === 404) {
          console.log('Assignment not found on server, removing from cache only')
        } else {
          // لا نرمي الخطأ لكن نسجله فقط
          console.error('Error details:', deleteError.response?.data || deleteError.message)
        }
      }

      // تحديث الكاش
      if (assignments.value[subjectId]) {
        assignments.value[subjectId] = assignments.value[subjectId].filter(a => a.id !== assignmentId)
      }

      return true
    } catch (error) {
      console.error('Error deleting assignment:', error)
      // إرجاع false بدلاً من رمي الخطأ
      return false
    }
  }

  const saveSubmission = async (submissionData) => {
    try {
      console.log('Saving submission status:', submissionData)

      // التحقق من وجود معرف للتسليم
      let savedSubmission;

      // البحث عن تسليم موجود لنفس الطالب والواجب
      console.log(`Checking for existing submission for student ${submissionData.student} and assignment ${submissionData.assignment}`);
      const { data: existingSubmissions, error: fetchError } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', submissionData.assignment)
        .eq('student_id', submissionData.student)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing submission:', fetchError);
      }

      if (existingSubmissions) {
        // تحديث تسليم موجود
        console.log('Updating existing submission:', existingSubmissions.id);
        const { data, error } = await supabase
          .from('assignment_submissions')
          .update({
            notes: submissionData.notes,
            status: submissionData.status,
            subject_info: submissionData.subject_info || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubmissions.id)
          .select('*');

        if (error) {
          console.error('Error updating submission:', error);
          throw error;
        }

        savedSubmission = data[0];
      } else {
        // إنشاء تسليم جديد
        console.log('Creating new submission');
        const { data, error } = await supabase
          .from('assignment_submissions')
          .insert({
            assignment_id: submissionData.assignment,
            student_id: submissionData.student,
            submission_date: new Date().toISOString(),
            notes: submissionData.notes,
            status: submissionData.status,
            subject_info: submissionData.subject_info || null
          })
          .select('*');

        if (error) {
          console.error('Error creating submission:', error);
          throw error;
        }

        savedSubmission = data[0];
      }

      // تحديث الكاش
      if (savedSubmission) {
        const key = `${savedSubmission.student_id}-${savedSubmission.assignment_id}`
        submissions.value[key] = savedSubmission

        // إعادة تعيين الكاش للتأكد من تحديث البيانات عند التحميل التالي
        const cacheKey = `submissions-${savedSubmission.assignment_id}`
        lastFetch.value[cacheKey] = null

        // إعادة تعيين كاش الدرجات للتأكد من تحديث البيانات عند التحميل التالي
        if (grades.value[savedSubmission.student_id]) {
          // إعادة تعيين كاش الدرجات للطالب
          const studentCacheKey = `grades-${savedSubmission.student_id}`
          lastFetch.value[studentCacheKey] = null
        }

        // إذا كانت حالة التسليم مقدمة، نضيف درجة الواجب تلقائياً
        if (savedSubmission.status === 'submitted') {
          // الحصول على معلومات الواجب
          const { data: assignment, error: assignmentError } = await supabase
            .from('assignments')
            .select('*')
            .eq('id', savedSubmission.assignment_id)
            .single();

          if (assignmentError) {
            console.error('Error fetching assignment:', assignmentError);
          } else if (assignment) {
            console.log('Assignment found:', assignment);
            // البحث عن درجة واجب موجودة لنفس الطالب والمادة والتاريخ
            let existingGrades = null;
            try {
              const { data, error } = await supabase
                .from('grades')
                .select('*')
                .eq('student_id', savedSubmission.student_id)
                .eq('subject_id', assignment.subject_id)
                .eq('grade_type', 'homework')
                .eq('date', new Date().toISOString().split('T')[0])
                .limit(1);

              if (error) {
                console.error('Error checking for existing homework grade:', error);
              } else if (data && data.length > 0) {
                existingGrades = data[0];
              }
            } catch (error) {
              console.error('Exception checking for existing homework grade:', error);
            }

            // إذا لم تكن هناك درجة موجودة، نضيف درجة جديدة
            if (!existingGrades) {
              // إضافة درجة الواجب
              const homeworkGrade = {
                student: savedSubmission.student_id,
                subject: assignment.subject_id,
                date: new Date().toISOString().split('T')[0],
                type: 'homework',
                score: assignment.score || 10,
                max_score: 10,
                notes: `تسليم واجب: ${assignment.title}`
              };

              try {
                // تحديث الطالب في الكاش ليعكس الدرجة الجديدة
                // نشر حدث لتحديث الواجهة
                console.log('Emitting homework-grade-updated event for student:', savedSubmission.student_id, 'with score:', homeworkGrade.score);
                // لا نستطيع تحديث students مباشرة لأنها في متجر مختلف

                // حفظ الدرجة
                await saveGrade(homeworkGrade);
                console.log('Automatically added homework grade for submission');

                // إعادة تعيين كاش الدرجات للطالب
                const studentCacheKey = `grades-${savedSubmission.student_id}`;
                lastFetch.value[studentCacheKey] = null;
              } catch (gradeError) {
                console.error('Error adding automatic homework grade:', gradeError);
              }
            } else {
              console.log('Homework grade already exists, skipping automatic grade addition');
            }
          }
        }
      }

      return savedSubmission;
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
          { type: 'homework', score: gradeData.homework || 0, max_score: 10 },
          { type: 'participation', score: gradeData.participation || 0, max_score: 10 },
          { type: 'quran', score: gradeData.quran || 0, max_score: 20 },
          { type: 'final', score: gradeData.final || 0, max_score: 40 }
        ]

        for (const gradeType of gradeTypes) {
          // إذا كان النوع موجود في gradeData أو كانت الدرجة أكبر من صفر
          if (gradeData[gradeType.type] !== undefined) {
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

      console.log('Using Supabase batch insert')
      console.log('Formatted grades to save:', formattedGrades)

      if (formattedGrades.length === 0) {
        console.warn('No valid grades to save after formatting')
        return []
      }

      // تحويل البيانات إلى الشكل المناسب لـ Supabase
      const supabaseGrades = formattedGrades.map(grade => ({
        student_id: grade.student,
        subject_id: grade.subject,
        date: grade.date,
        grade_type: grade.type,
        score: grade.score,
        max_score: grade.max_score || 100,
        notes: grade.notes || null
      }));

      try {
        // التحقق من وجود درجات موجودة لنفس الطلاب والمواد والتواريخ والأنواع
        const gradesToUpdate = [];
        const gradesToInsert = [];

        for (const grade of supabaseGrades) {
          try {
            // البحث عن درجة موجودة
            const { data, error } = await supabase
              .from('grades')
              .select('id')
              .eq('student_id', grade.student_id)
              .eq('subject_id', grade.subject_id)
              .eq('grade_type', grade.grade_type)
              .eq('date', grade.date)
              .limit(1);

            if (error) {
              console.error('Error checking for existing grade:', error);
              gradesToInsert.push(grade);
            } else if (data && data.length > 0) {
              // إذا وجدت درجة موجودة، نضيفها إلى قائمة التحديث
              gradesToUpdate.push({ ...grade, id: data[0].id });
            } else {
              // إذا لم توجد درجة موجودة، نضيفها إلى قائمة الإنشاء
              gradesToInsert.push(grade);
            }
          } catch (error) {
            console.error('Exception checking for existing grade:', error);
            gradesToInsert.push(grade);
          }
        }

        console.log(`Found ${gradesToUpdate.length} grades to update and ${gradesToInsert.length} grades to insert`);

        // تحديث الدرجات الموجودة
        const updatedGrades = [];
        for (const grade of gradesToUpdate) {
          try {
            const { data, error } = await supabase
              .from('grades')
              .update({
                score: grade.score,
                max_score: grade.max_score,
                notes: grade.notes
              })
              .eq('id', grade.id)
              .select();

            if (error) {
              console.error(`Error updating grade with id ${grade.id}:`, error);
            } else if (data && data.length > 0) {
              updatedGrades.push(data[0]);
            }
          } catch (error) {
            console.error(`Exception updating grade with id ${grade.id}:`, error);
          }
        }

        // إنشاء الدرجات الجديدة
        let insertedGrades = [];
        if (gradesToInsert.length > 0) {
          console.log('Making Supabase batch insert request for new grades');
          const { data, error } = await supabase
            .from('grades')
            .insert(gradesToInsert)
            .select();

          if (error) {
            console.error('Error using Supabase batch insert:', error);
          } else if (data && Array.isArray(data)) {
            console.log(`Successfully inserted ${data.length} new grades`);
            insertedGrades = data;
          }
        }

        // جمع جميع الدرجات المحدثة والجديدة
        const allSavedGrades = [...updatedGrades, ...insertedGrades];
        console.log(`Total saved grades: ${allSavedGrades.length}`);

        // تحديث الكاش
        if (allSavedGrades.length > 0) {
          // جمع معرفات الطلاب الفريدة
          const uniqueStudentIds = [...new Set(allSavedGrades.map(grade => grade.student_id))]

          // إعادة تعيين كاش الدرجات لكل طالب
          uniqueStudentIds.forEach(studentId => {
            const studentCacheKey = `grades-${studentId}`
            lastFetch.value[studentCacheKey] = null
          })

          for (const grade of allSavedGrades) {
            if (!grades.value[grade.student_id]) {
              grades.value[grade.student_id] = []
            }

            // إضافة الدرجة الجديدة إلى الكاش
            grades.value[grade.student_id].push({
              ...grade,
              id: grade.id,
              student: grade.student_id,
              subject: grade.subject_id,
              type: grade.grade_type
            })
          }
        }

        // إرجاع النتائج
        return allSavedGrades
      } catch (apiError) {
        console.error('Error using Supabase batch insert:', apiError)

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
          { type: 'homework', score: gradeData.homework || 0 },
          { type: 'participation', score: gradeData.participation || 0 },
          { type: 'quran', score: gradeData.quran || 0 },
          { type: 'final', score: gradeData.final || 0 }
        ]

        for (const gradeType of gradeTypes) {
          // إذا كان النوع موجود في gradeData
          if (gradeData[gradeType.type] !== undefined) {
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
      const formattedAttendance = attendanceDataArray.filter(record => {
        // التحقق من وجود الحقول المطلوبة
        return record.student && record.date && record.status;
      })

      if (formattedAttendance.length === 0) {
        console.warn('No valid attendance records to save after formatting')
        return []
      }

      // جمع كل معرفات الطلاب والتواريخ للبحث عن سجلات موجودة
      const studentIds = [...new Set(formattedAttendance.map(item => item.student))]
      const dates = [...new Set(formattedAttendance.map(item => item.date))]

      console.log('Checking for existing attendance records for students:', studentIds)
      console.log('On dates:', dates)

      // البحث عن سجلات الحضور الموجودة لهؤلاء الطلاب في هذه التواريخ
      const { data: existingRecords, error: searchError } = await supabase
        .from('attendance')
        .select('id, student_id, date')
        .in('student_id', studentIds)
        .in('date', dates)

      if (searchError) {
        console.error('Error searching for existing attendance records:', searchError)
        throw searchError
      }

      console.log('Found existing attendance records:', existingRecords)

      // إنشاء قاموس للبحث السريع عن السجلات الموجودة
      const existingRecordsMap = {}
      if (existingRecords && existingRecords.length > 0) {
        existingRecords.forEach(record => {
          const key = `${record.student_id}-${record.date}`
          existingRecordsMap[key] = record.id
        })
      }

      // فصل السجلات إلى سجلات للتحديث وسجلات للإنشاء
      const recordsToUpdate = []
      const recordsToCreate = []

      formattedAttendance.forEach(item => {
        const key = `${item.student}-${item.date}`
        const existingId = existingRecordsMap[key]

        const record = {
          student_id: item.student,
          date: item.date,
          status: item.status,
          notes: item.notes || null
        }

        if (existingId) {
          // إضافة معرف للسجل الموجود للتحديث
          recordsToUpdate.push({
            id: existingId,
            ...record
          })
        } else {
          // إضافة سجل جديد للإنشاء
          recordsToCreate.push(record)
        }
      })

      console.log(`Records to update: ${recordsToUpdate.length}, Records to create: ${recordsToCreate.length}`)

      const results = []

      // تحديث السجلات الموجودة
      if (recordsToUpdate.length > 0) {
        console.log(`Updating ${recordsToUpdate.length} existing attendance records`)

        // تحديث كل سجل على حدة لأن Supabase لا يدعم التحديث الجماعي
        for (const record of recordsToUpdate) {
          try {
            const { data, error } = await supabase
              .from('attendance')
              .update({
                status: record.status,
                notes: record.notes
              })
              .eq('id', record.id)
              .select()

            if (error) {
              console.error(`Error updating attendance record ${record.id}:`, error)
              continue
            }

            if (data && data.length > 0) {
              results.push(data[0])

              // تحديث الكاش
              const key = `${data[0].student_id}-${data[0].date}`
              attendance.value[key] = {
                ...data[0],
                student: data[0].student_id
              }
            }
          } catch (updateError) {
            console.error(`Error updating attendance record ${record.id}:`, updateError)
          }
        }
      }

      // إنشاء سجلات جديدة
      if (recordsToCreate.length > 0) {
        console.log(`Creating ${recordsToCreate.length} new attendance records`)

        try {
          const { data, error } = await supabase
            .from('attendance')
            .insert(recordsToCreate)
            .select()

          if (error) {
            console.error('Error creating new attendance records:', error)
          } else if (data && data.length > 0) {
            results.push(...data)

            // تحديث الكاش
            for (const record of data) {
              const key = `${record.student_id}-${record.date}`
              attendance.value[key] = {
                ...record,
                student: record.student_id
              }
            }
          }
        } catch (createError) {
          console.error('Error creating new attendance records:', createError)

          // إذا فشل الإنشاء الجماعي، نحاول إنشاء كل سجل على حدة
          console.log('Falling back to individual creates for attendance')

          for (const record of recordsToCreate) {
            try {
              const { data, error } = await supabase
                .from('attendance')
                .insert([record])
                .select()

              if (error) {
                console.error(`Error creating individual attendance record for student ${record.student_id}:`, error)
                continue
              }

              if (data && data.length > 0) {
                results.push(data[0])

                // تحديث الكاش
                const key = `${data[0].student_id}-${data[0].date}`
                attendance.value[key] = {
                  ...data[0],
                  student: data[0].student_id
                }
              }
            } catch (individualError) {
              console.error(`Error creating individual attendance record for student ${record.student_id}:`, individualError)
            }
          }
        }
      }

      console.log(`Successfully processed ${results.length} attendance records`)
      return results
    } catch (error) {
      console.error('Error saving batch attendance, falling back to individual saves:', error)

      // في حالة فشل الطلب المجمع، نستخدم الطريقة القديمة كخطة بديلة
      console.log('Using individual attendance saves as fallback')

      const results = []
      for (const attendanceData of attendanceDataArray) {
        try {
          // التحقق من وجود الحقول المطلوبة
          if (!attendanceData.student || !attendanceData.date || !attendanceData.status) {
            console.warn('Skipping attendance record with missing required fields:', attendanceData)
            continue
          }

          const result = await saveAttendance(attendanceData)
          results.push(result)
        } catch (err) {
          console.error('Error saving individual attendance:', err)
        }
      }

      return results
    }
  }

  /**
   * دالة رفع ملف إلى الخادم
   * @param {File} file الملف المراد رفعه
   * @returns {Promise<string>} وعد برابط الملف المرفوع
   */
  const uploadFile = async (file) => {
    try {
      console.log('Uploading file:', file.name)

      // إنشاء اسم فريد للملف
      const timestamp = new Date().getTime()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileName = `${timestamp}_${randomString}_${file.name}`

      // رفع الملف إلى Supabase Storage
      const { data, error } = await AssignmentSubmissionService.uploadSubmissionFile(file, fileName)

      if (error) {
        console.error('Error uploading file:', error)
        throw error
      }

      console.log('File uploaded successfully:', data)
      return data.path
    } catch (error) {
      console.error('Error in uploadFile:', error)
      throw error
    }
  }

  // دالة جلب سجل حضور الطالب
  const fetchAttendanceHistoryByStudent = async (studentId) => {
    try {
      console.log('Fetching attendance history for student:', studentId)

      // استخدام Supabase لجلب سجل الحضور
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching attendance history:', error)
        throw error
      }

      // تحويل البيانات إلى الشكل المناسب
      const formattedData = data.map(record => ({
        id: record.id,
        student: record.student_id,
        date: record.date,
        status: record.status,
        notes: record.notes
      }))

      // تجميع السجلات حسب التاريخ للحصول على سجل واحد فقط لكل يوم
      const uniqueDatesMap = new Map()

      // استخدام Map للاحتفاظ بأحدث سجل لكل تاريخ
      formattedData.forEach(record => {
        // إذا لم يكن هناك سجل لهذا التاريخ أو كان هذا السجل أحدث
        if (!uniqueDatesMap.has(record.date)) {
          uniqueDatesMap.set(record.date, record)
        }
      })

      // تحويل Map إلى مصفوفة وترتيبها حسب التاريخ
      const uniqueRecords = Array.from(uniqueDatesMap.values())
      uniqueRecords.sort((a, b) => new Date(b.date) - new Date(a.date))

      return uniqueRecords
    } catch (error) {
      console.error('Error in fetchAttendanceHistoryByStudent:', error)
      return []
    }
  }

  // دالة جلب ملاحظات الطالب
  const fetchNotesByStudent = async (studentId) => {
    try {
      console.log('Fetching notes for student:', studentId)

      // استخدام Supabase لجلب الملاحظات
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching student notes:', error)
        throw error
      }

      // تحويل البيانات إلى الشكل المناسب
      const formattedData = data.map(record => ({
        id: record.id,
        student: record.student_id,
        type: record.type || 'positive',
        content: record.content,
        date: record.created_at ? new Date(record.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }))

      return formattedData
    } catch (error) {
      console.error('Error in fetchNotesByStudent:', error)
      return []
    }
  }

  // دالة حفظ ملاحظة للطالب
  const saveNote = async (noteData) => {
    try {
      console.log('Saving note:', noteData)

      // التحقق من وجود جميع الحقول المطلوبة
      if (!noteData.student || !noteData.type || !noteData.content) {
        throw new Error('Missing required fields for note')
      }

      // إعداد بيانات الملاحظة للحفظ في Supabase
      const noteRecord = {
        student_id: noteData.student,
        type: noteData.type,
        content: noteData.content,
        title: noteData.title || `ملاحظة ${noteData.type === 'positive' ? 'إيجابية' : 'سلبية'}`
        // لا نحتاج إلى تحديد created_at لأنه يتم إنشاؤه تلقائياً في Supabase
      }

      // التحقق من وجود معرف للملاحظة
      if (noteData.id) {
        // تحديث ملاحظة موجودة
        const { data, error } = await supabase
          .from('notes')
          .update(noteRecord)
          .eq('id', noteData.id)
          .select()

        if (error) {
          console.error('Error updating note:', error)
          throw error
        }

        return data?.[0] || null
      } else {
        // إنشاء ملاحظة جديدة
        const { data, error } = await supabase
          .from('notes')
          .insert(noteRecord)
          .select()

        if (error) {
          console.error('Error creating note:', error)
          throw error
        }

        return data?.[0] || null
      }
    } catch (error) {
      console.error('Error saving note:', error)
      throw error
    }
  }

  // دالة حذف ملاحظة
  const deleteNote = async (noteId) => {
    try {
      console.log('Deleting note:', noteId)

      // حذف الملاحظة من Supabase
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) {
        console.error('Error deleting note:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error in deleteNote:', error)
      throw error
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
    fetchAttendanceHistoryByStudent,
    fetchNotesByStudent,
    clearCache,

    // Acciones de escritura
    saveGrade,
    saveAttendance,
    saveAssignment,
    deleteAssignment,
    saveSubmission,
    saveBatchGrades,
    saveBatchAttendance,
    saveNote,
    deleteNote,
    uploadFile
  }
})
