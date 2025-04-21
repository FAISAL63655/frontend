<template>
  <v-dialog :model-value="show" @update:model-value="$emit('update:show', $event)" max-width="600" persistent>
    <v-card>
      <v-card-title class="bg-primary text-white">
        <v-icon start>mdi-database-sync</v-icon>
        ترحيل البيانات
      </v-card-title>

      <v-card-text class="pa-4 pt-5">
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-alert v-if="success" type="success" variant="tonal" class="mb-4">
          تم ترحيل البيانات بنجاح!
        </v-alert>

        <p class="text-body-1 mb-4">
          سيقوم هذا الإجراء بترحيل بيانات الدرجات من النظام القديم إلى النظام الجديد الموحد.
          هذه العملية قد تستغرق بعض الوقت حسب حجم البيانات.
        </p>

        <v-alert type="warning" variant="tonal" class="mb-4">
          <strong>تحذير:</strong> يرجى التأكد من عمل نسخة احتياطية من البيانات قبل المتابعة.
        </v-alert>

        <div v-if="migrating" class="text-center pa-4">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4">جاري ترحيل البيانات...</p>
          <p class="text-caption">يرجى عدم إغلاق هذه النافذة أو تحديث الصفحة.</p>
        </div>

        <div v-if="result" class="mt-4">
          <h3 class="text-h6 mb-2">نتائج الترحيل:</h3>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="success">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title>تم ترحيل {{ result.migratedCount }} سجل بنجاح</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="result.errorCount > 0">
              <template v-slot:prepend>
                <v-icon color="error">mdi-alert-circle</v-icon>
              </template>
              <v-list-item-title>{{ result.errorCount }} أخطاء أثناء الترحيل</v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="onCancel"
          :disabled="migrating"
        >
          إلغاء
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="startMigration"
          :loading="migrating"
          :disabled="migrating || success"
        >
          بدء الترحيل
        </v-btn>
        <v-btn
          v-if="success"
          color="success"
          variant="elevated"
          @click="onClose"
        >
          إغلاق
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import migrateGrades from '../scripts/migrateGrades';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:show', 'migration-complete']);

const migrating = ref(false);
const success = ref(false);
const error = ref(null);
const result = ref(null);

const startMigration = async () => {
  try {
    migrating.value = true;
    error.value = null;
    success.value = false;
    result.value = null;

    // Iniciar la migración
    const migrationResult = await migrateGrades();

    if (migrationResult.success) {
      success.value = true;
      result.value = migrationResult;
      emit('migration-complete', migrationResult);
    } else {
      error.value = 'حدث خطأ أثناء ترحيل البيانات. يرجى المحاولة مرة أخرى.';
      result.value = migrationResult;
    }
  } catch (err) {
    console.error('Error during migration:', err);
    error.value = `حدث خطأ غير متوقع: ${err.message}`;
  } finally {
    migrating.value = false;
  }
};

const onCancel = () => {
  if (!migrating.value) {
    emit('update:show', false);
  }
};

const onClose = () => {
  emit('update:show', false);
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
