import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DashboardModal = ({ mode, dashboard, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: 'GLOBAL'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (dashboard && (mode === 'edit' || mode === 'duplicate')) {
      setFormData({
        name: mode === 'duplicate' ? `${dashboard.name} (Copy)` : dashboard.name,
        description: dashboard.description || '',
        scope: dashboard.scope || 'GLOBAL'
      });
    }
  }, [dashboard, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Dashboard name is required');
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
    } catch (err) {
      console.error('Error saving dashboard:', err);
      setError(err.message || 'Failed to save dashboard');
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Dashboard';
      case 'edit':
        return 'Edit Dashboard';
      case 'duplicate':
        return 'Duplicate Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon name="LayoutGrid" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground">
                {getTitle()}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'create' ? 'Set up a new dashboard' :
                 mode === 'edit' ? 'Update dashboard details' :
                 'Create a copy of this dashboard'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-muted rounded transition-smooth disabled:opacity-50"
            aria-label="Close"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pt-6 pb-0">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <Icon name="AlertCircle" size={18} className="text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Dashboard Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Sales Overview"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add a description to help others understand this dashboard"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Dashboard Scope *</label>
            <select
              name="scope"
              value={formData.scope}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              disabled={saving || mode === 'edit'}
            >
              <option value="GLOBAL">Global (All Users)</option>
              <option value="MODULE">Module Specific</option>
              <option value="SUPPLIER">Supplier Dashboard</option>
            </select>
            <p className="text-xs text-muted-foreground">
              {formData.scope === 'GLOBAL' && 'Visible to all users in the organization'}
              {formData.scope === 'MODULE' && 'Specific to one module'}
              {formData.scope === 'SUPPLIER' && 'Specific to a supplier'}
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-info/10 border border-info/20 space-y-2">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-info flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">Dashboard Tips:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Add widgets after creating the dashboard</li>
                  <li>Organize widgets using drag and drop</li>
                  <li>Publish when ready to share with users</li>
                  <li>Use filters to enhance interactivity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} />
                  {mode === 'create' ? 'Create' : 'Save'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardModal;
