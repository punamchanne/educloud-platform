import api from '../services/api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader, 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2,
  RotateCcw,
  HelpCircle,
  BookOpen,
  Calendar,
  Bell,
  FileText,
  BarChart3,
  Clock,
  Sparkles,
  Copy,
  ThumbsUp,
  ChevronDown
} from 'lucide-react';
import './ChatbotImproved.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ChatbotImproved = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [messageReactions, setMessageReactions] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connected');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && !userInfo) {
      fetchUserInfo();
      loadInitialSuggestions();
    }
  }, [isOpen, userInfo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingIndicator]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchUserInfo = async () => {
    try {
      setConnectionStatus('connecting');
      const token = localStorage.getItem('token');
      if (!token) {
        setConnectionStatus('disconnected');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/chatbot/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data.data.user);
        setConnectionStatus('connected');
        
        // Add enhanced welcome message
        const welcomeMessage = {
          id: Date.now(),
          type: 'bot',
          content: `Hello ${data.data.user.fullName || data.data.user.username}! ✨ 

I'm your intelligent EduCloud assistant with complete access to your academic data. I can help you with:

📊 **Academic Performance & Analytics**
📅 **Schedules & Timetables** 
🔔 **Notifications & Updates**
📚 **Documents & Resources**
📝 **Attendance Records**
👥 **Meetings & Communications**

Ask me anything about your academic journey - I'm here to make your educational experience smarter and more personalized!`,
          timestamp: new Date(),
          isWelcome: true
        };
        setMessages([welcomeMessage]);
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setConnectionStatus('error');
    }
  };

  const loadInitialSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/chatbot/suggestions?category=general`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setTypingIndicator(true);
    setShowQuickActions(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: messageText.trim(),
          context: { 
            timestamp: new Date().toISOString(),
            conversationLength: messages.length
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Simulate realistic typing delay
        const typingDelay = Math.min(2000, Math.max(800, data.response.length * 10));
        
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            type: 'bot',
            content: data.response,
            intent: data.intent,
            suggestions: data.suggestions,
            timestamp: new Date(),
            canReact: true
          };

          setMessages(prev => [...prev, botMessage]);
          setSuggestions(data.suggestions || []);
          setTypingIndicator(false);
          setIsLoading(false);
          
          // Focus back to input
          setTimeout(() => inputRef.current?.focus(), 100);
        }, typingDelay);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or check your internet connection. 🔧",
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      setTypingIndicator(false);
      setIsLoading(false);
      setConnectionStatus('error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowQuickActions(true);
    fetchUserInfo(); // This will add the welcome message again
    loadInitialSuggestions();
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // Could add a toast notification here
  };

  const reactToMessage = (messageId, reaction) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: reaction
    }));
  };

  const quickActions = [
    { 
      icon: BarChart3, 
      text: "Show my academic performance", 
      color: "from-blue-500 to-blue-600",
      description: "View grades and analytics"
    },
    { 
      icon: BookOpen, 
      text: "Check my exam schedule", 
      color: "from-green-500 to-green-600",
      description: "Upcoming tests and deadlines"
    },
    { 
      icon: Calendar, 
      text: "What's my timetable today?", 
      color: "from-purple-500 to-purple-600",
      description: "Today's classes and schedule"
    },
    { 
      icon: Bell, 
      text: "Show my notifications", 
      color: "from-orange-500 to-orange-600",
      description: "Recent alerts and updates"
    },
    { 
      icon: FileText, 
      text: "Access my documents", 
      color: "from-teal-500 to-teal-600",
      description: "Study materials and resources"
    },
    { 
      icon: Clock, 
      text: "Check my attendance record", 
      color: "from-red-500 to-red-600",
      description: "Attendance history and stats"
    }
  ];

  const formatMessage = (content) => {
    // Enhanced message formatting with better support for lists and emphasis
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\n\n/g, '</p><p class="mt-2">')
      .replace(/\n/g, '<br />');
  };

  const getStatusIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>;
      case 'connecting':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-float"
        >
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            AI
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={chatContainerRef}
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out transform ${
        isMinimized ? 'h-16 w-80' : 'h-[700px] w-96'
      } bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-lg`}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}
    >
      
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-4 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
            <Bot size={20} className="animate-bounce" />
          </div>
          <div>
            <h3 className="font-bold text-lg">EduCloud AI</h3>
            <div className="flex items-center gap-2 text-xs text-blue-100">
              {getStatusIndicator()}
              <span>
                {userInfo ? `Helping ${userInfo.username}` : 'Intelligent Assistant'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            title={isMinimized ? "Expand chat" : "Minimize chat"}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            title="Clear conversation"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            title="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Enhanced Quick Actions */}
          {showQuickActions && messages.length <= 1 && (
            <div className="p-4 border-b border-gray-100 bg-gradient-to-b from-blue-50 to-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-purple-600" />
                <h4 className="text-sm font-semibold text-gray-800">Quick Actions</h4>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(action.text)}
                    className="group flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md border border-transparent hover:border-gray-200"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{action.text}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96 chatbot-messages" style={{ scrollBehavior: 'smooth' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${
                  message.type === 'bot' ? 'message-bot' : 'message-user'
                }`}
              >
                {message.type === 'bot' && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full flex-shrink-0 w-8 h-8 flex items-center justify-center shadow-lg">
                    <Bot size={14} />
                  </div>
                )}
                
                <div className="group flex flex-col max-w-[85%]">
                  <div
                    className={`p-4 rounded-2xl transition-all duration-200 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto shadow-lg'
                        : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : message.isWelcome
                        ? 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 border border-blue-200'
                        : 'bg-gray-50 text-gray-800 shadow-sm hover:shadow-md border border-gray-200'
                    }`}
                  >
                    <div 
                      className={message.isWelcome ? 'prose prose-sm' : ''}
                      dangerouslySetInnerHTML={{ 
                        __html: formatMessage(message.content) 
                      }} 
                    />
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className={`text-xs ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {message.intent && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                            {message.intent}
                          </span>
                        )}
                      </div>
                      
                      {message.type === 'bot' && message.canReact && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => copyMessage(message.content)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors duration-150"
                            title="Copy message"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={() => reactToMessage(message.id, 'like')}
                            className={`p-1 hover:bg-green-100 rounded transition-colors duration-150 ${
                              messageReactions[message.id] === 'like' ? 'text-green-600' : 'text-gray-400'
                            }`}
                            title="Like this response"
                          >
                            <ThumbsUp size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="bg-gray-200 text-gray-600 p-2 rounded-full flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {/* Enhanced Typing Indicator */}
            {typingIndicator && (
              <div className="flex gap-3 justify-start message-bot">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl max-w-[80%] border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Suggestions */}
          {suggestions.length > 0 && !typingIndicator && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <ChevronDown size={14} className="text-purple-600" />
                <span className="text-xs font-medium text-gray-700">Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs bg-white text-blue-600 px-3 py-2 rounded-full hover:bg-blue-50 transition-all duration-200 border border-blue-200 hover:border-blue-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your exams, grades, schedule, or anything else..."
                  className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  rows="1"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>Press Enter to send • Shift+Enter for new line</span>
              <div className="flex items-center gap-1">
                <Sparkles size={12} className="text-purple-600" />
                <span className="font-medium">AI Powered</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatbotImproved;
