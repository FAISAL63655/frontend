<template>
  <v-card class="mb-6" variant="flat">
    <v-card-item>
      <template v-slot:prepend>
        <v-avatar :color="iconColor" variant="tonal">
          <v-icon :icon="icon"></v-icon>
        </v-avatar>
      </template>
      <v-card-title class="text-h6">{{ title }}</v-card-title>
      <template v-slot:append>
        <v-btn v-if="refreshable" variant="text" icon="mdi-refresh" @click="$emit('refresh')"></v-btn>
      </template>
    </v-card-item>

    <v-divider></v-divider>

    <v-card-text>
      <div v-if="isLoading" class="d-flex justify-center align-center pa-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <div v-else-if="hasError" class="text-center my-4">
        <v-alert type="error" variant="tonal" title="خطأ في تحميل البيانات">
          {{ errorMessage }}
          <template v-slot:append>
            <v-btn color="error" variant="tonal" @click="$emit('refresh')">إعادة المحاولة</v-btn>
          </template>
        </v-alert>
      </div>

      <div v-else-if="items.length === 0" class="text-center pa-4">
        <v-icon size="large" :color="iconColor" :icon="emptyIcon" class="mb-2"></v-icon>
        <p class="text-body-1">{{ emptyText }}</p>
      </div>

      <v-list v-else>
        <v-list-item
          v-for="(item, index) in items"
          :key="item.id"
          :class="{ 'champion-item': true, 'top-champion': index === 0 }"
          class="my-2 rounded-lg"
        >
          <template v-slot:prepend>
            <div class="rank-badge me-2">{{ index + 1 }}</div>
            <v-avatar class="mr-3" :color="item.image ? undefined : getAvatarColor(item.name)">
              <v-img v-if="item.image" :src="item.image" :alt="item.name"></v-img>
              <span v-else class="text-h6">{{ getInitials(item.name) }}</span>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium">{{ item.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.class }} {{ item.section }}</v-list-item-subtitle>

          <template v-slot:append>
            <div class="d-flex flex-column align-end">
              <div class="text-h6 font-weight-bold">{{ getMainValue(item) }}</div>
              <v-chip
                size="small"
                :color="getValueColor(item)"
                variant="tonal"
              >
                {{ getSecondaryValue(item) }}
              </v-chip>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { getInitials, getAvatarColor } from '@/utils/imageUtils'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'mdi-trophy'
  },
  iconColor: {
    type: String,
    default: 'warning'
  },
  emptyIcon: {
    type: String,
    default: 'mdi-trophy-outline'
  },
  emptyText: {
    type: String,
    default: 'لا توجد بيانات متاحة'
  },
  items: {
    type: Array,
    default: () => []
  },
  valueField: {
    type: String,
    default: 'value'
  },
  valuePrefix: {
    type: String,
    default: ''
  },
  valueSuffix: {
    type: String,
    default: ''
  },
  secondaryValueField: {
    type: String,
    default: ''
  },
  secondaryValuePrefix: {
    type: String,
    default: ''
  },
  secondaryValueSuffix: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  hasError: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.'
  },
  refreshable: {
    type: Boolean,
    default: true
  }
})

defineEmits(['refresh'])

const getMainValue = (item) => {
  const value = item[props.valueField]
  if (value === undefined || value === null) return ''
  return `${props.valuePrefix}${value}${props.valueSuffix}`
}

const getSecondaryValue = (item) => {
  if (!props.secondaryValueField) return ''
  const value = item[props.secondaryValueField]
  if (value === undefined || value === null) return ''
  return `${props.secondaryValuePrefix}${value}${props.secondaryValueSuffix}`
}

const getValueColor = (item) => {
  const value = item[props.valueField]
  if (value === undefined || value === null) return 'primary'
  
  if (props.valueField.includes('grade') || props.valueField.includes('rate')) {
    if (value >= 90) return 'success'
    if (value >= 80) return 'info'
    if (value >= 70) return 'primary'
    if (value >= 60) return 'warning'
    return 'error'
  }
  
  return 'primary'
}
</script>

<style scoped>
.champion-item {
  transition: all 0.3s ease;
}

.champion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.top-champion {
  background-color: rgba(var(--v-theme-warning), 0.08);
  border-right: 3px solid rgb(var(--v-theme-warning));
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.top-champion .rank-badge {
  background-color: rgb(var(--v-theme-warning));
  color: white;
}
</style>
