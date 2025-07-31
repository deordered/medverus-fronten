"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useSearchAnalytics } from "@/lib/performance/search-optimization"
import { listVariants, listItemVariants } from "@/lib/animations/motion-variants"
import { useAnimationSafeMotion } from "@/lib/animations/hooks"
import { cn } from "@/lib/utils"
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Target,
  BarChart3,
  Wifi,
  ChevronDown,
  ChevronUp,
  Activity
} from "lucide-react"

interface SearchPerformanceMonitorProps {
  className?: string
  showDetails?: boolean
}

/**
 * Search Performance Monitor Component
 * Real-time performance metrics and optimization indicators
 */
export function SearchPerformanceMonitor({ 
  className, 
  showDetails = false 
}: SearchPerformanceMonitorProps) {
  const [expanded, setExpanded] = useState(showDetails)
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    responseTime: 0,
    cacheHitRate: 0,
    searchCount: 0,
    optimizationLevel: 'High'
  })
  
  const { shouldAnimate } = useAnimationSafeMotion()
  const { getMetrics } = useSearchAnalytics()

  // PERFORMANCE OPTIMIZATION: Enhanced real-time metrics with performance scoring
  useEffect(() => {
    const updateMetrics = () => {
      const metrics = getMetrics()
      const responseTime = Math.round(metrics.avgResponseTime || 0)
      const cacheHitRate = Math.round(metrics.cacheHitRate || 0)
      
      // Calculate optimization level based on multiple factors
      const performanceScore = (
        (Math.max(0, 100 - responseTime / 5)) * 0.4 + // Response time weight: 40%
        cacheHitRate * 0.4 +                         // Cache hit rate weight: 40%
        (metrics.searchCount > 0 ? 90 : 0) * 0.2     // Active usage weight: 20%
      )
      
      let optimizationLevel = 'Initializing'
      if (performanceScore >= 85) optimizationLevel = 'Excellent'
      else if (performanceScore >= 70) optimizationLevel = 'Good'  
      else if (performanceScore >= 50) optimizationLevel = 'Fair'
      else if (metrics.searchCount > 0) optimizationLevel = 'Improving'
      
      setRealTimeMetrics({
        responseTime,
        cacheHitRate,
        searchCount: metrics.searchCount || 0,
        optimizationLevel
      })
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 1500) // Faster updates for better UX

    return () => clearInterval(interval)
  }, [getMetrics])

  // Performance indicators
  const getPerformanceColor = (value: number, type: 'time' | 'rate') => {
    if (type === 'time') {
      return value < 200 ? 'text-green-600' : 
             value < 500 ? 'text-yellow-600' : 'text-red-600'
    } else {
      return value > 70 ? 'text-green-600' : 
             value > 50 ? 'text-yellow-600' : 'text-red-600'
    }
  }

  const getOptimizationBadgeVariant = (level: string) => {
    switch (level) {
      case 'Excellent': return 'default'
      case 'Good': return 'secondary'
      case 'Fair': return 'outline'
      default: return 'destructive'
    }
  }

  return (
    <motion.div
      className={cn("w-full", className)}
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="border border-medical-primary/20 bg-gradient-to-r from-medical-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-medical-primary/10">
                <Activity className="h-4 w-4 text-medical-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">Search Performance</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Real-time optimization metrics
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={getOptimizationBadgeVariant(realTimeMetrics.optimizationLevel)}
                className="text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                {realTimeMetrics.optimizationLevel}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="h-6 w-6 p-0"
              >
                {expanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Quick Metrics */}
          <motion.div
            className="grid grid-cols-3 gap-4 mb-4"
            variants={listItemVariants}
          >
            <div className="text-center">
              <div className={cn("text-lg font-bold", getPerformanceColor(realTimeMetrics.responseTime, 'time'))}>
                {realTimeMetrics.responseTime}ms
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Avg Response
              </div>
            </div>
            
            <div className="text-center">
              <div className={cn("text-lg font-bold", getPerformanceColor(realTimeMetrics.cacheHitRate, 'rate'))}>
                {realTimeMetrics.cacheHitRate}%
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Target className="h-3 w-3" />
                Cache Hits
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-medical-primary">
                {realTimeMetrics.searchCount}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Searches
              </div>
            </div>
          </motion.div>

          {/* Expanded Details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-4 border-t pt-4"
              >
                {/* Performance Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance Breakdown
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Search Caching</span>
                      <span className="font-medium">{realTimeMetrics.cacheHitRate}%</span>
                    </div>
                    <Progress 
                      value={realTimeMetrics.cacheHitRate} 
                      className="h-1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Response Time</span>
                      <span className="font-medium">
                        {realTimeMetrics.responseTime < 300 ? 'Excellent' : 
                         realTimeMetrics.responseTime < 500 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                    <Progress 
                      value={Math.max(0, 100 - (realTimeMetrics.responseTime / 10))} 
                      className="h-1"
                    />
                  </div>
                </div>

                {/* Optimization Features */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    Active Optimizations
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="outline" className="text-xs justify-center">
                      <Zap className="h-3 w-3 mr-1" />
                      Debounced Search
                    </Badge>
                    <Badge variant="outline" className="text-xs justify-center">
                      <Target className="h-3 w-3 mr-1" />
                      Smart Caching
                    </Badge>
                    <Badge variant="outline" className="text-xs justify-center">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Virtual Scrolling
                    </Badge>
                    <Badge variant="outline" className="text-xs justify-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Instant Suggestions
                    </Badge>
                  </div>
                </div>

                {/* Performance Tips */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Performance Tip:</strong> Your search is optimized with intelligent caching, 
                    debounced input, and virtual scrolling for the best experience.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

SearchPerformanceMonitor.displayName = "SearchPerformanceMonitor"
export default SearchPerformanceMonitor