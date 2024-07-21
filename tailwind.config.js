/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,tsx,js,jsx}"],
  important: '#__next',
  theme: {
    extend: {},
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

