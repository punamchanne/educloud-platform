import { useState, useEffect } from 'react';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Progress, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Empty, 
  List, 
  Avatar,
  Divider,
  Tabs
} from 'antd';
import { 
  TrendingUp, 
  Award, 
  Calendar, 
  BookOpen, 
  User, 
  ArrowLeft,
  AlertTriangle,
  Clock,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

const ChildMonitoring = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [monitoringData, setMonitoringData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [childLoading, setChildLoading] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getChildrenOverview();
      const childrenList = response.data.data.children;
      setChildren(childrenList);
      if (childrenList.length > 0) {
        setSelectedChildId(childrenList[0].id);
        fetchMonitoringData(childrenList[0].id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load child list');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonitoringData = async (studentId) => {
    try {
      setChildLoading(true);
      const response = await parentAPI.getChildPerformance(studentId);
      setMonitoringData(response.data.data);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      toast.error('Failed to load monitoring details');
    } finally {
      setChildLoading(false);
    }
  };

  const handleChildChange = (studentId) => {
    setSelectedChildId(studentId);
    fetchMonitoringData(studentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <Card className="shadow-lg border-0 rounded-2xl p-12 text-center bg-white/50 backdrop-blur-sm">
        <Empty 
          description={
            <span className="text-slate-500 font-medium">No children registered for monitoring yet.</span>
          } 
        />
      </Card>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header with Child Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Child Monitoring Portal
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time academic & behavioral oversight</p>
        </div>
        
        {children.length > 1 ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Select Child</span>
            <Tabs 
              activeKey={selectedChildId}
              onChange={handleChildChange}
              type="card"
              className="monitoring-tabs"
              items={children.map(child => ({
                key: child.id,
                label: (
                  <div className="flex items-center gap-2 px-2">
                    <Avatar size="small" className="bg-blue-100 text-blue-600 border-none">
                      {child.fullName[0]}
                    </Avatar>
                    <span className="font-semibold">{child.fullName}</span>
                  </div>
                )
              }))}
            />
          </div>
        ) : children.length === 1 ? (
          <div className="px-6 py-2 bg-purple-50 border border-purple-100 rounded-2xl flex items-center gap-3">
            <Avatar className="bg-purple-600 text-white font-bold">{children[0].fullName[0]}</Avatar>
            <div>
              <span className="text-xs font-black text-purple-400 uppercase block mb-0.5">Monitoring Profile</span>
              <span className="text-sm font-bold text-purple-800">{children[0].fullName}</span>
            </div>
          </div>
        ) : null}
      </div>

      {childLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
           <Progress type="circle" percent={45} strokeColor="#3b82f6" status="active" />
        </div>
      ) : monitoringData ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Key Performance Indicators */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover-lift border-0 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-white group">
                <Statistic
                  title={<span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance Efficiency</span>}
                  value={monitoringData.attendance.summary.attendancePercentage}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#2563eb', fontWeight: 800, fontSize: '2rem' }}
                  prefix={<Activity className="inline-block mr-2 w-6 h-6 text-blue-500" />}
                />
                <div className="mt-4">
                  <Progress 
                    percent={monitoringData.attendance.summary.attendancePercentage} 
                    strokeColor={{ '0%': '#3b82f6', '100%': '#60a5fa' }}
                    showInfo={false}
                    size={[null, 10]}
                    className="rounded-full"
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card variant="borderless" className="hover-lift shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-purple-50 to-white">
                <Statistic
                  title={<span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Academic Rank</span>}
                  value={monitoringData.performance.overallGPA}
                  precision={2}
                  suffix="/ 4.0"
                  valueStyle={{ color: '#7c3aed', fontWeight: 800, fontSize: '2rem' }}
                  prefix={<Award className="inline-block mr-2 w-6 h-6 text-purple-500" />}
                />
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Target: 4.0</span>
                  <Tag color="purple" bordered={false} className="m-0 rounded-lg">Dean's List</Tag>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="hover-lift border-0 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 to-white">
                <Statistic
                  title={<span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Class Standing</span>}
                  value={monitoringData.student.class}
                  valueStyle={{ color: '#059669', fontWeight: 800, fontSize: '1.2rem' }}
                  prefix={<BookOpen className="inline-block mr-2 w-5 h-5 text-green-500" />}
                />
                <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Roll No: <span className="text-green-600">{monitoringData.student.rollNumber || 'N/A'}</span>
                </p>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="hover-lift border-0 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-orange-50 to-white">
                <Statistic
                  title={<span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Exam Participation</span>}
                  value={monitoringData.exams.totalExams}
                  valueStyle={{ color: '#ea580c', fontWeight: 800, fontSize: '2rem' }}
                  prefix={<Calendar className="inline-block mr-2 w-6 h-6 text-orange-500" />}
                />
                <div className="mt-4">
                  <Tag color="orange" className="rounded-full px-3 py-1 font-bold">Latest: {monitoringData.exams.results[0]?.percentage || 0}%</Tag>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} className="mt-8">
            <Col xs={24} lg={16}>
              {/* Detailed Performance Table */}
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span className="font-extrabold text-slate-700">Exam Performance Monitoring</span>
                  </div>
                }
                bordered={false}
                className="shadow-xl rounded-[2rem] overflow-hidden"
              >
                <Table 
                  dataSource={monitoringData.exams.results}
                  pagination={{ pageSize: 5 }}
                  rowKey="examId"
                  className="monitoring-table"
                  columns={[
                    {
                      title: 'Subject / Exam',
                      dataIndex: 'examTitle',
                      render: (text, record) => (
                        <div>
                          <div className="font-bold text-slate-700">{text}</div>
                          <div className="text-xs text-slate-400 font-medium">{record.subject}</div>
                        </div>
                      )
                    },
                    {
                      title: 'Score',
                      dataIndex: 'percentage',
                      sorter: (a, b) => a.percentage - b.percentage,
                      render: (pct) => (
                        <div className="flex items-center gap-3">
                          <Progress percent={pct} size="small" showInfo={false} strokeColor={pct > 75 ? '#10b981' : pct > 40 ? '#3b82f6' : '#ef4444'} />
                          <span className="font-bold text-slate-600 min-w-[40px] text-right">{pct}%</span>
                        </div>
                      )
                    },
                    {
                      title: 'Status',
                      render: (_, record) => (
                        <Tag color={record.percentage >= 40 ? 'success' : 'error'} bordered={false} className="rounded-xl font-bold px-4 py-1">
                          {record.percentage >= 40 ? 'PASSED' : 'FAILED'}
                        </Tag>
                      )
                    }
                  ]}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <div className="space-y-6">
                {/* Improvement areas Card */}
                <Card 
                  className="shadow-xl border-0 rounded-[2rem] bg-slate-900 text-white"
                  title={
                    <div className="flex items-center gap-2 text-white/90">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      <span className="font-extrabold">Monitoring Alerts</span>
                    </div>
                  }
                >
                  <List
                    dataSource={monitoringData.performance.improvementAreas || []}
                    renderItem={item => (
                      <List.Item className="border-0 px-0">
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-3xl w-full">
                          <Target className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                          <div>
                            <span className="font-bold block text-sm mb-1">{item}</span>
                            <span className="text-xs text-white/40 uppercase tracking-tighter font-black">AI Suggestion: Focused Study</span>
                          </div>
                        </div>
                      </List.Item>
                    )}
                    locale={{ emptyText: <div className="text-white/30 text-center py-4">No behavioral/academic alerts detected. Excellent!</div> }}
                  />
                </Card>

                {/* Attendance Summary Mini-Widget */}
                <Card className="shadow-xl border-0 rounded-[2rem] p-6 text-center">
                  <h4 className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-6">Attendance Density</h4>
                  <div className="flex justify-center">
                    <PieChartIcon className="w-16 h-16 text-slate-100 absolute opacity-10" />
                    <Progress
                      type="dashboard"
                      percent={monitoringData.attendance.summary.attendancePercentage}
                      strokeColor={{ '0%': '#10b981', '100%': '#8b5cf6' }}
                      status="active"
                      size={120}
                    />
                  </div>
                  <div className="mt-8 flex justify-center gap-6">
                    <div className="text-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                      <span className="text-xs font-bold text-slate-500">Present</span>
                      <div className="font-black text-slate-800">{monitoringData.attendance.summary.presentDays}</div>
                    </div>
                    <div className="text-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2"></div>
                      <span className="text-xs font-bold text-slate-500">Absent</span>
                      <div className="font-black text-slate-800">{monitoringData.attendance.summary.absentDays}</div>
                    </div>
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      ) : (
        <Card className="text-center p-20 shadow-2xl rounded-[3rem]">
          <Empty description="No data available for the selected child. Contact school admin for linkage confirmation." />
        </Card>
      )}

      <style>{`
        .monitoring-tabs .ant-tabs-nav::before {
          border-bottom: 0 !important;
        }
        .monitoring-tabs .ant-tabs-tab {
          border: 0 !important;
          background: #f1f5f9 !important;
          border-radius: 1rem !important;
          margin-right: 8px !important;
          transition: all 0.3s;
        }
        .monitoring-tabs .ant-tabs-tab-active {
          background: #3b82f6 !important;
        }
        .monitoring-tabs .ant-tabs-tab-active .ant-avatar {
          background: white !important;
        }
        .monitoring-tabs .ant-tabs-tab-active span {
          color: white !important;
        }
        .hover-lift {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .hover-lift:hover {
          transform: translateY(-8px);
        }
        .monitoring-table .ant-table {
          background: transparent;
        }
        .monitoring-table .ant-table-thead > tr > th {
          background: #f8fafc;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.7rem;
          color: #94a3b8;
          letter-spacing: 0.1em;
          border-bottom: 2px solid #f1f5f9 !important;
        }
        .monitoring-table .ant-table-row:hover {
          background: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default ChildMonitoring;
