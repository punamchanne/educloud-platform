import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { 
  Video, Calendar, Clock, Users, MapPin, Link as LinkIcon,
  Play, AlertCircle, CheckCircle, Search, Filter,
  ExternalLink, Bell, BookOpen, Download
} from 'lucide-react';

const StudentMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const meetingTypes = [
    { value: 'classroom', label: 'Classroom Session', icon: Users, color: 'blue' },
    { value: 'parent_teacher', label: 'Parent-Teacher', icon: BookOpen, color: 'green' },
    { value: 'training', label: 'Training', icon: BookOpen, color: 'orange' }
  ];

  const statuses = ['scheduled', 'live', 'completed'];

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await api.get('/meetings');

      if (response.data.success) {
        setMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      // Add some sample meetings for demonstration
      const sampleMeetings = [
        {
          _id: '1',
          title: 'Mathematics Class - Algebra Review',
          description: 'Weekly algebra review session covering linear equations and quadratic functions',
          date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          time: '10:00',
          duration: 60,
          type: 'classroom',
          status: 'scheduled',
          participants: ['Mathematics Teacher', 'Class 10A Students'],
          location: 'Room 101',
          meetingLink: 'https://meet.google.com/sni-ekey-jkk',
          createdAt: new Date().toISOString(),
          analytics: {
            attendanceRate: 0,
            engagementScore: 0
          }
        },
        {
          _id: '2',
          title: 'Physics Lab Session',
          description: 'Hands-on physics experiments and demonstrations',
          date: new Date(Date.now() + 2 * 86400000).toISOString(), // Day after tomorrow
          time: '14:00',
          duration: 90,
          type: 'classroom',
          status: 'scheduled',
          participants: ['Physics Teacher', 'Lab Students'],
          location: 'Physics Lab',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          createdAt: new Date().toISOString(),
          analytics: {
            attendanceRate: 0,
            engagementScore: 0
          }
        },
        {
          _id: '3',
          title: 'Parent-Teacher Conference',
          description: 'Individual discussion about academic progress',
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          time: '15:30',
          duration: 30,
          type: 'parent_teacher',
          status: 'completed',
          participants: ['Class Teacher', 'Parents'],
          location: 'Conference Room A',
          meetingLink: '',
          createdAt: new Date().toISOString(),
          analytics: {
            attendanceRate: 100,
            engagementScore: 9.2
          }
        }
      ];
      setMeetings(sampleMeetings);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch meetings');
      }
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = (meetingLink, title) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
      toast.success(`Joining ${title}...`);
    } else {
      toast.info('Meeting link not available yet');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'live': return 'green';
      case 'completed': return 'gray';
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

  const upcomingMeetings = meetings.filter(m => 
    new Date(m.date) > new Date() && m.status === 'scheduled'
  ).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading your meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                My Meetings
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                View and join your scheduled virtual classes and conferences
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          {upcomingMeetings.length > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <Bell className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Upcoming Meetings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting._id} className="bg-white/10 rounded-lg p-4">
                    <h3 className="font-semibold mb-1">{meeting.title}</h3>
                    <p className="text-sm opacity-90 mb-2">
                      {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                    </p>
                    {meeting.meetingLink && (
                      <button
                        onClick={() => joinMeeting(meeting.meetingLink, meeting.title)}
                        className="bg-white text-green-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                      >
                        Join Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Meeting Type Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
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
            const meetingDate = new Date(meeting.date);
            const isUpcoming = meetingDate > new Date() && meeting.status === 'scheduled';
            const isLive = meeting.status === 'live';
            
            return (
              <div key={meeting._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6 hover:shadow-xl transition-all duration-200">
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
                              {isLive && <div className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1 animate-pulse" />}
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
                            <span>{meetingDate.toLocaleDateString()}</span>
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
                        
                        {meeting.status === 'completed' && meeting.analytics && (
                          <div className="flex space-x-6 text-sm mb-4">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-slate-600 dark:text-slate-400">
                                Attendance: <span className="font-medium text-green-600">{meeting.analytics.attendanceRate}%</span>
                              </span>
                            </div>
                            {meeting.analytics.engagementScore > 0 && (
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-blue-600" />
                                <span className="text-slate-600 dark:text-slate-400">
                                  Engagement: <span className="font-medium text-blue-600">{meeting.analytics.engagementScore}/10</span>
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {meeting.meetingLink && (isUpcoming || isLive) && (
                      <button
                        onClick={() => joinMeeting(meeting.meetingLink, meeting.title)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          isLive 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Play className="w-4 h-4" />
                        <span>{isLive ? 'Join Live' : 'Join Meeting'}</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    
                    {meeting.meetingLink && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                        <LinkIcon className="w-4 h-4" />
                        <span className="truncate max-w-32">Meeting Link Available</span>
                      </div>
                    )}
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
            <p className="text-slate-500 dark:text-slate-400">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Your meetings will appear here when scheduled'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMeetings;
