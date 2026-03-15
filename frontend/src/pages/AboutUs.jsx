import { Info, Target, Users, Award, Heart, Globe, TrendingUp, Star, ArrowRight, CheckCircle } from 'lucide-react';

const AboutUs = () => {
  const team = [
    {
      name: "Dr. Alex Carter",
      role: "Founder & CEO",
      description: "Leading innovation in educational technology with 15+ years of experience.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      name: "Prof. Maria Lee",
      role: "Chief Academic Officer",
      description: "Shaping AI-driven learning experiences and curriculum development.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      name: "James Patel",
      role: "CTO",
      description: "Building scalable and secure platforms for modern education.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Student-Centric",
      description: "Every feature designed with students' learning journey in mind."
    },
    {
      icon: TrendingUp,
      title: "Innovation First",
      description: "Constantly pushing boundaries with cutting-edge educational technology."
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Empowering educators and students worldwide with accessible tools."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to delivering the highest quality educational solutions."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Active Users", icon: Users },
    { number: "2M+", label: "Exams Created", icon: Award },
    { number: "98.5%", label: "Uptime", icon: TrendingUp },
    { number: "150+", label: "Countries", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-slate-200 shadow-sm">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Empowering Education Worldwide
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-slate-800 leading-tight">
            About{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              EduCloud
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-slate-600 max-w-4xl mx-auto leading-relaxed">
            We're revolutionizing education through innovative AI-driven solutions,
            creating seamless learning experiences for students, teachers, and administrators worldwide.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center">
              Join Our Mission
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="group px-8 py-4 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center text-slate-700">
              <Info className="w-5 h-5 mr-2 text-blue-600" />
              Learn More
            </button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon size={24} className="text-white" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800">
              Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mission & Vision
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Driving educational excellence through technology and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-slate-100 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 w-fit mb-6 group-hover:rotate-12 transition-transform duration-300">
                <Target size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-slate-800">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                To revolutionize education by providing accessible, AI-powered tools that enhance learning,
                streamline administration, and create engaging experiences for students worldwide.
              </p>
              <div className="flex items-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                Learn about our impact <ArrowRight className="w-5 h-5 ml-1" />
              </div>
            </div>

            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-slate-100 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 w-fit mb-6 group-hover:rotate-12 transition-transform duration-300">
                <Target size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-slate-800">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                To create a global platform where students, educators, and administrators collaborate
                effortlessly, breaking down barriers and unlocking the full potential of education.
              </p>
              <div className="flex items-center text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                See our roadmap <ArrowRight className="w-5 h-5 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800">
              Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Core Values
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-slate-100 hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 w-fit mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <value.icon size={28} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-blue-600 transition-colors">
                  {value.title}
                </h3>

                <p className="text-slate-600 leading-relaxed mb-6">
                  {value.description}
                </p>

                <div className="flex items-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  Learn more <ArrowRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800 flex items-center justify-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 mr-4">
                <Users size={32} className="text-white" />
              </div>
              Meet Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-2">
                Team
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Passionate educators and technologists working together to transform education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:-translate-y-2 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                <div className="p-8 text-center">
                  <div className={`bg-gradient-to-br ${member.gradient} rounded-2xl p-1 w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                  </div>

                  <h3 className="text-2xl font-bold mb-2 text-slate-800 group-hover:text-blue-600 transition-colors">
                    {member.name}
                  </h3>

                  <p className="text-blue-600 font-semibold mb-4">
                    {member.role}
                  </p>

                  <p className="text-slate-600 leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            Ready to Join Our Mission?
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed">
            Be part of the educational revolution. Join thousands of institutions transforming
            learning experiences with EduCloud.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-slate-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center">
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>

            <button className="px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300 font-bold text-lg">
              Contact Us
            </button>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </section>
    </div>
  );
};

export default AboutUs;
