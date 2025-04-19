<template>
  <v-row align="center" class="grades-filters">
    <v-col cols="12" sm="6" md="3">
      <v-select
        v-model="localClass"
        :items="classes"
        item-title="name"
        item-value="id"
        label="الصف"
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-school"
        hide-details
        bg-color="white"
        class="rounded-lg"
        @update:model-value="emitChange"
      />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-select
        v-model="localSection"
        :items="sections"
        item-title="name"
        item-value="id"
        label="الفصل"
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-home"
        hide-details
        bg-color="white"
        class="rounded-lg"
        @update:model-value="emitChange"
      />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-select
        v-model="localSubject"
        :items="subjects"
        item-title="name"
        item-value="id"
        label="المادة"
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-book-open-variant"
        hide-details
        bg-color="white"
        class="rounded-lg"
        @update:model-value="emitChange"
      />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-text-field
        v-model="localDate"
        label="التاريخ"
        type="date"
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-calendar"
        hide-details
        bg-color="white"
        class="rounded-lg"
        @update:model-value="emitChange"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, watch, toRefs } from 'vue'

const props = defineProps({
  classes: { type: Array, default: () => [] },
  sections: { type: Array, default: () => [] },
  subjects: { type: Array, default: () => [] },
  modelValueClass: { type: [String, Number], default: null, required: false },
  modelValueSection: { type: [String, Number], default: null, required: false },
  modelValueSubject: { type: [String, Number], default: null, required: false },
  modelValueDate: { type: String, default: '', required: false }
})

const emit = defineEmits(['update:class', 'update:section', 'update:subject', 'update:date', 'change'])

const { modelValueClass, modelValueSection, modelValueSubject, modelValueDate } = toRefs(props)

const localClass = ref(modelValueClass.value)
const localSection = ref(modelValueSection.value)
const localSubject = ref(modelValueSubject.value)
const localDate = ref(modelValueDate.value)

watch(modelValueClass, v => { localClass.value = v })
watch(modelValueSection, v => { localSection.value = v })
watch(modelValueSubject, v => { localSubject.value = v })
watch(modelValueDate, v => { localDate.value = v })

watch(localClass, v => emit('update:class', v))
watch(localSection, v => emit('update:section', v))
watch(localSubject, v => emit('update:subject', v))
watch(localDate, v => emit('update:date', v))

function emitChange() {
  emit('change')
}
</script>

<style scoped>
.grades-filters {
  background: transparent;
}
</style>
