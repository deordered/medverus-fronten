/**
 * Performance Monitoring React Hook
 * React integration for Core Web Vitals and medical platform performance tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { performanceMonitor, type PerformanceMetrics, type WebVitalMetric } from '@/lib/performance/web-vitals'

export interface PerformanceHookState {
  metrics: PerformanceMetrics
  score: number
  recommendations: string[]
  isLoading: boolean
  lastUpdated: Date | null
}

export interface PerformanceHookActions {
  recordMedicalQuery: (source: string, responseTime: number) => void
  recordInteraction: (type: string) => void
  recordError: (error: Error | string) => void
  recordCustomMetric: (name: string, value: number) => void
  refreshMetrics: () => void
  exportMetrics: () => string
  clearMetrics: () => void
}

/**
 * Hook for performance monitoring with medical platform optimizations
 */
export function usePerformanceMonitoring(): PerformanceHookState & PerformanceHookActions {
  const [state, setState] = useState<PerformanceHookState>({
    metrics: {},
    score: 0,
    recommendations: [],
    isLoading: true,
    lastUpdated: null
  })

  const updateIntervalRef = useRef<NodeJS.Timeout>()

  // Update performance state
  const updatePerformanceState = useCallback(() => {
    const metrics = performanceMonitor.getMetrics()
    const score = performanceMonitor.getPerformanceScore()
    const recommendations = performanceMonitor.getRecommendations()

    setState(prev => ({
      ...prev,
      metrics,
      score,
      recommendations,
      isLoading: false,
      lastUpdated: new Date()
    }))
  }, [])

  // Initialize performance monitoring
  useEffect(() => {
    // Initial load
    updatePerformanceState()

    // Set up periodic updates
    updateIntervalRef.current = setInterval(updatePerformanceState, 10000) // Update every 10 seconds

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [updatePerformanceState])

  // Record medical query performance
  const recordMedicalQuery = useCallback((source: string, responseTime: number) => {
    performanceMonitor.recordMedicalQuery(source, responseTime)
    updatePerformanceState()
  }, [updatePerformanceState])

  // Record user interaction
  const recordInteraction = useCallback((type: string) => {
    performanceMonitor.recordInteraction(type)
    updatePerformanceState()
  }, [updatePerformanceState])

  // Record error
  const recordError = useCallback((error: Error | string) => {
    performanceMonitor.recordError(error)
    updatePerformanceState()
  }, [updatePerformanceState])

  // Record custom metric
  const recordCustomMetric = useCallback((name: string, value: number) => {
    performanceMonitor.recordMedicalMetric(name, value)
    updatePerformanceState()
  }, [updatePerformanceState])

  // Refresh metrics manually
  const refreshMetrics = useCallback(() => {
    updatePerformanceState()
  }, [updatePerformanceState])

  // Export metrics as JSON
  const exportMetrics = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: state.metrics,
      score: state.score,
      recommendations: state.recommendations
    }
    return JSON.stringify(exportData, null, 2)
  }, [state])

  // Clear stored metrics
  const clearMetrics = useCallback(() => {
    try {
      localStorage.removeItem('medverus-performance-metrics')
      updatePerformanceState()
    } catch (error) {
      console.warn('Failed to clear performance metrics:', error)
    }
  }, [updatePerformanceState])

  return {
    ...state,
    recordMedicalQuery,
    recordInteraction,
    recordError,
    recordCustomMetric,
    refreshMetrics,
    exportMetrics,
    clearMetrics
  }
}

/**
 * Hook for tracking specific performance metrics
 */
export function usePerformanceTimer() {
  const startTimeRef = useRef<number>()
  const { recordCustomMetric } = usePerformanceMonitoring()

  const startTimer = useCallback((name: string) => {
    startTimeRef.current = performance.now()
    return name
  }, [])

  const endTimer = useCallback((name: string) => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current
      recordCustomMetric(name, duration)
      startTimeRef.current = undefined
      return duration
    }
    return 0
  }, [recordCustomMetric])

  const measureAsync = useCallback(async <T>(
    name: string,
    asyncFunction: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    try {
      const result = await asyncFunction()
      const duration = performance.now() - startTime
      recordCustomMetric(name, duration)
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      recordCustomMetric(`${name}_error`, duration)
      throw error
    }
  }, [recordCustomMetric])

  return {
    startTimer,
    endTimer,
    measureAsync
  }
}

