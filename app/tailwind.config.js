import PrimeUI from 'tailwindcss-primeui';

export default {
  content: [
    './src/**/*.{html,ts}',
  ],
  darkMode: ['selector', '[class~="dark"]'],
  theme: {
    extend: {},
  },
  plugins: [PrimeUI],
};
