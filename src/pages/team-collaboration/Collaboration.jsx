import React, { useState } from 'react';
import { Users2, Plus, Mail, UserCheck, Trash2, Clock, MessageSquare, Activity, Share2, Settings, Send } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer, PageCard, PageGrid, PageSection } from '../../components/layout/PageComponents';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Icon from '../../components/AppIcon';

const CollaborationPage = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, email: 'john@example.com', name: 'John Doe', role: 'Admin', status: 'active', joinedDate: '2024-01-15', avatar: '👨' },
    { id: 2, email: 'jane@example.com', name: 'Jane Smith', role: 'Manager', status: 'active', joinedDate: '2024-02-01', avatar: '👩' }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('User');
  const [loading, setLoading] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const activities = [
    { id: 1, type: 'member_joined', user: 'Jane Smith', action: 'joined the team', timestamp: Date.now() - 86400000, icon: 'UserPlus' },
    { id: 2, type: 'dashboard_shared', user: 'John Doe', action: 'shared Dashboard Q1 Report', timestamp: Date.now() - 172800000, icon: 'Share2' },
    { id: 3, type: 'module_created', user: 'Jane Smith', action: 'created Sales Module', timestamp: Date.now() - 259200000, icon: 'Package' },
    { id: 4, type: 'permission_updated', user: 'John Doe', action: 'updated permissions', timestamp: Date.now() - 345600000, icon: 'Lock' },
    { id: 5, type: 'data_exported', user: 'Jane Smith', action: 'exported data report', timestamp: Date.now() - 432000000, icon: 'Download' }
  ];

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.warning('Please enter an email address');
      return;
    }
    try {
      setLoading(true);
      const newMember = {
        id: teamMembers.length + 1,
        email: inviteEmail,
        name: inviteEmail.split('@')[0],
        role: inviteRole,
        status: 'pending',
        joinedDate: new Date().toISOString().split('T')[0],
        avatar: '👤'
      };
      setTeamMembers([...teamMembers, newMember]);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('User');
      setShowInviteForm(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id) => {
    const member = teamMembers.find(m => m.id === id);
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast.success(`${member.name} removed from team`);
  };

  const handleRoleChange = (id, newRole) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, role: newRole } : m));
    toast.success('Role updated');
  };

  const handleResendInvite = (id) => {
    const member = teamMembers.find(m => m.id === id);
    toast.success(`Invitation resent to ${member.email}`);
  };

  const stats = [
    { label: 'Team Members', value: teamMembers.length, icon: 'Users', color: 'blue' },
    { label: 'Active Members', value: teamMembers.filter(m => m.status === 'active').length, icon: 'UserCheck', color: 'green' },
    { label: 'Pending Invites', value: teamMembers.filter(m => m.status === 'pending').length, icon: 'Clock', color: 'yellow' }
  ];

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const roles = ['Admin', 'Manager', 'User', 'Viewer'];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-elevation-1">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users2 className="text-primary" size={20} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">Team Collaboration</h1>
                <p className="text-sm text-muted-foreground">Manage team members and collaborate together</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <PageContainer>
            {/* Stats */}
            <PageSection>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, idx) => (
                  <PageCard key={idx}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-heading font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                        <Icon name={stat.icon} size={24} />
                      </div>
                    </div>
                  </PageCard>
                ))}
              </div>
            </PageSection>

            {/* Team Members */}
            <PageSection>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Team Members ({teamMembers.length})</h2>
                {!showInviteForm && (
                  <button
                    onClick={() => setShowInviteForm(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth text-sm font-medium flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Invite Member
                  </button>
                )}
              </div>

              {showInviteForm && (
                <PageCard className="mb-6 border-primary/50">
                  <form onSubmit={handleInvite} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="example@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowInviteForm(false)}
                        className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-smooth"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth disabled:opacity-50 flex items-center gap-2"
                      >
                        <Mail size={16} />
                        Send Invitation
                      </button>
                    </div>
                  </form>
                </PageCard>
              )}

              <div className="space-y-3">
                {teamMembers.length === 0 ? (
                  <PageCard>
                    <div className="text-center py-12">
                      <Users2 size={40} className="mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">No team members yet</p>
                    </div>
                  </PageCard>
                ) : (
                  teamMembers.map((member) => (
                    <PageCard key={member.id} className="hover:shadow-elevation-2 transition-shadow">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg">
                            {member.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div>
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                                member.role === 'Admin' 
                                  ? 'bg-accent/10 text-accent border-accent/30'
                                  : 'bg-muted text-foreground border-border'
                              }`}
                            >
                              {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          </div>

                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            member.status === 'active'
                              ? 'bg-success/10 text-success'
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {member.status === 'active' ? '✓ Active' : '⧠ Pending'}
                          </div>

                          {member.status === 'pending' && (
                            <button
                              onClick={() => handleResendInvite(member.id)}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-smooth"
                              title="Resend invitation"
                            >
                              <Send size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => handleRemove(member.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-smooth"
                            title="Remove member"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </PageCard>
                  ))
                )}
              </div>
            </PageSection>

            {/* Recent Activity */}
            <PageSection title="Recent Activity">
              <div className="space-y-3">
                {activities.map((activity) => (
                  <PageCard key={activity.id}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon name={activity.icon} size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  </PageCard>
                ))}
              </div>
            </PageSection>
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

export default CollaborationPage;
