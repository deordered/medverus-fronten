"use client"

import React, { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSearchHistory, useSearchActions } from "@/lib/stores/search-store"
import { useUI } from "@/lib/stores/ui-store"
import { useMedicalTTS } from "@/lib/stores/tts-store"
import { MEDICAL_SOURCE_CONFIG } from "@/lib/constants/medical"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { 
  Clock,
  Search,
  RotateCcw,
  Trash2,
  Volume2,
  Brain,
  Database,
  Globe,
  FileText,
  TrendingUp,
  Calendar,
  Filter,
  X
} from "lucide-react"
import type { ContentSource, SearchSession } from "@/types"

interface RecentActivityPanelProps {
  className?: string
}

/**
 * Recent Activity Panel Component
 * Displays user's search history with filtering and replay capabilities
 */
export function RecentActivityPanel({ className }: RecentActivityPanelProps) {
  const searchHistory = useSearchHistory()
  const { rerunSearch } = useSearchActions()
  const { activePanel, setActivePanel } = useUI()
  const { speakMedicalContent } = useMedicalTTS()

  // Filter and group history
  const { groupedHistory, stats } = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const groups = {
      today: [] as SearchSession[],
      yesterday: [] as SearchSession[],
      thisWeek: [] as SearchSession[],
      older: [] as SearchSession[]
    }

    const sourceStats = new Map<ContentSource, number>()

    searchHistory.forEach(session => {
      const sessionDate = new Date(session.timestamp)
      
      // Count by source
      session.sources.forEach(source => {
        sourceStats.set(source, (sourceStats.get(source) || 0) + 1)
      })

      // Group by time
      if (sessionDate >= today) {
        groups.today.push(session)
      } else if (sessionDate >= yesterday) {
        groups.yesterday.push(session)
      } else if (sessionDate >= thisWeek) {
        groups.thisWeek.push(session)
      } else {
        groups.older.push(session)
      }
    })

    return {
      groupedHistory: groups,
      stats: {
        total: searchHistory.length,
        sources: Object.fromEntries(sourceStats),
        avgProcessingTime: searchHistory.length > 0 
          ? Math.round(searchHistory.reduce((sum, s) => sum + (s.processing_time || 0), 0) / searchHistory.length)
          : 0
      }
    }
  }, [searchHistory])

  // Get source icon
  const getSourceIcon = (source: ContentSource) => {
    switch (source) {
      case 'medverus_ai': return <Brain className="h-3 w-3" />
      case 'pubmed': return <Database className="h-3 w-3" />
      case 'web_search': return <Globe className="h-3 w-3" />
      case 'file_upload': return <FileText className="h-3 w-3" />
      default: return <Search className="h-3 w-3" />
    }
  }

  // Handle search replay
  const handleRerunSearch = async (session: SearchSession) => {
    try {
      await rerunSearch(session.id)
      speakMedicalContent(`Rerunning search for ${session.query}`)
    } catch (error) {
      console.error('Failed to rerun search:', error)
    }
  }

  // Render search session
  const renderSearchSession = (session: SearchSession) => (
    <div key={session.id} className="group p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2 mb-1">
            {session.query}
          </p>
          
          <div className="flex items-center gap-2 mb-2">
            {session.sources.map((source) => (
              <TooltipProvider key={source}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      {getSourceIcon(source)}
                      <span className="hidden sm:inline">
                        {MEDICAL_SOURCE_CONFIG[source]?.label.split(' ')[0]}
                      </span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {MEDICAL_SOURCE_CONFIG[source]?.label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
              {session.processing_time && (
                <span className="ml-2">• {session.processing_time}ms</span>
              )}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleRerunSearch(session)}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rerun search</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => speakMedicalContent(session.query)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Read query</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render time group
  const renderTimeGroup = (title: string, sessions: SearchSession[]) => {
    if (sessions.length === 0) return null

    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title} ({sessions.length})
        </h4>
        <div className="space-y-2">
          {sessions.map(renderSearchSession)}
        </div>
      </div>
    )
  }

  if (activePanel !== 'recent') return null

  return (
    <div className={cn(
      "fixed inset-y-16 right-0 w-80 bg-background border-l border-border shadow-lg z-40",
      "transform transition-transform duration-300 ease-in-out",
      className
    )}>
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-medical-primary" />
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActivePanel(null)}
          className="p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Activity Stats */}
      {stats.total > 0 && (
        <div className="p-4 border-b bg-muted/30">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-medical-primary">
                {stats.total}
              </div>
              <div className="text-xs text-muted-foreground">Total Searches</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-medical-primary">
                {stats.avgProcessingTime}ms
              </div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
          </div>

          {/* Source Distribution */}
          <div className="mt-3 space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Source Usage</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(stats.sources).map(([source, count]) => (
                <Badge key={source} variant="secondary" className="text-xs">
                  {getSourceIcon(source as ContentSource)}
                  <span className="ml-1">{count}</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search History */}
      <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
        <div className="p-4 space-y-6">
          {stats.total === 0 ? (
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No search history yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your searches will appear here
              </p>
            </div>
          ) : (
            <>
              {renderTimeGroup("Today", groupedHistory.today)}
              {renderTimeGroup("Yesterday", groupedHistory.yesterday)}
              {renderTimeGroup("This Week", groupedHistory.thisWeek)}
              {renderTimeGroup("Older", groupedHistory.older)}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Panel Footer */}
      {stats.total > 0 && (
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            
            <Button variant="outline" size="sm" className="flex-1">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          
          <div className="text-xs text-center text-muted-foreground mt-2">
            Showing last {Math.min(stats.total, 50)} searches
          </div>
        </div>
      )}
    </div>
  )
}

RecentActivityPanel.displayName = "RecentActivityPanel"

export default RecentActivityPanel