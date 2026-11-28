/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marino: { DEFAULT: '#123b5c', oscuro: '#0b2840' },
        verde: '#2e7d4f',
        ambar: { DEFAULT: '#d39b1c', tinta: '#1f1300' },
        rojo: '#b42318',
        fondo: '#fffdf8',
        // Texto secundario: contraste AA sobre blanco y sobre el fondo crema.
        tenue: '#5b6470',
        tinta: '#1a1f26',
      },
      fontFamily: {
        // Solo fuentes del sistema: la app funciona sin conexión.
        sans: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        tarjeta: '20px',
      },
      boxShadow: {
        tarjeta: '0 1px 2px rgba(18,59,92,.06), 0 8px 24px rgba(18,59,92,.08)',
        suave: '0 1px 2px rgba(18,59,92,.06), 0 2px 8px rgba(18,59,92,.06)',
      },
    },
  },
  plugins: [],
};
