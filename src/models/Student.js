/**
 * نموذج الطالب
 * يمثل هذا النموذج الطالب في النظام
 */
export default class Student {
  /**
   * إنشاء كائن جديد من الطالب
   * @param {Object} data - بيانات الطالب
   * @param {number} data.id - معرف الطالب
   * @param {string} data.name - اسم الطالب
   * @param {number} data.class_id - معرف الصف الدراسي
   * @param {number} data.section_id - معرف الفصل الدراسي
   * @param {string} [data.class_name] - اسم الصف الدراسي
   * @param {string} [data.section_name] - اسم الفصل الدراسي
   * @param {string} [data.status] - حالة الطالب (نشط، غير نشط)
   * @param {string} [data.image] - رابط صورة الطالب
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.class_id = data.class_id || null;
    this.section_id = data.section_id || null;
    this.class_name = data.class_name || '';
    this.section_name = data.section_name || '';
    this.status = data.status || 'active';
    this.image = data.image || '';
  }

  /**
   * تحويل الكائن إلى كائن JSON للإرسال إلى الخادم
   * @returns {Object} - كائن JSON يمثل الطالب
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      class_id: this.class_id,
      section_id: this.section_id,
      status: this.status,
      image: this.image
    };
  }

  /**
   * إنشاء كائن من الطالب من بيانات JSON
   * @param {Object} json - بيانات JSON
   * @returns {Student} - كائن من الطالب
   */
  static fromJSON(json) {
    return new Student({
      id: json.id,
      name: json.name,
      class_id: json.class_id,
      section_id: json.section_id,
      class_name: json.class_name,
      section_name: json.section_name,
      status: json.status,
      image: json.image
    });
  }

  /**
   * الحصول على الاسم الكامل للصف والفصل
   * @returns {string} - الاسم الكامل للصف والفصل
   */
  getFullClassSection() {
    return `${this.class_name} ${this.section_name}`;
  }

  /**
   * التحقق مما إذا كان الطالب نشطًا
   * @returns {boolean} - هل الطالب نشط؟
   */
  isActive() {
    return this.status === 'active';
  }
}
