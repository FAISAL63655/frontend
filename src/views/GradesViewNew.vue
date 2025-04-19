<template>
  <div class="grades-page-new" dir="rtl">
    <!-- بطاقة العنوان والفلاتر -->
    <v-card class="header-card mb-4 rounded-lg" elevation="2">
      <v-card-title class="d-flex align-center py-3 px-4 bg-primary text-white rounded-t-lg">
        <v-icon size="large" class="me-2">mdi-clipboard-text-outline</v-icon>
        <span class="text-h5 font-weight-bold">صفحة الدرجات المحدثة</span>
        <v-spacer></v-spacer>
        <v-btn
          variant="tonal"
          color="white"
          prepend-icon="mdi-filter-variant"
          class="ms-2"
          @click="showFilters = !showFilters"
        >
          الفلاتر
          <v-icon end>{{ showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </v-card-title>

      <!-- قسم الفلاتر -->
      <v-expand-transition>
        <div v-if="showFilters">
          <v-card-text class="pa-4">
            <!-- صف البحث -->
            <v-row class="mb-4">
              <v-col cols="12">
                <v-text-field
                  v-model="searchQuery"
                  label="البحث عن طالب"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  clearable
                  @update:model-value="applyFilters"
                  @click:clear="clearSearch"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- صف الفلاتر الرئيسية -->
            <v-row>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="selectedClass"
                  :items="classes"
                  item-title="name"
                  item-value="id"
                  label="الصف"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  :loading="loading"
                  :disabled="loading"
                  prepend-inner-icon="mdi-school-outline"
                  return-object
                  @update:model-value="onClassChange"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="selectedSection"
                  :items="sections"
                  item-title="name"
                  item-value="id"
                  label="الفصل"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  :loading="loading"
                  :disabled="loading"
                  prepend-inner-icon="mdi-account-group-outline"
                  return-object
                  @update:model-value="onSectionChange"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="selectedSubject"
                  :items="subjects"
                  item-title="name"
                  item-value="id"
                  label="المادة"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  :loading="loading"
                  :disabled="loading"
                  prepend-inner-icon="mdi-book-outline"
                  return-object
                  @update:model-value="onSubjectChange"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="3">
                <v-menu
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="selectedDate"
                      label="التاريخ"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      v-bind="props"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="selectedDate"
                    @update:model-value="dateMenu = false"
                    @change="dateChanged"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>

            <!-- صف الفلاتر المتقدمة -->
            <v-expand-transition>
              <div v-if="showAdvancedFilters" class="mt-4">
                <v-divider class="mb-4"></v-divider>
                <v-row>
                  <v-col cols="12" sm="4">
                    <v-select
                      v-model="attendanceFilter"
                      :items="attendanceFilterOptions"
                      label="تصفية الحضور"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      prepend-inner-icon="mdi-account-check-outline"
                      @update:model-value="applyFilters"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-select
                      v-model="assignmentFilter"
                      :items="assignmentFilterOptions"
                      label="تصفية الواجبات"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      prepend-inner-icon="mdi-clipboard-check-outline"
                      @update:model-value="applyFilters"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-select
                      v-model="gradeFilter"
                      :items="gradeFilterOptions"
                      label="تصفية الدرجات"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      prepend-inner-icon="mdi-school-outline"
                      @update:model-value="applyFilters"
                    ></v-select>
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>

            <!-- أزرار الفلاتر -->
            <div class="d-flex justify-end mt-4">
              <v-btn
                variant="text"
                color="primary"
                @click="showAdvancedFilters = !showAdvancedFilters"
                class="me-2"
              >
                {{ showAdvancedFilters ? 'إخفاء الفلاتر المتقدمة' : 'عرض الفلاتر المتقدمة' }}
                <v-icon end>{{ showAdvancedFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
              <v-btn
                variant="outlined"
                color="error"
                @click="resetFilters"
                prepend-icon="mdi-filter-remove"
              >
                إعادة تعيين الفلاتر
              </v-btn>
            </div>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>

    <!-- بطاقة معلومات التاريخ والمادة والطلاب -->
    <v-card class="info-card mb-4 rounded-lg" elevation="2">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" sm="4">
            <div class="d-flex align-center">
              <v-icon size="large" color="primary" class="me-2">mdi-calendar-today</v-icon>
              <div>
                <div class="text-subtitle-1 font-weight-bold">التاريخ</div>
                <div class="text-body-1">{{ formatDate(selectedDate) }}</div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" sm="4">
            <div class="d-flex align-center">
              <v-icon size="large" color="primary" class="me-2">mdi-book-open-variant</v-icon>
              <div>
                <div class="text-subtitle-1 font-weight-bold">المادة</div>
                <div class="text-body-1">{{ selectedSubject?.name || 'لم يتم اختيار مادة' }}</div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" sm="4">
            <div class="d-flex align-center">
              <v-icon size="large" color="primary" class="me-2">mdi-account-group</v-icon>
              <div>
                <div class="text-subtitle-1 font-weight-bold">الطلاب</div>
                <div class="text-body-1 d-flex align-center">
                  <v-chip color="primary" variant="outlined" size="small" class="me-2">
                    {{ students.length }}
                  </v-chip>
                  <span>طالب</span>
                  <v-chip v-if="searchQuery" color="info" variant="outlined" size="small" class="me-2 ms-2">
                    <v-icon start size="x-small">mdi-magnify</v-icon>
                    بحث: {{ searchQuery }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- محتوى الصفحة الرئيسي - جدول الطلاب -->
    <v-card class="content-card mb-4 rounded-lg" elevation="2">
      <v-card-title class="d-flex justify-space-between align-center py-3 px-4">
        <span class="text-h6">قائمة الطلاب والدرجات</span>
        <div>
          <v-btn
            color="primary"
            variant="text"
            prepend-icon="mdi-refresh"
            @click="fetchStudents"
            :loading="loading"
            :disabled="loading"
            class="me-2"
          >
            تحديث
          </v-btn>
          <v-btn
            color="success"
            variant="outlined"
            prepend-icon="mdi-content-save"
            @click="saveAllGrades"
            :loading="saving"
            :disabled="saving || loading"
          >
            حفظ الدرجات
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-0">
        <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

        <div v-if="students.length === 0 && !loading" class="text-center pa-6">
          <v-icon size="64" color="primary">mdi-clipboard-text-outline</v-icon>
          <h3 class="mt-4">لا يوجد طلاب</h3>
          <p class="text-body-1 mt-2">اختر الصف والفصل والمادة لعرض بيانات الطلاب</p>
        </div>

        <div v-else-if="!loading" class="grades-table-container">
          <!-- جدول الطلاب والدرجات -->
          <v-table class="grades-table" fixed-header height="450px">
            <thead>
              <tr>
                <th class="text-right">الطالب</th>
                <th class="text-center">الحضور</th>
                <th class="text-center">النظري (15)</th>
                <th class="text-center">العملي (5)</th>
                <th class="text-center">الواجبات (10)</th>
                <th class="text-center">المشاركة (10)</th>
                <th class="text-center">القرآن (20)</th>
                <th class="text-center">النهائي (40)</th>
                <th class="text-center">المجموع (100)</th>
                <th class="text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in students" :key="student.id" :class="{'highlight-row': student.id === selectedStudentId}">
                <!-- الطالب -->
                <td>
                  <div class="d-flex align-center">
                    <v-avatar size="36" :color="!student.image ? 'primary' : undefined" class="me-2">
                      <img v-if="student.image" :src="student.image" alt="Student" @error="handleImageError(student)" />
                      <span v-else class="white--text">{{ getInitials(student.name) }}</span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ student.name }}</div>
                      <div class="text-caption text-grey">{{ student.class_name }} - {{ student.section }}</div>
                    </div>
                  </div>
                </td>

                <!-- الحضور -->
                <td class="text-center">
                  <v-chip
                    :color="student.attendance === 'present' ? 'success' : 'error'"
                    size="small"
                    variant="outlined"
                    @click="toggleAttendance(student)"
                  >
                    {{ student.attendance === 'present' ? 'حاضر' : 'غائب' }}
                  </v-chip>
                </td>

                <!-- النظري -->
                <td class="text-center">
                  <v-text-field
                    v-model="student.theory"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="grade-input"
                    min="0"
                    max="15"
                    @update:model-value="validateGrade(student, 'theory', 15)"
                  ></v-text-field>
                </td>

                <!-- العملي -->
                <td class="text-center">
                  <v-text-field
                    v-model="student.practical"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="grade-input"
                    min="0"
                    max="5"
                    @update:model-value="validateGrade(student, 'practical', 5)"
                  ></v-text-field>
                </td>

                <!-- الواجبات -->
                <td class="text-center">
                  <v-text-field
                    v-model="student.homework"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="grade-input"
                    min="0"
                    max="10"
                    @update:model-value="validateGrade(student, 'homework', 10)"
                  ></v-text-field>
                </td>

                <!-- المشاركة -->
                <td class="text-center">
                  <v-text-field
                    v-model="student.participation"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="grade-input"
                    min="0"
                    max="10"
                    @update:model-value="validateGrade(student, 'participation', 10)"
                  ></v-text-field>
                </td>

                <!-- القرآن -->
                <td class="text-center">
                  <v-text-field
                    v-model="student.quran"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="grade-input"
                    min="0"
                    max="20"
                    @update:model-value="validateGrade(student, 'quran', 20)"
                  ></v-text-field>
                </td>

                <!-- النهائي -->
                <td class="text-center">
                  <v-text-field
                    v-model="student.final"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="grade-input"
                    min="0"
                    max="40"
                    @update:model-value="validateGrade(student, 'final', 40)"
                  ></v-text-field>
                </td>

                <!-- المجموع -->
                <td class="text-center">
                  <v-chip
                    :color="getGradeColor(calculateTotal(student))"
                    variant="elevated"
                    class="font-weight-bold"
                  >
                    {{ calculateTotal(student) }}
                  </v-chip>
                </td>

                <!-- الإجراءات -->
                <td class="text-center">
                  <v-btn
                    icon
                    variant="text"
                    color="primary"
                    size="small"
                    @click="showStudentDetails(student)"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    color="info"
                    size="small"
                    @click="addNote(student)"
                  >
                    <v-icon>mdi-note-edit-outline</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>

    <!-- بطاقة إدارة الواجبات -->
    <v-card class="assignments-card mb-4 rounded-lg" elevation="2">
      <v-card-title class="d-flex justify-space-between align-center py-3 px-4 bg-primary text-white rounded-t-lg">
        <div class="d-flex align-center">
          <v-icon size="large" class="me-2">mdi-clipboard-list-outline</v-icon>
          <span class="text-h6">إدارة الواجبات</span>
        </div>
        <v-btn
          color="white"
          variant="outlined"
          prepend-icon="mdi-plus"
          @click="openNewAssignmentDialog"
        >
          واجب جديد
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-progress-linear v-if="loadingAssignments" indeterminate color="primary"></v-progress-linear>

        <div v-if="assignments.length === 0 && !loadingAssignments" class="text-center pa-4">
          <v-icon size="48" color="primary">mdi-clipboard-text-outline</v-icon>
          <h3 class="mt-2">لا يوجد واجبات</h3>
          <p class="text-body-1 mt-2">لم يتم إنشاء أي واجبات لهذه المادة بعد</p>
        </div>

        <div v-else-if="!loadingAssignments" class="assignments-list">
          <v-row>
            <v-col v-for="assignment in assignments" :key="assignment.id" cols="12" sm="6" md="4">
              <v-card variant="outlined" class="assignment-card" :class="{'active-assignment': assignment.id === currentAssignment?.id}">
                <v-card-item>
                  <template v-slot:prepend>
                    <v-avatar color="primary" variant="tonal">
                      <v-icon>mdi-clipboard-check-outline</v-icon>
                    </v-avatar>
                  </template>
                  <v-card-title>{{ assignment.title }}</v-card-title>
                  <v-card-subtitle>
                    <v-icon size="small" class="me-1">mdi-calendar</v-icon>
                    {{ formatDate(assignment.due_date) }}
                  </v-card-subtitle>
                </v-card-item>

                <v-card-text>
                  <p class="text-body-2">{{ assignment.description }}</p>
                  <div class="d-flex align-center mt-2">
                    <v-icon size="small" color="primary" class="me-1">mdi-star</v-icon>
                    <span class="text-body-2">الدرجة: {{ assignment.score }}</span>
                  </div>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-btn
                    variant="text"
                    color="primary"
                    @click="selectAssignment(assignment)"
                  >
                    <v-icon start>mdi-check-circle</v-icon>
                    تحديد
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    icon
                    variant="text"
                    color="info"
                    @click="editAssignment(assignment)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    @click="confirmDeleteAssignment(assignment)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- نافذة إنشاء واجب جديد -->
    <v-dialog v-model="assignmentDialog.show" max-width="600">
      <v-card>
        <v-card-title class="bg-primary text-white">
          {{ assignmentDialog.isEdit ? 'تعديل واجب' : 'إنشاء واجب جديد' }}
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="assignmentForm" @submit.prevent="saveAssignment">
            <v-text-field
              v-model="assignmentDialog.data.title"
              label="عنوان الواجب"
              variant="outlined"
              :rules="[v => !!v || 'العنوان مطلوب']"
              required
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="assignmentDialog.data.description"
              label="وصف الواجب"
              variant="outlined"
              :rules="[v => !!v || 'الوصف مطلوب']"
              required
              class="mb-4"
            ></v-textarea>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="assignmentDialog.data.score"
                  label="الدرجة"
                  type="number"
                  variant="outlined"
                  :rules="[v => !!v || 'الدرجة مطلوبة', v => v > 0 || 'يجب أن تكون الدرجة أكبر من صفر']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-menu
                  v-model="assignmentDialog.dateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="assignmentDialog.data.due_date"
                      label="تاريخ الاستحقاق"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      v-bind="props"
                      variant="outlined"
                      :rules="[v => !!v || 'تاريخ الاستحقاق مطلوب']"
                      required
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="assignmentDialog.data.due_date"
                    @update:model-value="assignmentDialog.dateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="assignmentDialog.show = false"
          >
            إلغاء
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="saveAssignment"
            :loading="assignmentDialog.loading"
            :disabled="assignmentDialog.loading"
          >
            {{ assignmentDialog.isEdit ? 'تحديث' : 'إنشاء' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- نافذة تأكيد الحذف -->
    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card>
        <v-card-title :class="`bg-${confirmDialog.color} text-white`">
          <v-icon start :icon="confirmDialog.icon" class="me-2"></v-icon>
          {{ confirmDialog.title }}
        </v-card-title>

        <v-card-text class="pa-4 pt-5">
          {{ confirmDialog.message }}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="confirmDialog.show = false"
          >
            إلغاء
          </v-btn>
          <v-btn
            :color="confirmDialog.color"
            variant="elevated"
            @click="confirmDialog.confirm()"
            :loading="confirmDialog.loading"
            :disabled="confirmDialog.loading"
          >
            تأكيد
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- رسالة التنبيه -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">إغلاق</v-btn>
      </template>
    </v-snackbar>

    <!-- نافذة تفاصيل الطالب -->
    <v-dialog v-model="studentDetailsDialog.show" max-width="900" scrollable>
      <v-card v-if="studentDetailsDialog.student">
        <v-toolbar :color="studentDetailsDialog.student.attendance === 'present' ? 'primary' : 'error'" dark>
          <v-toolbar-title>
            <div class="d-flex align-center">
              <v-avatar size="40" class="me-3" :color="!studentDetailsDialog.student.image ? 'white' : undefined">
                <img
                  v-if="studentDetailsDialog.student.image"
                  :src="studentDetailsDialog.student.image"
                  alt="Student"
                  @error="handleStudentDetailsImageError"
                />
                <span v-else :class="{'text-primary': true}">
                  {{ getInitials(studentDetailsDialog.student.name) }}
                </span>
              </v-avatar>
              <div>
                <div class="text-h6">{{ studentDetailsDialog.student.name }}</div>
                <div class="text-caption">
                  {{ studentDetailsDialog.student.class_name }} - {{ studentDetailsDialog.student.section }}
                </div>
              </div>
            </div>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="studentDetailsDialog.show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-4">
          <v-tabs v-model="studentDetailsDialog.activeTab" bg-color="transparent" grow>
            <v-tab value="grades">
              <v-icon start>mdi-clipboard-text</v-icon>
              الدرجات
            </v-tab>
            <v-tab value="attendance">
              <v-icon start>mdi-calendar-check</v-icon>
              الحضور
            </v-tab>
            <v-tab value="assignments">
              <v-icon start>mdi-clipboard-list</v-icon>
              الواجبات
            </v-tab>
            <v-tab value="notes">
              <v-icon start>mdi-note-text</v-icon>
              الملاحظات
            </v-tab>
          </v-tabs>

          <v-window v-model="studentDetailsDialog.activeTab" class="mt-4">
            <!-- قسم الدرجات -->
            <v-window-item value="grades">
              <div class="student-grades-section">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="text-subtitle-1 font-weight-bold">
                        <v-icon start color="primary">mdi-pencil</v-icon>
                        درجات المادة
                      </v-card-title>
                      <v-divider></v-divider>
                      <v-card-text>
                        <v-row>
                          <v-col cols="6">
                            <v-text-field
                              v-model="studentDetailsDialog.student.theory"
                              label="النظري (15)"
                              type="number"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="mb-3"
                              min="0"
                              max="15"
                              @update:model-value="validateGrade(studentDetailsDialog.student, 'theory', 15)"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="6">
                            <v-text-field
                              v-model="studentDetailsDialog.student.practical"
                              label="العملي (5)"
                              type="number"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="mb-3"
                              min="0"
                              max="5"
                              @update:model-value="validateGrade(studentDetailsDialog.student, 'practical', 5)"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="6">
                            <v-text-field
                              v-model="studentDetailsDialog.student.homework"
                              label="الواجبات (10)"
                              type="number"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="mb-3"
                              min="0"
                              max="10"
                              @update:model-value="validateGrade(studentDetailsDialog.student, 'homework', 10)"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="6">
                            <v-text-field
                              v-model="studentDetailsDialog.student.participation"
                              label="المشاركة (10)"
                              type="number"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="mb-3"
                              min="0"
                              max="10"
                              @update:model-value="validateGrade(studentDetailsDialog.student, 'participation', 10)"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="6">
                            <v-text-field
                              v-model="studentDetailsDialog.student.quran"
                              label="القرآن (20)"
                              type="number"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="mb-3"
                              min="0"
                              max="20"
                              @update:model-value="validateGrade(studentDetailsDialog.student, 'quran', 20)"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="6">
                            <v-text-field
                              v-model="studentDetailsDialog.student.final"
                              label="النهائي (40)"
                              type="number"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="mb-3"
                              min="0"
                              max="40"
                              @update:model-value="validateGrade(studentDetailsDialog.student, 'final', 40)"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="text-subtitle-1 font-weight-bold">
                        <v-icon start color="primary">mdi-chart-box</v-icon>
                        ملخص الدرجات
                      </v-card-title>
                      <v-divider></v-divider>
                      <v-card-text class="text-center">
                        <v-sheet class="mx-auto mb-4" max-width="300">
                          <v-progress-circular
                            :model-value="calculatePercentage(studentDetailsDialog.student)"
                            :color="getGradeColor(calculateTotal(studentDetailsDialog.student))"
                            :size="150"
                            :width="15"
                          >
                            <div class="text-h5 font-weight-bold">
                              {{ calculateTotal(studentDetailsDialog.student) }}
                            </div>
                            <div class="text-caption">من 100</div>
                          </v-progress-circular>
                        </v-sheet>

                        <v-chip
                          :color="getGradeColor(calculateTotal(studentDetailsDialog.student))"
                          size="large"
                          class="font-weight-bold"
                        >
                          {{ getGradeText(calculateTotal(studentDetailsDialog.student)) }}
                        </v-chip>
                      </v-card-text>
                    </v-card>

                    <v-card variant="outlined">
                      <v-card-title class="text-subtitle-1 font-weight-bold">
                        <v-icon start color="primary">mdi-account-check</v-icon>
                        حالة الحضور
                      </v-card-title>
                      <v-divider></v-divider>
                      <v-card-text>
                        <v-select
                          v-model="studentDetailsDialog.student.attendance"
                          :items="[
                            { title: 'حاضر', value: 'present' },
                            { title: 'غائب', value: 'absent' }
                          ]"
                          item-title="title"
                          item-value="value"
                          label="حالة الحضور"
                          variant="outlined"
                          density="compact"
                          hide-details
                          :color="studentDetailsDialog.student.attendance === 'present' ? 'success' : 'error'"
                        ></v-select>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <!-- قسم الحضور -->
            <v-window-item value="attendance">
              <div class="student-attendance-section">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1 font-weight-bold">
                    <v-icon start color="primary">mdi-calendar-month</v-icon>
                    سجل الحضور
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <div v-if="studentAttendanceHistory.length === 0" class="text-center pa-4">
                      <v-icon size="48" color="grey-lighten-1">mdi-calendar-blank</v-icon>
                      <p class="mt-2 text-body-1">لا يوجد سجل حضور متاح</p>
                    </div>
                    <div v-else>
                      <v-list lines="two">
                        <v-list-item
                          v-for="(record, index) in studentAttendanceHistory"
                          :key="index"
                          :title="formatDate(record.date)"
                          :subtitle="record.status === 'present' ? 'حاضر' : 'غائب'"
                          :prepend-icon="record.status === 'present' ? 'mdi-check-circle' : 'mdi-close-circle'"
                          :color="record.status === 'present' ? 'success' : 'error'"
                        ></v-list-item>
                      </v-list>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-window-item>

            <!-- قسم الواجبات -->
            <v-window-item value="assignments">
              <div class="student-assignments-section">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1 font-weight-bold">
                    <v-icon start color="primary">mdi-clipboard-list</v-icon>
                    واجبات الطالب
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <div v-if="assignments.length === 0" class="text-center pa-4">
                      <v-icon size="48" color="grey-lighten-1">mdi-clipboard-text</v-icon>
                      <p class="mt-2 text-body-1">لا يوجد واجبات متاحة</p>
                    </div>
                    <div v-else>
                      <v-list lines="two">
                        <v-list-item
                          v-for="assignment in assignments"
                          :key="assignment.id"
                          :title="assignment.title"
                          :subtitle="formatDate(assignment.due_date)"
                        >
                          <template v-slot:prepend>
                            <v-icon
                              :color="getAssignmentStatusColor(studentDetailsDialog.student, assignment)"
                            >
                              {{ getAssignmentStatusIcon(studentDetailsDialog.student, assignment) }}
                            </v-icon>
                          </template>
                          <template v-slot:append>
                            <v-chip
                              :color="getAssignmentStatusColor(studentDetailsDialog.student, assignment)"
                              size="small"
                              variant="outlined"
                            >
                              {{ getAssignmentStatusText(studentDetailsDialog.student, assignment) }}
                            </v-chip>
                          </template>
                        </v-list-item>
                      </v-list>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-window-item>

            <!-- قسم الملاحظات -->
            <v-window-item value="notes">
              <div class="student-notes-section">
                <v-card variant="outlined">
                  <v-card-title class="d-flex justify-space-between align-center">
                    <div class="text-subtitle-1 font-weight-bold">
                      <v-icon start color="primary">mdi-note-text</v-icon>
                      ملاحظات الطالب
                    </div>
                    <v-btn
                      color="primary"
                      variant="text"
                      prepend-icon="mdi-plus"
                      @click="openAddNoteDialog(studentDetailsDialog.student)"
                    >
                      إضافة ملاحظة
                    </v-btn>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <div v-if="studentNotes.length === 0" class="text-center pa-4">
                      <v-icon size="48" color="grey-lighten-1">mdi-note-outline</v-icon>
                      <p class="mt-2 text-body-1">لا يوجد ملاحظات متاحة</p>
                    </div>
                    <div v-else>
                      <v-timeline side="end" align="start" truncate-line="both">
                        <v-timeline-item
                          v-for="(note, index) in studentNotes"
                          :key="index"
                          :dot-color="note.type === 'positive' ? 'success' : 'warning'"
                          size="small"
                        >
                          <template v-slot:opposite>
                            <div class="text-caption">{{ formatDate(note.date) }}</div>
                          </template>
                          <v-card variant="outlined" class="mb-2">
                            <v-card-title class="text-subtitle-2 py-2">
                              <v-icon
                                :color="note.type === 'positive' ? 'success' : 'warning'"
                                size="small"
                                class="me-1"
                              >
                                {{ note.type === 'positive' ? 'mdi-thumb-up' : 'mdi-alert-circle' }}
                              </v-icon>
                              {{ note.type === 'positive' ? 'ملاحظة إيجابية' : 'ملاحظة سلبية' }}
                            </v-card-title>
                            <v-card-text class="py-2">
                              {{ note.content }}
                            </v-card-text>
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn
                                variant="text"
                                color="error"
                                size="small"
                                @click="deleteNote(index)"
                              >
                                <v-icon>mdi-delete</v-icon>
                                حذف
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-timeline-item>
                      </v-timeline>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="studentDetailsDialog.show = false"
          >
            إغلاق
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="saveStudentDetails"
            :loading="studentDetailsDialog.loading"
            :disabled="studentDetailsDialog.loading"
          >
            حفظ التغييرات
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- نافذة إضافة ملاحظة -->
    <v-dialog v-model="noteDialog.show" max-width="500">
      <v-card>
        <v-card-title class="bg-primary text-white">
          إضافة ملاحظة للطالب
        </v-card-title>

        <v-card-text class="pa-4 pt-5">
          <v-select
            v-model="noteDialog.type"
            :items="[
              { title: 'ملاحظة إيجابية', value: 'positive' },
              { title: 'ملاحظة سلبية', value: 'negative' }
            ]"
            item-title="title"
            item-value="value"
            label="نوع الملاحظة"
            variant="outlined"
            :color="noteDialog.type === 'positive' ? 'success' : 'warning'"
            class="mb-4"
          ></v-select>

          <v-textarea
            v-model="noteDialog.content"
            label="محتوى الملاحظة"
            variant="outlined"
            :rules="[v => !!v || 'محتوى الملاحظة مطلوب']"
            rows="4"
            auto-grow
          ></v-textarea>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="noteDialog.show = false"
          >
            إلغاء
          </v-btn>
          <v-btn
            :color="noteDialog.type === 'positive' ? 'success' : 'warning'"
            variant="elevated"
            @click="addNote"
            :loading="noteDialog.loading"
            :disabled="noteDialog.loading || !noteDialog.content"
          >
            إضافة
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/services/apiConfig'
import { useGradesStore } from '@/stores/gradesStore'
import { getInitials } from '@/utils/imageUtils'

// متغيرات التحكم في الواجهة
const showFilters = ref(true)
const showAdvancedFilters = ref(false)
const loading = ref(false)
const saving = ref(false)
const loadingAssignments = ref(false)
const errorLoading = ref(false)
const errorMessage = ref('')
const dateMenu = ref(false)
const selectedDate = ref(new Date().toISOString().split('T')[0]) // التاريخ المحدد بتنسيق YYYY-MM-DD
const selectedStudentId = ref(null) // معرف الطالب المحدد

// متغيرات نافذة تفاصيل الطالب
const studentDetailsDialog = ref({
  show: false,
  loading: false,
  activeTab: 'grades',
  student: null
})

// متغيرات نافذة إضافة ملاحظة
const noteDialog = ref({
  show: false,
  loading: false,
  type: 'positive',
  content: '',
  studentId: null
})

// بيانات الطالب
const studentNotes = ref([])
const studentAttendanceHistory = ref([])

// متغيرات الواجبات
const assignments = ref([])
const currentAssignment = ref(null)

// متغيرات نافذة الواجب
const assignmentDialog = ref({
  show: false,
  isEdit: false,
  loading: false,
  dateMenu: false,
  data: {
    id: null,
    title: '',
    description: '',
    score: 10,
    due_date: new Date().toISOString().split('T')[0],
    subject: null
  }
})

// متغيرات نافذة التأكيد
const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  color: 'primary',
  icon: 'mdi-help-circle',
  loading: false,
  confirm: () => {}
})

// متغيرات رسالة التنبيه
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// متغيرات البحث والتصفية
const searchQuery = ref('')
const attendanceFilter = ref('all')
const assignmentFilter = ref('all')
const gradeFilter = ref('all')

// خيارات التصفية
const attendanceFilterOptions = [
  { title: 'الكل', value: 'all' },
  { title: 'الحاضرون', value: 'present' },
  { title: 'الغائبون', value: 'absent' }
]

const assignmentFilterOptions = [
  { title: 'الكل', value: 'all' },
  { title: 'تم التسليم', value: 'submitted' },
  { title: 'لم يتم التسليم', value: 'not_submitted' }
]

const gradeFilterOptions = [
  { title: 'الكل', value: 'all' },
  { title: 'أعلى من 90', value: 'above_90' },
  { title: 'بين 70 و 90', value: 'between_70_90' },
  { title: 'بين 50 و 70', value: 'between_50_70' },
  { title: 'أقل من 50', value: 'below_50' }
]

// متغيرات البيانات الأساسية
const classes = ref([])
const sections = ref([])
const subjects = ref([])
const students = ref([])

// متغيرات الاختيار
const selectedClass = ref(null)
const selectedSection = ref(null)
const selectedSubject = ref(null)

// استخدام متجر الدرجات
const gradesStore = useGradesStore()

// دالة جلب الصفوف
const fetchClasses = async () => {
  try {
    loading.value = true
    const response = await api.get('classes/')
    classes.value = response.data || []
    console.log('Fetched classes:', classes.value)

    if (classes.value.length > 0) {
      selectedClass.value = classes.value[0]
    }
  } catch (error) {
    console.error('Error fetching classes:', error)
    errorLoading.value = true
    errorMessage.value = 'حدث خطأ أثناء تحميل بيانات الصفوف'
  } finally {
    loading.value = false
  }
}

// دالة جلب الفصول
const fetchSections = async () => {
  try {
    loading.value = true
    const response = await api.get('sections/')
    sections.value = response.data || []
    console.log('Fetched sections:', sections.value)

    if (sections.value.length > 0) {
      selectedSection.value = sections.value[0]
    }
  } catch (error) {
    console.error('Error fetching sections:', error)
    errorLoading.value = true
    errorMessage.value = 'حدث خطأ أثناء تحميل بيانات الفصول'
  } finally {
    loading.value = false
  }
}

// دالة جلب المواد
const fetchSubjects = async () => {
  try {
    loading.value = true
    const response = await api.get('subjects/')
    subjects.value = response.data || []
    console.log('Fetched subjects:', subjects.value)

    if (subjects.value.length > 0) {
      selectedSubject.value = subjects.value[0]
    }
  } catch (error) {
    console.error('Error fetching subjects:', error)
    errorLoading.value = true
    errorMessage.value = 'حدث خطأ أثناء تحميل بيانات المواد'
  } finally {
    loading.value = false
  }
}

// دالة جلب الطلاب
const fetchStudents = async () => {
  if (!selectedClass.value || !selectedSection.value || !selectedSubject.value) return

  try {
    loading.value = true
    errorLoading.value = false
    errorMessage.value = ''

    // استخدام متجر الدرجات لجلب الطلاب
    const studentsData = await gradesStore.fetchStudentsByClassAndSection(
      selectedClass.value.id,
      selectedSection.value.id
    )

    console.log('Fetched students:', studentsData)
    console.log('Using date:', selectedDate.value)

    // إعداد قائمة الطلاب مع القيم الافتراضية
    const studentsWithGrades = await Promise.all(studentsData.map(async student => {
      // التعامل مع الصورة بشكل صحيح
      let imageUrl = null; // استخدام null لعرض الحرف الأول من الاسم
      if (student.image) {
        // استخدام image_url إذا كانت موجودة (من الخادم)
        if (student.image_url) {
          imageUrl = student.image_url;
        } else {
          // استخدام المسار الكامل للصورة
          imageUrl = student.image;
        }
      }

      // محاولة جلب الدرجات من الخادم
      let theory = null;
      let practical = null;
      let homework = null;
      let participation = null;
      let quran = null;
      let final = null;
      let attendance = 'present';
      let assignmentStatus = 'not_submitted';

      try {
        // جلب الدرجات من الخادم
        const grades = await gradesStore.getGradesByStudent(student.id);
        if (grades && grades.length > 0) {
          // البحث عن درجات المادة المحددة والتاريخ المحدد
          const subjectGrade = grades.find(g =>
            g.subject === selectedSubject.value.id &&
            g.date === selectedDate.value
          );

          if (subjectGrade) {
            theory = subjectGrade.theory;
            practical = subjectGrade.practical;
            homework = subjectGrade.homework;
            participation = subjectGrade.participation;
            quran = subjectGrade.quran;
            final = subjectGrade.final;
          }
        }

        // جلب حالة الحضور من الخادم
        const attendanceRecord = await gradesStore.getAttendanceByStudentAndDate(
          student.id,
          selectedDate.value
        );

        if (attendanceRecord) {
          attendance = attendanceRecord.status;
        }

        // جلب حالة تسليم الواجبات من الخادم
        if (currentAssignment.value) {
          const submission = await gradesStore.getSubmissionsByStudentAndAssignment(
            student.id,
            currentAssignment.value.id
          );

          if (submission) {
            assignmentStatus = 'submitted';
          }
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        // في حالة الخطأ، نستخدم قيم عشوائية للعرض التجريبي
        theory = Math.floor(Math.random() * 15);
        practical = Math.floor(Math.random() * 5);
        homework = Math.floor(Math.random() * 10);
        participation = Math.floor(Math.random() * 10);
        quran = Math.floor(Math.random() * 20);
        final = Math.floor(Math.random() * 40);
        attendance = Math.random() > 0.2 ? 'present' : 'absent';
        assignmentStatus = Math.random() > 0.3 ? 'submitted' : 'not_submitted';
      }

      // حساب المجموع الكلي
      const total = (theory || 0) + (practical || 0) + (homework || 0) +
                    (participation || 0) + (quran || 0) + (final || 0);

      return {
        id: student.id,
        name: student.name,
        class_id: student.class_name,
        section_id: student.section,
        class_name: student.class_name_display || '',
        section: student.section_display || '',
        image: imageUrl,
        theory,
        practical,
        homework,
        participation,
        quran,
        final,
        attendance,
        assignmentStatus,
        noteContent: '',
        noteType: 'positive',
        total
      }
    }))

    // تطبيق الفلاتر على الطلاب
    let filteredStudents = [...studentsWithGrades];

    // تطبيق فلتر البحث
    if (searchQuery.value) {
      filteredStudents = filteredStudents.filter(student =>
        student.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }

    // تطبيق فلتر الحضور
    if (attendanceFilter.value !== 'all') {
      filteredStudents = filteredStudents.filter(student =>
        student.attendance === attendanceFilter.value
      );
    }

    // تطبيق فلتر الواجبات
    if (assignmentFilter.value !== 'all') {
      filteredStudents = filteredStudents.filter(student =>
        student.assignmentStatus === assignmentFilter.value
      );
    }

    // تطبيق فلتر الدرجات
    if (gradeFilter.value !== 'all') {
      filteredStudents = filteredStudents.filter(student => {
        const total = student.total;

        switch (gradeFilter.value) {
          case 'above_90':
            return total >= 90;
          case 'between_70_90':
            return total >= 70 && total < 90;
          case 'between_50_70':
            return total >= 50 && total < 70;
          case 'below_50':
            return total < 50;
          default:
            return true;
        }
      });
    }

    students.value = filteredStudents;
  } catch (error) {
    console.error('Error fetching students:', error)
    errorLoading.value = true
    errorMessage.value = 'حدث خطأ أثناء تحميل بيانات الطلاب'
  } finally {
    loading.value = false
  }
}

// دوال التصفية والبحث

// دالة تطبيق الفلاتر
const applyFilters = async () => {
  console.log('Applying filters:', {
    search: searchQuery.value,
    attendance: attendanceFilter.value,
    assignment: assignmentFilter.value,
    grade: gradeFilter.value
  })

  // إعادة تحميل الطلاب مع تطبيق الفلاتر الجديدة
  await fetchStudents()
}

// دالة مسح البحث
const clearSearch = async () => {
  searchQuery.value = ''
  await applyFilters()
}

// دالة إعادة تعيين الفلاتر
const resetFilters = async () => {
  searchQuery.value = ''
  attendanceFilter.value = 'all'
  assignmentFilter.value = 'all'
  gradeFilter.value = 'all'
  await applyFilters()
}

// دوال معالجة تغيير الفلاتر الرئيسية
const onClassChange = async (newValue) => {
  if (newValue) {
    console.log('Class changed to:', newValue.name)
    await fetchStudents()
  }
}

const onSectionChange = async (newValue) => {
  if (newValue) {
    console.log('Section changed to:', newValue.name)
    await fetchStudents()
  }
}

const onSubjectChange = async (newValue) => {
  if (newValue) {
    console.log('Subject changed to:', newValue.name)
    await fetchStudents()
    // جلب الواجبات الجديدة للمادة المحددة
    await fetchAssignments()
  }
}

// مراقبة تغيير التاريخ
watch(selectedDate, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    console.log(`تغيير التاريخ من ${oldValue} إلى ${newValue}`)
    await fetchStudents()
  }
})

// دالة معالجة تغيير التاريخ
const dateChanged = async () => {
  console.log('تغيير التاريخ إلى:', selectedDate.value)
  // تحديث البيانات بناءً على التاريخ الجديد
  await fetchStudents()
}

// دالة تنسيق التاريخ بالعربية
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(date)
}

