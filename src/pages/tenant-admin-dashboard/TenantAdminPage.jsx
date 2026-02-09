import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { tenantService } from '../../services/tenantService';
import { Plus, Edit2, Trash2, Check, X, Building2, Phone, Globe, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import AdminSidebar from '../../components/ui/AdminSidebar';
import { PageContainer, PageCard } from '../../components/layout/PageComponents';

const TenantAdminPage = () => {
  const { user, userTenant } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantService.getAll();
      setTenants(data || []);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      toast.error('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await tenantService.update(editingId, formData);
        toast.success('Tenant updated successfully');
      } else {
        await tenantService.create(formData);
        toast.success('Tenant created successfully');
      }
      
      await fetchTenants();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving tenant:', err);
      toast.error('Failed to save tenant');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;

    try {
      await tenantService.delete(id);
      toast.success('Tenant deleted successfully');
      await fetchTenants();
    } catch (err) {
      console.error('Error deleting tenant:', err);
      toast.error('Failed to delete tenant');
    }
  };

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

  const handleViewTenant = (tenantId) => {
    navigate(`/dynamic-module-list-view?tenantId=${tenantId}`);
  };

  const generateCode = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  };

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
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-3" />
            <p className="text-slate-600">Loading tenants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
              <p className="text-sm text-slate-600 mt-1">Manage and configure all tenants</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              New Tenant
            </button>
          </div>
        </header>

        {/* Content */}
        <PageContainer>
          {/* Form */}
          {showForm && (
            <PageCard title={editingId ? 'Edit Tenant' : 'Create New Tenant'}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter tenant description"
                    rows="3"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check size={18} />
                    {editingId ? 'Update Tenant' : 'Create Tenant'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex items-center gap-2 bg-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-400 transition-colors"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </form>
            </PageCard>
          )}

          {/* Tenants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.length === 0 ? (
              <PageCard className="col-span-full">
                <div className="text-center py-12">
                  <Building2 className="mx-auto text-slate-400 mb-3" size={32} />
                  <p className="text-slate-600">No tenants found. Create one to get started!</p>
                </div>
              </PageCard>
            ) : (
              tenants.map((tenant) => (
                <PageCard key={tenant.id} className="flex flex-col overflow-hidden">
                  {/* Tenant Header */}
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 -m-6 mb-0 h-24 relative cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-colors rounded-t-xl flex items-center px-6"
                    onClick={() => handleViewTenant(tenant.id)}
                  >
                    {tenant.logo_url && (
                      <img
                        src={tenant.logo_url}
                        alt={tenant.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    {!tenant.logo_url && (
                      <div className="w-12 h-12 rounded-lg bg-blue-400 flex items-center justify-center">
                        <Building2 size={24} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Tenant Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3 mt-4">
                      <h3 
                        className="text-lg font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleViewTenant(tenant.id)}
                      >
                        {tenant.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tenant.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : tenant.status === 'suspended'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tenant.status?.toUpperCase()}
                      </span>
                    </div>

                    {tenant.description && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{tenant.description}</p>
                    )}

                    {/* Tenant Details */}
                    <div className="space-y-2 mb-4 text-sm text-slate-600">
                      {tenant.phone && (
                        <p className="flex items-center gap-2"><Phone size={14} /> {tenant.phone}</p>
                      )}
                      {tenant.website && (
                        <p className="flex items-center gap-2"><Globe size={14} /> 
                          <a href={tenant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tenant.website}</a>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => handleViewTenant(tenant.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <ChevronRight size={14} />
                        Open
                      </button>
                      <button
                        onClick={() => handleEdit(tenant)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tenant.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </PageCard>
              ))
            )}
          </div>
        </PageContainer>
      </div>
    </div>
  );
};

export default TenantAdminPage;