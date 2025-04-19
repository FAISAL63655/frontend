<template>
  <v-card class="students-table-card elevation-2">
    <v-toolbar color="blue-lighten-5" density="compact" class="rounded-t">
      <v-toolbar-title>
        <div class="d-flex align-center">
          <v-icon start class="me-2">mdi-account-group</v-icon>
          <span>قائمة الطلاب</span>
        </div>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="localSearch"
        prepend-inner-icon="mdi-magnify"
        label="بحث"
        single-line
        hide-details
        density="compact"
        bg-color="white"
        class="mx-2"
        style="max-width: 250px;"
        @update:model-value="emitSearch"
      />
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="filteredStudents"
      :search="localSearch"
      :items-per-page="pagination.itemsPerPage"
      :page="pagination.page"
      @update:page="onPageChange"
      @update:items-per-page="onItemsPerPageChange"
      class="elevation-0 student-data-table"
      item-value="id"
      hover
      :loading="loading"
      loading-text="جاري تحميل بيانات الطلاب..."
    >
      <!-- صورة الطالب -->
      <template #[`item.image`]="{ item }">
        <v-avatar size="40" class="elevation-1" :color="item.image ? undefined : getAvatarColor(item.name)" style="border: 2px solid #f5f5f5;">
          <v-img v-if="item.image" :src="item.image" alt="Student" cover />
          <span v-else class="text-subtitle-2 text-white">{{ getInitials(item.name) }}</span>
        </v-avatar>
      </template>
      <!-- اسم الطالب -->
      <template #[`item.name`]="{ item }">
        <a href="#" @click.prevent="$emit('open-details', item)">{{ item.name }}</a>
      </template>
      <!-- الدرجات -->
      <template #[`item.theory`]="{ item }">
        <v-text-field
          v-model="item.theory"
          density="compact"
          variant="outlined"
          hide-details
          type="number"
          min="0"
          max="15"
          style="width: 70px"
          @update:model-value="() => $emit('save-grade', item, 'theory')"
        />
      </template>
      <template #[`item.practical`]="{ item }">
        <v-text-field
          v-model="item.practical"
          density="compact"
          variant="outlined"
          hide-details
          type="number"
          min="0"
          max="5"
          style="width: 70px"
          @update:model-value="() => $emit('save-grade', item, 'practical')"
        />
      </template>
      <template #[`item.homework`]="{ item }">
        <v-text-field
          v-model="item.homework"
          density="compact"
          variant="outlined"
          hide-details
          type="number"
          min="0"
          max="10"
          style="width: 70px"
          @update:model-value="() => $emit('save-grade', item, 'homework')"
        />
      </template>
      <template #[`item.participation`]="{ item }">
        <v-text-field
          v-model="item.participation"
          density="compact"
          variant="outlined"
          hide-details
          type="number"
          min="0"
          max="10"
          style="width: 70px"
          @update:model-value="() => $emit('save-grade', item, 'participation')"
        />
      </template>
      <template #[`item.final`]="{ item }">
        <v-text-field
          v-model="item.final"
          density="compact"
          variant="outlined"
          hide-details
          type="number"
          min="0"
          max="40"
          style="width: 70px"
          @update:model-value="() => $emit('save-grade', item, 'final')"
        />
      </template>
      <template #[`item.quran`]="{ item }">
        <v-text-field
          v-model="item.quran"
          density="compact"
          variant="outlined"
          hide-details
          type="number"
          min="0"
          max="20"
          style="width: 70px"
          @update:model-value="() => $emit('save-grade', item, 'quran')"
        />
      </template>
      <template #[`item.total`]="{ item }">
        <strong>{{ calculateTotal(item) }}</strong>
      </template>
      <!-- الحضور -->
      <template #[`item.attendance`]="{ item }">
        <v-btn-toggle v-model="item.attendance" mandatory>
          <v-btn
            :value="'present'"
            :color="item.attendance === 'present' ? 'success' : ''"
            icon="mdi-check"
            size="small"
            @click="$emit('save-attendance', item, 'present')"
          />
          <v-btn
            :value="'absent'"
            :color="item.attendance === 'absent' ? 'error' : ''"
            icon="mdi-close"
            size="small"
            @click="$emit('save-attendance', item, 'absent')"
          />
        </v-btn-toggle>
      </template>
      <!-- الواجبات -->
      <template #[`item.assignments`]="{ item }">
        <v-btn-toggle v-model="item.assignmentStatus" mandatory :disabled="!currentAssignment">
          <v-btn
            :value="'submitted'"
            :color="item.assignmentStatus === 'submitted' ? 'success' : ''"
            icon="mdi-check"
            size="small"
            @click="$emit('save-assignment', item, 'submitted')"
          />
          <v-btn
            :value="'not_submitted'"
            :color="item.assignmentStatus === 'not_submitted' ? 'error' : ''"
            icon="mdi-close"
            size="small"
            @click="$emit('save-assignment', item, 'not_submitted')"
          />
        </v-btn-toggle>
      </template>
      <!-- الملاحظات -->
      <template #[`item.notes`]="{ item }">
        <v-btn
          :color="item.noteType === 'positive' ? 'success' : item.noteType === 'negative' ? 'error' : 'grey'"
          icon="mdi-note-text"
          size="small"
          @click="$emit('save-note', item)"
        />
      </template>
    </v-data-table>
    <!-- ترقيم الصفحات -->
    <div class="d-flex flex-column align-center pa-4 bg-blue-lighten-5 rounded-b">
      <v-pagination
        v-model="localPage"
        :length="pageCount"
        :total-visible="5"
        rounded="circle"
        color="primary"
        @update:model-value="onPageChange"
      />
      <div class="d-flex align-center mt-2">
        <span class="me-4">عناصر في الصفحة:</span>
        <v-btn-toggle
          v-model="localItemsPerPage"
          mandatory
          density="comfortable"
          color="primary"
          @update:model-value="onItemsPerPageChange"
        >
          <v-btn value="5">5</v-btn>
          <v-btn value="10">10</v-btn>
          <v-btn value="15">15</v-btn>
          <v-btn value="-1">الكل</v-btn>
        </v-btn-toggle>
        <v-spacer></v-spacer>
        <div class="text-body-2">
          عرض {{ paginationStart }} - {{ paginationEnd }} من {{ students.length }}
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getInitials, getAvatarColor } from '@/utils/imageUtils'

