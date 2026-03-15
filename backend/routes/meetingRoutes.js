import express from 'express';
import {
  createMeeting,
  getUserMeetings,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  updateMeetingStatus,
  getMeetingAnalytics,
  getUpcomingMeetings
} from '../controllers/meetingController.js';
import { protect } from '../middlewares/auth.js';
import { validateMeeting } from '../middlewares/validation.js';

const router = express.Router();

// All meeting routes require authentication
router.use(protect);

// Create new meeting
router.post('/', validateMeeting, createMeeting);

// Get user's meetings with filtering and pagination
router.get('/', getUserMeetings);

// Get meeting analytics
router.get('/analytics', getMeetingAnalytics);

// Get upcoming meetings
router.get('/upcoming', getUpcomingMeetings);

// Get specific meeting
router.get('/:id', getMeeting);

// Update meeting
router.put('/:id', updateMeeting);

// Update meeting status
router.patch('/:id/status', updateMeetingStatus);

// Delete meeting
router.delete('/:id', deleteMeeting);

export default router;