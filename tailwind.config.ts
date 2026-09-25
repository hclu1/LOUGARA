import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-jakarta)', 'sans-serif'],
        sans: ['var(--font-dmsans)', 'sans-serif'],
      },
      colors: {
        obsidian: {
          950: '#070C1B',
          900: '#0B132B',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
        },
        gold: {
          50: '#FFFDF0',
          100: '#FDF8D9',
          300: '#F5D77F',
          400: '#E5A93C',
          500: '#D4AF37',
          600: '#B8860B',
          700: '#906500',
        },
        emerald: {
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        lougara: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        brand: {
          gold: '#D4AF37',
          dark: '#0B132B',
          slate: '#1E293B',
        }
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.25)',
        'gold-glow-lg': '0 0 45px rgba(212, 175, 55, 0.4)',
        'emerald-glow': '0 0 20px rgba(16, 185, 129, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #E5A93C 50%, #B8860B 100%)',
        'gold-gradient-hover': 'linear-gradient(135deg, #E5A93C 0%, #F5D77F 50%, #D4AF37 100%)',
        'obsidian-gradient': 'linear-gradient(180deg, #0B132B 0%, #0F172A 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.9) 100%)',
      }
    },
  },
  plugins: [],
};

export default config;
