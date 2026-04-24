/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#25D366',
          600: '#25D366',
          700: '#128C7E',
        },
        ui: {
          'bg': '#D3D3D3',
          'muted': '#F5F7FA',
          'mid': '#E1E6EB',
          'dark': '#333842'
        }
      },
      borderRadius: {
        base: '12px',
        lg: '16px'
      },
      boxShadow: {
        card: '0 6px 18px rgba(17,24,39,0.06)'
      }
    }
  },
  plugins: []
}
