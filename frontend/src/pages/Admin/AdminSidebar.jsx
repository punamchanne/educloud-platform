import api from '../../services/api';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
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
  Settings,
  Shield,
  Brain,
  FileEdit,
  Users2,
  Clock,
  BarChart3,
  MessageSquare
} from 'lucide-react';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ users: 0, exams: 0, notifications: 0 });
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

        // Fetch quick stats for admin
        const [usersRes, examsRes, notifRes] = await Promise.all([
          api.get('/users', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/exams', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/notifications', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats({
          users: usersRes.data.users?.length || 0,
          exams: examsRes.data.exams?.length || 0,
          notifications: notifRes.data.notifications?.length || 0,
        });
      } catch {
        toast.error('Failed to fetch admin data');
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
      path: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Analytics',
      badge: null
    },
    {
      path: '/admin/users',
      label: 'User Management',
      icon: Users,
      description: 'Manage Users & Roles',
      badge: stats.users > 0 ? stats.users : null
    },
    {
      path: '/admin/exams',
      label: 'Exam Management',
      icon: BookOpen,
      description: 'Create & Manage Exams',
      badge: stats.exams > 0 ? stats.exams : null
    },
    {
      path: '/admin/timetables',
      label: 'Smart Timetable Generator',
      icon: Calendar,
      description: 'AI-Optimized Drag & Drop Scheduling'
    },
    {
      path: '/admin/reports',
      label: 'Report Management',
      icon: FileText,
      description: 'Analytics & Reports'
    },
    {
      path: '/admin/notifications',
      label: 'Notification Management',
      icon: Bell,
      description: 'System Notifications',
      badge: stats.notifications > 0 ? stats.notifications : null
    },
    {
      path: '/admin/contacts',
      label: 'Contact Management',
      icon: MessageSquare,
      description: 'Contact Messages & Support'
    },
    {
      path: '/admin/documents',
      label: 'Documents',
      icon: FileEdit,
      description: 'AI Document Generation'
    },
    {
      path: '/admin/meetings',
      label: 'Meeting Management',
      icon: Users2,
      description: 'Meeting Management & AI Insights'
    },
    {
      path: '/admin/survey-generation',
      label: 'Survey Generation',
      icon: BarChart3,
      description: 'AI Survey Creation'
    },
    {
      path: '/admin/forms',
      label: 'Dynamic Forms',
      icon: FileEdit,
      description: 'Form Management System'
    }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
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
        relative min-h-[calc(100vh-4rem)] w-80 md:w-20
        bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800
        dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
        border-r border-slate-600 dark:border-slate-700
        shadow-xl backdrop-blur-md
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 md:w-80' : 'translate-x-0 md:w-20'}
        ${isOpen ? 'w-80' : 'w-0 md:w-20'}
        z-40
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-600 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${!isOpen && 'md:justify-center'}`}>
                
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white truncate">
                      {user?.username || 'Admin'}
                    </h2>
                    <p className="text-sm text-slate-300">
                      Administrator
                    </p>
                  </div>
                )}
              </div>

              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-500 transition-colors"
              >
                {isOpen ? (
                  <ChevronLeft className="w-4 h-4 text-slate-300" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-300" />
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
                      ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-600'
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
                      <Icon className={`${isOpen ? 'w-5 h-5' : 'w-4 h-4 md:w-5 md:h-5'} ${
                        active ? 'text-white' : 'text-slate-400'
                      }`} />

                      {/* Badge for stats */}
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </div>

                    {isOpen && (
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{item.label}</div>
                        <div className={`text-sm ${active ? 'text-red-100' : 'text-slate-400'} truncate`}>
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
          <div className="p-4 border-t border-slate-600 dark:border-slate-700 space-y-2">
            {/* Home Link */}
            <Link
              to="/"
              className={`
                group flex items-center p-3 rounded-xl transition-all duration-200
                text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-600
                ${!isOpen && 'md:justify-center md:px-3'}
              `}
              title={!isOpen ? 'Home' : ''}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`
                  flex items-center justify-center
                  ${isOpen ? 'w-10 h-10' : 'w-8 h-8 md:w-10 md:h-10'}
                `}>
                  <Home className={`${isOpen ? 'w-5 h-5' : 'w-4 h-4 md:w-5 md:h-5'} text-slate-400`} />
                </div>
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">Home</div>
                    <div className="text-sm text-slate-400 truncate">
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
                text-slate-300 hover:bg-red-900/20 hover:text-red-400
                ${!isOpen && 'md:justify-center md:px-3'}
              `}
              title={!isOpen ? 'Logout' : ''}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`
                  flex items-center justify-center
                  ${isOpen ? 'w-10 h-10' : 'w-8 h-8 md:w-10 md:h-10'}
                `}>
                  <LogOut className={`${isOpen ? 'w-5 h-5' : 'w-4 h-4 md:w-5 md:h-5'} text-slate-400 group-hover:text-red-400`} />
                </div>
                {isOpen && (
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-semibold truncate">Logout</div>
                    <div className="text-sm text-slate-400 truncate">
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
        className="md:hidden fixed top-20 left-4 z-50 bg-gradient-to-r from-red-500 to-orange-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </>
  );
};

export default AdminSidebar;
