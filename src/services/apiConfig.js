// apiConfig.js - تكوين مركزي للـ API

import axios from 'axios';

// استخدام متغير البيئة للحصول على عنوان API
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/';

// تكوين إعدادات API
const API_CONFIG = {
  // إعدادات إعادة المحاولة
  retry: {
    // عدد مرات إعادة المحاولة
    count: 2,
    // تأخير بين المحاولات (بالمللي ثانية)
    delay: 1000,
    // أكواد الحالة التي يجب إعادة المحاولة معها
    statusCodes: [408, 429, 500, 502, 503, 504]
  },
  // مهلة الطلب (بالمللي ثانية)
  timeout: 15000,
  // تسجيل الطلبات
  logging: import.meta.env.MODE === 'development'
};

// إنشاء نسخة من axios مع التكوين المناسب
const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: API_CONFIG.timeout,
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

// إضافة معترض للاستجابات مع استراتيجية إعادة المحاولة
api.interceptors.response.use(
  response => {
    // تسجيل الاستجابات الناجحة في وضع التطوير
    if (API_CONFIG.logging) {
      console.log(`[API] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  async error => {
    // معالجة الأخطاء المشتركة
    const { config } = error;

    // تجاهل إذا لم يكن هناك تكوين أو تم تعطيل إعادة المحاولة
    if (!config || config._retryCount >= API_CONFIG.retry.count) {
      // تسجيل الخطأ
      if (error.response) {
        // الخادم استجاب برمز حالة خارج نطاق 2xx
        console.error(`[API] ${config?.method?.toUpperCase() || 'REQUEST'} ${config?.url || 'unknown'} - ${error.response.status}`, error.response.data);
      } else if (error.request) {
        // لم يتم استلام استجابة
        console.error(`[API] ${config?.method?.toUpperCase() || 'REQUEST'} ${config?.url || 'unknown'} - No response`, error.request);
      } else {
        // حدث خطأ أثناء إعداد الطلب
        console.error(`[API] Error:`, error.message);
      }
      return Promise.reject(error);
    }

    // التحقق مما إذا كان يجب إعادة المحاولة
    const shouldRetry = !error.response ||
                        API_CONFIG.retry.statusCodes.includes(error.response.status);

    if (!shouldRetry) {
      // تسجيل الخطأ
      if (API_CONFIG.logging) {
        console.error(`[API] ${config.method.toUpperCase()} ${config.url} - ${error.response?.status || 'ERROR'}`, error.message);
      }
      return Promise.reject(error);
    }

    // زيادة عداد إعادة المحاولة
    config._retryCount = config._retryCount || 0;
    config._retryCount += 1;

    // تسجيل إعادة المحاولة
    if (API_CONFIG.logging) {
      console.warn(`[API] Retrying (${config._retryCount}/${API_CONFIG.retry.count}) ${config.method.toUpperCase()} ${config.url}`);
    }

    // انتظار قبل إعادة المحاولة
    const delay = API_CONFIG.retry.delay * config._retryCount;
    await new Promise(resolve => setTimeout(resolve, delay));

    // إعادة المحاولة
    return api(config);
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
      // إذا كان الطلب عبارة عن وعد، فقم بإرجاعه كما هو
      if (req instanceof Promise) {
        return req;
      }

      // إذا كان الطلب عبارة عن دالة، فقم بتنفيذها
      if (typeof req === 'function') {
        return req();
      }

      // إذا كان الطلب عبارة عن كائن، فقم بتنفيذ طلب API
      if (typeof req === 'object') {
        const { method = 'get', url, params, data, headers } = req;
        return api({
          method,
          url,
          params,
          data,
          headers
        });
      }

      // إذا كان الطلب عبارة عن سلسلة، فقم بتنفيذ طلب GET
      if (typeof req === 'string') {
        return api.get(req);
      }

      throw new Error(`Invalid request type: ${typeof req}`);
    }));

    return responses;
  } catch (error) {
    console.error('[API] Batch request error:', error);
    throw error;
  }
};

/**
 * دالة لتنفيذ طلبات متعددة بالتسلسل
 * @param {Array} requests - مصفوفة من طلبات API
 * @returns {Promise<Array>} - وعد بمصفوفة من الاستجابات
 */
export const sequentialRequests = async (requests) => {
  const responses = [];

  for (const req of requests) {
    try {
      // إذا كان الطلب عبارة عن وعد، فقم بانتظاره
      if (req instanceof Promise) {
        responses.push(await req);
        continue;
      }

      // إذا كان الطلب عبارة عن دالة، فقم بتنفيذها
      if (typeof req === 'function') {
        responses.push(await req());
        continue;
      }

      // إذا كان الطلب عبارة عن كائن، فقم بتنفيذ طلب API
      if (typeof req === 'object') {
        const { method = 'get', url, params, data, headers } = req;
        responses.push(await api({
          method,
          url,
          params,
          data,
          headers
        }));
        continue;
      }

      // إذا كان الطلب عبارة عن سلسلة، فقم بتنفيذ طلب GET
      if (typeof req === 'string') {
        responses.push(await api.get(req));
        continue;
      }

      throw new Error(`Invalid request type: ${typeof req}`);
    } catch (error) {
      console.error('[API] Sequential request error:', error);
      responses.push({ error });
    }
  }

  return responses;
};

// تصدير النسخة المكونة من axios
export default api;

// تصدير دالة مساعدة للحصول على عنوان URL كامل للصور
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // إذا كان المسار يبدأ بـ http أو https، فهو مسار كامل بالفعل
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // إذا كان المسار يبدأ بـ /media، فأضف عنوان API الأساسي
  if (imagePath.startsWith('/media')) {
    // استخراج الجزء الأساسي من عنوان API (بدون /api/)
    const baseUrl = apiBaseUrl.endsWith('/api/')
      ? apiBaseUrl.slice(0, -4) // إزالة '/api'
      : apiBaseUrl.endsWith('/api')
        ? apiBaseUrl.slice(0, -3) // إزالة 'api'
        : apiBaseUrl;

    return `${baseUrl}${imagePath}`;
  }

  // إرجاع المسار كما هو إذا لم يتطابق مع أي من الحالات السابقة
  return imagePath;
};
