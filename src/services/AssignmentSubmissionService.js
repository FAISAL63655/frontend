// AssignmentSubmissionService.js - خدمة للتعامل مع تسليمات الواجبات

import supabase from './supabaseClient';
import GradeService from './GradeService';

/**
 * خدمة تسليمات الواجبات
 */
class AssignmentSubmissionService {
  /**
   * الحصول على جميع تسليمات الواجبات
   * @param {Object} params معلمات البحث
   * @param {number} [params.assignmentId] معرف الواجب
   * @param {number} [params.studentId] معرف الطالب
   * @returns {Promise} وعد بقائمة تسليمات الواجبات
   */
  static async getSubmissions(params = {}) {
    try {
      let query = supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment_id (
            id,
            title,
            description,
            due_date,
            score,
            subject_id (id, name)
          ),
          student_id (
            id,
            name,
            class_id (id, name),
            section_id (id, name)
          )
        `);

      // إضافة معلمات البحث
      if (params.assignmentId) {
        query = query.eq('assignment_id', params.assignmentId);
      }
      if (params.studentId) {
        query = query.eq('student_id', params.studentId);
      }

      // تنفيذ الاستعلام
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching submissions:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getSubmissions:', error);
      throw error;
    }
  }

  /**
   * الحصول على تسليم واجب بواسطة المعرف
   * @param {number} id معرف تسليم الواجب
   * @returns {Promise} وعد بتسليم الواجب
   */
  static async getSubmissionById(id) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment_id (
            id,
            title,
            description,
            due_date,
            score,
            subject_id (id, name)
          ),
          student_id (
            id,
            name,
            class_id (id, name),
            section_id (id, name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching submission with id ${id}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error in getSubmissionById(${id}):`, error);
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
      // التحقق من وجود الواجب
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', submissionData.assignment_id)
        .single();

      if (assignmentError) {
        console.error(`Error fetching assignment with id ${submissionData.assignment_id}:`, assignmentError);
        throw assignmentError;
      }

      // إنشاء تسليم الواجب
      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert([{
          assignment_id: submissionData.assignment_id,
          student_id: submissionData.student_id,
          submission_date: new Date().toISOString(),
          file_url: submissionData.file_url || null,
          notes: submissionData.notes || null,
          status: submissionData.status || 'submitted',
          score: submissionData.score || null
        }])
        .select();

      if (error) {
        console.error('Error creating submission:', error);
        throw error;
      }

      // إضافة الدرجة تلقائياً إذا كانت الحالة "submitted"
      if (data[0].status === 'submitted' && assignment) {
        try {
          // الحصول على معلومات المادة من الواجب
          const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', assignment.subject_id)
            .single();

          if (subjectError) {
            console.error(`Error fetching subject with id ${assignment.subject_id}:`, subjectError);
          } else {
            // إنشاء درجة جديدة للواجب
            const gradeData = {
              student_id: submissionData.student_id,
              subject_id: assignment.subject_id,
              score: assignment.score, // استخدام درجة الواجب
              max_score: 10, // الدرجة القصوى للواجبات هي 10
              grade_type: 'homework', // نوع الدرجة هو واجب
              date: new Date().toISOString().split('T')[0], // تاريخ اليوم
              notes: `تسليم واجب: ${assignment.title}`
            };

            const gradeResult = await GradeService.createGrade(gradeData);
            console.log('Automatically added grade for homework submission:', gradeResult);
          }
        } catch (gradeError) {
          console.error('Error adding automatic grade for homework submission:', gradeError);
          // لا نريد إيقاف العملية إذا فشلت إضافة الدرجة
        }
      }

      return data[0];
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
      // الحصول على بيانات التسليم الحالية
      const { data: currentSubmission, error: fetchError } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error(`Error fetching current submission with id ${id}:`, fetchError);
        throw fetchError;
      }

