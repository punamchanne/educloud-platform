import api from '../../services/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  ClipboardList, Plus, Brain, Edit, Trash2, 
  Search, Filter, Eye, Share, Download,
  BarChart3, PieChart, TrendingUp, Users,
  CheckCircle, AlertCircle, Clock, Target,
  Sparkles, MessageSquare, Star, ThumbsUp
} from 'lucide-react';

const SurveyGeneration = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [previewSurvey, setPreviewSurvey] = useState(null);

  const [generateForm, setGenerateForm] = useState({
    title: '',
    type: 'feedback',
    audience: 'students',
    topic: '',
    questions: '5',
    difficulty: 'medium',
    includeOpenEnded: true,
    requirements: ''
  });

  const surveyTypes = [
    { value: 'feedback', label: 'Course Feedback', icon: MessageSquare, color: 'blue' },
    { value: 'assessment', label: 'Self Assessment', icon: ClipboardList, color: 'green' },
    { value: 'satisfaction', label: 'Satisfaction', icon: Star, color: 'yellow' },
    { value: 'evaluation', label: 'Program Evaluation', icon: BarChart3, color: 'purple' }
  ];

  const audiences = ['students', 'teachers', 'parents', 'staff'];
  const statuses = ['draft', 'active', 'closed', 'analyzing'];

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call when backend endpoint is ready
      // const response = await api.get('/surveys');
      // setSurveys(response.data.surveys || []);
      setSurveys([]); // Empty state until backend is implemented
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setSurveys([]);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch surveys');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateSurvey = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/dashboard/surveys/generate',
        generateForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const newSurvey = {
        id: Date.now(),
        title: generateForm.title,
        type: generateForm.type,
        audience: generateForm.audience,
        status: 'draft',
        responses: 0,
        totalTargets: 0,
        createdAt: new Date().toISOString(),
        endDate: null,
        questions: response.data.questions || [
          { type: 'rating', question: 'Sample AI-generated question 1', required: true },
          { type: 'multiple', question: 'Sample AI-generated question 2', options: ['Option A', 'Option B', 'Option C'], required: true },
          { type: 'text', question: 'Sample AI-generated open-ended question', required: false }
        ],
        analytics: {
          completionRate: 0,
          averageRating: 0,
          satisfaction: 0
        }
      };

      setSurveys(prev => [newSurvey, ...prev]);
      setShowGenerateModal(false);
      setGenerateForm({
        title: '',
        type: 'feedback',
        audience: 'students',
        topic: '',
        questions: '5',
        difficulty: 'medium',
        includeOpenEnded: true,
        requirements: ''
      });
      
      toast.success('AI survey generated successfully!');
    } catch (error) {
      console.error('Error generating survey:', error);
      toast.error('Failed to generate survey');
    } finally {
      setGenerating(false);
    }
  };

  const getSurveyTypeInfo = (type) => {
    return surveyTypes.find(st => st.value === type) || surveyTypes[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'active': return 'green';
      case 'closed': return 'blue';
      case 'analyzing': return 'purple';
      default: return 'gray';
    }
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || survey.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || survey.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading Survey Generator...</p>
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
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  AI Survey Generation
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Create intelligent surveys and questionnaires with AI assistance
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Survey</span>
            </button>
          </div>
        </div>

        {/* Survey Type Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {surveyTypes.map((type) => {
            const count = surveys.filter(survey => survey.type === type.value).length;
            const avgCompletion = surveys
              .filter(survey => survey.type === type.value)
              .reduce((acc, s) => acc + s.analytics.completionRate, 0) / (count || 1);
              
            return (
              <div key={type.value} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${type.color}-100 dark:bg-${type.color}-900/20`}>
                    <type.icon className={`w-6 h-6 text-${type.color}-600`} />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">{count}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">{type.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Avg Completion: {Math.round(avgCompletion)}%
                </p>
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
                  placeholder="Search surveys..."
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
                {surveyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Surveys Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => {
            const typeInfo = getSurveyTypeInfo(survey.type);
            const statusColor = getStatusColor(survey.status);
            const completionPercentage = survey.totalTargets > 0 ? 
              Math.round((survey.responses / survey.totalTargets) * 100) : 0;
            
            return (
              <div key={survey.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 overflow-hidden hover:shadow-xl transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/20`}>
                      <typeInfo.icon className={`w-5 h-5 text-${typeInfo.color}-600`} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusColor}-100 text-${statusColor}-800 dark:bg-${statusColor}-900/20 dark:text-${statusColor}-400`}>
                        {survey.status === 'active' && <div className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1 animate-pulse" />}
                        {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 line-clamp-2">
                    {survey.title}
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Audience:</span>
                      <span className="font-medium text-slate-800 dark:text-white capitalize">
                        {survey.audience}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Responses:</span>
                      <span className="font-medium text-slate-800 dark:text-white">
                        {survey.responses}/{survey.totalTargets}
                      </span>
                    </div>
                    
                    {survey.totalTargets > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Progress:</span>
                          <span className="font-medium text-slate-800 dark:text-white">
                            {completionPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              completionPercentage < 50 ? 'bg-red-500' : 
                              completionPercentage < 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>Created {new Date(survey.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Analytics Preview */}
                  {survey.analytics && survey.status !== 'draft' && (
                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Completion</p>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {survey.analytics.completionRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Avg Rating</p>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {survey.analytics.averageRating}/5
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Satisfaction</p>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {survey.analytics.satisfaction}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${typeInfo.color}-100 text-${typeInfo.color}-800 dark:bg-${typeInfo.color}-900/20 dark:text-${typeInfo.color}-400`}>
                      {typeInfo.label}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPreviewSurvey(survey)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {survey.status !== 'draft' && (
                        <button
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          title="Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="Share"
                      >
                        <Share className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSurveys.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No surveys found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or generate a new survey</p>
          </div>
        )}

        {/* Generate Survey Modal */}
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
                      Generate AI Survey
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Survey Title
                  </label>
                  <input
                    type="text"
                    value={generateForm.title}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Mathematics Course Feedback Survey"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Survey Type
                    </label>
                    <select
                      value={generateForm.type}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    >
                      {surveyTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={generateForm.audience}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, audience: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    >
                      {audiences.map(audience => (
                        <option key={audience} value={audience}>
                          {audience.charAt(0).toUpperCase() + audience.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Survey Topic/Subject
                  </label>
                  <input
                    type="text"
                    value={generateForm.topic}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Mathematics, Teaching Methods, Course Content"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Number of Questions
                    </label>
                    <select
                      value={generateForm.questions}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, questions: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="3">3 Questions</option>
                      <option value="5">5 Questions</option>
                      <option value="8">8 Questions</option>
                      <option value="10">10 Questions</option>
                      <option value="15">15 Questions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={generateForm.difficulty}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="simple">Simple</option>
                      <option value="medium">Medium</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={generateForm.includeOpenEnded}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, includeOpenEnded: e.target.checked }))}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Include open-ended questions</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Additional Requirements (Optional)
                  </label>
                  <textarea
                    value={generateForm.requirements}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder="Specific questions to include, focus areas, constraints..."
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
                    onClick={generateSurvey}
                    disabled={generating || !generateForm.title || !generateForm.topic}
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
                        <span>Generate Survey</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Survey Modal */}
        {previewSurvey && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                    {previewSurvey.title}
                  </h2>
                  <button
                    onClick={() => setPreviewSurvey(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {previewSurvey.questions.map((question, index) => (
                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-slate-800 dark:text-white">
                          {index + 1}. {question.question}
                        </h3>
                        {question.required && (
                          <span className="text-red-500 text-sm">*</span>
                        )}
                      </div>
                      
                      {question.type === 'rating' && (
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <div key={rating} className="w-8 h-8 border-2 border-slate-300 dark:border-slate-500 rounded-full flex items-center justify-center text-sm">
                              {rating}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'multiple' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <label key={optIndex} className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded" disabled />
                              <span className="text-slate-600 dark:text-slate-400">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'text' && (
                        <textarea 
                          className="w-full p-3 border border-slate-300 dark:border-slate-500 rounded-lg resize-none"
                          rows={3}
                          placeholder="Your response..."
                          disabled
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyGeneration;
