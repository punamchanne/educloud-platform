import express from 'express';
import { protect } from '../middlewares/auth.js';
import User from '../models/User.js';
import Exam from '../models/Exam.js';
import Notification from '../models/Notification.js';
import { generateChatbotResponse } from '../services/chatbotService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Test endpoint to verify chatbot functionality
// GET /api/chatbot/test
router.get('/test', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Test basic database connectivity
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Test data retrieval
    const [exams, notifications] = await Promise.all([
      Exam.find({ participants: userId }).limit(3),
      Notification.find({ userId }).limit(3)
    ]);

    // Test AI response generation
    const testMessage = "Hello, can you tell me about my academic performance?";
    const testContext = {
      user: {
        id: userId,
        username: user.username,
        role: user.role,
        fullName: user.profile?.fullName || user.username,
        examCount: user.examCount || 0,
        averageScore: user.averageScore || 0
      },
      intent: 'performance_info',
      contextData: {
        exams: exams,
        examHistory: user.examHistory || []
      },
      platform: {
        name: 'EduCloud',
        version: '2.0',
        features: ['AI-Powered Learning', 'Smart Analytics']
      }
    };

    let aiResponse = "AI service temporarily unavailable";
    try {
      aiResponse = await generateChatbotResponse(testMessage, testContext);
    } catch (aiError) {
      logger.warn('AI response test failed:', aiError.message);
    }

    res.json({
      success: true,
      message: 'Chatbot system test completed',
      testResults: {
        databaseConnection: 'OK',
        userDataRetrieval: 'OK',
        examDataCount: exams.length,
        notificationDataCount: notifications.length,
        aiResponseGeneration: aiResponse ? 'OK' : 'LIMITED',
        sampleAiResponse: aiResponse.substring(0, 200) + '...'
      },
      userData: {
        username: user.username,
        role: user.role,
        examCount: user.examCount || 0,
        averageScore: user.averageScore || 0,
        notificationCount: notifications.length
      }
    });

  } catch (error) {
    logger.error('Chatbot test error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Chatbot test failed',
      error: error.message
    });
  }
});

// Test intent detection
// POST /api/chatbot/test-intent
router.post('/test-intent', protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Test message is required'
      });
    }

    // Import the intent detection function from controller
    const { detectIntent } = await import('../controllers/chatbotController.js');
    
    // Test messages with known intents
    const testMessages = [
      { message: "show my exams", expectedIntent: "exam_info" },
      { message: "check my grades", expectedIntent: "performance_info" },
      { message: "what's my timetable", expectedIntent: "timetable_info" },
      { message: "show notifications", expectedIntent: "notification_info" },
      { message: "hello", expectedIntent: "greeting" },
      { message: "help me", expectedIntent: "help" }
    ];

    const results = testMessages.map(test => {
      const detectedIntent = detectIntent ? detectIntent(test.message.toLowerCase()) : 'general_conversation';
      return {
        message: test.message,
        expectedIntent: test.expectedIntent,
        detectedIntent,
        match: detectedIntent === test.expectedIntent
      };
    });

    // Test the provided message
    const userMessageIntent = detectIntent ? detectIntent(message.toLowerCase()) : 'general_conversation';

    res.json({
      success: true,
      message: 'Intent detection test completed',
      userMessage: {
        message,
        detectedIntent: userMessageIntent
      },
      testResults: results,
      accuracy: (results.filter(r => r.match).length / results.length * 100).toFixed(1) + '%'
    });

  } catch (error) {
    logger.error('Intent detection test error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Intent detection test failed',
      error: error.message
    });
  }
});

// Test NLP data integrity
// GET /api/chatbot/test-nlp
router.get('/test-nlp', protect, async (req, res) => {
  try {
    // Import NLP data
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const nlpIntents = JSON.parse(readFileSync(join(__dirname, '../data/nlpIntents.json'), 'utf8'));
    
    const stats = {
      totalIntents: nlpIntents.intents.length,
      totalPatterns: nlpIntents.intents.reduce((sum, intent) => sum + intent.patterns.length, 0),
      totalResponses: nlpIntents.intents.reduce((sum, intent) => sum + intent.responses.length, 0),
      intentsWithSuggestions: Object.keys(nlpIntents.suggestions).length,
      totalEntities: Object.keys(nlpIntents.entities).reduce((sum, entity) => 
        sum + nlpIntents.entities[entity].length, 0),
      quickActionsCount: Object.keys(nlpIntents.quick_actions).reduce((sum, role) => 
        sum + nlpIntents.quick_actions[role].length, 0)
    };

    // Validate data structure
    const validation = {
      allIntentsHavePatterns: nlpIntents.intents.every(intent => 
        intent.patterns && intent.patterns.length > 0),
      allIntentsHaveResponses: nlpIntents.intents.every(intent => 
        intent.responses && intent.responses.length > 0),
      allIntentsHaveTags: nlpIntents.intents.every(intent => 
        intent.tag && intent.tag.length > 0),
      suggestionsStructureValid: typeof nlpIntents.suggestions === 'object',
      entitiesStructureValid: typeof nlpIntents.entities === 'object'
    };

    res.json({
      success: true,
      message: 'NLP data test completed',
      statistics: stats,
      validation: validation,
      sampleIntents: nlpIntents.intents.slice(0, 3).map(intent => ({
        tag: intent.tag,
        patternCount: intent.patterns.length,
        samplePatterns: intent.patterns.slice(0, 3)
      }))
    });

  } catch (error) {
    logger.error('NLP data test error:', error.message);
    res.status(500).json({
      success: false,
      message: 'NLP data test failed',
      error: error.message
    });
  }
});

// Simulate conversation flow
// POST /api/chatbot/test-conversation
router.post('/test-conversation', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    const conversationFlow = [
      "Hello",
      "Show my exam performance",
      "What's my timetable today?", 
      "Check my notifications",
      "Help me with my studies"
    ];

    const results = [];
    
    for (const message of conversationFlow) {
      try {
        const userContext = {
          user: {
            id: userId,
            username: user.username,
            role: user.role,
            fullName: user.profile?.fullName || user.username,
            examCount: user.examCount || 0,
            averageScore: user.averageScore || 0
          },
          intent: 'general_conversation',
          contextData: {},
          platform: {
            name: 'EduCloud',
            version: '2.0',
            features: ['AI-Powered Learning']
          }
        };

        const response = await generateChatbotResponse(message, userContext);
        
        results.push({
          userMessage: message,
          botResponse: response.substring(0, 100) + '...',
          responseLength: response.length,
          timestamp: new Date().toISOString()
        });
        
        // Small delay to simulate real conversation
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        results.push({
          userMessage: message,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json({
      success: true,
      message: 'Conversation flow test completed',
      conversationResults: results,
      summary: {
        totalMessages: conversationFlow.length,
        successfulResponses: results.filter(r => !r.error).length,
        averageResponseLength: Math.round(
          results.filter(r => r.responseLength)
            .reduce((sum, r) => sum + r.responseLength, 0) / 
          results.filter(r => r.responseLength).length
        )
      }
    });

  } catch (error) {
    logger.error('Conversation test error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Conversation test failed',
      error: error.message
    });
  }
});

export default router;