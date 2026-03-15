import { useState, useEffect } from 'react';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Clock,
  Bell,
  Award,
  AlertCircle
} from 'lucide-react';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    classes: [],
    exams: [],
    notifications: [],
    schedule: [],
    stats: {
      totalStudents: 0,
      totalClasses: 0,
      totalExams: 0,
      averagePerformance: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [classesRes, examsRes, notificationsRes, scheduleRes] = await Promise.all([
        teacherAPI.getAssignedClasses(),
        teacherAPI.getTeacherExams(),
        teacherAPI.getTeacherNotifications(),
        teacherAPI.getTeacherSchedule()
      ]);

      // Calculate stats
      const totalStudents = classesRes.data.data.reduce((sum, cls) =>
        sum + (cls.students?.length || 0), 0
      );

      const stats = {
        totalStudents,
        totalClasses: classesRes.data.data.length,
        totalExams: examsRes.data.data.exams.length,
        averagePerformance: examsRes.data.data.exams.length > 0
          ? examsRes.data.data.exams.reduce((sum, exam) => sum + exam.averageScore, 0) / examsRes.data.data.exams.length
          : 0
      };

      setDashboardData({
        classes: classesRes.data.data,
        exams: examsRes.data.data.exams,
        notifications: notificationsRes.data.data,
        schedule: scheduleRes.data.data,
        stats
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color = 'blue' }) => {
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
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's an overview of your classes and activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          title="Total Classes"
          value={dashboardData.stats.totalClasses}
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Total Students"
          value={dashboardData.stats.totalStudents}
          color="green"
        />
        <StatCard
          icon={Award}
          title="Total Exams"
          value={dashboardData.stats.totalExams}
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          title="Avg Performance"
          value={`${dashboardData.stats.averagePerformance.toFixed(1)}%`}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Classes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            My Classes
          </h2>
          <div className="space-y-3">
            {dashboardData.classes.length > 0 ? (
              dashboardData.classes.slice(0, 5).map((cls) => (
                <div key={cls.classId._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{cls.classId.className}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {cls.classId.grade} - {cls.classId.section}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {cls.students?.length || 0} students
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No classes assigned yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Exams */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Recent Exams
          </h2>
          <div className="space-y-3">
            {dashboardData.exams.length > 0 ? (
              dashboardData.exams.slice(0, 5).map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{exam.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {exam.subject} • {exam.class}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {exam.averageScore?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {exam.completedCount}/{exam.participantsCount} completed
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No exams created yet
              </p>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Today's Schedule
          </h2>
          <div className="space-y-3">
            {dashboardData.schedule.todaysSchedule ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {dashboardData.schedule.todaysSchedule.subject}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {dashboardData.schedule.todaysSchedule.startTime} - {dashboardData.schedule.todaysSchedule.endTime}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {dashboardData.schedule.todaysSchedule.class}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No classes scheduled for today
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
              dashboardData.notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(notification.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent notifications
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
