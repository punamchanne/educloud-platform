import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { 
  FileText, Download, Eye, Search, Filter, Calendar, 
  BookOpen, GraduationCap, Edit, Clock, Star, 
  File, Archive, CheckCircle, AlertCircle, FileDown,
  Maximize, Minimize, Printer
} from 'lucide-react';

const StudentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [previewDocument, setPreviewDocument] = useState(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const printRef = useRef();
  const previewContentRef = useRef();

  const documentTypes = [
    { value: 'lesson_plan', label: 'Lesson Plans', icon: BookOpen, color: 'blue' },
    { value: 'assignment', label: 'Assignments', icon: Edit, color: 'green' },
    { value: 'study_guide', label: 'Study Guides', icon: GraduationCap, color: 'purple' },
    { value: 'quiz', label: 'Quizzes', icon: CheckCircle, color: 'orange' },
    { value: 'worksheet', label: 'Worksheets', icon: File, color: 'pink' }
  ];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
    'History', 'Geography', 'Computer Science', 'Economics'
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await api.get('/documents');

      if (response.data.success) {
        setDocuments(response.data.documents.map(doc => ({
          id: doc._id,
          title: doc.title,
          type: doc.type,
          subject: doc.subject,
          gradeLevel: doc.gradeLevel,
          createdAt: doc.createdAt,
          status: doc.status,
          content: doc.content,
          duration: doc.duration ? `${doc.duration} minutes` : 'Not specified',
          topic: doc.topic,
          usage: doc.usage || { views: 0, downloads: 0 },
          metadata: doc.metadata || {}
        })));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Add sample documents for demonstration
      const sampleDocuments = [
        {
          id: 1,
          title: 'Algebra Fundamentals - Linear Equations',
          type: 'lesson_plan',
          subject: 'Mathematics',
          gradeLevel: '10',
          createdAt: new Date().toISOString(),
          status: 'completed',
          content: `ALGEBRA FUNDAMENTALS: LINEAR EQUATIONS

LEARNING OBJECTIVES:
- Understand the concept of linear equations
- Learn to solve equations with one variable
- Apply linear equations to real-world problems
- Graph linear equations on coordinate plane

LESSON CONTENT:

1. INTRODUCTION TO LINEAR EQUATIONS
A linear equation is an algebraic equation in which each term is either a constant or the product of a constant and a single variable.

Standard form: ax + b = 0 (where a ≠ 0)

2. SOLVING LINEAR EQUATIONS
Step-by-step process:
- Simplify both sides of the equation
- Collect like terms
- Isolate the variable
- Check your solution

3. PRACTICE PROBLEMS
Example 1: Solve 3x + 5 = 14
Solution: 3x = 14 - 5 = 9, therefore x = 3

Example 2: Solve 2(x - 3) = 8
Solution: 2x - 6 = 8, 2x = 14, x = 7

4. REAL-WORLD APPLICATIONS
- Distance, rate, and time problems
- Age problems
- Money and pricing problems
- Geometry applications

5. ASSESSMENT
Students will complete practice worksheet with 10 problems of varying difficulty levels.`,
          duration: '45 minutes',
          topic: 'Linear Equations',
          usage: { views: 23, downloads: 12 },
          metadata: { difficulty: 'intermediate', wordCount: 156 }
        },
        {
          id: 2,
          title: 'Cell Structure and Function Study Guide',
          type: 'study_guide',
          subject: 'Biology',
          gradeLevel: '9',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
          content: `CELL STRUCTURE AND FUNCTION STUDY GUIDE

KEY CONCEPTS TO MASTER:

1. CELL THEORY
- All living things are made of cells
- Cells are the basic unit of life
- All cells come from pre-existing cells

2. TYPES OF CELLS
Prokaryotic Cells:
- No nucleus
- DNA freely floating
- Examples: bacteria, archaea

Eukaryotic Cells:
- Have nucleus
- Membrane-bound organelles
- Examples: plant, animal, fungi cells

3. CELL ORGANELLES AND FUNCTIONS

NUCLEUS:
- Control center of cell
- Contains DNA/chromosomes
- Surrounded by nuclear membrane

MITOCHONDRIA:
- Powerhouse of cell
- Produces ATP (energy)
- Has double membrane

CHLOROPLASTS (plants only):
- Site of photosynthesis
- Contains chlorophyll
- Converts sunlight to energy

RIBOSOMES:
- Protein synthesis
- Found free or on ER
- Made of RNA and protein

ENDOPLASMIC RETICULUM:
- Rough ER: has ribosomes, makes proteins
- Smooth ER: no ribosomes, makes lipids

GOLGI APPARATUS:
- Modifies and packages proteins
- Shipping center of cell

4. STUDY TIPS:
- Create diagrams and label organelles
- Use mnemonics to remember functions
- Practice with microscope images
- Compare plant vs animal cells

5. REVIEW QUESTIONS:
1. What are the three parts of cell theory?
2. How do prokaryotic and eukaryotic cells differ?
3. What is the function of the nucleus?
4. Why are mitochondria called powerhouses?
5. What organelles are unique to plant cells?`,
          duration: 'Self-paced',
          topic: 'Cell Biology',
          usage: { views: 45, downloads: 28 },
          metadata: { difficulty: 'beginner', wordCount: 234 }
        },
        {
          id: 3,
          title: 'World War II Timeline Assignment',
          type: 'assignment',
          subject: 'History',
          gradeLevel: '11',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'completed',
          content: `WORLD WAR II TIMELINE ASSIGNMENT

OBJECTIVE:
Create a comprehensive timeline of World War II events from 1939-1945, demonstrating understanding of chronological sequence and cause-effect relationships.

ASSIGNMENT REQUIREMENTS:

1. TIMELINE STRUCTURE
- Cover period from September 1939 to September 1945
- Include minimum 25 significant events
- Use consistent date format (MM/DD/YYYY)
- Organize chronologically with clear visual layout

2. REQUIRED EVENTS TO INCLUDE
- War declarations and country entries
- Major battles and military campaigns
- Key political decisions and conferences
- Holocaust events and liberation
- Technology developments (radar, atomic bomb)
- Home front changes in various countries

3. EVENT DETAILS FOR EACH ENTRY
- Exact date (or closest approximation)
- Brief description (2-3 sentences)
- Countries/leaders involved
- Significance to overall war effort
- Connection to previous events when applicable

4. RESEARCH SOURCES
- Use minimum 3 primary sources
- Include 5 secondary academic sources
- Cite all sources using MLA format
- Avoid Wikipedia as primary source

5. PRESENTATION FORMAT
Choose ONE of the following:
- Digital timeline using approved software
- Hand-drawn poster (minimum 24" x 36")
- Written report with timeline appendix
- Multimedia presentation (10-15 minutes)

6. GRADING CRITERIA
- Historical accuracy (25%)
- Completeness of timeline (25%)
- Quality of research and sources (20%)
- Organization and presentation (20%)
- Writing/visual quality (10%)

7. DUE DATE
Submit completed assignment by Friday, November 15th
Late submissions will lose 10% per day

8. HELPFUL RESOURCES
- National Archives online collections
- Library of Congress digital materials
- Smithsonian Museum resources
- BBC History website
- Local library newspaper archives

BONUS OPPORTUNITY (+5 points):
Include analysis of how WWII events connect to current global situations or modern international relations.`,
          duration: '2 weeks',
          topic: 'World War II',
          usage: { views: 67, downloads: 34 },
          metadata: { difficulty: 'advanced', wordCount: 312 }
        }
      ];
      setDocuments(sampleDocuments);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch documents');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      // Create and download the document
      const blob = new Blob([document.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${document.title}.txt`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully!');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDownloadPDF = async (document) => {
    try {
      // Create a temporary div with formatted content for PDF generation
      const printContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">${document.title}</h1>
          <div style="display: flex; gap: 20px; margin: 20px 0; color: #6b7280; font-size: 14px;">
            <span><strong>Subject:</strong> ${document.subject}</span>
            <span><strong>Grade:</strong> ${document.gradeLevel}</span>
            <span><strong>Type:</strong> ${getDocumentTypeInfo(document.type).label}</span>
          </div>
          <div style="white-space: pre-wrap; line-height: 1.6; color: #374151; margin-top: 30px;">
            ${document.content}
          </div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
            Generated on ${new Date().toLocaleDateString()} • EduCloud Educational Platform
          </div>
        </div>
      `;

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${document.title}</title>
            <style>
              body { margin: 0; padding: 20px; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      toast.success('PDF download initiated! Use your browser\'s print dialog to save as PDF.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const toggleFullscreenPreview = () => {
    setIsFullscreenPreview(!isFullscreenPreview);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.topic?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;
    
    return matchesSearch && matchesType && matchesSubject;
  });

  const getDocumentTypeInfo = (type) => {
    return documentTypes.find(dt => dt.value === type) || documentTypes[0];
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Study Documents
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Access your educational materials, study guides, and assignments
              </p>
            </div>
          </div>
        </div>

        {/* Document Type Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {documentTypes.map((type) => {
            const count = documents.filter(doc => doc.type === type.value).length;
            return (
              <div key={type.value} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-600">
                <div className="text-center">
                  <div className={`p-3 rounded-lg bg-${type.color}-100 dark:bg-${type.color}-900/20 inline-block mb-2`}>
                    <type.icon className={`w-6 h-6 text-${type.color}-600`} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{type.label}</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{count}</p>
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
            const difficultyColor = getDifficultyColor(document.metadata?.difficulty);
            
            return (
              <div key={document.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 overflow-hidden hover:shadow-xl transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/20`}>
                      <typeInfo.icon className={`w-5 h-5 text-${typeInfo.color}-600`} />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => setPreviewDocument(document)}
                        className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                        title="Read Document"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Read</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(document)}
                        className="flex items-center space-x-1 px-3 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
                        title="Download as PDF"
                      >
                        <FileDown className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => handleDownload(document)}
                        className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                        title="Download as Text"
                      >
                        <Download className="w-3 h-3" />
                        <span>TXT</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 line-clamp-2">
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
                    {document.usage && (
                      <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{document.usage.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download className="w-3 h-3" />
                          <span>{document.usage.downloads}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      document.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      {document.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${typeInfo.color}-100 text-${typeInfo.color}-800 dark:bg-${typeInfo.color}-900/20 dark:text-${typeInfo.color}-400`}>
                        {typeInfo.label.slice(0, -1)}
                      </span>
                      {document.metadata?.difficulty && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${difficultyColor}-100 text-${difficultyColor}-800 dark:bg-${difficultyColor}-900/20 dark:text-${difficultyColor}-400`}>
                          {document.metadata.difficulty}
                        </span>
                      )}
                    </div>
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
            <p className="text-slate-500 dark:text-slate-400">
              {searchTerm || selectedType !== 'all' || selectedSubject !== 'all'
                ? 'Try adjusting your search or filters' 
                : 'Your study materials will appear here'
              }
            </p>
          </div>
        )}

        {/* Preview Modal */}
        {previewDocument && (
          <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${isFullscreenPreview ? 'p-0' : ''}`}>
            <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
              isFullscreenPreview 
                ? 'w-full h-full rounded-none' 
                : 'max-w-5xl w-full max-h-[90vh]'
            }`}>
              <div className="p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white truncate">
                      {previewDocument.title}
                    </h2>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>{previewDocument.subject}</span>
                      <span>•</span>
                      <span>Grade {previewDocument.gradeLevel}</span>
                      <span>•</span>
                      <span>{previewDocument.duration}</span>
                      <span>•</span>
                      <span>{getDocumentTypeInfo(previewDocument.type).label}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={toggleFullscreenPreview}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      title={isFullscreenPreview ? "Exit Fullscreen" : "Fullscreen Reading"}
                    >
                      {isFullscreenPreview ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(previewDocument)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      title="Download as PDF"
                    >
                      <FileDown className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(previewDocument)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      title="Download as Text"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPreviewDocument(null)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-xl"
                      title="Close"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
              <div 
                ref={printRef}
                className={`overflow-y-auto ${
                  isFullscreenPreview 
                    ? 'h-[calc(100vh-120px)] p-8' 
                    : 'max-h-[calc(90vh-160px)] p-6'
                }`}
              >
                <div className="prose dark:prose-invert max-w-none">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
                    <pre className="whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200 leading-relaxed text-base">
                      {previewDocument.content}
                    </pre>
                  </div>
                </div>
              </div>
              {!isFullscreenPreview && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Use fullscreen mode for better reading experience
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDownloadPDF(previewDocument)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => handleDownload(previewDocument)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Text</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDocuments;
