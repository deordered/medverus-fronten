"use client"

import { useState } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Calendar,
  Brain,
  BookOpen,
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserUsage } from "@/lib/api/hooks"
import { useAuth } from "@/lib/stores/auth-store"
import { MEDICAL_TIER_LIMITS, MEDICAL_SOURCE_CONFIG } from "@/lib/constants/medical"
import { calculateUsagePercentage, formatPercentage, getMedicalTierInfo } from "@/lib/utils"

// Mock data for usage trends - in real app this would come from API
const mockUsageTrends = {
  daily: [
    { name: 'Mon', medverus_ai: 8, pubmed: 12, web_search: 15, file_upload: 2 },
    { name: 'Tue', medverus_ai: 12, pubmed: 8, web_search: 20, file_upload: 1 },
    { name: 'Wed', medverus_ai: 15, pubmed: 18, web_search: 25, file_upload: 3 },
    { name: 'Thu', medverus_ai: 10, pubmed: 15, web_search: 18, file_upload: 2 },
    { name: 'Fri', medverus_ai: 18, pubmed: 20, web_search: 30, file_upload: 4 },
    { name: 'Sat', medverus_ai: 5, pubmed: 8, web_search: 10, file_upload: 1 },
    { name: 'Sun', medverus_ai: 3, pubmed: 5, web_search: 8, file_upload: 0 },
  ],
  weekly: [
    { name: 'Week 1', medverus_ai: 85, pubmed: 92, web_search: 140, file_upload: 15 },
    { name: 'Week 2', medverus_ai: 78, pubmed: 88, web_search: 135, file_upload: 12 },
    { name: 'Week 3', medverus_ai: 92, pubmed: 105, web_search: 160, file_upload: 18 },
    { name: 'Week 4', medverus_ai: 88, pubmed: 98, web_search: 145, file_upload: 16 },
  ]
}

