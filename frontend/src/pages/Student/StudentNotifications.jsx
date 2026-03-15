import api from '../../services/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Bell, CheckCircle, AlertTriangle, Info, Check, X } from 'lucide-react';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data.notifications || []);
      } catch (error) {
        toast.error('Failed to fetch notifications');
        console.error('Error:', error.response?.data?.message || error.message);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map((notif) =>
        notif._id === id ? { ...notif, read: true } : notif
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
      console.error('Error:', error.response?.data?.message || error.message);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <Check className="w-5 h-5 text-emerald-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'alert':
        return 'from-red-50 to-red-100 border-red-200';
      case 'success':
        return 'from-emerald-50 to-emerald-100 border-emerald-200';
      case 'info':
        return 'from-blue-50 to-blue-100 border-blue-200';
      default:
        return 'from-slate-50 to-slate-100 border-slate-200';
    }
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-slate-700">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-slate-200 shadow-sm">
            <Bell className="w-4 h-4 mr-2 text-blue-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Notification Center
            </span>
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-800 leading-tight">
            My{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Notifications
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stay updated with important announcements, exam schedules, and system notifications.
          </p>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Notifications Section */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {notifications.length > 0 ? (
              <div className="space-y-6">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`group bg-gradient-to-br ${getNotificationColor(notif.type)} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:-translate-y-1 ${
                      !notif.read ? 'ring-2 ring-blue-300 ring-opacity-50' : ''
                    }`}
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-grow">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {notif.message}
                              </h3>
                              {!notif.read && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span className="flex items-center">
                                <span className="font-medium capitalize">{notif.type}</span>
                              </span>
                              <span className="flex items-center">
                                <span className="font-medium">Priority:</span>
                                <span className="ml-1 capitalize">{notif.priority}</span>
                              </span>
                              <span className="flex items-center">
                                <span className="font-medium">Status:</span>
                                <span className={`ml-1 ${notif.read ? 'text-emerald-600' : 'text-orange-600'}`}>
                                  {notif.read ? 'Read' : 'Unread'}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="flex-shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Bell className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-600 mb-2">No Notifications</h3>
                <p className="text-slate-500">You're all caught up! Check back later for new updates.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentNotifications;
