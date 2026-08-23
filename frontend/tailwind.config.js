/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        oner: {
          bg: '#080d14',
          surface: '#0d1526',
          card: '#111c30',
          border: '#1a2d4a',
          accent: '#00d4a4',
          'accent-dim': '#00d4a420',
          'accent-glow': '#00d4a440',
          green: '#00ff88',
          blue: '#0ea5e9',
          amber: '#f59e0b',
          red: '#ef4444',
          muted: '#4a6080',
          text: '#e2eaf4',
          'text-dim': '#7a8fa8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(0,212,164,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,164,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0,212,164,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0,212,164,0.6), 0 0 40px rgba(0,212,164,0.2)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'accent': '0 0 20px rgba(0,212,164,0.3)',
        'critical': '0 0 20px rgba(239,68,68,0.3)',
        'amber': '0 0 20px rgba(245,158,11,0.3)',
      },
    },
  },
  plugins: [],
}
