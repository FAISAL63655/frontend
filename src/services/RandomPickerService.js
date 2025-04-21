// RandomPickerService.js - خدمة للتعامل مع الاختيار العشوائي للطلاب

import supabase from './supabaseClient';

class RandomPickerService {
  /**
   * اختيار طالب عشوائي من الصف والقسم المحددين
   * @param {number} classId معرف الصف
   * @param {number} sectionId معرف القسم
   * @returns {Promise} وعد بالطالب المختار عشوائياً
   */
  static async getRandomStudent(classId, sectionId) {
    try {
      // الحصول على جميع الطلاب في الصف والقسم المحددين
      const { data: students, error } = await supabase
        .from('students')
        .select(`
          *,
          class:class_id (id, name),
          section:section_id (id, name)
        `)
        .eq('class_id', classId)
        .eq('section_id', sectionId);

      if (error) {
        console.error('Error fetching students for random selection:', error);
        throw error;
      }

      if (!students || students.length === 0) {
        throw new Error('لا يوجد طلاب في الصف والقسم المحددين');
      }

      // اختيار طالب عشوائي
      const randomIndex = Math.floor(Math.random() * students.length);
      const randomStudent = students[randomIndex];

      // تحويل البيانات إلى الشكل المتوقع في الفرونت إند
      return {
        id: randomStudent.id,
        name: randomStudent.name,
        student_id: randomStudent.student_id,
        class_id: randomStudent.class_id,
        section_id: randomStudent.section_id,
        photo_url: randomStudent.photo_url,
        image: randomStudent.photo_url, // للتوافق مع الواجهة الأمامية
        class_name: randomStudent.class ? randomStudent.class.name : '',
        section: randomStudent.section ? randomStudent.section.name : '',
        status: randomStudent.status
      };
    } catch (error) {
      console.error('Error in getRandomStudent:', error);
      throw error;
    }
  }

  /**
   * إنشاء مجموعات عشوائية من الطلاب
   * @param {number} classId معرف الصف
   * @param {number} sectionId معرف القسم
   * @param {number} groupCount عدد المجموعات
   * @returns {Promise} وعد بقائمة المجموعات
   */
  static async createRandomGroups(classId, sectionId, groupCount = 3) {
    try {
      // التأكد من أن عدد المجموعات صحيح
      groupCount = parseInt(groupCount);
      if (isNaN(groupCount) || groupCount < 2) {
        groupCount = 2;
      }

      // الحصول على جميع الطلاب في الصف والقسم المحددين
      const { data: students, error } = await supabase
        .from('students')
        .select(`
          *,
          class:class_id (id, name),
          section:section_id (id, name)
        `)
        .eq('class_id', classId)
        .eq('section_id', sectionId);

      if (error) {
        console.error('Error fetching students for random groups:', error);
        throw error;
      }

      if (!students || students.length === 0) {
        throw new Error('لا يوجد طلاب في الصف والقسم المحددين');
      }

      // خلط الطلاب بشكل عشوائي
      const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

      // إنشاء المجموعات
      const count = Math.min(groupCount, shuffledStudents.length);
      const groups = Array.from({ length: count }, () => []);

      // توزيع الطلاب على المجموعات
      shuffledStudents.forEach((student, index) => {
        const groupIndex = index % count;
        groups[groupIndex].push({
          id: student.id,
          name: student.name,
          student_id: student.student_id,
          class_id: student.class_id,
          section_id: student.section_id,
          photo_url: student.photo_url,
          image: student.photo_url, // للتوافق مع الواجهة الأمامية
          class_name: student.class ? student.class.name : '',
          section: student.section ? student.section.name : '',
          status: student.status
        });
      });

      return groups;
    } catch (error) {
      console.error('Error in createRandomGroups:', error);
      throw error;
    }
  }
}

export default RandomPickerService;
