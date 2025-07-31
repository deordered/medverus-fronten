"use client"

import { useState } from "react"
import { 
  Users,
  Activity,
  UserPlus,
  UserMinus,
  CheckCircle2,
  BarChart3,
  FileText,
  Shield,
  Settings,
  Download,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit,
  Plus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn, formatMedicalDate } from "@/lib/utils"

interface User {
  id: string
  email: string
  tier: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  last_login: string
  daily_usage: {
    medverus_ai: number
    pubmed: number
    web_search: number
    file_upload: number
  }
  total_queries: number
  total_files: number
}

interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  totalQueries: number
  queriesPerDay: number
  systemUptime: number
  averageResponseTime: number
  errorRate: number
}

interface AdminDashboardProps {
  className?: string
}

// Mock data for development
const mockUsers: User[] = [
  {
    id: "1",
    email: "dr.johnson@hospital.com",
    tier: "enterprise",
    status: "active",
    created_at: "2024-01-15T10:30:00Z",
    last_login: "2024-01-27T09:15:00Z",
    daily_usage: { medverus_ai: 45, pubmed: 12, web_search: 23, file_upload: 5 },
    total_queries: 1234,
    total_files: 25
  },
  {
    id: "2",
    email: "nurse.smith@clinic.org",
    tier: "pro",
    status: "active",
    created_at: "2024-01-20T14:20:00Z",
    last_login: "2024-01-27T08:45:00Z",
    daily_usage: { medverus_ai: 23, pubmed: 8, web_search: 15, file_upload: 3 },
    total_queries: 567,
    total_files: 12
  },
  {
    id: "3",
    email: "student.brown@university.edu",
    tier: "free",
    status: "active",
    created_at: "2024-01-25T09:10:00Z",
    last_login: "2024-01-26T16:30:00Z",
    daily_usage: { medverus_ai: 8, pubmed: 2, web_search: 5, file_upload: 0 },
    total_queries: 89,
    total_files: 0
  },
  {
    id: "4",
    email: "researcher.davis@pharma.com",
    tier: "pro",
    status: "suspended",
    created_at: "2024-01-10T11:45:00Z",
    last_login: "2024-01-24T13:20:00Z",
    daily_usage: { medverus_ai: 0, pubmed: 0, web_search: 0, file_upload: 0 },
    total_queries: 2345,
    total_files: 45
  }
]

const mockMetrics: SystemMetrics = {
  totalUsers: 12456,
  activeUsers: 8934,
  newUsersToday: 127,
  totalQueries: 234567,
  queriesPerDay: 1834,
  systemUptime: 99.7,
  averageResponseTime: 2.3,
  errorRate: 0.05
}

export function AdminDashboard({ className }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [metrics] = useState<SystemMetrics>(mockMetrics)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTier = selectedTier === "all" || user.tier === selectedTier
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus
    return matchesSearch && matchesTier && matchesStatus
  })

  const refreshData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated successfully."
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, newStatus: User['status']) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ))
      toast({
        title: "User Updated",
        description: `User status changed to ${newStatus}.`
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update user status.",
        variant: "destructive"
      })
    }
  }

  const updateUserTier = async (userId: string, newTier: User['tier']) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, tier: newTier } : user
      ))
      toast({
        title: "Tier Updated",
        description: `User tier changed to ${newTier}.`
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update user tier.",
        variant: "destructive"
      })
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Email', 'Tier', 'Status', 'Created', 'Last Login', 'Total Queries', 'Total Files'],
      ...filteredUsers.map(user => [
        user.email,
        user.tier,
        user.status,
        user.created_at,
        user.last_login,
        user.total_queries.toString(),
        user.total_files.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medverus-users-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "User data has been exported to CSV."
    })
  }

  const getStatusBadgeVariant = (status: User['status']) => {
    switch (status) {
      case 'active': return 'medical-success'
      case 'inactive': return 'medical-neutral'
      case 'suspended': return 'destructive'
      default: return 'secondary'
    }
  }

  const getTierBadgeVariant = (tier: User['tier']) => {
    switch (tier) {
      case 'free': return 'secondary'
      case 'pro': return 'default'
      case 'enterprise': return 'medical-primary'
      default: return 'secondary'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, monitor system performance, and oversee platform operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.newUsersToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Queries</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.queriesPerDay.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalQueries.toLocaleString()} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.averageResponseTime}s avg response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Real-time system metrics and health indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>System Uptime</span>
                <span className="font-medium">{metrics.systemUptime}%</span>
              </div>
              <Progress value={metrics.systemUptime} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Active Users</span>
                <span className="font-medium">
                  {Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}%
                </span>
              </div>
              <Progress value={(metrics.activeUsers / metrics.totalUsers) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Error Rate</span>
                <span className="font-medium">{metrics.errorRate}%</span>
              </div>
              <Progress value={metrics.errorRate * 20} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              View Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Monitor and manage user accounts</CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Tier: {selectedTier === "all" ? "All" : selectedTier}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedTier("all")}>
                  All Tiers
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedTier("free")}>
                  Free
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedTier("pro")}>
                  Pro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedTier("enterprise")}>
                  Enterprise
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {selectedStatus === "all" ? "All" : selectedStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedStatus("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("active")}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("inactive")}>
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("suspended")}>
                  Suspended
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage Today</TableHead>
                  <TableHead>Total Queries</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Joined {formatMedicalDate(user.created_at)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTierBadgeVariant(user.tier) as any}>
                        {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status) as any}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {Object.values(user.daily_usage).reduce((sum, val) => sum + val, 0)} queries
                      </div>
                    </TableCell>
                    <TableCell>{user.total_queries.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatMedicalDate(user.last_login)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => updateUserTier(user.id, 'pro')}>
                            Upgrade to Pro
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserTier(user.id, 'enterprise')}>
                            Upgrade to Enterprise
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' ? (
                            <DropdownMenuItem 
                              onClick={() => updateUserStatus(user.id, 'suspended')}
                              className="text-red-600"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => updateUserStatus(user.id, 'active')}
                              className="text-green-600"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>
    </div>
  )
}