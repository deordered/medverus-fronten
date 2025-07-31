/**
 * Core Web Vitals Performance Monitoring
 * Comprehensive performance tracking with medical platform optimizations
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  timestamp: number
  url: string
  userAgent: string
  connectionType?: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

export interface PerformanceMetrics {
  // Core Web Vitals
  cls?: WebVitalMetric
  fid?: WebVitalMetric
  fcp?: WebVitalMetric
  lcp?: WebVitalMetric
  ttfb?: WebVitalMetric
  
  // Custom Medical Platform Metrics
  searchResponseTime?: number
  autocompleteLatency?: number
  fileUploadTime?: number
  ttsProcessingTime?: number
  
  // System Performance
  memoryUsage?: number
  renderTime?: number
  jsExecutionTime?: number
  
  // User Experience
  sessionDuration?: number
  interactionCount?: number
  errorCount?: number
  
  // Medical Context
  medicalQueryCount?: number
  sourceProcessingTime?: { [key: string]: number }
}

export interface PerformanceThresholds {
  lcp: { good: number; poor: number }
  fid: { good: number; poor: number }
  cls: { good: number; poor: number }
  fcp: { good: number; poor: number }
  ttfb: { good: number; poor: number }
  searchResponse: { good: number; poor: number }
  autocomplete: { good: number; poor: number }
}

// Performance thresholds based on medical platform requirements
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  fid: { good: 100, poor: 300 },        // First Input Delay
  cls: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  fcp: { good: 1800, poor: 3000 },      // First Contentful Paint
  ttfb: { good: 800, poor: 1800 },      // Time to First Byte
  searchResponse: { good: 1000, poor: 3000 },    // Medical search response
  autocomplete: { good: 150, poor: 500 }         // Autocomplete suggestions
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observers: PerformanceObserver[] = []
  private customMetrics: Map<string, number> = new Map()
  private sessionStartTime: number = Date.now()
  
  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initializeWebVitals()
      this.initializeCustomObservers()
      this.startMemoryMonitoring()
    }
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private initializeWebVitals(): void {
    // Largest Contentful Paint (LCP)
    onLCP((metric) => {
      this.recordWebVital('LCP', metric)
    })

    // First Input Delay (FID)
    onFID((metric) => {
      this.recordWebVital('FID', metric)
    })

    // Cumulative Layout Shift (CLS)
    onCLS((metric) => {
      this.recordWebVital('CLS', metric)
    })

    // First Contentful Paint (FCP)
    onFCP((metric) => {
      this.recordWebVital('FCP', metric)
    })

    // Time to First Byte (TTFB)
    onTTFB((metric) => {
      this.recordWebVital('TTFB', metric)
    })
  }

  /**
   * Initialize custom performance observers
   */
  private initializeCustomObservers(): void {
    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.processNavigationTiming(entry as PerformanceNavigationTiming)
            }
          }
        })
        navObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navObserver)

        // Resource timing observer for medical assets
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              this.processResourceTiming(entry as PerformanceResourceTiming)
            }
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)

        // Long task observer for performance issues
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
              this.processLongTask(entry)
            }
          }
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (error) {
        console.warn('Performance observers not fully supported:', error)
      }
    }
  }

  /**
   * Start memory usage monitoring
   */
  private startMemoryMonitoring(): void {
    if ('memory' in performance) {
      const updateMemoryUsage = () => {
        const memory = (performance as any).memory
        this.metrics.memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        }
      }

      updateMemoryUsage()
      setInterval(updateMemoryUsage, 30000) // Update every 30 seconds
    }
  }

  /**
   * Record Core Web Vital metric
   */
  private recordWebVital(name: WebVitalMetric['name'], metric: any): void {
    const webVitalMetric: WebVitalMetric = {
      name,
      value: metric.value,
      delta: metric.delta,
      rating: this.getRating(name, metric.value),
      id: metric.id,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      deviceType: this.getDeviceType()
    }

    this.metrics[name.toLowerCase() as keyof PerformanceMetrics] = webVitalMetric
    this.reportMetric(webVitalMetric)
  }

  /**
   * Get performance rating based on thresholds
   */
  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = PERFORMANCE_THRESHOLDS[metric.toLowerCase() as keyof PerformanceThresholds]
    if (!thresholds) return 'good'

    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.poor) return 'needs-improvement'
    return 'poor'
  }

  /**
   * Get connection type information
   */
  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    return connection ? connection.effectiveType || connection.type || 'unknown' : 'unknown'
  }

  /**
   * Get device type based on screen size
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth
    if (width <= 768) return 'mobile'
    if (width <= 1024) return 'tablet'
    return 'desktop'
  }

  /**
   * Process navigation timing data
   */
  private processNavigationTiming(entry: PerformanceNavigationTiming): void {
    this.metrics.renderTime = entry.loadEventEnd - entry.navigationStart
    this.metrics.jsExecutionTime = entry.domInteractive - entry.domContentLoadedEventStart
  }

  /**
   * Process resource timing for medical assets
   */
  private processResourceTiming(entry: PerformanceResourceTiming): void {
    const url = entry.name
    
    // Track medical-specific resources
    if (url.includes('/api/query') || url.includes('/api/search')) {
      const responseTime = entry.responseEnd - entry.requestStart
      this.recordMedicalMetric('searchResponseTime', responseTime)
    }
    
    if (url.includes('/api/autocomplete') || url.includes('/suggestions')) {
      const responseTime = entry.responseEnd - entry.requestStart
      this.recordMedicalMetric('autocompleteLatency', responseTime)
    }
    
    if (url.includes('/api/files/upload')) {
      const uploadTime = entry.responseEnd - entry.requestStart
      this.recordMedicalMetric('fileUploadTime', uploadTime)
    }
  }

  /**
   * Process long task entries (>50ms)
   */
  private processLongTask(entry: PerformanceEntry): void {
    console.warn(`Long task detected: ${entry.duration}ms`, {
      startTime: entry.startTime,
      duration: entry.duration,
      name: entry.name
    })
  }

  /**
   * Record medical-specific performance metric
   */
  recordMedicalMetric(name: string, value: number): void {
    this.customMetrics.set(name, value)
    
    if (name === 'searchResponseTime') {
      this.metrics.searchResponseTime = value
    } else if (name === 'autocompleteLatency') {
      this.metrics.autocompleteLatency = value
    } else if (name === 'fileUploadTime') {
      this.metrics.fileUploadTime = value
    } else if (name === 'ttsProcessingTime') {
      this.metrics.ttsProcessingTime = value
    }
  }

  /**
   * Record user interaction
   */
  recordInteraction(type: string): void {
    this.metrics.interactionCount = (this.metrics.interactionCount || 0) + 1
    this.customMetrics.set(`interaction_${type}`, Date.now())
  }

  /**
   * Record error occurrence
   */
  recordError(error: Error | string): void {
    this.metrics.errorCount = (this.metrics.errorCount || 0) + 1
    console.error('Performance Monitor - Error recorded:', error)
  }

  /**
   * Record medical query performance
   */
  recordMedicalQuery(source: string, responseTime: number): void {
    this.metrics.medicalQueryCount = (this.metrics.medicalQueryCount || 0) + 1
    
    if (!this.metrics.sourceProcessingTime) {
      this.metrics.sourceProcessingTime = {}
    }
    
    this.metrics.sourceProcessingTime[source] = responseTime
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    this.metrics.sessionDuration = Date.now() - this.sessionStartTime
    return { ...this.metrics }
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const scores: number[] = []
    
    // Core Web Vitals scores
    if (this.metrics.lcp) {
      scores.push(this.getMetricScore('lcp', this.metrics.lcp.value))
    }
    if (this.metrics.fid) {
      scores.push(this.getMetricScore('fid', this.metrics.fid.value))
    }
    if (this.metrics.cls) {
      scores.push(this.getMetricScore('cls', this.metrics.cls.value))
    }
    
    // Medical-specific scores
    if (this.metrics.searchResponseTime) {
      scores.push(this.getMetricScore('searchResponse', this.metrics.searchResponseTime))
    }
    if (this.metrics.autocompleteLatency) {
      scores.push(this.getMetricScore('autocomplete', this.metrics.autocompleteLatency))
    }
    
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  }

  /**
   * Get individual metric score
   */
  private getMetricScore(metric: string, value: number): number {
    const thresholds = PERFORMANCE_THRESHOLDS[metric as keyof PerformanceThresholds]
    if (!thresholds) return 100
    
    if (value <= thresholds.good) return 100
    if (value <= thresholds.poor) {
      // Linear interpolation between good and poor thresholds
      const range = thresholds.poor - thresholds.good
      const position = value - thresholds.good
      return Math.max(0, 75 - (position / range) * 50)
    }
    return Math.max(0, 25 - ((value - thresholds.poor) / thresholds.poor) * 25)
  }

  /**
   * Report metric to analytics service
   */
  private reportMetric(metric: WebVitalMetric): void {
    // In a real implementation, this would send to your analytics service
    console.log('Performance Metric:', metric)
    
    // Store in localStorage for demo purposes
    try {
      const stored = localStorage.getItem('medverus-performance-metrics')
      const metrics = stored ? JSON.parse(stored) : []
      metrics.push(metric)
      
      // Keep only last 100 metrics
      if (metrics.length > 100) {
        metrics.splice(0, metrics.length - 100)
      }
      
      localStorage.setItem('medverus-performance-metrics', JSON.stringify(metrics))
    } catch (error) {
      console.warn('Failed to store performance metric:', error)
    }
  }

  /**
   * Get recommendations based on current performance
   */
  getRecommendations(): string[] {
    const recommendations: string[] = []
    
    if (this.metrics.lcp && this.metrics.lcp.value > PERFORMANCE_THRESHOLDS.lcp.poor) {
      recommendations.push('Optimize images and reduce server response time to improve LCP')
    }
    
    if (this.metrics.fid && this.metrics.fid.value > PERFORMANCE_THRESHOLDS.fid.poor) {
      recommendations.push('Reduce JavaScript execution time to improve First Input Delay')
    }
    
    if (this.metrics.cls && this.metrics.cls.value > PERFORMANCE_THRESHOLDS.cls.poor) {
      recommendations.push('Ensure proper image dimensions and avoid layout shifts')
    }
    
    if (this.metrics.searchResponseTime && this.metrics.searchResponseTime > PERFORMANCE_THRESHOLDS.searchResponse.poor) {
      recommendations.push('Optimize medical search API response times')
    }
    
    if (this.metrics.autocompleteLatency && this.metrics.autocompleteLatency > PERFORMANCE_THRESHOLDS.autocomplete.poor) {
      recommendations.push('Implement autocomplete caching for faster suggestions')
    }
    
    if (this.metrics.memoryUsage && (this.metrics.memoryUsage as any).percentage > 80) {
      recommendations.push('High memory usage detected - consider optimizing components')
    }
    
    return recommendations
  }

  /**
   * Cleanup performance monitoring
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.customMetrics.clear()
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Export types and utilities
export default performanceMonitor