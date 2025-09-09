/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'youtube-red': '#FF0000',
        'creator-blue': '#4285F4',
        'data-green': '#34A853',
        'insight-purple': '#9333EA'
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      animation: {
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 1s infinite'
      }
    },
  },
  plugins: [],
}
