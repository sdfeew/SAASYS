import React from 'react';
import AdminSidebar from '../ui/AdminSidebar';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Higher Order Component for wrapping pages with unified layout, notifications, and styling
 * Usage: const MyPage = withPageLayout(MyPageComponent, { title: 'Page Title' })
 */
const withPageLayout = (Component, options = {}) => {
  const {
    title = '',
    description = '',
    showSidebar = true,
    headerActions = null,
    className = ''
  } = options;

  return function PageLayoutWrapper(props) {
    const toast = useToast();
    const auth = useAuth();

    return (
      <div className={`flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden ${className}`}>
        {/* Sidebar */}
        {showSidebar && (
          <div className="flex-shrink-0 w-60 lg:w-60 overflow-hidden border-r border-slate-200">
            <AdminSidebar />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {title && <h1 className="text-2xl font-bold text-slate-900">{title}</h1>}
                {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
              </div>
              {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
            <Component {...props} toast={toast} auth={auth} />
          </main>
        </div>
      </div>
    );
  };
};

export default withPageLayout;
