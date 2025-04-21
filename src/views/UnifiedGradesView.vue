<template>
  <div class="unified-grades-page" dir="rtl">
    <!-- بطاقة العنوان والفلاتر -->
    <v-card class="header-card mb-4 rounded-lg" elevation="2">
      <v-card-title class="d-flex align-center py-3 px-4 bg-primary text-white rounded-t-lg">
        <v-icon size="large" class="me-2">mdi-clipboard-text-outline</v-icon>
        <span class="text-h5 font-weight-bold">صفحة الدرجات الموحدة</span>
        <v-spacer></v-spacer>
        <v-btn
          variant="tonal"
          color="success"
          prepend-icon="mdi-check-circle"
          class="ms-2"
        >
          النظام الجديد مفعل
        </v-btn>
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

            <!-- أزرار الفلاتر -->
            <div class="d-flex justify-end mt-4">
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
                <th class="text-center">تسليم الواجب</th>
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

                <!-- تسليم الواجب -->
                <td class="text-center">
                  <v-chip
                    :color="student.submissionStatus === 'submitted' ? 'success' : 'error'"
                    variant="outlined"
                    size="small"
                    class="me-2"
                  >
                    {{ student.submissionStatus === 'submitted' ? 'تم التسليم' : 'لم يتم التسليم' }}
                  </v-chip>
                  <v-btn
                    icon
                    variant="text"
                    color="primary"
                    size="small"
                    :disabled="!canSubmitAssignment"
                    @click="openSubmissionDialog(student)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
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
                    @click="openAddNoteDialog(student)"
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

                <v-card-actions>
                  <v-btn
                    variant="text"
                    color="primary"
                    @click="selectAssignment(assignment)"
                  >
                    اختيار
                  </v-btn>
                  <v-btn
                    variant="text"
                    color="info"
                    @click="editAssignment(assignment)"
                  >
                    تعديل
                  </v-btn>
                  <v-btn
                    variant="text"
                    color="error"
                    @click="deleteAssignment(assignment)"
                  >
                    حذف
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- حوار تسليم الواجب -->
    <v-dialog v-model="submissionDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-primary text-white">
          تسليم الواجب
        </v-card-title>
        <v-card-text class="pa-4 mt-4">
          <v-alert v-if="!currentAssignment" type="warning" variant="tonal" class="mb-4">
            يرجى اختيار واجب أولاً
          </v-alert>
          <template v-else>
            <div class="mb-4">
              <div class="text-subtitle-1 font-weight-bold">الطالب:</div>
              <div class="d-flex align-center mt-1">
                <v-avatar size="32" color="primary" class="me-2">
                  <span class="white--text">{{ getInitials(selectedSubmissionStudent?.name || '') }}</span>
                </v-avatar>
                <span>{{ selectedSubmissionStudent?.name }}</span>
              </div>
            </div>

            <div class="mb-4">
              <div class="text-subtitle-1 font-weight-bold">الواجب:</div>
              <div class="d-flex align-center mt-1">
                <v-icon color="primary" class="me-2">mdi-clipboard-text-outline</v-icon>
                <span>{{ currentAssignment.title }}</span>
              </div>
            </div>

            <div class="mb-4">
              <div class="text-subtitle-1 font-weight-bold">المادة:</div>
              <div class="d-flex align-center mt-1">
                <v-icon color="info" class="me-2">mdi-book-open-variant</v-icon>
                <span>{{ selectedSubject?.name || 'غير محدد' }}</span>
              </div>
            </div>

            <v-radio-group
              v-model="submissionStatus"
              label="حالة التسليم"
              class="mb-4"
            >
              <v-radio value="submitted" label="تم التسليم"></v-radio>
              <v-radio value="not_submitted" label="لم يتم التسليم"></v-radio>
            </v-radio-group>

            <v-textarea
              v-model="submissionNotes"
              label="ملاحظات"
              variant="outlined"
              density="comfortable"
              rows="3"
            ></v-textarea>
          </template>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="submissionDialog = false"
          >
            إلغاء
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="uploading"
            :disabled="uploading || !currentAssignment"
            @click="submitAssignment"
          >
            تأكيد
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- حوار نجاح التسليم -->
    <v-dialog v-model="successDialog" max-width="600" fullscreen-breakpoint="sm">
      <v-card class="celebration-card" :class="submissionStatus === 'submitted' ? 'success-card' : 'warning-card'">
        <v-card-text class="pa-6 text-center">
          <div class="celebration-container">
            <div class="student-info mb-4">
              <v-avatar size="100" :color="!selectedSubmissionStudent?.image ? 'primary' : undefined" class="elevation-5 mb-3">
                <img v-if="selectedSubmissionStudent?.image" :src="selectedSubmissionStudent.image" alt="Student" @error="handleImageError(selectedSubmissionStudent)" />
                <span v-else class="text-h4" :class="{'text-white': true}">{{ getInitials(selectedSubmissionStudent?.name || '') }}</span>
              </v-avatar>
              <h2 class="text-h4 font-weight-bold mb-2">{{ selectedSubmissionStudent?.name }}</h2>
            </div>

            <div v-if="submissionStatus === 'submitted'" class="celebration-animation mb-4">
              <v-icon size="100" color="success" class="celebration-icon pulse-animation">mdi-check-circle</v-icon>
              <div class="confetti-container">
                <div v-for="n in 20" :key="n" class="confetti" :style="{ '--delay': `${Math.random() * 5}s`, '--left': `${Math.random() * 100}%` }"></div>
              </div>
            </div>
            <div v-else class="mb-4">
              <v-icon size="100" color="warning" class="pulse-animation">mdi-alert-circle</v-icon>
            </div>

            <h2 class="text-h4 font-weight-bold mb-4" :class="submissionStatus === 'submitted' ? 'text-success' : 'text-warning'">
              {{ submissionStatus === 'submitted' ? 'تم تسليم الواجب بنجاح!' : 'تم تسجيل عدم تسليم الواجب!' }}
            </h2>

            <div v-if="submissionStatus === 'submitted'" class="motivation-message text-h6 mb-4">
              {{ getRandomMotivationMessage() }}
            </div>
            <div v-else class="motivation-message text-h6 mb-4">
              {{ getRandomEncouragementMessage() }}
            </div>

            <p class="text-body-1 mb-4" :class="{'text-high-emphasis': true}">
              {{ submissionStatus === 'submitted' ? 'تم تسليم الواجب بنجاح في مادة ' + (selectedSubject?.name || 'غير محدد') + ' وتم تسجيل الدرجة.' : 'تم تسجيل عدم تسليم الواجب في مادة ' + (selectedSubject?.name || 'غير محدد') + '.' }}
            </p>

            <v-btn
              color="primary"
              size="large"
              variant="elevated"
              block
              @click="successDialog = false"
              class="mt-4"
            >
              حسناً
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- نافذة إضافة ملاحظة -->
    <v-dialog v-model="noteDialog.show" max-width="500">
      <v-card>
        <v-card-title :class="noteDialog.type === 'positive' ? 'bg-success text-white' : 'bg-warning text-white'">
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
            @update:model-value="onNoteTypeChange"
          ></v-select>

          <!-- ملاحظات جاهزة -->
          <v-select
            v-if="noteDialog.type === 'positive'"
            label="اختر ملاحظة إيجابية جاهزة"
            :items="positiveNotes"
            variant="outlined"
            color="success"
            class="mb-4"
            @update:model-value="noteDialog.content = $event"
            clearable
          ></v-select>

          <v-select
            v-if="noteDialog.type === 'negative'"
            label="اختر ملاحظة سلبية جاهزة"
            :items="negativeNotes"
            variant="outlined"
            color="warning"
            class="mb-4"
            @update:model-value="noteDialog.content = $event"
            clearable
          ></v-select>

          <v-textarea
            v-model="noteDialog.content"
            :label="'محتوى الملاحظة ' + (noteDialog.type === 'positive' ? 'الإيجابية' : 'السلبية')"
            variant="outlined"
            :rules="[v => !!v || 'محتوى الملاحظة مطلوب']"
            rows="4"
            auto-grow
            :color="noteDialog.type === 'positive' ? 'success' : 'warning'"
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



    <!-- نافذة التهنئة للطالب -->
    <v-dialog v-model="congratsDialog.show" max-width="600" persistent>
      <v-card class="congratulation-card rounded-xl">
        <v-card-text class="text-center pa-6">
          <div class="congratulation-content">
            <div class="student-image-container mb-4">
              <v-avatar size="150" v-if="congratsDialog.student && congratsDialog.student.image_url">
                <v-img :src="congratsDialog.student.image_url" alt="صورة الطالب" cover></v-img>
              </v-avatar>
              <v-avatar size="150" v-else color="primary" class="text-white">
                <v-icon size="80">mdi-account</v-icon>
              </v-avatar>
            </div>

            <div class="congratulation-message">
              <h2 class="text-h4 font-weight-bold mb-4 success--text">
                ماشاء الله تبارك الله!
              </h2>

              <h3 class="text-h5 mb-4">
                {{ congratsDialog.student ? congratsDialog.student.name : 'الطالب' }}
              </h3>

              <p class="text-body-1 mb-6">
                {{ congratsDialog.message }}
              </p>

              <div class="congratulation-decoration">
                <v-icon color="success" size="40" class="me-2">mdi-star</v-icon>
                <v-icon color="warning" size="40" class="me-2">mdi-star</v-icon>
                <v-icon color="error" size="40" class="me-2">mdi-star</v-icon>
                <v-icon color="info" size="40" class="me-2">mdi-star</v-icon>
                <v-icon color="success" size="40">mdi-star</v-icon>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="justify-center pa-4">
          <v-btn
            color="success"
            variant="elevated"
            size="large"
            @click="congratsDialog.show = false"
            class="px-8"
          >
            إغلاق
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
                            :model-value="calculateTotal(studentDetailsDialog.student)"
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
                          :subtitle="`${formatDate(assignment.due_date)} - ${assignment.subject_info || selectedSubject?.name || 'غير محدد'}`"
                        >
                          <template v-slot:prepend>
                            <v-icon
                              :color="getAssignmentStatusColor(studentDetailsDialog.student, assignment)"
                            >
                              {{ getAssignmentStatusIcon(studentDetailsDialog.student, assignment) }}
                            </v-icon>
                          </template>
                          <template v-slot:append>
                            <div class="d-flex align-center">
                              <v-chip
                                :color="getAssignmentStatusColor(studentDetailsDialog.student, assignment)"
                                size="small"
                                variant="outlined"
                                class="me-2"
                              >
                                {{ getAssignmentStatusText(studentDetailsDialog.student, assignment) }}
                              </v-chip>
                              <v-btn
                                icon
                                size="small"
                                color="primary"
                                variant="text"
                                @click="openSubmissionDialog(studentDetailsDialog.student)"
                              >
                                <v-icon>mdi-pencil</v-icon>
                              </v-btn>
                            </div>
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
                            <div class="text-caption font-weight-medium">{{ formatDate(note.date) }}</div>
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

    <!-- نافذة حوار إضافة/تعديل واجب -->
    <v-dialog v-model="newAssignmentDialog.show" max-width="600px" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <span>{{ newAssignmentDialog.id ? 'تعديل واجب' : 'إضافة واجب جديد' }}</span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form @submit.prevent="saveAssignment">
            <v-text-field
              v-model="newAssignmentDialog.title"
              label="عنوان الواجب"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              required
            ></v-text-field>

            <v-textarea
              v-model="newAssignmentDialog.description"
              label="وصف الواجب"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              rows="3"
            ></v-textarea>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newAssignmentDialog.score"
                  label="الدرجة"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  min="1"
                  max="100"
                  class="mb-3"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newAssignmentDialog.due_date"
                  label="تاريخ الاستحقاق"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                  required
                ></v-text-field>
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
            @click="newAssignmentDialog.show = false"
            :disabled="newAssignmentDialog.loading"
          >
            إلغاء
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="saveAssignment"
            :loading="newAssignmentDialog.loading"
            :disabled="newAssignmentDialog.loading"
          >
            حفظ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- تم إزالة حوار ترحيل البيانات -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useGradesStore } from '@/stores/gradesStore';
