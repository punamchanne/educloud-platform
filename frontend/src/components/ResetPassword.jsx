import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { Lock, Eye, EyeOff, Sparkles, ArrowRight, Shield, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, formData.password);
      toast.success('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Reset Password
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                  Secure your account with a new, strong password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-lg mx-auto -mt-16 relative z-10 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white/90 backdrop-blur-md border-0 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500">
          <div className="relative p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Security Update
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h2>
              <p className="text-gray-600">Enter your new password below to regain access</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Lock size={18} className="mr-2 text-blue-500 group-focus-within:text-blue-600 transition-colors" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400 bg-white hover:border-blue-300"
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <CheckCircle size={18} className="mr-2 text-blue-500 group-focus-within:text-blue-600 transition-colors" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400 bg-white hover:border-blue-300"
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center group ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-600 text-sm">
                Remembered your password?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
