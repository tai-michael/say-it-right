/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false
  },
  prefix: 'tw-',
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {}
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
