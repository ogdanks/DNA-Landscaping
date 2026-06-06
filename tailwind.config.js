/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        'dna-forest': '#2C5F2D',
        'dna-leaf': '#97BC62',
        'dna-brown': '#8B6F47',
        'dna-cream': '#F5F1E8',
        'dna-char': '#3D3D3D',
        'dna-sky': '#7FB3D5',
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
