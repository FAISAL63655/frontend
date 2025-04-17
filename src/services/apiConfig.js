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

// إضافة معترض للاستجابات
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
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
