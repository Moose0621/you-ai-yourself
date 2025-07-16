/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f0',
          100: '#feeee0',
          200: '#fdd9c2',
          300: '#fbc198',
          400: '#f8a06c',
          500: '#f5844c',
          600: '#e6692d',
          700: '#c04f24',
          800: '#9a4025',
          900: '#7c3722',
        },
        phish: {
          // Deep cosmic red - inspired by Phish's iconic red stage lighting
          red: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#dc2626',  // Main red
            600: '#b91c1c',
            700: '#991b1b',
            800: '#7f1d1d',
            900: '#6b1717',
          },
          // Electric blue - reminiscent of their lighting and album artwork
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#2563eb',  // Main blue
            600: '#1d4ed8',
            700: '#1e40af',
            800: '#1e3a8a',
            900: '#1e3a8a',
          },
          // Vibrant green - like their summer tour vibes
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#16a34a',  // Main green
            600: '#15803d',
            700: '#166534',
            800: '#14532d',
            900: '#14432a',
          },
          // Deep purple - psychedelic jam vibes
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#7c3aed',  // Main purple
            600: '#6d28d9',
            700: '#5b21b6',
            800: '#4c1d95',
            900: '#3c1a78',
          },
          // Warm orange - like sunset jams
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
          },
          // Cosmic indigo - for that spacey jam feel
          indigo: {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#4f46e5',
            600: '#4338ca',
            700: '#3730a3',
            800: '#312e81',
            900: '#2d2a69',
          }
        },
        // Gradient backgrounds inspired by Phish's psychedelic aesthetic
        cosmic: {
          from: '#4f46e5',  // indigo
          via: '#7c3aed',   // purple  
          to: '#db2777',    // pink
        }
      },
      backgroundImage: {
        'phish-gradient': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
        'cosmic-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 50%, #7c2d12 100%)',
        'jam-gradient': 'linear-gradient(135deg, #166534 0%, #1e40af 50%, #7c3aed 100%)',
      }
    },
  },
  plugins: [],
}
