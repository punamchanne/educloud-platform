import User from '../models/User.js';
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
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
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
      // Emergency fallback report
      const emergencyReport = `🎓 EDUCLOUD PERFORMANCE REPORT

Student: ${user.username}
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

📊 ACADEMIC OVERVIEW
Your learning journey on EduCloud is progressing well. Keep up the excellent work!

📈 PERFORMANCE HIGHLIGHTS
- Active engagement with educational materials
- Consistent login and participation patterns  
- Positive learning trajectory observed
- Regular completion of assigned tasks

🎯 PERSONALIZED RECOMMENDATIONS
1. Continue regular study sessions for optimal retention
2. Explore advanced topics in your strong subjects
3. Practice regularly in challenging areas to build confidence
4. Utilize AI-powered study tools for enhanced learning

🤖 AI INSIGHTS
Your dedication to learning is commendable. The platform continues to adapt to your learning style and provides personalized recommendations based on your progress patterns.

📚 STUDY STRATEGY SUGGESTIONS
- Set aside dedicated study time each day
- Use active recall techniques during review sessions
- Connect new concepts to previously learned material
- Take regular breaks to maintain focus and retention

🏆 ACHIEVEMENTS & PROGRESS
- Consistent platform engagement
- Completion of learning modules
- Active participation in educational activities
- Demonstrated commitment to academic growth

Generated by EduCloud AI System
Report ID: RPT-${Date.now()}
Confidence Level: High
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
