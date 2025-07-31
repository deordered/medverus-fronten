"use client"

import Link from "next/link"
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserUsage } from "@/lib/api/hooks"
import { useAuth } from "@/lib/stores/auth-store"
import { MEDICAL_ROUTES, MEDICAL_TIER_LIMITS } from "@/lib/constants/medical"
import { calculateUsagePercentage, formatPercentage, getMedicalTierInfo } from "@/lib/utils"

export function UsageOverview() {
  const { user } = useAuth()
  const { data: usage, isLoading, error } = useUserUsage()

  if (isLoading) {
    return <UsageOverviewSkeleton />
  }

  if (error || !usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Failed to load usage data</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const tierInfo = user?.tier ? getMedicalTierInfo(user.tier) : null
  const tierLimits = user?.tier ? MEDICAL_TIER_LIMITS[user.tier] : null

  // Calculate overall usage percentage
  const totalUsed = usage.usage.medverus_ai + usage.usage.pubmed + usage.usage.web_search
  const totalLimit = (tierLimits?.medverus_ai || 0) + (tierLimits?.pubmed || 0) + (tierLimits?.web_search || 0)
  const overallPercentage = calculateUsagePercentage(totalUsed, totalLimit)

  // Find highest usage source
  const usageItems = [
    { name: 'Medverus AI', used: usage.usage.medverus_ai, limit: tierLimits?.medverus_ai || 0 },
    { name: 'PubMed', used: usage.usage.pubmed, limit: tierLimits?.pubmed || 0 },
    { name: 'Web Search', used: usage.usage.web_search, limit: tierLimits?.web_search || 0 },
  ]

  const highestUsage = usageItems.reduce((max, item) => {
    const percentage = calculateUsagePercentage(item.used, item.limit)
    const maxPercentage = calculateUsagePercentage(max.used, max.limit)
    return percentage > maxPercentage ? item : max
  })

  const highestUsagePercentage = calculateUsagePercentage(highestUsage.used, highestUsage.limit)
  const isHighUsage = highestUsagePercentage >= 80
  const isAtLimit = highestUsagePercentage >= 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Usage Overview</CardTitle>
          <Link href={MEDICAL_ROUTES.protected.usage}>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Details
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tier Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Plan</span>
          {tierInfo && (
            <Badge variant="secondary">
              {tierInfo.label}
            </Badge>
          )}
        </div>

        {/* Overall Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Daily Query Usage</span>
            <span className="font-medium">
              {totalUsed} / {totalLimit}
            </span>
          </div>
          <Progress 
            value={overallPercentage} 
            className="h-2"
            indicatorClassName={
              overallPercentage >= 100 
                ? "bg-red-500" 
                : overallPercentage >= 80 
                ? "bg-yellow-500" 
                : "bg-green-500"
            }
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatPercentage(overallPercentage)} used</span>
            {overallPercentage >= 80 && (
              <span className={overallPercentage >= 100 ? "text-red-600" : "text-yellow-600"}>
                {overallPercentage >= 100 ? "Limit reached" : "Near limit"}
              </span>
            )}
          </div>
        </div>

        {/* File Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>File Uploads Today</span>
            <span className="font-medium">
              {usage.usage.file_upload} / {tierLimits?.file_upload.count || 0}
            </span>
          </div>
          <Progress 
            value={calculateUsagePercentage(usage.usage.file_upload, tierLimits?.file_upload.count || 0)} 
            className="h-2"
            indicatorClassName="bg-orange-500"
          />
        </div>

        {/* Usage Status */}
        <div className="pt-2 border-t">
          {isAtLimit ? (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Daily limit reached for {highestUsage.name}</span>
            </div>
          ) : isHighUsage ? (
            <div className="flex items-center space-x-2 text-yellow-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">High usage on {highestUsage.name}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">Usage within normal limits</span>
            </div>
          )}
        </div>

        {/* Reset Timer */}
        {usage.reset_time && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Resets at midnight UTC
          </div>
        )}

        {/* Upgrade CTA for Free tier */}
        {user?.tier === 'free' && overallPercentage > 50 && (
          <div className="pt-2 border-t">
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href={MEDICAL_ROUTES.public.pricing}>
                Upgrade for Higher Limits
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function UsageOverviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>

        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )
}