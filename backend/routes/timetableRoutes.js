import express from 'express';
import { createTimetable, updateTimetable, getTimetable, getAllTimetables, deleteTimetable } from '../controllers/timetableController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

// Get all timetables (accessible to all roles)
router.get('/', protect, getAllTimetables);

// Create timetable (admin/staff, with optional AI suggestions)
router.post('/', protect, restrictTo('admin', 'staff'), createTimetable);

// Get specific timetable (accessible to all roles)
router.get('/:id', protect, getTimetable);

// Update timetable (admin/staff)
router.put('/:id', protect, restrictTo('admin', 'staff'), updateTimetable);

// Delete timetable (admin/staff)
router.delete('/:id', protect, restrictTo('admin', 'staff'), deleteTimetable);

export default router;
