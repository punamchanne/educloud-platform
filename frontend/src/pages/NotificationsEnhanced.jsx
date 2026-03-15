import api from '../services/api';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  X, 
  Clock, 
  User, 
  Calendar, 
  BookOpen, 
  FileText, 
  Video, 
  AlertTriangle,
  CheckCircle,
  Info,
  Filter,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';
import SEOHead from '../components/SEOHead';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Notifications', icon: Bell },
    { value: 'exam', label: 'Exams', icon: BookOpen },
    { value: 'assignment', label: 'Assignments', icon: FileText },
    { value: 'meeting', label: 'Meetings', icon: Video },
    { value: 'announcement', label: 'Announcements', icon: Info },
    { value: 'reminder', label: 'Reminders', icon: Clock },
  ];

  const notificationIcons = {
    exam: BookOpen,
    assignment: FileText,
    meeting: Video,
    announcement: Info,
    reminder: Clock,
    alert: AlertTriangle,
    success: CheckCircle,
    default: Bell
  };

  const priorityColors = {
    high: 'bg-red-100 border-red-500 text-red-800',
    medium: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    low: 'bg-blue-100 border-blue-500 text-blue-800',
    info: 'bg-gray-100 border-gray-500 text-gray-800'
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [filterNotifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = useCallback(() => {
    let filtered = notifications;

    if (filter !== 'all') {
      filtered = filtered.filter(notification => notification.type === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, searchTerm]);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteSelectedNotifications = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        selectedNotifications.map(id =>
          fetch(`http://localhost:5000/api/notifications/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );

      setNotifications(prev =>
        prev.filter(notification => !selectedNotifications.includes(notification._id))
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    const IconComponent = notificationIcons[type] || notificationIcons.default;
    return <IconComponent size={20} />;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SEOHead 
          title="Notifications - EduCloud"
          description="Stay updated with your latest notifications on EduCloud"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SEOHead 
        title={`Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''} - EduCloud`}
        description="Stay updated with your latest notifications, exams, assignments, and announcements on EduCloud"
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-8 h-8 text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0 
                    ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                    : 'All caught up! No unread notifications.'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>Mark All Read</span>
                </button>
              )}
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Filter Notifications</h3>
              
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Options */}
              <div className="space-y-2">
                {filterOptions.map((option) => {
                  const IconComponent = option.icon;
                  const count = option.value === 'all' 
                    ? notifications.length 
                    : notifications.filter(n => n.type === option.value).length;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setFilter(option.value)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                        filter === option.value
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent size={16} />
                        <span>{option.label}</span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        filter === option.value
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bulk Actions */}
              {selectedNotifications.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {selectedNotifications.length} selected
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={deleteSelectedNotifications}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                      <span>Delete Selected</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Bulk Actions Bar */}
            {filteredNotifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.length === filteredNotifications.length}
                        onChange={selectAllNotifications}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">
                        Select all ({filteredNotifications.length})
                      </span>
                    </label>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Showing {filteredNotifications.length} of {notifications.length} notifications
                  </div>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Bell className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {searchTerm || filter !== 'all' ? 'No matching notifications' : 'No notifications yet'}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || filter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'You\'ll see notifications here when you receive them.'
                    }
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                      notification.read ? 'border-gray-200' : 'border-blue-300 bg-blue-50'
                    } ${selectedNotifications.includes(notification._id) ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification._id)}
                            onChange={() => toggleNotificationSelection(notification._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          
                          <div className={`p-3 rounded-full ${
                            notification.read ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className={`text-lg font-semibold ${
                                  notification.read ? 'text-gray-900' : 'text-blue-900'
                                }`}>
                                  {notification.title}
                                </h3>
                                
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                                
                                {notification.priority && notification.priority !== 'info' && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                                    priorityColors[notification.priority]
                                  }`}>
                                    {notification.priority.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-gray-600 mb-3 leading-relaxed">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock size={14} />
                                  <span>{formatTimeAgo(notification.createdAt)}</span>
                                </div>
                                
                                {notification.sender && (
                                  <div className="flex items-center space-x-1">
                                    <User size={14} />
                                    <span>{notification.sender}</span>
                                  </div>
                                )}
                                
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium capitalize">
                                  {notification.type}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                  title="Mark as read"
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                              
                              <button
                                onClick={() => deleteNotification(notification._id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                title="Delete notification"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Load More Button (for pagination) */}
            {filteredNotifications.length >= 20 && (
              <div className="text-center mt-8">
                <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                  Load More Notifications
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Email notifications</span>
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Push notifications</span>
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">SMS notifications</span>
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Auto-mark as read</span>
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
