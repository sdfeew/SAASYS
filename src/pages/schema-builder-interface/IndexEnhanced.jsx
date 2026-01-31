import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorAlert from '../../components/ui/ErrorAlert';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { moduleService } from '../../services/moduleService';
import { fieldService } from '../../services/fieldService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler } from '../../utils/errorHandler';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const SchemaBuilderInterfaceEnhanced = () => {
  const { user, tenantId } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [newModule, setNewModule] = useState({ name: '', description: '' });
  const [newField, setNewField] = useState({ label: '', name: '', type: 'text', required: false });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    loadModules();
  }, [tenantId]);

  useEffect(() => {
    if (selectedModule) {
      loadFields();
    }
  }, [selectedModule]);

  const loadModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moduleService.getAllMainModules(tenantId);
      setModules(data || []);
      if (data && data.length > 0) {
        setSelectedModule(data[0]);
      }
    } catch (err) {
      errorHandler.logError('SchemaBuilder:loadModules', err);
      setError('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const loadFields = async () => {
    if (!selectedModule) return;
    try {
      const data = await fieldService.getAllFields(selectedModule.id);
      setFields(data || []);
    } catch (err) {
      errorHandler.logError('SchemaBuilder:loadFields', err);
      setError('Failed to load fields');
    }
  };

  const handleCreateModule = async () => {
    if (!newModule.name.trim()) {
      setError('Module name is required');
      return;
    }

    setSaving(true);
    try {
      const created = await moduleService.create({
        ...newModule,
        tenant_id: tenantId,
        type: 'main'
      });
      setModules([...modules, created]);
      setSelectedModule(created);
      setNewModule({ name: '', description: '' });
      setShowModuleModal(false);
    } catch (err) {
      errorHandler.logError('SchemaBuilder:createModule', err);
      setError('Failed to create module');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateField = async () => {
    if (!newField.label.trim() || !newField.name.trim()) {
      setError('Field label and name are required');
      return;
    }

    setSaving(true);
    try {
      const created = await fieldService.createField({
        ...newField,
        module_id: selectedModule.id,
        order: fields.length + 1
      });
      setFields([...fields, created]);
      setNewField({ label: '', name: '', type: 'text', required: false });
      setShowFieldModal(false);
    } catch (err) {
      errorHandler.logError('SchemaBuilder:createField', err);
      setError('Failed to create field');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateField = async () => {
    setSaving(true);
    try {
      const updated = await fieldService.updateField(editingField.id, {
        label: editingField.label,
        type: editingField.type,
        required: editingField.required
      });
      setFields(fields.map(f => f.id === editingField.id ? updated : f));
      setEditingField(null);
    } catch (err) {
      errorHandler.logError('SchemaBuilder:updateField', err);
      setError('Failed to update field');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async () => {
    try {
      await fieldService.deleteField(deleteConfirm.id);
      setFields(fields.filter(f => f.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      errorHandler.logError('SchemaBuilder:deleteField', err);
      setError('Failed to delete field');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading schema..." />;
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
              <h1 className="text-2xl font-bold text-slate-900">Schema Builder</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowModuleModal(true)} className="flex items-center gap-2">
                <Icon name="Plus" size={18} />
                New Module
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

        <div className="flex-1 overflow-auto">
          <div className="flex">
            {/* Module List */}
            <div className="w-64 bg-white border-r border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Modules</h2>
              <div className="space-y-2">
                {modules.map(mod => (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModule(mod)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedModule?.id === mod.id
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    {mod.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields Area */}
            <div className="flex-1 p-6">
              {selectedModule ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedModule.name}</h2>
                      {selectedModule.description && (
                        <p className="text-slate-600 mt-1">{selectedModule.description}</p>
                      )}
                    </div>
                    <Button onClick={() => setShowFieldModal(true)} className="flex items-center gap-2">
                      <Icon name="Plus" size={18} />
                      Add Field
                    </Button>
                  </div>

                  {fields.length === 0 ? (
                    <EmptyState
                      icon="Layers"
                      title="No Fields"
                      description="Add your first field to this module"
                      action={<Button onClick={() => setShowFieldModal(true)}>Add Field</Button>}
                    />
                  ) : (
                    <div className="bg-white rounded-lg border border-slate-200">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Label</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Required</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map(field => (
                            <tr key={field.id} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="px-6 py-4 text-sm text-slate-900">{field.label}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{field.name}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs font-medium">
                                  {field.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {field.required ? (
                                  <Icon name="Check" size={18} className="text-green-600" />
                                ) : (
                                  <Icon name="X" size={18} className="text-slate-400" />
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => setEditingField(field)}
                                  className="text-blue-600 hover:text-blue-700 mr-4"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(field)}
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
              ) : (
                <EmptyState
                  icon="Database"
                  title="No Modules"
                  description="Create your first module to get started"
                  action={<Button onClick={() => setShowModuleModal(true)}>Create Module</Button>}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Module</h2>
            <input
              type="text"
              value={newModule.name}
              onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
              placeholder="Module name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={newModule.description}
              onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
              placeholder="Description (optional)"
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <Button onClick={handleCreateModule} loading={saving} className="flex-1">
                Create
              </Button>
              <button
                onClick={() => setShowModuleModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Field</h2>
            <input
              type="text"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              placeholder="Field label"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              placeholder="Field name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
              <option value="checkbox">Checkbox</option>
              <option value="textarea">Textarea</option>
            </select>
            <label className="flex items-center gap-2 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-900">Required field</span>
            </label>
            <div className="flex gap-3">
              <Button onClick={handleCreateField} loading={saving} className="flex-1">
                Add Field
              </Button>
              <button
                onClick={() => setShowFieldModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Field Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Field</h2>
            <input
              type="text"
              value={editingField.label}
              onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
              placeholder="Field label"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={editingField.type}
              onChange={(e) => setEditingField({ ...editingField, type: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
              <option value="checkbox">Checkbox</option>
              <option value="textarea">Textarea</option>
            </select>
            <label className="flex items-center gap-2 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={editingField.required}
                onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-900">Required field</span>
            </label>
            <div className="flex gap-3">
              <Button onClick={handleUpdateField} loading={saving} className="flex-1">
                Save
              </Button>
              <button
                onClick={() => setEditingField(null)}
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
        title="Delete Field?"
        message={`Are you sure you want to delete "${deleteConfirm?.label}"? This action cannot be undone.`}
        actionLabel="Delete"
        onConfirm={handleDeleteField}
        onCancel={() => setDeleteConfirm(null)}
        severity="danger"
      />
    </div>
  );
};

export default SchemaBuilderInterfaceEnhanced;
