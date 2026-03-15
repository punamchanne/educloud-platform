import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  ChevronDown,
  ChevronUp,
  Book,
  Users,
  GraduationCap,
  Shield,
  Settings,
  FileText,
  Calendar,
  BarChart3,
  MessageSquare,
  Award,
  User,
  Bell,
  HelpCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

const NotFound = () => {
  const [showSections, setShowSections] = useState(false);
  const navigate = useNavigate();

  const siteSections = [
    {
      title: 'General',
      icon: Home,
      items: [
        { name: 'Home', path: '/', description: 'Main dashboard and overview' },
        { name: 'About Us', path: '/about', description: 'Learn about EduCloud' },
        { name: 'Contact', path: '/contact', description: 'Get in touch with us' },
        { name: 'Help & Support', path: '/help', description: 'Find answers and support' }
      ]
    },
    {
      title: 'Academic',
      icon: Book,
      items: [
        { name: 'Courses', path: '/courses', description: 'Browse available courses' },
        { name: 'Exams', path: '/exams', description: 'Take and manage exams' },
        { name: 'Timetable', path: '/timetable', description: 'View your schedule' },
        { name: 'Reports', path: '/reports', description: 'Academic performance reports' }
      ]
    },
    {
      title: 'User Roles',
      icon: Users,
      items: [
        { name: 'Student Dashboard', path: '/student', description: 'Student portal' },
        { name: 'Teacher Dashboard', path: '/teacher', description: 'Teacher management' },
        { name: 'Parent Dashboard', path: '/parent', description: 'Parent monitoring' },
        { name: 'Admin Panel', path: '/admin', description: 'Administrative controls' }
      ]
    },
    {
      title: 'Communication',
      icon: MessageSquare,
      items: [
        { name: 'Notifications', path: '/notifications', description: 'View all notifications' },
        { name: 'Messages', path: '/messages', description: 'Direct messaging' },
        { name: 'Announcements', path: '/announcements', description: 'System announcements' }
      ]
    },
    {
      title: 'Settings',
      icon: Settings,
      items: [
        { name: 'Profile Settings', path: '/profile', description: 'Manage your profile' },
        { name: 'Account Settings', path: '/settings', description: 'Account preferences' },
        { name: 'Privacy Settings', path: '/privacy', description: 'Privacy controls' }
      ]
    }
  ];

  const quickActions = [
    { name: 'Go Home', path: '/', icon: Home, color: 'bg-blue-500 hover:bg-blue-600' },
    { name: 'Search', path: '/search', icon: Search, color: 'bg-purple-500 hover:bg-purple-600' },
    { name: 'Help', path: '/help', icon: HelpCircle, color: 'bg-green-500 hover:bg-green-600' },
    { name: 'Contact', path: '/contact', icon: MessageSquare, color: 'bg-orange-500 hover:bg-orange-600' }
  ];

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main 404 Content */}
        <div className="text-center mb-8">
          <div className="relative mb-8">
            <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                <Search className="w-16 h-16 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Oops! The page you're looking for seems to have wandered off into the digital void.
            Don't worry, let's get you back on track.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.path}
                  className={`px-6 py-3 ${action.color} text-white rounded-xl font-medium transition-all duration-200 flex items-center hover:shadow-lg transform hover:-translate-y-1`}
                >
                  <IconComponent className="w-5 h-5 mr-2" />
                  {action.name}
                </Link>
              );
            })}
          </div>

          {/* Go Back Button */}
          <button
            onClick={handleGoBack}
            className="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Site Sections Dropdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-600 overflow-hidden">
          <button
            onClick={() => setShowSections(!showSections)}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                <Book className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Explore EduCloud
                </h2>
                <p className="text-gray-600 dark:text-slate-400">
                  Find what you're looking for in our organized sections
                </p>
              </div>
            </div>
            {showSections ?
              <ChevronUp className="w-6 h-6 text-gray-500 dark:text-slate-400" /> :
              <ChevronDown className="w-6 h-6 text-gray-500 dark:text-slate-400" />
            }
          </button>

          {showSections && (
            <div className="border-t border-gray-200 dark:border-slate-600">
              <div className="p-6 space-y-6">
                {siteSections.map((section, sectionIndex) => {
                  const SectionIcon = section.icon;
                  return (
                    <div key={sectionIndex} className="border-b border-gray-100 dark:border-slate-700 last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-center mb-4">
                        <SectionIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {section.title}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.items.map((item, itemIndex) => (
                          <Link
                            key={itemIndex}
                            to={item.path}
                            className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-200 group"
                          >
                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                              {item.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Still can't find what you're looking for?
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              Try using our search feature or contact our support team for assistance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/search"
                className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors duration-200"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Site
              </Link>
              <Link
                to="/help"
                className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors duration-200"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Get Help
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </button>
            </div>
          </div>
        </div>

        {/* Fun 404 Animation */}
        <div className="mt-8 text-center">
          <div className="inline-block">
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
