import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';


const AdminSidebar = ({ isCollapsed = false }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Admin Dashboard',
      path: '/tenant-admin-dashboard',
      icon: 'LayoutDashboard',
      permissions: ['admin'],
    },
    {
      label: 'Schema Builder',
      path: '/schema-builder-interface',
      icon: 'Database',
      permissions: ['admin'],
    },
    {
      label: 'Dashboard Builder',
      path: '/dashboard-builder-studio',
      icon: 'PanelTop',
      permissions: ['admin'],
    },
    {
      label: 'User Management',
      path: '/user-management-console',
      icon: 'Users',
      permissions: ['admin'],
    },
    {
      label: 'Dynamic Modules',
      path: '/dynamic-module-list-view',
      icon: 'Grid3x3',
      permissions: ['user', 'admin'],
    },
    {
      label: 'Record Details',
      path: '/record-detail-management',
      icon: 'FileText',
      permissions: ['user', 'admin'],
    },
  ];

  const isActiveRoute = (path) => {
    return location?.pathname === path;
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleNavClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={handleMobileToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card text-foreground p-2 rounded-md shadow-elevation-2 transition-smooth hover:shadow-elevation-3"
        aria-label="Toggle navigation menu"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} />
      </button>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background z-40 lg:hidden"
          onClick={handleMobileToggle}
          aria-hidden="true"
        />
      )}
      <aside
        className={`admin-sidebar fixed lg:fixed top-0 left-0 h-full bg-card border-r border-border z-40 transition-smooth ${
          isCollapsed ? 'collapsed w-20' : 'w-60'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <Icon name="Layers" size={24} />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="text-lg font-heading font-semibold text-foreground">
                TenantFlow
              </h1>
              <p className="caption text-muted-foreground">SaaS Platform</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-custom px-3 py-6" aria-label="Main navigation">
          <ul className="space-y-2">
            {navigationItems?.map((item) => {
              const isActive = isActiveRoute(item?.path);
              return (
                <li key={item?.path}>
                  <Link
                    to={item?.path}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-smooth ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-elevation-1'
                        : 'text-foreground hover:bg-muted hover:text-foreground'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon name={item?.icon} size={20} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item?.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="User" size={16} className="text-primary" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                <p className="caption text-muted-foreground truncate">admin@tenantflow.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;