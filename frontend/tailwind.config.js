/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'trust-green': '#4ade80',
        'warning-yellow': '#facc15',
        'danger-red': '#f87171',
      },
    },
  },
  plugins: [],
}