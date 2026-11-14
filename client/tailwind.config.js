export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: { DEFAULT: '#4568EA', dark: '#243B9A', light: '#DCDDF9' },
      },
    },
  },
  plugins: [],
};
