/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f5f0e8',
        'cream-dark': '#ede8df',
        ink: '#1a1a18',
        'ink-light': '#5a5a56',
        gold: '#b8860b',
        'gold-light': '#d4a017',
        'gold-bg': '#fdf8ee',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"DM Mono"', '"Courier New"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
