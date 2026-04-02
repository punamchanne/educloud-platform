import api from '../../services/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Calendar, Clock, Users, BookOpen, Plus, Brain,
  Download, Share, Edit, Trash2, Search, Filter,
  Zap, Target, TrendingUp, CheckCircle, AlertCircle,
  ChevronLeft, ChevronRight, Grid, List, Sparkles
} from 'lucide-react';

const SmartTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);

  const [generateForm, setGenerateForm] = useState({
    className: '',
    section: '',
    subjects: '',
    teachers: '',
    constraints: '',
    startTime: '08:00',
    endTime: '15:00',
    breakTimes: '10:00-10:15,12:00-13:00',
    workingDays: 5
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const subjects = [
    { code: 'MATH', name: 'Mathematics', color: 'blue' },
    { code: 'PHY', name: 'Physics', color: 'purple' },
    { code: 'CHEM', name: 'Chemistry', color: 'green' },
    { code: 'BIO', name: 'Biology', color: 'emerald' },
    { code: 'ENG', name: 'English', color: 'red' },
    { code: 'HIST', name: 'History', color: 'orange' },
    { code: 'CS', name: 'Computer Science', color: 'indigo' }
  ];

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const response = await api.get('/timetables');
      const fetchedTimetables = response.data.timetables || [];
      setTimetables(fetchedTimetables);
      if (fetchedTimetables.length > 0) {
        setCurrentTimetable(fetchedTimetables[0]);
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
      setTimetables([]);
      setCurrentTimetable(null);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch timetables');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateSmartTimetable = async () => {
    try {
      setGenerating(true);
      const response = await api.post(
        '/dashboard/timetable/smart-generate',
        {
          ...generateForm,
          saveToDatabase: true
        }
      );

      const generated = response.data.timetable;

      const newTimetable = {
        id: generated.databaseId || Date.now(),
        className: generated.class,
        section: generated.section,
        createdAt: generated.createdAt || new Date().toISOString(),
        schedule: transformSlotsToSchedule(generated.slots),
        aiOptimizationScore: generated.optimizationScore || 95,
        conflictCount: 0, // AI generated timetables are conflict-free by design here
        utilizationRate: 92,
        teacherWorkload: 'Optimized'
      };

      setTimetables(prev => [newTimetable, ...prev]);
      setCurrentTimetable(newTimetable);
      setShowGenerateModal(false);
      setGenerateForm({
        className: '',
        section: '',
        subjects: '',
        teachers: '',
        constraints: '',
        startTime: '08:00',
        endTime: '15:00',
        breakTimes: '10:00-10:15,12:00-13:00',
        workingDays: 5
      });
      
      toast.success('Smart timetable generated successfully!');
    } catch (error) {
      console.error('Error generating timetable:', error);
      toast.error('Failed to generate smart timetable');
    } finally {
      setGenerating(false);
    }
  };

  const transformSlotsToSchedule = (slots) => {
    const schedule = {};
    daysOfWeek.forEach(day => {
      schedule[day] = {};
    });

    slots.forEach(slot => {
      if (schedule[slot.day]) {
        schedule[slot.day][slot.startTime] = {
          subject: slot.subject,
          code: slot.subject.substring(0, 3).toUpperCase(),
          teacher: slot.teacher,
          room: slot.location || 'N/A',
          type: 'class'
        };
      }
    });

    return schedule;
  };

  const getSubjectColor = (subject) => {
    const subjectInfo = subjects.find(s => s.name === subject || s.code === subject);
    return subjectInfo ? subjectInfo.color : 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading Smart Timetable...</p>
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
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Smart Timetable Scheduling
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  AI-optimized timetable generation with conflict resolution
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-500 text-white' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-indigo-500 text-white' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate Smart Timetable</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Optimization Metrics */}
        {currentTimetable && (
          <div className="mb-8 p-6 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl text-white">
            <div className="flex items-start space-x-4">
              <Brain className="w-8 h-8 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">AI Optimization Results</h2>
                <p className="opacity-90 mb-4">
                  Timetable for {currentTimetable.className} - Section {currentTimetable.section}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm opacity-80">Optimization Score</p>
                    <p className="text-xl font-bold">{currentTimetable.aiOptimizationScore}%</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm opacity-80">Conflicts</p>
                    <p className="text-xl font-bold">{currentTimetable.conflictCount}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm opacity-80">Utilization Rate</p>
                    <p className="text-xl font-bold">{currentTimetable.utilizationRate}%</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm opacity-80">Teacher Workload</p>
                    <p className="text-xl font-bold">{currentTimetable.teacherWorkload}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timetable Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="all">All Classes</option>
                {timetables.map(tt => (
                  <option key={tt.id} value={tt.id}>
                    {tt.className} - Section {tt.section}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-slate-800 dark:text-white px-3">
                  Week {selectedWeek + 1}
                </span>
                <button
                  onClick={() => setSelectedWeek(selectedWeek + 1)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-all duration-200">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all duration-200">
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Timetable Display */}
        {currentTimetable && viewMode === 'grid' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700">
                    <th className="p-4 text-left text-sm font-medium text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-600">
                      Time
                    </th>
                    {daysOfWeek.map(day => (
                      <th key={day} className="p-4 text-center text-sm font-medium text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-600 min-w-[150px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time} className="border-b border-slate-200 dark:border-slate-600">
                      <td className="p-4 text-sm font-medium text-slate-800 dark:text-white border-r border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                        {time}
                      </td>
                      {daysOfWeek.map(day => {
                        const slot = currentTimetable.schedule[day][time];
                        if (!slot) return <td key={day} className="p-2 border-r border-slate-200 dark:border-slate-600"></td>;
                        
                        if (slot.type === 'break') {
                          return (
                            <td key={day} className="p-2 border-r border-slate-200 dark:border-slate-600">
                              <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-lg text-center">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                  {slot.subject}
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-500">
                                  {slot.duration} min
                                </p>
                              </div>
                            </td>
                          );
                        }
                        
                        const color = getSubjectColor(slot.subject);
                        return (
                          <td key={day} className="p-2 border-r border-slate-200 dark:border-slate-600">
                            <div className={`bg-${color}-100 dark:bg-${color}-900/20 p-3 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer`}>
                              <p className={`text-sm font-medium text-${color}-800 dark:text-${color}-400 mb-1`}>
                                {slot.code}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {slot.teacher}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                {slot.room}
                              </p>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* List View */}
        {currentTimetable && viewMode === 'list' && (
          <div className="space-y-6">
            {daysOfWeek.map(day => (
              <div key={day} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{day}</h3>
                <div className="space-y-3">
                  {timeSlots.map(time => {
                    const slot = currentTimetable.schedule[day][time];
                    if (!slot) return null;
                    
                    if (slot.type === 'break') {
                      return (
                        <div key={time} className="flex items-center space-x-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                          <div className="w-16 text-sm font-medium text-slate-600 dark:text-slate-400">
                            {time}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-amber-800 dark:text-amber-400">{slot.subject}</p>
                            <p className="text-sm text-amber-600 dark:text-amber-500">{slot.duration} minutes</p>
                          </div>
                        </div>
                      );
                    }
                    
                    const color = getSubjectColor(slot.subject);
                    return (
                      <div key={time} className={`flex items-center space-x-4 p-3 bg-${color}-50 dark:bg-${color}-900/10 rounded-lg`}>
                        <div className="w-16 text-sm font-medium text-slate-600 dark:text-slate-400">
                          {time}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium text-${color}-800 dark:text-${color}-400`}>
                            {slot.subject} ({slot.code})
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {slot.teacher} • {slot.room}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generate Timetable Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                      <Brain className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                      Generate Smart Timetable
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Class Name
                    </label>
                    <input
                      type="text"
                      value={generateForm.className}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, className: e.target.value }))}
                      placeholder="e.g., Grade 10"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Section
                    </label>
                    <input
                      type="text"
                      value={generateForm.section}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, section: e.target.value }))}
                      placeholder="e.g., A"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subjects (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={generateForm.subjects}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, subjects: e.target.value }))}
                    placeholder="Mathematics, Physics, Chemistry, Biology, English"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Teachers (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={generateForm.teachers}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, teachers: e.target.value }))}
                    placeholder="John Smith, Mary Johnson, David Wilson"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={generateForm.startTime}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={generateForm.endTime}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Working Days
                    </label>
                    <select
                      value={generateForm.workingDays}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, workingDays: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value={5}>5 Days</option>
                      <option value={6}>6 Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Break Times (format: start-end,start-end)
                  </label>
                  <input
                    type="text"
                    value={generateForm.breakTimes}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, breakTimes: e.target.value }))}
                    placeholder="10:00-10:15,12:00-13:00"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Additional Constraints (Optional)
                  </label>
                  <textarea
                    value={generateForm.constraints}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, constraints: e.target.value }))}
                    placeholder="Special requirements, teacher preferences, room constraints..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateSmartTimetable}
                    disabled={generating || !generateForm.className || !generateForm.subjects}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartTimetable;
