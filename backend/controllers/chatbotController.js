import User from '../models/User.js';
import Exam from '../models/Exam.js';
import Timetable from '../models/Timetable.js';
import Document from '../models/Document.js';
import Notification from '../models/Notification.js';
import Attendance from '../models/Attendance.js';
import Meeting from '../models/Meeting.js';
import { generateChatbotResponse } from '../services/chatbotService.js';
import { logger } from '../utils/logger.js';
import { isValidObjectId } from '../utils/validators.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const nlpIntents = JSON.parse(readFileSync(join(__dirname, '../data/nlpIntents.json'), 'utf8'));

// Simple response handler for basic conversational messages
function getSimpleResponse(message, user) {
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
  const farewells = ['bye', 'goodbye', 'see you', 'farewell', 'take care'];
  const thanks = ['thank you', 'thanks', 'appreciate it'];
  const howAreYou = ['how are you', 'how do you do', 'whats up', 'how is it going'];
  
  const lowerMessage = message.toLowerCase().trim();
  
  // Check for greetings
  if (greetings.some(greeting => lowerMessage.includes(greeting))) {
    const responses = [
      `Hello ${user.username}! 👋 How can I help you today?`,
      `Hi there, ${user.username}! What can I assist you with?`,
      `Hey ${user.username}! Ready to explore EduCloud together?`,
      `Good to see you, ${user.username}! What would you like to know?`
    ];
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      intent: 'greeting',
      suggestions: ['Show my dashboard', 'Check my grades', 'View upcoming exams', 'Show my timetable']
    };
  }
  
  // Check for farewells
  if (farewells.some(farewell => lowerMessage.includes(farewell))) {
    const responses = [
      `Goodbye ${user.username}! Have a great day! 👋`,
      `See you later, ${user.username}! Happy learning! 📚`,
      `Take care, ${user.username}! I'm here whenever you need help.`,
      `Farewell ${user.username}! Wishing you success in your studies! 🎓`
    ];
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      intent: 'goodbye'
    };
  }
  
  // Check for thanks
  if (thanks.some(thank => lowerMessage.includes(thank))) {
    const responses = [
      `You're welcome, ${user.username}! 😊`,
      `Happy to help, ${user.username}!`,
      `Anytime, ${user.username}! That's what I'm here for.`,
      `My pleasure, ${user.username}! Feel free to ask anything else.`
    ];
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      intent: 'thanks'
    };
  }
  
  // Check for how are you
  if (howAreYou.some(phrase => lowerMessage.includes(phrase))) {
    const responses = [
      `I'm doing great, ${user.username}! Ready to help you with your educational journey. How are you doing?`,
      `I'm fantastic, thanks for asking! How can I assist you with EduCloud today?`,
      `I'm here and ready to help, ${user.username}! What's on your academic agenda today?`,
      `I'm doing wonderful! How are your studies going, ${user.username}?`
    ];
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      intent: 'casual_conversation',
      suggestions: ['Tell me about my progress', 'What should I focus on?', 'Any tips for studying?']
    };
  }
  
  return null; // No simple response found, proceed with complex AI response
}

