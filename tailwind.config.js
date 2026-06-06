/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dna-forest': '#2C5F2D',
        'dna-leaf': '#97BC62',
        'dna-brown': '#8B6F47',
        'dna-cream': '#F5F1E8',
        'dna-char': '#3D3D3D',
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
