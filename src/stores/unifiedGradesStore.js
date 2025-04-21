// unifiedGradesStore.js - متجر للتعامل مع الدرجات الموحدة

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import UnifiedGradeService from '../services/UnifiedGradeService';

// مدة صلاحية الكاش بالمللي ثانية (5 دقائق)
const CACHE_EXPIRY = 5 * 60 * 1000;

export const useUnifiedGradesStore = defineStore('unifiedGrades', () => {
  // حالة المتجر
  const grades = ref({}); // الدرجات مفهرسة حسب معرف الطالب
  const lastFetch = ref({}); // آخر وقت تم فيه جلب البيانات
  const loading = ref(false); // حالة التحميل

  // التحقق من صلاحية الكاش
  const isCacheValid = (key) => {
    if (!lastFetch.value[key]) return false;
    const now = Date.now();
    return now - lastFetch.value[key] < CACHE_EXPIRY;
  };

  // مسح الكاش
  const clearCache = (key = null) => {
    if (key) {
      // مسح كاش محدد
      console.log(`Clearing cache for key: ${key}`);
      lastFetch.value[key] = null;
    } else {
      // مسح جميع الكاش
      console.log('Clearing all cache');
      Object.keys(lastFetch.value).forEach(k => {
        lastFetch.value[k] = null;
      });
    }
  };

  // جلب درجات طالب معين
  const fetchGradesForStudent = async (studentId) => {
    const cacheKey = `grades-${studentId}`;

    // التحقق من وجود بيانات في الكاش
    if (isCacheValid(cacheKey) && grades.value[studentId]) {
      console.log(`Using cached grades data for student ${studentId}`);
      return grades.value[studentId];
    }

    try {
      loading.value = true;
      console.log(`Fetching grades for student ${studentId} using UnifiedGradeService`);

      const data = await UnifiedGradeService.getGradesByStudent(studentId);

      // تحديث الكاش
      grades.value[studentId] = data;
      lastFetch.value[cacheKey] = Date.now();

      console.log(`Grades for student ${studentId}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching grades for student ${studentId}:`, error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // جلب درجات مجموعة من الطلاب
  const fetchGradesForStudents = async (studentIds) => {
    console.log('Student IDs to fetch grades for:', studentIds);
    console.log('Current grades cache:', grades.value);

    const results = {};
    const studentsToFetch = [];

    // التحقق من الكاش لكل طالب
    for (const studentId of studentIds) {
      const cacheKey = `grades-${studentId}`;
      const isCacheValidForStudent = isCacheValid(cacheKey) && grades.value[studentId];

      if (isCacheValidForStudent) {
        console.log(`Using cached data for student ${studentId}`);
        results[studentId] = grades.value[studentId];
      } else {
        studentsToFetch.push(studentId);
      }
    }

    // إذا كان هناك طلاب للجلب، نقوم بجلبهم دفعة واحدة
    if (studentsToFetch.length > 0) {
      try {
        loading.value = true;
        console.log(`Fetching grades for ${studentsToFetch.length} students in batch`);

        // جلب الدرجات لجميع الطلاب في طلب واحد
        const data = await UnifiedGradeService.getGradesForMultipleStudents(studentsToFetch);

        // تنظيم البيانات حسب معرف الطالب
        const groupedData = {};
        for (const grade of data) {
          const studentId = grade.student_id;
          if (!groupedData[studentId]) {
            groupedData[studentId] = [];
          }
          groupedData[studentId].push(grade);
        }

        // تحديث الكاش والنتائج
        for (const studentId of studentsToFetch) {
          const studentGrades = groupedData[studentId] || [];
          grades.value[studentId] = studentGrades;
          lastFetch.value[`grades-${studentId}`] = Date.now();
          results[studentId] = studentGrades;
        }
      } catch (error) {
        console.error(`Error fetching grades for multiple students:`, error);
        // في حالة الخطأ، نعيد إلى الطريقة القديمة للجلب الفردي
        for (const studentId of studentsToFetch) {
          try {
            const studentGrades = await fetchGradesForStudent(studentId);
            results[studentId] = studentGrades;
          } catch (err) {
            console.error(`Error fetching grades for student ${studentId}:`, err);
            results[studentId] = [];
          }
        }
      } finally {
        loading.value = false;
      }
    }

    return results;
  };

  // حفظ درجة
  const saveGrade = async (gradeData) => {
    try {
      console.log('Saving unified grade:', gradeData);

      // التحقق من وجود جميع الحقول المطلوبة
      if (!gradeData.student || !gradeData.subject || !gradeData.date) {
        throw new Error('Missing required fields for grade');
      }

      // إعداد بيانات الدرجة للحفظ
      const gradeRecord = {
        student_id: gradeData.student,
        subject_id: gradeData.subject,
        date: gradeData.date,
        theory: gradeData.theory || 0,
        practical: gradeData.practical || 0,
        homework: gradeData.homework || 0,
        participation: gradeData.participation || 0,
        quran: gradeData.quran || 0,
        final: gradeData.final || 0,
        notes: gradeData.notes || null
      };

      console.log('Grade record to save:', gradeRecord);

      // حفظ الدرجة باستخدام الخدمة
      const savedGrade = await UnifiedGradeService.saveGrade(gradeRecord);

      // تحديث الكاش
      if (savedGrade) {
        // إعادة تعيين كاش الدرجات للطالب
        clearCache(`grades-${gradeData.student}`);

        // تحديث الكاش مباشرة
        if (!grades.value[gradeData.student]) {
          grades.value[gradeData.student] = [];
        }

        // البحث عن درجة موجودة في الكاش
        const index = grades.value[gradeData.student].findIndex(g =>
          g.subject === gradeData.subject && g.date === gradeData.date
        );

        if (index !== -1) {
          // تحديث درجة موجودة
          grades.value[gradeData.student][index] = {
            ...savedGrade,
            student: savedGrade.student_id,
            subject: savedGrade.subject_id
          };
        } else {
          // إضافة درجة جديدة
          grades.value[gradeData.student].push({
            ...savedGrade,
            student: savedGrade.student_id,
            subject: savedGrade.subject_id
          });
        }
      }

      return savedGrade;
    } catch (error) {
      console.error('Error saving grade:', error);
      throw error;
    }
  };

  // حفظ مجموعة من الدرجات
  const saveBatchGrades = async (gradesDataArray) => {
    try {
      console.log('Saving batch unified grades:', gradesDataArray);

      // التحقق من صحة البيانات المدخلة
      if (!Array.isArray(gradesDataArray)) {
        console.error('Invalid input: gradesDataArray is not an array');
        return [];
      }

      if (gradesDataArray.length === 0) {
        console.warn('Empty grades array provided, nothing to save');
        return [];
      }

      // تجميع الدرجات حسب الطالب والمادة والتاريخ
      const groupedGrades = {};

      gradesDataArray.forEach(grade => {
        if (!grade.student_id && grade.student) {
          grade.student_id = grade.student;
        }

        if (!grade.subject_id && grade.subject) {
          grade.subject_id = grade.subject;
        }

        const key = `${grade.student_id || grade.student}-${grade.subject_id || grade.subject}-${grade.date}`;

        if (!groupedGrades[key]) {
          groupedGrades[key] = {
            student_id: grade.student_id || grade.student,
            subject_id: grade.subject_id || grade.subject,
            date: grade.date,
            theory: 0,
            practical: 0,
            homework: 0,
            participation: 0,
            quran: 0,
            final: 0
          };
        }

        // تحديث الدرجة المناسبة
        if (grade.type) {
          // إذا كانت البيانات بالتنسيق القديم
          groupedGrades[key][grade.type] = parseFloat(grade.score) || 0;
        } else {
          // إذا كانت البيانات بالتنسيق الجديد
          if (grade.theory !== undefined) groupedGrades[key].theory = parseFloat(grade.theory) || 0;
          if (grade.practical !== undefined) groupedGrades[key].practical = parseFloat(grade.practical) || 0;
          if (grade.homework !== undefined) groupedGrades[key].homework = parseFloat(grade.homework) || 0;
          if (grade.participation !== undefined) groupedGrades[key].participation = parseFloat(grade.participation) || 0;
          if (grade.quran !== undefined) groupedGrades[key].quran = parseFloat(grade.quran) || 0;
          if (grade.final !== undefined) groupedGrades[key].final = parseFloat(grade.final) || 0;
        }
      });

      // تحويل البيانات المجمعة إلى مصفوفة
      const unifiedGrades = Object.values(groupedGrades);

      console.log('Unified grades to save:', unifiedGrades);

      if (unifiedGrades.length === 0) {
        console.warn('No valid unified grades to save after grouping');
        return [];
      }

      // حفظ الدرجات باستخدام الخدمة
      const savedGrades = await UnifiedGradeService.saveBatchGrades(unifiedGrades);

      // تحديث الكاش
      if (savedGrades.length > 0) {
        // جمع معرفات الطلاب الفريدة
        const uniqueStudentIds = [...new Set(savedGrades.map(grade => grade.student_id))];

        // إعادة تعيين كاش الدرجات لكل طالب
        uniqueStudentIds.forEach(studentId => {
          clearCache(`grades-${studentId}`);
        });
      }

      return savedGrades;
    } catch (error) {
      console.error('Error saving batch grades:', error);
      throw error;
    }
  };

  // ترحيل البيانات من جدول الدرجات القديم إلى جدول الدرجات الموحدة
  const migrateGrades = async () => {
    try {
      console.log('Migrating grades to unified grades table');

      const result = await UnifiedGradeService.migrateGrades();

      // مسح جميع الكاش بعد الترحيل
      clearCache();

      return result;
    } catch (error) {
      console.error('Error migrating grades:', error);
      throw error;
    }
  };

  // دالة للحصول على درجات طالب معين
  const getGradesByStudent = (studentId) => {
    if (grades.value[studentId]) {
      return grades.value[studentId];
    }
    return [];
  };

  return {
    // الحالة
    grades,
    loading,

    // الإجراءات
    fetchGradesForStudent,
    fetchGradesForStudents,
    getGradesByStudent,
    saveGrade,
    saveBatchGrades,
    migrateGrades,
    clearCache
  };
});
