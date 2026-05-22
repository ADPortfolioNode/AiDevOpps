import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#050505',
        panel: '#111827',
        accent: '#7c6af7'
      },
      boxShadow: {
        glow: '0 24px 80px rgba(124, 106, 247, 0.18)'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        backgroundShine: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'background-shine': 'backgroundShine 15s ease infinite',
      },
    }
  },
  plugins: []
};

export default config;