import { useUnifiedGradesStore } from '@/stores/unifiedGradesStore';
import { getInitials } from '@/utils/imageUtils';
import ClassService from '@/services/ClassService';
import SectionService from '@/services/SectionService';
import SubjectService from '@/services/SubjectService';
// تم إزالة استيراد MigrationDialog

// استخدام متجر الدرجات
const gradesStore = useGradesStore();
const unifiedGradesStore = useUnifiedGradesStore();

// ملاحظة: تم إزالة متغير useUnifiedStore لأننا نستخدم المتجر الجديد مباشرة

// متغيرات الحالة الأساسية
const showFilters = ref(false);
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const dateMenu = ref(false);
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const classes = ref([]);
const sections = ref([]);
const subjects = ref([]);
const selectedClass = ref(null);
const selectedSection = ref(null);
const selectedSubject = ref(null);
const students = ref([]);
const selectedStudentId = ref(null);

// متغيرات الواجبات
const loadingAssignments = ref(false);
const assignments = ref([]);
const currentAssignment = ref(null);
const canSubmitAssignment = computed(() => {
  return selectedSubject.value && currentAssignment.value;
});

// متغيرات نافذة إضافة واجب جديد
const newAssignmentDialog = ref({
  show: false,
  loading: false,
  title: '',
  description: '',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // التاريخ الافتراضي بعد أسبوع
  score: 10
});

// متغيرات تسليم الواجب
const submissionDialog = ref(false);
const selectedSubmissionStudent = ref(null);
const submissionNotes = ref('');
const submissionStatus = ref('submitted');
const uploading = ref(false);
const successDialog = ref(false);

// متغيرات نافذة تفاصيل الطالب
const studentDetailsDialog = ref({
  show: false,
  loading: false,
  activeTab: 'grades',
  student: null
});

// متغيرات نافذة إضافة ملاحظة
const noteDialog = ref({
  show: false,
  loading: false,
  type: 'positive',
  content: '',
  studentId: null
});

// قائمة الملاحظات الإيجابية الجاهزة
const positiveNotes = ref([
  'ممتاز! أداء متميز في الفصل اليوم',
  'ماشاء الله تبارك الله! مستوى رائع في المشاركة',
  'أحسنت! تحسن ملحوظ في المستوى',
  'ممتاز جداً! التزام نموذجي بالواجبات',
  'ماشاء الله! تفاعل إيجابي مع زملائه',
  'أبدعت اليوم في الإجابة على الأسئلة',
  'تميز في حفظ القرآن الكريم',
  'مستوى متقدم في فهم الدروس',
  'سلوك مثالي ومحترم مع المعلمين والزملاء',
  'تطور ملحوظ في المهارات الأساسية',
  'مبادرة ذاتية للمساعدة في أنشطة الفصل',
  'تفوق في الاختبار الأخير',
  'حماس ودافعية عالية للتعلم',
  'قدرة متميزة على حل المشكلات',
  'إبداع وابتكار في المشاريع الصفية'
]);

