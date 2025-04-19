import NotificationService from './NotificationService';

/**
 * مساعد التنبيهات - يوفر وظائف مساعدة لإنشاء التنبيهات
 */
class NotificationHelper {
  /**
   * إنشاء تنبيه للواجب الجديد
   * @param {Object} assignment معلومات الواجب
   * @returns {Promise} وعد بالتنبيه المنشأ
   */
  static async createAssignmentNotification(assignment) {
    try {
      const notification = {
        title: 'واجب جديد',
        message: `تم إضافة واجب جديد: ${assignment.title} لمادة ${assignment.subject_info}`,
        type: 'info',
        is_read: false,
        link: '/grades'
      };
      
      return await NotificationService.createNotification(notification);
    } catch (error) {
      console.error('Error creating assignment notification:', error);
    }
  }

  /**
   * إنشاء تنبيه للدرجة الجديدة
   * @param {Object} grade معلومات الدرجة
   * @param {string} studentName اسم الطالب
   * @returns {Promise} وعد بالتنبيه المنشأ
   */
  static async createGradeNotification(grade, studentName) {
    try {
      const notification = {
        title: 'درجة جديدة',
        message: `تم إضافة درجة جديدة للطالب ${studentName} في مادة ${grade.subject}`,
        type: 'success',
        is_read: false,
        link: '/grades'
      };
      
      return await NotificationService.createNotification(notification);
    } catch (error) {
      console.error('Error creating grade notification:', error);
    }
  }

  /**
   * إنشاء تنبيه للملاحظة الجديدة
   * @param {Object} note معلومات الملاحظة
   * @param {string} studentName اسم الطالب
   * @returns {Promise} وعد بالتنبيه المنشأ
   */
  static async createNoteNotification(note, studentName) {
    try {
      const notification = {
        title: `ملاحظة ${note.type === 'positive' ? 'إيجابية' : 'سلبية'} جديدة`,
        message: `تم إضافة ملاحظة ${note.type === 'positive' ? 'إيجابية' : 'سلبية'} للطالب ${studentName}`,
        type: note.type === 'positive' ? 'success' : 'warning',
        is_read: false,
        link: '/grades'
      };
      
      return await NotificationService.createNotification(notification);
    } catch (error) {
      console.error('Error creating note notification:', error);
    }
  }

  /**
   * إنشاء تنبيه للغياب
   * @param {Object} attendance معلومات الحضور
   * @param {string} studentName اسم الطالب
   * @returns {Promise} وعد بالتنبيه المنشأ
   */
  static async createAttendanceNotification(attendance, studentName) {
    try {
      const notification = {
        title: `تسجيل ${attendance.status === 'present' ? 'حضور' : 'غياب'}`,
        message: `تم تسجيل ${attendance.status === 'present' ? 'حضور' : 'غياب'} للطالب ${studentName}`,
        type: attendance.status === 'present' ? 'info' : 'warning',
        is_read: false,
        link: '/grades'
      };
      
      return await NotificationService.createNotification(notification);
    } catch (error) {
      console.error('Error creating attendance notification:', error);
    }
  }

  /**
   * إنشاء تنبيه عام
   * @param {string} title عنوان التنبيه
   * @param {string} message نص التنبيه
   * @param {string} type نوع التنبيه (info, success, warning, error)
   * @param {string} link رابط التنبيه (اختياري)
   * @returns {Promise} وعد بالتنبيه المنشأ
   */
  static async createGeneralNotification(title, message, type = 'info', link = null) {
    try {
      const notification = {
        title,
        message,
        type,
        is_read: false,
        link
      };
      
      return await NotificationService.createNotification(notification);
    } catch (error) {
      console.error('Error creating general notification:', error);
    }
  }
}

export default NotificationHelper;
