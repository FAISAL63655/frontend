// ChampionsService.js - خدمة للتعامل مع بيانات الفرسان (الطلاب المتميزين)

import supabase from './supabaseClient';

/**
 * خدمة الفرسان (الطلاب المتميزين)
 */
class ChampionsService {
  /**
   * الحصول على الطلاب الأكثر حضوراً
   * @returns {Promise} وعد بقائمة الطلاب الأكثر حضوراً
   */
  static async getTopAttendanceStudents() {
    try {
      // الحصول على تاريخ بداية الفصل الدراسي (آخر 3 أشهر)
      const today = new Date();
      const semesterStart = new Date(today);
      semesterStart.setDate(today.getDate() - 90);
      
      // تنسيق التاريخ بالشكل المناسب لـ Supabase
      const formattedSemesterStart = semesterStart.toISOString().split('T')[0];
      
      // الحصول على بيانات الحضور لكل طالب
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendances')
        .select(`
          id,
          student_id,
          date,
          status
        `)
        .gte('date', formattedSemesterStart);
      
      if (attendanceError) {
        console.error('Error fetching attendance data:', attendanceError);
        throw attendanceError;
      }
      
      // الحصول على بيانات الطلاب
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          photo_url,
          class_id (id, name),
          section_id (id, name)
        `);
      
      if (studentsError) {
        console.error('Error fetching students data:', studentsError);
        throw studentsError;
      }
      
      // حساب معدل الحضور لكل طالب
      const result = [];
      
      for (const student of studentsData) {
        const studentAttendance = attendanceData.filter(a => a.student_id === student.id);
        
        if (studentAttendance.length > 0) {
          const totalDays = studentAttendance.length;
          const presentDays = studentAttendance.filter(a => a.status === 'present').length;
          const attendanceRate = (presentDays / totalDays) * 100;
          
          result.push({
            id: student.id,
            name: student.name,
            class: student.class_id ? student.class_id.name : '',
            section: student.section_id ? student.section_id.name : '',
            image: student.photo_url,
            attendance_rate: parseFloat(attendanceRate.toFixed(1)),
            present_days: presentDays,
            total_days: totalDays
          });
        }
      }
      
      // ترتيب النتائج حسب معدل الحضور (تنازلياً) وأخذ أعلى 5
      return result.sort((a, b) => b.attendance_rate - a.attendance_rate).slice(0, 5);
    } catch (error) {
      console.error('Error in getTopAttendanceStudents:', error);
      throw error;
    }
  }

  /**
   * الحصول على الطلاب الأكثر تسليماً للواجبات
   * @returns {Promise} وعد بقائمة الطلاب الأكثر تسليماً للواجبات
   */
  static async getTopAssignmentStudents() {
    try {
      // الحصول على تاريخ بداية الفصل الدراسي (آخر 3 أشهر)
      const today = new Date();
      const semesterStart = new Date(today);
      semesterStart.setDate(today.getDate() - 90);
      
      // تنسيق التاريخ بالشكل المناسب لـ Supabase
      const formattedSemesterStart = semesterStart.toISOString().split('T')[0];
      
      // الحصول على بيانات الواجبات
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          due_date
        `)
        .gte('due_date', formattedSemesterStart);
      
      if (assignmentsError) {
        console.error('Error fetching assignments data:', assignmentsError);
        throw assignmentsError;
      }
      
      // الحصول على بيانات تسليم الواجبات
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          assignment_id,
          student_id,
          status
        `);
      
      if (submissionsError) {
        console.error('Error fetching submissions data:', submissionsError);
        throw submissionsError;
      }
      
      // الحصول على بيانات الطلاب
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          photo_url,
          class_id (id, name),
          section_id (id, name)
        `);
      
      if (studentsError) {
        console.error('Error fetching students data:', studentsError);
        throw studentsError;
      }
      
      // حساب معدل تسليم الواجبات لكل طالب
      const result = [];
      
      for (const student of studentsData) {
        const assignmentIds = assignmentsData.map(a => a.id);
        const studentSubmissions = submissionsData.filter(s => s.student_id === student.id && assignmentIds.includes(s.assignment_id));
        
        if (studentSubmissions.length > 0) {
          const totalAssignments = assignmentIds.length;
          const submittedAssignments = studentSubmissions.filter(s => s.status === 'submitted').length;
          const submissionRate = (submittedAssignments / totalAssignments) * 100;
          
          result.push({
            id: student.id,
            name: student.name,
            class: student.class_id ? student.class_id.name : '',
            section: student.section_id ? student.section_id.name : '',
            image: student.photo_url,
            submission_rate: parseFloat(submissionRate.toFixed(1)),
            submitted_assignments: submittedAssignments,
            total_assignments: totalAssignments
          });
        }
      }
      
