/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a2e',
          600: '#252540',
          500: '#2f2f4a',
        },
        accent: {
          pink: '#ff6b9d',
          purple: '#c471f5',
          blue: '#12c2e9',
          cyan: '#00f5d4',
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px rgba(196, 113, 245, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(196, 113, 245, 0.6)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

