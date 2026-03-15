import api from '../../services/api';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Table, Button, Tag, message, Space, Input } from 'antd';
import { ArrowLeft, Download, Search, Sparkles, CheckCircle, ArrowRight, FileText, Users, Calendar } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs'; // Add this import

const FormSubmissions = () => {
  const { formId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch form details and submissions
      const [formResponse, submissionsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/forms/form/${formId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/forms/submissions/${formId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setForm(formResponse.data.data);
      setSubmissions(submissionsResponse.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper function to format date values
  const formatDateValue = (value, fieldType) => {
    if (fieldType === 'date' && value && value !== '-') {
      try {
        // Handle different date formats
        if (typeof value === 'string' && value.includes('T')) {
          // ISO string format
          return dayjs(value).format('DD/MM/YYYY');
        } else if (typeof value === 'string') {
          // Simple date string
          return dayjs(value).format('DD/MM/YYYY');
        }
        return dayjs(value).format('DD/MM/YYYY');
      } catch (error) {
        console.error('Date formatting error:', error);
        return value;
      }
    }
    return value;
  };

  const exportToCSV = () => {
    if (!submissions.length) return;

    // Create CSV headers
    const headers = ['Submitted At', 'Name', 'Email'];
    form?.fields?.forEach(field => {
      headers.push(field.label);
    });

    // Create CSV rows
    const rows = submissions.map(submission => {
      const row = [
        dayjs(submission.submittedAt).format('DD/MM/YYYY HH:mm:ss'),
        submission.submittedBy.name,
        submission.submittedBy.email
      ];

      form?.fields?.forEach(field => {
        const response = submission.responses.find(r => r.fieldId === field.id);
        let value = response?.value || '';
        
        // Handle array values (checkboxes)
        if (Array.isArray(value)) {
          value = value.join(', ');
        }
        
        // Format dates for CSV
        value = formatDateValue(value, field.type);
        
        row.push(value);
      });

      return row;
    });

    // Convert to CSV
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form?.title || 'form'}_submissions.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getColumns = () => {
    const baseColumns = [
      {
        title: 'Submitted At',
        dataIndex: 'submittedAt',
        key: 'submittedAt',
        render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
        width: 180,
        sorter: (a, b) => dayjs(a.submittedAt).unix() - dayjs(b.submittedAt).unix(),
      },
      {
        title: 'Name',
        dataIndex: ['submittedBy', 'name'],
        key: 'name',
        width: 150,
        sorter: (a, b) => a.submittedBy.name.localeCompare(b.submittedBy.name),
      },
      {
        title: 'Email',
        dataIndex: ['submittedBy', 'email'],
        key: 'email',
        width: 250,
        render: (email) => (
          <a href={`mailto:${email}`} className="text-blue-600 hover:text-blue-800">
            {email}
          </a>
        ),
      },
    ];

    // Add dynamic columns for form fields
    const fieldColumns = form?.fields?.map(field => ({
      title: field.label,
      key: field.id,
      render: (_, record) => {
        const response = record.responses.find(r => r.fieldId === field.id);
        let value = response?.value || '-';

        // Handle array values (checkboxes)
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.map((v, index) => (
                <Tag key={index} color="blue">{v}</Tag>
              ))}
            </div>
          );
        }

        // Handle email fields
        if (field.type === 'email' && value && value !== '-') {
          return (
            <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800">
              {value}
            </a>
          );
        }

        // Handle phone fields
        if (field.type === 'tel' && value && value !== '-') {
          return (
            <a href={`tel:${value}`} className="text-green-600 hover:text-green-800">
              {value}
            </a>
          );
        }

        // Handle date fields
        if (field.type === 'date' && value && value !== '-') {
          const formattedDate = formatDateValue(value, field.type);
          return (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
              {formattedDate}
            </span>
          );
        }

        // Handle long text
        if (field.type === 'textarea' && value && value.length > 50) {
          return (
            <div className="max-w-xs">
              <div className="truncate" title={value}>
                {value}
              </div>
            </div>
          );
        }

        return <span>{value}</span>;
      },
      width: field.type === 'textarea' ? 300 : 200,
      ellipsis: field.type === 'textarea',
    })) || [];

    return [...baseColumns, ...fieldColumns];
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.submittedBy.name.toLowerCase().includes(searchText.toLowerCase()) ||
    submission.submittedBy.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin/forms">
                <Button
                  icon={<ArrowLeft size={20} />}
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white transition-all duration-300 rounded-xl backdrop-blur-sm"
                  size="large"
                >
                  Back to Forms
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Form Submissions
                  </h1>
                  <p className="text-blue-100">
                    {form?.title || 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
              <span className="text-white font-medium">EduCloud Forms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Submitters</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(submissions.map(s => s.submittedBy.email)).size}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Latest Submission</p>
                <p className="text-lg font-bold text-gray-900">
                  {submissions.length > 0
                    ? dayjs(submissions[0].submittedAt).format('DD/MM/YYYY')
                    : 'No submissions'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Submission Details</h2>
                  <p className="text-gray-600">View and manage all form responses</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Input
                  placeholder="Search by name or email..."
                  prefix={<Search size={16} />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  style={{ width: 300 }}
                />

                <Button
                  icon={<Download size={16} />}
                  onClick={exportToCSV}
                  disabled={!submissions.length}
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 border-0 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  size="large"
                >
                  Export CSV
                </Button>
              </div>
            </div>

            <Table
              columns={getColumns()}
              dataSource={filteredSubmissions}
              loading={loading}
              rowKey="_id"
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} submissions`,
                pageSizeOptions: ['10', '20', '50', '100'],
                className: "rounded-xl"
              }}
              className="rounded-2xl overflow-hidden"
              size="middle"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FormSubmissions;
