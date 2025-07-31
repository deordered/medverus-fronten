"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  usePerformanceMonitoring,
  usePerformanceAlerts,
  useMedicalPerformanceTracking
} from "@/lib/hooks/use-performance-monitoring"
import { PERFORMANCE_THRESHOLDS } from "@/lib/performance/web-vitals"
import { listVariants, listItemVariants } from "@/lib/animations/motion-variants"
import { cn } from "@/lib/utils"
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Download,
  Gauge,
  MemoryStick,
  Monitor,
  RefreshCw,
  Search,
  Smartphone,
  TrendingUp,
  Users,
  Wifi,
  X,
  Zap,
  Brain,
  FileText,
  Headphones,
  Target,
  Info,
  Lightbulb
} from "lucide-react"

interface PerformanceDashboardProps {
  className?: string
  showDetailed?: boolean
}

const metricIcons = {
  lcp: <Monitor className="h-4 w-4" />,
  fid: <Zap className="h-4 w-4" />,
  cls: <Target className="h-4 w-4" />,
  fcp: <Clock className="h-4 w-4" />,
  ttfb: <Wifi className="h-4 w-4" />,
  searchResponseTime: <Search className="h-4 w-4" />,
  autocompleteLatency: <Brain className="h-4 w-4" />,
  fileUploadTime: <FileText className="h-4 w-4" />,
  ttsProcessingTime: <Headphones className="h-4 w-4" />
}

const getRatingColor = (rating: string | undefined) => {
  switch (rating) {
    case 'good': return 'border-gray-200 bg-gray-50' // Using inline styles for text color
    case 'needs-improvement': return 'text-yellow-600 border-yellow-200 bg-yellow-50'
    case 'poor': return 'text-red-600 border-red-200 bg-red-50'
    default: return 'text-gray-600 border-gray-200 bg-gray-50'
  }
}

