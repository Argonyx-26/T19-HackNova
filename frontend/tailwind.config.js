/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          deep: '#7a4f1c',
          DEFAULT: '#c9a15d',
          hot: '#f0d28f',
          light: '#fff6e4',
          amber: '#e8b25c',
        },
        obsidian: {
          DEFAULT: '#050403',
          card: '#0c0906',
          elevated: '#140f0a',
          border: 'rgba(201, 161, 93, 0.2)',
          borderHover: 'rgba(240, 210, 143, 0.45)',
          muted: '#a3927a',
        },
        sentinel: {
          bg: '#050403',
          surface: '#0c0906',
          card: '#120e09',
          elevated: '#1a140d',
          border: 'rgba(201, 161, 93, 0.22)',
          highlight: 'rgba(240, 210, 143, 0.35)',
        },
        state: {
          normal: {
            DEFAULT: '#3fae63',
            bg: 'rgba(63, 174, 99, 0.12)',
            border: 'rgba(63, 174, 99, 0.35)',
            text: '#4ade80',
          },
          anomalous: {
            DEFAULT: '#e0b23e',
            bg: 'rgba(224, 178, 62, 0.12)',
            border: 'rgba(224, 178, 62, 0.35)',
            text: '#facc15',
          },
          suspicious: {
            DEFAULT: '#e0812f',
            bg: 'rgba(224, 129, 47, 0.14)',
            border: 'rgba(224, 129, 47, 0.38)',
            text: '#fb923c',
          },
          escalating: {
            DEFAULT: '#e5502f',
            bg: 'rgba(229, 80, 47, 0.18)',
            border: 'rgba(229, 80, 47, 0.48)',
            text: '#f87171',
          },
          critical: {
            DEFAULT: '#c21f2b',
            bg: 'rgba(194, 31, 43, 0.22)',
            border: 'rgba(194, 31, 43, 0.55)',
            text: '#ef4444',
          },
          contained: {
            DEFAULT: '#6366f1',
            bg: 'rgba(99, 102, 241, 0.15)',
            border: 'rgba(99, 102, 241, 0.4)',
            text: '#818cf8',
          },
        },
        source: {
          cctv: '#a855f7',
          network: '#06b6d4',
          access: '#f59e0b',
          iot: '#10b981',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
