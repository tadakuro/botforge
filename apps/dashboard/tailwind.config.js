/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080b0f',
        'bg-1': '#0d1117',
        'bg-2': '#111620',
        'bg-3': '#161c28',
        'bg-4': '#1a2130',
        border: '#1e2736',
        'border-bright': '#2a3548',
        accent: '#5865f2',
        'accent-hover': '#4752c4',
        'accent-muted': 'rgba(88,101,242,0.12)',
        success: '#3ba55d',
        danger: '#ed4245',
        warning: '#faa61a',
        text: '#e2e8f0',
        'text-muted': '#8892a4',
        'text-dim': '#64748b',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(88,101,242,0.4)',
        'glow-sm': '0 0 10px rgba(88,101,242,0.3)',
      },
    },
  },
  plugins: [],
}
