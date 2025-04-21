// AssignmentService.js - خدمة للتعامل مع الواجبات

import supabase from './supabaseClient';
import NotificationHelper from './NotificationHelper';

/**
 * خدمة الواجبات
 */
class AssignmentService {
  /**
   * الحصول على جميع الواجبات
   * @param {Object} params معلمات البحث
   * @param {number} [params.scheduleId] معرف الجدول الدراسي
   * @param {number} [params.subjectId] معرف المادة
   * @returns {Promise} وعد بقائمة الواجبات
   */
  static async getAssignments(params = {}) {
    try {
      console.log('AssignmentService: Getting assignments with params:', params);

      // إنشاء استعلام بسيط بدون العلاقات المعقدة
      let query = supabase
        .from('assignments')
        .select('*');

      // إضافة معلمات البحث
      if (params.scheduleId) {
        query = query.eq('schedule_id', params.scheduleId);
      }
      if (params.subjectId) {
        query = query.eq('subject_id', params.subjectId);
      }

      // ترتيب النتائج
      query = query.order('due_date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      // التحقق من وجود بيانات قبل المعالجة
      if (!data || data.length === 0) {
        console.log('No assignments found');
        return [];
      }

      return data.map(assignment => {
        // التحقق من وجود subject_id ومكوناته
        const hasSubject = assignment.subject_id && typeof assignment.subject_id === 'object';

        return {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          due_date: assignment.due_date,
          score: assignment.score,
          schedule_id: null,
          subject_id: hasSubject ? assignment.subject_id.id : assignment.subject_id,
          subject_info: assignment.subject_info || (hasSubject ? assignment.subject_id.name : null),
          class_id: null,
          class_name: '',
          section_id: null,
          section_name: '',
          day_of_week: null,
          period: null
        };
      });
    } catch (error) {
      console.error('Error in getAssignments:', error);
      throw error;
    }
  }

  /**
   * الحصول على واجب بواسطة المعرف
   * @param {number} id معرف الواجب
   * @returns {Promise} وعد بالواجب
   */
  static async getAssignmentById(id) {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          subject_id (id, name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching assignment with id ${id}:`, error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      const hasSubject = data.subject_id && typeof data.subject_id === 'object';

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        score: data.score,
        schedule_id: null,
        subject_id: hasSubject ? data.subject_id.id : data.subject_id,
        subject_info: data.subject_info || (hasSubject ? data.subject_id.name : null),
        class_id: null,
        class_name: '',
        section_id: null,
        section_name: '',
        day_of_week: null,
        period: null
      };
    } catch (error) {
      console.error(`Error in getAssignmentById(${id}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء واجب جديد
   * @param {Object} assignmentData بيانات الواجب
   * @returns {Promise} وعد بالواجب المنشأ
   */
  static async createAssignment(assignmentData) {
    try {
      console.log('Creating assignment with data:', assignmentData);

      // إنشاء الواجب
      const { data, error } = await supabase
        .from('assignments')
        .insert([{
          title: assignmentData.title,
          description: assignmentData.description || null,
          due_date: assignmentData.due_date,
          score: assignmentData.score || 10,
          schedule_id: null, // تعيين قيمة null لحقل schedule_id
          subject_id: assignmentData.subject_id || null,
          subject_info: assignmentData.subject_info || null
        }])
        .select();

      if (error) {
        console.error('Error creating assignment:', error);
        throw error;
      }

      console.log('Assignment created successfully:', data[0]);

      // إنشاء إشعار للواجب الجديد
      try {
        await NotificationHelper.createAssignmentNotification({
          title: data[0].title,
          subject_info: data[0].subject_info || 'غير محدد'
        });
      } catch (notificationError) {
        console.error('Error creating assignment notification:', notificationError);
      }

      // الحصول على بيانات المادة
      let subjectName = null;
      if (assignmentData.subject_id) {
        try {
          const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('name')
            .eq('id', assignmentData.subject_id)
            .single();

          if (!subjectError && subjectData) {
            subjectName = subjectData.name;
            console.log('Subject data fetched successfully:', subjectData);
          } else {
            console.error('Error fetching subject data:', subjectError);
          }
        } catch (subjectError) {
          console.error('Error fetching subject data:', subjectError);
        }
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data[0].id,
        title: data[0].title,
        description: data[0].description,
        due_date: data[0].due_date,
        score: data[0].score,
        schedule_id: data[0].schedule_id,
        subject_id: data[0].subject_id,
        subject_info: data[0].subject_info || subjectName,
        class_id: null,
        class_name: '',
        section_id: null,
        section_name: '',
        day_of_week: null,
        period: null
      };
    } catch (error) {
      console.error('Error in createAssignment:', error);
      throw error;
    }
  }

  /**
   * تحديث واجب
   * @param {number} id معرف الواجب
   * @param {Object} assignmentData بيانات الواجب
   * @returns {Promise} وعد بالواجب المحدث
   */
  static async updateAssignment(id, assignmentData) {
    try {
      // تحديث الواجب
      const { data, error } = await supabase
        .from('assignments')
        .update({
          title: assignmentData.title,
          description: assignmentData.description || null,
          due_date: assignmentData.due_date,
          score: assignmentData.score || 10,
          schedule_id: null, // تعيين قيمة null لحقل schedule_id
          subject_id: assignmentData.subject_id || null,
          subject_info: assignmentData.subject_info || null
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating assignment with id ${id}:`, error);
        throw error;
      }

      // لا نحتاج إلى جلب بيانات الجدول الدراسي لأننا لا نستخدمه

      // الحصول على بيانات المادة
      let subjectName = null;
      if (assignmentData.subject_id) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', assignmentData.subject_id)
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
        description: data[0].description,
        due_date: data[0].due_date,
        score: data[0].score,
        schedule_id: data[0].schedule_id,
        subject_id: data[0].subject_id,
        subject_info: data[0].subject_info || subjectName,
        class_id: null,
        class_name: '',
        section_id: null,
        section_name: '',
        day_of_week: null,
        period: null
      };
    } catch (error) {
      console.error(`Error in updateAssignment(${id}):`, error);
      throw error;
    }
  }

  /**
   * حذف واجب
   * @param {number} id معرف الواجب
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteAssignment(id) {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting assignment with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in deleteAssignment(${id}):`, error);
      throw error;
    }
  }

  /**
   * الحصول على تسليمات الواجب
   * @param {number} assignmentId معرف الواجب
   * @returns {Promise} وعد بقائمة تسليمات الواجب
   */
  static async getAssignmentSubmissions(assignmentId) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment_id (*),
          student_id (id, name, class_id (id, name), section_id (id, name))
        `)
        .eq('assignment_id', assignmentId);

      if (error) {
        console.error(`Error fetching submissions for assignment ${assignmentId}:`, error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return data.map(submission => ({
        id: submission.id,
        assignment_id: submission.assignment_id.id,
        student_id: submission.student_id.id,
        student_name: submission.student_id.name,
        submission_date: submission.submission_date,
        file_url: submission.file_url,
        notes: submission.notes,
        status: submission.status,
        score: submission.score,
        class_id: submission.student_id.class_id.id,
        class_name: submission.student_id.class_id.name,
        section_id: submission.student_id.section_id.id,
        section_name: submission.student_id.section_id.name
      }));
    } catch (error) {
      console.error(`Error in getAssignmentSubmissions(${assignmentId}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء تسليم واجب جديد
   * @param {Object} submissionData بيانات تسليم الواجب
   * @returns {Promise} وعد بتسليم الواجب المنشأ
   */
  static async createSubmission(submissionData) {
    try {
      // إذا كان هناك ملف، قم برفعه أولاً
      let fileUrl = null;
      if (submissionData.file && typeof submissionData.file === 'object') {
        const fileName = `${Date.now()}_${submissionData.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assignments')
          .upload(fileName, submissionData.file);

        if (uploadError) {
          console.error('Error uploading submission file:', uploadError);
          throw uploadError;
        }

        // الحصول على URL العام للملف
        const { data: { publicUrl } } = supabase.storage
          .from('assignments')
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
      } else if (typeof submissionData.file_url === 'string' && submissionData.file_url) {
        fileUrl = submissionData.file_url;
      }

      // إنشاء تسليم الواجب
      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert([{
          assignment_id: submissionData.assignment_id,
          student_id: submissionData.student_id,
          submission_date: new Date().toISOString(),
          file_url: fileUrl,
          notes: submissionData.notes || null,
          status: submissionData.status || 'submitted',
          score: submissionData.score || null
        }])
        .select();

      if (error) {
        console.error('Error creating submission:', error);
        throw error;
      }

      // الحصول على بيانات الطالب
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name, class_id (id, name), section_id (id, name)')
        .eq('id', submissionData.student_id)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data[0].id,
        assignment_id: data[0].assignment_id,
        student_id: data[0].student_id,
        student_name: studentData ? studentData.name : '',
        submission_date: data[0].submission_date,
        file_url: data[0].file_url,
        notes: data[0].notes,
        status: data[0].status,
        score: data[0].score,
        class_id: studentData ? studentData.class_id.id : null,
        class_name: studentData ? studentData.class_id.name : '',
        section_id: studentData ? studentData.section_id.id : null,
        section_name: studentData ? studentData.section_id.name : ''
      };
    } catch (error) {
      console.error('Error in createSubmission:', error);
      throw error;
    }
  }

  /**
   * تحديث تسليم واجب
   * @param {number} id معرف تسليم الواجب
   * @param {Object} submissionData بيانات تسليم الواجب
   * @returns {Promise} وعد بتسليم الواجب المحدث
   */
  static async updateSubmission(id, submissionData) {
    try {
      // إذا كان هناك ملف جديد، قم برفعه أولاً
      let fileUrl = submissionData.file_url || null;
      if (submissionData.file && typeof submissionData.file === 'object') {
        const fileName = `${Date.now()}_${submissionData.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assignments')
          .upload(fileName, submissionData.file);

        if (uploadError) {
          console.error('Error uploading submission file:', uploadError);
          throw uploadError;
        }

        // الحصول على URL العام للملف
        const { data: { publicUrl } } = supabase.storage
          .from('assignments')
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
      }

      // تحديث تسليم الواجب
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          file_url: fileUrl,
          notes: submissionData.notes || null,
          status: submissionData.status || 'submitted',
          score: submissionData.score || null
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating submission with id ${id}:`, error);
        throw error;
      }

      // الحصول على بيانات الطالب
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name, class_id (id, name), section_id (id, name)')
        .eq('id', data[0].student_id)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data[0].id,
        assignment_id: data[0].assignment_id,
        student_id: data[0].student_id,
        student_name: studentData ? studentData.name : '',
        submission_date: data[0].submission_date,
        file_url: data[0].file_url,
        notes: data[0].notes,
        status: data[0].status,
        score: data[0].score,
        class_id: studentData ? studentData.class_id.id : null,
        class_name: studentData ? studentData.class_id.name : '',
        section_id: studentData ? studentData.section_id.id : null,
        section_name: studentData ? studentData.section_id.name : ''
      };
    } catch (error) {
      console.error(`Error in updateSubmission(${id}):`, error);
      throw error;
    }
  }

  /**
   * حذف تسليم واجب
   * @param {number} id معرف تسليم الواجب
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteSubmission(id) {
    try {
      // الحصول على بيانات تسليم الواجب لمعرفة مسار الملف
      const { data: submissionData, error: fetchError } = await supabase
        .from('assignment_submissions')
        .select('file_url')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error(`Error fetching submission data for deletion:`, fetchError);
      } else if (submissionData && submissionData.file_url) {
        // استخراج اسم الملف من URL
        const fileName = submissionData.file_url.split('/').pop();

        // حذف الملف من التخزين
        const { error: deleteFileError } = await supabase.storage
          .from('assignments')
          .remove([fileName]);

        if (deleteFileError) {
          console.error(`Error deleting submission file:`, deleteFileError);
        }
      }

      // حذف تسليم الواجب
      const { error } = await supabase
        .from('assignment_submissions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting submission with id ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in deleteSubmission(${id}):`, error);
      throw error;
    }
  }
}

export default AssignmentService;
