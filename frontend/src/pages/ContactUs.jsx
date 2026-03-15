import { useState } from 'react';
import { toast } from 'react-toastify';
import { contactAPI } from '../services/api';
import { Mail, Phone, MapPin, Send, Users, Target, Award, Sparkles, MessageSquare, Clock, CheckCircle, ArrowRight, Globe, Star, Heart } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    institution: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.subject) newErrors.subject = 'Please select a subject';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await contactAPI.submitContactForm(formData);
      if (response.data.success) {
        toast.success('Message sent successfully! Our team will respond within 24 hours.');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          institution: '',
          phone: ''
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="text-center py-16 mb-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            </div>
            <div className="relative">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                <span className="text-sm font-medium text-purple-700">Get In Touch</span>
              </div>
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Let's Build the Future of Education Together
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Have questions about EduCloud? Need support? Want to explore partnership opportunities?
                We're here to help you transform education with AI-powered solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href="#contact-form" className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold">
                  <MessageSquare size={20} />
                  <span>Send Message</span>
                </a>
                <div className="flex items-center space-x-4 text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Clock size={16} />
                    <span className="text-sm">Response within 24h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm">Free consultation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-2">10,000+</h3>
              <p className="text-slate-600">Educators Empowered</p>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-2">500+</h3>
              <p className="text-slate-600">Institutions Worldwide</p>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-2">4.9/5</h3>
              <p className="text-slate-600">Customer Satisfaction</p>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div id="contact-form" className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="flex items-center mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mr-4">
                  <Send size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">Send Us a Message</h2>
                  <p className="text-slate-600 mt-1">We'll get back to you within 24 hours</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Institution/Organization</label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="School/University name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800"
                  >
                    <option value="">Select a subject</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Account Issues">Account Issues</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Partnership Inquiry">Partnership Inquiry</option>
                    <option value="Demo Request">Demo Request</option>
                    <option value="Pricing Information">Pricing Information</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                  {errors.subject && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400 resize-y h-32"
                    placeholder="Tell us how we can help you with your educational needs..."
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send size={20} />
                      <span>Send Message</span>
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details Cards */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="flex items-center mb-8">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl mr-4">
                    <Phone size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800">Get In Touch</h2>
                    <p className="text-slate-600 mt-1">Multiple ways to reach our team</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="group bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                        <Mail size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">Email Support</h3>
                        <a href="mailto:support@educloud.com" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                          support@educloud.com
                        </a>
                        <p className="text-sm text-slate-600 mt-1">We respond within 24 hours</p>
                      </div>
                      <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform mt-2" />
                    </div>
                  </div>

                  <div className="group bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                        <Phone size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">Phone Support</h3>
                        <a href="tel:+1-800-EDUCLOUD" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                          +1-800-EDUCLOUD
                        </a>
                        <p className="text-sm text-slate-600 mt-1">Mon-Fri, 9AM-6PM EST</p>
                      </div>
                      <ArrowRight size={16} className="text-purple-400 group-hover:translate-x-1 transition-transform mt-2" />
                    </div>
                  </div>

                  <div className="group bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border border-green-100/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                        <MapPin size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">Headquarters</h3>
                        <div className="text-slate-700">
                          <p>123 Education Drive</p>
                          <p>Learning City, LC 12345</p>
                          <p>United States</p>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">Global operations center</p>
                      </div>
                      <ArrowRight size={16} className="text-green-400 group-hover:translate-x-1 transition-transform mt-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mission & Vision Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mr-4">
                    <Target size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Our Mission & Vision</h3>
                    <p className="text-slate-600 mt-1">Driving educational excellence</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100/50">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="w-6 h-6 text-blue-600" />
                      <h4 className="text-lg font-semibold text-slate-800">Our Mission</h4>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      To revolutionize education by providing accessible, AI-powered tools that enhance learning and streamline administration for educators worldwide.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100/50">
                    <div className="flex items-center space-x-3 mb-3">
                      <Award className="w-6 h-6 text-purple-600" />
                      <h4 className="text-lg font-semibold text-slate-800">Our Vision</h4>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      To create a global platform where students, educators, and administrators collaborate effortlessly for academic success and innovation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Support Tips */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mr-4">
                    <Heart size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Quick Support Tips</h3>
                    <p className="text-slate-600 mt-1">Get help faster</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-100/50">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">Include your institution name and account details for faster assistance</p>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border border-slate-100/50">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">Mention specific features or issues you're facing</p>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-xl border border-slate-100/50">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">Screenshots help us understand technical issues better</p>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-slate-50 to-orange-50 rounded-xl border border-slate-100/50">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">Check our knowledge base for instant solutions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;
