"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { 
  Activity,
  BarChart3,
  Brain,
  FileText,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Upload,
  User,
  Users,
  X,
  Bell,
  HelpCircle,
  Zap,
  ChevronDown,
  Home,
  History
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useAuth, useMedicalTier } from "@/hooks/use-auth"
import { MEDICAL_ROUTES } from "@/lib/constants/medical"

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  disabled?: boolean
  tier?: ('free' | 'pro' | 'enterprise')[]
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: MEDICAL_ROUTES.protected.dashboard,
    icon: Home
  },
  {
    label: "Medical Query",
    href: "/medical/query",
    icon: Search
  },
  {
    label: "Query History",
    href: "/medical/history",
    icon: History
  },
  {
    label: "Document Upload",
    href: "/medical/upload",
    icon: Upload,
    tier: ['pro', 'enterprise']
  },
  {
    label: "Analytics",
    href: "/medical/analytics",
    icon: BarChart3,
    tier: ['pro', 'enterprise']
  },
  {
    label: "Medical AI",
    href: "/medical/ai",
    icon: Brain,
    badge: "Beta"
  },
  {
    label: "Files",
    href: "/medical/files",
    icon: FileText
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings
  }
]

const adminNavigationItems: NavigationItem[] = [
  {
    label: "Admin Dashboard",
    href: "/admin",
    icon: Shield
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users
  },
  {
    label: "System Analytics",
    href: "/admin/analytics",
    icon: Activity
  }
]

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const { tier, limits, usage } = useMedicalTier()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const isActiveRoute = (href: string) => {
    if (href === MEDICAL_ROUTES.protected.dashboard) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const canAccessRoute = (item: NavigationItem) => {
    if (!item.tier) return true
    return item.tier.includes(tier)
  }

  const getUsagePercentage = () => {
    const totalUsed = Object.values(usage).reduce((sum, val) => sum + val, 0)
    const totalLimit = Object.values(limits).reduce((sum, limit) => 
      sum + (typeof limit === 'number' ? limit : limit.count), 0
    )
    return totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0
  }

  const usagePercentage = getUsagePercentage()

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="p-4 bg-medical-primary/10 rounded-full inline-block">
            <Brain className="h-8 w-8 text-medical-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading Medverus Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:inset-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 px-6 border-b">
            <div className="p-2 bg-medical-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-medical-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Medverus</h1>
              <p className="text-xs text-muted-foreground">Medical AI Platform</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-medical-primary/10 text-medical-primary">
                  {user?.email ? getUserInitials(user.email) : "ME"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.email || "Medical User"}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={`tier-${tier}` as any} className="text-xs">
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Usage indicator */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Daily Usage</span>
                <span className="font-medium">{Math.round(usagePercentage)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    usagePercentage >= 90 ? "bg-medical-danger" :
                    usagePercentage >= 75 ? "bg-medical-warning" :
                    "bg-medical-success"
                  )}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = isActiveRoute(item.href)
                const canAccess = canAccessRoute(item)
                
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      !canAccess && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => canAccess && router.push(item.href)}
                    disabled={!canAccess}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {!canAccess && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {tier === 'free' ? 'Pro' : 'Enterprise'}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>

            {/* Admin Section */}
            {user?.is_admin && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                    Administration
                  </h4>
                  {adminNavigationItems.map((item) => {
                    const isActive = isActiveRoute(item.href)
                    
                    return (
                      <Button
                        key={item.href}
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start gap-3 h-10"
                        onClick={() => router.push(item.href)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    )
                  })}
                </div>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 h-10">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings/billing")}>
                  <Zap className="mr-2 h-4 w-4" />
                  Billing & Plans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/help")}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {usagePercentage >= 80 && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-medical-warning rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {usagePercentage >= 80 && (
                <div className="p-3">
                  <Alert variant="medical-warning">
                    <Zap className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      You've used {Math.round(usagePercentage)}% of your daily quota. 
                      Consider upgrading for higher limits.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              {usagePercentage < 80 && (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  No new notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-medical-primary/10 text-medical-primary text-xs">
                    {user?.email ? getUserInitials(user.email) : "ME"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block">
                  {user?.email?.split('@')[0] || "User"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="space-y-1">
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main content area */}
        <main className={cn("p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  )
}