// ClassService.js - خدمة للتعامل مع الصفوف الدراسية

import supabase from './supabaseClient';

/**
 * خدمة الصفوف الدراسية
 */
class ClassService {
  /**
   * الحصول على جميع الصفوف الدراسية
   * @returns {Promise} وعد بقائمة الصفوف الدراسية
   */
  static async getClasses() {
    try {
      console.log('ClassService: Fetching all classes');

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching classes:', error);
        throw error;
      }

      console.log(`ClassService: Found ${data.length} classes`);
      console.log('ClassService: Classes data sample:', data.length > 0 ? data[0] : 'No data');

      // التأكد من أن البيانات تحتوي على معرفات رقمية وليست نصية
      const processedData = data.map(classItem => ({
        ...classItem,
        id: Number(classItem.id) // التأكد من أن المعرف رقمي
      }));

      return processedData;
    } catch (error) {
      console.error('Error in getClasses:', error);
      // إرجاع مصفوفة فارغة بدلاً من رمي الخطأ
      return [];
    }
  }

  /**
   * الحصول على صف دراسي بواسطة المعرف
   * @param {number} id معرف الصف الدراسي
   * @returns {Promise} وعد بالصف الدراسي
   */
  static async getClassById(id) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching class with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error in getClassById(${id}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء صف دراسي جديد
   * @param {Object} classData بيانات الصف الدراسي
   * @returns {Promise} وعد بالصف الدراسي المنشأ
   */
  static async createClass(classData) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          name: classData.name,
          description: classData.description || ''
        }])
        .select();

      if (error) {
        console.error('Error creating class:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error in createClass:', error);
      throw error;
    }
  }

  /**
   * تحديث صف دراسي
   * @param {number} id معرف الصف الدراسي
   * @param {Object} classData بيانات الصف الدراسي
   * @returns {Promise} وعد بالصف الدراسي المحدث
   */
  static async updateClass(id, classData) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .update({
          name: classData.name,
          description: classData.description || ''
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating class with id ${id}:`, error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error(`Error in updateClass(${id}):`, error);
      throw error;
    }
  }

  /**
   * حذف صف دراسي
   * @param {number} id معرف الصف الدراسي
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteClass(id) {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting class with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in deleteClass(${id}):`, error);
      throw error;
    }
  }
}

export default ClassService;
