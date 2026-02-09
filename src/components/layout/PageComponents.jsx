import React from 'react';

/**
 * Unified Page Container with card/panel layout
 * Provides consistent padding, background, and structure
 */
export const PageContainer = ({ children, className = '' }) => (
  <div className={`flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 p-6 ${className}`}>
    {children}
  </div>
);

/**
 * Card/Panel component for content sections
 */
export const PageCard = ({ children, className = '', title, description, action, footer }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {/* Header */}
    {(title || description || action) && (
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex-1">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )}

    {/* Content */}
    <div className="px-6 py-4">
      {children}
    </div>

    {/* Footer */}
    {footer && (
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
        {footer}
      </div>
    )}
  </div>
);

/**
 * Page Header Section
 */
export const PageHeader = ({ title, description, action, children }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex-1">
        {title && <h1 className="text-3xl font-bold text-slate-900">{title}</h1>}
        {description && <p className="text-slate-600 mt-2">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0 flex items-center gap-3">{action}</div>}
    </div>
    {children}
  </div>
);

/**
 * Grid Layout for multiple cards
 */
export const PageGrid = ({ children, cols = 1, className = '' }) => {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }[cols] || 'grid-cols-1';

  return (
    <div className={`grid ${colsClass} gap-6 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Section with title and divider
 */
export const PageSection = ({ title, children, className = '' }) => (
  <div className={className}>
    {title && (
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900 pb-3 border-b-2 border-slate-200">{title}</h2>
      </div>
    )}
    {children}
  </div>
);

/**
 * Loading State Card
 */
export const LoadingCard = ({ message = 'Loading...' }) => (
  <PageCard>
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
          <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  </PageCard>
);

export default {
  PageContainer,
  PageCard,
  PageHeader,
  PageGrid,
  PageSection,
  LoadingCard
};