// قائمة الملاحظات السلبية الجاهزة
const negativeNotes = ref([
  'يحتاج إلى تحسين مستوى المشاركة في الفصل',
  'لم يقم بحل الواجب المنزلي',
  'كثير الحديث أثناء الشرح',
  'يحتاج إلى مزيد من التركيز أثناء الدرس',
  'تأخر متكرر عن الحصة',
  'ضعف في مستوى الحفظ',
  'عدم إحضار الكتب والأدوات المدرسية',
  'صعوبة في فهم بعض المفاهيم الأساسية',
  'يحتاج إلى تحسين الخط والترتيب',
  'قلة الاهتمام بالمراجعة المنزلية',
  'سلوك غير لائق مع زملائه',
  'عدم الالتزام بتعليمات المعلم',
  'كثرة الغياب عن المدرسة',
  'ضعف في مهارات القراءة',
  'يحتاج إلى دعم إضافي في المواد الأساسية'
]);

// عبارات التهنئة والتحفيز باللهجة السعودية
const congratsMessages = ref([
  'ماشاء الله تبارك الله! أحسنت يا بطل، استمر على هالمستوى الرهيب!',
  'والله إنك قدها وقدود! أداء خيالي ما شاء الله عليك!',
  'يا سلااام عليك! مبدع ومتفوق دايماً، الله يوفقك!',
  'ما شاء الله لا قوة إلا بالله! مستواك يجنن، استمر!',
  'أنت نجم الفصل بلا منازع! ماشاء الله تبارك الرحمن!',
  'والله إنك تستاهل كل خير! مجهود جبار ماشاء الله!',
  'سبحان الله! موهبة وذكاء وإبداع، استمر يا بطل!',
  'ماشاء الله عليك! تفوقت على نفسك هالمرة، أبدعت!',
  'يا بعدي! مستوى خرافي ماشاء الله، الله يزيدك من فضله!',
  'أحسنت يا ذيب! مجهود يشرف ويسعد، الله يوفقك!',
  'ماشاء الله تبارك الله! أداء يفتح النفس، استمر!',
  'يا عيني عليك! إبداع ما شاء الله، تستاهل التكريم!',
  'سبحان الله! عقل راجح وفهم سريع، الله يزيدك علم!',
  'ماشاء الله عليك! نموذج للطالب المثالي، استمر!',
  'والله إنك فخر للمدرسة! ماشاء الله تبارك الرحمن!'
]);

// نافذة التهنئة
const congratsDialog = ref({
  show: false,
  student: null,
  message: ''
});

// بيانات الطالب
const studentNotes = ref([]);
const studentAttendanceHistory = ref([]);

// دوال مساعدة

// دالة للحصول على اسم اليوم بالعربية
const getArabicDayName = (date) => {
  const days = [
    'الأحد',     // الأحد
    'الإثنين',   // الإثنين
    'الثلاثاء',  // الثلاثاء
    'الأربعاء', // الأربعاء
    'الخميس',   // الخميس
    'الجمعة',    // الجمعة
    'السبت'      // السبت
  ];
  return days[date.getDay()];
};

// دالة تنسيق التاريخ مع اسم اليوم
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const dayName = getArabicDayName(date);
  const formattedDate = date.toLocaleDateString('ar-SA');
  return `${dayName} ${formattedDate}`;
};

