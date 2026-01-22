import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const ModuleBreadcrumbs = () => {
  const location = useLocation();

  const routeLabels = {
    '/tenant-admin-dashboard': 'Admin Dashboard',
    '/schema-builder-interface': 'Schema Builder',
    '/dashboard-builder-studio': 'Dashboard Builder',
    '/dynamic-module-list-view': 'Dynamic Modules',
    '/record-detail-management': 'Record Details',
    '/user-management-console': 'User Management',
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location?.pathname?.split('/')?.filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathSegments?.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeLabels?.[currentPath] || segment?.replace(/-/g, ' ')?.replace(/\b\w/g, (l) => l?.toUpperCase());
      breadcrumbs?.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbs?.map((crumb, index) => {
          const isLast = index === breadcrumbs?.length - 1;
          const isMiddle = index > 0 && index < breadcrumbs?.length - 1 && breadcrumbs?.length > 3;

          if (isMiddle && window.innerWidth < 640) {
            return (
              <li key={crumb?.path} className="flex items-center gap-2">
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">...</span>
              </li>
            );
          }

          return (
            <li key={crumb?.path} className="flex items-center gap-2">
              {index > 0 && (
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              )}
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {crumb?.label}
                </span>
              ) : (
                <Link
                  to={crumb?.path}
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  {crumb?.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ModuleBreadcrumbs;