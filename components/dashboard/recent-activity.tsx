"use client"

import { useState } from "react"
import { formatDistance } from "date-fns"
import { 
  Search, 
  FileText, 
  Clock,
  ExternalLink,
  MoreVertical,
  Copy,
  Trash2
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { MEDICAL_SOURCE_CONFIG } from "@/lib/constants/medical"
import { truncateText, formatMedicalDate } from "@/lib/utils"

// Mock data for recent activity - in real app this would come from API
const mockRecentActivity = [
  {
    id: "1",
    type: "query",
    source: "medverus_ai",
    query: "Treatment protocols for hypertension in elderly patients",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    results_count: 5,
    processing_time_ms: 1250
  },
  {
    id: "2", 
    type: "query",
    source: "pubmed",
    query: "COVID-19 vaccine efficacy latest research",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    results_count: 12,
    processing_time_ms: 850
  },
  {
    id: "3",
    type: "file_upload",
    source: "file_upload",
    filename: "clinical_guidelines_2024.pdf",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    file_size: "2.3 MB"
  },
  {
    id: "4",
    type: "query",
    source: "web_search",
    query: "Diabetes management guidelines ADA 2024",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    results_count: 8,
    processing_time_ms: 2100
  },
  {
    id: "5",
    type: "query",
    source: "medverus_ai",
    query: "Differential diagnosis chest pain emergency department",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    results_count: 7,
    processing_time_ms: 980
  }
]

export function RecentActivity() {
  const [isLoading] = useState(false) // In real app, this would track API loading state
  const { toast } = useToast()

  const handleCopyQuery = (query: string) => {
    navigator.clipboard.writeText(query)
    toast({
      title: "Copied to clipboard",
      description: "Query copied to clipboard for reuse",
    })
  }

  const handleDeleteActivity = (id: string) => {
    toast({
      title: "Activity deleted",
      description: "Activity item removed from history",
    })
  }

  if (isLoading) {
    return <RecentActivitySkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockRecentActivity.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Your queries and uploads will appear here</p>
          </div>
        ) : (
          mockRecentActivity.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onCopyQuery={handleCopyQuery}
              onDelete={handleDeleteActivity}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

interface ActivityItemProps {
  activity: any
  onCopyQuery: (query: string) => void
  onDelete: (id: string) => void
}

function ActivityItem({ activity, onCopyQuery, onDelete }: ActivityItemProps) {
  const sourceConfig = MEDICAL_SOURCE_CONFIG[activity.source as keyof typeof MEDICAL_SOURCE_CONFIG]
  const timeAgo = formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      {/* Icon */}
      <div className={`p-2 rounded-md ${sourceConfig?.color || 'bg-gray-500'} flex-shrink-0`}>
        {activity.type === 'query' ? (
          <Search className="h-4 w-4 text-white" />
        ) : (
          <FileText className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {/* Source and Type */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {sourceConfig?.name || activity.source}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {activity.type === 'query' ? 'Query' : 'File Upload'}
              </span>
            </div>

            {/* Query or Filename */}
            <p className="text-sm font-medium">
              {activity.type === 'query' 
                ? truncateText(activity.query, 80)
                : activity.filename
              }
            </p>

            {/* Metadata */}
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
              
              {activity.type === 'query' && (
                <>
                  <span>{activity.results_count} results</span>
                  <span>{activity.processing_time_ms}ms</span>
                </>
              )}
              
              {activity.type === 'file_upload' && (
                <span>{activity.file_size}</span>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {activity.type === 'query' && (
                <DropdownMenuItem onClick={() => onCopyQuery(activity.query)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Query
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(activity.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3 p-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}