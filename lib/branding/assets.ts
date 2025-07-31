/**
 * Branding Assets Configuration
 * Centralized system for managing brand assets and ensuring consistency
 */

export interface BrandColors {
  primary: string
  secondary: string
  accent: string
  success: string
  warning: string
  danger: string
  neutral: string
  background: string
  foreground: string
  muted: string
  border: string
  surface: string
}

export interface BrandLogos {
  primary: string
  light: string
  dark: string
  icon: string
  text: string
}

export interface BrandFonts {
  primary: string
  secondary: string
  mono: string
}

export interface BrandAssets {
  colors: BrandColors
  logos: BrandLogos
  fonts: BrandFonts
  icons: Record<string, string>
}

/**
 * Default brand configuration
 * These will be overridden by assets placed in /public/branding/
 */
const defaultBrandAssets: BrandAssets = {
  colors: {
    primary: '#a1f7a0',      // Brand green from logo
    secondary: '#2d2d2d',    // Brand dark from logo
    accent: '#7dd87a',       // Brand accent
    success: '#a1f7a0',     // Same as primary
    warning: '#ffc107',     // Standard warning
    danger: '#dc3545',      // Standard danger
    neutral: '#6c757d',     // Neutral gray
    background: '#ffffff',  // White background
    foreground: '#2d2d2d',  // Dark text
    muted: '#6c757d',       // Muted text
    border: '#e9ecef',      // Light border
    surface: '#f8f9fa'      // Surface color
  },
  logos: {
    primary: '/assets/logos/main.svg',        // Primary logo (light background)
    light: '/assets/logos/main.svg',          // Light mode logo
    dark: '/assets/logos/secondary.svg',      // Dark mode logo
    icon: '/assets/logos/main.svg',           // Icon version
    text: '/assets/logos/main.svg'            // Text version
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace'
  },
  icons: {
    medical: '/assets/icons/medical.svg',
    search: '/assets/icons/search.svg',
    upload: '/assets/icons/upload.svg',
    favicon: '/assets/icons/favicon.ico'
  }
}

/**
 * Load brand colors from JSON file
 */
async function loadBrandColors(): Promise<BrandColors> {
  try {
    const response = await fetch('/assets/colors/brand-colors.json')
    if (response.ok) {
      const colors = await response.json()
      return { ...defaultBrandAssets.colors, ...colors }
    }
  } catch (error) {
    console.warn('Could not load brand colors, using defaults:', error)
  }
  return defaultBrandAssets.colors
}

/**
 * Check if logo file exists
 */
async function checkLogoExists(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Load brand logos with fallbacks
 */
async function loadBrandLogos(): Promise<BrandLogos> {
  const logos = { ...defaultBrandAssets.logos }
  
  // Check each logo and use fallback if not found
  for (const [key, path] of Object.entries(logos)) {
    const exists = await checkLogoExists(path)
    if (!exists) {
      // Fallback to a default medical icon or text
      logos[key as keyof BrandLogos] = key === 'icon' ? 
        '/branding/icons/default-medical.svg' : 
        '/branding/logos/default-logo.svg'
    }
  }
  
  return logos
}

/**
 * Get complete branding assets
 */
export async function getBrandingAssets(): Promise<BrandAssets> {
  try {
    const [colors, logos] = await Promise.all([
      loadBrandColors(),
      loadBrandLogos()
    ])
    
    return {
      colors,
      logos,
      fonts: defaultBrandAssets.fonts,
      icons: defaultBrandAssets.icons
    }
  } catch (error) {
    console.warn('Error loading branding assets, using defaults:', error)
    return defaultBrandAssets
  }
}

/**
 * Synchronous version for immediate use (uses defaults)
 */
export function getBrandingAssetsSync(): BrandAssets {
  return defaultBrandAssets
}

/**
 * Get specific asset type
 */
export function getBrandColors(): BrandColors {
  return defaultBrandAssets.colors
}

export function getBrandLogos(): BrandLogos {
  return defaultBrandAssets.logos
}

export function getBrandFonts(): BrandFonts {
  return defaultBrandAssets.fonts
}

/**
 * CSS custom properties generator
 */
export function generateCSSCustomProperties(colors: BrandColors): string {
  return Object.entries(colors)
    .map(([key, value]) => `--brand-${key}: ${value};`)
    .join('\n')
}

/**
 * Tailwind color configuration generator
 */
export function generateTailwindColors(colors: BrandColors): Record<string, string> {
  const tailwindColors: Record<string, string> = {}
  
  Object.entries(colors).forEach(([key, value]) => {
    tailwindColors[`brand-${key}`] = value
  })
  
  return tailwindColors
}

/**
 * Hook for React components to use branding assets
 */
export function useBrandingAssets() {
  // This would typically use React.useEffect and useState
  // For now, return sync version
  return getBrandingAssetsSync()
}

/**
 * Validate brand assets
 */
export function validateBrandAssets(assets: Partial<BrandAssets>): boolean {
  try {
    // Check required colors
    if (assets.colors) {
      const requiredColors = ['primary', 'background', 'foreground']
      for (const color of requiredColors) {
        if (!(color in assets.colors)) {
          console.warn(`Missing required color: ${color}`)
          return false
        }
      }
    }
    
    // Validate color format (hex, rgb, hsl)
    if (assets.colors) {
      for (const [key, value] of Object.entries(assets.colors)) {
        if (typeof value !== 'string' || !isValidColor(value)) {
          console.warn(`Invalid color format for ${key}: ${value}`)
          return false
        }
      }
    }
    
    return true
  } catch (error) {
    console.error('Error validating brand assets:', error)
    return false
  }
}

/**
 * Validate color format
 */
function isValidColor(color: string): boolean {
  // Basic validation for hex, rgb, hsl, and CSS color names
  const colorPatterns = [
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // Hex
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // RGB
    /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // HSL
    /^[a-zA-Z]+$/ // CSS color names
  ]
  
  return colorPatterns.some(pattern => pattern.test(color))
}

/**
 * Generate brand asset report
 */
export function generateBrandReport(assets: BrandAssets): string {
  return `
# Brand Assets Report

## Colors
${Object.entries(assets.colors).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Logos
${Object.entries(assets.logos).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Fonts
${Object.entries(assets.fonts).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Icons
${Object.entries(assets.icons).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
`
}

export default getBrandingAssets