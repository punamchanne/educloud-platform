import api from '../../services/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Calendar, Edit, Trash2, Plus, Clock, MapPin, BookOpen, Users, Download, Printer, FileText, Coffee } from 'lucide-react';

const TimetableManagement = () => {
  const [timetables, setTimetables] = useState([]);
  const [formData, setFormData] = useState({
    class: '',
    section: '',
    subjects: [{ name: '', lecturesPerDay: 1, teacher: '' }],
    breakTimes: [
      { startTime: '10:30', endTime: '10:45' },
      { startTime: '12:30', endTime: '13:00' }
    ],
    schoolHours: { startTime: '08:00', endTime: '15:00', slotDuration: 45 },
    useAI: false,
    generateAuto: true
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/timetables', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Timetables response:', res.data); // Debug log
        setTimetables(res.data.timetables || []);
      } catch {
        toast.error('Failed to fetch timetables');
      }
    };
    fetchTimetables();
  }, []);

  const updateSlot = (index, field, value) => {
    const updatedSlots = [...(formData.slots || [])];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setFormData({ ...formData, slots: updatedSlots });
  };

  const updateSubject = (index, field, value) => {
    const updatedSubjects = [...(formData.subjects || [])];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...(formData.subjects || []), { name: '', lecturesPerDay: 1, teacher: '' }]
    });
  };

  const removeSubject = (index) => {
    if ((formData.subjects || []).length > 1) {
      const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
      setFormData({ ...formData, subjects: updatedSubjects });
    }
  };

  const handleInputChange = (e, slotIndex) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    if (slotIndex !== undefined) {
      updateSlot(slotIndex, name, inputValue);
    } else {
      setFormData({ ...formData, [name]: inputValue });
    }
  };  const addSlot = () => {
    setFormData({
      ...formData,
      slots: [...formData.slots, { day: '', startTime: '', endTime: '', subject: '', location: '', teacher: '', break: false }],
    });
  };

  const addBreakSlot = () => {
    setFormData({
      ...formData,
      slots: [...formData.slots, { day: '', startTime: '', endTime: '', subject: 'Break', location: '', teacher: '', break: true }],
    });
  };

  const removeSlot = (index) => {
    if (formData.slots.length > 1) {
      const newSlots = formData.slots.filter((_, i) => i !== index);
      setFormData({ ...formData, slots: newSlots });
    }
  };

  // Generate PDF timetable
  const generateTimetablePDF = (timetable) => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Timetable - ${timetable.class} ${timetable.section}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
          }
          
          .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
          }
          
          .header .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .info-section {
            padding: 30px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-bottom: 3px solid #e2e8f0;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          
          .info-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border-left: 4px solid #3b82f6;
          }
          
          .info-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #64748b;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e293b;
          }
          
          .timetable-content {
            padding: 30px;
          }
          
          .timetable-title {
            font-size: 1.8rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 25px;
            text-align: center;
            position: relative;
          }
          
          .timetable-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 2px;
          }
          
          .timetable-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            border-radius: 12px;
            overflow: hidden;
          }
          
          .timetable-table th {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 18px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 0.95rem;
            letter-spacing: 0.5px;
          }
          
          .timetable-table td {
            padding: 16px 15px;
            border-bottom: 1px solid #e2e8f0;
            transition: background-color 0.2s ease;
          }
          
          .timetable-table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          
          .timetable-table tr:hover {
            background-color: #f1f5f9;
          }
          
          .break-slot {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
            border-left: 4px solid #f59e0b;
            font-weight: 500;
            color: #92400e;
          }
          
          .time-slot {
            font-weight: 600;
            color: #3b82f6;
            white-space: nowrap;
          }
          
          .subject-cell {
            font-weight: 500;
            color: #1e293b;
          }
          
          .location-cell {
            color: #64748b;
            font-size: 0.9rem;
          }
          
          .teacher-cell {
            color: #059669;
            font-weight: 500;
            font-size: 0.9rem;
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
            
            .timetable-table th {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            .break-slot {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Class Timetable</h1>
            <div class="subtitle">Academic Schedule</div>
          </div>
          
          <div class="info-section">
            <div class="info-grid">
              <div class="info-card">
                <div class="info-label">Class</div>
                <div class="info-value">${timetable.class}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Section</div>
                <div class="info-value">${timetable.section || 'N/A'}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Total Periods</div>
                <div class="info-value">${timetable.slots.length}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Generated</div>
                <div class="info-value">${timetable.generatedByAI ? 'AI Assisted' : 'Manual'}</div>
              </div>
            </div>
          </div>
          
          <div class="timetable-content">
            <h2 class="timetable-title">Weekly Schedule</h2>
            
            <table class="timetable-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                ${timetable.slots.map(slot => `
                  <tr class="${slot.break ? 'break-slot' : ''}">
                    <td><strong>${slot.day}</strong></td>
                    <td class="time-slot">${slot.startTime} - ${slot.endTime}</td>
                    <td class="subject-cell">${slot.subject}</td>
                    <td class="teacher-cell">${slot.teacher || 'Not Assigned'}</td>
                    <td class="location-cell">${slot.location || 'TBA'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            Generated on <span class="timestamp">${new Date().toLocaleString()}</span> by EduCloud System
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto print after loading
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  // Download timetable as JSON
  const downloadTimetableData = (timetable) => {
    const dataStr = JSON.stringify(timetable, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timetable-${timetable.class}-${timetable.section || 'default'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Timetable data downloaded successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Generate auto timetable if enabled
      const finalSlots = formData.generateAuto ? generateAutoTimetable() : (formData.slots || []);
      
      const timetableData = {
        class: formData.class,
        section: formData.section,
        slots: finalSlots,
        useAI: formData.useAI,
        subjects: formData.subjects,
        breakTimes: formData.breakTimes,
        schoolHours: formData.schoolHours
      };
      
      if (editId) {
        const res = await axios.put(`http://localhost:5000/api/timetables/${editId}`, timetableData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimetables(timetables.map((t) => (t._id === editId ? res.data.timetable : t)));
        setEditId(null);
        toast.success('Timetable updated successfully');
      } else {
        const res = await api.post('/timetables', timetableData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimetables([...timetables, res.data.timetable]);
        toast.success('Timetable created successfully');
      }
      setFormData({
        class: '',
        section: '',
        subjects: [{ name: '', lecturesPerDay: 1, teacher: '' }],
        breakTimes: [
          { startTime: '10:30', endTime: '10:45' },
          { startTime: '12:30', endTime: '13:00' }
        ],
        schoolHours: { startTime: '08:00', endTime: '15:00', slotDuration: 45 },
        useAI: false,
        generateAuto: true
      });
      setIsFormOpen(false);
    } catch {
      toast.error('Failed to save timetable');
    }
  };

  const handleDeleteTimetable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/timetables/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimetables(timetables.filter((t) => t._id !== id));
      toast.success('Timetable deleted successfully');
    } catch {
      toast.error('Failed to delete timetable');
    }
  };

  const startEdit = (timetable) => {
    setEditId(timetable._id);
    setFormData({
      class: timetable.class,
      section: timetable.section,
      slots: timetable.slots,
      useAI: timetable.useAI || false,
    });
    setIsFormOpen(true);
  };

  const filteredTimetables = timetables.filter(timetable =>
    timetable.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    timetable.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Generate time slots for automated timetable
  const generateTimeSlots = () => {
    const { startTime, endTime, slotDuration } = formData.schoolHours;
    const slots = [];
    
    let currentTime = new Date(`2000-01-01T${startTime}:00`);
    const endDateTime = new Date(`2000-01-01T${endTime}:00`);
    
    while (currentTime < endDateTime) {
      const nextTime = new Date(currentTime.getTime() + slotDuration * 60000);
      
      // Check if this is a break time
      const isBreakTime = formData.breakTimes.some(breakTime => {
        const breakStart = new Date(`2000-01-01T${breakTime.startTime}:00`);
        const breakEnd = new Date(`2000-01-01T${breakTime.endTime}:00`);
        return currentTime >= breakStart && currentTime < breakEnd;
      });
      
      if (nextTime <= endDateTime) {
        slots.push({
          startTime: currentTime.toTimeString().slice(0, 5),
          endTime: nextTime.toTimeString().slice(0, 5),
          isBreak: isBreakTime
        });
      }
      
      currentTime = nextTime;
    }
    
    return slots;
  };

  // Auto-generate timetable based on subjects and lectures per day
  const generateAutoTimetable = () => {
    const timeSlots = generateTimeSlots();
    const workingSlots = timeSlots.filter(slot => !slot.isBreak);
    const breakSlots = timeSlots.filter(slot => slot.isBreak);
    
    const generatedSlots = [];
    
    daysOfWeek.forEach(day => {
      let dailySlotIndex = 0;
      
      // Add break slots for this day
      breakSlots.forEach(breakSlot => {
        generatedSlots.push({
          day,
          startTime: breakSlot.startTime,
          endTime: breakSlot.endTime,
          subject: 'Break',
          location: '',
          teacher: '',
          break: true
        });
      });
      
      // Distribute subjects across the day
      formData.subjects.forEach(subjectInfo => {
        for (let i = 0; i < subjectInfo.lecturesPerDay && dailySlotIndex < workingSlots.length; i++) {
          const slot = workingSlots[dailySlotIndex];
          
          generatedSlots.push({
            day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            subject: subjectInfo.name,
            location: `Room ${Math.floor(Math.random() * 20) + 1}`,
            teacher: subjectInfo.teacher,
            break: false
          });
          
          dailySlotIndex++;
        }
      });
    });
    
    return generatedSlots.sort((a, b) => {
      const dayOrder = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white flex items-center mb-2">
            <Calendar className="mr-4 text-blue-600" size={36} />
            Timetable Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Create and manage class schedules and timetables for all classes.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5">
                <Users className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search by class or section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Add Timetable Button */}
          <button
            onClick={() => {
              setIsFormOpen(true);
              setEditId(null);
              setFormData({
                class: '',
                section: '',
                slots: [{ day: '', startTime: '', endTime: '', subject: '', location: '' }],
                useAI: false,
              });
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Timetable
          </button>
        </div>

        {/* Timetable Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {editId ? 'Edit Timetable' : 'Create New Timetable'}
                </h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quick Auto-Generate Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Quick Auto-Generate Timetable
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className="px-4 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Class (e.g., 10th Grade)"
                    required
                  />
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="px-4 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Section (e.g., A)"
                    required
                  />
                </div>

                {/* Simple Subjects Input */}
                <div className="space-y-3">
                  {(formData.subjects || []).map((subject, index) => (
                    <div key={index} className="flex gap-3 items-center bg-white dark:bg-slate-700 p-3 rounded-lg">
                      <input
                        type="text"
                        value={subject.name || ''}
                        onChange={(e) => updateSubject(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`Subject ${index + 1}`}
                        required
                      />
                      <input
                        type="number"
                        min="1"
                        max="3"
                        value={subject.lecturesPerDay || 1}
                        onChange={(e) => updateSubject(index, 'lecturesPerDay', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500"
                        title="Lectures per day"
                      />
                      <input
                        type="text"
                        value={subject.teacher}
                        onChange={(e) => updateSubject(index, 'teacher', e.target.value)}
                        className="w-32 px-3 py-2 border border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Teacher"
                      />
                      {formData.subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubject(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addSubject}
                    className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
                  >
                    + Add Subject
                  </button>
                </div>

                <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  <p>💡 Auto-generates a complete weekly timetable with breaks at 10:30-10:45 and 12:30-13:00</p>
                </div>
              </div>
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Class
                    </label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Grade 10, Class A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Section
                    </label>
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., A, B, Science"
                      required
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Time Slots</h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addSlot}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-all duration-200 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Slot
                      </button>
                      <button
                        type="button"
                        onClick={addBreakSlot}
                        className="px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-all duration-200 flex items-center"
                      >
                        <Coffee className="w-4 h-4 mr-2" />
                        Add Break
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(formData.slots || []).map((slot, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-slate-700 dark:text-slate-300">Slot {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={slot.break || false}
                                onChange={(e) => updateSlot(index, 'break', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-slate-600 dark:text-slate-400">Break</span>
                            </label>
                            {formData.slots.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSlot(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Day
                            </label>
                            <select
                              name="day"
                              value={slot.day}
                              onChange={(e) => handleInputChange(e, index)}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="">Select Day</option>
                              {daysOfWeek.map(day => (
                                <option key={day} value={day}>{day}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              name="startTime"
                              value={slot.startTime}
                              onChange={(e) => handleInputChange(e, index)}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              name="endTime"
                              value={slot.endTime}
                              onChange={(e) => handleInputChange(e, index)}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>

                          {!slot.break && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                  Subject
                                </label>
                                <input
                                  type="text"
                                  name="subject"
                                  value={slot.subject}
                                  onChange={(e) => handleInputChange(e, index)}
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                  placeholder="Subject name"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  name="location"
                                  value={slot.location}
                                  onChange={(e) => handleInputChange(e, index)}
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                  placeholder="Room/Class"
                                />
                              </div>
                            </>
                          )}

                          {slot.break && (
                            <div className="md:col-span-2 flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400 font-medium">Break Time</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Option */}
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <input
                    type="checkbox"
                    name="useAI"
                    checked={formData.useAI}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                  />
                  <label className="ml-3 text-sm font-medium text-blue-700 dark:text-blue-300">
                    Use AI suggestions for optimal scheduling
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    {editId ? 'Update Timetable' : 'Create Timetable'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Timetables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTimetables.map((timetable) => (
            <div
              key={timetable._id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-600 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {timetable.class} - {timetable.section}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {timetable.slots.length} time slots
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateTimetablePDF(timetable)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadTimetableData(timetable)}
                    className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                    title="Download JSON"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startEdit(timetable)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    title="Edit timetable"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTimetable(timetable._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title="Delete timetable"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time Slots Preview */}
              <div className="space-y-3">
                {timetable.slots.slice(0, 3).map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${slot.break ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-blue-100 dark:bg-blue-900/20'} rounded-lg flex items-center justify-center`}>
                        {slot.break ? (
                          <Coffee className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {slot.break ? 'Break Time' : slot.subject}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {slot.day} • {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                    </div>
                    {!slot.break && (
                      <div className="flex items-center text-slate-500 dark:text-slate-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{slot.location}</span>
                      </div>
                    )}
                  </div>
                ))}
                {timetable.slots.length > 3 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    +{timetable.slots.length - 3} more slots
                  </p>
                )}
              </div>

              {timetable.useAI && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">AI-optimized schedule</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTimetables.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
              No timetables found
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Start by creating your first timetable.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableManagement;
