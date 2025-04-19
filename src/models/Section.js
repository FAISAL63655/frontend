/**
 * نموذج الفصل الدراسي
 * يمثل هذا النموذج الفصل الدراسي في النظام
 */
export default class Section {
  /**
   * إنشاء كائن جديد من الفصل الدراسي
   * @param {Object} data - بيانات الفصل الدراسي
   * @param {number} data.id - معرف الفصل الدراسي
   * @param {string} data.name - اسم الفصل الدراسي
   * @param {number} data.class_id - معرف الصف الدراسي الذي ينتمي إليه الفصل
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.class_id = data.class_id || null;
  }

  /**
   * تحويل الكائن إلى كائن JSON للإرسال إلى الخادم
   * @returns {Object} - كائن JSON يمثل الفصل الدراسي
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      class_id: this.class_id
    };
  }

  /**
   * إنشاء كائن من الفصل الدراسي من بيانات JSON
   * @param {Object} json - بيانات JSON
   * @returns {Section} - كائن من الفصل الدراسي
   */
  static fromJSON(json) {
    return new Section({
      id: json.id,
      name: json.name,
      class_id: json.class_id
    });
  }
}
