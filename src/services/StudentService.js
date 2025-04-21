// StudentService.js - خدمة للتعامل مع الطلاب

import supabase from './supabaseClient';

/**
 * خدمة الطلاب
 */
class StudentService {
  /**
   * الحصول على جميع الطلاب
   * @returns {Promise} وعد بقائمة الطلاب
   */
  static async getStudents() {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class_id (id, name),
          section_id (id, name)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return data.map(student => ({
        id: student.id,
        name: student.name,
        student_id: student.student_id,
        class_id: student.class_id.id,
        section_id: student.section_id.id,
        class_name: student.class_id.name,
        section: student.section_id.name,
        photo_url: student.photo_url,
        status: student.status
      }));
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw error;
    }
  }

  /**
   * الحصول على الطلاب حسب الصف والقسم
   * @param {number} classId معرف الصف
   * @param {number} sectionId معرف القسم
   * @returns {Promise} وعد بقائمة الطلاب
   */
  static async getStudentsByClassAndSection(classId, sectionId) {
    try {
      console.log(`StudentService: Fetching students for class ${classId} and section ${sectionId}`);

      // التحقق من صحة المعرفات
      if (!classId || !sectionId) {
        console.error('Invalid classId or sectionId:', { classId, sectionId });
        return [];
      }

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class_id (id, name),
          section_id (id, name)
        `)
        .eq('class_id', classId)
        .eq('section_id', sectionId)
        .order('name');

      if (error) {
        console.error(`Error fetching students for class ${classId} and section ${sectionId}:`, error);
        throw error;
      }

      console.log(`StudentService: Found ${data.length} students for class ${classId} and section ${sectionId}`);
      console.log('StudentService: Raw data sample:', data.length > 0 ? data[0] : 'No data');

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      const mappedData = data.map(student => ({
        id: student.id,
        name: student.name,
        student_id: student.student_id,
        class_id: student.class_id.id,
        section_id: student.section_id.id,
        class_name: student.class_id.name,
        section: student.section_id.name,
        photo_url: student.photo_url,
        status: student.status
      }));

      console.log('StudentService: Mapped data sample:', mappedData.length > 0 ? mappedData[0] : 'No data');
      return mappedData;
    } catch (error) {
      console.error(`Error in getStudentsByClassAndSection(${classId}, ${sectionId}):`, error);
      // إرجاع مصفوفة فارغة بدلاً من رمي الخطأ
      return [];
    }
  }

  /**
   * الحصول على طالب بواسطة المعرف
   * @param {number} id معرف الطالب
   * @returns {Promise} وعد بالطالب
   */
  static async getStudentById(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class_id (id, name),
          section_id (id, name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching student with id ${id}:`, error);
        throw error;
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data.id,
        name: data.name,
        student_id: data.student_id,
        class_id: data.class_id.id,
        section_id: data.section_id.id,
        class_name: data.class_id.name,
        section: data.section_id.name,
        photo_url: data.photo_url,
        status: data.status
      };
    } catch (error) {
      console.error(`Error in getStudentById(${id}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء طالب جديد
   * @param {Object} studentData بيانات الطالب
   * @returns {Promise} وعد بالطالب المنشأ
   */
  static async createStudent(studentData) {
    try {
      // إذا كان هناك صورة
      let photoUrl = null;
      if (studentData.image && typeof studentData.image === 'string' && studentData.image.startsWith('data:image')) {
        // إذا كانت الصورة موجودة كـ Base64
        console.log('Using Base64 image directly');
        photoUrl = studentData.image;
        console.log('Storing Base64 image directly in the database');
      } else if (typeof studentData.image === 'string') {
        // إذا كانت الصورة موجودة كعنوان URL
        photoUrl = studentData.image;
      }

      // إنشاء الطالب
      const { data, error } = await supabase
        .from('students')
        .insert([{
          name: studentData.name,
          student_id: studentData.student_id || null,
          class_id: studentData.class_id,
          section_id: studentData.section_id,
          photo_url: photoUrl,
          status: studentData.status || 'active'
        }])
        .select();

      if (error) {
        console.error('Error creating student:', error);
        throw error;
      }

      // الحصول على بيانات الصف والقسم
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('name')
        .eq('id', studentData.class_id)
        .single();

      if (classError) {
        console.error('Error fetching class data:', classError);
      }

      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('name')
        .eq('id', studentData.section_id)
        .single();

      if (sectionError) {
        console.error('Error fetching section data:', sectionError);
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data[0].id,
        name: data[0].name,
        student_id: data[0].student_id,
        class_id: data[0].class_id,
        section_id: data[0].section_id,
        class_name: classData ? classData.name : '',
        section: sectionData ? sectionData.name : '',
        photo_url: data[0].photo_url,
        status: data[0].status
      };
    } catch (error) {
      console.error('Error in createStudent:', error);
      throw error;
    }
  }

  /**
   * تحديث طالب
   * @param {number} id معرف الطالب
   * @param {Object} studentData بيانات الطالب
   * @returns {Promise} وعد بالطالب المحدث
   */
  static async updateStudent(id, studentData) {
    try {
      // إذا كان هناك صورة جديدة
      let photoUrl = studentData.photo_url || null;
      if (studentData.image && typeof studentData.image === 'string' && studentData.image.startsWith('data:image')) {
        // إذا كانت الصورة موجودة كـ Base64
        console.log('Using Base64 image directly for update');
        photoUrl = studentData.image;
        console.log('Storing Base64 image directly in the database for update');
      } else if (typeof studentData.image === 'string') {
        // إذا كانت الصورة موجودة كعنوان URL
        photoUrl = studentData.image;
      }

      // تحديث الطالب
      const { data, error } = await supabase
        .from('students')
        .update({
          name: studentData.name,
          student_id: studentData.student_id || null,
          class_id: studentData.class_id,
          section_id: studentData.section_id,
          photo_url: photoUrl,
          status: studentData.status || 'active'
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating student with id ${id}:`, error);
        throw error;
      }

      // الحصول على بيانات الصف والقسم
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('name')
        .eq('id', studentData.class_id)
        .single();

      if (classError) {
        console.error('Error fetching class data:', classError);
      }

      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('name')
        .eq('id', studentData.section_id)
        .single();

      if (sectionError) {
        console.error('Error fetching section data:', sectionError);
      }

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: data[0].id,
        name: data[0].name,
        student_id: data[0].student_id,
        class_id: data[0].class_id,
        section_id: data[0].section_id,
        class_name: classData ? classData.name : '',
        section: sectionData ? sectionData.name : '',
        photo_url: data[0].photo_url,
        status: data[0].status
      };
    } catch (error) {
      console.error(`Error in updateStudent(${id}):`, error);
      throw error;
    }
  }

  /**
   * حذف طالب
   * @param {number} id معرف الطالب
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteStudent(id) {
    try {
      console.log(`Deleting student with id ${id}`);

      // حذف الطالب
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting student with id ${id}:`, error);
        throw error;
      }

      console.log(`Successfully deleted student with id ${id}`);
      return true;
    } catch (error) {
      console.error(`Error in deleteStudent(${id}):`, error);
      throw error;
    }
  }
}

export default StudentService;
