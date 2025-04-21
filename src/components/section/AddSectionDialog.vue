<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template v-slot:activator="{ props }">
      <v-btn color="primary" v-bind="props" prepend-icon="mdi-plus">
        إضافة فصل
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">إضافة فصل جديد</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="sectionData.name"
                  label="اسم الفصل"
                  required
                  :rules="[v => !!v || 'اسم الفصل مطلوب']"
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
import { SectionService } from '../../services';

// نموذج الفصل الدراسي
class Section {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
  }
}

// حالة الحوار
const dialog = ref(false);
const valid = ref(false);
const form = ref(null);

// بيانات الفصل
const sectionData = reactive(new Section({}));

// تنفيذ عند تحميل المكون
onMounted(() => {
  // لا شيء للقيام به عند التحميل
});

// إغلاق الحوار
const close = () => {
  dialog.value = false;
  resetForm();
};

// إعادة تعيين النموذج
const resetForm = () => {
  // إعادة تعيين القيم بشكل مباشر
  sectionData.id = null;
  sectionData.name = '';

  if (form.value) {
    form.value.resetValidation();
  }
};

// حفظ الفصل
const save = async () => {
  if (!valid.value) return;

  try {
    // التأكد من أن البيانات صحيحة
    if (!sectionData.name) {
      alert('يرجى إدخال اسم الفصل');
      return;
    }

    console.log('تم حفظ الفصل:', sectionData);

    // إنشاء نسخة من البيانات للتأكد من عدم فقدان القيم
    const sectionToSend = {
      id: sectionData.id,
      name: sectionData.name
    };
    console.log('إرسال الفصل:', sectionToSend);

    // إرسال حدث للإشارة إلى إضافة فصل جديد
    emit('section-added', sectionToSend);

    // إغلاق الحوار بعد الحفظ
    close();
  } catch (error) {
    console.error('خطأ في حفظ الفصل:', error);
  }
};

// تعريف الأحداث
const emit = defineEmits(['section-added']);
</script>

<style scoped>
.v-dialog {
  direction: rtl;
}
</style>
