import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import AdminSidebar from '../../components/ui/AdminSidebar';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import NotificationBadge from '../../components/ui/NotificationBadge';
import UserTableRow from './components/UserTableRow';
import UserCard from './components/UserCard';
import UserDetailsPanel from './components/UserDetailsPanel';
import AddUserModal from './components/AddUserModal';
import RoleManagementModal from './components/RoleManagementModal';
import BulkActionsModal from './components/BulkActionsModal';
import { userService } from '../../services/userService';

const UserManagementConsole = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService?.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const roleFilterOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'user', label: 'User' },
    { value: 'viewer', label: 'Viewer' }
  ];

  const statusFilterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         user?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesRole = roleFilter === 'all' || user?.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user?.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsPanel(true);
  };

  const handleToggleStatus = (userId, currentStatus) => {
    setUsers(users?.map(user => {
      if (user?.id === userId) {
        return {
          ...user,
          status: currentStatus === 'active' ? 'inactive' : 'active'
        };
      }
      return user;
    }));
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(users?.map(user => {
      if (user?.id === userId) {
        return { ...user, role: newRole };
      }
      return user;
    }));
  };

  const handleSaveUser = (updatedUser) => {
    setUsers(users?.map(user => user?.id === updatedUser?.id ? updatedUser : user));
    setShowDetailsPanel(false);
  };

  const handleAddUser = (newUserData) => {
    const newUser = {
      id: users?.length + 1,
      ...newUserData,
      status: 'active',
      lastLogin: null
    };
    setUsers([...users, newUser]);
    setShowAddUserModal(false);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userService?.delete(userId);
      setUsers(users?.filter(u => u?.id !== userId));
      if (selectedUser?.id === userId) {
        setShowDetailsPanel(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await userService?.update(userId, updates);
      setUsers(users?.map(u => u?.id === userId ? { ...u, ...updates } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, ...updates });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleBulkAction = ({ action, targetRole, userIds }) => {
    setUsers(users?.map(user => {
      if (userIds?.includes(user?.id)) {
        switch (action) {
          case 'activate':
            return { ...user, status: 'active' };
          case 'deactivate':
            return { ...user, status: 'inactive' };
          case 'changeRole':
            return { ...user, role: targetRole };
          default:
            return user;
        }
      }
      return user;
    }));

    if (action === 'delete') {
      setUsers(users?.filter(user => !userIds?.includes(user?.id)));
    }

    setSelectedUsers([]);
    setShowBulkActions(false);
  };

  const handleSelectUser = (user, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, user]);
    } else {
      setSelectedUsers(selectedUsers?.filter(u => u?.id !== user?.id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(filteredUsers);
    } else {
      setSelectedUsers([]);
    }
  };

  const isUserSelected = (userId) => {
    return selectedUsers?.some(u => u?.id === userId);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <AdminSidebar isCollapsed={sidebarCollapsed} />
        <div className={`flex-1 flex items-center justify-center transition-smooth ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} />
      <div className={`transition-smooth ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-elevation-1">
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted transition-smooth"
              aria-label="Toggle sidebar"
            >
              <Icon name={sidebarCollapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} size={20} />
            </button>

            <div className="flex items-center gap-3 md:gap-4 ml-auto">
              <button className="relative p-2 rounded-md hover:bg-muted transition-smooth">
                <Icon name="Bell" size={20} />
                <NotificationBadge count={3} className="absolute -top-1 -right-1" />
              </button>
              <UserProfileDropdown />
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <ModuleBreadcrumbs />

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
              User Management Console
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage user accounts, roles, and permissions across your organization
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="Users" size={20} className="text-primary md:w-6 md:h-6" />
                </div>
                <span className="text-xs md:text-sm text-success font-medium">+12%</span>
              </div>
              <p className="caption text-muted-foreground mb-1">Total Users</p>
              <p className="text-2xl md:text-3xl font-heading font-semibold text-foreground">{users?.length}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Icon name="UserCheck" size={20} className="text-success md:w-6 md:h-6" />
                </div>
                <span className="text-xs md:text-sm text-success font-medium">+5%</span>
              </div>
              <p className="caption text-muted-foreground mb-1">Active Users</p>
              <p className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                {users?.filter(u => u?.status === 'active')?.length}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Icon name="Shield" size={20} className="text-warning md:w-6 md:h-6" />
                </div>
                <span className="text-xs md:text-sm text-muted-foreground">4 roles</span>
              </div>
              <p className="caption text-muted-foreground mb-1">Administrators</p>
              <p className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                {users?.filter(u => u?.role === 'admin')?.length}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-accent md:w-6 md:h-6" />
                </div>
                <span className="text-xs md:text-sm text-muted-foreground">Last 24h</span>
              </div>
              <p className="caption text-muted-foreground mb-1">Recent Logins</p>
              <p className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                {users?.filter(u => u?.lastLogin && (Date.now() - u?.lastLogin?.getTime()) < 86400000)?.length}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-elevation-2">
            <div className="p-4 md:p-6 border-b border-border">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="search"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target?.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    options={roleFilterOptions}
                    value={roleFilter}
                    onChange={setRoleFilter}
                    className="w-full sm:w-40"
                  />
                  <Select
                    options={statusFilterOptions}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    className="w-full sm:w-40"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAddUserModal(true)}
                  iconName="UserPlus"
                  iconPosition="left"
                  iconSize={16}
                >
                  Add User
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(true)}
                  disabled={selectedUsers?.length === 0}
                  iconName="Users"
                  iconPosition="left"
                  iconSize={16}
                >
                  Bulk Actions ({selectedUsers?.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoleManagement(true)}
                  iconName="Shield"
                  iconPosition="left"
                  iconSize={16}
                >
                  Role Management
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  iconPosition="left"
                  iconSize={16}
                >
                  Export
                </Button>
              </div>
            </div>

            <div className="hidden lg:block overflow-x-auto scrollbar-custom">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <Checkbox
                        checked={selectedUsers?.length === filteredUsers?.length && filteredUsers?.length > 0}
                        onChange={(e) => handleSelectAll(e?.target?.checked)}
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">User</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Last Login</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers?.map((user) => (
                    <React.Fragment key={user?.id}>
                      <tr className="border-b border-border hover:bg-muted/50 transition-smooth">
                        <td className="px-6 py-4">
                          <Checkbox
                            checked={isUserSelected(user?.id)}
                            onChange={(e) => handleSelectUser(user, e?.target?.checked)}
                          />
                        </td>
                        <td colSpan={5} className="p-0">
                          <UserTableRow
                            user={user}
                            onViewDetails={handleViewDetails}
                            onToggleStatus={handleToggleStatus}
                            onRoleChange={handleRoleChange}
                            onDelete={handleDeleteUser}
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden p-4 space-y-4">
              {filteredUsers?.map((user) => (
                <UserCard
                  key={user?.id}
                  user={user}
                  onViewDetails={handleViewDetails}
                  onToggleStatus={handleToggleStatus}
                  onRoleChange={handleRoleChange}
                />
              ))}
            </div>

            {filteredUsers?.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Icon name="Users" size={32} className="text-muted-foreground" />
                </div>
                <p className="text-base text-foreground font-medium mb-2">No users found</p>
                <p className="caption text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      {showDetailsPanel && selectedUser && (
        <UserDetailsPanel
          user={selectedUser}
          onClose={() => setShowDetailsPanel(false)}
          onSave={handleSaveUser}
        />
      )}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onAdd={handleAddUser}
        />
      )}
      {showRoleManagement && (
        <RoleManagementModal onClose={() => setShowRoleManagement(false)} />
      )}
      {showBulkActions && selectedUsers?.length > 0 && (
        <BulkActionsModal
          selectedUsers={selectedUsers}
          onClose={() => setShowBulkActions(false)}
          onApply={handleBulkAction}
        />
      )}
    </div>
  );
};

export default UserManagementConsole;