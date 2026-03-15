import api from '../../services/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  FileText, Download, Share, Edit, Trash2, Plus, 
  BookOpen, GraduationCap, Calculator, Search,
  Filter, Calendar, Clock, CheckCircle, AlertCircle,
  Sparkles, Brain, Copy, Eye, RefreshCw
} from 'lucide-react';

const DocumentConsole = () => {
  const [documents, setDocuments] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const documentTypes = [
    { value: 'lesson_plan', label: 'Lesson Plans', icon: BookOpen, color: 'blue' },
    { value: 'assignment', label: 'Assignments', icon: Edit, color: 'green' },
    { value: 'study_guide', label: 'Study Guides', icon: GraduationCap, color: 'purple' },
    { value: 'quiz', label: 'Quizzes', icon: Calculator, color: 'orange' }
  ];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
    'History', 'Geography', 'Computer Science', 'Economics'
  ];

  const [generateForm, setGenerateForm] = useState({
    type: 'lesson_plan',
    subject: 'Mathematics',
    topic: '',
    gradeLevel: '10',
    duration: '60',
    requirements: ''
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await api.get('/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Transform backend data to match frontend format
        const transformedDocuments = response.data.documents.map(doc => ({
          id: doc._id,
          title: doc.title,
          type: doc.type,
          subject: doc.subject,
          gradeLevel: doc.gradeLevel,
          createdAt: doc.createdAt,
          status: doc.status,
          content: doc.content,
          duration: doc.duration ? `${doc.duration} minutes` : 'Not specified',
          topic: doc.topic
        }));
        setDocuments(transformedDocuments);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      // If there's an error (like no documents yet), show empty state
      setDocuments([]);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch documents');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateDocument = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/documents/generate',
        generateForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Add the new document to the list
        const newDoc = response.data.document;
        const transformedDocument = {
          id: newDoc.id,
          title: newDoc.title,
          type: newDoc.type,
          subject: newDoc.subject,
          gradeLevel: newDoc.gradeLevel,
          createdAt: newDoc.createdAt,
          status: newDoc.status,
          content: newDoc.content,
          duration: newDoc.duration ? `${newDoc.duration} minutes` : 'Not specified',
          topic: newDoc.topic
        };

        setDocuments(prev => [transformedDocument, ...prev]);
        setShowGenerateModal(false);
        setGenerateForm({
          type: 'lesson_plan',
          subject: 'Mathematics',
          topic: '',
          gradeLevel: '10',
          duration: '60',
          requirements: ''
        });
        
        toast.success('Document generated successfully!');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error(error.response?.data?.message || 'Failed to generate document');
    } finally {
      setGenerating(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;
    
    return matchesSearch && matchesType && matchesSubject;
  });

  const getDocumentTypeInfo = (type) => {
    return documentTypes.find(dt => dt.value === type) || documentTypes[0];
  };

  const handleDownload = async (document) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:5000/api/documents/${document.id}/download`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Create and download the document
        const blob = new Blob([response.data.document.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${response.data.document.title}.txt`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Document downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handlePreview = async (document) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5000/api/documents/${document.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPreviewDocument(response.data.document);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to load document preview');
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `http://localhost:5000/api/documents/${documentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Document deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading Document Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  AI Document Console
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Generate and manage educational documents with AI assistance
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Document</span>
            </button>
          </div>
        </div>

        {/* Document Type Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {documentTypes.map((type) => {
            const count = documents.filter(doc => doc.type === type.value).length;
            return (
              <div key={type.value} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{type.label}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{count}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${type.color}-100 dark:bg-${type.color}-900/20`}>
                    <type.icon className={`w-6 h-6 text-${type.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="all">All Types</option>
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => {
            const typeInfo = getDocumentTypeInfo(document.type);
            return (
              <div key={document.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 overflow-hidden hover:shadow-xl transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/20`}>
                      <typeInfo.icon className={`w-5 h-5 text-${typeInfo.color}-600`} />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreview(document)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(document)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="Share"
                      >
                        <Share className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(document.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                    {document.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{document.subject}</span>
                      <span>•</span>
                      <span>Grade {document.gradeLevel}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{document.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      document.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      {document.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${typeInfo.color}-100 text-${typeInfo.color}-800 dark:bg-${typeInfo.color}-900/20 dark:text-${typeInfo.color}-400`}>
                      {typeInfo.label.slice(0, -1)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No documents found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters, or generate a new document</p>
          </div>
        )}

        {/* Generate Document Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                      Generate AI Document
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Document Type
                    </label>
                    <select
                      value={generateForm.type}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    >
                      {documentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Subject
                    </label>
                    <select
                      value={generateForm.subject}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    >
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Topic/Title
                  </label>
                  <input
                    type="text"
                    value={generateForm.topic}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Linear Equations, Photosynthesis, World War II"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Grade Level
                    </label>
                    <select
                      value={generateForm.gradeLevel}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, gradeLevel: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                        <option key={grade} value={grade.toString()}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={generateForm.duration}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, duration: e.target.value }))}
                      min="15"
                      max="180"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Additional Requirements (Optional)
                  </label>
                  <textarea
                    value={generateForm.requirements}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder="Any specific requirements, learning objectives, or constraints..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateDocument}
                    disabled={generating || !generateForm.topic}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewDocument && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                    {previewDocument.title}
                  </h2>
                  <button
                    onClick={() => setPreviewDocument(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{previewDocument.content}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentConsole;
