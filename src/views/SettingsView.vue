<template>
  <div>
    <h1 class="text-h4 mb-4">الإعدادات</h1>
    
    <v-card class="mb-4">
      <v-card-title>
        <v-icon start icon="mdi-account-cog"></v-icon>
        إعدادات المستخدم
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="userSettings.name"
              label="الاسم"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="userSettings.email"
              label="البريد الإلكتروني"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-file-input
              v-model="userSettings.avatar"
              label="الصورة الشخصية"
              accept="image/*"
              prepend-icon="mdi-camera"
              show-size
              variant="outlined"
              density="compact"
            ></v-file-input>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <v-card class="mb-4">
      <v-card-title>
        <v-icon start icon="mdi-clock-outline"></v-icon>
        إعدادات الجدول الزمني
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="timeSettings.timeSystem"
              :items="timeSystems"
              item-title="name"
              item-value="id"
              label="النظام الزمني"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-switch
              v-model="timeSettings.showNotifications"
              label="تفعيل التنبيهات"
              color="primary"
              hide-details
            ></v-switch>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="timeSettings.notificationTime"
              :items="notificationTimes"
              item-title="name"
              item-value="value"
              label="وقت التنبيه قبل نهاية الحصة"
              variant="outlined"
              density="compact"
              :disabled="!timeSettings.showNotifications"
            ></v-select>
          </v-col>
        </v-row>
        
        <v-expansion-panels class="mt-4">
          <v-expansion-panel>
            <v-expansion-panel-title>
              أوقات الحصص ({{ timeSystems.find(t => t.id === timeSettings.timeSystem)?.name }})
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-table>
                <thead>
                  <tr>
                    <th class="text-center">الحصة</th>
                    <th class="text-center">وقت البداية</th>
                    <th class="text-center">وقت النهاية</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(period, index) in timeSettings.periods" :key="index">
                    <td class="text-center">{{ period.name }}</td>
                    <td class="text-center">
                      <v-text-field
                        v-model="period.startTime"
                        type="time"
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </td>
                    <td class="text-center">
                      <v-text-field
                        v-model="period.endTime"
                        type="time"
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
    
    <v-card class="mb-4">
      <v-card-title>
        <v-icon start icon="mdi-palette"></v-icon>
        إعدادات المظهر
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-switch
              v-model="appearanceSettings.darkMode"
              label="الوضع الليلي"
              color="primary"
              hide-details
            ></v-switch>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="appearanceSettings.fontSize"
              :items="fontSizes"
              item-title="name"
              item-value="value"
              label="حجم الخط"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="appearanceSettings.primaryColor"
              :items="colors"
              item-title="name"
              item-value="value"
              label="اللون الرئيسي"
              variant="outlined"
              density="compact"
            >
              <template v-slot:selection="{ item }">
                <v-chip :color="item.raw.value" class="mr-2"></v-chip>
                {{ item.title }}
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-chip :color="item.raw.value" class="mr-2"></v-chip>
                  </template>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <div class="text-center">
      <v-btn color="primary" size="large" @click="saveSettings">
        حفظ الإعدادات
        <v-icon end icon="mdi-content-save"></v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// User settings
const userSettings = ref({
  name: 'المعلم',
  email: 'teacher@example.com',
  avatar: null
})

// Time settings
const timeSettings = ref({
  timeSystem: 'regular',
  showNotifications: true,
  notificationTime: 5,
  periods: [
    { name: 'الحصة الأولى', startTime: '07:30', endTime: '08:15' },
    { name: 'الحصة الثانية', startTime: '08:15', endTime: '09:00' },
    { name: 'الحصة الثالثة', startTime: '09:00', endTime: '09:45' },
    { name: 'الاستراحة', startTime: '09:45', endTime: '10:15' },
    { name: 'الحصة الرابعة', startTime: '10:15', endTime: '11:00' },
    { name: 'الحصة الخامسة', startTime: '11:00', endTime: '11:45' },
    { name: 'الحصة السادسة', startTime: '11:45', endTime: '12:30' },
    { name: 'الحصة السابعة', startTime: '12:30', endTime: '13:15' }
  ]
})

// Appearance settings
const appearanceSettings = ref({
  darkMode: false,
  fontSize: 'medium',
  primaryColor: '#1976D2'
})

// Time systems
const timeSystems = ref([
  { id: 'regular', name: 'النظام العادي' },
  { id: 'summer', name: 'النظام الصيفي' },
  { id: 'ramadan', name: 'نظام رمضان' }
])

// Notification times
const notificationTimes = ref([
  { name: '1 دقيقة', value: 1 },
  { name: '3 دقائق', value: 3 },
  { name: '5 دقائق', value: 5 },
  { name: '10 دقائق', value: 10 }
])

// Font sizes
const fontSizes = ref([
  { name: 'صغير', value: 'small' },
  { name: 'متوسط', value: 'medium' },
  { name: 'كبير', value: 'large' }
])

// Colors
const colors = ref([
  { name: 'أزرق', value: '#1976D2' },
  { name: 'أخضر', value: '#4CAF50' },
  { name: 'أحمر', value: '#F44336' },
  { name: 'برتقالي', value: '#FF9800' },
  { name: 'بنفسجي', value: '#9C27B0' }
])

// Save settings
const saveSettings = () => {
  // In a real app, this would save settings to the server
  alert('تم حفظ الإعدادات بنجاح')
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
