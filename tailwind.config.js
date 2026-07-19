/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#D4AF37',
          dark: '#A8842A',
        },
        dark: {
          DEFAULT: '#111111',
          2: '#1a1a1a',
          3: '#222222',
          4: '#2d2d2d',
          5: '#333333',
        },
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
