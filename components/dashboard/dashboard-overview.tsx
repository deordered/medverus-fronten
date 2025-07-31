"use client"

import { useEffect } from "react"
import { 
  Brain, 
  BookOpen, 
  Globe, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserUsage, useUserProfile } from "@/lib/api/hooks"
import { useAuth } from "@/lib/stores/auth-store"
import { MEDICAL_SOURCE_CONFIG, MEDICAL_TIER_LIMITS } from "@/lib/constants/medical"
import { formatPercentage, calculateUsagePercentage, getMedicalTierInfo } from "@/lib/utils"

export function DashboardOverview() {
  const { user, initialize } = useAuth()
  const { data: usage, isLoading: usageLoading, error: usageError } = useUserUsage()
  const { data: profile, isLoading: profileLoading } = useUserProfile()

  // Initialize auth if needed
  useEffect(() => {
    if (!user) {
      initialize()
    }
  }, [user, initialize])

  if (usageLoading || profileLoading) {
    return <DashboardOverviewSkeleton />
  }

  if (usageError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load usage data</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const tierInfo = user?.tier ? getMedicalTierInfo(user.tier) : null
  const tierLimits = user?.tier ? MEDICAL_TIER_LIMITS[user.tier] : null

  // Source usage data
  const sourceUsage = [
    {
      id: 'medverus_ai',
      name: 'Medverus AI',
      icon: Brain,
      color: 'bg-blue-500',
      used: usage?.usage.medverus_ai || 0,
      limit: tierLimits?.medverus_ai || 0,
      description: 'Admin-curated medical documents'
    },
    {
      id: 'pubmed',
      name: 'PubMed',
      icon: BookOpen,
      color: 'bg-green-500',
      used: usage?.usage.pubmed || 0,
      limit: tierLimits?.pubmed || 0,
      description: 'Biomedical literature from NCBI'
    },
    {
      id: 'web_search',
      name: 'Web Search',
      icon: Globe,
      color: 'bg-purple-500',
      used: usage?.usage.web_search || 0,
      limit: tierLimits?.web_search || 0,
      description: 'Trusted medical websites'
    },
    {
      id: 'file_upload',
      name: 'Document Upload',
      icon: FileText,
      color: 'bg-orange-500',
      used: usage?.usage.file_upload || 0,
      limit: tierLimits?.file_upload.count || 0,
      description: 'Your private documents'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                Welcome back, {profile?.email?.split('@')[0] || 'User'}!
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your medical AI research platform is ready
              </p>
            </div>
            {tierInfo && (
              <Badge variant="secondary" className="text-sm">
                {tierInfo.label} Plan
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(usage?.usage.medverus_ai || 0) + 
                 (usage?.usage.pubmed || 0) + 
                 (usage?.usage.web_search || 0)}
              </div>
              <div className="text-xs text-muted-foreground">Queries Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {usage?.usage.file_upload || 0}
              </div>
              <div className="text-xs text-muted-foreground">Files Uploaded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user?.uploaded_files_count || 0}
              </div>
              <div className="text-xs text-muted-foreground">Total Documents</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <div className="text-xs text-muted-foreground">Account Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Usage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sourceUsage.map((source) => {
          const Icon = source.icon
          const percentage = calculateUsagePercentage(source.used, source.limit)
          const isNearLimit = percentage >= 80
          const isAtLimit = percentage >= 100

          return (
            <Card key={source.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-md ${source.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {source.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {source.description}
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
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Usage today</span>
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
                        : "bg-green-500"
                    }
                  />
                  <div className="text-xs text-muted-foreground">
                    {formatPercentage(percentage)} used
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Usage Reset Timer */}
      {usage?.reset_time && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Usage limits reset at midnight UTC ({new Date(usage.reset_time).toLocaleDateString()})
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}