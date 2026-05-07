import { useState, useEffect } from 'react';
import { Card, Calendar, Badge, Row, Col, Statistic, Progress } from 'antd';
import { parentAPI } from '../../services/api';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
import dayjs from 'dayjs';

const ParentAttendance = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await parentAPI.getChildrenOverview();
      const childrenData = response.data.data.children;
      setChildren(childrenData);
      if (childrenData.length > 0) {
        setSelectedChildId(childrenData[0].id);
        fetchAttendance(childrenData[0].id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchAttendance = async (studentId) => {
    try {
      setLoading(true);
      const response = await parentAPI.getChildPerformance(studentId);
      setAttendanceData(response.data.data.attendance.records || []);
      setSummary(response.data.data.attendance.summary);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const record = attendanceData.find(r => dayjs(r.date).format('YYYY-MM-DD') === dateStr);

    if (!record) return null;

    let color = 'green';
    let label = 'Present';

    if (record.status === 'absent') {
      color = 'red';
      label = 'Absent';
    } else if (record.status === 'late') {
      color = 'orange';
      label = 'Late';
    }

    return (
      <div className="mt-1">
        <Badge color={color} text={label} size="small" className="text-[10px] font-bold uppercase" />
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Attendance Tracker</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor daily school presence and punctuality</p>
        </div>

        {children.length > 1 && (
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <span className="pl-4 text-xs font-black text-slate-400 uppercase">Child</span>
            <select
              value={selectedChildId}
              onChange={(e) => {
                setSelectedChildId(e.target.value);
                fetchAttendance(e.target.value);
              }}
              className="bg-transparent border-none focus:ring-0 font-bold text-slate-700 pr-8"
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {summary && (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card variant="borderless" className="shadow-lg rounded-3xl bg-blue-600 text-white p-2">
              <Statistic 
                title={<span className="text-blue-100 font-bold text-xs uppercase tracking-widest">Attendance Rate</span>}
                value={summary.attendancePercentage}
                suffix="%"
                precision={1}
                valueStyle={{ color: 'white', fontWeight: 900, fontSize: '2.5rem' }}
                prefix={<CheckCircle className="w-8 h-8 mr-2 opacity-50" />}
              />
              <Progress 
                percent={summary.attendancePercentage} 
                strokeColor="white" 
                trailColor="rgba(255,255,255,0.2)" 
                strokeWidth={12} 
                showInfo={false}
                className="mt-4"
              />
            </Card>
          </Col>
          <Col xs={8} md={5}>
            <Card variant="borderless" className="shadow-lg rounded-3xl text-center">
              <Statistic 
                title={<span className="text-slate-400 font-bold text-xs uppercase">Present</span>}
                value={summary.presentDays}
                valueStyle={{ color: '#10b981', fontWeight: 900 }}
              />
            </Card>
          </Col>
          <Col xs={8} md={5}>
            <Card variant="borderless" className="shadow-lg rounded-3xl text-center">
              <Statistic 
                title={<span className="text-slate-400 font-bold text-xs uppercase">Absent</span>}
                value={summary.absentDays}
                valueStyle={{ color: '#ef4444', fontWeight: 900 }}
              />
            </Card>
          </Col>
          <Col xs={8} md={6}>
            <Card variant="borderless" className="shadow-lg rounded-3xl text-center bg-slate-50">
              <Statistic 
                title={<span className="text-slate-400 font-bold text-xs uppercase">Total Days</span>}
                value={summary.totalDays}
                valueStyle={{ color: '#64748b', fontWeight: 900 }}
                prefix={<CalendarIcon className="w-5 h-5 mr-1" />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card className="shadow-xl rounded-[2rem] border-0 overflow-hidden bg-white/80 backdrop-blur-md">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-500" />
          <span className="font-extrabold text-slate-700">Detailed Attendance Calendar</span>
        </div>
        <div className="p-4 md:p-8">
           <Calendar 
              cellRender={dateCellRender} 
              className="parent-attendance-calendar"
           />
        </div>
      </Card>

      <style>{`
        .parent-attendance-calendar .ant-picker-calendar-header {
          padding: 0 0 20px 0 !important;
        }
        .ant-picker-cell-inner {
          min-height: 80px !important;
          border-radius: 12px !important;
          padding: 8px !important;
          transition: all 0.3s;
        }
        .ant-picker-cell-today .ant-picker-cell-inner {
          background: #f0f7ff !important;
          border: 1px solid #3b82f6 !important;
        }
        .ant-picker-cell-selected .ant-picker-cell-inner {
          background: #3b82f6 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default ParentAttendance;
