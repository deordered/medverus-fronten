"use client"

import Link from "next/link"
import { AlertTriangle, TrendingUp, Clock, ExternalLink } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useUserUsage } from "@/lib/api/hooks"
import { useAuth } from "@/lib/stores/auth-store"
import { MEDICAL_ROUTES, MEDICAL_TIER_LIMITS } from "@/lib/constants/medical"
import { calculateUsagePercentage, getMedicalTierInfo } from "@/lib/utils"

interface UsageLimitsAlertProps {
  hasExceeded: boolean
  isApproaching: boolean
}

export function UsageLimitsAlert({ hasExceeded, isApproaching }: UsageLimitsAlertProps) {
  const { user } = useAuth()
  const { data: usage } = useUserUsage()

  if (!usage || (!hasExceeded && !isApproaching)) {
    return null
  }

  const tierInfo = user?.tier ? getMedicalTierInfo(user.tier) : null
  const tierLimits = user?.tier ? MEDICAL_TIER_LIMITS[user.tier] : null

  // Find the sources that are at or near limits
  const limitedSources = []
  
  if (tierLimits) {
    const sources = [
      { 
        name: 'Medverus AI', 
        key: 'medverus_ai',
        used: usage.usage.medverus_ai, 
        limit: tierLimits.medverus_ai 
      },
      { 
        name: 'PubMed', 
        key: 'pubmed',
        used: usage.usage.pubmed, 
        limit: tierLimits.pubmed 
      },
      { 
        name: 'Web Search', 
        key: 'web_search',
        used: usage.usage.web_search, 
        limit: tierLimits.web_search 
      },
      { 
        name: 'File Upload', 
        key: 'file_upload',
        used: usage.usage.file_upload, 
        limit: tierLimits.file_upload.count 
      },
    ]

    sources.forEach(source => {
      const percentage = calculateUsagePercentage(source.used, source.limit)
      if (percentage >= 80) {
        limitedSources.push({
          ...source,
          percentage,
          isExceeded: percentage >= 100
        })
      }
    })
  }

  if (hasExceeded) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="space-y-3">
            <div>
              <strong>Daily Usage Limits Exceeded</strong>
              <p className="mt-1">
                You have reached your daily query limits for one or more content sources. 
                Limits will reset at midnight UTC.
              </p>
            </div>

            {limitedSources.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Affected sources:</p>
                {limitedSources.map(source => (
                  <div key={source.key} className="flex items-center justify-between text-sm">
                    <span>{source.name}</span>
                    <div className="flex items-center space-x-2">
                      <span>{source.used}/{source.limit}</span>
                      {source.isExceeded && (
                        <span className="text-red-600 font-medium">EXCEEDED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <Button asChild size="sm" variant="outline">
                <Link href={MEDICAL_ROUTES.protected.usage}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Usage Details
                </Link>
              </Button>
              
              {user?.tier === 'free' && (
                <Button asChild size="sm">
                  <Link href={MEDICAL_ROUTES.public.pricing}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Link>
                </Button>
              )}
            </div>

            {usage.reset_time && (
              <div className="flex items-center space-x-1 text-sm">
                <Clock className="h-3 w-3" />
                <span>Limits reset at midnight UTC</span>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (isApproaching) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <TrendingUp className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <div className="space-y-3">
            <div>
              <strong>Approaching Usage Limits</strong>
              <p className="mt-1">
                You're approaching your daily query limits for some content sources.
              </p>
            </div>

            {limitedSources.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Current usage:</p>
                {limitedSources.map(source => (
                  <div key={source.key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{source.name}</span>
                      <span>{source.used}/{source.limit} ({source.percentage.toFixed(0)}%)</span>
                    </div>
                    <Progress 
                      value={source.percentage} 
                      className="h-2"
                      indicatorClassName={
                        source.percentage >= 100 
                          ? "bg-red-500" 
                          : source.percentage >= 80 
                          ? "bg-yellow-500" 
                          : "bg-green-500"
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <Button asChild size="sm" variant="outline">
                <Link href={MEDICAL_ROUTES.protected.usage}>
                  View Details
                </Link>
              </Button>
              
              {user?.tier === 'free' && (
                <Button asChild size="sm" variant="outline">
                  <Link href={MEDICAL_ROUTES.public.pricing}>
                    Upgrade for Higher Limits
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}