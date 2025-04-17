import axios from 'axios';

// تكوين لتحديد ما إذا كان يجب استخدام بيانات وهمية
// استخدم البيانات الوهمية فقط في بيئة التطوير وليس في الإنتاج
const USE_MOCK_DATA = import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_MOCK_DATA === 'true';

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

// Interceptor para simular respuestas de la API durante el desarrollo
api.interceptors.request.use(async (config) => {
  if (USE_MOCK_DATA) {
    const url = config.url.replace(/\/$/, ''); // Eliminar la barra final si existe

    // Verificar si tenemos datos simulados para esta URL
    if (mockData[url] || mockData[url + '/']) {
      console.log(`Using mock data for ${url}`);

      // Simular un retraso de red (opcional)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Cancelar la solicitud real y devolver datos simulados
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

// Interceptor para manejar errores y respuestas simuladas
api.interceptors.response.use(
  response => response,
  error => {
    // Si es una respuesta simulada, devolver los datos simulados
    if (error.isAxiosMock) {
      return Promise.resolve(error.response);
    }

    // Registrar el error real en la consola
    console.error('API Error:', error);

    // Rechazar la promesa para que el código que llama pueda manejar el error
    return Promise.reject(error);
  }
);

export default api;
