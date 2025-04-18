<template>
  <div class="loading-container" v-if="isLoading">
    <v-progress-linear
      indeterminate
      color="primary"
      class="loading-bar"
    ></v-progress-linear>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const isLoading = ref(false)
const router = useRouter()

const startLoading = () => { isLoading.value = true }
const stopLoading = () => { 
  // تأخير قصير لتجنب الوميض السريع
  setTimeout(() => {
    isLoading.value = false 
  }, 200)
}

onMounted(() => {
  router.beforeEach(startLoading)
  router.afterEach(stopLoading)
})

onUnmounted(() => {
  // إزالة المستمعين عند إزالة المكون
  router.beforeEach(() => {})
  router.afterEach(() => {})
})
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}
.loading-bar {
  height: 3px;
}
</style>
