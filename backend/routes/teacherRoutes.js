import express from 'express';
import {
  getAssignedClasses,
  getClassStudents,
  getStudentDetails,
  getTeacherExams,
  getClassPerformance,
  getTeacherSchedule,
  getTeacherNotifications,
  updateTeacherMetrics
} from '../controllers/teacherDashboardController.js';
import { protect, teacherOnly } from '../middlewares/auth.js';

const router = express.Router();

// Temporarily disable authentication for testing
// router.use(protect);
// router.use(teacherOnly);

// Dashboard routes
router.get('/dashboard/classes', getAssignedClasses);
router.get('/dashboard/classes/:classId/students', getClassStudents);
router.get('/dashboard/students/:studentId', getStudentDetails);
router.get('/dashboard/exams', getTeacherExams);
router.get('/dashboard/classes/:classId/performance', getClassPerformance);
router.get('/dashboard/schedule', getTeacherSchedule);
router.get('/dashboard/notifications', getTeacherNotifications);
router.post('/dashboard/update-metrics', updateTeacherMetrics);

export default router;