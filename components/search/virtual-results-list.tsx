"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { listVariants, listItemVariants } from "@/lib/animations/motion-variants"
import { useAnimationSafeMotion } from "@/lib/animations/hooks"
import { cn } from "@/lib/utils"
import { 
  FileText, 
  ExternalLink, 
  Calendar, 
  Star,
  ChevronRight,
  Sparkles,
  Clock,
  TrendingUp
} from "lucide-react"

interface SearchResult {
  id: string
  title: string
  content: string
  source: string
  url?: string
  timestamp: string
  confidence: number
  type?: 'article' | 'study' | 'guideline' | 'drug' | 'other'
  metadata?: {
    authors?: string[]
    journal?: string
    citations?: number
    lastUpdated?: string
  }
}

interface VirtualResultsListProps {
  results: SearchResult[]
  isLoading?: boolean
  onResultClick?: (result: SearchResult) => void
  className?: string
  itemHeight?: number
  maxVisibleItems?: number
  showMetadata?: boolean
}

const ITEM_HEIGHT = 120 // Height per result item
const OVERSCAN = 5 // Extra items to render outside viewport

/**
 * Virtual Results List Component
 * High-performance rendering for large search result sets
 */
export function VirtualResultsList({
  results,
  isLoading = false,
  onResultClick,
  className,
  itemHeight = ITEM_HEIGHT,
  maxVisibleItems = 10,
  showMetadata = true
}: VirtualResultsListProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { shouldAnimate } = useAnimationSafeMotion()

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!containerHeight) return { start: 0, end: Math.min(maxVisibleItems, results.length) }
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - OVERSCAN)
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * OVERSCAN
    const end = Math.min(results.length, start + visibleCount)
    
    return { start, end }
  }, [scrollTop, containerHeight, itemHeight, results.length, maxVisibleItems])

  // PERFORMANCE OPTIMIZATION: Memoized virtual items with shallow comparison
  const virtualItems = useMemo(() => {
    if (results.length === 0) return []
    
    return results.slice(visibleRange.start, visibleRange.end).map((result, index) => {
      const virtualIndex = visibleRange.start + index
      return {
        ...result,
        virtualIndex,
        style: {
          position: 'absolute' as const,
          top: virtualIndex * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
          transform: `translateZ(0)` // Force GPU acceleration
        }
      }
    })
  }, [results, visibleRange.start, visibleRange.end, itemHeight])

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  // Measure container height
  useEffect(() => {
    const measureHeight = () => {
      if (scrollAreaRef.current) {
        const rect = scrollAreaRef.current.getBoundingClientRect()
        setContainerHeight(rect.height)
      }
    }

    measureHeight()
    window.addEventListener('resize', measureHeight)
    return () => window.removeEventListener('resize', measureHeight)
  }, [])

  // Get result type icon
  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'study':
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'guideline':
        return <FileText className="h-4 w-4 text-green-600" />
      case 'drug':
        return <Sparkles className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600"
    if (confidence >= 0.7) return "text-yellow-600"
    return "text-red-600"
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        {renderSkeleton()}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <motion.div 
        className={cn("w-full text-center py-12", className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No results found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search terms or filters
        </p>
      </motion.div>
    )
  }

  const totalHeight = results.length * itemHeight

  return (
    <div className={cn("w-full", className)}>
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-[600px]"
        onScrollCapture={handleScroll}
      >
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="relative"
          style={{ height: totalHeight }}
        >
          <AnimatePresence mode="popLayout">
            {virtualItems.map((item) => (
              <motion.div
                key={item.id}
                variants={listItemVariants}
                layout={shouldAnimate}
                style={item.style}
                className="px-4"
              >
                <Card 
                  className="h-full cursor-pointer transition-all hover:shadow-md hover:border-medical-primary/30"
                  onClick={() => onResultClick?.(item)}
                >
                  <CardContent className="p-4 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getTypeIcon(item.type)}
                        <Badge variant="outline" className="text-xs shrink-0">
                          {item.source}
                        </Badge>
                        {showMetadata && item.metadata?.journal && (
                          <span className="text-xs text-muted-foreground truncate">
                            {item.metadata.journal}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <Star className={cn("h-3 w-3", getConfidenceColor(item.confidence))} />
                          <span className={cn("text-xs font-medium", getConfidenceColor(item.confidence))}>
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-medium line-clamp-2 mb-2 flex-shrink-0">
                      {item.title}
                    </h3>

                    {/* Content */}
                    <p className="text-xs text-muted-foreground line-clamp-3 flex-1 mb-3">
                      {item.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatTimestamp(item.timestamp)}</span>
                        </div>
                        
                        {showMetadata && item.metadata?.citations && (
                          <div className="flex items-center gap-1">
                            <span>Citations: {item.metadata.citations}</span>
                          </div>
                        )}
                      </div>
                      
                      {item.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(item.url, '_blank')
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </ScrollArea>

      {/* Results summary */}
      <div className="flex items-center justify-between p-4 border-t bg-muted/30">
        <div className="text-sm text-muted-foreground">
          Showing {visibleRange.start + 1}-{Math.min(visibleRange.end, results.length)} of {results.length} results
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Optimized rendering</span>
        </div>
      </div>
    </div>
  )
}

VirtualResultsList.displayName = "VirtualResultsList"
export default VirtualResultsList