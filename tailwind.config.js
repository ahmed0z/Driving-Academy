/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans all JS/JSX files in src
    "./public/index.html"
  ],
  darkMode: 'class', // This is important because your component uses a 'dark' class on <html> [cite: 206]
  theme: {
    extend: {},
  },
  plugins: [],
}