import { useState, useEffect } from 'react';
import { Card, Badge, List, Avatar, Tag, Empty, Button, Input, Spin } from 'antd';
import { parentAPI } from '../../services/api';
import { 
  Bell, 
  Calendar, 
  Clock, 
  Megaphone, 
  CheckCircle, 
  Search, 
  ChevronRight,
  MoreVertical
} from 'lucide-react';

const ParentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getParentNotifications();
      const data = response.data?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'exam': return <Calendar size={18} />;
      case 'attendance': return <Clock size={18} />;
      case 'general': return <Megaphone size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (!n) return false;
    const title = n.title || '';
    const message = n.message || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           message.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spin size="large" />
        <p className="text-slate-400 font-bold animate-pulse">Fetching latest updates...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 m-0">Alerts & Updates</h1>
          <p className="text-slate-400 m-0">Stay informed with school announcements</p>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            placeholder="Search alerts..." 
            prefix={<Search size={16} className="text-slate-400" />}
            className="rounded-xl border-slate-200 w-64"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Badge count={notifications.filter(n => !n.read).length}>
             <Button shape="circle" icon={<Bell size={18} />} />
          </Badge>
        </div>
      </div>

      {/* Notifications List */}
      <Card className="shadow-xl rounded-[2rem] border-0 overflow-hidden bg-white/80">
        <List
          dataSource={filteredNotifications}
          locale={{ emptyText: <div className="py-20"><Empty description="No notifications found" /></div> }}
          renderItem={(item) => (
            <List.Item className="p-0 border-b border-slate-50 last:border-0">
               <div className={`w-full p-6 flex gap-4 items-start hover:bg-slate-50/50 transition-colors ${!item.read ? 'bg-blue-50/20' : ''}`}>
                  <Avatar 
                    className={`${!item.read ? 'bg-blue-600' : 'bg-slate-200 text-slate-400'} border-none shadow-sm`}
                    size={48}
                    icon={getCategoryIcon(item.type || item.category)}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                       <h4 className={`text-lg m-0 ${!item.read ? 'font-black text-slate-800' : 'font-bold text-slate-500'}`}>
                         {item.title}
                       </h4>
                       <span className="text-[10px] font-black text-slate-400 uppercase">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                       </span>
                    </div>
                    <p className={`text-sm ${!item.read ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>
                      {item.message}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                       <Tag color={item.priority === 'high' ? 'red' : 'blue'} className="rounded-lg font-bold text-[10px] uppercase">
                          {item.priority || 'medium'}
                       </Tag>
                    </div>
                  </div>
                  <Button type="text" shape="circle" icon={<MoreVertical size={16} />} />
               </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default ParentNotifications;
