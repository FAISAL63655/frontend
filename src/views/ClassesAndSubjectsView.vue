<template>
  <div class="classes-subjects-container">
    <h1 class="text-h4 mb-4">إدارة الصفوف والفصول والمواد</h1>

    <v-tabs v-model="activeTab" bg-color="primary" align-tabs="center">
      <v-tab value="classes">الصفوف</v-tab>
      <v-tab value="sections">الفصول</v-tab>
      <v-tab value="subjects">المواد</v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="mt-4">
      <!-- الصفوف -->
      <v-window-item value="classes">
        <v-card>
          <v-card-title class="d-flex align-center">
            <span>إدارة الصفوف</span>
            <v-spacer></v-spacer>
            <add-class-dialog @class-added="handleClassAdded" />
          </v-card-title>

          <v-card-text>
            <v-table class="elevation-1">
              <thead>
                <tr>
                  <th>الرقم</th>
                  <th>اسم الصف</th>
                  <th>الوصف</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="classItem in classes" :key="classItem.id">
                  <td>{{ classItem.id }}</td>
                  <td>{{ classItem.name }}</td>
                  <td>{{ classItem.description }}</td>
                  <td>
                    <v-icon
                      size="small"
                      class="me-2"
                      @click="editClass(classItem)"
                    >
                      mdi-pencil
                    </v-icon>
                    <v-icon
                      size="small"
                      @click="deleteClass(classItem)"
                    >
                      mdi-delete
                    </v-icon>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- الفصول -->
      <v-window-item value="sections">
        <v-card>
          <v-card-title class="d-flex align-center">
            <span>إدارة الفصول</span>
            <v-spacer></v-spacer>
            <add-section-dialog @section-added="handleSectionAdded" />
          </v-card-title>

          <v-card-text>
            <v-table class="elevation-1">
              <thead>
                <tr>
                  <th>الرقم</th>
                  <th>اسم الفصل</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="section in sections" :key="section.id">
                  <td>{{ section.id }}</td>
                  <td>{{ section.name }}</td>
                  <td>
                    <v-icon
                      size="small"
                      class="me-2"
                      @click="editSection(section)"
                    >
                      mdi-pencil
                    </v-icon>
                    <v-icon
                      size="small"
                      @click="deleteSection(section)"
                    >
                      mdi-delete
                    </v-icon>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- المواد -->
      <v-window-item value="subjects">
        <v-card>
          <v-card-title class="d-flex align-center">
            <span>إدارة المواد</span>
            <v-spacer></v-spacer>
            <add-subject-dialog @subject-added="handleSubjectAdded" />
          </v-card-title>

          <v-card-text>
            <v-table class="elevation-1">
              <thead>
                <tr>
                  <th>الرقم</th>
                  <th>اسم المادة</th>
                  <th>النوع</th>
                  <th>المادة الأساسية</th>
                  <th>الحالة</th>
                  <th>الترتيب</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="subject in subjects" :key="subject.id">
                  <td>{{ subject.id }}</td>
                  <td>{{ subject.name }}</td>
                  <td>
                    <v-chip
                      :color="subject.is_main ? 'primary' : 'secondary'"
                      size="small"
                    >
                      {{ subject.is_main ? 'أساسية' : 'فرعية' }}
                    </v-chip>
                  </td>
                  <td>{{ subject.parent_name || '-' }}</td>
                  <td>
                    <v-chip
                      :color="subject.is_active ? 'success' : 'error'"
                      size="small"
                    >
                      {{ subject.is_active ? 'مفعلة' : 'غير مفعلة' }}
                    </v-chip>
                  </td>
                  <td>{{ subject.order_index || 0 }}</td>
                  <td>
                    <v-icon
                      size="small"
                      class="me-2"
                      @click="editSubject(subject)"
                    >
                      mdi-pencil
                    </v-icon>
                    <v-icon
                      size="small"
                      @click="deleteSubject(subject)"
                    >
                      mdi-delete
                    </v-icon>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ClassService, SectionService, SubjectService } from '../services';
import AddClassDialog from '../components/class/AddClassDialog.vue';
import AddSectionDialog from '../components/section/AddSectionDialog.vue';
import AddSubjectDialog from '../components/subject/AddSubjectDialog.vue';

// التبويب النشط
const activeTab = ref('classes');

// حالة التحميل
const loading = reactive({
  classes: false,
  sections: false,
  subjects: false
});

// البيانات
const classes = ref([]);
const sections = ref([]);
const subjects = ref([]);



// جلب البيانات
const fetchData = async () => {
  await Promise.all([
    fetchClasses(),
    fetchSections(),
    fetchSubjects()
  ]);
};

// جلب الصفوف
const fetchClasses = async () => {
  loading.classes = true;
  try {
    const data = await ClassService.getClasses();
    classes.value = data;
  } catch (error) {
    console.error('خطأ في جلب الصفوف:', error);
    // في حالة الخطأ، استخدم بيانات افتراضية
    classes.value = [
      { id: 1, name: 'الصف الأول', description: 'الصف الأول الابتدائي' },
      { id: 2, name: 'الصف الثاني', description: 'الصف الثاني الابتدائي' },
      { id: 3, name: 'الصف الثالث', description: 'الصف الثالث الابتدائي' }
    ];
  } finally {
    loading.classes = false;
  }
};

