/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'app': '#0F1117',
        'surface': '#161B22',
        'elevated': '#1C2128',
        'border': '#30363D',
        'accent': '#2563EB',
        'accent-hover': '#1D4ED8',
        'primary': '#E6EDF3',
        'muted': '#8B949E',
        'status-green': '#238636',
        'status-yellow': '#E3B341',
        'status-red': '#DA3633',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
