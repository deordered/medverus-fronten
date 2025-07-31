"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { useUI, usePanelState } from "@/lib/stores/ui-store"
import { useAuth } from "@/lib/stores/auth-store"
import { useTTSQuota, useTTSPlayback } from "@/lib/stores/tts-store"
import { useSearchHistory } from "@/lib/stores/search-store"
import { collapsibleSidebarVariants, buttonVariants } from "@/lib/animations/motion-variants"
import { useAnimationSafeMotion, useSidebarAnimation } from "@/lib/animations/hooks"
import { cn } from "@/lib/utils"
import { 
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
  Mic,
  FolderOpen,
  User,
  Settings,
  Shield,
  BarChart3,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  FileText,
  Search,
  Brain,
  Database,
  Globe
} from "lucide-react"
import type { SidebarPanel } from "@/types"

interface CollapsibleSidebarProps {
  className?: string
}

/**
 * Collapsible Sidebar Component
 * Contains 5 main panels: Recent Activity, Prompt Manager, TTS, File Manager, User Profile
 */
export function CollapsibleSidebar({ className }: CollapsibleSidebarProps) {
  const { user } = useAuth()
  const { 
    sidebarCollapsed, 
    activePanel, 
    isMobile, 
    toggleSidebar, 
    setActivePanel 
  } = useUI()
  const { shouldAnimate } = useAnimationSafeMotion()
  const sidebarAnimation = useSidebarAnimation(!sidebarCollapsed)
  
  const searchHistory = useSearchHistory()
  const { remaining: ttsRemaining, limit: ttsLimit } = useTTSQuota()
  const { currentItem, isPlaying, queueLength } = useTTSPlayback()

  // Panel configurations
  const panels: Array<{
    id: SidebarPanel
    icon: React.ReactNode
    label: string
    badge?: string | number
    description?: string
  }> = [
    {
      id: 'recent',
      icon: <Clock className="h-5 w-5" />,
      label: 'Recent Activity',
      badge: searchHistory.length,
      description: 'Your recent searches and queries'
    },
    {
      id: 'prompts',
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Prompt Manager',
      description: 'Saved prompts and templates'
    },
    {
      id: 'user-prompt',
      icon: <User className="h-5 w-5" />,
      label: 'Personal Prompt',
      description: 'Account-level persistent prompt for all queries'
    },
    {
      id: 'tts',
      icon: <Mic className="h-5 w-5" />,
      label: 'TTS Panel',
      badge: queueLength > 0 ? queueLength : undefined,
      description: 'Text-to-speech controls and queue'
    },
    {
      id: 'files',
      icon: <FolderOpen className="h-5 w-5" />,
      label: 'File Manager',
      badge: user?.uploaded_files_count || 0,
      description: 'Manage uploaded documents'
    },
    {
      id: 'profile',
      icon: <User className="h-5 w-5" />,
      label: 'User Profile',
      description: 'Account settings and preferences'
    }
  ]

  // Quick stats for collapsed sidebar
  const getQuickStats = () => {
    const totalQueries = (user?.daily_usage?.medverus_ai || 0) + 
                        (user?.daily_usage?.pubmed || 0) + 
                        (user?.daily_usage?.web_search || 0)
    
    return {
      searches: searchHistory.length,
      files: user?.uploaded_files_count || 0,
      ttsQueue: queueLength,
      queries: totalQueries
    }
  }

  const stats = getQuickStats()

  return (
    <TooltipProvider>
      <motion.aside 
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] z-30",
          "bg-background border-r border-border",
          isMobile && !sidebarCollapsed && "shadow-lg",
          className
        )}
        variants={collapsibleSidebarVariants}
        {...sidebarAnimation}
        layout={shouldAnimate}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b">
          {!sidebarCollapsed && (
            <h2 className="font-semibold text-sm text-foreground">
              Medical Assistant
            </h2>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className={cn(
                  "p-2",
                  sidebarCollapsed && "mx-auto"
                )}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* Main Panels */}
            {panels.map((panel) => {
              const isActive = activePanel === panel.id
              
              return (
                <Tooltip key={panel.id} delayDuration={sidebarCollapsed ? 0 : 1000}>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={buttonVariants}
                      whileHover={shouldAnimate ? "hover" : undefined}
                      whileTap={shouldAnimate ? "tap" : undefined}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          sidebarCollapsed ? "px-2" : "px-3",
                          isActive && "bg-medical-primary/10 text-medical-primary border-l-2 border-medical-primary"
                        )}
                        onClick={() => setActivePanel(isActive ? null : panel.id)}
                      >
                      <div className="flex items-center gap-3 w-full">
                        {panel.icon}
                        
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 text-left text-sm">
                              {panel.label}
                            </span>
                            
                            {panel.badge !== undefined && panel.badge > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {panel.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </Button>
                    </motion.div>
                  </TooltipTrigger>
                  
                  {sidebarCollapsed && (
                    <TooltipContent side="right" className="flex flex-col gap-1">
                      <span className="font-medium">{panel.label}</span>
                      {panel.description && (
                        <span className="text-xs text-muted-foreground">
                          {panel.description}
                        </span>
                      )}
                      {panel.badge !== undefined && panel.badge > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {panel.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>

          {/* Separator */}
          <Separator className="my-2" />

          {/* Quick Stats (Collapsed Mode) */}
          {sidebarCollapsed && (
            <div className="p-2 space-y-2">
              {/* TTS Status */}
              {isPlaying && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center p-2 bg-medical-primary/10 rounded">
                      <Volume2 className="h-4 w-4 text-medical-primary animate-pulse" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    TTS Playing: {currentItem?.text?.slice(0, 50)}...
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Quick Stats Grid */}
              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center p-1">
                      <div className="text-xs font-medium">{stats.searches}</div>
                      <div className="text-xs text-muted-foreground">Recent</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {stats.searches} recent searches
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center p-1">
                      <div className="text-xs font-medium">{stats.files}</div>
                      <div className="text-xs text-muted-foreground">Files</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {stats.files} uploaded files
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* TTS Quick Controls (Collapsed Mode) */}
          {sidebarCollapsed && (isPlaying || queueLength > 0) && (
            <div className="p-2 border-t">
              <div className="flex flex-col items-center gap-1">
                {isPlaying && (
                  <Button variant="ghost" size="sm" className="p-1">
                    <Pause className="h-3 w-3" />
                  </Button>
                )}
                {queueLength > 0 && (
                  <div className="text-xs text-center">
                    <div className="font-medium">{queueLength}</div>
                    <div className="text-muted-foreground">Queue</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Tier Badge (Expanded Mode) */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {user?.is_admin ? (
                    <Shield className="h-4 w-4 text-destructive" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={user?.tier === 'free' ? 'secondary' : 'default'}
                      className={cn(
                        "text-xs",
                        user?.tier === 'pro' && "bg-blue-100 text-blue-800",
                        user?.tier === 'enterprise' && "bg-purple-100 text-purple-800"
                      )}
                    >
                      {user?.tier?.toUpperCase() || 'FREE'}
                    </Badge>
                    
                    {user?.is_admin && (
                      <Badge variant="destructive" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.queries} queries today
                  </div>
                </div>
              </div>

              {/* TTS Quota Bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">TTS Quota</span>
                  <span className="font-medium">{ttsRemaining}/{ttsLimit}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-medical-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(ttsRemaining / ttsLimit) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions (Expanded Mode) */}
        {!sidebarCollapsed && (
          <div className="border-t p-2">
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>

              {user?.is_admin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setActivePanel('admin')}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Admin Dashboard</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Analytics</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </motion.aside>
    </TooltipProvider>
  )
}

CollapsibleSidebar.displayName = "CollapsibleSidebar"

export default CollapsibleSidebar