// جلب الفصول
const fetchSections = async () => {
  loading.sections = true;
  try {
    console.log('Fetching sections...');
    const data = await SectionService.getSections();
    console.log('Sections data:', data);
    sections.value = data;
  } catch (error) {
    console.error('خطأ في جلب الفصول:', error);
    // في حالة الخطأ، استخدم بيانات افتراضية
    sections.value = [
      { id: 1, name: 'أ' },
      { id: 2, name: 'ب' },
      { id: 3, name: 'ج' }
    ];
  } finally {
    loading.sections = false;
  }
};

// جلب المواد
const fetchSubjects = async () => {
  loading.subjects = true;
  try {
    const data = await SubjectService.getSubjects();

    // تحويل البيانات إلى الشكل المطلوب
    subjects.value = data.map(subject => ({
      id: subject.id,
      name: subject.name,
      is_main: subject.parent_id === null,
      parent_id: subject.parent_id ? subject.parent_id.id : null,
      parent_name: subject.parent_id ? subject.parent_id.name : null,
      is_active: subject.is_active !== undefined ? subject.is_active : true,
      order_index: subject.order_index || 0
    }));
  } catch (error) {
    console.error('خطأ في جلب المواد:', error);
    // في حالة الخطأ، استخدم بيانات افتراضية
    subjects.value = [
      { id: 1, name: 'الدراسات الإسلامية', is_main: true, parent_id: null, parent_name: null, is_active: true, order_index: 1 },
      { id: 2, name: 'الفقه', is_main: false, parent_id: 1, parent_name: 'الدراسات الإسلامية', is_active: true, order_index: 2 },
      { id: 3, name: 'التوحيد', is_main: false, parent_id: 1, parent_name: 'الدراسات الإسلامية', is_active: true, order_index: 3 },
      { id: 4, name: 'القرآن', is_main: false, parent_id: 1, parent_name: 'الدراسات الإسلامية', is_active: true, order_index: 1 },
      { id: 5, name: 'الرياضيات', is_main: true, parent_id: null, parent_name: null, is_active: true, order_index: 2 },
      { id: 6, name: 'العلوم', is_main: true, parent_id: null, parent_name: null, is_active: true, order_index: 3 }
    ];
  } finally {
    loading.subjects = false;
  }
};

// معالجة إضافة صف جديد
const handleClassAdded = async (newClass) => {
  try {
    console.log('بيانات الصف الجديد:', newClass);

    // إرسال الصف الجديد إلى Supabase
    const createdClass = await ClassService.createClass({
      name: newClass.name,
      description: newClass.description || ''
    });

    console.log('الصف المنشأ:', createdClass);

    // إعادة تحميل الصفوف بعد الإضافة
    fetchClasses();

    // إظهار رسالة نجاح
    alert('تمت إضافة الصف بنجاح');
  } catch (error) {
    console.error('خطأ في إضافة الصف:', error);
    alert('حدث خطأ أثناء إضافة الصف');
  }
};

// معالجة إضافة فصل جديد
const handleSectionAdded = async (newSection) => {
  try {
    console.log('بيانات الفصل الجديد:', newSection);

    // إرسال الفصل الجديد إلى Supabase
    const createdSection = await SectionService.createSection({
      name: newSection.name
    });

    console.log('الفصل المنشأ:', createdSection);

    // إعادة تحميل الفصول بعد الإضافة
    fetchSections();

    // إظهار رسالة نجاح
    alert('تمت إضافة الفصل بنجاح');
  } catch (error) {
    console.error('خطأ في إضافة الفصل:', error);
    alert('حدث خطأ أثناء إضافة الفصل');
  }
};

// معالجة إضافة مادة جديدة
const handleSubjectAdded = async (newSubject) => {
  try {
    console.log('بيانات المادة الجديدة:', newSubject);

    // إرسال المادة الجديدة إلى Supabase
    const createdSubject = await SubjectService.createSubject({
      name: newSubject.name,
      parent_id: newSubject.is_main ? null : newSubject.parent_id
    });

    console.log('المادة المنشأة:', createdSubject);

    // إعادة تحميل المواد بعد الإضافة
    fetchSubjects();

    // إظهار رسالة نجاح
    alert('تمت إضافة المادة بنجاح');
  } catch (error) {
    console.error('خطأ في إضافة المادة:', error);
    alert('حدث خطأ أثناء إضافة المادة');
  }
};

