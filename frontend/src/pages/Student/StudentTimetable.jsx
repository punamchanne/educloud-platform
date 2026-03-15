import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Calendar, Clock, MapPin, Book, Lightbulb, Star, ChevronRight } from 'lucide-react';

const StudentTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [studyTips, setStudyTips] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/timetables');
        setTimetables(res.data.timetables || []);
        // Mock AI study tips (replace with actual AI integration if needed)
        setStudyTips('Focus on revising key concepts daily and practice past papers for better results.');
      } catch (error) {
        toast.error('Failed to fetch timetable');
        console.error('Error:', error.response?.data?.message || error.message);
      }
    };
    fetchTimetables();
  }, []);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getSlotsForDay = (day) => {
    const allSlots = [];
    timetables.forEach(timetable => {
      timetable.slots.forEach(slot => {
        if (slot.day === day) {
          allSlots.push({
            ...slot,
            class: timetable.class,
            section: timetable.section
          });
        }
      });
    });
    return allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'from-blue-100 to-blue-200 border-blue-300',
      'Science': 'from-emerald-100 to-emerald-200 border-emerald-300',
      'English': 'from-purple-100 to-purple-200 border-purple-300',
      'History': 'from-orange-100 to-orange-200 border-orange-300',
      'Geography': 'from-cyan-100 to-cyan-200 border-cyan-300',
      'Art': 'from-pink-100 to-pink-200 border-pink-300',
      'Physical Education': 'from-red-100 to-red-200 border-red-300',
    };
    return colors[subject] || 'from-slate-100 to-slate-200 border-slate-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-slate-700">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Class Schedule
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-800 leading-tight">
            My{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Timetable
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stay organized with your weekly class schedule and personalized study recommendations.
          </p>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* AI Study Tips Section */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 border border-amber-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold mb-3 text-slate-800 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-amber-500" />
                    AI Study Tips
                  </h2>
                  <p className="text-slate-700 leading-relaxed">{studyTips}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timetable Section */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-slate-800">
                Weekly{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Schedule
                </span>
              </h2>
              <p className="text-slate-600">Select a day to view your classes</p>
            </div>

            {/* Day Selector */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedDay === day
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Timetable Display */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <Calendar className="w-6 h-6 mr-3" />
                  {selectedDay}'s Schedule
                </h3>
              </div>

              <div className="p-8">
                {getSlotsForDay(selectedDay).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getSlotsForDay(selectedDay).map((slot, index) => (
                      <div
                        key={index}
                        className={`group bg-gradient-to-br ${getSubjectColor(slot.subject)} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border hover:-translate-y-1`}
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {slot.subject}
                            </h4>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center text-slate-600">
                              <Book className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="font-medium">Class:</span>
                              <span className="ml-2">{slot.class}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                              <span className="font-medium mr-2">Section:</span>
                              <span>{slot.section}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                              <Clock className="w-4 h-4 mr-2 text-purple-500" />
                              <span className="font-medium">Time:</span>
                              <span className="ml-2">{slot.startTime} - {slot.endTime}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                              <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                              <span className="font-medium">Location:</span>
                              <span className="ml-2">{slot.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Calendar className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-slate-600 mb-2">No Classes Today</h3>
                    <p className="text-slate-500">Enjoy your free day or use it for self-study!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentTimetable;
