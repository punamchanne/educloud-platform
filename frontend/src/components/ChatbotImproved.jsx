import api from '../services/api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  User, 
  Bot,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Expand
} from 'lucide-react';
import './ChatbotImproved.css';

const ChatbotImproved = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected'); // connected, connecting, disconnected, error
  const [userInfo, setUserInfo] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const API_BASE_URL = 'http://localhost:5000/api';
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchUserInfo = useCallback(async () => {
    if (hasInitialized) return; // Prevent duplicate initialization
    
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
        setHasInitialized(true);
        
        // Only add welcome message if no messages exist
        if (messages.length === 0) {
          const welcomeMessage = {
            id: Date.now(),
            type: 'bot',
            content: `Hello ${data.data.user.username || data.data.user.name || 'there'}! 👋 I'm your EduCloud AI Assistant. How can I assist you today?

I can help you with:
• Check your exam schedules and results
• View your class timetable  
• Review notifications and updates
• Track your academic progress
• Get help with assignments
• Navigate platform features

What would you like to know about?`,
            intent: 'welcome',
            suggestions: [
              'Show my dashboard',
              'Check my grades',
              'View upcoming exams', 
              'Show my timetable',
              'Recent notifications'
            ],
            isWelcome: true,
            timestamp: new Date()
          };
          
          setMessages([welcomeMessage]);
        }
      } else {
        throw new Error('Failed to fetch user info');
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Error fetching user info:', error);
    }
  }, [API_BASE_URL, hasInitialized, messages.length]);

  const loadInitialSuggestions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chatbot/suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }, [API_BASE_URL]);

  const saveConversationHistory = useCallback(() => {
    try {
      const conversationData = {
        messages,
        timestamp: new Date().toISOString(),
        userId: userInfo?.id
      };
      localStorage.setItem('chatbot_conversation', JSON.stringify(conversationData));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }, [messages, userInfo?.id]);

  const loadConversationHistory = useCallback(() => {
    try {
      const saved = localStorage.getItem('chatbot_conversation');
      if (saved) {
        const conversationData = JSON.parse(saved);
        if (conversationData.userId === userInfo?.id && conversationData.messages) {
          setMessages(conversationData.messages);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }, [userInfo?.id]);

  useEffect(() => {
    if (isOpen && !userInfo) {
      fetchUserInfo();
      loadInitialSuggestions();
    }
  }, [isOpen, userInfo, fetchUserInfo, loadInitialSuggestions]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingIndicator, scrollToBottom]);

  // Handle connection status
  useEffect(() => {
    const checkConnection = () => {
      setConnectionStatus(navigator.onLine ? 'connected' : 'error');
    };

    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Load conversation history on mount
  useEffect(() => {
    if (isOpen && userInfo) {
      loadConversationHistory();
    }
  }, [isOpen, userInfo, loadConversationHistory]);

  // Auto-save conversation periodically
  useEffect(() => {
    if (messages.length > 0) {
      const interval = setInterval(() => {
        saveConversationHistory();
      }, 30000); // Save every 30 seconds

      return () => clearInterval(interval);
    }
  }, [messages, saveConversationHistory]);

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
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botMessage]);
          setTypingIndicator(false);
          setIsLoading(false);
          
          if (data.suggestions && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
          }
        }, typingDelay);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setTypingIndicator(false);
      setIsLoading(false);
      setConnectionStatus('error');
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble connecting right now. Please check your internet connection and try again.",
        isError: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error sending message:', error);
    }
  };

  const handleMessageReaction = (messageId, reaction) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
        : msg
    ));
  };

  const copyMessageToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const retryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.type === 'user');
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setShowQuickActions(true);
    localStorage.removeItem('chatbot_conversation');
    if (userInfo) {
      fetchUserInfo(); // Reload welcome message
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderConnectionStatus = () => {
    const statusConfig = {
      connected: { icon: CheckCircle, color: 'text-green-500', text: 'Connected' },
      connecting: { icon: RefreshCw, color: 'text-yellow-500', text: 'Connecting...' },
      disconnected: { icon: WifiOff, color: 'text-gray-500', text: 'Disconnected' },
      error: { icon: AlertCircle, color: 'text-red-500', text: 'Connection Error' }
    };

    const config = statusConfig[connectionStatus];
    const StatusIcon = config.icon;

    return (
      <div className={`flex items-center space-x-1 text-xs ${config.color}`}>
        <StatusIcon size={12} className={connectionStatus === 'connecting' ? 'animate-spin' : ''} />
        <span>{config.text}</span>
      </div>
    );
  };

  const renderTypingIndicator = () => (
    <div className="flex items-center space-x-4 p-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Bot size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            </div>
            <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessage = (message) => {
    const isBot = message.type === 'bot';
    const isWelcome = message.isWelcome;
    const isError = message.isError;

    return (
      <div key={message.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
        <div className={`flex ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start space-x-2 max-w-[80%]`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isBot ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-green-500 to-blue-500'
          } text-white`}>
            {isBot ? <Bot size={16} /> : <User size={16} />}
          </div>
          
          <div className={`message-bubble ${isBot ? 'message-bot' : 'message-user'} ${
            isWelcome ? 'welcome-message' : ''
          } ${isError ? 'error-message' : ''} relative group`}>
            <div className={`p-4 rounded-2xl ${
              isBot 
                ? isWelcome 
                  ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white shadow-lg' 
                  : isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-white text-gray-800 shadow-md border border-gray-100'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
            }`}>
              {message.intent && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-black bg-opacity-20 text-white text-xs font-medium rounded-full">
                    {message.intent}
                  </span>
                </div>
              )}
              
              <div className="prose prose-sm max-w-none">
                {message.content.split('\n').map((line, index) => (
                  <div key={index} className={`${index === 0 ? 'mt-0' : 'mt-2'} ${
                    isWelcome || !isBot ? 'text-white' : 'text-gray-800'
                  }`}>
                    {line.startsWith('•') ? (
                      <div className="flex items-start space-x-2 mb-1">
                        <span className={`${isWelcome || !isBot ? 'text-white' : 'text-blue-500'} font-bold text-lg leading-none`}>•</span>
                        <span className="leading-relaxed">{line.substring(1).trim()}</span>
                      </div>
                    ) : line ? (
                      <p className="mb-1 leading-relaxed">{line}</p>
                    ) : (
                      <div className="h-2"></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Message reactions and actions */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-opacity-20">
                <div className="flex items-center space-x-2">
                  {isBot && (
                    <>
                      <button
                        onClick={() => handleMessageReaction(message.id, 'like')}
                        className={`reaction-button ${message.reaction === 'like' ? 'liked' : ''}`}
                        title="Like this response"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMessageReaction(message.id, 'dislike')}
                        className={`reaction-button ${message.reaction === 'dislike' ? 'disliked' : ''}`}
                        title="Dislike this response"
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => copyMessageToClipboard(message.content)}
                    className="reaction-button"
                    title="Copy message"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                
                <span className="text-xs opacity-60">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
            
            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-500 font-medium">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(suggestion)}
                      className="px-4 py-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-full text-sm text-gray-700 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 transform hover:scale-110"
        aria-label="Open Chat Assistant"
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #6366f1 100%)',
          boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          animation: 'float 3s ease-in-out infinite'
        }}
      >
        <MessageCircle size={28} />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      </button>
    );
  }

  return (
    <div 
      ref={chatContainerRef}
      className={`fixed z-50 ${
        isMinimized 
          ? 'w-80 h-16 bottom-6 right-6' 
          : isFullscreen
            ? 'inset-0 w-full h-full'
            : 'w-[420px] h-[700px] bottom-6 right-6'
      } transition-all duration-300 ease-in-out`}
    >
      <div 
        className={`w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden ${
          isFullscreen ? 'rounded-none' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-md">
            <Bot size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">EduCloud AI Assistant</h3>
            <div className="flex items-center space-x-2">
              {renderConnectionStatus()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Expand size={18} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.length === 0 && showQuickActions && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">👋 Hello! I'm your EduCloud AI Assistant</h3>
                <p className="text-gray-600 mb-6">Ready to help you with all your educational needs!</p>
                <div className="space-y-3">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(suggestion)}
                      className="block w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 rounded-xl text-blue-700 hover:text-blue-800 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map(renderMessage)}
            
            {typingIndicator && renderTypingIndicator()}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
            {connectionStatus === 'error' && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <span className="text-red-600 text-sm font-medium">Connection lost</span>
                <button
                  onClick={retryLastMessage}
                  className="text-red-600 hover:text-red-700 transition-colors p-1 hover:bg-red-100 rounded"
                  title="Retry last message"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            )}
            
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  disabled={isLoading || connectionStatus === 'disconnected'}
                  className="w-full p-4 pr-12 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-gray-50 focus:bg-white placeholder-gray-500 text-gray-900"
                  rows="1"
                  style={{ 
                    minHeight: '56px', 
                    maxHeight: '120px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '15px',
                    lineHeight: '1.5'
                  }}
                />
                
                {/* Character counter */}
                {inputMessage.length > 0 && (
                  <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {inputMessage.length}/500
                  </div>
                )}
              </div>
              
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading || connectionStatus === 'disconnected'}
                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center min-w-[56px] shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                aria-label="Send message"
              >
                {isLoading ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            
            {/* Quick actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex space-x-4">
                <button
                  onClick={clearConversation}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  Clear Chat
                </button>
                <span className="text-gray-300">•</span>
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  {showQuickActions ? 'Hide' : 'Show'} Suggestions
                </button>
              </div>
              
              <div className="text-xs text-gray-400 flex items-center space-x-1">
                <span>Powered by AI</span>
                <span>✨</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Add comprehensive CSS styling for enhanced animations and effects
const chatbotStyles = `
  <style>
    .typing-dot {
      animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dot:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    .typing-dot:nth-child(2) {
      animation-delay: -0.16s;
    }
    
    @keyframes typing {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Enhanced message animations */
    .message-enter {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    
    .message-enter-active {
      opacity: 1;
      transform: translateY(0) scale(1);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Improved button hover effects */
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
    }

    .btn-secondary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    /* Enhanced floating button effects */
    .floating-chat-btn:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 15px 35px rgba(59, 130, 246, 0.3);
    }

    /* Reaction button effects */
    .reaction-button {
      padding: 4px;
      border-radius: 50%;
      background: transparent;
      border: none;
      cursor: pointer;
      opacity: 0.6;
      transition: all 0.2s ease;
    }

    .reaction-button:hover {
      opacity: 1;
      background: rgba(59, 130, 246, 0.1);
      transform: scale(1.1);
    }

    .reaction-button.liked {
      color: #3b82f6;
      opacity: 1;
      background: rgba(59, 130, 246, 0.15);
    }

    .reaction-button.disliked {
      color: #ef4444;
      opacity: 1;
      background: rgba(239, 68, 68, 0.15);
    }

    /* Smooth scroll for messages */
    .messages-container {
      scroll-behavior: smooth;
    }

    /* Glass effect enhancements */
    .glass-effect {
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    /* Gradient text effect */
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Quick action buttons */
    .quick-action-btn {
      transition: all 0.2s ease;
      border: 1px solid rgba(59, 130, 246, 0.2);
      background: rgba(59, 130, 246, 0.05);
    }

    .quick-action-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      transform: translateY(-1px);
    }

    /* Loading pulse effect */
    .pulse-loading {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  </style>
`;

// Inject styles into document head
if (typeof document !== 'undefined' && !document.getElementById('chatbot-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'chatbot-styles';
  styleElement.innerHTML = chatbotStyles.replace(/<\/?style>/g, '');
  document.head.appendChild(styleElement);
}

export default ChatbotImproved;
