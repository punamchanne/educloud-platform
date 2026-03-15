import api from '../../services/api';
import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Select, Switch, Space, Form, message, Divider, Modal, Alert, Radio, Checkbox, Spin } from 'antd';
import { Plus, Trash2, Eye, Save, Info, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const { TextArea } = Input;
const { Option } = Select;

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'tel', label: 'Phone' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date' }
];

const EditForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/forms/form/${formId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.data;
        form.setFieldsValue({
          title: data.title,
          description: data.description,
          allowMultipleSubmissions: data.allowMultipleSubmissions
        });
        setFields(data.fields || []);
      } catch (error) {
        message.error('Failed to fetch form');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
    // eslint-disable-next-line
  }, [formId]);

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

  const needsOptions = (type) => ['radio', 'checkbox', 'select'].includes(type);

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
      await axios.put(`http://localhost:5000/api/forms/update/${formId}`, {
        ...values,
        fields
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success('Form updated successfully!');
      navigate('/admin/forms');
    } catch (error) {
      message.error(error.response?.data?.message || 'Error updating form');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewFormData = () => ({
    title: form.getFieldValue('title') || 'Untitled Form',
    description: form.getFieldValue('description') || '',
    fields,
  });

  if (loading) return <Spin />;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Dynamic Form</h1>
        <p className="text-gray-600">Update your form settings and fields below</p>
      </div>

      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Form Settings</h2>
          <Form.Item
            name="title"
            label="Form Title"
            rules={[{ required: true, message: 'Please enter form title' }]}
          >
            <Input placeholder="e.g., Job Application Form, Event Registration, Survey" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea 
              rows={3} 
              placeholder="Describe the purpose of this form. This will be displayed to users when they view the form."
            />
          </Form.Item>
          <Form.Item name="allowMultipleSubmissions" label="Allow Multiple Submissions" valuePropName="checked">
            <Switch />
            <span className="ml-2 text-gray-500 text-sm">
              If enabled, users can submit the form multiple times using the same email
            </span>
          </Form.Item>
        </Card>

        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Custom Form Fields</h2>
              <p className="text-gray-500 text-sm">Add, edit, or remove your custom fields below. Name and Email are included automatically.</p>
            </div>
            <Button type="primary" onClick={addField} icon={<Plus size={16} />}>
              Add Custom Field
            </Button>
          </div>

          {/* Preview of Default Fields */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-medium text-gray-700 mb-2">📋 Default Fields (Auto-included):</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Input placeholder="Enter your full name" disabled />
              </div>
              <div className="bg-white p-3 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input placeholder="Enter your email address" disabled />
              </div>
            </div>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="mb-2">No custom fields added yet</div>
              <div className="text-sm">Click "Add Custom Field" to create additional form fields</div>
            </div>
          ) : (
            <div>
              <h3 className="font-medium text-gray-700 mb-3">🛠️ Your Custom Fields:</h3>
              {fields.map((field, index) => (
                <Card key={field.id} className="mb-4" size="small">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">Custom Field {index + 1}</h3>
                    <Button
                      type="text"
                      danger
                      onClick={() => removeField(index)}
                      icon={<Trash2 size={16} />}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Field Type</label>
                      <Select
                        value={field.type}
                        onChange={(value) => updateField(index, { type: value, options: needsOptions(value) ? [{ value: '', label: '' }] : [] })}
                        className="w-full"
                      >
                        {fieldTypes.map(type => (
                          <Option key={type.value} value={type.value}>{type.label}</Option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Field Label *</label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="e.g., Experience Level, Preferred Location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Placeholder Text</label>
                      <Input
                        value={field.placeholder}
                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                        placeholder="Helpful text shown inside the field"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Switch
                          checked={field.required}
                          onChange={(checked) => updateField(index, { required: checked })}
                        />
                        <span className="ml-2">Required Field</span>
                      </div>
                    </div>
                  </div>

                  {needsOptions(field.type) && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Options</label>
                        <Button size="small" onClick={() => addOption(index)}>
                          Add Option
                        </Button>
                      </div>
                      
                      {field.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2 mb-2">
                          <Input
                            placeholder="Option value (stored in database)"
                            value={option.value}
                            onChange={(e) => updateOption(index, optionIndex, { value: e.target.value })}
                          />
                          <Input
                            placeholder="Option label (shown to users)"
                            value={option.label}
                            onChange={(e) => updateOption(index, optionIndex, { label: e.target.value })}
                          />
                          <Button
                            type="text"
                            danger
                            onClick={() => removeOption(index, optionIndex)}
                            icon={<Trash2 size={16} />}
                          />
                        </div>
                      ))}
                      
                      {field.options?.length === 0 && (
                        <div className="text-center py-4 text-gray-500 border border-dashed rounded">
                          No options added. Click "Add Option" to create choices for this field.
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>

        <div className="flex gap-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            icon={<Save size={16} />}
          >
            Save Changes
          </Button>
          
          <Button
            size="large"
            icon={<Eye size={16} />}
            onClick={() => setPreviewVisible(true)}
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
        title="Form Preview"
        destroyOnClose
      >
        <DynamicFormPreview formData={getPreviewFormData()} />
      </Modal>
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

export default EditForm;
