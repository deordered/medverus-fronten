/**
 * Search Performance Optimization
 * Advanced optimizations for instantaneous search experience
 * Inspired by Perplexity.ai performance patterns
 */

import { useCallback, useRef, useMemo, useState, useEffect } from "react"
import { debounce } from "lodash-es"

// Cache configuration
const SEARCH_CACHE_SIZE = 100
const SEARCH_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const DEBOUNCE_DELAY = 150 // Optimal balance between responsiveness and API calls

interface SearchCacheEntry {
  query: string
  results: any
  timestamp: number
  source: string
}

interface SearchSuggestion {
  text: string
  type: 'recent' | 'popular' | 'medical' | 'completion'
  source?: string
  confidence?: number
}

class SearchCache {
  private cache = new Map<string, SearchCacheEntry>()
  private maxSize = SEARCH_CACHE_SIZE

  private generateKey(query: string, source: string): string {
    return `${source}:${query.toLowerCase().trim()}`
  }

  set(query: string, source: string, results: any): void {
    const key = this.generateKey(query, source)
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      query,
      results,
      timestamp: Date.now(),
      source
    })
  }

  get(query: string, source: string): any | null {
    const key = this.generateKey(query, source)
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > SEARCH_CACHE_TTL) {
      this.cache.delete(key)
      return null
    }
    
    return entry.results
  }

  clear(): void {
    this.cache.clear()
  }

  has(query: string, source: string): boolean {
    const key = this.generateKey(query, source)
    const entry = this.cache.get(key)
    
    if (!entry) return false
    
    // Check if expired
    if (Date.now() - entry.timestamp > SEARCH_CACHE_TTL) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.values()).map(entry => ({
        query: entry.query,
        source: entry.source,
        age: Date.now() - entry.timestamp
      }))
    }
  }
}

// Global search cache instance
const searchCache = new SearchCache()

/**
 * Hook for optimized search with caching and debouncing
 */
export function useOptimizedSearch() {
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestCountRef = useRef(0)

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce(async (query: string, source: string, callback: (results: any) => void) => {
      if (!query.trim()) {
        callback(null)
        return
      }

      // Check cache first
      const cachedResults = searchCache.get(query, source)
      if (cachedResults) {
        callback(cachedResults)
        return
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()
      const requestId = ++requestCountRef.current

      try {
        setIsSearching(true)
        
        // Simulate API call (replace with actual API integration)
        const response = await simulateSearchAPI(query, source, abortControllerRef.current.signal)
        
        // Only process if this is the latest request
        if (requestId === requestCountRef.current && !abortControllerRef.current.signal.aborted) {
          // Cache the results
          searchCache.set(query, source, response)
          callback(response)
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Search error:', error)
          callback(null)
        }
      } finally {
        if (requestId === requestCountRef.current) {
          setIsSearching(false)
        }
      }
    }, DEBOUNCE_DELAY),
    []
  )

  // Generate instant suggestions
  const generateSuggestions = useCallback((query: string): SearchSuggestion[] => {
    if (!query.trim()) return []

    const suggestions: SearchSuggestion[] = []
    
    // Medical term completions (instant feedback)
    const medicalTerms = [
      'hypertension', 'diabetes', 'cardiology', 'pneumonia', 'diagnosis',
      'treatment', 'symptoms', 'medication', 'dosage', 'side effects',
      'clinical trial', 'pathology', 'radiology', 'oncology', 'neurology'
    ]
    
    const matchingTerms = medicalTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(term => ({
        text: term,
        type: 'medical' as const,
        confidence: 0.9
      }))
    
    suggestions.push(...matchingTerms)
    
    // Query completions
    if (query.length > 2) {
      const completions = [
        `${query} treatment`,
        `${query} symptoms`,
        `${query} diagnosis`,
        `${query} medication`
      ].slice(0, 2).map(text => ({
        text,
        type: 'completion' as const,
        confidence: 0.7
      }))
      
      suggestions.push(...completions)
    }
    
    return suggestions.slice(0, 5)
  }, [])

  // Performance optimized search function
  const performSearch = useCallback((query: string, source: string, callback: (results: any) => void) => {
    // Generate instant suggestions
    const instantSuggestions = generateSuggestions(query)
    setSuggestions(instantSuggestions)
    
    // Perform debounced search
    debouncedSearch(query, source, callback)
  }, [debouncedSearch, generateSuggestions])

  // Cleanup function
  const cleanup = useCallback(() => {
    debouncedSearch.cancel()
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsSearching(false)
    setSuggestions([])
  }, [debouncedSearch])

  return {
    performSearch,
    isSearching,
    suggestions,
    cleanup,
    cacheStats: searchCache.getStats()
  }
}

