import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Paleta de colores para escritora
        burgundy: '#722F37',
        gold: '#D4AF37',
        cream: '#FFFDD0',
        ivory: '#FFFFF0',
        warmGray: '#6B5B5B',
      },
      fontFamily: {
        quintessential: ['"Quintessential"', 'cursive'],
        nunito: ['var(--font-nunito)', 'sans-serif'],
      },
      backgroundImage: {
        'slide-1': "url('/bg1.jpg')",
        'slide-2': "url('/bg2.jpg')",
        'slide-3': "url('/bg3.jpg')",
        'slide-4': "url('/bg4.jpg')",
      },
    },
  },
  plugins: [],
};
export default config;
