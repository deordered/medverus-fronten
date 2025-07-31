"use client"

import { useState } from "react"
import { formatDistance } from "date-fns"
import { 
  History, 
  Search, 
  Clock, 
  MoreVertical,
  Copy,
  Trash2,
  RefreshCw,
  ExternalLink
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { MEDICAL_SOURCE_CONFIG } from "@/lib/constants/medical"
import { truncateText } from "@/lib/utils"

// Mock data for query history - in real app this would come from API
const mockQueryHistory = [
  {
    id: "1",
    query: "Treatment protocols for hypertension in elderly patients",
    source: "medverus_ai",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    results_count: 5,
    processing_time_ms: 1250,
    saved: false
  },
  {
    id: "2", 
    query: "COVID-19 vaccine efficacy latest research",
    source: "pubmed",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    results_count: 12,
    processing_time_ms: 850,
    saved: true
  },
  {
    id: "3",
    query: "Diabetes management guidelines ADA 2024",
    source: "web_search",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    results_count: 8,
    processing_time_ms: 2100,
    saved: false
  },
  {
    id: "4",
    query: "Differential diagnosis chest pain emergency department",
    source: "medverus_ai",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    results_count: 7,
    processing_time_ms: 980,
    saved: true
  },
  {
    id: "5",
    query: "Antibiotic resistance patterns in ICU patients",
    source: "pubmed",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    results_count: 15,
    processing_time_ms: 1850,
    saved: false
  }
]

export function QueryHistory() {
  const [isLoading] = useState(false) // In real app, this would track API loading state
  const { toast } = useToast()

  const handleCopyQuery = (query: string) => {
    navigator.clipboard.writeText(query)
    toast({
      title: "Query copied",
      description: "Query copied to clipboard for reuse",
    })
  }

  const handleDeleteQuery = (id: string, query: string) => {
    toast({
      title: "Query deleted",
      description: `"${truncateText(query, 30)}" removed from history`,
    })
  }

  const handleRerunQuery = (query: string, source: string) => {
    toast({
      title: "Feature coming soon",
      description: "Re-running queries from history will be available soon",
    })
  }

  const handleViewResults = (id: string) => {
    toast({
      title: "Feature coming soon", 
      description: "Viewing saved query results will be available soon",
    })
  }

  if (isLoading) {
    return <QueryHistorySkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <History className="h-5 w-5" />
            <span>Query History</span>
          </CardTitle>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {mockQueryHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No query history</p>
            <p className="text-sm">Your recent queries will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {mockQueryHistory.map((query) => (
                <QueryHistoryItem
                  key={query.id}
                  query={query}
                  onCopy={handleCopyQuery}
                  onDelete={handleDeleteQuery}
                  onRerun={handleRerunQuery}
                  onViewResults={handleViewResults}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

interface QueryHistoryItemProps {
  query: any
  onCopy: (query: string) => void
  onDelete: (id: string, query: string) => void
  onRerun: (query: string, source: string) => void
  onViewResults: (id: string) => void
}

function QueryHistoryItem({ query, onCopy, onDelete, onRerun, onViewResults }: QueryHistoryItemProps) {
  const sourceConfig = MEDICAL_SOURCE_CONFIG[query.source as keyof typeof MEDICAL_SOURCE_CONFIG]
  const timeAgo = formatDistance(new Date(query.timestamp), new Date(), { addSuffix: true })

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      {/* Source Icon */}
      <div className={`p-1.5 rounded-md ${sourceConfig?.color || 'bg-gray-500'} flex-shrink-0`}>
        <Search className="h-3 w-3 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="space-y-2">
          {/* Query Text */}
          <p className="text-sm font-medium leading-tight">
            {truncateText(query.query, 60)}
          </p>

          {/* Metadata */}
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {sourceConfig?.name || query.source}
            </Badge>
            {query.saved && (
              <Badge variant="outline" className="text-xs">
                Saved
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
            <span>{query.results_count} results</span>
            <span>{query.processing_time_ms}ms</span>
          </div>
        </div>
      </div>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onRerun(query.query, query.source)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-run Query
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onCopy(query.query)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Query
          </DropdownMenuItem>
          
          {query.saved && (
            <DropdownMenuItem onClick={() => onViewResults(query.id)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Results
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => onDelete(query.id, query.query)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function QueryHistorySkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3">
              <Skeleton className="h-6 w-6 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}