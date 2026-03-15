import { useState, useEffect } from 'react';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import {
  Heart,
  Users,
  TrendingUp,
  Calendar,
  Bell,
  Award,
  AlertCircle,
  BookOpen,
  UserCheck
} from 'lucide-react';

const ParentDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    children: [],
    notifications: [],
    stats: {
      totalChildren: 0,
      averageAttendance: 0,
      averagePerformance: 0,
      unreadNotifications: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [childrenRes, notificationsRes] = await Promise.all([
        parentAPI.getChildrenOverview(),
        parentAPI.getParentNotifications()
      ]);

      const children = childrenRes.data.data.children;
      const notifications = notificationsRes.data.data;

      // Calculate stats
      const stats = {
        totalChildren: children.length,
        averageAttendance: children.length > 0
          ? children.reduce((sum, child) => sum + child.attendance.attendancePercentage, 0) / children.length
          : 0,
        averagePerformance: children.length > 0
          ? children.reduce((sum, child) => sum + child.performance.gpa, 0) / children.length
          : 0,
        unreadNotifications: notifications.filter(n => !n.read).length
      };

      setDashboardData({
        children,
        notifications,
        stats
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color = 'blue', subtitle }) => {
    const colorClasses = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400'
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color].bg}`}>
            <Icon className={`h-6 w-6 ${colorClasses[color].text}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor your children's academic progress and stay connected with their education.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Heart}
          title="My Children"
          value={dashboardData.stats.totalChildren}
          color="green"
        />
        <StatCard
          icon={UserCheck}
          title="Avg Attendance"
          value={`${dashboardData.stats.averageAttendance.toFixed(1)}%`}
          color="blue"
        />
        <StatCard
          icon={Award}
          title="Avg GPA"
          value={dashboardData.stats.averagePerformance.toFixed(1)}
          color="purple"
        />
        <StatCard
          icon={Bell}
          title="Notifications"
          value={dashboardData.stats.unreadNotifications}
          color="orange"
          subtitle="unread"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Children Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            My Children
          </h2>
          <div className="space-y-3">
            {dashboardData.children.length > 0 ? (
              dashboardData.children.map((child) => (
                <div key={child.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {child.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{child.fullName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {child.class} • Roll: {child.rollNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      GPA: {child.performance.gpa.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Attendance: {child.attendance.attendancePercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No children registered yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Recent Notifications
          </h2>
          <div className="space-y-3">
            {dashboardData.notifications.length > 0 ? (
              dashboardData.notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                  !notification.read
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}>
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${
                    !notification.read ? 'text-blue-500' : 'text-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No notifications yet
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => toast.info('Navigate to children performance')}
              className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div className="text-left">
                <p className="font-medium text-blue-900 dark:text-blue-100">View Performance</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Check academic progress</p>
              </div>
            </button>

            <button
              onClick={() => toast.info('Navigate to attendance records')}
              className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <div className="text-left">
                <p className="font-medium text-green-900 dark:text-green-100">Attendance Records</p>
                <p className="text-sm text-green-700 dark:text-green-300">Monitor attendance history</p>
              </div>
            </button>

            <button
              onClick={() => toast.info('Navigate to contact teachers')}
              className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
              <div className="text-left">
                <p className="font-medium text-purple-900 dark:text-purple-100">Contact Teachers</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">Reach out to teachers</p>
              </div>
            </button>
          </div>
        </div>

        {/* Upcoming Events/Reminders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Important Reminders
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
              <p className="font-medium text-yellow-900 dark:text-yellow-100">Parent-Teacher Meeting</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Next meeting: December 15, 2024
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
              <p className="font-medium text-blue-900 dark:text-blue-100">Exam Schedule</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Mid-term exams starting next week
              </p>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400">
              <p className="font-medium text-green-900 dark:text-green-100">School Holiday</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Winter break: December 20 - January 5
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
