import api from './apiConfig';

/**
 * خدمة التنبيهات
 */
class NotificationService {
  /**
   * الحصول على جميع التنبيهات
   * @returns {Promise} وعد بقائمة التنبيهات
   */
  static async getNotifications() {
    try {
      const response = await api.get('notifications/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * الحصول على التنبيهات غير المقروءة
   * @returns {Promise} وعد بقائمة التنبيهات غير المقروءة
   */
  static async getUnreadNotifications() {
    try {
      const response = await api.get('notifications/unread/');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  /**
   * تعليم تنبيه كمقروء
   * @param {number} id معرف التنبيه
   * @returns {Promise} وعد بالتنبيه المحدث
   */
  static async markAsRead(id) {
    try {
      const response = await api.post(`notifications/${id}/mark_as_read/`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * تعليم جميع التنبيهات كمقروءة
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async markAllAsRead() {
    try {
      const response = await api.post('notifications/mark_all_as_read/');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * إنشاء تنبيه جديد
   * @param {Object} notification بيانات التنبيه
   * @returns {Promise} وعد بالتنبيه المنشأ
   */
  static async createNotification(notification) {
    try {
      const response = await api.post('notifications/', notification);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * حذف تنبيه
   * @param {number} id معرف التنبيه
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteNotification(id) {
    try {
      const response = await api.delete(`notifications/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export default NotificationService;
