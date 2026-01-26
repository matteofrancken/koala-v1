
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        koala: {
          green: '#2D6A4F',
          dark: '#1B4332',
          yellow: '#FFC300',
          light: '#F8F9FA'
        }
      }
    },
  },
  plugins: [],
}
