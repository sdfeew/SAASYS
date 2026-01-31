import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { moduleService } from '../../services/moduleService';
import { dashboardService } from '../../services/dashboardService';
import { getLangText } from '../../utils/languageUtils';


const AdminSidebar = ({ isCollapsed = false }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mainModules, setMainModules] = useState([]);
  const [subModules, setSubModules] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    modules: true,
    dashboards: true
  });
  const [expandedMainModules, setExpandedMainModules] = useState(new Set());
  const [loadingData, setLoadingData] = useState(false);
  const { tenantId, roleCode } = useAuth();
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
      label: 'Dashboard Management',
      path: '/dashboard-management',
      icon: 'BarChart3',
      permissions: ['admin', 'user'],
    },
    {
      label: 'User Management',
      path: '/user-management-console',
      icon: 'Users',
      permissions: ['admin'],
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: 'BarChart2',
      permissions: ['admin', 'manager'],
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: 'Settings',
      permissions: ['admin', 'manager', 'user'],
    },
    {
      label: 'Help & Documentation',
      path: '/help',
      icon: 'HelpCircle',
      permissions: ['admin', 'manager', 'user'],
    },
    {
      label: 'Team Collaboration',
      path: '/collaboration',
      icon: 'Users2',
      permissions: ['admin', 'manager', 'user'],
    },
    {
      label: 'Integrations',
      path: '/integrations',
      icon: 'Plug',
      permissions: ['admin'],
    },
    {
      label: 'Testing & QA',
      path: '/testing',
      icon: 'Bug',
      permissions: ['admin'],
    },
    {
      label: 'Backups',
      path: '/backups',
      icon: 'HardDrive',
      permissions: ['admin'],
    },
  ];

  // Load modules and dashboards
  useEffect(() => {
    if (tenantId && !isCollapsed) {
      loadData();
    }
  }, [tenantId, isCollapsed]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      // Load both main modules and sub-modules for this tenant
      const mainModulesData = await moduleService?.getAllMainModules();
      setMainModules(mainModulesData || []);
      
      const subModulesData = await moduleService?.getAllSubModules(tenantId);
      setSubModules(subModulesData || []);
      
      // Load dashboards
      const dashboardsData = await dashboardService?.getAll(tenantId);
      setDashboards(dashboardsData || []);
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleMainModule = (moduleId) => {
    const newExpanded = new Set(expandedMainModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedMainModules(newExpanded);
  };

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
        className={`admin-sidebar fixed lg:fixed top-0 left-0 h-full bg-card border-r border-border z-40 transition-smooth flex flex-col ${
          isCollapsed ? 'collapsed w-20' : 'w-60'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="admin-sidebar-header flex-shrink-0">
          <div className="flex items-center gap-3 p-4">
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
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-custom px-3 py-6" aria-label="Main navigation">
          <ul className="space-y-2">
            {navigationItems?.map((item) => {
              // Check if user has permission to see this item
              // Show item if no permissions specified or if user has one of the required roles
              if (item?.permissions && item?.permissions?.length > 0) {
                if (!roleCode || !item?.permissions.includes(roleCode)) {
                  return null;
                }
              }
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

            {/* Modules Section */}
            {!isCollapsed && mainModules?.length > 0 && (
              <>
                <li className="pt-4 mt-4 border-t border-border">
                  <button
                    onClick={() => toggleSection('modules')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon 
                      name={expandedSections.modules ? 'ChevronDown' : 'ChevronRight'} 
                      size={16} 
                    />
                    <span>Modules ({mainModules.length})</span>
                  </button>
                </li>
                {expandedSections.modules && mainModules?.map(mainModule => {
                  const mainModuleName = getLangText(mainModule?.name, 'en') || mainModule?.name || 'Unnamed';
                  const moduleSubModules = subModules?.filter(sm => sm?.main_module_id === mainModule?.id) || [];
                  const isExpanded = expandedMainModules?.has(mainModule?.id);
                  
                  return (
                    <div key={mainModule?.id}>
                      <li className="ml-4">
                        <button
                          onClick={() => toggleMainModule(mainModule?.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-smooth"
                          title={mainModuleName}
                        >
                          <Icon 
                            name={isExpanded ? 'ChevronDown' : 'ChevronRight'} 
                            size={14} 
                            className="flex-shrink-0 text-muted-foreground"
                          />
                          <Icon name={mainModule?.icon || 'Layers'} size={16} className="text-primary flex-shrink-0" />
                          <span className="truncate">{mainModuleName}</span>
                        </button>
                      </li>
                      {isExpanded && moduleSubModules?.map(subModule => {
                        const subModuleName = getLangText(subModule?.name, 'en') || subModule?.name || 'Unnamed';
                        return (
                          <li key={subModule?.id} className="ml-12">
                            <Link
                              to={`/dynamic-module-list-view?moduleId=${subModule?.id}`}
                              onClick={handleNavClick}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-smooth truncate"
                              title={subModuleName}
                            >
                              <Icon name={subModule?.icon || 'Database'} size={14} className="text-secondary flex-shrink-0" />
                              <span className="truncate text-xs">{subModuleName}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}

            {/* Dashboards Section */}
            {!isCollapsed && dashboards?.length > 0 && (
              <>
                <li className="pt-4 mt-4 border-t border-border">
                  <button
                    onClick={() => toggleSection('dashboards')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon 
                      name={expandedSections.dashboards ? 'ChevronDown' : 'ChevronRight'} 
                      size={16} 
                    />
                    <span>Dashboards ({dashboards.length})</span>
                  </button>
                </li>
                {expandedSections.dashboards && dashboards?.map(dashboard => {
                  const dashboardName = getLangText(dashboard?.name, 'en') || dashboard?.name || 'Unnamed';
                  return (
                    <li key={dashboard?.id} className="ml-4">
                      <Link
                        to={`/dashboard-viewer?id=${dashboard?.id}`}
                        onClick={handleNavClick}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-smooth truncate ${
                          dashboard?.is_published
                            ? 'text-foreground hover:bg-muted'
                            : 'text-muted-foreground hover:bg-muted opacity-60'
                        }`}
                        title={dashboardName}
                      >
                        <Icon 
                          name={dashboard?.is_published ? 'Eye' : 'EyeOff'} 
                          size={16} 
                          className="flex-shrink-0" 
                        />
                        <span className="truncate">{dashboardName}</span>
                      </Link>
                    </li>
                  );
                })}
              </>
            )}
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