// دالة حساب مجموع الدرجات
const calculateTotal = (student) => {
  // تحويل القيم إلى أرقام والتأكد من أنها ليست قيماً فارغة
  const theory = parseInt(student.theory) || 0
  const practical = parseInt(student.practical) || 0
  const homework = parseInt(student.homework) || 0
  const participation = parseInt(student.participation) || 0
  const quran = parseInt(student.quran) || 0
  const final = parseInt(student.final) || 0

  // حساب المجموع
  return theory + practical + homework + participation + quran + final
}

// دالة الحصول على لون الدرجة بناءً على المجموع
const getGradeColor = (total) => {
  if (total >= 90) return 'success'
  if (total >= 70) return 'info'
  if (total >= 50) return 'warning'
  return 'error'
}

// دالة الحصول على نص الدرجة بناءً على المجموع
const getGradeText = (total) => {
  if (total >= 90) return 'ممتاز'
  if (total >= 80) return 'جيد جداً'
  if (total >= 70) return 'جيد'
  if (total >= 60) return 'مقبول'
  if (total >= 50) return 'ضعيف'
  return 'راسب'
}

// دالة حساب النسبة المئوية للدرجة
const calculatePercentage = (student) => {
  return calculateTotal(student)
}

// دالة الحصول على لون حالة الواجب
const getAssignmentStatusColor = (student, assignment) => {
  // محاكاة حالة الواجب بناءً على حالة تسليم الطالب
  return student.assignmentStatus === 'submitted' ? 'success' : 'error'
}

