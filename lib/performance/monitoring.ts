// Performance monitoring and optimization for medical AI platform
// Implements Core Web Vitals tracking, medical-specific metrics, and performance insights

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url: string
  userId?: string
  tier?: string
}

interface CoreWebVitals {
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  fcp: number | null // First Contentful Paint
  ttfb: number | null // Time to First Byte
}

interface MedicalMetrics {
  queryResponseTime: number
  fileUploadTime: number
  searchResultsTime: number
  documentProcessingTime: number
  apiLatency: number
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observer: PerformanceObserver | null = null
  private vitals: CoreWebVitals = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  }

  constructor() {
    this.initializeObserver()
    this.setupVitalsTracking()
    this.trackNavigationTiming()
  }

  /**
   * Initialize performance observer
   */
  private initializeObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry)
        }
      })

      // Observe different types of performance entries
      this.observer.observe({ 
        entryTypes: ['measure', 'navigation', 'resource', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
      })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }
  }

  /**
   * Setup Core Web Vitals tracking
   */
  private setupVitalsTracking(): void {
    if (typeof window === 'undefined') return

    // Track LCP (Largest Contentful Paint)
    this.observeMetric('largest-contentful-paint', (entry: any) => {
      this.vitals.lcp = entry.startTime
      this.recordMetric('LCP', entry.startTime)
    })

    // Track FID (First Input Delay)
    this.observeMetric('first-input', (entry: any) => {
      this.vitals.fid = entry.processingStart - entry.startTime
      this.recordMetric('FID', this.vitals.fid)
    })

    // Track CLS (Cumulative Layout Shift)
    this.observeMetric('layout-shift', (entry: any) => {
      if (!entry.hadRecentInput) {
        this.vitals.cls = (this.vitals.cls || 0) + entry.value
        this.recordMetric('CLS', this.vitals.cls)
      }
    })

    // Track FCP (First Contentful Paint)
    this.observeMetric('paint', (entry: any) => {
      if (entry.name === 'first-contentful-paint') {
        this.vitals.fcp = entry.startTime
        this.recordMetric('FCP', entry.startTime)
      }
    })
  }

  /**
   * Observe specific performance metrics
   */
  private observeMetric(entryType: string, callback: (entry: any) => void): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry)
        }
      })
      observer.observe({ entryTypes: [entryType] })
    } catch (error) {
      console.warn(`Failed to observe ${entryType}:`, error)
    }
  }

  /**
   * Track navigation timing
   */
  private trackNavigationTiming(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          // Time to First Byte
          this.vitals.ttfb = navigation.responseStart - navigation.requestStart
          this.recordMetric('TTFB', this.vitals.ttfb)

          // DOM Content Loaded
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart
          this.recordMetric('DOMContentLoaded', domContentLoaded)

          // Page Load Complete
          const loadComplete = navigation.loadEventEnd - navigation.navigationStart
          this.recordMetric('LoadComplete', loadComplete)

          // DNS Lookup Time
          const dnsTime = navigation.domainLookupEnd - navigation.domainLookupStart
          this.recordMetric('DNSTime', dnsTime)

          // TCP Connection Time
          const connectTime = navigation.connectEnd - navigation.connectStart
          this.recordMetric('ConnectTime', connectTime)
        }
      }, 0)
    })
  }

  /**
   * Process performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    // Track resource loading times
    if (entry.entryType === 'resource') {
      const resource = entry as PerformanceResourceTiming
      
      // Track API calls
      if (resource.name.includes('/api/')) {
        this.recordMetric('APICall', resource.duration, {
          url: resource.name,
          type: 'api'
        })
      }
      
      // Track large resources
      if (resource.transferSize > 100000) { // > 100KB
        this.recordMetric('LargeResource', resource.duration, {
          url: resource.name,
          size: resource.transferSize
        })
      }
    }

    // Track custom measures
    if (entry.entryType === 'measure') {
      this.recordMetric(entry.name, entry.duration)
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      ...metadata
    }

    this.metrics.push(metric)

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric)
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`, metadata)
    }
  }

  /**
   * Track medical-specific performance metrics
   */
  trackMedicalQuery(queryTime: number, resultCount: number): void {
    this.recordMetric('MedicalQuery', queryTime, {
      type: 'medical-query',
      resultCount
    })

    // Track query performance thresholds
    if (queryTime > 5000) { // > 5 seconds
      this.recordMetric('SlowMedicalQuery', queryTime, {
        severity: 'warning',
        resultCount
      })
    }
  }

  /**
   * Track file upload performance
   */
  trackFileUpload(uploadTime: number, fileSize: number, fileType: string): void {
    this.recordMetric('FileUpload', uploadTime, {
      type: 'file-upload',
      fileSize,
      fileType,
      throughput: fileSize / (uploadTime / 1000) // bytes per second
    })
  }

  /**
   * Track document processing performance
   */
  trackDocumentProcessing(processingTime: number, documentType: string, pages?: number): void {
    this.recordMetric('DocumentProcessing', processingTime, {
      type: 'document-processing',
      documentType,
      pages
    })
  }

  /**
   * Track search performance
   */
  trackSearch(searchTime: number, query: string, resultCount: number): void {
    this.recordMetric('Search', searchTime, {
      type: 'search',
      queryLength: query.length,
      resultCount
    })
  }

  /**
   * Get Core Web Vitals scores
   */
  getWebVitals(): CoreWebVitals & { score: number } {
    const score = this.calculateWebVitalsScore()
    return { ...this.vitals, score }
  }

  /**
   * Calculate Web Vitals score (0-100)
   */
  private calculateWebVitalsScore(): number {
    let score = 0
    let validMetrics = 0

    // LCP scoring (good: <=2.5s, needs improvement: <=4s, poor: >4s)
    if (this.vitals.lcp !== null) {
      if (this.vitals.lcp <= 2500) score += 25
      else if (this.vitals.lcp <= 4000) score += 15
      else score += 5
      validMetrics++
    }

    // FID scoring (good: <=100ms, needs improvement: <=300ms, poor: >300ms)
    if (this.vitals.fid !== null) {
      if (this.vitals.fid <= 100) score += 25
      else if (this.vitals.fid <= 300) score += 15
      else score += 5
      validMetrics++
    }

    // CLS scoring (good: <=0.1, needs improvement: <=0.25, poor: >0.25)
    if (this.vitals.cls !== null) {
      if (this.vitals.cls <= 0.1) score += 25
      else if (this.vitals.cls <= 0.25) score += 15
      else score += 5
      validMetrics++
    }

    // FCP scoring (good: <=1.8s, needs improvement: <=3s, poor: >3s)
    if (this.vitals.fcp !== null) {
      if (this.vitals.fcp <= 1800) score += 25
      else if (this.vitals.fcp <= 3000) score += 15
      else score += 5
      validMetrics++
    }

    return validMetrics > 0 ? score : 0
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): {
    webVitals: CoreWebVitals & { score: number }
    medicalMetrics: MedicalMetrics
    recommendations: string[]
    totalMetrics: number
  } {
    const webVitals = this.getWebVitals()
    const medicalMetrics = this.getMedicalMetrics()
    const recommendations = this.generateRecommendations()

    return {
      webVitals,
      medicalMetrics,
      recommendations,
      totalMetrics: this.metrics.length
    }
  }

  /**
   * Get medical-specific performance metrics
   */
  private getMedicalMetrics(): MedicalMetrics {
    const queryMetrics = this.metrics.filter(m => m.name === 'MedicalQuery')
    const uploadMetrics = this.metrics.filter(m => m.name === 'FileUpload')
    const searchMetrics = this.metrics.filter(m => m.name === 'Search')
    const processingMetrics = this.metrics.filter(m => m.name === 'DocumentProcessing')
    const apiMetrics = this.metrics.filter(m => m.name === 'APICall')

    return {
      queryResponseTime: this.calculateAverage(queryMetrics),
      fileUploadTime: this.calculateAverage(uploadMetrics),
      searchResultsTime: this.calculateAverage(searchMetrics),
      documentProcessingTime: this.calculateAverage(processingMetrics),
      apiLatency: this.calculateAverage(apiMetrics)
    }
  }

  /**
   * Calculate average metric value
   */
  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0
    return metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const webVitals = this.getWebVitals()

    // LCP recommendations
    if (webVitals.lcp && webVitals.lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint by compressing images and improving server response times')
    }

    // FID recommendations
    if (webVitals.fid && webVitals.fid > 100) {
      recommendations.push('Reduce First Input Delay by minimizing JavaScript execution time')
    }

    // CLS recommendations
    if (webVitals.cls && webVitals.cls > 0.1) {
      recommendations.push('Improve Cumulative Layout Shift by setting dimensions for images and ads')
    }

    // Medical-specific recommendations
    const medicalMetrics = this.getMedicalMetrics()
    
    if (medicalMetrics.queryResponseTime > 3000) {
      recommendations.push('Optimize medical query response time with caching and database indexing')
    }

    if (medicalMetrics.fileUploadTime > 10000) {
      recommendations.push('Improve file upload performance with compression and chunked uploads')
    }

    if (medicalMetrics.apiLatency > 500) {
      recommendations.push('Reduce API latency with CDN and connection pooling')
    }

    return recommendations
  }

  /**
   * Send metrics to analytics service
   */
  private async sendToAnalytics(metric: PerformanceMetric): Promise<void> {
    try {
      // In production, send to your analytics service
      // Example: Google Analytics, Mixpanel, custom analytics
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'performance_metric', {
          metric_name: metric.name,
          metric_value: metric.value,
          page_path: metric.url
        })
      }

      // Send to custom analytics endpoint
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      })
    } catch (error) {
      console.warn('Failed to send analytics:', error)
    }
  }

  /**
   * Start performance measurement
   */
  startMeasure(name: string): void {
    if (typeof window !== 'undefined' && typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`)
    }
  }

  /**
   * End performance measurement
   */
  endMeasure(name: string): void {
    if (typeof window !== 'undefined' && typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }
  }

  /**
   * Clear performance data
   */
  clearMetrics(): void {
    this.metrics = []
    if (typeof window !== 'undefined' && typeof performance !== 'undefined' && performance.clearMeasures) {
      performance.clearMeasures()
      performance.clearMarks()
    }
  }

  /**
   * Get performance metrics summary
   */
  getMetricsSummary(): {
    count: number
    averageLoadTime: number
    averageApiLatency: number
    errorRate: number
  } {
    const loadMetrics = this.metrics.filter(m => m.name === 'LoadComplete')
    const apiMetrics = this.metrics.filter(m => m.name === 'APICall')
    const errorMetrics = this.metrics.filter(m => m.name.includes('Error'))

    return {
      count: this.metrics.length,
      averageLoadTime: this.calculateAverage(loadMetrics),
      averageApiLatency: this.calculateAverage(apiMetrics),
      errorRate: this.metrics.length > 0 ? (errorMetrics.length / this.metrics.length) * 100 : 0
    }
  }

  /**
   * Cleanup observer
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Utility functions for easy tracking
export const trackMedicalQuery = (queryTime: number, resultCount: number) => 
  performanceMonitor.trackMedicalQuery(queryTime, resultCount)

export const trackFileUpload = (uploadTime: number, fileSize: number, fileType: string) => 
  performanceMonitor.trackFileUpload(uploadTime, fileSize, fileType)

export const trackDocumentProcessing = (processingTime: number, documentType: string, pages?: number) => 
  performanceMonitor.trackDocumentProcessing(processingTime, documentType, pages)

export const trackSearch = (searchTime: number, query: string, resultCount: number) => 
  performanceMonitor.trackSearch(searchTime, query, resultCount)