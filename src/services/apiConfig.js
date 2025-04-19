// apiConfig.js - تكوين مركزي للـ API

import axios from 'axios';

// استخدام متغير البيئة للحصول على عنوان API
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/';

// إنشاء نسخة من axios مع التكوين المناسب
const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000, // 15 ثانية
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// إضافة معترض للطلبات
api.interceptors.request.use(
  config => {
    // يمكن إضافة معالجة إضافية هنا (مثل إضافة رمز المصادقة)
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// إعدادات إعادة المحاولة
const retryConfig = {
  // عدد مرات إعادة المحاولة
  maxRetries: 1,
  // التأخير بين المحاولات (بالمللي ثانية)
  retryDelay: 1000,
  // أكواد الحالة التي يجب إعادة المحاولة معها
  retryStatusCodes: [408, 429, 500, 502, 503, 504]
};

// إضافة معترض للاستجابات مع إعادة المحاولة
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    // الحصول على تكوين الطلب
    const config = error.config;

    // إذا لم يتم تعيين عدد المحاولات، قم بتعيينه إلى 0
    if (!config || config._retryCount === undefined) {
      if (config) {
        config._retryCount = 0;
      }
    }

    // التحقق مما إذا كان يجب إعادة المحاولة
    const shouldRetry =
      config &&
      config._retryCount < retryConfig.maxRetries &&
      error.response &&
      retryConfig.retryStatusCodes.includes(error.response.status);

    if (shouldRetry) {
      // زيادة عدد المحاولات
      config._retryCount += 1;

      // انتظار قبل إعادة المحاولة
      await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay));

      console.log(`Retrying API request (${config._retryCount}/${retryConfig.maxRetries}): ${config.url}`);

      // إعادة المحاولة
      return api(config);
    }

    // معالجة الأخطاء المشتركة
    if (error.response) {
      // الخادم استجاب برمز حالة خارج نطاق 2xx
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // لم يتم استلام استجابة
      console.error('API Error: No response received', error.request);
    } else {
      // حدث خطأ أثناء إعداد الطلب
      console.error('API Error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * دالة لتجميع طلبات متعددة في طلب واحد
 * @param {Array} requests - مصفوفة من طلبات API
 * @returns {Promise<Array>} - وعد بمصفوفة من الاستجابات
 */
export const batchRequests = async (requests) => {
  try {
    // تنفيذ جميع الطلبات بالتوازي
    const responses = await Promise.all(requests.map(req => {
      if (typeof req === 'string') {
        // إذا كان الطلب عبارة عن سلسلة، فقم بتنفيذ طلب GET
        return api.get(req);
      } else if (typeof req === 'object') {
        // إذا كان الطلب عبارة عن كائن، فقم بتنفيذ طلب API
        const { method = 'get', url, params, data } = req;
        return api({ method, url, params, data });
      }
      // إذا كان الطلب عبارة عن وعد، فقم بإرجاعه كما هو
      return req;
    }));

    return responses;
  } catch (error) {
    console.error('Batch request error:', error);
    throw error;
  }
};

// تصدير النسخة المكونة من axios
export default api;

// تصدير دالة مساعدة للحصول على عنوان URL كامل للصور
export const getFullImageUrl = (imagePath) => {
  // إذا لم يكن هناك مسار، ارجع null
  if (!imagePath) {
    console.log('getFullImageUrl: لا يوجد مسار للصورة');
    return null;
  }

  // استخراج الجزء الأساسي من عنوان API
  const getBaseUrl = () => {
    const baseUrl = apiBaseUrl.endsWith('/api/')
      ? apiBaseUrl.slice(0, -4) // إزالة '/api'
      : apiBaseUrl.endsWith('/api')
        ? apiBaseUrl.slice(0, -3) // إزالة 'api'
        : apiBaseUrl;
    return baseUrl;
  };

  // إذا كان المسار يبدأ بـ http أو https، فهو مسار كامل بالفعل
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // التحقق من أن المسار يشير إلى صورة موجودة
    // إذا كان المسار يحتوي على اسم الخادم الحالي، فقد يكون مسارًا قديمًا
    if (imagePath.includes('teachease-backend.onrender.com/media/')) {
      // استخراج الجزء الأخير من المسار (اسم الملف فقط)
      const parts = imagePath.split('/');
      const filename = parts[parts.length - 1];

      // إنشاء مسار جديد باستخدام المجلد الصحيح
      const newUrl = `${getBaseUrl()}/media/students/${filename}`;
      console.log(`getFullImageUrl: تم تحويل مسار الصورة من ${imagePath} إلى ${newUrl}`);
      return newUrl;
    }

    // إذا كان المسار كاملاً ولكن ليس من الخادم الخاص بنا
    console.log(`getFullImageUrl: مسار كامل: ${imagePath}`);
    return imagePath;
  }

  // إذا كان المسار يبدأ بـ /media، فأضف عنوان API الأساسي
  if (imagePath.startsWith('/media')) {
    const fullUrl = `${getBaseUrl()}${imagePath}`;
    console.log(`getFullImageUrl: مسار يبدأ بـ /media: ${imagePath} -> ${fullUrl}`);
    return fullUrl;
  }

  // إذا كان المسار لا يحتوي على /media ولكنه يشير إلى صورة
  if (imagePath.startsWith('students/')) {
    const fullUrl = `${getBaseUrl()}/media/${imagePath}`;
    console.log(`getFullImageUrl: مسار يبدأ بـ students/: ${imagePath} -> ${fullUrl}`);
    return fullUrl;
  }

  // إذا كان المسار لا يتطابق مع أي من الحالات السابقة
  console.log(`getFullImageUrl: مسار غير معروف: ${imagePath}`);
  return imagePath;
};
