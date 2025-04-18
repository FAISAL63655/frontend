<template>
  <div class="grades-page" dir="rtl">
    <!-- جزء البطاقة الرئيسية العلوية -->
    <v-card class="grades-header-card mb-4 elevation-2">
      <!-- عنوان الصفحة والفلاتر -->
      <v-toolbar color="primary" flat class="px-2 rounded-t">
        <v-toolbar-title class="text-white d-flex align-center">
          <v-icon size="large" class="ms-2">mdi-clipboard-text-outline</v-icon>
          <span class="text-h5 font-weight-bold">صفحة الدرجات</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <v-btn variant="tonal" color="white" prepend-icon="mdi-filter-variant" class="ms-2" @click="showFilters = !showFilters">
          الفلاتر
          <v-icon end>{{ showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>

        <v-btn color="white" variant="tonal" prepend-icon="mdi-plus" @click="showAddAssignmentDialog = true">
          إضافة واجب
        </v-btn>
      </v-toolbar>

      <!-- قسم الفلاتر -->
      <v-expand-transition>
        <div v-if="showFilters" class="pa-4 bg-primary-lighten-5">
          <v-row align="center">
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedClass"
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
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedSection"
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
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedSubject"
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
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="selectedDate"
                label="التاريخ"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                hide-details
                bg-color="white"
                class="rounded-lg"
                @update:model-value="dateChanged"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>

      <!-- معلومات التاريخ والفترة -->
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <div class="d-flex align-center">
              <v-chip class="ma-2" color="info" prepend-icon="mdi-calendar" elevation="1">
                {{ currentDate }}
              </v-chip>
              <v-chip class="ma-2" color="success" prepend-icon="mdi-clock-outline" elevation="1">
                {{ currentPeriod }}
              </v-chip>
            </div>
          </v-col>
        </v-row>

        <!-- قسم قائمة الواجبات -->
        <v-row v-if="assignments.length > 0">
          <v-col cols="12">
            <v-card class="assignment-selector-card rounded-lg">
              <v-toolbar density="compact" color="blue-lighten-4">
                <v-toolbar-title class="d-flex align-center">
                  <v-icon start>mdi-bookshelf</v-icon>
                  <span>الواجبات ({{ assignments.length }})</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  @click="showAssignmentsSelector = !showAssignmentsSelector"
                >
                  <v-icon>{{ showAssignmentsSelector ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  {{ showAssignmentsSelector ? 'إغلاق القائمة' : 'عرض القائمة' }}
                </v-btn>
              </v-toolbar>

              <!-- قائمة الواجبات المحسنة -->
              <v-expand-transition>
                <div v-if="showAssignmentsSelector" class="pa-2">
                  <v-list class="assignment-list">
                    <v-list-item
                      v-for="assignment in assignments"
                      :key="assignment.id"
                      :active="currentAssignment && currentAssignment.id === assignment.id"
                      @click="setActiveAssignment(assignment)"
                      :rounded="true"
                      :border="currentAssignment && currentAssignment.id === assignment.id"
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
                        <v-chip size="small" variant="elevated" :color="isAssignmentDueSoon && currentAssignment && currentAssignment.id === assignment.id ? 'error' : 'success'">
                          {{ formatDate(assignment.due_date) }}
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>
              </v-expand-transition>
            </v-card>
          </v-col>
        </v-row>

        <!-- قسم معلومات الواجب الحالي المحسن -->
        <v-row v-if="currentAssignment">
          <v-col cols="12">
            <v-card variant="elevated" class="assignment-details-card">
              <v-banner
                color="warning"
                icon="mdi-book-alert"
                lines="three"
                sticky
              >
                <v-banner-text>
                  <div class="d-flex flex-column">
                    <div class="text-h6 font-weight-bold mb-1">{{ currentAssignment.title }}</div>
                    <div v-if="currentAssignment.description" class="text-body-2 mb-2">
                      {{ currentAssignment.description }}
                    </div>
                    <div class="d-flex flex-wrap gap-2 mt-1">
                      <v-chip size="small" color="primary" class="ms-2" variant="outlined">
                        <v-icon start size="x-small">mdi-calendar-plus</v-icon>
                        تاريخ الإضافة: {{ formatDate(currentAssignment.created_at) }}
                      </v-chip>
                      <v-chip size="small" :color="isAssignmentDueSoon ? 'error' : 'success'" class="ms-2" variant="outlined">
                        <v-icon start size="x-small">mdi-calendar-clock</v-icon>
                        تاريخ التسليم: {{ formatDate(currentAssignment.due_date) }}
                      </v-chip>
                      <v-chip size="small" color="info" variant="outlined">
                        <v-icon start size="x-small">mdi-star</v-icon>
                        الدرجة: {{ currentAssignment.score }}
                      </v-chip>
                    </div>
                  </div>
                </v-banner-text>
                <template #actions>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="error"
                      variant="tonal"
                      size="small"
                      icon="mdi-delete"
                      @click="deleteCurrentAssignment"
                    ></v-btn>
                    <v-btn
                      color="info"
                      variant="tonal"
                      size="small"
                      icon="mdi-pencil"
                      @click="showEditAssignmentDialog = true"
                    ></v-btn>
                    <v-badge
                      :content="pendingSubmissionsCount"
                      :color="pendingSubmissionsCount > 0 ? 'error' : 'success'"
                      v-if="pendingSubmissionsCount > 0"
                    >
                      <v-btn
                        color="warning"
                        variant="elevated"
                        size="small"
                        prepend-icon="mdi-check-all"
                        @click="markAllSubmitted"
                      >
                        تم تسليم الجميع
                      </v-btn>
                    </v-badge>
                  </div>
                </template>
              </v-banner>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- جدول الطلاب المحسن -->
    <v-card class="student-grades-table-card elevation-2">
      <v-toolbar color="blue-lighten-5" density="compact" class="rounded-t">
        <v-toolbar-title>
          <div class="d-flex align-center">
            <v-icon start class="me-2">mdi-account-group</v-icon>
            <span>قائمة الطلاب</span>
          </div>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="بحث"
          single-line
          hide-details
          density="compact"
          bg-color="white"
          class="mx-2"
          style="max-width: 250px;"
        ></v-text-field>
      </v-toolbar>

      <v-data-table
        :headers="headers"
        :items="students"
        :search="search"
        :items-per-page="itemsPerPage"
        :page="currentPage"
        @update:page="currentPage = $event"
        @update:items-per-page="itemsPerPage = $event"
        class="elevation-0 student-data-table"
        item-value="id"
        hover
      >
        <!-- Image Column -->
        <template #[`item.image`]="{ item }">
          <v-avatar size="40" class="elevation-1" :color="item.image ? undefined : getAvatarColor(item.name)" style="border: 2px solid #f5f5f5;">
            <v-img
              v-if="item.image"
              :src="item.image"
              alt="Student"
              cover
              @error="handleImageError(item)"
            ></v-img>
            <span v-else class="text-subtitle-2 text-white">{{ getInitials(item.name) }}</span>
          </v-avatar>
        </template>

        <!-- Name Column -->
        <template #[`item.name`]="{ item }">
          <a href="#" @click.prevent="openStudentDetails(item)">{{ item.name }}</a>
        </template>

        <!-- Theory Column -->
        <template #[`item.theory`]="{ item }">
          <div class="d-flex align-center">
            <v-text-field
              v-model="item.theory"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
              min="0"
              max="15"
              style="width: 70px"
              @update:model-value="saveGrade(item, 'theory')"
            ></v-text-field>
          </div>
        </template>

        <!-- Practical Column (Oral) -->
        <template #[`item.practical`]="{ item }">
          <div class="d-flex align-center">
            <v-text-field
              v-model="item.practical"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
              min="0"
              max="5"
              style="width: 70px"
              @update:model-value="saveGrade(item, 'practical')"
            ></v-text-field>
          </div>
        </template>

        <!-- Homework Column -->
        <template #[`item.homework`]="{ item }">
          <div class="d-flex align-center">
            <v-text-field
              v-model="item.homework"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
              min="0"
              max="10"
              style="width: 70px"
              @update:model-value="saveGrade(item, 'homework')"
            ></v-text-field>
          </div>
        </template>

        <!-- Participation Column -->
        <template #[`item.participation`]="{ item }">
          <div class="d-flex align-center">
            <v-text-field
              v-model="item.participation"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
              min="0"
              max="10"
              style="width: 70px"
              @update:model-value="saveGrade(item, 'participation')"
            ></v-text-field>
          </div>
        </template>

        <!-- Final Column -->
        <template #[`item.final`]="{ item }">
          <div class="d-flex align-center">
            <v-text-field
              v-model="item.final"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
              min="0"
              max="40"
              style="width: 70px"
              @update:model-value="saveGrade(item, 'final')"
            ></v-text-field>
          </div>
        </template>

        <!-- Quran Column -->
        <template #[`item.quran`]="{ item }">
          <div class="d-flex align-center">
            <v-text-field
              v-model="item.quran"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
              min="0"
              max="20"
              style="width: 70px"
              @update:model-value="saveGrade(item, 'quran')"
            ></v-text-field>
          </div>
        </template>

        <!-- Total Column -->
        <template #[`item.total`]="{ item }">
          <strong>{{ calculateTotal(item) }}</strong>
        </template>

        <!-- Attendance Column -->
        <template #[`item.attendance`]="{ item }">
          <v-btn-toggle v-model="item.attendance" mandatory>
            <v-btn
              :value="'present'"
              :color="item.attendance === 'present' ? 'success' : ''"
              icon="mdi-check"
              size="small"
              @click="saveAttendance(item, 'present')"
            ></v-btn>
            <v-btn
              :value="'absent'"
              :color="item.attendance === 'absent' ? 'error' : ''"
              icon="mdi-close"
              size="small"
              @click="saveAttendance(item, 'absent')"
            ></v-btn>
          </v-btn-toggle>
        </template>

        <!-- Assignments Column -->
        <template #[`item.assignments`]="{ item }">
          <div class="d-flex align-center">
            <v-btn-toggle v-model="item.assignmentStatus" mandatory :disabled="!currentAssignment">
              <v-btn
                :value="'submitted'"
                :color="item.assignmentStatus === 'submitted' ? 'success' : ''"
                icon="mdi-check"
                size="small"
                @click="saveAssignmentSubmission(item, 'submitted')"
              ></v-btn>
              <v-btn
                :value="'not_submitted'"
                :color="item.assignmentStatus === 'not_submitted' ? 'error' : ''"
                icon="mdi-close"
                size="small"
                @click="saveAssignmentSubmission(item, 'not_submitted')"
              ></v-btn>
            </v-btn-toggle>
            <v-icon
              v-if="currentAssignment"
              color="warning"
              size="small"
              class="ms-2"
              icon="mdi-star"
              title="هناك واجب يحتاج إلى تسليم"
            ></v-icon>
          </div>
        </template>

        <!-- Notes Column -->
        <template #[`item.notes`]="{ item }">
          <div>
            <v-btn
              :color="item.noteType === 'positive' ? 'success' : item.noteType === 'negative' ? 'error' : 'grey'"
              icon="mdi-note-text"
              size="small"
              @click="noteMenuOpen[item.id] = !noteMenuOpen[item.id]"
            ></v-btn>

            <v-dialog
              v-model="noteMenuOpen[item.id]"
              max-width="400px"
              persistent
            >
              <v-card>
                <v-card-title>ملاحظات الطالب: {{ item.name }}</v-card-title>
                <v-card-text>
                  <v-textarea
                    v-model="item.noteContent"
                    label="أضف ملاحظة"
                    rows="3"
                    autofocus
                  ></v-textarea>
                  <v-radio-group v-model="item.noteType" inline>
                    <v-radio label="إيجابية" value="positive"></v-radio>
                    <v-radio label="سلبية" value="negative"></v-radio>
                  </v-radio-group>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" @click="noteMenuOpen[item.id] = false">إلغاء</v-btn>
                  <v-btn color="primary" @click="saveNote(item); noteMenuOpen[item.id] = false">حفظ</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </template>
      </v-data-table>
      <!-- أزرار التنقل بين الصفحات -->
      <div class="d-flex flex-column align-center pa-4 bg-blue-lighten-5 rounded-b">
        <v-pagination
          v-model="currentPage"
          :length="pageCount"
          :total-visible="5"
          rounded="circle"
          color="primary"
          @click:prev="prevPage"
          @click:next="nextPage"
        ></v-pagination>

        <div class="d-flex align-center mt-2">
          <span class="me-4">عناصر في الصفحة:</span>
          <v-btn-toggle
            v-model="itemsPerPage"
            mandatory
            density="comfortable"
            color="primary"
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

    <!-- Add Assignment Dialog -->
    <v-dialog v-model="showAddAssignmentDialog" max-width="500px" dir="rtl">
      <v-card>
        <v-card-title>إضافة واجب جديد</v-card-title>
        <v-card-text>
          <v-form ref="assignmentForm">
            <v-text-field
              v-model="newAssignment.title"
              label="عنوان الواجب"
              required
            ></v-text-field>
            <v-textarea
              v-model="newAssignment.description"
              label="وصف الواجب"
              rows="3"
            ></v-textarea>
            <v-text-field
              v-model="newAssignment.score"
              label="الدرجة"
              type="number"
              min="1"
              required
            ></v-text-field>
            <v-text-field
              v-model="newAssignment.dueDate"
              label="تاريخ التسليم"
              type="date"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="showAddAssignmentDialog = false">إلغاء</v-btn>
          <v-btn color="primary" @click="addAssignment">إضافة</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Student Details Dialog -->
    <v-dialog v-model="showStudentDetailsDialog" max-width="800px" dir="rtl">
      <v-card>
        <v-card-title class="d-flex flex-column align-start">
          <div class="d-flex align-center gap-2 mb-2">
            <v-avatar size="60" class="elevation-2" :color="selectedStudent?.image ? undefined : getAvatarColor(selectedStudent?.name || '')">
              <v-img
                v-if="selectedStudent?.image"
                :src="selectedStudent.image"
                cover
                alt="صورة الطالب"
                @error="handleStudentDetailsImageError"
              ></v-img>
              <span v-else class="text-h5 text-white">{{ getInitials(selectedStudent?.name || 'ط') }}</span>
            </v-avatar>
            <div>
              <h3 class="text-h5 font-weight-bold mb-1">{{ selectedStudent?.name }}</h3>
              <div class="d-flex align-center">
                <v-chip size="small" color="primary" variant="outlined" class="ms-2">
                  {{ selectedStudent?.class_name }}
                </v-chip>
                <v-chip size="small" color="info" variant="outlined">
                  {{ selectedStudent?.section }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <v-tabs v-model="activeTab">
            <v-tab value="grades">الدرجات</v-tab>
            <v-tab value="attendance">الحضور</v-tab>
            <v-tab value="assignments">الواجبات</v-tab>
            <v-tab value="notes">الملاحظات</v-tab>
          </v-tabs>
          <v-window v-model="activeTab">
            <v-window-item value="grades">
              <v-list>
                <v-list-item v-for="(grade, index) in studentGrades" :key="index">
                  <template #prepend>
                    <v-icon :color="getGradeColor(grade.type)" class="me-2">mdi-school</v-icon>
                  </template>
                  <v-list-item-title>
                    <strong>{{ grade.type }}:</strong> {{ grade.score }}
                    <v-chip size="x-small" color="primary" class="ms-2">المادة: {{ grade.subject }}</v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span class="text-caption">تاريخ التسجيل: {{ formatDate(grade.created_at) }}</span>
                    <span class="text-caption me-2">تاريخ الدرجة: {{ formatDate(grade.date) }}</span>
                  </v-list-item-subtitle>
                  <template #append>
                    <div class="d-flex">
                      <v-btn icon="mdi-pencil" size="small" color="primary" class="me-1" @click="editGradeRecord(grade, index)" title="تعديل"></v-btn>
                      <v-btn icon="mdi-delete" size="small" color="error" @click="deleteGradeRecord(grade, index)" title="حذف"></v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>
            <v-window-item value="attendance">
              <v-list>
                <v-list-item v-for="(record, index) in studentAttendance" :key="index">
                  <template #prepend>
                    <v-icon :color="record.status === 'present' ? 'success' : 'error'" class="me-2">
                      {{ record.status === 'present' ? 'mdi-account-check' : 'mdi-account-cancel' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>
                    <strong>تاريخ:</strong> {{ formatDate(record.date) }}
                    <v-chip size="x-small" :color="record.status === 'present' ? 'success' : 'error'" class="ms-2">
                      {{ record.status_display }}
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span v-if="record.schedule_info" class="text-caption">المادة: {{ record.schedule_info }}</span>
                    <span class="text-caption me-2">تاريخ التسجيل: {{ formatDate(record.created_at) }}</span>
                  </v-list-item-subtitle>
                  <template #append>
                    <div class="d-flex">
                      <v-btn icon="mdi-pencil" size="small" color="primary" class="me-1" @click="editAttendanceRecord(record, index)" title="تعديل"></v-btn>
                      <v-btn icon="mdi-delete" size="small" color="error" @click="deleteAttendanceRecord(record, index)" title="حذف"></v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>
            <v-window-item value="assignments">
              <v-list>
                <v-list-item v-for="(assignment, index) in studentAssignments" :key="index">
                  <template #prepend>
                    <v-icon :color="assignment.status === 'submitted' ? 'success' : 'error'" class="me-2">
                      {{ assignment.status === 'submitted' ? 'mdi-file-check' : 'mdi-file-cancel' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>
                    <strong>{{ assignment.title }}</strong>
                    <v-chip size="x-small" color="primary" class="ms-2">المادة: {{ assignment.subject_info }}</v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="assignment.status === 'submitted' ? 'success' : 'error'"
                      size="small"
                    >
                      {{ assignment.status_display }}
                    </v-chip>
                    <span v-if="assignment.status === 'submitted'" class="ms-2">
                      الدرجة: {{ assignment.score }}
                    </span>
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    <span v-if="assignment.due_date" class="text-caption">تاريخ التسليم: {{ formatDate(assignment.due_date) }}</span>
                    <span class="text-caption me-2">تاريخ التسجيل: {{ formatDate(assignment.created_at) }}</span>
                  </v-list-item-subtitle>
                  <template #append>
                    <div class="d-flex">
                      <v-btn icon="mdi-pencil" size="small" color="primary" class="me-1" title="تعديل"></v-btn>
                      <v-btn icon="mdi-delete" size="small" color="error" title="حذف"></v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>
            <v-window-item value="notes">
              <v-list>
                <v-list-item v-for="(note, index) in studentNotes" :key="index">
                  <template #prepend>
                    <v-icon :color="note.type === 'positive' ? 'success' : 'error'" class="me-2">
                      {{ note.type === 'positive' ? 'mdi-note-check' : 'mdi-note-alert' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>
                    <strong>{{ note.content }}</strong>
                    <v-chip size="x-small" color="primary" class="ms-2">المادة: {{ note.schedule_info }}</v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="note.type === 'positive' ? 'success' : 'error'"
                      size="small"
                    >
                      {{ note.type_display }}
                    </v-chip>
                    <span class="ms-2">بواسطة: {{ note.created_by }}</span>
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    <span class="text-caption">تاريخ: {{ formatDate(note.date) }}</span>
                  </v-list-item-subtitle>
                  <template #append>
                    <div class="d-flex">
                      <v-btn icon="mdi-pencil" size="small" color="primary" class="me-1" @click="editNoteRecord(note, index)" title="تعديل"></v-btn>
                      <v-btn icon="mdi-delete" size="small" color="error" @click="deleteNoteRecord(note, index)" title="حذف"></v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showStudentDetailsDialog = false">إغلاق</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>



    <!-- Edit Note Dialog -->
    <v-dialog v-model="showEditNoteDialog" max-width="500px" dir="rtl">
      <v-card>
        <v-card-title>
          <span>تعديل الملاحظة</span>
          <v-chip v-if="selectedStudent" size="small" color="primary" class="ms-2">الطالب: {{ selectedStudent.name }}</v-chip>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-textarea
              v-model="editedNote.content"
              label="محتوى الملاحظة"
              required
              autofocus
              :counter="500"
              :hint="`الحد الأقصى 500 حرف`"
              persistent-hint
            ></v-textarea>
            <v-select
              v-model="editedNote.type"
              :items="noteTypes"
              item-title="text"
              item-value="value"
              label="نوع الملاحظة"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="showEditNoteDialog = false">إلغاء</v-btn>
          <v-btn color="primary" @click="updateNoteRecord" :loading="isSubmitting">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Attendance Dialog -->
    <v-dialog v-model="showEditAttendanceDialog" max-width="500px" dir="rtl">
      <v-card>
        <v-card-title>
          <span>تعديل سجل الحضور</span>
          <v-chip v-if="selectedStudent" size="small" color="primary" class="ms-2">الطالب: {{ selectedStudent.name }}</v-chip>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-select
              v-model="editedAttendance.status"
              :items="attendanceStatuses"
              item-title="text"
              item-value="value"
              label="حالة الحضور"
              required
            ></v-select>
            <v-text-field
              v-model="editedAttendance.date"
              label="تاريخ الحضور"
              type="date"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="showEditAttendanceDialog = false">إلغاء</v-btn>
          <v-btn color="primary" @click="updateAttendanceRecord" :loading="isSubmitting">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Assignment Dialog -->
    <v-dialog v-model="showAddAssignmentDialog" max-width="500px" dir="rtl">
      <v-card>
        <v-card-title>إضافة واجب جديد</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newAssignment.title"
            label="عنوان الواجب"
            required
          ></v-text-field>
          <v-textarea
            v-model="newAssignment.description"
            label="وصف الواجب"
            rows="3"
          ></v-textarea>
          <v-text-field
            v-model="newAssignment.score"
            label="الدرجة"
            type="number"
            min="1"
            max="100"
          ></v-text-field>
          <v-text-field
            v-model="newAssignment.dueDate"
            label="تاريخ التسليم"
            type="date"
            required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="showAddAssignmentDialog = false">إلغاء</v-btn>
          <v-btn color="primary" @click="addAssignment">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Assignment Dialog -->
    <v-dialog v-model="showEditAssignmentDialog" max-width="500px">
      <v-card>
        <v-card-title>تعديل الواجب</v-card-title>
        <v-card-text v-if="currentAssignment">
          <v-text-field
            v-model="currentAssignment.title"
            label="عنوان الواجب"
            required
          ></v-text-field>
          <v-textarea
            v-model="currentAssignment.description"
            label="وصف الواجب"
            rows="3"
          ></v-textarea>
          <v-text-field
            v-model="currentAssignment.score"
            label="الدرجة"
            type="number"
            min="1"
            max="100"
          ></v-text-field>
          <v-text-field
            v-model="currentAssignment.due_date"
            label="تاريخ التسليم"
            type="date"
            required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="showEditAssignmentDialog = false">إلغاء</v-btn>
          <v-btn color="primary" @click="updateCurrentAssignment">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- نافذة التشجيع -->
    <EncouragementDialog
      :show="showEncouragementDialog"
      @update:show="showEncouragementDialog = $event"
      :student-name="encouragementStudent.name"
      :student-image="encouragementStudent.image"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import api, { getFullImageUrl } from '@/services/apiConfig'
import EncouragementDialog from '@/components/EncouragementDialog.vue'
import NotificationHelper from '@/services/NotificationHelper'
import { getInitials, getAvatarColor } from '@/utils/imageUtils'
import { useGradesStore } from '@/stores/gradesStore'

// دالة مساعدة للتأكد من وجود صورة أو استخدام الحرف الأول من الاسم
const getStudentImage = (imagePath) => {
  // إذا لم يكن هناك مسار، استخدم null لعرض الحرف الأول من الاسم
  if (!imagePath) {
    console.log('GradesView: لا يوجد مسار للصورة، سيتم استخدام الحرف الأول من الاسم')
    return null
  }

  // إذا كان المسار يبدأ بـ http أو https
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // التحقق من أن المسار يشير إلى صورة موجودة
    if (imagePath.includes('teachease-backend.onrender.com/media/')) {
      // استخراج اسم الملف من المسار
      const parts = imagePath.split('/')
      const filename = parts[parts.length - 1]

      // استخراج الجزء الأساسي من عنوان API
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/'
      const baseUrl = apiBaseUrl.endsWith('/api/')
        ? apiBaseUrl.slice(0, -4) // إزالة '/api'
        : apiBaseUrl.endsWith('/api')
          ? apiBaseUrl.slice(0, -3) // إزالة 'api'
          : apiBaseUrl

      // إنشاء مسار جديد باستخدام المجلد الصحيح
      const newUrl = `${baseUrl}/media/students/${filename}`
      console.log(`GradesView: تم تحويل مسار الصورة من ${imagePath} إلى ${newUrl}`)
      return newUrl
    }

    // إذا كان المسار كاملاً ولكن ليس من الخادم الخاص بنا
    return imagePath
  }

  // إذا كان المسار يبدأ بـ /media
  if (imagePath.startsWith('/media/')) {
    // استخدام دالة getFullImageUrl للحصول على المسار الكامل
    return getFullImageUrl(imagePath)
  }

  // إذا كان المسار يبدأ بـ students/
  if (imagePath.startsWith('students/')) {
    // استخدام دالة getFullImageUrl للحصول على المسار الكامل
    return getFullImageUrl(imagePath)
  }

  // التحقق من أن المسار لا يحتوي على أحرف غير صالحة
  if (imagePath.includes('undefined') || imagePath.includes('null')) {
    console.log('GradesView: مسار الصورة يحتوي على قيم غير صالحة:', imagePath)
    return null
  }

  // إذا لم يتطابق المسار مع أي من الحالات السابقة، استخدم null لعرض الحرف الأول من الاسم
  console.log(`GradesView: مسار غير معروف: ${imagePath}، سيتم استخدام الحرف الأول من الاسم`)
  return null
}

// دالة للتعامل مع أخطاء تحميل الصور في الجدول
const handleImageError = (item) => {
  console.error('GradesView: خطأ في تحميل صورة الطالب')

  try {
    // التحقق من وجود العنصر
    if (!item) {
      console.log('handleImageError: العنصر غير موجود');
      return;
    }

    // تعيين الصورة إلى null لعرض الحرف الأول من الاسم
    item.image = null;
    console.log('handleImageError: تم تعيين الصورة إلى null لعرض الحرف الأول للطالب:', item.name || 'unknown');
  } catch (error) {
    console.error('handleImageError: خطأ في معالجة خطأ الصورة:', error);
  }
}

// دالة للتعامل مع أخطاء تحميل صورة الطالب في حوار التفاصيل
const handleStudentDetailsImageError = () => {
  console.error('GradesView: خطأ في تحميل صورة الطالب في حوار التفاصيل')

  try {
    // التحقق من وجود الطالب المحدد
    if (selectedStudent.value) {
      // تعيين الصورة إلى null لعرض الحرف الأول من الاسم
      selectedStudent.value.image = null
      console.log('handleStudentDetailsImageError: تم تعيين الصورة إلى null لعرض الحرف الأول للطالب:', selectedStudent.value.name || 'unknown');
    }
  } catch (error) {
    console.error('handleStudentDetailsImageError: خطأ في معالجة خطأ الصورة:', error);
  }
}

// متغيرات جديدة للتصميم
const showFilters = ref(true)
const search = ref('')

// متغيرات تصفح الصفحات
const currentPage = ref(1)
const itemsPerPage = ref(10)
const pageCount = computed(() => {
  return Math.ceil(students.value.length / (itemsPerPage.value === -1 ? students.value.length : itemsPerPage.value))
})
const paginationStart = computed(() => {
  if (students.value.length === 0) return 0
  if (itemsPerPage.value === -1) return 1
  return (currentPage.value - 1) * itemsPerPage.value + 1
})
const paginationEnd = computed(() => {
  if (students.value.length === 0) return 0
  if (itemsPerPage.value === -1) return students.value.length
  return Math.min(currentPage.value * itemsPerPage.value, students.value.length)
})

// وظائف التصفح
const nextPage = () => {
  if (currentPage.value < pageCount.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Data
const classes = ref([])
const sections = ref([])
const subjects = ref([])
const students = ref([])
const selectedClass = ref(null)
const selectedSection = ref(null)
const selectedSubject = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0]) // التاريخ المحدد بتنسيق YYYY-MM-DD
const currentDate = ref(new Date().toLocaleDateString('ar-SA'))
const currentPeriod = ref('الحصة الثانية')

// نوافذ الحوار للتعديل
const showEditNoteDialog = ref(false)
const showEditAttendanceDialog = ref(false)
const showEditAssignmentDialog = ref(false)

// حالة التحميل
const isSubmitting = ref(false)

// البيانات المعدلة
const editedNote = ref({})
const editedAttendance = ref({})
const editedIndex = ref(-1)

// قوائم الخيارات
const noteTypes = [
  { text: 'إيجابية', value: 'positive' },
  { text: 'سلبية', value: 'negative' }
]

const attendanceStatuses = [
  { text: 'حاضر', value: 'present' },
  { text: 'غائب', value: 'absent' }
]

// متغيرات الواجبات
const assignments = ref([]) // قائمة الواجبات للمادة المحددة
const currentAssignment = ref(null) // الواجب الحالي النشط
const pendingSubmissionsCount = ref(0) // عدد الواجبات التي لم يتم تسليمها
const isAssignmentDueSoon = ref(false) // هل موعد تسليم الواجب قريب
// عرض نافذة تعديل الواجب الحالي
const showAssignmentsSelector = ref(false) // عرض قائمة اختيار الواجبات

// Dialogs
const showAddAssignmentDialog = ref(false)
const showStudentDetailsDialog = ref(false)
const selectedStudent = ref(null)
const activeTab = ref('grades')

// New Assignment
const newAssignment = ref({
  title: '',
  description: '',
  score: 10,
  dueDate: new Date().toISOString().substring(0, 10)
})

// Student details data
const studentGrades = ref([])
const studentAttendance = ref([])
const studentAssignments = ref([])
const studentNotes = ref([])

// متغيرات نافذة التشجيع
const showEncouragementDialog = ref(false)
const encouragementStudent = ref({
  name: '',
  image: ''
})

// Notes menu state
const noteMenuOpen = ref({})

// Table headers
const headers = ref([
  { title: 'الصورة', key: 'image', align: 'center', sortable: false },
  { title: 'الاسم', key: 'name', align: 'start' },
  { title: 'الصف', key: 'class_name', align: 'start' },
  { title: 'الفصل', key: 'section', align: 'start' },
  { title: 'الملاحظات', key: 'notes', align: 'center', sortable: false },
  { title: 'الواجبات', key: 'assignments', align: 'center', sortable: false },
  { title: 'الحضور', key: 'attendance', align: 'center', sortable: false },
  { title: 'المجموع (100)', key: 'total', align: 'center' },
  { title: 'النهائي (40)', key: 'final', align: 'center' },
  { title: 'القرآن (20)', key: 'quran', align: 'center' },
  { title: 'المشاركة (10)', key: 'participation', align: 'center' },
  { title: 'الواجبات (10)', key: 'homework', align: 'center' },
  { title: 'الشفوي (5)', key: 'practical', align: 'center' },
  { title: 'النظري (15)', key: 'theory', align: 'center' }
])

// مراقبة تغيير الصف
watch(selectedClass, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    console.log(`Class changed from ${oldValue} to ${newValue}`)
    // تحديث البيانات عند تغيير الصف
    await fetchStudents()
    await fetchCurrentAssignment()
    updateAssignmentStatus()
  }
})

// مراقبة تغيير الفصل
watch(selectedSection, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    console.log(`Section changed from ${oldValue} to ${newValue}`)
    // تحديث البيانات عند تغيير الفصل
    await fetchStudents()
    await fetchCurrentAssignment()
    updateAssignmentStatus()
  }
})

// مراقبة تغيير المادة
watch(selectedSubject, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    console.log(`Subject changed from ${oldValue} to ${newValue}`)

    // تحديث البيانات عند تغيير المادة
    await fetchStudents()

    // جلب الواجبات للمادة الجديدة
    await fetchCurrentAssignment()

    // إذا لم يتم العثور على واجبات للمادة الجديدة، إعادة تعيين الواجب الحالي إلى null
    if (assignments.value.length === 0) {
      currentAssignment.value = null
      console.log('No assignments found for the new subject, resetting current assignment')
    }

    // تحديث حالة تسليم الواجبات
    updateAssignmentStatus()
  }
})

// وظيفة معالجة تغيير التاريخ
const dateChanged = async () => {
  console.log('Date changed to:', selectedDate.value)
  // تحديث البيانات بناءً على التاريخ الجديد
  await fetchStudents()
}

// مراقبة تغيير التاريخ
watch(selectedDate, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    console.log(`Date changed from ${oldValue} to ${newValue}`)
    // تحديث البيانات عند تغيير التاريخ
    await fetchStudents()
  }
})

// Fetch data on component mount
onMounted(async () => {
  try {
    // Fetch classes
    const classesResponse = await api.get('classes/')
    classes.value = classesResponse.data || []

    console.log('Fetched classes:', classes.value)

    if (classes.value.length > 0) {
      selectedClass.value = classes.value[0].id
    }

    // Fetch sections
    const sectionsResponse = await api.get('sections/')
    sections.value = sectionsResponse.data || []

    console.log('Fetched sections:', sections.value)

    if (sections.value.length > 0) {
      selectedSection.value = sections.value[0].id
    }

    // Fetch subjects
    const subjectsResponse = await api.get('subjects/')
    subjects.value = subjectsResponse.data || []

    console.log('Fetched subjects:', subjects.value)

    if (subjects.value.length > 0) {
      selectedSubject.value = subjects.value[0].id
    }

    // Fetch students
    await fetchStudents()

    // جلب الواجب الحالي وتحديث حالة الواجبات
    await fetchCurrentAssignment()
    updateAssignmentStatus()
  } catch (error) {
    console.error('Error fetching initial data:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    // For demo purposes, add some dummy data if API fails
    addDummyData()
  }
})

// Inicializar el store de calificaciones
const gradesStore = useGradesStore()

// Fetch students based on selected class and section
const fetchStudents = async () => {
  if (!selectedClass.value || !selectedSection.value || !selectedSubject.value) return

  try {
    const studentsTimerLabel = `fetchStudents-${Date.now()}`
    console.time(studentsTimerLabel)

    // Usar el store para obtener los estudiantes
    const studentsData = await gradesStore.fetchStudentsByClassAndSection(selectedClass.value, selectedSection.value)
    console.log('Fetched students from store:', studentsData)

    // إنشاء قائمة الطلاب مع الدرجات الافتراضية
    const studentsWithGrades = studentsData.map(student => {
      // طباعة البيانات الواردة من الخادم للتأكد من صحتها
      console.log('Raw student data from server:', student)

      // التعامل مع الصورة بشكل صحيح
      let imageUrl = null; // استخدام null لعرض الحرف الأول من الاسم
      if (student.image) {
        // استخدام image_url إذا كانت موجودة (من الخادم)
        if (student.image_url) {
          imageUrl = student.image_url;
        } else {
          // استخدام دالة getStudentImage للحصول على المسار الكامل
          imageUrl = getStudentImage(student.image, student.name);
        }
      }
      console.log(`صورة الطالب ${student.name}:`, student.image, ' -> ', imageUrl);

      return {
        id: student.id,
        name: student.name,
        class_id: student.class_name,  // في الخادم الخلفي، الحقل هو class_name وليس class_id
        section_id: student.section,   // في الخادم الخلفي، الحقل هو section وليس section_id
        class_name: student.class_name_display || '',  // من StudentDetailSerializer
        section: student.section_display || '',        // من StudentDetailSerializer
        image: imageUrl,
        theory: null,
        practical: null,
        homework: null,
        participation: null,
        quran: null,
        final: null,
        attendance: 'present',
        assignmentStatus: 'not_submitted',
        noteContent: '',
        noteType: 'positive'
      }
    })

    // الحصول على المادة المحددة
    const selectedSubjectObj = subjects.value.find(s => s.id === selectedSubject.value)
    console.log('Selected subject:', selectedSubjectObj)

    // تحديد ما إذا كانت المادة المحددة هي مادة فرعية
    const isSubSubject = selectedSubjectObj && selectedSubjectObj.parent_subject
    console.log('Is sub subject:', isSubSubject)

    // Obtener todos los IDs de estudiantes
    const studentIds = studentsWithGrades.map(student => student.id)

    // Obtener todas las calificaciones en una sola solicitud
    const gradesTimerLabel = `fetchGrades-${Date.now()}`
    console.time(gradesTimerLabel)
    await gradesStore.fetchGradesForStudents(studentIds)
    console.timeEnd(gradesTimerLabel)

    // Procesar las calificaciones para cada estudiante
    for (const student of studentsWithGrades) {
      try {
        // Obtener las calificaciones del estudiante del store
        const studentGrades = gradesStore.getGradesByStudent(student.id) || []

        // Filtrar las calificaciones para la materia seleccionada
        const subjectGrades = studentGrades.filter(grade => grade.subject === selectedSubject.value)
        console.log(`Grades for student ${student.id} in subject ${selectedSubject.value}:`, subjectGrades)

        // Asignar las calificaciones al estudiante
        if (subjectGrades.length > 0) {
          for (const grade of subjectGrades) {
            if (grade.type === 'theory') {
              student.theory = grade.score
            } else if (grade.type === 'practical') {
              // التحقق من قيمة max_score للتمييز بين الشفوي والواجبات
              if (grade.max_score === 10) {
                // هذه درجة واجبات
                student.homework = grade.score
              } else {
                // هذه درجة شفوي
                student.practical = grade.score
              }
            } else if (grade.type === 'participation') {
              student.participation = grade.score
            } else if (grade.type === 'quran') {
              student.quran = grade.score
            } else if (grade.type === 'final') {
              student.final = grade.score
            }
          }
        }

        // Si es una materia secundaria, obtener calificaciones de la materia principal
        if (isSubSubject && selectedSubjectObj.parent_subject) {
          const parentSubjectGrades = studentGrades.filter(grade => grade.subject === selectedSubjectObj.parent_subject)
          console.log(`Parent subject grades for student ${student.id}:`, parentSubjectGrades)

          if (parentSubjectGrades.length > 0) {
            for (const grade of parentSubjectGrades) {
              if (grade.type === 'theory' && student.theory === null) {
                student.theory = grade.score
              } else if (grade.type === 'practical') {
                // التحقق من قيمة max_score للتمييز بين الشفوي والواجبات
                if (grade.max_score === 10 && student.homework === null) {
                  // هذه درجة واجبات
                  student.homework = grade.score
                } else if (grade.max_score !== 10 && student.practical === null) {
                  // هذه درجة شفوي
                  student.practical = grade.score
                }
              } else if (grade.type === 'participation' && student.participation === null) {
                student.participation = grade.score
              } else if (grade.type === 'quran' && student.quran === null) {
                student.quran = grade.score
              } else if (grade.type === 'final' && student.final === null) {
                student.final = grade.score
              }
            }
          }
        }

        // جلب حالة الحضور للطالب
        try {
          // استخدام التاريخ المحدد أو التاريخ الحالي إذا لم يتم تحديد تاريخ
          const dateToCheck = selectedDate.value || new Date().toISOString().split('T')[0]

          // Obtener la asistencia del store
          if (!gradesStore.attendance.value[`${student.id}-${dateToCheck}`]) {
            // Si no está en caché, cargar la asistencia para toda la clase
            if (Object.keys(gradesStore.attendance.value).length === 0) {
              await gradesStore.fetchAttendanceForDate(dateToCheck, selectedClass.value, selectedSection.value)
            }
          }

          // Obtener la asistencia del estudiante para la fecha seleccionada
          try {
            const dateAttendance = gradesStore.getAttendanceByStudentAndDate(student.id, dateToCheck)

            if (dateAttendance) {
              // تعيين حالة الحضور
              student.attendance = dateAttendance.status
              console.log(`Found attendance for student ${student.id} on ${dateToCheck}: ${dateAttendance.status}`)
            } else {
              // إذا لم يتم العثور على سجل حضور، نعين الحالة إلى حاضر افتراضيًا
              student.attendance = 'present'
              console.log(`No attendance found for student ${student.id} on ${dateToCheck}, setting to default 'present'`)
            }
          } catch (attendanceError) {
            console.error(`Error fetching attendance for student ${student.id}:`, attendanceError)
            student.attendance = 'present' // Valor por defecto en caso de error
          }
        } catch (attendanceError) {
          console.error(`Error fetching attendance for student ${student.id}:`, attendanceError)
        }

        // جلب تسليمات الواجبات للطالب
        if (currentAssignment.value) {
          try {
            // Obtener las entregas del store
            const assignmentId = currentAssignment.value.id

            // Si no están en caché, cargar las entregas para toda la clase
            if (Object.keys(gradesStore.submissions.value).filter(key => key.includes(`-${assignmentId}`)).length === 0) {
              await gradesStore.fetchSubmissionsForAssignment(assignmentId, studentIds)
            }

            // Obtener la entrega del estudiante para la tarea actual
            try {
              const existingSubmission = gradesStore.getSubmissionsByStudentAndAssignment(student.id, assignmentId)

              if (existingSubmission) {
                // تعيين حالة تسليم الواجب
                student.assignmentStatus = existingSubmission.status
              }
            } catch (submissionError) {
              console.error(`Error getting submission for student ${student.id}:`, submissionError)
              // Usar valor por defecto
              student.assignmentStatus = 'not_submitted'
            }
          } catch (submissionError) {
            console.error(`Error fetching assignment submissions for student ${student.id}:`, submissionError)
          }
        }

        // استرجاع حالة تسليم الواجب من التخزين المحلي
        try {
          if (currentAssignment.value) {
            const assignmentSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '{}')
            const key = `${student.id}-${currentAssignment.value.id}`

            if (assignmentSubmissions[key]) {
              student.assignmentStatus = assignmentSubmissions[key]
              console.log(`Setting assignment status for student ${student.id} to ${assignmentSubmissions[key]} from localStorage`)
            }
          }
        } catch (storageError) {
          console.error('Error loading from localStorage:', storageError)
        }
      } catch (error) {
        console.error(`Error processing student ${student.id}:`, error)
      }
    }

    students.value = studentsWithGrades

    // تحديث حالة الواجبات بعد جلب الطلاب
    updateAssignmentStatus()

    console.timeEnd(studentsTimerLabel)
  } catch (error) {
    console.error('Error fetching students:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    // For demo purposes, add some dummy data if API fails
    addDummyData()
  }
}

// Calculate total grade
const calculateTotal = (student) => {
  const theory = Number(student.theory || 0)
  const practical = Number(student.practical || 0)
  const homework = Number(student.homework || 0)
  const participation = Number(student.participation || 0)
  const quran = Number(student.quran || 0)
  const final = Number(student.final || 0)

  return theory + practical + homework + participation + quran + final
}

// Get color for grade type
const getGradeColor = (type) => {
  switch (type) {
    case 'نظري':
    case 'theory':
      return 'primary'
    case 'شفوي':
    case 'تطبيق': // للتوافق مع البيانات القديمة
    case 'practical':
      return 'info'
    case 'واجبات':
    case 'homework':
      return 'warning'
    case 'مشاركة':
    case 'participation':
      return 'success'
    case 'القرآن':
    case 'قرآن':
    case 'quran':
      return 'purple'
    case 'نهائي':
    case 'final':
      return 'error'
    default:
      return 'grey'
  }
}

// متغيرات لتخزين مؤقتات الحفظ
// استخدام مؤقتات لتأخير الحفظ لتجنب إرسال الكثير من الطلبات
const saveTimers = {}

// Save grade
const saveGrade = async (student, type) => {
  try {
    // التحقق من صحة البيانات
    if (!student.id || !selectedSubject.value) {
      console.error('Missing student ID or subject ID')
      return
    }

    // الحصول على المادة المحددة
    const selectedSubjectObj = subjects.value.find(s => s.id === selectedSubject.value)
    console.log('Selected subject for saving grade:', selectedSubjectObj)

    // تحديد ما إذا كانت المادة المحددة هي مادة فرعية
    const isSubSubject = selectedSubjectObj && selectedSubjectObj.parent_subject
    console.log('Is sub subject for saving grade:', isSubSubject)

    // تحديد المادة التي سيتم حفظ الدرجة فيها
    // إذا كانت المادة فرعية، نحفظ الدرجة في المادة الرئيسية
    const subjectIdToSave = isSubSubject ? selectedSubjectObj.parent_subject : selectedSubject.value
    console.log('Subject ID to save grade:', subjectIdToSave)

    // تحديد الدرجة القصوى بناءً على نوع الدرجة
    let maxScore = 100
    if (type === 'theory') maxScore = 15
    else if (type === 'practical') maxScore = 5 // الشفوي
    else if (type === 'homework') maxScore = 10 // الواجبات
    else if (type === 'participation') maxScore = 10 // المشاركة
    else if (type === 'quran') maxScore = 20 // القرآن الكريم
    else if (type === 'final') maxScore = 40 // النهائي

    // التحقق من أن الدرجة لا تتجاوز الدرجة القصوى
    const score = Number(student[type] || 0)
    if (score > maxScore) {
      alert(`الدرجة لا يمكن أن تتجاوز ${maxScore}`)
      student[type] = maxScore
      return
    }

    // إلغاء المؤقت السابق إذا كان موجودًا
    const timerKey = `${student.id}-${type}`
    if (saveTimers[timerKey]) {
      clearTimeout(saveTimers[timerKey])
    }

    // إنشاء مؤقت جديد لتأخير الحفظ
    saveTimers[timerKey] = setTimeout(async () => {
      try {
        // البحث عن درجة موجودة للطالب والمادة ونوع الدرجة
        const existingGradesResponse = await api.get('grades/by_student/', {
          params: {
            student_id: student.id,
            subject_id: subjectIdToSave
          }
        })

        // تحويل نوع الدرجة إذا كان "homework" لأنه غير مدعوم في الخادم الخلفي
        let actualType = type
        if (type === 'homework') {
          // استخدام نوع "practical" لتخزين درجات الواجبات
          // يمكننا تمييزها عن طريق قيمة max_score
          actualType = 'practical'
        }

        // البحث عن درجة موجودة
        let existingGrade = null
        if (type === 'homework') {
          // للواجبات، نبحث عن درجة من نوع "practical" بقيمة max_score تساوي 10
          existingGrade = existingGradesResponse.data.find(g =>
            g.type === 'practical' && g.max_score === 10
          )
        } else {
          existingGrade = existingGradesResponse.data.find(g => g.type === type)
        }

        // التحقق من الدرجة مرة أخرى قبل الحفظ
        const currentScore = Number(student[type] || 0)

        let response
        if (existingGrade) {
          // تحديث الدرجة الموجودة
          response = await api.put(`grades/${existingGrade.id}/`, {
            student: student.id,
            subject: subjectIdToSave,
            type: actualType, // استخدام النوع المحول إذا كان النوع هو "homework"
            score: currentScore,
            max_score: maxScore,
            date: new Date().toISOString().split('T')[0]
          })
          console.log(`Updated ${type} grade for student ${student.name}:`, response.data)

          // الحصول على اسم المادة
          const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'

          // الحصول على نوع الدرجة بالعربية
          let gradeTypeText = ''
          if (type === 'theory') gradeTypeText = 'النظري'
          else if (type === 'practical') gradeTypeText = 'الشفوي'
          else if (type === 'homework') gradeTypeText = 'الواجبات'
          else if (type === 'participation') gradeTypeText = 'المشاركة'
          else if (type === 'quran') gradeTypeText = 'القرآن'
          else if (type === 'final') gradeTypeText = 'النهائي'

          // إنشاء تنبيه للدرجة الجديدة
          try {
            await NotificationHelper.createGradeNotification(response.data, student.name)
            console.log('Grade notification created successfully')
          } catch (notificationError) {
            console.error('Error creating grade notification:', notificationError)
          }

          // إظهار رسالة نجاح مع ذكر المادة ونوع الدرجة
          alert(`تم حفظ درجة ${gradeTypeText} لمادة ${subjectName} بنجاح`)
        } else {
          // إنشاء درجة جديدة
          response = await api.post('grades/', {
            student: student.id,
            subject: subjectIdToSave,
            type: actualType, // استخدام النوع المحول إذا كان النوع هو "homework"
            score: currentScore,
            max_score: maxScore,
            date: new Date().toISOString().split('T')[0]
          })
          console.log(`Created ${type} grade for student ${student.name}:`, response.data)

          // الحصول على اسم المادة
          const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'

          // الحصول على نوع الدرجة بالعربية
          let gradeTypeText = ''
          if (type === 'theory') gradeTypeText = 'النظري'
          else if (type === 'practical') gradeTypeText = 'الشفوي'
          else if (type === 'homework') gradeTypeText = 'الواجبات'
          else if (type === 'participation') gradeTypeText = 'المشاركة'
          else if (type === 'quran') gradeTypeText = 'القرآن'
          else if (type === 'final') gradeTypeText = 'النهائي'

          // إنشاء تنبيه للدرجة الجديدة
          try {
            await NotificationHelper.createGradeNotification(response.data, student.name)
            console.log('Grade notification created successfully')
          } catch (notificationError) {
            console.error('Error creating grade notification:', notificationError)
          }

          // إظهار رسالة نجاح مع ذكر المادة ونوع الدرجة
          alert(`تم حفظ درجة ${gradeTypeText} لمادة ${subjectName} بنجاح`)
        }
      } catch (error) {
        console.error(`Error saving ${type} grade:`, error)
        if (error.response) {
          console.error('Error response data:', error.response.data)
        }
        alert(`حدث خطأ أثناء حفظ درجة ${type}`)
      }
    }, 1000) // تأخير لمدة ثانية واحدة
  } catch (error) {
    console.error(`Error in saveGrade function:`, error)
  }
}

// Save attendance
const saveAttendance = async (student, status) => {
  try {
    // التحقق من صحة البيانات
    if (!student.id) {
      console.error('Missing student ID')
      return
    }

    // الحصول على معرف الجدول الحالي
    // في التطبيق الحقيقي، يجب الحصول على معرف الجدول من الخادم
    let scheduleId

    try {
      // البحث عن جدول للصف والفصل والمادة
      const schedulesResponse = await api.get('schedules/', {
        params: {
          class_name: selectedClass.value,
          section: selectedSection.value,
          subject: selectedSubject.value
        }
      })

      if (schedulesResponse.data && schedulesResponse.data.length > 0) {
        scheduleId = schedulesResponse.data[0].id
      } else {
        // إذا لم يتم العثور على جدول، نستخدم قيمة افتراضية
        scheduleId = 1
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
      scheduleId = 1 // قيمة افتراضية
    }

    // استخدام التاريخ المحدد أو التاريخ الحالي إذا لم يتم تحديد تاريخ
    const dateToSave = selectedDate.value || new Date().toISOString().split('T')[0]
    console.log(`Saving attendance for date: ${dateToSave}`)

    // البحث عن سجل حضور موجود للطالب والجدول والتاريخ
    const attendancesResponse = await api.get('attendances/by_student/', {
      params: {
        student_id: student.id
      }
    })

    const existingAttendance = attendancesResponse.data.find(a =>
      a.schedule === scheduleId && a.date === dateToSave
    )

    let response
    if (existingAttendance) {
      // الحصول على اسم المادة
      const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'

      // تحديث سجل الحضور الموجود
      response = await api.put(`attendances/${existingAttendance.id}/`, {
        student: student.id,
        schedule: scheduleId,
        status,
        date: dateToSave,
        subject_info: subjectName  // إضافة اسم المادة
      })
      console.log(`Updated attendance for student ${student.name}:`, response.data)
    } else {
      // الحصول على اسم المادة
      const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'

      // إنشاء سجل حضور جديد
      response = await api.post('attendances/', {
        student: student.id,
        schedule: scheduleId,
        status,
        date: dateToSave,
        subject_info: subjectName  // إضافة اسم المادة
      })
      console.log(`Created attendance for student ${student.name}:`, response.data)
    }
    // إنشاء تنبيه للحضور/الغياب
    try {
      await NotificationHelper.createAttendanceNotification(response.data, student.name)
      console.log('Attendance notification created successfully')
    } catch (notificationError) {
      console.error('Error creating attendance notification:', notificationError)
    }

    // تحديث حالة الحضور في الواجهة الأمامية
    student.attendance = status

    // تحديث الطالب في قائمة الطلاب
    const studentIndex = students.value.findIndex(s => s.id === student.id)
    if (studentIndex !== -1) {
      students.value[studentIndex].attendance = status
    }

    // الحصول على اسم المادة للرسالة
    const subjectNameForMessage = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'
    const statusText = status === 'present' ? 'حاضر' : 'غائب'
    alert(`تم تسجيل الطالب ${student.name} ${statusText} في مادة ${subjectNameForMessage} بنجاح`)
  } catch (error) {
    console.error('Error saving attendance:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    alert('حدث خطأ أثناء حفظ الحضور')
  }
}

// Save assignment submission
const saveAssignmentSubmission = async (student, status) => {
  try {
    // التحقق من صحة البيانات
    if (!student.id || !currentAssignment.value) {
      console.error('Missing student ID or no current assignment')
      return
    }

    // استخدام معرف الواجب الحالي
    const assignmentId = currentAssignment.value.id

    // تحديث حالة تسليم الواجب في الواجهة الأمامية
    console.log(`Setting assignment status for student ${student.id} to ${status} for assignment ${assignmentId}`)
    student.assignmentStatus = status

    // البحث عن تسليم واجب موجود للطالب والواجب
    const submissionsResponse = await api.get('assignment-submissions/by_student/', {
      params: {
        student_id: student.id
      }
    })

    const existingSubmission = submissionsResponse.data.find(s => s.assignment === assignmentId)

    // تحديد الدرجة بناءً على حالة التسليم
    const score = status === 'submitted' ? (currentAssignment.value.score || 10) : 0

    let response
    if (existingSubmission) {
      // تحديث تسليم الواجب الموجود
      response = await api.put(`assignment-submissions/${existingSubmission.id}/`, {
        student: student.id,
        assignment: assignmentId,
        status,
        score
      })
      console.log(`Updated assignment submission for student ${student.name}:`, response.data)

      // تحديث درجة الواجب في الواجهة الأمامية
      if (status === 'submitted') {
        console.log(`Setting homework grade for student ${student.id} to ${score}`)
        student.homework = score

        // حفظ درجة الواجب في الخادم الخلفي
        try {
          await saveGrade(student, 'homework')
        } catch (gradeError) {
          console.error(`Error saving homework grade for student ${student.id}:`, gradeError)
        }
      }
    } else {
      // إنشاء تسليم واجب جديد
      response = await api.post('assignment-submissions/', {
        student: student.id,
        assignment: assignmentId,
        status,
        score
      })
      console.log(`Created assignment submission for student ${student.name}:`, response.data)

      // تحديث درجة الواجب في الواجهة الأمامية
      if (status === 'submitted') {
        console.log(`Setting homework grade for student ${student.id} to ${score}`)
        student.homework = score

        // حفظ درجة الواجب في الخادم الخلفي
        try {
          await saveGrade(student, 'homework')
        } catch (gradeError) {
          console.error(`Error saving homework grade for student ${student.id}:`, gradeError)
        }
      }
    }

    // حفظ حالة تسليم الواجب في التخزين المحلي
    try {
      // حفظ حالة تسليم الواجب في localStorage
      console.log('Saving assignment submission to localStorage')
      const assignmentSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '{}')
      const key = `${student.id}-${assignmentId}`
      console.log(`Storage key: ${key}, value: ${status}`)
      assignmentSubmissions[key] = status
      localStorage.setItem('assignmentSubmissions', JSON.stringify(assignmentSubmissions))
      console.log('Saved to localStorage:', assignmentSubmissions)
    } catch (storageError) {
      console.error('Error saving to localStorage:', storageError)
    }

    // تحديث حالة الواجبات
    updateAssignmentStatus()

    // الحصول على اسم المادة وعنوان الواجب
    const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'
    const assignmentTitle = currentAssignment.value.title

    // إظهار نافذة التشجيع إذا كان الطالب قد سلم الواجب
    if (status === 'submitted') {
      // تعيين بيانات الطالب لنافذة التشجيع
      encouragementStudent.value = {
        name: student.name,
        image: student.image
      }

      // عرض نافذة التشجيع
      showEncouragementDialog.value = true
    } else {
      // إظهار رسالة عادية إذا لم يتم تسليم الواجب
      alert(`لم يتم تسليم واجب "${assignmentTitle}" لمادة ${subjectName} للطالب ${student.name}`)
    }
  } catch (error) {
    console.error('Error saving assignment submission:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    alert('حدث خطأ أثناء حفظ تسليم الواجب')
  }
}

// وظيفة تعليم جميع الطلاب كمسلمين للواجب
const markAllSubmitted = async () => {
  if (!currentAssignment.value) {
    alert('لا يوجد واجب نشط حاليًا')
    return
  }

  try {
    // الحصول على اسم المادة وعنوان الواجب
    const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'
    const assignmentTitle = currentAssignment.value.title

    // عدد الطلاب الذين لم يسلموا الواجب بعد
    const notSubmittedCount = students.value.filter(s => s.assignmentStatus === 'not_submitted').length

    if (notSubmittedCount === 0) {
      alert('جميع الطلاب قد سلموا الواجب بالفعل')
      return
    }

    // طلب تأكيد من المستخدم
    if (!confirm(`هل أنت متأكد من تعليم جميع الطلاب (${notSubmittedCount}) كمسلمين لواجب "${assignmentTitle}" لمادة ${subjectName}?`)) {
      return
    }

    // تعليم جميع الطلاب كمسلمين
    for (const student of students.value) {
      if (student.assignmentStatus === 'not_submitted') {
        await saveAssignmentSubmission(student, 'submitted')
      }
    }

    // تحديث حالة الواجبات
    updateAssignmentStatus()

    // إظهار رسالة نجاح
    alert(`تم تعليم جميع الطلاب كمسلمين لواجب "${assignmentTitle}" لمادة ${subjectName} بنجاح`)
  } catch (error) {
    console.error('Error marking all assignments as submitted:', error)
    alert('حدث خطأ أثناء تعليم جميع الطلاب كمسلمين')
  }
}

// وظيفة حذف الواجب الحالي
const deleteCurrentAssignment = async () => {
  if (!currentAssignment.value) {
    alert('لا يوجد واجب نشط حاليًا لحذفه')
    return
  }

  // الحصول على اسم المادة وعنوان الواجب
  const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'
  const assignmentTitle = currentAssignment.value.title

  if (!confirm(`هل أنت متأكد من حذف واجب "${assignmentTitle}" لمادة ${subjectName}?سيتم حذف جميع تسليمات الطلاب لهذا الواجب.`)) return

  try {
    await api.delete(`assignments/${currentAssignment.value.id}/`)

    // إعادة تعيين الواجب الحالي
    const currentAssignmentId = currentAssignment.value.id
    currentAssignment.value = null

    // حذف الواجب من قائمة الواجبات
    const assignmentIndex = assignments.value.findIndex(a => a.id === currentAssignmentId)
    if (assignmentIndex !== -1) {
      assignments.value.splice(assignmentIndex, 1)
    }

    // إذا كانت هناك واجبات أخرى، اختر الواجب الأول
    if (assignments.value.length > 0) {
      currentAssignment.value = assignments.value[0]
    }

    // تحديث حالة الواجبات
    updateAssignmentStatus()

    alert(`تم حذف واجب "${assignmentTitle}" لمادة ${subjectName} بنجاح`)
  } catch (error) {
    console.error('Error deleting assignment:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    alert('حدث خطأ أثناء حذف الواجب')
  }
}

// وظيفة تحديث الواجب الحالي
const updateCurrentAssignment = async () => {
  if (!currentAssignment.value) {
    alert('لا يوجد واجب نشط حاليًا لتحديثه')
    return
  }

  try {
    // التحقق من صحة البيانات
    if (!currentAssignment.value.title) {
      alert('يرجى إدخال عنوان الواجب')
      return
    }

    if (!currentAssignment.value.due_date) {
      alert('يرجى إدخال تاريخ التسليم')
      return
    }

    // الحصول على اسم المادة وعنوان الواجب
    const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'
    const assignmentTitle = currentAssignment.value.title

    // تحديث الواجب
    const response = await api.put(`assignments/${currentAssignment.value.id}/`, {
      title: currentAssignment.value.title,
      description: currentAssignment.value.description || '',
      score: Number(currentAssignment.value.score) || 10,
      due_date: currentAssignment.value.due_date,
      schedule: currentAssignment.value.schedule,
      subject: selectedSubject.value,  // إضافة معرف المادة
      subject_info: subjectName  // إضافة اسم المادة
    })

    console.log('Updated assignment:', response.data)

    // تحديث الواجب في قائمة الواجبات
    const assignmentIndex = assignments.value.findIndex(a => a.id === currentAssignment.value.id)
    if (assignmentIndex !== -1) {
      assignments.value[assignmentIndex] = response.data
    }

    // تحديث حالة الواجبات
    updateAssignmentStatus()

    // إغلاق نافذة الحوار

    // إظهار رسالة نجاح
    alert(`تم تحديث واجب "${assignmentTitle}" لمادة ${subjectName} بنجاح`)
  } catch (error) {
    console.error('Error updating assignment:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    alert('حدث خطأ أثناء تحديث الواجب')
  }
}

// Save note
const saveNote = async (student) => {
  try {
    // التحقق من صحة البيانات
    if (!student.id || !student.noteContent) {
      console.error('Missing student ID or note content')
      return
    }

    // الحصول على معرف الجدول الحالي
    // في التطبيق الحقيقي، يجب الحصول على معرف الجدول من الخادم
    let scheduleId

    try {
      // البحث عن جدول للصف والفصل والمادة
      const schedulesResponse = await api.get('schedules/', {
        params: {
          class_name: selectedClass.value,
          section: selectedSection.value,
          subject: selectedSubject.value
        }
      })

      if (schedulesResponse.data && schedulesResponse.data.length > 0) {
        scheduleId = schedulesResponse.data[0].id
      } else {
        // إذا لم يتم العثور على جدول، نستخدم قيمة افتراضية
        scheduleId = 1
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
      scheduleId = 1 // قيمة افتراضية
    }

    // الحصول على اسم المادة
    const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'

    // إنشاء ملاحظة جديدة
    const response = await api.post('notes/', {
      student: student.id,
      content: student.noteContent,
      type: student.noteType,
      schedule: scheduleId,
      date: new Date().toISOString().split('T')[0],
      subject_info: subjectName  // إضافة اسم المادة فقط
    })

    console.log(`Saved note for student ${student.name}:`, response.data)

    // إعادة تعيين محتوى الملاحظة بعد الحفظ
    student.noteContent = ''

    // الحصول على نوع الملاحظة
    const noteTypeText = student.noteType === 'positive' ? 'الإيجابية' : 'السلبية'

    // إنشاء تنبيه للملاحظة الجديدة
    try {
      await NotificationHelper.createNoteNotification(response.data, student.name)
      console.log('Note notification created successfully')
    } catch (notificationError) {
      console.error('Error creating note notification:', notificationError)
    }

    // إظهار رسالة نجاح مع ذكر المادة ونوع الملاحظة
    alert(`تم حفظ الملاحظة ${noteTypeText} لمادة ${subjectName} بنجاح`)
  } catch (error) {
    console.error('Error saving note:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    alert('حدث خطأ أثناء حفظ الملاحظة')
  }
}

// Add assignment
const addAssignment = async () => {
  try {
    // التحقق من صحة البيانات
    if (!newAssignment.value.title) {
      alert('يرجى إدخال عنوان الواجب')
      return
    }

    if (!newAssignment.value.dueDate) {
      alert('يرجى إدخال تاريخ التسليم')
      return
    }

    // الحصول على معرف الجدول الحالي
    // في التطبيق الحقيقي، يجب الحصول على معرف الجدول من الخادم
    let scheduleId

    try {
      // البحث عن جدول للصف والفصل والمادة
      const schedulesResponse = await api.get('schedules/', {
        params: {
          class_name: selectedClass.value,
          section: selectedSection.value,
          subject: selectedSubject.value
        }
      })

      if (schedulesResponse.data && schedulesResponse.data.length > 0) {
        scheduleId = schedulesResponse.data[0].id
      } else {
        // إذا لم يتم العثور على جدول، نستخدم قيمة افتراضية
        scheduleId = 1
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
      scheduleId = 1 // قيمة افتراضية
    }

    // الحصول على اسم المادة
    const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'

    // إنشاء واجب جديد
    const response = await api.post('assignments/', {
      title: newAssignment.value.title,
      description: newAssignment.value.description || '',
      score: Number(newAssignment.value.score) || 10,
      due_date: newAssignment.value.dueDate,
      schedule: scheduleId,
      subject: selectedSubject.value,  // إضافة معرف المادة
      subject_info: subjectName  // إضافة اسم المادة
    })

    console.log('Added new assignment:', response.data)

    // إنشاء تسليمات للواجب لجميع الطلاب
    for (const student of students.value) {
      try {
        await api.post('assignment-submissions/', {
          student: student.id,
          assignment: response.data.id,
          status: 'not_submitted',
          score: 0,
          subject_info: subjectName  // إضافة اسم المادة
        })
      } catch (submissionError) {
        console.error(`Error creating submission for student ${student.id}:`, submissionError)
      }
    }

    // إعادة تعيين النموذج وإغلاق نافذة الحوار
    newAssignment.value = {
      title: '',
      description: '',
      score: 10,
      dueDate: new Date().toISOString().substring(0, 10)
    }

    showAddAssignmentDialog.value = false

    // تحديث الواجب الحالي وحالة الواجبات
    await fetchCurrentAssignment()
    updateAssignmentStatus()

    // إنشاء تنبيه للواجب الجديد
    try {
      await NotificationHelper.createAssignmentNotification(response.data)
      console.log('Assignment notification created successfully')
    } catch (notificationError) {
      console.error('Error creating assignment notification:', notificationError)
    }

    // إظهار رسالة نجاح مع ذكر المادة
    alert(`تمت إضافة واجب لمادة ${subjectName} بنجاح`)
  } catch (error) {
    console.error('Error adding assignment:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    alert('حدث خطأ أثناء إضافة الواجب')
  }
}

// Open student details
const openStudentDetails = async (student) => {
  try {
    console.log('Opening details for student:', student)
    selectedStudent.value = student
    showStudentDetailsDialog.value = true

    // Cargar datos del estudiante
    const timerLabel = `loadStudentDetails-${student.id}-${Date.now()}`
    console.time(timerLabel)

    // Cargar calificaciones desde el store
    const studentId = student.id

    // Si no están en caché, cargar las calificaciones
    if (!gradesStore.grades.value[studentId]) {
      await gradesStore.fetchGradesForStudents([studentId])
    }

    // Obtener las calificaciones del estudiante
    try {
      studentGrades.value = gradesStore.getGradesByStudent(studentId) || []
    } catch (error) {
      console.error(`Error getting grades for student ${studentId}:`, error)
      studentGrades.value = []
    }
    console.log('Fetched grades for student details:', studentGrades.value)

    // Cargar asistencia (usar datos existentes si están disponibles)
    // Obtener la fecha actual para filtrar la asistencia
    const currentDate = new Date().toISOString().split('T')[0]

    // Inicializar el objeto de asistencia si no existe
    if (!gradesStore.attendance.value) {
      gradesStore.attendance.value = {}
    }

    // Cargar la asistencia si no está en caché
    try {
      if (Object.keys(gradesStore.attendance.value).filter(key => key.startsWith(`${studentId}-`)).length === 0) {
        await gradesStore.fetchAttendanceForDate(currentDate, selectedClass.value, selectedSection.value)
      }
    } catch (error) {
      console.error(`Error fetching attendance for student ${studentId}:`, error)
    }

    // Obtener todos los registros de asistencia del estudiante mediante API
    // (Esta información detallada no se almacena en caché)
    const attendanceResponse = await api.get('attendances/by_student/', {
      params: {
        student_id: studentId
      }
    })
    studentAttendance.value = attendanceResponse.data || []
    console.log('Fetched attendance for student details:', studentAttendance.value)

    // Cargar entregas de tareas
    // Si hay un assignment activo, usar el store
    if (currentAssignment.value) {
      const assignmentId = currentAssignment.value.id

      // Cargar las entregas si no están en caché
      if (!gradesStore.submissions.value[`${studentId}-${assignmentId}`]) {
        await gradesStore.fetchSubmissionsForAssignment(assignmentId, [studentId])
      }
    }

    // Obtener todas las entregas del estudiante mediante API
    // (Esta información detallada no se almacena en caché)
    const submissionsResponse = await api.get('assignment-submissions/by_student/', {
      params: {
        student_id: studentId
      }
    })
    studentAssignments.value = submissionsResponse.data || []
    console.log('Fetched assignment submissions for student details:', studentAssignments.value)

    // Cargar notas (no se almacenan en caché)
    const notesResponse = await api.get('notes/by_student/', {
      params: {
        student_id: studentId
      }
    })
    studentNotes.value = notesResponse.data || []
    console.log('Fetched notes for student details:', studentNotes.value)

    console.timeEnd(timerLabel)
  } catch (error) {
    console.error('Error loading student details:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    // Mostrar mensaje de error
    alert('حدث خطأ أثناء تحميل بيانات الطالب')
  }
}

// وظيفة تنسيق التاريخ
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA')
}

// وظيفة تحديد الواجب النشط
const setActiveAssignment = (assignment) => {
  if (!assignment) return

  console.log('Setting active assignment:', assignment)
  currentAssignment.value = assignment

  // تحديث حالة تسليم الواجبات للطلاب
  updateAssignmentStatus()

  // إغلاق قائمة اختيار الواجبات
  showAssignmentsSelector.value = false
}

// وظيفة تحديث حالة الواجبات
const updateAssignmentStatus = () => {
  console.log('Updating assignment status')

  // إذا لم يكن هناك واجب نشط، لا حاجة للتحديث
  if (!currentAssignment.value) {
    pendingSubmissionsCount.value = 0
    isAssignmentDueSoon.value = false
    return
  }

  // حساب عدد الواجبات التي لم يتم تسليمها
  if (students.value.length > 0) {
    pendingSubmissionsCount.value = students.value.filter(s => s.assignmentStatus === 'not_submitted').length
    console.log(`Pending submissions count: ${pendingSubmissionsCount.value}`)
  } else {
    pendingSubmissionsCount.value = 0
  }

  // التحقق من موعد تسليم الواجب
  const dueDate = new Date(currentAssignment.value.due_date)
  const today = new Date()
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
  isAssignmentDueSoon.value = diffDays <= 2 && diffDays >= 0
  console.log(`Assignment due in ${diffDays} days, is due soon: ${isAssignmentDueSoon.value}`)

  // تحديث حالة تسليم الواجب لجميع الطلاب من التخزين المحلي
  try {
    const assignmentSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '{}')
    console.log('Loaded assignment submissions from localStorage:', assignmentSubmissions)

    for (const student of students.value) {
      // إعادة تعيين حالة التسليم إلى القيمة الافتراضية
      student.assignmentStatus = 'not_submitted'

      // التحقق من وجود حالة تسليم محفوظة
      const key = `${student.id}-${currentAssignment.value.id}`
      if (assignmentSubmissions[key]) {
        console.log(`Setting assignment status for student ${student.id} to ${assignmentSubmissions[key]} from localStorage`)
        student.assignmentStatus = assignmentSubmissions[key]
      }
    }
  } catch (storageError) {
    console.error('Error loading from localStorage in updateAssignmentStatus:', storageError)
  }
}

// وظيفة جلب الواجبات للمادة المحددة
const fetchCurrentAssignment = async () => {
  if (!selectedSubject.value) return

  try {
    const assignmentsTimerLabel = `fetchAssignments-${selectedSubject.value}-${Date.now()}`
    console.time(assignmentsTimerLabel)

    // Usar el store para obtener las asignaciones
    const assignmentsData = await gradesStore.fetchAssignmentsBySubject(selectedSubject.value)
    console.timeEnd(assignmentsTimerLabel)

    console.log('Fetched assignments for subject:', selectedSubject.value, assignmentsData)

    // تحديث قائمة الواجبات
    assignments.value = assignmentsData || []

    // التحقق من وجود واجبات
    if (assignments.value.length > 0) {
      // تعيين الواجب الحالي إلى أحدث واجب
      currentAssignment.value = assignments.value[0]
      console.log('Current assignment set to:', currentAssignment.value)
    } else {
      // إذا لم يتم العثور على واجبات، تعيين الواجب الحالي إلى null
      currentAssignment.value = null
      console.log('No assignments found for the selected subject')
    }

    // تحديث حالة تسليم الواجبات للطلاب
    updateAssignmentStatus()
  } catch (error) {
    console.error('Error fetching assignments:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    assignments.value = []
    currentAssignment.value = null
  }
}

// وظيفة تعديل سجل الملاحظة
const editNoteRecord = (note, index) => {
  console.log('Editing note:', note) // للتشخيص
  editedIndex.value = index
  editedNote.value = Object.assign({}, note)
  showEditNoteDialog.value = true
}

// وظيفة تحديث سجل الملاحظة
const updateNoteRecord = async () => {
  // تعيين حالة التحميل
  isSubmitting.value = true

  try {
    // التحقق من صحة البيانات
    if (!editedNote.value.content) {
      alert('يرجى إدخال محتوى الملاحظة')
      return
    }

    // التحقق من وجود معرف للملاحظة
    if (!editedNote.value.id) {
      console.error('Note ID is missing')
      alert('حدث خطأ: معرف الملاحظة غير موجود')
      return
    }

    console.log('Updating note with ID:', editedNote.value.id)

    // تحديث الملاحظة في الخادم الخلفي
    // الحصول على معرف الجدول الحالي
    let scheduleId = 1 // قيمة افتراضية

    try {
      // البحث عن جدول للصف والفصل والمادة
      const schedulesResponse = await api.get('schedules/', {
        params: {
          class_name: selectedClass.value,
          section: selectedSection.value,
          subject: selectedSubject.value
        }
      })

      if (schedulesResponse.data && schedulesResponse.data.length > 0) {
        scheduleId = schedulesResponse.data[0].id
      }
    } catch (scheduleError) {
      console.error('Error fetching schedule:', scheduleError)
    }

    // الحصول على اسم المادة
    const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'

    // بيانات التحديث
    const updateData = {
      student: selectedStudent.value.id,
      content: editedNote.value.content,
      type: editedNote.value.type,
      schedule: scheduleId,
      date: new Date().toISOString().split('T')[0],
      subject_info: subjectName
    }

    console.log('Sending update request with data:', updateData)

    const response = await api.put(`notes/${editedNote.value.id}/`, updateData)

    console.log('Updated note:', response.data)

    // تحديث الملاحظة في الواجهة الأمامية
    Object.assign(studentNotes.value[editedIndex.value], {
      content: editedNote.value.content,
      type: editedNote.value.type,
      type_display: editedNote.value.type === 'positive' ? 'إيجابية' : 'سلبية'
    })

    // تحديث الملاحظة في الطالب المحدد
    if (selectedStudent.value) {
      selectedStudent.value.lastNote = editedNote.value.content
    }

    // إغلاق نافذة الحوار
    showEditNoteDialog.value = false

    // إظهار رسالة نجاح
    const noteTypeText = editedNote.value.type === 'positive' ? 'الإيجابية' : 'السلبية'
    alert(`تم تحديث الملاحظة ${noteTypeText} للطالب ${selectedStudent.value?.name || ''} بنجاح`)
  } catch (error) {
    console.error('Error updating note:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    alert('حدث خطأ أثناء تحديث الملاحظة')
  } finally {
    // إعادة تعيين حالة التحميل
    isSubmitting.value = false
  }
}

// وظيفة تعديل سجل الحضور
const editAttendanceRecord = (record, index) => {
  console.log('Editing attendance record:', record) // للتشخيص
  editedIndex.value = index
  editedAttendance.value = Object.assign({}, record)
  showEditAttendanceDialog.value = true
}

// وظيفة تحديث سجل الحضور
const updateAttendanceRecord = async () => {
  // تعيين حالة التحميل
  isSubmitting.value = true

  try {
    // التحقق من وجود معرف لسجل الحضور
    if (!editedAttendance.value.id) {
      console.error('Attendance record ID is missing')
      alert('حدث خطأ: معرف سجل الحضور غير موجود')
      return
    }

    console.log('Updating attendance record with ID:', editedAttendance.value.id)

    // الحصول على معرف الجدول الحالي
    let scheduleId = 1 // قيمة افتراضية

    try {
      // البحث عن جدول للصف والفصل والمادة
      const schedulesResponse = await axios.get('schedules/', {
        params: {
          class_name: selectedClass.value,
          section: selectedSection.value,
          subject: selectedSubject.value
        }
      })

      if (schedulesResponse.data && schedulesResponse.data.length > 0) {
        scheduleId = schedulesResponse.data[0].id
      }
    } catch (scheduleError) {
      console.error('Error fetching schedule:', scheduleError)
    }

    // الحصول على اسم المادة
    const subjectName = subjects.value.find(s => s.id === selectedSubject.value)?.name || 'المادة المحددة'

    // بيانات التحديث
    const updateData = {
      student: selectedStudent.value.id,
      status: editedAttendance.value.status,
      date: editedAttendance.value.date,
      schedule: scheduleId,
      subject_info: subjectName
    }

    console.log('Sending update request with data:', updateData)

    const response = await api.put(`attendance/${editedAttendance.value.id}/`, updateData)

    console.log('Updated attendance record:', response.data)

    // تحديث سجل الحضور في الواجهة الأمامية
    Object.assign(studentAttendance.value[editedIndex.value], {
      status: editedAttendance.value.status,
      status_display: editedAttendance.value.status === 'present' ? 'حاضر' : 'غائب',
      date: editedAttendance.value.date
    })

    // إغلاق نافذة الحوار
    showEditAttendanceDialog.value = false

    // إظهار رسالة نجاح
    const statusText = editedAttendance.value.status === 'present' ? 'حاضر' : 'غائب'
    alert(`تم تحديث سجل الحضور للطالب ${selectedStudent.value?.name || ''} إلى ${statusText} بنجاح`)
  } catch (error) {
    console.error('Error updating attendance record:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    alert('حدث خطأ أثناء تحديث سجل الحضور')
  } finally {
    // إعادة تعيين حالة التحميل
    isSubmitting.value = false
  }
}

// وظيفة حذف سجل الحضور
const deleteAttendanceRecord = async (record, index) => {
  console.log('Deleting attendance record:', record) // للتشخيص

  // طلب تأكيد من المستخدم
  if (!confirm('هل أنت متأكد من حذف سجل الحضور هذا؟')) {
    return
  }

  // التحقق من وجود معرف لسجل الحضور
  if (!record.id) {
    console.error('Attendance record ID is missing')
    alert('حدث خطأ: معرف سجل الحضور غير موجود')
    return
  }

  console.log('Deleting attendance record with ID:', record.id)

  try {
    // حذف سجل الحضور من الخادم الخلفي
    await api.delete(`attendance/${record.id}/`)

    // حذف سجل الحضور من الواجهة الأمامية
    studentAttendance.value.splice(index, 1)

    // إظهار رسالة نجاح
    const statusText = record.status === 'present' ? 'حاضر' : 'غائب'
    alert(`تم حذف سجل الحضور (${statusText}) للطالب ${selectedStudent.value?.name || ''} بنجاح`)
  } catch (error) {
    console.error('Error deleting attendance record:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    alert('حدث خطأ أثناء حذف سجل الحضور')
  }
}

// وظيفة حذف سجل الملاحظة
const deleteNoteRecord = async (note, index) => {
  console.log('Deleting note:', note) // للتشخيص

  // طلب تأكيد من المستخدم
  if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
    return
  }

  // التحقق من وجود معرف للملاحظة
  if (!note.id) {
    console.error('Note ID is missing')
    alert('حدث خطأ: معرف الملاحظة غير موجود')
    return
  }

  console.log('Deleting note with ID:', note.id)

  try {
    // حذف الملاحظة من الخادم الخلفي
    console.log(`Deleting note with ID: ${note.id}`)
    await api.delete(`notes/${note.id}/`)

    // حذف الملاحظة من الواجهة الأمامية
    studentNotes.value.splice(index, 1)

    // إظهار رسالة نجاح
    const noteTypeText = note.type === 'positive' ? 'الإيجابية' : 'السلبية'
    alert(`تم حذف الملاحظة ${noteTypeText} للطالب ${selectedStudent.value?.name || ''} بنجاح`)
  } catch (error) {
    console.error('Error deleting note:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
    }
    alert('حدث خطأ أثناء حذف الملاحظة')
  }
}

// Add dummy data for demo purposes
const addDummyData = () => {
  classes.value = [
    { id: 1, name: 'الصف الأول' },
    { id: 2, name: 'الصف الثاني' },
    { id: 3, name: 'الصف الثالث' }
  ]

  sections.value = [
    { id: 1, name: 'أ' },
    { id: 2, name: 'ب' },
    { id: 3, name: 'ج' }
  ]

  subjects.value = [
    { id: 1, name: 'الدراسات الإسلامية' },
    { id: 2, name: 'الفقه' },
    { id: 3, name: 'التوحيد' }
  ]

  selectedClass.value = 1
  selectedSection.value = 1
  selectedSubject.value = 1

  students.value = [
    {
      id: 1,
      name: 'أحمد محمد',
      class_name: 'الصف الأول',
      section: 'أ',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      theory: 12,
      practical: 4,
      homework: 25,
      participation: 8,
      final: 35,
      attendance: 'present',
      assignmentStatus: 'submitted',
      noteContent: '',
      noteType: 'positive'
    },
    {
      id: 2,
      name: 'محمد علي',
      class_name: 'الصف الأول',
      section: 'أ',
      image: 'https://randomuser.me/api/portraits/men/2.jpg',
      theory: 10,
      practical: 3,
      homework: 20,
      participation: 7,
      final: 30,
      attendance: 'present',
      assignmentStatus: 'not_submitted',
      noteContent: '',
      noteType: 'positive'
    },
    {
      id: 3,
      name: 'عبدالله خالد',
      class_name: 'الصف الأول',
      section: 'أ',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
      theory: 14,
      practical: 5,
      homework: 28,
      participation: 9,
      final: 38,
      attendance: 'absent',
      assignmentStatus: 'submitted',
      noteContent: '',
      noteType: 'negative'
    }
  ]
}
</script>

<style scoped>
.grades-page {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 100%;
  padding-bottom: 60px; /* للتأكد من وجود مساحة كافية في الأسفل */
  text-align: right;
}

/* أنماط عامة */
.grades-header-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* إصلاح مشكلة التمرير */
:deep(.v-main__wrap) {
  overflow-y: auto;
}

:deep(.v-application__wrap) {
  min-height: auto;
  overflow-y: auto;
}

/* تأكيد السماح بالتمرير في الجسم بالكامل */
:global(body), :global(html) {
  overflow-y: auto !important;
}

/* معالجة مشكلة التمرير داخل جدول البيانات */
.student-data-table {
  overflow: visible;
  height: auto;
  max-height: none;
}

:deep(.v-data-table__wrapper) {
  overflow-y: visible;
  max-height: none;
}

.assignment-selector-card,
.assignment-details-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
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

.student-grades-table-card {
  border-radius: 12px;
  overflow: hidden;
}

.student-data-table {
  --v-table-header-height: 48px;
}

.v-data-table .v-data-table-header th {
  font-weight: bold;
  color: var(--v-theme-primary);
  background-color: var(--v-theme-blue-lighten-5);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.v-card {
  animation: fadeIn 0.3s ease-in-out;
}

/* تعديل جداول البيانات للموضوع العربي */
.v-data-table .v-data-table__wrapper > table > thead > tr > th {
  text-align: right;
}

.v-data-table .v-data-table__wrapper > table > tbody > tr > td {
  text-align: right;
}

.v-data-table .v-data-table__td {
  text-align: right;
}

.v-data-table .v-data-table__th {
  text-align: right;
}

.v-card-title, .v-card-text {
  text-align: right;
}

.v-btn {
  letter-spacing: normal;
}

.v-list-item-title {
  text-align: right;
}

/* تحسين مظهر الأزرار في الجداول عند استخدام RTL */
.v-btn-toggle {
  flex-direction: row-reverse;
}

/* Ensure proper padding in RTL mode */
.v-toolbar__title {
  padding-right: 0;
  padding-left: 16px;
}
</style>
