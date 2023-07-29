/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false
  },
  // prefix: 'tw-',
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {},
    screens: {
      xs: '481px', // min-width: 481px
      ...defaultTheme.screens
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
}
// module.exports = {
//   content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
//   theme: {
//     extend: {}
//   },
//   plugins: []
// }
