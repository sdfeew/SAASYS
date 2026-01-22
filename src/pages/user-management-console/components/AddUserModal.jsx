import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AddUserModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    department: '',
    jobTitle: '',
    sendInvite: true
  });

  const [errors, setErrors] = useState({});

  const roleOptions = [
    { value: 'admin', label: 'Administrator', description: 'Full system access' },
    { value: 'manager', label: 'Manager', description: 'Team management access' },
    { value: 'user', label: 'User', description: 'Standard user access' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors?.[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onAdd(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="UserPlus" size={20} className="text-primary" />
            </div>
            <h2 className="text-lg font-heading font-semibold text-foreground">Add New User</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} iconName="X" iconSize={20}>
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-custom p-6">
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData?.name}
              onChange={handleInputChange}
              error={errors?.name}
              required
              placeholder="Enter full name"
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData?.email}
              onChange={handleInputChange}
              error={errors?.email}
              required
              placeholder="user@example.com"
              description="An invitation will be sent to this email"
            />

            <Select
              label="Role"
              options={roleOptions}
              value={formData?.role}
              onChange={handleRoleChange}
              required
            />

            <Input
              label="Department"
              name="department"
              value={formData?.department}
              onChange={handleInputChange}
              placeholder="e.g., Sales, Engineering, Marketing"
            />

            <Input
              label="Job Title"
              name="jobTitle"
              value={formData?.jobTitle}
              onChange={handleInputChange}
              placeholder="e.g., Senior Manager, Developer"
            />

            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Mail" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email Invitation</p>
                  <p className="caption text-muted-foreground mt-1">
                    The user will receive an email with instructions to set up their account and create a password.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            iconName="UserPlus"
            iconPosition="left"
            iconSize={16}
          >
            Add User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;