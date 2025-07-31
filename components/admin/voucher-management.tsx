"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Ticket, 
  Plus, 
  Download, 
  Copy, 
  Eye, 
  Trash2,
  Search,
  Filter,
  Gift,
  CheckCircle2,
  AlertTriangle,
  Clock
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useVoucherList, useCreateVouchers, useVoucherStats } from "@/lib/api/hooks"
import { formatMedicalDate } from "@/lib/utils"

export function VoucherManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  
  // Generation form state
  const [generateForm, setGenerateForm] = useState({
    tier: "pro",
    quantity: 10,
    duration_days: 30,
    description: "",
    auto_activate: false
  })

  const { toast } = useToast()
  const { data: vouchers } = useVoucherList()
  const { data: stats } = useVoucherStats()
  const createVouchersMutation = useCreateVouchers()

  const handleGenerateVouchers = async () => {
    try {
      const payload = {
        count: generateForm.quantity,
        tier: generateForm.tier as any,
        expires_in_days: generateForm.duration_days,
        description: generateForm.description,
        auto_activate: generateForm.auto_activate
      }
      const result = await createVouchersMutation.mutateAsync(payload)
      toast({
        title: "Vouchers generated successfully",
        description: `Created ${result.created_count || generateForm.quantity} ${generateForm.tier} vouchers`,
      })
      setIsGenerateDialogOpen(false)
      setGenerateForm({
        tier: "pro",
        quantity: 10,
        duration_days: 30,
        description: "",
        auto_activate: false
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate vouchers",
        variant: "destructive",
      })
    }
  }

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Voucher copied",
      description: "Voucher code copied to clipboard",
    })
  }

  const filteredVouchers = (vouchers as any)?.items?.filter((voucher: any) => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || voucher.status === filterStatus
    return matchesSearch && matchesStatus
  }) || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'used':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'used':
        return 'bg-blue-100 text-blue-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voucher Management</h2>
          <p className="text-muted-foreground">Generate and manage tier upgrade vouchers</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Vouchers
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Vouchers</DialogTitle>
                <DialogDescription>
                  Create vouchers for tier upgrades with customizable settings
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tier">Target Tier</Label>
                    <Select 
                      value={generateForm.tier} 
                      onValueChange={(value) => setGenerateForm(prev => ({...prev, tier: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={generateForm.quantity}
                      onChange={(e) => setGenerateForm(prev => ({...prev, quantity: parseInt(e.target.value) || 1}))}
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={generateForm.duration_days}
                    onChange={(e) => setGenerateForm(prev => ({...prev, duration_days: parseInt(e.target.value) || 30}))}
                    min="1"
                    max="365"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={generateForm.description}
                    onChange={(e) => setGenerateForm(prev => ({...prev, description: e.target.value}))}
                    placeholder="Conference vouchers, promotional campaign, etc."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-activate"
                    checked={generateForm.auto_activate}
                    onCheckedChange={(checked) => setGenerateForm(prev => ({...prev, auto_activate: checked}))}
                  />
                  <Label htmlFor="auto-activate">Auto-activate on first use</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateVouchers}
                  disabled={createVouchersMutation.isPending}
                >
                  {createVouchersMutation.isPending ? "Generating..." : "Generate Vouchers"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVouchers}</div>
              <p className="text-xs text-muted-foreground">
                All time vouchers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Vouchers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.pendingVouchers}</div>
              <p className="text-xs text-muted-foreground">
                Ready to use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Usage Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.redemptionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.redeemedVouchers} used vouchers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenueFromVouchers}</div>
              <p className="text-xs text-muted-foreground">
                From voucher upgrades
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Ticket className="h-5 w-5" />
            <span>Voucher List</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search vouchers by code or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Vouchers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-mono text-sm">
                      {voucher.code}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {voucher.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(voucher.status)}
                        <Badge variant="secondary" className={getStatusColor(voucher.status)}>
                          {voucher.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatMedicalDate(voucher.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {voucher.expires_at ? formatMedicalDate(voucher.expires_at) : 'Never'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {voucher.used_by || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyVoucher(voucher.code)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredVouchers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No vouchers found</h3>
              <p className="text-sm">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Generate your first vouchers to get started"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}