"use client"

import { useState } from "react"
import { formatDistance } from "date-fns"
import { 
  History, 
  Calendar, 
  Download, 
  Filter,
  Search,
  FileText,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Skeleton } from "@/components/ui/skeleton"
import { MEDICAL_SOURCE_CONFIG } from "@/lib/constants/medical"
import { formatMedicalDate } from "@/lib/utils"

// Mock data for usage history - in real app this would come from API
const mockUsageHistory = [
  {
    id: "1",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    medverus_ai: 15,
    pubmed: 8,
    web_search: 22,
    file_upload: 3,
    total_queries: 45,
    total_files: 3,
  },
  {
    id: "2",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    medverus_ai: 12,
    pubmed: 15,
    web_search: 18,
    file_upload: 2,
    total_queries: 45,
    total_files: 2,
  },
  {
    id: "3",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    medverus_ai: 8,
    pubmed: 20,
    web_search: 25,
    file_upload: 4,
    total_queries: 53,
    total_files: 4,
  },
  {
    id: "4",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    medverus_ai: 20,
    pubmed: 5,
    web_search: 15,
    file_upload: 1,
    total_queries: 40,
    total_files: 1,
  },
  {
    id: "5",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    medverus_ai: 18,
    pubmed: 12,
    web_search: 30,
    file_upload: 5,
    total_queries: 60,
    total_files: 5,
  },
  {
    id: "6",
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    medverus_ai: 5,
    pubmed: 8,
    web_search: 12,
    file_upload: 0,
    total_queries: 25,
    total_files: 0,
  },
  {
    id: "7",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    medverus_ai: 22,
    pubmed: 18,
    web_search: 28,
    file_upload: 6,
    total_queries: 68,
    total_files: 6,
  },
]

export function UsageHistory() {
  const [isLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [timeRange, setTimeRange] = useState("7d")
  const [sourceFilter, setSourceFilter] = useState("all")

  const handleExportData = () => {
    const csvContent = [
      // Header
      "Date,Medverus AI,PubMed,Web Search,File Upload,Total Queries,Total Files",
      // Data rows
      ...mockUsageHistory.map(row => 
        `${new Date(row.date).toLocaleDateString()},${row.medverus_ai},${row.pubmed},${row.web_search},${row.file_upload},${row.total_queries},${row.total_files}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medverus-usage-history-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const todayData = mockUsageHistory[0] || { total_queries: 0, total_files: 0 }
  const yesterdayData = mockUsageHistory[1] || { total_queries: 0, total_files: 0 }
  
  const queryTrend = calculateTrend(todayData.total_queries, yesterdayData.total_queries)
  const fileTrend = calculateTrend(todayData.total_files, yesterdayData.total_files)

  if (isLoading) {
    return <UsageHistorySkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Queries</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayData.total_queries}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {queryTrend > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3" style={{color: '#2d2d2d'}} />
                  <span style={{color: '#2d2d2d'}}>+{queryTrend.toFixed(1)}%</span>
                </>
              ) : queryTrend < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{queryTrend.toFixed(1)}%</span>
                </>
              ) : (
                <span>No change</span>
              )}
              <span>from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayData.total_files}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {fileTrend > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3" style={{color: '#2d2d2d'}} />
                  <span style={{color: '#2d2d2d'}}>+{fileTrend.toFixed(1)}%</span>
                </>
              ) : fileTrend < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{fileTrend.toFixed(1)}%</span>
                </>
              ) : (
                <span>No change</span>
              )}
              <span>from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockUsageHistory.reduce((sum, day) => sum + day.total_queries, 0) / mockUsageHistory.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              queries per day (7-day avg)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Usage History</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="medverus_ai">Medverus AI</SelectItem>
                <SelectItem value="pubmed">PubMed</SelectItem>
                <SelectItem value="web_search">Web Search</SelectItem>
                <SelectItem value="file_upload">File Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="h-2 w-2 bg-blue-500 rounded"></div>
                      <span>Medverus AI</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="h-2 w-2 rounded" style={{backgroundColor: '#2d2d2d'}}></div>
                      <span>PubMed</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="h-2 w-2 bg-purple-500 rounded"></div>
                      <span>Web Search</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="h-2 w-2 bg-orange-500 rounded"></div>
                      <span>Files</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsageHistory.map((row) => {
                  const date = new Date(row.date)
                  const isToday = date.toDateString() === new Date().toDateString()
                  
                  return (
                    <TableRow key={row.id} className={isToday ? "bg-muted/50" : ""}>
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div>{date.toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {isToday ? "Today" : formatDistance(date, new Date(), { addSuffix: true })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-blue-600">
                          {row.medverus_ai}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" style={{color: '#2d2d2d'}}>
                          {row.pubmed}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-purple-600">
                          {row.web_search}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-orange-600">
                          {row.file_upload}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {row.total_queries}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-sm">
              <div>
                <div className="font-medium text-blue-600">
                  {mockUsageHistory.reduce((sum, row) => sum + row.medverus_ai, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Medverus AI</div>
              </div>
              <div>
                <div className="font-medium" style={{color: '#2d2d2d'}}>
                  {mockUsageHistory.reduce((sum, row) => sum + row.pubmed, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total PubMed</div>
              </div>
              <div>
                <div className="font-medium text-purple-600">
                  {mockUsageHistory.reduce((sum, row) => sum + row.web_search, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Web Search</div>
              </div>
              <div>
                <div className="font-medium text-orange-600">
                  {mockUsageHistory.reduce((sum, row) => sum + row.file_upload, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Files</div>
              </div>
              <div>
                <div className="font-medium">
                  {mockUsageHistory.reduce((sum, row) => sum + row.total_queries, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Grand Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UsageHistorySkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Skeleton */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-40" />
          </div>

          {/* Table Content Skeleton */}
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border rounded">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}