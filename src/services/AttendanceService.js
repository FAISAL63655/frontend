// AttendanceService.js - خدمة للتعامل مع الحضور

import supabase from './supabaseClient';
import NotificationHelper from './NotificationHelper';

/**
 * خدمة الحضور
 */
class AttendanceService {
  /**
   * الحصول على سجلات الحضور
   * @param {Object} params معلمات البحث
   * @param {number} [params.studentId] معرف الطالب
   * @param {number} [params.scheduleId] معرف الجدول الدراسي
   * @param {string} [params.date] التاريخ (YYYY-MM-DD)
   * @returns {Promise} وعد بقائمة سجلات الحضور
   */
  static async getAttendance(params = {}) {
    try {
      let query = supabase
        .from('attendances')
        .select(`
          *,
          student_id (id, name, class_id (id, name), section_id (id, name)),
          schedule_id (
            id, 
            day_of_week, 
            period, 
            class_id (id, name), 
            section_id (id, name), 
            subject_id (id, name)
          )
        `);

      // إضافة معلمات البحث
      if (params.studentId) {
        query = query.eq('student_id', params.studentId);
      }
      if (params.scheduleId) {
        query = query.eq('schedule_id', params.scheduleId);
      }
      if (params.date) {
        query = query.eq('date', params.date);
      }

      // ترتيب النتائج
      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching attendance:', error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return data.map(attendance => ({
        id: attendance.id,
        student_id: attendance.student_id.id,
        student_name: attendance.student_id.name,
        schedule_id: attendance.schedule_id.id,
        date: attendance.date,
        status: attendance.status,
        notes: attendance.notes,
        class_id: attendance.student_id.class_id.id,
        class_name: attendance.student_id.class_id.name,
        section_id: attendance.student_id.section_id.id,
        section_name: attendance.student_id.section_id.name,
        subject_id: attendance.schedule_id.subject_id ? attendance.schedule_id.subject_id.id : null,
        subject_name: attendance.schedule_id.subject_id ? attendance.schedule_id.subject_id.name : null,
        day_of_week: attendance.schedule_id.day_of_week,
        period: attendance.schedule_id.period
      }));
    } catch (error) {
      console.error('Error in getAttendance:', error);
      throw error;
    }
  }

  /**
   * الحصول على سجل حضور بواسطة المعرف
   * @param {number} id معرف سجل الحضور
   * @returns {Promise} وعد بسجل الحضور
   */
  static async getAttendanceById(id) {
    try {
      const { data, error } = await supabase
        .from('attendances')
        .select(`
          *,
          student_id (id, name, class_id (id, name), section_id (id, name)),
          schedule_id (
            id, 
            day_of_week, 
            period, 
            class_id (id, name), 
            section_id (id, name), 
            subject_id (id, name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching attendance with id ${id}:`, error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data.id,
        student_id: data.student_id.id,
        student_name: data.student_id.name,
        schedule_id: data.schedule_id.id,
        date: data.date,
        status: data.status,
        notes: data.notes,
        class_id: data.student_id.class_id.id,
        class_name: data.student_id.class_id.name,
        section_id: data.student_id.section_id.id,
        section_name: data.student_id.section_id.name,
        subject_id: data.schedule_id.subject_id ? data.schedule_id.subject_id.id : null,
        subject_name: data.schedule_id.subject_id ? data.schedule_id.subject_id.name : null,
        day_of_week: data.schedule_id.day_of_week,
        period: data.schedule_id.period
      };
    } catch (error) {
      console.error(`Error in getAttendanceById(${id}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء سجل حضور جديد
   * @param {Object} attendanceData بيانات سجل الحضور
   * @returns {Promise} وعد بسجل الحضور المنشأ
   */
  static async createAttendance(attendanceData) {
    try {
      // التحقق من عدم وجود سجل حضور للطالب في نفس الجدول والتاريخ
      const { data: existingAttendance, error: checkError } = await supabase
        .from('attendances')
        .select('id')
        .eq('student_id', attendanceData.student_id)
        .eq('schedule_id', attendanceData.schedule_id)
        .eq('date', attendanceData.date);

      if (checkError) {
        console.error('Error checking for attendance conflicts:', checkError);
        throw checkError;
      }

      if (existingAttendance && existingAttendance.length > 0) {
        throw new Error('يوجد سجل حضور آخر للطالب في نفس الجدول والتاريخ');
      }

      // إنشاء سجل الحضور
      const { data, error } = await supabase
        .from('attendances')
        .insert([{
          student_id: attendanceData.student_id,
          schedule_id: attendanceData.schedule_id,
          date: attendanceData.date,
          status: attendanceData.status || 'present',
          notes: attendanceData.notes || null
        }])
        .select();

      if (error) {
        console.error('Error creating attendance:', error);
        throw error;
      }

      // الحصول على بيانات الطالب
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name')
        .eq('id', attendanceData.student_id)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
      } else {
        // إنشاء إشعار للحضور
        try {
          await NotificationHelper.createAttendanceNotification(
            { status: attendanceData.status || 'present' },
            studentData.name
          );
        } catch (notificationError) {
          console.error('Error creating attendance notification:', notificationError);
        }
      }

      // الحصول على بيانات الجدول الدراسي
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select(`
          day_of_week, 
          period, 
          class_id (id, name), 
          section_id (id, name), 
          subject_id (id, name)
        `)
        .eq('id', attendanceData.schedule_id)
        .single();

      if (scheduleError) {
        console.error('Error fetching schedule data:', scheduleError);
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data[0].id,
        student_id: data[0].student_id,
        student_name: studentData ? studentData.name : '',
        schedule_id: data[0].schedule_id,
        date: data[0].date,
        status: data[0].status,
        notes: data[0].notes,
        class_id: scheduleData ? scheduleData.class_id.id : null,
        class_name: scheduleData ? scheduleData.class_id.name : '',
        section_id: scheduleData ? scheduleData.section_id.id : null,
        section_name: scheduleData ? scheduleData.section_id.name : '',
        subject_id: scheduleData && scheduleData.subject_id ? scheduleData.subject_id.id : null,
        subject_name: scheduleData && scheduleData.subject_id ? scheduleData.subject_id.name : null,
        day_of_week: scheduleData ? scheduleData.day_of_week : null,
        period: scheduleData ? scheduleData.period : null
      };
    } catch (error) {
      console.error('Error in createAttendance:', error);
      throw error;
    }
  }

  /**
   * إنشاء سجلات حضور متعددة
   * @param {Array} attendanceDataList قائمة بيانات سجلات الحضور
   * @returns {Promise} وعد بقائمة سجلات الحضور المنشأة
   */
  static async createBatchAttendance(attendanceDataList) {
    try {
      // تحويل البيانات إلى الشكل المطلوب للإدخال
      const records = attendanceDataList.map(item => ({
        student_id: item.student_id,
        schedule_id: item.schedule_id,
        date: item.date,
        status: item.status || 'present',
        notes: item.notes || null
      }));

      // إنشاء سجلات الحضور
      const { data, error } = await supabase
        .from('attendances')
        .insert(records)
        .select();

      if (error) {
        console.error('Error creating batch attendance:', error);
        throw error;
      }

      // إنشاء إشعارات للحضور
      for (const record of attendanceDataList) {
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
          await NotificationHelper.createAttendanceNotification(
            { status: record.status || 'present' },
            studentData.name
          );
        } catch (notificationError) {
          console.error('Error creating attendance notification:', notificationError);
        }
      }

      return data;
    } catch (error) {
      console.error('Error in createBatchAttendance:', error);
      throw error;
    }
  }

  /**
   * تحديث سجل حضور
   * @param {number} id معرف سجل الحضور
   * @param {Object} attendanceData بيانات سجل الحضور
   * @returns {Promise} وعد بسجل الحضور المحدث
   */
  static async updateAttendance(id, attendanceData) {
    try {
      // تحديث سجل الحضور
      const { data, error } = await supabase
        .from('attendances')
        .update({
          student_id: attendanceData.student_id,
          schedule_id: attendanceData.schedule_id,
          date: attendanceData.date,
          status: attendanceData.status || 'present',
          notes: attendanceData.notes || null
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating attendance with id ${id}:`, error);
        throw error;
      }

      // الحصول على بيانات الطالب
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name')
        .eq('id', attendanceData.student_id)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
      }

      // الحصول على بيانات الجدول الدراسي
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select(`
          day_of_week, 
          period, 
          class_id (id, name), 
          section_id (id, name), 
          subject_id (id, name)
        `)
        .eq('id', attendanceData.schedule_id)
        .single();

      if (scheduleError) {
        console.error('Error fetching schedule data:', scheduleError);
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data[0].id,
        student_id: data[0].student_id,
        student_name: studentData ? studentData.name : '',
        schedule_id: data[0].schedule_id,
        date: data[0].date,
        status: data[0].status,
        notes: data[0].notes,
        class_id: scheduleData ? scheduleData.class_id.id : null,
        class_name: scheduleData ? scheduleData.class_id.name : '',
        section_id: scheduleData ? scheduleData.section_id.id : null,
        section_name: scheduleData ? scheduleData.section_id.name : '',
        subject_id: scheduleData && scheduleData.subject_id ? scheduleData.subject_id.id : null,
        subject_name: scheduleData && scheduleData.subject_id ? scheduleData.subject_id.name : null,
        day_of_week: scheduleData ? scheduleData.day_of_week : null,
        period: scheduleData ? scheduleData.period : null
      };
    } catch (error) {
      console.error(`Error in updateAttendance(${id}):`, error);
      throw error;
    }
  }

  /**
   * حذف سجل حضور
   * @param {number} id معرف سجل الحضور
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteAttendance(id) {
    try {
      const { error } = await supabase
        .from('attendances')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting attendance with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in deleteAttendance(${id}):`, error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات الحضور
   * @param {Object} params معلمات البحث
   * @param {number} [params.classId] معرف الصف
   * @param {number} [params.sectionId] معرف القسم
   * @param {number} [params.studentId] معرف الطالب
   * @param {string} [params.startDate] تاريخ البداية (YYYY-MM-DD)
   * @param {string} [params.endDate] تاريخ النهاية (YYYY-MM-DD)
   * @returns {Promise} وعد بإحصائيات الحضور
   */
  static async getAttendanceStats(params = {}) {
    try {
      // بناء استعلام للحصول على سجلات الحضور
      let query = supabase
        .from('attendances')
        .select(`
          *,
          student_id (id, name, class_id, section_id),
          schedule_id (id, class_id, section_id)
        `);

      // إضافة معلمات البحث
      if (params.studentId) {
        query = query.eq('student_id', params.studentId);
      }
      if (params.startDate) {
        query = query.gte('date', params.startDate);
      }
      if (params.endDate) {
        query = query.lte('date', params.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching attendance stats:', error);
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
      const present = filteredData.filter(record => record.status === 'present').length;
      const absent = filteredData.filter(record => record.status === 'absent').length;
      const late = filteredData.filter(record => record.status === 'late').length;
      const excused = filteredData.filter(record => record.status === 'excused').length;

      return {
        total,
        present,
        absent,
        late,
        excused,
        presentPercentage: total > 0 ? (present / total) * 100 : 0,
        absentPercentage: total > 0 ? (absent / total) * 100 : 0,
        latePercentage: total > 0 ? (late / total) * 100 : 0,
        excusedPercentage: total > 0 ? (excused / total) * 100 : 0
      };
    } catch (error) {
      console.error('Error in getAttendanceStats:', error);
      throw error;
    }
  }
}

export default AttendanceService;
