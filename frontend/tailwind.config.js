/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5bcfd',
          400: '#8098fb',
          500: '#6171f6',   // primary
          600: '#4f52eb',
          700: '#4140d0',
          800: '#3536a8',
          900: '#313385',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark:    '#0f1117',
          card:    '#f8f9fc',
          'card-dark': '#1a1d27',
          border:  '#e4e7f0',
          'border-dark': '#2a2d3a',
        },
        success: { DEFAULT: '#00c896', light: '#e6faf5' },
        warning: { DEFAULT: '#f59e0b', light: '#fef3c7' },
        danger:  { DEFAULT: '#ef4444', light: '#fee2e2' },
        info:    { DEFAULT: '#3b82f6', light: '#eff6ff' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl:  '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card:     '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md': '0 4px 12px 0 rgb(0 0 0 / 0.08)',
        glow:     '0 0 20px 0 rgb(97 113 246 / 0.35)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to:   { transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        shimmer:  'shimmer 2s infinite linear',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.25s ease-out',
        pulse:    'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
