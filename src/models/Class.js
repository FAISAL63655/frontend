/**
 * نموذج الصف الدراسي
 * يمثل هذا النموذج الصف الدراسي في النظام
 */
export default class Class {
  /**
   * إنشاء كائن جديد من الصف الدراسي
   * @param {Object} data - بيانات الصف الدراسي
   * @param {number} data.id - معرف الصف الدراسي
   * @param {string} data.name - اسم الصف الدراسي
   * @param {string} [data.description] - وصف الصف الدراسي (اختياري)
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
  }

  /**
   * تحويل الكائن إلى كائن JSON للإرسال إلى الخادم
   * @returns {Object} - كائن JSON يمثل الصف الدراسي
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description
    };
  }

  /**
   * إنشاء كائن من الصف الدراسي من بيانات JSON
   * @param {Object} json - بيانات JSON
   * @returns {Class} - كائن من الصف الدراسي
   */
  static fromJSON(json) {
    return new Class({
      id: json.id,
      name: json.name,
      description: json.description
    });
  }
}
