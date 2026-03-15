import api from '../../services/api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Home, 
  Book, 
  Bell, 
  TrendingUp, 
  Clock, 
  Award, 
  ArrowRight,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react';

const StudentDashboard = () => {
  const [stats, setStats] = useState({ exams: 0, notifications: 0, averageScore: 0 });
  const [recentExams, setRecentExams] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [profileRes, examsRes, notifRes] = await Promise.all([
          api.get('/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get('/exams', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get('/notifications', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setStats({
          exams: profileRes.data.user.examCount || 0,
          notifications: notifRes.data.unreadCount || 0,
          averageScore: profileRes.data.user.averageScore || 0,
        });
        setRecentExams(examsRes.data.exams?.slice(0, 3) || []);
        setRecentNotifications(notifRes.data.notifications?.slice(0, 3) || []);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
        console.error('Error:', error.response?.data?.message || error.message);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-slate-700">
      {/* Main Content */}
      <div className="p-6 md:p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium mb-4 border border-slate-200 shadow-sm">
            <Award className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back to your learning dashboard
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 leading-tight">
            Your Learning{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            Track your progress, view upcoming exams, and stay updated with your academic journey.
          </p>
        </div>

        {/* Stats Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">
            Your Academic{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Overview
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-slate-100 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 w-fit mb-4">
                <Book className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Upcoming Exams</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                {stats.exams}
              </p>
              <p className="text-slate-500 text-sm">Scheduled examinations</p>
            </div>

            <div className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-slate-100 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3 w-fit mb-4">
                <Bell className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Notifications</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                {stats.notifications}
              </p>
              <p className="text-slate-500 text-sm">Unread messages</p>
            </div>

            <div className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-slate-100 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 w-fit mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Average Score</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                {stats.averageScore.toFixed(1)}%
              </p>
              <p className="text-slate-500 text-sm">Overall performance</p>
            </div>
          </div>
        </div>

        {/* Recent Exams Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-2 mr-3">
              <Book className="w-6 h-6 text-white" />
            </div>
            Recent Examinations
          </h2>

          {recentExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentExams.map((exam) => (
                <div key={exam._id} className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:-translate-y-2">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{exam.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        exam.status === 'active' ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700' :
                        exam.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700' :
                        'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700'
                      }`}>
                        {exam.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <p className="text-slate-600 flex items-center text-sm">
                        <Book className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-medium">Subject:</span>
                        <span className="ml-2">{exam.subject}</span>
                      </p>
                      <p className="text-slate-600 flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="font-medium">
                          {new Date(exam.scheduledDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </p>
                    </div>

                    <Link
                      to="/student/exams"
                      className="group/btn inline-flex items-center text-blue-600 hover:text-purple-600 font-semibold transition-colors text-sm"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Book className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No recent exams available</p>
            </div>
          )}
        </div>

        {/* Recent Notifications Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-2 mr-3">
              <Bell className="w-6 h-6 text-white" />
            </div>
            Recent Notifications
          </h2>

          {recentNotifications.length > 0 ? (
            <div className="space-y-4">
              {recentNotifications.map((notif) => (
                <div key={notif._id} className="group bg-white rounded-2xl p-6 flex items-start space-x-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-100">
                  <div className={`p-3 rounded-2xl ${
                    notif.priority === 'high' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                    notif.priority === 'medium' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                    'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{notif.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="capitalize font-medium">{notif.type}</span>
                      <span>•</span>
                      <span className="capitalize font-medium">Priority: {notif.priority}</span>
                      <span>•</span>
                      <span className="font-medium">{new Date(notif.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) + ', ' + new Date(notif.createdAt).toLocaleDateString('en-US')}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center mt-6">
                <Link
                  to="/student/notifications"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:scale-105 rounded-xl transition-all duration-300 font-semibold"
                >
                  View All Notifications
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No notifications available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
