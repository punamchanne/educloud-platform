import api from '../../services/api';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Input, Select, Radio, Checkbox, DatePicker, Button, message, Spin, Alert, Divider } from 'antd';
import { User, Mail, Sparkles, CheckCircle, ArrowRight, Send } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const DynamicFormDisplay = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/forms/form/unique/${id}`);
      setFormData(response.data.data);
    } catch (error) {
      message.error('Error loading form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Process the form values and format dates properly
      const responses = Object.entries(values.responses || {}).map(([fieldId, value]) => {
        // Find the field to check its type
        const field = formData.fields.find(f => f.id === fieldId);

        let processedValue = value;

        // Format date values
        if (field && field.type === 'date' && value) {
          // Convert dayjs object to ISO string
          processedValue = dayjs(value).format('YYYY-MM-DD');
        }

        return {
          fieldId,
          value: processedValue
        };
      });

      await axios.post(`http://localhost:5000/api/forms/submit/${id}`, {
        responses,
        submittedBy: {
          name: values.name,
          email: values.email
        }
      });

      message.success('Form submitted successfully!');
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Error submitting form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const fieldProps = {
      name: ['responses', field.id],
      label: field.label,
      rules: field.required ? [{ required: true, message: `${field.label} is required` }] : []
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <Form.Item {...fieldProps}>
            <Input placeholder={field.placeholder} type={field.type} />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item {...fieldProps}>
            <Input placeholder={field.placeholder} type="number" />
          </Form.Item>
        );

      case 'textarea':
        return (
          <Form.Item {...fieldProps}>
            <TextArea rows={4} placeholder={field.placeholder} />
          </Form.Item>
        );

      case 'select':
        return (
          <Form.Item {...fieldProps}>
            <Select placeholder={field.placeholder || `Select ${field.label}`}>
              {field.options?.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'radio':
        return (
          <Form.Item {...fieldProps}>
            <Radio.Group>
              {field.options?.map(option => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );

      case 'checkbox':
        return (
          <Form.Item {...fieldProps}>
            <Checkbox.Group>
              <div className="space-y-2">
                {field.options?.map(option => (
                  <Checkbox key={option.value} value={option.value}>
                    {option.label}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>
        );

      case 'date':
        return (
          <Form.Item {...fieldProps}>
            <DatePicker
              className="w-full"
              format="YYYY-MM-DD"
              placeholder={field.placeholder || "Select date"}
              showToday={true}
              allowClear={true}
            />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 w-fit mx-auto mb-4">
            <Spin size="large" className="text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="text-center">
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-4 w-fit mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Form Not Found</h2>
          <p className="text-slate-600">The form you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-slate-200 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Form Submission
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800 leading-tight">
            {formData.title}
          </h1>

          {formData.description && (
            <p className="text-xl md:text-2xl mb-12 text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {formData.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-xl font-semibold text-lg text-slate-700">
              <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
              Secure & Anonymous Submission
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          {/* Personal Information Section */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 mb-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 mr-4">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Personal Information</h2>
                <p className="text-slate-600">Please provide your basic information to submit this form</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="name"
                label={
                  <span className="text-lg font-semibold text-slate-700 flex items-center">
                    <User size={16} className="mr-2 text-blue-500" />
                    Full Name
                  </span>
                }
                rules={[{ required: true, message: 'Name is required' }]}
              >
                <Input
                  size="large"
                  placeholder="Enter your full name"
                  className="rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={
                  <span className="text-lg font-semibold text-slate-700 flex items-center">
                    <Mail size={16} className="mr-2 text-emerald-500" />
                    Email Address
                  </span>
                }
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter your email address"
                  className="rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500"
                />
              </Form.Item>
            </div>
          </div>

          {/* Custom Fields Section */}
          {formData.fields && formData.fields.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 mb-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3 mr-4">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Additional Information</h2>
                  <p className="text-slate-600">Please fill out the following fields</p>
                </div>
              </div>

              <div className="space-y-6">
                {formData.fields.map(field => (
                  <div key={field.id} className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all duration-300">
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
              icon={<Send size={16} />}
              className="bg-gradient-to-r from-blue-600 to-purple-600 border-none rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 px-12 py-6 text-lg font-semibold"
            >
              {submitting ? 'Submitting...' : 'Submit Form'}
            </Button>
            <p className="text-slate-500 mt-4 text-sm">
              Your information will be securely stored and processed.
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default DynamicFormDisplay;
