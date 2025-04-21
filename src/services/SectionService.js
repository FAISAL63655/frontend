// SectionService.js - خدمة للتعامل مع الأقسام

import supabase from './supabaseClient';

/**
 * خدمة الأقسام
 */
class SectionService {
  /**
   * الحصول على جميع الأقسام
   * @returns {Promise} وعد بقائمة الأقسام
   */
  static async getSections() {
    try {
      console.log('SectionService: Fetching all sections');

      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching sections:', error);
        throw error;
      }

      console.log(`SectionService: Found ${data.length} sections`);
      console.log('SectionService: Sections data sample:', data.length > 0 ? data[0] : 'No data');

      // التأكد من أن البيانات تحتوي على معرفات رقمية وليست نصية
      const processedData = data.map(section => ({
        ...section,
        id: Number(section.id) // التأكد من أن المعرف رقمي
      }));

      return processedData;
    } catch (error) {
      console.error('Error in getSections:', error);
      // إرجاع مصفوفة فارغة بدلاً من رمي الخطأ
      return [];
    }
  }

  /**
   * الحصول على قسم بواسطة المعرف
   * @param {number} id معرف القسم
   * @returns {Promise} وعد بالقسم
   */
  static async getSectionById(id) {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching section with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error in getSectionById(${id}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء قسم جديد
   * @param {Object} sectionData بيانات القسم
   * @returns {Promise} وعد بالقسم المنشأ
   */
  static async createSection(sectionData) {
    try {
      const { data, error } = await supabase
        .from('sections')
        .insert([{
          name: sectionData.name
        }])
        .select();

      if (error) {
        console.error('Error creating section:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error in createSection:', error);
      throw error;
    }
  }

  /**
   * تحديث قسم
   * @param {number} id معرف القسم
   * @param {Object} sectionData بيانات القسم
   * @returns {Promise} وعد بالقسم المحدث
   */
  static async updateSection(id, sectionData) {
    try {
      const { data, error } = await supabase
        .from('sections')
        .update({
          name: sectionData.name
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating section with id ${id}:`, error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error(`Error in updateSection(${id}):`, error);
      throw error;
    }
  }

  /**
   * حذف قسم
   * @param {number} id معرف القسم
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteSection(id) {
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting section with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in deleteSection(${id}):`, error);
      throw error;
    }
  }
}

export default SectionService;
