// StorageService.js - خدمة للتعامل مع تخزين الملفات

import supabase from './supabaseClient';

/**
 * خدمة تخزين الملفات
 */
class StorageService {
  /**
   * اسم دلو التخزين الافتراضي
   */
  static BUCKET_NAME = 'amage';

  /**
   * رفع ملف إلى التخزين
   * @param {File} file الملف المراد رفعه
   * @param {string} [path=''] المسار داخل دلو التخزين
   * @param {string} [bucketName=StorageService.BUCKET_NAME] اسم دلو التخزين
   * @returns {Promise<{path: string, url: string}>} وعد بمسار الملف وعنوان URL
   */
  static async uploadFile(file, path = '', bucketName = StorageService.BUCKET_NAME) {
    try {
      // إنشاء اسم فريد للملف باستخدام الطابع الزمني
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      
      // إنشاء المسار الكامل
      const fullPath = path ? `${path}/${fileName}` : fileName;
      
      // رفع الملف
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      // الحصول على URL العام للملف
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fullPath);

      return {
        path: fullPath,
        url: publicUrl
      };
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }

  /**
   * تنزيل ملف من التخزين
   * @param {string} path مسار الملف
   * @param {string} [bucketName=StorageService.BUCKET_NAME] اسم دلو التخزين
   * @returns {Promise<Blob>} وعد بالملف
   */
  static async downloadFile(path, bucketName = StorageService.BUCKET_NAME) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(path);

      if (error) {
        console.error(`Error downloading file from path ${path}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error in downloadFile(${path}):`, error);
      throw error;
    }
  }

  /**
   * الحصول على URL عام للملف
   * @param {string} path مسار الملف
   * @param {string} [bucketName=StorageService.BUCKET_NAME] اسم دلو التخزين
   * @returns {string} URL العام للملف
   */
  static getPublicUrl(path, bucketName = StorageService.BUCKET_NAME) {
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);
    
    return publicUrl;
  }

  /**
   * حذف ملف من التخزين
   * @param {string} path مسار الملف
   * @param {string} [bucketName=StorageService.BUCKET_NAME] اسم دلو التخزين
   * @returns {Promise<boolean>} وعد بنتيجة العملية
   */
  static async deleteFile(path, bucketName = StorageService.BUCKET_NAME) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove([path]);

      if (error) {
        console.error(`Error deleting file at path ${path}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in deleteFile(${path}):`, error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة الملفات في مسار معين
   * @param {string} [path=''] المسار داخل دلو التخزين
   * @param {string} [bucketName=StorageService.BUCKET_NAME] اسم دلو التخزين
   * @returns {Promise<Array>} وعد بقائمة الملفات
   */
  static async listFiles(path = '', bucketName = StorageService.BUCKET_NAME) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(path);

      if (error) {
        console.error(`Error listing files in path ${path}:`, error);
        throw error;
      }

      // إضافة URLs العامة للملفات
      return data.map(item => {
        if (!item.id) return item;
        
        const filePath = path ? `${path}/${item.name}` : item.name;
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        
        return {
          ...item,
          url: publicUrl
        };
      });
    } catch (error) {
      console.error(`Error in listFiles(${path}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء مجلد في التخزين
   * @param {string} folderName اسم المجلد
   * @param {string} [path=''] المسار داخل دلو التخزين
   * @param {string} [bucketName=StorageService.BUCKET_NAME] اسم دلو التخزين
   * @returns {Promise<boolean>} وعد بنتيجة العملية
   */
  static async createFolder(folderName, path = '', bucketName = StorageService.BUCKET_NAME) {
    try {
      // إنشاء ملف فارغ باسم .keep لإنشاء المجلد
      const folderPath = path ? `${path}/${folderName}/.keep` : `${folderName}/.keep`;
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(folderPath, new Blob(['']), {
          contentType: 'text/plain'
        });

      if (error) {
        console.error(`Error creating folder ${folderName}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error in createFolder(${folderName}):`, error);
      throw error;
    }
  }

  /**
   * التحقق من وجود ملف
   * @param {string} path مسار الملف
   * @param {string} [bucketName=StorageService.BUCKET_NAME] اسم دلو التخزين
   * @returns {Promise<boolean>} وعد بنتيجة التحقق
   */
  static async fileExists(path, bucketName = StorageService.BUCKET_NAME) {
    try {
      // محاولة الحصول على معلومات الملف
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(path);

      // إذا لم يكن هناك خطأ، فالملف موجود
      return !error;
    } catch (error) {
      // إذا كان هناك خطأ، فالملف غير موجود
      return false;
    }
  }

  /**
   * الحصول على معلومات S3 للاتصال المباشر
   * @returns {Object} معلومات S3
   */
  static getS3Info() {
    return {
      endpoint: 'https://kkzaavondsmnxadovohv.supabase.co/storage/v1/s3',
      region: 'eu-central-1',
      accessKeyId: '32585eeb9774f804f219190702835598',
      secretAccessKey: '6d1e2f9809041b571dbc313ebc2a08c17b47d6aa22f31973605f3fec18e6910e',
      bucketName: StorageService.BUCKET_NAME
    };
  }
}

export default StorageService;
