// Performance monitoring unit tests for medical AI platform
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { PerformanceMonitor, performanceMonitor } from '../monitoring'

// Mock performance API
const mockPerformanceMark = vi.fn()
const mockPerformanceMeasure = vi.fn()
const mockPerformanceClearMarks = vi.fn()
const mockPerformanceClearMeasures = vi.fn()
const mockPerformanceGetEntriesByType = vi.fn(() => [])

const mockPerformanceObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn()
}))

global.PerformanceObserver = mockPerformanceObserver as any
global.performance = {
  mark: mockPerformanceMark,
  measure: mockPerformanceMeasure,
  clearMarks: mockPerformanceClearMarks,
  clearMeasures: mockPerformanceClearMeasures,
  getEntriesByType: mockPerformanceGetEntriesByType,
  now: vi.fn(() => 1000)
} as any

// Mock fetch for analytics
global.fetch = vi.fn()

// Mock gtag
global.gtag = vi.fn()

// Mock console methods
const mockConsoleLog = vi.fn()
const mockConsoleWarn = vi.fn()

vi.stubGlobal('console', {
  ...console,
  log: mockConsoleLog,
  warn: mockConsoleWarn
})

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    monitor = new PerformanceMonitor()
    vi.clearAllMocks()
  })

  afterEach(() => {
    monitor.destroy()
  })

  describe('Initialization', () => {
    it('should initialize with empty metrics and null vitals', () => {
      const webVitals = monitor.getWebVitals()
      
      expect(webVitals.lcp).toBeNull()
      expect(webVitals.fid).toBeNull()
      expect(webVitals.cls).toBeNull()
      expect(webVitals.fcp).toBeNull()
      expect(webVitals.ttfb).toBeNull()
      expect(webVitals.score).toBe(0)
    })

    it('should handle PerformanceObserver not being available', () => {
      // Mock window without PerformanceObserver
      const originalWindow = global.window
      delete (global as any).window
      
      expect(() => new PerformanceMonitor()).not.toThrow()
      
      global.window = originalWindow
    })
  })

  describe('Metric Recording', () => {
    it('should record performance metrics correctly', () => {
      monitor.recordMetric('TestMetric', 150, { type: 'test' })
      
      const report = monitor.getPerformanceReport()
      expect(report.totalMetrics).toBe(1)
    })

    it('should log metrics in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      monitor.recordMetric('DevMetric', 200)
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[Performance] DevMetric: 200.00ms'),
        undefined
      )
      
      process.env.NODE_ENV = originalEnv
    })

    it('should send to analytics in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      monitor.recordMetric('ProdMetric', 300)
      
      // Should attempt to send to analytics
      expect(fetch).toHaveBeenCalledWith('/api/analytics/performance', expect.any(Object))
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Medical-Specific Tracking', () => {
    it('should track medical query performance', () => {
      monitor.trackMedicalQuery(2500, 15)
      
      const report = monitor.getPerformanceReport()
      expect(report.medicalMetrics.queryResponseTime).toBe(2500)
      expect(report.totalMetrics).toBe(1)
    })

    it('should flag slow medical queries', () => {
      monitor.trackMedicalQuery(6000, 10) // > 5 seconds
      
      const report = monitor.getPerformanceReport()
      expect(report.totalMetrics).toBe(2) // Should record both MedicalQuery and SlowMedicalQuery
    })

    it('should track file upload performance', () => {
      monitor.trackFileUpload(3000, 1024000, 'application/pdf') // 1MB file, 3s upload
      
      const report = monitor.getPerformanceReport()
      expect(report.medicalMetrics.fileUploadTime).toBe(3000)
    })

    it('should track document processing performance', () => {
      monitor.trackDocumentProcessing(4000, 'medical-report', 5)
      
      const report = monitor.getPerformanceReport()
      expect(report.medicalMetrics.documentProcessingTime).toBe(4000)
    })

    it('should track search performance', () => {
      monitor.trackSearch(800, 'hypertension treatment', 25)
      
      const report = monitor.getPerformanceReport()
      expect(report.medicalMetrics.searchResultsTime).toBe(800)
    })
  })

  describe('Core Web Vitals', () => {
    it('should calculate Web Vitals score correctly', () => {
      // Set good values for all metrics
      monitor['vitals'] = {
        lcp: 2000,  // Good: <=2.5s
        fid: 80,    // Good: <=100ms  
        cls: 0.08,  // Good: <=0.1
        fcp: 1500,  // Good: <=1.8s
        ttfb: 400   // Not used in score calculation
      }
      
      const webVitals = monitor.getWebVitals()
      expect(webVitals.score).toBe(100) // 25 points each for 4 metrics
    })

    it('should handle partial Web Vitals data', () => {
      // Only set LCP and FID
      monitor['vitals'] = {
        lcp: 2000,  // Good
        fid: 80,    // Good
        cls: null,
        fcp: null,
        ttfb: null
      }
      
      const webVitals = monitor.getWebVitals()
      expect(webVitals.score).toBe(50) // 25 points each for 2 metrics
    })

    it('should score poor metrics correctly', () => {
      monitor['vitals'] = {
        lcp: 5000,  // Poor: >4s (5 points)
        fid: 400,   // Poor: >300ms (5 points)
        cls: 0.3,   // Poor: >0.25 (5 points)
        fcp: 4000,  // Poor: >3s (5 points)
        ttfb: 800
      }
      
      const webVitals = monitor.getWebVitals()
      expect(webVitals.score).toBe(20) // 5 points each for 4 metrics
    })
  })

  describe('Performance Recommendations', () => {
    it('should generate LCP recommendations for slow loading', () => {
      monitor['vitals'].lcp = 3500 // > 2.5s threshold
      
      // Debug: Check what's actually in vitals
      const vitals = monitor.getWebVitals()
      // Debug: Check if recommendation should be generated
      const shouldGenerate = vitals.lcp && vitals.lcp > 2500
      
      const report = monitor.getPerformanceReport()
      
      // Debug: Log what we actually get
      if (report.recommendations.length === 0) {
        throw new Error(`No recommendations generated. Vitals: ${JSON.stringify(vitals)}, ShouldGenerate: ${shouldGenerate}`)
      }
      
      if (!report.recommendations.some(r => r.includes('Largest Contentful Paint'))) {
        throw new Error(`LCP recommendation not found. Actual recommendations: ${JSON.stringify(report.recommendations)}`)
      }
      
      // Try direct assertion instead of stringContaining
      const hasLcpRecommendation = report.recommendations.some(r => 
        r.includes('Optimize Largest Contentful Paint')
      )
      expect(hasLcpRecommendation).toBe(true)
    })

    it('should generate FID recommendations for slow interactivity', () => {
      monitor['vitals'].fid = 200 // > 100ms threshold
      
      const report = monitor.getPerformanceReport()
      
      const hasFidRecommendation = report.recommendations.some(r => 
        r.includes('Reduce First Input Delay')
      )
      expect(hasFidRecommendation).toBe(true)
    })

    it('should generate CLS recommendations for layout shifts', () => {
      monitor['vitals'].cls = 0.2 // > 0.1 threshold
      
      const report = monitor.getPerformanceReport()
      
      const hasClsRecommendation = report.recommendations.some(r => 
        r.includes('Improve Cumulative Layout Shift')
      )
      expect(hasClsRecommendation).toBe(true)
    })

    it('should generate medical-specific recommendations', () => {
      // Add slow medical queries
      monitor.trackMedicalQuery(4000, 10)
      monitor.trackMedicalQuery(5000, 8)
      
      const report = monitor.getPerformanceReport()
      
      const hasMedicalRecommendation = report.recommendations.some(r => 
        r.includes('Optimize medical query response time')
      )
      expect(hasMedicalRecommendation).toBe(true)
    })

    it('should recommend file upload improvements', () => {
      // Add slow file uploads
      monitor.trackFileUpload(12000, 2048000, 'application/pdf') // 12s for 2MB
      
      const report = monitor.getPerformanceReport()
      
      const hasFileUploadRecommendation = report.recommendations.some(r => 
        r.includes('Improve file upload performance')
      )
      expect(hasFileUploadRecommendation).toBe(true)
    })

    it('should recommend API latency improvements', () => {
      // Add slow API calls
      monitor.recordMetric('APICall', 800, { url: '/api/query', type: 'api' })
      monitor.recordMetric('APICall', 700, { url: '/api/upload', type: 'api' })
      
      const report = monitor.getPerformanceReport()
      
      const hasApiLatencyRecommendation = report.recommendations.some(r => 
        r.includes('Reduce API latency')
      )
      expect(hasApiLatencyRecommendation).toBe(true)
    })
  })

  describe('Performance Measurement', () => {
    it('should start and end measurements correctly', () => {
      monitor.startMeasure('custom-operation')
      monitor.endMeasure('custom-operation')
      
      expect(mockPerformanceMark).toHaveBeenCalledWith('custom-operation-start')
      expect(mockPerformanceMark).toHaveBeenCalledWith('custom-operation-end')
      expect(mockPerformanceMeasure).toHaveBeenCalledWith(
        'custom-operation',
        'custom-operation-start',
        'custom-operation-end'
      )
    })

    it('should handle measurement in environments without performance API', () => {
      const originalPerformance = global.performance
      delete (global as any).performance
      
      expect(() => {
        monitor.startMeasure('test')
        monitor.endMeasure('test')
      }).not.toThrow()
      
      global.performance = originalPerformance
    })
  })

  describe('Metrics Summary', () => {
    it('should calculate metrics summary correctly', () => {
      // Add various metrics
      monitor.recordMetric('LoadComplete', 2000)
      monitor.recordMetric('LoadComplete', 2500)
      monitor.recordMetric('APICall', 300)
      monitor.recordMetric('APICall', 400)
      monitor.recordMetric('ErrorMetric', 1, { type: 'error' })
      
      const summary = monitor.getMetricsSummary()
      
      expect(summary.count).toBe(5)
      expect(summary.averageLoadTime).toBe(2250) // (2000 + 2500) / 2
      expect(summary.averageApiLatency).toBe(350) // (300 + 400) / 2
      expect(summary.errorRate).toBe(20) // 1 error out of 5 total metrics
    })

    it('should handle empty metrics gracefully', () => {
      const summary = monitor.getMetricsSummary()
      
      expect(summary.count).toBe(0)
      expect(summary.averageLoadTime).toBe(0)
      expect(summary.averageApiLatency).toBe(0)
      expect(summary.errorRate).toBe(0)
    })
  })

  describe('Cleanup', () => {
    it('should clear metrics correctly', () => {
      monitor.recordMetric('TestMetric', 100)
      expect(monitor.getPerformanceReport().totalMetrics).toBe(1)
      
      monitor.clearMetrics()
      expect(monitor.getPerformanceReport().totalMetrics).toBe(0)
      
      expect(mockPerformanceClearMeasures).toHaveBeenCalled()
      expect(mockPerformanceClearMarks).toHaveBeenCalled()
    })

    it('should destroy observer correctly', () => {
      const mockDisconnect = vi.fn()
      monitor['observer'] = { disconnect: mockDisconnect } as any
      
      monitor.destroy()
      
      expect(mockDisconnect).toHaveBeenCalled()
      expect(monitor['observer']).toBeNull()
    })
  })

  describe('Analytics Integration', () => {
    it('should send metrics to Google Analytics if available', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      monitor.recordMetric('AnalyticsTest', 500, { url: '/test' })
      
      // Wait for async analytics call
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(gtag).toHaveBeenCalledWith('event', 'performance_metric', {
        metric_name: 'AnalyticsTest',
        metric_value: 500,
        page_path: '/test'
      })
      
      process.env.NODE_ENV = originalEnv
    })

    it('should handle analytics failures gracefully', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      // Mock fetch to fail
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
      
      expect(() => {
        monitor.recordMetric('FailingMetric', 100)
      }).not.toThrow()
      
      process.env.NODE_ENV = originalEnv
    })
  })
})

describe('Global Performance Monitor Instance', () => {
  it('should export a global instance', () => {
    expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor)
  })

  it('should provide utility functions', async () => {
    const monitoring = await import('../monitoring')
    
    expect(typeof monitoring.trackMedicalQuery).toBe('function')
    expect(typeof monitoring.trackFileUpload).toBe('function')
    expect(typeof monitoring.trackDocumentProcessing).toBe('function')
    expect(typeof monitoring.trackSearch).toBe('function')
  })
})