// index.js - تصدير جميع الخدمات

import supabase from './supabaseClient';
import ClassService from './ClassService';
import SectionService from './SectionService';
import SubjectService from './SubjectService';
import StudentService from './StudentService';
import ScheduleService from './ScheduleService';
import AttendanceService from './AttendanceService';
import AssignmentService from './AssignmentService';
import GradeService from './GradeService';
import NoteService from './NoteService';
import NotificationService from './NotificationService';
import NotificationHelper from './NotificationHelper';
import StorageService from './StorageService';
import WhiteboardService from './WhiteboardService';

export {
  supabase,
  ClassService,
  SectionService,
  SubjectService,
  StudentService,
  ScheduleService,
  AttendanceService,
  AssignmentService,
  GradeService,
  NoteService,
  NotificationService,
  NotificationHelper,
  StorageService,
  WhiteboardService
};
