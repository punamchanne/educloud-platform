import api from './services/api';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from './components/Header';
import Footer from './components/Footer';
import SEOHead from './components/SEOHead';
import StudentSidebar from './components/StudentSidebar';
import AdminSidebar from './pages/Admin/AdminSidebar';
import TeacherSidebar from './components/TeacherSidebar';
import ParentSidebar from './components/ParentSidebar';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Notifications from './pages/Notifications';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Dashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import ExamManagement from './pages/Admin/ExamManagement';
import TimetableManagement from './pages/Admin/TimetableManagement';
import ReportManagement from './pages/Admin/ReportManagement';
import NotificationManagement from './pages/Admin/NotificationManagement';
import AIDashboard from './pages/Admin/AIDashboard';
import DocumentConsole from './pages/Admin/DocumentConsole';
import MeetingManagement from './pages/Admin/MeetingManagement';
import SmartTimetable from './pages/Admin/SmartTimetable';
import SmartTimetableGenerator from './pages/Admin/SmartTimetableGenerator';
import SurveyGeneration from './pages/Admin/SurveyGeneration';
import ContactManagement from './pages/Admin/ContactManagement';
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentExams from './pages/Student/StudentExams';
import ChatbotEnhanced from './components/ChatbotEnhanced';
import StudentTimetable from './pages/Student/StudentTimetable';
import StudentReports from './pages/Student/StudentReports';
import StudentNotifications from './pages/Student/StudentNotifications';
import StudentMeetings from './pages/Student/StudentMeetings';
import StudentDocuments from './pages/Student/StudentDocuments';
import TakeExam from './pages/Student/TakeExam';
import ExamResults from './pages/Student/ExamResults';
import MeetingDetails from './pages/Student/MeetingDetails';
import DocumentDetails from './pages/Student/DocumentDetails';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import TeacherClasses from './pages/Teacher/TeacherClasses';
import ParentDashboard from './pages/Parent/ParentDashboard';
import ParentChildren from './pages/Parent/ParentChildren';
import ChildMonitoring from './pages/Parent/ChildMonitoring';
import ParentReports from './pages/Parent/ParentReports';
import ParentAttendance from './pages/Parent/ParentAttendance';
import ContactTeacher from './pages/Parent/ContactTeacher';
import ParentNotifications from './pages/Parent/ParentNotifications';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Dynamic Forms Components
import DynamicFormBuilder from './pages/DynamicForm/DynamicFormBuilder';
import DynamicFormsList from './pages/DynamicForm/DynamicFormsList';
import DynamicFormDisplay from './pages/DynamicForm/DynamicFormDisplay';
import EditForm from './pages/DynamicForm/EditForm';
import FormSubmissions from './pages/DynamicForm/FormSubmissions';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthorized(false);
          return;
        }
        const res = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Check if user has required role
        const userRole = res.data.user.role;
        const allowedRoles = ['admin', 'teacher', 'parent', 'student'];

        if (requiredRole) {
          setIsAuthorized(userRole === requiredRole);
        } else {
          // If no specific role required, allow any authenticated user
          setIsAuthorized(allowedRoles.includes(userRole));
        }
      } catch {
        setIsAuthorized(false);
        toast.error('Access denied');
      }
    };
    checkAccess();
  }, [requiredRole]);

  if (isAuthorized === null) return <div className="text-center text-2xl font-semibold mt-16 text-gray-900 dark:text-white">Loading...</div>;
  return isAuthorized ? children : <Navigate to="/login" />;
};

const StudentLayout = ({ children, sidebarOpen, toggleSidebar }) => (
  <div className="flex min-h-screen">
    <StudentSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? '' : ''}`}>
      {children}
    </div>
  </div>
);

const AdminLayout = ({ children, sidebarOpen, toggleSidebar }) => (
  <div className="flex min-h-screen">
    <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? '' : ''}`}>
      {children}
    </div>
  </div>
);

