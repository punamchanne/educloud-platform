import api from '../../services/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FileText, Download, BarChart3, TrendingUp, Award, Calendar } from 'lucide-react';

const StudentReports = () => {
  const [report, setReport] = useState('');
  const [userId, setUserId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(res.data.user._id);
      } catch (error) {
        toast.error('Failed to fetch user data');
        console.error('Error:', error.response?.data?.message || error.message);
      }
    };
    fetchUserId();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/reports/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(res.data.report);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Error:', error.response?.data?.message || error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([report], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'performance-report.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Report downloaded successfully');
  };

  const generateReportPDF = () => {
    if (!report) return;

    const printWindow = window.open('', '_blank');
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Student Performance Report</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: #ffffff;
            padding: 0;
          }
          
          .container {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
            min-height: 11in;
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.05) 10px,
              rgba(255,255,255,0.05) 20px
            );
            animation: slide 20s linear infinite;
          }
          
          @keyframes slide {
            0% { transform: translateX(-50px); }
            100% { transform: translateX(50px); }
          }
          
          .header-content {
            position: relative;
            z-index: 1;
          }
          
          .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .header p {
            font-size: 1.1rem;
            opacity: 0.9;
            font-weight: 400;
          }
          
          .report-info {
            padding: 30px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .info-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          
          .info-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }
          
          .info-value {
            font-size: 1rem;
            font-weight: 500;
            color: #1e293b;
          }
          
          .report-content {
            padding: 30px;
            background: white;
          }
          
          .content-header {
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .content-header h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 5px;
          }
          
          .content-header p {
            color: #64748b;
            font-size: 0.95rem;
          }
          
          .report-text {
            background: #f8fafc;
            border-radius: 8px;
            padding: 25px;
            border-left: 4px solid #3b82f6;
            line-height: 1.8;
            font-size: 0.95rem;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          
          .footer {
            padding: 25px 30px;
            background: #f8fafc;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 0.9rem;
          }
          
          .footer .timestamp {
            font-weight: 500;
            color: #3b82f6;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .container {
              box-shadow: none;
              border-radius: 0;
            }
            
            .header {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            .header::before {
              display: none;
            }
            
            .report-content {
              page-break-inside: avoid;
            }
            
            .footer {
              page-break-inside: avoid;
            }
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-content">
              <h1>EduCloud</h1>
              <p>Student Performance Report</p>
            </div>
          </div>
          
          <div class="report-info">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Report Type</div>
                <div class="info-value">Student Performance Analysis</div>
              </div>
              <div class="info-item">
                <div class="info-label">Student</div>
                <div class="info-value">Personal Report</div>
              </div>
              <div class="info-item">
                <div class="info-label">Generated On</div>
                <div class="info-value">${currentDate}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Academic Year</div>
                <div class="info-value">${new Date().getFullYear()}</div>
              </div>
            </div>
          </div>
          
          <div class="report-content">
            <div class="content-header">
              <h2>Personal Performance Report</h2>
              <p>Comprehensive analysis of your academic performance and progress</p>
            </div>
            
            <div class="report-text">${report}</div>
          </div>
          
          <div class="footer">
            <p>
              Report generated on <span class="timestamp">${currentDate}</span> • 
              EduCloud Educational Management System • 
              <strong>Confidential Document</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
    
    toast.success('Report PDF generated successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-slate-700">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-slate-200 shadow-sm">
            <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Performance Analytics
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-800 leading-tight">
            My{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Reports
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Track your academic progress, view detailed performance analytics, and download comprehensive reports.
          </p>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Generate Report Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg p-8 border border-slate-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-6">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-slate-800">
                  Generate Your{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Performance Report
                  </span>
                </h2>
                <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                  Get a comprehensive overview of your academic performance, including exam results, attendance, and progress metrics.
                </p>
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    isGenerating
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:scale-105'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5 mr-3" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Display Section */}
      {report && (
        <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Award className="w-6 h-6 text-white" />
                      <h2 className="text-2xl font-bold text-white">Performance Report</h2>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={generateReportPDF}
                        className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300"
                        title="Download as PDF"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        PDF
                      </button>
                      <button
                        onClick={handleDownloadReport}
                        className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300"
                        title="Download as Text"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Text
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="prose prose-slate max-w-none">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <pre className="whitespace-pre-wrap text-slate-700 font-medium leading-relaxed text-sm">
                        {report}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">Progress</p>
                          <p className="text-2xl font-bold text-blue-800">85%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                      <div className="flex items-center space-x-3">
                        <Award className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-emerald-700">Exams Passed</p>
                          <p className="text-2xl font-bold text-emerald-800">12</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-6 h-6 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-purple-700">Study Hours</p>
                          <p className="text-2xl font-bold text-purple-800">156</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentReports;
