import api from '../../services/api';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Space, Tag, message, Popconfirm, Modal, Alert } from 'antd';
import { Plus, Eye, Edit, ArrowLeft, Search, Download, Trash2, BarChart3, Users, DatabaseIcon, Database, FormInput, LetterTextIcon, Clipboard, ClipboardList, EyeIcon, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const DynamicFormsList = () => {
  const { formId } = useParams();
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (formId) {
      fetchData();
    }
  });

  const fetchForms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/forms/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForms(response.data.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
      message.error('Error fetching forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
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
  };

  const handleDelete = async (formId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/forms/delete/${formId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Form deleted successfully');
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      message.error('Error deleting form');
    }
  };

  const toggleFormStatus = async (formId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/forms/update/${formId}`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success(`Form ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchForms();
    } catch (error) {
      console.error('Error updating form status:', error);
      message.error('Error updating form status');
    }
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
        new Date(submission.submittedAt).toLocaleString(),
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
        render: (date) => new Date(date).toLocaleString(),
        width: 150,
      },
      {
        title: 'Name',
        dataIndex: ['submittedBy', 'name'],
        key: 'name',
        width: 150,
      },
      {
        title: 'Email',
        dataIndex: ['submittedBy', 'email'],
        key: 'email',
        width: 200,
      },
    ];

    // Add dynamic columns for form fields
    const fieldColumns = form?.fields?.map(field => ({
      title: field.label,
      key: field.id,
      render: (_, record) => {
        const response = record.responses.find(r => r.fieldId === field.id);
        let value = response?.value || '-';

        if (Array.isArray(value)) {
          return value.map(v => <Tag key={v}>{v}</Tag>);
        }

        if (field.type === 'email') {
          return <a href={`mailto:${value}`}>{value}</a>;
        }

        return value;
      },
      width: 200,
    })) || [];

    return [...baseColumns, ...fieldColumns];
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.submittedBy.name.toLowerCase().includes(searchText.toLowerCase()) ||
    submission.submittedBy.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Form Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.description && (
            <div className="text-gray-500 text-sm mt-1">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Submissions',
      dataIndex: 'submissionCount',
      key: 'submissionCount',
      render: (count) => (
        <div className="flex items-center">
          <Users size={16} className="mr-1" />
          {count || 0}
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Link to={`/forms/${record.title.replace(/ /g, "-")}${record.uniqueFormId ? "-" + record.uniqueFormId.trim() : ""}`} target="_blank">
            <Button type="link" icon={<EyeIcon size={16} />} >View</Button>
          </Link>


          <Link to={`/admin/forms/${record._id}/submissions`}>
            <Button type="link">Submissions</Button>
          </Link>

          {/* Add Edit Button */}
          <Link to={`/admin/forms/${record._id}/edit`}>
            <Button type="link" icon={<Edit size={16} />}>Edit</Button>
          </Link>

          <Button
            type="link"
            onClick={() => toggleFormStatus(record._id, record.isActive)}
          >
            {record.isActive ? 'Deactivate' : 'Activate'}
          </Button>

          <Popconfirm
            title="Are you sure you want to delete this form?"
            description="This will also delete all submissions."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-slate-200 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Form Management
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800 leading-tight">
            Manage Your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Dynamic Forms
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Create, edit, and analyze responses from your custom forms.
            Track submissions, export data, and gain insights from your collected information.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/admin/forms/create">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create New Form
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <button className="group px-8 py-4 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center text-slate-700">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              View Analytics
            </button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium">Total Forms</p>
                <p className="text-3xl font-bold text-slate-800">{forms.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3">
                <FormInput className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium">Active Forms</p>
                <p className="text-3xl font-bold text-slate-800">{forms.filter(f => f.isActive).length}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium">Total Submissions</p>
                <p className="text-3xl font-bold text-slate-800">{forms.reduce((acc, f) => acc + (f.submissionCount || 0), 0)}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-3">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Forms Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 mr-4">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Your Forms</h2>
                <p className="text-slate-600">Manage and monitor all your created forms</p>
              </div>
            </div>
            <Link to="/admin/forms/create">
              <Button
                type="primary"
                icon={<Plus size={16} />}
                size="large"
                className="bg-gradient-to-r from-blue-600 to-purple-600 border-none rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Create New Form
              </Button>
            </Link>
          </div>

          <div className="flex justify-between items-center mb-6">
            <Input
              placeholder="Search forms by title..."
              prefix={<Search size={16} className="text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="max-w-md rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500"
              size="large"
            />
          </div>

          <Table
            columns={columns}
            dataSource={forms}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} forms`,
            }}
            className="rounded-xl overflow-hidden"
          />
        </div>

        {/* Form Submissions Section (when viewing specific form) */}
        {formId && (
          <div className="mt-8">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-3 mr-4">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Form Submissions: {form?.title}</h2>
                    <p className="text-slate-600">Total submissions: {submissions.length}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    icon={<Download size={16} />}
                    onClick={exportToCSV}
                    disabled={!submissions.length}
                    size="large"
                    className="rounded-xl hover:shadow-md transition-all duration-300"
                  >
                    Export CSV
                  </Button>
                  <Link to="/admin/forms">
                    <Button
                      icon={<ArrowLeft size={16} />}
                      size="large"
                      className="rounded-xl hover:shadow-md transition-all duration-300"
                    >
                      Back to Forms
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <Input
                  placeholder="Search submissions by name or email..."
                  prefix={<Search size={16} className="text-slate-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="max-w-md rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500"
                  size="large"
                />
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
                  showTotal: (total) => `Total ${total} submissions`,
                }}
                className="rounded-xl overflow-hidden"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicFormsList;
