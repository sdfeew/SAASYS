/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--color-border)', // slate-200
        input: 'var(--color-input)', // slate-200
        ring: 'var(--color-ring)', // teal-700
        background: 'var(--color-background)', // warm-white
        foreground: 'var(--color-foreground)', // slate-800
        primary: {
          DEFAULT: 'var(--color-primary)', // teal-700
          foreground: 'var(--color-primary-foreground)', // white
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', // slate-600
          foreground: 'var(--color-secondary-foreground)', // white
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', // red-600
          foreground: 'var(--color-destructive-foreground)', // white
        },
        muted: {
          DEFAULT: 'var(--color-muted)', // slate-100
          foreground: 'var(--color-muted-foreground)', // slate-500
        },
        accent: {
          DEFAULT: 'var(--color-accent)', // amber-500
          foreground: 'var(--color-accent-foreground)', // gray-800
        },
        popover: {
          DEFAULT: 'var(--color-popover)', // white
          foreground: 'var(--color-popover-foreground)', // slate-800
        },
        card: {
          DEFAULT: 'var(--color-card)', // slate-50
          foreground: 'var(--color-card-foreground)', // slate-700
        },
        success: {
          DEFAULT: 'var(--color-success)', // emerald-600
          foreground: 'var(--color-success-foreground)', // white
        },
        warning: {
          DEFAULT: 'var(--color-warning)', // amber-600
          foreground: 'var(--color-warning-foreground)', // white
        },
        error: {
          DEFAULT: 'var(--color-error)', // red-600
          foreground: 'var(--color-error-foreground)', // white
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)', // 6px
        md: 'var(--radius-md)', // 10px
        lg: 'var(--radius-lg)', // 14px
        xl: 'var(--radius-xl)', // 18px
      },
      fontFamily: {
        heading: ['Crimson Pro', 'Georgia', 'serif'],
        body: ['Source Sans 3', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        caption: ['Inter Tight', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      transitionDuration: {
        '250': '250ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'bounce-subtle': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}