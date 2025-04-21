import supabase from './supabaseClient';

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
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getNotifications:', error);
      throw error;
    }
  }

  /**
   * الحصول على التنبيهات غير المقروءة
   * @returns {Promise} وعد بقائمة التنبيهات غير المقروءة
   */
  static async getUnreadNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching unread notifications:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getUnreadNotifications:', error);
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
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error marking notification ${id} as read:`, error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error(`Error in markAsRead(${id}):`, error);
      throw error;
    }
  }

  /**
   * تعليم جميع التنبيهات كمقروءة
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async markAllAsRead() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)
        .select();

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
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
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          is_read: notification.is_read || false
        }])
        .select();

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error in createNotification:', error);
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
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting notification with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in deleteNotification(${id}):`, error);
      throw error;
    }
  }
}

export default NotificationService;
