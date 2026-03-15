import { useState, useEffect } from 'react';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import {
  BookOpen,
  Users,
  Eye,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  TrendingUp
} from 'lucide-react';

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getAssignedClasses();
      setClasses(response.data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async (classId) => {
    try {
      const response = await teacherAPI.getClassStudents(classId);
      setStudents(response.data.data.students);
      setSelectedClass(response.data.data.class);
      setViewMode('details');
    } catch (error) {
      console.error('Error fetching class students:', error);
      toast.error('Failed to load class students');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClass(null);
    setStudents([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (viewMode === 'details' && selectedClass) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleBackToList}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2"
              >
                ← Back to Classes
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedClass.className}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedClass.grade} - {selectedClass.section} • {students.length} students
              </p>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Students ({students.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {students.length > 0 ? (
              students.map((student) => (
                <div key={student.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          {student.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {student.fullName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Student ID: {student.studentId}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Roll Number: {student.rollNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {student.status}
                      </span>
                      <button
                        onClick={() => toast.info('Student details view coming soon')}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No students found in this class
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Classes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your assigned classes and view student information.
        </p>
      </div>

      {/* Classes Grid */}
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.classId._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => fetchClassStudents(cls.classId._id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {cls.classId.grade} - {cls.classId.section}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {cls.classId.className}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  {cls.students?.length || 0} students
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {cls.classId.academicYear || '2024-2025'}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {cls.subject || 'General'}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchClassStudents(cls.classId._id);
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View Students →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Classes Assigned
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't been assigned to any classes yet. Contact your administrator for class assignments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