const props = defineProps({
  headers: { type: Array, required: true },
  students: { type: Array, required: true },
  search: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  currentAssignment: { type: Object, default: null },
  pagination: { type: Object, required: true }
})

const emit = defineEmits([
  'save-grade', 'save-attendance', 'save-assignment', 'save-note', 'open-details', 'pagination-change'
])

const localSearch = ref(props.search)
const localPage = ref(props.pagination.page)
const localItemsPerPage = ref(props.pagination.itemsPerPage)

watch(() => props.search, v => { localSearch.value = v })
watch(() => props.pagination.page, v => { localPage.value = v })
watch(() => props.pagination.itemsPerPage, v => { localItemsPerPage.value = v })

function emitSearch() {
  // يمكن إضافة debounce هنا لاحقًا
}

const filteredStudents = computed(() => {
  // يمكن تحسين البحث لاحقًا
  return props.students
})

function calculateTotal(student) {
  const theory = Number(student.theory || 0)
  const practical = Number(student.practical || 0)
  const homework = Number(student.homework || 0)
  const participation = Number(student.participation || 0)
  const quran = Number(student.quran || 0)
  const final = Number(student.final || 0)
  return theory + practical + homework + participation + quran + final
}

const pageCount = computed(() => {
  if (!props.students.length) return 1
  if (localItemsPerPage.value === -1) return 1
  return Math.ceil(props.students.length / localItemsPerPage.value)
})
const paginationStart = computed(() => {
  if (!props.students.length) return 0
  if (localItemsPerPage.value === -1) return 1
  return (localPage.value - 1) * localItemsPerPage.value + 1
})
const paginationEnd = computed(() => {
  if (!props.students.length) return 0
  if (localItemsPerPage.value === -1) return props.students.length
  return Math.min(localPage.value * localItemsPerPage.value, props.students.length)
})

function onPageChange(page) {
  localPage.value = page
  emit('pagination-change', {
    ...props.pagination,
    page: localPage.value,
    itemsPerPage: localItemsPerPage.value
  })
}
function onItemsPerPageChange(itemsPerPage) {
  localItemsPerPage.value = itemsPerPage
  emit('pagination-change', {
    ...props.pagination,
    page: 1,
    itemsPerPage: localItemsPerPage.value
  })
}
</script>

<style scoped>
.students-table-card {
  border-radius: 12px;
  overflow: hidden;
}
.student-data-table {
  overflow: visible;
  height: auto;
  max-height: none;
}
</style>