// Main chatbot endpoint
export const chatWithBot = async (req, res, next) => {
  try {
    const { message, context = {} } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!message || message.trim().length === 0) {
      const error = new Error('Message is required');
      error.statusCode = 400;
      throw error;
    }

    // Get user data for context and refresh exam statistics
    const user = await User.findById(userId)
      .populate('examHistory.examId', 'title subject scheduledDate')
      .lean();

    // Refresh user's exam statistics to ensure accuracy
    await refreshUserExamStats(userId);

    // Check for simple conversational responses first
    const simpleResponse = getSimpleResponse(message.toLowerCase(), user);
    if (simpleResponse) {
      return res.json({
        success: true,
        response: simpleResponse.response,
        intent: simpleResponse.intent,
        suggestions: simpleResponse.suggestions || [],
        timestamp: new Date().toISOString()
      });
    }

    // Detect intent from the message
    const intent = detectIntent(message.toLowerCase());
    
    // Get relevant data based on intent
    const contextData = await gatherContextData(intent, userId, userRole, context);
    
    // Get comprehensive user data with exam details
    const userWithCompleteData = await User.findById(userId)
      .populate('examHistory.examId', 'title subject scheduledDate totalMarks')
      .lean();

    // Calculate actual exam participation
    const examHistoryCount = userWithCompleteData.examHistory?.length || 0;
    const examsWithResults = await Exam.find({ 'results.userId': userId }).countDocuments();
    const actualExamCount = Math.max(examHistoryCount, examsWithResults, userWithCompleteData.examCount || 0);

    // Prepare comprehensive user context
    const userContext = {
      user: {
        id: userId,
        username: user.username,
        role: userRole,
        fullName: user.profile?.fullName || user.username,
        email: user.email,
        examHistory: userWithCompleteData.examHistory || [],
        examCount: actualExamCount,
        averageScore: userWithCompleteData.averageScore || 0,
        totalNotifications: user.totalNotifications || 0,
        actualExamParticipated: actualExamCount
      },
      intent,
      contextData,
      platform: {
        name: 'EduCloud',
        version: '2.0',
        features: [
          'AI-Powered Learning',
          'Smart Timetable Management', 
          'Intelligent Exam System',
          'Document Generation',
          'Performance Analytics',
          'Real-time Notifications',
          'Virtual Meetings',
          'Attendance Tracking'
        ]
      },
      timestamp: new Date().toISOString()
    };

    // Generate AI response
    const response = await generateChatbotResponse(message, userContext);

    // Log the interaction
    logger.info(`Chatbot interaction: User ${userId} (${userRole}) - Intent: ${intent}`, {
      message: message.substring(0, 100),
      intent,
      responseLength: response.length
    });

    res.json({
      success: true,
      response,
      intent,
      suggestions: getSuggestions(intent, userRole),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Chatbot error: ${error.message}`, {
      userId: req.user?.id,
      message: req.body?.message?.substring(0, 100),
      stack: error.stack
    });
    next(error);
  }
};

// Get user's complete dashboard data
export const getUserDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const dashboardData = await gatherDashboardData(userId, userRole);

    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Dashboard data error: ${error.message}`, { userId: req.user?.id });
    next(error);
  }
};

// Get chatbot suggestions based on user role and context
export const getChatbotSuggestions = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const { category = 'general' } = req.query;

    const suggestions = generateSuggestions(userRole, category);

    res.json({
      success: true,
      suggestions,
      category,
      userRole
    });

  } catch (error) {
    logger.error(`Suggestions error: ${error.message}`, { userId: req.user?.id });
    next(error);
  }
};

// Helper function to detect intent from user message
function detectIntent(message) {
  const intents = nlpIntents.intents;
  
  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(message)) {
        return intent.tag;
      }
    }
  }
  
  // Fallback intent detection
  if (message.includes('exam') || message.includes('test') || message.includes('quiz')) {
    return 'exam_info';
  }
  if (message.includes('timetable') || message.includes('schedule') || message.includes('class')) {
    return 'timetable_info';
  }
  if (message.includes('notification') || message.includes('alert') || message.includes('message')) {
    return 'notification_info';
  }
  if (message.includes('document') || message.includes('file') || message.includes('assignment')) {
    return 'document_info';
  }
  if (message.includes('attendance') || message.includes('present') || message.includes('absent')) {
    return 'attendance_info';
  }
  if (message.includes('meeting') || message.includes('conference') || message.includes('video call')) {
    return 'meeting_info';
  }
  if (message.includes('grade') || message.includes('score') || message.includes('result')) {
    return 'performance_info';
  }
  if (message.includes('help') || message.includes('how') || message.includes('what')) {
    return 'help';
  }
  
  return 'general_conversation';
}

