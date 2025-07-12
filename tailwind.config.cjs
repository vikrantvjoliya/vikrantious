/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui palette
        background: '#fffbe8',
        primary: '#ff8a65',
        secondary: '#f3ead8',
        accent: '#e1c699',
        danger: '#ef5350',
        gray: {
          50: '#f8f8f8',
          100: '#f3ead8',
          200: '#e1c699',
          300: '#d1c1a1',
          400: '#b5b5b5',
          500: '#7a5548',
          600: '#5d4037',
          700: '#23232b',
          800: '#18181b',
          900: '#000',
        },
      },
      fontFamily: {
        sans: ['Fredoka', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

