import api from '../../services/api';
import React, { useState } from 'react';
import { Card, Button, Input, Select, Switch, Space, Form, message, Divider, Modal, Alert, Radio, Checkbox } from 'antd';
import { Plus, Trash2, Eye, Save, Info, HelpCircle, Star, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import axios from 'axios';
import DynamicFormDisplay from './DynamicFormDisplay'; // Add this import if not already

const { TextArea } = Input;
const { Option } = Select;

const DynamicFormBuilder = () => {
  const [form] = Form.useForm();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const fieldTypes = [
    { value: 'text', label: 'Text Input', icon: '📝', color: 'bg-blue-500' },
    { value: 'email', label: 'Email', icon: '✉️', color: 'bg-emerald-500' },
    { value: 'number', label: 'Number', icon: '🔢', color: 'bg-purple-500' },
    { value: 'tel', label: 'Phone', icon: '📞', color: 'bg-orange-500' },
    { value: 'textarea', label: 'Textarea', icon: '📄', color: 'bg-cyan-500' },
    { value: 'select', label: 'Dropdown', icon: '📋', color: 'bg-pink-500' },
    { value: 'radio', label: 'Radio Buttons', icon: '🔘', color: 'bg-yellow-500' },
    { value: 'checkbox', label: 'Checkboxes', icon: '☑️', color: 'bg-red-500' },
    { value: 'date', label: 'Date', icon: '📅', color: 'bg-indigo-500' }
  ];

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      options: []
    };
    setFields([...fields, newField]);
  };

  const updateField = (index, updates) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const removeField = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  const addOption = (fieldIndex) => {
    const updatedFields = [...fields];
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    updatedFields[fieldIndex].options.push({ value: '', label: '' });
    setFields(updatedFields);
  };

  const updateOption = (fieldIndex, optionIndex, updates) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options[optionIndex] = {
      ...updatedFields[fieldIndex].options[optionIndex],
      ...updates
    };
    setFields(updatedFields);
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options = updatedFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    setFields(updatedFields);
  };

  const handleSubmit = async (values) => {
    if (fields.length === 0) {
      message.error('Please add at least one field');
      return;
    }

    // Validate fields
    for (let field of fields) {
      if (!field.label.trim()) {
        message.error('All fields must have a label');
        return;
      }
      if (['radio', 'checkbox', 'select'].includes(field.type)) {
        if (!field.options || field.options.length === 0) {
          message.error(`Field "${field.label}" requires options`);
          return;
        }
        // Validate that all options have both value and label
        for (let option of field.options) {
          if (!option.value.trim() || !option.label.trim()) {
            message.error(`All options in "${field.label}" must have both value and label`);
            return;
          }
        }
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/forms/create', {
        ...values,
        fields
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success('Form created successfully!');
      form.resetFields();
      setFields([]);
    } catch (error) {
      message.error(error.response?.data?.message || 'Error creating form');
    } finally {
      setLoading(false);
    }
  };

  const needsOptions = (type) => ['radio', 'checkbox', 'select'].includes(type);

  const InfoModal = () => (
    <Modal
      title={
        <div className="flex items-center">
          <Info className="mr-2 text-blue-500" size={20} />
          How Dynamic Forms Work
        </div>
      }
      open={showInfoModal}
      onCancel={() => setShowInfoModal(false)}
      footer={[
        <Button key="close" type="primary" onClick={() => setShowInfoModal(false)}>
          Got it!
        </Button>
      ]}
      width={700}
    >
      <div className="space-y-4">
        <Alert
          message="Default Fields Information"
          description="Every form automatically includes Name and Email fields for user identification. You don't need to add these manually."
          type="info"
          showIcon
        />

        <div>
          <h3 className="text-lg font-semibold mb-2">📝 Form Creation Process:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Step 1:</strong> Set your form title and description</li>
            <li>• <strong>Step 2:</strong> Choose whether to allow multiple submissions</li>
            <li>• <strong>Step 3:</strong> Add custom fields with various input types</li>
            <li>• <strong>Step 4:</strong> Configure field options (for radio/checkbox/dropdown)</li>
            <li>• <strong>Step 5:</strong> Mark required fields as needed</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">🔧 Available Field Types:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>• Text Input - Single line text</div>
            <div>• Email - Email validation</div>
            <div>• Number - Numeric input only</div>
            <div>• Phone - Phone number input</div>
            <div>• Textarea - Multi-line text</div>
            <div>• Dropdown - Single selection</div>
            <div>• Radio Buttons - Single choice</div>
            <div>• Checkboxes - Multiple choices</div>
            <div>• Date Picker - Date selection</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">👥 User Experience:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Users will see your form title and description</li>
            <li>• Name and Email fields are automatically added at the top</li>
            <li>• Your custom fields appear below the default fields</li>
            <li>• Form validation ensures required fields are filled</li>
            <li>• Submissions are stored and can be exported to CSV</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">📊 Form Management:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• View all submissions in a table format</li>
            <li>• Export submission data to CSV</li>
            <li>• Activate/Deactivate forms as needed</li>
            <li>• Search and filter through responses</li>
            <li>• Track submission counts and dates</li>
          </ul>
        </div>

        <Alert
          message="Pro Tip"
          description="Use descriptive field labels and helpful placeholder text to make your form user-friendly. Required fields should be clearly marked."
          type="success"
          showIcon
        />
      </div>
    </Modal>
  );

  // Helper to build a preview formData object
  const getPreviewFormData = () => ({
    title: form.getFieldValue('title') || 'Untitled Form',
    description: form.getFieldValue('description') || '',
    fields,
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-slate-200 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dynamic Form Builder
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-slate-800 leading-tight">
            Create{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Custom Forms
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Build powerful, interactive forms with our intuitive drag-and-drop builder.
            Collect responses, analyze data, and streamline your workflows.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => setShowInfoModal(true)}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              How it Works
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setPreviewVisible(true)}
              className="group px-8 py-4 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center text-slate-700"
            >
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
              Preview Form
            </button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">

      {/* Default Fields Information */}
      <Alert
        message={
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
            Default Fields Included
          </div>
        }
        description="Every form automatically includes Name and Email fields for user identification. Focus on adding your custom fields below."
        type="success"
        showIcon={false}
        className="mb-8 rounded-2xl border-emerald-200 bg-emerald-50"
        closable
      />

      <Form form={form} onFinish={handleSubmit} layout="vertical">
        {/* Form Settings Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 mr-4">
              <Info size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Form Settings</h2>
              <p className="text-slate-600">Configure your form's basic information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Form.Item
              name="title"
              label={<span className="text-lg font-semibold text-slate-700">Form Title</span>}
              rules={[{ required: true, message: 'Please enter form title' }]}
            >
              <Input
                size="large"
                placeholder="e.g., Job Application Form, Event Registration, Survey"
                className="rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="allowMultipleSubmissions"
              label={<span className="text-lg font-semibold text-slate-700">Submission Settings</span>}
              valuePropName="checked"
            >
              <div className="flex items-center space-x-3">
                <Switch className="bg-slate-300" />
                <span className="text-slate-600">
                  Allow multiple submissions from the same email
                </span>
              </div>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={<span className="text-lg font-semibold text-slate-700">Description</span>}
          >
            <TextArea
              rows={4}
              placeholder="Describe the purpose of this form. This will be displayed to users when they view the form."
              className="rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500"
            />
          </Form.Item>
        </div>

        {/* Custom Fields Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3 mr-4">
                <Plus size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Custom Form Fields</h2>
                <p className="text-slate-600">Add your custom fields below. Name and Email are included automatically.</p>
              </div>
            </div>
            <Button
              type="primary"
              onClick={addField}
              icon={<Plus size={16} />}
              size="large"
              className="bg-gradient-to-r from-blue-600 to-purple-600 border-none rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Add Custom Field
            </Button>
          </div>

          {/* Default Fields Preview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
              Default Fields (Auto-included):
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                <Input placeholder="Enter your full name" disabled className="rounded-lg" />
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                <Input placeholder="Enter your email address" disabled className="rounded-lg" />
              </div>
            </div>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <div className="mb-4 text-6xl">📝</div>
              <div className="text-xl font-medium mb-2">No custom fields added yet</div>
              <div className="text-slate-400">Click "Add Custom Field" to create additional form fields</div>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-slate-700 mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                Your Custom Fields:
              </h3>
              {fields.map((field, index) => (
                <Card key={field.id} className="mb-6 rounded-2xl border-slate-200 hover:shadow-lg transition-all duration-300" size="small">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center">
                      <div className={`bg-gradient-to-br ${fieldTypes.find(t => t.value === field.type)?.color || 'bg-gray-500'} rounded-xl p-2 mr-3`}>
                        <span className="text-white text-lg">
                          {fieldTypes.find(t => t.value === field.type)?.icon || '📝'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Custom Field {index + 1}</h3>
                        <p className="text-slate-500 text-sm">{fieldTypes.find(t => t.value === field.type)?.label}</p>
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      onClick={() => removeField(index)}
                      icon={<Trash2 size={16} />}
                      className="hover:bg-red-50 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700">Field Type</label>
                      <Select
                        value={field.type}
                        onChange={(value) => updateField(index, { type: value, options: needsOptions(value) ? [{ value: '', label: '' }] : [] })}
                        className="w-full rounded-lg"
                        size="large"
                      >
                        {fieldTypes.map(type => (
                          <Option key={type.value} value={type.value}>
                            <div className="flex items-center">
                              <span className="mr-2">{type.icon}</span>
                              {type.label}
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700">Field Label *</label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="e.g., Experience Level, Preferred Location"
                        className="rounded-lg"
                        size="large"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700">Placeholder Text</label>
                      <Input
                        value={field.placeholder}
                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                        placeholder="Helpful text shown inside the field"
                        className="rounded-lg"
                        size="large"
                      />
                    </div>

                    <div className="flex items-center space-x-3 md:col-span-2 lg:col-span-1">
                      <Switch
                        checked={field.required}
                        onChange={(checked) => updateField(index, { required: checked })}
                        className="bg-slate-300"
                      />
                      <span className="text-slate-700 font-medium">Required Field</span>
                    </div>
                  </div>

                  {needsOptions(field.type) && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-semibold text-slate-700">Options</label>
                        <Button
                          size="small"
                          onClick={() => addOption(index)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 border-none text-white rounded-lg hover:shadow-md"
                        >
                          <Plus size={14} className="mr-1" />
                          Add Option
                        </Button>
                      </div>

                      {field.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-3 mb-3">
                          <Input
                            placeholder="Option value (stored in database)"
                            value={option.value}
                            onChange={(e) => updateOption(index, optionIndex, { value: e.target.value })}
                            className="rounded-lg"
                            size="large"
                          />
                          <Input
                            placeholder="Option label (shown to users)"
                            value={option.label}
                            onChange={(e) => updateOption(index, optionIndex, { label: e.target.value })}
                            className="rounded-lg"
                            size="large"
                          />
                          <Button
                            type="text"
                            danger
                            onClick={() => removeOption(index, optionIndex)}
                            icon={<Trash2 size={16} />}
                            className="hover:bg-red-50 rounded-lg px-3"
                          />
                        </div>
                      ))}

                      {field.options?.length === 0 && (
                        <div className="text-center py-6 text-slate-500 border border-dashed rounded-lg bg-white">
                          No options added. Click "Add Option" to create choices for this field.
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            icon={<Save size={16} />}
            className="bg-gradient-to-r from-blue-600 to-purple-600 border-none rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-semibold"
          >
            Create Form
          </Button>

          <Button
            size="large"
            icon={<Eye size={16} />}
            onClick={() => setPreviewVisible(true)}
            className="border-slate-300 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 px-8 py-6 text-lg"
          >
            Preview Form
          </Button>
        </div>
      </Form>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
        title={
          <div className="flex items-center">
            <Eye className="mr-2 text-blue-500" size={20} />
            Form Preview
          </div>
        }
        className="rounded-2xl"
        destroyOnClose
      >
        <DynamicFormPreview formData={getPreviewFormData()} />
      </Modal>

      </div>

      <InfoModal />
    </div>
  );
};

// Simple preview component (does not submit, just renders fields)
const DynamicFormPreview = ({ formData }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{formData.title}</h2>
      {formData.description && <p className="mb-4 text-gray-600">{formData.description}</p>}
      <Form layout="vertical">
        <Form.Item label="Full Name" required>
          <Input disabled placeholder="Enter your full name" />
        </Form.Item>
        <Form.Item label="Email Address" required>
          <Input disabled placeholder="Enter your email address" />
        </Form.Item>
        {formData.fields && formData.fields.map(field => {
          switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
              return (
                <Form.Item key={field.id} label={field.label} required={field.required}>
                  <Input disabled placeholder={field.placeholder} />
                </Form.Item>
              );
            case 'number':
              return (
                <Form.Item key={field.id} label={field.label} required={field.required}>
                  <Input disabled type="number" placeholder={field.placeholder} />
                </Form.Item>
              );
            case 'textarea':
              return (
                <Form.Item key={field.id} label={field.label} required={field.required}>
                  <Input.TextArea disabled rows={3} placeholder={field.placeholder} />
                </Form.Item>
              );
            case 'select':
              return (
                <Form.Item key={field.id} label={field.label} required={field.required}>
                  <Select disabled placeholder={field.placeholder}>
                    {field.options?.map(opt => (
                      <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            case 'radio':
              return (
                <Form.Item key={field.id} label={field.label} required={field.required}>
                  <Radio.Group disabled>
                    {field.options?.map(opt => (
                      <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              );
            case 'checkbox':
              return (
                <Form.Item key={field.id} label={field.label} required={field.required}>
                  <Checkbox.Group disabled>
                    {field.options?.map(opt => (
                      <Checkbox key={opt.value} value={opt.value}>{opt.label}</Checkbox>
                    ))}
                  </Checkbox.Group>
                </Form.Item>
              );
            case 'date':
              return (
                <Form.Item key={field.id} label={field.label} required={field.required}>
                  <Input disabled placeholder="Select date" />
                </Form.Item>
              );
            default:
              return null;
          }
        })}
      </Form>
    </div>
  );
};

export default DynamicFormBuilder;
