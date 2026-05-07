import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { Mail, Sparkles, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
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
                  Forgot Password?
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                  Don't worry, it happens. We'll help you get back into your account.
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
            {!submitted ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Account Recovery
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Recover Your Account</h2>
                  <p className="text-gray-600">Enter your email and we'll send you a password reset link</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="group">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Mail size={18} className="mr-2 text-blue-500 group-focus-within:text-blue-600 transition-colors" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400 bg-white hover:border-blue-300"
                      placeholder="Enter your registered email"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center group ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                    {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
                <p className="text-gray-600 mb-8">
                  We've sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>. 
                  Please check your inbox and follow the instructions.
                </p>
                <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 mb-8 text-left">
                  <p><strong>Note:</strong> If you don't see the email within a few minutes, please check your spam folder.</p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Didn't receive the email? Try again
                </button>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-100">
              <Link
                to="/login"
                className="flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors font-medium group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
