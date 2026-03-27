import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef4f2',
          100: '#fee9e5',
          200: '#fdd6cf',
          300: '#fbb8ad',
          400: '#f78f7f',
          500: '#ee6a52',
          600: '#db4e36',
          700: '#b83f2b',
          800: '#983728',
          900: '#7d3227',
          950: '#441710',
        },
        secondary: {
          50: '#fafaf7',
          100: '#f5f5ef',
          200: '#ececde',
          300: '#dfdcc8',
          400: '#ccc6ab',
          500: '#b8ad8c',
          600: '#a6987a',
          700: '#8a7d65',
          800: '#726756',
          900: '#5e5548',
          950: '#312d25',
        },
        coral: {
          DEFAULT: '#E87461',
          light: '#FF9B8A',
          dark: '#D35A47',
        },
        cream: {
          DEFAULT: '#FAF8F5',
          dark: '#F5F2ED',
        },
      },
      fontFamily: {
        sans: ['Kantumruy Pro', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        gveret: ['Gveret Levin', 'serif'],
        bungee: ['Bungee', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
