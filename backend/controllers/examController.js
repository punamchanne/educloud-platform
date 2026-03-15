import Exam from '../models/Exam.js';
import User from '../models/User.js';
import { generateExamQuestions } from '../services/geminiService.js';
import { logger } from '../utils/logger.js';
import { sanitizeInput, isValidObjectId } from '../utils/validators.js';
import validate from '../middlewares/validation.js';

// Create exam (admin only, with AI-generated questions)
export const createExam = [
  validate('exam'),
  async (req, res, next) => {
    try {
      const { title, description, scheduledDate, duration, subject, numQuestions, difficulty } = req.body;
      const sanitized = {
        title: sanitizeInput(title),
        description: sanitizeInput(description),
        subject: sanitizeInput(subject),
      };

      // Generate questions via Gemini
      const questions = await generateExamQuestions(sanitized.subject, numQuestions || 10, difficulty || 'medium');

      const exam = new Exam({
        ...sanitized,
        scheduledDate,
        duration,
        questions,
        invigilator: req.user.id, // Admin/staff creating exam
      });
      await exam.save();

      logger.info(`Exam created: ${sanitized.title}`);
      res.status(201).json({ success: true, exam });
    } catch (error) {
      logger.error(`Create exam error: ${error.message}`, { title: req.body.title });
      next(error);
    }
  },
];

