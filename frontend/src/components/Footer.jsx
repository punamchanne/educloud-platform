import { Link } from 'react-router-dom';
import { Book, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Sparkles, Heart, ArrowUp, Shield, Users, GraduationCap, Award } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  EduCloud
                </h3>
                <p className="text-sm text-slate-300">AI-Powered Education</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed max-w-md">
              Empowering the future of education with cutting-edge AI technology, seamless management tools, and innovative learning experiences for students and educators worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-3 bg-white/10 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-xl transition-all duration-300 group">
                <Facebook size={20} className="text-slate-300 group-hover:text-white" />
              </a>
              <a href="#" className="p-3 bg-white/10 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-xl transition-all duration-300 group">
                <Twitter size={20} className="text-slate-300 group-hover:text-white" />
              </a>
              <a href="#" className="p-3 bg-white/10 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-xl transition-all duration-300 group">
                <Instagram size={20} className="text-slate-300 group-hover:text-white" />
              </a>
              <a href="#" className="p-3 bg-white/10 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-xl transition-all duration-300 group">
                <Youtube size={20} className="text-slate-300 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <Book className="w-5 h-5 mr-2 text-blue-400" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group">
                  <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:w-2 transition-all"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-3 group-hover:w-2 transition-all"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:w-2 transition-all"></span>
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-purple-400" />
              Get in Touch
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Mail size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Email Support</p>
                  <a href="mailto:support@educloud.com" className="text-white hover:text-blue-300 transition-colors">
                    support@educloud.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Phone size={16} className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Phone Support</p>
                  <a href="tel:+1-800-EDUCLOUD" className="text-white hover:text-green-300 transition-colors">
                    +1-800-EDUCLOUD
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <MapPin size={16} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Global Support</p>
                  <p className="text-white">24/7 Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <GraduationCap size={20} className="text-white" />
              </div>
              <h5 className="font-semibold text-white">Smart Learning</h5>
            </div>
            <p className="text-sm text-slate-300">AI-powered personalized learning paths for every student.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Users size={20} className="text-white" />
              </div>
              <h5 className="font-semibold text-white">Collaborative Tools</h5>
            </div>
            <p className="text-sm text-slate-300">Connect teachers, students, and parents in one platform.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg">
                <Award size={20} className="text-white" />
              </div>
              <h5 className="font-semibold text-white">Achievement Tracking</h5>
            </div>
            <p className="text-sm text-slate-300">Monitor progress and celebrate academic milestones.</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-slate-300">
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>

            <div className="flex items-center space-x-4">
              <p className="text-sm text-slate-300 flex items-center">
                Made with <Heart className="w-4 h-4 mx-1 text-red-400 animate-pulse" /> for education
              </p>
              <button
                onClick={scrollToTop}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 group"
              >
                <ArrowUp size={16} className="text-white group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-bold">EduCloud</span>.
              All rights reserved. <span className="inline-flex items-center ml-2"><Shield size={12} className="mr-1" />Secure & Trusted</span>
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 md:hidden p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 z-50"
      >
        <ArrowUp size={20} className="text-white" />
      </button>
    </footer>
  );
};

export default Footer;