// دالة الحصول على أيقونة حالة الواجب
const getAssignmentStatusIcon = (student, assignment) => {
  // محاكاة حالة الواجب بناءً على حالة تسليم الطالب
  return student.assignmentStatus === 'submitted' ? 'mdi-check-circle' : 'mdi-clock-alert'
}

// دالة الحصول على نص حالة الواجب
const getAssignmentStatusText = (student, assignment) => {
  // محاكاة حالة الواجب بناءً على حالة تسليم الطالب
  return student.assignmentStatus === 'submitted' ? 'تم التسليم' : 'لم يتم التسليم'
}

// دالة التحقق من صحة الدرجة
const validateGrade = (student, field, maxValue) => {
  // التأكد من أن القيمة رقمية
  let value = parseInt(student[field])

  // إذا كانت القيمة غير صالحة، استخدم 0
  if (isNaN(value)) {
    student[field] = 0
    return
  }

  // التأكد من أن القيمة ضمن النطاق المسموح
  if (value < 0) {
    student[field] = 0
  } else if (value > maxValue) {
    student[field] = maxValue
  }
}

// دالة تبديل حالة الحضور
const toggleAttendance = (student) => {
  student.attendance = student.attendance === 'present' ? 'absent' : 'present'
}

// دالة عرض تفاصيل الطالب
const showStudentDetails = (student) => {
  selectedStudentId.value = student.id
  console.log('Show details for student:', student.name)

  // نسخ بيانات الطالب للنافذة
  studentDetailsDialog.value.student = { ...student }
  studentDetailsDialog.value.show = true
  studentDetailsDialog.value.activeTab = 'grades'

  // جلب بيانات الطالب الإضافية
  fetchStudentAttendanceHistory(student.id)
  fetchStudentNotes(student.id)
}

