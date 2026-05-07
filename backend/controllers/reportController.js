import User from '../models/User.js';
import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import Exam from '../models/Exam.js';
import { generateReport } from '../services/geminiService.js';
import { logger } from '../utils/logger.js';
import { isValidObjectId } from '../utils/validators.js';

// Generate student performance report (admin or self)
export const generateStudentReport = async (req, res, next) => {
  let userId;
  try {
    userId = req.params.userId || req.user.id; // Admin can specify user, students get own report
    if (!isValidObjectId(userId)) {
      const error = new Error('Invalid user ID');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId).populate('examHistory.examId', 'title scheduledDate subject totalQuestions timeLimit');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Restrict non-admins from accessing others' reports
    if (req.user.role !== 'admin' && userId !== req.user.id) {
      // Check if user is a parent of this student
      if (req.user.role === 'parent') {
        const parent = await Parent.findOne({ user: req.user.id });
        const student = await Student.findOne({ user: userId });
        
        if (!student || !parent?.children.some(child => child.studentId.toString() === student._id.toString())) {
          const error = new Error('Access denied: Student is not registered as your child');
          error.statusCode = 403;
          throw error;
        }
      } else {
        const error = new Error('Access denied');
        error.statusCode = 403;
        throw error;
      }
    }

    // Get detailed exam data (with error handling for missing exams)
    const examIds = user.examHistory.map(exam => exam.examId).filter(id => id); // Filter out null/undefined
    let detailedExams = [];
    
    if (examIds.length > 0) {
      try {
        detailedExams = await Exam.find({ _id: { $in: examIds } })
          .populate('invigilator', 'username')
          .sort({ scheduledDate: -1 });
      } catch (examError) {
        logger.warn('Could not fetch detailed exam data:', examError.message);
        detailedExams = []; // Continue with empty array if exam fetch fails
      }
    }

    // Calculate additional statistics
    const totalExams = user.examHistory.length;
    const passedExams = user.examHistory.filter(exam => exam.status === 'passed').length;
    const failedExams = user.examHistory.filter(exam => exam.status === 'failed').length;
    const averageScore = user.averageScore || 0;

    // Subject-wise performance
    const subjectPerformance = {};
    user.examHistory.forEach(exam => {
      const examDetails = detailedExams.find(e => e._id.toString() === exam.examId?.toString());
      const subjectName = examDetails?.subject || 'Unknown Subject';
      
      if (!subjectPerformance[subjectName]) {
        subjectPerformance[subjectName] = {
          totalExams: 0,
          totalScore: 0,
          highestScore: 0,
          lowestScore: 100,
          averageScore: 0
        };
      }
      
      subjectPerformance[subjectName].totalExams++;
      subjectPerformance[subjectName].totalScore += exam.score || 0;
      subjectPerformance[subjectName].highestScore = Math.max(
        subjectPerformance[subjectName].highestScore, 
        exam.score || 0
      );
      subjectPerformance[subjectName].lowestScore = Math.min(
        subjectPerformance[subjectName].lowestScore, 
        exam.score || 0
      );
    });

    // Calculate averages for each subject
    Object.keys(subjectPerformance).forEach(subject => {
      const subjectData = subjectPerformance[subject];
      subjectData.averageScore = subjectData.totalExams > 0 ? subjectData.totalScore / subjectData.totalExams : 0;
    });

    // Performance trend (last 5 exams)
    const recentExams = user.examHistory
      .sort((a, b) => new Date(b.attemptDate) - new Date(a.attemptDate))
      .slice(0, 5);

    // Time spent analysis
    const totalTimeSpent = user.examHistory.reduce((total, exam) => total + (exam.duration || 0), 0);
    const averageTimePerExam = totalExams > 0 ? totalTimeSpent / totalExams : 0;

    // Prepare comprehensive data for Gemini
    const reportData = {
      studentInfo: {
        username: user.username,
        email: user.email,
        fullName: user.profile?.fullName || user.username,
        reportGeneratedDate: new Date().toISOString()
      },
      performanceOverview: {
        totalExams,
        passedExams,
        failedExams,
        passRate: totalExams > 0 ? ((passedExams / totalExams) * 100).toFixed(1) : 0,
        overallAverageScore: averageScore.toFixed(1),
        totalTimeSpent: Math.round(totalTimeSpent),
        averageTimePerExam: Math.round(averageTimePerExam)
      },
      subjectPerformance,
      recentExamTrend: recentExams.map(exam => {
        const examDetails = detailedExams.find(e => e._id.toString() === exam.examId?.toString());
        return {
          date: exam.attemptDate,
          score: exam.score || 0,
          status: exam.status || 'unknown',
          examTitle: examDetails?.title || exam.examId?.title || 'Unknown Exam'
        };
      }),
      detailedExamHistory: user.examHistory.map(exam => {
        const examDetails = detailedExams.find(e => e._id.toString() === exam.examId?.toString());
        return {
          title: examDetails?.title || exam.examId?.title || 'Unknown Exam',
          subject: examDetails?.subject || 'Unknown Subject',
          date: exam.attemptDate,
          score: exam.score || 0,
          totalQuestions: exam.totalQuestions || examDetails?.totalQuestions || 0,
          correctAnswers: exam.correctAnswers || 0,
          accuracy: (exam.totalQuestions || examDetails?.totalQuestions) > 0 ? 
            (((exam.correctAnswers || 0) / (exam.totalQuestions || examDetails?.totalQuestions || 1)) * 100).toFixed(1) : 0,
          duration: exam.duration || 0,
          status: exam.status || 'unknown',
          timePerQuestion: (exam.totalQuestions || examDetails?.totalQuestions) > 0 ? 
            ((exam.duration || 0) / (exam.totalQuestions || examDetails?.totalQuestions || 1)).toFixed(1) : 0
        };
      }),
      performanceAnalysis: {
        strengths: ['Active Learning', 'Consistent Participation'],
        improvements: ['Time Management', 'Advanced Problem Solving'],
        recommendations: ['Regular Practice', 'Focus on Weak Areas', 'Use Study Groups']
      }
    };

    try {
      const report = await generateReport(reportData);
      logger.info(`Comprehensive report generated for user: ${userId}`);
      res.json({ success: true, report });
    } catch (reportError) {
      logger.error(`Report generation failed, using emergency fallback: ${reportError.message}`);
      // Emergency fallback report with real data
      const emergencyReport = `🎓 EDUCLOUD PERFORMANCE REPORT (System Generated)

Student: ${reportData.studentInfo.fullName} (${reportData.studentInfo.username})
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

📊 PERFORMANCE SUMMARY
- Total Exams Attempted: ${reportData.performanceOverview.totalExams}
- Overall Average: ${reportData.performanceOverview.overallAverageScore}%
- Pass Rate: ${reportData.performanceOverview.passRate}%

📉 RECENT RESULTS
${reportData.recentExamTrend.length > 0 
  ? reportData.recentExamTrend.map(e => `- ${e.examTitle}: ${e.score}% (${e.status.toUpperCase()})`).join('\n')
  : '- No recent results available'}

🎯 AI INSIGHTS & ANALYSIS
Our analysis indicates that your learning journey is progressing. Although the advanced processing engine is currently under maintenance, your documented scores show active participation.

📚 RECOMMENDED FOCUS
1. Maintain consistent study patterns in ${Object.keys(reportData.subjectPerformance)[0] || 'all subjects'}
2. Review previous incorrect answers to strengthen understanding
3. Utilize practice modules for upcoming assessments

Generated by EduCloud Verification System
Report ID: RPT-${Date.now()}
Next Review: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;

      res.json({ success: true, report: emergencyReport });
    }
  } catch (error) {
    logger.error(`Generate report error: ${error.message}`, { userId, stack: error.stack });
    next(error);
  }
};

// Generate exam summary report (admin only)
export const generateExamReport = async (req, res, next) => {
  let examId;
  try {
    examId = req.params.examId;
    if (!isValidObjectId(examId)) {
      const error = new Error('Invalid exam ID');
      error.statusCode = 400;
      throw error;
    }

    const exam = await Exam.findById(examId).populate('participants', 'username').populate('results.userId', 'username');
    if (!exam) {
      const error = new Error('Exam not found');
      error.statusCode = 404;
      throw error;
    }

    // Prepare data for Gemini
    const reportData = {
      title: exam.title,
      scheduledDate: exam.scheduledDate,
      participants: exam.participants.length,
      averageScore: exam.getAverageScore(),
      results: exam.results,
    };

    const report = await generateReport(reportData);
    logger.info(`Exam report generated: ${examId}`);
    res.json({ success: true, report });
  } catch (error) {
    logger.error(`Generate exam report error: ${error.message}`, { examId });
    next(error);
  }
};
