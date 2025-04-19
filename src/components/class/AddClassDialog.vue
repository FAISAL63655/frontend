<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template v-slot:activator="{ props }">
      <v-btn color="primary" v-bind="props" prepend-icon="mdi-plus">
        إضافة صف
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">إضافة صف جديد</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="classData.name"
                  label="اسم الصف"
                  required
                  :rules="[v => !!v || 'اسم الصف مطلوب']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="classData.description"
                  label="وصف الصف (اختياري)"
                  rows="3"
                ></v-textarea>
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
import { ref, reactive } from 'vue';

// نموذج الصف الدراسي
class Class {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
  }
}

// حالة الحوار
const dialog = ref(false);
const valid = ref(false);
const form = ref(null);

// بيانات الصف
const classData = reactive(new Class({}));

// إغلاق الحوار
const close = () => {
  dialog.value = false;
  resetForm();
};

// إعادة تعيين النموذج
const resetForm = () => {
  // إعادة تعيين القيم بشكل مباشر
  classData.id = null;
  classData.name = '';
  classData.description = '';

  if (form.value) {
    form.value.resetValidation();
  }
};

// حفظ الصف
const save = async () => {
  if (!valid.value) return;

  try {
    // التأكد من أن البيانات صحيحة
    if (!classData.name) {
      alert('يرجى إدخال اسم الصف');
      return;
    }

    console.log('تم حفظ الصف:', classData);

    // إنشاء نسخة من البيانات للتأكد من عدم فقدان القيم
    const classToSend = {
      id: classData.id,
      name: classData.name,
      description: classData.description || ''
    };
    console.log('إرسال الصف:', classToSend);

    // إرسال حدث للإشارة إلى إضافة صف جديد
    emit('class-added', classToSend);

    // إغلاق الحوار بعد الحفظ
    close();
  } catch (error) {
    console.error('خطأ في حفظ الصف:', error);
  }
};

// تعريف الأحداث
const emit = defineEmits(['class-added']);
</script>

<style scoped>
.v-dialog {
  direction: rtl;
}
</style>
