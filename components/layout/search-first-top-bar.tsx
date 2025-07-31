"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ResponsiveBrandLogo } from "@/components/branding/brand-logo"
import { useAuth } from "@/lib/stores/auth-store"
import { useUI } from "@/lib/stores/ui-store"
import { useTTSQuota } from "@/lib/stores/tts-store"
import { useMobileResponsive } from "@/lib/hooks/use-mobile-responsive"
import { 
  Menu, 
  Moon, 
  Sun, 
  Settings, 
  LogOut,
  Shield,
  BarChart3,
  Mic,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchFirstTopBarProps {
  className?: string
}

/**
 * Top Bar for Search-First Layout
 * Contains logo, user profile, and quick actions
 */
export function SearchFirstTopBar({ className }: SearchFirstTopBarProps) {
  const { user, logout } = useAuth()
  const { 
    toggleSidebar, 
    theme, 
    toggleTheme, 
    isMobile,
    setActivePanel 
  } = useUI()
  const { remaining: ttsRemaining, limit: ttsLimit, percentage: ttsPercentage } = useTTSQuota()
  const { isMobile, utils } = useMobileResponsive()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800'
      case 'pro': return 'bg-blue-100 text-blue-800'
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUserInitials = (user: any) => {
    if (user?.display_name) {
      return user.display_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  return (
    <header className={cn(
      "h-16 bg-background border-b border-border",
      "flex items-center justify-between",
      "sticky top-0 z-50",
      utils.getContainerPadding(),
      className
    )}>
      {/* Left Side - Logo and Menu */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn("p-2", utils.getTouchButtonSize())}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-medical-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">
              Medverus AI
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">
              Medical Search Platform
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - User Profile and Actions */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* TTS Quota Indicator */}
        <div className="hidden md:flex items-center space-x-2">
          <Mic className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">
              TTS: {ttsRemaining}/{ttsLimit}
            </div>
            <Progress 
              value={ttsPercentage} 
              className="w-16 h-1"
            />
          </div>
        </div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={user?.profile_picture} 
                  alt={user?.display_name || user?.email || "User"} 
                />
                <AvatarFallback className="bg-medical-primary text-white">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-80" align="end" forceMount>
            {/* User Info Header */}
            <DropdownMenuLabel className="p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={user?.profile_picture} 
                      alt={user?.display_name || user?.email || "User"} 
                    />
                    <AvatarFallback className="bg-medical-primary text-white">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {user?.display_name || user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                {/* Tier Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={cn("text-xs", getTierColor(user?.tier || 'free'))}>
                    {user?.tier?.toUpperCase() || 'FREE'} Plan
                  </Badge>
                  {user?.is_admin && (
                    <Badge variant="destructive" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Queries Today</div>
                    <div className="text-sm font-medium">
                      {(user?.daily_usage?.medverus_ai || 0) + 
                       (user?.daily_usage?.pubmed || 0) + 
                       (user?.daily_usage?.web_search || 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Files</div>
                    <div className="text-sm font-medium">
                      {user?.uploaded_files_count || 0}
                    </div>
                  </div>
                </div>

                {/* TTS Quota (Mobile) */}
                <div className="md:hidden pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">TTS Quota</span>
                    <span className="text-xs font-medium">
                      {ttsRemaining}/{ttsLimit}
                    </span>
                  </div>
                  <Progress 
                    value={ttsPercentage} 
                    className="w-full h-2 mt-1"
                  />
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Menu Items */}
            <DropdownMenuItem 
              onClick={() => setActivePanel('profile')}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => setActivePanel('recent')}
              className="cursor-pointer"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Usage Analytics
            </DropdownMenuItem>

            {/* Admin Menu Item */}
            {user?.is_admin && (
              <DropdownMenuItem 
                onClick={() => setActivePanel('admin')}
                className="cursor-pointer"
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin Dashboard
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

SearchFirstTopBar.displayName = "SearchFirstTopBar"

export default SearchFirstTopBar