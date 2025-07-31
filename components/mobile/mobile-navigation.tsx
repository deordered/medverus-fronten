"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/stores/auth-store"
import { useUI } from "@/lib/stores/ui-store"
import { useMobileResponsive } from "@/lib/hooks/use-mobile-responsive"
import { useTTSQuota } from "@/lib/stores/tts-store"
import { cn } from "@/lib/utils"
import { 
  Menu,
  Clock,
  MessageSquare,
  Mic,
  FolderOpen,
  User,
  Settings,
  Shield,
  BarChart3,
  X,
  LogOut
} from "lucide-react"
import type { SidebarPanel } from "@/types"

interface MobileNavigationProps {
  className?: string
}

/**
 * Mobile Navigation Component
 * Full-screen mobile navigation with optimized touch targets
 */
export function MobileNavigation({ className }: MobileNavigationProps) {
  const { user, logout } = useAuth()
  const { 
    activePanel, 
    isMobile,
    setActivePanel,
    sidebarCollapsed,
    setSidebarCollapsed
  } = useUI()
  const { utils } = useMobileResponsive()
  const { remaining: ttsRemaining, limit: ttsLimit } = useTTSQuota()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Mobile panel configurations
  const panels: Array<{
    id: SidebarPanel
    icon: React.ReactNode
    label: string
    badge?: string | number
    description?: string
  }> = [
    {
      id: 'recent',
      icon: <Clock className="h-6 w-6" />,
      label: 'Recent Activity',
      description: 'Your recent searches and medical queries'
    },
    {
      id: 'prompts',
      icon: <MessageSquare className="h-6 w-6" />,
      label: 'Prompt Manager',
      description: 'Saved medical prompts and templates'
    },
    {
      id: 'tts',
      icon: <Mic className="h-6 w-6" />,
      label: 'Text-to-Speech',
      badge: `${ttsRemaining}/${ttsLimit}`,
      description: 'Medical text-to-speech controls'
    },
    {
      id: 'files',
      icon: <FolderOpen className="h-6 w-6" />,
      label: 'File Manager',
      badge: user?.uploaded_files_count || 0,
      description: 'Manage medical documents'
    },
    {
      id: 'profile',
      icon: <User className="h-6 w-6" />,
      label: 'User Profile',
      description: 'Account settings and preferences'
    }
  ]

  if (!isMobile) return null

  return (
    <Sheet open={!sidebarCollapsed} onOpenChange={setSidebarCollapsed}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("p-2", utils.getTouchButtonSize())}
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-full sm:w-80 p-0 bg-background"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-brand-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Medverus AI
                </h1>
                <p className="text-sm text-muted-foreground">
                  Medical Search Platform
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(true)}
              className={utils.getTouchButtonSize()}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 bg-muted/30">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-brand-primary flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user?.email?.slice(0, 2).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium truncate">
                  {user?.display_name || user?.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="secondary"
                    className="text-xs"
                  >
                    {user?.tier?.toUpperCase() || 'FREE'}
                  </Badge>
                  {user?.is_admin && (
                    <Badge variant="destructive" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {(user?.daily_usage?.medverus_ai || 0) + 
                   (user?.daily_usage?.pubmed || 0) + 
                   (user?.daily_usage?.web_search || 0)}
                </div>
                <div className="text-xs text-muted-foreground">Queries</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {user?.uploaded_files_count || 0}
                </div>
                <div className="text-xs text-muted-foreground">Files</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {ttsRemaining}
                </div>
                <div className="text-xs text-muted-foreground">TTS Left</div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {panels.map((panel) => {
                const isActive = activePanel === panel.id
                
                return (
                  <Button
                    key={panel.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-auto p-4 text-left",
                      utils.getTouchButtonSize("h-auto"),
                      isActive && "bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary"
                    )}
                    onClick={() => {
                      setActivePanel(isActive ? null : panel.id)
                      setSidebarCollapsed(true)
                    }}
                  >
                    <div className="flex items-center gap-4 w-full">
                      {panel.icon}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{panel.label}</span>
                          {panel.badge !== undefined && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              {panel.badge}
                            </Badge>
                          )}
                        </div>
                        {panel.description && (
                          <p className="text-sm text-muted-foreground mt-1 leading-tight">
                            {panel.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>

            <Separator className="my-4" />

            {/* Additional Actions */}
            <div className="p-4 space-y-2">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  utils.getTouchButtonSize()
                )}
                onClick={() => setSidebarCollapsed(true)}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Button>

              {user?.is_admin && (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    utils.getTouchButtonSize()
                  )}
                  onClick={() => {
                    setActivePanel('admin')
                    setSidebarCollapsed(true)
                  }}
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Admin Dashboard
                </Button>
              )}

              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  utils.getTouchButtonSize()
                )}
                onClick={() => {
                  setActivePanel('recent')
                  setSidebarCollapsed(true)
                }}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Usage Analytics
              </Button>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t bg-muted/30">
            <Button
              variant="destructive"
              className={cn(
                "w-full justify-start",
                utils.getTouchButtonSize()
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>

            {/* Medical Disclaimer */}
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              <strong>Medical Disclaimer:</strong> This platform provides information for educational purposes only. Always consult healthcare professionals for medical decisions.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

MobileNavigation.displayName = "MobileNavigation"

export default MobileNavigation