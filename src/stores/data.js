import { defineStore } from 'pinia'
import { useCacheStore } from './cache'
import api from '@/services/apiConfig'

/**
 * مخزن للبيانات المشتركة المستخدمة في التطبيق
 * يستخدم للحصول على البيانات المشتركة مثل الصفوف والفصول والمواد
 */
export const useDataStore = defineStore('data', {
  state: () => ({
    // البيانات المشتركة
    classes: [],
    sections: [],
    subjects: [],
    students: [],
    
    // حالة التحميل
    loading: {
      classes: false,
      sections: false,
      subjects: false,
      students: false
    },
    
    // حالة الخطأ
    error: {
      classes: null,
      sections: null,
      subjects: null,
      students: null
    },
    
    // تكوين التخزين المؤقت
    cacheConfig: {
      // مدة التخزين المؤقت للبيانات المشتركة (10 دقائق)
      ttl: 10 * 60 * 1000,
      // مفاتيح التخزين المؤقت
      keys: {
        classes: 'data:classes',
        sections: 'data:sections',
        subjects: 'data:subjects',
        students: 'data:students'
      }
    }
  }),
  
  getters: {
    /**
     * الحصول على الصفوف كخيارات للقوائم المنسدلة
     */
    classOptions: (state) => {
      return state.classes.map(c => ({
        title: c.name,
        value: c.id
      }));
    },
    
    /**
     * الحصول على الفصول كخيارات للقوائم المنسدلة
     */
    sectionOptions: (state) => {
      return state.sections.map(s => ({
        title: s.name,
        value: s.id
      }));
    },
    
    /**
     * الحصول على المواد كخيارات للقوائم المنسدلة
     */
    subjectOptions: (state) => {
      return state.subjects.map(s => ({
        title: s.name,
        value: s.id
      }));
    },
    
    /**
     * الحصول على اسم الصف من المعرف
     */
    getClassName: (state) => (id) => {
      const classItem = state.classes.find(c => c.id === id);
      return classItem ? classItem.name : '';
    },
    
    /**
     * الحصول على اسم الفصل من المعرف
     */
    getSectionName: (state) => (id) => {
      const section = state.sections.find(s => s.id === id);
      return section ? section.name : '';
    },
    
    /**
     * الحصول على اسم المادة من المعرف
     */
    getSubjectName: (state) => (id) => {
      const subject = state.subjects.find(s => s.id === id);
      return subject ? subject.name : '';
    },
    
    /**
     * الحصول على معلومات الطالب من المعرف
     */
    getStudentById: (state) => (id) => {
      return state.students.find(s => s.id === id) || null;
    }
  },
  
  actions: {
    /**
     * جلب الصفوف من API
     * @param {boolean} force - تجاهل التخزين المؤقت وجلب البيانات من API
     */
    async fetchClasses(force = false) {
      const cacheStore = useCacheStore();
      const cacheKey = this.cacheConfig.keys.classes;
      
      // التحقق من التخزين المؤقت إذا لم يكن مطلوبًا التجاهل
      if (!force) {
        const cachedData = cacheStore.get(cacheKey);
        if (cachedData) {
          this.classes = cachedData;
          return this.classes;
        }
      }
      
      // تعيين حالة التحميل
      this.loading.classes = true;
      this.error.classes = null;
      
      try {
        // جلب البيانات من API
        const response = await api.get('classes/');
        this.classes = response.data || [];
        
        // تخزين البيانات في التخزين المؤقت
        cacheStore.set(cacheKey, this.classes, this.cacheConfig.ttl);
        
        return this.classes;
      } catch (error) {
        console.error('Error fetching classes:', error);
        this.error.classes = error.message || 'حدث خطأ أثناء جلب الصفوف';
        
        // إذا كانت هناك بيانات محلية، استخدمها
        if (this.classes.length === 0) {
          this.classes = [
            { id: 1, name: 'الصف الأول' },
            { id: 2, name: 'الصف الثاني' },
            { id: 3, name: 'الصف الثالث' }
          ];
        }
        
        return this.classes;
      } finally {
        this.loading.classes = false;
      }
    },
    
    /**
     * جلب الفصول من API
     * @param {boolean} force - تجاهل التخزين المؤقت وجلب البيانات من API
     */
    async fetchSections(force = false) {
      const cacheStore = useCacheStore();
      const cacheKey = this.cacheConfig.keys.sections;
      
      // التحقق من التخزين المؤقت إذا لم يكن مطلوبًا التجاهل
      if (!force) {
        const cachedData = cacheStore.get(cacheKey);
        if (cachedData) {
          this.sections = cachedData;
          return this.sections;
        }
      }
      
      // تعيين حالة التحميل
      this.loading.sections = true;
      this.error.sections = null;
      
      try {
        // جلب البيانات من API
        const response = await api.get('sections/');
        this.sections = response.data || [];
        
        // تخزين البيانات في التخزين المؤقت
        cacheStore.set(cacheKey, this.sections, this.cacheConfig.ttl);
        
        return this.sections;
      } catch (error) {
        console.error('Error fetching sections:', error);
        this.error.sections = error.message || 'حدث خطأ أثناء جلب الفصول';
        
        // إذا كانت هناك بيانات محلية، استخدمها
        if (this.sections.length === 0) {
          this.sections = [
            { id: 1, name: 'أ' },
            { id: 2, name: 'ب' },
            { id: 3, name: 'ج' }
          ];
        }
        
        return this.sections;
      } finally {
        this.loading.sections = false;
      }
    },
    
    /**
     * جلب المواد من API
     * @param {boolean} force - تجاهل التخزين المؤقت وجلب البيانات من API
     */
    async fetchSubjects(force = false) {
      const cacheStore = useCacheStore();
      const cacheKey = this.cacheConfig.keys.subjects;
      
      // التحقق من التخزين المؤقت إذا لم يكن مطلوبًا التجاهل
      if (!force) {
        const cachedData = cacheStore.get(cacheKey);
        if (cachedData) {
          this.subjects = cachedData;
          return this.subjects;
        }
      }
      
      // تعيين حالة التحميل
      this.loading.subjects = true;
      this.error.subjects = null;
      
      try {
        // جلب البيانات من API
        const response = await api.get('subjects/');
        this.subjects = response.data || [];
        
        // تخزين البيانات في التخزين المؤقت
        cacheStore.set(cacheKey, this.subjects, this.cacheConfig.ttl);
        
        return this.subjects;
      } catch (error) {
        console.error('Error fetching subjects:', error);
        this.error.subjects = error.message || 'حدث خطأ أثناء جلب المواد';
        
        // إذا كانت هناك بيانات محلية، استخدمها
        if (this.subjects.length === 0) {
          this.subjects = [
            { id: 1, name: 'القرآن الكريم' },
            { id: 2, name: 'التوحيد' },
            { id: 3, name: 'الفقه' },
            { id: 4, name: 'الحديث' }
          ];
        }
        
        return this.subjects;
      } finally {
        this.loading.subjects = false;
      }
    },
    
    /**
     * جلب الطلاب حسب الصف والفصل
     * @param {number} classId - معرف الصف
     * @param {number} sectionId - معرف الفصل
     * @param {boolean} force - تجاهل التخزين المؤقت وجلب البيانات من API
     */
    async fetchStudentsByClassAndSection(classId, sectionId, force = false) {
      if (!classId || !sectionId) {
        console.error('Class ID and Section ID are required');
        return [];
      }
      
      const cacheStore = useCacheStore();
      const cacheKey = `${this.cacheConfig.keys.students}:class:${classId}:section:${sectionId}`;
      
      // التحقق من التخزين المؤقت إذا لم يكن مطلوبًا التجاهل
      if (!force) {
        const cachedData = cacheStore.get(cacheKey);
        if (cachedData) {
          this.students = cachedData;
          return this.students;
        }
      }
      
      // تعيين حالة التحميل
      this.loading.students = true;
      this.error.students = null;
      
      try {
        // جلب البيانات من API
        const response = await api.get('students/by_class_section/', {
          params: {
            class_id: classId,
            section_id: sectionId
          }
        });
        
        // معالجة البيانات
        this.students = response.data.map(student => ({
          ...student,
          class_name: this.getClassName(student.class_id || student.class_name),
          section: this.getSectionName(student.section_id || student.section)
        }));
        
        // تخزين البيانات في التخزين المؤقت
        cacheStore.set(cacheKey, this.students, this.cacheConfig.ttl);
        
        return this.students;
      } catch (error) {
        console.error('Error fetching students:', error);
        this.error.students = error.message || 'حدث خطأ أثناء جلب الطلاب';
        
        // إذا كانت هناك بيانات محلية، استخدمها
        if (this.students.length === 0) {
          this.students = [
            {
              id: 1,
              name: 'أحمد محمد',
              class_id: classId,
              section_id: sectionId,
              class_name: this.getClassName(classId),
              section: this.getSectionName(sectionId),
              status: 'active',
              image: 'https://randomuser.me/api/portraits/men/1.jpg'
            },
            {
              id: 2,
              name: 'محمد علي',
              class_id: classId,
              section_id: sectionId,
              class_name: this.getClassName(classId),
              section: this.getSectionName(sectionId),
              status: 'active',
              image: 'https://randomuser.me/api/portraits/men/2.jpg'
            }
          ];
        }
        
        return this.students;
      } finally {
        this.loading.students = false;
      }
    },
    
    /**
     * إبطال التخزين المؤقت للبيانات
     * @param {string} dataType - نوع البيانات (classes, sections, subjects, students)
     */
    invalidateCache(dataType) {
      const cacheStore = useCacheStore();
      
      if (dataType === 'all') {
        // إبطال جميع البيانات
        Object.values(this.cacheConfig.keys).forEach(key => {
          cacheStore.invalidatePattern(key);
        });
      } else if (dataType === 'students') {
        // إبطال بيانات الطلاب
        cacheStore.invalidatePattern(this.cacheConfig.keys.students);
      } else {
        // إبطال نوع بيانات محدد
        const key = this.cacheConfig.keys[dataType];
        if (key) {
          cacheStore.invalidate(key);
        }
      }
    },
    
    /**
     * جلب جميع البيانات المشتركة
     * @param {boolean} force - تجاهل التخزين المؤقت وجلب البيانات من API
     */
    async fetchAllData(force = false) {
      // جلب البيانات بالتوازي
      await Promise.all([
        this.fetchClasses(force),
        this.fetchSections(force),
        this.fetchSubjects(force)
      ]);
    }
  }
})