// تعديل صف
const editClass = async (classItem) => {
  // هنا يمكن إضافة كود لتعديل الصف
  console.log('تعديل الصف:', classItem);

  // محاكاة فتح نافذة حوار لتعديل الصف
  const newName = prompt('أدخل اسم الصف الجديد:', classItem.name);
  if (newName) {
    try {
      // إرسال التعديل إلى Supabase
      await ClassService.updateClass(classItem.id, {
        name: newName,
        description: classItem.description
      });

      // تحديث الاسم محلياً
      classItem.name = newName;

      // إعادة تحميل الصفوف
      fetchClasses();

      // إظهار رسالة نجاح
      alert('تم تعديل الصف بنجاح');
    } catch (error) {
      console.error('خطأ في تعديل الصف:', error);
      alert('حدث خطأ أثناء تعديل الصف');
    }
  }
};

// حذف صف
const deleteClass = async (classItem) => {
  // هنا يمكن إضافة كود لحذف الصف
  console.log('حذف الصف:', classItem);
  if (confirm(`هل أنت متأكد من حذف الصف "${classItem.name}"؟`)) {
    try {
      // إرسال طلب الحذف إلى Supabase
      await ClassService.deleteClass(classItem.id);

      // إزالة الصف من القائمة محلياً
      classes.value = classes.value.filter(c => c.id !== classItem.id);

      // إظهار رسالة نجاح
      alert(`تم حذف الصف: ${classItem.name}`);
    } catch (error) {
      console.error('خطأ في حذف الصف:', error);
      alert('حدث خطأ أثناء حذف الصف');
    }
  }
};

// تعديل فصل
const editSection = async (sectionItem) => {
  // هنا يمكن إضافة كود لتعديل الفصل
  console.log('تعديل الفصل:', sectionItem);

  // محاكاة فتح نافذة حوار لتعديل الفصل
  const newName = prompt('أدخل اسم الفصل الجديد:', sectionItem.name);
  if (newName) {
    try {
      // إرسال التعديل إلى Supabase
      await SectionService.updateSection(sectionItem.id, {
        name: newName
      });

      // تحديث الاسم محلياً
      sectionItem.name = newName;

      // إعادة تحميل الفصول
      fetchSections();

      // إظهار رسالة نجاح
      alert('تم تعديل الفصل بنجاح');
    } catch (error) {
      console.error('خطأ في تعديل الفصل:', error);
      alert('حدث خطأ أثناء تعديل الفصل');
    }
  }
};

// حذف فصل
const deleteSection = async (sectionItem) => {
  // هنا يمكن إضافة كود لحذف الفصل
  console.log('حذف الفصل:', sectionItem);
  if (confirm(`هل أنت متأكد من حذف الفصل "${sectionItem.name}"؟`)) {
    try {
      // إرسال طلب الحذف إلى Supabase
      await SectionService.deleteSection(sectionItem.id);

      // إزالة الفصل من القائمة محلياً
      sections.value = sections.value.filter(s => s.id !== sectionItem.id);

      // إظهار رسالة نجاح
      alert(`تم حذف الفصل: ${sectionItem.name}`);
    } catch (error) {
      console.error('خطأ في حذف الفصل:', error);
      alert('حدث خطأ أثناء حذف الفصل');
    }
  }
};

// تعديل مادة
const editSubject = async (subjectItem) => {
  // هنا يمكن إضافة كود لتعديل المادة
  console.log('تعديل المادة:', subjectItem);

  // محاكاة فتح نافذة حوار لتعديل المادة
  const newName = prompt('أدخل اسم المادة الجديد:', subjectItem.name);
  if (newName) {
    try {
      // إرسال التعديل إلى Supabase
      await SubjectService.updateSubject(subjectItem.id, {
        name: newName,
        parent_id: subjectItem.is_main ? null : subjectItem.parent_id,
        is_active: subjectItem.is_active,
        order_index: subjectItem.order_index
      });

      // تحديث الاسم محلياً
      subjectItem.name = newName;

      // إعادة تحميل المواد
      fetchSubjects();

      // إظهار رسالة نجاح
      alert('تم تعديل المادة بنجاح');
    } catch (error) {
      console.error('خطأ في تعديل المادة:', error);
      alert('حدث خطأ أثناء تعديل المادة');
    }
  }
};

// حذف مادة
const deleteSubject = async (subjectItem) => {
  // هنا يمكن إضافة كود لحذف المادة
  console.log('حذف المادة:', subjectItem);
  if (confirm(`هل أنت متأكد من حذف المادة "${subjectItem.name}"؟`)) {
    try {
      // إرسال طلب الحذف إلى Supabase
      await SubjectService.deleteSubject(subjectItem.id);

      // إزالة المادة من القائمة محلياً
      subjects.value = subjects.value.filter(s => s.id !== subjectItem.id);

      // إظهار رسالة نجاح
      alert(`تم حذف المادة: ${subjectItem.name}`);
    } catch (error) {
      console.error('خطأ في حذف المادة:', error);
      alert('حدث خطأ أثناء حذف المادة');
    }
  }
};

// تنفيذ عند تحميل المكون
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.classes-subjects-container {
  padding: 16px;
  max-width: 100%;
}

.v-card {
  margin-bottom: 16px;
  overflow: hidden;
}

.v-card-title {
  display: flex;
  align-items: center;
}

.v-data-table {
  direction: rtl;
}

.v-tabs {
  margin-bottom: 16px;
}
</style>
