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
        sentinel: {
          bg: '#080c14',
          surface: '#0f172a',
          card: '#131e36',
          elevated: '#1a2744',
          border: '#243452',
          highlight: '#33486f',
        },
        state: {
          normal: {
            DEFAULT: '#10b981',
            bg: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.35)',
            text: '#34d399',
          },
          anomalous: {
            DEFAULT: '#0ea5e9',
            bg: 'rgba(14, 165, 233, 0.12)',
            border: 'rgba(14, 165, 233, 0.35)',
            text: '#38bdf8',
          },
          suspicious: {
            DEFAULT: '#f59e0b',
            bg: 'rgba(245, 158, 11, 0.12)',
            border: 'rgba(245, 158, 11, 0.35)',
            text: '#fbbf24',
          },
          escalating: {
            DEFAULT: '#f97316',
            bg: 'rgba(249, 115, 22, 0.15)',
            border: 'rgba(249, 115, 22, 0.4)',
            text: '#fb923c',
          },
          critical: {
            DEFAULT: '#ef4444',
            bg: 'rgba(239, 68, 68, 0.18)',
            border: 'rgba(239, 68, 68, 0.5)',
            text: '#f87171',
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
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
