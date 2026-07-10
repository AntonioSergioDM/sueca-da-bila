/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,tsx,js,jsx}"],
  important: '#__next',
  theme: {
    extend: {
      // Standardized shadow scale for consistency
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.4)',
        'card-highlight': '0 0 20px rgba(250, 204, 21, 0.6)',
        'glow-yellow': '0 0 10px rgba(250, 204, 21, 0.8)',
        'glow-primary': '0 0 10px rgba(93, 15, 128, 0.8)',
      },
      // Sueca da Bila color palette (shared with the casino UI)
      colors: {
        sueca: {
          primary: '#5D0F80',
          secondary: '#2C043E',
          table: '#7F1D1D', // bg-red-950
          highlight: '#FACC15', // yellow-400
          disabled: '#6B7280', // gray-500
        },
      },
    },
    fontSize: {
      xxs: ['10px', '12px'],
      xxxs: ['8px', '8px'],
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}
