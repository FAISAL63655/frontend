import axios from 'axios';

// تكوين لتحديد ما إذا كان يجب استخدام بيانات وهمية
// استخدم البيانات الوهمية في بيئة التطوير أو عندما تكون مطلوبة صراحة
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || import.meta.env.MODE === 'development';

// Crear una instancia de axios con configuración personalizada
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // Usa la variable de entorno o un valor predeterminado
  timeout: 10000, // Tiempo de espera de 10 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Datos simulados para desarrollo
const mockData = {
  '/dashboard/stats/': {
    totalStudents: 2,
    attendanceRate: 100,
    assignmentsCount: 3,
    alertsCount: 0
  },
  '/dashboard/today-schedule/': [
    {
      subject: 'الدراسات الإسلامية',
      class: 'الصف الأول',
      section: 'أ',
      time: '08:00 - 08:45',
      classId: 1,
      sectionId: 1,
      subjectId: 1
    },
    {
      subject: 'الفقه',
      class: 'الصف الثاني',
      section: 'ب',
      time: '09:00 - 09:45',
      classId: 2,
      sectionId: 2,
      subjectId: 2
    },
    {
      subject: 'التوحيد',
      class: 'الصف الثالث',
      section: 'أ',
      time: '10:00 - 10:45',
      classId: 3,
      sectionId: 1,
      subjectId: 3
    },
    {
      subject: 'الدراسات الإسلامية',
      class: 'الصف الثالث',
      section: 'ب',
      time: '11:00 - 11:45',
      classId: 3,
      sectionId: 2,
      subjectId: 1
    }
  ],
  '/dashboard/recent-alerts/': []
};

// معترض لمحاكاة استجابات API أثناء التطوير أو عندما تكون النقاط النهائية غير موجودة
api.interceptors.request.use(async (config) => {
  // التحقق مما إذا كان يجب استخدام البيانات الوهمية
  if (USE_MOCK_DATA) {
    const url = config.url.replace(/\/$/, ''); // إزالة الشرطة النهائية إذا وجدت

    // التحقق مما إذا كانت لدينا بيانات وهمية لهذا URL
    if (mockData[url] || mockData[url + '/']) {
      console.log(`Using mock data for ${url}`);

      // محاكاة تأخير الشبكة (اختياري)
      await new Promise(resolve => setTimeout(resolve, 300));

      // إلغاء الطلب الحقيقي وإرجاع البيانات الوهمية
      const mockResponse = { data: mockData[url] || mockData[url + '/'] };
      return Promise.reject({
        config,
        response: mockResponse,
        isAxiosMock: true
      });
    }
  }
  return config;
});

// معترض لمعالجة الأخطاء والاستجابات المحاكاة
api.interceptors.response.use(
  response => response,
  error => {
    // إذا كانت استجابة محاكاة، فقم بإرجاع البيانات المحاكاة
    if (error.isAxiosMock) {
      return Promise.resolve(error.response);
    }

    // التحقق مما إذا كان الخطأ هو 404 ولدينا بيانات وهمية لهذا URL
    if (error.response && error.response.status === 404) {
      const url = error.config.url.replace(/\/$/, ''); // إزالة الشرطة النهائية إذا وجدت

      if (mockData[url] || mockData[url + '/']) {
        console.log(`Endpoint ${url} not found, using mock data instead`);
        return Promise.resolve({ data: mockData[url] || mockData[url + '/'] });
      }
    }

    // تسجيل الخطأ الحقيقي في وحدة التحكم
    console.error('API Error:', error);

    // رفض الوعد حتى يتمكن الكود الذي يستدعي من التعامل مع الخطأ
    return Promise.reject(error);
  }
);

export default api;
