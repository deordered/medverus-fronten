"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  Clock,
  FileText,
  Globe,
  Search,
  TrendingUp,
  Upload,
  Users,
  Zap,
  Target,
  Award,
  Timer
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { cn, formatMedicalDate } from "@/lib/utils"
import { useAuth, useMedicalTier } from "@/hooks/use-auth"

interface QuickAction {
  label: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  tier?: ('free' | 'pro' | 'enterprise')[]
}

interface DashboardHomeProps {
  className?: string
}

const quickActions: QuickAction[] = [
  {
    label: "Medical Query",
    description: "Search medical knowledge with AI",
    href: "/medical/query",
    icon: Search,
    color: "bg-medical-primary"
  },
  {
    label: "Upload Documents",
    description: "Add medical files to your library",
    href: "/medical/upload",
    icon: Upload,
    color: "bg-medical-success",
    tier: ['pro', 'enterprise']
  },
  {
    label: "View Analytics",
    description: "Track your research patterns",
    href: "/medical/analytics",
    icon: BarChart3,
    color: "bg-medical-warning",
    tier: ['pro', 'enterprise']
  },
  {
    label: "Medical AI",
    description: "Advanced AI research tools",
    href: "/medical/ai",
    icon: Brain,
    color: "bg-source-web"
  }
]

// Mock data for development
const mockRecentQueries = [
  {
    id: "1",
    query: "What are the latest treatment protocols for diabetes?",
    timestamp: "2024-01-27T10:30:00Z",
    source: "medverus_ai",
    results: 8
  },
  {
    id: "2", 
    query: "Side effects of ACE inhibitors in elderly patients",
    timestamp: "2024-01-27T09:15:00Z",
    source: "pubmed",
    results: 12
  },
  {
    id: "3",
    query: "Clinical guidelines for hypertension management",
    timestamp: "2024-01-26T16:45:00Z",
    source: "medverus_ai",
    results: 15
  }
]

const mockSystemStats = {
  totalUsers: 12456,
  activeQueries: 1834,
  documentsProcessed: 89234,
  averageResponseTime: 2.3
}

