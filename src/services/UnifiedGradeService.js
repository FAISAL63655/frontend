// UnifiedGradeService.js - خدمة للتعامل مع الدرجات الموحدة

import supabase from './supabaseClient';
import NotificationHelper from './NotificationHelper';

/**
 * خدمة الدرجات الموحدة
 */
class UnifiedGradeService {
  /**
   * الحصول على الدرجات الموحدة لطالب معين
   * @param {number} studentId معرف الطالب
   * @returns {Promise} وعد بقائمة درجات الطالب
   */
  static async getGradesByStudent(studentId) {
    try {
      console.log(`UnifiedGradeService: Fetching grades for student ${studentId}`);

      const { data, error } = await supabase
        .from('unified_grades')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      // الحصول على بيانات المواد
      if (!error && data && data.length > 0) {
        // جمع معرفات المواد الفريدة
        const subjectIds = [...new Set(data.map(grade => grade.subject_id))];

        // الحصول على بيانات المواد
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', subjectIds);

        if (subjectsError) {
          console.error('Error fetching subjects data:', subjectsError);
        } else {
          // إضافة بيانات المواد إلى الدرجات
          data.forEach(grade => {
            const subject = subjectsData.find(s => s.id === grade.subject_id);
            if (subject) {
              grade.subject_name = subject.name;
            }
          });
        }
      }

      if (error) {
        console.error(`Error fetching unified grades for student ${studentId}:`, error);
        throw error;
      }

      console.log(`UnifiedGradeService: Found ${data.length} grades for student ${studentId}`);

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return data.map(grade => ({
        id: grade.id,
        student: grade.student_id,
        subject: grade.subject_id,
        subject_name: grade.subject_name || 'غير محدد',
        date: grade.date,
        theory: grade.theory || 0,
        practical: grade.practical || 0,
        homework: grade.homework || 0,
        participation: grade.participation || 0,
        quran: grade.quran || 0,
        final: grade.final || 0,
        notes: grade.notes
      }));
    } catch (error) {
      console.error(`Error in getGradesByStudent(${studentId}):`, error);
      return [];
    }
  }

  /**
   * حفظ درجة موحدة
   * @param {Object} gradeData بيانات الدرجة
   * @returns {Promise} وعد بالدرجة المحفوظة
   */
  static async saveGrade(gradeData) {
    try {
      console.log(`UnifiedGradeService: Saving grade for student ${gradeData.student_id}`);

      // التحقق من وجود درجة موحدة موجودة
      const { data, error: fetchError } = await supabase
        .from('unified_grades')
        .select('*')
        .eq('student_id', gradeData.student_id)
        .eq('subject_id', gradeData.subject_id)
        .eq('date', gradeData.date)
        .limit(1);

      if (fetchError) {
        console.error('Error checking for existing unified grade:', fetchError);
        throw fetchError;
      }

      let result;
      const existingGrade = data && data.length > 0 ? data[0] : null;

      if (existingGrade) {
        // تحديث درجة موجودة
        console.log(`Updating existing unified grade with id ${existingGrade.id}`);
        const { data, error } = await supabase
          .from('unified_grades')
          .update({
            theory: gradeData.theory || existingGrade.theory,
            practical: gradeData.practical || existingGrade.practical,
            homework: gradeData.homework || existingGrade.homework,
            participation: gradeData.participation || existingGrade.participation,
            quran: gradeData.quran || existingGrade.quran,
            final: gradeData.final || existingGrade.final,
            notes: gradeData.notes || existingGrade.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingGrade.id)
          .select();

        if (error) {
          console.error(`Error updating unified grade with id ${existingGrade.id}:`, error);
          throw error;
        }

        result = data[0];
      } else {
        // إنشاء درجة جديدة
        console.log('Creating new unified grade');
        const { data, error } = await supabase
          .from('unified_grades')
          .insert({
            student_id: gradeData.student_id,
            subject_id: gradeData.subject_id,
            date: gradeData.date,
            theory: gradeData.theory || 0,
            practical: gradeData.practical || 0,
            homework: gradeData.homework || 0,
            participation: gradeData.participation || 0,
            quran: gradeData.quran || 0,
            final: gradeData.final || 0,
            notes: gradeData.notes
          })
          .select();

        if (error) {
          console.error('Error creating unified grade:', error);
          throw error;
        }

        result = data[0];
      }

      // الحصول على بيانات الطالب
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name')
        .eq('id', gradeData.student_id)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
      } else {
        // إنشاء إشعار للدرجة الجديدة
        try {
          await NotificationHelper.createGradeNotification(
            { subject: gradeData.subject_name || 'غير محدد' },
            studentData.name
          );
        } catch (notificationError) {
          console.error('Error creating grade notification:', notificationError);
        }
      }

      return result;
    } catch (error) {
      console.error('Error in saveGrade:', error);
      throw error;
    }
  }

