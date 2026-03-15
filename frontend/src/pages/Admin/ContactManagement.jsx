import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { contactAPI } from '../../services/api';
import {
  Mail, Phone, MessageSquare, Clock, User, Building, AlertCircle,
  CheckCircle, XCircle, Eye, Trash2, Reply, Filter, Search,
  Calendar, ArrowUpDown, MoreVertical, Star, Flag
} from 'lucide-react';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState({
    status: 'all',
    subject: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await contactAPI.getContactMessages({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filter
      });
      setContacts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.currentPage, pagination.itemsPerPage]);

  const fetchStats = async () => {
    try {
      const response = await contactAPI.getContactStats();
      setStats(response.data.data.overview);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [fetchContacts]);

  const updateContactStatus = async (contactId, status, adminResponse = null) => {
    try {
      const updateData = { status };
      if (adminResponse) {
        updateData.adminResponse = adminResponse;
      }

      await contactAPI.updateContactMessage(contactId, updateData);

      toast.success(`Contact message ${status} successfully`);
      fetchContacts();
      fetchStats();

      if (showModal) {
        setShowModal(false);
        setSelectedContact(null);
        setResponse('');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact message');
    }
  };

  const deleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      await contactAPI.deleteContactMessage(contactId);
      toast.success('Contact message deleted successfully');
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact message');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800 border-red-200';
      case 'read': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'responded': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Contact Management</h1>
              <p className="text-slate-600">Manage and respond to contact form submissions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">Total Messages</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.total || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-slate-600">Unread</p>
                    <p className="text-2xl font-bold text-red-600">{stats.unread || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{stats.unread || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Read</p>
                <p className="text-2xl font-bold text-blue-600">{stats.read || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Responded</p>
                <p className="text-2xl font-bold text-green-600">{stats.responded || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Closed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.closed || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or message..."
                  value={filter.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={filter.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="all">All Subjects</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Account Issues">Account Issues</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Partnership Inquiry">Partnership Inquiry</option>
                <option value="Demo Request">Demo Request</option>
                <option value="Pricing Information">Pricing Information</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Messages */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading contact messages...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No contact messages found</h3>
              <p className="text-slate-500">Contact messages will appear here when users submit the contact form.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{contact.name}</p>
                            <p className="text-sm text-slate-600">{contact.email}</p>
                            {contact.institution && (
                              <p className="text-xs text-slate-500 flex items-center">
                                <Building className="w-3 h-3 mr-1" />
                                {contact.institution}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{contact.subject}</p>
                          <p className="text-sm text-slate-600 truncate max-w-xs">{contact.message.substring(0, 50)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(contact.priority)}`}></div>
                          <span className="text-sm font-medium capitalize text-slate-700">{contact.priority}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{formatDate(contact.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {contact.status !== 'responded' && contact.status !== 'closed' && (
                            <button
                              onClick={() => updateContactStatus(contact._id, 'read')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as Read"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteContact(contact._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={!pagination.hasPrevPage}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Detail Modal */}
        {showModal && selectedContact && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800">Contact Message Details</h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedContact(null);
                      setResponse('');
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <XCircle size={24} className="text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">{selectedContact.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                          {selectedContact.email}
                        </a>
                      </div>
                      {selectedContact.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-slate-400" />
                          <a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:underline">
                            {selectedContact.phone}
                          </a>
                        </div>
                      )}
                      {selectedContact.institution && (
                        <div className="flex items-center space-x-3">
                          <Building className="w-5 h-5 text-slate-400" />
                          <span>{selectedContact.institution}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Message Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-slate-600">Subject:</span>
                        <p className="font-medium">{selectedContact.subject}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Status:</span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ml-2 border ${getStatusColor(selectedContact.status)}`}>
                          {selectedContact.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Priority:</span>
                        <div className="flex items-center space-x-2 ml-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedContact.priority)}`}></div>
                          <span className="text-sm font-medium capitalize">{selectedContact.priority}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Date:</span>
                        <p className="text-sm ml-2">{formatDate(selectedContact.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Message</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>

                {selectedContact.adminResponse && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Your Response</h3>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <p className="text-green-800 whitespace-pre-wrap">{selectedContact.adminResponse}</p>
                      {selectedContact.respondedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          Responded on {formatDate(selectedContact.respondedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedContact.status !== 'responded' && selectedContact.status !== 'closed' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Add Response</h3>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-y h-32"
                    />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <div className="flex justify-end space-x-3">
                  {selectedContact.status === 'unread' && (
                    <button
                      onClick={() => updateContactStatus(selectedContact._id, 'read')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  {selectedContact.status !== 'responded' && selectedContact.status !== 'closed' && response.trim() && (
                    <button
                      onClick={() => updateContactStatus(selectedContact._id, 'responded', response)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Send Response
                    </button>
                  )}
                  {selectedContact.status !== 'closed' && (
                    <button
                      onClick={() => updateContactStatus(selectedContact._id, 'closed')}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Close Ticket
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedContact(null);
                      setResponse('');
                    }}
                    className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManagement;
