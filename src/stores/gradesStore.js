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

  // Tiempo de caducidad de la caché (5 minutos)
  const CACHE_EXPIRY = 5 * 60 * 1000

  // Getters
  const getStudentsByClassAndSection = computed(() => {
    return (classId, sectionId) => {
      const key = `${classId}-${sectionId}`
      return students.value[key] || []
    }
  })

  const getGradesByStudent = computed(() => {
    return (studentId) => {
      return grades.value[studentId] || []
    }
  })

  const getAttendanceByStudentAndDate = computed(() => {
    return (studentId, date) => {
      const key = `${studentId}-${date}`
      return attendance.value[key]
    }
  })

  const getAssignmentsBySubject = computed(() => {
    return (subjectId) => {
      return assignments.value[subjectId] || []
    }
  })

  const getSubmissionsByStudentAndAssignment = computed(() => {
    return (studentId, assignmentId) => {
      const key = `${studentId}-${assignmentId}`
      return submissions.value[key]
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
      throw error
    }
  }

  const fetchGradesForStudents = async (studentIds) => {
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
      
      // Hacer una sola solicitud para todos los estudiantes
      const response = await api.get('grades/batch/', {
        params: {
          student_ids: studentIds.join(',')
        }
      })
      
      // Guardar en caché por estudiante
      if (response.data) {
        studentIds.forEach(id => {
          const studentGrades = response.data.filter(grade => grade.student === id)
          grades.value[id] = studentGrades
          lastFetch.value[`grades-${id}`] = Date.now()
        })
      }
      
      return response.data
    } catch (error) {
      console.error('Error fetching grades for students:', error)
      
      // Si el endpoint batch no existe, hacer solicitudes individuales
      console.log('Falling back to individual requests')
      const results = []
      
      for (const id of studentIds) {
        const key = `grades-${id}`
        
        // Si los datos están en caché y son válidos, usar esos
        if (isCacheValid(key)) {
          results.push(grades.value[id] || [])
          continue
        }
        
        try {
          const response = await api.get('grades/by_student/', {
            params: { student_id: id }
          })
          
          grades.value[id] = response.data || []
          lastFetch.value[key] = Date.now()
          results.push(response.data || [])
        } catch (err) {
          console.error(`Error fetching grades for student ${id}:`, err)
          results.push([])
        }
      }
      
      return results
    }
  }

  const fetchAttendanceForDate = async (date, classId, sectionId) => {
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
      throw error
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
      throw error
    }
  }

  const fetchSubmissionsForAssignment = async (assignmentId, studentIds) => {
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
      throw error
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
