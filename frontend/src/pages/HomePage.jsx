import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { 
  Book, 
  Bell, 
  Star, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Brain, 
  Award,
  CheckCircle,
  Clock,
  BarChart3,
  Globe,
  PlayCircle,
  ChevronRight,
  Calendar,
  FileText
} from 'lucide-react';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const [profileRes, examsRes, notifRes, meetingsRes, documentsRes] = await Promise.all([
            api.get('/auth/profile'),
            api.get('/exams'),
            api.get('/notifications'),
            api.get('/meetings').catch(() => ({ data: { meetings: [] } })),
            api.get('/documents').catch(() => ({ data: { documents: [] } }))
          ]);
          setUser(profileRes.data.user);
          setExams(examsRes.data.exams?.slice(0, 3) || []);
          setNotifications(notifRes.data.notifications?.slice(0, 3) || []);
          setMeetings(meetingsRes.data.meetings?.slice(0, 3) || []);
          setDocuments(documentsRes.data.documents?.slice(0, 3) || []);
        } else {
          const examsRes = await api.get('/exams');
          setExams(examsRes.data.exams?.slice(0, 3) || []);
        }
      } catch (error) {
      
        console.error('Error:', error.response?.data?.message || error.message);
      }
    };
    fetchData();
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Question Generation",
      description: "Advanced machine learning algorithms create contextually relevant questions across multiple subjects and difficulty levels.",
      color: "bg-gradient-to-br from-blue-500 to-purple-600"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics Dashboard",
      description: "Comprehensive performance insights with predictive analytics to identify learning gaps and optimize study patterns.",
      color: "bg-gradient-to-br from-emerald-500 to-teal-600"
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Bank-level encryption and compliance with educational data privacy standards to protect sensitive information.",
      color: "bg-gradient-to-br from-orange-500 to-red-600"
    },
    {
      icon: Zap,
      title: "Real-Time Collaboration",
      description: "Instant synchronization across devices with live updates for exam schedules, results, and notifications.",
      color: "bg-gradient-to-br from-yellow-500 to-orange-500"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Localized interface and content delivery supporting over 25 languages for global educational institutions.",
      color: "bg-gradient-to-br from-cyan-500 to-blue-600"
    },
    {
      icon: Award,
      title: "Certification Integration",
      description: "Automated certificate generation with blockchain verification for authenticated academic achievements.",
      color: "bg-gradient-to-br from-purple-500 to-pink-600"
    }
  ];

  const benefits = [
    "Reduce exam preparation time by 60%",
    "Increase student engagement by 45%",
    "Automated grading saves 80% of evaluation time",
    "Real-time progress tracking for all stakeholders",
    "Seamless integration with existing LMS platforms",
    "24/7 technical support and training resources"
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Navigation Bar */}
     
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-slate-200 shadow-sm">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Trusted by 50,000+ educators worldwide
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-slate-800 leading-tight">
            Transform Education with{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              AI-Powered
            </span>{' '}
            Learning
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-slate-600 max-w-4xl mx-auto leading-relaxed">
            EduCloud revolutionizes educational management with intelligent exam creation, 
            comprehensive analytics, and seamless collaboration tools for modern learning.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to={user ? 
                (user.role === 'admin' ? '/admin' : 
                 user.role === 'teacher' ? '/teacher' : 
                 user.role === 'student' ? '/student' : 
                 user.role === 'parent' ? '/parent' : '/profile') 
                : '/register'}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center"
            >
              {user ? 'Go to Dashboard' : 'Start Free Trial'} 
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/about"
              className="group px-8 py-4 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center text-slate-700"
            >
              <PlayCircle className="w-5 h-5 mr-2 text-blue-600" />
              About Us
            </Link>
          </div>
          
          <div className="mt-12 flex justify-center items-center space-x-8 text-sm text-slate-500">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
              Cancel anytime
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                50,000+
              </div>
              <div className="text-slate-500 font-medium">Active Users</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                2M+
              </div>
              <div className="text-slate-500 font-medium">Exams Created</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                98.5%
              </div>
              <div className="text-slate-500 font-medium">Uptime</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                150+
              </div>
              <div className="text-slate-500 font-medium">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800">
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Modern Education
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Discover how EduCloud's advanced capabilities transform educational workflows 
              and enhance learning outcomes through cutting-edge technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-slate-100 hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                  <feature.icon size={28} className="text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed mb-6">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  Learn more <ChevronRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800 leading-tight">
                Why Leading Institutions Choose{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EduCloud
                </span>
              </h2>
              
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Join thousands of institutions that have transformed their examination processes with our innovative platform.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-1 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-slate-700 font-medium text-lg group-hover:text-blue-600 transition-colors">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-12">
                <Link
                  to="/about"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:scale-105 rounded-xl transition-all duration-300 font-semibold text-lg"
                >
                  Explore All Features
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 w-fit mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">87%</div>
                <div className="text-sm text-slate-500 font-medium">Performance Improvement</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3 w-fit mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">60%</div>
                <div className="text-sm text-slate-500 font-medium">Time Saved</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-3 w-fit mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">95%</div>
                <div className="text-sm text-slate-500 font-medium">User Satisfaction</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 w-fit mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">4.9/5</div>
                <div className="text-sm text-slate-500 font-medium">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Exams Section */}
      {exams.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-slate-800 flex items-center justify-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 mr-4">
                  <Book className="w-8 h-8 text-white" />
                </div>
                Recent Examinations
              </h2>
              <p className="text-slate-600 text-lg">Stay updated with the latest examination schedules and results</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {exams.map((exam) => (
                <div key={exam._id} className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:-translate-y-2">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{exam.title}</h3>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                        exam.status === 'active' ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700' :
                        exam.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700' :
                        'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700'
                      }`}>
                        {exam.status}
                      </span>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <p className="text-slate-600 flex items-center">
                        <Book className="w-5 h-5 mr-3 text-blue-500" />
                        <span className="font-medium">Subject:</span>
                        <span className="ml-2">{exam.subject}</span>
                      </p>
                      <p className="text-slate-600 flex items-center">
                        <Clock className="w-5 h-5 mr-3 text-purple-500" />
                        <span className="font-medium">
                          {new Date(exam.scheduledDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </p>
                    </div>
                    
                    <Link 
                      to={user ? (
                        user.role === 'admin' ? `/admin/exams` :
                        user.role === 'teacher' ? `/teacher/exams` :
                        user.role === 'student' ? `/student/exam/${exam._id}` :
                        `/student/exam/${exam._id}`
                      ) : `/login`}
                      className="group/btn inline-flex items-center text-blue-600 hover:text-purple-600 font-semibold transition-colors"
                    >
                      {user ? 'View Details' : 'Login to View'} 
                      <ChevronRight className="w-5 h-5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Meetings Section */}
      {user && meetings.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-slate-800 flex items-center justify-center">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-3 mr-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                Recent Meetings
              </h2>
              <p className="text-slate-600 text-lg">Stay connected with upcoming virtual meetings and conferences</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {meetings.map((meeting) => (
                <div key={meeting._id} className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:-translate-y-2">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-600 transition-colors">{meeting.title}</h3>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                        meeting.status === 'active' ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700' :
                        meeting.status === 'scheduled' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' :
                        'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <p className="text-slate-600 flex items-center">
                        <Calendar className="w-5 h-5 mr-3 text-green-500" />
                        <span className="font-medium">Meeting:</span>
                        <span className="ml-2">{meeting.topic || meeting.title}</span>
                      </p>
                      <p className="text-slate-600 flex items-center">
                        <Clock className="w-5 h-5 mr-3 text-teal-500" />
                        <span className="font-medium">
                          {new Date(meeting.startTime).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </p>
                    </div>
                    
                    <Link 
                      to={user ? (
                        user.role === 'admin' ? `/admin/meetings` :
                        user.role === 'teacher' ? `/teacher/meetings` :
                        user.role === 'student' ? `/student/meetings/${meeting._id}` :
                        `/student/meetings/${meeting._id}`
                      ) : `/login`}
                      className="group/btn inline-flex items-center text-green-600 hover:text-teal-600 font-semibold transition-colors"
                    >
                      {user ? 'View Details' : 'Login to View'} 
                      <ChevronRight className="w-5 h-5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Documents Section */}
      {user && documents.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-slate-800 flex items-center justify-center">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-3 mr-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                Recent Documents
              </h2>
              <p className="text-slate-600 text-lg">Access your generated reports and important documents</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {documents.map((document) => (
                <div key={document._id} className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:-translate-y-2">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{document.title}</h3>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                        document.type === 'report' ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700' :
                        document.type === 'certificate' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700' :
                        'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700'
                      }`}>
                        {document.type}
                      </span>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <p className="text-slate-600 flex items-center">
                        <FileText className="w-5 h-5 mr-3 text-indigo-500" />
                        <span className="font-medium">Document:</span>
                        <span className="ml-2">{document.description || document.title}</span>
                      </p>
                      <p className="text-slate-600 flex items-center">
                        <Clock className="w-5 h-5 mr-3 text-purple-500" />
                        <span className="font-medium">
                          Generated: {new Date(document.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </p>
                    </div>
                    
                    <Link 
                      to={user ? (
                        user.role === 'admin' ? `/admin/documents` :
                        user.role === 'teacher' ? `/teacher/documents` :
                        user.role === 'student' ? `/student/documents/${document._id}` :
                        `/student/documents/${document._id}`
                      ) : `/login`}
                      className="group/btn inline-flex items-center text-indigo-600 hover:text-purple-600 font-semibold transition-colors"
                    >
                      {user ? 'View Document' : 'Login to View'} 
                      <ChevronRight className="w-5 h-5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Notifications Section */}
      {user && notifications.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-slate-800 flex items-center justify-center">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-3 mr-4">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                Recent Notifications
              </h2>
              <p className="text-slate-600 text-lg">Important updates and announcements</p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              {notifications.map((notif) => (
                <div key={notif._id} className="group bg-white rounded-2xl p-8 flex items-start space-x-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-100">
                  <div className={`p-4 rounded-2xl ${
                    notif.priority === 'high' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                    notif.priority === 'medium' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                    'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 mb-2 text-lg group-hover:text-blue-600 transition-colors">{notif.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="capitalize font-medium">{notif.type}</span>
                      <span>•</span>
                      <span className="capitalize font-medium">Priority: {notif.priority}</span>
                      <span>•</span>
                      <span className="font-medium">{new Date(notif.createdAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      }) + ', ' + new Date(notif.createdAt).toLocaleDateString('en-US')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            Ready to Transform Your Educational Experience?
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed">
            Join thousands of educators and institutions using EduCloud to create engaging learning environments.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to={user ? '/student' : '/register'}
              className="px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-slate-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center"
            >
              {user ? 'Go to Dashboard' : 'Get Started Today'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            
            <Link
              to="/contact"
              className="px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300 font-bold text-lg"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </section>

      {/* Footer */}
     
    </div>
  );
};

export default HomePage;
