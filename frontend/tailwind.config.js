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
        // Background layers
        bg: {
          primary:   '#0B1120',
          secondary: '#111827',
          tertiary:  '#0F172A',
          card:      '#131E35',
          glass:     'rgba(17,24,39,0.7)',
        },
        // Accent
        accent: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
        },
        // Status
        critical: '#EF4444',
        warning:  '#F59E0B',
        success:  '#10B981',
        info:     '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glow-blue':     '0 0 20px rgba(59,130,246,0.35)',
        'glow-cyan':     '0 0 20px rgba(6,182,212,0.35)',
        'glow-red':      '0 0 20px rgba(239,68,68,0.35)',
        'glow-amber':    '0 0 20px rgba(245,158,11,0.35)',
        'glow-green':    '0 0 20px rgba(16,185,129,0.35)',
        'glass':         '0 8px 32px rgba(0,0,0,0.4)',
        'card':          '0 4px 24px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':     'fadeIn 0.5s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 10px rgba(59,130,246,0.3)' },
          '50%':     { boxShadow: '0 0 30px rgba(59,130,246,0.7)' },
        },
      },
    },
  },
  plugins: [],
}
