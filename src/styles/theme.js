/**
 * Unified Theme and Styling Configuration
 * Provides consistent colors, spacing, shadows, and component styles across the app
 */

export const theme = {
  // Color Palette
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    success: {
      50: '#f0fdf4',
      500: '#10b981',
      600: '#059669',
    },
    danger: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
    },
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // Border Radius
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Typography
  typography: {
    heading1: 'text-4xl font-bold text-slate-900',
    heading2: 'text-3xl font-bold text-slate-900',
    heading3: 'text-2xl font-bold text-slate-900',
    heading4: 'text-xl font-semibold text-slate-900',
    heading5: 'text-lg font-semibold text-slate-900',
    heading6: 'text-base font-semibold text-slate-900',
    body: 'text-base text-slate-700',
    bodySmall: 'text-sm text-slate-600',
    caption: 'text-xs text-slate-500',
  },

  // Component Classes
  components: {
    // Buttons
    button: {
      base: 'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
      primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
      secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed',
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed',
      ghost: 'text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed',
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      }
    },

    // Cards
    card: 'bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow',
    cardHeader: 'px-6 py-4 border-b border-slate-200',
    cardBody: 'px-6 py-4',
    cardFooter: 'px-6 py-4 border-t border-slate-200',

    // Inputs
    input: 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    inputError: 'border-red-500 focus:ring-red-500',
    inputDisabled: 'bg-slate-100 cursor-not-allowed opacity-50',

    // Badge
    badge: {
      base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      primary: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      slate: 'bg-slate-100 text-slate-800',
    },

    // Alert/Notification
    notification: {
      base: 'flex items-start gap-3 p-4 rounded-lg border',
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    },

    // Table
    table: 'w-full border-collapse',
    tableHeader: 'bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700',
    tableRow: 'border-b border-slate-200 hover:bg-slate-50 transition-colors',
    tableCell: 'px-4 py-3 text-sm text-slate-700',

    // Modal
    modal: 'fixed inset-0 flex items-center justify-center bg-black/50 z-50',
    modalContent: 'bg-white rounded-lg shadow-lg max-w-md w-full mx-4',
  }
};

// Helper function to combine class names with theme values
export const getClassNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Preset gradients for charts and decorative elements
export const gradients = {
  primary: 'from-blue-500 to-cyan-500',
  success: 'from-green-500 to-emerald-500',
  warning: 'from-orange-500 to-yellow-500',
  danger: 'from-red-500 to-pink-500',
  purple: 'from-purple-500 to-pink-500',
};

// Responsive breakpoints
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export default theme;