// Submit exam attempt (student)
export const submitExam = async (req, res, next) => {
  let examId;
  try {
    examId = req.params.id;
    const { answers } = req.body; // Array of answers [answer1, answer2, ...]

    if (!isValidObjectId(examId)) {
      const error = new Error('Invalid exam ID');
      error.statusCode = 400;
      throw error;
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      const error = new Error('Exam not found');
      error.statusCode = 404;
      throw error;
    }

    // Allow submission for live or ongoing exams
    if (!['live', 'ongoing'].includes(exam.status)) {
      const error = new Error('Exam is not available for submission');
      error.statusCode = 400;
      throw error;
    }

    // Check if student has already submitted this exam
    const existingResult = exam.results.find(r => r.userId.toString() === req.user.id);
    if (existingResult) {
      const error = new Error('You have already submitted this exam');
      error.statusCode = 400;
      throw error;
    }

    // Calculate score
    let score = 0;
    let correctAnswers = 0;
    const totalQuestions = exam.questions.length;

    exam.questions.forEach((q, index) => {
      if (answers && answers[index] && answers[index] === q.correctAnswer) {
        score += q.marks || 1;
        correctAnswers++;
      }
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Update user exam history
    user.examHistory.push({
      examId,
      score,
      totalQuestions,
      correctAnswers,
      duration: exam.duration,
      status: score >= totalQuestions * 0.5 ? 'passed' : 'failed',
    });
    await user.updateExamStats();
    await user.save();

    // Update exam results
    exam.results.push({
      userId: req.user.id,
      score,
      submittedAt: new Date(),
      answers: answers
    });

    // Keep exam status as ongoing if there are other students taking it
    // Only change to completed when admin manually completes it
    await exam.save();

    logger.info(`Exam submitted: ${exam.title} by user ${user.email} - Score: ${score}/${totalQuestions}`);
    res.json({
      success: true,
      score,
      totalQuestions,
      correctAnswers,
      percentage: Math.round((score / totalQuestions) * 100)
    });
  } catch (error) {
    logger.error(`Submit exam error: ${error.message}`, { examId, userId: req.user.id });
    next(error);
  }
};

// Get all exams (students see available exams, admin sees all)
export const getAllExams = async (req, res, next) => {
  try {
    let exams;
    if (req.user.role === 'admin') {
      // Admin sees all exams
      exams = await Exam.find()
        .populate('participants', 'username email')
        .populate('invigilator', 'username')
        .sort({ scheduledDate: -1 });
    } else {
      // Students see exams they're participating in or all scheduled/live/ongoing exams
      exams = await Exam.find({
        $or: [
          { participants: req.user.id },
          { status: { $in: ['scheduled', 'live', 'ongoing'] } }
        ]
      })
        .populate('participants', 'username email')
        .populate('invigilator', 'username')
        .sort({ scheduledDate: -1 });
    }

    logger.info(`Exams fetched by user ${req.user.id}`);
    res.json({ success: true, exams });
  } catch (error) {
    logger.error(`Fetch exams error: ${error.message}`, { userId: req.user.id });
    next(error);
  }
};

// Get exam details (admin sees all, students see own results)
export const getExam = async (req, res, next) => {
  let examId;
  try {
    examId = req.params.id;
    if (!isValidObjectId(examId)) {
      const error = new Error('Invalid exam ID');
      error.statusCode = 400;
      throw error;
    }

    const exam = await Exam.findById(examId)
      .populate('participants', 'username email')
      .populate('invigilator', 'username');
    if (!exam) {
      const error = new Error('Exam not found');
      error.statusCode = 404;
      throw error;
    }

    // Admin sees full results, students see only their submission
    let response = { success: true, exam };
    if (req.user.role !== 'admin') {
      const userResult = exam.results.find(r => r.userId.toString() === req.user.id);
      response = { success: true, exam: { ...exam.toObject(), results: userResult || null } };
    }

    logger.info(`Exam fetched: ${exam.title} by user ${req.user.id}`);
    res.json(response);
  } catch (error) {
    logger.error(`Fetch exam error: ${error.message}`, { examId });
    next(error);
  }
};

// Start exam (student) - changes status from live to ongoing, or allows resuming ongoing exams
export const startExam = async (req, res, next) => {
  let examId;
  try {
    examId = req.params.id;

    if (!isValidObjectId(examId)) {
      const error = new Error('Invalid exam ID');
      error.statusCode = 400;
      throw error;
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      const error = new Error('Exam not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if exam is available for starting/resuming
    if (!['live', 'ongoing'].includes(exam.status)) {
      const error = new Error('Exam is not available to start');
      error.statusCode = 400;
      throw error;
    }

    // If exam is live, change to ongoing when student starts
    if (exam.status === 'live') {
      exam.status = 'ongoing';
      exam.updatedAt = new Date();
      await exam.save();
    }

    // Check if student has already submitted this exam
    const existingResult = exam.results.find(r => r.userId.toString() === req.user.id);
    if (existingResult) {
      const error = new Error('You have already submitted this exam');
      error.statusCode = 400;
      throw error;
    }

    logger.info(`Exam ${exam.status === 'ongoing' ? 'resumed' : 'started'}: ${exam.title} by user ${req.user.id}`);
    res.json({ success: true, exam, resumed: exam.status === 'ongoing' });
  } catch (error) {
    logger.error(`Start exam error: ${error.message}`, { examId, userId: req.user.id });
    next(error);
  }
};

// Cleanup abandoned exams (admin utility function)
export const cleanupAbandonedExams = async (req, res, next) => {
  try {
    // Find exams that have been ongoing for more than 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const abandonedExams = await Exam.find({
      status: 'ongoing',
      updatedAt: { $lt: twoHoursAgo }
    });

    let resetCount = 0;
    for (const exam of abandonedExams) {
      // Only reset if the exam is still within its scheduled time window
      const examEndTime = new Date(exam.scheduledDate.getTime() + exam.duration * 60 * 1000);
      if (new Date() < examEndTime) {
        exam.status = 'live';
        exam.updatedAt = new Date();
        await exam.save();
        resetCount++;
        logger.info(`Reset abandoned exam: ${exam.title}`);
      }
    }

    res.json({
      success: true,
      message: `Reset ${resetCount} abandoned exams`,
      resetCount
    });
  } catch (error) {
    logger.error(`Cleanup abandoned exams error: ${error.message}`);
    next(error);
  }
};

// Get exam status for a specific user
export const getExamStatusForUser = async (req, res, next) => {
  let examId;
  try {
    examId = req.params.id;

    if (!isValidObjectId(examId)) {
      const error = new Error('Invalid exam ID');
      error.statusCode = 400;
      throw error;
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      const error = new Error('Exam not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user has already submitted
    const existingResult = exam.results.find(r => r.userId.toString() === req.user.id);
    const hasSubmitted = !!existingResult;

    // Check if exam can be started/resumed
    const canStart = ['live', 'ongoing'].includes(exam.status) && !hasSubmitted;

    res.json({
      success: true,
      examId,
      status: exam.status,
      canStart,
      hasSubmitted,
      submittedAt: existingResult?.submittedAt,
      score: existingResult?.score
    });
  } catch (error) {
    logger.error(`Get exam status error: ${error.message}`, { examId, userId: req.user.id });
    next(error);
  }
};

// Update exam status (admin only)
export const updateExamStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      const error = new Error('Invalid exam ID');
      error.statusCode = 400;
      throw error;
    }

    // Validate status
    const validStatuses = ['scheduled', 'live', 'ongoing', 'completed'];
    if (!validStatuses.includes(status)) {
      const error = new Error('Invalid status value');
      error.statusCode = 400;
      throw error;
    }

    const exam = await Exam.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('participants', 'username email')
     .populate('invigilator', 'username');

    if (!exam) {
      const error = new Error('Exam not found');
      error.statusCode = 404;
      throw error;
    }

    logger.info(`Exam status updated: ${exam.title} -> ${status}`);
    res.json({ success: true, exam });
  } catch (error) {
    logger.error(`Update exam status error: ${error.message}`, { examId: req.params.id });
    next(error);
  }
};
