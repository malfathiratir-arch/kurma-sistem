/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', //
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kurma: {
          50: '#fef9ee',
          100: '#fdf0d0',
          200: '#f9dc9d',
          300: '#f6c361',
          400: '#f2a72d',
          500: '#ef8c0e',
          600: '#d46b08',
          700: '#b04e0a',
          800: '#8e3d10',
          900: '#743310',
          950: '#3f1906',
        },
        emerald: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        arabic: ['Georgia', 'serif'],
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
