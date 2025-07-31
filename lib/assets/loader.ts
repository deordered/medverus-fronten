/**
 * Asset Loader Utility
 * Centralized system for loading and managing static assets
 */

export interface AssetManifest {
  name: string
  version: string
  description: string
  assets: {
    logos: Record<string, AssetItem>
    colors: Record<string, AssetItem>
    icons: Record<string, AssetItem>
    fonts: Record<string, string>
  }
  themes: Record<string, Record<string, string>>
  brand: {
    name: string
    tagline: string
    domain: string
    style: string
    accessibility: string
  }
}

export interface AssetItem {
  path: string
  description: string
  usage?: string
  colors?: string[]
  size?: string
  includes?: string[]
  sizes?: string[]
}

/**
 * Load asset manifest
 */
export async function loadAssetManifest(): Promise<AssetManifest | null> {
  try {
    const response = await fetch('/assets/manifest.json')
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn('Could not load asset manifest:', error)
  }
  return null
}

/**
 * Get asset URL with fallback
 */
export function getAssetUrl(category: string, name: string, fallback?: string): string {
  const basePaths = {
    logos: '/assets/logos',
    icons: '/assets/icons', 
    images: '/assets/images',
    fonts: '/assets/fonts',
    colors: '/assets/colors'
  }

  const basePath = basePaths[category as keyof typeof basePaths]
  if (!basePath) {
    return fallback || ''
  }

  return `${basePath}/${name}`
}

/**
 * Preload critical assets
 */
export function preloadCriticalAssets(): void {
  const criticalAssets = [
    '/assets/logos/main.svg',
    '/assets/colors/brand-colors.json',
    '/assets/colors/palette.css'
  ]

  criticalAssets.forEach(asset => {
    const link = document.createElement('link')
    link.rel = 'preload'
    
    if (asset.endsWith('.svg')) {
      link.as = 'image'
    } else if (asset.endsWith('.css')) {
      link.as = 'style'
    } else if (asset.endsWith('.json')) {
      link.as = 'fetch'
      link.crossOrigin = 'anonymous'
    }
    
    link.href = asset
    document.head.appendChild(link)
  })
}

/**
 * Check if asset exists
 */
export async function assetExists(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(basePath: string, sizes: number[]): string {
  return sizes.map(size => `${basePath}-${size}x${size}.png ${size}w`).join(', ')
}

/**
 * Get optimized asset URL
 */
export function getOptimizedAssetUrl(
  path: string, 
  options: {
    format?: 'webp' | 'png' | 'svg'
    size?: number
    quality?: number
  } = {}
): string {
  const { format, size, quality } = options
  const url = new URL(path, window.location.origin)
  
  if (format && format !== 'svg') {
    url.searchParams.set('format', format)
  }
  
  if (size) {
    url.searchParams.set('w', size.toString())
  }
  
  if (quality) {
    url.searchParams.set('q', quality.toString())
  }
  
  return url.toString()
}

/**
 * Asset cache for performance
 */
class AssetCache {
  private cache = new Map<string, any>()
  private readonly maxSize = 50
  private readonly ttl = 5 * 60 * 1000 // 5 minutes

  set(key: string, value: any): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value
  }

  clear(): void {
    this.cache.clear()
  }
}

const assetCache = new AssetCache()

/**
 * Load asset with caching
 */
export async function loadAssetWithCache<T>(
  url: string,
  parser?: (response: Response) => Promise<T>
): Promise<T | null> {
  const cached = assetCache.get(url)
  if (cached) return cached
  
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    
    const result = parser ? await parser(response) : await response.text()
    assetCache.set(url, result)
    return result as T
  } catch (error) {
    console.warn(`Failed to load asset: ${url}`, error)
    return null
  }
}

/**
 * Asset validation
 */
export function validateAssetPaths(manifest: AssetManifest): boolean {
  try {
    // Check required assets exist in manifest
    const requiredAssets = ['logos', 'colors']
    for (const category of requiredAssets) {
      if (!manifest.assets[category as keyof typeof manifest.assets]) {
        console.warn(`Missing required asset category: ${category}`)
        return false
      }
    }
    
    // Validate brand configuration
    if (!manifest.brand?.name || !manifest.brand?.tagline) {
      console.warn('Invalid brand configuration in manifest')
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error validating asset paths:', error)
    return false
  }
}

/**
 * Generate asset report
 */
export function generateAssetReport(manifest: AssetManifest): string {
  const categories = Object.keys(manifest.assets)
  const totalAssets = categories.reduce((total, category) => {
    const categoryAssets = manifest.assets[category as keyof typeof manifest.assets]
    return total + (typeof categoryAssets === 'object' ? Object.keys(categoryAssets).length : 0)
  }, 0)

  return `
# Asset Report - ${manifest.name} v${manifest.version}

## Summary
- **Total Assets**: ${totalAssets}
- **Categories**: ${categories.length}
- **Brand**: ${manifest.brand.name}
- **Style**: ${manifest.brand.style}

## Categories
${categories.map(category => {
  const categoryAssets = manifest.assets[category as keyof typeof manifest.assets]
  const count = typeof categoryAssets === 'object' ? Object.keys(categoryAssets).length : 0
  return `- **${category}**: ${count} assets`
}).join('\n')}

## Themes
${Object.keys(manifest.themes).map(theme => `- ${theme}`).join('\n')}
`
}

export { assetCache }