const getScoreColor = (score: number) => {
  if (score >= 90) return '' // Using inline styles for color
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

const formatMetricValue = (name: string, value: number) => {
  if (name.includes('Time') || name.includes('Delay')) {
    return `${Math.round(value)}ms`
  }
  if (name === 'cls') {
    return value.toFixed(3)
  }
  if (name.includes('memory')) {
    return `${(value / 1024 / 1024).toFixed(1)}MB`
  }
  return value.toString()
}

/**
 * Performance Dashboard Component
 * Comprehensive performance monitoring with Core Web Vitals and medical-specific metrics
 */
export function PerformanceDashboard({ 
  className,
  showDetailed = true 
}: PerformanceDashboardProps) {
  const [refreshing, setRefreshing] = useState(false)
  const { 
    metrics, 
    score, 
    recommendations, 
    isLoading, 
    lastUpdated,
    refreshMetrics,
    exportMetrics,
    clearMetrics 
  } = usePerformanceMonitoring()
  
  const { 
    alerts, 
    hasAlerts, 
    alertCount, 
    dismissAlert, 
    clearAllAlerts 
  } = usePerformanceAlerts()

  const handleRefresh = async () => {
    setRefreshing(true)
    refreshMetrics()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleExport = () => {
    const exportData = exportMetrics()
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medverus-performance-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Core Web Vitals data
  const coreVitals = [
    {
      name: 'LCP',
      title: 'Largest Contentful Paint',
      description: 'Time until largest content element loads',
      value: metrics.lcp?.value,
      rating: metrics.lcp?.rating,
      threshold: PERFORMANCE_THRESHOLDS.lcp,
      icon: metricIcons.lcp
    },
    {
      name: 'FID',
      title: 'First Input Delay',
      description: 'Time until page becomes interactive',
      value: metrics.fid?.value,
      rating: metrics.fid?.rating,
      threshold: PERFORMANCE_THRESHOLDS.fid,
      icon: metricIcons.fid
    },
    {
      name: 'CLS',
      title: 'Cumulative Layout Shift',
      description: 'Visual stability during page load',
      value: metrics.cls?.value,
      rating: metrics.cls?.rating,
      threshold: PERFORMANCE_THRESHOLDS.cls,
      icon: metricIcons.cls
    },
    {
      name: 'FCP',
      title: 'First Contentful Paint',
      description: 'Time until first content appears',
      value: metrics.fcp?.value,
      rating: metrics.fcp?.rating,
      threshold: PERFORMANCE_THRESHOLDS.fcp,
      icon: metricIcons.fcp
    },
    {
      name: 'TTFB',
      title: 'Time to First Byte',
      description: 'Server response time',
      value: metrics.ttfb?.value,
      rating: metrics.ttfb?.rating,
      threshold: PERFORMANCE_THRESHOLDS.ttfb,
      icon: metricIcons.ttfb
    }
  ]

  // Medical-specific metrics
  const medicalMetrics = [
    {
      name: 'searchResponseTime',
      title: 'Medical Search Response',
      description: 'Time for medical query responses',
      value: metrics.searchResponseTime,
      threshold: PERFORMANCE_THRESHOLDS.searchResponse,
      icon: metricIcons.searchResponseTime
    },
    {
      name: 'autocompleteLatency',
      title: 'Autocomplete Suggestions',
      description: 'Medical term suggestion speed',
      value: metrics.autocompleteLatency,
      threshold: PERFORMANCE_THRESHOLDS.autocomplete,
      icon: metricIcons.autocompleteLatency
    },
    {
      name: 'fileUploadTime',
      title: 'File Upload Processing',
      description: 'Medical document upload time',
      value: metrics.fileUploadTime,
      threshold: { good: 2000, poor: 5000 },
      icon: metricIcons.fileUploadTime
    },
    {
      name: 'ttsProcessingTime',
      title: 'TTS Processing',
      description: 'Text-to-speech generation time',
      value: metrics.ttsProcessingTime,
      threshold: { good: 1000, poor: 3000 },
      icon: metricIcons.ttsProcessingTime
    }
  ]

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Performance Dashboard</h2>
            <p className="text-muted-foreground">
              Real-time Core Web Vitals and medical platform performance monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing || isLoading}
                  className="gap-2"
                >
                  <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh performance metrics</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export performance data</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Performance Score Card */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Overall Performance Score</CardTitle>
                <CardDescription>
                  Based on Core Web Vitals and medical-specific metrics
                </CardDescription>
              </div>
              
              <div className="text-right">
                <div className={cn("text-4xl font-bold", getScoreColor(score))} style={score >= 90 ? {color: '#2d2d2d'} : {}}>
                  {score}
                </div>
                <div className="text-sm text-muted-foreground">/ 100</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Progress 
              value={score} 
              className="h-3 mb-4"
            />
            
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Performance Alerts */}
        {hasAlerts && (
          <motion.div
            variants={listItemVariants}
            initial="hidden"
            animate="visible"
          >
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">
                Performance Issues Detected ({alertCount})
              </AlertTitle>
              <AlertDescription className="text-red-700">
                <div className="space-y-2 mt-2">
                  {alerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className="flex items-start justify-between gap-2">
                      <span className="text-sm">{alert}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(index)}
                        className="h-5 w-5 p-0 hover:bg-red-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {alerts.length > 3 && (
                    <p className="text-xs text-red-600">
                      And {alerts.length - 3} more issues...
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllAlerts}
                      className="text-red-700 border-red-300 hover:bg-red-100"
                    >
                      Dismiss All
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Metrics Tabs */}
        <Tabs defaultValue="core-vitals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="core-vitals">Core Web Vitals</TabsTrigger>
            <TabsTrigger value="medical-metrics">Medical Metrics</TabsTrigger>
            <TabsTrigger value="system-metrics">System</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Core Web Vitals Tab */}
          <TabsContent value="core-vitals">
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {coreVitals.map((vital, index) => (
                <motion.div
                  key={vital.name}
                  variants={listItemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {vital.icon}
                          <CardTitle className="text-sm font-medium">
                            {vital.title}
                          </CardTitle>
                        </div>
                        
                        {vital.rating && (
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getRatingColor(vital.rating))}
                            style={vital.rating === 'good' ? {color: '#2d2d2d'} : {}}
                          >
                            {vital.rating === 'good' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {vital.rating.replace('-', ' ')}
                          </Badge>
                        )}
                      </div>
                      
                      <CardDescription className="text-xs">
                        {vital.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {vital.value ? formatMetricValue(vital.name, vital.value) : 'N/A'}
                        </div>
                        
                        {vital.threshold && (
                          <div className="text-xs text-muted-foreground">
                            Good: ≤{formatMetricValue(vital.name, vital.threshold.good)} • 
                            Poor: ≥{formatMetricValue(vital.name, vital.threshold.poor)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Medical Metrics Tab */}
          <TabsContent value="medical-metrics">
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-4 md:grid-cols-2"
            >
              {medicalMetrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  variants={listItemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        {metric.icon}
                        <CardTitle className="text-sm font-medium">
                          {metric.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        {metric.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {metric.value ? formatMetricValue(metric.name, metric.value) : 'N/A'}
                        </div>
                        
                        {metric.threshold && (
                          <div className="text-xs text-muted-foreground">
                            Good: ≤{formatMetricValue(metric.name, metric.threshold.good)} • 
                            Poor: ≥{formatMetricValue(metric.name, metric.threshold.poor)}
                          </div>
                        )}
                        
                        {metric.value && metric.threshold && (
                          <div className="flex items-center gap-2">
                            {metric.value <= metric.threshold.good ? (
                              <CheckCircle className="h-4 w-4" style={{color: '#2d2d2d'}} />
                            ) : metric.value <= metric.threshold.poor ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className={cn(
                              "text-sm font-medium",
                              metric.value <= metric.threshold.good 
                                ? "" 
                                : metric.value <= metric.threshold.poor 
                                ? "text-yellow-600" 
                                : "text-red-600"
                            )} style={metric.value <= metric.threshold.good ? {color: '#2d2d2d'} : {}}>
                              {metric.value <= metric.threshold.good ? 'Good' :
                               metric.value <= metric.threshold.poor ? 'Needs Improvement' : 'Poor'}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* System Metrics Tab */}
          <TabsContent value="system-metrics">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Memory Usage */}
              {metrics.memoryUsage && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-4 w-4" />
                      <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {((metrics.memoryUsage as any).percentage).toFixed(1)}%
                      </div>
                      <Progress value={(metrics.memoryUsage as any).percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {((metrics.memoryUsage as any).used / 1024 / 1024).toFixed(1)}MB / {((metrics.memoryUsage as any).limit / 1024 / 1024).toFixed(1)}MB
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Session Duration */}
              {metrics.sessionDuration && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(metrics.sessionDuration / 60000)}m {Math.floor((metrics.sessionDuration % 60000) / 1000)}s
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Interaction Count */}
              {metrics.interactionCount && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <CardTitle className="text-sm font-medium">Interactions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.interactionCount}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Count */}
              {metrics.errorCount !== undefined && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <CardTitle className="text-sm font-medium">Errors</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      "text-2xl font-bold",
                      metrics.errorCount > 0 ? "text-red-600" : ""
                    )} style={metrics.errorCount === 0 ? {color: '#2d2d2d'} : {}}>
                      {metrics.errorCount}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medical Query Count */}
              {metrics.medicalQueryCount && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <CardTitle className="text-sm font-medium">Medical Queries</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.medicalQueryCount}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Performance Recommendations
                </CardTitle>
                <CardDescription>
                  AI-powered suggestions to improve your medical platform performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  {recommendations.length > 0 ? (
                    <motion.div
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3"
                    >
                      {recommendations.map((recommendation, index) => (
                        <motion.div
                          key={index}
                          variants={listItemVariants}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                        >
                          <Info className="h-4 w-4 text-brand-primary mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-foreground">
                            {recommendation}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center h-40 text-center">
                      <div className="space-y-2">
                        <CheckCircle className="h-12 w-12 mx-auto" style={{color: '#2d2d2d'}} />
                        <p className="text-lg font-medium text-foreground">
                          Great Performance!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          No performance issues detected. Your medical platform is running optimally.
                        </p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Performance monitoring tools and utilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                Refresh Data
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Metrics
              </Button>
              
              <Button 
                variant="outline" 
                onClick={clearMetrics}
                className="gap-2"
              >
                <Database className="h-4 w-4" />
                Clear Storage
              </Button>
              
              <Button 
                variant="outline" 
                onClick={clearAllAlerts}
                disabled={!hasAlerts}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Clear Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

PerformanceDashboard.displayName = "PerformanceDashboard"
export default PerformanceDashboard