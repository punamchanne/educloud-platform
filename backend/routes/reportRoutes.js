import express from 'express';
import { generateStudentReport, generateExamReport } from '../controllers/reportController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

// Generate student performance report (admin or self)
router.get('/user/:userId?', protect, generateStudentReport);

// Generate exam summary report (admin only)
router.get('/exam/:examId', protect, restrictTo('admin'), generateExamReport);

export default router;
