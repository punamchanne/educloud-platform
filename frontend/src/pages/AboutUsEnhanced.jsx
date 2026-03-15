import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  Globe, 
  Heart, 
  BookOpen, 
  Target, 
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Zap,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import SEOHead from '../components/SEOHead';

const AboutUsPage = () => {
  const [activeSection, setActiveSection] = useState('mission');
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    schools: 0,
    countries: 0
  });

  useEffect(() => {
    // Animate counter numbers
    const finalStats = {
      students: 50000,
      teachers: 2500,
      schools: 500,
      countries: 25
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const counters = [
      { key: 'students', target: finalStats.students },
      { key: 'teachers', target: finalStats.teachers },
      { key: 'schools', target: finalStats.schools },
      { key: 'countries', target: finalStats.countries }
    ];

    counters.forEach(({ key, target }) => {
      let current = 0;
      const increment = target / steps;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, stepDuration);
    });
  }, []);

  const sections = [
    { id: 'mission', label: 'Our Mission', icon: Target },
    { id: 'vision', label: 'Our Vision', icon: Globe },
    { id: 'values', label: 'Our Values', icon: Heart },
    { id: 'team', label: 'Our Team', icon: Users },
    { id: 'achievements', label: 'Achievements', icon: Award }
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Learning',
      description: 'Complete educational ecosystem covering all aspects of modern learning'
    },
    {
      icon: Zap,
      title: 'AI-Powered Insights',
      description: 'Advanced analytics and personalized recommendations for better outcomes'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security ensuring data protection and privacy'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock assistance to ensure smooth educational experience'
    }
  ];

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/api/placeholder/300/300',
      bio: 'Former education director with 15+ years experience in transforming learning experiences.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '/api/placeholder/300/300',
      bio: 'Tech innovator specializing in educational technology and AI-driven learning platforms.',
      social: { linkedin: '#', github: '#' }
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Head of Education',
      image: '/api/placeholder/300/300',
      bio: 'Educational psychologist and curriculum specialist with expertise in modern pedagogy.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'David Thompson',
      role: 'Head of Design',
      image: '/api/placeholder/300/300',
      bio: 'UX/UI expert passionate about creating intuitive and accessible educational interfaces.',
      social: { linkedin: '#', dribbble: '#' }
    }
  ];

  const achievements = [
    {
      year: '2024',
      title: 'Best EdTech Platform Award',
      description: 'Recognized as the leading educational technology platform by Global EdTech Awards'
    },
    {
      year: '2023',
      title: '1 Million Users Milestone',
      description: 'Reached over 1 million active users across 25 countries worldwide'
    },
    {
      year: '2022',
      title: 'Innovation Excellence',
      description: 'Awarded for groundbreaking AI integration in educational assessment'
    },
    {
      year: '2021',
      title: 'Founded EduCloud',
      description: 'Started our journey to revolutionize education through technology'
    }
  ];

  const values = [
    {
      icon: BookOpen,
      title: 'Education First',
      description: 'Every decision we make is guided by what\'s best for learners and educators.'
    },
    {
      icon: Users,
      title: 'Inclusive Access',
      description: 'We believe quality education should be accessible to everyone, everywhere.'
    },
    {
      icon: Sparkles,
      title: 'Innovation',
      description: 'We continuously innovate to create better learning experiences.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We protect user data and privacy with the highest security standards.'
    },
    {
      icon: Heart,
      title: 'Community',
      description: 'We foster a supportive community of learners, teachers, and families.'
    },
    {
      icon: TrendingUp,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, always improving.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SEOHead 
        title="About Us - EduCloud"
        description="Learn about EduCloud's mission to revolutionize education through technology. Discover our story, team, and commitment to transforming learning experiences."
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transforming Education
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Through Innovation
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              We're on a mission to make quality education accessible, engaging, and effective for everyone, everywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Play size={20} />
                  <span>Watch Our Story</span>
                </div>
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-2">
                  <ArrowRight size={20} />
                  <span>Join Our Mission</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400 bg-opacity-10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                {stats.students.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                {stats.teachers.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Educators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
                {stats.schools.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Schools</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                {stats.countries}+
              </div>
              <div className="text-gray-600 font-medium">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EduCloud?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge technology with proven educational methodologies to create
              the most comprehensive learning platform available today.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <IconComponent className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center mb-12 border-b border-gray-200">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 border-b-2 ${
                    activeSection === section.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <IconComponent size={20} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mission */}
          {activeSection === 'mission' && (
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Target className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                To democratize access to quality education by creating innovative, inclusive, and 
                effective learning experiences that empower students, educators, and institutions 
                to achieve their full potential in an increasingly connected world.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <CheckCircle className="text-blue-600 mb-3" size={24} />
                  <h4 className="font-semibold text-gray-900 mb-2">Accessibility</h4>
                  <p className="text-gray-600 text-sm">Making education available to all, regardless of location or background.</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl">
                  <CheckCircle className="text-purple-600 mb-3" size={24} />
                  <h4 className="font-semibold text-gray-900 mb-2">Innovation</h4>
                  <p className="text-gray-600 text-sm">Leveraging technology to create better learning experiences.</p>
                </div>
                <div className="bg-indigo-50 p-6 rounded-xl">
                  <CheckCircle className="text-indigo-600 mb-3" size={24} />
                  <h4 className="font-semibold text-gray-900 mb-2">Excellence</h4>
                  <p className="text-gray-600 text-sm">Delivering the highest quality educational tools and content.</p>
                </div>
              </div>
            </div>
          )}

          {/* Vision */}
          {activeSection === 'vision' && (
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <Globe className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h3>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                To become the world's leading educational platform that transforms how people learn, 
                teach, and connect, creating a global community where knowledge knows no boundaries 
                and every learner can thrive.
              </p>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl">
                <h4 className="text-2xl font-bold mb-4">2030 Goals</h4>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h5 className="font-semibold mb-2">🌍 Global Reach</h5>
                    <p>Serve 10 million learners across 100+ countries</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">🤖 AI Integration</h5>
                    <p>Personalized learning for every student</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">🎓 Outcomes</h5>
                    <p>Improve learning outcomes by 50%</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">🌱 Sustainability</h5>
                    <p>Carbon-neutral educational platform</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Values */}
          {activeSection === 'values' && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Heart className="text-white" size={40} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h3>
                <p className="text-xl text-gray-600">The principles that guide everything we do</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {values.map((value, index) => {
                  const IconComponent = value.icon;
                  return (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                        <IconComponent className="text-white" size={24} />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h4>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team */}
          {activeSection === 'team' && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Users className="text-white" size={40} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h3>
                <p className="text-xl text-gray-600">The passionate people behind EduCloud</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                      <User className="text-white" size={80} />
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h4>
                      <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {activeSection === 'achievements' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Award className="text-white" size={40} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Achievements</h3>
                <p className="text-xl text-gray-600">Milestones in our journey to transform education</p>
              </div>
              
              <div className="space-y-8">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-6 bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {achievement.year}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{achievement.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{achievement.description}</p>
                    </div>
                    <Star className="text-yellow-500 flex-shrink-0" size={24} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl text-blue-100">
              Ready to transform your educational experience? We'd love to hear from you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-blue-100">contact@educloud.com</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p className="text-blue-100">+1 (555) 123-4567</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
              <p className="text-blue-100">San Francisco, CA</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
