import api from '../services/api';
import React, { useState, useEffect, useRef } from 'react';
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
  Mic,
  Image,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import './Chatbot.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState({});
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
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/chatbot/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data.data.user);
        
        // Add welcome message
        const welcomeMessage = {
          id: Date.now(),
          type: 'bot',
          content: `Hi ${data.data.user.fullName || data.data.user.username}! 👋 I'm your EduCloud AI Assistant. I have access to all your academic data and can help you with exams, grades, schedules, notifications, and much more! How can I assist you today?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
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
          context: { timestamp: new Date().toISOString() }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
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
          setSuggestions(data.suggestions || []);
          setTypingIndicator(false);
          setIsLoading(false);
        }, 1000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setTypingIndicator(false);
      setIsLoading(false);
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
    fetchUserInfo(); // This will add the welcome message again
    loadInitialSuggestions();
  };

  const quickActions = [
    { icon: BookOpen, text: "Show my exams", color: "bg-blue-500" },
    { icon: BarChart3, text: "Check my performance", color: "bg-green-500" },
    { icon: Calendar, text: "View my timetable", color: "bg-purple-500" },
    { icon: Bell, text: "Show notifications", color: "bg-orange-500" },
    { icon: FileText, text: "My documents", color: "bg-teal-500" },
    { icon: Clock, text: "Check attendance", color: "bg-red-500" }
  ];

  const formatMessage = (content) => {
    // Format markdown-style content
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
        >
          <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            AI
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[600px]'
    } w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold">EduCloud AI Assistant</h3>
            <p className="text-xs text-blue-100">
              {userInfo ? `Helping ${userInfo.username}` : 'Intelligent Educational Support'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={clearChat}
            className="p-1 hover:bg-white/20 rounded"
            title="Clear chat"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(action.text)}
                    className="flex items-center gap-2 p-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className={`p-1 rounded ${action.color} text-white`}>
                      <action.icon size={12} />
                    </div>
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessage(message.content) 
                    }} 
                  />
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="bg-gray-200 text-gray-600 p-2 rounded-full flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {typingIndicator && (
              <div className="flex gap-3 justify-start">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your exams, grades, schedule, or anything else..."
                  className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="1"
                  style={{ minHeight: '44px', maxHeight: '100px' }}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <div className="flex items-center gap-1">
                <HelpCircle size={12} />
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
