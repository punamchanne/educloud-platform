import express from 'express';
import {
  getChildrenOverview,
  getChildPerformance,
  getChildAttendance,
  contactTeacher,
  getParentNotifications,
  markNotificationRead,
  updateCommunicationPreferences
} from '../controllers/parentDashboardController.js';
import { protect, parentOnly } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication and parent role
router.use(protect);
router.use(parentOnly);

// Dashboard routes
router.get('/dashboard/children', getChildrenOverview);
router.get('/dashboard/children/:studentId/performance', getChildPerformance);
router.get('/dashboard/children/:studentId/attendance', getChildAttendance);
router.post('/dashboard/contact-teacher', contactTeacher);
router.get('/dashboard/notifications', getParentNotifications);
router.put('/dashboard/notifications/:notificationId/read', markNotificationRead);
router.put('/dashboard/preferences', updateCommunicationPreferences);

export default router;