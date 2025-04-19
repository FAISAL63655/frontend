<template>
  <div class="under-development-container">
    <v-card class="under-development-card">
      <v-card-title class="text-center">
        <v-icon size="large" color="warning" class="mb-4">mdi-hammer-wrench</v-icon>
        <h1 class="text-h4 mb-4">السبورة البيضاء</h1>
      </v-card-title>
      <v-card-text class="text-center">
        <h2 class="text-h5 mb-6">هذه الصفحة تحت التطوير</h2>
        <p class="text-body-1 mb-4">نعمل حاليًا على تطوير هذه الميزة لتوفير تجربة أفضل للمستخدمين.</p>
        <p class="text-body-1 mb-8">يرجى العودة لاحقًا.</p>
        <v-progress-linear
          indeterminate
          color="primary"
          class="mb-6"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'WhiteboardView'
}
</script>

<style scoped>
.under-development-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 20px;
}

.under-development-card {
  max-width: 600px;
  width: 100%;
  padding: 20px;
}
</style>
