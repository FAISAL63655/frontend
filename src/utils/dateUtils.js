/**
 * تنسيق التاريخ إلى صيغة YYYY-MM-DD
 * @param {Date} date كائن التاريخ
 * @returns {string} التاريخ بصيغة YYYY-MM-DD
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * تحويل التاريخ من صيغة YYYY-MM-DD إلى كائن Date
 * @param {string} dateString التاريخ بصيغة YYYY-MM-DD
 * @returns {Date} كائن التاريخ
 */
export function parseDate(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day);
}

/**
 * الحصول على اسم اليوم بالعربية
 * @param {Date} date كائن التاريخ
 * @returns {string} اسم اليوم بالعربية
 */
export function getDayName(date) {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[date.getDay()];
}

/**
 * الحصول على اسم الشهر بالعربية
 * @param {Date} date كائن التاريخ
 * @returns {string} اسم الشهر بالعربية
 */
export function getMonthName(date) {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[date.getMonth()];
}

/**
 * تنسيق التاريخ بالصيغة العربية (اليوم، التاريخ الشهر السنة)
 * @param {Date|string} date كائن التاريخ أو التاريخ بصيغة YYYY-MM-DD
 * @returns {string} التاريخ بالصيغة العربية
 */
export function formatDateArabic(date) {
  if (!date) return '';
  
  // تحويل التاريخ إلى كائن Date إذا كان نصاً
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  
  if (!dateObj) return '';
  
  const day = dateObj.getDate();
  const monthName = getMonthName(dateObj);
  const year = dateObj.getFullYear();
  const dayName = getDayName(dateObj);
  
  return `${dayName}، ${day} ${monthName} ${year}`;
}

/**
 * حساب الفرق بين تاريخين بالأيام
 * @param {Date|string} date1 التاريخ الأول
 * @param {Date|string} date2 التاريخ الثاني
 * @returns {number} الفرق بالأيام
 */
export function daysDifference(date1, date2) {
  // تحويل التواريخ إلى كائنات Date إذا كانت نصوصاً
  const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;
  
  if (!d1 || !d2) return null;
  
  // حساب الفرق بالمللي ثانية وتحويله إلى أيام
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * التحقق مما إذا كان التاريخ في الماضي
 * @param {Date|string} date التاريخ
 * @returns {boolean} هل التاريخ في الماضي
 */
export function isPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  
  if (!dateObj) return false;
  
  return dateObj < today;
}

/**
 * التحقق مما إذا كان التاريخ اليوم
 * @param {Date|string} date التاريخ
 * @returns {boolean} هل التاريخ اليوم
 */
export function isToday(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  
  if (!dateObj) return false;
  
  return dateObj.getDate() === today.getDate() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getFullYear() === today.getFullYear();
}

/**
 * إضافة أيام إلى تاريخ
 * @param {Date|string} date التاريخ
 * @param {number} days عدد الأيام
 * @returns {Date} التاريخ الجديد
 */
export function addDays(date, days) {
  const dateObj = typeof date === 'string' ? parseDate(date) : new Date(date);
  
  if (!dateObj) return null;
  
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
}

/**
 * الحصول على بداية الأسبوع (الأحد)
 * @param {Date|string} date التاريخ
 * @returns {Date} تاريخ بداية الأسبوع
 */
export function getWeekStart(date) {
  const dateObj = typeof date === 'string' ? parseDate(date) : new Date(date);
  
  if (!dateObj) return null;
  
  const day = dateObj.getDay(); // 0 = الأحد، 1 = الإثنين، إلخ
  const diff = dateObj.getDate() - day;
  
  return new Date(dateObj.setDate(diff));
}

/**
 * الحصول على نهاية الأسبوع (السبت)
 * @param {Date|string} date التاريخ
 * @returns {Date} تاريخ نهاية الأسبوع
 */
export function getWeekEnd(date) {
  const weekStart = getWeekStart(date);
  
  if (!weekStart) return null;
  
  return addDays(weekStart, 6);
}
