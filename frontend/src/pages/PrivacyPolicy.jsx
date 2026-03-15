import { Shield, Eye, Lock, Database, Users, AlertTriangle, Mail, Phone, MapPin, ArrowRight, CheckCircle, FileText, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  const privacyPrinciples = [
    {
      icon: Shield,
      title: "Data Protection",
      content: "We implement robust security measures to protect your personal information from unauthorized access, alteration, or disclosure."
    },
    {
      icon: Eye,
      title: "Transparency",
      content: "We are committed to being transparent about how we collect, use, and share your personal information."
    },
    {
      icon: Lock,
      title: "Your Control",
      content: "You have control over your personal data, including the ability to access, update, and delete your information."
    },
    {
      icon: Database,
      title: "Data Minimization",
      content: "We only collect the minimum amount of personal information necessary to provide our educational services."
    }
  ];

  const dataCategories = [
    {
      title: "Personal Information",
      items: ["Full name", "Email address", "Phone number", "Date of birth", "Profile picture"],
      purpose: "To create and manage user accounts, provide personalized services, and communicate with users."
    },
    {
      title: "Educational Data",
      items: ["Academic records", "Exam results", "Attendance data", "Timetable information", "Performance analytics"],
      purpose: "To provide educational services, track progress, and generate reports for students, teachers, and parents."
    },
    {
      title: "Usage Data",
      items: ["Login times", "Page views", "Feature usage", "Device information", "IP addresses"],
      purpose: "To improve our services, ensure security, and provide technical support."
    },
    {
      title: "Communication Data",
      items: ["Messages", "Notifications", "Feedback", "Support tickets"],
      purpose: "To facilitate communication between users and provide customer support."
    }
  ];

  const rights = [
    {
      title: "Right to Access",
      description: "You have the right to request access to your personal data that we hold."
    },
    {
      title: "Right to Rectification",
      description: "You can request correction of inaccurate or incomplete personal data."
    },
    {
      title: "Right to Erasure",
      description: "You can request deletion of your personal data in certain circumstances."
    },
    {
      title: "Right to Data Portability",
      description: "You can request a copy of your data in a structured, machine-readable format."
    },
    {
      title: "Right to Object",
      description: "You can object to processing of your personal data for certain purposes."
    },
    {
      title: "Right to Withdraw Consent",
      description: "You can withdraw consent for data processing at any time."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-slate-200 shadow-sm">
            <Shield className="w-4 h-4 mr-2 text-green-600" />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Privacy & Security
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-slate-800 leading-tight">
            Privacy{' '}
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, use, and protect
            your personal information when you use EduCloud's educational platform.
          </p>

          <div className="flex items-center justify-center text-slate-500 mb-8">
            <FileText className="w-5 h-5 mr-2" />
            <span>Last updated: October 8, 2025</span>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Privacy Principles Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-800">
              Our Privacy{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Principles
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              How we protect and respect your data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {privacyPrinciples.map((principle, index) => (
              <div key={index} className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-slate-100 hover:-translate-y-2">
                <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <principle.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-green-600 transition-colors">
                  {principle.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {principle.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Collection Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800">
              Information We{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Collect
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Types of data we collect and how we use it
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {dataCategories.map((category, index) => (
                <div key={index} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-slate-100 hover:-translate-y-1">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-3 flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Database size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-slate-800 group-hover:text-green-600 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed mb-4">
                        {category.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4">
                    <h4 className="font-semibold text-slate-700 mb-3">Specific Data Points:</h4>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center text-slate-600">
                          <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Rights Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800">
              Your{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Rights
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              You have control over your personal data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rights.map((right, index) => (
              <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-slate-100 hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-3 w-fit mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Users size={28} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-green-600 transition-colors">
                  {right.title}
                </h3>

                <p className="text-slate-600 leading-relaxed mb-6">
                  {right.description}
                </p>

                <div className="flex items-center text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  Learn more <ArrowRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800">
              Data{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Security
              </span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed mb-12">
              We implement comprehensive security measures to protect your data
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-slate-100 hover:-translate-y-2 text-center">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-4 w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Lock size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-green-600 transition-colors">
                Encryption
              </h3>
              <p className="text-slate-600 leading-relaxed">
                All data is encrypted in transit and at rest using industry-standard encryption protocols.
              </p>
            </div>

            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-slate-100 hover:-translate-y-2 text-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-blue-600 transition-colors">
                Access Controls
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Strict access controls ensure only authorized personnel can access sensitive data.
              </p>
            </div>

            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-slate-100 hover:-translate-y-2 text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Globe size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-purple-600 transition-colors">
                Compliance
              </h3>
              <p className="text-slate-600 leading-relaxed">
                We comply with international data protection regulations and industry standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            Questions About Privacy?
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed">
            Our privacy team is here to help you understand how we protect your data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Mail className="h-8 w-8 text-white mx-auto mb-3" />
              <div className="text-lg font-bold text-white">Email Us</div>
              <div className="text-green-100">privacy@educloud.app</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Phone className="h-8 w-8 text-white mx-auto mb-3" />
              <div className="text-lg font-bold text-white">Call Us</div>
              <div className="text-green-100">+1 (555) 123-4567</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <MapPin className="h-8 w-8 text-white mx-auto mb-3" />
              <div className="text-lg font-bold text-white">Visit Us</div>
              <div className="text-green-100">123 Education St, EduCity</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="px-10 py-5 bg-white text-green-600 rounded-xl hover:bg-slate-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center">
              Contact Privacy Team
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>

            <button className="px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300 font-bold text-lg">
              View Terms & Conditions
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

export default PrivacyPolicy;