export function DashboardHome({ className }: DashboardHomeProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { tier, limits, usage } = useMedicalTier()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getUsageStats = () => {
    const totalUsed = Object.values(usage).reduce((sum, val) => sum + val, 0)
    const totalLimit = Object.values(limits).reduce((sum, limit) => 
      sum + (typeof limit === 'number' ? limit : limit.count), 0
    )
    return {
      used: totalUsed,
      limit: totalLimit,
      percentage: totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0
    }
  }

  const usageStats = getUsageStats()

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const canAccessAction = (action: QuickAction) => {
    if (!action.tier) return true
    return action.tier.includes(tier)
  }

  const getSourceIcon = (source: string) => {
    const icons = {
      medverus_ai: Brain,
      pubmed: BookOpen,
      web_search: Globe,
      file_upload: FileText
    }
    return icons[source as keyof typeof icons] || Search
  }

  const getSourceColor = (source: string) => {
    const colors = {
      medverus_ai: "text-medical-primary",
      pubmed: "text-medical-success",
      web_search: "text-source-web",
      file_upload: "text-source-files"
    }
    return colors[source as keyof typeof colors] || "text-muted-foreground"
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
          <span className="mx-2">•</span>
          <Clock className="h-4 w-4" />
          {currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
        <h1 className="text-3xl font-bold">
          {getGreeting()}, {user?.email?.split('@')[0] || 'Medical Professional'}!
        </h1>
        <p className="text-muted-foreground">
          Welcome to your Medverus AI medical research dashboard. 
          Access trusted medical knowledge and manage your research workflow.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Queries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.used}</div>
            <p className="text-xs text-muted-foreground">
              of {usageStats.limit} daily limit
            </p>
            <div className="mt-2">
              <Progress value={usageStats.percentage} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Tier</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{tier}</div>
            <p className="text-xs text-muted-foreground">
              {tier === 'free' ? 'Basic access' : 
               tier === 'pro' ? 'Enhanced features' : 
               'Full enterprise access'}
            </p>
            <Badge variant={`tier-${tier}` as any} className="mt-2">
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.file_upload}</div>
            <p className="text-xs text-muted-foreground">
              of {typeof limits.file_upload === 'object' ? limits.file_upload.count : limits.file_upload} max files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSystemStats.averageResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              System performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Warning */}
      {usageStats.percentage >= 80 && (
        <Alert variant={usageStats.percentage >= 95 ? "destructive" : "medical-warning"}>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            You've used {Math.round(usageStats.percentage)}% of your daily quota. 
            {usageStats.percentage >= 95 ? 
              " You're at your limit - consider upgrading your tier." :
              " Consider upgrading your tier for higher limits."
            }
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const canAccess = canAccessAction(action)
              
              return (
                <Card 
                  key={action.href} 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    !canAccess && "opacity-50"
                  )}
                  onClick={() => canAccess && router.push(action.href)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-3 rounded-lg", action.color)}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium">{action.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                        {!canAccess && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {tier === 'free' ? 'Pro Feature' : 'Enterprise Feature'}
                          </Badge>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Recent Queries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Queries</h2>
              <Button variant="outline" size="sm" onClick={() => router.push("/medical/history")}>
                View All
              </Button>
            </div>
            
            {mockRecentQueries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-muted rounded-full">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No queries yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your medical research by asking a question
                  </p>
                  <Button onClick={() => router.push("/medical/query")}>
                    <Search className="mr-2 h-4 w-4" />
                    Start Query
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {mockRecentQueries.map((query) => {
                  const SourceIcon = getSourceIcon(query.source)
                  const sourceColor = getSourceColor(query.source)
                  
                  return (
                    <Card 
                      key={query.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => router.push(`/medical/history?q=${query.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-muted/50 rounded-lg">
                            <SourceIcon className={cn("h-4 w-4", sourceColor)} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium line-clamp-2">{query.query}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatMedicalDate(query.timestamp)}</span>
                              <span>•</span>
                              <span>{query.results} results</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Usage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage Breakdown</CardTitle>
              <CardDescription>Your daily query usage by source</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-medical-primary" />
                    <span className="text-sm">Medverus AI</span>
                  </div>
                  <div className="text-sm font-medium">
                    {usage.medverus_ai} / {limits.medverus_ai}
                  </div>
                </div>
                <Progress 
                  value={(usage.medverus_ai / limits.medverus_ai) * 100} 
                  className="h-2" 
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-medical-success" />
                    <span className="text-sm">PubMed</span>
                  </div>
                  <div className="text-sm font-medium">
                    {usage.pubmed} / {limits.pubmed}
                  </div>
                </div>
                <Progress 
                  value={(usage.pubmed / limits.pubmed) * 100} 
                  className="h-2" 
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-source-web" />
                    <span className="text-sm">Web Search</span>
                  </div>
                  <div className="text-sm font-medium">
                    {usage.web_search} / {limits.web_search}
                  </div>
                </div>
                <Progress 
                  value={(usage.web_search / limits.web_search) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
              <CardDescription>Medverus platform metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Users</span>
                <span className="text-sm font-medium">{mockSystemStats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Queries Today</span>
                <span className="text-sm font-medium">{mockSystemStats.activeQueries.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Documents Processed</span>
                <span className="text-sm font-medium">{mockSystemStats.documentsProcessed.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Response Time</span>
                <span className="text-sm font-medium">{mockSystemStats.averageResponseTime}s</span>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Prompt */}
          {tier === 'free' && (
            <Card className="border-medical-primary/20 bg-medical-primary/5">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="p-2 bg-medical-primary/10 rounded-full inline-block">
                    <Zap className="h-6 w-6 text-medical-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Upgrade to Pro</h3>
                    <p className="text-sm text-muted-foreground">
                      Get higher limits, document uploads, and advanced analytics
                    </p>
                  </div>
                  <Button size="sm" onClick={() => router.push("/settings/billing")}>
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}