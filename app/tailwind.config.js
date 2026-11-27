/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marino: '#123b5c',
        verde: '#2e7d4f',
        ambar: '#d39b1c',
        rojo: '#b42318',
        fondo: '#fffdf8',
      },
    },
  },
  plugins: [],
};
