<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template v-slot:activator="{ props }">
      <v-btn color="primary" v-bind="props" prepend-icon="mdi-plus">
        إضافة مادة
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">إضافة مادة جديدة</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="subjectData.name"
                  label="اسم المادة"
                  required
                  :rules="[v => !!v || 'اسم المادة مطلوب']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="subjectData.is_main"
                  label="مادة أساسية"
                  color="primary"
                  hide-details
                  @change="handleMainSubjectChange"
                ></v-switch>
              </v-col>
              <v-col cols="12" v-if="!subjectData.is_main">
                <v-select
                  v-model="subjectData.parent_id"
                  :items="mainSubjects"
                  item-title="name"
                  item-value="id"
                  label="المادة الأساسية"
                  required
                  :rules="[v => subjectData.is_main || !!v || 'المادة الأساسية مطلوبة']"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="subjectData.is_active"
                  label="مفعلة"
                  color="success"
                  hide-details
                ></v-switch>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="subjectData.order_index"
                  label="ترتيب الظهور"
                  type="number"
                  min="0"
                  hint="الرقم الأقل يظهر أولاً"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="close">
          إلغاء
        </v-btn>
        <v-btn color="primary" variant="text" @click="save" :disabled="!valid">
          حفظ
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { SubjectService } from '../../services';

// نموذج المادة الدراسية
class Subject {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.parent_id = data.parent_id || null;
    this.is_main = data.is_main || false;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.order_index = data.order_index || 0;
  }
}

// حالة الحوار
const dialog = ref(false);
const valid = ref(false);
const form = ref(null);

// بيانات المادة
const subjectData = reactive(new Subject({}));

// قائمة المواد الأساسية
const mainSubjects = ref([]);

// جلب قائمة المواد الأساسية
const fetchMainSubjects = async () => {
  try {
    const data = await SubjectService.getMainSubjects();
    mainSubjects.value = data;
  } catch (error) {
    console.error('خطأ في جلب قائمة المواد الأساسية:', error);
    // في حالة الخطأ، استخدم بيانات افتراضية
    mainSubjects.value = [
      { id: 14, name: 'الدراسات الإسلامية' }
    ];

    // محاولة جلب البيانات مرة أخرى بعد فترة
    setTimeout(() => {
      fetchMainSubjects();
    }, 2000);
  }
};

// تنفيذ عند تحميل المكون
onMounted(() => {
  fetchMainSubjects();
});

// معالجة تغيير نوع المادة (أساسية أم فرعية)
const handleMainSubjectChange = () => {
  if (subjectData.is_main) {
    subjectData.parent_id = null;
  }
};

// إغلاق الحوار
const close = () => {
  dialog.value = false;
  resetForm();
};

// إعادة تعيين النموذج
const resetForm = () => {
  // إعادة تعيين القيم بشكل مباشر
  subjectData.id = null;
  subjectData.name = '';
  subjectData.parent_id = null;
  subjectData.is_main = false;
  subjectData.is_active = true;
  subjectData.order_index = 0;

  if (form.value) {
    form.value.resetValidation();
  }
};

// حفظ المادة
const save = async () => {
  if (!valid.value) return;

  try {
    // التأكد من أن البيانات صحيحة
    if (!subjectData.name) {
      alert('يرجى إدخال اسم المادة');
      return;
    }

    if (!subjectData.is_main && !subjectData.parent_id) {
      alert('يرجى اختيار المادة الأساسية');
      return;
    }

    console.log('تم حفظ المادة:', subjectData);

    // إنشاء نسخة من البيانات للتأكد من عدم فقدان القيم
    const subjectToSend = {
      name: subjectData.name,
      parent_id: subjectData.is_main ? null : subjectData.parent_id,
      is_main: subjectData.is_main,
      is_active: subjectData.is_active,
      order_index: subjectData.order_index || 0
    };
    console.log('إرسال المادة:', subjectToSend);

    // إرسال حدث للإشارة إلى إضافة مادة جديدة
    emit('subject-added', subjectToSend);

    // إغلاق الحوار بعد الحفظ
    close();
  } catch (error) {
    console.error('خطأ في حفظ المادة:', error);
  }
};

// تعريف الأحداث
const emit = defineEmits(['subject-added']);
</script>

<style scoped>
.v-dialog {
  direction: rtl;
}
</style>