/**
 * Hook for medical-specific performance tracking
 */
export function useMedicalPerformanceTracking() {
  const { recordMedicalQuery, recordInteraction, recordCustomMetric } = usePerformanceMonitoring()

  const trackSearchQuery = useCallback(async <T>(
    source: string,
    queryFunction: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    recordInteraction('medical_search')
    
    try {
      const result = await queryFunction()
      const responseTime = performance.now() - startTime
      recordMedicalQuery(source, responseTime)
      return result
    } catch (error) {
      const responseTime = performance.now() - startTime
      recordCustomMetric(`${source}_error_time`, responseTime)
      throw error
    }
  }, [recordMedicalQuery, recordInteraction, recordCustomMetric])

  const trackFileUpload = useCallback(async <T>(
    uploadFunction: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    recordInteraction('file_upload')
    
    try {
      const result = await uploadFunction()
      const uploadTime = performance.now() - startTime
      recordCustomMetric('fileUploadTime', uploadTime)
      return result
    } catch (error) {
      const uploadTime = performance.now() - startTime
      recordCustomMetric('file_upload_error_time', uploadTime)
      throw error
    }
  }, [recordInteraction, recordCustomMetric])

  const trackTTSProcessing = useCallback(async <T>(
    ttsFunction: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    recordInteraction('tts_processing')
    
    try {
      const result = await ttsFunction()
      const processingTime = performance.now() - startTime
      recordCustomMetric('ttsProcessingTime', processingTime)
      return result
    } catch (error) {
      const processingTime = performance.now() - startTime
      recordCustomMetric('tts_processing_error_time', processingTime)
      throw error
    }
  }, [recordInteraction, recordCustomMetric])

  const trackAutocomplete = useCallback(async <T>(
    autocompleteFunction: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await autocompleteFunction()
      const latency = performance.now() - startTime
      recordCustomMetric('autocompleteLatency', latency)
      return result
    } catch (error) {
      const latency = performance.now() - startTime
      recordCustomMetric('autocomplete_error_time', latency)
      throw error
    }
  }, [recordCustomMetric])

  return {
    trackSearchQuery,
    trackFileUpload,
    trackTTSProcessing,
    trackAutocomplete
  }
}

/**
 * Hook for performance alerting
 */
export function usePerformanceAlerts() {
  const [alerts, setAlerts] = useState<string[]>([])
  const { metrics, score } = usePerformanceMonitoring()

  useEffect(() => {
    const newAlerts: string[] = []

    // Check Core Web Vitals
    if (metrics.lcp && metrics.lcp.rating === 'poor') {
      newAlerts.push('Poor Largest Contentful Paint detected - Users may experience slow loading')
    }

    if (metrics.fid && metrics.fid.rating === 'poor') {
      newAlerts.push('Poor First Input Delay detected - UI may feel unresponsive')
    }

    if (metrics.cls && metrics.cls.rating === 'poor') {
      newAlerts.push('Poor Cumulative Layout Shift detected - Page layout is unstable')
    }

    // Check medical-specific metrics
    if (metrics.searchResponseTime && metrics.searchResponseTime > 3000) {
      newAlerts.push('Medical search response time is slow - Consider optimizing backend')
    }

    if (metrics.autocompleteLatency && metrics.autocompleteLatency > 500) {
      newAlerts.push('Autocomplete suggestions are slow - Users may experience delays')
    }

    // Check memory usage
    if (metrics.memoryUsage && (metrics.memoryUsage as any).percentage > 90) {
      newAlerts.push('High memory usage detected - Application may become unstable')
    }

    // Check overall performance score
    if (score < 50) {
      newAlerts.push('Overall performance score is low - Multiple optimizations needed')
    }

    setAlerts(newAlerts)
  }, [metrics, score])

  const dismissAlert = useCallback((index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearAllAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  return {
    alerts,
    hasAlerts: alerts.length > 0,
    alertCount: alerts.length,
    dismissAlert,
    clearAllAlerts
  }
}

export default usePerformanceMonitoring