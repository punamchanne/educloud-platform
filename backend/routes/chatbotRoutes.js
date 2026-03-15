import express from 'express';
import { protect } from '../middlewares/auth.js';
import { 
  chatWithBot, 
  getUserDashboardData, 
  getChatbotSuggestions 
} from '../controllers/chatbotController.js';
import { validateChatMessage } from '../middlewares/validation.js';

const router = express.Router();

// All chatbot routes require authentication
router.use(protect);

// Main chatbot conversation endpoint
// POST /api/chatbot/chat
router.post('/chat', validateChatMessage, chatWithBot);

// Get comprehensive user dashboard data for chatbot context
// GET /api/chatbot/dashboard
router.get('/dashboard', getUserDashboardData);

// Get contextual suggestions based on user role and query
// GET /api/chatbot/suggestions?category=academic
router.get('/suggestions', getChatbotSuggestions);

export default router;