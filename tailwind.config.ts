import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0f172a',
        panel: '#111827',
        accent: '#7c6af7'
      },
      boxShadow: {
        glow: '0 24px 80px rgba(124, 106, 247, 0.18)'
      }
    }
  },
  plugins: []
};

export default config;
