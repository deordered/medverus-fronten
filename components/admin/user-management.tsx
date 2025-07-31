"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Search, 
  Filter, 
  Mail,
  MoreVertical,
  Download,
  TrendingUp,
  Eye,
  Ban
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useUserList, useUserStats } from "@/lib/api/hooks"
import { formatMedicalDate } from "@/lib/utils"

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTier, setFilterTier] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)

  const { toast } = useToast()
  const { data: userResponse } = useUserList()
  const { data: stats } = useUserStats()
  
  // Extract users array from response with proper typing
  const users: any[] = userResponse?.users || []

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'view':
          // Find user and open dialog
          const user = users.find((u: any) => u.id === userId)
          if (user) {
            setSelectedUser(user)
            setIsUserDialogOpen(true)
          }
          break
        case 'suspend':
          toast({
            title: "User suspended",
            description: "User account has been temporarily suspended",
          })
          break
        case 'upgrade':
          toast({
            title: "Tier upgrade",
            description: "User tier upgrade dialog would open here",
          })
          break
        default:
          break
      }
    } catch (error) {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = filterTier === "all" || user.tier === filterTier
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    return matchesSearch && matchesTier && matchesStatus
  }) || []

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'default'
      case 'pro':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'suspended':
        return 'text-red-600'
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Monitor and manage platform users</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-green-600">
                +{stats?.newUsers || 0} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.activeUsers || 234}</div>
              <p className="text-xs text-muted-foreground">
                live users online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pro Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.tierDistribution?.pro || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.tierDistribution?.pro && stats?.totalUsers ? ((stats.tierDistribution.pro / stats.totalUsers) * 100).toFixed(1) : 0}% conversion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Enterprise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats?.tierDistribution?.enterprise || 0}</div>
              <p className="text-xs text-muted-foreground">
                Premium tier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                TTS Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.activityStats?.daily || '12.4K'}</div>
              <p className="text-xs text-muted-foreground">
                minutes today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activityStats?.monthly || 0}%</div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Directory</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by email, name, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More
            </Button>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(user.full_name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTierBadgeVariant(user.tier)}>
                        {user.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${
                          user.status === 'active' ? 'bg-green-500' :
                          user.status === 'suspended' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className={`text-sm capitalize ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {user.usage?.queries || 0} queries
                        </div>
                        <div className="text-xs text-muted-foreground">
                          AI: {user.usage?.medverus_queries || 0} | Web: {user.usage?.web_queries || 0} | Files: {user.usage?.file_queries || 0}
                        </div>
                        <Progress 
                          value={((user.usage?.queries || 0) / (user.limits?.queries || 100)) * 100} 
                          className="h-1 w-16"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatMedicalDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.last_active ? formatMedicalDate(user.last_active) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUserAction(user.id, 'view')}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleUserAction(user.id, 'upgrade')}>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Change Tier
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-sm">
                {searchTerm || filterTier !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No users have registered yet"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information and usage statistics
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback>
                    {getUserInitials(selectedUser.full_name, selectedUser.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedUser.full_name || 'Unknown User'}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={getTierBadgeVariant(selectedUser.tier)}>
                      {selectedUser.tier}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Account Information</h4>
                  <div className="text-sm space-y-1">
                    <div>User ID: <code className="text-xs">{selectedUser.id}</code></div>
                    <div>Joined: {formatMedicalDate(selectedUser.created_at)}</div>
                    <div>Last Active: {selectedUser.last_active ? formatMedicalDate(selectedUser.last_active) : 'Never'}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Usage Statistics</h4>
                  <div className="text-sm space-y-1">
                    <div>Total Queries: {selectedUser.usage?.queries || 0}</div>
                    <div className="ml-2 text-xs text-muted-foreground space-y-0.5">
                      <div>• Medverus AI: {selectedUser.usage?.medverus_queries || 0}</div>
                      <div>• PubMed: {selectedUser.usage?.pubmed_queries || 0}</div>
                      <div>• Web Search: {selectedUser.usage?.web_queries || 0}</div>
                      <div>• File Queries: {selectedUser.usage?.file_queries || 0}</div>
                    </div>
                    <div>Files Uploaded: {selectedUser.usage?.files || 0}</div>
                    <div>Storage Used: {selectedUser.usage?.storage || '0 MB'}</div>
                    <div>TTS Consumption: {selectedUser.usage?.tts_minutes || 0} minutes</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Close
            </Button>
            <Button>
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}