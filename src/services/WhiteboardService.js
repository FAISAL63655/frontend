// WhiteboardService.js - خدمة للتعامل مع رسومات السبورة

import supabase from './supabaseClient';

/**
 * خدمة رسومات السبورة
 */
class WhiteboardService {
  /**
   * الحصول على جميع رسومات السبورة
   * @param {Object} params معلمات البحث
   * @param {number} [params.scheduleId] معرف الجدول الدراسي
   * @param {number} [params.subjectId] معرف المادة
   * @returns {Promise} وعد بقائمة رسومات السبورة
   */
  static async getWhiteboardDrawings(params = {}) {
    try {
      let query = supabase
        .from('whiteboard_drawings')
        .select(`
          *,
          schedule_id (
            id, 
            day_of_week, 
            period, 
            class_id (id, name), 
            section_id (id, name)
          ),
          subject_id (id, name)
        `);

      // إضافة معلمات البحث
      if (params.scheduleId) {
        query = query.eq('schedule_id', params.scheduleId);
      }
      if (params.subjectId) {
        query = query.eq('subject_id', params.subjectId);
      }

      // ترتيب النتائج
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching whiteboard drawings:', error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return data.map(drawing => ({
        id: drawing.id,
        title: drawing.title,
        json_data: drawing.json_data,
        schedule_id: drawing.schedule_id ? drawing.schedule_id.id : null,
        subject_id: drawing.subject_id ? drawing.subject_id.id : null,
        class_id: drawing.schedule_id ? drawing.schedule_id.class_id.id : null,
        class_name: drawing.schedule_id ? drawing.schedule_id.class_id.name : null,
        section_id: drawing.schedule_id ? drawing.schedule_id.section_id.id : null,
        section_name: drawing.schedule_id ? drawing.schedule_id.section_id.name : null,
        subject_name: drawing.subject_id ? drawing.subject_id.name : null,
        day_of_week: drawing.schedule_id ? drawing.schedule_id.day_of_week : null,
        period: drawing.schedule_id ? drawing.schedule_id.period : null,
        created_at: drawing.created_at,
        updated_at: drawing.updated_at
      }));
    } catch (error) {
      console.error('Error in getWhiteboardDrawings:', error);
      throw error;
    }
  }

  /**
   * الحصول على رسمة سبورة بواسطة المعرف
   * @param {number} id معرف رسمة السبورة
   * @returns {Promise} وعد برسمة السبورة
   */
  static async getWhiteboardDrawingById(id) {
    try {
      const { data, error } = await supabase
        .from('whiteboard_drawings')
        .select(`
          *,
          schedule_id (
            id, 
            day_of_week, 
            period, 
            class_id (id, name), 
            section_id (id, name)
          ),
          subject_id (id, name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching whiteboard drawing with id ${id}:`, error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data.id,
        title: data.title,
        json_data: data.json_data,
        schedule_id: data.schedule_id ? data.schedule_id.id : null,
        subject_id: data.subject_id ? data.subject_id.id : null,
        class_id: data.schedule_id ? data.schedule_id.class_id.id : null,
        class_name: data.schedule_id ? data.schedule_id.class_id.name : null,
        section_id: data.schedule_id ? data.schedule_id.section_id.id : null,
        section_name: data.schedule_id ? data.schedule_id.section_id.name : null,
        subject_name: data.subject_id ? data.subject_id.name : null,
        day_of_week: data.schedule_id ? data.schedule_id.day_of_week : null,
        period: data.schedule_id ? data.schedule_id.period : null,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error(`Error in getWhiteboardDrawingById(${id}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء رسمة سبورة جديدة
   * @param {Object} drawingData بيانات رسمة السبورة
   * @returns {Promise} وعد برسمة السبورة المنشأة
   */
  static async createWhiteboardDrawing(drawingData) {
    try {
      // التأكد من أن json_data هو كائن JSON
      let jsonData = drawingData.json_data;
      if (typeof jsonData === 'string') {
        try {
          jsonData = JSON.parse(jsonData);
        } catch (e) {
          console.error('Error parsing JSON data:', e);
          throw new Error('Invalid JSON data');
        }
      }

      // إنشاء رسمة السبورة
      const { data, error } = await supabase
        .from('whiteboard_drawings')
        .insert([{
          title: drawingData.title || 'رسمة سبورة جديدة',
          json_data: jsonData,
          schedule_id: drawingData.schedule_id || null,
          subject_id: drawingData.subject_id || null
        }])
        .select();

      if (error) {
        console.error('Error creating whiteboard drawing:', error);
        throw error;
      }

      // الحصول على بيانات الجدول الدراسي
      let scheduleData = null;
      if (drawingData.schedule_id) {
        const { data: scheduleResult, error: scheduleError } = await supabase
          .from('schedules')
          .select(`
            id, 
            day_of_week, 
            period, 
            class_id (id, name), 
            section_id (id, name)
          `)
          .eq('id', drawingData.schedule_id)
          .single();

        if (scheduleError) {
          console.error('Error fetching schedule data:', scheduleError);
        } else {
          scheduleData = scheduleResult;
        }
      }

      // الحصول على بيانات المادة
      let subjectName = null;
      if (drawingData.subject_id) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', drawingData.subject_id)
          .single();

        if (subjectError) {
          console.error('Error fetching subject data:', subjectError);
        } else {
          subjectName = subjectData.name;
        }
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data[0].id,
        title: data[0].title,
        json_data: data[0].json_data,
        schedule_id: data[0].schedule_id,
        subject_id: data[0].subject_id,
        class_id: scheduleData ? scheduleData.class_id.id : null,
        class_name: scheduleData ? scheduleData.class_id.name : null,
        section_id: scheduleData ? scheduleData.section_id.id : null,
        section_name: scheduleData ? scheduleData.section_id.name : null,
        subject_name: subjectName,
        day_of_week: scheduleData ? scheduleData.day_of_week : null,
        period: scheduleData ? scheduleData.period : null,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at
      };
    } catch (error) {
      console.error('Error in createWhiteboardDrawing:', error);
      throw error;
    }
  }

  /**
   * تحديث رسمة سبورة
   * @param {number} id معرف رسمة السبورة
   * @param {Object} drawingData بيانات رسمة السبورة
   * @returns {Promise} وعد برسمة السبورة المحدثة
   */
  static async updateWhiteboardDrawing(id, drawingData) {
    try {
      // التأكد من أن json_data هو كائن JSON
      let jsonData = drawingData.json_data;
      if (typeof jsonData === 'string') {
        try {
          jsonData = JSON.parse(jsonData);
        } catch (e) {
          console.error('Error parsing JSON data:', e);
          throw new Error('Invalid JSON data');
        }
      }

      // تحديث رسمة السبورة
      const { data, error } = await supabase
        .from('whiteboard_drawings')
        .update({
          title: drawingData.title || 'رسمة سبورة',
          json_data: jsonData,
          schedule_id: drawingData.schedule_id || null,
          subject_id: drawingData.subject_id || null
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating whiteboard drawing with id ${id}:`, error);
        throw error;
      }

      // الحصول على بيانات الجدول الدراسي
      let scheduleData = null;
      if (drawingData.schedule_id) {
        const { data: scheduleResult, error: scheduleError } = await supabase
          .from('schedules')
          .select(`
            id, 
            day_of_week, 
            period, 
            class_id (id, name), 
            section_id (id, name)
          `)
          .eq('id', drawingData.schedule_id)
          .single();

        if (scheduleError) {
          console.error('Error fetching schedule data:', scheduleError);
        } else {
          scheduleData = scheduleResult;
        }
      }

      // الحصول على بيانات المادة
      let subjectName = null;
      if (drawingData.subject_id) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', drawingData.subject_id)
          .single();

        if (subjectError) {
          console.error('Error fetching subject data:', subjectError);
        } else {
          subjectName = subjectData.name;
        }
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data[0].id,
        title: data[0].title,
        json_data: data[0].json_data,
        schedule_id: data[0].schedule_id,
        subject_id: data[0].subject_id,
        class_id: scheduleData ? scheduleData.class_id.id : null,
        class_name: scheduleData ? scheduleData.class_id.name : null,
        section_id: scheduleData ? scheduleData.section_id.id : null,
        section_name: scheduleData ? scheduleData.section_id.name : null,
        subject_name: subjectName,
        day_of_week: scheduleData ? scheduleData.day_of_week : null,
        period: scheduleData ? scheduleData.period : null,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at
      };
    } catch (error) {
      console.error(`Error in updateWhiteboardDrawing(${id}):`, error);
      throw error;
    }
  }

  /**
   * حذف رسمة سبورة
   * @param {number} id معرف رسمة السبورة
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteWhiteboardDrawing(id) {
    try {
      const { error } = await supabase
        .from('whiteboard_drawings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting whiteboard drawing with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in deleteWhiteboardDrawing(${id}):`, error);
      throw error;
    }
  }

  /**
   * تصدير رسمة سبورة كصورة
   * @param {Object} jsonData بيانات JSON للرسمة
   * @returns {Promise<string>} وعد بعنوان URL للصورة
   */
  static async exportAsImage(jsonData) {
    try {
      // هذه الوظيفة تعتمد على مكتبة fabric.js أو مكتبة مماثلة في الفرونت إند
      // وتحتاج إلى تنفيذها في المكون الذي يعرض السبورة
      
      // هنا نفترض أن الفرونت إند سيقوم بتحويل jsonData إلى صورة
      // ثم يقوم برفعها إلى Supabase Storage
      
      // يمكن استخدام StorageService لرفع الصورة
      
      return 'URL للصورة المصدرة';
    } catch (error) {
      console.error('Error in exportAsImage:', error);
      throw error;
    }
  }
}

export default WhiteboardService;
