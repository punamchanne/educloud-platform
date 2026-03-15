import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import {
  Menu, X, User, LogOut, Bell, Book, Settings,
  ChevronDown, Shield, Users, Calendar, BarChart3, MessageSquare,
  Home, GraduationCap, Award, FileText, Clock, Activity,
  Sparkles, ArrowRight, Search, Heart, Star
} from 'lucide-react';


const Header = () => {
  const { user, notifications, unreadCount, logout, markNotificationAsRead } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
      if (showNotifications && !event.target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown, showNotifications]);

  const handleLogout = () => {
    logout();
    setShowNotifications(false);
    setShowUserDropdown(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Shield;
      case 'teacher': return GraduationCap;
      case 'parent': return Users;
      case 'student': return User;
      default: return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'teacher': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'parent': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'student': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-xl'
        : 'bg-gradient-to-r from-slate-50/80 via-blue-50/60 to-purple-50/80 backdrop-blur-md'
    }`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          {/* Mobile Logo */}
          <div className="sm:hidden">
            <Sparkles className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
    
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className={`text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-blue-600 group-hover:to-cyan-600 transition-all duration-300 ${
                isScrolled ? 'text-slate-800' : 'text-slate-700'
              }`}>
                EduCloud
              </span>
            </div>
            <p className="text-xs text-slate-500 -mt-1">AI-Powered Education</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          <Link
            to="/"
            className="relative px-4 py-2 rounded-xl text-slate-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-medium group"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <Home size={18} />
              <span>Home</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          <Link
            to="/about"
            className="relative px-4 py-2 rounded-xl text-slate-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 transition-all duration-300 font-medium group"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <Book size={18} />
              <span>About</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          <Link
            to="/contact"
            className="relative px-4 py-2 rounded-xl text-slate-700 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 font-medium group"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <MessageSquare size={18} />
              <span>Contact</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="relative px-4 py-2 rounded-xl text-slate-700 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 transition-all duration-300 font-medium group"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <Shield size={18} />
                <span>Admin</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          )}

          {user?.role === 'student' && (
            <Link
              to="/student"
              className="relative px-4 py-2 rounded-xl text-slate-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-medium group"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <GraduationCap size={18} />
                <span>Dashboard</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          )}

          {user?.role === 'teacher' && (
            <Link
              to="/teacher"
              className="relative px-4 py-2 rounded-xl text-slate-700 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-teal-500 transition-all duration-300 font-medium group"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <Users size={18} />
                <span>Dashboard</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          

          {/* Notifications */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 rounded-xl bg-slate-100 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all duration-300 group"
              >
                <Bell size={20} className="text-slate-600 group-hover:text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse font-bold shadow-lg">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Enhanced Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 z-50 notifications-dropdown overflow-hidden">
                  <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Notifications</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <Bell size={20} className="text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-300 ${
                            !notification.read ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/30' : ''
                          }`}
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-2xl shadow-sm ${
                              notification.type === 'exam' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                              notification.type === 'announcement' ? 'bg-gradient-to-br from-green-100 to-green-200' :
                              'bg-gradient-to-br from-yellow-100 to-yellow-200'
                            }`}>
                              {notification.type === 'exam' && <Award size={18} className="text-blue-600" />}
                              {notification.type === 'announcement' && <MessageSquare size={18} className="text-green-600" />}
                              {notification.type === 'system' && <Settings size={18} className="text-yellow-600" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-800 mb-1">
                                {notification.title}
                              </p>
                              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Clock size={12} className="text-slate-400" />
                                <p className="text-xs text-slate-500">
                                  {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-slate-500">
                        <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-4">
                          <Bell size={32} className="text-slate-400" />
                        </div>
                        <p className="font-medium">No notifications yet</p>
                        <p className="text-sm text-slate-400 mt-1">We'll notify you when there's something new</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-200/50 bg-slate-50">
                    <Link
                      to="/notifications"
                      className="flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium group"
                      onClick={() => setShowNotifications(false)}
                    >
                      <span>View all notifications</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Dropdown */}
          {user ? (
            <div className="relative user-dropdown">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 transition-all duration-300 group"
              >
                <div className="relative">
                  <img
                    src={user.profile?.profilePic || 'https://via.placeholder.com/40'}
                    alt="Profile"
                    className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                    user.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                    user.role === 'teacher' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    user.role === 'parent' ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}></div>
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-slate-800">{user.username}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)} shadow-sm`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <ChevronDown size={16} className="text-slate-600 group-hover:text-slate-800 transition-colors" />
              </button>

              {/* Enhanced User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 z-50 overflow-hidden">
                  {/* User Info Section */}
                  <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={user.profile?.profilePic || 'https://via.placeholder.com/40'}
                          alt="Profile"
                          className="w-14 h-14 rounded-xl object-cover shadow-sm"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                          user.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                          user.role === 'teacher' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          user.role === 'parent' ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-lg">{user.username}</p>
                        <p className="text-sm text-slate-600 mb-2">{user.email}</p>
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const RoleIcon = getRoleIcon(user.role);
                            return <RoleIcon size={14} className="text-slate-500" />;
                          })()}
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)} shadow-sm`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-3 border-b border-slate-200/50">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-all duration-300 group"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg group-hover:scale-110 transition-transform">
                          <Settings size={16} className="text-slate-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Settings</span>
                      </Link>
                    </div>
                  </div>

                  {/* Role-specific Quick Links */}
                  <div className="p-3 border-b border-slate-200/50">
                    {user.role === 'student' && (
                      <div className="space-y-2">
                        <Link to="/student" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group" onClick={() => setShowUserDropdown(false)}>
                          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg group-hover:scale-110 transition-transform">
                            <Home size={16} className="text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">Dashboard</span>
                        </Link>
                        <Link to="/student/exams" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 group" onClick={() => setShowUserDropdown(false)}>
                          <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg group-hover:scale-110 transition-transform">
                            <Award size={16} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">My Exams</span>
                        </Link>
                      </div>
                    )}
                    {user.role === 'teacher' && (
                      <div className="space-y-2">
                        <Link to="/teacher" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-300 group" onClick={() => setShowUserDropdown(false)}>
                          <div className="p-2 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg group-hover:scale-110 transition-transform">
                            <Home size={16} className="text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">Dashboard</span>
                        </Link>
                        <Link to="/teacher/classes" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group" onClick={() => setShowUserDropdown(false)}>
                          <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg group-hover:scale-110 transition-transform">
                            <Users size={16} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">My Classes</span>
                        </Link>
                      </div>
                    )}
                    {user.role === 'admin' && (
                      <div className="space-y-2">
                        <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-300 group" onClick={() => setShowUserDropdown(false)}>
                          <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg group-hover:scale-110 transition-transform">
                            <Home size={16} className="text-red-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">Dashboard</span>
                        </Link>
                        <Link to="/admin/users" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-all duration-300 group" onClick={() => setShowUserDropdown(false)}>
                          <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg group-hover:scale-110 transition-transform">
                            <Users size={16} className="text-slate-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">User Management</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="p-3">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 text-red-600 hover:text-red-700 group"
                    >
                      <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg group-hover:scale-110 transition-transform">
                        <LogOut size={16} />
                      </div>
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 rounded-xl bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 font-medium hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} className="text-slate-700" /> : <Menu size={24} className="text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/50 shadow-xl">
          <nav className="container mx-auto px-4 py-6">
            {/* User Info Section (Mobile) */}
            {user && (
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl mb-6 border border-slate-200/50">
                <img
                  src={user.profile?.profilePic || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-12 h-12 rounded-xl object-cover shadow-sm"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{user.username}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {(() => {
                      const RoleIcon = getRoleIcon(user.role);
                      return <RoleIcon size={14} className="text-slate-500" />;
                    })()}
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-2 mb-6">
              <Link
                to="/"
                className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Home size={20} className="text-blue-600" />
                </div>
                <span className="font-medium text-slate-700">Home</span>
              </Link>

              <Link
                to="/about"
                className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Book size={20} className="text-purple-600" />
                </div>
                <span className="font-medium text-slate-700">About</span>
              </Link>

              <Link
                to="/contact"
                className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-3 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                  <MessageSquare size={20} className="text-cyan-600" />
                </div>
                <span className="font-medium text-slate-700">Contact</span>
              </Link>

              {user?.role === 'student' && (
                <>
                  <Link
                    to="/student"
                    className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl group-hover:scale-110 transition-transform">
                      <GraduationCap size={20} className="text-purple-600" />
                    </div>
                    <span className="font-medium text-slate-700">Dashboard</span>
                  </Link>
                  <Link
                    to="/student/exams"
                    className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 group ml-8"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                      <Award size={16} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">My Exams</span>
                  </Link>
                </>
              )}

              {user?.role === 'teacher' && (
                <>
                  <Link
                    to="/teacher"
                    className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-300 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="p-3 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl group-hover:scale-110 transition-transform">
                      <Users size={20} className="text-green-600" />
                    </div>
                    <span className="font-medium text-slate-700">Dashboard</span>
                  </Link>
                  <Link
                    to="/teacher/classes"
                    className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group ml-8"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                      <Users size={16} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">My Classes</span>
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-300 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                      <Shield size={20} className="text-red-600" />
                    </div>
                    <span className="font-medium text-slate-700">Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/users"
                    className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-all duration-300 group ml-8"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
                      <Users size={16} className="text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">User Management</span>
                  </Link>
                </>
              )}

              <Link
                to="/profile"
                className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl group-hover:scale-110 transition-transform">
                  <User size={20} className="text-slate-600" />
                </div>
                <span className="font-medium text-slate-700">Profile</span>
              </Link>

              <Link
                to="/notifications"
                className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl group-hover:scale-110 transition-transform relative">
                  <Bell size={20} className="text-yellow-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="font-medium text-slate-700">Notifications</span>
              </Link>

              <Link
                to="/settings"
                className="flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-all duration-300 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl group-hover:scale-110 transition-transform">
                  <Settings size={20} className="text-slate-600" />
                </div>
                <span className="font-medium text-slate-700">Settings</span>
              </Link>
            </div>

            {/* Auth Buttons (Mobile) */}
            {!user && (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium text-center shadow-lg hover:shadow-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full py-3 px-6 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Logout (Mobile) */}
            {user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 text-red-600 group"
              >
                <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl group-hover:scale-110 transition-transform">
                  <LogOut size={20} />
                </div>
                <span className="font-medium">Logout</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
