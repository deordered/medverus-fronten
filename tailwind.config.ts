import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Brand colors from branding assets (main.svg and secondary.svg)
        brand: {
          primary: '#a1f7a0',       // Medical green from logo
          secondary: '#2d2d2d',     // Dark gray from logo
          accent: '#7dd87a',        // Darker green variant
          success: '#a1f7a0',       // Same as primary
          warning: '#ffc107',       // Standard warning
          danger: '#dc3545',        // Standard danger
          info: '#17a2b8',          // Standard info
          neutral: '#6c757d',       // Neutral gray
          background: '#ffffff',    // White background
          foreground: '#2d2d2d',    // Dark text
          muted: '#6c757d',         // Muted text
          border: '#e9ecef',        // Light border
          surface: '#f8f9fa',       // Surface color
          hover: '#7dd87a',         // Hover state
          active: '#6bb86a',        // Active state
          light: '#e8fce8',         // Light variant
          dark: '#6bb86a'           // Dark variant
        },
        // Medical-specific colors (using brand colors)
        medical: {
          primary: '#a1f7a0',      // Brand primary
          success: '#a1f7a0',      // Success = primary
          warning: '#ffc107',      // Warning yellow
          danger: '#dc3545',       // Danger red
          neutral: '#6c757d'       // Neutral gray
        },
        // Content source colors (using brand palette)
        source: {
          medverus: '#a1f7a0',   // Primary brand green
          pubmed: '#7dd87a',     // Accent green
          web: '#6bb86a',        // Dark green variant
          files: '#ffc107'       // Warning color for files
        },
        // Status colors for medical data
        status: {
          active: "hsl(120, 60%, 50%)",
          inactive: "hsl(0, 60%, 50%)",
          pending: "hsl(45, 60%, 50%)",
          processing: "hsl(210, 60%, 50%)",
        },
        // Tier colors
        tier: {
          free: "hsl(220, 13%, 69%)",
          pro: "hsl(210, 100%, 44%)",
          enterprise: "hsl(271, 81%, 56%)",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Medical-specific animations
        "pulse-medical": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "slide-in-medical": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        // Loading animations for medical queries
        "loading-dots": {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-medical": "pulse-medical 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in-medical": "slide-in-medical 0.3s ease-out",
        "loading-dots": "loading-dots 1.4s infinite ease-in-out both",
      },
      // Medical-specific spacing
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      // Medical-specific typography
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        // Medical-specific sizes
        'medical-caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        'medical-body': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'medical-label': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'medical-heading': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],
      },
      // Enhanced shadows for medical UI depth
      boxShadow: {
        'medical-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'medical-elevated': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'medical-overlay': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config