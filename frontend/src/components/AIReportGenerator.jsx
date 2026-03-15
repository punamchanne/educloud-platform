import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Brain, FileText, Download, Loader } from 'lucide-react';

const AIReportGenerator = ({ userId, reportType = 'performance', className = '' }) => {
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await api.get(`/reports/user/${userId}`);
      setReport(response.data.report);
      toast.success('AI Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate AI report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report) {
      toast.error('No report to download');
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([report], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ai-${reportType}-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Report downloaded successfully');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Brain className="w-6 h-6 text-purple-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">AI Report Generator</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Generate an AI-powered performance report based on your academic data and activities.
      </p>

      <div className="space-y-4">
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Generate AI Report
            </>
          )}
        </button>

        {report && (
          <>
            <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="flex items-center mb-2">
                <FileText className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Generated Report</span>
              </div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {report}
              </pre>
            </div>
            
            <button
              onClick={handleDownloadReport}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AIReportGenerator;
