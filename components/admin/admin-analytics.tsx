"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  FileText,
  Download,
  Calendar,
  Clock,
  Target,
  Zap
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useAnalyticsData } from "@/lib/api/hooks"

export function AdminAnalytics() {
  const { data: analytics } = useAnalyticsData()
  // TODO: Remove this when analytics data is properly implemented
  analytics // Temporary to avoid unused variable warning

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Platform performance and usage insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Monthly Active Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,567</div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+18.2% from last month</span>
            </div>
            <Progress value={76} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Daily Queries</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4K</div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+25.1% from yesterday</span>
            </div>
            <Progress value={84} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Monthly Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28.4K</div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+31.8% MoM</span>
            </div>
            <Progress value={91} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Conversion Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.8%</div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-red-600">-2.1% from last month</span>
            </div>
            <Progress value={64} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Usage Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Query Distribution by Source</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Curated Medical Knowledge</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">42.3%</span>
                  <span className="text-xs text-muted-foreground">5,234 queries</span>
                </div>
              </div>
              <Progress value={42.3} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">PubMed Research</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">28.7%</span>
                  <span className="text-xs text-muted-foreground">3,556 queries</span>
                </div>
              </div>
              <Progress value={28.7} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Web Search</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">19.2%</span>
                  <span className="text-xs text-muted-foreground">2,378 queries</span>
                </div>
              </div>
              <Progress value={19.2} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Uploaded Documents</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">9.8%</span>
                  <span className="text-xs text-muted-foreground">1,213 queries</span>
                </div>
              </div>
              <Progress value={9.8} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Peak Usage Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Weekdays</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>08:00 - 10:00</span>
                    <Badge variant="secondary">Peak</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>14:00 - 16:00</span>
                    <Badge variant="outline">High</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>20:00 - 22:00</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Weekends</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>10:00 - 12:00</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>15:00 - 17:00</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>19:00 - 21:00</span>
                    <Badge variant="outline">Low</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Average Response Time</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">1.2s</div>
                  <div className="text-xs text-muted-foreground">Simple Queries</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-600">3.8s</div>
                  <div className="text-xs text-muted-foreground">Complex Queries</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">2.1s</div>
                  <div className="text-xs text-muted-foreground">Average</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and User Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Revenue Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pro Subscriptions</span>
                <span className="text-sm font-medium">$18,240</span>
              </div>
              <Progress value={64} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enterprise Licenses</span>
                <span className="text-sm font-medium">$8,960</span>
              </div>
              <Progress value={31} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Usage Overages</span>
                <span className="text-sm font-medium">$1,200</span>
              </div>
              <Progress value={5} className="h-2" />
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between font-medium">
                <span>Total Monthly Revenue</span>
                <span className="text-green-600">$28,400</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>File Upload Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">2,340</div>
                <div className="text-xs text-muted-foreground">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">156</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>PDF Documents</span>
                <span>68%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Word Documents</span>
                <span>22%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Text Files</span>
                <span>7%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>CSV Files</span>
                <span>3%</span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center space-x-2 text-sm">
                <Zap className="h-4 w-4 text-blue-600" />
                <span>Average processing time: 2.3 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Engagement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">76%</div>
                <div className="text-xs text-muted-foreground">Daily Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.2</div>
                <div className="text-xs text-muted-foreground">Avg Session</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Session Duration</span>
                  <span>8.4 min avg</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Queries per Session</span>
                  <span>3.7 avg</span>
                </div>
                <Progress value={62} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Return Rate</span>
                  <span>68% daily</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Detailed Analytics Reports</h3>
              <p className="text-sm text-muted-foreground">
                Access comprehensive analytics data and custom reports
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                Advanced Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}