<template>
  <div class="notification-center">
    <v-menu
      v-model="showMenu"
      :close-on-content-click="false"
      location="bottom end"
      max-width="400"
    >
      <template v-slot:activator="{ props }">
        <v-badge
          :content="unreadCount.toString()"
          :value="unreadCount"
          color="error"
          offset-x="10"
          offset-y="10"
        >
          <v-btn
            v-bind="props"
            icon
            @click="fetchNotifications"
          >
            <v-icon>mdi-bell</v-icon>
          </v-btn>
        </v-badge>
      </template>

      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>التنبيهات</span>
          <div>
            <v-btn
              v-if="unreadCount > 0"
              size="small"
              variant="text"
              @click="markAllAsRead"
            >
              تعليم الكل كمقروء
            </v-btn>
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="notification-list">
          <v-list v-if="notifications.length > 0">
            <v-list-item
              v-for="notification in notifications"
              :key="notification.id"
              :class="{ 'unread': !notification.is_read }"
              @click="handleNotificationClick(notification)"
            >
              <template v-slot:prepend>
                <v-icon :color="getNotificationColor(notification.type)" class="me-3">
                  {{ getNotificationIcon(notification.type) }}
                </v-icon>
              </template>

              <v-list-item-title>{{ notification.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
              <v-list-item-subtitle class="text-caption">
                {{ formatDate(notification.created_at) }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  icon="mdi-check"
                  size="small"
                  variant="text"
                  v-if="!notification.is_read"
                  @click.stop="markAsRead(notification.id)"
                  color="primary"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>

          <div v-else class="text-center py-4">
            <v-icon size="large" color="grey">mdi-bell-off</v-icon>
            <p class="mt-2">لا توجد تنبيهات</p>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import NotificationService from '@/services/NotificationService';

// المتغيرات
const notifications = ref([]);
const showMenu = ref(false);
const loading = ref(false);

// عدد التنبيهات غير المقروءة
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.is_read).length;
});

// جلب التنبيهات
const fetchNotifications = async () => {
  loading.value = true;
  try {
    const data = await NotificationService.getNotifications();
    notifications.value = data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    loading.value = false;
  }
};

// تعليم تنبيه كمقروء
const markAsRead = async (id) => {
  try {
    await NotificationService.markAsRead(id);
    // تحديث حالة التنبيه في القائمة المحلية
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value[index].is_read = true;
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// تعليم جميع التنبيهات كمقروءة
const markAllAsRead = async () => {
  try {
    await NotificationService.markAllAsRead();
    // تحديث حالة جميع التنبيهات في القائمة المحلية
    notifications.value.forEach(notification => {
      notification.is_read = true;
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// معالجة النقر على التنبيه
const handleNotificationClick = (notification) => {
  // إذا كان التنبيه غير مقروء، قم بتعليمه كمقروء
  if (!notification.is_read) {
    markAsRead(notification.id);
  }

  // إذا كان هناك رابط، انتقل إليه
  if (notification.link) {
    window.location.href = notification.link;
  }
};

// الحصول على لون التنبيه بناءً على نوعه
const getNotificationColor = (type) => {
  switch (type) {
    case 'info':
      return 'info';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'primary';
  }
};

// الحصول على أيقونة التنبيه بناءً على نوعه
const getNotificationIcon = (type) => {
  switch (type) {
    case 'info':
      return 'mdi-information';
    case 'success':
      return 'mdi-check-circle';
    case 'warning':
      return 'mdi-alert';
    case 'error':
      return 'mdi-alert-circle';
    default:
      return 'mdi-bell';
  }
};

// تنسيق التاريخ
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ar-SA');
};

// جلب التنبيهات عند تحميل المكون
onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.unread {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