// Gather context data based on detected intent
async function gatherContextData(intent, userId, userRole, additionalContext = {}) {
  const data = {};

  try {
    switch (intent) {
      case 'exam_info':
      case 'performance_info':
        // Get exam data
        data.exams = await Exam.find({
          $or: [
            { participants: userId },
            userRole === 'admin' ? {} : { invigilator: userId }
          ]
        })
        .populate('invigilator', 'username')
        .sort({ scheduledDate: -1 })
        .limit(10)
        .lean();

        // Get user's exam history
        const userWithExams = await User.findById(userId)
          .populate('examHistory.examId', 'title subject scheduledDate totalQuestions')
          .lean();
        data.examHistory = userWithExams?.examHistory || [];
        break;

      case 'timetable_info':
        // Get timetables
        data.timetables = await Timetable.find(
          userRole === 'admin' ? {} : 
          userRole === 'teacher' ? { 'slots.teacher': userId } :
          { class: additionalContext.userClass || '10th Grade' }
        )
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
        break;

      case 'notification_info':
        // Get notifications
        data.notifications = await Notification.find({ userId })
          .sort({ createdAt: -1 })
          .limit(20)
          .populate('createdBy', 'username')
          .lean();
        
        data.unreadCount = await Notification.getUnreadCount(userId);
        break;

      case 'document_info':
        // Get documents
        data.documents = await Document.find(
          userRole === 'admin' ? {} : { generatedBy: userId }
        )
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('generatedBy', 'username')
        .lean();
        break;

      case 'attendance_info':
        // Get attendance data
        data.attendance = await Attendance.find({
          $or: [
            { studentId: userId },
            userRole === 'teacher' ? { teacherId: userId } : {},
            userRole === 'admin' ? {} : { studentId: null }
          ]
        })
        .sort({ date: -1 })
        .limit(30)
        .populate('studentId', 'username')
        .populate('teacherId', 'username')
        .lean();
        break;

      case 'meeting_info':
        // Get meetings
        data.meetings = await Meeting.find({
          $or: [
            { organizer: userId },
            { participants: userId },
            userRole === 'admin' ? {} : { organizer: null }
          ]
        })
        .sort({ scheduledDate: -1 })
        .limit(10)
        .populate('organizer', 'username')
        .populate('participants', 'username')
        .lean();
        break;

      case 'dashboard_info':
        // Get comprehensive dashboard data
        data.dashboard = await gatherDashboardData(userId, userRole);
        break;

      default:
        // Get summary data for general conversation
        data.summary = await gatherSummaryData(userId, userRole);
        break;
    }

    return data;
  } catch (error) {
    logger.error(`Error gathering context data: ${error.message}`);
    return {};
  }
}

// Helper function to refresh user exam statistics
async function refreshUserExamStats(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Get all exams where user has submitted results
    const userExamResults = await Exam.find({ 'results.userId': userId });
    
    // Update exam history if it's missing some entries
    for (const exam of userExamResults) {
      const userResult = exam.results.find(r => r.userId.toString() === userId);
      if (userResult) {
        // Check if this exam is already in user's history
        const existingHistory = user.examHistory.find(h => h.examId?.toString() === exam._id.toString());
        
        if (!existingHistory) {
          // Add missing exam to history
          user.examHistory.push({
            examId: exam._id,
            score: userResult.score || 0,
            totalQuestions: exam.questions?.length || 0,
            correctAnswers: Math.round((userResult.score / (exam.totalMarks || 100)) * (exam.questions?.length || 0)),
            attemptDate: userResult.submittedAt || exam.scheduledDate,
            duration: exam.duration || 0,
            status: (userResult.score / (exam.totalMarks || 100)) >= 0.6 ? 'passed' : 'failed'
          });
        }
      }
    }

    // Update statistics
    user.updateExamStats();
    await user.save();
    
    return user;
  } catch (error) {
    logger.error(`Error refreshing user exam stats: ${error.message}`);
    return null;
  }
}

// Gather comprehensive dashboard data
async function gatherDashboardData(userId, userRole) {
  const data = {};

  try {
    // User information with complete exam data
    const user = await User.findById(userId)
      .populate('examHistory.examId', 'title subject scheduledDate')
      .lean();
    data.user = user;

    // Calculate actual exam participation count
    const actualExamCount = user.examHistory?.length || 0;
    
    // Also count exams where user has results
    const examsWithResults = await Exam.find({ 'results.userId': userId }).countDocuments();
    
    // Use the higher count to ensure accuracy
    data.user.actualExamCount = Math.max(actualExamCount, examsWithResults);
    data.user.examParticipated = data.user.actualExamCount;

    // Recent exams
    data.recentExams = await Exam.find({
      $or: [
        { participants: userId },
        userRole === 'admin' ? {} : { invigilator: userId }
      ]
    })
    .sort({ scheduledDate: -1 })
    .limit(5)
    .populate('invigilator', 'username')
    .lean();

    // Notifications
    data.notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'username')
      .lean();

    data.unreadNotifications = await Notification.getUnreadCount(userId);

    // Documents
    data.documents = await Document.find(
      userRole === 'admin' ? {} : { generatedBy: userId }
    )
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('generatedBy', 'username')
    .lean();

    // Timetables
    data.timetables = await Timetable.find(
      userRole === 'admin' ? {} :
      userRole === 'teacher' ? { 'slots.teacher': userId } :
      { class: '10th Grade' } // Default class, should be dynamic
    )
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

    // Recent attendance
    data.attendance = await Attendance.find({
      $or: [
        { studentId: userId },
        userRole === 'teacher' ? { teacherId: userId } : {},
        userRole === 'admin' ? {} : { studentId: null }
      ]
    })
    .sort({ date: -1 })
    .limit(10)
    .populate('studentId', 'username')
    .lean();

    // Upcoming meetings
    data.upcomingMeetings = await Meeting.find({
      $or: [
        { organizer: userId },
        { participants: userId }
      ],
      scheduledDate: { $gte: new Date() }
    })
    .sort({ scheduledDate: 1 })
    .limit(5)
    .populate('organizer', 'username')
    .lean();

    return data;
  } catch (error) {
    logger.error(`Error gathering dashboard data: ${error.message}`);
    return {};
  }
}

