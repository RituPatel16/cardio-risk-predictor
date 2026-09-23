/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EEF1F4',
        panel: '#FFFFFF',
        ink: '#0F1B2D',
        inkmute: '#5B6B82',
        line: '#D3DAE3',
        blue: {
          DEFAULT: '#2456A6',
          soft: '#E4ECFA',
        },
        red: {
          DEFAULT: '#D6402C',
          soft: '#FBE6E2',
        },
        green: {
          DEFAULT: '#17845A',
          soft: '#E1F3EA',
        },
        amber: {
          DEFAULT: '#B4790C',
          soft: '#FBF0DC',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}