// دوال الفلاتر
const applyFilters = () => {
  // تطبيق الفلاتر على قائمة الطلاب
  console.log('Applying filters with search query:', searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = '';
  applyFilters();
};

const resetFilters = () => {
  searchQuery.value = '';
  // إعادة تعيين الفلاتر الأخرى إذا لزم الأمر
  applyFilters();
};

// دوال التحميل
const fetchClasses = async () => {
  try {
    loading.value = true;
    const classesData = await ClassService.getClasses();
    classes.value = classesData || [];
    console.log('Fetched classes:', classes.value);

    if (classes.value.length > 0) {
      selectedClass.value = classes.value[0];
    }
  } catch (error) {
    console.error('Error fetching classes:', error);
  } finally {
    loading.value = false;
  }
};

const fetchSections = async () => {
  try {
    loading.value = true;
    const sectionsData = await SectionService.getSections();
    sections.value = sectionsData || [];
    console.log('Fetched sections:', sections.value);

    if (sections.value.length > 0) {
      selectedSection.value = sections.value[0];
    }
  } catch (error) {
    console.error('Error fetching sections:', error);
  } finally {
    loading.value = false;
  }
};

const fetchSubjects = async () => {
  try {
    loading.value = true;
    const subjectsData = await SubjectService.getSubjects();

    // تحويل البيانات للشكل المطلوب مع إضافة حقل is_main
    subjects.value = subjectsData.map(subject => ({
      id: subject.id,
      name: subject.name,
      is_main: subject.parent_id === null,
      parent_id: subject.parent_id ? (typeof subject.parent_id === 'object' ? subject.parent_id.id : subject.parent_id) : null,
      parent_name: subject.parent_id ? (typeof subject.parent_id === 'object' ? subject.parent_id.name : null) : null,
      is_active: subject.is_active !== undefined ? subject.is_active : true,
      order_index: subject.order_index || 0
    })) || [];

    console.log('Fetched subjects:', subjects.value);

    if (subjects.value.length > 0) {
      // اختيار مادة رئيسية كافتراضية إذا وجدت
      const mainSubject = subjects.value.find(s => s.is_main);
      selectedSubject.value = mainSubject || subjects.value[0];
    }
  } catch (error) {
    console.error('Error fetching subjects:', error);
  } finally {
    loading.value = false;
  }
};

const fetchStudents = async () => {
  if (!selectedClass.value || !selectedSection.value) {
    console.warn('Class or section not selected');
    return;
  }

  try {
    loading.value = true;
    const studentsData = await gradesStore.fetchStudentsByClassAndSection(
      selectedClass.value.id,
      selectedSection.value.id
    );
    students.value = studentsData || [];
    console.log('Fetched students:', students.value);
    console.log('Using date:', selectedDate.value);

    // تحميل الدرجات والحضور للطلاب
    await loadGradesAndAttendance();

    // تحميل الواجبات للمادة المحددة
    if (selectedSubject.value) {
      await fetchAssignments();
    }
  } catch (error) {
    console.error('Error fetching students:', error);
  } finally {
    loading.value = false;
  }
};

const loadGradesAndAttendance = async () => {
  if (students.value.length === 0) return;

  try {
    // استخدام المتجر الجديد مباشرة
    const store = unifiedGradesStore;

    // تحميل الدرجات للطلاب
    const studentIds = students.value.map(student => student.id);
    await store.fetchGradesForStudents(studentIds);

    // تحميل الحضور للتاريخ المحدد
    await gradesStore.fetchAttendanceForDate(
      selectedDate.value,
      selectedClass.value.id,
      selectedSection.value.id
    );

    // تحديث بيانات الطلاب بالدرجات والحضور
    updateStudentsWithGradesAndAttendance();

    // تحديث حالة تسليم الواجبات بعد تحميل البيانات
    if (currentAssignment.value) {
      await loadSubmissions();
    }
  } catch (error) {
    console.error('Error loading grades and attendance:', error);
  }
};

const updateStudentsWithGradesAndAttendance = () => {
  students.value.forEach(student => {
    // استخدام المتجر الجديد مباشرة
    const store = unifiedGradesStore;

    // تحديث الدرجات
    let grades;
    // استخدام المتجر الجديد
    grades = store.getGradesByStudent(student.id);
    if (grades && selectedSubject.value) {
      const subjectGrades = grades.filter(g => g.subject === selectedSubject.value.id);

      // إذا لم تكن الدرجات معرفة بعد، نقوم بتهيئتها بقيم افتراضية
      if (student.theory === undefined) student.theory = 0;
      if (student.practical === undefined) student.practical = 0;
      if (student.homework === undefined) student.homework = 0;
      if (student.participation === undefined) student.participation = 0;
      if (student.quran === undefined) student.quran = 0;
      if (student.final === undefined) student.final = 0;

      // تحديث الدرجات من قاعدة البيانات إذا كانت موجودة
      if (subjectGrades.length > 0) {
        // في المتجر الجديد، كل سجل يحتوي على جميع الدرجات
        const latestGrade = subjectGrades[0]; // أحدث سجل
        student.theory = latestGrade.theory || 0;
        student.practical = latestGrade.practical || 0;
        student.homework = latestGrade.homework || 0;
        student.participation = latestGrade.participation || 0;
        student.quran = latestGrade.quran || 0;
        student.final = latestGrade.final || 0;

        // إذا كانت حالة تسليم الواجب هي "تم التسليم" ولكن درجة الواجب صفر، نضيف درجة الواجب من الواجب الحالي
        if (student.submissionStatus === 'submitted' && student.homework === 0 && currentAssignment.value) {
          student.homework = currentAssignment.value.score || 10;
          console.log(`Updated homework grade for student ${student.name} to ${student.homework} based on submission status`);
        }
      }
    }

    // تحديث الحضور
    const attendance = gradesStore.getAttendanceByStudentAndDate(student.id, selectedDate.value);
    student.attendance = attendance ? attendance.status : 'present';

    // لا نقوم بإعادة تعيين حالة تسليم الواجب هنا
    // لأنها ستتم تحديثها في loadSubmissions()
  });
};

const fetchAssignments = async () => {
  if (!selectedSubject.value) return;

  try {
    loadingAssignments.value = true;
    console.log('Fetching assignments for subject:', selectedSubject.value.id);

    const assignmentsData = await gradesStore.fetchAssignmentsBySubject(selectedSubject.value.id);
    assignments.value = assignmentsData || [];
    console.log('Assignments data received:', assignments.value);

    // تحديد الواجب الحالي إذا كان هناك واجبات
    if (assignments.value.length > 0) {
      currentAssignment.value = assignments.value[0];
      console.log('Set current assignment to:', currentAssignment.value);

      // تحميل تسليمات الواجبات للطلاب
      await loadSubmissions();
    } else {
      currentAssignment.value = null;
      console.log('No assignments found for subject:', selectedSubject.value.id);
    }
  } catch (error) {
    console.error('Error fetching assignments:', error);
    assignments.value = [];
    currentAssignment.value = null;
  } finally {
    loadingAssignments.value = false;
  }
};

const loadSubmissions = async () => {
  if (!currentAssignment.value || students.value.length === 0) return;

  try {
    // إعادة تعيين حالة التسليم لجميع الطلاب قبل تحميل البيانات الجديدة
    students.value.forEach(student => {
      student.submissionStatus = 'not_submitted';
      student.hasSubmission = false;
      student.submissionInfo = null;
    });

    const submissionsData = await gradesStore.fetchSubmissionsForAssignment(currentAssignment.value.id);
    console.log('Submissions data received:', submissionsData);

    // تحديث حالة تسليم الواجب للطلاب
    students.value.forEach(student => {
      // التحقق من نوع البيانات المستلمة
      if (Array.isArray(submissionsData)) {
        // إذا كانت البيانات مصفوفة
        const submission = submissionsData.find(s => s.student_id === student.id);
        student.submissionStatus = submission ? submission.status : 'not_submitted';
        student.hasSubmission = student.submissionStatus === 'submitted';
        student.submissionInfo = submission ? submission.subject_info : null;
      } else if (typeof submissionsData === 'object' && submissionsData !== null) {
        // إذا كانت البيانات كائن
        const submissionKey = `${student.id}-${currentAssignment.value.id}`;
        const submission = submissionsData[submissionKey];
        student.submissionStatus = submission ? submission.status : 'not_submitted';
        student.hasSubmission = student.submissionStatus === 'submitted';
        student.submissionInfo = submission ? submission.subject_info : null;
      } else {
        // إذا لم تكن البيانات مصفوفة أو كائن
        student.submissionStatus = 'not_submitted';
        student.hasSubmission = false;
        student.submissionInfo = null;
      }
    });
  } catch (error) {
    console.error('Error loading submissions:', error);
  }
};

// دوال التغيير
const onClassChange = () => {
  console.log('Class changed to:', selectedClass.value);
  fetchStudents();
};

const onSectionChange = () => {
  console.log('Section changed to:', selectedSection.value);
  fetchStudents();
};

const onSubjectChange = () => {
  console.log('Subject changed to:', selectedSubject.value);
  fetchAssignments();
  // No actualizamos las calificaciones al cambiar de materia
  // ya que todas las materias son parte de Estudios Islámicos
  // y queremos mantener los valores de las calificaciones
  // updateStudentsWithGradesAndAttendance();
};

const dateChanged = () => {
  console.log('Date changed to:', selectedDate.value);
  loadGradesAndAttendance();
};

// دوال الدرجات
const validateGrade = (student, type, max) => {
  // التحقق من أن الدرجة ضمن النطاق المسموح
  const value = parseFloat(student[type]);
  if (isNaN(value)) {
    student[type] = 0;
  } else if (value < 0) {
    student[type] = 0;
  } else if (value > max) {
    student[type] = max;
  } else {
    student[type] = value;
  }
};

const calculateTotal = (student) => {
  // حساب مجموع الدرجات
  const theory = parseFloat(student.theory) || 0;
  const practical = parseFloat(student.practical) || 0;
  const homework = parseFloat(student.homework) || 0;
  const participation = parseFloat(student.participation) || 0;
  const quran = parseFloat(student.quran) || 0;
  const final = parseFloat(student.final) || 0;

  return theory + practical + homework + participation + quran + final;
};

const getGradeColor = (total) => {
  // تحديد لون الدرجة حسب القيمة
  if (total >= 90) return 'success';
  if (total >= 80) return 'info';
  if (total >= 70) return 'primary';
  if (total >= 60) return 'warning';
  return 'error';
};

const getGradeText = (total) => {
  // تحديد نص التقدير حسب الدرجة
  if (total >= 90) return 'ممتاز';
  if (total >= 80) return 'جيد جداً';
  if (total >= 70) return 'جيد';
  if (total >= 60) return 'مقبول';
  return 'ضعيف';
};

const getAssignmentStatusColor = (student, assignment) => {
  // تحديد لون حالة الواجب
  if (!student || !assignment) return 'grey';

  // التحقق من حالة تسليم الواجب
  const submissionStatus = student.submissionStatus || 'not_submitted';

  // التحقق من تاريخ استحقاق الواجب
  const dueDate = new Date(assignment.due_date);
  const today = new Date();
  const isPastDue = today > dueDate;

  if (submissionStatus === 'submitted' || submissionStatus === 'correction') return 'success';
  if (isPastDue) return 'error';
  return 'warning';
};

const getAssignmentStatusIcon = (student, assignment) => {
  // تحديد أيقونة حالة الواجب
  if (!student || !assignment) return 'mdi-help-circle';

  // التحقق من حالة تسليم الواجب
  const submissionStatus = student.submissionStatus || 'not_submitted';

  // التحقق من تاريخ استحقاق الواجب
  const dueDate = new Date(assignment.due_date);
  const today = new Date();
  const isPastDue = today > dueDate;

  if (submissionStatus === 'submitted' || submissionStatus === 'correction') return 'mdi-check-circle';
  if (isPastDue) return 'mdi-alert-circle';
  return 'mdi-clock-outline';
};

const getAssignmentStatusText = (student, assignment) => {
  // تحديد نص حالة الواجب
  if (!student || !assignment) return 'غير محدد';

  // التحقق من حالة تسليم الواجب
  const submissionStatus = student.submissionStatus || 'not_submitted';

  // التحقق من تاريخ استحقاق الواجب
  const dueDate = new Date(assignment.due_date);
  const today = new Date();
  const isPastDue = today > dueDate;

  if (submissionStatus === 'submitted' || submissionStatus === 'correction') return 'تم التسليم';
  if (isPastDue) return 'فات موعد التسليم';
  return 'لم يتم التسليم';
};

const saveAllGrades = async () => {
  if (!selectedSubject.value || !selectedClass.value || !selectedSection.value) {
    console.warn('Subject, class, or section not selected');
    return;
  }

  try {
    saving.value = true;
    console.log('Saving all grades...');
    console.log('Selected subject:', selectedSubject.value);
    console.log('Selected class:', selectedClass.value);
    console.log('Selected section:', selectedSection.value);
    console.log('Selected date:', selectedDate.value);

    // حفظ الدرجات
    const gradesData = [];
    console.log('Students to save grades for:', students.value);

    students.value.forEach(student => {
      // إعداد بيانات الدرجات
      const gradeData = {
        student: student.id,
        subject: selectedSubject.value.id,
        date: selectedDate.value,
        theory: parseFloat(student.theory) || 0,
        practical: parseFloat(student.practical) || 0,
        homework: parseFloat(student.homework) || 0,
        participation: parseFloat(student.participation) || 0,
        quran: parseFloat(student.quran) || 0,
        final: parseFloat(student.final) || 0
      };

      console.log(`Prepared data for student ${student.id} (${student.name}):`, gradeData);
      gradesData.push(gradeData);
    });

    // في المتجر الجديد، نحفظ جميع الدرجات في سجل واحد لكل طالب
    const unifiedGradesData = [];

    students.value.forEach(student => {
      // تحقق من وجود أي درجة غير صفرية
      const hasNonZeroGrade =
        parseFloat(student.theory) > 0 ||
        parseFloat(student.practical) > 0 ||
        parseFloat(student.homework) > 0 ||
        parseFloat(student.participation) > 0 ||
        parseFloat(student.quran) > 0 ||
        parseFloat(student.final) > 0;

      // إضافة الدرجة فقط إذا كانت هناك درجة واحدة على الأقل غير صفرية
      if (hasNonZeroGrade) {
        unifiedGradesData.push({
          student_id: student.id,
          subject_id: selectedSubject.value.id,
          date: selectedDate.value,
          theory: parseFloat(student.theory) || 0,
          practical: parseFloat(student.practical) || 0,
          homework: parseFloat(student.homework) || 0,
          participation: parseFloat(student.participation) || 0,
          quran: parseFloat(student.quran) || 0,
          final: parseFloat(student.final) || 0
        });
      }
    });

    console.log('Unified grades data to save:', unifiedGradesData);
    if (unifiedGradesData.length > 0) {
      await unifiedGradesStore.saveBatchGrades(unifiedGradesData);
    } else {
      console.warn('No grades to save - all grades are zero');
    }

    // حفظ الحضور
    const today = new Date(selectedDate.value);
    const dayName = getArabicDayName(today);
    const attendanceData = students.value.map(student => ({
      student: student.id,
      date: selectedDate.value,
      status: student.attendance,
      class_name: selectedClass.value.id,
      section: selectedSection.value.id,
      day_name: dayName // إضافة اسم اليوم
    }));

    console.log('Attendance data to save:', attendanceData);
    await gradesStore.saveBatchAttendance(attendanceData);

    // عرض رسالة نجاح
    alert('تم حفظ الدرجات والحضور بنجاح');
  } catch (error) {
    console.error('Error saving grades and attendance:', error);
    alert('حدث خطأ أثناء حفظ الدرجات والحضور');
  } finally {
    saving.value = false;
  }
};

// دوال الحضور
const toggleAttendance = (student) => {
  // تبديل حالة الحضور
  student.attendance = student.attendance === 'present' ? 'absent' : 'present';
};

// دوال الواجبات
const selectAssignment = (assignment) => {
  currentAssignment.value = assignment;
  console.log('Selected assignment:', currentAssignment.value);
  loadSubmissions();
};

const openNewAssignmentDialog = () => {
  // فتح حوار إنشاء واجب جديد
  console.log('Opening new assignment dialog');

  // التحقق من وجود مادة محددة
  if (!selectedSubject.value) {
    alert('يرجى اختيار المادة أولاً');
    return;
  }

  // التحقق من أن المادة رئيسية
  if (!selectedSubject.value.is_main) {
    alert('يمكن إنشاء الواجبات للمواد الرئيسية فقط');
    return;
  }

  // إعادة تعيين قيم النموذج
  newAssignmentDialog.value = {
    show: true,
    loading: false,
    title: '',
    description: '',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // التاريخ الافتراضي بعد أسبوع
    score: 10
  };
};

const editAssignment = (assignment) => {
  // فتح حوار تعديل الواجب
  console.log('Editing assignment:', assignment);

  // التحقق من وجود مادة محددة
  if (!selectedSubject.value) {
    alert('يرجى اختيار المادة أولاً');
    return;
  }

  // التحقق من أن المادة رئيسية
  if (!selectedSubject.value.is_main) {
    alert('يمكن تعديل الواجبات للمواد الرئيسية فقط');
    return;
  }

  // تعبئة النموذج ببيانات الواجب الحالي
  newAssignmentDialog.value = {
    show: true,
    loading: false,
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    due_date: assignment.due_date,
    score: assignment.score
  };
};

// دالة حفظ الواجب الجديد
const saveAssignment = async () => {
  if (!selectedSubject.value) {
    alert('يرجى اختيار المادة أولاً');
    return;
  }

  // التحقق من أن المادة رئيسية
  if (!selectedSubject.value.is_main) {
    alert('يمكن إنشاء الواجبات للمواد الرئيسية فقط');
    return;
  }

  // التحقق من صحة البيانات
  if (!newAssignmentDialog.value.title) {
    alert('يرجى إدخال عنوان الواجب');
    return;
  }

  try {
    newAssignmentDialog.value.loading = true;

    // إعداد بيانات الواجب
    const assignmentData = {
      id: newAssignmentDialog.value.id, // سيكون undefined للواجبات الجديدة
      title: newAssignmentDialog.value.title,
      description: newAssignmentDialog.value.description,
      due_date: newAssignmentDialog.value.due_date,
      score: parseFloat(newAssignmentDialog.value.score) || 10,
      subject_id: selectedSubject.value.id
    };

    // حفظ الواجب باستخدام متجر الدرجات
    const savedAssignment = await gradesStore.saveAssignment(assignmentData);
    console.log('Assignment saved successfully:', savedAssignment);

    // تحديث قائمة الواجبات
    if (newAssignmentDialog.value.id) {
      // تحديث واجب موجود
      const index = assignments.value.findIndex(a => a.id === savedAssignment.id);
      if (index !== -1) {
        assignments.value[index] = savedAssignment;
      }
    } else {
      // إضافة واجب جديد
      assignments.value.push(savedAssignment);
    }

    // تحديد الواجب الحالي
    currentAssignment.value = savedAssignment;

    // إغلاق النافذة
    newAssignmentDialog.value.show = false;
    alert('تم حفظ الواجب بنجاح');
  } catch (error) {
    console.error('Error saving assignment:', error);
    alert('حدث خطأ أثناء حفظ الواجب');
  } finally {
    newAssignmentDialog.value.loading = false;
  }
};

const deleteAssignment = async (assignment) => {
  // حذف الواجب

  // التحقق من وجود مادة محددة
  if (!selectedSubject.value) {
    alert('يرجى اختيار المادة أولاً');
    return;
  }

  // التحقق من أن المادة رئيسية
  if (!selectedSubject.value.is_main) {
    alert('يمكن حذف الواجبات للمواد الرئيسية فقط');
    return;
  }

  if (!confirm(`هل أنت متأكد من حذف الواجب "${assignment.title}"؟`)) {
    return;
  }

  try {
    console.log('Deleting assignment:', assignment);
    await gradesStore.deleteAssignment(assignment.id, selectedSubject.value.id);

    // تحديث قائمة الواجبات
    assignments.value = assignments.value.filter(a => a.id !== assignment.id);

    // إعادة تعيين الواجب الحالي إذا تم حذفه
    if (currentAssignment.value && currentAssignment.value.id === assignment.id) {
      currentAssignment.value = assignments.value.length > 0 ? assignments.value[0] : null;
      loadSubmissions();
    }

    alert('تم حذف الواجب بنجاح');
  } catch (error) {
    console.error('Error deleting assignment:', error);
    alert('حدث خطأ أثناء حذف الواجب');
  }
};

// دوال تسليم الواجب
const openSubmissionDialog = (student) => {
  selectedSubmissionStudent.value = student;
  submissionNotes.value = '';
  submissionStatus.value = student.submissionStatus || 'not_submitted';
  submissionDialog.value = true;
};

const submitAssignment = async () => {
  if (!currentAssignment.value || !selectedSubmissionStudent.value) {
    alert('يرجى اختيار واجب وطالب أولاً');
    return;
  }

  try {
    uploading.value = true;
    console.log('Submitting assignment status...');

    // حفظ التسليم
    const submissionData = {
      assignment: currentAssignment.value.id,
      student: selectedSubmissionStudent.value.id,
      notes: submissionNotes.value,
      status: submissionStatus.value,
      subject_info: selectedSubject.value?.name || 'غير محدد'
    };

    console.log('Submission data to save:', submissionData);

    // إعادة تعيين كاش التسليمات للتأكد من تحديث البيانات
    gradesStore.clearCache(`submissions-${currentAssignment.value.id}`);

    // إعادة تعيين كاش الدرجات للطالب
    gradesStore.clearCache(`grades-${selectedSubmissionStudent.value.id}`);

    // انتظار لحظة للتأكد من تحديث الكاش
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      await gradesStore.saveSubmission(submissionData);
      console.log('Submission status saved successfully');

      // تحديث حالة التسليم للطالب
      selectedSubmissionStudent.value.submissionStatus = submissionStatus.value;
      selectedSubmissionStudent.value.hasSubmission = submissionStatus.value === 'submitted';
      selectedSubmissionStudent.value.submissionInfo = submissionData.subject_info;

      // تحديث حالة التسليم في الجدول الرئيسي
      const studentIndex = students.value.findIndex(s => s.id === selectedSubmissionStudent.value.id);
      if (studentIndex !== -1) {
        students.value[studentIndex].hasSubmission = selectedSubmissionStudent.value.hasSubmission;
        students.value[studentIndex].submissionStatus = selectedSubmissionStudent.value.submissionStatus;
        students.value[studentIndex].submissionInfo = selectedSubmissionStudent.value.submissionInfo;
      }

      // إذا كانت حالة التسليم هي "تم التسليم"، نضيف درجة الواجب يدوياً
      if (submissionStatus.value === 'submitted') {
        // تحديث درجة الواجب للطالب في الواجهة
        const studentIndex = students.value.findIndex(s => s.id === selectedSubmissionStudent.value.id);
        if (studentIndex !== -1) {
          // تعيين درجة الواجب إلى درجة الواجب الحالي أو 10 كقيمة افتراضية
          students.value[studentIndex].homework = currentAssignment.value.score || 10;
          console.log(`Updated homework grade for student ${students.value[studentIndex].name} to ${students.value[studentIndex].homework}`);
        }
      }

      // إغلاق حوار التسليم وعرض حوار النجاح
      submissionDialog.value = false;
      successDialog.value = true;
    } catch (submissionError) {
      console.error('Error in saveSubmission:', submissionError);
      // الاستمرار بالرغم من الخطأ في حفظ التسليم
      // لأن التسليم قد يكون نجح بالفعل ولكن هناك خطأ في الحصول على معلومات الواجب

      // تحديث حالة التسليم للطالب على أي حال
      selectedSubmissionStudent.value.submissionStatus = submissionStatus.value;
      selectedSubmissionStudent.value.hasSubmission = submissionStatus.value === 'submitted';
      selectedSubmissionStudent.value.submissionInfo = submissionData.subject_info;

      // تحديث حالة التسليم في الجدول الرئيسي
      const studentIndex = students.value.findIndex(s => s.id === selectedSubmissionStudent.value.id);
      if (studentIndex !== -1) {
        students.value[studentIndex].hasSubmission = selectedSubmissionStudent.value.hasSubmission;
        students.value[studentIndex].submissionStatus = selectedSubmissionStudent.value.submissionStatus;
        students.value[studentIndex].submissionInfo = selectedSubmissionStudent.value.submissionInfo;
      }

      // إذا كانت حالة التسليم هي "تم التسليم"، نضيف درجة الواجب يدوياً
      if (submissionStatus.value === 'submitted') {
        // تحديث درجة الواجب للطالب في الواجهة
        const studentIndex = students.value.findIndex(s => s.id === selectedSubmissionStudent.value.id);
        if (studentIndex !== -1) {
          // تعيين درجة الواجب إلى درجة الواجب الحالي أو 10 كقيمة افتراضية
          students.value[studentIndex].homework = currentAssignment.value.score || 10;
          console.log(`Updated homework grade for student ${students.value[studentIndex].name} to ${students.value[studentIndex].homework}`);
        }
      }

      // إغلاق حوار التسليم وعرض حوار النجاح
      submissionDialog.value = false;
      successDialog.value = true;

      // عرض رسالة تحذير
      alert('تم تسجيل حالة التسليم ولكن قد تكون هناك مشكلة في إضافة الدرجة تلقائياً');
    }

    // تحديث الدرجات بعد التسليم
    await loadGradesAndAttendance();
  } catch (error) {
    console.error('Error submitting assignment status:', error);
    alert('حدث خطأ أثناء تسليم الواجب');
  } finally {
    uploading.value = false;
  }
};

