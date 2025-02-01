module.exports = {
  theme: {
    extend: {
      animation: {
        'pulse-subtle': 'pulse-subtle 3s infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          },
          '50%': { 
            transform: 'scale(1.02)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          },
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 