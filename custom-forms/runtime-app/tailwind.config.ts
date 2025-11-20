import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ['class'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tyconsa/bizuit-ui-components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Comprehensive safelist for dynamically loaded forms from database
    // Background colors
    {
      pattern: /^bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    },
    // Text colors
    {
      pattern: /^text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    },
    // Border colors
    {
      pattern: /^border-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    },
    // Gradient colors (from/via/to)
    {
      pattern: /^(from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    },
    // Common sizing and spacing
    {
      pattern: /^(w|h|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/,
    },
    // Rounded corners
    {
      pattern: /^rounded-(none|sm|md|lg|xl|2xl|3xl|full)$/,
    },
    // Shadow
    {
      pattern: /^shadow-(sm|md|lg|xl|2xl|inner|none)$/,
    },
    // Common utilities
    'min-h-screen', 'max-w-4xl', 'max-w-md', 'mx-auto', 'w-full',
    'inline-block', 'inline-flex', 'flex', 'grid', 'hidden',
    'items-center', 'items-start', 'justify-center', 'justify-between',
    'flex-col', 'flex-row', 'space-y-1', 'space-y-2', 'space-y-3', 'space-y-4', 'space-y-6',
    'text-center', 'text-left', 'text-right',
    'font-bold', 'font-semibold', 'font-medium', 'font-normal',
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-4xl', 'text-5xl', 'text-6xl',
    'opacity-90', 'opacity-50',
    'cursor-pointer', 'pointer-events-none',
    'fixed', 'absolute', 'relative', 'inset-0',
    'top-4', 'right-4', 'bottom-4', 'left-4',
    'z-50',
    'hover:shadow-xl', 'hover:scale-105', 'hover:from-cyan-600', 'hover:to-cyan-700',
    'hover:text-gray-600', 'hover:bg-cyan-600',
    'transition-all', 'transition-colors', 'duration-200',
    'transform',
    'grid-cols-1', 'grid-cols-2', 'md:grid-cols-2',
    'md:text-5xl', 'md:p-12',
    'border-l-4', 'border-2',
    'bg-opacity-50',
    'mt-0.5',
    'mb-2', 'mb-3', 'mb-4', 'mb-6', 'mb-8',
    'bg-gradient-to-r', 'bg-gradient-to-br',
    'animate-fadeIn',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-quicksand)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
