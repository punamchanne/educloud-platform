import api from '../services/api';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Video,
  File
} from 'lucide-react';

const StudentSidebar = ({ isOpen, toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const profileRes = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(profileRes.data.user);

        const notifRes = await api.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const unreadCount = notifRes.data.notifications?.filter(n => !n.read).length || 0;
        setUnreadNotifications(unreadCount);
      } catch {
        toast.error('Failed to fetch user data');
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const navigationItems = [
    {
      path: '/student',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Stats'
    },
    {
      path: '/student/exams',
      label: 'My Exams',
      icon: BookOpen,
      description: 'Take & View Exams'
    },
    {
      path: '/student/timetable',
      label: 'Timetable',
      icon: Calendar,
      description: 'Class Schedule'
    },
    {
      path: '/student/reports',
      label: 'Reports',
      icon: FileText,
      description: 'Performance Analytics'
    },
    {
      path: '/student/notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Messages & Updates',
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    {
      path: '/student/meetings',
      label: 'Meetings',
      icon: Video,
      description: 'Virtual Classes & Conferences'
    },
    {
      path: '/student/documents',
      label: 'Documents',
      icon: File,
      description: 'Study Materials & Resources'
    }
  ];

  const isActive = (path) => {
    if (path === '/student') {
      return location.pathname === '/student';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        relative min-h-[calc(100vh-4rem)] md:w-20
        bg-gradient-to-b from-white via-slate-50 to-blue-50
        dark:from-slate-800 dark:via-slate-700 dark:to-slate-800
        border-r border-slate-200 dark:border-slate-600
        shadow-xl backdrop-blur-md
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 md:w-80' : 'translate-x-0 md:w-20'}
        ${isOpen ? 'w-80' : 'w-0 md:w-20'}
        z-40
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${!isOpen && 'md:justify-center'}`}>
                
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white truncate">
                      {user?.username || 'Student'}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {user?.email || 'student@educloud.com'}
                    </p>
                  </div>
                )}
              </div>

              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
              >
                {isOpen ? (
                  <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group relative flex items-center p-4 rounded-xl transition-all duration-200
                    ${active
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }
                    ${!isOpen && 'md:justify-center md:px-3'}
                  `}
                  title={!isOpen ? item.label : ''}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`
                      relative flex items-center justify-center
                      ${isOpen ? 'w-10 h-10' : 'w-8 h-8 md:w-10 md:h-10'}
                    `}>
                      <Icon className={`${
                        isOpen ? 'w-5 h-5' : 'w-4 h-4 md:w-5 md:h-5'
                      } ${active ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />

                      {/* Badge for notifications */}
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </div>

                    {isOpen && (
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{item.label}</div>
                        <div className={`text-sm ${active ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'} truncate`}>
                          {item.description}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active indicator */}
                  {active && isOpen && (
                    <div className="w-2 h-2 bg-white rounded-full ml-2"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-600 space-y-2">
            {/* Home Link */}
            <Link
              to="/"
              className={`
                group flex items-center p-3 rounded-xl transition-all duration-200
                text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600
                ${!isOpen && 'md:justify-center md:px-3'}
              `}
              title={!isOpen ? 'Home' : ''}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`
                  flex items-center justify-center
                  ${isOpen ? 'w-10 h-10' : 'w-8 h-8 md:w-10 md:h-10'}
                `}>
                  <Home className={`${
                    isOpen ? 'w-5 h-5' : 'w-4 h-4 md:w-5 md:h-5'
                  } text-slate-600 dark:text-slate-400`} />
                </div>
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">Home</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      Back to main site
                    </div>
                  </div>
                )}
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`
                group w-full flex items-center p-3 rounded-xl transition-all duration-200
                text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600
                ${!isOpen && 'md:justify-center md:px-3'}
              `}
              title={!isOpen ? 'Logout' : ''}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`
                  flex items-center justify-center
                  ${isOpen ? 'w-10 h-10' : 'w-8 h-8 md:w-10 md:h-10'}
                `}>
                  <LogOut className={`${
                    isOpen ? 'w-5 h-5' : 'w-4 h-4 md:w-5 md:h-5'
                  } text-slate-600 dark:text-slate-400 group-hover:text-red-500`} />
                </div>
                {isOpen && (
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-semibold truncate">Logout</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      Sign out of account
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-20 left-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </>
  );
};

export default StudentSidebar;
