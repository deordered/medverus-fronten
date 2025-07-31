"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Activity, 
  Server, 
  Database, 
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Shield,
  RefreshCw,
  Settings,
  Bell,
  Trash2
} from "lucide-react"

export function SystemMonitoring() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">Real-time system health and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>API Server</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Operational</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Uptime: 99.98% (30d)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Database</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Healthy</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Response: 12ms avg
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>AI Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium">Degraded</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Queue: 23 pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Secure</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Last scan: 2h ago
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">CPU Usage</span>
                </div>
                <span className="text-sm font-medium">42%</span>
              </div>
              <Progress value={42} className="h-2" />
              <div className="text-xs text-muted-foreground">
                8 cores active, load avg: 2.1
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MemoryStick className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Memory Usage</span>
                </div>
                <span className="text-sm font-medium">68%</span>
              </div>
              <Progress value={68} className="h-2" />
              <div className="text-xs text-muted-foreground">
                5.4GB / 8GB used, swap: 0%
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Disk Usage</span>
                </div>
                <span className="text-sm font-medium">34%</span>
              </div>
              <Progress value={34} className="h-2" />
              <div className="text-xs text-muted-foreground">
                340GB / 1TB used, I/O: normal
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Network className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Network I/O</span>
                </div>
                <span className="text-sm font-medium">23%</span>
              </div>
              <Progress value={23} className="h-2" />
              <div className="text-xs text-muted-foreground">
                In: 124 Mbps, Out: 89 Mbps
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>Service Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">API Gateway</div>
                    <div className="text-xs text-muted-foreground">Load balancer active</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  Healthy
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Authentication Service</div>
                    <div className="text-xs text-muted-foreground">JWT validation active</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  Healthy
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">AI Processing</div>
                    <div className="text-xs text-muted-foreground">High queue volume</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-600">
                  Warning
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">File Storage</div>
                    <div className="text-xs text-muted-foreground">S3 buckets operational</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  Healthy
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Email Service</div>
                    <div className="text-xs text-muted-foreground">SMTP relay active</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  Healthy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medverus AI Vector DB Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Medverus AI Vector DB Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vector DB Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Vector Index Status</span>
                <Badge variant="secondary" className="text-green-600">
                  Synchronized
                </Badge>
              </div>
              <div className="text-2xl font-bold">1,247,892</div>
              <div className="text-xs text-muted-foreground">embeddings indexed</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Last Retraining</span>
                <Badge variant="outline" className="text-blue-600">
                  Completed
                </Badge>
              </div>
              <div className="text-2xl font-bold">2h 15m</div>
              <div className="text-xs text-muted-foreground">ago</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Query Performance</span>
                <Badge variant="secondary" className="text-green-600">
                  Optimal
                </Badge>
              </div>
              <div className="text-2xl font-bold">124ms</div>
              <div className="text-xs text-muted-foreground">avg similarity search</div>
            </div>
          </div>

          {/* Vector DB Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Data Management</h4>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Upload Medical Data for Vector Embedding
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Outdated Vector Data
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Trigger Manual Re-indexing
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Model Operations</h4>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Trigger Model Retraining
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Embedding Parameters
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Run Vector Quality Assessment
                </Button>
              </div>
            </div>
          </div>

          {/* Vector DB Metrics */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Performance Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Index Utilization</span>
                  <span className="text-sm font-medium">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Similarity Accuracy</span>
                  <span className="text-sm font-medium">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
            </div>
          </div>

          {/* Recent Vector Operations */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Recent Operations</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Vector index rebuilt successfully</span>
                </div>
                <span className="text-muted-foreground">5 minutes ago</span>
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>Medical guidelines embeddings updated</span>
                </div>
                <span className="text-muted-foreground">23 minutes ago</span>
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Similarity search optimization completed</span>
                </div>
                <span className="text-muted-foreground">1 hour ago</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Active Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">High AI Queue Volume</div>
                  <div className="text-xs text-muted-foreground">
                    Processing queue has 23 pending requests
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-600">
                  Warning
                </Badge>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded border-blue-200 bg-blue-50">
                <Clock className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Scheduled Maintenance</div>
                  <div className="text-xs text-muted-foreground">
                    Database backup scheduled for 2:00 AM UTC
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600">
                  Scheduled
                </Badge>
              </div>

              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No critical alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div>Database backup completed successfully</div>
                  <div className="text-xs text-muted-foreground">2 minutes ago</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div>AI model deployment updated</div>
                  <div className="text-xs text-muted-foreground">15 minutes ago</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <div>Memory usage spike detected</div>
                  <div className="text-xs text-muted-foreground">32 minutes ago</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div>SSL certificate renewed</div>
                  <div className="text-xs text-muted-foreground">1 hour ago</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <div>New user registration spike</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Response Time Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">156ms</div>
              <div className="text-sm text-muted-foreground">API Response</div>
              <div className="text-xs text-green-600 mt-1">↓ 12ms from last hour</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2.3s</div>
              <div className="text-sm text-muted-foreground">AI Processing</div>
              <div className="text-xs text-yellow-600 mt-1">↑ 0.4s from last hour</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">89ms</div>
              <div className="text-sm text-muted-foreground">Database</div>
              <div className="text-xs text-green-600 mt-1">↓ 5ms from last hour</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">234ms</div>
              <div className="text-sm text-muted-foreground">File Upload</div>
              <div className="text-xs text-green-600 mt-1">↓ 18ms from last hour</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}