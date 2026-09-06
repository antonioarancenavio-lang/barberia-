import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAF9F6',
        surface: '#FFFFFF',
        ink: '#17171A',
        warm: {
          100: '#F1EEE8',
          300: '#D9D4C8',
          500: '#A39C8C',
          700: '#5C564A',
        },
        accent: {
          DEFAULT: '#B5502A',
          dark: '#8F3F20',
        },
        // Alias por compatibilidad con paginas ya construidas (auth, dashboard).
        brand: {
          DEFAULT: '#17171A',
          light: '#3A3A38',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'ui-serif', 'serif'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
