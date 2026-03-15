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
          content: `Hello ${data.data.user.name || data.data.user.username}! 👋 I'm your EduCloud AI Assistant. How can I assist you today?

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
        
        setMessages(prev => [...prev, welcomeMessage]);
      } else {
        throw new Error('Failed to fetch user info');
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Error fetching user info:', error);
    }
  }, [API_BASE_URL]);

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
    <div className="flex items-center space-x-2 p-3">
      <Bot size={20} className="text-blue-500" />
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
      </div>
      <span className="text-sm text-gray-500">AI is thinking...</span>
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
            <div className={`p-3 rounded-2xl ${
              isBot 
                ? isWelcome 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : isError
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-800'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
            }`}>
              {message.intent && (
                <div className="intent-badge mb-2">
                  {message.intent}
                </div>
              )}
              
              <div className="prose prose-sm max-w-none">
                {message.content.split('\n').map((line, index) => (
                  <div key={index} className={`${index === 0 ? 'mt-0' : 'mt-2'} ${
                    isWelcome || !isBot ? 'text-white' : 'text-gray-800'
                  }`}>
                    {line.startsWith('•') ? (
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-300 font-bold">•</span>
                        <span>{line.substring(1).trim()}</span>
                      </div>
                    ) : line ? (
                      <p className="mb-1">{line}</p>
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
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-float z-50"
        aria-label="Open Chat Assistant"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div 
      ref={chatContainerRef}
      className={`fixed chat-container chat-transition ${
        isMinimized 
          ? 'w-80 h-16 bottom-6 right-6' 
          : isFullscreen
            ? 'inset-4 w-auto h-auto max-w-none max-h-none'
            : 'w-96 h-[600px] bottom-6 right-6'
      } bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">EduCloud AI Assistant</h3>
            {renderConnectionStatus()}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Expand size={16} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chatbot-messages bg-gradient-to-b from-gray-50 to-white">
            {messages.length === 0 && showQuickActions && (
              <div className="text-center py-8">
                <Bot size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">👋 Hello! I'm your EduCloud AI Assistant</p>
                <div className="space-y-2">
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
          <div className="border-t border-gray-200 p-4 bg-white">
            {connectionStatus === 'error' && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <span className="text-red-600 text-sm">Connection lost</span>
                <button
                  onClick={retryLastMessage}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="Retry last message"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            )}
            
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  disabled={isLoading || connectionStatus === 'disconnected'}
                  className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white placeholder-gray-400 text-gray-900"
                  rows="1"
                  style={{ 
                    minHeight: '52px', 
                    maxHeight: '120px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}
                />
                
                {/* Character counter */}
                {inputMessage.length > 0 && (
                  <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                    {inputMessage.length}/500
                  </div>
                )}
              </div>
              
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading || connectionStatus === 'disconnected'}
                className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center min-w-[52px] shadow-md hover:shadow-lg"
                aria-label="Send message"
              >
                {isLoading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            
            {/* Quick actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex space-x-2">
                <button
                  onClick={clearConversation}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear Chat
                </button>
                <span className="text-gray-300">•</span>
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showQuickActions ? 'Hide' : 'Show'} Suggestions
                </button>
              </div>
              
              <div className="text-xs text-gray-400">
                Powered by AI ✨
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatbotImproved;
