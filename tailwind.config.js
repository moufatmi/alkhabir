/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d9fe',
          300: '#a3c0fc',
          400: '#7a9ef8',
          500: '#5379f2',
          600: '#345ae7',
          700: '#2644d0',
          800: '#1e3a8a', // Deep Royal Blue (Brand Core)
          900: '#1e3271',
          950: '#151f44',
        },
        gold: {
          50: '#fffbf0',
          100: '#fef5d6',
          200: '#fce9ad',
          300: '#fbda78',
          400: '#faca48',
          500: '#f59e0b', // Base Gold
          600: '#d97706', // Deep Gold (Brand Secondary)
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
        serif: ['"Aref Ruqaa"', 'serif'],
        cairo: ['Cairo', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