      // تحديث تسليم الواجب
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          file_url: submissionData.file_url || currentSubmission.file_url,
          notes: submissionData.notes || currentSubmission.notes,
          status: submissionData.status || currentSubmission.status,
          score: submissionData.score || currentSubmission.score,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating submission with id ${id}:`, error);
        throw error;
      }

      // إذا تغيرت الحالة إلى "submitted"، نضيف درجة تلقائياً
      if (data[0].status === 'submitted' && currentSubmission.status !== 'submitted') {
        try {
          // الحصول على معلومات الواجب
          const { data: assignment, error: assignmentError } = await supabase
            .from('assignments')
            .select('*')
            .eq('id', data[0].assignment_id)
            .single();

          if (assignmentError) {
            console.error(`Error fetching assignment with id ${data[0].assignment_id}:`, assignmentError);
          } else {
            // إنشاء درجة جديدة للواجب
            const gradeData = {
              student_id: data[0].student_id,
              subject_id: assignment.subject_id,
              score: assignment.score, // استخدام درجة الواجب
              max_score: 10, // الدرجة القصوى للواجبات هي 10
              grade_type: 'homework', // نوع الدرجة هو واجب
              date: new Date().toISOString().split('T')[0], // تاريخ اليوم
              notes: `تسليم واجب: ${assignment.title}`
            };

            const gradeResult = await GradeService.createGrade(gradeData);
            console.log('Automatically added grade for homework submission update:', gradeResult);
          }
        } catch (gradeError) {
          console.error('Error adding automatic grade for homework submission update:', gradeError);
          // لا نريد إيقاف العملية إذا فشلت إضافة الدرجة
        }
      }

      return data[0];
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

  /**
   * رفع ملف تسليم الواجب إلى Supabase Storage
   * @param {File} file الملف المراد رفعه
   * @param {string} fileName اسم الملف
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async uploadSubmissionFile(file, fileName) {
    try {
      console.log(`Uploading file ${fileName} to Supabase Storage`);

      // رفع الملف إلى مجلد assignments في Supabase Storage
      const { data, error } = await supabase.storage
        .from('assignments')
        .upload(`submissions/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file to Supabase Storage:', error);
        throw error;
      }

      // الحصول على رابط عام للملف
      const { data: publicUrlData } = supabase.storage
        .from('assignments')
        .getPublicUrl(`submissions/${fileName}`);

      console.log('File uploaded successfully, public URL:', publicUrlData);

      // إرجاع بيانات الملف مع الرابط العام
      return {
        data: {
          ...data,
          publicUrl: publicUrlData.publicUrl,
          path: publicUrlData.publicUrl
        },
        error: null
      };
    } catch (error) {
      console.error(`Error in uploadSubmissionFile:`, error);
      return { data: null, error };
    }
  }

  /**
   * الحصول على تسليمات الواجبات للطالب
   * @param {number} studentId معرف الطالب
   * @returns {Promise} وعد بقائمة تسليمات الواجبات
   */
  static async getSubmissionsByStudent(studentId) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment_id (
            id,
            title,
            description,
            due_date,
            score,
            subject_id (id, name)
          )
        `)
        .eq('student_id', studentId);

      if (error) {
        console.error(`Error fetching submissions for student ${studentId}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error in getSubmissionsByStudent(${studentId}):`, error);
      throw error;
    }
  }

  /**
   * الحصول على تسليمات الواجب
   * @param {number} assignmentId معرف الواجب
   * @returns {Promise} وعد بقائمة تسليمات الواجب
   */
  static async getSubmissionsByAssignment(assignmentId) {
    try {
      console.log(`AssignmentSubmissionService: Getting submissions for assignment ${assignmentId}`);

      // استخدام استعلام بسيط بدون العلاقات المعقدة
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId);

      if (error) {
        console.error(`Error fetching submissions for assignment ${assignmentId}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error in getSubmissionsByAssignment(${assignmentId}):`, error);
      throw error;
    }
  }

  /**
   * التحقق من حالة تسليم الواجب للطالب
   * @param {number} assignmentId معرف الواجب
   * @param {number} studentId معرف الطالب
   * @returns {Promise} وعد بحالة تسليم الواجب
   */
  static async checkSubmissionStatus(assignmentId, studentId) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) {
        console.error(`Error checking submission status for assignment ${assignmentId} and student ${studentId}:`, error);
        throw error;
      }

      if (data) {
        return {
          submitted: true,
          status: data.status,
          submission_date: data.submission_date,
          score: data.score
        };
      } else {
        return {
          submitted: false,
          status: 'not_submitted',
          submission_date: null,
          score: null
        };
      }
    } catch (error) {
      console.error(`Error in checkSubmissionStatus(${assignmentId}, ${studentId}):`, error);
      throw error;
    }
  }

  /**
   * تحديث درجات الواجبات للطلاب
   * @param {Array} submissionsData قائمة بيانات تسليمات الواجبات
   * @returns {Promise} وعد بقائمة تسليمات الواجبات المحدثة
   */
  static async updateBatchSubmissions(submissionsData) {
    try {
      const results = [];

      for (const submission of submissionsData) {
        if (submission.id) {
          // تحديث تسليم موجود
          const result = await this.updateSubmission(submission.id, submission);
          results.push(result);
        } else {
          // إنشاء تسليم جديد
          const result = await this.createSubmission(submission);
          results.push(result);
        }
      }

      return results;
    } catch (error) {
      console.error('Error in updateBatchSubmissions:', error);
      throw error;
    }
  }
}

export default AssignmentSubmissionService;
