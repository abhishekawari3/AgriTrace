/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#16a34a', light: '#22c55e', dark: '#15803d' },
        chain:    { DEFAULT: '#0ea5e9', dark: '#0284c7' }
      }
    }
  },
  plugins: []
};