const TeacherLayout = ({ children, sidebarOpen, toggleSidebar }) => (
  <div className="flex min-h-screen">
    <TeacherSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? '' : ''}`}>
      {children}
    </div>
  </div>
);

const ParentLayout = ({ children, sidebarOpen, toggleSidebar }) => (
  <div className="flex min-h-screen">
    <ParentSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? '' : ''}`}>
      {children}
    </div>
  </div>
);

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main className="flex-1 mt-16">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SEOHead
                  title="EduCloud - AI-Powered Educational Management System"
                  description="Transform education with EduCloud's AI-powered platform. Manage students, teachers, exams, timetables, and reports with advanced analytics and secure cloud infrastructure."
                  keywords="education, school management, student portal, teacher dashboard, exam management, timetable, educational analytics, AI education"
                  url="https://educloud.app"
                />
                <HomePage />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <SEOHead
                  title="Login - EduCloud Educational Platform"
                  description="Secure login to EduCloud's educational management system. Access your personalized dashboard for students, teachers, and administrators."
                  keywords="login, education login, school portal login, student login, teacher login"
                  url="https://educloud.app/login"
                />
                <Login />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <SEOHead
                  title="Register - Join EduCloud Educational Platform"
                  description="Create your account on EduCloud's AI-powered educational management system. Join thousands of educators and students transforming education."
                  keywords="register, education registration, school portal registration, student registration, teacher registration"
                  url="https://educloud.app/register"
                />
                <Register />
              </>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <>
                <SEOHead
                  title="Forgot Password - EduCloud Support"
                  description="Recover your EduCloud account password. Enter your email to receive a password reset link."
                  keywords="forgot password, recover account, password reset, EduCloud support"
                  url="https://educloud.app/forgot-password"
                />
                <ForgotPassword />
              </>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <>
                <SEOHead
                  title="Reset Password - EduCloud Security"
                  description="Create a new password for your EduCloud account. Secure your access with a strong password."
                  keywords="reset password, new password, account security, EduCloud"
                  url="https://educloud.app/reset-password"
                />
                <ResetPassword />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <SEOHead
                  title="About Us - EduCloud Educational Technology"
                  description="Learn about EduCloud's mission to revolutionize education through AI-powered tools, advanced analytics, and secure cloud infrastructure for modern schools."
                  keywords="about education, educational technology, AI education, school management system, educational innovation"
                  url="https://educloud.app/about"
                />
                <AboutUs />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <SEOHead
                  title="Contact Us - EduCloud Support"
                  description="Get in touch with EduCloud's support team. We're here to help you implement and optimize your educational management system."
                  keywords="contact education, school support, educational technology support, EduCloud help"
                  url="https://educloud.app/contact"
                />
                <ContactUs />
              </>
            }
          />
          <Route
            path="/terms"
            element={
              <>
                <SEOHead
                  title="Terms & Conditions - EduCloud Legal"
                  description="Read EduCloud's terms and conditions for using our AI-powered educational management platform. Understand your rights and responsibilities."
                  keywords="terms conditions, legal, EduCloud terms, educational platform terms"
                  url="https://educloud.app/terms"
                />
                <TermsAndConditions />
              </>
            }
          />
          <Route
            path="/privacy"
            element={
              <>
                <SEOHead
                  title="Privacy Policy - EduCloud Data Protection"
                  description="Learn how EduCloud protects your privacy and personal data. Our comprehensive privacy policy explains data collection, usage, and security measures."
                  keywords="privacy policy, data protection, EduCloud privacy, personal data, GDPR compliance"
                  url="https://educloud.app/privacy"
                />
                <PrivacyPolicy />
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <>
                  <SEOHead
                    title="Profile - EduCloud User Dashboard"
                    description="Manage your EduCloud profile, view exam history, track progress, and update your personal information in our secure educational platform."
                    keywords="profile, user dashboard, exam history, student profile, teacher profile, educational progress"
                    url="https://educloud.app/profile"
                  />
                  <Profile />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <>
                  <SEOHead
                    title="Student Dashboard - EduCloud"
                    description="Access your personalized student dashboard on EduCloud. View exams, check timetables, review reports, and track your educational progress."
                    keywords="student dashboard, exam portal, student timetable, academic reports, educational progress"
                    url="https://educloud.app/student"
                  />
                  <StudentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                    <StudentDashboard />
                  </StudentLayout>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exams"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <StudentExams />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <StudentTimetable />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/reports"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <StudentReports />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <StudentNotifications />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/meetings"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <StudentMeetings />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/documents"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <StudentDocuments />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/meetings/:id"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <MeetingDetails />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/documents/:id"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <DocumentDetails />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam/:id"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <TakeExam />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam/:id/results"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ExamResults />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <>
                  <SEOHead
                    title="Admin Dashboard - EduCloud Management"
                    description="Comprehensive admin dashboard for EduCloud. Manage users, exams, timetables, reports, and system notifications with advanced analytics."
                    keywords="admin dashboard, school management, user management, system administration, educational analytics"
                    url="https://educloud.app/admin"
                  />
                  <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                    <Dashboard />
                  </AdminLayout>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <UserManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exams"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ExamManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/timetables"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <SmartTimetableGenerator />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ReportManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <NotificationManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contacts"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ContactManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ai-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <AIDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/document-console"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <DocumentConsole />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/meeting-management"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <MeetingManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <DocumentConsole />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/meetings"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <MeetingManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/smart-timetable"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <SmartTimetableGenerator />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/survey-generation"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <SurveyGeneration />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/forms"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <DynamicFormsList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/forms/create"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <DynamicFormBuilder />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/forms/:formId/edit"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <EditForm />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/forms/:formId/submissions"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <FormSubmissions />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/:id"
            element={<DynamicFormDisplay />}
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <TeacherDashboard />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/classes"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <TeacherClasses />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <TeacherClasses />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/attendance"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <TeacherClasses />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/exams"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ExamManagement />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/schedule"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <SmartTimetable />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/reports"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ReportManagement />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/notifications"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <NotificationManagement />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/settings"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <Settings />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/document-console"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <DocumentConsole />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/meeting-management"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <MeetingManagement />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/smart-timetable"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <SmartTimetable />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/forms"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <DynamicFormsList />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/forms/create"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <DynamicFormBuilder />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/forms/:formId/edit"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <EditForm />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/forms/:formId/submissions"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <FormSubmissions />
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ParentDashboard />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/children"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ParentChildren />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/attendance"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ParentAttendance />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/performance"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ChildMonitoring />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/reports"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ParentReports />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/contact"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ContactTeacher />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/notifications"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <ParentNotifications />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/settings"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                  <Settings />
                </ParentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      
      {/* AI Chatbot - Available on all pages */}
      <ChatbotEnhanced />
    </div>
  );
};

export default App;