// دوال تفاصيل الطالب
const showStudentDetails = (student) => {
  selectedStudentId.value = student.id;
  console.log('Show details for student:', student.name);

  // نسخ بيانات الطالب للنافذة
  studentDetailsDialog.value.student = { ...student };
  studentDetailsDialog.value.show = true;
  studentDetailsDialog.value.activeTab = 'grades';

  // جلب بيانات الطالب الإضافية
  fetchStudentAttendanceHistory(student.id);
  fetchStudentNotes(student.id);
};

// دالة فتح نافذة إضافة ملاحظة
const openAddNoteDialog = (student) => {
  noteDialog.value = {
    show: true,
    loading: false,
    type: 'positive',
    content: '',
    studentId: student.id
  };
};

// دالة للحصول على عبارة تحفيزية عشوائية
const getRandomCongratsMessage = () => {
  const randomIndex = Math.floor(Math.random() * congratsMessages.value.length);
  return congratsMessages.value[randomIndex];
};

// دالة للتعامل مع تغيير نوع الملاحظة
const onNoteTypeChange = () => {
  // إعادة تعيين محتوى الملاحظة عند تغيير النوع
  noteDialog.value.content = '';
};

// دالة إضافة ملاحظة
const addNote = async () => {
  try {
    noteDialog.value.loading = true;

    // التحقق من صحة البيانات
    if (!noteDialog.value.content) {
      alert('يرجى إدخال محتوى الملاحظة');
      return;
    }

    if (!noteDialog.value.studentId) {
      alert('لم يتم تحديد الطالب');
      return;
    }

    // إنشاء ملاحظة جديدة
    const today = new Date();
    const newNote = {
      student: noteDialog.value.studentId,
      type: noteDialog.value.type,
      content: noteDialog.value.content,
      date: today.toISOString().split('T')[0],
      day_name: getArabicDayName(today) // إضافة اسم اليوم
    };

    // حفظ الملاحظة في قاعدة البيانات
    const savedNote = await gradesStore.saveNote(newNote);
    console.log('Note saved successfully:', savedNote);

    // إضافة الملاحظة إلى القائمة
    studentNotes.value.unshift(savedNote || newNote);

    // إغلاق نافذة الملاحظة
    noteDialog.value.show = false;

    // إذا كانت الملاحظة إيجابية، عرض نافذة التهنئة
    if (noteDialog.value.type === 'positive') {
      // البحث عن الطالب للحصول على بياناته الكاملة
      const student = students.value.find(s => s.id === noteDialog.value.studentId);

      if (student) {
        // إعداد بيانات نافذة التهنئة
        congratsDialog.value = {
          show: true,
          student: {
            ...student,
            image_url: student.image // استخدام صورة الطالب إن وجدت
          },
          message: getRandomCongratsMessage()
        };
      }
    } else {
      // إذا كانت الملاحظة سلبية، عرض رسالة بسيطة
      alert('تمت إضافة الملاحظة بنجاح');
    }
  } catch (error) {
    console.error('Error adding note:', error);
    alert('حدث خطأ أثناء إضافة الملاحظة');
  } finally {
    noteDialog.value.loading = false;
  }
};

