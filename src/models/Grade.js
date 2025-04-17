/**
 * نموذج الدرجات
 * يمثل هذا النموذج درجات الطالب في النظام
 */
export default class Grade {
  /**
   * إنشاء كائن جديد من الدرجات
   * @param {Object} data - بيانات الدرجات
   * @param {number} data.id - معرف الدرجات
   * @param {number} data.student_id - معرف الطالب
   * @param {number} data.subject_id - معرف المادة
   * @param {number} [data.theory] - درجة الاختبار النظري (من 15)
   * @param {number} [data.practical] - درجة التطبيق العملي (من 5)
   * @param {number} [data.homework] - درجة الواجبات المنزلية (من 30)
   * @param {number} [data.participation] - درجة المشاركة الصفية (من 10)
   * @param {number} [data.final] - درجة الاختبار النهائي (من 40)
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.student_id = data.student_id || null;
    this.subject_id = data.subject_id || null;
    this.theory = data.theory || 0;
    this.practical = data.practical || 0;
    this.homework = data.homework || 0;
    this.participation = data.participation || 0;
    this.final = data.final || 0;
  }

  /**
   * تحويل الكائن إلى كائن JSON للإرسال إلى الخادم
   * @returns {Object} - كائن JSON يمثل الدرجات
   */
  toJSON() {
    return {
      id: this.id,
      student_id: this.student_id,
      subject_id: this.subject_id,
      theory: this.theory,
      practical: this.practical,
      homework: this.homework,
      participation: this.participation,
      final: this.final
    };
  }

  /**
   * إنشاء كائن من الدرجات من بيانات JSON
   * @param {Object} json - بيانات JSON
   * @returns {Grade} - كائن من الدرجات
   */
  static fromJSON(json) {
    return new Grade({
      id: json.id,
      student_id: json.student_id,
      subject_id: json.subject_id,
      theory: json.theory,
      practical: json.practical,
      homework: json.homework,
      participation: json.participation,
      final: json.final
    });
  }

  /**
   * حساب المجموع الكلي للدرجات
   * @returns {number} - المجموع الكلي للدرجات (من 100)
   */
  calculateTotal() {
    return this.theory + this.practical + this.homework + this.participation + this.final;
  }

  /**
   * التحقق مما إذا كان الطالب ناجحًا
   * @param {number} [passingGrade=50] - درجة النجاح
   * @returns {boolean} - هل الطالب ناجح؟
   */
  isPassing(passingGrade = 50) {
    return this.calculateTotal() >= passingGrade;
  }
}
