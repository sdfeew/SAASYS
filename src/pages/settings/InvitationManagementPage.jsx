import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { invitationService } from '../../services/invitationService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const InvitationManagementPage = () => {
  const { tenantId, user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    roleCode: 'user'
  });

  // Load invitations
  useEffect(() => {
    loadInvitations();
  }, [tenantId]);

  const loadInvitations = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    const result = await invitationService.getAllInvitations(tenantId);
    if (result.success) {
      setInvitations(result.data || []);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    const result = await invitationService.sendInvitation(
      tenantId,
      formData.email,
      formData.roleCode
    );

    if (result.success) {
      setSuccess(`Invitation created! Copy the link below to send to the user:\n${result.invitationUrl}`);
      setFormData({ email: '', roleCode: 'user' });
      await loadInvitations();
      setTimeout(() => setShowForm(false), 2000);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure? This will make the invitation link invalid.')) return;

    setLoading(true);
    const result = await invitationService.revokeInvitation(id);
    if (result.success) {
      setSuccess('Invitation revoked');
      await loadInvitations();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleResend = async (id) => {
    setLoading(true);
    const result = await invitationService.resendInvitation(id);
    if (result.success) {
      setSuccess('Invitation resent with new expiration date');
      await loadInvitations();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      owner: 'bg-purple-100 text-purple-800',
      editor: 'bg-blue-100 text-blue-800',
      viewer: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.user;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Team Invitations</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage invitations and add new team members
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            iconName="Plus"
            className="gap-2"
          >
            Send Invitation
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm whitespace-pre-wrap">{success}</p>
        </div>
      )}

      {/* New Invitation Form */}
      {showForm && (
        <div className="m-6 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Send New Invitation</h2>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="user@example.com"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Role
                </label>
                <select
                  name="roleCode"
                  value={formData.roleCode}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
              >
                Create Invitation
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Invitations List */}
      <div className="m-6">
        {loading && !showForm ? (
          <div className="text-center py-12">
            <Icon name="Loader2" className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading invitations...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Icon name="Mail" className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No invitations yet</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Expires</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv, idx) => (
                  <tr key={inv.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="px-6 py-4 text-sm">{inv.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(inv.role_code)}`}>
                        {inv.role_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {inv.status === 'pending' || inv.status === 'sent' ? (
                          <>
                            <button
                              onClick={() => copyToClipboard(`${window.location.origin}/auth/invite?code=${inv.code}&email=${encodeURIComponent(inv.email)}`)}
                              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                              title="Copy invitation link"
                            >
                              Copy Link
                            </button>
                            <button
                              onClick={() => handleRevoke(inv.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationManagementPage;