// دالة حذف ملاحظة
const deleteNote = async (index) => {
  try {
    const noteToDelete = studentNotes.value[index];
    if (!noteToDelete || !noteToDelete.id) {
      // إذا لم يكن للملاحظة معرف، نحذفها من القائمة فقط
      studentNotes.value.splice(index, 1);
      return;
    }

    // حذف الملاحظة من قاعدة البيانات
    await gradesStore.deleteNote(noteToDelete.id);
    console.log('Note deleted successfully');

    // حذف الملاحظة من القائمة
    studentNotes.value.splice(index, 1);

    alert('تم حذف الملاحظة بنجاح');
  } catch (error) {
    console.error('Error deleting note:', error);
    alert('حدث خطأ أثناء حذف الملاحظة');
  }
};

// دالة حفظ تفاصيل الطالب
const saveStudentDetails = async () => {
  try {
    studentDetailsDialog.value.loading = true;
    console.log('Saving student details:', studentDetailsDialog.value.student);

    // التحقق من وجود البيانات المطلوبة
    if (!studentDetailsDialog.value.student || !selectedSubject.value || !selectedDate.value) {
      alert('بيانات غير مكتملة');
      return;
    }

    // تحضير بيانات الدرجات للحفظ
    const batchGradesData = [];

    // إضافة درجة النظري
    if (studentDetailsDialog.value.student.theory !== undefined) {
      batchGradesData.push({
        student: studentDetailsDialog.value.student.id,
        subject: selectedSubject.value.id,
        date: selectedDate.value,
        type: 'theory',
        score: parseFloat(studentDetailsDialog.value.student.theory) || 0,
        max_score: 15
      });
    }

    // إضافة درجة العملي
    if (studentDetailsDialog.value.student.practical !== undefined) {
      batchGradesData.push({
        student: studentDetailsDialog.value.student.id,
        subject: selectedSubject.value.id,
        date: selectedDate.value,
        type: 'practical',
        score: parseFloat(studentDetailsDialog.value.student.practical) || 0,
        max_score: 5
      });
    }

    // إضافة درجة الواجبات
    if (studentDetailsDialog.value.student.homework !== undefined) {
      batchGradesData.push({
        student: studentDetailsDialog.value.student.id,
        subject: selectedSubject.value.id,
        date: selectedDate.value,
        type: 'homework',
        score: parseFloat(studentDetailsDialog.value.student.homework) || 0,
        max_score: 10
      });
    }

    // إضافة درجة المشاركة
    if (studentDetailsDialog.value.student.participation !== undefined) {
      batchGradesData.push({
        student: studentDetailsDialog.value.student.id,
        subject: selectedSubject.value.id,
        date: selectedDate.value,
        type: 'participation',
        score: parseFloat(studentDetailsDialog.value.student.participation) || 0,
        max_score: 10
      });
    }

    // إضافة درجة القرآن
    if (studentDetailsDialog.value.student.quran !== undefined) {
      batchGradesData.push({
        student: studentDetailsDialog.value.student.id,
        subject: selectedSubject.value.id,
        date: selectedDate.value,
        type: 'quran',
        score: parseFloat(studentDetailsDialog.value.student.quran) || 0,
        max_score: 20
      });
    }

    // إضافة درجة النهائي
    if (studentDetailsDialog.value.student.final !== undefined) {
      batchGradesData.push({
        student: studentDetailsDialog.value.student.id,
        subject: selectedSubject.value.id,
        date: selectedDate.value,
        type: 'final',
        score: parseFloat(studentDetailsDialog.value.student.final) || 0,
        max_score: 40
      });
    }



    // استخدام المتجر الجديد
    // في المتجر الجديد، نحفظ جميع الدرجات في سجل واحد

    // تحقق من وجود أي درجة غير صفرية
    const hasNonZeroGrade =
      parseFloat(studentDetailsDialog.value.student.theory) > 0 ||
      parseFloat(studentDetailsDialog.value.student.practical) > 0 ||
      parseFloat(studentDetailsDialog.value.student.homework) > 0 ||
      parseFloat(studentDetailsDialog.value.student.participation) > 0 ||
      parseFloat(studentDetailsDialog.value.student.quran) > 0 ||
      parseFloat(studentDetailsDialog.value.student.final) > 0;

    if (hasNonZeroGrade) {
      const unifiedGradeData = {
        student_id: studentDetailsDialog.value.student.id,
        subject_id: selectedSubject.value.id,
        date: selectedDate.value,
        theory: parseFloat(studentDetailsDialog.value.student.theory) || 0,
        practical: parseFloat(studentDetailsDialog.value.student.practical) || 0,
        homework: parseFloat(studentDetailsDialog.value.student.homework) || 0,
        participation: parseFloat(studentDetailsDialog.value.student.participation) || 0,
        quran: parseFloat(studentDetailsDialog.value.student.quran) || 0,
        final: parseFloat(studentDetailsDialog.value.student.final) || 0
      };

      console.log('Unified grade data to save for student:', unifiedGradeData);
      await unifiedGradesStore.saveGrade(unifiedGradeData);
    } else {
      console.warn('No grade to save - all grades are zero');
    }

    // تحضير بيانات الحضور
    const today = new Date(selectedDate.value);
    const attendanceData = {
      student: studentDetailsDialog.value.student.id,
      date: selectedDate.value,
      status: studentDetailsDialog.value.student.attendance,
      class_name: selectedClass.value.id,
      section: selectedSection.value.id,
      day_name: getArabicDayName(today) // إضافة اسم اليوم
    };

    // حفظ الحضور باستخدام متجر الدرجات
    await gradesStore.saveAttendance(attendanceData);

    // تحديث بيانات الطالب في الجدول
    const studentIndex = students.value.findIndex(s => s.id === studentDetailsDialog.value.student.id);
    if (studentIndex !== -1) {
      // تحديث البيانات المهمة فقط
      students.value[studentIndex].theory = studentDetailsDialog.value.student.theory;
      students.value[studentIndex].practical = studentDetailsDialog.value.student.practical;
      students.value[studentIndex].homework = studentDetailsDialog.value.student.homework;
      students.value[studentIndex].participation = studentDetailsDialog.value.student.participation;
      students.value[studentIndex].quran = studentDetailsDialog.value.student.quran;
      students.value[studentIndex].final = studentDetailsDialog.value.student.final;
      students.value[studentIndex].attendance = studentDetailsDialog.value.student.attendance;

      // تحديث المجموع الكلي
      students.value[studentIndex].total = calculateTotal(students.value[studentIndex]);
    }

    alert('تم حفظ بيانات الطالب بنجاح');
    studentDetailsDialog.value.show = false;
  } catch (error) {
    console.error('Error saving student details:', error);
    alert('حدث خطأ أثناء حفظ بيانات الطالب');
  } finally {
    studentDetailsDialog.value.loading = false;
  }
};