/**
 * Hook for search result prefetching
 */
export function useSearchPrefetch() {
  const prefetchQueue = useRef<Set<string>>(new Set())
  
  const prefetchSearch = useCallback(async (query: string, source: string) => {
    const key = `${source}:${query}`
    
    // Skip if already prefetching or cached
    if (prefetchQueue.current.has(key) || searchCache.has(query, source)) {
      return
    }
    
    prefetchQueue.current.add(key)
    
    try {
      // Low priority prefetch
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (!searchCache.has(query, source)) {
        const results = await simulateSearchAPI(query, source)
        searchCache.set(query, source, results)
      }
    } catch (error) {
      console.warn('Prefetch failed:', error)
    } finally {
      prefetchQueue.current.delete(key)
    }
  }, [])
  
  return { prefetchSearch }
}

/**
 * Hook for search analytics and performance monitoring
 */
export function useSearchAnalytics() {
  const metricsRef = useRef({
    searchCount: 0,
    cacheHits: 0,
    avgResponseTime: 0,
    responseTimeSum: 0
  })
  
  const recordSearch = useCallback((query: string, source: string, responseTime: number, fromCache: boolean) => {
    const metrics = metricsRef.current
    metrics.searchCount++
    
    if (fromCache) {
      metrics.cacheHits++
    } else {
      metrics.responseTimeSum += responseTime
      metrics.avgResponseTime = metrics.responseTimeSum / (metrics.searchCount - metrics.cacheHits)
    }
  }, [])
  
  const getMetrics = useCallback(() => ({
    ...metricsRef.current,
    cacheHitRate: metricsRef.current.searchCount > 0 
      ? (metricsRef.current.cacheHits / metricsRef.current.searchCount) * 100 
      : 0
  }), [])
  
  return { recordSearch, getMetrics }
}

/**
 * Simulated search API (replace with actual implementation)
 */
async function simulateSearchAPI(query: string, source: string, signal?: AbortSignal): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (signal?.aborted) {
        reject(new DOMException('Request aborted', 'AbortError'))
        return
      }
      
      // Simulate realistic response times
      const responseTime = Math.random() * 500 + 200 // 200-700ms
      
      resolve({
        query,
        source,
        results: [
          {
            id: `${source}-${Date.now()}-1`,
            title: `Medical information about ${query}`,
            content: `Detailed medical information regarding ${query} from ${source}...`,
            source,
            confidence: 0.95,
            timestamp: new Date().toISOString()
          },
          {
            id: `${source}-${Date.now()}-2`,
            title: `Clinical studies on ${query}`,
            content: `Recent clinical findings and research on ${query}...`,
            source,
            confidence: 0.88,
            timestamp: new Date().toISOString()
          }
        ],
        metadata: {
          responseTime,
          totalResults: 2,
          searchTime: responseTime
        }
      })
    }, Math.random() * 300 + 100) // 100-400ms delay

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeout)
        reject(new DOMException('Request aborted', 'AbortError'))
      })
    }
  })
}

/**
 * Hook for keyboard navigation optimization
 */
export function useKeyboardNavigation(suggestions: SearchSuggestion[]) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => prev > -1 ? prev - 1 : prev)
        break
      case 'Escape':
        setSelectedIndex(-1)
        break
      case 'Enter':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          // Handle selection
          event.preventDefault()
          return suggestions[selectedIndex]
        }
        break
    }
    return null
  }, [suggestions, selectedIndex])
  
  const resetSelection = useCallback(() => {
    setSelectedIndex(-1)
  }, [])
  
  return {
    selectedIndex,
    handleKeyDown,
    resetSelection
  }
}

export { searchCache }