  /**
   * حفظ مجموعة من الدرجات الموحدة
   * @param {Array} gradesData مصفوفة من بيانات الدرجات
   * @returns {Promise} وعد بقائمة الدرجات المحفوظة
   */
  static async saveBatchGrades(gradesData) {
    try {
      console.log('UnifiedGradeService: Saving batch grades');

      const results = [];

      for (const gradeData of gradesData) {
        try {
          const result = await this.saveGrade(gradeData);
          results.push(result);
        } catch (error) {
          console.error(`Error saving grade for student ${gradeData.student_id}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error('Error in saveBatchGrades:', error);
      throw error;
    }
  }

  /**
   * الحصول على الدرجات الموحدة لمجموعة من الطلاب في طلب واحد
   * @param {Array} studentIds مصفوفة من معرفات الطلاب
   * @returns {Promise} وعد بقائمة درجات الطلاب
   */
  static async getGradesForMultipleStudents(studentIds) {
    try {
      console.log(`UnifiedGradeService: Fetching grades for multiple students: ${studentIds.length} students`);

      if (studentIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('unified_grades')
        .select('*')
        .in('student_id', studentIds)
        .order('date', { ascending: false });

      // الحصول على بيانات المواد
      if (!error && data && data.length > 0) {
        // جمع معرفات المواد الفريدة
        const subjectIds = [...new Set(data.map(grade => grade.subject_id))];

        // الحصول على بيانات المواد
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', subjectIds);

        if (subjectsError) {
          console.error('Error fetching subjects data:', subjectsError);
        } else {
          // إضافة بيانات المواد إلى الدرجات
          data.forEach(grade => {
            const subject = subjectsData.find(s => s.id === grade.subject_id);
            if (subject) {
              grade.subject_name = subject.name;
            }
          });
        }
      }

      if (error) {
        console.error(`Error fetching unified grades for multiple students:`, error);
        throw error;
      }

      console.log(`UnifiedGradeService: Found ${data.length} grades for ${studentIds.length} students`);

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return data.map(grade => ({
        id: grade.id,
        student: grade.student_id,
        subject: grade.subject_id,
        student_id: grade.student_id,
        subject_id: grade.subject_id,
        subject_name: grade.subject_name || 'غير محدد',
        date: grade.date,
        theory: grade.theory || 0,
        practical: grade.practical || 0,
        homework: grade.homework || 0,
        participation: grade.participation || 0,
        quran: grade.quran || 0,
        final: grade.final || 0,
        notes: grade.notes
      }));
    } catch (error) {
      console.error(`Error in getGradesForMultipleStudents:`, error);
      return [];
    }
  }

  /**
   * ترحيل البيانات من جدول الدرجات القديم إلى جدول الدرجات الموحدة
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async migrateGrades() {
    try {
      console.log('UnifiedGradeService: Migrating grades');

      // الحصول على جميع الطلاب
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id');

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

      // الحصول على جميع المواد
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id');

      if (subjectsError) {
        console.error('Error fetching subjects:', subjectsError);
        throw subjectsError;
      }

      // الحصول على جميع التواريخ الفريدة
      const { data: dates, error: datesError } = await supabase
        .from('grades')
        .select('date')
        .order('date', { ascending: false });

      if (datesError) {
        console.error('Error fetching dates:', datesError);
        throw datesError;
      }

      // استخراج التواريخ الفريدة
      const uniqueDates = [...new Set(dates.map(d => d.date))];

      // ترحيل البيانات لكل طالب ومادة وتاريخ
      for (const student of students) {
        for (const subject of subjects) {
          for (const date of uniqueDates) {
            try {
              // الحصول على درجات الطالب للمادة والتاريخ
              const { data: grades, error: gradesError } = await supabase
                .from('grades')
                .select('*')
                .eq('student_id', student.id)
                .eq('subject_id', subject.id)
                .eq('date', date);

              if (gradesError) {
                console.error(`Error fetching grades for student ${student.id}, subject ${subject.id}, date ${date}:`, gradesError);
                continue;
              }

              if (grades.length === 0) {
                continue;
              }

              // تجميع الدرجات حسب النوع
              const theory = grades.find(g => g.grade_type === 'theory')?.score || 0;
              const practical = grades.find(g => g.grade_type === 'practical')?.score || 0;
              const homework = grades.find(g => g.grade_type === 'homework')?.score || 0;
              const participation = grades.find(g => g.grade_type === 'participation')?.score || 0;
              const quran = grades.find(g => g.grade_type === 'quran')?.score || 0;
              const final = grades.find(g => g.grade_type === 'final')?.score || 0;
              const notes = grades.find(g => g.notes)?.notes || null;

              // حفظ الدرجة الموحدة
              await this.saveGrade({
                student_id: student.id,
                subject_id: subject.id,
                date: date,
                theory,
                practical,
                homework,
                participation,
                quran,
                final,
                notes
              });
            } catch (error) {
              console.error(`Error migrating grades for student ${student.id}, subject ${subject.id}, date ${date}:`, error);
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error in migrateGrades:', error);
      throw error;
    }
  }
}

export default UnifiedGradeService;