// Gather summary data for general responses
async function gatherSummaryData(userId, userRole) {
  try {
    const data = {};

    // Quick stats
    data.examCount = await Exam.countDocuments({
      participants: userId
    });

    data.documentCount = await Document.countDocuments(
      userRole === 'admin' ? {} : { generatedBy: userId }
    );

    data.notificationCount = await Notification.countDocuments({
      userId,
      read: false
    });

    data.upcomingMeetings = await Meeting.countDocuments({
      $or: [
        { organizer: userId },
        { participants: userId }
      ],
      scheduledDate: { $gte: new Date() }
    });

    return data;
  } catch (error) {
    logger.error(`Error gathering summary data: ${error.message}`);
    return {};
  }
}

// Generate suggestions based on user role and intent
function getSuggestions(intent, userRole) {
  const baseSuggestions = nlpIntents.suggestions[intent] || nlpIntents.suggestions.general;
  
  const roleSuggestions = {
    student: [
      "Show my exam schedule",
      "What's my average score?",
      "Check my notifications",
      "View my timetable",
      "Show my attendance"
    ],
    teacher: [
      "Show exams I'm supervising",
      "Create a new document",
      "Check student attendance",
      "Schedule a meeting",
      "View my timetable"
    ],
    admin: [
      "Show platform statistics",
      "View all recent exams",
      "Generate system reports",
      "Manage user accounts",
      "Check system health"
    ],
    parent: [
      "Show my child's progress",
      "Check recent notifications",
      "View upcoming meetings",
      "See attendance records",
      "Check exam results"
    ]
  };

  return [
    ...baseSuggestions,
    ...(roleSuggestions[userRole] || [])
  ].slice(0, 6);
}

// Generate suggestions for different categories
function generateSuggestions(userRole, category) {
  const suggestions = {
    general: {
      student: [
        "What's my current academic performance?",
        "Show me my upcoming exams",
        "Check my notification summary",
        "What classes do I have today?",
        "How can I improve my grades?"
      ],
      teacher: [
        "Show students in my classes",
        "What exams am I supervising?",
        "Create a lesson plan",
        "Check attendance patterns",
        "Schedule parent meetings"
      ],
      admin: [
        "Show platform analytics",
        "Generate performance reports",
        "Check system health",
        "View user statistics",
        "Manage notifications"
      ],
      parent: [
        "How is my child performing?",
        "Show recent parent notifications",
        "When are the next meetings?",
        "Check attendance history",
        "View upcoming exams"
      ]
    },
    academic: {
      student: [
        "Show my exam history",
        "What subjects need improvement?",
        "Display my grade trends",
        "Show study recommendations",
        "Check assignment deadlines"
      ],
      teacher: [
        "Show class performance overview",
        "Generate student reports",
        "View exam statistics",
        "Check grading progress",
        "Analyze attendance patterns"
      ],
      admin: [
        "Generate academic reports",
        "Show exam analytics",
        "View grade distributions",
        "Check teacher performance",
        "Analyze learning trends"
      ]
    },
    schedule: [
      "What's my schedule today?",
      "Show this week's timetable",
      "When is my next class?",
      "Check for schedule conflicts",
      "View upcoming meetings"
    ],
    help: [
      "How do I check my grades?",
      "How to submit assignments?",
      "Where can I find my timetable?",
      "How to join virtual meetings?",
      "What features are available?"
    ]
  };

  return suggestions[category]?.[userRole] || suggestions[category] || suggestions.general[userRole] || suggestions.general.student;
}

export default {
  chatWithBot,
  getUserDashboardData,
  getChatbotSuggestions
};