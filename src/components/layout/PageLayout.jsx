import React from 'react';
import AdminSidebar from '../ui/AdminSidebar';

/**
 * Unified Page Layout Component
 * Provides consistent layout with sidebar, header, and content area across all pages
 */
const PageLayout = ({
  children,
  headerTitle,
  headerDescription,
  headerActions,
  showSidebar = true,
  className = '',
  headerClassName = '',
  contentClassName = ''
}) => {
  return (
    <div className={`flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden ${className}`}>
      {/* Sidebar */}
      {showSidebar && (
        <div className="flex-shrink-0 w-60 lg:w-60 overflow-hidden">
          <AdminSidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {(headerTitle || headerDescription || headerActions) && (
          <header className={`flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 shadow-sm ${headerClassName}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex-1">
                  {headerTitle && (
                    <h1 className="text-2xl font-bold text-slate-900">{headerTitle}</h1>
                  )}
                  {headerDescription && (
                    <p className="text-sm text-slate-600 mt-1">{headerDescription}</p>
                  )}
                </div>
              </div>
              {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className={`flex-1 overflow-auto ${contentClassName}`}>
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
