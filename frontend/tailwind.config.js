/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3daf0',
          300: '#94c0e6',
          400: '#5e9fd8',
          500: '#3882c7',
          600: '#2567ad',
          700: '#1e528d',
          800: '#1d4674',
          900: '#0f294a', // Deep Government Navy
          950: '#0a1a30',
        },
        risk: {
          low: '#10b981',      // Emerald Green
          medium: '#f59e0b',   // Amber
          high: '#ef4444',     // Crimson Red
          critical: '#991b1b', // Dark Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
