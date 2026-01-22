import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/ui/AdminSidebar';

import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import NotificationBadge from '../../components/ui/NotificationBadge';
import Icon from '../../components/AppIcon';
import MetricCard from './components/MetricCard';
import QuickActionCard from './components/QuickActionCard';
import ActivityFeed from './components/ActivityFeed';
import TasksPanel from './components/TasksPanel';
import SystemAlert from './components/SystemAlert';
import { userService } from '../../services/userService';
import { activityService } from '../../services/activityService';
import { taskService } from '../../services/taskService';

const TenantAdminDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersData, activitiesData, tasksData] = await Promise.all([
        userService?.getAll(),
        activityService?.getAll(10),
        taskService?.getAll()
      ]);

      const activeUsers = usersData?.filter(u => u?.status === 'active')?.length || 0;
      const recentActivities = activitiesData?.length || 0;

      setMetrics([
        {
          title: 'Active Users',
          value: activeUsers?.toString(),
          subtitle: 'Across all modules',
          icon: 'Users',
          trend: 'up',
          trendValue: '+12.5%',
          color: 'primary'
        },
        {
          title: 'Total Modules',
          value: '18',
          subtitle: '6 custom created',
          icon: 'Database',
          trend: 'up',
          trendValue: '+3',
          color: 'success'
        },
        {
          title: 'Recent Activity',
          value: recentActivities?.toString(),
          subtitle: 'Last 30 days',
          icon: 'Activity',
          trend: 'up',
          trendValue: '+8.2%',
          color: 'warning'
        },
        {
          title: 'System Health',
          value: '99.8%',
          subtitle: 'Uptime this month',
          icon: 'Heart',
          trend: 'neutral',
          trendValue: 'Stable',
          color: 'success'
        }
      ]);

      setActivities(activitiesData);
      setTasks(tasksData);

      const alerts = [
        {
          id: 1,
          type: 'warning',
          title: 'Storage Limit Approaching',
          message: 'Your organization has used 85% of allocated storage. Consider upgrading your plan.',
          dismissible: true,
          action: {
            label: 'Upgrade Plan',
            onClick: () => console.log('Navigate to billing')
          }
        },
        {
          id: 2,
          type: 'info',
          title: 'New Feature Available',
          message: 'Dashboard Builder now supports custom SQL queries for advanced analytics.',
          dismissible: true,
          action: {
            label: 'Learn More',
            onClick: () => console.log('Navigate to documentation')
          }
        }
      ];

      setSystemAlerts(alerts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
  {
    title: 'Schema Builder',
    description: 'Create and manage custom modules, fields, and data structures for your organization',
    icon: 'Database',
    path: '/schema-builder-interface',
    color: 'primary'
  },
  {
    title: 'Dashboard Builder',
    description: 'Design interactive dashboards with charts, KPIs, and real-time analytics',
    icon: 'PanelTop',
    path: '/dashboard-builder-studio',
    color: 'success'
  },
  {
    title: 'User Management',
    description: 'Manage user accounts, roles, permissions, and access controls',
    icon: 'Users',
    path: '/user-management-console',
    color: 'warning'
  },
  {
    title: 'Dynamic Modules',
    description: 'View and manage all dynamically created modules and their records',
    icon: 'Grid3x3',
    path: '/dynamic-module-list-view',
    color: 'error'
  }];


  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <AdminSidebar isCollapsed={isSidebarCollapsed} />
        <div className={`flex-1 flex items-center justify-center transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar isCollapsed={isSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-elevation-1">
          <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted transition-smooth"
                aria-label="Toggle sidebar">

                <Icon name={isSidebarCollapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} size={20} />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="caption text-muted-foreground hidden md:block">
                  Welcome back, manage your organization
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="relative p-2 rounded-md hover:bg-muted transition-smooth"
                aria-label="Notifications">

                <Icon name="Bell" size={20} />
                <NotificationBadge count={notificationCount} className="absolute -top-1 -right-1" />
              </button>
              <UserProfileDropdown />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
            {systemAlerts?.length > 0 && (
              <div className="space-y-3">
                {systemAlerts?.map((alert) => (
                  <SystemAlert
                    key={alert?.id}
                    type={alert?.type}
                    title={alert?.title}
                    message={alert?.message}
                    dismissible={alert?.dismissible}
                    action={alert?.action}
                    onDismiss={() => setSystemAlerts(systemAlerts?.filter(a => a?.id !== alert?.id))}
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {metrics?.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {quickActions?.map((action, index) => (
                  <QuickActionCard key={index} {...action} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeed activities={activities} />
              <TasksPanel tasks={tasks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default TenantAdminDashboard;