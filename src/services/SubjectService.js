// SubjectService.js - خدمة للتعامل مع المواد الدراسية

import supabase from './supabaseClient';

/**
 * خدمة المواد الدراسية
 */
class SubjectService {
  /**
   * الحصول على جميع المواد الدراسية
   * @returns {Promise} وعد بقائمة المواد الدراسية
   */
  static async getSubjects() {
    try {
      console.log('SubjectService: Fetching all subjects');
      const { data, error } = await supabase
        .from('subjects')
        .select('*, parent_id(*)')
        .order('order_index', { ascending: true })
        .order('name');

      if (error) {
        console.error('Error fetching subjects:', error);
        throw error;
      }

      console.log(`SubjectService: Found ${data.length} subjects`);
      console.log('SubjectService: Subjects data sample:', data.length > 0 ? data[0] : 'No data');

      return data;
    } catch (error) {
      console.error('Error in getSubjects:', error);
      throw error;
    }
  }

  /**
   * الحصول على المواد الأساسية (التي ليس لها مادة أساسية)
   * @returns {Promise} وعد بقائمة المواد الأساسية
   */
  static async getMainSubjects() {
    try {
      console.log('SubjectService: Fetching main subjects');
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .is('parent_id', null)
        .order('order_index', { ascending: true })
        .order('name');

      if (error) {
        console.error('Error fetching main subjects:', error);
        throw error;
      }

      console.log(`SubjectService: Found ${data.length} main subjects`);
      console.log('SubjectService: Main subjects data sample:', data.length > 0 ? data[0] : 'No data');
      return data;
    } catch (error) {
      console.error('Error in getMainSubjects:', error);
      throw error;
    }
  }

  /**
   * الحصول على مادة دراسية بواسطة المعرف
   * @param {number} id معرف المادة الدراسية
   * @returns {Promise} وعد بالمادة الدراسية
   */
  static async getSubjectById(id) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*, parent_id(*)')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching subject with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error in getSubjectById(${id}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء مادة دراسية جديدة
   * @param {Object} subjectData بيانات المادة الدراسية
   * @returns {Promise} وعد بالمادة الدراسية المنشأة
   */
  static async createSubject(subjectData) {
    try {
      console.log('SubjectService: Creating subject with data:', subjectData);

      // تحقق من وجود المادة الأساسية إذا كانت مادة فرعية
      if (subjectData.parent_id) {
        const { data: parentData, error: parentError } = await supabase
          .from('subjects')
          .select('id, name')
          .eq('id', subjectData.parent_id)
          .single();

        if (parentError) {
          console.error(`Error fetching parent subject with id ${subjectData.parent_id}:`, parentError);
          throw new Error(`Parent subject with id ${subjectData.parent_id} not found`);
        }

        console.log('Parent subject found:', parentData);
      }

      const insertData = {
        name: subjectData.name,
        parent_id: subjectData.parent_id || null,
        is_active: subjectData.is_active !== undefined ? subjectData.is_active : true,
        order_index: subjectData.order_index || 0
      };

      console.log('Inserting data:', insertData);

      const { data, error } = await supabase
        .from('subjects')
        .insert([insertData])
        .select();

      if (error) {
        console.error('Error creating subject:', error);
        throw error;
      }

      console.log('Subject created successfully:', data[0]);
      return data[0];
    } catch (error) {
      console.error('Error in createSubject:', error);
      throw error;
    }
  }

  /**
   * تحديث مادة دراسية
   * @param {number} id معرف المادة الدراسية
   * @param {Object} subjectData بيانات المادة الدراسية
   * @returns {Promise} وعد بالمادة الدراسية المحدثة
   */
  static async updateSubject(id, subjectData) {
    try {
      console.log(`SubjectService: Updating subject with id ${id}:`, subjectData);

      const updateData = {
        name: subjectData.name,
        parent_id: subjectData.parent_id || null
      };

      // إضافة الحقول الاختيارية فقط إذا تم توفيرها
      if (subjectData.is_active !== undefined) {
        updateData.is_active = subjectData.is_active;
      }

      if (subjectData.order_index !== undefined) {
        updateData.order_index = subjectData.order_index;
      }

      const { data, error } = await supabase
        .from('subjects')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating subject with id ${id}:`, error);
        throw error;
      }

      console.log(`Subject updated successfully:`, data[0]);
      return data[0];
    } catch (error) {
      console.error(`Error in updateSubject(${id}):`, error);
      throw error;
    }
  }

  /**
   * حذف مادة دراسية
   * @param {number} id معرف المادة الدراسية
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteSubject(id) {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting subject with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in deleteSubject(${id}):`, error);
      throw error;
    }
  }
}

export default SubjectService;
