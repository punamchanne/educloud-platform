import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useUser } from '../../context/UserContext';
import { 
  Video, Calendar, Clock, Users, Plus, Brain,
  MapPin, Link, Edit, Trash2, Search, Filter,
  Play, Pause, UserCheck, MessageSquare, Star,
  TrendingUp, AlertCircle, CheckCircle, Zap
} from 'lucide-react';

const MeetingManagement = () => {
  const { user } = useUser();
  const [meetings, setMeetings] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  // const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    type: 'classroom',
    participants: '',
    location: '',
    meetingLink: '',
    isPublic: false,
    maxParticipants: 100,
    requiresApproval: false
  });

  const meetingTypes = [
    { value: 'classroom', label: 'Classroom Session', icon: Users, color: 'blue' },
    { value: 'parent_teacher', label: 'Parent-Teacher', icon: MessageSquare, color: 'green' },
    { value: 'staff', label: 'Staff Meeting', icon: Users, color: 'purple' },
    { value: 'training', label: 'Training', icon: Brain, color: 'orange' },
    { value: 'general', label: 'General Meeting', icon: Video, color: 'gray' },
    { value: 'online', label: 'Online Session', icon: Video, color: 'indigo' },
    { value: 'webinar', label: 'Webinar', icon: Star, color: 'pink' }
  ];

  const statuses = ['scheduled', 'live', 'completed', 'cancelled'];

  useEffect(() => {
    fetchMeetings();
    fetchInsights();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/meetings');

      if (response.data.success) {
        // Transform backend data to match frontend format
        const transformedMeetings = response.data.meetings.map(meeting => ({
          id: meeting._id,
          title: meeting.title,
          description: meeting.description,
          date: meeting.scheduledDate.split('T')[0], // Extract date part from scheduledDate
          time: meeting.scheduledTime,
          duration: meeting.duration,
          type: meeting.type,
          status: meeting.status,
          participants: meeting.participants || [],
          location: meeting.location,
          meetingLink: meeting.meetingLink,
          createdAt: meeting.createdAt,
          attendanceRate: meeting.analytics?.attendanceRate || 0,
          engagementScore: meeting.analytics?.engagementScore || 0
        }));
        setMeetings(transformedMeetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      // If there's an error (like no meetings yet), show empty state
      setMeetings([]);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch meetings');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await api.post('/dashboard/meetings/insights', {});
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      // Set empty insights if API fails
      setInsights(null);
    }
  };

  const createMeeting = async () => {
    try {
      const meetingData = {
        title: createForm.title,
        description: createForm.description,
        date: createForm.date, // Send as YYYY-MM-DD format
        time: createForm.time,
        duration: parseInt(createForm.duration),
        type: createForm.type,
        participants: createForm.participants ? createForm.participants.split(',').map(p => p.trim()).filter(p => p) : [],
        location: createForm.location || '',
        meetingLink: createForm.meetingLink || '',
        isPublic: createForm.isPublic,
        maxParticipants: parseInt(createForm.maxParticipants) || 100,
        requiresApproval: createForm.requiresApproval
        // Don't send organizer - backend gets it from JWT token
      };
      
      const response = await api.post('/meetings', meetingData);

      if (response.data.success) {
        const newMeeting = response.data.meeting;
        const transformedMeeting = {
          id: newMeeting._id,
          title: newMeeting.title,
          description: newMeeting.description,
          date: newMeeting.scheduledDate.split('T')[0], // Extract date part from scheduledDate
          time: newMeeting.scheduledTime,
          duration: newMeeting.duration,
          type: newMeeting.type,
          status: newMeeting.status,
          participants: newMeeting.participants || [],
          location: newMeeting.location,
          meetingLink: newMeeting.meetingLink,
          createdAt: newMeeting.createdAt,
          attendanceRate: newMeeting.analytics?.attendanceRate || 0,
          engagementScore: newMeeting.analytics?.engagementScore || 0
        };

        setMeetings(prev => [transformedMeeting, ...prev]);
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          description: '',
          date: '',
          time: '',
          duration: '60',
          type: 'classroom',
          participants: '',
          location: '',
          meetingLink: '',
          isPublic: false,
          maxParticipants: 100,
          requiresApproval: false
        });
        
        toast.success('Meeting created successfully!');
        fetchInsights(); // Refresh insights after creating meeting
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error(error.response?.data?.message || 'Failed to create meeting');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'live': return 'green';
      case 'completed': return 'gray';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getMeetingTypeInfo = (type) => {
    return meetingTypes.find(mt => mt.value === type) || meetingTypes[0];
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || meeting.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading Meeting Management...</p>
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
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Meeting Management
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Schedule, manage, and optimize educational meetings with AI insights
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowInsightsModal(true)}
                disabled={!insights || !insights.trends}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-5 h-5 text-purple-600" />
                <span>AI Insights</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Schedule Meeting</span>
              </button>
            </div>
          </div>
        </div>

        {/* Insights Banner */}
        {insights && insights.trends && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl text-white">
            <div className="flex items-start space-x-4">
              <Zap className="w-8 h-8 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">AI Meeting Insights</h2>
                <p className="opacity-90 mb-4">{insights.summary || 'No insights available yet'}</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm opacity-80">Attendance Rate</p>
                    <p className="text-xl font-bold">{insights.trends.attendanceRate || 0}%</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm opacity-80">Engagement Score</p>
                    <p className="text-xl font-bold">{insights.trends.engagementScore || 0}/10</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm opacity-80">Avg Duration</p>
                    <p className="text-xl font-bold">{insights.trends.averageDuration || 0}m</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm opacity-80">Completion Rate</p>
                    <p className="text-xl font-bold">{insights.trends.completionRate || 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meeting Type Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {meetingTypes.map((type) => {
            const count = meetings.filter(meeting => meeting.type === type.value).length;
            return (
              <div key={type.value} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{type.label}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{count}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${type.color}-100 dark:bg-${type.color}-900/20`}>
                    <type.icon className={`w-6 h-6 text-${type.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {filteredMeetings.map((meeting) => {
            const typeInfo = getMeetingTypeInfo(meeting.type);
            const statusColor = getStatusColor(meeting.status);
            
            return (
              <div key={meeting.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/20 flex-shrink-0`}>
                        <typeInfo.icon className={`w-6 h-6 text-${typeInfo.color}-600`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            {meeting.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${statusColor}-100 text-${statusColor}-800 dark:bg-${statusColor}-900/20 dark:text-${statusColor}-400`}>
                              {meeting.status === 'live' && <div className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1 animate-pulse" />}
                              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${typeInfo.color}-100 text-${typeInfo.color}-800 dark:bg-${typeInfo.color}-900/20 dark:text-${typeInfo.color}-400`}>
                              {typeInfo.label}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400 mb-4">{meeting.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>{meeting.time} ({meeting.duration}m)</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                            <Users className="w-4 h-4" />
                            <span>{Array.isArray(meeting.participants) ? meeting.participants.length : 0} participants</span>
                          </div>
                        </div>
                        
                        {meeting.location && (
                          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{meeting.location}</span>
                          </div>
                        )}
                        
                        {meeting.meetingLink && (
                          <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 mb-4">
                            <Link className="w-4 h-4" />
                            <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              Join Meeting
                            </a>
                          </div>
                        )}
                        
                        {meeting.status === 'completed' && (
                          <div className="flex space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                              <UserCheck className="w-4 h-4 text-green-600" />
                              <span className="text-slate-600 dark:text-slate-400">
                                Attendance: <span className="font-medium text-green-600">{meeting.attendanceRate}%</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-600" />
                              <span className="text-slate-600 dark:text-slate-400">
                                Engagement: <span className="font-medium text-yellow-600">{meeting.engagementScore}/10</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {meeting.status === 'live' && (
                      <button className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMeetings.length === 0 && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No meetings found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or schedule a new meeting</p>
          </div>
        )}

        {/* Create Meeting Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Schedule New Meeting</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={createForm.date}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={createForm.time}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={createForm.duration}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, duration: e.target.value }))}
                      min="15"
                      max="180"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Meeting Type
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                  >
                    {meetingTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Participants (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={createForm.participants}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, participants: e.target.value }))}
                    placeholder="John Doe, Jane Smith, Bob Wilson"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={createForm.location}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Room 101"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Meeting Link (optional)
                    </label>
                    <input
                      type="text"
                      value={createForm.meetingLink}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                      placeholder="https://meet.google.com/sni-ekey-jkk or any meeting link"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">Any meeting platform link (Google Meet, Zoom, Teams, etc.)</p>
                  </div>
                </div>

                {/* Additional Meeting Options */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Meeting Options</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={createForm.isPublic}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="isPublic" className="text-sm text-slate-700 dark:text-slate-300">
                        Public Meeting
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requiresApproval"
                        checked={createForm.requiresApproval}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="requiresApproval" className="text-sm text-slate-700 dark:text-slate-300">
                        Requires Approval
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Max Participants
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={createForm.maxParticipants}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, maxParticipants: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-slate-200 dark:border-slate-600 rounded focus:ring-1 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createMeeting}
                    disabled={!createForm.title || !createForm.date || !createForm.time}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Schedule Meeting
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Modal */}
        {showInsightsModal && insights && insights.trends && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                      AI Meeting Insights & Recommendations
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowInsightsModal(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Summary</h3>
                  <p className="text-slate-600 dark:text-slate-400">{insights.summary || 'No insights summary available'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">AI Recommendations</h3>
                  <div className="space-y-2">
                    {insights.recommendations && insights.recommendations.length > 0 ? (
                      insights.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{rec}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500 dark:text-slate-400">No recommendations available yet</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Optimization Suggestions</h3>
                  <div className="space-y-2">
                    {insights.upcomingOptimizations && insights.upcomingOptimizations.length > 0 ? (
                      insights.upcomingOptimizations.map((opt, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <TrendingUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500 dark:text-slate-400">No optimization suggestions available yet</p>
                      </div>
                    )}
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

export default MeetingManagement;
