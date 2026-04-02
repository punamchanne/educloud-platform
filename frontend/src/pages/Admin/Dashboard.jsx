import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { LayoutDashboard, Users, BookOpen, Bell, TrendingUp, Activity, UserCheck, FileText } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, exams: 0, notifications: 0, activeUsers: 0 });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, examsRes, notifRes, aiInsightsRes] = await Promise.all([
          api.get('/users'),
          api.get('/exams'),
          api.get('/notifications'),
          api.get('/dashboard/ai-insights'),
        ]);

        const platformMetrics = aiInsightsRes.data.platformMetrics || {};

        setStats({
          users: usersRes.data.users?.length || platformMetrics.totalUsers || 0,
          exams: examsRes.data.exams?.length || platformMetrics.totalExams || 0,
          notifications: notifRes.data.notifications?.length || 0,
          activeUsers: platformMetrics.activeUsers || 0,
        });

        const recentExams = aiInsightsRes.data.recentActivity?.exams || [];
        setRecentActivity(recentExams.map(exam => ({
          id: exam.id,
          type: 'exam',
          action: `New exam scheduled: ${exam.title}`,
          time: new Date(exam.scheduledDate).toLocaleDateString()
        })));

      } catch (error) {
        toast.error('Failed to fetch dashboard data');
        console.error('Error:', error.response?.data?.message || error.message);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers || 'N/A',
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Exams',
      value: stats.exams,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Notifications',
      value: stats.notifications,
      icon: Bell,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white flex items-center mb-2">
            <LayoutDashboard className="mr-4 text-blue-600" size={36} />
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Welcome back! Here's an overview of your EduCloud system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${stat.bgColor} dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-600`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center mb-6">
              <Activity className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <div className={`w-3 h-3 rounded-full mr-4 ${
                      activity.type === 'user' ? 'bg-blue-500' :
                      activity.type === 'exam' ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{activity.action}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Recent activities will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/admin/users"
                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:shadow-md transition-all duration-200 border border-blue-200 dark:border-blue-700 block text-center"
              >
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Manage Users</p>
              </Link>
              <Link
                to="/admin/exams"
                className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl hover:shadow-md transition-all duration-200 border border-purple-200 dark:border-purple-700 block text-center"
              >
                <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Manage Exams</p>
              </Link>
              <Link
                to="/admin/notifications"
                className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover:shadow-md transition-all duration-200 border border-green-200 dark:border-green-700 block text-center"
              >
                <Bell className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Notifications</p>
              </Link>
              <Link
                to="/admin/reports"
                className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl hover:shadow-md transition-all duration-200 border border-orange-200 dark:border-orange-700 block text-center"
              >
                <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">View Reports</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
