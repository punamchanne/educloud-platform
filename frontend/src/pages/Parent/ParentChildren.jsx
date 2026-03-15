import { useState, useEffect } from 'react';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import {
  Heart,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Target,
  AlertTriangle
} from 'lucide-react';

const ParentChildren = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childDetails, setChildDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getChildrenOverview();
      setChildren(response.data.data.children);
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load children data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDetails = async (studentId) => {
    try {
      const response = await parentAPI.getChildPerformance(studentId);
      setChildDetails(response.data.data);
      setSelectedChild(children.find(c => c.id === studentId));
      setViewMode('details');
    } catch (error) {
      console.error('Error fetching child details:', error);
      toast.error('Failed to load child details');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedChild(null);
    setChildDetails(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (viewMode === 'details' && childDetails && selectedChild) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleBackToList}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mb-2"
              >
                ← Back to Children
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedChild.fullName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedChild.class} • Roll Number: {selectedChild.rollNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall GPA</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {childDetails.performance.overallGPA.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {childDetails.attendance.summary.attendancePercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {childDetails.exams.totalExams}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Exam Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Recent Exam Results
          </h2>
          <div className="space-y-3">
            {childDetails.exams.results.length > 0 ? (
              childDetails.exams.results.slice(0, 5).map((exam, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{exam.examTitle}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {exam.subject} • {new Date(exam.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {exam.percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {exam.score}/{exam.totalQuestions} correct
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No exam results available
              </p>
            )}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Attendance Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {childDetails.attendance.summary.presentDays}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">Present</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {childDetails.attendance.summary.absentDays}
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">Absent</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {childDetails.attendance.summary.lateDays}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Late</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {childDetails.attendance.summary.totalDays}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Total Days</p>
            </div>
          </div>
        </div>

        {/* Improvement Areas */}
        {childDetails.performance.improvementAreas && childDetails.performance.improvementAreas.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Areas for Improvement
            </h2>
            <div className="space-y-3">
              {childDetails.performance.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <p className="text-yellow-900 dark:text-yellow-100">{area}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Children</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor your children's academic progress and performance.
        </p>
      </div>

      {/* Children Grid */}
      {children.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <div
              key={child.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => fetchChildDetails(child.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  child.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {child.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {child.fullName}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {child.class}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Award className="h-4 w-4 mr-2" />
                  GPA: {child.performance.gpa.toFixed(1)}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  Attendance: {child.attendance.attendancePercentage.toFixed(1)}%
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchChildDetails(child.id);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Children Registered
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No children have been registered under your account yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentChildren;
