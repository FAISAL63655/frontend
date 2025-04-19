<template>
  <v-card class="assignments-card mb-4 elevation-1">
    <v-toolbar color="blue-lighten-4" density="comfortable" class="rounded-t">
      <v-toolbar-title class="d-flex align-center">
        <v-icon start>mdi-bookshelf</v-icon>
        <span>الواجبات ({{ assignments.length }})</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-plus" @click="$emit('add')">
        إضافة واجب
      </v-btn>
    </v-toolbar>
    <v-expand-transition>
      <div v-if="assignments.length > 0" class="pa-2">
        <v-list class="assignment-list">
          <v-list-item
            v-for="assignment in assignments"
            :key="assignment.id"
            :active="currentAssignment && currentAssignment.id === assignment.id"
            @click="$emit('select', assignment)"
            :rounded="true"
            class="mb-1"
          >
            <template #prepend>
              <v-avatar size="32" color="primary" class="ms-2">
                <v-icon color="white">mdi-book-education</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium">
              {{ assignment.title }}
            </v-list-item-title>
            <template #append>
              <v-chip size="small" variant="elevated" :color="isDueSoon(assignment) ? 'error' : 'success'">
                {{ formatDate(assignment.due_date) }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-expand-transition>
    <v-divider />
    <v-card-text v-if="currentAssignment" class="pa-4">
      <div class="d-flex flex-column gap-2">
        <div class="d-flex align-center gap-2">
          <span class="text-h6 font-weight-bold">{{ currentAssignment.title }}</span>
          <v-chip size="small" color="info" variant="outlined">
            <v-icon start size="x-small">mdi-calendar-plus</v-icon>
            {{ formatDate(currentAssignment.created_at) }}
          </v-chip>
          <v-chip size="small" :color="isDueSoon(currentAssignment) ? 'error' : 'success'" variant="outlined">
            <v-icon start size="x-small">mdi-calendar-clock</v-icon>
            {{ formatDate(currentAssignment.due_date) }}
          </v-chip>
          <v-chip size="small" color="primary" variant="outlined">
            <v-icon start size="x-small">mdi-star</v-icon>
            الدرجة: {{ currentAssignment.score }}
          </v-chip>
        </div>
        <div v-if="currentAssignment.description" class="text-body-2 mb-2">
          {{ currentAssignment.description }}
        </div>
        <div class="d-flex gap-2 mt-2">
          <v-btn color="error" variant="tonal" size="small" icon="mdi-delete" @click="$emit('delete')" />
          <v-btn color="info" variant="tonal" size="small" icon="mdi-pencil" @click="$emit('edit')" />
          <v-badge
            :content="pendingCount"
            :color="pendingCount > 0 ? 'error' : 'success'"
            v-if="pendingCount > 0"
          >
            <v-btn
              color="warning"
              variant="elevated"
              size="small"
              prepend-icon="mdi-check-all"
              @click="$emit('mark-all')"
            >
              تم تسليم الجميع
            </v-btn>
          </v-badge>
        </div>
      </div>
    </v-card-text>
    <v-card-text v-else class="pa-4 text-grey">
      لا يوجد واجب نشط حاليًا.
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  assignments: { type: Array, default: () => [] },
  currentAssignment: { type: Object, default: null },
  pendingCount: { type: Number, default: 0 }
})

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA')
}

function isDueSoon(assignment) {
  if (!assignment || !assignment.due_date) return false
  const dueDate = new Date(assignment.due_date)
  const today = new Date()
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
  return diffDays <= 2 && diffDays >= 0
}
</script>

<style scoped>
.assignments-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}
.assignment-list .v-list-item {
  margin-bottom: 4px;
  transition: all 0.3s ease;
}
.assignment-list .v-list-item:hover {
  background-color: var(--v-theme-primary-lighten-5);
}
.assignment-list .v-list-item--active {
  background-color: var(--v-theme-primary-lighten-4);
}
</style>
