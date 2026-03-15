import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  Menu,
  X,
  GraduationCap,
  UserCheck,
  Clock,
  Brain,
  FileEdit,
  Users2
} from 'lucide-react';

const TeacherSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/teacher',
      icon: LayoutDashboard,
    },
    {
      name: 'My Classes',
      path: '/teacher/classes',
      icon: BookOpen,
    },
    {
      name: 'Students',
      path: '/teacher/students',
      icon: Users,
    },
    {
      name: 'Attendance',
      path: '/teacher/attendance',
      icon: UserCheck,
    },
    {
      name: 'Exams',
      path: '/teacher/exams',
      icon: GraduationCap,
    },
    {
      name: 'Schedule',
      path: '/teacher/schedule',
      icon: Clock,
    },
    {
      name: 'Reports',
      path: '/teacher/reports',
      icon: BarChart3,
    },
    {
      name: 'Notifications',
      path: '/teacher/notifications',
      icon: Bell,
    },
    {
      name: 'Settings',
      path: '/teacher/settings',
      icon: Settings,
    },
    {
      name: 'AI Document Console',
      path: '/teacher/document-console',
      icon: FileEdit,
    },
    {
      name: 'AI Meeting Management',
      path: '/teacher/meeting-management',
      icon: Users2,
    },
    {
      name: 'AI Smart Timetable',
      path: '/teacher/smart-timetable',
      icon: Brain,
    },
    {
      name: 'Dynamic Forms',
      path: '/teacher/forms',
      icon: FileEdit,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Teacher Portal
            </h2>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherSidebar;