// دالة حفظ تفاصيل الطالب
const saveStudentDetails = async () => {
  try {
    studentDetailsDialog.value.loading = true
    console.log('Saving student details:', studentDetailsDialog.value.student)

    // التحقق من وجود البيانات المطلوبة
    if (!studentDetailsDialog.value.student || !selectedSubject.value || !selectedDate.value) {
      showSnackbar('بيانات غير مكتملة', 'warning')
      return
    }

    try {
      // تحضير بيانات الدرجات
      const gradeTypes = [
        { type: 'theory', score: parseInt(studentDetailsDialog.value.student.theory) || 0, max_score: 15 },
        { type: 'practical', score: parseInt(studentDetailsDialog.value.student.practical) || 0, max_score: 5 },
        { type: 'homework', score: parseInt(studentDetailsDialog.value.student.homework) || 0, max_score: 10 },
        { type: 'participation', score: parseInt(studentDetailsDialog.value.student.participation) || 0, max_score: 10 },
        { type: 'quran', score: parseInt(studentDetailsDialog.value.student.quran) || 0, max_score: 20 },
        { type: 'final', score: parseInt(studentDetailsDialog.value.student.final) || 0, max_score: 40 }
      ]

      // حفظ كل نوع من الدرجات على حدة
      for (const gradeType of gradeTypes) {
        const gradeData = {
          student: studentDetailsDialog.value.student.id,
          subject: selectedSubject.value.id,
          date: selectedDate.value,
          type: gradeType.type,
          score: gradeType.score,
          max_score: gradeType.max_score
        }

        await gradesStore.saveGrade(gradeData)
      }

      // تحضير بيانات الحضور
      const attendanceData = {
        student: studentDetailsDialog.value.student.id,
        date: selectedDate.value,
        status: studentDetailsDialog.value.student.attendance,
        class_name: selectedClass.value.id,
        section: selectedSection.value.id,
        schedule: 1 // استخدام القيمة الافتراضية
      }

      // حفظ الحضور باستخدام متجر الدرجات
      await gradesStore.saveAttendance(attendanceData)

      // تحديث بيانات الطالب في الجدول
      const studentIndex = students.value.findIndex(s => s.id === studentDetailsDialog.value.student.id)
      if (studentIndex !== -1) {
        // تحديث البيانات المهمة فقط
        students.value[studentIndex].theory = studentDetailsDialog.value.student.theory
        students.value[studentIndex].practical = studentDetailsDialog.value.student.practical
        students.value[studentIndex].homework = studentDetailsDialog.value.student.homework
        students.value[studentIndex].participation = studentDetailsDialog.value.student.participation
        students.value[studentIndex].quran = studentDetailsDialog.value.student.quran
        students.value[studentIndex].final = studentDetailsDialog.value.student.final
        students.value[studentIndex].attendance = studentDetailsDialog.value.student.attendance

        // تحديث المجموع الكلي
        students.value[studentIndex].total = calculateTotal(students.value[studentIndex])
      }

      showSnackbar('تم حفظ بيانات الطالب بنجاح', 'success')
      studentDetailsDialog.value.show = false
    } catch (apiError) {
      console.error('API Error:', apiError)

      // التحقق من نوع الخطأ
      if (apiError.response) {
        // خطأ من الخادم
        const statusCode = apiError.response.status

        if (statusCode === 400) {
          showSnackbar('خطأ في البيانات المرسلة', 'error')
        } else if (statusCode === 401 || statusCode === 403) {
          showSnackbar('ليس لديك صلاحية لحفظ هذه البيانات', 'error')
        } else if (statusCode >= 500) {
          showSnackbar('حدث خطأ في الخادم', 'error')
        } else {
          showSnackbar('حدث خطأ أثناء حفظ بيانات الطالب', 'error')
        }
      } else if (apiError.request) {
        showSnackbar('لا يمكن الوصول إلى الخادم', 'error')
      } else {
        showSnackbar(`حدث خطأ غير متوقع: ${apiError.message}`, 'error')
      }

      throw apiError
    }
  } catch (error) {
    console.error('Error saving student details:', error)
    // لا نعرض رسالة خطأ هنا لأنها عرضت بالفعل في المستوى الأدنى
  } finally {
    studentDetailsDialog.value.loading = false
  }
}

