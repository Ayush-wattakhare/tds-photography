/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#EEECE2',
        tan: '#B5A98A',
        'tan-dark': '#8C7E5E',
        olive: '#7A6A3E',
      },
      fontFamily: {
        now: ['Jost', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