export function UsageAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly'>('daily')
  const { user } = useAuth()
  const { data: usage, isLoading, error } = useUserUsage()

  if (isLoading) {
    return <UsageAnalyticsSkeleton />
  }

  if (error || !usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load usage analytics</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const tierInfo = user?.tier ? getMedicalTierInfo(user.tier) : null
  const tierLimits = user?.tier ? MEDICAL_TIER_LIMITS[user.tier] : null

  // Calculate total usage and remaining
  const totalQueriesUsed = usage.usage.medverus_ai + usage.usage.pubmed + usage.usage.web_search
  const totalQueriesLimit = (tierLimits?.medverus_ai || 0) + (tierLimits?.pubmed || 0) + (tierLimits?.web_search || 0)
  const totalFilesUsed = usage.usage.file_upload
  const totalFilesLimit = tierLimits?.file_upload.count || 0

  // Source usage data
  const sourceUsage = [
    {
      id: 'medverus_ai',
      name: 'Medverus AI',
      icon: Brain,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      used: usage.usage.medverus_ai,
      limit: tierLimits?.medverus_ai || 0,
    },
    {
      id: 'pubmed',
      name: 'PubMed',
      icon: BookOpen,
      color: 'bg-primary',
      textColor: 'text-primary',
      used: usage.usage.pubmed,
      limit: tierLimits?.pubmed || 0,
    },
    {
      id: 'web_search',
      name: 'Web Search',
      icon: Globe,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      used: usage.usage.web_search,
      limit: tierLimits?.web_search || 0,
    },
    {
      id: 'file_upload',
      name: 'File Upload',
      icon: FileText,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      used: usage.usage.file_upload,
      limit: tierLimits?.file_upload.count || 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Queries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQueriesUsed}</div>
            <p className="text-xs text-muted-foreground">
              of {totalQueriesLimit} daily limit
            </p>
            <Progress 
              value={calculateUsagePercentage(totalQueriesUsed, totalQueriesLimit)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        {/* Files Uploaded */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Uploaded Today</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFilesUsed}</div>
            <p className="text-xs text-muted-foreground">
              of {totalFilesLimit} daily limit
            </p>
            <Progress 
              value={calculateUsagePercentage(totalFilesUsed, totalFilesLimit)} 
              className="mt-2 h-2"
              indicatorClassName="bg-orange-500"
            />
          </CardContent>
        </Card>

        {/* Current Tier */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tierInfo?.label || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              {tierInfo?.description || 'Tier information'}
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className={tierInfo?.color || ''}>
                {user?.tier?.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Usage by Source */}
      <Card>
        <CardHeader>
          <CardTitle>Usage by Content Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sourceUsage.map((source) => {
              const Icon = source.icon
              const percentage = calculateUsagePercentage(source.used, source.limit)
              const isNearLimit = percentage >= 80
              const isAtLimit = percentage >= 100

              return (
                <div key={source.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${source.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{source.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Daily usage tracking
                        </p>
                      </div>
                    </div>
                    {isAtLimit && (
                      <Badge variant="destructive" className="text-xs">
                        Limit Reached
                      </Badge>
                    )}
                    {isNearLimit && !isAtLimit && (
                      <Badge variant="secondary" className="text-xs">
                        Near Limit
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Usage</span>
                      <span className="font-medium">
                        {source.used} / {source.limit}
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                      indicatorClassName={
                        isAtLimit 
                          ? "bg-red-500" 
                          : isNearLimit 
                          ? "bg-yellow-500" 
                          : source.color.replace('bg-', 'bg-')
                      }
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatPercentage(percentage)} used</span>
                      <span>Resets at midnight UTC</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usage Trends</CardTitle>
            <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as 'daily' | 'weekly')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple trend visualization - in real app this would be a proper chart */}
            <div className="space-y-3">
              {mockUsageTrends[selectedPeriod].map((period, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{period.name}</span>
                    <span className="text-muted-foreground">
                      Total: {period.medverus_ai + period.pubmed + period.web_search + period.file_upload}
                    </span>
                  </div>
                  <div className="flex space-x-1 h-8">
                    <div 
                      className="bg-blue-500 rounded-l"
                      style={{ 
                        width: `${(period.medverus_ai / Math.max(...mockUsageTrends[selectedPeriod].map(p => p.medverus_ai + p.pubmed + p.web_search + p.file_upload))) * 100}%`,
                        minWidth: period.medverus_ai > 0 ? '4px' : '0'
                      }}
                      title={`Medverus AI: ${period.medverus_ai}`}
                    />
                    <div 
                      style={{backgroundColor: '#2d2d2d'}}
                      style={{ 
                        width: `${(period.pubmed / Math.max(...mockUsageTrends[selectedPeriod].map(p => p.medverus_ai + p.pubmed + p.web_search + p.file_upload))) * 100}%`,
                        minWidth: period.pubmed > 0 ? '4px' : '0'
                      }}
                      title={`PubMed: ${period.pubmed}`}
                    />
                    <div 
                      className="bg-purple-500"
                      style={{ 
                        width: `${(period.web_search / Math.max(...mockUsageTrends[selectedPeriod].map(p => p.medverus_ai + p.pubmed + p.web_search + p.file_upload))) * 100}%`,
                        minWidth: period.web_search > 0 ? '4px' : '0'
                      }}
                      title={`Web Search: ${period.web_search}`}
                    />
                    <div 
                      className="bg-orange-500 rounded-r"
                      style={{ 
                        width: `${(period.file_upload / Math.max(...mockUsageTrends[selectedPeriod].map(p => p.medverus_ai + p.pubmed + p.web_search + p.file_upload))) * 100}%`,
                        minWidth: period.file_upload > 0 ? '4px' : '0'
                      }}
                      title={`File Upload: ${period.file_upload}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-blue-500 rounded"></div>
                <span className="text-xs">Medverus AI</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded" style={{backgroundColor: '#2d2d2d'}}></div>
                <span className="text-xs">PubMed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-purple-500 rounded"></div>
                <span className="text-xs">Web Search</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-orange-500 rounded"></div>
                <span className="text-xs">File Upload</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Information */}
      {usage.reset_time && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Usage Limits Reset</p>
                <p>
                  Daily limits reset at midnight UTC. Next reset: {new Date(usage.reset_time).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function UsageAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Usage Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trends Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}