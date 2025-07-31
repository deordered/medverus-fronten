"use client"

import { AlertTriangle, Upload, CheckCircle2, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserUsage } from "@/lib/api/hooks"
import { useAuth } from "@/lib/stores/auth-store"
import { MEDICAL_TIER_LIMITS, MEDICAL_ROUTES } from "@/lib/constants/medical"
import { calculateUsagePercentage, formatBytes, getMedicalTierInfo } from "@/lib/utils"
import Link from "next/link"

export function UploadLimits() {
  const { user } = useAuth()
  const { data: usage, isLoading, error } = useUserUsage()

  if (isLoading) {
    return <UploadLimitsSkeleton />
  }

  if (error || !usage) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load usage limits</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const tierInfo = user?.tier ? getMedicalTierInfo(user.tier) : null
  const tierLimits = user?.tier ? MEDICAL_TIER_LIMITS[user.tier] : null

  if (!tierLimits) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Unable to determine upload limits for your tier</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const filesUsed = usage.usage.file_upload
  const filesLimit = tierLimits.file_upload.count
  const maxFileSize = tierLimits.file_upload.size_mb * 1024 * 1024
  const filesPercentage = calculateUsagePercentage(filesUsed, filesLimit)

  const isAtLimit = filesPercentage >= 100
  const isNearLimit = filesPercentage >= 80

  return (
    <Card className={isAtLimit ? "border-red-200 bg-red-50" : isNearLimit ? "border-yellow-200 bg-yellow-50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Limits</span>
          </CardTitle>
          {tierInfo && (
            <Badge variant="secondary">
              {tierInfo.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily File Upload Limit */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Daily File Uploads</h4>
              <p className="text-xs text-muted-foreground">
                Number of files you can upload per day
              </p>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {filesUsed} / {filesLimit}
              </div>
              <div className="text-xs text-muted-foreground">
                {filesLimit - filesUsed} remaining
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Progress 
              value={filesPercentage} 
              className="h-2"
              indicatorClassName={
                isAtLimit 
                  ? "bg-red-500" 
                  : isNearLimit 
                  ? "bg-yellow-500" 
                  : "bg-green-500"
              }
            />
            <div className="flex items-center justify-between text-xs">
              <span className={
                isAtLimit 
                  ? "text-red-600" 
                  : isNearLimit 
                  ? "text-yellow-600" 
                  : "text-muted-foreground"
              }>
                {filesPercentage.toFixed(0)}% used
              </span>
              {isAtLimit && (
                <span className="text-red-600 font-medium">
                  Daily limit reached
                </span>
              )}
              {isNearLimit && !isAtLimit && (
                <span className="text-yellow-600 font-medium">
                  Approaching limit
                </span>
              )}
            </div>
          </div>
        </div>

        {/* File Size Limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Maximum File Size</h4>
              <p className="text-xs text-muted-foreground">
                Per file upload limit
              </p>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {formatBytes(maxFileSize)}
              </div>
              <div className="text-xs text-muted-foreground">
                per file
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="pt-3 border-t">
          {isAtLimit ? (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Upload limit reached</span>
            </div>
          ) : isNearLimit ? (
            <div className="flex items-center space-x-2 text-yellow-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Approaching upload limit</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Upload capacity available</span>
            </div>
          )}
        </div>

        {/* Reset Information */}
        {usage.reset_time && (
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <div className="flex items-center space-x-1">
              <span>📅</span>
              <span>
                Upload limits reset at midnight UTC. Next reset: {new Date(usage.reset_time).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Upgrade CTA for users near/at limits */}
        {(isAtLimit || isNearLimit) && user?.tier !== 'enterprise' && (
          <div className="pt-3 border-t">
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Need higher upload limits?
              </p>
              <p className="text-xs text-muted-foreground">
                Upgrade your plan for increased daily upload limits and larger file sizes.
              </p>
              <Button asChild size="sm" className="w-full">
                <Link href={MEDICAL_ROUTES.public.pricing}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function UploadLimitsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <Skeleton className="h-4 w-40" />
        </div>
      </CardContent>
    </Card>
  )
}