// دالة جلب سجل حضور الطالب
const fetchStudentAttendanceHistory = async (studentId) => {
  try {
    console.log('Fetching attendance history for student:', studentId)

    // محاولة جلب سجل الحضور من الخادم
    // يمكن إضافة الاستدعاء الفعلي للخادم هنا
    // للآن نستخدم بيانات تجريبية

    const today = new Date()
    const history = []

    // إنشاء سجل حضور للأيام السابقة
    for (let i = 0; i < 10; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split('T')[0]

      // استخدام معرف الطالب لتوليد قيمة ثابتة للحضور
      const randomValue = (parseInt(studentId) + i) % 10
      const status = randomValue > 2 ? 'present' : 'absent'

      history.push({
        date: dateString,
        status: status
      })
    }

    studentAttendanceHistory.value = history
  } catch (error) {
    console.error('Error fetching attendance history:', error)
    studentAttendanceHistory.value = []
  }
}

// دالة جلب ملاحظات الطالب
const fetchStudentNotes = async (studentId) => {
  try {
    console.log('Fetching notes for student:', studentId)

    // محاولة جلب ملاحظات الطالب من الخادم
    // يمكن إضافة الاستدعاء الفعلي للخادم هنا
    // للآن نستخدم بيانات تجريبية

    // استخدام معرف الطالب لتحديد نوع الملاحظة
    const isPositive = parseInt(studentId) % 2 === 0

    const notes = [
      {
        type: isPositive ? 'positive' : 'negative',
        content: isPositive ?
          'متفوق في المادة ويشارك بشكل فعال في الصف' :
          'يحتاج إلى مزيد من الاهتمام بالواجبات المنزلية',
        date: new Date().toISOString().split('T')[0]
      },
      {
        type: !isPositive ? 'positive' : 'negative',
        content: !isPositive ?
          'ملتزم بالحضور والمواعيد' :
          'يحتاج إلى تحسين مستوى المشاركة في الصف',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]

    studentNotes.value = notes
  } catch (error) {
    console.error('Error fetching student notes:', error)
    studentNotes.value = []
  }
}

// دالة فتح نافذة إضافة ملاحظة
const openAddNoteDialog = (student) => {
  noteDialog.value = {
    show: true,
    loading: false,
    type: 'positive',
    content: '',
    studentId: student.id
  }
}

// دالة إضافة ملاحظة
const addNote = async () => {
  try {
    noteDialog.value.loading = true

    // التحقق من صحة البيانات
    if (!noteDialog.value.content) {
      showSnackbar('يرجى إدخال محتوى الملاحظة', 'warning')
      return
    }

    if (!noteDialog.value.studentId) {
      showSnackbar('لم يتم تحديد الطالب', 'warning')
      return
    }

    try {
      // إنشاء ملاحظة جديدة
      const newNote = {
        student: noteDialog.value.studentId,
        type: noteDialog.value.type,
        content: noteDialog.value.content,
        date: new Date().toISOString().split('T')[0]
      }

      // محاولة حفظ الملاحظة على الخادم
      // يمكن إضافة الاستدعاء الفعلي للخادم هنا
      // للآن نستخدم محاكاة الحفظ
      await new Promise(resolve => setTimeout(resolve, 500))

      // إضافة الملاحظة إلى القائمة
      studentNotes.value.unshift(newNote)

      showSnackbar('تمت إضافة الملاحظة بنجاح', 'success')
      noteDialog.value.show = false
    } catch (apiError) {
      console.error('API Error:', apiError)

      // التحقق من نوع الخطأ
      if (apiError.response) {
        // خطأ من الخادم
        const statusCode = apiError.response.status

        if (statusCode === 400) {
          showSnackbar('خطأ في بيانات الملاحظة', 'error')
        } else if (statusCode === 401 || statusCode === 403) {
          showSnackbar('ليس لديك صلاحية لإضافة ملاحظات', 'error')
        } else {
          showSnackbar('حدث خطأ أثناء إضافة الملاحظة', 'error')
        }
      } else if (apiError.request) {
        showSnackbar('لا يمكن الوصول إلى الخادم', 'error')
      } else {
        showSnackbar(`حدث خطأ غير متوقع: ${apiError.message}`, 'error')
      }

      throw apiError
    }
  } catch (error) {
    console.error('Error adding note:', error)
    // لا نعرض رسالة خطأ هنا لأنها عرضت بالفعل في المستوى الأدنى
  } finally {
    noteDialog.value.loading = false
  }
}

// دالة حذف ملاحظة
const deleteNote = async (index) => {
  try {
    // محاكاة الحذف
    await new Promise(resolve => setTimeout(resolve, 300))

    // حذف الملاحظة من القائمة
    studentNotes.value.splice(index, 1)

    showSnackbar('تم حذف الملاحظة بنجاح', 'success')
  } catch (error) {
    console.error('Error deleting note:', error)
    showSnackbar('حدث خطأ أثناء حذف الملاحظة', 'error')
  }
}

// دالة معالجة خطأ صورة الطالب في نافذة التفاصيل
const handleStudentDetailsImageError = () => {
  if (studentDetailsDialog.value.student) {
    studentDetailsDialog.value.student.image = null
  }
}

// دالة معالجة خطأ صورة الطالب في الجدول
const handleImageError = (student) => {
  student.image = null
}

// دالة حفظ جميع الدرجات
const saveAllGrades = async () => {
  try {
    saving.value = true
    console.log('Saving all grades...')

    // التحقق من وجود البيانات المطلوبة
    if (!selectedSubject.value || !selectedClass.value || !selectedSection.value || !selectedDate.value) {
      showSnackbar('يرجى التأكد من اختيار الصف والفصل والمادة والتاريخ', 'warning')
      return
    }

    // التحقق من وجود طلاب
    if (students.value.length === 0) {
      showSnackbar('لا يوجد طلاب لحفظ الدرجات', 'warning')
      return
    }

    // تحضير البيانات للإرسال
    const gradesData = students.value.map(student => ({
      student: student.id,
      subject: selectedSubject.value.id,
      date: selectedDate.value,
      theory: parseInt(student.theory) || 0,
      practical: parseInt(student.practical) || 0,
      homework: parseInt(student.homework) || 0,
      participation: parseInt(student.participation) || 0,
      quran: parseInt(student.quran) || 0,
      final: parseInt(student.final) || 0
    }))

    try {
      // حفظ الدرجات باستخدام متجر الدرجات
      console.log('Grades data to save:', gradesData)
      await gradesStore.saveBatchGrades(gradesData)

      // حفظ بيانات الحضور
      const attendanceData = students.value.map(student => ({
        student: student.id,
        date: selectedDate.value,
        status: student.attendance,
        class_name: selectedClass.value.id,
        section: selectedSection.value.id
      }))

      console.log('Attendance data to save:', attendanceData)
      await gradesStore.saveBatchAttendance(attendanceData)

      // عرض رسالة نجاح
      showSnackbar('تم حفظ الدرجات والحضور بنجاح', 'success')
    } catch (apiError) {
      console.error('API Error:', apiError)

      // التحقق من نوع الخطأ
      if (apiError.response) {
        // خطأ من الخادم
        const statusCode = apiError.response.status
        const errorData = apiError.response.data

        if (statusCode === 400) {
          // خطأ في البيانات المرسلة
          let errorMessage = 'خطأ في البيانات المرسلة'
          if (errorData && typeof errorData === 'object') {
            errorMessage = Object.entries(errorData)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')
          }
          showSnackbar(`خطأ في البيانات: ${errorMessage}`, 'error')
        } else if (statusCode === 401 || statusCode === 403) {
          // خطأ في المصادقة
          showSnackbar('ليس لديك صلاحية لحفظ هذه البيانات', 'error')
        } else if (statusCode >= 500) {
          // خطأ في الخادم
          showSnackbar('حدث خطأ في الخادم، يرجى المحاولة مرة أخرى لاحقاً', 'error')
        } else {
          // خطأ غير معروف
          showSnackbar('حدث خطأ أثناء حفظ البيانات', 'error')
        }
      } else if (apiError.request) {
        // لم يتم استلام استجابة من الخادم
        showSnackbar('لا يمكن الوصول إلى الخادم، يرجى التحقق من اتصالك بالإنترنت', 'error')
      } else {
        // خطأ في إعداد الطلب
        showSnackbar(`حدث خطأ غير متوقع: ${apiError.message}`, 'error')
      }

      throw apiError // إعادة رمي الخطأ للتعامل معه في المستوى الأعلى
    }
  } catch (error) {
    console.error('Error saving grades and attendance:', error)
    // لا نعرض رسالة خطأ هنا لأنها عرضت بالفعل في المستوى الأدنى
  } finally {
    saving.value = false
  }
}

// دوال إدارة الواجبات

// دالة جلب الواجبات
const fetchAssignments = async () => {
  if (!selectedSubject.value) return

  try {
    loadingAssignments.value = true
    console.log('Fetching assignments for subject:', selectedSubject.value.id)

    // جلب الواجبات باستخدام متجر الدرجات
    const assignmentsData = await gradesStore.fetchAssignmentsBySubject(selectedSubject.value.id)
    assignments.value = assignmentsData

    // تعيين الواجب الحالي إذا لم يكن محدداً
    if (!currentAssignment.value && assignments.value.length > 0) {
      currentAssignment.value = assignments.value[0]
    }

    // إذا لم تكن هناك واجبات، نضيف بيانات تجريبية
    if (assignments.value.length === 0) {
      // بيانات تجريبية للواجبات
      assignments.value = [
        {
          id: 'temp-1',
          title: 'واجب الفصل الأول',
          description: 'حل تمارين الفصل الأول من الكتاب',
          score: 10,
          due_date: new Date().toISOString().split('T')[0],
          subject: selectedSubject.value.id
        },
        {
          id: 'temp-2',
          title: 'مشروع نهاية الفصل',
          description: 'إعداد مشروع بحثي عن موضوعات المادة',
          score: 15,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subject: selectedSubject.value.id
        }
      ]

      // تعيين الواجب الحالي
      currentAssignment.value = assignments.value[0]
    }
  } catch (error) {
    console.error('Error fetching assignments:', error)
    showSnackbar('حدث خطأ أثناء جلب الواجبات', 'error')
  } finally {
    loadingAssignments.value = false
  }
}

// دالة فتح نافذة إنشاء واجب جديد
const openNewAssignmentDialog = () => {
  // إعادة تعيين بيانات النافذة
  assignmentDialog.value = {
    show: true,
    isEdit: false,
    loading: false,
    dateMenu: false,
    data: {
      id: null,
      title: '',
      description: '',
      score: 10,
      due_date: new Date().toISOString().split('T')[0],
      subject: selectedSubject.value?.id
    }
  }
}

// دالة تحرير واجب
const editAssignment = (assignment) => {
  // نسخ بيانات الواجب إلى النافذة
  assignmentDialog.value = {
    show: true,
    isEdit: true,
    loading: false,
    dateMenu: false,
    data: { ...assignment }
  }
}

// دالة حفظ الواجب
const saveAssignment = async () => {
  try {
    assignmentDialog.value.loading = true

    // التأكد من صحة البيانات
    if (!assignmentDialog.value.data.title || !assignmentDialog.value.data.description ||
        !assignmentDialog.value.data.score || !assignmentDialog.value.data.due_date) {
      showSnackbar('يرجى ملء جميع الحقول المطلوبة', 'error')
      return
    }

    // تحضير البيانات للإرسال
    const assignmentData = {
      ...assignmentDialog.value.data,
      subject: selectedSubject.value.id
    }

    console.log('Saving assignment:', assignmentData)

    // حفظ الواجب باستخدام متجر الدرجات
    const savedAssignment = await gradesStore.saveAssignment(assignmentData)

    if (assignmentDialog.value.isEdit) {
      // تحديث الواجب الموجود في القائمة المحلية
      const index = assignments.value.findIndex(a => a.id === savedAssignment.id)
      if (index !== -1) {
        assignments.value[index] = savedAssignment
      }

      // تحديث الواجب الحالي إذا كان هو نفسه
      if (currentAssignment.value && currentAssignment.value.id === savedAssignment.id) {
        currentAssignment.value = savedAssignment
      }

      showSnackbar('تم تحديث الواجب بنجاح', 'success')
    } else {
      // إضافة الواجب الجديد إلى القائمة المحلية
      assignments.value.push(savedAssignment)
      showSnackbar('تم إنشاء الواجب بنجاح', 'success')
    }

    // إغلاق النافذة
    assignmentDialog.value.show = false
  } catch (error) {
    console.error('Error saving assignment:', error)
    showSnackbar('حدث خطأ أثناء حفظ الواجب', 'error')
  } finally {
    assignmentDialog.value.loading = false
  }
}

// دالة تأكيد حذف واجب
const confirmDeleteAssignment = (assignment) => {
  confirmDialog.value = {
    show: true,
    title: 'حذف الواجب',
    message: `هل أنت متأكد من حذف الواجب "${assignment.title}"؟`,
    color: 'error',
    icon: 'mdi-delete',
    loading: false,
    confirm: () => deleteAssignment(assignment)
  }
}

// دالة حذف واجب
const deleteAssignment = async (assignment) => {
  try {
    confirmDialog.value.loading = true
    console.log('Deleting assignment:', assignment.id)

    // حذف الواجب باستخدام متجر الدرجات
    await gradesStore.deleteAssignment(assignment.id, selectedSubject.value.id)

    // حذف الواجب من القائمة المحلية
    assignments.value = assignments.value.filter(a => a.id !== assignment.id)

    // إذا كان الواجب المحذوف هو الواجب الحالي، قم بتعيين واجب آخر
    if (currentAssignment.value && currentAssignment.value.id === assignment.id) {
      currentAssignment.value = assignments.value.length > 0 ? assignments.value[0] : null
    }

    showSnackbar('تم حذف الواجب بنجاح', 'success')
    confirmDialog.value.show = false
  } catch (error) {
    console.error('Error deleting assignment:', error)
    showSnackbar('حدث خطأ أثناء حذف الواجب', 'error')
  } finally {
    confirmDialog.value.loading = false
  }
}

// دالة تحديد واجب
const selectAssignment = (assignment) => {
  currentAssignment.value = assignment
  showSnackbar(`تم تحديد الواجب: ${assignment.title}`, 'info')

  // تحديث حالة تسليم الواجبات للطلاب
  updateAssignmentStatus()
}

// دالة تحديث حالة تسليم الواجبات
const updateAssignmentStatus = () => {
  if (!currentAssignment.value || students.value.length === 0) return

  // محاكاة تحديث حالة تسليم الواجبات للطلاب
  students.value.forEach(student => {
    // تعيين حالة عشوائية لتسليم الواجب
    student.assignmentStatus = Math.random() > 0.3 ? 'submitted' : 'not_submitted'
  })
}

// دالة عرض رسالة التنبيه
const showSnackbar = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

// تحميل البيانات الأولية عند تحميل الصفحة
onMounted(async () => {
  try {
    // جلب البيانات الأساسية
    await fetchClasses()
    await fetchSections()
    await fetchSubjects()

    // جلب الطلاب إذا تم تحديد الصف والفصل والمادة
    if (selectedClass.value && selectedSection.value && selectedSubject.value) {
      await fetchStudents()
      // جلب الواجبات بعد جلب الطلاب
      await fetchAssignments()
    }
  } catch (error) {
    console.error('Error loading initial data:', error)
    errorLoading.value = true
    errorMessage.value = 'حدث خطأ أثناء تحميل البيانات الأولية'
  }
})
</script>

<style scoped>
.grades-page-new {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 100%;
  padding-bottom: 60px;
  text-align: right;
  background-color: rgb(var(--v-theme-background));
}

.header-card, .content-card, .info-card {
  transition: all 0.3s ease;
  overflow: hidden;
  background-color: rgb(var(--v-theme-surface));
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-card {
  border-right: 4px solid rgb(var(--v-theme-primary));
}

.student-card {
  transition: all 0.3s ease;
  height: 100%;
  border-radius: 8px;
}

.student-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgb(var(--v-theme-primary));
}

/* أنماط بطاقات الواجبات */
.assignments-card {
  margin-top: 24px;
}

.assignment-card {
  transition: all 0.3s ease;
  height: 100%;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.assignment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgb(var(--v-theme-primary));
}

.active-assignment {
  border-color: rgb(var(--v-theme-primary));
  border-width: 2px;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

.active-assignment::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 24px 24px 0;
  border-color: transparent rgb(var(--v-theme-primary)) transparent transparent;
}

/* أنماط نافذة تفاصيل الطالب */
.student-grades-section,
.student-attendance-section,
.student-assignments-section,
.student-notes-section {
  min-height: 300px;
}

/* أنماط الملاحظات */
:deep(.v-timeline-item__body) {
  padding: 0;
  margin-bottom: 8px;
}

:deep(.v-timeline-item__dot) {
  margin-top: 8px;
}

:deep(.v-timeline-item__opposite) {
  margin-top: 8px;
}

/* أنماط جدول الدرجات */
.grades-table-container {
  overflow-x: auto;
}

.grades-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.grades-table th {
  position: sticky;
  top: 0;
  background-color: rgb(var(--v-theme-surface));
  z-index: 1;
  font-weight: bold;
  padding: 12px 8px;
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.5);
}

