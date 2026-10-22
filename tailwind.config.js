/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9f4',
          100: '#d9f0e5',
          200: '#b3e1cb',
          300: '#7dcaaa',
          400: '#4aae87',
          500: '#2d9268',
          600: '#217552',
          700: '#1b5e42',
          800: '#174a36',
          900: '#143d2d',
          950: '#0a2219',
        },
        surface: {
          light:   '#f8faf9',
          DEFAULT: '#0f1117',
          card:    '#1a1d27',
          border:  '#2a2d3e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':      'fadeIn 0.5s ease forwards',
        'fade-up':      'fadeUp 0.5s ease forwards',
        'fade-up-slow': 'fadeUp 0.8s ease forwards',
        'scale-in':     'scaleIn 0.4s ease forwards',
        'slide-down':   'slideDown 0.3s ease forwards',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':        'float 4s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
        'bounce-slow':  'bounce 2s infinite',
        'shimmer':      'shimmer 1.5s infinite',
        'message-in':   'messageIn 0.4s ease forwards',
        'orbit':        'orbit 12s linear infinite',
        'blob':         'blob 8s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        messageIn: {
          '0%':   { opacity: '0', transform: 'translateY(16px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        orbit: {
          '0%':   { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' },
        },
        blob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%':      { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
