"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Ticket, 
  TrendingUp,
  Activity,
  FileText,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Zap,
  Shield
} from "lucide-react"

import { useAdminStats } from "@/lib/api/hooks"

export function AdminOverview() {
  const { data: stats } = useAdminStats()

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>User Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users?.growth || "+12.5%"}</div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Query Volume</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.queries?.volume || "8.4K"}</div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+18% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.revenue?.monthly || "24.6K"}</div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+23% MoM</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.8%</div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span className="text-green-600">All systems operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">API Response Time</span>
                </div>
                <span className="text-sm font-medium">156ms</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Database Performance</span>
                </div>
                <span className="text-sm font-medium">98.2%</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Memory Usage</span>
                </div>
                <span className="text-sm font-medium">72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Storage Available</span>
                </div>
                <span className="text-sm font-medium">2.1TB</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-2 rounded border">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New Pro user registered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2 rounded border">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Ticket className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">50 vouchers generated</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2 rounded border">
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">High API usage detected</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2 rounded border">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Daily backup completed</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Free</Badge>
                <span className="text-sm">1,234 users</span>
              </div>
              <span className="text-sm font-medium">68%</span>
            </div>
            <Progress value={68} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="default">Pro</Badge>
                <span className="text-sm">456 users</span>
              </div>
              <span className="text-sm font-medium">25%</span>
            </div>
            <Progress value={25} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">Enterprise</Badge>
                <span className="text-sm">123 users</span>
              </div>
              <span className="text-sm font-medium">7%</span>
            </div>
            <Progress value={7} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Content Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded border">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Curated Medical</span>
              </div>
              <span className="text-sm font-medium">42%</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded border">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">PubMed Research</span>
              </div>
              <span className="text-sm font-medium">31%</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded border">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Web Search</span>
              </div>
              <span className="text-sm font-medium">18%</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded border">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Uploaded Files</span>
              </div>
              <span className="text-sm font-medium">9%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Ticket className="h-4 w-4 mr-2" />
              Generate Vouchers
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Export User Data
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Download Reports
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Security Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}