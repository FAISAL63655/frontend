import { defineStore } from 'pinia'

/**
 * مخزن بسيط للتخزين المؤقت للبيانات
 * يستخدم لتخزين البيانات المستخدمة بشكل متكرر وتقليل عدد طلبات API
 */
export const useSimpleCacheStore = defineStore('simpleCache', {
  state: () => ({
    // البيانات المخزنة مؤقتًا
    cache: {},
    // وقت انتهاء صلاحية البيانات
    expiry: {},
    // إعدادات التخزين المؤقت
    settings: {
      // مدة التخزين المؤقت الافتراضية (5 دقائق)
      defaultTTL: 5 * 60 * 1000,
      // هل التخزين المؤقت مفعل
      enabled: true
    }
  }),

  actions: {
    /**
     * تخزين بيانات في التخزين المؤقت
     * @param {string} key - مفتاح التخزين
     * @param {any} value - القيمة المراد تخزينها
     * @param {number} ttl - مدة الصلاحية بالمللي ثانية (اختياري)
     */
    set(key, value, ttl = null) {
      if (!this.settings.enabled) return;

      // تخزين البيانات
      this.cache[key] = value;
      // تعيين وقت انتهاء الصلاحية
      this.expiry[key] = Date.now() + (ttl || this.settings.defaultTTL);

      console.log(`[Cache] Set: ${key}`);
    },

    /**
     * الحصول على بيانات من التخزين المؤقت
     * @param {string} key - مفتاح التخزين
     * @returns {any|null} - البيانات المخزنة أو null إذا لم تكن موجودة أو منتهية الصلاحية
     */
    get(key) {
      if (!this.settings.enabled) return null;

      // التحقق من وجود البيانات وصلاحيتها
      if (this.cache[key] !== undefined && this.expiry[key] > Date.now()) {
        console.log(`[Cache] Hit: ${key}`);
        return this.cache[key];
      }

      // إذا كانت البيانات منتهية الصلاحية، قم بإزالتها
      if (this.cache[key] !== undefined) {
        console.log(`[Cache] Miss (expired): ${key}`);
        this.remove(key);
      } else {
        console.log(`[Cache] Miss (not found): ${key}`);
      }

      return null;
    },

    /**
     * إزالة مفتاح من التخزين المؤقت
     * @param {string} key - مفتاح التخزين
     */
    remove(key) {
      delete this.cache[key];
      delete this.expiry[key];
      console.log(`[Cache] Removed: ${key}`);
    },

    /**
     * مسح جميع البيانات المخزنة مؤقتًا
     */
    clear() {
      this.cache = {};
      this.expiry = {};
      console.log('[Cache] Cleared all cached data');
    },

    /**
     * تحديث إعدادات التخزين المؤقت
     * @param {Object} settings - الإعدادات الجديدة
     */
    updateSettings(settings) {
      this.settings = { ...this.settings, ...settings };
      console.log('[Cache] Settings updated:', this.settings);
    }
  }
})