const handleImageError = (student) => {
  // معالجة خطأ تحميل الصورة
  if (student) {
    student.image = null;
  }
};

// دالة معالجة خطأ صورة الطالب في نافذة التفاصيل
const handleStudentDetailsImageError = () => {
  if (studentDetailsDialog.value.student) {
    studentDetailsDialog.value.student.image = null;
  }
};

// دالة جلب سجل حضور الطالب
const fetchStudentAttendanceHistory = async (studentId) => {
  try {
    console.log('Fetching attendance history for student:', studentId);

    // جلب سجل الحضور من الخادم
    const attendanceData = await gradesStore.fetchAttendanceHistoryByStudent(studentId);
    studentAttendanceHistory.value = attendanceData || [];

    console.log('Attendance history:', studentAttendanceHistory.value);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    studentAttendanceHistory.value = [];
  }
};

// دالة جلب ملاحظات الطالب
const fetchStudentNotes = async (studentId) => {
  try {
    console.log('Fetching notes for student:', studentId);

    // جلب ملاحظات الطالب من الخادم
    const notesData = await gradesStore.fetchNotesByStudent(studentId);
    studentNotes.value = notesData || [];

    console.log('Student notes:', studentNotes.value);
  } catch (error) {
    console.error('Error fetching student notes:', error);
    studentNotes.value = [];
  }
};

