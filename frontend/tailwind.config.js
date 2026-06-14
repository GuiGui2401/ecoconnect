/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'green-primary': '#1a7a3c',
        'green-mid':     '#27ae60',
        'green-light':   '#2ecc71',
        'green-pale':    '#e8f5e9',
        'eco-dark':      '#1a1a2e',
        'eco-dark2':     '#16213e',
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Space Grotesk', 'ui-sans-serif', 'system-ui'],
      },
      borderWidth: { 3: '3px' },
    },
  },
  plugins: [],
}
