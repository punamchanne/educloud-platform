import { useState, useEffect } from 'react';
import { Card, Avatar, Input, Button, List, Badge, Empty, Tag, notification } from 'antd';
import { 
  SendHorizontal, 
  MessageCircle, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Search,
  CheckCircle2,
  Trash2,
  Mic,
  SmilePlus,
  MoreVertical
} from 'lucide-react';
import { parentAPI } from '../../services/api';
import axios from 'axios';

const ContactTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getStaff();
      setTeachers(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedTeacher) return;

    const newMessage = {
      id: Date.now(),
      sender: 'parent',
      text: message,
      timestamp: new Date().toISOString()
    };

    setChatHistory([...chatHistory, newMessage]);
    setMessage('');
    
    setTimeout(() => {
       const reply = {
         id: Date.now() + 1,
         sender: 'teacher',
         text: `Hello! I will review your child's progress and get back to you soon.`,
         timestamp: new Date().toISOString()
       };
       setChatHistory(prev => [...prev, reply]);
    }, 1500);
  };

  const filteredTeachers = teachers.filter(t => 
    t.profile.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
             Communication Hub
          </h1>
          <p className="text-slate-500 font-medium mt-1">Direct messaging with your child's educators</p>
        </div>
        <div className="relative flex-1 max-w-md">
           <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 z-10" />
           <Input 
             placeholder="Search teachers by name..." 
             className="pl-12 py-3 bg-slate-50 border-slate-200 rounded-2xl"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
        <div className="lg:col-span-4 space-y-3 p-2">
             {filteredTeachers.map((teacher) => (
                <Card 
                  key={teacher._id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`cursor-pointer transition-all border-2 rounded-2xl shadow-sm ${
                    selectedTeacher?._id === teacher._id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar size="large" className="bg-blue-100 text-blue-600 font-bold">{teacher.profile.fullName[0]}</Avatar>
                    <div className="flex-1">
                       <h4 className="font-extrabold text-slate-700 m-0">{teacher.profile.fullName}</h4>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{teacher.email}</span>
                    </div>
                  </div>
                </Card>
             ))}
        </div>

        <div className="lg:col-span-8">
           {selectedTeacher ? (
             <Card className="h-full shadow-2xl border-0 rounded-[2.5rem] flex flex-col overflow-hidden bg-slate-50">
                <div className="bg-white p-6 border-b border-slate-100 flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-4">
                      <Avatar size={64} className="bg-blue-600 border-none shadow-xl">{selectedTeacher.profile.fullName[0]}</Avatar>
                      <div>
                         <h2 className="text-2xl font-black text-slate-800 m-0">{selectedTeacher.profile.fullName}</h2>
                         <Tag color="blue" className="mt-1 font-bold">Faculty Member</Tag>
                      </div>
                   </div>
                   <div className="flex gap-2">
                       <Button 
                         className="font-black rounded-xl"
                         onClick={() => window.location.href = `mailto:${selectedTeacher.email}`}
                       >
                         Send Email
                       </Button>
                       <Button shape="circle" variant="text" icon={<MoreVertical size={20} />} />
                   </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto space-y-6">
                   {chatHistory.map((chat) => (
                      <div key={chat.id} className={`flex ${chat.sender === 'parent' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] p-4 rounded-2xl ${chat.sender === 'parent' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}>
                            <p className="font-semibold m-0">{chat.text}</p>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="bg-white p-6 border-t border-slate-100">
                   <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border">
                      <Input 
                        placeholder="Type your message here..." 
                        bordered={false}
                        className="py-2"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onPressEnter={handleSendMessage}
                      />
                      <Button 
                        type="primary" 
                        shape="circle"
                        className="h-12 w-12 bg-blue-600"
                        onClick={handleSendMessage}
                        icon={<SendHorizontal size={20} />}
                      />
                   </div>
                </div>
             </Card>
           ) : (
             <Card className="h-full flex items-center justify-center p-20 shadow-xl border-0 rounded-[3rem] text-center bg-white/50">
                <div className="text-slate-400 font-bold">
                   <User size={64} className="mx-auto mb-4 opacity-20" />
                   <h2 className="text-2xl text-slate-700 font-black">Select a Teacher</h2>
                   <p>Start a conversation regarding your child's progress.</p>
                </div>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
};

export default ContactTeacher;
