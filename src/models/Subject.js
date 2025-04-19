/**
 * نموذج المادة الدراسية
 * يمثل هذا النموذج المادة الدراسية في النظام
 */
export default class Subject {
  /**
   * إنشاء كائن جديد من المادة الدراسية
   * @param {Object} data - بيانات المادة الدراسية
   * @param {number} data.id - معرف المادة الدراسية
   * @param {string} data.name - اسم المادة الدراسية
   * @param {number} [data.parent_id] - معرف المادة الأساسية (المادة الأم) التي ترتبط بها (اختياري)
   * @param {boolean} [data.is_main] - هل هذه مادة أساسية؟
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.parent_id = data.parent_id || null;
    this.is_main = data.is_main || false;
  }

  /**
   * تحويل الكائن إلى كائن JSON للإرسال إلى الخادم
   * @returns {Object} - كائن JSON يمثل المادة الدراسية
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      parent_id: this.parent_id,
      is_main: this.is_main
    };
  }

  /**
   * إنشاء كائن من المادة الدراسية من بيانات JSON
   * @param {Object} json - بيانات JSON
   * @returns {Subject} - كائن من المادة الدراسية
   */
  static fromJSON(json) {
    return new Subject({
      id: json.id,
      name: json.name,
      parent_id: json.parent_id,
      is_main: json.is_main
    });
  }

  /**
   * إنشاء مادة أساسية جديدة
   * @param {string} name - اسم المادة الأساسية
   * @returns {Subject} - كائن من المادة الأساسية
   */
  static createMainSubject(name) {
    return new Subject({
      name: name,
      is_main: true
    });
  }

  /**
   * إنشاء مادة فرعية جديدة
   * @param {string} name - اسم المادة الفرعية
   * @param {number} parent_id - معرف المادة الأساسية
   * @returns {Subject} - كائن من المادة الفرعية
   */
  static createSubSubject(name, parent_id) {
    return new Subject({
      name: name,
      parent_id: parent_id,
      is_main: false
    });
  }
}
