/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5244c2',
          dark: '#4120b9',
          light: '#7a32e0',
          50: '#f0edff',
          100: '#e0d7fe',
          200: '#c4b5f9',
          300: '#a78bfa',
          400: '#8b5cf6',
          500: '#7a32e0',
          600: '#5244c2',
          700: '#4120b9',
          800: '#341a8a',
          900: '#1e1b4b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'glow': '0 0 12px rgba(82,68,194,0.5)',
        'lg': '0 10px 25px -5px rgba(0,0,0,0.08), 0 4px 10px -5px rgba(0,0,0,0.04)',
        'xl': '0 20px 40px -10px rgba(82,68,194,0.12)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(82,68,194,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(122,50,224,0.7)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'count-up': 'count-up 0.5s ease-out both',
        'slide-in-left': 'slide-in-left 0.4s ease-out both',
        'slide-in-right': 'slide-in-right 0.4s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'scale-in': 'scale-in 0.3s ease-out both',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #5244c2, #7a32e0)',
        'gradient-hero': 'linear-gradient(135deg, #f8f7ff, #e0d7fe)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,247,255,0.7))',
      },
    },
  },
  plugins: [],
};
