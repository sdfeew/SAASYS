import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tenantService } from '../../services/tenantService';
import moduleService from '../../services/moduleService';
import fieldService from '../../services/fieldService';
import { Plus, Edit2, Trash2, Check, X, Building2, Phone, Globe } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const TenantAdminPage = () => {
  const { user, userTenant } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    website: '',
    logo_url: '',
    status: 'active'
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch all tenants
  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantService.getAll();
      setTenants(data || []);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError(err.message || 'Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (formData.phone && !/^[\d\s\-\+\(\)]{7,20}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Invalid phone format';
    }
    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      errors.website = 'Invalid website URL';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setError(null);
      if (editingId) {
        await tenantService.update(editingId, formData);
      } else {
        await tenantService.create(formData);
      }
      
      await fetchTenants();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving tenant:', err);
      setError(err.message || 'Failed to save tenant');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;

    try {
      setError(null);
      await tenantService.delete(id);
      await fetchTenants();
    } catch (err) {
      console.error('Error deleting tenant:', err);
      setError(err.message || 'Failed to delete tenant');
    }
  };

  // Handle edit
  const handleEdit = (tenant) => {
    setFormData({
      name: tenant.name,
      description: tenant.description,
      phone: tenant.phone,
      website: tenant.website,
      logo_url: tenant.logo_url,
      status: tenant.status
    });
    setEditingId(tenant.id);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      phone: '',
      website: '',
      logo_url: '',
      status: 'active'
    });
    setEditingId(null);
    setValidationErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Tenant Administration</h1>
            <p className="text-gray-600 mt-2">Manage your organization tenants</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={20} />
            New Tenant
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">⚠️ {error}</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingId ? 'Edit Tenant' : 'Create New Tenant'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tenant Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter tenant name"
                    className={validationErrors.name ? 'border-red-500' : ''}
                  />
                  {validationErrors.name && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'suspended', label: 'Suspended' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className={validationErrors.phone ? 'border-red-500' : ''}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className={validationErrors.website ? 'border-red-500' : ''}
                  />
                  {validationErrors.website && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.website}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <Input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter tenant description"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check size={20} />
                  {editingId ? 'Update Tenant' : 'Create Tenant'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex items-center gap-2 bg-gray-400 hover:bg-gray-500"
                >
                  <X size={20} />
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tenants List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No tenants found. Create one to get started!</p>
            </div>
          ) : (
            tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
              >
                {/* Tenant Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24 relative">
                  {tenant.logo_url && (
                    <img
                      src={tenant.logo_url}
                      alt={tenant.name}
                      className="absolute inset-4 w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  {!tenant.logo_url && (
                    <div className="absolute inset-4 w-16 h-16 rounded-lg bg-blue-400 flex items-center justify-center">
                      <Building2 size={32} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Tenant Content */}
                <div className="p-6 pt-12">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{tenant.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      tenant.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : tenant.status === 'suspended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tenant.status?.toUpperCase()}
                    </span>
                  </div>

                  {tenant.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tenant.description}</p>
                  )}

                  {/* Tenant Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {tenant.phone && (
                      <p className="flex items-center gap-2"><Phone size={16} /> {tenant.phone}</p>
                    )}
                    {tenant.website && (
                      <p className="flex items-center gap-2"><Globe size={16} /> <a href={tenant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tenant.website}</a></p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(tenant)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tenant.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantAdminPage;