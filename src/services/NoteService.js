// NoteService.js - خدمة للتعامل مع الملاحظات

import supabase from './supabaseClient';
import NotificationHelper from './NotificationHelper';

/**
 * خدمة الملاحظات
 */
class NoteService {
  /**
   * الحصول على جميع الملاحظات
   * @param {Object} params معلمات البحث
   * @param {number} [params.studentId] معرف الطالب
   * @param {number} [params.subjectId] معرف المادة
   * @returns {Promise} وعد بقائمة الملاحظات
   */
  static async getNotes(params = {}) {
    try {
      let query = supabase
        .from('notes')
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

      // ترتيب النتائج
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notes:', error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return data.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        student_id: note.student_id.id,
        student_name: note.student_id.name,
        subject_id: note.subject_id ? note.subject_id.id : null,
        subject_name: note.subject_id ? note.subject_id.name : null,
        created_at: note.created_at,
        updated_at: note.updated_at,
        class_id: note.student_id.class_id.id,
        class_name: note.student_id.class_id.name,
        section_id: note.student_id.section_id.id,
        section_name: note.student_id.section_id.name
      }));
    } catch (error) {
      console.error('Error in getNotes:', error);
      throw error;
    }
  }

  /**
   * الحصول على ملاحظة بواسطة المعرف
   * @param {number} id معرف الملاحظة
   * @returns {Promise} وعد بالملاحظة
   */
  static async getNoteById(id) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          student_id (id, name, class_id (id, name), section_id (id, name)),
          subject_id (id, name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching note with id ${id}:`, error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        student_id: data.student_id.id,
        student_name: data.student_id.name,
        subject_id: data.subject_id ? data.subject_id.id : null,
        subject_name: data.subject_id ? data.subject_id.name : null,
        created_at: data.created_at,
        updated_at: data.updated_at,
        class_id: data.student_id.class_id.id,
        class_name: data.student_id.class_id.name,
        section_id: data.student_id.section_id.id,
        section_name: data.student_id.section_id.name
      };
    } catch (error) {
      console.error(`Error in getNoteById(${id}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء ملاحظة جديدة
   * @param {Object} noteData بيانات الملاحظة
   * @returns {Promise} وعد بالملاحظة المنشأة
   */
  static async createNote(noteData) {
    try {
      // إنشاء الملاحظة
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: noteData.title,
          content: noteData.content,
          student_id: noteData.student_id,
          subject_id: noteData.subject_id || null
        }])
        .select();

      if (error) {
        console.error('Error creating note:', error);
        throw error;
      }

      // الحصول على بيانات الطالب
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name, class_id (id, name), section_id (id, name)')
        .eq('id', noteData.student_id)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
      } else {
        // إنشاء إشعار للملاحظة الجديدة
        try {
          await NotificationHelper.createNoteNotification(
            { type: noteData.type || 'neutral' },
            studentData.name
          );
        } catch (notificationError) {
          console.error('Error creating note notification:', notificationError);
        }
      }

      // الحصول على بيانات المادة
      let subjectName = null;
      if (noteData.subject_id) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', noteData.subject_id)
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
        content: data[0].content,
        student_id: data[0].student_id,
        student_name: studentData ? studentData.name : '',
        subject_id: data[0].subject_id,
        subject_name: subjectName,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
        class_id: studentData ? studentData.class_id.id : null,
        class_name: studentData ? studentData.class_id.name : '',
        section_id: studentData ? studentData.section_id.id : null,
        section_name: studentData ? studentData.section_id.name : ''
      };
    } catch (error) {
      console.error('Error in createNote:', error);
      throw error;
    }
  }

  /**
   * تحديث ملاحظة
   * @param {number} id معرف الملاحظة
   * @param {Object} noteData بيانات الملاحظة
   * @returns {Promise} وعد بالملاحظة المحدثة
   */
  static async updateNote(id, noteData) {
    try {
      // تحديث الملاحظة
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: noteData.title,
          content: noteData.content,
          student_id: noteData.student_id,
          subject_id: noteData.subject_id || null
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating note with id ${id}:`, error);
        throw error;
      }

      // الحصول على بيانات الطالب
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name, class_id (id, name), section_id (id, name)')
        .eq('id', noteData.student_id)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
      }

      // الحصول على بيانات المادة
      let subjectName = null;
      if (noteData.subject_id) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', noteData.subject_id)
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
        content: data[0].content,
        student_id: data[0].student_id,
        student_name: studentData ? studentData.name : '',
        subject_id: data[0].subject_id,
        subject_name: subjectName,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
        class_id: studentData ? studentData.class_id.id : null,
        class_name: studentData ? studentData.class_id.name : '',
        section_id: studentData ? studentData.section_id.id : null,
        section_name: studentData ? studentData.section_id.name : ''
      };
    } catch (error) {
      console.error(`Error in updateNote(${id}):`, error);
      throw error;
    }
  }

  /**
   * حذف ملاحظة
   * @param {number} id معرف الملاحظة
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteNote(id) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting note with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in deleteNote(${id}):`, error);
      throw error;
    }
  }
}

export default NoteService;
