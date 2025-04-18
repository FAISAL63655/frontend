import { defineStore } from 'pinia'

/**
 * مخزن للتخزين المؤقت للبيانات
 * يستخدم لتخزين البيانات المستخدمة بشكل متكرر وتقليل عدد طلبات API
 */
export const useCacheStore = defineStore('cache', {
  state: () => ({
    // البيانات المخزنة مؤقتًا
    data: {},
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

  getters: {
    /**
     * الحصول على حجم التخزين المؤقت
     */
    cacheSize: (state) => Object.keys(state.data).length,

    /**
     * الحصول على قائمة المفاتيح المخزنة مؤقتًا
     */
    cachedKeys: (state) => Object.keys(state.data),

    /**
     * التحقق مما إذا كان المفتاح مخزنًا مؤقتًا وصالحًا
     */
    isValid: (state) => (key) => {
      return state.data[key] !== undefined && 
             state.expiry[key] !== undefined && 
             state.expiry[key] > Date.now();
    }
  },

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
      this.data[key] = value;
      // تعيين وقت انتهاء الصلاحية
      this.expiry[key] = Date.now() + (ttl || this.settings.defaultTTL);

      console.log(`[Cache] Set: ${key} (expires in ${(ttl || this.settings.defaultTTL) / 1000}s)`);
    },

    /**
     * الحصول على بيانات من التخزين المؤقت
     * @param {string} key - مفتاح التخزين
     * @returns {any|null} - البيانات المخزنة أو null إذا لم تكن موجودة أو منتهية الصلاحية
     */
    get(key) {
      if (!this.settings.enabled) return null;

      // التحقق من وجود البيانات وصلاحيتها
      if (this.isValid(key)) {
        console.log(`[Cache] Hit: ${key}`);
        return this.data[key];
      }

      // إذا كانت البيانات منتهية الصلاحية، قم بإزالتها
      if (this.data[key] !== undefined) {
        console.log(`[Cache] Miss (expired): ${key}`);
        this.invalidate(key);
      } else {
        console.log(`[Cache] Miss (not found): ${key}`);
      }

      return null;
    },

    /**
     * إبطال مفتاح في التخزين المؤقت
     * @param {string} key - مفتاح التخزين
     */
    invalidate(key) {
      delete this.data[key];
      delete this.expiry[key];
      console.log(`[Cache] Invalidated: ${key}`);
    },

    /**
     * إبطال جميع المفاتيح التي تبدأ بنمط معين
     * @param {string} pattern - نمط المفتاح
     */
    invalidatePattern(pattern) {
      const keys = Object.keys(this.data);
      const invalidatedKeys = keys.filter(key => key.startsWith(pattern));
      
      invalidatedKeys.forEach(key => {
        this.invalidate(key);
      });

      console.log(`[Cache] Invalidated ${invalidatedKeys.length} keys matching pattern: ${pattern}`);
    },

    /**
     * مسح جميع البيانات المخزنة مؤقتًا
     */
    clear() {
      this.data = {};
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
    },

    /**
     * تفعيل أو تعطيل التخزين المؤقت
     * @param {boolean} enabled - حالة التفعيل
     */
    setEnabled(enabled) {
      this.settings.enabled = enabled;
      console.log(`[Cache] ${enabled ? 'Enabled' : 'Disabled'}`);
    }
  }
})
