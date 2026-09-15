/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        sans: ['"Open Sans"', 'sans-serif'],
      },
      colors: {
        // Terracota: color primario de marca (botones principales, links activos).
        brasa: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F2751A',
          600: '#C2410C',
          700: '#9A3412',
          800: '#7C2D12',
          900: '#641E09',
        },
        // Ambar: color secundario, para acentos, badges y CTAs de menor jerarquia.
        ambar: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34E',
          400: '#FBBF24',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
        },
        // Crema: escala neutra calida para fondos, tarjetas y bordes.
        crema: {
          25: '#FFFDFB',
          50: '#FEFAF6',
          100: '#FDF2E9',
          200: '#F8E4D2',
          300: '#F0D3B8',
        },
        // Tinta: escala neutra calida (marron oscuro) para texto, en vez de gris frio.
        tinta: {
          900: '#2A1A10',
          700: '#4A3626',
          500: '#7A6553',
          400: '#A8927F',
        },
        // Semanticos: liderando/exito, superado/error, advertencia de tiempo.
        exito: { 50: '#ECFDF3', 500: '#16A34A', 600: '#15803D' },
        peligro: { 50: '#FEF2F2', 500: '#DC2626', 600: '#B91C1C' },
        advertencia: { 50: '#FFFBEB', 500: '#F59E0B', 600: '#D97706' },
      },
      boxShadow: {
        calido: '0 4px 16px -4px rgb(154 52 18 / 0.18)',
      },
      keyframes: {
        pulseUrgente: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.55 },
        },
        entrada: {
          from: { opacity: 0, transform: 'translateY(6px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulso-urgente': 'pulseUrgente 1s ease-in-out infinite',
        entrada: 'entrada 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
