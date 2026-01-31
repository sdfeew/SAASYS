import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorAlert from '../../components/ui/ErrorAlert';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler } from '../../utils/errorHandler';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const UserManagementConsoleEnhanced = () => {
  const { user, tenantId } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [tenantId]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll(tenantId);
      setUsers(data || []);
    } catch (err) {
      errorHandler.logError('UserManagementConsole:loadUsers', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email?.trim() || !newUser.name?.trim()) {
      setError('Email and name are required');
      return;
    }

    setSaving(true);
    try {
      const created = await userService.create({
        ...newUser,
        tenant_id: tenantId,
        status: 'active'
      });
      setUsers([...users, created]);
      setNewUser({ email: '', name: '', role: 'user' });
      setShowCreateModal(false);
    } catch (err) {
      errorHandler.logError('UserManagementConsole:createUser', err);
      setError('Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    setSaving(true);
    try {
      const updated = await userService.update(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        status: editingUser.status
      });
      setUsers(users.map(u => u.id === editingUser.id ? updated : u));
      setEditingUser(null);
    } catch (err) {
      errorHandler.logError('UserManagementConsole:updateUser', err);
      setError('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userService.delete(deleteConfirm.id);
      setUsers(users.filter(u => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      errorHandler.logError('UserManagementConsole:deleteUser', err);
      setError('Failed to delete user');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading users..." />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="lg:hidden p-2 hover:bg-slate-100 rounded">
                <Icon name="Menu" size={24} />
              </button>
              <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                <Icon name="Plus" size={18} />
                Add User
              </Button>
              <UserProfileDropdown user={user} />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-slate-100">
            <ErrorAlert error={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          {users.length === 0 ? (
            <EmptyState
              icon="Users"
              title="No Users"
              description="Add your first user to get started"
              action={<Button onClick={() => setShowCreateModal(true)}>Add User</Button>}
            />
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-900">{u.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 capitalize">{u.role}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="text-blue-600 hover:text-blue-700 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(u)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New User</h2>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Full name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Email address"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-3">
              <Button onClick={handleCreateUser} loading={saving} className="flex-1">
                Add User
              </Button>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit User</h2>
            <input
              type="text"
              value={editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              placeholder="Full name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={editingUser.role}
              onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={editingUser.status}
              onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex gap-3">
              <Button onClick={handleUpdateUser} loading={saving} className="flex-1">
                Save
              </Button>
              <button
                onClick={() => setEditingUser(null)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete User?"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        actionLabel="Delete"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteConfirm(null)}
        severity="danger"
      />
    </div>
  );
};

export default UserManagementConsoleEnhanced;
