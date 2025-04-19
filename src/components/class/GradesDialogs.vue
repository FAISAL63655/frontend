<template>
  <!-- إضافة واجب جديد -->
  <v-dialog :model-value="showAddAssignment" @update:model-value="val => $emit('update:showAddAssignment', val)" max-width="500px" dir="rtl">
    <v-card>
      <v-card-title>إضافة واجب جديد</v-card-title>
      <v-card-text>
        <!-- نموذج إضافة واجب -->
        <slot name="add-assignment-form">
          <!-- Placeholder: نموذج إضافة واجب -->
        </slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="$emit('close')">إلغاء</v-btn>
        <v-btn color="primary" @click="$emit('add-assignment')">إضافة</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- تعديل الواجب -->
  <v-dialog :model-value="showEditAssignment" @update:model-value="val => $emit('update:showEditAssignment', val)" max-width="500px" dir="rtl">
    <v-card>
      <v-card-title>تعديل الواجب</v-card-title>
      <v-card-text>
        <slot name="edit-assignment-form">
          <!-- Placeholder: نموذج تعديل الواجب -->
        </slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="$emit('close')">إلغاء</v-btn>
        <v-btn color="primary" @click="$emit('update-assignment')">حفظ</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- تفاصيل الطالب -->
  <v-dialog :model-value="showStudentDetails" @update:model-value="val => $emit('update:showStudentDetails', val)" max-width="800px" dir="rtl">
    <v-card>
      <v-card-title>تفاصيل الطالب</v-card-title>
      <v-card-text>
        <slot name="student-details">
          <!-- Placeholder: تفاصيل الطالب -->
        </slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="$emit('close')">إغلاق</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- تعديل الملاحظة -->
  <v-dialog :model-value="showEditNote" @update:model-value="val => $emit('update:showEditNote', val)" max-width="500px" dir="rtl">
    <v-card>
      <v-card-title>تعديل الملاحظة</v-card-title>
      <v-card-text>
        <slot name="edit-note-form">
          <!-- Placeholder: نموذج تعديل الملاحظة -->
        </slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="$emit('close')">إلغاء</v-btn>
        <v-btn color="primary" :loading="isSubmitting" @click="$emit('update-note')">حفظ</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- تعديل الحضور -->
  <v-dialog :model-value="showEditAttendance" @update:model-value="val => $emit('update:showEditAttendance', val)" max-width="500px" dir="rtl">
    <v-card>
      <v-card-title>تعديل سجل الحضور</v-card-title>
      <v-card-text>
        <slot name="edit-attendance-form">
          <!-- Placeholder: نموذج تعديل الحضور -->
        </slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="$emit('close')">إلغاء</v-btn>
        <v-btn color="primary" :loading="isSubmitting" @click="$emit('update-attendance')">حفظ</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  showAddAssignment: Boolean,
  showEditAssignment: Boolean,
  showStudentDetails: Boolean,
  showEditNote: Boolean,
  showEditAttendance: Boolean,
  newAssignment: Object,
  currentAssignment: Object,
  selectedStudent: Object,
  studentGrades: Array,
  studentAttendance: Array,
  studentAssignments: Array,
  studentNotes: Array,
  editedNote: Object,
  editedAttendance: Object,
  isSubmitting: Boolean
})

defineEmits([
  'add-assignment', 'update-assignment', 'update-note', 'update-attendance',
  'delete-note', 'delete-attendance', 'close'
])
</script>
