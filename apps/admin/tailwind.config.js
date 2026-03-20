/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        wechat: {
          bg: '#EDEDED',
          card: '#FFFFFF',
          text: '#000000',
          subtext: '#8C8C8C',
          link: '#576B95',
          divider: '#E5E5E5',
        },
      },
    },
  },
  plugins: [],
};
