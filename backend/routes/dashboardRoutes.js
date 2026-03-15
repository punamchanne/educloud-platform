import express from 'express';
import { protect } from '../middlewares/auth.js';
import {
  getAIDashboard,
  generateDocument,
  getAnalytics,
  generateSmartTimetable,
  getMeetingInsights,
  generateSurvey,
  getSystemStatus
} from '../controllers/dashboardController.js';

const router = express.Router();

// AI-Powered Dashboard Routes
router.get('/ai-insights', protect, getAIDashboard);
router.get('/analytics', protect, getAnalytics);
router.get('/system-status', protect, getSystemStatus);

// AI Document Console
router.post('/documents/generate', protect, generateDocument);

// Smart Features
router.post('/timetable/smart-generate', protect, generateSmartTimetable);
router.post('/meetings/insights', protect, getMeetingInsights);
router.post('/surveys/generate', protect, generateSurvey);

export default router;