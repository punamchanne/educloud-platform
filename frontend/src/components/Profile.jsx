import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI, contactAPI } from '../services/api';
import api from '../services/api';
import { User, Book, Bell, Upload, Eye, EyeOff, Star, Briefcase, Lock, MessageSquare, Mail, Calendar, CheckCircle, Shield, LayoutDashboard, Settings, Users } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [contactMessages, setContactMessages] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', address: '', profilePic: null, role: 'student', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

    // Fetch user profile, notifications, and contact messages
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view profile');
          navigate('/login');
          return;
        }

        const [profileRes] = await Promise.all([
          authAPI.getProfile(),
        ]);
        setUser(profileRes.data.user);
        setFormData({
          fullName: profileRes.data.user.profile?.fullName || '',
          phone: profileRes.data.user.profile?.phone || '',
          address: profileRes.data.user.profile?.address || '',
          profilePic: null,
          role: profileRes.data.user.role || 'student',
          password: '',
        });

        // Fetch notifications using generic API endpoint
        try {
          const notifRes = await api.get('/notifications');
          setNotifications(notifRes.data.unreadCount || notifRes.data.notifications?.filter(n => !n.read)?.length || 0);
        } catch (notifError) {
          console.log('Could not fetch notifications:', notifError);
          setNotifications(0);
        }

        // Fetch contact messages if user has an email
        if (profileRes.data.user.email) {
          try {
            const contactRes = await contactAPI.getUserContactMessages();
            setContactMessages(contactRes.data.data || []);
          } catch {
            setContactMessages([]);
          }
        }
      } catch (error) {
        console.error('Error:', error.response?.data?.message || error.message);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePic: e.target.files[0] });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('role', formData.role);
      if (formData.password) formDataToSend.append('password', formData.password);
      if (formData.profilePic) formDataToSend.append('profilePic', formData.profilePic);

      const res = await authAPI.updateProfile(formDataToSend);
      setUser(res.data.user);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      console.error('Error:', error.response?.data?.message || error.message);
    }
  };

  if (!user) {
    return <div className="text-center text-2xl font-semibold mt-16 text-gray-700">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="absolute inset-0 bg-blue-400/10 rounded-2xl blur-3xl opacity-50"></div>
          <div className="relative flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <img
              src={user.profile?.profilePic || 'https://via.placeholder.com/100'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
              aria-label="User profile picture"
            />
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
              <p className="text-lg text-gray-200 mb-2">{user.email}</p>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <p className="text-md capitalize flex items-center justify-center md:justify-start">
                  <Briefcase size={16} className="mr-2" /> Role: {user.role}
                </p>
                <div className="flex items-center justify-center md:justify-start">
                  <Bell size={20} className="mr-2" />
                  <span>{notifications} Unread Notifications</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text">
            Welcome, {user.username}!
          </h2>
          <p className="text-gray-600 mb-4">
            As a {user.role}, you have access to EduCloud's AI-powered learning tools, advanced analytics, and secure educational management. Manage your profile, track your progress, and stay updated with notifications.
          </p>
          <div className="flex justify-center items-center bg-blue-50 rounded-lg p-4">
            <Star className="w-5 h-5 text-yellow-400 mr-2" />
            <p className="text-sm text-gray-600 italic">
              "Trusted by 50,000+ educators and students transforming education"
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <Book size={24} className="mx-auto text-blue-500 mb-2" />
            <p className="text-lg font-semibold text-gray-900">{user.examCount}</p>
            <p className="text-sm text-gray-600">Total Exams</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <Star size={24} className="mx-auto text-yellow-500 mb-2" />
            <p className="text-lg font-semibold text-gray-900">{user.averageScore.toFixed(2)}%</p>
            <p className="text-sm text-gray-600">Average Score</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <Bell size={24} className="mx-auto text-indigo-500 mb-2" />
            <p className="text-lg font-semibold text-gray-900">{notifications}</p>
            <p className="text-sm text-gray-600">Notifications</p>
          </div>
        </div>

        {/* Edit Profile Form */}
        {editMode ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="mr-2 text-blue-500" /> Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="Enter your full name"
                  aria-label="Full name"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="mr-2 text-blue-500" /> Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="Enter your phone number"
                  aria-label="Phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="mr-2 text-blue-500" /> Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="Enter your address"
                  aria-label="Address"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Briefcase size={16} className="mr-2 text-blue-500" /> Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-700"
                  aria-label="Role"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} className="mr-2 text-blue-500" /> New Password (Optional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Enter new password (optional)"
                    aria-label="New password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Upload size={16} className="mr-2 text-blue-500" /> Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 p-2 text-gray-700"
                  aria-label="Profile picture upload"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-400 hover:to-indigo-400 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="mb-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-400 hover:to-indigo-400 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            <Upload size={16} className="inline mr-2" /> Edit Profile
          </button>
        )}

        {/* Exam History */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
            <Book size={20} className="mr-2 text-blue-500" /> Exam History
          </h2>
          {user.examHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-50 text-gray-900">
                    <th className="p-3 font-semibold">Exam Title</th>
                    <th className="p-3 font-semibold">Score</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {user.examHistory.map((exam, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-3 text-gray-700">{exam.examId?.title || 'N/A'}</td>
                      <td className="p-3 text-gray-700">{exam.score}/{exam.totalQuestions}</td>
                      <td className="p-3 capitalize text-gray-700">{exam.status}</td>
                      <td className="p-3 text-gray-700">
                        {new Date(exam.examId?.scheduledDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No exams taken yet.</p>
          )}
        </div>

        {/* Contact Messages */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
            <MessageSquare size={20} className="mr-2 text-blue-500" /> Contact Messages
          </h2>
          {contactMessages.length > 0 ? (
            <div className="space-y-4">
              {contactMessages.map((message, index) => (
                <div
                  key={message._id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail size={16} className="text-blue-500" />
                      <span className="font-medium text-gray-900">{message.subject}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        message.priority === 'high' ? 'bg-red-100 text-red-800' :
                        message.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {message.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>{new Date(message.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{message.message}</p>
                  {message.adminResponse && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                      <div className="flex items-center mb-2">
                        <CheckCircle size={16} className="text-blue-600 mr-2" />
                        <span className="font-medium text-blue-900">Admin Response</span>
                      </div>
                      <p className="text-blue-800">{message.adminResponse}</p>
                      {message.respondedAt && (
                        <p className="text-xs text-blue-600 mt-2">
                          Responded on {new Date(message.respondedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      message.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      message.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {message.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No contact messages yet.</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm">
          <p className="text-sm text-gray-500 flex items-center justify-center space-x-4">
            {user.role === 'admin' ? (
              <Link to="/admin" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center">
                <Shield size={16} className="mr-1" /> Admin Dashboard
              </Link>
            ) : user.role === 'teacher' ? (
              <Link to="/teacher" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center">
                <Briefcase size={16} className="mr-1" /> Teacher Dashboard
              </Link>
            ) : user.role === 'parent' ? (
              <Link to="/parent" className="text-green-600 hover:text-green-800 font-semibold transition-colors flex items-center">
                <Users size={16} className="mr-1" /> Parent Portal
              </Link>
            ) : (
              <Link to="/student" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center">
                <LayoutDashboard size={16} className="mr-1" /> Student Dashboard
              </Link>
            )}
            <span className="text-gray-300">|</span>
            <Link to="/notifications" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center">
              <Bell size={16} className="mr-1" /> Notifications
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/settings" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center">
              <Settings size={16} className="mr-1" /> Settings
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
