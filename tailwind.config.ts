import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nebo: {
          dark: '#1a3a5c',
          primary: '#2c6fad',
          light: '#4a90d9',
        },
      },
    },
  },
  plugins: [],
};

export default config;
