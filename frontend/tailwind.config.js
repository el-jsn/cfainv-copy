/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");


export default withMT({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'sfpro': ['SF Pro Text', 'Helvetica Neue', 'sans-serif'],
        'sfprodisplay': ['SF Pro Display', 'Helvetica Neue', 'sans-serif'],
      },
        colors: {
            primary: '#007AFF', // Example primary color, replace with your brand color
            textPrimary: '#37474f',
            textSecondary: '#78909c',
            background: '#f5f5f5',
        },
      animation: {
        'float': 'float 30s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(10px, 10px)' },
          '50%': { transform: 'translate(-5px, 15px)' },
          '75%': { transform: 'translate(-15px, -5px)' },
        },
      },
    },
  },
  variants: {
    extend: {
      scale: ['hover'],
      shadow: ['hover'],
    },
  },
  plugins: [],
});

