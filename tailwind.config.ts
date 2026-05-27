import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        cream: '#FDFAF4',
        'hill-sand': '#E8D9BD',
        'text-warm': '#3C3530',
        terracotta: '#C56B4A',
        mustard: '#D9A441',
        olive: '#7A8A4F',
        rust: '#A8472B',
        plum: '#7C4A6A',
        sage: '#8DA77A',
        'dusty-blue': '#6D8AA0',
        'warm-pink': '#D49584',
        'force-up': '#8DA77A',
        'force-down': '#C04A2D',
        'force-past': '#A39B92',
        'stale-red': '#C04A2D',
      },
      fontFamily: {
        heading: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
