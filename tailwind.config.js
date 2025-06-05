/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Definições de cores para o "azul bebê" e seus complementos
      colors: {
        'blue-950': '#070F2B',
        'blue-900': '#1B2A4B',
        'indigo-950': '#1F2A60',
        'sky-400': '#7DD3FC',
        'sky-300': '#BAE6FD',
        'sky-500': '#0EA5E9',
        'sky-600': '#0284C7',
        'sky-700': '#0369A1',
        'cyan-400': '#22D3EE',
        'cyan-500': '#06B6D4',
        'cyan-600': '#0891B2',
        'green-400': '#4ADE80',
        'green-500': '#22C55E',
        'red-400': '#F87171',
        'red-500': '#EF4444',
        'yellow-400': '#FACC15',
        'yellow-500': '#EAB308',
        'purple-400': '#C084FC',
        'purple-500': '#A855F7',
        'indigo-400': '#818CF8',
        'indigo-500': '#6366F1',
      },
    },
  },
  plugins: [],
}
