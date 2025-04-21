// GradeService.js - خدمة للتعامل مع الدرجات

import supabase from './supabaseClient';
import NotificationHelper from './NotificationHelper';

/**
 * خدمة الدرجات
 */
class GradeService {
  /**
   * الحصول على جميع الدرجات
   * @param {Object} params معلمات البحث
   * @param {number} [params.studentId] معرف الطالب
   * @param {number} [params.subjectId] معرف المادة
   * @param {string} [params.gradeType] نوع الدرجة
   * @returns {Promise} وعد بقائمة الدرجات
   */
  static async getGrades(params = {}) {
    try {
      let query = supabase
        .from('grades')
        .select(`
          *,
          student_id (id, name, class_id (id, name), section_id (id, name)),
          subject_id (id, name)
        `);

      // إضافة معلمات البحث
      if (params.studentId) {
        query = query.eq('student_id', params.studentId);
      }
      if (params.subjectId) {
        query = query.eq('subject_id', params.subjectId);
      }
      if (params.gradeType) {
        query = query.eq('grade_type', params.gradeType);
      }

      // ترتيب النتائج
      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching grades:', error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return data.map(grade => ({
        id: grade.id,
        student_id: grade.student_id.id,
        student_name: grade.student_id.name,
        subject_id: grade.subject_id.id,
        subject_name: grade.subject_id.name,
        score: grade.score,
        max_score: grade.max_score,
        grade_type: grade.grade_type,
        date: grade.date,
        notes: grade.notes,
        class_id: grade.student_id.class_id.id,
        class_name: grade.student_id.class_id.name,
        section_id: grade.student_id.section_id.id,
        section_name: grade.student_id.section_id.name
      }));
    } catch (error) {
      console.error('Error in getGrades:', error);
      throw error;
    }
  }

  /**
   * الحصول على درجات طالب معين
   * @param {number} studentId معرف الطالب
   * @returns {Promise} وعد بقائمة درجات الطالب
   */
  static async getGradesByStudent(studentId) {
    try {
      console.log(`GradeService: Fetching grades for student ${studentId}`);

      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          subject_id (id, name)
        `)
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (error) {
        console.error(`Error fetching grades for student ${studentId}:`, error);
        throw error;
      }

      console.log(`GradeService: Found ${data.length} grades for student ${studentId}`);

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return data.map(grade => ({
        id: grade.id,
        student: grade.student_id,
        subject: grade.subject_id.id,
        subject_name: grade.subject_id.name,
        date: grade.date,
        type: grade.grade_type,
        score: grade.score,
        max_score: grade.max_score,
        notes: grade.notes,
        // تعيين الدرجات حسب النوع
        theory: grade.grade_type === 'theory' ? grade.score : null,
        practical: grade.grade_type === 'practical' ? grade.score : null,
        homework: grade.grade_type === 'homework' ? grade.score : null,
        participation: grade.grade_type === 'participation' ? grade.score : null,
        quran: grade.grade_type === 'quran' ? grade.score : null,
        final: grade.grade_type === 'final' ? grade.score : null
      }));
    } catch (error) {
      console.error(`Error in getGradesByStudent(${studentId}):`, error);
      return [];
    }
  }

  /**
   * الحصول على بيانات الحضور لتاريخ معين
   * @param {string} date التاريخ
   * @param {number} classId معرف الصف
   * @param {number} sectionId معرف القسم
   * @returns {Promise} وعد بقائمة بيانات الحضور
   */
  static async getAttendanceByDate(date, classId, sectionId) {
    try {
      console.log(`GradeService: Fetching attendance for date ${date}, class ${classId}, section ${sectionId}`);

      // الحصول على قائمة الطلاب في الصف والقسم
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, name')
        .eq('class_id', classId)
        .eq('section_id', sectionId);

      if (studentsError) {
        console.error(`Error fetching students for class ${classId} and section ${sectionId}:`, studentsError);
        throw studentsError;
      }

      // الحصول على بيانات الحضور للتاريخ المحدد
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', date);

      if (attendanceError) {
        console.error(`Error fetching attendance for date ${date}:`, attendanceError);
        throw attendanceError;
      }

      console.log(`GradeService: Found ${students.length} students and ${attendance.length} attendance records`);

      // دمج بيانات الطلاب مع بيانات الحضور
      const result = students.map(student => {
        // البحث عن سجل الحضور للطالب
        const attendanceRecord = attendance.find(record => record.student_id === student.id);

        return {
          student_id: student.id,
          student_name: student.name,
          date: date,
          status: attendanceRecord ? attendanceRecord.status : 'present', // القيمة الافتراضية هي حاضر
          notes: attendanceRecord ? attendanceRecord.notes : null,
          id: attendanceRecord ? attendanceRecord.id : null
        };
      });

      return result;
    } catch (error) {
      console.error(`Error in getAttendanceByDate(${date}, ${classId}, ${sectionId}):`, error);
      return [];
    }
  }





  /**
   * الحصول على درجة بواسطة المعرف
   * @param {number} id معرف الدرجة
   * @returns {Promise} وعد بالدرجة
   */
  static async getGradeById(id) {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          student_id (id, name, class_id (id, name), section_id (id, name)),
          subject_id (id, name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching grade with id ${id}:`, error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data.id,
        student_id: data.student_id.id,
        student_name: data.student_id.name,
        subject_id: data.subject_id.id,
        subject_name: data.subject_id.name,
        score: data.score,
        max_score: data.max_score,
        grade_type: data.grade_type,
        date: data.date,
        notes: data.notes,
        class_id: data.student_id.class_id.id,
        class_name: data.student_id.class_id.name,
        section_id: data.student_id.section_id.id,
        section_name: data.student_id.section_id.name
      };
    } catch (error) {
      console.error(`Error in getGradeById(${id}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء درجة جديدة
   * @param {Object} gradeData بيانات الدرجة
   * @returns {Promise} وعد بالدرجة المنشأة
   */
  static async createGrade(gradeData) {
    try {
      // إنشاء الدرجة
      const { data, error } = await supabase
        .from('grades')
        .insert([{
          student_id: gradeData.student_id,
          subject_id: gradeData.subject_id,
          score: gradeData.score,
          max_score: gradeData.max_score || 100,
          grade_type: gradeData.grade_type,
          date: gradeData.date,
          notes: gradeData.notes || null
        }])
        .select();

      if (error) {
        console.error('Error creating grade:', error);
        throw error;
      }

      // الحصول على بيانات الطالب
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name, class_id (id, name), section_id (id, name)')
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

      // الحصول على بيانات المادة
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('name')
        .eq('id', gradeData.subject_id)
        .single();

      if (subjectError) {
        console.error('Error fetching subject data:', subjectError);
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data[0].id,
        student_id: data[0].student_id,
        student_name: studentData ? studentData.name : '',
        subject_id: data[0].subject_id,
        subject_name: subjectData ? subjectData.name : '',
        score: data[0].score,
        max_score: data[0].max_score,
        grade_type: data[0].grade_type,
        date: data[0].date,
        notes: data[0].notes,
        class_id: studentData ? studentData.class_id.id : null,
        class_name: studentData ? studentData.class_id.name : '',
        section_id: studentData ? studentData.section_id.id : null,
        section_name: studentData ? studentData.section_id.name : ''
      };
    } catch (error) {
      console.error('Error in createGrade:', error);
      throw error;
    }
  }

  /**
   * إنشاء درجات متعددة
   * @param {Array} gradesData قائمة بيانات الدرجات
   * @returns {Promise} وعد بقائمة الدرجات المنشأة
   */
  static async createBatchGrades(gradesData) {
    try {
      // تحويل البيانات إلى الشكل المطلوب للإدخال
      const records = gradesData.map(item => ({
        student_id: item.student_id,
        subject_id: item.subject_id,
        score: item.score,
        max_score: item.max_score || 100,
        grade_type: item.grade_type,
        date: item.date,
        notes: item.notes || null
      }));

      // إنشاء الدرجات
      const { data, error } = await supabase
        .from('grades')
        .insert(records)
        .select();

      if (error) {
        console.error('Error creating batch grades:', error);
        throw error;
      }

      // إنشاء إشعارات للدرجات الجديدة
      for (const record of gradesData) {
        try {
          // الحصول على بيانات الطالب
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('name')
            .eq('id', record.student_id)
            .single();

          if (studentError) {
            console.error('Error fetching student data:', studentError);
            continue;
          }

          // إنشاء إشعار
          await NotificationHelper.createGradeNotification(
            { subject: record.subject_name || 'غير محدد' },
            studentData.name
          );
        } catch (notificationError) {
          console.error('Error creating grade notification:', notificationError);
        }
      }

      return data;
    } catch (error) {
      console.error('Error in createBatchGrades:', error);
      throw error;
    }
  }

  /**
   * تحديث درجة
   * @param {number} id معرف الدرجة
   * @param {Object} gradeData بيانات الدرجة
   * @returns {Promise} وعد بالدرجة المحدثة
   */
  static async updateGrade(id, gradeData) {
    try {
      // تحديث الدرجة
      const { data, error } = await supabase
        .from('grades')
        .update({
          student_id: gradeData.student_id,
          subject_id: gradeData.subject_id,
          score: gradeData.score,
          max_score: gradeData.max_score || 100,
          grade_type: gradeData.grade_type,
          date: gradeData.date,
          notes: gradeData.notes || null
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating grade with id ${id}:`, error);
        throw error;
      }

      // الحصول على بيانات الطالب
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name, class_id (id, name), section_id (id, name)')
        .eq('id', gradeData.student_id)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
      }

      // الحصول على بيانات المادة
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('name')
        .eq('id', gradeData.subject_id)
        .single();

      if (subjectError) {
        console.error('Error fetching subject data:', subjectError);
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data[0].id,
        student_id: data[0].student_id,
        student_name: studentData ? studentData.name : '',
        subject_id: data[0].subject_id,
        subject_name: subjectData ? subjectData.name : '',
        score: data[0].score,
        max_score: data[0].max_score,
        grade_type: data[0].grade_type,
        date: data[0].date,
        notes: data[0].notes,
        class_id: studentData ? studentData.class_id.id : null,
        class_name: studentData ? studentData.class_id.name : '',
        section_id: studentData ? studentData.section_id.id : null,
        section_name: studentData ? studentData.section_id.name : ''
      };
    } catch (error) {
      console.error(`Error in updateGrade(${id}):`, error);
      throw error;
    }
  }

  /**
   * حذف درجة
   * @param {number} id معرف الدرجة
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteGrade(id) {
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting grade with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in deleteGrade(${id}):`, error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات الدرجات
   * @param {Object} params معلمات البحث
   * @param {number} [params.studentId] معرف الطالب
   * @param {number} [params.subjectId] معرف المادة
   * @param {number} [params.classId] معرف الصف
   * @param {number} [params.sectionId] معرف القسم
   * @returns {Promise} وعد بإحصائيات الدرجات
   */
  static async getGradeStats(params = {}) {
    try {
      // بناء استعلام للحصول على الدرجات
      let query = supabase
        .from('grades')
        .select(`
          *,
          student_id (id, name, class_id, section_id),
          subject_id (id, name)
        `);

      // إضافة معلمات البحث
      if (params.studentId) {
        query = query.eq('student_id', params.studentId);
      }
      if (params.subjectId) {
        query = query.eq('subject_id', params.subjectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching grade stats:', error);
        throw error;
      }

      // فلترة البيانات حسب الصف والقسم إذا تم تحديدهما
      let filteredData = data;
      if (params.classId || params.sectionId) {
        filteredData = data.filter(record => {
          const classMatch = !params.classId || record.student_id.class_id === params.classId;
          const sectionMatch = !params.sectionId || record.student_id.section_id === params.sectionId;
          return classMatch && sectionMatch;
        });
      }

      // حساب الإحصائيات
      const total = filteredData.length;
      if (total === 0) {
        return {
          total: 0,
          average: 0,
          highest: 0,
          lowest: 0,
          passing: 0,
          failing: 0,
          passingPercentage: 0,
          subjectAverages: []
        };
      }

      // حساب المتوسط والأعلى والأدنى
      const scores = filteredData.map(grade => (grade.score / grade.max_score) * 100);
      const average = scores.reduce((sum, score) => sum + score, 0) / total;
      const highest = Math.max(...scores);
      const lowest = Math.min(...scores);

      // حساب عدد الناجحين والراسبين (اعتبار 60% هو الحد الأدنى للنجاح)
      const passing = scores.filter(score => score >= 60).length;
      const failing = total - passing;
      const passingPercentage = (passing / total) * 100;

      // حساب متوسط الدرجات لكل مادة
      const subjectAverages = [];
      const subjectGroups = {};

      filteredData.forEach(grade => {
        const subjectId = grade.subject_id.id;
        if (!subjectGroups[subjectId]) {
          subjectGroups[subjectId] = {
            id: subjectId,
            name: grade.subject_id.name,
            scores: [],
            total: 0
          };
        }

        const normalizedScore = (grade.score / grade.max_score) * 100;
        subjectGroups[subjectId].scores.push(normalizedScore);
        subjectGroups[subjectId].total++;
      });

      for (const subjectId in subjectGroups) {
        const group = subjectGroups[subjectId];
        const subjectAverage = group.scores.reduce((sum, score) => sum + score, 0) / group.total;
        subjectAverages.push({
          id: group.id,
          name: group.name,
          average: subjectAverage,
          total: group.total
        });
      }

      return {
        total,
        average,
        highest,
        lowest,
        passing,
        failing,
        passingPercentage,
        subjectAverages
      };
    } catch (error) {
      console.error('Error in getGradeStats:', error);
      throw error;
    }
  }
}

export default GradeService;
