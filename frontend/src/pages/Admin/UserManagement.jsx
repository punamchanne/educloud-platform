import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Users, Trash2, Edit, Plus, Search, Filter, UserPlus, Mail, Shield, CheckCircle, XCircle, AlertTriangle, Users2 } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'student' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkRole, setBulkRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [roleChangeModal, setRoleChangeModal] = useState({
    isOpen: false,
    user: null,
    newRole: null
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data.users);
      } catch (error) {
        toast.error('Failed to fetch users');
        console.error('Error:', error.response?.data?.message || error.message);
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/users', formData);
      setUsers([...users, res.data.user]);
      setFormData({ username: '', email: '', password: '', role: 'student' });
      setIsFormOpen(false);
      toast.success('User created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put(`/users/${editingUser._id}`, formData);
      setUsers(users.map(user => user._id === editingUser._id ? res.data.user : user));
      setFormData({ username: '', email: '', password: '', role: 'student' });
      setEditingUser(null);
      setIsFormOpen(false);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      await api.delete(`/users/${id}`);
      setUsers(users.filter((user) => user._id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    const user = users.find(u => u._id === userId);
    setRoleChangeModal({
      isOpen: true,
      user,
      newRole
    });
  };

  const confirmRoleUpdate = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/users/${roleChangeModal.user._id}/role`, {
        role: roleChangeModal.newRole
      });
      setUsers(users.map(user =>
        user._id === roleChangeModal.user._id ? res.data.user : user
      ));
      toast.success(res.data.message);
      setRoleChangeModal({ isOpen: false, user: null, newRole: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRoleUpdate = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users to update');
      return;
    }
    if (!window.confirm(`Are you sure you want to change ${selectedUsers.length} users to ${bulkRole} role?`)) return;
    try {
      setLoading(true);
      const res = await api.put('/users/bulk/role', {
        userIds: selectedUsers,
        role: bulkRole
      });
      // Refresh users list
      const usersRes = await api.get('/users');
      setUsers(usersRes.data.users);
      setSelectedUsers([]);
      setIsBulkMode(false);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user roles');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers.map(user => user._id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role
    });
    setIsFormOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'staff': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white flex items-center mb-2">
            <Users className="mr-4 text-blue-600" size={36} />
            User Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Manage users, roles, and permissions across the EduCloud platform.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {['admin', 'teacher', 'parent', 'student'].map((role) => {
            const count = users.filter(user => user.role === role).length;
            return (
              <div key={role} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-4 text-center">
                <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                  role === 'admin' ? 'bg-red-100 dark:bg-red-900/20' :
                  role === 'teacher' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  role === 'parent' ? 'bg-green-100 dark:bg-green-900/20' :
                  'bg-purple-100 dark:bg-purple-900/20'
                }`}>
                  <Shield className={`w-4 h-4 ${
                    role === 'admin' ? 'text-red-600 dark:text-red-400' :
                    role === 'teacher' ? 'text-blue-600 dark:text-blue-400' :
                    role === 'parent' ? 'text-green-600 dark:text-green-400' :
                    'text-purple-600 dark:text-purple-400'
                  }`} />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{count}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 capitalize">{role}s</div>
              </div>
            );
          })}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{users.length}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              {users.filter(user => user.role === 'admin').length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Admins</div>
          </div>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          {/* Add User Button */}
          <button
            onClick={() => {
              setIsFormOpen(true);
              setEditingUser(null);
              setFormData({ username: '', email: '', password: '', role: 'student' });
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add User
          </button>
        </div>

        {/* Bulk Operations */}
        {isBulkMode && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </span>
                <select
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value)}
                  className="px-3 py-1 bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={handleBulkRoleUpdate}
                  disabled={loading || selectedUsers.length === 0}
                  className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Updating...' : 'Update Roles'}
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllUsers}
                  className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsBulkMode(false)}
                  className="px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Bulk Mode */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setIsBulkMode(!isBulkMode)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center text-sm"
          >
            <Users2 className="w-4 h-4 mr-2" />
            {isBulkMode ? 'Exit Bulk Mode' : 'Bulk Operations'}
          </button>
        </div>

        {/* User Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={editingUser ? handleEditUser : handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-slate-800 dark:text-white">Processing...</span>
            </div>
          </div>
        )}

        {/* Role Change Confirmation Modal */}
        {roleChangeModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Confirm Role Change
                </h2>
                <button
                  onClick={() => setRoleChangeModal({ isOpen: false, user: null, newRole: null })}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {roleChangeModal.user?.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                      {roleChangeModal.user?.username}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {roleChangeModal.user?.email}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Current Role</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(roleChangeModal.user?.role)}`}>
                        {roleChangeModal.user?.role}
                      </span>
                    </div>
                    <div className="text-2xl">→</div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">New Role</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(roleChangeModal.newRole)}`}>
                        {roleChangeModal.newRole}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Role Change Warning
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        This will change the user's access permissions and may affect their ability to use certain features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRoleChangeModal({ isOpen: false, user: null, newRole: null })}
                  className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRoleUpdate}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Confirm Change'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-600 p-6 ${
                selectedUsers.includes(user._id) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Selection Checkbox */}
              {isBulkMode && (
                <div className="flex justify-end mb-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => toggleUserSelection(user._id)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {user.username}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      {user.role === 'admin' && (
                        <Shield className="w-4 h-4 text-red-500" title="Admin privileges" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    title="Edit user"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Role Change Buttons */}
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quick Role Change:</p>
                <div className="flex flex-wrap gap-2">
                  {['student', 'teacher', 'parent', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleUpdate(user._id, role)}
                      disabled={user.role === role || loading}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                        user.role === role
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                          : role === 'admin'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : role === 'teacher'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : role === 'parent'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm capitalize">{user.role} Access</span>
                </div>
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
              No users found
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Start by adding your first user.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