      // ترتيب النتائج حسب معدل تسليم الواجبات (تنازلياً) وأخذ أعلى 5
      return result.sort((a, b) => b.submission_rate - a.submission_rate).slice(0, 5);
    } catch (error) {
      console.error('Error in getTopAssignmentStudents:', error);
      throw error;
    }
  }

  /**
   * الحصول على الطلاب الأكثر ملاحظات إيجابية
   * @returns {Promise} وعد بقائمة الطلاب الأكثر ملاحظات إيجابية
   */
  static async getTopPositiveNotesStudents() {
    try {
      // الحصول على تاريخ بداية الفصل الدراسي (آخر 3 أشهر)
      const today = new Date();
      const semesterStart = new Date(today);
      semesterStart.setDate(today.getDate() - 90);
      
      // تنسيق التاريخ بالشكل المناسب لـ Supabase
      const formattedSemesterStart = semesterStart.toISOString();
      
      // الحصول على بيانات الملاحظات الإيجابية لكل طالب
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select(`
          id,
          student_id,
          title,
          created_at
        `)
        .gte('created_at', formattedSemesterStart)
        .ilike('title', '%إيجابي%');
      
      if (notesError) {
        console.error('Error fetching notes data:', notesError);
        throw notesError;
      }
      
      // الحصول على بيانات الطلاب
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          photo_url,
          class_id (id, name),
          section_id (id, name)
        `);
      
      if (studentsError) {
        console.error('Error fetching students data:', studentsError);
        throw studentsError;
      }
      
      // حساب عدد الملاحظات الإيجابية لكل طالب
      const result = [];
      
      for (const student of studentsData) {
        const studentNotes = notesData.filter(n => n.student_id === student.id);
        
        if (studentNotes.length > 0) {
          result.push({
            id: student.id,
            name: student.name,
            class: student.class_id ? student.class_id.name : '',
            section: student.section_id ? student.section_id.name : '',
            image: student.photo_url,
            positive_notes_count: studentNotes.length
          });
        }
      }
      
      // ترتيب النتائج حسب عدد الملاحظات الإيجابية (تنازلياً) وأخذ أعلى 5
      return result.sort((a, b) => b.positive_notes_count - a.positive_notes_count).slice(0, 5);
    } catch (error) {
      console.error('Error in getTopPositiveNotesStudents:', error);
      throw error;
    }
  }

  /**
   * الحصول على الطلاب الأعلى درجات
   * @returns {Promise} وعد بقائمة الطلاب الأعلى درجات
   */
  static async getTopGradesStudents() {
    try {
      // الحصول على تاريخ بداية الفصل الدراسي (آخر 3 أشهر)
      const today = new Date();
      const semesterStart = new Date(today);
      semesterStart.setDate(today.getDate() - 90);
      
      // تنسيق التاريخ بالشكل المناسب لـ Supabase
      const formattedSemesterStart = semesterStart.toISOString().split('T')[0];
      
      // الحصول على بيانات الدرجات
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          id,
          student_id,
          score,
          max_score,
          date
        `)
        .gte('date', formattedSemesterStart);
      
      if (gradesError) {
        console.error('Error fetching grades data:', gradesError);
        throw gradesError;
      }
      
      // الحصول على بيانات الطلاب
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          photo_url,
          class_id (id, name),
          section_id (id, name)
        `);
      
      if (studentsError) {
        console.error('Error fetching students data:', studentsError);
        throw studentsError;
      }
      
      // حساب متوسط الدرجات لكل طالب
      const result = [];
      
      for (const student of studentsData) {
        const studentGrades = gradesData.filter(g => g.student_id === student.id);
        
        if (studentGrades.length > 0) {
          // حساب متوسط الدرجات كنسبة مئوية
          let totalPercentage = 0;
          
          for (const grade of studentGrades) {
            const percentage = (grade.score / grade.max_score) * 100;
            totalPercentage += percentage;
          }
          
          const avgGrade = totalPercentage / studentGrades.length;
          
          result.push({
            id: student.id,
            name: student.name,
            class: student.class_id ? student.class_id.name : '',
            section: student.section_id ? student.section_id.name : '',
            image: student.photo_url,
            avg_grade: parseFloat(avgGrade.toFixed(1)),
            grade_count: studentGrades.length
          });
        }
      }
      
      // ترتيب النتائج حسب متوسط الدرجات (تنازلياً) وأخذ أعلى 5
      return result.sort((a, b) => b.avg_grade - a.avg_grade).slice(0, 5);
    } catch (error) {
      console.error('Error in getTopGradesStudents:', error);
      throw error;
    }
  }

  /**
   * الحصول على الطلاب الأعلى في القرآن
   * @returns {Promise} وعد بقائمة الطلاب الأعلى في القرآن
   */
  static async getTopQuranStudents() {
    try {
      // الحصول على تاريخ بداية الفصل الدراسي (آخر 3 أشهر)
      const today = new Date();
      const semesterStart = new Date(today);
      semesterStart.setDate(today.getDate() - 90);
      
      // تنسيق التاريخ بالشكل المناسب لـ Supabase
      const formattedSemesterStart = semesterStart.toISOString().split('T')[0];
      
      // الحصول على بيانات درجات القرآن
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          id,
          student_id,
          score,
          max_score,
          date,
          grade_type
        `)
        .eq('grade_type', 'quran')
        .gte('date', formattedSemesterStart);
      
      if (gradesError) {
        console.error('Error fetching Quran grades data:', gradesError);
        throw gradesError;
      }
      
      // الحصول على بيانات الطلاب
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          photo_url,
          class_id (id, name),
          section_id (id, name)
        `);
      
      if (studentsError) {
        console.error('Error fetching students data:', studentsError);
        throw studentsError;
      }
      
      // حساب متوسط درجات القرآن لكل طالب
      const result = [];
      
      for (const student of studentsData) {
        const studentQuranGrades = gradesData.filter(g => g.student_id === student.id);
        
        if (studentQuranGrades.length > 0) {
          // حساب متوسط درجات القرآن كنسبة مئوية
          let totalPercentage = 0;
          
          for (const grade of studentQuranGrades) {
            const percentage = (grade.score / grade.max_score) * 100;
            totalPercentage += percentage;
          }
          
          const avgQuranGrade = totalPercentage / studentQuranGrades.length;
          
          result.push({
            id: student.id,
            name: student.name,
            class: student.class_id ? student.class_id.name : '',
            section: student.section_id ? student.section_id.name : '',
            image: student.photo_url,
            avg_quran_grade: parseFloat(avgQuranGrade.toFixed(1)),
            quran_grade_count: studentQuranGrades.length
          });
        }
      }
      
      // ترتيب النتائج حسب متوسط درجات القرآن (تنازلياً) وأخذ أعلى 5
      return result.sort((a, b) => b.avg_quran_grade - a.avg_quran_grade).slice(0, 5);
    } catch (error) {
      console.error('Error in getTopQuranStudents:', error);
      throw error;
    }
  }

  /**
   * الحصول على الطلاب الأكثر تحسناً
   * @returns {Promise} وعد بقائمة الطلاب الأكثر تحسناً
   */
  static async getMostImprovedStudents() {
    try {
      // الحصول على تاريخ بداية الفصل الدراسي (آخر 3 أشهر)
      const today = new Date();
      const semesterStart = new Date(today);
      semesterStart.setDate(today.getDate() - 90);
      
      // تقسيم الفترة إلى نصفين
      const midSemester = new Date(semesterStart);
      midSemester.setDate(semesterStart.getDate() + 45);
      
      // تنسيق التواريخ بالشكل المناسب لـ Supabase
      const formattedSemesterStart = semesterStart.toISOString().split('T')[0];
      const formattedMidSemester = midSemester.toISOString().split('T')[0];
      
      // الحصول على بيانات الدرجات
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          id,
          student_id,
          score,
          max_score,
          date
        `)
        .gte('date', formattedSemesterStart);
      
      if (gradesError) {
        console.error('Error fetching grades data:', gradesError);
        throw gradesError;
      }
      
      // الحصول على بيانات الطلاب
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          photo_url,
          class_id (id, name),
          section_id (id, name)
        `);
      
      if (studentsError) {
        console.error('Error fetching students data:', studentsError);
        throw studentsError;
      }
      
      // حساب نسبة التحسن لكل طالب
      const result = [];
      
      for (const student of studentsData) {
        const studentGrades = gradesData.filter(g => g.student_id === student.id);
        
        if (studentGrades.length >= 2) {
          // تقسيم الدرجات إلى النصف الأول والنصف الثاني من الفصل الدراسي
          const earlyGrades = studentGrades.filter(g => new Date(g.date) < midSemester);
          const lateGrades = studentGrades.filter(g => new Date(g.date) >= midSemester);
          
          if (earlyGrades.length > 0 && lateGrades.length > 0) {
            // حساب متوسط الدرجات في النصف الأول
            let earlyTotalPercentage = 0;
            for (const grade of earlyGrades) {
              const percentage = (grade.score / grade.max_score) * 100;
              earlyTotalPercentage += percentage;
            }
            const earlyAvg = earlyTotalPercentage / earlyGrades.length;
            
            // حساب متوسط الدرجات في النصف الثاني
            let lateTotalPercentage = 0;
            for (const grade of lateGrades) {
              const percentage = (grade.score / grade.max_score) * 100;
              lateTotalPercentage += percentage;
            }
            const lateAvg = lateTotalPercentage / lateGrades.length;
            
            // حساب نسبة التحسن
            const improvement = lateAvg - earlyAvg;
            
            if (improvement > 0) {
              result.push({
                id: student.id,
                name: student.name,
                class: student.class_id ? student.class_id.name : '',
                section: student.section_id ? student.section_id.name : '',
                image: student.photo_url,
                improvement: parseFloat(improvement.toFixed(1)),
                early_avg: parseFloat(earlyAvg.toFixed(1)),
                late_avg: parseFloat(lateAvg.toFixed(1))
              });
            }
          }
        }
      }
      
      // ترتيب النتائج حسب نسبة التحسن (تنازلياً) وأخذ أعلى 5
      return result.sort((a, b) => b.improvement - a.improvement).slice(0, 5);
    } catch (error) {
      console.error('Error in getMostImprovedStudents:', error);
      throw error;
    }
  }
}

export default ChampionsService;
