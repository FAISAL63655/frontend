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

  const getGradesByStudent = computed(() => {
    return (studentId) => {
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
  })

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

    // Si todos los estudiantes tienen datos en caché y son válidos, no hacer la solicitud
    const allCached = studentIds.every(id => {
      const key = `grades-${id}`
      return isCacheValid(key)
    })

    if (allCached) {
      console.log('Using cached grades data for all students')
      return studentIds.map(id => grades.value[id] || [])
    }

    try {
      console.log('Fetching grades for multiple students:', studentIds)
      
      // تقسيم الطلاب إلى مجموعات أصغر (10 طلاب في كل مجموعة) لتجنب الأخطاء
      const chunkSize = 10;
      const chunks = [];
      for (let i = 0; i < studentIds.length; i += chunkSize) {
          chunks.push(studentIds.slice(i, i + chunkSize));
      }
      
      let allResults = [];
      
      // جلب البيانات لكل مجموعة طلاب
      for (const chunk of chunks) {
        try {
          // استخدام واجهة batch API مع مجموعات أصغر
          const response = await api.get('grades/batch/', {
            params: {
              student_ids: chunk.join(',')
            }
          });
          
          if (response.data && Array.isArray(response.data)) {
            allResults = [...allResults, ...response.data];
            
            // تخزين البيانات في الكاش لكل طالب
            chunk.forEach(id => {
              const studentGrades = response.data.filter(grade => grade.student === parseInt(id));
              grades.value[id] = studentGrades;
              lastFetch.value[`grades-${id}`] = Date.now();
            });
          }
        } catch (chunkError) {
          console.log(`Error fetching batch grades for chunk, trying individual requests:`, chunkError);
          
          // إذا فشل الطلب المجمّع، قم بالطلبات الفردية فقط لهذه المجموعة
          for (const id of chunk) {
            const key = `grades-${id}`;
            
            // استخدام الكاش إذا كان متاحًا
            if (isCacheValid(key)) {
              allResults = [...allResults, ...(grades.value[id] || [])];
              continue;
            }
            
            try {
              const response = await api.get('grades/', {
                params: { 
                  student: id 
                }
              });
              
              const studentGrades = response.data?.results || [];
              grades.value[id] = studentGrades;
              lastFetch.value[key] = Date.now();
              console.log(`Grades for student ${id} in subject 1:`, studentGrades.filter(grade => grade.subject === 1));
              allResults = [...allResults, ...studentGrades];
            } catch (err) {
              console.error(`Error fetching grades for student ${id}:`, err);
              grades.value[id] = [];
              lastFetch.value[key] = Date.now();
            }
          }
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
          results.push(...(grades.value[id] || []));
          continue;
        }

        try {
          const response = await api.get('grades/', {
            params: { student: id }
          });

          const studentGrades = response.data?.results || [];
          grades.value[id] = studentGrades;
          lastFetch.value[key] = Date.now();
          console.log(`Grades for student ${id} in subject 1:`, studentGrades.filter(grade => grade.subject === 1));
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

    // Acciones
    fetchStudentsByClassAndSection,
    fetchGradesForStudents,
    fetchAttendanceForDate,
    fetchAssignmentsBySubject,
    fetchSubmissionsForAssignment,
    clearCache
  }
})
