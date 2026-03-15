import api from '../../services/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Brain, TrendingUp, Users, BookOpen, Calendar, FileText, 
  BarChart3, Clock, AlertCircle, CheckCircle, Zap, Target,
  Activity, Settings, RefreshCw, Download, Share, Bell
} from 'lucide-react';

const AIDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
    fetchSystemStatus();
  }, [timeframe]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/dashboard/ai-insights', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/dashboard/analytics?timeframe=${timeframe}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
      console.error('Analytics error:', error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/dashboard/system-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSystemStatus(response.data);
      setLoading(false);
    } catch (error) {
      console.error('System status error:', error);
      toast.error('Failed to fetch system status');
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    fetchDashboardData();
    fetchAnalytics();
    fetchSystemStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading AI Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  AI-Powered Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Intelligent insights and analytics for educational excellence
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshData}
                className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Insights Banner */}
        {dashboardData?.aiInsights && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white">
            <div className="flex items-start space-x-4">
              <Zap className="w-8 h-8 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">AI Insights & Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2 opacity-90">Key Recommendations:</h3>
                    <ul className="space-y-1 text-sm opacity-80">
                      {dashboardData.aiInsights.recommendations?.map((rec, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Target className="w-3 h-3" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 opacity-90">Trend Analysis:</h3>
                    <p className="text-sm opacity-80">{dashboardData.aiInsights.trendAnalysis}</p>
                    {dashboardData.aiInsights.performanceAlert && (
                      <div className="mt-2 p-2 bg-white/20 rounded-lg">
                        <p className="text-sm font-medium">{dashboardData.aiInsights.performanceAlert}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-slate-200 dark:border-slate-600">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'performance', label: 'Performance', icon: Activity },
                { id: 'system', label: 'System Status', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardData && [
                {
                  title: 'Total Users',
                  value: dashboardData.platformMetrics.totalUsers.toLocaleString(),
                  change: '+12.5%',
                  icon: Users,
                  color: 'blue'
                },
                {
                  title: 'Active Users',
                  value: dashboardData.platformMetrics.activeUsers.toLocaleString(),
                  change: '+8.3%',
                  icon: Activity,
                  color: 'green'
                },
                {
                  title: 'Total Exams',
                  value: dashboardData.platformMetrics.totalExams.toString(),
                  change: '+15.2%',
                  icon: BookOpen,
                  color: 'purple'
                },
                {
                  title: 'Completion Rate',
                  value: dashboardData.platformMetrics.completionRate + '%',
                  change: '+3.1%',
                  icon: CheckCircle,
                  color: 'emerald'
                }
              ].map((metric, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{metric.title}</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{metric.value}</p>
                      <p className="text-green-600 text-sm font-medium mt-1">{metric.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}>
                      <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData?.quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl mx-auto mb-3 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="font-medium text-slate-800 dark:text-white text-sm">{action.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Recent Exams</h3>
                <div className="space-y-3">
                  {dashboardData?.recentActivity.exams.map((exam, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{exam.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{exam.subject} • {exam.participants} participants</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        exam.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        exam.status === 'live' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {exam.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Recent Timetables</h3>
                <div className="space-y-3">
                  {dashboardData?.recentActivity.timetables.map((timetable, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{timetable.class} - {timetable.section}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{timetable.totalSlots} slots</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(timetable.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Growth Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">User Growth</span>
                    <span className="font-semibold text-green-600">+{analytics.metrics.overview.growth.userGrowthRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">New Users</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{analytics.metrics.overview.growth.users}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">New Exams</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{analytics.metrics.overview.growth.exams}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Engagement</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Daily Active</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{analytics.metrics.engagement.dailyActiveUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Avg Session</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{analytics.metrics.engagement.averageSessionDuration}m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Bounce Rate</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{analytics.metrics.engagement.bounceRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Completion Rate</span>
                    <span className="font-semibold text-green-600">{analytics.metrics.overview.completionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Average Score</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{analytics.metrics.overview.averageScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Page Views</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{analytics.metrics.engagement.pageViews.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Performance */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Subject Performance Analysis</h3>
              <div className="space-y-4">
                {analytics.metrics.subjectPerformance.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{subject.subject}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{subject.examCount} exams</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800 dark:text-white">{subject.averageScore}%</p>
                      <p className={`text-sm font-medium ${subject.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {subject.trend}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && systemStatus && (
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">System Health</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(systemStatus.services).map(([service, data], index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-800 dark:text-white capitalize">{service}</p>
                      <div className={`w-2 h-2 rounded-full ${data.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{data.responseTime}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  {[
                    { label: 'CPU Usage', value: systemStatus.performance.cpuUsage, max: 100, unit: '%' },
                    { label: 'Memory Usage', value: systemStatus.performance.memoryUsage, max: 100, unit: '%' },
                    { label: 'Disk Usage', value: systemStatus.performance.diskUsage, max: 100, unit: '%' }
                  ].map((metric, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</span>
                        <span className="text-sm font-medium text-slate-800 dark:text-white">{metric.value}{metric.unit}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.value < 50 ? 'bg-green-500' : metric.value < 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">AI Service Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Requests/Hour</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{systemStatus.aiServiceMetrics.requestsPerHour}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Success Rate</span>
                    <span className="font-semibold text-green-600">{systemStatus.aiServiceMetrics.successRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Avg Processing</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{systemStatus.aiServiceMetrics.averageProcessingTime}</span>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">Active Models:</p>
                    <div className="flex flex-wrap gap-2">
                      {systemStatus.aiServiceMetrics.modelsActive.map((model, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDashboard;
