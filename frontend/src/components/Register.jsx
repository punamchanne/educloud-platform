import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, CheckCircle, ArrowRight, Users, BookOpen, Shield, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await authAPI.register(formData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      console.error('Error:', error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Join EduCloud Today
                </h1>
                <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                  Start your journey with AI-powered education and advanced learning tools
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Shield className="h-8 w-8 text-white mx-auto mb-3" />
                <div className="text-lg font-bold text-white">Secure & Private</div>
                <div className="text-purple-100 text-sm">Your data is protected</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <BookOpen className="h-8 w-8 text-white mx-auto mb-3" />
                <div className="text-lg font-bold text-white">AI-Powered</div>
                <div className="text-purple-100 text-sm">Advanced learning tools</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Users className="h-8 w-8 text-white mx-auto mb-3" />
                <div className="text-lg font-bold text-white">Community</div>
                <div className="text-purple-100 text-sm">Join 50,000+ educators</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-lg mx-auto -mt-16 relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-md border-0 shadow-2xl rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]">
          <div className="relative">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-indigo-50/50 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white text-sm font-medium mb-4 animate-pulse">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Your Account
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started with EduCloud</h2>
                <p className="text-gray-600">Join thousands of educators transforming education</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <User size={18} className="mr-2 text-purple-500 group-focus-within:text-purple-600 transition-colors" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 placeholder-gray-400 bg-white hover:border-purple-300"
                    placeholder="Enter your full name"
                    aria-label="Username"
                  />
                  {errors.username && <p className="text-red-500 text-sm mt-2 flex items-center animate-slide-in"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.username}</p>}
                </div>

                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Mail size={18} className="mr-2 text-purple-500 group-focus-within:text-purple-600 transition-colors" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 placeholder-gray-400 bg-white hover:border-purple-300"
                    placeholder="Enter your email address"
                    aria-label="Email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-2 flex items-center animate-slide-in"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.email}</p>}
                </div>

                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Lock size={18} className="mr-2 text-purple-500 group-focus-within:text-purple-600 transition-colors" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 placeholder-gray-400 bg-white hover:border-purple-300"
                      placeholder="Create a strong password (min. 6 characters)"
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors hover:scale-110"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-2 flex items-center animate-slide-in"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center group hover:scale-105"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="text-center mt-8 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>

                <p className="text-gray-600">
                  Sign in to access your EduCloud dashboard
                </p>

                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-semibold text-gray-700 hover:text-blue-600 group hover:scale-105"
                >
                  <span>Sign In</span>
                  <CheckCircle className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Link>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-purple-500 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-purple-500 hover:underline">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
