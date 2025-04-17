# TeachEase Frontend

هذا هو الواجهة الأمامية لنظام إدارة التعليم TeachEase، مبني باستخدام Vue 3 و Vite و Vuetify.

## إعداد التطوير المحلي

### متطلبات النظام

- Node.js (الإصدار 16 أو أحدث)
- npm (الإصدار 7 أو أحدث)

### خطوات الإعداد

1. تثبيت الاعتماديات:
   ```sh
   npm install
   ```

2. إعداد متغيرات البيئة:
   - قم بنسخ ملف `.env.example` إلى `.env`
   - قم بتعديل القيم حسب الحاجة

3. تشغيل خادم التطوير:
   ```sh
   npm run dev
   ```

4. بناء المشروع للإنتاج:
   ```sh
   npm run build
   ```

5. معاينة نسخة الإنتاج محليًا:
   ```sh
   npm run preview
   ```

## النشر على Render

### المتطلبات المسبقة

1. إنشاء حساب على [Render](https://render.com)
2. التأكد من نشر الباك إند أولاً

### خطوات النشر

1. إنشاء خدمة ويب جديدة في Render
2. ربط مستودع GitHub الخاص بك
3. تكوين الإعدادات التالية:
   - **الاسم**: teachease-frontend (أو الاسم الذي تفضله)
   - **البيئة**: Node
   - **أمر البناء**: `npm install && npm run build`
   - **أمر البدء**: `npm run preview -- --host 0.0.0.0 --port $PORT`
   - **المجلد الرئيسي**: `frontend/edu-system`

4. إضافة متغيرات البيئة التالية:
   - `VITE_API_BASE_URL`: عنوان URL للباك إند الخاص بك (مثل `https://teachease-backend.onrender.com/api`)
   - `VITE_USE_MOCK_DATA`: اضبطه على `false` للإنتاج

5. نشر الخدمة

## استخدام ملف render.yaml

يمكنك أيضًا استخدام ملف `render.yaml` لنشر كل من الباك إند والفرونت إند معًا:

1. انتقل إلى قسم "Blueprints" في Render
2. انقر على "New Blueprint Instance"
3. قم بتوصيل مستودع GitHub الخاص بك
4. سيقوم Render باكتشاف ملف `render.yaml` وتكوين الخدمات تلقائيًا
5. راجع التكوين وانقر على "Apply"

## هيكل المشروع

- `src/`: ملفات المصدر
  - `assets/`: الموارد الثابتة (الصور، CSS، إلخ)
  - `components/`: مكونات Vue القابلة لإعادة الاستخدام
  - `router/`: تكوين التوجيه
  - `services/`: خدمات API والمرافق الأخرى
  - `stores/`: مخازن Pinia
  - `views/`: صفحات التطبيق
- `public/`: الملفات التي يتم نسخها كما هي إلى مجلد البناء

## متغيرات البيئة

| المتغير | الوصف | القيمة الافتراضية |
|----------|-------------|------|
| VITE_API_BASE_URL | عنوان URL للباك إند | `/api` |
| VITE_USE_MOCK_DATA | استخدام البيانات الوهمية في التطوير | `true` |

## الإعداد الموصى به لـ IDE

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (وتعطيل Vetur).
