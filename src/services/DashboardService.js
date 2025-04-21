// DashboardService.js - خدمة للتعامل مع بيانات لوحة التحكم

import supabase from './supabaseClient';
import ScheduleService from './ScheduleService';
import { formatDate } from '../utils/dateUtils';

/**
 * خدمة لوحة التحكم
 */
class DashboardService {
  /**
   * الحصول على إحصائيات لوحة التحكم
   * @returns {Promise} وعد بإحصائيات لوحة التحكم
   */
  static async getStats() {
    try {
      // الحصول على إجمالي عدد الطلاب
      const { count: totalStudents, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      if (studentsError) {
        console.error('Error fetching students count:', studentsError);
        throw studentsError;
      }

      // حساب معدل الحضور للأسبوع الحالي
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // بداية الأسبوع (الأحد)
      
      const formattedWeekStart = formatDate(weekStart);
      
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendances')
        .select('status')
        .gte('date', formattedWeekStart);
      
      if (attendanceError) {
        console.error('Error fetching attendance data:', attendanceError);
        throw attendanceError;
      }
      
      let attendanceRate = 0;
      if (attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter(record => record.status === 'present').length;
        attendanceRate = (presentCount / attendanceData.length) * 100;
      }
      
      // الحصول على عدد الواجبات النشطة (تاريخ الاستحقاق اليوم أو في المستقبل)
      const formattedToday = formatDate(today);
      
      const { count: assignmentsCount, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .gte('due_date', formattedToday);
      
      if (assignmentsError) {
        console.error('Error fetching assignments count:', assignmentsError);
        throw assignmentsError;
      }
      
      // الحصول على عدد التنبيهات غير المقروءة
      const { count: alertsCount, error: alertsError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      
      if (alertsError) {
        console.error('Error fetching alerts count:', alertsError);
        throw alertsError;
      }
      
      return {
        totalStudents: totalStudents || 0,
        attendanceRate: Math.round(attendanceRate * 10) / 10 || 0,
        assignmentsCount: assignmentsCount || 0,
        alertsCount: alertsCount || 0
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      throw error;
    }
  }

  /**
   * الحصول على جدول اليوم
   * @returns {Promise} وعد بجدول اليوم
   */
  static async getTodaySchedule() {
    try {
      // استخدام خدمة الجدول للحصول على جدول اليوم
      const scheduleData = await ScheduleService.getTodaySchedules();
      
      // تحويل البيانات إلى الشكل المطلوب
      return scheduleData.map(schedule => ({
        id: schedule.id,
        subject: schedule.subject_name || 'غير محدد',
        class: schedule.class_name || '',
        section: schedule.section_name || '',
        time: ScheduleService.getPeriodTime(schedule.period),
        duration: 45, // مدة الحصة الافتراضية بالدقائق
        classId: schedule.class_id,
        sectionId: schedule.section_id,
        subjectId: schedule.subject_id
      }));
    } catch (error) {
      console.error('Error in getTodaySchedule:', error);
      throw error;
    }
  }

  /**
   * الحصول على التنبيهات الأخيرة
   * @returns {Promise} وعد بالتنبيهات الأخيرة
   */
  static async getRecentAlerts() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          student:student_id (id, name, photo_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching recent alerts:', error);
        throw error;
      }
      
      // تحويل البيانات إلى الشكل المطلوب
      return data.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        created_at: notification.created_at,
        is_read: notification.is_read,
        student_id: notification.student_id,
        student_name: notification.student ? notification.student.name : null,
        student_image: notification.student ? notification.student.photo_url : null
      }));
    } catch (error) {
      console.error('Error in getRecentAlerts:', error);
      throw error;
    }
  }

  /**
   * الحصول على أفضل الطلاب
   * @returns {Promise} وعد بأفضل الطلاب
   */
  static async getTopStudents() {
    try {
      // الحصول على جميع الطلاب
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
      
      // الحصول على جميع الدرجات
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          id,
          student_id,
          score,
          max_score
        `);
      
      if (gradesError) {
        console.error('Error fetching grades data:', gradesError);
        throw gradesError;
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
          
          const avgScore = totalPercentage / studentGrades.length;
          
          result.push({
            id: student.id,
            name: student.name,
            class: student.class_id ? student.class_id.name : '',
            section: student.section_id ? student.section_id.name : '',
            avg_score: parseFloat(avgScore.toFixed(1)),
            grades_count: studentGrades.length,
            image_url: student.photo_url
          });
        }
      }
      
      // ترتيب النتائج حسب متوسط الدرجات (تنازلياً) وأخذ أعلى 5
      return result.sort((a, b) => b.avg_score - a.avg_score).slice(0, 5);
    } catch (error) {
      console.error('Error in getTopStudents:', error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات الحضور الأسبوعية
   * @returns {Promise} وعد بإحصائيات الحضور الأسبوعية
   */
  static async getWeeklyAttendance() {
    try {
      // الحصول على تاريخ اليوم
      const today = new Date();
      
      // حساب بداية الأسبوع (الأحد)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      // إنشاء مصفوفة بأيام الأسبوع
      const daysOfWeek = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        daysOfWeek.push(formatDate(day));
      }
      
      // الحصول على بيانات الحضور للأسبوع الحالي
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendances')
        .select(`
          id,
          date,
          status
        `)
        .in('date', daysOfWeek);
      
      if (attendanceError) {
        console.error('Error fetching weekly attendance data:', attendanceError);
        throw attendanceError;
      }
      
      // تجميع البيانات حسب اليوم
      const result = [];
      
      for (let i = 0; i < 7; i++) {
        const date = daysOfWeek[i];
        const dayAttendance = attendanceData.filter(a => a.date === date);
        
        const totalCount = dayAttendance.length;
        const presentCount = dayAttendance.filter(a => a.status === 'present').length;
        const absentCount = dayAttendance.filter(a => a.status === 'absent').length;
        const lateCount = dayAttendance.filter(a => a.status === 'late').length;
        
        const dayName = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][i];
        
        result.push({
          day: dayName,
          date: date,
          total: totalCount,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          present_rate: totalCount > 0 ? (presentCount / totalCount) * 100 : 0
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error in getWeeklyAttendance:', error);
      throw error;
    }
  }

  /**
   * الحصول على الملاحظات الأخيرة
   * @returns {Promise} وعد بالملاحظات الأخيرة
   */
  static async getRecentNotes() {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          student:student_id (id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching recent notes:', error);
        throw error;
      }
      
      // تحويل البيانات إلى الشكل المطلوب
      return data.map(note => ({
        id: note.id,
        student_name: note.student ? note.student.name : '',
        student_id: note.student_id,
        content: note.content,
        type: note.type || 'general',
        type_display: note.type === 'positive' ? 'إيجابية' : 
                     note.type === 'negative' ? 'سلبية' : 'عامة',
        date: note.date,
        subject: note.subject || ''
      }));
    } catch (error) {
      console.error('Error in getRecentNotes:', error);
      throw error;
    }
  }

  /**
   * تعليم جميع التنبيهات كمقروءة
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async markAllAlertsAsRead() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)
        .select();
      
      if (error) {
        console.error('Error marking all alerts as read:', error);
        throw error;
      }
      
      return { success: true, count: data.length };
    } catch (error) {
      console.error('Error in markAllAlertsAsRead:', error);
      throw error;
    }
  }
}

export default DashboardService;