// دالة للحصول على رسالة تحفيزية عشوائية باللهجة السعودية
const getRandomMotivationMessage = () => {
  const messages = [
    'ماشاء الله عليك! مره شاطر يا بطل!',
    'والله إنك فنان! استمر على هالمستوى!',
    'يا سلام! هذا هو الشغل الزين!',
    'من جد وجد! أنت مثال للطالب المجتهد!',
    'الله يعطيك العافية! مستوى رهيب!',
    'ما شاء الله تبارك الرحمن! ممتاز يا بطل!',
    'والله إنك فالح! استمر على هالمستوى!',
    'أحسنت! هذا هو الشغل المضبوط!',
    'ما قصرت يا بطل! الله يوفقك!',
    'عساك على القوة دايم! مستوى رهيب!'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

// دالة للحصول على رسالة تشجيعية عشوائية باللهجة السعودية
const getRandomEncouragementMessage = () => {
  const messages = [
    'لا تشيل هم! المرة الجاية بإذن الله أحسن!',
    'خلك قوي! ما يصير إلا الطيب!',
    'الله يعينك! المرة الجاية بتسلم بإذن الله!',
    'لا تحاتي! المرة الجاية بتكون أفضل!',
    'الله يعطيك العافية! حاول تسلم الواجب الجاي بوقته!',
    'لا تشيل هم! الله يعينك على الواجبات الجاية!',
    'الله يوفقك! المرة الجاية بتكون أفضل!',
    'لا تحزن! الله يعينك على الواجبات الجاية!',
    'الله يعطيك العافية! المرة الجاية بتسلم بإذن الله!',
    'لا تشيل هم! المرة الجاية بتكون أفضل!'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

// تم إزالة دالة التعامل مع اكتمال الترحيل

// تحميل البيانات عند تهيئة الصفحة
onMounted(async () => {
  await fetchClasses();
  await fetchSections();
  await fetchSubjects();
  await fetchStudents();
});

// مراقبة التغييرات
watch([selectedClass, selectedSection], () => {
  if (selectedClass.value && selectedSection.value) {
    fetchStudents();
  }
});

watch(selectedSubject, () => {
  if (selectedSubject.value) {
    fetchAssignments();
    // No actualizamos las calificaciones al cambiar de materia
    // ya que todas las materias son parte de Estudios Islámicos
    // y queremos mantener los valores de las calificaciones
    // updateStudentsWithGradesAndAttendance();
  }
});

watch(selectedDate, () => {
  loadGradesAndAttendance();
});
</script>

<style scoped>
.unified-grades-page {
  padding: 16px;
}

.grade-input {
  width: 80px;
  margin: 0 auto;
}

.grades-table-container {
  overflow-x: auto;
}

.grades-table {
  min-width: 1200px;
}

.highlight-row {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.assignment-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.assignment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.active-assignment {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.assignments-list {
  max-height: 500px;
  overflow-y: auto;
}

/* أنماط مربع النجاح */
.celebration-card {
  overflow: hidden;
  position: relative;
  border-radius: 16px;
}

/* أنماط للوضع الفاتح */
.v-theme--light .success-card {
  background: linear-gradient(135deg, #f5fff5 0%, #e0f7e0 100%);
}

.v-theme--light .warning-card {
  background: linear-gradient(135deg, #fffbf0 0%, #fff2d9 100%);
}

/* أنماط للوضع الداكن */
.v-theme--dark .success-card {
  background: linear-gradient(135deg, #0a3d0a 0%, #0e4e0e 100%);
  color: #ffffff;
}

.v-theme--dark .warning-card {
  background: linear-gradient(135deg, #3d2e00 0%, #4e3a00 100%);
  color: #ffffff;
}

.celebration-container {
  position: relative;
  z-index: 2;
}

.student-info {
  animation: fadeInDown 0.8s ease-out;
}

.celebration-animation {
  position: relative;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: var(--v-theme-primary);
  top: -10px;
  left: var(--left);
  opacity: 0.8;
  animation: confettiFall 5s ease-in infinite;
  animation-delay: var(--delay);
  transform: rotate(45deg);
}

.confetti:nth-child(odd) {
  background-color: var(--v-theme-success);
  width: 8px;
  height: 8px;
  animation-duration: 4s;
}

.confetti:nth-child(3n) {
  background-color: var(--v-theme-info);
  width: 12px;
  height: 12px;
  animation-duration: 6s;
  border-radius: 50%;
  transform: none;
}

.confetti:nth-child(5n) {
  background-color: var(--v-theme-warning);
  width: 6px;
  height: 15px;
  animation-duration: 5.5s;
}

/* تعديل ألوان الكونفيتي في الوضع الداكن لتكون أكثر سطوعاً */
.v-theme--dark .confetti {
  opacity: 1;
}

.v-theme--dark .confetti:nth-child(odd) {
  background-color: #4caf50; /* أخضر ساطع */
}

.v-theme--dark .confetti:nth-child(3n) {
  background-color: #2196f3; /* أزرق ساطع */
}

.v-theme--dark .confetti:nth-child(5n) {
  background-color: #ffc107; /* أصفر ساطع */
}

.motivation-message {
  animation: fadeIn 1s ease-out 0.5s both;
  font-weight: bold;
  color: var(--v-theme-primary);
}

/* تعديل لون النص في الوضع الداكن */
.v-theme--dark .motivation-message {
  color: #64b5f6; /* أزرق فاتح للوضع الداكن */
}

.v-theme--dark .text-success {
  color: #81c784 !important; /* أخضر فاتح للوضع الداكن */
}

.v-theme--dark .text-warning {
  color: #ffb74d !important; /* برتقالي فاتح للوضع الداكن */
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(45deg);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translateY(650px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* نافذة التهنئة */
.congratulation-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  overflow: hidden;
  position: relative;
}

.congratulation-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M50 0 L100 50 L50 100 L0 50 Z" fill="rgba(76, 175, 80, 0.05)"/></svg>');
  background-size: 30px 30px;
  opacity: 0.5;
  z-index: 0;
}

.congratulation-content {
  position: relative;
  z-index: 1;
}

.student-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.congratulation-message {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.congratulation-decoration {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  animation: pulse 2s infinite;
}

/* تعديلات للوضع الداكن */
.v-theme--dark .congratulation-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
}

.v-theme--dark .congratulation-message {
  background-color: rgba(30, 30, 30, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
</style>
