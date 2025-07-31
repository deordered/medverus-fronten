// Rate limiting implementation for API protection and HIPAA compliance
// Implements sliding window rate limiting with IP-based and user-based limits

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
}

interface RateLimitResult {
  blocked: boolean
  limit: number
  remaining: number
  retryAfter: number
  reset: number
}

interface RateLimitStore {
  [key: string]: {
    requests: number[]
    firstRequest: number
  }
}

export class RateLimiter {
  private store: RateLimitStore = {}
  private cleanupInterval: NodeJS.Timeout

  // Rate limit configurations for different endpoints
  private configs: { [pattern: string]: RateLimitConfig } = {
    // API endpoints
    '/api/auth': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
    '/api/medical': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
    '/api/query': { windowMs: 60 * 1000, maxRequests: 30 }, // 30 queries per minute
    '/api/files': { windowMs: 60 * 1000, maxRequests: 5 }, // 5 file uploads per minute
    '/api/admin': { windowMs: 60 * 1000, maxRequests: 100 }, // 100 admin requests per minute
    
    // Default for all other API routes
    'default': { windowMs: 60 * 1000, maxRequests: 60 } // 60 requests per minute
  }

  constructor() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check rate limit for a specific IP and path
   */
  async checkLimit(ip: string, path: string, userId?: string): Promise<RateLimitResult> {
    const config = this.getConfigForPath(path)
    const key = this.generateKey(ip, path, userId)
    const now = Date.now()
    
    // Initialize or get existing store entry
    if (!this.store[key]) {
      this.store[key] = {
        requests: [],
        firstRequest: now
      }
    }

    const entry = this.store[key]
    
    // Remove requests outside the time window
    entry.requests = entry.requests.filter(
      timestamp => now - timestamp < config.windowMs
    )

    // Check if limit is exceeded
    const remaining = Math.max(0, config.maxRequests - entry.requests.length)
    const blocked = entry.requests.length >= config.maxRequests

    if (!blocked) {
      // Add current request to the store
      entry.requests.push(now)
    }

    const oldestRequest = entry.requests[0] || now
    const reset = oldestRequest + config.windowMs

    return {
      blocked,
      limit: config.maxRequests,
      remaining,
      retryAfter: blocked ? Math.ceil((reset - now) / 1000) : 0,
      reset
    }
  }

  /**
   * Get rate limit configuration for a specific path
   */
  private getConfigForPath(path: string): RateLimitConfig {
    // Find the most specific matching pattern
    for (const pattern in this.configs) {
      if (pattern !== 'default' && path.startsWith(pattern)) {
        return this.configs[pattern]
      }
    }
    return this.configs.default
  }

  /**
   * Generate a unique key for rate limiting
   */
  private generateKey(ip: string, path: string, userId?: string): string {
    // Use userId if available for authenticated requests, otherwise use IP
    const identifier = userId || ip
    
    // Create path-specific keys for different rate limits
    const pathPattern = this.getPathPattern(path)
    
    return `${identifier}:${pathPattern}`
  }

  /**
   * Get path pattern for grouping similar endpoints
   */
  private getPathPattern(path: string): string {
    // Group similar endpoints together
    if (path.startsWith('/api/auth')) return '/api/auth'
    if (path.startsWith('/api/medical')) return '/api/medical'
    if (path.startsWith('/api/query')) return '/api/query'
    if (path.startsWith('/api/files')) return '/api/files'
    if (path.startsWith('/api/admin')) return '/api/admin'
    
    return 'default'
  }

  /**
   * Clean up old entries from the store
   */
  private cleanup(): void {
    const now = Date.now()
    const maxWindowMs = Math.max(...Object.values(this.configs).map(c => c.windowMs))
    
    for (const key in this.store) {
      const entry = this.store[key]
      
      // Remove entries that are completely outside all time windows
      if (now - entry.firstRequest > maxWindowMs * 2) {
        delete this.store[key]
        continue
      }
      
      // Clean up old requests within entries
      entry.requests = entry.requests.filter(
        timestamp => now - timestamp < maxWindowMs
      )
      
      // Remove entries with no recent requests
      if (entry.requests.length === 0 && now - entry.firstRequest > maxWindowMs) {
        delete this.store[key]
      }
    }
  }

  /**
   * Get current rate limit status for monitoring
   */
  getStatus(): {
    totalKeys: number
    totalRequests: number
    oldestEntry: number
  } {
    const now = Date.now()
    let totalRequests = 0
    let oldestEntry = now
    
    for (const key in this.store) {
      const entry = this.store[key]
      totalRequests += entry.requests.length
      oldestEntry = Math.min(oldestEntry, entry.firstRequest)
    }
    
    return {
      totalKeys: Object.keys(this.store).length,
      totalRequests,
      oldestEntry
    }
  }

  /**
   * Reset rate limit for a specific key (admin function)
   */
  async resetLimit(ip: string, path: string, userId?: string): Promise<void> {
    const key = this.generateKey(ip, path, userId)
    delete this.store[key]
  }

  /**
   * Get rate limit info for a specific key
   */
  async getLimitInfo(ip: string, path: string, userId?: string): Promise<{
    config: RateLimitConfig
    current: number
    remaining: number
  }> {
    const config = this.getConfigForPath(path)
    const key = this.generateKey(ip, path, userId)
    const entry = this.store[key]
    
    if (!entry) {
      return {
        config,
        current: 0,
        remaining: config.maxRequests
      }
    }
    
    const now = Date.now()
    const validRequests = entry.requests.filter(
      timestamp => now - timestamp < config.windowMs
    )
    
    return {
      config,
      current: validRequests.length,
      remaining: Math.max(0, config.maxRequests - validRequests.length)
    }
  }

  /**
   * Update rate limit configuration
   */
  updateConfig(pattern: string, config: RateLimitConfig): void {
    this.configs[pattern] = config
  }

  /**
   * Cleanup on destruction
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store = {}
  }
}