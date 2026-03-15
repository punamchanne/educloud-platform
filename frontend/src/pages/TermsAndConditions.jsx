import { FileText, Shield, Users, AlertTriangle, Mail, Phone, MapPin, ArrowRight, CheckCircle, Clock, Scale } from 'lucide-react';

const TermsAndConditions = () => {
  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: "By accessing and using EduCloud, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      icon: Users,
      title: "User Accounts",
      content: "Users are responsible for maintaining the confidentiality of their account credentials. You agree to notify us immediately of any unauthorized use of your account."
    },
    {
      icon: Shield,
      title: "Privacy & Data Protection",
      content: "We are committed to protecting your privacy and personal data. Our collection and use of personal information is governed by our Privacy Policy."
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Activities",
      content: "Users may not engage in activities that violate laws, infringe on intellectual property rights, or disrupt the service operations."
    }
  ];

  const terms = [
    {
      title: "1. Service Description",
      content: "EduCloud provides an AI-powered educational management platform that includes student management, exam administration, timetable scheduling, and communication tools."
    },
    {
      title: "2. User Eligibility",
      content: "The service is available to educational institutions, teachers, students, and parents. Users must be at least 13 years old to create an account."
    },
    {
      title: "3. Account Registration",
      content: "Users must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials."
    },
    {
      title: "4. Acceptable Use Policy",
      content: "Users agree to use the platform for lawful educational purposes only. Prohibited activities include harassment, sharing inappropriate content, or attempting to breach system security."
    },
    {
      title: "5. Intellectual Property",
      content: "All content, features, and functionality of EduCloud are owned by us and are protected by copyright, trademark, and other intellectual property laws."
    },
    {
      title: "6. Data Privacy",
      content: "We collect and process personal data in accordance with applicable data protection laws. Your data is used to provide and improve our services."
    },
    {
      title: "7. Service Availability",
      content: "While we strive for high availability, we do not guarantee uninterrupted access to our services. We reserve the right to perform maintenance and updates."
    },
    {
      title: "8. Termination",
      content: "We reserve the right to terminate or suspend accounts that violate these terms. Users may also terminate their accounts at any time."
    },
    {
      title: "9. Limitation of Liability",
      content: "EduCloud shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services."
    },
    {
      title: "10. Governing Law",
      content: "These terms are governed by the laws of the jurisdiction in which EduCloud operates, without regard to conflict of law principles."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-slate-200 shadow-sm">
            <Scale className="w-4 h-4 mr-2 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Legal & Compliance
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-slate-800 leading-tight">
            Terms &{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Conditions
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Please read these terms carefully before using EduCloud's educational platform.
            By using our services, you agree to be bound by these terms.
          </p>

          <div className="flex items-center justify-center text-slate-500 mb-8">
            <Clock className="w-5 h-5 mr-2" />
            <span>Last updated: October 8, 2025</span>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Key Points Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-800">
              Key{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Points
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Understanding our commitment to you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sections.map((section, index) => (
              <div key={index} className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-slate-100 hover:-translate-y-2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <section.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-blue-600 transition-colors">
                  {section.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Terms Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800">
              Detailed{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Terms
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Complete terms and conditions for using EduCloud
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {terms.map((term, index) => (
                <div key={index} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-slate-100 hover:-translate-y-1">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-2 flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-4 text-slate-800 group-hover:text-blue-600 transition-colors">
                        {term.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {term.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            Questions About Our Terms?
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed">
            We're here to help clarify any questions you may have about our terms and conditions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Mail className="h-8 w-8 text-white mx-auto mb-3" />
              <div className="text-lg font-bold text-white">Email Us</div>
              <div className="text-purple-100">legal@educloud.app</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Phone className="h-8 w-8 text-white mx-auto mb-3" />
              <div className="text-lg font-bold text-white">Call Us</div>
              <div className="text-purple-100">+1 (555) 123-4567</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <MapPin className="h-8 w-8 text-white mx-auto mb-3" />
              <div className="text-lg font-bold text-white">Visit Us</div>
              <div className="text-purple-100">123 Education St, EduCity</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-slate-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center">
              Contact Legal Team
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>

            <button className="px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300 font-bold text-lg">
              View Privacy Policy
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

export default TermsAndConditions;