.grades-table td {
  padding: 8px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  vertical-align: middle;
}

.grades-table tr:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.highlight-row {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

/* أنماط حقول الدرجات */
.grade-input {
  width: 70px;
  margin: 0 auto;
}

:deep(.grade-input .v-field__input) {
  text-align: center !important;
  padding: 0 8px;
}

:deep(.grade-input .v-field__outline) {
  --v-field-border-width: 1px;
}

:deep(.grade-input .v-field) {
  border-radius: 4px;
}

/* تحسين مظهر الأزرار والحقول في الوضع RTL */
:deep(.v-field__input) {
  text-align: right;
}

:deep(.v-label) {
  text-align: right;
  right: 16px;
  left: auto;
}

:deep(.v-select__selection) {
  text-align: right;
}

/* تأثيرات الانتقال */
.v-expand-transition-enter-active,
.v-expand-transition-leave-active {
  transition: all 0.3s ease;
}

.v-expand-transition-enter-from,
.v-expand-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* تحسينات للوضع المظلم */
:deep(.v-theme--dark) .student-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

:deep(.v-theme--dark) .info-card {
  background-color: rgba(var(--v-theme-surface), 0.8);
}

:deep(.v-theme--dark) .grades-table th {
  background-color: rgb(var(--v-theme-surface));
  border-bottom-color: rgba(var(--v-theme-primary), 0.7);
}

:deep(.v-theme--dark) .grades-table td {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.15);
}

:deep(.v-theme--dark) .highlight-row {
  background-color: rgba(var(--v-theme-primary), 0.15) !important;
}

/* تحسينات للأجهزة المحمولة */
@media (max-width: 600px) {
  .header-card, .content-card, .info-card {
    border-radius: 8px;
  }

  .student-card {
    margin-bottom: 12px;
  }

  .grades-table-container {
    margin: 0 -16px;
  }

  .grades-table th,
  .grades-table td {
    padding: 8px 4px;
    font-size: 0.85rem;
  }

  .grade-input {
    width: 60px;
  }
}
</style>
