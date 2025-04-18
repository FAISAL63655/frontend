<template>
  <div class="student-management">
    <!-- شريط الرأس -->
    <v-sheet color="surface" class="gradient-header mb-6" rounded="lg" elevation="4">
      <div class="d-flex flex-column flex-md-row justify-space-between align-center pa-6">
        <div class="text-center text-md-start mb-4 mb-md-0">
          <div class="d-flex align-center mb-2">
            <v-avatar color="info" size="42" class="ml-3 elevation-2">
              <v-icon color="white">mdi-account-school</v-icon>
            </v-avatar>
            <h1 class="text-gradient text-h4 font-weight-bold">إدارة الطلاب</h1>
          </div>
          <p class="text-body-1">قم بإضافة وتعديل وإدارة بيانات الطلاب في النظام</p>
        </div>

        <div class="d-flex flex-wrap justify-center justify-md-end">
          <v-btn
            color="primary"
            variant="flat"
            elevation="2"
            prepend-icon="mdi-account-plus"
            class="ml-2 mb-2"
            @click="showAddStudentDialog = true"
          >
            إضافة طالب
          </v-btn>

          <v-btn-toggle
            v-model="showTable"
            mandatory
            density="comfortable"
            color="primary"
            rounded="lg"
            class="ml-2 mb-2 view-toggle"
            elevation="2"
          >
            <v-btn :value="false">
              <v-icon>mdi-view-grid</v-icon>
              <span class="mr-1 d-none d-sm-inline">بطاقات</span>
            </v-btn>
            <v-btn :value="true">
              <v-icon>mdi-table</v-icon>
              <span class="mr-1 d-none d-sm-inline">جدول</span>
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </v-sheet>

    <!-- شريط الفلاتر -->
    <v-card variant="outlined" class="mb-6 filter-card" color="background" rounded="lg" elevation="1">
      <v-card-item>
        <div class="d-flex flex-column flex-md-row flex-wrap align-center">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="ابحث عن اسم طالب..."
            hide-details
            density="compact"
            variant="solo"
            class="mr-auto ml-3 mb-3 mb-md-0 search-field"
            style="max-width: 300px"
            clearable
            rounded="xl"
            bg-color="surface"
          ></v-text-field>

          <v-select
            v-model="selectedClass"
            :items="classes"
            item-title="name"
            item-value="id"
            label="الصف"
            density="compact"
            variant="solo"
            bg-color="surface"
            class="ml-2 mr-2 mb-3 mb-md-0 filter-select"
            style="max-width: 150px"
            hide-details
            @update:model-value="fetchStudents"
          ></v-select>

          <v-select
            v-model="selectedSection"
            :items="sections"
            item-title="name"
            item-value="id"
            label="الفصل"
            density="compact"
            variant="solo"
            bg-color="surface"
            class="ml-2 mr-2 mb-3 mb-md-0 filter-select"
            style="max-width: 150px"
            hide-details
            @update:model-value="fetchStudents"
          ></v-select>

          <v-chip-group
            v-model="selectedStatus"
            mandatory
            class="mb-3 mb-md-0 status-chips"
          >
            <v-chip
              value="all"
              filter
              label
              size="small"
              color="primary"
              variant="elevated"
            >
              الكل
            </v-chip>
            <v-chip
              value="active"
              filter
              label
              size="small"
              color="success"
              variant="elevated"
            >
              النشطين
            </v-chip>
            <v-chip
              value="inactive"
              filter
              label
              size="small"
              color="error"
              variant="elevated"
            >
              غير النشطين
            </v-chip>
          </v-chip-group>
        </div>
      </v-card-item>
    </v-card>

    <!-- رسالة عند عدم وجود طلاب -->
    <v-card v-if="filteredStudents.length === 0" class="mb-6 text-center pa-8" variant="outlined" color="background" rounded="lg">
      <v-img
        src="https://cdn-icons-png.flaticon.com/512/2599/2599636.png"
        :width="100"
        class="mx-auto mb-4"
        alt="لا توجد بيانات"
      ></v-img>
      <h3 class="text-h5 mb-3">لا يوجد طلاب</h3>
      <p class="text-body-1 text-medium-emphasis mb-6">لم يتم العثور على طلاب بناءً على عوامل التصفية المحددة</p>
      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus"
        variant="flat"
        @click="showAddStudentDialog = true"
        elevation="2"
      >
        إضافة طالب جديد
      </v-btn>
    </v-card>

    <!-- عرض البطاقات -->
    <div v-if="filteredStudents.length > 0 && !showTable">
      <v-row>
        <v-col v-for="student in filteredStudents" :key="student.id" cols="12" sm="6" md="3" xl="2">
          <v-card
            class="student-card"
            rounded="lg"
            :elevation="2"
            variant="elevated"
          >
            <div class="student-header" :class="student.status === 'active' ? 'bg-success-gradient' : 'bg-error-gradient'">
              <v-card-actions class="justify-end pa-2">
                <v-menu location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      v-bind="props"
                      size="small"
                      variant="text"
                      color="white"
                    ></v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="handleEditFromTable(student)">
                      <template v-slot:prepend>
                        <v-icon size="small" color="primary">mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>تعديل البيانات</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="confirmDeleteStudent(student)">
                      <template v-slot:prepend>
                        <v-icon size="small" color="error">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title>حذف الطالب</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-card-actions>
            </div>

            <div class="student-avatar-container">
              <v-avatar size="80" class="student-avatar">
                <v-img :src="student.image" :alt="student.name" cover></v-img>
              </v-avatar>
            </div>

            <v-card-item class="pb-0">
              <v-card-title class="text-center pb-0 d-block text-truncate">{{ student.name }}</v-card-title>
              <div class="d-flex align-center justify-center">
                <v-chip
                  :color="student.status === 'active' ? 'success' : 'error'"
                  size="x-small"
                  class="mt-1"
                  variant="outlined"
                >
                  {{ student.status === 'active' ? 'نشط' : 'غير نشط' }}
                </v-chip>
              </div>
            </v-card-item>

            <v-card-text class="pt-0">
              <div class="d-flex justify-space-between mt-3">
                <div class="text-center flex-grow-1">
                  <div class="text-caption text-medium-emphasis">الصف</div>
                  <div class="text-body-2 font-weight-medium">{{ student.class_name }}</div>
                </div>
                <v-divider vertical></v-divider>
                <div class="text-center flex-grow-1">
                  <div class="text-caption text-medium-emphasis">الفصل</div>
                  <div class="text-body-2 font-weight-medium">{{ student.section }}</div>
                </div>
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-0">
              <v-btn block color="primary" variant="text" class="rounded-0" @click="handleEditFromTable(student)">
                <v-icon size="small" class="ml-2">mdi-account-edit</v-icon>
                تعديل الطالب
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- عرض الجدول -->
    <v-card v-if="showTable && filteredStudents.length > 0" class="mb-6" elevation="1" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="filteredStudents"
        :search="search"
        :items-per-page="15"
        class="elevation-0 student-data-table rtl-table"
        item-value="id"
        density="comfortable"
      >
        <!-- Image Column -->
        <template v-slot:item.image="{ item }">
          <v-avatar size="42" class="elevation-1">
            <v-img :src="getTableItemImage(item)" :alt="getTableItemName(item)" cover></v-img>
          </v-avatar>
        </template>

        <!-- Name Column -->
        <template v-slot:item.name="{ item }">
          <div class="font-weight-medium">{{ getTableItemName(item) }}</div>
        </template>

        <!-- Status Column -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getTableItemStatus(item) === 'active' ? 'success' : 'error'"
            size="small"
            variant="outlined"
            label
          >
            {{ getTableItemStatus(item) === 'active' ? 'نشط' : 'غير نشط' }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center">
            <v-btn
              icon
              size="small"
              color="primary"
              variant="text"
              class="ml-2"
              @click="handleEditFromTable(item)"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">تعديل</v-tooltip>
            </v-btn>
            <v-btn
              icon
              size="small"
              color="error"
              variant="text"
              @click="confirmDeleteStudent(item.raw || item)"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">حذف</v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- تخصيص رأس الجدول وصفوفه -->
        <template v-slot:top>
          <div class="table-header pa-3 d-flex align-center bg-light-blue-lighten-5">
            <v-icon size="large" color="primary" class="ml-2">mdi-account-group</v-icon>
            <span class="text-h6">قائمة الطلاب</span>
          </div>
        </template>

        <!-- تخصيص حالة عدم وجود بيانات -->
        <template v-slot:no-data>
          <div class="d-flex flex-column align-center py-6">
            <v-icon size="large" color="grey-lighten-1" class="mb-2">mdi-alert-circle-outline</v-icon>
            <span class="text-grey">لا توجد بيانات متاحة</span>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- إضافة/تعديل طالب -->
    <v-dialog v-model="showAddStudentDialog" max-width="500px" persistent>
      <v-card class="student-form-card">
        <v-toolbar :color="isEditMode ? 'info' : 'primary'" class="text-white" flat>
          <v-icon class="ml-2">{{ isEditMode ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
          <v-toolbar-title>
            {{ isEditMode ? `تعديل بيانات ${studentForm.name}` : 'إضافة طالب جديد' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showAddStudentDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pt-6">
          <v-form ref="studentForm">
            <v-row justify="center">
              <v-col cols="12" class="text-center">
                <v-avatar size="120" color="primary" class="mb-4 elevation-2">
                  <v-img v-if="studentForm.image" :src="studentForm.image" :alt="studentForm.name || 'صورة الطالب'" cover></v-img>
                  <span v-else class="text-h3 text-white">{{ studentForm.name ? studentForm.name.charAt(0) : 'ط' }}</span>
                </v-avatar>

                <v-file-input
                  label="اختر صورة شخصية"
                  variant="outlined"
                  prepend-icon="mdi-camera"
                  accept="image/*"
                  @update:model-value="previewSelectedImage"
                  hide-details
                  density="compact"
                  class="mb-5 mx-auto"
                  style="max-width: 300px"
                  clearable
                ></v-file-input>

                <v-divider class="mb-6"></v-divider>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="studentForm.name"
                  label="اسم الطالب"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-account"
                  required
                  class="mb-4"
                ></v-text-field>

                <v-select
                  v-model="studentForm.class_id"
                  :items="classes"
                  item-title="name"
                  item-value="id"
                  label="الصف"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-school"
                  required
                  class="mb-4"
                ></v-select>

                <v-select
                  v-model="studentForm.section_id"
                  :items="sections"
                  item-title="name"
                  item-value="id"
                  label="الفصل"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-home"
                  required
                  class="mb-4"
                ></v-select>

                <v-radio-group
                  v-model="studentForm.status"
                  inline
                  hide-details
                >
                  <template v-slot:label>
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="ml-2">mdi-account-check</v-icon>
                      <span>حالة الطالب</span>
                    </div>
                  </template>
                  <v-radio value="active" color="success">
                    <template v-slot:label>
                      <span class="text-success">نشط</span>
                    </template>
                  </v-radio>
                  <v-radio value="inactive" color="error">
                    <template v-slot:label>
                      <span class="text-error">غير نشط</span>
                    </template>
                  </v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" color="grey" @click="showAddStudentDialog = false">
            إلغاء
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveStudent"
            :loading="saveLoading"
            elevation="2"
            width="120"
          >
            {{ isEditMode ? 'تحديث' : 'إضافة' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- تأكيد الحذف -->
    <v-dialog v-model="showDeleteDialog" max-width="420px" persistent>
      <v-card class="delete-dialog-card">
        <v-card-item class="bg-error-gradient">
          <template v-slot:prepend>
            <v-avatar color="white" class="ml-3 elevation-2">
              <v-icon color="error">mdi-alert</v-icon>
            </v-avatar>
          </template>
          <v-card-title class="text-white">تأكيد حذف الطالب</v-card-title>
        </v-card-item>

        <v-card-text class="text-center pt-6 pb-2">
          <v-avatar size="80" class="mb-3 elevation-2">
            <v-img
              :src="studentToDelete?.image || 'https://cdn.vuetifyjs.com/images/john.jpg'"
              :alt="studentToDelete?.name || 'صورة الطالب'"
              cover
            ></v-img>
          </v-avatar>
          <h3 class="text-h6 mb-3">{{ studentToDelete?.name }}</h3>
          <p class="text-body-1 mb-4">هل أنت متأكد من رغبتك في حذف هذا الطالب؟</p>
          <v-alert type="warning" density="compact" variant="tonal" class="mb-0">
            هذا الإجراء لا يمكن التراجع عنه.
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" color="grey" @click="showDeleteDialog = false">
            إلغاء
          </v-btn>
          <v-btn color="error" variant="flat" elevation="2" @click="deleteStudent">
            <v-icon class="ml-2">mdi-delete</v-icon>
            حذف
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api, { getFullImageUrl, batchRequests } from '@/services/apiConfig'
import { useSimpleCacheStore } from '@/stores/simpleCache'

// Data
const classes = ref([])
const sections = ref([])
const students = ref([])
const selectedClass = ref(null)
const selectedSection = ref(null)
const selectedStatus = ref('all')
const search = ref('')
const showTable = ref(false)

// Dialogs
const showAddStudentDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditMode = ref(false)
const studentToDelete = ref(null)

// Student form
const studentForm = ref({
  id: null,
  name: '',
  class_id: null,
  section_id: null,
  status: 'active',
  image: null,
  imageFile: null
})

// Table headers - تعديل رؤوس الجدول
const headers = ref([
  { title: 'الصورة', key: 'image', align: 'center', sortable: false, width: '80px' },
  { title: 'الاسم', key: 'name', align: 'start' },
  { title: 'الصف', key: 'class_name', align: 'center' },
  { title: 'الفصل', key: 'section', align: 'center' },
  { title: 'الحالة', key: 'status', align: 'center', width: '100px' },
  { title: 'الإجراءات', key: 'actions', align: 'center', sortable: false, width: '120px' },
])

// Filtered students based on selected status
const filteredStudents = computed(() => {
  if (selectedStatus.value === 'all') {
    return students.value
  }
  return students.value.filter(student => student.status === selectedStatus.value)
})

// استخدام دالة getFullImageUrl من apiConfig.js
// تم تعريفها بالفعل في الأعلى

// دالة مساعدة للتأكد من وجود صورة أو استخدام صورة افتراضية
const getStudentImage = (imagePath) => {
  // الصورة الافتراضية للطالب
  const defaultImage = 'https://cdn.vuetifyjs.com/images/john.jpg'

  // إذا لم يكن هناك مسار، استخدم الصورة الافتراضية
  if (!imagePath) {
    console.log('StudentsView: لا يوجد مسار للصورة، استخدام الصورة الافتراضية')
    return defaultImage
  }

  // معالجة مشكلة الشرطة المزدوجة في المسار
  if (typeof imagePath === 'string') {
    // تحقق من وجود شرطة مزدوجة في المسار
    if (imagePath.includes('//')) {
      const originalPath = imagePath;
      // إصلاح الشرطة المزدوجة بعد البروتوكول
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        // الحفاظ على الشرطة المزدوجة بعد البروتوكول
        const protocol = imagePath.startsWith('https://') ? 'https://' : 'http://';
        const restOfUrl = imagePath.substring(protocol.length).replace(/\/+/g, '/');
        imagePath = protocol + restOfUrl;
      } else {
        // إزالة الشرطة المزدوجة في المسارات الأخرى
        imagePath = imagePath.replace(/\/+/g, '/');
      }

      // طباعة المسار بعد الإصلاح
      console.log(`StudentsView: تم إصلاح الشرطة المزدوجة من ${originalPath} إلى ${imagePath}`);
    }
  }

  // إذا كان المسار يبدأ بـ http أو https
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // التحقق من أن المسار يشير إلى صورة موجودة
    if (imagePath.includes('teachease-backend.onrender.com/media/')) {
      // استخراج اسم الملف من المسار
      const parts = imagePath.split('/')
      const filename = parts[parts.length - 1]

      // استخراج الجزء الأساسي من عنوان API
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/'
      const baseUrl = apiBaseUrl.endsWith('/api/')
        ? apiBaseUrl.slice(0, -4) // إزالة '/api'
        : apiBaseUrl.endsWith('/api')
          ? apiBaseUrl.slice(0, -3) // إزالة 'api'
          : apiBaseUrl

      // إنشاء مسار جديد باستخدام المجلد الصحيح
      // التأكد من عدم وجود شرطة مزدوجة في المسار الجديد
      let newUrl = '';
      if (baseUrl.endsWith('/')) {
        newUrl = `${baseUrl}media/students/${filename}`;
      } else {
        newUrl = `${baseUrl}/media/students/${filename}`;
      }
      console.log(`StudentsView: تم تحويل مسار الصورة من ${imagePath} إلى ${newUrl}`)
      return newUrl
    }

    // إذا كان المسار كاملاً ولكن ليس من الخادم الخاص بنا
    return imagePath
  }

  // إذا كان المسار يبدأ بـ /media
  if (imagePath.startsWith('/media/')) {
    // استخدام دالة getFullImageUrl للحصول على المسار الكامل
    return getFullImageUrl(imagePath)
  }

  // إذا كان المسار يبدأ بـ students/
  if (imagePath.startsWith('students/')) {
    // استخدام دالة getFullImageUrl للحصول على المسار الكامل
    return getFullImageUrl(imagePath)
  }

  // إذا لم يتطابق المسار مع أي من الحالات السابقة، استخدم الصورة الافتراضية
  console.log(`StudentsView: مسار غير معروف: ${imagePath}، استخدام الصورة الافتراضية`)
  return defaultImage
}

// تعديل previewSelectedImage لمعالجة الملفات بشكل أكثر أمانًا
const previewSelectedImage = (file) => {
  console.log('تم اختيار ملف:', file)

  // إعادة تعيين الملف أولاً
  studentForm.value.imageFile = null

  // إذا كان الملف null أو undefined، قم بإعادة تعيين الصورة إلى القيمة الافتراضية
  if (!file) {
    console.log('لم يتم تحديد ملف أو تم مسحه')
    resetImageToDefault()
    return
  }

  // التحقق من أن الملف هو كائن File صالح
  if (file instanceof File) {
    try {
      // التحقق من نوع الملف وحجمه
      if (!file.type.startsWith('image/')) {
        console.error('نوع الملف غير صالح. يجب أن يكون صورة:', file.type)
        resetImageToDefault()
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB كحد أقصى
        console.error('حجم الملف كبير جدًا. يجب أن يكون أقل من 5 ميجابايت:', file.size)
        resetImageToDefault()
        return
      }

      // تعيين الملف للإرسال في الطلب
      studentForm.value.imageFile = file

      const reader = new FileReader()

      reader.onload = (e) => {
        if (e.target && e.target.result) {
          studentForm.value.image = e.target.result
          console.log('تم تحميل صورة معاينة:', e.target.result.substring(0, 50) + '...')
        } else {
          console.error('فشل في قراءة نتيجة الملف')
          resetImageToDefault()
        }
      }

      reader.onerror = (error) => {
        console.error('خطأ في قراءة الملف:', error)
        resetImageToDefault()
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('خطأ في معالجة الملف:', error)
      resetImageToDefault()
    }
  } else {
    // إذا لم يكن الملف من نوع File
    console.error('الملف ليس من نوع File:', typeof file)
    resetImageToDefault()
  }
}

// دالة مساعدة لإعادة تعيين الصورة إلى القيمة الافتراضية
const resetImageToDefault = () => {
  studentForm.value.imageFile = null

  if (isEditMode.value && studentForm.value.id) {
    // في وضع التعديل، نستخدم الصورة الحالية للطالب
    const currentStudent = students.value.find(s => s.id === studentForm.value.id)
    studentForm.value.image = currentStudent?.image || 'https://cdn.vuetifyjs.com/images/john.jpg'
  } else {
    // في وضع الإضافة، نستخدم الصورة الافتراضية
    studentForm.value.image = 'https://cdn.vuetifyjs.com/images/john.jpg'
  }
}

// الحصول على مخزن التخزين المؤقت
const cacheStore = useSimpleCacheStore()

// Fetch data on component mount
onMounted(async () => {
  try {
    // محاولة الحصول على البيانات من التخزين المؤقت أولاً
    const cachedClasses = cacheStore.get('classes')
    const cachedSections = cacheStore.get('sections')

    if (cachedClasses && cachedSections) {
      // استخدام البيانات المخزنة مؤقتًا
      console.log('Using cached data for classes and sections')
      classes.value = cachedClasses
      sections.value = cachedSections

      if (classes.value.length > 0 && !selectedClass.value) {
        selectedClass.value = classes.value[0].id
      }

      if (sections.value.length > 0 && !selectedSection.value) {
        selectedSection.value = sections.value[0].id
      }
    } else {
      // جلب البيانات من API باستخدام طلبات متعددة متوازية
      console.log('Fetching classes and sections from API')
      const [classesResponse, sectionsResponse] = await batchRequests([
        'classes/',
        'sections/'
      ])

      classes.value = classesResponse.data || []
      sections.value = sectionsResponse.data || []

      // تخزين البيانات في التخزين المؤقت
      cacheStore.set('classes', classes.value, 30 * 60 * 1000) // 30 دقيقة
      cacheStore.set('sections', sections.value, 30 * 60 * 1000) // 30 دقيقة

      console.log('Fetched and cached classes:', classes.value)
      console.log('Fetched and cached sections:', sections.value)

      if (classes.value.length > 0) {
        selectedClass.value = classes.value[0].id
      }

      if (sections.value.length > 0) {
        selectedSection.value = sections.value[0].id
      }
    }

    // Fetch students
    await fetchStudents()
  } catch (error) {
    console.error('Error fetching initial data:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    // For demo purposes, add some dummy data if API fails
    addDummyData()
  }
})

// تعديل fetchStudents لاستخدام التخزين المؤقت
const fetchStudents = async () => {
  if (!selectedClass.value || !selectedSection.value) return

  // إنشاء مفتاح للتخزين المؤقت بناءً على الصف والفصل
  const cacheKey = `students:class:${selectedClass.value}:section:${selectedSection.value}`

  // محاولة الحصول على البيانات من التخزين المؤقت
  const cachedStudents = cacheStore.get(cacheKey)

  if (cachedStudents) {
    // استخدام البيانات المخزنة مؤقتًا
    console.log(`Using cached data for students (class: ${selectedClass.value}, section: ${selectedSection.value})`)
    students.value = cachedStudents
    return
  }

  try {
    // جلب البيانات من API
    console.log(`Fetching students from API (class: ${selectedClass.value}, section: ${selectedSection.value})`)
    const response = await api.get('students/by_class_section/', {
      params: {
        class_id: selectedClass.value,
        section_id: selectedSection.value
      }
    })

    // معالجة دقيقة للبيانات والتأكد من تحويل الأنواع
    students.value = response.data.map(student => {
      // طباعة البيانات الواردة من الخادم للتأكد من صحتها
      console.log('Raw student data from server:', student)

      // التعامل مع الصورة بشكل صحيح
      let imageUrl = 'https://cdn.vuetifyjs.com/images/john.jpg';
      if (student.image) {
        // استخدام image_url إذا كانت موجودة (من الخادم)
        if (student.image_url) {
          imageUrl = student.image_url;
        } else {
          // استخدام دالة getStudentImage للحصول على المسار الكامل
          imageUrl = getStudentImage(student.image);
        }
      }
      console.log(`صورة الطالب ${student.name}:`, student.image, ' -> ', imageUrl);

      return {
        id: student.id,
        name: student.name,
        class_id: typeof student.class_name === 'string' ? parseInt(student.class_name) : student.class_name,
        section_id: typeof student.section === 'string' ? parseInt(student.section) : student.section,
        class_name: student.class_name_display || '',
        section: student.section_display || '',
        status: student.status || 'active',
        image: imageUrl
      }
    })

    console.log('Processed students after mapping:', students.value)

    // تخزين البيانات في التخزين المؤقت
    cacheStore.set(cacheKey, students.value, 5 * 60 * 1000) // 5 دقائق
  } catch (error) {
    console.error('Error fetching students:', error)
    // For demo purposes, add some dummy data if API fails
    addDummyData()
  }
}

// Edit student
const editStudent = (student) => {
  console.log('بدء تعديل الطالب:', student);

  // تعيين وضع التعديل
  isEditMode.value = true;

  // إذا كانت البيانات تأتي من كائن Vuetify Table
  if (student && student.columns) {
    // استخراج المعرف والبيانات من كائن الجدول
    const id = student.value;
    // البحث عن الطالب باستخدام المعرف
    const originalStudent = students.value.find(s => s.id === id);

    if (originalStudent) {
      studentForm.value = { ...originalStudent, imageFile: null };
    } else {
      // إذا لم يتم العثور على الطالب، استخدم البيانات من الجدول
      studentForm.value = {
        id: id,
        name: student.columns.name?.value || '',
        class_id: Number(student.columns.class_id?.value || 0),
        section_id: Number(student.columns.section_id?.value || 0),
        status: student.columns.status?.value || 'active',
        image: student.columns.image?.value || null,
        imageFile: null
      };
    }
  } else if (student && student.raw) {
    // التعامل مع بنية Vuetify 3 الأخرى
    const data = student.raw;
    studentForm.value = {
      id: data.id,
      name: data.name,
      class_id: Number(data.class_id),
      section_id: Number(data.section_id),
      status: data.status || 'active',
      image: data.image,
      imageFile: null
    };
  } else {
    // التعامل المباشر مع كائن الطالب
    studentForm.value = {
      id: student.id,
      name: student.name,
      class_id: Number(student.class_id),
      section_id: Number(student.section_id),
      status: student.status || 'active',
      image: student.image,
      imageFile: null
    };
  }

  console.log('تم تعيين بيانات نموذج التعديل:', studentForm.value);
  showAddStudentDialog.value = true;
}

// إضافة دالة طوارئ لتعبئة نموذج التعديل من معرف
const handleEditById = (id) => {
  const student = students.value.find(s => s.id === id);
  if (student) {
    isEditMode.value = true;
    studentForm.value = { ...student, imageFile: null };
    showAddStudentDialog.value = true;
  }
}

// إضافة دالة طوارئ لتعبئة نموذج التعديل من الجدول
const handleEditFromTable = (item) => {
  console.log('محاولة تعديل عنصر من الجدول:', item);

  // محاولة استخدام الطريقة المباشرة أولاً
  editStudent(item);

  // إذا كان النموذج فارغًا بعد محاولة التعديل، نحاول بطريقة أخرى
  setTimeout(() => {
    if (!studentForm.value.name) {
      // محاولة استخدام خصائص مختلفة للحصول على المعرف
      let studentId = null;
      if (item.value) {
        console.log('محاولة التعديل باستخدام item.value:', item.value);
        studentId = item.value;
      } else if (item.id) {
        console.log('محاولة التعديل باستخدام item.id:', item.id);
        studentId = item.id;
      } else if (typeof item === 'number') {
        console.log('محاولة التعديل باستخدام الرقم مباشرة:', item);
        studentId = item;
      }

      if (studentId) {
        handleEditById(studentId);
      } else {
        console.error('فشل في العثور على معرف الطالب من:', item);
      }
    }
  }, 100);

  console.log('Dummy students:', students.value)
}

// Confirm delete student
const confirmDeleteStudent = (student) => {
  studentToDelete.value = student
  showDeleteDialog.value = true
}

// Delete student
const deleteStudent = async () => {
  if (!studentToDelete.value) return

  try {
    console.log('Deleting student with ID:', studentToDelete.value.id)

    // إرسال طلب حذف الطالب إلى الخادم الخلفي
    await api.delete(`students/${studentToDelete.value.id}/`)

    // إبطال التخزين المؤقت للطلاب لأن البيانات تغيرت
    const cacheKeyPattern = 'students:class:'
    Object.keys(cacheStore.cache).forEach(key => {
      if (key.startsWith(cacheKeyPattern)) {
        cacheStore.remove(key)
      }
    })

    console.log('Student deleted successfully')

    // إزالة الطالب من القائمة
    students.value = students.value.filter(s => s.id !== studentToDelete.value.id)

    // إغلاق نافذة التأكيد
    showDeleteDialog.value = false
    studentToDelete.value = null
  } catch (error) {
    console.error('Error deleting student:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }

    // لأغراض العرض، نقوم بإزالة الطالب من القائمة حتى في حالة الخطأ
    students.value = students.value.filter(s => s.id !== studentToDelete.value.id)
    showDeleteDialog.value = false
    studentToDelete.value = null
  }
}

// إضافة متغير حالة تحميل الحفظ
const saveLoading = ref(false)

// تعديل دالة saveStudent
const saveStudent = async () => {
  try {
    // التحقق من صحة البيانات
    if (!studentForm.value.name) {
      alert('يرجى إدخال اسم الطالب')
      return
    }

    if (!studentForm.value.class_id) {
      alert('يرجى اختيار الصف')
      return
    }

    if (!studentForm.value.section_id) {
      alert('يرجى اختيار الفصل')
      return
    }

    // تفعيل حالة التحميل
    saveLoading.value = true

    // حفظ مرجع للصورة المحددة والمعروضة قبل إرسال الطلب
    const currentImagePreview = studentForm.value.image

    let response

    // Create FormData for file upload
    const formData = new FormData()

    // إضافة الحقول الأساسية
    formData.append('name', studentForm.value.name)
    formData.append('class_name', studentForm.value.class_id)  // في الخادم الخلفي، الحقل هو class_name
    formData.append('section', studentForm.value.section_id)   // في الخادم الخلفي، الحقل هو section
    formData.append('status', studentForm.value.status)       // إضافة حقل الحالة

    // التحقق من وجود ملف صورة صالح
    if (studentForm.value.imageFile && studentForm.value.imageFile instanceof File) {
      // التحقق من نوع الملف وحجمه مرة أخرى للتأكد
      if (studentForm.value.imageFile.type.startsWith('image/') &&
          studentForm.value.imageFile.size <= 5 * 1024 * 1024) {
        formData.append('image', studentForm.value.imageFile)
        console.log('تم إرفاق ملف صورة للإرسال:', studentForm.value.imageFile.name)
      } else {
        console.warn('تم تخطي ملف الصورة لأنه غير صالح:',
                   studentForm.value.imageFile.type, studentForm.value.imageFile.size)
      }
    } else {
      console.log('لم يتم إرفاق ملف صورة جديد')
    }

    console.log('Saving student with data:', {
      name: studentForm.value.name,
      class_name: studentForm.value.class_id,
      section: studentForm.value.section_id,
      status: studentForm.value.status,
      imageFile: studentForm.value.imageFile ? studentForm.value.imageFile.name : 'No file'
    })

    if (isEditMode.value) {
      // Update existing student
      response = await api.put(`students/${studentForm.value.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Student updated successfully:', response.data)
      const imageUrl = response.data.image ? getStudentImage(response.data.image) : currentImagePreview;
      console.log('صورة الطالب بعد التحديث:', response.data.image, ' -> ', imageUrl);

      // تحويل البيانات المستلمة إلى الشكل المطلوب
      const updatedStudent = {
        id: response.data.id,
        name: response.data.name,
        class_id: response.data.class_name,
        section_id: response.data.section,
        class_name: response.data.class_name_display || '',
        section: response.data.section_display || '',
        status: studentForm.value.status, // نحتفظ بالحالة من النموذج
        image: imageUrl
      }

      // Update student in list
      const index = students.value.findIndex(s => s.id === studentForm.value.id)
      if (index !== -1) {
        students.value[index] = updatedStudent
      }
    } else {
      // Create new student
      response = await api.post('students/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Student created successfully:', response.data)
      const imageUrl = response.data.image ? getStudentImage(response.data.image) : (currentImagePreview || 'https://cdn.vuetifyjs.com/images/john.jpg');
      console.log('صورة الطالب الجديد:', response.data.image, ' -> ', imageUrl);

      // تحويل البيانات المستلمة إلى الشكل المطلوب
      const newStudent = {
        id: response.data.id,
        name: response.data.name,
        class_id: response.data.class_name,
        section_id: response.data.section,
        class_name: response.data.class_name_display || '',
        section: response.data.section_display || '',
        status: studentForm.value.status, // نحتفظ بالحالة من النموذج
        image: imageUrl
      }

      // Add new student to list
      students.value.push(newStudent)
    }

    // Reset form and close dialog
    resetForm()
    showAddStudentDialog.value = false
  } catch (error) {
    console.error('Error saving student:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }

    // إذا فشلت العملية، نقوم بمحاكاة نجاحها لأغراض العرض
    if (isEditMode.value) {
      // Update student in list
      const index = students.value.findIndex(s => s.id === studentForm.value.id)
      if (index !== -1) {
        students.value[index] = {
          ...students.value[index],
          name: studentForm.value.name,
          class_id: studentForm.value.class_id,
          section_id: studentForm.value.section_id,
          class_name: classes.value.find(c => c.id === studentForm.value.class_id)?.name || '',
          section: sections.value.find(s => s.id === studentForm.value.section_id)?.name || '',
          status: studentForm.value.status,
          image: studentForm.value.image || 'https://cdn.vuetifyjs.com/images/john.jpg'
        }
      }
    } else {
      // Add new student to list with dummy ID
      const newStudentImage = studentForm.value.image || 'https://cdn.vuetifyjs.com/images/john.jpg';
      console.log('Using image for new student:', newStudentImage);

      students.value.push({
        id: Date.now(), // Use timestamp as dummy ID
        name: studentForm.value.name,
        class_id: studentForm.value.class_id,
        section_id: studentForm.value.section_id,
        class_name: classes.value.find(c => c.id === studentForm.value.class_id)?.name || '',
        section: sections.value.find(s => s.id === studentForm.value.section_id)?.name || '',
        status: studentForm.value.status,
        image: newStudentImage
      })
    }

    // Reset form and close dialog
    resetForm()
    showAddStudentDialog.value = false
  } finally {
    // إيقاف حالة التحميل بعد الانتهاء
    saveLoading.value = false
  }
}

// Reset form
const resetForm = () => {
  console.log('Resetting form with default values')
  console.log('Selected class:', selectedClass.value)
  console.log('Selected section:', selectedSection.value)

  studentForm.value = {
    id: null,
    name: '',
    class_id: selectedClass.value,
    section_id: selectedSection.value,
    status: 'active',
    image: null,
    imageFile: null
  }

  console.log('Form reset to:', studentForm.value)
  isEditMode.value = false
}

// Add dummy data for demo purposes
const addDummyData = () => {
  // تعريف الصفوف
  classes.value = [
    { id: 1, name: 'الصف الأول' },
    { id: 2, name: 'الصف الثاني' },
    { id: 3, name: 'الصف الثالث' }
  ]
  console.log('Dummy classes:', classes.value)

  // تعريف الأقسام
  sections.value = [
    { id: 1, name: 'أ' },
    { id: 2, name: 'ب' },
    { id: 3, name: 'ج' }
  ]
  console.log('Dummy sections:', sections.value)

  selectedClass.value = 1
  selectedSection.value = 1

  // تعريف الطلاب مع التأكد من تطابق أنواع البيانات
  students.value = [
    {
      id: 1,
      name: 'أحمد محمد',
      class_id: 1, // رقم وليس نص
      section_id: 1, // رقم وليس نص
      class_name: 'الصف الأول',
      section: 'أ',
      status: 'active',
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      name: 'محمد علي',
      class_id: 1,
      section_id: 1,
      class_name: 'الصف الأول',
      section: 'أ',
      status: 'active',
      image: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    {
      id: 3,
      name: 'عبدالله خالد',
      class_id: 1,
      section_id: 1,
      class_name: 'الصف الأول',
      section: 'أ',
      status: 'inactive',
      image: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  ]

  console.log('Dummy students:', students.value)
}

// إضافة مراقبة للتغييرات في studentForm
watch(studentForm, (newValue) => {
  console.log('Student form changed:', newValue)
}, { deep: true })

// إضافة دالة مساعدة للحصول على صورة من عنصر الجدول
const getTableItemImage = (item) => {
  // v-data-table في Vuetify 3 يمكن أن تكون بنية العنصر مختلفة
  let imagePath = null;
  if (typeof item === 'object') {
    if (item.raw) {
      imagePath = item.raw.image;
    } else if (item.columns && item.columns.image) {
      imagePath = item.columns.image.value;
    } else if (item.image) {
      imagePath = item.image;
    }
  }
  return getStudentImage(imagePath);
}

// دالة مساعدة للحصول على حالة العنصر
const getTableItemStatus = (item) => {
  if (typeof item === 'object') {
    if (item.raw) {
      return item.raw.status || 'active'
    } else if (item.columns && item.columns.status) {
      return item.columns.status.value || 'active'
    } else if (item.status) {
      return item.status
    }
  }
  return 'active'
}

// دالة مساعدة إضافية للحصول على اسم الطالب من عنصر الجدول
const getTableItemName = (item) => {
  if (typeof item === 'object') {
    if (item.raw) {
      return item.raw.name || ''
    } else if (item.columns && item.columns.name) {
      return item.columns.name.value || ''
    } else if (item.name) {
      return item.name
    }
  }
  return ''
}
</script>

<style scoped>
.student-management {
  animation: fadeIn 0.5s ease-in-out;
}

.gradient-header {
  background: linear-gradient(135deg, var(--v-primary-base, #1976D2), var(--v-info-base, #00B0FF));
  color: white;
}

.text-gradient {
  background: linear-gradient(135deg, #ffffff, #e3f2fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.filter-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.filter-select, .search-field {
  border-radius: 12px;
  overflow: hidden;
}

.status-chips .v-chip {
  transition: all 0.2s ease;
}

.view-toggle .v-btn {
  min-width: 36px;
}

.student-card {
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  border-radius: 12px;
}

.student-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.student-header {
  height: 60px;
  border-radius: 12px 12px 0 0;
}

.bg-success-gradient {
  background: linear-gradient(135deg, var(--v-success-base, #4CAF50), #81C784);
}

.bg-error-gradient {
  background: linear-gradient(135deg, var(--v-error-base, #F44336), #E57373);
}

.student-avatar-container {
  margin-top: -40px;
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}

.student-avatar {
  border: 3px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.student-data-table {
  border-radius: 12px;
  overflow: hidden;
}

.student-form-card, .delete-dialog-card {
  border-radius: 16px;
  overflow: hidden;
}

.bg-error-gradient {
  background: linear-gradient(135deg, var(--v-error-base, #F44336), #E57373);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.rtl-table {
  direction: rtl !important;
}

.v-data-table {
  --v-table-header-height: 56px;
}

.v-data-table :deep(.v-table__wrapper > table > thead > tr > th),
.v-data-table :deep(.v-table__wrapper > table > tbody > tr > td) {
  text-align: right;
}

.v-data-table :deep(th.v-data-table__th--sortable .v-data-table-header__sort-icon) {
  margin-right: 8px;
  margin-left: 0;
}

.table-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
