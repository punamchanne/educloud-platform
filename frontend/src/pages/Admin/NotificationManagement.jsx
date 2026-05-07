import api from '../../services/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Bell, Trash2, Send, Users, AlertTriangle, Info, CheckCircle, Plus, Search, Filter, BookOpen, Shield } from 'lucide-react';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    type: 'general',
    message: '',
    priority: 'medium',
    title: '',
    sendAsEmail: false,
    isScrolling: false
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState('');
  const [recipientRoleFilter, setRecipientRoleFilter] = useState('all');
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  const [targetType, setTargetType] = useState('all'); // 'all' or 'specific'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [notifRes, usersRes] = await Promise.all([
          api.get('/notifications', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get('/users', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        setNotifications(notifRes.data.notifications);
        setUsers(usersRes.data.users || []);
      } catch {
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/notifications', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([...notifications, res.data.notification]);
      setFormData({ userId: '', type: 'general', message: '', priority: 'medium', title: '', sendAsEmail: false, isScrolling: false });
      setIsFormOpen(false);
      setSelectedUser('');
      setTargetType('all');
      toast.success('Notification sent successfully');
    } catch {
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.filter((notif) => notif._id !== id));
      toast.success('Notification deleted successfully');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleSendToAll = async () => {
    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      // Send to all users
      const promises = users.map(user =>
        api.post('/notifications', {
          ...formData,
          userId: user._id
        }, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      await Promise.all(promises);
      toast.success(`Notification sent to ${users.length} users successfully`);
      setFormData({ userId: '', type: 'general', message: '', priority: 'medium', title: '', sendAsEmail: false, isScrolling: false });
      setIsFormOpen(false);
      setSelectedUser('');
      setTargetType('all');

      // Refresh notifications
      const res = await api.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications);
    } catch {
      toast.error('Failed to send notifications');
    } finally {
      setIsSending(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const user = users.find(u => u._id === notification.userId);
    const matchesSearch = !searchTerm ||
      (user && (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'exam_scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Info className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const notificationTypes = [
    { value: 'general', label: 'General', icon: Info },
    { value: 'urgent', label: 'Urgent Alert', icon: AlertTriangle },
    { value: 'notice', label: 'Notice Board', icon: Bell },
    { value: 'exam', label: 'Exam Info', icon: BookOpen },
    { value: 'attendance_alert', label: 'Attendance', icon: Users },
    { value: 'behavior_report', label: 'Behavior', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white flex items-center mb-2">
            <Bell className="mr-4 text-blue-600" size={36} />
            Notification Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Send notifications and manage communication across the EduCloud platform.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Total Notifications</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Active Users</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">High Priority</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {notifications.filter(n => n.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Unread</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {notifications.filter(n => !n.read).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Types</option>
                <option value="exam_scheduled">Exam Scheduled</option>
                <option value="general">General</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Send Notification Button */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Send Notification
          </button>
        </div>

        {/* Notification Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Send Notification
                </h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNotification} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Send to
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="specific-user"
                        name="recipient-type"
                        checked={targetType === 'specific'}
                        onChange={() => {
                           setTargetType('specific');
                           setFormData({ ...formData, userId: selectedUser || 'temp' });
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="specific-user" className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Search and Select Student/Parent
                      </label>
                    </div>
                    {targetType === 'specific' && (
                      <div className="ml-7 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                           <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input 
                                type="text"
                                placeholder="Search by name..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg"
                                onChange={(e) => {
                                   setRecipientSearchTerm(e.target.value);
                                }}
                              />
                           </div>
                           <select 
                             className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                             onChange={(e) => setRecipientRoleFilter(e.target.value)}
                           >
                              <option value="all">Any Role</option>
                              <option value="student">Students Only</option>
                              <option value="parent">Parents Only</option>
                              <option value="teacher">Teachers Only</option>
                           </select>
                        </div>
                        <select
                          value={selectedUser}
                          onChange={(e) => {
                            setSelectedUser(e.target.value);
                            setFormData({ ...formData, userId: e.target.value });
                          }}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                          required
                        >
                          <option value="">-- Choose from {recipientRoleFilter === 'all' ? 'All' : recipientRoleFilter} list --</option>
                          {users
                            .filter(u => recipientRoleFilter === 'all' || u.role === recipientRoleFilter)
                            .filter(u => {
                               if (!recipientSearchTerm) return true;
                               const search = recipientSearchTerm.toLowerCase();
                               return (u.username?.toLowerCase().includes(search)) || 
                                      (u.email?.toLowerCase().includes(search)) ||
                                      (u.profile?.fullName?.toLowerCase().includes(search));
                            })
                            .map(user => (
                            <option key={user._id} value={user._id}>
                               [{user.role?.toUpperCase() || 'USER'}] {user.profile?.fullName || user.username} ({user.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="all-users"
                        name="recipient-type"
                        checked={targetType === 'all'}
                        onChange={() => {
                           setTargetType('all');
                           setFormData({ ...formData, userId: '' });
                        }}
                        className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                      />
                      <label htmlFor="all-users" className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                        All Users ({users.length} users)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Notification Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {notificationTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.value })}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.type === type.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${
                            formData.type === type.value ? 'text-blue-600' : 'text-slate-400'
                          }`} />
                          <p className={`text-sm font-medium ${
                            formData.type === type.value ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {type.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your notification message..."
                    required
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                {/* Email Option */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <input
                      type="checkbox"
                      id="sendAsEmail"
                      name="sendAsEmail"
                      checked={formData.sendAsEmail}
                      onChange={(e) => setFormData({ ...formData, sendAsEmail: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="sendAsEmail" className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Also send this notification as an Email to the user/parent
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                    <input
                      type="checkbox"
                      id="isScrolling"
                      name="isScrolling"
                      checked={formData.isScrolling}
                      onChange={(e) => setFormData({ ...formData, isScrolling: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isScrolling" className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center">
                      <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
                      Display as Scrolling Notice (Marquee) on Dashboards
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  {targetType === 'all' ? (
                    <button
                      type="button"
                      onClick={handleSendToAll}
                      disabled={isSending || !formData.message.trim()}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                    >
                      {isSending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send to All Users
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSending || !selectedUser}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                    >
                      {isSending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Notification
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const user = users.find(u => u._id === notification.userId);
            return (
              <div
                key={notification._id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-600 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                          {user ? user.username : 'Unknown User'}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type.replace('_', ' ')}
                        </span>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {getPriorityIcon(notification.priority)}
                          <span className="ml-1 capitalize">{notification.priority}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 mb-3">
                        {notification.message}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>{user ? user.email : 'Unknown'}</span>
                        <span>•</span>
                        <span>{new Date(notification.createdAt || Date.now()).toLocaleDateString()}</span>
                        {!notification.read && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">Unread</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
              No notifications found
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              {searchTerm || typeFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Start by sending your first notification.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;
