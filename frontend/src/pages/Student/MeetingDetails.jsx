import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import AIReportGenerator from '../../components/AIReportGenerator';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  ArrowLeft,
  Play,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  Share2,
  Bell,
  Copy,
  MessageSquare,
  UserPlus,
  Settings,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  ExternalLink,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share,
  RefreshCw,
  Phone,
  PhoneOff
} from 'lucide-react';

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joiningMeeting, setJoiningMeeting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        setLoading(true);
        const [meetingResponse, userResponse] = await Promise.all([
          api.get(`/meetings/${id}`),
          api.get('/auth/profile')
        ]);
        setMeeting(meetingResponse.data.meeting);
        setUser(userResponse.data.user);
      } catch (error) {
        console.error('Error fetching meeting details:', error);
        toast.error('Failed to load meeting details');
        navigate('/student/meetings');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [id, navigate]);

  const handleJoinMeeting = async () => {
    try {
      setJoiningMeeting(true);
      
      if (meeting.meetingUrl) {
        // Open meeting URL in a new tab
        window.open(meeting.meetingUrl, '_blank');
        
        // Update meeting status to 'active' if it's scheduled
        if (meeting.status === 'scheduled') {
          await api.patch(`/meetings/${id}/status`, { status: 'active' });
          setMeeting(prev => ({ ...prev, status: 'active' }));
        }
        
        toast.success('Meeting opened in new tab');
      } else {
        toast.error('Meeting link is not available');
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast.error('Failed to join meeting');
    } finally {
      setJoiningMeeting(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed' : 'Meeting bookmarked');
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Meeting link copied to clipboard');
    setShowShareModal(false);
  };

  const handleSetReminder = () => {
    setReminderSet(!reminderSet);
    toast.success(reminderSet ? 'Reminder removed' : 'Reminder set for 15 minutes before meeting');
  };

  const checkConnectionStatus = async () => {
    try {
      setConnectionStatus('checking');
      // Simulate connection check
      setTimeout(() => {
        setConnectionStatus(Math.random() > 0.3 ? 'good' : 'poor');
      }, 1000);
    } catch (error) {
      setConnectionStatus('poor');
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    toast.info(audioEnabled ? 'Microphone muted' : 'Microphone enabled');
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    toast.info(videoEnabled ? 'Camera disabled' : 'Camera enabled');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const canJoinMeeting = () => {
    if (!meeting) return false;
    
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    
    // Allow joining 15 minutes before start time and before end time
    const joinableTime = new Date(startTime.getTime() - 15 * 60 * 1000);
    
    return now >= joinableTime && now <= endTime && 
           (meeting.status === 'scheduled' || meeting.status === 'active');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Meeting Not Found</h2>
          <Link 
            to="/student/meetings" 
            className="text-blue-600 hover:text-blue-500"
          >
            Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/meetings')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Meetings
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
                  {getStatusIcon(meeting.status)}
                  <span className="ml-1 capitalize">{meeting.status}</span>
                </span>
                <span className="text-sm text-gray-500">
                  Meeting ID: {meeting._id?.slice(-6) || 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg border transition-colors ${
                  isBookmarked 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-600' 
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark meeting'}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleSetReminder}
                className={`p-2 rounded-lg border transition-colors ${
                  reminderSet 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title={reminderSet ? 'Remove reminder' : 'Set reminder'}
              >
                <Bell className={`w-5 h-5 ${reminderSet ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                title="Share meeting"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowAttendees(!showAttendees)}
                className="flex items-center px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5 mr-1" />
                <span className="text-sm">{meeting.participants?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Meeting Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(meeting.startTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Duration: {Math.round((new Date(meeting.endTime) - new Date(meeting.startTime)) / (1000 * 60))} minutes
                    </p>
                  </div>
                </div>

                {meeting.topic && (
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Topic</p>
                      <p className="text-sm text-gray-600">{meeting.topic}</p>
                    </div>
                  </div>
                )}

                {meeting.description && (
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Description</p>
                      <p className="text-sm text-gray-600">{meeting.description}</p>
                    </div>
                  </div>
                )}

                {meeting.location && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{meeting.location}</p>
                    </div>
                  </div>
                )}

                {meeting.organizer && (
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Organizer</p>
                      <p className="text-sm text-gray-600">
                        {meeting.organizer.username || meeting.organizer.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Recording/Notes */}
            {meeting.recording && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recording</h3>
                <div className="flex items-center space-x-4">
                  <Video className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Meeting Recording Available</p>
                    <a 
                      href={meeting.recording} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      View Recording
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Join Meeting Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Join Meeting</h3>
              
              {/* Connection Status */}
              <div className="mb-4 p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Connection Status</span>
                  <button
                    onClick={checkConnectionStatus}
                    className="text-xs text-blue-600 hover:text-blue-500"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    connectionStatus === 'good' ? 'bg-green-500' :
                    connectionStatus === 'poor' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
                </div>
              </div>

              {/* Media Controls */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={toggleAudio}
                  className={`flex-1 p-2 rounded-lg border transition-colors ${
                    audioEnabled 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {audioEnabled ? <Mic className="w-4 h-4 mx-auto" /> : <MicOff className="w-4 h-4 mx-auto" />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`flex-1 p-2 rounded-lg border transition-colors ${
                    videoEnabled 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {videoEnabled ? <Camera className="w-4 h-4 mx-auto" /> : <CameraOff className="w-4 h-4 mx-auto" />}
                </button>
              </div>
              
              {canJoinMeeting() ? (
                <div className="space-y-3">
                  <button
                    onClick={handleJoinMeeting}
                    disabled={joiningMeeting}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    {joiningMeeting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Join Now
                      </>
                    )}
                  </button>
                  
                  {meeting.meetingUrl && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(meeting.meetingUrl);
                        toast.success('Meeting URL copied');
                      }}
                      className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Meeting URL
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {meeting.status === 'completed' ? 'Meeting has ended' :
                     meeting.status === 'cancelled' ? 'Meeting was cancelled' :
                     'Meeting not yet available'}
                  </p>
                  <p className="text-xs text-gray-500">
                    You can join 15 minutes before the scheduled time
                  </p>
                </div>
              )}
            </div>

            {/* Participants */}
            {meeting.participants && meeting.participants.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Participants ({meeting.participants.length})
                  </h3>
                  <button
                    onClick={() => setShowAttendees(!showAttendees)}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    {showAttendees ? 'Show Less' : 'Show All'}
                  </button>
                </div>
                <div className="space-y-3">
                  {(showAttendees ? meeting.participants : meeting.participants.slice(0, 3)).map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {(participant.username || participant.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {participant.username || participant.email}
                          </span>
                          {participant.role && (
                            <p className="text-xs text-gray-500 capitalize">{participant.role}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Online"></div>
                        <MessageSquare className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      </div>
                    </div>
                  ))}
                  {!showAttendees && meeting.participants.length > 3 && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setShowAttendees(true)}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        +{meeting.participants.length - 3} more participants
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">Download Calendar Event</span>
                </button>
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <MessageSquare className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">Open Chat</span>
                </button>
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <UserPlus className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">Invite Others</span>
                </button>
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Settings className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">Meeting Settings</span>
                </button>
              </div>
            </div>

            {/* AI Report Generator */}
            {user && (
              <AIReportGenerator 
                userId={user._id} 
                reportType="meeting-performance"
              />
            )}
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Share Meeting</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Copy className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Copy Link</p>
                      <p className="text-xs text-gray-500">Share meeting URL</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Share className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Share via Email</p>
                      <p className="text-xs text-gray-500">Send invitation email</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <ExternalLink className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Share on Social</p>
                      <p className="text-xs text-gray-500">Post to social media</p>
                    </div>
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

export default MeetingDetails;
