/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#6C5CE7',
          hover: '#7C6FF7',
          muted: 'rgba(108, 92, 231, 0.12)',
          light: '#A29BFE',
        },
        surface: {
          primary: '#0A0A0B',
          secondary: '#111113',
          tertiary: '#1A1A1F',
          input: '#16161A',
          overlay: 'rgba(0, 0, 0, 0.6)',
        },
        content: {
          primary: '#EDEDEF',
          secondary: '#8B8B8E',
          tertiary: '#5C5C63',
        },
        border: {
          DEFAULT: '#222228',
          hover: '#2E2E36',
          accent: '#6C5CE7',
        },
        success: { DEFAULT: '#00C48C', muted: 'rgba(0, 196, 140, 0.12)' },
        warning: { DEFAULT: '#FFB800', muted: 'rgba(255, 184, 0, 0.12)' },
        danger: { DEFAULT: '#FF4757', muted: 'rgba(255, 71, 87, 0.12)' },
        info: { DEFAULT: '#339AF0', muted: 'rgba(51, 154, 240, 0.12)' },
        retro: {
          bg: '#FAF6F1',
          'bg-alt': '#F0EAE0',
          surface: '#FFFFFF',
          text: '#1A1612',
          'text-muted': '#6B5E54',
          border: '#E0D6CC',
          accent: '#CC785C',
          'accent-hover': '#B8654A',
          ink: '#2C2420',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Instrument Serif', 'Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 12px rgba(0, 0, 0, 0.4)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
      spacing: {
        'sidebar': '240px',
        'sidebar-collapsed': '64px',
        'navbar': '56px',
        'right-panel': '320px',
      },
      maxWidth: {
        'feed': '640px',
        'container': '1280px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
