import express from 'express';
import {
  markAttendance,
  markBulkAttendance,
  getStudentAttendance,
  getClassAttendance,
  updateAttendance,
  deleteAttendance,
  getClassAttendanceReport
} from '../controllers/attendanceController.js';
import { protect, teacherOnly, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Teacher and admin routes
router.post('/mark', teacherOnly, markAttendance);
router.post('/bulk-mark', teacherOnly, markBulkAttendance);
router.get('/class/:classId', teacherOnly, getClassAttendance);
router.put('/:id', teacherOnly, updateAttendance);
router.delete('/:id', adminOnly, deleteAttendance);

// General routes (accessible by teachers, parents, admins)
router.get('/student/:studentId', getStudentAttendance);
router.get('/report', getClassAttendanceReport);

export default router;