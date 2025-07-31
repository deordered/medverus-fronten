import { NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/performance/monitoring'

export async function GET() {
  try {
    // Get comprehensive status information
    const performanceReport = performanceMonitor.getPerformanceReport()
    const metricsSummary = performanceMonitor.getMetricsSummary()

    const status = {
      status: 'operational',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
      
      // System metrics
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },

      // Performance metrics
      performance: {
        webVitals: performanceReport.webVitals,
        medicalMetrics: performanceReport.medicalMetrics,
        summary: metricsSummary,
      },

      // Service health
      services: {
        frontend: 'operational',
        api: 'operational', // This would check actual API health
        monitoring: 'operational',
      },

      // Configuration status
      config: {
        environment: process.env.NODE_ENV,
        telemetryDisabled: process.env.NEXT_TELEMETRY_DISABLED === '1',
        buildTime: process.env.NEXT_PUBLIC_BUILD_TIME,
      }
    }

    return NextResponse.json(status, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        error: 'Status check partially failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}