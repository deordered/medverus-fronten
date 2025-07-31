"use client"

import { useState } from "react"
import { Check, Brain, BookOpen, Globe, FileText, Info } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUserUsage } from "@/lib/api/hooks"
import { useAuth } from "@/lib/stores/auth-store"
import { MEDICAL_SOURCE_CONFIG, MEDICAL_TIER_LIMITS } from "@/lib/constants/medical"
import { calculateUsagePercentage } from "@/lib/utils"
import type { ContentSource } from "@/types"

interface SourceSelectorProps {
  selectedSource: ContentSource
  onSourceChange: (source: ContentSource) => void
  disabled?: boolean
}

const sourceIcons = {
  medverus_ai: Brain,
  pubmed: BookOpen,
  web_search: Globe,
  file_upload: FileText,
}

export function SourceSelector({ selectedSource, onSourceChange, disabled }: SourceSelectorProps) {
  const { user } = useAuth()
  const { data: usage } = useUserUsage()
  
  const tierLimits = user?.tier ? MEDICAL_TIER_LIMITS[user.tier] : null

  const getSourceUsage = (source: ContentSource) => {
    if (!usage || !tierLimits) return { used: 0, limit: 0, percentage: 0 }
    
    let used = 0
    let limit = 0
    
    if (source === 'file_upload') {
      used = usage.usage.file_upload
      limit = tierLimits.file_upload.count
    } else {
      used = usage.usage[source] || 0
      limit = tierLimits[source] || 0
    }
    
    return {
      used,
      limit,
      percentage: calculateUsagePercentage(used, limit)
    }
  }

  const sources = Object.entries(MEDICAL_SOURCE_CONFIG).map(([key, config]) => {
    const sourceKey = key as ContentSource
    const Icon = sourceIcons[sourceKey]
    const usageData = getSourceUsage(sourceKey)
    const isAtLimit = usageData.percentage >= 100
    const isNearLimit = usageData.percentage >= 80
    
    return {
      key: sourceKey,
      config,
      Icon,
      usage: usageData,
      isAtLimit,
      isNearLimit,
      isDisabled: disabled || isAtLimit
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Content Source</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>Choose the content source for your medical query. Each source provides different types of medical information and has daily usage limits based on your tier.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source) => {
          const Icon = source.Icon
          const isSelected = selectedSource === source.key
          
          return (
            <Card
              key={source.key}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-medical-blue border-medical-blue' : ''
              } ${source.isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !source.isDisabled && onSourceChange(source.key)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${source.config.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{source.config.name}</h4>
                        <p className="text-xs text-muted-foreground">{source.config.type}</p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="h-5 w-5 bg-medical-blue rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground">
                    {source.config.description}
                  </p>

                  {/* Usage Status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Daily Usage</span>
                      <span className="font-medium">
                        {source.usage.used} / {source.usage.limit}
                      </span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          source.isAtLimit
                            ? 'bg-red-500'
                            : source.isNearLimit
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(source.usage.percentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {source.usage.percentage.toFixed(0)}% used
                      </span>
                      
                      {source.isAtLimit && (
                        <Badge variant="destructive" className="text-xs">
                          Limit Reached
                        </Badge>
                      )}
                      {source.isNearLimit && !source.isAtLimit && (
                        <Badge variant="secondary" className="text-xs">
                          Near Limit
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Special Info for File Upload */}
                  {source.key === 'file_upload' && tierLimits && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Max file size: {tierLimits.file_upload.size_mb}MB
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Source Info */}
      {selectedSource && (
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium">Selected:</span>
            <span>{MEDICAL_SOURCE_CONFIG[selectedSource].name}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {MEDICAL_SOURCE_CONFIG[selectedSource].description}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}