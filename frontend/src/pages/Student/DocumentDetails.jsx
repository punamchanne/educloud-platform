import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import {
  FileText,
  Download,
  Eye,
  ArrowLeft,
  Calendar,
  User,
  Tag,
  FileType,
  Share,
  Printer,
  Bookmark,
  Star,
  Heart,
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  Clock,
  FileIcon,
  Image,
  Video,
  Music,
  Archive,
  Code,
  Database,
  Globe,
  MessageSquare,
  ThumbsUp,
  Flag,
  MoreVertical,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Send,
  Mail,
  Link as LinkIcon,
  RefreshCw,
  Check,
  X
} from 'lucide-react';

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewRotation, setPreviewRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/documents/${id}`);
        setDocument(response.data.document);
      } catch (error) {
        console.error('Error fetching document details:', error);
        toast.error('Failed to load document details');
        navigate('/student/documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id, navigate]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      if (document.fileUrl) {
        const link = document.createElement('a');
        link.href = document.fileUrl;
        link.download = document.title || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
      } else {
        toast.error('Download link not available');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = () => {
    if (document.content || document.fileUrl) {
      setShowPreview(true);
    } else {
      toast.error('Preview not available');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed' : 'Document bookmarked');
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Document link copied to clipboard');
    setShowShareModal(false);
  };

  const handleZoomIn = () => {
    setPreviewZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setPreviewZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setPreviewRotation(prev => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        author: 'Current User',
        timestamp: new Date(),
        likes: 0
      };
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Comment added');
    }
  };

  const getDocumentTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'lesson_plan':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'assignment':
        return <Edit className="w-6 h-6 text-green-600" />;
      case 'quiz':
        return <FileText className="w-6 h-6 text-purple-600" />;
      case 'study_guide':
        return <FileText className="w-6 h-6 text-orange-600" />;
      case 'worksheet':
        return <FileText className="w-6 h-6 text-pink-600" />;
      case 'assessment':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'image':
        return <Image className="w-6 h-6 text-blue-600" />;
      case 'video':
        return <Video className="w-6 h-6 text-red-600" />;
      case 'audio':
        return <Music className="w-6 h-6 text-green-600" />;
      case 'archive':
        return <Archive className="w-6 h-6 text-yellow-600" />;
      case 'code':
        return <Code className="w-6 h-6 text-purple-600" />;
      case 'database':
        return <Database className="w-6 h-6 text-indigo-600" />;
      case 'web':
        return <Globe className="w-6 h-6 text-blue-600" />;
      default:
        return <FileIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const getDocumentTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'lesson_plan':
        return 'bg-blue-100 text-blue-800';
      case 'assignment':
        return 'bg-green-100 text-green-800';
      case 'quiz':
        return 'bg-purple-100 text-purple-800';
      case 'study_guide':
        return 'bg-orange-100 text-orange-800';
      case 'worksheet':
        return 'bg-pink-100 text-pink-800';
      case 'assessment':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Document Not Found</h2>
          <Link 
            to="/student/documents" 
            className="text-blue-600 hover:text-blue-500"
          >
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/documents')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Documents
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start space-x-4 mb-4 lg:mb-0">
              {getDocumentTypeIcon(document.type)}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{document.title}</h1>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDocumentTypeColor(document.type)}`}>
                    <Tag className="w-4 h-4 mr-1" />
                    {document.type || 'Document'}
                  </span>
                  {document.subject && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {document.subject}
                    </span>
                  )}
                  {document.gradeLevel && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Grade {document.gradeLevel}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg border transition-colors ${
                  isBookmarked 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-600' 
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark document'}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-lg border transition-colors ${
                  isFavorited 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                title="Share document"
              >
                <Share className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-5 h-5 mr-1" />
                <span className="text-sm">{comments.length}</span>
              </button>
              
              <div className="relative">
                <button className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Information</h2>
              
              <div className="space-y-4">
                {document.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Description</p>
                    <p className="text-sm text-gray-600">{document.description}</p>
                  </div>
                )}

                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Generated Date</p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(document.createdAt)}
                    </p>
                  </div>
                </div>

                {document.generatedBy && (
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Generated By</p>
                      <p className="text-sm text-gray-600">
                        {document.generatedBy.username || document.generatedBy.email}
                      </p>
                    </div>
                  </div>
                )}

                {document.subject && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Subject</p>
                    <p className="text-sm text-gray-600">{document.subject}</p>
                  </div>
                )}

                {document.fileSize && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">File Size</p>
                    <p className="text-sm text-gray-600">
                      {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Content Preview */}
            {document.content && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Preview</h3>
                <div className="prose max-w-none">
                  <div 
                    className="text-sm text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: document.content.substring(0, 1000) + (document.content.length > 1000 ? '...' : '') 
                    }}
                  />
                  {document.content.length > 1000 && (
                    <button
                      onClick={handlePreview}
                      className="mt-4 text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      View Full Content
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Actions Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handlePreview}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Document
                </button>

                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {downloading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    <span className="text-sm">Print</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    <span className="text-sm">Copy</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: document.title,
                        text: document.description,
                        url: window.location.href
                      });
                    } else {
                      handleShare();
                    }
                  }}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Share Document
                </button>
              </div>
            </div>

            {/* Document Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Info</h3>
              <div className="space-y-3">
                {document.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Duration
                    </span>
                    <span className="text-sm font-medium text-gray-900">{document.duration} min</span>
                  </div>
                )}
                {document.metadata?.wordCount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Word Count</span>
                    <span className="text-sm font-medium text-gray-900">{document.metadata.wordCount}</span>
                  </div>
                )}
                {document.metadata?.estimatedReadingTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reading Time</span>
                    <span className="text-sm font-medium text-gray-900">{document.metadata.estimatedReadingTime} min</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    document.status === 'completed' ? 'bg-green-100 text-green-800' :
                    document.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {document.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Views
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {document.usage?.views || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Downloads
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {document.usage?.downloads || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Share className="w-4 h-4 mr-2" />
                    Shares
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {document.usage?.shares || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Updated
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(document.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
                
                {/* Add Comment */}
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="3"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-l-2 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500">
                            {comment.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.text}</p>
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center text-gray-500 hover:text-blue-600">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            <span className="text-sm">{comment.likes}</span>
                          </button>
                          <button className="text-gray-500 hover:text-red-600">
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Preview Modal */}
        {showPreview && (
          <div className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
            <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full rounded-none' : 'max-w-4xl w-full max-h-[90vh]'} overflow-hidden`}>
              {/* Preview Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">{previewZoom}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Rotate"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="flex-1 overflow-auto p-6" style={{ height: isFullscreen ? 'calc(100vh - 73px)' : '70vh' }}>
                <div 
                  className="prose max-w-none"
                  style={{ 
                    transform: `scale(${previewZoom / 100}) rotate(${previewRotation}deg)`,
                    transformOrigin: 'top left'
                  }}
                >
                  {document.content ? (
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {document.content}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No content preview available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Share Document</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Copy className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Copy Link</p>
                      <p className="text-xs text-gray-500">Share document URL</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Mail className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Share via Email</p>
                      <p className="text-xs text-gray-500">Send document link</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <ExternalLink className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Open External</p>
                      <p className="text-xs text-gray-500">View in new tab</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <LinkIcon className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Generate Share Link</p>
                      <p className="text-xs text-gray-500">Create shareable link</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetails;
