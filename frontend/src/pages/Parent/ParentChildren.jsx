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
  AlertTriangle,
  Plus,
  Mail,
  UserPlus
} from 'lucide-react';

const ParentChildren = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childDetails, setChildDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
  const [showAddModal, setShowAddModal] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

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

  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!childEmail) return toast.error('Please enter child email');

    try {
      setIsAdding(true);
      const res = await parentAPI.addChild({ childEmail });
      toast.success(res.data.message);
      setChildEmail('');
      setShowAddModal(false);
      fetchChildren();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add child');
    } finally {
      setIsAdding(false);
    }
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
        </div>        {/* Detailed Performance Charts & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Wise Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
              Subject-wise Scores
            </h2>
            <div className="space-y-4">
              {childDetails.performance.subjectWise && childDetails.performance.subjectWise.length > 0 ? (
                childDetails.performance.subjectWise.map((subject, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{subject.subject}</span>
                      <span className="text-gray-600 dark:text-gray-400">{subject.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          subject.score >= 80 ? 'bg-green-500' : 
                          subject.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${subject.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No subject data available
                </div>
              )}
            </div>
          </div>

          {/* Attendance Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-500" />
              Attendance Breakdown
            </h2>
            <div className="flex justify-center items-center h-48 mb-4">
               {/* Minimalist donut chart placeholder using CSS */}
               <div className="relative w-32 h-32 rounded-full border-[12px] border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {childDetails.attendance.summary.attendancePercentage}%
                    </span>
                    <p className="text-[10px] text-gray-500">Present</p>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Absent Days</p>
                  <p className="text-xl font-bold text-red-600">{childDetails.attendance.summary.absentDays}</p>
               </div>
               <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Late Days</p>
                  <p className="text-xl font-bold text-yellow-600">{childDetails.attendance.summary.lateDays}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Recent Exam Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center text-red-500">
            <Award className="h-5 w-5 mr-2" />
            Recent Exam Results
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Percentage</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {childDetails.exams.results.length > 0 ? (
                  childDetails.exams.results.map((exam, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{exam.examTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{exam.subject}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{exam.score}/{exam.totalQuestions}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-bold ${exam.percentage >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                          {exam.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          exam.percentage >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {exam.percentage >= 40 ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                   <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No recent exam records</td>
                   </tr>
                )}
              </tbody>
            </table>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Children</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor your children's academic progress and performance.
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Child
          </button>
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-8 text-white relative">
               <UserPlus className="w-12 h-12 mb-4 opacity-50" />
               <h3 className="text-2xl font-black">Link Student</h3>
               <p className="text-green-50 text-sm">Enter your child's registered email to monitor their progress.</p>
               <button 
                 onClick={() => setShowAddModal(false)}
                 className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
               >
                 <Plus className="w-6 h-6 rotate-45" />
               </button>
            </div>
            
            <form onSubmit={handleAddChild} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Student Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    placeholder="child@example.com"
                    value={childEmail}
                    onChange={(e) => setChildEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-200 animate-pulse-slow"
                >
                  {isAdding ? 'LINKING...' : 'LINK CHILD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
